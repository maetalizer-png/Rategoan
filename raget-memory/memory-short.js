function recent(messages, limit) {
  const list = Array.isArray(messages) ? messages : [];
  return list.slice(-(limit || 10)).map((m) => ({ role: m.role, text: m.text }));
}

function format(messages, limit) {
  return recent(messages, limit)
    .map((m) => (m.role === 'user' ? 'Pengguna' : 'Raget') + ': ' + m.text)
    .join('\n');
}

export const memoryShort = Object.freeze({
  recent,
  format,
});
