import { icsParser } from '../../vault/calendar/ics-parser.js';
import { calendarStore } from '../../vault/calendar/calendar-store.js';
import { datariesBridge } from './dataries-bridge.js';

function formatEventTime(timestamp) {
  return new Date(timestamp).toLocaleString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });
}

function tryCalendarImport(messages) {
  const list = Array.isArray(messages) ? messages : [];
  const last = list[list.length - 1];
  const att = last && last.attach;
  if (!att || !att.fileText || !/\.ics$/i.test(att.name || '')) return null;
  const events = icsParser.parseICS(att.fileText);
  if (!events.length) return 'File .ics dibaca tapi tidak ada acara yang ditemukan di dalamnya.';
  const count = calendarStore.addAll(events);
  return 'Berhasil impor ' + count + ' acara dari file kalender.';
}

function tryCalendarQuery(text) {
  const t = text.trim().toLowerCase();
  if (/jadwal\s+hari\s+ini|apa\s+jadwal\s+hari\s+ini/.test(t)) {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    const events = calendarStore.eventsBetween(start.getTime(), end.getTime());
    if (!events.length) return 'Tidak ada jadwal untuk hari ini.';
    return 'Jadwal hari ini:\n' + events.map((e) => '- ' + e.summary + ' (' + formatEventTime(e.start) + ')').join('\n');
  }
  if (/jadwal\s+minggu\s+ini/.test(t)) {
    const start = new Date();
    const end = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);
    const events = calendarStore.eventsBetween(start.getTime(), end.getTime());
    if (!events.length) return 'Tidak ada jadwal untuk minggu ini.';
    return 'Jadwal minggu ini:\n' + events.map((e) => '- ' + e.summary + ' (' + formatEventTime(e.start) + ')').join('\n');
  }
  if (/kapan\s+.*(meeting|rapat|acara|jadwal)\s+(selanjutnya|berikutnya)/.test(t)) {
    const next = calendarStore.nextUpcoming(Date.now());
    if (!next) return 'Belum ada jadwal mendatang yang tercatat.';
    return 'Acara selanjutnya: ' + next.summary + ' pada ' + formatEventTime(next.start) + '.';
  }
  return null;
}

async function tryIndependenceDay(text) {
  const m = text.toLowerCase().match(/berapa\s+hari\s+lagi\s+(.+?)\s+merdeka/);
  if (!m) return null;
  return await datariesBridge.daysUntilIndependence(m[1].trim());
}

export const toolsTemporal = Object.freeze({
  tryCalendarImport,
  tryCalendarQuery,
  tryIndependenceDay,
});
