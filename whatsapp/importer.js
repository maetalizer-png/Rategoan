const WA_LINE_RE = /^\[?(\d{1,2}\/\d{1,2}\/\d{2,4}),?\s+(\d{1,2}[:.]\d{2}(?:[:.]\d{2})?(?:\s?[AaPp][Mm])?)\]?\s*-?\s*([^:]+):\s*(.+)$/;
const GAP_MS = 5 * 60 * 1000;

function parseTimestamp(dateStr, timeStr) {
  const parts = dateStr.split('/').map(Number);
  const d = parts[0];
  const m = parts[1];
  const yRaw = parts[2];
  const y = yRaw < 100 ? 2000 + yRaw : yRaw;
  const cleanTime = timeStr.replace(/\s?[AaPp][Mm]/, '').replace('.', ':');
  const timeParts = cleanTime.split(':').map(Number);
  const isPM = /pm/i.test(timeStr);
  let h = timeParts[0];
  if (isPM && h < 12) h += 12;
  const min = timeParts[1] || 0;
  const s = timeParts[2] || 0;
  return new Date(y, m - 1, d, h, min, s).getTime();
}

function importWhatsApp(text) {
  const lines = String(text || '').split('\n');
  const messages = [];
  let current = null;
  lines.forEach((line) => {
    const m = line.match(WA_LINE_RE);
    if (m) {
      if (current) messages.push(current);
      const time = parseTimestamp(m[1], m[2]);
      current = { time: isNaN(time) ? Date.now() : time, sender: m[3].trim(), text: m[4].trim() };
    } else if (current && line.trim()) {
      current.text += '\n' + line.trim();
    }
  });
  if (current) messages.push(current);

  if (!messages.length) {
    return { ok: false, message: 'Tidak ditemukan format pesan WhatsApp yang dikenali di file ini.' };
  }

  const groups = [];
  let group = [];
  messages.forEach((msg) => {
    if (group.length && msg.time - group[group.length - 1].time > GAP_MS) {
      groups.push(group);
      group = [];
    }
    group.push(msg);
  });
  if (group.length) groups.push(group);

  const chunks = groups.map((g) => ({
    text: g.map((m) => m.sender + ': ' + m.text).join('\n').slice(0, 4000),
    start: g[0].time,
    end: g[g.length - 1].time,
    participants: Array.from(new Set(g.map((m) => m.sender))),
  }));

  return { ok: true, chunks, messageCount: messages.length };
}

export const whatsappImporter = Object.freeze({ importWhatsApp });
