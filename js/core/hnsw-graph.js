import { sqDist16 } from './vector-sq8.js';

export const HNSW_M = 16;
export const HNSW_EF_CONSTRUCTION = 64;
export const HNSW_EF_SEARCH = 32;
export const HNSW_SHARD = 500;

function mulberry32(seed) {
  let state = seed >>> 0;
  return function rng() {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function randomLevel(rng) {
  let level = 0;
  while (rng() < 0.5 && level < 6) level += 1;
  return level;
}

function rowDist(qdata, dim, left, right) {
  const q = qdata.subarray(right * dim, right * dim + dim);
  return sqDist16(qdata, dim, left, q);
}

function searchEf(graph, query, entry, ef, level) {
  const qdata = graph.qdata;
  const dim = graph.dim;
  const links = graph.links[level];
  const distOf = (id) => sqDist16(qdata, dim, id, query);
  const seen = new Set([entry]);
  const pool = [{ id: entry, d: distOf(entry) }];
  const found = [];
  let guard = Math.max(8, ef * 6);
  while (pool.length && guard > 0) {
    guard -= 1;
    let best = 0;
    for (let i = 1; i < pool.length; i += 1) if (pool[i].d < pool[best].d) best = i;
    const cur = pool.splice(best, 1)[0];
    if (found.length >= ef && cur.d > found[found.length - 1].d) break;
    found.push(cur);
    found.sort((a, b) => a.d - b.d);
    if (found.length > ef) found.length = ef;
    const neigh = links[cur.id] || [];
    for (let i = 0; i < neigh.length; i += 1) {
      const id = neigh[i];
      if (seen.has(id)) continue;
      seen.add(id);
      pool.push({ id, d: distOf(id) });
    }
  }
  return found;
}

function linkTo(graph, level, from, to) {
  if (from === to) return;
  const list = graph.links[level][from];
  if (list.indexOf(to) >= 0) return;
  list.push(to);
  const cap = graph.m;
  if (list.length <= cap) return;
  list.sort((a, b) => rowDist(graph.qdata, graph.dim, from, a) - rowDist(graph.qdata, graph.dim, from, b));
  list.length = cap;
}

export function syntheticInt8(count, dim, seed) {
  const qdata = new Int8Array(count * dim);
  let state = (seed || 7) >>> 0;
  for (let i = 0; i < count; i += 1) {
    for (let d = 0; d < dim; d += 1) {
      state = (Math.imul(state ^ (i + 0x9e3779b1), 0x85ebca6b) + d + 1) | 0;
      state ^= state >>> 13;
      qdata[i * dim + d] = (state & 255) - 128;
    }
  }
  return qdata;
}

export function buildLayeredGraph(qdata, count, dim, seed) {
  const rng = mulberry32(seed == null ? 17 : seed);
  const levels = new Int16Array(count);
  let maxLevel = 0;
  for (let i = 0; i < count; i += 1) {
    levels[i] = randomLevel(rng);
    if (levels[i] > maxLevel) maxLevel = levels[i];
  }
  const links = [];
  for (let level = 0; level <= maxLevel; level += 1) {
    const layer = new Array(count);
    for (let i = 0; i < count; i += 1) layer[i] = [];
    links.push(layer);
  }
  const graph = {
    qdata,
    count,
    dim,
    levels,
    links,
    maxLevel,
    entry: 0,
    m: HNSW_M,
    efConstruction: HNSW_EF_CONSTRUCTION,
    efSearch: HNSW_EF_SEARCH,
  };
  for (let i = 1; i < count; i += 1) {
    const query = qdata.subarray(i * dim, i * dim + dim);
    let curr = graph.entry;
    for (let level = maxLevel; level > levels[i]; level -= 1) {
      const nearest = searchEf(graph, query, curr, 1, level);
      if (nearest.length) curr = nearest[0].id;
    }
    const top = Math.min(levels[i], maxLevel);
    for (let level = top; level >= 0; level -= 1) {
      const nearest = searchEf(graph, query, curr, graph.efConstruction, level);
      const selected = nearest.slice(0, graph.m);
      for (let n = 0; n < selected.length; n += 1) {
        linkTo(graph, level, i, selected[n].id);
        linkTo(graph, level, selected[n].id, i);
      }
      if (selected.length) curr = selected[0].id;
    }
    if (levels[i] > levels[graph.entry]) graph.entry = i;
  }
  return graph;
}

export function searchLayeredGraph(graph, query, k) {
  if (!graph || !graph.qdata || !graph.count) return [];
  const limit = k || 5;
  let curr = graph.entry || 0;
  for (let level = graph.maxLevel; level > 0; level -= 1) {
    const nearest = searchEf(graph, query, curr, 1, level);
    if (nearest.length) curr = nearest[0].id;
  }
  const found = searchEf(graph, query, curr, Math.max(graph.efSearch || HNSW_EF_SEARCH, limit), 0);
  return found.slice(0, limit).map((row) => ({ id: row.id, distance: row.d }));
}

export function shardGraph(graph, shard) {
  const size = shard || HNSW_SHARD;
  const parts = [];
  const count = graph && graph.count ? graph.count : 0;
  for (let start = 0; start < count; start += size) {
    const end = Math.min(count, start + size);
    parts.push({
      id: 'hnsw-' + start,
      store: 'hnsw_nodes',
      start,
      end,
      count: end - start,
    });
  }
  return parts;
}

export function recallAtK(hits, relevant, k) {
  const rel = new Set(relevant || []);
  if (!rel.size) return 0;
  const top = (hits || []).slice(0, k == null ? hits.length : k);
  let hit = 0;
  rel.forEach((id) => {
    if (top.indexOf(id) >= 0) hit += 1;
  });
  return hit / rel.size;
}

export function ndcgAtK(hits, grades, k) {
  const gain = grades || {};
  const ranked = (hits || []).slice(0, k == null ? (hits || []).length : k);
  let dcg = 0;
  ranked.forEach((id, index) => {
    dcg += (gain[id] || 0) / Math.log2(index + 2);
  });
  const ideal = Object.keys(gain).map((id) => gain[id]).sort((a, b) => b - a).slice(0, ranked.length || k || 0);
  let idcg = 0;
  ideal.forEach((score, index) => {
    idcg += score / Math.log2(index + 2);
  });
  return idcg ? dcg / idcg : 0;
}

export function releaseGraph(graph) {
  if (!graph) return;
  graph.qdata = null;
  graph.links = null;
  graph.levels = null;
  graph.count = 0;
}
