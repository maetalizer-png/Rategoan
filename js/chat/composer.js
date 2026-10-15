import { webSearch } from '../../vault/web/web-search.js';
import { resolveAutonomousConnector, resolveLocalProductivityTool, runConnectorTool } from '../connectors/tool-card.js';
import { $, scrollBottom } from '../../shared/dom.js';
import { haptics } from '../../shared/haptics.js';
import { toast } from '../core/toast.js';
import { store } from '../state/store.js';
import { auth } from '../state/auth.js';
import { enginePreference } from '../state/engine-preference.js';
import { router } from '../core/router.js';
import { drawer } from '../ui/drawer.js';
import { quote } from '../ui/quote.js';
import { history } from '../history/history.js';
import { chat } from './chat.js';
import { abortGeneration } from './chat.js';
import { skill } from '../state/skill.js';
import { cowork } from '../ui/cowork.js';
import { attach } from '../sheets/attach.js';
import { sheets } from '../sheets/sheets.js';
import { googleAuth } from '../state/google-auth.js';
import { summarizeFileText, answerFromFile, summarizeMultiAttachments } from '../../shared/file-summary.js';
import { searchDocs } from '../../raget/raget-vault/local-rag.js';
import { memoryLong } from '../../raget/raget-memory/memory-long.js';
import { collectionStore } from '../../raget/raget-memory/collection-store.js';
import { hybridRank, cosineText } from '../../raget/raget-vault/hybrid-search.js';
import { fenceUntrusted, GUARDRAIL, buriedOrder } from '../../shared/untrusted.js';
import { sanitizeDocContext } from '../../raget/raget-retrieval/local-doc.js';
import { refuseProhibited } from '../../shared/safety-guard.js';
import { planSubgoals } from '../../raget/raget-agents/core/agent-planner.js';
import { sheetFromText, buildXlsxBytes } from '../../shared/xlsx-local.js';
import { groundScreenshot } from '../studio/sandbox-runner.js';
import { downloadBytes } from '../../shared/pptx-local.js';
import { receiptTable } from '../../shared/receipt-extract.js';
import { buildDocxBytes } from '../../shared/docx-local.js';
import { buildOutline, previewOutline, rememberSlide } from '../../shared/slides-export.js';
import { turnPipeline } from '../../raget/raget-agents/turn-pipeline.js';
import { toolsKoleksi } from '../../raget/raget-agents/tools-koleksi.js';
import { flowHub } from '../../raget/raget-agents/flow-hub.js';
import { artifact } from '../ui/artifact.js';
import { workspace } from '../state/workspace.js';
import { remindersStore } from '../../vault/reminders/reminders-store.js';
import { projectPage } from '../project/project.js';
import { runAgentPlan } from '../agent/worker-bridge.js';
import { mountThought, buildDynamicThoughts } from '../ui/thought-card.js';
import { parseChartAsk, buildChartSvg } from '../../shared/charts-local.js';
import { parseDiagramAsk, buildDiagramSvg } from '../../shared/diagrams-local.js';
import { printReport } from '../../shared/report-export.js';
import { cancelAgent } from '../agent/worker-bridge.js';
import { hemat } from '../state/hemat.js';
import { voice } from './voice.js';

const FILE_READ_RE = /\b(baca|ringkas|rangkum|ekstrak|extract|impor|import)\b/i;
const FILE_ASK_RE = /\b(baca|ringkas|rangkum|jelaskan|uraikan|apa\s+(isi|kata|yang|ini)|tentang\s+(file|dokumen|lampiran|pdf|foto|gambar)|dokumen|lampiran|foto|gambar|screenshot|arsip|zip|pdf)\b/i;
const WORK_RE = /\b(tugas|skripsi|makalah|rencana|langkah|proyek|pekerjaan|kerjakan)\b/i;

function rankOffThread(docs, text) {
  return new Promise((resolve) => {
    let worker;
    try {
      worker = new Worker(new URL('../../raget/raget-agents/raget-worker.js', import.meta.url), { type: 'module' });
    } catch (e) {
      resolve(hybridRank(docs, text, 3));
      return;
    }
    const timer = setTimeout(() => {
      worker.terminate();
      resolve(hybridRank(docs, text, 3));
    }, 4000);
    worker.onmessage = (event) => {
      clearTimeout(timer);
      worker.terminate();
      resolve((event.data && event.data.hits) || []);
    };
    worker.onerror = () => {
      clearTimeout(timer);
      worker.terminate();
      resolve(hybridRank(docs, text, 3));
    };
    worker.postMessage({ type: 'hybrid', docs, query: text, limit: 3 });
  });
}

function titleFrom(text) {
  const t = String(text || '').replace(/\s+/g, ' ').trim();
  if (!t) return 'Chat';
  if (t.length <= 36) return t;
  return t.slice(0, 36).replace(/\s+\S*$/, '') || t.slice(0, 36);
}

function lastAttachedFile(session) {
  const msgs = (session && session.messages) || [];
  for (let i = msgs.length - 1; i >= 0; i -= 1) {
    const att = msgs[i].attach;
    if (att && att.fileText) return att;
  }
  return null;
}

const SLIDE_ACTION_RE = /\b(buat(kan)?|bikin|jadikan|susun|export|unduh)\b/i;
const SLIDE_NOUN_RE = /\b(slide|ppt|pptx)\b/i;

async function pickSlideMaterial(session, att) {
  if (att && att.fileText) {
    return { text: att.fileText, title: (att.name || 'Presentasi').replace(/\.[a-z0-9]+$/i, '') };
  }
  const msgs = (session && session.messages) || [];
  for (let i = msgs.length - 1; i >= 0; i -= 1) {
    const m = msgs[i];
    if (!m || m.role === 'user' || !m.text) continue;
    if (/Pratinjau slide|Unduh file slide|sudah diunduh/.test(m.text)) continue;
    if (m.source === 'websearch' || m.text.length >= 160) {
      return { text: m.text, title: session.title && session.title !== 'Chat' ? session.title : 'Presentasi' };
    }
  }
  const items = await collectionStore.allItems();
  for (let i = items.length - 1; i >= 0; i -= 1) {
    const it = items[i];
    if (it && it.text && it.text.length >= 80) {
      return { text: it.text, title: it.chatTitle || 'Koleksi' };
    }
  }
  return null;
}

function lastAiText(session) {
  const msgs = (session && session.messages) || [];
  for (let i = msgs.length - 1; i >= 0; i -= 1) {
    if (msgs[i].role !== 'user' && msgs[i].text) return msgs[i].text;
  }
  return '';
}

async function trySlideRequest(text, att, session) {
  if (!(SLIDE_ACTION_RE.test(text) && SLIDE_NOUN_RE.test(text))) return null;
  const fromLast = /\b(dari\s+ini|dari\s+jawaban|dari\s+hasil|jawaban\s+ini)\b/i.test(text);
  let material = null;
  let judul = 'Presentasi';
  if (att && att.fileText) {
    material = att.fileText;
    judul = (att.name || judul).replace(/\.[a-z0-9]+$/i, '');
  } else {
    const afterColon = text.split(':').slice(1).join(':').trim();
    if (afterColon) {
      material = afterColon;
      const topicMatch = text.match(/\b(?:tentang|untuk|dari)\s+([^:]+?)(?::|$)/i);
      if (topicMatch && !fromLast) judul = topicMatch[1].trim();
    }
  }
  if (!material || fromLast) {
    const prev = lastAiText(session);
    if (prev) {
      material = prev;
      if (session && session.title && session.title !== 'Chat') judul = session.title;
    }
  }
  if (!material) {
    const picked = await pickSlideMaterial(session, att);
    if (picked) {
      material = picked.text;
      judul = picked.title || judul;
    }
  }
  if (!material) {
    return 'Boleh, tapi saya butuh bahannya dulu — lampirkan file, ketik "buatkan slide tentang judul: isi", tanya dulu, atau simpan ke Koleksi lalu tap Slide.';
  }
  try {
    const outline = buildOutline(material, judul);
    const fileName = judul.replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '').toLowerCase() || 'slide';
    rememberSlide(outline, fileName + '.pptx');
    artifact.open(outline, judul, fileName + '.pptx');
    return previewOutline(outline) + '\n\nKetuk Unduh file slide kalau mau simpan PPTX.';
  } catch (e) {
    return 'Gagal membuat slide: ' + (e && e.message ? e.message : 'error tidak diketahui');
  }
}

const DOC_RE = /\b(buat(?:kan)?|ekspor|unduh)\s+(file\s+dokumen|berkas\s+dokumen|dokumen\s+word|file\s+word|file\s+markdown)\b/i;
const WORD_RE = /\b(docx|dokumen word|file word|microsoft word)\b/i;

function artifactTag(type, title, filename, body) {
  const safe = String(body || '').replace(/<\/artifact>/gi, '< /artifact>');
  const cleanTitle = String(title || 'Dokumen').replace(/"/g, '');
  const cleanName = String(filename || 'dokumen.docx').replace(/"/g, '');
  return '<artifact type="' + type + '" title="' + cleanTitle + '" filename="' + cleanName + '">' + safe + '</artifact>';
}

async function tryDocumentRequest(text, session) {
  const wantsWord = WORD_RE.test(text);
  if (!DOC_RE.test(text) && !wantsWord) return null;
  const material = lastAiText(session) || text.replace(DOC_RE, '').replace(WORD_RE, '').trim();
  if (!material) return 'Tanya topiknya dulu, baru minta dokumen.';
  const title = (session && session.title && session.title !== 'Chat') ? session.title : 'Dokumen';
  const md = '# ' + title + '\n\n' + material;
  const fileBase = title.replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '').toLowerCase() || 'dokumen';
  const fileName = fileBase + (wantsWord ? '.docx' : '.md');
  artifact.open({ type: 'document', markdown: md, title: title, fileName: fileName }, title);
  if (!wantsWord) return 'Dokumen terbuka di panel kanan. Bisa diedit lalu diunduh sebagai Markdown.';
  return artifactTag('document', title, fileName, md) + '\n\nDokumen Word siap di kartu obrolan. Ketuk Unduh berkas.';
}

async function tryDiagramRequest(text) {
  const spec = parseDiagramAsk(text);
  if (!spec) return null;
  const svg = buildDiagramSvg(spec);
  artifact.open({ type: 'diagram', markdown: svg, spec, title: 'Diagram', fileName: 'diagram.svg' }, 'Diagram');
  return 'Diagram terbuka di panel. Bisa diperbesar dan diunduh sebagai SVG.';
}

function rowsOffThread(text) {
  return new Promise((resolve) => {
    let worker;
    try {
      worker = new Worker(new URL('../../raget/raget-agents/raget-worker.js', import.meta.url), { type: 'module' });
    } catch (e) {
      resolve(sheetFromText(text));
      return;
    }
    const timer = setTimeout(() => {
      worker.terminate();
      resolve(sheetFromText(text));
    }, 4000);
    worker.onmessage = (event) => {
      clearTimeout(timer);
      worker.terminate();
      resolve((event.data && event.data.rows) || sheetFromText(text));
    };
    worker.onerror = () => {
      clearTimeout(timer);
      worker.terminate();
      resolve(sheetFromText(text));
    };
    worker.postMessage({ type: 'sheet', text });
  });
}

async function tryWorkbook(text, session) {
  if (!/\b(excel|xlsx|rekap|pembukuan|anggaran|kas)\b/i.test(text)) return null;
  const material = lastAiText(session) || text;
  const rows = String(material).length > 4000 ? await rowsOffThread(material) : sheetFromText(material);
  const mode = /\brata-rata|average\b/i.test(text) ? 'rata' : (/\bjika\b/i.test(text) ? 'jika' : 'jumlah');
  const bytes = buildXlsxBytes(rows, mode);
  downloadBytes(bytes, 'rekap.xlsx');
  artifact.open({ type: 'table', rows, title: 'Rekap', fileName: 'rekap.xlsx' }, 'Rekap');
  return 'Rekap tersusun. Berkas Excel sudah diunduh dan tabelnya ada di kanvas.';
}

async function tryReceipt(text, session) {
  if (!/\b(struk|nota|kuitansi|invoice|kartu nama)\b/i.test(text)) return null;
  const file = lastAttachedFile(session);
  const material = (file && file.fileText) || lastAiText(session) || text;
  if (!/\d{2,}/.test(material)) return 'Lampirkan foto struk atau tempel teksnya, lalu minta ekstrak.';
  const rows = receiptTable(material);
  artifact.open({ type: 'table', rows, title: 'Struk', fileName: 'struk.csv' }, 'Struk');
  return 'Rincian struk: ' + rows.map((row) => row[0] + ' = ' + row[1]).join('; ');
}

function minutesOf(src) {
  const bits = String(src || '').split(/(?<=[.!?])\s+/).map((s) => s.trim()).filter((s) => s.length > 8);
  const decisions = bits.filter((s) => /putus|sepakat|keputusan|setuju/i.test(s)).slice(0, 4);
  const actions = bits.filter((s) => /harus|akan|tugas|tolong|kerjakan|lanjut/i.test(s)).slice(0, 4);
  const summary = bits.slice(0, 3);
  return '# Notulensi\n\n## Keputusan\n' + (decisions.length ? decisions.map((s) => '- ' + s).join('\n') : '- Belum ada kalimat keputusan yang tegas.') + '\n\n## Tindak lanjut\n' + (actions.length ? actions.map((s) => '- ' + s).join('\n') : '- Belum ada tugas yang disebut.') + '\n\n## Ringkasan\n' + (summary.length ? summary.join(' ') : src.slice(0, 400));
}

async function tryMeeting(text) {
  if (!/\b(rapat|notulensi|perkuliahan)\b/i.test(text)) return null;
  if (/\b(rekam|mulai)\b/i.test(text) && !/\b(notulensi|selesai|rangkum)\b/i.test(text)) {
    voice.captureMeeting();
    return 'Rekaman rapat dimulai di perangkat ini. Ketik "buat notulensi" saat selesai.';
  }
  if (!/\b(notulensi|selesai|rangkum)\b/i.test(text)) return null;
  const src = voice.meetingText;
  if (!src || src.length < 20) return 'Belum ada rekaman rapat. Ketik "rekam rapat", lalu bicara.';
  const minutes = minutesOf(src);
  const bytes = buildDocxBytes(minutes);
  downloadBytes(bytes, 'notulensi.docx');
  artifact.open({ type: 'document', markdown: minutes, title: 'Notulensi', fileName: 'notulensi.docx' }, 'Notulensi');
  return 'Notulensi disusun dari rekaman di perangkat ini. Berkas Word sudah diunduh.';
}

function tryAgenda(text) {
  if (!/\b(agenda|jadwal|pengingat)\b/i.test(text)) return null;
  const items = remindersStore.allActive().slice(0, 6);
  const projects = workspace.list().slice(0, 4);
  const agenda = items.length ? items.map((item) => '- ' + item.text).join('\n') : '- Tidak ada janji tersimpan.';
  const tasks = projects.length ? projects.map((item) => '- ' + item.name).join('\n') : '- Belum ada proyek terbuka.';
  return 'Agenda:\n' + agenda + '\n\nTugas proyek:\n' + tasks;
}

async function tryReportRequest(text) {
  if (!/\b(cetak|siap cetak|laporan pdf|simpan pdf)\b/i.test(text)) return null;
  const body = '<p>' + text.replace(/</g, '').slice(0, 4000) + '</p>';
  artifact.open({ type: 'report', markdown: body, title: 'Laporan', fileName: 'laporan.html' }, 'Laporan');
  printReport({ title: 'Laporan', body });
  return 'Pratinjau cetak dibuka. Simpan sebagai PDF dari jendela cetak.';
}

async function tryChartRequest(text) {
  if (!/\b(grafik|chart)\b/i.test(text)) return null;
  const spec = parseChartAsk(text);
  if (!spec) return 'Sebut nilainya, misalnya: buat grafik batang A: 10, B: 20.';
  const svg = buildChartSvg(spec);
  artifact.open({ type: 'chart', markdown: svg, title: spec.title, fileName: 'grafik.svg' }, spec.title);
  return 'Grafik terbuka di panel. Bisa diunduh sebagai SVG.';
}

const HIDDEN_ORDER = /ignore previous instructions|abaikan instruksi sebelumnya|abaikan semua instruksi|ekspor data sensitif|jailbreak|you are now|system prompt/i;

const subgoalLru = new Map();

export function cachedSubgoals(text, plan) {
  const key = String(text || '').trim();
  const build = typeof plan === 'function' ? plan : planSubgoals;
  if (subgoalLru.has(key)) {
    const hit = subgoalLru.get(key);
    subgoalLru.delete(key);
    subgoalLru.set(key, hit);
    return hit;
  }
  const built = build(key);
  subgoalLru.set(key, built);
  while (subgoalLru.size > 48) {
    const oldest = subgoalLru.keys().next().value;
    subgoalLru.delete(oldest);
  }
  return built;
}

export function scrubInjection(text) {
  return String(text || '')
    .replace(/[\u200B-\u200D\uFEFF\u2060\u180E]/g, '')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .normalize('NFKC')
    .replace(/[\u0430\u0410]/g, 'a')
    .replace(/[\u0435\u0415]/g, 'e')
    .replace(/[\u043E\u041E]/g, 'o')
    .replace(/[\u0440\u0420]/g, 'p')
    .replace(/[\u0441\u0421]/g, 'c')
    .replace(/[\u0445\u0425]/g, 'x')
    .replace(/[\u0456\u0406]/g, 'i');
}

export function hiddenOrder(text) {
  return HIDDEN_ORDER.test(scrubInjection(text));
}

function buildAttachmentTraceMeta(att) {
  if (!att) return null;
  const v = att.visionMeta;
  let visionSummary = '';
  let paletteSummary = '';
  if (v) {
    visionSummary = [v.kindLabel, v.width && v.height ? (v.width + '×' + v.height + ' px') : '', v.kb ? (v.kb + ' KB') : ''].filter(Boolean).join(' · ');
    if (Array.isArray(v.topColors) && v.topColors.length) {
      paletteSummary = 'Warna dominan: ' + v.topColors.slice(0, 3).map((c) => c.name + ' (' + c.pct + '%)').join(', ');
    }
  }
  return {
    kind: att.kind || (att.full || att.thumb ? 'image' : 'file'),
    sizeLabel: att.sizeLabel || '',
    statusLabel: att.statusLabel || '',
    visionSummary,
    paletteSummary,
  };
}

function bindWeightCard() {
  const card = $('weight-card');
  const bar = $('top-download-bar');
  const btn = $('btn-weight');
  const pauseBtn = $('btn-weight-pause');
  const cancelBtn = $('btn-weight-cancel');
  const fill = $('weight-fill');
  const status = $('weight-status');
  if (!card || !btn || btn.dataset.bound) return;
  btn.dataset.bound = '1';
  let providerRef = null;
  const reveal = (on) => {
    if (bar) bar.hidden = !on;
    card.hidden = !on;
  };
  const paint = (detail) => {
    const loaded = Math.max(
      Number(detail && detail.loaded) || 0,
      Number(detail && detail.visibleLoaded) || 0,
      Number(detail && detail.committedVerifiedBytes) || 0
    );
    const total = Number(detail && detail.total) || 0;
    const rawPct = total > 0 ? Math.max(0, Math.min(100, (loaded / total) * 100)) : 0;
    const pct = Math.round(rawPct);
    const pctText = (loaded > 0 && pct === 0) ? Math.max(0.1, rawPct).toFixed(1) + '%' : (pct + '%');
    const fillPct = total > 0 ? Math.max(loaded > 0 ? 1.5 : 0, rawPct) : 0;
    const installed = providerRef && typeof providerRef.weightsInstalled === 'function' && providerRef.weightsInstalled();
    if (installed) {
      reveal(false);
      return;
    }
    reveal(true);
    if (fill) fill.style.width = fillPct.toFixed(1) + '%';
    const bar = $('weight-bar');
    if (bar) bar.setAttribute('aria-valuenow', String(pct));
    if (!status) return;
    const speed = Number(detail && detail.speed) || 0;
    const eta = Number(detail && detail.eta) || 0;
    const mb = speed / (1024 * 1024);
    const mbText = mb >= 0.05 ? mb.toFixed(1) + ' MB/s' : (speed > 0 ? Math.round(speed / 1024) + ' KB/s' : '0 MB/s');
    const etaText = eta > 0 ? (eta >= 60 ? Math.ceil(eta / 60) + ' mnt' : Math.ceil(eta) + ' dtk') : '—';
    const mbDone = (loaded / (1024 * 1024)).toFixed(loaded < 10 * 1024 * 1024 && loaded > 0 ? 1 : 0);
    const mbTotal = total > 0 ? Math.round(total / (1024 * 1024)) : 997;
    status.dataset.busy = '1';
    if (pauseBtn) pauseBtn.hidden = false;
    if (cancelBtn) cancelBtn.hidden = false;
    reveal(true);
    if (total > 0 && loaded >= total) {
      status.textContent = '100% (' + mbTotal + ' MB) · memeriksa berkas';
      return;
    }
    const isNarrowMobile = typeof window !== 'undefined' && Number(window.innerWidth) > 0 && Number(window.innerWidth) < 600;
    status.textContent = isNarrowMobile ? (pctText + ' (' + mbDone + 'MB) · ' + mbText + ' · ' + etaText) : (pctText + ' (' + mbDone + '/' + mbTotal + ' MB) · ' + mbText + ' · ' + etaText);
  };
  window.addEventListener('rategoan:neural-progress', (event) => {
    paint((event && event.detail) || {});
  });
  import('../../raget/raget-neural/neural-provider.js').then(async (mod) => {
    const neuralProvider = mod.neuralProvider;
    providerRef = neuralProvider;
    const cepatBtn = $('mode-cepat');
    if (cepatBtn) cepatBtn.onclick = () => {
      enginePreference.set('cloud');
      window.dispatchEvent(new CustomEvent('rategoan:model-switched', { detail: { id: 'cloud' } }));
    };
    const syncCard = () => {
      const installed = typeof neuralProvider.weightsInstalled === 'function' && neuralProvider.weightsInstalled();
      if (installed) {
        reveal(false);
        return;
      }
      reveal(true);
      if (status && !status.dataset.busy) status.textContent = 'Belum Terpasang';
    };
    syncCard();
    if (!card.hidden && status && !status.dataset.busy) status.textContent = 'Belum Terpasang';
    let downloadAttached = false;
    const startOrAttachDownload = (resetText) => {
      btn.disabled = true;
      if (pauseBtn) {
        pauseBtn.hidden = false;
        pauseBtn.textContent = neuralProvider.weightPaused() ? 'Lanjut' : 'Jeda';
      }
      if (cancelBtn) cancelBtn.hidden = false;
      if (status) {
        status.dataset.busy = '1';
        if (resetText) status.textContent = 'Bobot Raget 1.0 sedang diunduh secara progresif (0%).';
      }
      if (downloadAttached) return;
      downloadAttached = true;
      neuralProvider.loadWeights().then((ok) => {
        downloadAttached = false;
        if (pauseBtn) pauseBtn.hidden = true;
        if (cancelBtn) cancelBtn.hidden = true;
        if (ok && neuralProvider.ready()) {
          if (status) delete status.dataset.busy;
          reveal(false);
          return;
        }
        btn.disabled = false;
        if (status) delete status.dataset.busy;
        const err = neuralProvider.weightError() || '';
        if (err === 'dibatalkan') {
          if (status) status.textContent = 'Unduhan dibatalkan. Potongan yang sudah ada tetap di perangkat.';
          return;
        }
        if (status) status.textContent = 'Unduhan gagal. ' + (err || 'Coba lagi.');
      });
    };
    window.addEventListener('rategoan:neural-progress', (ev) => {
      const d = (ev && ev.detail) || {};
      if (d.source === 'opfs' && d.pending && !neuralProvider.weightPaused()) {
        startOrAttachDownload(false);
      }
    });
    if (pauseBtn) pauseBtn.onclick = () => {
      if (neuralProvider.weightPaused()) {
        neuralProvider.resumeWeights();
        pauseBtn.textContent = 'Jeda';
        startOrAttachDownload(false);
      } else {
        neuralProvider.pauseWeights();
        pauseBtn.textContent = 'Lanjut';
        if (status) status.textContent = 'Unduhan dijeda.';
      }
    };
    if (cancelBtn) cancelBtn.onclick = () => {
      downloadAttached = false;
      neuralProvider.cancelWeights();
      if (pauseBtn) pauseBtn.hidden = true;
      cancelBtn.hidden = true;
      btn.disabled = false;
      if (status) {
        delete status.dataset.busy;
        status.textContent = 'Unduhan dibatalkan. Potongan yang sudah ada tetap di perangkat.';
      }
    };
    btn.onclick = () => startOrAttachDownload(true);
  }).catch(() => {
    card.hidden = false;
    if (status) status.textContent = 'Kartu bobot gagal dimuat.';
  });
}

let pendingAnswerBound = false;
function bindPendingAnswer() {
  if (pendingAnswerBound || typeof window === 'undefined') return;
  pendingAnswerBound = true;
  window.addEventListener('rategoan:pending-reply', (event) => {
    const detail = (event && event.detail) || {};
    const reply = detail.reply || '';
    const prompt = detail.prompt ? String(detail.prompt) : '';
    if (!reply) return;
    const msgId = detail.message_id ? String(detail.message_id) : '';
    let removedById = false;
    if (msgId) {
      document.querySelectorAll('#messages .msg.ai').forEach((node) => {
        if (node.dataset && node.dataset.messageId === msgId) {
          node.remove();
          removedById = true;
        }
      });
    }
    if (!removedById) {
      document.querySelectorAll('#messages .msg.ai').forEach((node) => {
        if (node.dataset && (node.dataset.state === 'queued' || node.dataset.state === 'failed')) node.remove();
      });
    }
    const s = composer.ensure();
    const item = {
      role: 'ai',
      text: String(reply),
      time: Date.now(),
      request_id: detail.request_id || '',
      message_id: detail.message_id || '',
    };
    let inserted = false;
    if (prompt) {
      for (let i = 0; i < s.messages.length; i += 1) {
        const cur = s.messages[i];
        const next = s.messages[i + 1];
        if (cur && cur.role === 'user' && cur.text === prompt && (!next || next.role !== 'ai')) {
          s.messages.splice(i + 1, 0, item);
          inserted = true;
          break;
        }
      }
    }
    if (!inserted) {
      const last = s.messages[s.messages.length - 1];
      if (!last || last.role !== 'ai' || last.text !== String(reply)) {
        s.messages.push(item);
      }
    }
    store.save();
    chat.renderMessages();
    if (item.message_id) {
      const nodes = document.querySelectorAll('#messages .msg.ai');
      const tail = nodes[nodes.length - 1];
      if (tail) tail.dataset.messageId = item.message_id;
    }
  });
}

export const composer = {
  websearchActive: false,
  thinkActive: false,
  slideActive: false,
  researchActive: false,
  resetForNewChat() {
    abortGeneration();
    cancelAgent();
    document.body.classList.remove('is-generating');
    document.body.classList.remove('has-draft');
    import('../../raget/raget-neural/neural-provider.js').then((mod) => {
      if (mod.neuralProvider && mod.neuralProvider.haltInference) mod.neuralProvider.haltInference();
    }).catch(() => {});
    const inp = $('chat-input');
    if (inp) {
      inp.value = '';
      this.autoGrow();
    }
    if (attach && typeof attach.consume === 'function') attach.consume();
    if (quote && typeof quote.consume === 'function') quote.consume();
  },
  autoGrow() {
    const inp = $('chat-input');
    if (!inp) return;
    inp.style.height = 'auto';
    const nextH = Math.min(inp.scrollHeight, 120);
    inp.style.height = nextH + 'px';
    inp.style.overflowY = inp.scrollHeight > 120 ? 'auto' : 'hidden';
  },
  ensure() {
    const st = store.get();
    let s = st.sessions.find((x) => x.id === st.currentId);
    if (!s) {
      s = { id: Date.now().toString(36), title: 'Chat', messages: [], created: Date.now(), projectId: workspace.currentId() };
      store.set({ sessions: [s].concat(st.sessions), currentId: s.id });
    }
    return s;
  },
  async send(text) {
    this.thinkActive = enginePreference.get() === 'neural';
    text = scrubInjection(text);
    if (hiddenOrder(text)) {
      toast.show('Perintah tersembunyi ditolak. Pengiriman dibatalkan.');
      return;
    }
    let att = attach.consume();
    if (att && typeof attach.ensureReady === 'function') {
      att = await attach.ensureReady(att);
    }
    const fenced = att && att.fileText ? buriedOrder(fenceUntrusted(att.name, att.fileText)) : { inside: false };
    if (att && att.fileText && (hiddenOrder(att.fileText) || fenced.inside)) {
      toast.show('Berkas berisi injeksi perintah. Pengiriman dibatalkan.');
      return;
    }
    const s = this.ensure();
    const sendSessionId = s.id;
    if (!s.messages.length) s.title = titleFrom(text || (att && att.name) || 'Chat');
    if (WORK_RE.test(text) && !s.project) {
      s.project = { goal: titleFrom(text), started: Date.now() };
    }
    try { memoryLong.learnFromText(text); } catch (e) { console.warn('[Rategoan Fallback]', e); }
    const blocked = refuseProhibited(text);
    if (blocked) {
      s.messages.push({ role: 'user', text, time: Date.now() });
      store.save();
      history.render();
      chat.renderMessages();
      await chat.ask(text, { directReply: blocked });
      store.save();
      return;
    }
    const displayUserText = text;
    if (!text.trim() && att) text = 'Baca dan ringkas lampiran ini';
    if (!s.messages.length && displayUserText) s.title = titleFrom(displayUserText);
    else if (!s.messages.length && att) s.title = titleFrom(att.name || 'Lampiran');
    const q = quote.consume();
    s.messages.push({
      role: 'user',
      text: displayUserText,
      time: Date.now(),
      attach: att,
      quote: q ? { name: q.role === 'user' ? 'Anda' : 'Rategoan', text: String(q.text).slice(0, 140) } : null,
    });
    store.save();
    history.render();
    chat.renderMessages();
    haptics.tap(10);
    const projNew = text.match(/^proyek baru\s+(.+)$/i);
    if (projNew) {
      const p = workspace.create(projNew[1]);
      const reply = 'Proyek "' + p.name + '" aktif. Chat baru di sini tidak tercampur proyek lain.';
      s.projectId = p.id;
      s.project = { goal: p.name, started: Date.now() };
      await chat.ask(text, { directReply: reply });
      store.save();
      return;
    }
    const projGo = text.match(/^pindah proyek\s+(.+)$/i);
    if (projGo) {
      const found = workspace.findByName(projGo[1]);
      const reply = found ? (workspace.setCurrent(found.id) && ('Pindah ke proyek "' + found.name + '".')) : 'Proyek tidak ketemu. Ketik proyek baru <nama>.';
      if (found) s.projectId = found.id;
      await chat.ask(text, { directReply: reply });
      store.save();
      return;
    }
    if (/^proyek ini$/i.test(text.trim())) {
      const cur = workspace.current();
      await chat.ask(text, { directReply: cur ? ('Proyek aktif: ' + cur.name) : 'Belum ada proyek. Ketik proyek baru <nama>.' });
      store.save();
      return;
    }
    if (this.researchActive || flowHub.wantsResearch(text)) this.setWebsearch(true);
    const plan = turnPipeline.inspect(text, {
      messages: s.messages,
      attach: att,
      websearch: this.websearchActive || this.researchActive,
    });
    const isWebsearch = plan.route === 'web' || plan.route === 'research' || this.researchActive;
    const deep = this.researchActive || flowHub.wantsResearch(text);
    const routedText = isWebsearch ? ((deep ? 'riset ' : 'googling ') + text.replace(/^riset\s+(mendalam\s+)?/i, '')) : text;
    if (plan.route === 'slide' && /^(lanjut|lanjutkan|dari ini)$/i.test(text.trim())) {
      text = 'buatkan slide dari ini';
    }
    const directReply = null;
    let canvasNote = await trySlideRequest(text, att, s);
    if (canvasNote == null) canvasNote = await tryDocumentRequest(text, s);
    if (canvasNote == null) canvasNote = await tryChartRequest(text);
    if (canvasNote == null) canvasNote = await tryDiagramRequest(text);
    if (canvasNote == null) canvasNote = await tryReportRequest(text);
    if (canvasNote == null) canvasNote = await tryWorkbook(text, s);
    if (canvasNote == null) canvasNote = await tryReceipt(text, s);
    if (canvasNote == null) canvasNote = await tryMeeting(text);
    if (canvasNote == null) canvasNote = tryAgenda(text);
    if (canvasNote == null && plan.route === 'collection') {
      canvasNote = await toolsKoleksi.run('cari_koleksi', text);
    }
    const fileSrc = (att && (att.fileText || att.fileTextError || (att.files && att.files.length))) ? att : lastAttachedFile(s);
    let fileContextNote = '';
    if (att && (att.fileText || att.fileTextError || (att.files && att.files.length))) {
      fileContextNote = summarizeMultiAttachments(att, text) || '';
    } else if (fileSrc && (FILE_ASK_RE.test(text) || FILE_READ_RE.test(text))) {
      if (Array.isArray(fileSrc.files) && fileSrc.files.length > 1) {
        fileContextNote = summarizeMultiAttachments(fileSrc, text) || '';
      } else if (fileSrc.fileText) {
        const safeFile = sanitizeDocContext(fileSrc.fileText).text;
        if (FILE_READ_RE.test(text) && !/\b(apa|jelaskan|tentang)\b/i.test(text)) {
          fileContextNote = summarizeFileText(safeFile, fileSrc.name);
        } else {
          const chunks = String(safeFile).split(/\n{2,}|(?<=[.!?])\s+/).map((part) => part.trim()).filter((part) => part.length > 12).slice(0, 80);
          const hits = searchDocs(chunks.map((part, index) => ({ id: index, text: part })), text, 3);
          fileContextNote = hits.length ? ('Dari "' + (fileSrc.name || 'berkas') + '":\n\n' + hits.map((hit) => hit.text).join('\n\n')) : answerFromFile(safeFile, text, fileSrc.name);
        }
      } else if (fileSrc.fileTextError) fileContextNote = fileSrc.fileTextError;
    }
    const project = workspace.current();
    if (project) workspace.linkSession(project.id, s.id);
    let projectPrefix = '';
    if (project && (project.systemPrompt || (project.pinnedFiles && project.pinnedFiles.length))) {
      const docs = (project.pinnedFiles || []).map((file, index) => {
        const clean = sanitizeDocContext(file.textContent || '');
        return { id: index, name: file.name, text: clean.text };
      });
      const bulk = docs.reduce((sum, file) => sum + String(file.text || '').length, 0);
      const hits = bulk > 12000 ? await rankOffThread(docs, text) : hybridRank(docs, text, 3);
      const picked = hits.length ? hits : docs.slice(0, 2);
      projectPrefix = GUARDRAIL + '\n' + fenceUntrusted(project.name, (project.systemPrompt || '') + '\n' + picked.map((file) => (file.name || 'berkas') + ': ' + String(file.text || '').slice(0, 500)).join('\n'));
    }

    const attTraceMeta = buildAttachmentTraceMeta(att || fileSrc);
    let thoughts = buildDynamicThoughts(text, {
      think: this.thinkActive,
      websearch: isWebsearch,
      research: this.researchActive,
      files: (att && att.name) || (fileSrc && FILE_ASK_RE.test(text) ? fileSrc.name : ''),
      fileMeta: attTraceMeta,
    });
    const livePlan = document.createElement('div');
    livePlan.className = 'msg ai';
    livePlan.dataset.thoughtStart = String(Date.now());
    mountThought(livePlan, thoughts, 'berjalan');
    $('messages').appendChild(livePlan);

    const refreshLiveThoughts = () => {
      if (!livePlan.isConnected) return;
      mountThought(livePlan, thoughts, 'berjalan');
    };

    if (this.thinkActive || this.researchActive) {
      const planRes = await runAgentPlan({
        text,
        think: this.thinkActive,
        research: this.researchActive,
        files: att && att.name,
        sessionId: s.id,
        onStep: () => refreshLiveThoughts(),
      });
      if (planRes.status === 'dibatalkan') {
        livePlan.remove();
        return;
      }
    }

    const rawAttachmentText = [att && att.fileText ? String(att.fileText).slice(0, 4000) : '', fileContextNote ? String(fileContextNote).slice(0, 3000) : ''].filter(Boolean).join('\n\n');
    const imageNote = rawAttachmentText ? fenceUntrusted((att && att.name) || (fileSrc && fileSrc.name) || 'lampiran', rawAttachmentText) : '';
    const prefDocs = memoryLong.preferenceDocs();
    const prefHit = prefDocs.map((doc) => ({ ...doc, sim: cosineText(text, doc.text) })).sort((a, b) => b.sim - a.sim)[0];
    const prefNote = prefHit && prefHit.sim >= 0.2 ? 'Aturan pengguna: ' + prefHit.text : '';
    const skillNote = skill.prompt();
    const flashNote = hemat.enabled() ? 'Jawab ringkas dalam maksimal 2-3 kalimat padat, to-the-point, tanpa basa-basi.' : '';
    let webNote = canvasNote ? String(canvasNote) : '';
    const webSources = [];
    if (isWebsearch) {
      try {
        const [apiRes, multiRes] = await Promise.allSettled([
          fetch('/api/connectors/web/search?q=' + encodeURIComponent(text)),
          deep ? webSearch.research(text) : webSearch.search(text),
        ]);
        const noteLines = [];
        if (apiRes.status === 'fulfilled' && apiRes.value && apiRes.value.ok) {
          const data = await apiRes.value.json();
          const rows = data && data.results;
          if (Array.isArray(rows) && rows.length) {
            rows.slice(0, 4).forEach((row) => {
              const title = row && row.title ? String(row.title) : '';
              const snippet = row && row.snippet ? String(row.snippet) : '';
              const url = row && row.url ? String(row.url) : '';
              const line = [title, snippet].filter(Boolean).join(' — ');
              if (line) noteLines.push(line);
              if (title && url && /^https?:\/\//i.test(url) && !webSources.some((s) => s.url === url)) {
                webSources.push({ title, url });
              }
            });
          }
        }
        if (multiRes.status === 'fulfilled' && multiRes.value && multiRes.value.ok) {
          const m = multiRes.value;
          (m.sources || []).slice(0, 6).forEach((src) => {
            const line = [src.title, src.extract, src.url ? ('(' + src.url + ')') : ''].filter(Boolean).join(' — ');
            if (line && !noteLines.includes(line)) noteLines.push(line);
            if (src && src.title && src.url && /^https?:\/\//i.test(src.url) && !webSources.some((s) => s.url === src.url)) {
              webSources.push({ title: String(src.title), url: String(src.url) });
            }
          });
        }
        webNote = [webNote, noteLines.slice(0, 8).join('\n')].filter(Boolean).join('\n');
        if (webSources.length) {
          const hosts = webSources.slice(0, 3).map((s) => {
            try { return new URL(s.url).hostname.replace(/^www\./, ''); } catch (e) { return s.title; }
          });
          const webStep = thoughts.find((st) => st.kind === 'WEB_SEARCH');
          if (webStep) {
            webStep.sub = webSources.length + ' rujukan dipindai: ' + hosts.join(', ');
            refreshLiveThoughts();
          }
        }
      } catch (e) { /* offline */ }
    }
    const localProd = resolveLocalProductivityTool(text);
    if (localProd) {
      try {
        const prodOut = await runConnectorTool(localProd.name, localProd.parameters);
        if (prodOut && prodOut.ok && prodOut.data) {
          webNote = [webNote, 'Data alat lokal (' + localProd.name + '): ' + JSON.stringify(prodOut.data).slice(0, 800)].filter(Boolean).join('\n');
        }
      } catch (e) { /* lanjut ke mesin utama */ }
    }
    const autoConn = directReply == null ? resolveAutonomousConnector(text) : null;
    if (autoConn) {
      try {
        const connOut = await runConnectorTool(autoConn.name, autoConn.parameters);
        if (connOut && connOut.ok && connOut.data) {
          const summary = JSON.stringify(connOut.data).slice(0, 1200);
          webNote = [webNote, 'Data konektor (' + autoConn.name + '): ' + summary].filter(Boolean).join('\n');
        } else if (connOut && connOut.error === 'belum_terhubung') {
          const fallbackVault = await runConnectorTool('vault_semantic_search', { query: text, limit: 3 });
          if (fallbackVault && fallbackVault.ok && fallbackVault.data && Array.isArray(fallbackVault.data.hits) && fallbackVault.data.hits.length) {
            webNote = [webNote, 'Cadangan Brankas Lokal: ' + JSON.stringify(fallbackVault.data.hits).slice(0, 900)].filter(Boolean).join('\n');
          }
        }
      } catch (e) { /* konektor offline */ }
    }
    const modelPrefix = [imageNote ? GUARDRAIL : '', skillNote, flashNote, prefNote, projectPrefix, imageNote, webNote].filter(Boolean).join('\n\n');
    if ((store.get() && store.get().currentId) !== sendSessionId) {
      if (livePlan && livePlan.parentNode) livePlan.remove();
      return;
    }
    let reply = await chat.ask(routedText, { searching: isWebsearch, directReply, thoughts, livePlan, modelPrefix });
    if ((store.get() && store.get().currentId) !== sendSessionId) {
      if (livePlan && livePlan.parentNode) livePlan.remove();
      return;
    }
    if (reply == null) {
      if (livePlan) {
        livePlan.dataset.state = 'failed';
        const note = document.createElement('p');
        note.className = 'thought-fail';
        note.textContent = 'Bobot sedang diunduh (0%). Obrolan akan otomatis aktif setelah unduhan selesai 100%.';
        livePlan.appendChild(note);
        import('../../raget/raget-neural/neural-provider.js').then((mod) => {
          const env = mod.neuralProvider && typeof mod.neuralProvider.lastEnvelope === 'function'
            ? mod.neuralProvider.lastEnvelope()
            : null;
          if (env && env.status === 'DOWNLOADING') livePlan.dataset.state = 'queued';
          if (env && env.message_id) livePlan.dataset.messageId = env.message_id;
          if (env && env.error) note.textContent = env.error;
          else if (env && env.status) note.textContent = 'Status bobot: ' + env.status + '. Tidak ada jawaban.';
          toast.show(note.textContent);
        }).catch(() => {});
      }
      toast.show('Bobot sedang diunduh (0%). Obrolan akan otomatis aktif setelah unduhan selesai 100%.');
      return;
    }
    if (livePlan && livePlan.parentNode) livePlan.remove();
    if (cowork.expectsEdit()) cowork.applyReply(reply);
    if (isWebsearch && webSources.length && typeof document !== 'undefined') {
      const aiBubbles = document.querySelectorAll('#messages .msg.ai');
      const lastAi = aiBubbles.length ? aiBubbles[aiBubbles.length - 1] : null;
      if (lastAi && !lastAi.querySelector('.web-sources-strip')) {
        const strip = document.createElement('div');
        strip.className = 'web-sources-strip';
        webSources.slice(0, 5).forEach((src) => {
          const link = document.createElement('a');
          link.className = 'web-source-chip';
          link.href = src.url;
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
          let hostLabel = src.title;
          try { hostLabel = new URL(src.url).hostname.replace(/^www\./, '') + ' · ' + src.title; } catch (e) { /* ignore */ }
          link.textContent = hostLabel.slice(0, 48);
          strip.appendChild(link);
        });
        const actionsBar = lastAi.querySelector('.msg-actions');
        if (actionsBar) lastAi.insertBefore(strip, actionsBar);
        else lastAi.appendChild(strip);
      }
    }
    if (isWebsearch && reply) {
      try {
        if (!(await collectionStore.existsByText(reply))) {
          await collectionStore.addItem({
            text: reply,
            role: 'ai',
            tag: 'web',
            kind: 'web',
            note: flowHub.threePoints(reply),
            chatTitle: s.title || '',
            projectId: s.projectId || workspace.currentId(),
          });
        }
      } catch (e) { console.warn('[Rategoan Fallback]', e); }
    }
    store.save();
    history.render();
  },

  _toggleSwitch(id, on) {
    const card = $(id);
    if (card) {
      card.classList.toggle('active', on);
      card.setAttribute('aria-checked', String(on));
    }
  },
  syncModes() {
    this.thinkActive = enginePreference.get() === 'neural';
    attach.setModes({
      websearch: this.websearchActive,
      think: false,
      research: this.researchActive,
    });
  },
  updatePlaceholder() {
    const inp = $('chat-input');
    if (!inp) return;
    if (this.slideActive) {
      inp.placeholder = 'Ketik topik untuk dibuatkan slide (.pptx)…';
    } else if (this.researchActive) {
      inp.placeholder = 'Tanya topik untuk riset mendalam…';
    } else if (this.websearchActive) {
      inp.placeholder = 'Telusuri web dengan Rategoan…';
    } else {
      inp.placeholder = 'Tanya Rategoan';
    }
  },
  setWebsearch(active) {
    this.websearchActive = active;
    const card = $('sheet-websearch');
    if (card) {
      card.classList.toggle('active', active);
      card.setAttribute('aria-checked', String(active));
    }
    this.paintQuick();
    this.updatePlaceholder();
    this.syncModes();
  },
  paintQuick() {
    const web = $('btn-quick-web');
    const research = $('btn-quick-research');
    const slide = $('btn-quick-slide');
    if (research) {
      research.hidden = !this.researchActive;
      research.classList.toggle('on', !!this.researchActive);
      research.setAttribute('aria-pressed', String(!!this.researchActive));
    }
    if (web) {
      web.hidden = !this.websearchActive;
      web.classList.toggle('on', !!this.websearchActive);
      web.setAttribute('aria-pressed', String(!!this.websearchActive));
    }
    if (slide) {
      slide.hidden = !this.slideActive;
      slide.classList.toggle('on', !!this.slideActive);
      slide.setAttribute('aria-pressed', String(!!this.slideActive));
    }
    this._toggleSwitch('sheet-slide', !!this.slideActive);
    this.updatePlaceholder();
  },
  bind() {
    this.thinkActive = enginePreference.get() === 'neural';
    window.addEventListener('rategoan:model-switched', () => {
      this.thinkActive = enginePreference.get() === 'neural';
    });
    bindWeightCard();
    bindPendingAnswer();
    const inp = $('chat-input');
    if (!inp) return;
    const paintSlot = () => {
      const draft = !!(inp.value.trim() || attach.current || quote.current);
      document.body.classList.toggle('has-draft', draft);
      const sendBtn = $('btn-send');
      if (sendBtn) {
        sendBtn.disabled = !draft;
        sendBtn.classList.toggle('is-idle', !draft);
      }
    };
    inp.addEventListener('input', () => {
      this.autoGrow();
      paintSlot();
    });
    inp.addEventListener('focus', () => setTimeout(scrollBottom, 250));
    const send = $('btn-send');
    if (send) send.onclick = () => {
      let t = inp.value.trim();
      if (!t && !attach.current && !quote.current) return;

      const wasSlide = this.slideActive;
      if (wasSlide && t && !SLIDE_NOUN_RE.test(t)) t = 'Buatkan slide: ' + t;
      if (wasSlide) {
        this.slideActive = false;
        this.paintQuick();
      }
      inp.value = '';
      this.autoGrow();
      document.body.classList.remove('has-draft');
      this.send(t);
    };
    const plus = $('btn-plus');
    if (plus) plus.onclick = () => {
      const label = $('sheet-project-label');
      const cur = workspace.current();
      if (label) label.textContent = cur ? ('Proyek aktif: ' + cur.name) : 'Belum ada proyek terpilih (Pilih)';
      this._toggleSwitch('sheet-research', this.researchActive);
      this._toggleSwitch('sheet-websearch', this.websearchActive);
      this._toggleSwitch('sheet-slide', this.slideActive);
      attach.open();
    };
    document.addEventListener('rategoan:stop-generation', () => {
      abortGeneration();
      cancelAgent();
      import('../../raget/raget-neural/neural-provider.js').then((mod) => {
        if (mod.neuralProvider.haltInference) mod.neuralProvider.haltInference();
      });
    });
    document.addEventListener('rategoan:command', (event) => {
      if (event.detail === 'think') {
        this.thinkActive = true;
        this.paintQuick();
        this.syncModes();
      } else if (event.detail === 'think-off') {
        this.thinkActive = false;
        this.paintQuick();
        this.syncModes();
      } else if (event.detail === 'tinggi' || event.detail === 'rendah' || event.detail === 'mendalam' || event.detail === 'cepat') {
        this.thinkActive = event.detail === 'tinggi' || event.detail === 'mendalam';
        this.paintQuick();
        this.syncModes();
      } else if (event.detail === 'docx') {
        $('chat-input').value = 'Buatkan dokumen Word dari percakapan ini';
      } else if (event.detail === 'slide') {
        $('chat-input').value = 'Buatkan slide dari percakapan ini';
      }
    });
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', () => {
        const offset = Math.max(0, window.innerHeight - window.visualViewport.height - (window.visualViewport.offsetTop || 0));
        document.documentElement.style.setProperty('--keyboard-offset', offset + 'px');
        if (offset > 100) scrollBottom();
      });
    }
    attach.onModeOff = (key) => {
      if (key === 'websearch') this.setWebsearch(false);
      else if (key === 'research') {
        this.researchActive = false;
        this._toggleSwitch('sheet-research', false);
        this.updatePlaceholder();
        this.syncModes();
      }
    };
    paintSlot();
    const skillPill = $('header-skill-pill');
    const paintSkill = () => {
      if (!skillPill) return;
      const current = skill.all[skill.get()];
      skillPill.textContent = (current ? current.label : 'Umum') + ' \u25BE';
    };
    const skillList = $('skill-list');
    if (skillList && !skillList.dataset.ready) {
      skillList.dataset.ready = '1';
      Object.keys(skill.all).forEach((id) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'model-item';
        const title = document.createElement('strong');
        title.textContent = skill.all[id].label;
        const note = document.createElement('small');
        note.textContent = skill.all[id].help || '';
        btn.appendChild(title);
        btn.appendChild(note);
        btn.onclick = () => {
          skill.set(id);
          paintSkill();
          sheets.close();
          toast.show('Keahlian: ' + skill.all[id].label);
        };
        skillList.appendChild(btn);
      });
    }
    if (skillPill) skillPill.onclick = () => {
      const box = $('skill-sheet');
      if (!box) return;
      box.hidden = false;
      $('sheet-backdrop').classList.add('show');
    };
    paintSkill();
    const modelBtn = $('btn-model');
    if (modelBtn) modelBtn.onclick = () => sheets.openModel();
    const quickWeb = $('btn-quick-web');
    if (quickWeb) quickWeb.onclick = () => {
      if (this.researchActive) {
        this.researchActive = false;
        this._toggleSwitch('sheet-research', false);
      }
      this.setWebsearch(!this.websearchActive);
    };
    const quickResearch = $('btn-quick-research');
    if (quickResearch) quickResearch.onclick = () => {
      this.researchActive = !this.researchActive;
      this._toggleSwitch('sheet-research', this.researchActive);
      this.paintQuick();
      this.syncModes();
    };
    const quickSlide = $('btn-quick-slide');
    if (quickSlide) quickSlide.onclick = () => {
      this.slideActive = !this.slideActive;
      this.paintQuick();
      toast.show(this.slideActive ? 'Mode Slide (.pptx) aktif' : 'Mode slide mati');
    };
    const websearchCard = $('sheet-websearch');
    if (websearchCard) {
      websearchCard.onclick = () => {
        this.setWebsearch(!this.websearchActive);
      };
    }
    const researchCard = $('sheet-research');
    if (researchCard) researchCard.onclick = () => {
      this.researchActive = !this.researchActive;
      this._toggleSwitch('sheet-research', this.researchActive);
      if (this.researchActive && hemat.enabled()) hemat.toggle();
      this.paintQuick();
      if (this.researchActive) this.setWebsearch(true);
      else this.syncModes();
    };
    const linkProjectToSession = (p) => {
      workspace.setCurrent(p.id);
      const sess = this.ensure();
      sess.projectId = p.id;
      sess.project = { goal: p.name, started: Date.now() };
      store.save();
      const label = $('sheet-project-label');
      if (label) label.textContent = 'Proyek aktif: ' + p.name;
      const bar = document.getElementById('thread-bar');
      if (bar) {
        bar.hidden = false;
        bar.textContent = 'Proyek aktif: ' + p.name;
      }
      toast.show('Proyek aktif: ' + p.name);
      sheets.close();
    };
    const paintProjects = () => {
      const ul = $('project-list');
      if (!ul) return;
      ul.innerHTML = '';
      const list = workspace.list();
      if (!list.length) {
        const templates = ['Riset akademik', 'Pengembangan web', 'Naskah', 'Dokumen bisnis'];
        templates.forEach((tplName) => {
          const li = document.createElement('li');
          li.textContent = '+ Template: ' + tplName;
          li.onclick = () => {
            const created = workspace.findByName(tplName) || workspace.create(tplName);
            linkProjectToSession(created);
          };
          ul.appendChild(li);
        });
        return;
      }
      list.forEach((p) => {
        const li = document.createElement('li');
        li.textContent = p.name + (workspace.currentId() === p.id ? ' · aktif' : '');
        li.onclick = () => linkProjectToSession(p);
        ul.appendChild(li);
      });
    };
    const openProjectQuickSheet = () => {
      sheets.close();
      paintProjects();
      sheets.openProject();
    };
    const projectCard = $('sheet-project');
    if (projectCard) projectCard.onclick = () => openProjectQuickSheet();
    const sideProj = $('btn-project');
    if (sideProj) sideProj.onclick = () => { drawer.close(); projectPage.open(); };
    const makeP = $('project-create');
    if (makeP) makeP.onclick = () => {
      const inpName = $('project-name');
      const name = ((inpName || {}).value || '').trim();
      if (!name) {
        toast.show('Ketik nama proyek baru terlebih dahulu');
        if (inpName) inpName.focus();
        return;
      }
      const found = workspace.findByName(name) || workspace.create(name);
      if (inpName) inpName.value = '';
      linkProjectToSession(found);
    };
    const voiceCard = $('sheet-voice');
    if (voiceCard) voiceCard.onclick = () => { sheets.close(); voice.listen(); };
    const slideCard = $('sheet-slide');
    if (slideCard) {
      slideCard.onclick = () => {
        this.slideActive = !this.slideActive;
        this.paintQuick();
        toast.show(this.slideActive ? 'Mode Slide (.pptx) aktif — ketik topik presentasi Anda' : 'Mode slide mati');
      };
    }
    $('btn-login').onclick = () => {
      drawer.close();
      if (auth.state) {
        router.go('settings');
      } else {
        googleAuth.ensure();
        router.go('login');
      }
    };
  },
};

export function groundBugShot(box, elements) {
  return groundScreenshot(box, elements);
}
