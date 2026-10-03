export function mountClarification(container, spec) {
  if (!container) return null;
  const card = document.createElement('div');
  card.className = 'clarify-card';
  const text = document.createElement('p');
  text.textContent = (spec && spec.text) || 'Langkah ini belum berhasil.';
  card.appendChild(text);
  const row = document.createElement('div');
  row.className = 'clarify-actions';
  (spec && spec.actions || []).forEach((action) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = action.label;
    btn.onclick = () => {
      card.remove();
      if (action.run) action.run();
    };
    row.appendChild(btn);
  });
  card.appendChild(row);
  container.appendChild(card);
  return card;
}
