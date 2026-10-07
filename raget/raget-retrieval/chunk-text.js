export function chunkText(text, size, overlap) {
  const src = String(text || '');
  const window = size || 1500;
  const step = Math.max(1, window - (overlap == null ? 150 : overlap));
  if (!src) return [];
  const out = [];
  for (let i = 0; i < src.length; i += step) {
    out.push(src.slice(i, i + window));
    if (i + window >= src.length) break;
  }
  return out;
}

export function buildPostings(docs) {
  const postings = {};
  (docs || []).forEach((doc, id) => {
    const terms = new Set(String(doc || '').toLowerCase().split(/[^a-z0-9]+/).filter(Boolean));
    terms.forEach((term) => {
      if (!postings[term]) postings[term] = [];
      postings[term].push(id);
    });
  });
  return postings;
}
