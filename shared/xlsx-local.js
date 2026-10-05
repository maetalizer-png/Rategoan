function utf8(s) { return new TextEncoder().encode(String(s)); }
function crc32(bytes) {
  let c = ~0;
  for (let i = 0; i < bytes.length; i += 1) {
    c ^= bytes[i];
    for (let k = 0; k < 8; k += 1) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ~c >>> 0;
}
function u16(n) { const b = new Uint8Array(2); new DataView(b.buffer).setUint16(0, n, true); return b; }
function u32(n) { const b = new Uint8Array(4); new DataView(b.buffer).setUint32(0, n, true); return b; }
function concat(parts) {
  const len = parts.reduce((a, p) => a + p.length, 0);
  const out = new Uint8Array(len);
  let o = 0;
  parts.forEach((p) => { out.set(p, o); o += p.length; });
  return out;
}
function zipStore(files) {
  const locals = [];
  const centrals = [];
  let offset = 0;
  files.forEach((f) => {
    const name = utf8(f.name);
    const data = utf8(f.data);
    const crc = crc32(data);
    const local = concat([u32(0x04034b50), u16(20), u16(0), u16(0), u16(0), u16(0), u32(crc), u32(data.length), u32(data.length), u16(name.length), u16(0), name, data]);
    const central = concat([u32(0x02014b50), u16(20), u16(20), u16(0), u16(0), u16(0), u16(0), u32(crc), u32(data.length), u32(data.length), u16(name.length), u16(0), u16(0), u16(0), u16(0), u32(0), u32(offset), name]);
    locals.push(local);
    centrals.push(central);
    offset += local.length;
  });
  const center = concat(centrals);
  return concat(locals.concat([center, concat([u32(0x06054b50), u16(0), u16(0), u16(files.length), u16(files.length), u32(center.length), u32(offset), u16(0)])]));
}
function xml(s) { return String(s || '').replace(/&/g, '&').replace(/</g, '<'); }

export function sheetFromText(text) {
  const lines = String(text || '').split(/\n+/).map((line) => line.trim()).filter(Boolean).slice(0, 24);
  const rows = [['Uraian', 'Nilai']];
  lines.forEach((line) => {
    const hit = line.match(/(\d+(?:[.,]\d+)?)/);
    if (!hit) return;
    const raw = hit[1].includes(',') && !hit[1].includes('.') ? hit[1].replace(',', '.') : hit[1].replace(/\.(?=\d{3}\b)/g, '');
    const value = Number(raw);
    if (!Number.isFinite(value)) return;
    rows.push([(line.replace(hit[1], '').replace(/[:\-]/g, ' ').trim() || 'Butir').slice(0, 80), value]);
  });
  if (rows.length < 2) rows.push([String(text || 'Catatan').slice(0, 80), 0]);
  return rows;
}

export function buildXlsxBytes(rows, mode) {
  const body = rows.slice(1);
  const strings = body.map((row) => row[0]);
  const shared = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" count="' + (strings.length + 2) + '" uniqueCount="' + (strings.length + 2) + '"><si><t>Uraian</t></si><si><t>Nilai</t></si>' + strings.map((s) => '<si><t>' + xml(s) + '</t></si>').join('') + '</sst>';
  const last = body.length + 1;
  const totalRow = last + 1;
  const formula = mode === 'rata' ? 'AVERAGE(B2:B' + last + ')' : 'SUM(B2:B' + last + ')';
  const dataRows = body.map((row, i) => {
    const n = i + 2;
    return '<row r="' + n + '"><c r="A' + n + '" t="s"><v>' + (i + 2) + '</v></c><c r="B' + n + '"><v>' + row[1] + '</v></c></row>';
  }).join('');
  const extra = mode === 'jika' ? '<c r="C' + totalRow + '"><f>IF(B' + totalRow + '>0,1,0)</f></c>' : '';
  const sheet = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData><row r="1"><c r="A1" t="s"><v>0</v></c><c r="B1" t="s"><v>1</v></c></row>' + dataRows + '<row r="' + totalRow + '"><c r="A' + totalRow + '" t="inlineStr"><is><t>Jumlah</t></is></c><c r="B' + totalRow + '"><f>' + formula + '</f></c>' + extra + '</row></sheetData></worksheet>';
  const files = [
    { name: '[Content_Types].xml', data: '<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/sharedStrings.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml"/></Types>' },
    { name: '_rels/.rels', data: '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>' },
    { name: 'xl/workbook.xml', data: '<?xml version="1.0" encoding="UTF-8"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Rekap" sheetId="1" r:id="rId1"/></sheets></workbook>' },
    { name: 'xl/_rels/workbook.xml.rels', data: '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings" Target="sharedStrings.xml"/></Relationships>' },
    { name: 'xl/worksheets/sheet1.xml', data: sheet },
    { name: 'xl/sharedStrings.xml', data: shared },
  ];
  return zipStore(files);
}
