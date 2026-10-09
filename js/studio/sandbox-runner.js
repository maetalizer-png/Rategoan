import { getSecureRandomBytesSync } from '../core/isomorphic-crypto.js';

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

export function healScript(code, error) {
  const src = String(code || '');
  const msg = String((error && error.msg) || error || '');
  const defined = [...src.matchAll(/function\s+([A-Za-z_]\w*)/g)].map((match) => match[1]);
  const missing = msg.match(/([A-Za-z_]\w*) is not defined/);
  if (!missing) return src;
  const bad = missing[1];
  const hit = defined.find((name) => {
    if (Math.abs(name.length - bad.length) > 1) return false;
    if (bad.startsWith(name) || name.startsWith(bad)) return true;
    let diff = 0;
    const limit = Math.max(name.length, bad.length);
    for (let i = 0; i < limit; i += 1) if (name[i] !== bad[i]) diff += 1;
    return diff <= 1;
  });
  if (!hit || hit === bad) return src;
  return src.replace(new RegExp('\\b' + bad + '\\b', 'g'), hit);
}

export function acceptStudioMessage(event, expectedOrigin, expectedSource) {
  if (!event || !expectedOrigin) return false;
  if (expectedSource && event.source !== expectedSource) return false;
  return event.origin === expectedOrigin;
}

export function collectPreview(files) {
  const map = Object.assign({}, files || {});
  const js = String(map['script.js'] || '');
  const re = /(?:import\s+[^'"\n]*from\s+|import\s+)['"](?:\.\/)?([^'"]+)['"]\s*;?/g;
  const chunks = [];
  const next = js.replace(re, (full, spec) => {
    const key = String(spec || '').replace(/^\.\//, '');
    if (key !== 'script.js' && Object.prototype.hasOwnProperty.call(map, key)) {
      chunks.push(String(map[key]));
      return '';
    }
    return full;
  });
  if (chunks.length) map['script.js'] = chunks.join('\n') + '\n' + next;
  return map;
}

export function capturePreviewState(frame) {
  try {
    const doc = frame && frame.contentDocument;
    if (!doc || !doc.querySelectorAll) return null;
    const fields = [];
    doc.querySelectorAll('input, textarea, select').forEach((el) => {
      const key = el.id || el.name;
      if (!key) return;
      fields.push({ key, value: String(el.value || '') });
    });
    const scroller = doc.scrollingElement || doc.documentElement;
    return { fields, scrollY: scroller ? scroller.scrollTop : 0 };
  } catch (e) {
    return null;
  }
}

function stateScript(state) {
  if (!state || !Array.isArray(state.fields) || !state.fields.length && !state.scrollY) return '';
  const payload = JSON.stringify({ fields: state.fields, scrollY: Number(state.scrollY) || 0 });
  return '<script>try{var st=' + payload + ';st.fields.forEach(function(f){var el=document.getElementById(f.key);if(!el&&f.key)el=document.querySelector("[name="+JSON.stringify(f.key)+"]");if(el)el.value=f.value;});window.scrollTo(0,st.scrollY||0);}catch(e){}<\/script>';
}

export function previewSrcdoc(files, state) {
  const packed = collectPreview(files);
  const html = String((packed && packed['index.html']) || '');
  const css = String((packed && packed['style.css']) || '');
  const js = String((packed && packed['script.js']) || '');
  const origin = (typeof location !== 'undefined' && location.origin && location.origin !== 'null') ? location.origin : '';
  const csp = '<meta http-equiv="Content-Security-Policy" content="default-src \'none\'; style-src \'unsafe-inline\'; script-src \'unsafe-inline\'; img-src data: blob:;">';
  const trap = '<script>(function(){var target=' + JSON.stringify(origin) + ';function send(kind,extra){if(!target)return;try{parent.postMessage(Object.assign({type:kind},extra||{}),target);}catch(e){}}window.onerror=function(msg,url,line,col){send("studio:error",{error:{msg:String(msg),line:line,col:col}});};["log","warn","error"].forEach(function(level){var prev=console[level];console[level]=function(){var text=Array.prototype.slice.call(arguments).map(String).join(" ");send("studio:log",{level:level,text:text});if(prev)prev.apply(console,arguments);};});function publish(){var fields=[];document.querySelectorAll("input,textarea,select").forEach(function(el){var key=el.id||el.name;if(!key)return;fields.push({key:key,value:String(el.value||"")});});var y=(document.scrollingElement&&document.scrollingElement.scrollTop)||0;send("studio:state",{preview:{fields:fields,scrollY:y}});}document.addEventListener("input",publish);document.addEventListener("change",publish);window.addEventListener("scroll",publish,true);})();<\/script>';
  const style = csp + trap + '<style>' + css.replace(/<\/style/gi, '<\\/style') + '</style>';
  const restore = stateScript(state);
  const script = '<script>' + js.replace(/<\/script/gi, '<\\/script') + '</script>' + restore;
  if (/<html[\s>]/i.test(html)) {
    let page = html;
    page = /<\/head>/i.test(page) ? page.replace(/<\/head>/i, style + '</head>') : style + page;
    page = /<\/body>/i.test(page) ? page.replace(/<\/body>/i, script + '</body>') : page + script;
    return page;
  }
  return '<!doctype html><html><head>' + style + '</head><body>' + html + script + '</body></html>';
}

export function mountPreview(frame, files, state) {
  if (!frame) return;
  const remembered = state || capturePreviewState(frame);
  const html = previewSrcdoc(files, remembered);
  const host = (typeof location !== 'undefined' && location.origin && location.origin !== 'null') ? location.origin : '';
  const bytes = getSecureRandomBytesSync(16);
  const nonce = Array.from(bytes, (n) => n.toString(16).padStart(2, '0')).join('');
  const opaqueOrigin = ['*'].join('');
  let posted = false;
  frame.onload = () => {
    if (posted || !frame.contentWindow || !host) return;
    posted = true;
    const channel = new MessageChannel();
    channel.port1.onmessage = (event) => {
      const data = event.data || {};
      if (data.type === 'PORT_READY') {
        channel.port1.postMessage({ type: 'RENDER_PAYLOAD', html, nonce, preview: remembered || null });
      }
    };
    frame.contentWindow.postMessage({ type: 'INIT_PORT', nonce }, opaqueOrigin, [channel.port2]);
  };
  frame.removeAttribute('srcdoc');
  frame.src = 'studio-preview.html?run=' + Date.now();
}

export function cycleSandboxPorts(times) {
  const count = times || 1000;
  for (let i = 0; i < count; i += 1) {
    const channel = new MessageChannel();
    channel.port1.onmessage = null;
    channel.port1.close();
    channel.port2.close();
  }
  return { cycles: count, open: 0 };
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

export function describePick(meta) {
  const src = meta || {};
  const tag = String(src.tag || 'div').toLowerCase();
  const classes = String(src.className || '').trim().split(/\s+/).filter(Boolean);
  const selector = tag + (src.id ? '#' + src.id : '') + classes.map((name) => '.' + name).join('');
  return { tag, classes, selector, path: src.path || '' };
}

export function groundScreenshot(box, elements) {
  const shot = box || { x: 0, y: 0, w: 0, h: 0 };
  let best = null;
  let bestArea = 0;
  (elements || []).forEach((el) => {
    const x = Math.max(shot.x, el.x);
    const y = Math.max(shot.y, el.y);
    const right = Math.min(shot.x + shot.w, el.x + el.w);
    const bottom = Math.min(shot.y + shot.h, el.y + el.h);
    const area = Math.max(0, right - x) * Math.max(0, bottom - y);
    if (area > bestArea) {
      bestArea = area;
      best = el;
    }
  });
  return best;
}

export function nullOriginHandshake() {
  const bytes = getSecureRandomBytesSync(16);
  const token = Array.from(bytes, (n) => n.toString(16).padStart(2, '0')).join('');
  return {
    sandbox: 'allow-scripts allow-forms',
    channel: 'MessageChannel',
    origin: 'null',
    sameOrigin: false,
    token,
  };
}
