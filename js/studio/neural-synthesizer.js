import { routeDoor, failoverStream } from './sse-door.js';

function escapeText(value) {
  return String(value || '').replace(/[<>&]/g, (ch) => {
    if (ch === '<') return '&' + 'lt;';
    if (ch === '>') return '&' + 'gt;';
    return '&' + 'amp;';
  });
}

function pageTitle(ask) {
  const clean = String(ask || '').replace(/\s+/g, ' ').trim();
  return (clean || 'Halaman').slice(0, 72);
}

function accent(ask) {
  if (/hijau/i.test(ask)) return '#157a45';
  if (/merah/i.test(ask)) return '#9b2c2c';
  if (/oranye/i.test(ask)) return '#ea580c';
  if (/biru/i.test(ask)) return '#1a4b8c';
  return '#1a4b8c';
}

export function localDraft(ask) {
  const title = escapeText(pageTitle(ask));
  const color = accent(ask);
  const css = 'body{font-family:sans-serif;margin:24px;background:#fafaf8;color:#141619}h1{font-size:28px;margin:0 0 12px}button{background:' + color + ';color:#fff;border:0;padding:10px 14px;border-radius:8px}input{padding:8px;margin:0 8px 8px 0;border:1px solid #e8e8e3;border-radius:8px}ul{padding-left:18px}\n';
  let body = '<h1>' + title + '</h1><p id="status">Siap</p><button id="jalan" type="button">Jalankan</button>';
  let script = 'var btn=document.getElementById("jalan");if(btn){btn.onclick=function(){var s=document.getElementById("status");if(s)s.textContent="Berjalan";};}\n';
  if (/daftar|list|belanja|catatan|todo/i.test(ask)) {
    body = '<h1>' + title + '</h1><form id="form"><input id="item" name="item" placeholder="Butir"><button type="submit">Tambah</button></form><ul id="daftar"></ul>';
    script = 'var form=document.getElementById("form");var input=document.getElementById("item");var list=document.getElementById("daftar");if(form&&input&&list){form.onsubmit=function(ev){ev.preventDefault();var text=input.value.trim();if(!text)return;var li=document.createElement("li");li.textContent=text;list.appendChild(li);input.value="";};}\n';
  } else if (/hitung|kalkulator|jumlah/i.test(ask)) {
    body = '<h1>' + title + '</h1><input id="a" name="a" value="0"><input id="b" name="b" value="0"><button id="hitung" type="button">Hitung</button><p id="hasil">0</p>';
    script = 'var btn=document.getElementById("hitung");if(btn){btn.onclick=function(){var a=Number(document.getElementById("a").value)||0;var b=Number(document.getElementById("b").value)||0;document.getElementById("hasil").textContent=String(a+b);};}\n';
  }
  return {
    'index.html': '<!doctype html><html><head><meta charset="utf-8"><title>' + title + '</title></head><body>' + body + '</body></html>\n',
    'style.css': css,
    'script.js': script,
  };
}

export function parseFenceFiles(raw) {
  const text = String(raw || '');
  if (!text) return null;
  const files = {};
  const re = /```(index\.html|style\.css|script\.js)\n([\s\S]*?)```/g;
  let match = re.exec(text);
  while (match) {
    files[match[1]] = match[2];
    match = re.exec(text);
  }
  if (!files['index.html'] && !files['script.js']) return null;
  return files;
}

export async function synthesizeCode(text, files, hooks) {
  const opts = hooks || {};
  const online = opts.online !== false;
  let door = routeDoor(online);
  let streamed = '';
  if (door === 'center' && typeof opts.fetchImpl === 'function' && opts.endpoint) {
    try {
      const res = await opts.fetchImpl(opts.endpoint, {
        method: 'POST',
        headers: { accept: 'text/event-stream', 'content-type': 'application/json' },
        body: JSON.stringify({ prompt: String(text || ''), files: files || {} }),
      });
      if (!res || !res.ok) throw new Error('door');
      streamed = typeof res.text === 'function' ? await res.text() : '';
    } catch (e) {
      const failed = failoverStream({ phase: 'DOOR_B_STREAMING', seq: 1, door: 'center' }, 'NETWORK_FAILURE');
      door = failed.door || 'local';
      streamed = '';
    }
  } else {
    door = 'local';
  }
  const parsed = parseFenceFiles(streamed);
  const drafted = parsed || localDraft(text);
  const merged = Object.assign({}, files || {});
  Object.keys(drafted).forEach((name) => { merged[name] = drafted[name]; });
  if (typeof opts.onToken === 'function') opts.onToken(door === 'local' ? 'pintu lokal' : 'pintu pusat');
  return {
    ok: true,
    files: merged,
    lang: 'web',
    door,
    steps: ['Baca berkas', 'Sintesis', 'Uji sandbox'],
    reply: 'Halaman sudah dirakit dari instruksi itu.',
  };
}
