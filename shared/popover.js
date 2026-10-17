export function positionDesktopPopover(sheet, triggerBtn) {
  if (!sheet || !triggerBtn) return;
  const btnBox = triggerBtn.getBoundingClientRect();
  const cardEl = typeof triggerBtn.closest === 'function' ? triggerBtn.closest('#composer-card, .composer-card, .studio-composer') : null;
  const cardBox = cardEl && typeof cardEl.getBoundingClientRect === 'function' ? cardEl.getBoundingClientRect() : null;
  const anchorTop = cardBox ? Math.min(btnBox.top, cardBox.top) : btnBox.top;
  const anchorBottom = cardBox ? Math.max(btnBox.bottom, cardBox.bottom) : btnBox.bottom;
  const sheetWidth = Math.min(360, window.innerWidth - 32);
  const set = (name, value) => {
    const camel = name.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    sheet.style[camel] = value;
    if (typeof sheet.style.setProperty === 'function') sheet.style.setProperty(name, value, 'important');
  };
  set('position', 'fixed');
  set('right', 'auto');
  set('bottom', 'auto');
  set('transform', 'none');
  set('width', sheetWidth + 'px');
  set('z-index', '9999');

  const left = Math.max(16, Math.min(btnBox.left, window.innerWidth - sheetWidth - 16));
  set('left', left + 'px');

  set('max-height', 'calc(100vh - 96px)');
  sheet.style.overflowY = 'auto';
  const sheetHeight = sheet.offsetHeight || 420;

  const spaceAbove = anchorTop;
  const spaceBelow = window.innerHeight - anchorBottom;
  const aboveTop = anchorTop - sheetHeight - 10;

  if (spaceAbove >= sheetHeight + 12 && aboveTop >= 20) {
    set('top', aboveTop + 'px');
  } else if (spaceBelow >= sheetHeight + 12) {
    set('top', (anchorBottom + 10) + 'px');
  } else if (spaceAbove >= spaceBelow && spaceAbove >= 180) {
    const maxH = Math.max(160, Math.floor(spaceAbove - 30));
    const clampedH = Math.min(sheetHeight, maxH);
    set('max-height', maxH + 'px');
    set('top', Math.max(20, Math.floor(anchorTop - clampedH - 10)) + 'px');
  } else if (spaceBelow >= 180) {
    const maxH = Math.max(160, Math.floor(spaceBelow - 30));
    set('max-height', maxH + 'px');
    set('top', Math.max(20, Math.floor(anchorBottom + 10)) + 'px');
  } else {
    const centeredTop = Math.max(20, Math.round((window.innerHeight - sheetHeight) / 2));
    set('top', centeredTop + 'px');
    set('max-height', 'calc(100vh - 32px)');
  }
  const placed = parseFloat(sheet.style.top);
  if (!Number.isFinite(placed) || placed < 20) set('top', '20px');
}

export function clearDesktopPopover(sheet) {
  if (!sheet) return;
  ['position', 'top', 'left', 'right', 'bottom', 'width', 'transform', 'z-index', 'max-height'].forEach((name) => {
    sheet.style.removeProperty(name);
  });
}
