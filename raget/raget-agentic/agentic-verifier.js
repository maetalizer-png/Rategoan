// Verifier - setelah execute, cek: hasil tersedia, valid, sesuai tujuan,
// informasi cukup, tidak ada error/kontradiksi. Kalau gagal, task TIDAK
// dianggap selesai (spec §VERIFIER).
const FAIL_STATUSES = new Set(['tool_error', 'empty_result', 'invalid_result', 'timeout', 'insufficient_information', 'contradiction']);

// Replanning menambah observasi BARU per stepId, tidak menggantikan yang
// lama - verifikasi harus menilai status TERKINI tiap langkah (observasi
// terakhir per stepId), bukan seluruh riwayat historis, supaya langkah yang
// akhirnya berhasil lewat replan tidak terus dianggap gagal oleh jejak
// percobaan sebelumnya.
function latestPerStep(observations) {
  const byStep = new Map();
  observations.forEach((o) => byStep.set(o.stepId, o));
  return Array.from(byStep.values());
}

function verify(task) {
  const obs = latestPerStep(task.observations);
  if (!obs.length) {
    return { passed: false, confidence: 0, evidence: [], issues: ['tidak ada langkah yang dieksekusi'], recommendation: 'replan' };
  }
  const failed = obs.filter((o) => FAIL_STATUSES.has(o.status));
  const succeeded = obs.filter((o) => o.status === 'success');
  const passed = succeeded.length > 0 && failed.length === 0;
  const confidence = Math.round((succeeded.length / obs.length) * 100) / 100;
  const evidence = succeeded.map((o) => o.detail).filter(Boolean).slice(0, 5);
  const issues = failed.map((o) => o.status + (o.detail ? ': ' + o.detail : ''));

  let recommendation = 'complete';
  if (!passed) {
    recommendation = task.retries < task.budget.maxRetries ? 'replan' : 'fail';
  }
  return { passed, confidence, evidence, issues, recommendation };
}

export const agenticVerifier = Object.freeze({ verify });
