function utf8(s) {
  return new TextEncoder().encode(String(s));
}

function crc32(bytes) {
  let c = ~0;
  for (let i = 0; i < bytes.length; i += 1) {
    c ^= bytes[i];
    for (let k = 0; k < 8; k += 1) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ~c >>> 0;
}

function u16(n) {
  const b = new Uint8Array(2);
  new DataView(b.buffer).setUint16(0, n, true);
  return b;
}

function u32(n) {
  const b = new Uint8Array(4);
  new DataView(b.buffer).setUint32(0, n, true);
  return b;
}

function concat(parts) {
  const len = parts.reduce((a, p) => a + p.length, 0);
  const out = new Uint8Array(len);
  let o = 0;
  parts.forEach((p) => {
    out.set(p, o);
    o += p.length;
  });
  return out;
}

function zipStore(files) {
  const locals = [];
  const centrals = [];
  let offset = 0;
  files.forEach((f) => {
    const name = utf8(f.name);
    const data = typeof f.data === 'string' ? utf8(f.data) : f.data;
    const crc = crc32(data);
    const local = concat([
      u32(0x04034b50), u16(20), u16(0), u16(0), u16(0), u16(0),
      u32(crc), u32(data.length), u32(data.length), u16(name.length), u16(0),
      name, data,
    ]);
    const central = concat([
      u32(0x02014b50), u16(20), u16(20), u16(0), u16(0), u16(0), u16(0),
      u32(crc), u32(data.length), u32(data.length), u16(name.length), u16(0),
      u16(0), u16(0), u16(0), u32(0), u32(offset), name,
    ]);
    locals.push(local);
    centrals.push(central);
    offset += local.length;
  });
  const center = concat(centrals);
  const end = concat([
    u32(0x06054b50), u16(0), u16(0), u16(files.length), u16(files.length),
    u32(center.length), u32(offset), u16(0),
  ]);
  return concat(locals.concat([center, end]));
}

function esc(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function textBox(x, y, w, h, text, size, bold) {
  return (
    '<p:sp><p:nvSpPr><p:cNvPr id="2" name="t"/><p:cNvSpPr txBox="1"/><p:nvPr/></p:nvSpPr>' +
    '<p:spPr><a:xfrm><a:off x="' + x + '" y="' + y + '"/><a:ext cx="' + w + '" cy="' + h + '"/></a:xfrm>' +
    '<a:prstGeom prst="rect"><a:avLst/></a:prstGeom></p:spPr>' +
    '<p:txBody><a:bodyPr wrap="square" lIns="0" tIns="0" rIns="0" bIns="0"/><a:lstStyle/>' +
    '<a:p><a:pPr algn="l"/><a:r><a:rPr lang="id-ID" sz="' + size + '"' +
    (bold ? ' b="1"' : '') + ' dirty="0"><a:solidFill><a:srgbClr val="E8E6E1"/></a:solidFill>' +
    '<a:latin typeface="Calibri"/></a:rPr><a:t>' + esc(text) + '</a:t></a:r></a:p>' +
    '</p:txBody></p:sp>'
  );
}

function bulletsBox(x, y, w, h, items) {
  const ps = (items || []).map((it) => (
    '<a:p><a:pPr marL="171450" indent="-171450"><a:buFont typeface="Arial"/><a:buChar char="•"/></a:pPr>' +
    '<a:r><a:rPr lang="id-ID" sz="1800" dirty="0"><a:solidFill><a:srgbClr val="E8E6E1"/></a:solidFill>' +
    '<a:latin typeface="Calibri"/></a:rPr><a:t>' + esc(it) + '</a:t></a:r></a:p>'
  )).join('');
  return (
    '<p:sp><p:nvSpPr><p:cNvPr id="3" name="b"/><p:cNvSpPr txBox="1"/><p:nvPr/></p:nvSpPr>' +
    '<p:spPr><a:xfrm><a:off x="' + x + '" y="' + y + '"/><a:ext cx="' + w + '" cy="' + h + '"/></a:xfrm>' +
    '<a:prstGeom prst="rect"><a:avLst/></a:prstGeom></p:spPr>' +
    '<p:txBody><a:bodyPr wrap="square"/><a:lstStyle/>' + ps + '</p:txBody></p:sp>'
  );
}

function slideXml(slide) {
  const bg =
    '<p:bg><p:bgPr><a:solidFill><a:srgbClr val="0B0C0E"/></a:solidFill><a:effectLst/></p:bgPr></p:bg>';
  let body = textBox(685800, 457200, 7772400, 914400, slide.title || '', slide.kind === 'cover' ? 3200 : 2400, true);
  if (slide.kind === 'cover' && slide.bullets && slide.bullets[0]) {
    body += textBox(685800, 1600200, 7772400, 914400, slide.bullets[0], 1600, false);
  } else if (slide.kind !== 'cover') {
    body += bulletsBox(685800, 1371600, 7772400, 3657600, slide.bullets || []);
  }
  return (
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">' +
    '<p:cSld>' + bg + '<p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>' +
    '<p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>' +
    body + '</p:spTree></p:cSld><p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:sld>'
  );
}

function contentTypes(n) {
  const overrides = [];
  for (let i = 1; i <= n; i += 1) {
    overrides.push('<Override PartName="/ppt/slides/slide' + i + '.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>');
  }
  return (
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
    '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
    '<Default Extension="xml" ContentType="application/xml"/>' +
    '<Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>' +
    overrides.join('') + '</Types>'
  );
}

function presentationXml(n) {
  let sldId = '';
  for (let i = 1; i <= n; i += 1) sldId += '<p:sldId id="' + (255 + i) + '" r:id="rId' + i + '"/>';
  return (
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<p:presentation xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">' +
    '<p:sldIdLst>' + sldId + '</p:sldIdLst>' +
    '<p:sldSz cx="9144000" cy="5143500" type="screen16x9"/>' +
    '<p:notesSz cx="6858000" cy="9144000"/>' +
    '</p:presentation>'
  );
}

function presRels(n) {
  let rel = '';
  for (let i = 1; i <= n; i += 1) {
    rel += '<Relationship Id="rId' + i + '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide' + i + '.xml"/>';
  }
  return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' + rel + '</Relationships>';
}

export function buildPptxBytes(slides) {
  const list = Array.isArray(slides) && slides.length ? slides : [{ kind: 'cover', title: 'Presentasi', bullets: [] }];
  const files = [
    { name: '[Content_Types].xml', data: contentTypes(list.length) },
    { name: '_rels/.rels', data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/></Relationships>' },
    { name: 'ppt/presentation.xml', data: presentationXml(list.length) },
    { name: 'ppt/_rels/presentation.xml.rels', data: presRels(list.length) },
  ];
  list.forEach((slide, i) => {
    files.push({ name: 'ppt/slides/slide' + (i + 1) + '.xml', data: slideXml(slide) });
  });
  return zipStore(files);
}

export function downloadBytes(bytes, fileName) {
  const blob = new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName || 'slide.pptx';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}
