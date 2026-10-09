export const FRAME_MS = 16;

export function shouldPaint(last, now) {
  const prev = Number(last) || 0;
  const t = now == null ? Date.now() : now;
  return t - prev >= FRAME_MS;
}
