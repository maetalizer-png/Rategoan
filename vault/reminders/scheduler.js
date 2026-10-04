import { remindersStore } from './reminders-store.js';

let intervalId = null;
let onDueCallback = null;

function requestPermission() {
  if (typeof Notification === 'undefined') return Promise.resolve('unsupported');
  if (Notification.permission === 'granted' || Notification.permission === 'denied') {
    return Promise.resolve(Notification.permission);
  }
  return Notification.requestPermission();
}

function notify(reminder) {
  const title = 'Raget — Pengingat';
  const body = 'Waktunya: ' + reminder.action;
  if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
    try {
      new Notification(title, { body });
    } catch (e) { console.warn('[Rategoan Fallback] scheduler:', e); }
  }
  if (onDueCallback) onDueCallback(reminder);
}

function tick() {
  const due = remindersStore.allDue(Date.now());
  due.forEach((r) => {
    notify(r);
    remindersStore.markNotified(r.id);
  });
}

function start(onDue) {
  onDueCallback = onDue || null;
  if (intervalId) return;
  tick();
  intervalId = setInterval(tick, 60000);
}

function stop() {
  if (intervalId) clearInterval(intervalId);
  intervalId = null;
}

export const reminderScheduler = Object.freeze({
  start,
  stop,
  requestPermission,
  tick,
});
