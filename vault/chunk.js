function chunkText(text, maxLen) {
  const limit = maxLen || 1500;
  const clean = String(text || '').trim();
  if (!clean) return [];
  const sentences = clean.split(/(?<=[.!?])\s+/).filter(Boolean);
  const chunks = [];
  let current = '';
  sentences.forEach((s) => {
    if ((current + ' ' + s).length > limit && current) {
      chunks.push(current.trim());
      current = s;
    } else {
      current = current ? current + ' ' + s : s;
    }
  });
  if (current.trim()) chunks.push(current.trim());
  return chunks.length ? chunks : [clean.slice(0, limit)];
}

export const chunker = Object.freeze({ chunkText });
