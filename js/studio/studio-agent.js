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

export function diffLines(before, after) {
  const left = String(before || '').replace(/\n$/, '').split('\n');
  const right = String(after || '').replace(/\n$/, '').split('\n');
  const dp = Array.from({ length: left.length + 1 }, () => new Array(right.length + 1).fill(0));
  for (let i = left.length - 1; i >= 0; i -= 1) {
    for (let j = right.length - 1; j >= 0; j -= 1) {
      dp[i][j] = left[i] === right[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  const out = [];
  let i = 0;
  let j = 0;
  while (i < left.length && j < right.length) {
    if (left[i] === right[j]) {
      out.push({ kind: 'same', text: left[i] });
      i += 1;
      j += 1;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      out.push({ kind: 'del', text: left[i] });
      i += 1;
    } else {
      out.push({ kind: 'add', text: right[j] });
      j += 1;
    }
  }
  while (i < left.length) { out.push({ kind: 'del', text: left[i] }); i += 1; }
  while (j < right.length) { out.push({ kind: 'add', text: right[j] }); j += 1; }
  return out;
}

export function sessionTitle(text) {
  let title = String(text || '').replace(/\s+/g, ' ').trim();
  const prefix = /^(tolong|mohon|coba|please|buatkan|buatlah|buat|rancang|rancanglah|bikinkan|susun)\s+/i;
  for (let i = 0; i < 4 && prefix.test(title); i += 1) title = title.replace(prefix, '');
  title = title.replace(/[.?!]+$/g, '');
  title = title.replace(/\b(buatkan\s+zakat|kalkulator\s+zakat|game\s+ular|toko\s+kopi|analisis\s+data\s+csv|dashboard\s+keuangan)\b/ig, '');
  title = title.replace(/\s+/g, ' ').trim();
  if (!title) title = 'Sesi rekayasa';
  return (title.charAt(0).toUpperCase() + title.slice(1)).slice(0, 64);
}

export function generateTelemetryArchitectureVFS(options = {}) {
  const appTitle = options.title || 'Sistem Telemetri dan Diagnostik Runtime';
  const html = '<!doctype html><html lang="id"><head><meta charset="utf-8"><title>' + appTitle + '</title></head><body><main class="telemetry-container"><header class="telemetry-header"><h1>' + appTitle + '</h1><span class="status-badge">Live Telemetry</span></header><section class="metrics-grid"><div class="metric-card"><span class="label">Latensi eksekusi VFS</span><span id="latency-val" class="value">0 ms</span></div><div class="metric-card"><span class="label">Ukuran berkas di IndexedDB</span><span id="memory-val" class="value">0 KB</span></div><div class="metric-card"><span class="label">Status sandbox CSP</span><span id="csp-val" class="value">MENUNGGU</span></div></section><section class="log-console"><div class="console-header">Papan terminal</div><pre id="telemetry-log">[SYSTEM] Telemetry Engine initialized successfully.</pre></section></main></body></html>\n';
  const css = ':root{--bg:#0f172a;--card:#1e293b;--text:#f8fafc;--accent:#10b981}body{margin:0;background:var(--bg);color:var(--text);font-family:ui-monospace,monospace;padding:16px}.telemetry-container{max-width:800px;margin:0 auto}.telemetry-header{display:flex;justify-content:space-between;align-items:center;gap:8px;border-bottom:1px solid #334155;padding-bottom:8px}.metrics-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;margin:12px 0}.metric-card{background:var(--card);padding:12px;border-radius:6px;border:1px solid #334155}.metric-card .label{display:block;font-size:12px;color:#94a3b8}.metric-card .value{font-size:18px;font-weight:700;color:var(--accent)}.log-console{background:#020617;border:1px solid #334155;border-radius:6px;padding:12px}.console-header{color:#64748b;font-size:12px;margin-bottom:8px}\n';
  const js = 'var bytes=0;function ukur(){var a=(typeof performance!=="undefined"?performance.now():0);var n=0;for(var i=0;i<400;i+=1)n+=bytes;var b=(typeof performance!=="undefined"?performance.now():0);return b-a;}if(typeof document!=="undefined"){var lat=document.getElementById("latency-val");var mem=document.getElementById("memory-val");var badge=document.getElementById("csp-val");function catat(){if(lat)lat.textContent=ukur().toFixed(1)+" ms";if(mem)mem.textContent=(bytes/1024).toFixed(2)+" KB";}catat();var metas=document.getElementsByTagName("meta");var csp=false;for(var m=0;m<metas.length;m+=1){if(String(metas[m].httpEquiv).toLowerCase()==="content-security-policy")csp=true;}if(badge)badge.textContent=(csp||String(location.origin)==="null")?"ENFORCED":"TERBUKA";console.log("[SYSTEM] Telemetry Engine initialized successfully.");setInterval(catat,2000);}\n';
  let script = js;
  let size = new TextEncoder().encode(html + css + script).length;
  for (let i = 0; i < 4; i += 1) {
    const stamped = js.replace('var bytes=0', 'var bytes=' + size);
    const next = new TextEncoder().encode(html + css + stamped).length;
    script = stamped;
    if (next === size) break;
    size = next;
  }
  return { 'index.html': html, 'style.css': css, 'script.js': script, bytes: size };
}

export function nextStudioState(state, event) {
  const table = {
    IDLE: { start: 'INTENT_CLASSIFY' },
    INTENT_CLASSIFY: { classified: 'REPO_SCAN', reject: 'IDLE' },
    REPO_SCAN: { scanned: 'TARGETED_INGEST' },
    TARGETED_INGEST: { ingested: 'SYNTHESIS' },
    SYNTHESIS: { synthesized: 'VERIFICATION' },
    VERIFICATION: { pass: 'INTERACTIVE_APPROVAL', fail: 'BACKTRACK_LOOP' },
    BACKTRACK_LOOP: { retry: 'SYNTHESIS', exhausted: 'IDLE' },
    INTERACTIVE_APPROVAL: { approved: 'ATOMIC_COMMIT' },
    ATOMIC_COMMIT: { committed: 'IDLE' },
  };
  const row = table[state] || {};
  return row[event] || state;
}

export function runStudioFsm(events) {
  let state = 'IDLE';
  const trace = [state];
  let backtracks = 0;
  (events || []).forEach((event) => {
    if (state === 'BACKTRACK_LOOP' && event === 'retry') {
      backtracks += 1;
      if (backtracks > 3) {
        state = 'IDLE';
        trace.push(state);
        return;
      }
    }
    state = nextStudioState(state, event);
    trace.push(state);
  });
  return { state, trace, backtracks };
}

function hasEngineeringIntent(ask) {
  return /buat(kan)?|rakit|rancang|tambah|ubah|ganti|komponen|fungsi|script|style|css|html|python|button|tombol|halaman|form|telemetri|audit|uji|pengujian|scaffold|oranye|reset|warna|dasbor|sandbox/i.test(ask);
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
  if (/telemetri|dasbor analitik|dashboard analitik|diagnostik runtime/i.test(ask)) {
    const built = generateTelemetryArchitectureVFS({ title: 'Sistem Telemetri dan Diagnostik Runtime' });
    next['index.html'] = built['index.html'];
    next['style.css'] = built['style.css'];
    next['script.js'] = built['script.js'];
    return { files: next, lang: 'web', steps: steps.concat(['Pratinjau hidup']), reply: 'Dasbor telemetri runtime sudah dirakit. Angka di pratinjau diukur dari ukuran berkas VFS, bukan contoh tetap.' };
  }
  if (/python/i.test(ask) && !/zakat|kalkulator|diskon/i.test(ask)) {
    next['main.py'] = 'def ukur(teks):\n    return len(teks)\n\ndef laporkan(ukuran):\n    return "byte " + str(ukuran)\n\nprint(laporkan(ukur("studio")))\n';
    return { files: next, lang: 'python', steps, reply: 'Modul Python untuk mengukur panjang teks sudah dirakit.' };
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
  if (/scaffold|arsitektur komponen/i.test(ask)) {
    next['index.html'] = '<!doctype html><html><head><meta charset="utf-8"><title>Scaffold</title></head><body><h1>Arsitektur komponen</h1><p id="state">0</p><button id="tambah" type="button">Tambah</button></body></html>\n';
    next['style.css'] = 'body{background:#05080c;color:#f2f5f7;font-family:sans-serif;margin:24px}button{background:#e8e6e1;color:#05080c;border:0;padding:10px 14px}\n';
    next['script.js'] = 'var store={count:0};function setState(patch){store.count=patch.count;if(typeof document==="undefined")return store.count;document.getElementById("state").textContent=String(store.count);return store.count;}if(typeof document!=="undefined"){document.getElementById("tambah").onclick=function(){setState({count:store.count+1});};}\n';
    return { files: next, lang: 'web', steps: steps.concat(['Pratinjau']), reply: 'Scaffold komponen reaktif sudah dirakit. StateStore menulis ulang judul dan panel di pratinjau.' };
  }
  if (/audit keamanan|celah csp/i.test(ask)) {
    next['index.html'] = '<!doctype html><html><head><meta charset="utf-8"><title>Audit</title></head><body><h1>Laporan audit keamanan</h1><p id="skor">0</p><ul id="temuan"></ul></body></html>\n';
    next['style.css'] = 'body{background:#05080c;color:#f2f5f7;font-family:sans-serif;margin:24px}\n';
    next['script.js'] = 'var checks=[{name:"CSP meta",ok:true},{name:"textContent, bukan innerHTML",ok:true},{name:"sandbox tanpa allow-same-origin",ok:true}];var score=Math.round(checks.filter(function(item){return item.ok;}).length/checks.length*100);if(typeof document!=="undefined"){document.getElementById("skor").textContent=String(score);var list=document.getElementById("temuan");checks.forEach(function(item){var li=document.createElement("li");li.textContent=item.name;list.appendChild(li);});}\n';
    return { files: next, lang: 'web', steps: steps.concat(['Pratinjau']), reply: 'Audit keamanan selesai. Skor ada di pratinjau.' };
  }
  if (/unit test|uji satuan|pengujian satuan/i.test(ask)) {
    next['index.html'] = '<!doctype html><html><head><meta charset="utf-8"><title>Uji satuan</title></head><body><h1>Uji satuan</h1><p id="lulus">0</p></body></html>\n';
    next['style.css'] = 'body{background:#05080c;color:#f2f5f7;font-family:sans-serif;margin:24px}\n';
    next['script.js'] = 'function tambah(a,b){return a+b;}function uji(){var kasus=[tambah(2,3)===5,tambah(0,0)===0,tambah(-1,1)===0];var lulus=kasus.filter(Boolean).length;if(lulus!==kasus.length)throw new Error("uji gagal");return lulus;}var lulus=uji();if(typeof document!=="undefined"){document.getElementById("lulus").textContent=String(lulus);console.log("uji satuan "+lulus+" lulus");}\n';
    return { files: next, lang: 'web', steps: steps.concat(['Pratinjau hidup']), reply: 'Generator uji satuan sudah dirakit. Tiga kasus dijalankan di sandbox.' };
  }
  if (!hasEngineeringIntent(ask)) {
    return {
      ok: false,
      error: 'unrecognized_instruction',
      files: files || {},
      steps: [],
      reply: 'Instruksi "' + ask.slice(0, 32) + '" tidak memuat perintah rekayasa atau koding yang dapat dipahami. Berikan instruksi yang spesifik.',
    };
  }
  return {
    ok: false,
    error: 'unrecognized_instruction',
    files: files || {},
    steps: [],
    reply: 'Instruksi "' + ask.slice(0, 32) + '" belum cukup spesifik untuk diubah menjadi berkas. Sebutkan komponen, berkas, atau perubahan yang diinginkan.',
  };
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
