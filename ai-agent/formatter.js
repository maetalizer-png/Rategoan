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

function formatByType(tipe, isi) {
  const data = isi || {};
  if (tipe === 'definisi') {
    return para(data.text || '');
  }
  if (tipe === 'daftar') {
    return blocks([h(data.title || 'Daftar', 3), bullets(data.items)]);
  }
  if (tipe === 'prosedur') {
    return blocks([h(data.title || 'Langkah', 3), numbered(data.items)]);
  }
  if (tipe === 'perbandingan') {
    return blocks([
      h(data.title || 'Perbandingan', 3),
      bold((data.groupA && data.groupA.label) || 'A') + '\n' + bullets(data.groupA && data.groupA.items),
      bold((data.groupB && data.groupB.label) || 'B') + '\n' + bullets(data.groupB && data.groupB.items),
      data.conclusion ? bold('Kesimpulan: ') + data.conclusion : '',
    ]);
  }
  if (tipe === 'matematika') {
    return blocks([data.proses ? para(data.proses) : '', bold('Hasil: ') + (data.hasil || '')]);
  }
  if (tipe === 'terbuka') {
    return blocks([h(data.title || 'Ringkasan', 3), bullets(data.items), data.intinya ? bold('Intinya: ') + data.intinya : '']);
  }
  return para(data.text || '');
}

export const formatter = Object.freeze({
  h,
  bullets,
  numbered,
  bold,
  para,
  blocks,
  formatByType,
});
