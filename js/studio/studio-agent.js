export function wantsPublish(text) {
  return /push ke github|commit dan push|sinkronkan ke github|terbitkan ke github/i.test(String(text || ''));
}

export function publishOnly(text) {
  const ask = String(text || '');
  if (!wantsPublish(ask)) return false;
  return !/buatkan|buat |ubah |tambah|kalkulator|zakat|oranye|python|web app|diskon/i.test(ask);
}

export function wantsPull(text) {
  return /muat dari github|klon dari github|tarik dari github|buka repositori/i.test(String(text || ''));
}

export function commitNote(text) {
  const clean = String(text || '')
    .replace(/,?\s*(lalu\s+)?(langsung\s+)?(commit dan push|sinkronkan ke github|push ke github|terbitkan ke github).*/i, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 80);
  return 'feat: ' + (clean || 'pembaruan studio rekayasa');
}

function decodeB64(b64) {
  const bin = atob(String(b64 || '').replace(/\s/g, ''));
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i += 1) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

function encodeB64(text) {
  const bytes = new TextEncoder().encode(String(text || ''));
  let bin = '';
  for (let i = 0; i < bytes.length; i += 1) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

export function craftInstruction(text, files) {
  const ask = String(text || '').trim();
  const next = {
    'index.html': (files && files['index.html']) || '',
    'style.css': (files && files['style.css']) || '',
    'script.js': (files && files['script.js']) || '',
    'main.py': (files && files['main.py']) || '',
  };
  const steps = ['Baca berkas', 'Racik kode', 'Uji sandbox'];
  if (/tombol reset/i.test(ask) && next['index.html'] && !/buatkan/i.test(ask)) {
    if (!/id="reset"/.test(next['index.html'])) {
      next['index.html'] = next['index.html'].replace('</body>', '<button id="reset" type="button">Reset</button></body>');
    }
    next['script.js'] += '\ndocument.getElementById("reset").onclick=function(){var h=document.getElementById("hasil");if(h)h.textContent="0";var i=document.getElementById("harta")||document.getElementById("harga");if(i)i.value="0";};\n';
    return { files: next, lang: 'web', steps, reply: 'Tombol reset sudah ditambahkan pada pratinjau.' };
  }
  if (/python/i.test(ask) && !/zakat|kalkulator|diskon|ular|kopi/i.test(ask)) {
    next['main.py'] = 'print(2 + 3)\n';
    return { files: next, lang: 'python', steps, reply: 'Skrip Python siap. Hasilnya ada di Papan Konsol.' };
  }
  if (/oranye/i.test(ask)) {
    if (/button\s*\{[^}]*\}/i.test(next['style.css'])) {
      next['style.css'] = next['style.css'].replace(/button\s*\{[^}]*\}/i, (block) => (
        /background\s*:/.test(block)
          ? block.replace(/background\s*:[^;]+;/, 'background: #ea580c;')
          : block.replace('{', '{ background: #ea580c; color: #fff;')
      ));
    } else {
      next['style.css'] += '\nbutton { background: #ea580c; color: #fff; border: 0; padding: 10px 14px; }\n';
    }
    return { files: next, lang: 'web', steps, reply: 'Warna tombol diubah menjadi oranye.' };
  }
  if (/ular/i.test(ask)) {
    next['index.html'] = '<!doctype html><html><head><meta charset="utf-8"><title>Ular</title></head><body><h1>Ular</h1><canvas id="papan" width="320" height="320"></canvas><p id="hasil">0</p></body></html>\n';
    next['style.css'] = 'body{background:#05080c;color:#f2f5f7;font-family:sans-serif;margin:24px}canvas{background:#0b111c;border:1px solid #232d3a}\n';
    next['script.js'] = 'var cv=document.getElementById("papan");var ctx=cv.getContext("2d");var s=16,dir={x:1,y:0},snake=[{x:5,y:5}],food={x:8,y:8},n=0;function tick(){var head={x:snake[0].x+dir.x,y:snake[0].y+dir.y};if(head.x<0||head.y<0||head.x>=20||head.y>=20)return;snake.unshift(head);if(head.x===food.x&&head.y===food.y){n+=1;food={x:Math.floor(Math.random()*20),y:Math.floor(Math.random()*20)};document.getElementById("hasil").textContent=String(n);}else snake.pop();ctx.fillStyle="#05080c";ctx.fillRect(0,0,320,320);ctx.fillStyle="#e8e6e1";snake.forEach(function(p){ctx.fillRect(p.x*s,p.y*s,s-1,s-1);});ctx.fillStyle="#ea580c";ctx.fillRect(food.x*s,food.y*s,s-1,s-1);}document.addEventListener("keydown",function(e){if(e.key==="ArrowLeft")dir={x:-1,y:0};if(e.key==="ArrowRight")dir={x:1,y:0};if(e.key==="ArrowUp")dir={x:0,y:-1};if(e.key==="ArrowDown")dir={x:0,y:1};});setInterval(tick,180);\n';
    return { files: next, lang: 'web', steps: steps.concat(['Pratinjau hidup']), reply: 'Game ular sudah dirakit. Mainkan di Pratinjau Hidup dengan tombol panah.' };
  }
  if (/kopi/i.test(ask)) {
    next['index.html'] = '<!doctype html><html><head><meta charset="utf-8"><title>Toko kopi</title></head><body><h1>Toko kopi</h1><button type="button" data-harga="18000">Espresso</button><button type="button" data-harga="25000">Susu</button><p id="hasil">0</p></body></html>\n';
    next['style.css'] = 'body{background:#05080c;color:#f2f5f7;font-family:sans-serif;margin:24px}button{background:#e8e6e1;color:#05080c;border:0;padding:10px 14px;margin:0 8px 8px 0}\n';
    next['script.js'] = 'var n=0;document.querySelectorAll("button").forEach(function(btn){btn.onclick=function(){n+=Number(btn.getAttribute("data-harga"))||0;document.getElementById("hasil").textContent=String(n);};});\n';
    return { files: next, lang: 'web', steps: steps.concat(['Pratinjau hidup']), reply: 'Toko kopi sudah dirakit. Pratinjau hidup siap dimainkan.' };
  }
  const dark = /gelap/i.test(ask);
  const zakat = /zakat/i.test(ask);
  const diskon = /diskon/i.test(ask);
  const bg = dark ? '#05080c' : '#f7f4ee';
  const fg = dark ? '#f2f5f7' : '#1c1a16';
  const title = zakat ? 'Kalkulator zakat' : (diskon ? 'Kalkulator diskon' : 'Web app');
  const body = zakat
    ? '<label>Harta</label><input id="harta" type="number" value="1000000"><button id="go" type="button">Hitung zakat</button><p id="hasil"></p>'
    : (diskon
      ? '<label>Harga</label><input id="harga" type="number" value="100000"><label>Diskon %</label><input id="persen" type="number" value="10"><button id="go" type="button">Hitung diskon</button><p id="hasil"></p>'
      : '<h1>' + title + '</h1><button id="go" type="button">Ketuk</button><p id="hasil">0</p>');
  next['index.html'] = '<!doctype html><html><head><meta charset="utf-8"><title>' + title + '</title></head><body>' + body + '</body></html>\n';
  next['style.css'] = 'body{background:' + bg + ';color:' + fg + ';font-family:sans-serif;margin:24px}button{background:' + (dark ? '#e8e6e1' : '#1c1a16') + ';color:' + (dark ? '#05080c' : '#fff') + ';border:0;padding:10px 14px}\n';
  next['script.js'] = zakat
    ? 'function hitung(){var n=Number(document.getElementById("harta").value)||0;document.getElementById("hasil").textContent=String(Math.round(n*0.025));}\ndocument.getElementById("go").onclick=hitung;\n'
    : (diskon
      ? 'function hitung(){var n=Number(document.getElementById("harga").value)||0;var p=Number(document.getElementById("persen").value)||0;document.getElementById("hasil").textContent=String(Math.round(n*(1-p/100)));}\ndocument.getElementById("go").onclick=hitung;\n'
      : 'var n=0;function ketuk(){n+=1;document.getElementById("hasil").textContent=String(n);}document.getElementById("go").onclick=ketuk;\n');
  return { files: next, lang: 'web', steps: steps.concat(['Pratinjau hidup']), reply: title + ' sudah dirakit. Pratinjau hidup siap dimainkan.' };
}

export async function pushGithub(token, repo, files, message) {
  const pair = String(repo || '').split('/');
  if (!token || pair.length !== 2 || !pair[0] || !pair[1]) {
    return { ok: false, reason: 'token', sha: '' };
  }
  const headers = {
    Authorization: 'Bearer ' + token,
    Accept: 'application/vnd.github+json',
    'Content-Type': 'application/json',
  };
  const root = 'https://api.github.com/repos/' + pair[0] + '/' + pair[1] + '/contents/';
  const names = Object.keys(files || {});
  let sha = '';
  for (let i = 0; i < names.length; i += 1) {
    const path = names[i];
    const content = encodeB64(files[path]);
    let existing = '';
    const found = await fetch(root + path, { headers });
    if (found.ok) {
      const body = await found.json();
      existing = body.sha || '';
    }
    const payload = { message: message || 'feat: pembaruan studio rekayasa', content, branch: 'main' };
    if (existing) payload.sha = existing;
    const sent = await fetch(root + path, { method: 'PUT', headers, body: JSON.stringify(payload) });
    if (!sent.ok) return { ok: false, reason: 'api', sha: '' };
    const saved = await sent.json();
    sha = (saved.commit && saved.commit.sha) || sha;
  }
  return { ok: true, reason: '', sha };
}

export async function pullGithub(token, repo) {
  const pair = String(repo || '').split('/');
  if (!token || pair.length !== 2 || !pair[0] || !pair[1]) {
    return { ok: false, reason: 'token', files: {} };
  }
  const headers = {
    Authorization: 'Bearer ' + token,
    Accept: 'application/vnd.github+json',
  };
  const root = 'https://api.github.com/repos/' + pair[0] + '/' + pair[1] + '/contents/';
  const wanted = ['index.html', 'style.css', 'script.js', 'main.py', 'css/style.css', 'js/script.js'];
  const files = {};
  for (let i = 0; i < wanted.length; i += 1) {
    const path = wanted[i];
    const found = await fetch(root + path, { headers });
    if (!found.ok) continue;
    const body = await found.json();
    if (!body || !body.content || Number(body.size) > 100000) continue;
    const key = path === 'css/style.css' ? 'style.css' : (path === 'js/script.js' ? 'script.js' : path);
    if (!files[key]) files[key] = decodeB64(body.content);
  }
  if (!Object.keys(files).length) return { ok: false, reason: 'api', files };
  return { ok: true, reason: '', files };
}
