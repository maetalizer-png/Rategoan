export function positionDesktopPopover(sheet, triggerBtn) {
  if (!sheet || !triggerBtn) return;
  const btnBox = triggerBtn.getBoundingClientRect();
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

  const spaceAbove = btnBox.top;
  const spaceBelow = window.innerHeight - btnBox.bottom;
  const aboveTop = btnBox.top - sheetHeight - 10;

  if (spaceAbove >= sheetHeight + 12 && aboveTop >= 20) {
    set('top', aboveTop + 'px');
  } else if (spaceBelow >= sheetHeight + 12) {
    set('top', (btnBox.bottom + 10) + 'px');
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
