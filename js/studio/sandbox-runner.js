const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(bytes) {
  let c = 0xffffffff;
  for (let i = 0; i < bytes.length; i += 1) c = CRC_TABLE[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function u16(view, offset, value) {
  view.setUint16(offset, value, true);
}

function u32(view, offset, value) {
  view.setUint32(offset, value, true);
}

export function previewSrcdoc(files) {
  const html = String((files && files['index.html']) || '');
  const css = String((files && files['style.css']) || '');
  const js = String((files && files['script.js']) || '');
  const style = '<style>' + css.replace(/<\/style/gi, '<\\/style') + '</style>';
  const script = '<script>' + js.replace(/<\/script/gi, '<\\/script') + '</script>';
  if (/<html[\s>]/i.test(html)) {
    let page = html;
    page = /<\/head>/i.test(page) ? page.replace(/<\/head>/i, style + '</head>') : style + page;
    page = /<\/body>/i.test(page) ? page.replace(/<\/body>/i, script + '</body>') : page + script;
    return page;
  }
  return '<!doctype html><html><head>' + style + '</head><body>' + html + script + '</body></html>';
}

export function zipStore(files) {
  const names = Object.keys(files || {});
  const locals = [];
  const centrals = [];
  let offset = 0;
  names.forEach((name) => {
    const data = new TextEncoder().encode(String(files[name] || ''));
    const nameBytes = new TextEncoder().encode(name);
    const crc = crc32(data);
    const local = new Uint8Array(30 + nameBytes.length + data.length);
    const view = new DataView(local.buffer);
    u32(view, 0, 0x04034b50);
    u16(view, 4, 20);
    u16(view, 8, 0);
    u32(view, 14, crc);
    u32(view, 18, data.length);
    u32(view, 22, data.length);
    u16(view, 26, nameBytes.length);
    local.set(nameBytes, 30);
    local.set(data, 30 + nameBytes.length);
    locals.push(local);
    const central = new Uint8Array(46 + nameBytes.length);
    const cv = new DataView(central.buffer);
    u32(cv, 0, 0x02014b50);
    u16(cv, 4, 20);
    u16(cv, 6, 20);
    u32(cv, 16, crc);
    u32(cv, 20, data.length);
    u32(cv, 24, data.length);
    u16(cv, 28, nameBytes.length);
    u32(cv, 42, offset);
    central.set(nameBytes, 46);
    centrals.push(central);
    offset += local.length;
  });
  const centralSize = centrals.reduce((sum, part) => sum + part.length, 0);
  const end = new Uint8Array(22);
  const ev = new DataView(end.buffer);
  u32(ev, 0, 0x06054b50);
  u16(ev, 8, names.length);
  u16(ev, 10, names.length);
  u32(ev, 12, centralSize);
  u32(ev, 16, offset);
  const total = offset + centralSize + end.length;
  const out = new Uint8Array(total);
  let cursor = 0;
  locals.concat(centrals).forEach((part) => {
    out.set(part, cursor);
    cursor += part.length;
  });
  out.set(end, cursor);
  return out;
}
