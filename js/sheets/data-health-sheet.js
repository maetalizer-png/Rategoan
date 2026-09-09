// PRD-RAGET-TEMPLATE.md Fase 1.3: manusia (dev/pengguna) sebelumnya tidak
// punya cara MELIHAT log kegagalan (ragetDb.allUnmatched()) dan statistik
// like/dislike per-intent (feedbackStore.statsByIntent(), lihat Fase 1.2) -
// keduanya sudah tercatat tapi tersembunyi di IndexedDB/localStorage. Panel
// ini cuma membaca dan menampilkan, tidak mengubah alur jawaban sama sekali.
import { ragetDb } from '../../raget/raget-database/raget-db.js';
import { feedbackStore } from '../../raget/raget-memory/feedback-store.js';
import { feedbackReport } from '../../raget/raget-agents/feedback-report.js';

function escapeHtml(s) {
  return String(s || '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function renderKeywordRows(topKeywords) {
  if (!topKeywords.length) return '<div class="data-health-empty">Belum ada pertanyaan gagal tercatat.</div>';
  return (
    '<table class="data-health-table"><tbody>' +
    topKeywords
      .slice(0, 10)
      .map(([kw, count]) => `<tr><td>${escapeHtml(kw)}</td><td class="data-health-num">${count}</td></tr>`)
      .join('') +
    '</tbody></table>'
  );
}

function renderIntentRows(intents) {
  const withFeedback = intents.filter((e) => e.total > 0);
  if (!withFeedback.length) return '<div class="data-health-empty">Belum ada feedback like/dislike tercatat.</div>';
  return (
    '<table class="data-health-table"><tbody>' +
    withFeedback
      .slice(0, 10)
      .map(
        (e) =>
          `<tr><td>${escapeHtml(e.intent)}</td><td class="data-health-num">👍 ${e.up} · 👎 ${e.down}</td></tr>`
      )
      .join('') +
    '</tbody></table>'
  );
}

async function render() {
  const body = document.querySelector('#data-health-sheet .data-health-body');
  if (!body) return;
  body.innerHTML = '<div class="data-health-empty">Memuat…</div>';

  const [unmatched, feedbackStats, intentStats] = await Promise.all([
    ragetDb.allUnmatched(),
    Promise.resolve(feedbackStore.stats()),
    Promise.resolve(feedbackStore.statsByIntent()),
  ]);
  const report = feedbackReport.buildUnmatchedReport(unmatched, 10);

  body.innerHTML =
    '<div class="data-health-section">' +
    `<div class="data-health-section-title">Pertanyaan gagal dijawab (${report.total} entri, ${report.distinctQueries} unik)</div>` +
    renderKeywordRows(report.topKeywords) +
    '</div>' +
    '<div class="data-health-section">' +
    `<div class="data-health-section-title">Feedback keseluruhan: 👍 ${feedbackStats.up} · 👎 ${feedbackStats.down}</div>` +
    renderIntentRows(intentStats) +
    '</div>';
}

export const dataHealthSheet = { render };
