import { memoryLong } from '../../raget-memory/memory-long.js';
import { ragetDb } from '../../raget-database/raget-db.js';
import { formatter } from '../formatter.js';
import { exportShare } from '../../../vault/export/share.js';
import { dailyBriefing } from '../daily-briefing.js';
import { dataries } from '../dataries-registry.js';
import { textOverlapRatio } from './tool-executor.js';

export const DEDUP_OVERLAP_THRESHOLD = 0.8;

export async function bersihkanDuplikat() {
  const notes = await ragetDb.allNotes();
  const toRemove = new Set();
  for (let i = 0; i < notes.length; i++) {
    if (toRemove.has(notes[i].id)) continue;
    for (let j = i + 1; j < notes.length; j++) {
      if (toRemove.has(notes[j].id)) continue;
      if (textOverlapRatio(notes[i].question, notes[j].question) > DEDUP_OVERLAP_THRESHOLD) {
        const older = notes[i].time <= notes[j].time ? notes[i] : notes[j];
        toRemove.add(older.id);
      }
    }
  }
  if (!toRemove.size) return 'Tidak ada percakapan duplikat yang perlu dibersihkan.';
  const removed = await ragetDb.removeByIds(Array.from(toRemove));
  return 'Selesai! ' + removed + ' percakapan duplikat/mirip sudah dibersihkan, versi terbaru tetap disimpan.';
}

export async function ringkasMinggu() {
  const events = dailyBriefing.eventsThisWeek();
  const reminders = dailyBriefing.remindersThisWeek();
  const { start } = dailyBriefing.weekRange();
  const allNotes = await ragetDb.allNotes();
  const notesThisWeek = allNotes.filter((n) => n.time >= start);
  const items = [];
  items.push('Percakapan minggu ini: ' + notesThisWeek.length);
  if (events.length) items.push('Acara: ' + events.length + ' (' + events.slice(0, 3).map((e) => e.summary).join(', ') + (events.length > 3 ? ', …' : '') + ')');
  if (reminders.length) items.push('Pengingat: ' + reminders.length + ' (' + reminders.slice(0, 3).map((r) => r.action).join(', ') + (reminders.length > 3 ? ', …' : '') + ')');
  const topIntents = new Map();
  notesThisWeek.forEach((n) => topIntents.set(n.intent, (topIntents.get(n.intent) || 0) + 1));
  const sortedIntents = Array.from(topIntents.entries()).sort((a, b) => b[1] - a[1]).slice(0, 3);
  if (sortedIntents.length) items.push('Topik paling sering: ' + sortedIntents.map(([k, v]) => k + ' (' + v + 'x)').join(', '));
  if (!notesThisWeek.length && !events.length && !reminders.length) items.push('Belum ada aktivitas tercatat minggu ini.');
  return formatter.formatByType('daftar', { title: 'Ringkasan Minggu Ini', items });
}

export function fuzzyCountryMatch(a, b) {
  if (!a || !b) return false;
  const x = String(a).toLowerCase();
  const y = String(b).toLowerCase();
  return x === y || x.includes(y) || y.includes(x);
}

export async function bagikanKartu(query) {
  const q = String(query || '').trim();
  if (!q) return 'Kartu negara mana yang mau dibagikan?';
  const [countries, makanan] = await Promise.all([dataries.loadAll('country'), dataries.loadAll('makanan')]);
  const found = countries.find((c) => fuzzyCountryMatch(c.metadata.name, q));
  if (!found) return 'Saya belum punya data negara "' + q + '".';
  const meta = found.metadata;
  const foods = makanan.filter((f) => fuzzyCountryMatch(f.metadata.country, meta.name)).slice(0, 3).map((f) => f.metadata.name);
  const lines = ['🌍 ' + meta.name, '🏛️ Ibukota: ' + (meta.capital || '-'), '💰 Mata uang: ' + (meta.currency || '-')];
  if (foods.length) lines.push('🍽️ Makanan khas: ' + foods.join(', '));
  const card = lines.join('\n');
  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({ text: card });
      return 'Kartu ' + meta.name + ' siap dibagikan.';
    } catch (e) { console.warn('[Rategoan Fallback] agent-tools:', e); }
  }
  try {
    await navigator.clipboard.writeText(card);
    return 'Kartu ' + meta.name + ' disalin ke clipboard:\n\n' + card;
  } catch (e) {
    return card;
  }
}

export async function eksporLog() {
  const notes = await ragetDb.allNotes();
  const blob = new Blob([JSON.stringify(notes, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'raget-log-' + new Date().toISOString().slice(0, 10) + '.json';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 500);
  return 'Log percakapan (' + notes.length + ' entri) sudah diunduh.';
}

export function buildCatatanContent(format) {
  const notes = memoryLong.allNotes();
  const learned = memoryLong.allLearned();
  const facts = memoryLong.allFacts();
  const stamp = new Date().toLocaleString('id-ID');
  if (format === 'markdown') {
    const lines = ['# Catatan Saya', '', '_Diekspor ' + stamp + '_', ''];
    lines.push('## Fakta', '');
    Object.keys(facts).forEach((k) => lines.push('- **' + k + '**: ' + JSON.stringify(facts[k])));
    lines.push('', '## Hal yang Dipelajari', '');
    learned.forEach((f) => lines.push('- ' + f.subject + ': ' + f.value));
    lines.push('', '## Catatan', '');
    notes.forEach((n) => lines.push('- ' + n.text));
    return lines.join('\n');
  }
  const lines = ['Catatan Saya', 'Diekspor ' + stamp, ''];
  lines.push('=== Fakta ===');
  Object.keys(facts).forEach((k) => lines.push(k + ': ' + JSON.stringify(facts[k])));
  lines.push('', '=== Hal yang Dipelajari ===');
  learned.forEach((f) => lines.push(f.subject + ': ' + f.value));
  lines.push('', '=== Catatan ===');
  notes.forEach((n) => lines.push('- ' + n.text));
  return lines.join('\n');
}

export function eksporCatatan(format) {
  const fmt = format === 'markdown' ? 'markdown' : 'txt';
  const content = buildCatatanContent(fmt);
  const stamp = new Date().toISOString().slice(0, 10);
  if (fmt === 'markdown') {
    exportShare.downloadBlob(content, 'text/markdown', 'raget-catatan-' + stamp + '.md');
    return 'Catatan saya diunduh sebagai Markdown (raget-catatan-' + stamp + '.md).';
  }
  exportShare.downloadBlob(content, 'text/plain', 'raget-catatan-' + stamp + '.txt');
  return 'Catatan saya diunduh sebagai TXT (raget-catatan-' + stamp + '.txt).';
}
