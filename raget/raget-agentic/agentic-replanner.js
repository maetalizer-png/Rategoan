// Replanner - Failure -> Analyze -> Alternative strategy -> Execute.
// TIDAK PERNAH retry identik: setiap langkah yang di-replan wajib pindah ke
// tool alternatif, atau langkah itu dianggap sudah mentok (tidak diulang).
const ALTERNATIVE_TOOL = {
  knowledge: 'retrieval',
  retrieval: 'knowledge',
  math: 'knowledge',
  datetime: 'knowledge',
  memory: 'knowledge',
  notes: 'knowledge',
  compose: 'knowledge',
};

function alternativeFor(step) {
  const next = ALTERNATIVE_TOOL[step.tool];
  if (!next || next === step.tool) return null;
  return Object.assign({}, step, {
    tool: next,
    input: { query: step.description },
    status: 'pending',
    retryOf: step.tool,
  });
}

// Hanya me-replan langkah yang observasi TERKINI-nya gagal (observasi
// terakhir per stepId, bukan seluruh riwayat) - langkah yang sudah sukses
// di percobaan terakhir TIDAK dieksekusi ulang (menghormati budget
// maxToolCalls & prinsip "no identical retry").
function replan(task) {
  const latestByStep = new Map();
  task.observations.forEach((o) => latestByStep.set(o.stepId, o));
  const failedStepIds = new Set(
    Array.from(latestByStep.values()).filter((o) => o.status !== 'success').map((o) => o.stepId)
  );
  const replacements = [];
  task.steps.forEach((step) => {
    if (!failedStepIds.has(step.id)) return;
    const alt = alternativeFor(step);
    if (alt) replacements.push(alt);
  });
  return replacements;
}

export const agenticReplanner = Object.freeze({ replan, alternativeFor });
