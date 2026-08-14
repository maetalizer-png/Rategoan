function toMarkdown(session) {
  const lines = ['# ' + (session.title || 'Chat'), ''];
  (session.messages || []).forEach((m) => {
    const who = m.role === 'user' ? 'Anda' : 'Raget';
    const time = new Date(m.time || Date.now()).toLocaleString('id-ID');
    lines.push('**' + who + '** (' + time + ')');
    lines.push('');
    lines.push(m.text || '');
    lines.push('');
  });
  return lines.join('\n');
}

function toTXT(session) {
  const lines = [session.title || 'Chat', '='.repeat((session.title || 'Chat').length), ''];
  (session.messages || []).forEach((m) => {
    const who = m.role === 'user' ? 'Anda' : 'Raget';
    const time = new Date(m.time || Date.now()).toLocaleString('id-ID');
    lines.push('[' + time + '] ' + who + ': ' + (m.text || ''));
  });
  return lines.join('\n');
}

function toJSON(session) {
  return JSON.stringify(session, null, 2);
}

function toPrintableHTML(session) {
  const esc = (s) => String(s || '').replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
  const rows = (session.messages || [])
    .map((m) => {
      const who = m.role === 'user' ? 'Anda' : 'Raget';
      const time = new Date(m.time || Date.now()).toLocaleString('id-ID');
      return '<div class="msg"><strong>' + esc(who) + '</strong> <span class="time">' + esc(time) + '</span><p>' + esc(m.text).replace(/\n/g, '<br>') + '</p></div>';
    })
    .join('\n');
  return (
    '<!doctype html><html><head><meta charset="utf-8"><title>' +
    esc(session.title || 'Chat') +
    '</title><style>body{font-family:sans-serif;max-width:700px;margin:20px auto;padding:0 16px}.msg{margin-bottom:16px;padding-bottom:12px;border-bottom:1px solid #ddd}.time{color:#888;font-size:12px}</style></head><body><h1>' +
    esc(session.title || 'Chat') +
    '</h1>' +
    rows +
    '</body></html>'
  );
}

export const exportFormats = Object.freeze({
  toMarkdown,
  toTXT,
  toJSON,
  toPrintableHTML,
});
