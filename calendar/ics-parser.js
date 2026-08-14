function parseICSDate(raw) {
  const s = String(raw || '').trim();
  const m = s.match(/^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2}))?/);
  if (!m) return null;
  const [, y, mo, d, h, mi, se] = m;
  const iso = y + '-' + mo + '-' + d + 'T' + (h || '00') + ':' + (mi || '00') + ':' + (se || '00');
  const date = new Date(iso + (s.endsWith('Z') ? 'Z' : ''));
  return isNaN(date.getTime()) ? null : date.getTime();
}

function unfoldLines(text) {
  return String(text || '').replace(/\r\n/g, '\n').replace(/\n[ \t]/g, '');
}

function parseICS(text) {
  const unfolded = unfoldLines(text);
  const lines = unfolded.split('\n');
  const events = [];
  let current = null;

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (trimmed === 'BEGIN:VEVENT') {
      current = {};
      return;
    }
    if (trimmed === 'END:VEVENT') {
      if (current && current.summary) events.push(current);
      current = null;
      return;
    }
    if (!current) return;
    const idx = trimmed.indexOf(':');
    if (idx < 0) return;
    const keyPart = trimmed.slice(0, idx).split(';')[0].toUpperCase();
    const value = trimmed.slice(idx + 1);
    if (keyPart === 'SUMMARY') current.summary = value;
    else if (keyPart === 'DTSTART') current.start = parseICSDate(value);
    else if (keyPart === 'DTEND') current.end = parseICSDate(value);
    else if (keyPart === 'LOCATION') current.location = value;
    else if (keyPart === 'DESCRIPTION') current.description = value.replace(/\\n/g, ' ');
  });

  return events.filter((e) => e.start != null);
}

export const icsParser = Object.freeze({
  parseICS,
});
