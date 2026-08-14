const DAY_NAMES = ['minggu', 'senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu'];
const PERIOD_HOUR = { pagi: 8, siang: 12, sore: 16, malam: 19 };

const TRIGGER_RE = /^(ingatkan\s+saya\s*(untuk|bahwa)?|reminder\s*(untuk)?|ingat\s*(untuk)?|jangan\s+lupa\s*(untuk)?|catat)\s*/i;

function stripTimePhrase(text, matched) {
  return text.replace(matched, ' ').replace(/\s+/g, ' ').trim();
}

function nextWeekday(base, targetDow) {
  const d = new Date(base);
  let diff = (targetDow - d.getDay() + 7) % 7;
  if (diff === 0) diff = 7;
  d.setDate(d.getDate() + diff);
  return d;
}

function parseReminder(text, now) {
  const raw = String(text || '').trim();
  const t = raw.toLowerCase();
  const base = now || new Date();
  let timestamp = null;
  let recur = null;
  let strippedText = raw;

  const recurMatch = t.match(/setiap\s+(hari|minggu)\s*(senin|selasa|rabu|kamis|jumat|sabtu|minggu)?/i);
  const relMatch = t.match(/(\d+)\s*(menit|jam)\s*lagi/i);
  const besokMatch = t.match(/besok\s*(pagi|siang|sore|malam)?/i);
  const jamMatch = t.match(/jam\s*(\d{1,2})(?:[.:](\d{2}))?\s*(pagi|siang|sore|malam)?/i);
  const tanggalMatch = t.match(/tanggal\s*(\d{1,2})/i);

  if (recurMatch) {
    recur = recurMatch[1] === 'minggu' || recurMatch[2] ? 'weekly' : 'daily';
    const d = new Date(base);
    if (recurMatch[2]) {
      const dow = DAY_NAMES.indexOf(recurMatch[2]);
      const next = nextWeekday(base, dow);
      d.setFullYear(next.getFullYear(), next.getMonth(), next.getDate());
    } else {
      d.setDate(d.getDate() + 1);
    }
    d.setHours(8, 0, 0, 0);
    if (jamMatch) {
      d.setHours(normalizeHour(parseInt(jamMatch[1], 10), jamMatch[3]), parseInt(jamMatch[2] || '0', 10), 0, 0);
    }
    timestamp = d.getTime();
    strippedText = stripTimePhrase(raw, recurMatch[0]);
    if (jamMatch) strippedText = stripTimePhrase(strippedText, jamMatch[0]);
  } else if (relMatch) {
    const n = parseInt(relMatch[1], 10);
    const unit = relMatch[2];
    const ms = unit === 'jam' ? n * 60 * 60 * 1000 : n * 60 * 1000;
    timestamp = base.getTime() + ms;
    strippedText = stripTimePhrase(raw, relMatch[0]);
  } else if (besokMatch) {
    const d = new Date(base);
    d.setDate(d.getDate() + 1);
    const period = besokMatch[1];
    if (jamMatch) {
      d.setHours(normalizeHour(parseInt(jamMatch[1], 10), jamMatch[3]), parseInt(jamMatch[2] || '0', 10), 0, 0);
      strippedText = stripTimePhrase(raw, jamMatch[0]);
    } else {
      d.setHours(PERIOD_HOUR[period] || 8, 0, 0, 0);
    }
    timestamp = d.getTime();
    strippedText = stripTimePhrase(strippedText, besokMatch[0]);
  } else if (tanggalMatch) {
    const day = parseInt(tanggalMatch[1], 10);
    const d = new Date(base);
    d.setDate(day);
    d.setHours(9, 0, 0, 0);
    if (d.getTime() <= base.getTime()) d.setMonth(d.getMonth() + 1);
    timestamp = d.getTime();
    strippedText = stripTimePhrase(raw, tanggalMatch[0]);
  } else if (jamMatch) {
    const d = new Date(base);
    d.setHours(normalizeHour(parseInt(jamMatch[1], 10), jamMatch[3]), parseInt(jamMatch[2] || '0', 10), 0, 0);
    if (d.getTime() <= base.getTime()) d.setDate(d.getDate() + 1);
    timestamp = d.getTime();
    strippedText = stripTimePhrase(raw, jamMatch[0]);
  }

  if (timestamp == null) return null;

  const action = strippedText.replace(TRIGGER_RE, '').replace(/\?+$/, '').trim();
  return { text: raw, action: action || 'pengingat', timestamp, recur };
}

function normalizeHour(hour, period) {
  if (!period) return hour;
  if (period === 'sore' || period === 'malam') return hour < 12 ? hour + 12 : hour;
  return hour;
}

export const reminderParser = Object.freeze({
  parseReminder,
});
