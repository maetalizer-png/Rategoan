import { memoryLong } from '../raget-memory/memory-long.js';
import { reminderParser } from '../vault/reminders/parser.js';
import { remindersStore } from '../vault/reminders/reminders-store.js';
import { reminderScheduler } from '../vault/reminders/scheduler.js';

const REMINDER_CANCEL_RE = /^(batalkan|batal|hapus)\s+(pengingat|reminder)\b/i;
const REMINDER_TRIGGER_RE = /^(ingatkan\s+saya|reminder|jangan\s+lupa)\b/i;
const QUICK_NOTE_RE = /^catat\s+/i;

function formatReminderTime(timestamp) {
  const d = new Date(timestamp);
  return d.toLocaleString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });
}

function tryReminder(text) {
  const t = text.trim();

  if (REMINDER_CANCEL_RE.test(t)) {
    const cancelled = remindersStore.cancelLatest();
    return cancelled ? 'Baik, pengingat "' + cancelled.action + '" sudah dibatalkan.' : 'Tidak ada pengingat aktif untuk dibatalkan.';
  }

  const isReminderTrigger = REMINDER_TRIGGER_RE.test(t) || QUICK_NOTE_RE.test(t);
  if (!isReminderTrigger) return null;

  const parsed = reminderParser.parseReminder(t);
  if (parsed) {
    remindersStore.add(parsed);
    reminderScheduler.requestPermission();
    const recurText = parsed.recur === 'weekly' ? ' (berulang tiap minggu)' : parsed.recur === 'daily' ? ' (berulang tiap hari)' : '';
    return 'Oke, saya ingatkan "' + parsed.action + '" pada ' + formatReminderTime(parsed.timestamp) + recurText + '.';
  }

  if (QUICK_NOTE_RE.test(t)) {
    const note = t.replace(QUICK_NOTE_RE, '').trim();
    if (!note) return null;
    memoryLong.rememberNote(note);
    return 'Baik, saya catat: ' + note + '.';
  }

  return null;
}

export const toolsReminder = Object.freeze({
  REMINDER_TRIGGER_RE,
  QUICK_NOTE_RE,
  tryReminder,
});
