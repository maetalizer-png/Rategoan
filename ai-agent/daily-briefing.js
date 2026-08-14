import { calendarStore } from '../calendar/calendar-store.js';
import { remindersStore } from '../reminders/reminders-store.js';

function timeOfDay(date) {
  const h = (date || new Date()).getHours();
  if (h >= 4 && h < 10) return 'pagi';
  if (h >= 10 && h < 15) return 'siang';
  if (h >= 15 && h < 18) return 'sore';
  return 'malam';
}

function todayRange(now) {
  const d = now || new Date();
  const start = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const end = start + 24 * 60 * 60 * 1000 - 1;
  return { start, end };
}

function eventsToday(now) {
  const { start, end } = todayRange(now);
  return calendarStore.eventsBetween(start, end);
}

function remindersToday(now) {
  const { start, end } = todayRange(now);
  return remindersStore.allActive().filter((r) => r.timestamp >= start && r.timestamp <= end);
}

function countToday(now) {
  return { events: eventsToday(now).length, reminders: remindersToday(now).length };
}

const GREET_BY_PERIOD = { pagi: 'Selamat pagi!', siang: 'Selamat siang!', sore: 'Selamat sore!', malam: 'Selamat malam!' };

function message(now) {
  const greet = GREET_BY_PERIOD[timeOfDay(now)];
  const { events, reminders } = countToday(now);
  if (!events && !reminders) return greet + ' Hari ini belum ada acara atau pengingat yang tercatat.';
  const parts = [];
  if (events) parts.push(events + ' acara');
  if (reminders) parts.push(reminders + ' pengingat');
  return greet + ' Hari ini ada ' + parts.join(' dan ') + '.';
}

export const dailyBriefing = Object.freeze({
  message,
  countToday,
  eventsToday,
  remindersToday,
  todayRange,
});
