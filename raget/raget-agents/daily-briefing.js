import { calendarStore } from '../../vault/calendar/calendar-store.js';
import { remindersStore } from '../../vault/reminders/reminders-store.js';

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

function weekRange(now) {
  const d = now || new Date();
  const start = new Date(d.getFullYear(), d.getMonth(), d.getDate() - 6).getTime();
  const { end } = todayRange(d);
  return { start, end };
}

function eventsThisWeek(now) {
  const { start, end } = weekRange(now);
  return calendarStore.eventsBetween(start, end);
}

function remindersThisWeek(now) {
  const { start, end } = weekRange(now);
  return remindersStore.allActive().filter((r) => r.timestamp >= start && r.timestamp <= end);
}

const GREET_BY_PERIOD = { pagi: 'Selamat pagi', siang: 'Selamat siang', sore: 'Selamat sore', malam: 'Selamat malam' };

function message(now, name) {
  const period = timeOfDay(now);
  const greet = (name ? GREET_BY_PERIOD[period] + ', ' + name : GREET_BY_PERIOD[period]) + '!';
  const { events, reminders } = countToday(now);
  const base = !events && !reminders
    ? greet + ' Hari ini belum ada acara atau pengingat yang tercatat.'
    : greet + ' Hari ini ada ' + [events && events + ' acara', reminders && reminders + ' pengingat'].filter(Boolean).join(' dan ') + '.';
  return period === 'pagi' ? base + ' Mau pemanasan otak dulu? Ketik "kuis".' : base;
}

export const dailyBriefing = Object.freeze({
  message,
  countToday,
  eventsToday,
  remindersToday,
  todayRange,
  weekRange,
  eventsThisWeek,
  remindersThisWeek,
});
