export function extractReceipt(text) {
  const src = String(text || '');
  const lines = src.split(/\n+/).map((line) => line.trim()).filter(Boolean);
  const date = (src.match(/\b(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})\b/) || [])[1] || '';
  const money = lines.filter((line) => /rp|total|harga|\d{3,}/i.test(line)).slice(0, 12);
  const totalLine = lines.find((line) => /\btotal\b/i.test(line)) || money[money.length - 1] || '';
  const vendor = lines.find((line) => line.length > 2 && line.length < 40 && !/\d{3,}/.test(line)) || 'Toko';
  const items = money.filter((line) => line !== totalLine).slice(0, 8);
  return { date, vendor, items, total: totalLine };
}

export function receiptTable(text) {
  const rec = extractReceipt(text);
  const rows = [['Tanggal', rec.date || '-'], ['Toko', rec.vendor]];
  rec.items.forEach((item, i) => rows.push(['Barang ' + (i + 1), item]));
  rows.push(['Total', rec.total || '-']);
  return rows;
}
