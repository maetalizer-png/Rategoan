export function setActiveTab(container, isActive) {
  if (!container) return;
  container.querySelectorAll('button').forEach((b) => {
    const on = !!isActive(b);
    b.classList.toggle('on', on);
    b.setAttribute('aria-selected', on ? 'true' : 'false');
  });
}

export function bindFilterTabs(container, onSelect) {
  if (!container || container.dataset.tabsBound) return;
  container.dataset.tabsBound = '1';
  container.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn || !container.contains(btn)) return;
    container.querySelectorAll('button').forEach((b) => {
      const isActive = b === btn;
      b.classList.toggle('on', isActive);
      b.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });
    if (typeof onSelect === 'function') {
      onSelect(btn.dataset.tab || btn.dataset.ctab || btn.dataset.memoryTab || btn.dataset.collTag || btn.dataset.filter || btn.textContent.trim(), btn);
    }
  });
}
