export function schedulePhase(phase) {
  if (phase === 'prefill') return { workgroup: [256, 1, 1], bound: 'compute' };
  if (phase === 'decode') return { workgroup: [64, 1, 1], bound: 'bandwidth' };
  throw new Error('fase');
}
