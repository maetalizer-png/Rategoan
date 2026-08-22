import { devlogIndex } from '../raget-devlog/index.js';

const DEVLOG_KINDS = new Set([
  'devlog_sejarah',
  'devlog_cara_kerja',
  'devlog_jilid',
  'devlog_bug_tersulit',
  'devlog_pembuat',
  'devlog_skor',
]);

function handles(kind) {
  return DEVLOG_KINDS.has(kind);
}

function replySejarah() {
  const all = devlogIndex.all();
  const latest = devlogIndex.latest();
  const lines = all.slice(-5).map((e) => '- ' + e.judul + ' (' + e.tanggal + ')');
  return (
    'Riwayat pengembangan saya tercatat di ' + all.length + ' entri devlog, ' + devlogIndex.totalKomit() + ' commit sejak awal.\n\n' +
    'Lima ronde terbaru:\n' + lines.join('\n') + '\n\n' +
    'Ronde paling baru: ' + latest.judul + '. Sumber: raget-devlog/sejarah/.'
  );
}

function replyCaraKerja() {
  return (
    'Saya (Raget) adalah mesin template/rule-based, bukan model bahasa besar — 100% berjalan lokal di perangkat kamu, tanpa server dan tanpa API key.\n\n' +
    'Alur jawab: pola pesan dicocokkan lewat router intent, lalu dicoba berurutan lewat tool khusus (matematika, pengingat, impor), jawaban faktual dari dataries (data terstruktur negara/wisata/tokoh/dll), pencarian retrieval satu pintu (TF-IDF) di catatan & pengetahuan tersimpan, dan mesin template lokal sebagai fallback terakhir.\n\n' +
    'Sumber: raget-devlog/jsonl/arsitektur.jsonl (retrieval satu pintu, Jilid 13) dan refactor agent.js/dataries-bridge.js (Trisula Final v2).'
  );
}

function extractJilidNeedle(prompt) {
  const t = String(prompt || '');
  const m = t.match(/\b(?:jilid|ronde)\s+([\w.-]+)/i);
  return m ? m[1] : '';
}

function replyJilid(prompt) {
  const needle = extractJilidNeedle(prompt);
  if (!needle) return 'Sebut nama atau nomor jilid/ronde yang kamu maksud, mis. "jilid 13 ngapain" atau "ronde trisula ngapain".';
  const found = devlogIndex.byId(needle) || devlogIndex.search(needle)[0];
  if (!found) {
    return 'Saya tidak menemukan catatan devlog untuk "' + needle + '". Coba sebut nama ronde yang lebih spesifik, mis. "jilid 13" atau "trisula final v2".';
  }
  const fitur = (found.fitur_baru || []).slice(0, 4);
  return (
    found.judul + ' (' + found.tanggal + ')\n\n' +
    found.ringkasan +
    (fitur.length ? '\n\nFitur baru: ' + fitur.join('; ') + '.' : '') +
    '\n\nSumber: commit ' + (found.komit || []).join(', ') + '.'
  );
}

function replyBugTersulit() {
  const bugs = devlogIndex.allBugs();
  if (!bugs.length) return 'Belum ada catatan bug di devlog.';
  const top = [...bugs].sort((a, b) => b.bug.length - a.bug.length)[0];
  return (
    'Bug paling rumit yang tercatat di devlog saya:\n\n"' + top.bug + '"\n\n' +
    'Ditemukan & ditutup di ronde: ' + top.judul + '. Sumber: raget-devlog/jsonl/bug.jsonl.'
  );
}

function replyPembuat() {
  return (
    'Saya (Raget) dibuat dan dikembangkan lewat serangkaian ronde kerja yang terdokumentasi penuh — bukan sekali jadi, tapi proses iteratif yang tercatat di raget-devlog/sejarah (' +
    devlogIndex.all().length +
    ' entri ronde, dari commit awal sampai sekarang). Setiap fitur dan bug punya jejak commit-nya sendiri.'
  );
}

function replySkor() {
  const latest = devlogIndex.latest();
  const kpi = latest.kpi || {};
  const lines = Object.entries(kpi).map(([k, v]) => '- ' + k + ': ' + v);
  return (
    'Perkembangan skor kualitas saya dari ronde ke ronde tercatat di devlog. Data dari ronde terakhir (' + latest.judul + '):\n\n' +
    (lines.length ? lines.join('\n') : 'Belum ada KPI tercatat untuk ronde ini.') +
    '\n\nUntuk skor real-time sesi ini, coba ketik "laporan otak".'
  );
}

async function run(kind, prompt) {
  if (kind === 'devlog_sejarah') return replySejarah();
  if (kind === 'devlog_cara_kerja') return replyCaraKerja();
  if (kind === 'devlog_jilid') return replyJilid(prompt);
  if (kind === 'devlog_bug_tersulit') return replyBugTersulit();
  if (kind === 'devlog_pembuat') return replyPembuat();
  if (kind === 'devlog_skor') return replySkor();
  return null;
}

export const toolsDevlog = Object.freeze({ handles, run });
