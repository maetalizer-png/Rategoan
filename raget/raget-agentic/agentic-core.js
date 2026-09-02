// Orkestrator utama Agentic AI: Understand -> Plan -> Execute -> Observe ->
// Verify -> Replan(jika gagal) -> Complete, dengan state eksplisit (lihat
// task-model.js) dan budget anti infinite-loop (maxRetries/maxSteps/
// maxToolCalls/timeout). Local-first murni: semua tool dipanggil langsung
// di browser, tidak ada request ke backend baru.
import { createTask, touch, STATES, BUDGET } from './task-model.js';
import { taskRouter } from './task-router.js';
import { agenticPlanner } from './agentic-planner.js';
import { toolRegistry } from './tool-registry.js';
import { agenticObserver } from './agentic-observer.js';
import { agenticVerifier } from './agentic-verifier.js';
import { agenticReplanner } from './agentic-replanner.js';
import { agenticStore } from './agentic-store.js';

const cancelledTasks = new Set();

function noop() {}

function composeResult(task) {
  const lines = task.steps.map((step) => {
    const obs = task.observations.filter((o) => o.stepId === step.id).slice(-1)[0];
    const detail = obs && obs.status === 'success' ? obs.detail : '(belum ada hasil)';
    return task.steps.length > 1 ? '- ' + step.description + ': ' + detail : detail;
  });
  return lines.join('\n');
}

function composePartial(task, verification) {
  const doneMap = new Map();
  const pendingMap = new Map();
  task.observations.forEach((o) => {
    const step = task.steps.find((s) => s.id === o.stepId);
    const label = step ? step.description : o.stepId;
    if (o.status === 'success') {
      doneMap.set(o.stepId, label + ': ' + o.detail);
      pendingMap.delete(o.stepId);
    } else {
      pendingMap.set(o.stepId, label + ' (' + o.status + (o.detail ? ': ' + o.detail : '') + ')');
      doneMap.delete(o.stepId);
    }
  });
  return {
    status: 'Sebagian selesai',
    done: Array.from(doneMap.values()),
    pending: Array.from(pendingMap.values()),
    cause: verification.issues.join('; ') || 'tidak ada tool yang berhasil memberi jawaban memadai.',
    nextStep: task.retries >= task.budget.maxRetries
      ? 'Batas percobaan ulang (' + task.budget.maxRetries + 'x) tercapai. Coba tulis ulang tujuan lebih spesifik.'
      : 'Agent akan mencoba strategi alternatif otomatis.',
  };
}

async function runStep(task, step) {
  if (task.toolCalls.length >= task.budget.maxToolCalls) return null;
  const call = { stepId: step.id, tool: step.tool, input: step.input, time: Date.now() };
  const result = await toolRegistry.execute(step.tool, step.input);
  call.ok = result.ok;
  call.error = result.error;
  call.output = result.output;
  task.toolCalls.push(call);
  const obs = agenticObserver.observe(step, result);
  task.observations.push(obs);
  step.status = obs.status === 'success' ? 'done' : 'failed';
  return obs;
}

async function executeSteps(task, steps, onUpdate) {
  for (const step of steps) {
    if (cancelledTasks.has(task.id)) return false;
    if (Date.now() - task.createdAt > task.budget.timeoutMs) return false;
    touch(task, { status: STATES.EXECUTING, currentStep: task.steps.indexOf(step) + 1 });
    onUpdate(task);
    await runStep(task, step);
    touch(task, { status: STATES.OBSERVING });
    onUpdate(task);
    // Jeda kecil antar-langkah: bukan cuma kosmetik (biar status
    // "Menjalankan langkah N" sempat kelihatan, bukan lompat instan) -
    // tanpa ini, task pendek yang semua langkahnya lokal/sinkron bisa
    // selesai dalam hitungan ms sebelum sempat "Hentikan" ditekan sama
    // sekali, membuat tombol Stop terasa tidak berfungsi.
    await new Promise((r) => setTimeout(r, 150));
  }
  return true;
}

async function runTask(goal, options) {
  const opts = options || {};
  const onUpdate = opts.onUpdate || noop;
  const task = createTask(goal);
  task.budget = BUDGET;
  cancelledTasks.delete(task.id);

  touch(task, { status: STATES.UNDERSTANDING });
  onUpdate(task);
  await agenticStore.save(task);

  const taskType = taskRouter.classifyTask(task.goal);
  touch(task, { taskType });

  if (cancelledTasks.has(task.id)) {
    touch(task, { status: STATES.CANCELLED });
    onUpdate(task);
    await agenticStore.save(task);
    return task;
  }

  touch(task, { status: STATES.PLANNING, steps: agenticPlanner.buildPlan(task.goal, taskType, task.budget) });
  onUpdate(task);
  await agenticStore.save(task);

  if (!task.steps.length) {
    touch(task, {
      status: STATES.FAILED,
      verification: { passed: false, confidence: 0, evidence: [], issues: ['tidak ada langkah yang bisa dibuat dari tujuan ini'], recommendation: 'fail' },
      result: 'Maaf, saya belum bisa menyusun rencana dari tujuan ini. Coba tulis lebih spesifik.',
    });
    onUpdate(task);
    await agenticStore.save(task);
    return task;
  }

  const completedOk = await executeSteps(task, task.steps, onUpdate);
  if (!completedOk) {
    const cancelled = cancelledTasks.has(task.id);
    touch(task, { status: cancelled ? STATES.CANCELLED : STATES.FAILED });
    if (!cancelled) {
      touch(task, {
        verification: { passed: false, confidence: 0, evidence: [], issues: ['batas waktu task tercapai'], recommendation: 'fail' },
        result: 'Task dihentikan karena melewati batas waktu (' + Math.round(task.budget.timeoutMs / 1000) + ' detik).',
      });
    }
    onUpdate(task);
    await agenticStore.save(task);
    return task;
  }

  // Loop Verify -> Replan (jika gagal), dibatasi budget.maxRetries.
  for (;;) {
    touch(task, { status: STATES.VERIFYING, verification: agenticVerifier.verify(task) });
    onUpdate(task);
    await agenticStore.save(task);

    if (task.verification.passed) {
      touch(task, { status: STATES.COMPLETED, result: composeResult(task) });
      onUpdate(task);
      await agenticStore.save(task);
      return task;
    }

    if (cancelledTasks.has(task.id)) {
      touch(task, { status: STATES.CANCELLED });
      onUpdate(task);
      await agenticStore.save(task);
      return task;
    }

    if (task.verification.recommendation !== 'replan') break;

    const replacements = agenticReplanner.replan(task);
    if (!replacements.length) break; // tidak ada strategi alternatif -> hindari retry identik

    touch(task, { status: STATES.REPLANNING, retries: task.retries + 1 });
    onUpdate(task);
    await agenticStore.save(task);

    replacements.forEach((r) => {
      const idx = task.steps.findIndex((s) => s.id === r.id);
      if (idx >= 0) task.steps[idx] = r;
    });

    const okReplan = await executeSteps(task, replacements, onUpdate);
    if (!okReplan) break;
  }

  const finalVerification = task.verification.passed ? task.verification : agenticVerifier.verify(task);
  touch(task, {
    status: cancelledTasks.has(task.id) ? STATES.CANCELLED : STATES.FAILED,
    verification: finalVerification,
  });
  if (task.status === STATES.FAILED) {
    task.partial = composePartial(task, finalVerification);
    touch(task, { result: composeResult(task) });
  }
  onUpdate(task);
  await agenticStore.save(task);
  return task;
}

function cancel(taskId) {
  cancelledTasks.add(taskId);
}

export const agenticCore = Object.freeze({
  runTask,
  cancel,
});
