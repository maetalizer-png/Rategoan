function tokensOf(text) {
  return String(text || '').toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
}

function cosine(a, b) {
  let dot = 0;
  let left = 0;
  let right = 0;
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i += 1) {
    dot += a[i] * b[i];
    left += a[i] * a[i];
    right += b[i] * b[i];
  }
  return dot / (Math.sqrt(left) * Math.sqrt(right) || 1);
}

export function buildHnsw(docs) {
  const links = docs.map((doc, index) => docs
    .map((other, otherIndex) => ({ otherIndex, score: cosine(doc.vector || [], other.vector || []) }))
    .filter((row) => row.otherIndex !== index)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map((row) => row.otherIndex));
  return { docs, links };
}

export function hybridSearch(index, query, vector) {
  const q = tokensOf(query);
  const docs = index.docs || index;
  const scored = docs.map((doc) => {
    const tokens = doc.tokens || tokensOf(doc.text);
    let lexical = 0;
    q.forEach((tok) => {
      const tf = tokens.filter((item) => item === tok).length;
      if (tf) lexical += (tf * 2) / (tokens.length || 1);
    });
    const dense = vector && doc.vector ? cosine(vector, doc.vector) : 0;
    return { id: doc.id, score: lexical + dense };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored;
}
