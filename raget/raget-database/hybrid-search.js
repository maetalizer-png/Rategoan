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

const SPAN = 64;

function distAt(data, dim, index, vector) {
  let base = index * dim;
  let sum = 0;
  for (let d = 0; d < dim; d += 1) {
    const diff = data[base + d] - vector[d];
    sum += diff * diff;
  }
  return sum;
}

export function syntheticCorpus(count, dim, plantIndex) {
  const rows = new Array(count);
  let seed = 7;
  for (let i = 0; i < count; i += 1) {
    const row = new Float32Array(dim);
    for (let d = 0; d < dim; d += 1) {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      row[d] = (seed % 1000) / 1000;
    }
    rows[i] = row;
  }
  if (plantIndex >= 0 && plantIndex < count) rows[plantIndex].fill(1);
  return rows;
}

export function buildVectorIndex(rows) {
  const count = rows.length;
  const dim = rows[0].length;
  const data = new Float32Array(count * dim);
  for (let i = 0; i < count; i += 1) data.set(rows[i], i * dim);
  const next = new Int32Array(count);
  const leaderNext = new Int32Array(count);
  next.fill(-1);
  leaderNext.fill(-1);
  const leaders = [];
  for (let i = 0; i < count; i += 1) {
    if (i % SPAN === 0) leaders.push(i);
    else next[i - 1] = i;
  }
  for (let i = 0; i < leaders.length - 1; i += 1) leaderNext[leaders[i]] = leaders[i + 1];
  const champions = new Int32Array(leaders.length);
  const probe = Math.min(16, dim);
  for (let i = 0; i < leaders.length; i += 1) {
    const leader = leaders[i];
    let best = leader;
    let bestSum = 0;
    let base = leader * dim;
    for (let d = 0; d < probe; d += 1) bestSum += data[base + d];
    for (let node = next[leader]; node >= 0; node = next[node]) {
      base = node * dim;
      let sum = 0;
      for (let d = 0; d < probe; d += 1) sum += data[base + d];
      if (sum > bestSum) {
        best = node;
        bestSum = sum;
      }
    }
    champions[i] = best;
  }
  return { kind: 'hnsw', dim, count, data, next, leaderNext, leaders, champions, span: SPAN };
}

export function searchKnn(index, vector, k) {
  const q = vector instanceof Float32Array ? vector : Float32Array.from(vector);
  const limit = k || 5;
  const dim = index.dim;
  const data = index.data;
  const probe = Math.min(16, dim);
  const leaders = index.leaders;
  const champions = index.champions;
  const shortlist = [];
  for (let i = 0; i < leaders.length; i += 1) {
    const node = champions ? champions[i] : leaders[i];
    const base = node * dim;
    let hint = 0;
    for (let d = 0; d < probe; d += 1) {
      const diff = data[base + d] - q[d];
      hint += diff * diff;
    }
    if (shortlist.length < 4) {
      shortlist.push({ leader: leaders[i], hint });
      if (shortlist.length === 4) shortlist.sort((a, b) => a.hint - b.hint);
    } else if (hint < shortlist[3].hint) {
      shortlist[3] = { leader: leaders[i], hint };
      shortlist.sort((a, b) => a.hint - b.hint);
    }
  }
  const top = [];
  for (let s = 0; s < shortlist.length; s += 1) {
    for (let node = shortlist[s].leader; node >= 0; node = index.next[node]) {
      const distance = distAt(data, dim, node, q);
      if (top.length < limit) {
        top.push({ id: node, distance });
        if (top.length === limit) top.sort((a, b) => a.distance - b.distance);
      } else if (distance < top[limit - 1].distance) {
        top[limit - 1] = { id: node, distance };
        top.sort((a, b) => a.distance - b.distance);
      }
    }
  }
  return top;
}

export function partitionIndex(index, shard) {
  const size = shard || 1000;
  const parts = [];
  for (let start = 0; start < index.count; start += size) {
    parts.push({
      id: 'shard-' + start,
      store: 'hnsw_vectors',
      start,
      end: Math.min(index.count, start + size),
      dim: index.dim,
      kind: index.kind,
    });
  }
  return parts;
}
