import { devlogIndex } from '../raget-devlog/index.js';

const DEVLOG_KINDS = new Set([
  'devlog_sejarah',
  'devlog_cara_kerja',
  'devlog_jilid',
  'devlog_bug_tersulit',
  'devlog_pembuat',
  'devlog_skor',
]);

const EMPTY = 'Arsip ronde pengembangan tidak disimpan di klien.';

function handles(kind) {
  return DEVLOG_KINDS.has(kind);
}

function entries() {
  if (!devlogIndex || typeof devlogIndex.all !== 'function') return [];
  const rows = devlogIndex.all();
  return Array.isArray(rows) ? rows : [];
}

function replySejarah() {
  const all = entries();
  if (!all.length || typeof devlogIndex.latest !== 'function') return EMPTY;
  const latest = devlogIndex.latest();
  if (!latest) return EMPTY;
  const lines = all.slice(-5).map((e) => '- ' + e.judul + ' (' + e.tanggal + ')');
  const commits = typeof devlogIndex.totalKomit === 'function' ? devlogIndex.totalKomit() : 0;
  return (
    'Riwayat pengembangan saya tercatat di ' + all.length + ' entri devlog, ' + commits + ' commit sejak awal.\n\n' +
    'Lima ronde terbaru:\n' + lines.join('\n') + '\n\n' +
    'Ronde paling baru: ' + latest.judul + '.'
  );
}

function replyCaraKerja() {
  return (
    'Saya (Raget) berjalan di perangkat kamu, tanpa server dan tanpa API key. Jalur obrolan memakai adapter neural; kalau bobot belum termuat, balasan mengatakan itu.\n\n' +
    'Alur jawab: pola pesan dicocokkan lewat router intent, lalu dicoba berurutan lewat tool khusus (matematika, pengingat, impor), jawaban faktual dari dataries (data terstruktur negara/wisata/tokoh/dll), pencarian retrieval satu pintu (TF-IDF) di catatan & pengetahuan tersimpan, dan mesin lokal sebagai cadangan terakhir.'
  );
}

function extractJilidNeedle(prompt) {
  const t = String(prompt || '');
  const m = t.match(/\b(?:jilid|ronde)\s+([\w.-]+)/i);
  return m ? m[1] : '';
}

function replyJilid(prompt) {
  const needle = extractJilidNeedle(prompt);
  if (!needle) return 'Sebut nama atau nomor jilid/ronde yang kamu maksud.';
  if (typeof devlogIndex.byId !== 'function' || typeof devlogIndex.search !== 'function') return EMPTY;
  const found = devlogIndex.byId(needle) || (devlogIndex.search(needle) || [])[0];
  if (!found) return EMPTY;
  const fitur = (found.fitur_baru || []).slice(0, 4);
  return (
    found.judul + ' (' + found.tanggal + ')\n\n' +
    found.ringkasan +
    (fitur.length ? '\n\nFitur baru: ' + fitur.join('; ') + '.' : '') +
    '\n\nSumber: commit ' + (found.komit || []).join(', ') + '.'
  );
}

function replyBugTersulit() {
  if (typeof devlogIndex.allBugs !== 'function') return EMPTY;
  const bugs = devlogIndex.allBugs();
  if (!bugs || !bugs.length) return EMPTY;
  const top = [...bugs].sort((a, b) => b.bug.length - a.bug.length)[0];
  return (
    'Bug paling rumit yang tercatat di devlog saya:\n\n"' + top.bug + '"\n\n' +
    'Ditemukan & ditutup di ronde: ' + top.judul + '.'
  );
}

function replyPembuat() {
  const n = entries().length;
  if (!n) return 'Raget berjalan di perangkat kamu. Arsip ronde pengembangan tidak disimpan di klien.';
  return (
    'Saya (Raget) dibuat dan dikembangkan lewat serangkaian ronde kerja (' +
    n +
    ' entri ronde). Setiap fitur dan bug punya jejak commit-nya sendiri.'
  );
}

function replySkor() {
  if (typeof devlogIndex.latest !== 'function') return EMPTY;
  const latest = devlogIndex.latest();
  if (!latest) return EMPTY;
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
