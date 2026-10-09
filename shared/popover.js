export function positionDesktopPopover(sheet, triggerBtn) {
  if (!sheet || !triggerBtn) return;
  const btnBox = triggerBtn.getBoundingClientRect();
  const sheetWidth = Math.min(360, window.innerWidth - 32);
  sheet.style.width = sheetWidth + 'px';
  sheet.style.position = 'fixed';
  sheet.style.right = 'auto';
  sheet.style.bottom = 'auto';
  sheet.style.transform = 'none';

  const left = Math.max(16, Math.min(btnBox.left, window.innerWidth - sheetWidth - 16));
  sheet.style.left = left + 'px';

  sheet.style.maxHeight = 'calc(100vh - 96px)';
  sheet.style.overflowY = 'auto';
  const sheetHeight = sheet.offsetHeight || 420;

  const spaceAbove = btnBox.top;
  const spaceBelow = window.innerHeight - btnBox.bottom;
  const aboveTop = btnBox.top - sheetHeight - 10;

  if (spaceAbove >= sheetHeight + 12 && aboveTop >= 20) {
    sheet.style.top = aboveTop + 'px';
  } else if (spaceBelow >= sheetHeight + 12) {
    sheet.style.top = (btnBox.bottom + 10) + 'px';
  } else {
    const centeredTop = Math.max(20, Math.round((window.innerHeight - sheetHeight) / 2));
    sheet.style.top = centeredTop + 'px';
    sheet.style.maxHeight = 'calc(100vh - 32px)';
  }
  const placed = parseFloat(sheet.style.top);
  if (!Number.isFinite(placed) || placed < 20) sheet.style.top = '20px';
}
