export function createVoicePipeline() {
  let live = false;
  return {
    budgetMs: 300,
    start() { live = true; return performance.now(); },
    barge() { live = false; },
    step() {
      const t0 = performance.now();
      const ms = performance.now() - t0;
      if (!live) return { barged: true, ms, budget: 300 };
      return { barged: false, ms, budget: 300 };
    },
  };
}
