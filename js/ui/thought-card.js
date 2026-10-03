const LABEL = {
  EMIT_THOUGHT: 'Pikir',
  EMIT_COMMAND: 'Perintah',
  EMIT_EXPLORE: 'Telusuri',
  EMIT_ACTION: 'Aksi',
  EMIT_STATUS: 'Status',
  EMIT_ERROR: 'Galat',
};

export function mountThought(container, thoughts, status) {
  if (!container || !thoughts || !thoughts.length) return null;
  const box = document.createElement('details');
  const running = status === 'berjalan';
  box.className = 'thought-accordion' + (running ? ' running' : ' completed');
  box.open = running;
  const summary = document.createElement('summary');
  const explored = thoughts.filter((step) => step.kind === 'EMIT_EXPLORE').length;
  const actions = thoughts.filter((step) => step.kind === 'EMIT_ACTION').length;
  summary.textContent = running
    ? 'Sedang bekerja…'
    : 'Selesai · ' + explored + ' telusuran · ' + actions + ' aksi (ketuk untuk detail)';
  const list = document.createElement('ol');
  thoughts.forEach((step) => {
    const li = document.createElement('li');
    li.dataset.kind = step.kind || '';
    li.textContent = (LABEL[step.kind] || 'Jejak') + ': ' + (step.text || '');
    list.appendChild(li);
  });
  box.appendChild(summary);
  box.appendChild(list);
  container.insertBefore(box, container.firstChild);
  if (running) list.scrollTop = list.scrollHeight;
  return box;
}
