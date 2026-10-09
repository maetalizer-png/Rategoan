export const PAGE_TOKENS = 16;

export function pageInt8(vector) {
  const src = vector instanceof Int8Array ? vector : Int8Array.from(vector || []);
  const pages = [];
  for (let i = 0; i < src.length; i += PAGE_TOKENS) pages.push(src.subarray(i, i + PAGE_TOKENS));
  return pages;
}

export function kvFootprint(dim) {
  const n = Math.max(0, Number(dim) || 0);
  const float32 = n * 4;
  const int8 = n;
  const saved = float32 === 0 ? 0 : (float32 - int8) / float32;
  return { float32, int8, saved, smaller: saved > 0.6 };
}
