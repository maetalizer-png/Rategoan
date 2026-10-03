import { ragetDb } from '../../raget/raget-database/raget-db.js';
import { feedbackStore } from '../../raget/raget-memory/feedback-store.js';
import { feedbackReport } from '../../raget/raget-agents/feedback-report.js';
import { download } from '../../shared/clipboard.js';
import { toast } from '../core/toast.js';

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

function buildAnonymousExport(report) {
  return {
    exportedAt: new Date().toISOString(),
    catatan: 'Ekspor opt-in anonim dari kueri yang gagal dijawab Rategoan. Tidak memuat data pribadi atau timestamp per-kueri.',
    totalEntri: report.total,
    kueriUnik: report.distinctQueries,
    rentangTanggal: report.range,
    topKeywords: report.topKeywords,
    topQueries: report.topQueries,
  };
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
    '<button class="data-health-export-btn" id="data-health-export">Ekspor kueri gagal (anonim)</button>' +
    '<div class="data-health-export-hint">Opt-in: hanya mengunduh file JSON ke perangkatmu, tidak dikirim ke mana pun. Bagikan manual ke pengembang kalau mau membantu.</div>' +
    '</div>' +
    '<div class="data-health-section">' +
    `<div class="data-health-section-title">Feedback keseluruhan: 👍 ${feedbackStats.up} · 👎 ${feedbackStats.down}</div>` +
    renderIntentRows(intentStats) +
    '</div>';

  const exportBtn = document.getElementById('data-health-export');
  if (exportBtn) {
    exportBtn.onclick = () => {
      if (!report.total) {
        toast.show('Belum ada kueri gagal untuk diekspor');
        return;
      }
      const payload = buildAnonymousExport(report);
      download('rategoan-kueri-gagal-anonim-' + new Date().toISOString().slice(0, 10) + '.json', JSON.stringify(payload, null, 2));
      toast.show('Ekspor anonim diunduh');
    };
  }
}

export const dataHealthSheet = { render };
