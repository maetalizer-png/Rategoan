/** Ambil cuplikan JS/Python/HTML dari teks. */

const FENCE_RE = /```(\w+)?\s*\n([\s\S]*?)```/g;

function detectLang(text, hint) {
  const h = String(hint || text || '').toLowerCase();
  if (/\b(python|py)\b/.test(h) || /def\s+\w+\s*\(/.test(h)) return 'py';
  if (/\b(html)\b/.test(h) || /<\/?[a-z][\s\S]*>/i.test(h)) return 'html';
  if (/\b(css)\b/.test(h)) return 'css';
  return 'js';
}

function extractFences(text) {
  const out = [];
  const s = String(text || '');
  let m;
  const re = new RegExp(FENCE_RE.source, 'g');
  while ((m = re.exec(s))) {
    const lang = detectLang(m[1] || '', m[2]);
    out.push({ lang, code: m[2].replace(/\s+$/, '') });
  }
  return out;
}

function firstCode(text, hint) {
  const fences = extractFences(text);
  if (fences.length) return fences[0];
  const t = String(text || '').trim();
  if (!t) return null;
  return { lang: detectLang(hint || t, t), code: t };
}

export const llmCodeParser = Object.freeze({
  detectLang,
  extractFences,
  firstCode,
});
