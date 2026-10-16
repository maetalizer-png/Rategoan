import { scorer } from './scorer.js';

function normalizeQuery(q) {
  return String(q || '').toLowerCase().trim().replace(/\s+/g, ' ');
}

function buildUnmatchedReport(entries, topN) {
  const limit = topN || 15;
  const keywordCounts = new Map();
  const queryCounts = new Map();

  (entries || []).forEach((entry) => {
    const norm = normalizeQuery(entry.query);
    if (!norm) return;
    queryCounts.set(norm, (queryCounts.get(norm) || 0) + 1);
    scorer.tokenize(entry.query).forEach((token) => {
      keywordCounts.set(token, (keywordCounts.get(token) || 0) + 1);
    });
  });

  const topKeywords = [...keywordCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit);
  const topQueries = [...queryCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit);

  const times = (entries || []).map((e) => e.time).filter((t) => typeof t === 'number');
  const range =
    times.length > 0
      ? { from: new Date(Math.min(...times)).toISOString(), to: new Date(Math.max(...times)).toISOString() }
      : null;

  return { total: (entries || []).length, distinctQueries: queryCounts.size, range, topKeywords, topQueries };
}

export const feedbackReport = Object.freeze({ buildUnmatchedReport });
