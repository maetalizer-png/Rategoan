import { memoryIndex } from '../../raget-memory/memory-index.js';
import { memoryLong } from '../../raget-memory/memory-long.js';
import { ragetDb } from '../../raget-database/raget-db.js';
import { formatter } from '../formatter.js';
import { exportFormats } from '../../../vault/export/formats.js';
import { exportShare } from '../../../vault/export/share.js';
import { remindersStore } from '../../../vault/reminders/reminders-store.js';
import { calendarStore } from '../../../vault/calendar/calendar-store.js';
import { lazyModules } from '../lazy-modules.js';
import {meaningfulWords} from '../../../shared/text.js';
import { quality } from '../quality.js';
import { dailyBriefing } from '../daily-briefing.js';
import { collectionStore } from '../../raget-memory/collection-store.js';
import { feedbackStore } from '../../raget-memory/feedback-store.js';
import { collectionSearch } from '../../raget-memory/collection-search.js';
import { devlogIndex } from '../../raget-devlog/index.js';

export function extractiveSummary(text) {
  const sentences = String(text || '')
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (!sentences.length) return { points: [], gist: '' };
  const freq = {};
  const sentWords = sentences.map((s) => {
    const words = meaningfulWords(s);
    words.forEach((w) => {
      freq[w] = (freq[w] || 0) + 1;
    });
    return words;
  });
  const scored = sentences.map((s, i) => ({
    sentence: s,
    index: i,
    score: sentWords[i].reduce((acc, w) => acc + freq[w], 0),
  }));
  const count = Math.min(sentences.length, Math.max(3, Math.min(5, Math.ceil(sentences.length / 2))));
  const top = scored.slice().sort((a, b) => b.score - a.score).slice(0, count);
  const points = top.slice().sort((a, b) => a.index - b.index).map((s) => s.sentence);
  const gist = scored.slice().sort((a, b) => b.score - a.score)[0].sentence;
  return { points, gist };
}

export function bodyOrSentences(item) {
  if (item.body) {
    const lines = item.body
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.startsWith('-'))
      .map((l) => l.replace(/^-\s*/, ''));
    if (lines.length) return lines;
  }
  return extractiveSummary(item.text || '').points;
}

export function ringkas(text) {
  const src = String(text || '')
    .replace(/^ringkas(kan)?\s*:?\s*/i, '')
    .trim();
  if (!src) return 'Tidak ada teks untuk diringkas.';
  const { points, gist } = extractiveSummary(src);
  if (!points.length) return 'Ringkasan: ' + src;
  return formatter.blocks([formatter.h('Ringkasan', 3), formatter.bullets(points), 'Intinya: ' + gist]);
}

export const FILE_QA_TRIGGER_RE = /^(apa\s+isi|ringkas(kan)?|rangkum(kan)?|jelaskan|ceritakan)\b/i;
export const FILE_QA_FILLER_RE = /\b(isi|isinya|file|dokumen|ini|itu|nya|dong|dari|tentang|soal)\b/gi;

// Pertanyaan kayak "ringkas isi file ini" atau "apa isi file ini" itu
// generik (mau ringkasan keseluruhan), beda dari "berapa anggaran
// pemasaran" yang spesifik. Deteksinya: kalau setelah kata pemicu
// (ringkas/jelaskan/dst) DAN semua kata pengisi umum (isi/file/ini/dst)
// dibuang, sisa kalimatnya kosong - berarti tidak ada topik spesifik yang
// ditanya, jadi anggap generik. Regex lama cuma cocok pola persis
// "ringkas isi file ini" tanpa variasi urutan kata, gagal buat
// "ringkas isi file ini" yang justru salah satu contoh paling umum.
export function isGenericFileQuestion(q) {
  if (!FILE_QA_TRIGGER_RE.test(q)) return false;
  const cleaned = q
    .replace(FILE_QA_TRIGGER_RE, '')
    .replace(FILE_QA_FILLER_RE, '')
    .replace(/[^\p{L}\p{N}\s]/gu, '')
    .trim();
  return cleaned.length === 0;
}

// File yang dilampirkan cuma dibaca ke memori (FileReader) tapi isinya gak
// pernah dipakai jawab apa pun - lampiran cuma jadi chip nama file doang.
// Fungsi ini yang menyambungkan: kalau pertanyaannya generik ("apa isi file
// ini") pakai ringkas() ekstraktif yang sudah ada, kalau spesifik cari
// paragraf paling cocok lewat overlap kata kunci sederhana (bukan makna
// semantik - Rategoan gak punya model bahasa buat itu, tapi cukup buat
// nemuin bagian relevan di file teks biasa).
export function fileQa(fileText, fileName, question) {
  const text = String(fileText || '').trim();
  const name = fileName || 'file';
  if (!text) return 'File "' + name + '" kosong atau isinya tidak bisa dibaca sebagai teks.';
  const q = String(question || '').trim();
  if (!q || isGenericFileQuestion(q)) {
    return 'Ringkasan isi "' + name + '":\n\n' + ringkas(text);
  }
  const paras = text.split(/\n{2,}/).map((p) => p.trim()).filter((p) => p.length > 5);
  const qWords = q
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2);
  if (!qWords.length || !paras.length) {
    return 'Ringkasan isi "' + name + '":\n\n' + ringkas(text);
  }
  let best = null;
  let bestScore = 0;
  for (const p of paras) {
    const pl = p.toLowerCase();
    let score = 0;
    for (const w of qWords) if (pl.includes(w)) score++;
    if (score > bestScore) {
      bestScore = score;
      best = p;
    }
  }
  if (!best) {
    return (
      'Tidak nemu bagian yang cocok soal itu di "' + name + '". ' +
      'Coba tanya dengan kata kunci lain, atau minta "ringkas file ini".'
    );
  }
  return 'Dari "' + name + '":\n\n' + best;
}

export function ringkasPercakapan(messages) {
  const recent = (Array.isArray(messages) ? messages : []).slice(-10).filter((m) => m.role === 'user');
  if (!recent.length) return 'Belum ada percakapan untuk diringkas.';
  const joined = recent.map((m) => m.text).join('. ');
  const { points, gist } = extractiveSummary(joined);
  if (!points.length) return 'Belum ada percakapan untuk diringkas.';
  return formatter.blocks([formatter.h('Ringkasan Percakapan', 3), formatter.bullets(points), 'Intinya: ' + gist]);
}

export async function cari(query) {
  const q = String(query || '').trim();
  if (!q) return 'Mau cari info tentang apa?';
  const results = await memoryIndex.search(q, 3);
  if (!results.length) return 'Saya belum punya catatan soal "' + q + '". Coba ceritakan, nanti saya ingat.';
  return results.map((r) => String(r.text || '').trim()).filter(Boolean).join('\n\n');
}

export async function cariSemua(query) {
  const q = String(query || '').trim();
  if (!q) return 'Mau cari apa di semua sumber?';
  const words = meaningfulWords(q.toLowerCase());
  const groups = [];

  const noteResults = await ragetDb.search(q, 5);
  if (noteResults.length) groups.push({ source: 'Riwayat Chat', items: noteResults.map((n) => n.question + ' — ' + n.answer.slice(0, 80)) });

  const collectionItems = await collectionStore.allItems();
  const collectionResults = collectionSearch.fuzzySearch(collectionItems, q, 5);
  if (collectionResults.length) groups.push({ source: 'Koleksi', items: collectionResults.map((r) => r.item.text.slice(0, 100)) });

  const knowledgeResults = await memoryIndex.search(q, 5);
  if (knowledgeResults.length) groups.push({ source: 'Pengetahuan', items: knowledgeResults.map((r) => r.text.slice(0, 100)) });

  const reminderResults = remindersStore.allActive().filter((r) => words.some((w) => r.action.toLowerCase().includes(w)));
  if (reminderResults.length) groups.push({ source: 'Pengingat', items: reminderResults.map((r) => r.action + ' (' + new Date(r.timestamp).toLocaleString('id-ID') + ')') });

  const calendarResults = calendarStore.eventsBetween(0, Date.now() + 365 * 24 * 60 * 60 * 1000).filter((e) => words.some((w) => (e.summary || '').toLowerCase().includes(w)));
  if (calendarResults.length) groups.push({ source: 'Kalender', items: calendarResults.map((e) => e.summary + ' (' + new Date(e.start).toLocaleString('id-ID') + ')') });

  const pdfStore = await lazyModules.getPdfStore();
  const pdfResults = await pdfStore.search(q, 5);
  if (pdfResults.length) groups.push({ source: 'PDF', items: pdfResults.map((r) => (r.title || 'PDF') + ' — ' + r.text.slice(0, 80)) });

  const notionStore = await lazyModules.getNotionStore();
  const notionResults = await notionStore.search(q, 5);
  if (notionResults.length) groups.push({ source: 'Notion', items: notionResults.map((r) => (r.title || 'Notion') + ' — ' + r.text.slice(0, 80)) });

  const evernoteStore = await lazyModules.getEvernoteStore();
  const evernoteResults = await evernoteStore.search(q, 5);
  if (evernoteResults.length) groups.push({ source: 'Evernote', items: evernoteResults.map((r) => (r.title || 'Evernote') + ' — ' + r.text.slice(0, 80)) });

  const whatsappStore = await lazyModules.getWhatsappStore();
  const whatsappResults = await whatsappStore.search(q, 5);
  if (whatsappResults.length) groups.push({ source: 'WhatsApp', items: whatsappResults.map((r) => r.text.slice(0, 80)) });

  if (!groups.length) return 'Tidak ditemukan apa pun terkait "' + q + '" di semua sumber (riwayat, pengetahuan, pengingat, kalender, PDF, Notion, Evernote, WhatsApp).';

  const parts = [formatter.h('Hasil pencarian: "' + q + '"', 3)];
  groups.slice(0, 10).forEach((g) => {
    parts.push(formatter.bold(g.source));
    parts.push(formatter.bullets(g.items.slice(0, 3)));
  });
  return formatter.blocks(parts);
}

export async function cariKoleksi(query) {
  const q = String(query || '').trim();
  if (!q) {
    const items = await collectionStore.allItems();
    if (!items.length) return 'Koleksi kamu masih kosong. Simpan pesan dengan chip "Simpan" untuk mulai.';
    return 'Koleksi kamu punya ' + items.length + ' item tersimpan. Buka Koleksi lewat menu samping untuk melihatnya.';
  }
  const items = await collectionStore.allItems();
  const results = collectionSearch.fuzzySearch(items, q, 5);
  if (!results.length) return 'Tidak ada yang tersimpan di Koleksi soal "' + q + '".';
  const parts = [formatter.h('Dari koleksi kamu soal "' + q + '"', 3)];
  parts.push(formatter.bullets(results.map((r) => r.item.text.slice(0, 100))));
  return formatter.blocks(parts);
}

export function ingat(text) {
  const fact = String(text || '')
    .replace(/^ingat\s*(bahwa)?\s*/i, '')
    .trim();
  if (!fact) return 'Mau saya ingat apa?';
  memoryLong.rememberNote(fact);
  return 'Baik, saya ingat: "' + fact + '".';
}

export function lupakan(text) {
  const fact = String(text || '')
    .replace(/^lupakan\s*/i, '')
    .trim();
  if (!fact) return 'Mau saya lupakan yang mana?';
  return memoryLong.forgetNote(fact) ? 'Sudah saya lupakan soal "' + fact + '".' : 'Saya tidak menemukan catatan soal "' + fact + '".';
}

export function textOverlapRatio(a, b) {
  const wa = new Set(meaningfulWords(String(a || '').toLowerCase()));
  const wb = new Set(meaningfulWords(String(b || '').toLowerCase()));
  if (!wa.size || !wb.size) return 0;
  let common = 0;
  wa.forEach((w) => { if (wb.has(w)) common++; });
  return common / Math.min(wa.size, wb.size);
}

export async function laporanOtak() {
  const notes = await ragetDb.allNotes();
  if (!notes.length) return 'Belum ada percakapan tercatat untuk dianalisis.';

  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const notesWeek = notes.filter((n) => n.time >= weekAgo);

  const byIntent = new Map();
  notes.forEach((n) => {
    const key = n.intent || 'generic';
    if (!byIntent.has(key)) byIntent.set(key, { total: 0, rated: 0, positive: 0 });
    const s = byIntent.get(key);
    s.total++;
    if (n.feedback != null) {
      s.rated++;
      if (n.feedback) s.positive++;
    }
  });
  const confidencePerIntent = Array.from(byIntent.entries())
    .map(([intent, s]) => ({ intent, total: s.total, akurasi: s.rated ? Math.round((s.positive / s.rated) * 100) : null }))
    .filter((x) => x.akurasi != null)
    .sort((a, b) => a.akurasi - b.akurasi);

  const autoFewshotCandidates = notes.filter((n) => n.feedback === true).slice(-5);

  const gapCounts = new Map();
  notes.forEach((n) => {
    if (n.intent !== 'chat_terbuka' && n.intent !== 'generic') return;
    const key = meaningfulWords(n.question.toLowerCase()).slice(0, 3).join(' ');
    if (!key) return;
    gapCounts.set(key, (gapCounts.get(key) || 0) + 1);
  });
  const gapWishlist = Array.from(gapCounts.entries())
    .filter(([, count]) => count >= 2)
    .map(([topic]) => topic);

  const dedupPairs = [];
  for (let i = 0; i < notes.length && dedupPairs.length < 5; i++) {
    for (let j = i + 1; j < notes.length && dedupPairs.length < 5; j++) {
      if (textOverlapRatio(notes[i].question, notes[j].question) > 0.8) {
        dedupPairs.push(notes[i].question + ' ~ ' + notes[j].question);
      }
    }
  }

  const qualityResult = await quality.evaluate();
  const collStats = await collectionStore.stats();
  const fbStats = feedbackStore.stats();
  const fbColumn = fbStats.total
    ? Math.round(fbStats.rate * 100) + '% (up=' + fbStats.up + ', down=' + fbStats.down + ', n=' + fbStats.total + ')'
    : 'belum ada rating (n=0, A blended memakai default 70%)';

  const parts = [
    formatter.h('Laporan Otak Raget', 3),
    'Total percakapan tercatat: ' + notes.length + ' (' + notesWeek.length + ' minggu ini).',
    formatter.bold('Skor Kualitas: ' + qualityResult.score + '/100'),
    formatter.bullets([
      'Akurasi (A): ' + qualityResult.breakdown.A + '% (n=' + qualityResult.n.A + ')',
      'A (feedbackStore): ' + fbColumn,
      'Kekayaan (K): ' + qualityResult.breakdown.K + '% (n=' + qualityResult.n.K + ')',
      'Keunikan (U): ' + qualityResult.breakdown.U + '% (n=' + qualityResult.n.U + ')',
      'Diversitas (D): ' + qualityResult.breakdown.D + '% (n=' + qualityResult.n.D + ')',
      'Variasi struktur (V): ' + qualityResult.breakdown.V + '% (n=' + qualityResult.n.V + ')',
    ]),
    formatter.bold('Koleksi: ' + collStats.total + ' item (' + collStats.pinned + ' dipin)'),
    ...(collStats.topTags.length ? [formatter.bullets(collStats.topTags.map((t) => 'Tag "' + t.tag + '": ' + t.count + ' item'))] : []),
  ];

  if (confidencePerIntent.length) {
    parts.push(formatter.h('Intent Terlemah (akurasi per folder/intent)', 3));
    parts.push(formatter.bullets(confidencePerIntent.slice(0, 5).map((x) => x.intent + ': ' + x.akurasi + '% (' + x.total + ' kasus)')));
  }

  if (gapWishlist.length) {
    parts.push(formatter.h('Gap Wishlist (topik sering ditanya tanpa data)', 3));
    parts.push(formatter.bullets(gapWishlist));
  }

  if (dedupPairs.length) {
    parts.push(formatter.h('Kandidat Dedup/Merge', 3));
    parts.push(formatter.bullets(dedupPairs));
  }

  if (autoFewshotCandidates.length) {
    parts.push(formatter.h('Kandidat Auto-Fewshot (rating positif)', 3));
    parts.push(formatter.bullets(autoFewshotCandidates.map((n) => n.question)));
  }

  const latestRonde = devlogIndex.latest();
  parts.push(formatter.h('Memori Pengembangan', 3));
  parts.push(
    'Tercatat ' + devlogIndex.all().length + ' ronde pengembangan, ' + devlogIndex.totalKomit() +
    ' commit. Ronde terakhir: ' + latestRonde.judul + ' (' + latestRonde.tanggal + '). Tanya "sejarahmu" atau "cara kerjamu" untuk detail.'
  );

  parts.push(formatter.h('Rekomendasi', 3));
  const rekomendasi = [];
  if (confidencePerIntent.length) rekomendasi.push('Prioritaskan penambahan data untuk intent dengan akurasi terendah.');
  if (gapWishlist.length) rekomendasi.push('Tambahkan data dataries untuk topik di gap wishlist.');
  if (!rekomendasi.length) rekomendasi.push('Belum ada rekomendasi mendesak, data dan akurasi masih sehat.');
  parts.push(formatter.bullets(rekomendasi));

  return formatter.blocks(parts);
}

export function exportChat(session, format) {
  const s = session || { title: 'Chat', messages: [] };
  const stamp = new Date().toISOString().slice(0, 10);
  const base = 'raget-chat-' + stamp;
  if (format === 'markdown' || format === 'md') {
    exportShare.downloadBlob(exportFormats.toMarkdown(s), 'text/markdown', base + '.md');
    return 'Chat diunduh sebagai Markdown (' + base + '.md).';
  }
  if (format === 'json') {
    exportShare.downloadBlob(exportFormats.toJSON(s), 'application/json', base + '.json');
    return 'Chat diunduh sebagai JSON (' + base + '.json).';
  }
  if (format === 'pdf') {
    const opened = exportShare.openPrintable(exportFormats.toPrintableHTML(s));
    return opened
      ? 'Tab baru dibuka berisi chat siap cetak. Tekan Ctrl+P / Cmd+P lalu pilih "Simpan sebagai PDF".'
      : 'Popup diblokir browser. Coba izinkan popup lalu ulangi.';
  }
  exportShare.downloadBlob(exportFormats.toTXT(s), 'text/plain', base + '.txt');
  return 'Chat diunduh sebagai TXT (' + base + '.txt).';
}

export function shareToWhatsApp(session) {
  const s = session || { title: 'Chat', messages: [] };
  const text = exportFormats.toTXT(s).slice(0, 4000);
  exportShare.whatsappShareText(text);
  return 'Membuka WhatsApp dengan isi percakapan siap dibagikan.';
}

export async function ringkasHari() {
  const events = dailyBriefing.eventsToday();
  const reminders = dailyBriefing.remindersToday();
  const notes = (await ragetDb.allNotes()).slice(-3);
  const items = [];
  events.forEach((e) => items.push('Acara: ' + e.summary));
  reminders.forEach((r) => items.push('Pengingat: ' + r.action));
  notes.forEach((n) => items.push('Catatan: ' + n.question));
  if (!items.length) items.push('Belum ada acara, pengingat, atau catatan untuk hari ini.');
  return formatter.formatByType('daftar', { title: 'Ringkasan Hari Ini', items });
}
