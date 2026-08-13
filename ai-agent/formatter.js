function h(text, level) {
  const lvl = Math.min(3, Math.max(1, level || 2));
  return '#'.repeat(lvl) + ' ' + text;
}

function bullets(items) {
  return (items || []).filter(Boolean).map((item) => '- ' + item).join('\n');
}

function numbered(items) {
  return (items || []).filter(Boolean).map((item, i) => i + 1 + '. ' + item).join('\n');
}

function bold(text) {
  return '**' + text + '**';
}

function para(text) {
  return String(text || '');
}

function blocks(parts) {
  return (parts || []).filter(Boolean).join('\n\n');
}

export const formatter = Object.freeze({
  h,
  bullets,
  numbered,
  bold,
  para,
  blocks,
});
