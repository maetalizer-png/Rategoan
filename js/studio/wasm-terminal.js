import { grepVfs, diffLines } from './studio-agent.js';

function parseExpr(src) {
  let i = 0;
  function peek() { return src[i]; }
  function factor() {
    if (peek() === '(') {
      i += 1;
      const value = expr();
      if (src[i] !== ')') throw new Error('kurung');
      i += 1;
      return value;
    }
    if (peek() === '-') { i += 1; return -factor(); }
    let n = '';
    while (i < src.length && /[0-9.]/.test(src[i])) { n += src[i]; i += 1; }
    if (!n) throw new Error('sintaks');
    return Number(n);
  }
  function term() {
    let value = factor();
    while (peek() === '*' || peek() === '/') {
      const op = src[i];
      i += 1;
      const right = factor();
      value = op === '*' ? value * right : value / right;
    }
    return value;
  }
  function expr() {
    let value = term();
    while (peek() === '+' || peek() === '-') {
      const op = src[i];
      i += 1;
      const right = term();
      value = op === '+' ? value + right : value - right;
    }
    return value;
  }
  const value = expr();
  if (i !== src.length) throw new Error('sisa');
  return value;
}

export function runTerminal(line) {
  const src = String(line || '').replace(/\s+/g, '');
  if (!src) return '';
  if (!/^[0-9+\-*/().]+$/.test(src)) throw new Error('sintaks');
  return parseExpr(src);
}

function normalizeVfsKey(vfs, rawPath) {
  const clean = String(rawPath || '').trim();
  if (!clean) return '/index.html';
  const withSlash = clean.startsWith('/') ? clean : ('/' + clean);
  if (vfs && typeof vfs.list === 'function') {
    const list = vfs.list();
    if (list.includes(withSlash)) return withSlash;
    const match = list.find((p) => p.endsWith('/' + clean.replace(/^\//, '')) || p === withSlash);
    if (match) return match;
  }
  return withSlash;
}

function stripOuterQuotes(str) {
  const s = String(str || '').trim();
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    return s.slice(1, -1);
  }
  return s;
}

function runSafeJsFallback(code) {
  const logs = [];
  const src = String(code || "");
  const logRe = /console\.log\(([^)]*)\)/g;
  let m = logRe.exec(src);
  while (m) {
    const inner = m[1].trim();
    if ((inner.startsWith('"') && inner.endsWith('"')) || (inner.startsWith("'") && inner.endsWith("'"))) {
      logs.push(inner.slice(1, -1));
    } else if (/^[0-9+\-*/().\s]+$/.test(inner)) {
      try { logs.push(String(runTerminal(inner))); } catch (e) { logs.push(inner); }
    } else {
      logs.push(inner);
    }
    m = logRe.exec(src);
  }
  if (!logs.length && /^[0-9+\-*/().\s;]+$/.test(src.trim())) {
    try { logs.push(String(runTerminal(src.replace(/;/g, "")))); } catch (e) { void e; }
  }
  return logs.join("\n") || "[Node Sandbox CSP-Safe] Selesai (0 galat).";
}

export async function execStudioCli(cmdLine, env = {}) {
  const raw = String(cmdLine || '').trim();
  if (!raw) return { ok: true, output: '' };
  const vfs = env.vfs;
  const git = env.git;
  const lastBefore = env.lastBefore || {};
  const parts = raw.split(/\s+/);
  const cmd = parts[0].toLowerCase();
  const arg = parts.slice(1).join(' ').trim();

  if (cmd === 'clear' || cmd === 'cls') {
    return { ok: true, clear: true, output: '' };
  }
  if (cmd === 'pwd') {
    return { ok: true, output: '/' };
  }
  if (cmd === 'help' || cmd === 'bantuan') {
    return {
      ok: true,
      output: [
        'Perintah Terminal Studio Kode (Raget 1.0):',
        '  ls [-la] | tree          — Daftar seluruh berkas di VFS beserta ukuran',
        '  pwd                      — Tampilkan direktori kerja VFS saat ini',
        '  cat <berkas>             — Tampilkan isi berkas di VFS',
        '  head / tail <berkas>     — Tampilkan 10 baris awal / akhir berkas',
        '  wc <berkas>              — Hitung baris, kata, dan byte berkas',
        '  echo <teks> [> berkas]   — Cetak teks atau tulis ke berkas VFS',
        '  grep <pola>              — Cari teks lintas-berkas di VFS',
        '  touch / mkdir <path>     — Buat berkas baru di VFS',
        '  cp / mv <asal> <tujuan>  — Salin atau pindahkan berkas di VFS',
        '  rm <berkas>              — Hapus berkas dari VFS',
        '  git status | log | diff  — Periksa status dan riwayat VFS Git',
        '  node [-e kode | berkas]  — Jalankan JavaScript di sandbox terisolasi',
        '  python [-c kode | berkas]— Jalankan skrip Python di sandbox lokal',
        '  clear                    — Bersihkan layar terminal',
      ].join('\n'),
    };
  }
  if (cmd === 'ls' || cmd === 'tree') {
    if (!vfs || typeof vfs.list !== 'function') return { ok: false, output: 'VFS belum terpasang.' };
    const nonFlagArgs = parts.slice(1).filter((p) => !p.startsWith('-'));
    const prefix = nonFlagArgs[0] ? (nonFlagArgs[0].startsWith('/') ? nonFlagArgs[0] : '/' + nonFlagArgs[0]) : '';
    const files = vfs.list().filter((p) => !prefix || p.startsWith(prefix));
    const rows = files.map((path) => {
      const content = String(vfs.read(path) || '');
      const lines = content ? content.split('\n').length : 0;
      return path.padEnd(20, ' ') + '  ' + String(content.length).padStart(6, ' ') + ' B  (' + lines + ' baris)';
    });
    return { ok: true, output: rows.join('\n') || '(kosong)' };
  }
  if (cmd === 'echo') {
    const redirMatch = arg.match(/^(.*?)\s*(>>?)\s*(\S+)\s*$/);
    if (redirMatch && vfs) {
      const textOut = stripOuterQuotes(redirMatch[1]);
      const op = redirMatch[2];
      const target = redirMatch[3].startsWith('/') ? redirMatch[3] : ('/' + redirMatch[3]);
      const prev = op === '>>' ? String(vfs.read(target) || '') : '';
      vfs.write(target, prev + textOut + '\n');
      return { ok: true, mutated: true, output: 'Ditulis ke ' + target };
    }
    return { ok: true, output: stripOuterQuotes(arg) };
  }
  if (cmd === 'cat' || cmd === 'head' || cmd === 'tail' || cmd === 'wc') {
    const nonFlag = parts.slice(1).filter((p) => !p.startsWith('-')).join(' ').trim();
    if (!nonFlag) return { ok: false, output: 'Gunakan: ' + cmd + ' <nama-berkas>' };
    const path = normalizeVfsKey(vfs, nonFlag);
    const body = vfs ? vfs.read(path) : '';
    if (!body && vfs && !vfs.list().includes(path)) {
      return { ok: false, output: cmd + ': ' + nonFlag + ': Berkas tidak ditemukan di VFS' };
    }
    const text = String(body || '');
    const lines = text.split('\n');
    if (cmd === 'head') return { ok: true, output: lines.slice(0, 10).join('\n') };
    if (cmd === 'tail') return { ok: true, output: lines.slice(-10).join('\n') };
    if (cmd === 'wc') {
      const words = text.trim() ? text.trim().split(/\s+/).length : 0;
      return { ok: true, output: lines.length + ' baris, ' + words + ' kata, ' + text.length + ' byte (' + path + ')' };
    }
    return { ok: true, output: text };
  }
  if (cmd === 'grep') {
    if (!arg) return { ok: false, output: 'Gunakan: grep <pola>' };
    const flat = {};
    if (vfs && typeof vfs.list === 'function') {
      vfs.list().forEach((p) => { flat[p] = vfs.read(p); });
    }
    const hits = grepVfs(flat, arg);
    if (!hits.length) return { ok: true, output: 'Tidak ada baris yang cocok untuk "' + arg + '".' };
    return {
      ok: true,
      output: hits.map((h) => h.file + ':' + h.line + ': ' + h.text).join('\n'),
    };
  }
  if (cmd === 'touch' || cmd === 'mkdir') {
    if (!arg || !vfs) return { ok: false, output: 'Gunakan: ' + cmd + ' <path>' };
    const targetName = cmd === 'mkdir' ? (arg.replace(/\/+$/, '') + '/.keep') : arg;
    const path = targetName.startsWith('/') ? targetName : ('/' + targetName);
    vfs.write(path, vfs.read(path) || '');
    return { ok: true, mutated: true, output: 'Disiapkan di VFS: ' + path };
  }
  if (cmd === 'cp' || cmd === 'mv') {
    if (parts.length < 3 || !vfs) return { ok: false, output: 'Gunakan: ' + cmd + ' <asal> <tujuan>' };
    const srcPath = normalizeVfsKey(vfs, parts[1]);
    const dstPath = parts[2].startsWith('/') ? parts[2] : ('/' + parts[2]);
    if (!vfs.list().includes(srcPath)) return { ok: false, output: cmd + ': berkas asal tidak ditemukan: ' + srcPath };
    vfs.write(dstPath, vfs.read(srcPath) || '');
    if (cmd === 'mv' && srcPath !== '/index.html') vfs.remove(srcPath);
    return { ok: true, mutated: true, output: (cmd === 'mv' ? 'Dipindahkan: ' : 'Disalin: ') + srcPath + ' -> ' + dstPath };
  }
  if (cmd === 'rm') {
    const targetArg = parts.slice(1).filter((p) => !p.startsWith('-')).join(' ').trim();
    if (!targetArg || !vfs) return { ok: false, output: 'Gunakan: rm <path-berkas>' };
    const path = normalizeVfsKey(vfs, targetArg);
    if (path === '/index.html') return { ok: false, output: 'rm: /index.html adalah berkas utama dan tidak boleh dihapus.' };
    vfs.remove(path);
    return { ok: true, mutated: true, output: 'Berkas dihapus: ' + path };
  }
  if (cmd === 'git') {
    const sub = (parts[1] || 'status').toLowerCase();
    if (sub === 'log') {
      if (!git || !git.commits) return { ok: true, output: 'Belum ada commit di VfsGit.' };
      const rows = Array.from(git.commits.values()).sort((a, b) => b.time - a.time);
      if (!rows.length) return { ok: true, output: 'Belum ada commit.' };
      return {
        ok: true,
        output: rows.slice(0, 8).map((c) => 'commit ' + String(c.id).slice(0, 12) + ' — ' + (c.message || c.note || 'pembaruan')).join('\n'),
      };
    }
    if (sub === 'diff') {
      const target = parts[2] ? normalizeVfsKey(vfs, parts[2]) : '/index.html';
      const flatKey = target.replace(/^\//, '').replace(/^(css|js)\//, '');
      const beforeText = lastBefore[target] != null ? lastBefore[target] : (lastBefore[flatKey] || '');
      const afterText = vfs ? vfs.read(target) : '';
      const diff = diffLines(beforeText, afterText).filter((d) => d.kind !== 'same');
      if (!diff.length) return { ok: true, output: 'Tidak ada perubahan pada ' + target };
      return {
        ok: true,
        output: diff.map((d) => (d.kind === 'add' ? '+ ' : '- ') + d.text).join('\n'),
      };
    }
    const files = vfs ? vfs.list() : [];
    const dirty = files.filter((p) => {
      const flatKey = p.replace(/^\//, '').replace(/^(css|js)\//, '');
      const prev = lastBefore[p] != null ? lastBefore[p] : (lastBefore[flatKey] || '');
      return prev !== vfs.read(p);
    });
    return {
      ok: true,
      output: 'Cabang: main\nBerkas VFS: ' + files.length + '\nBerubah: ' + (dirty.length ? dirty.join(', ') : 'bersih (working tree clean)'),
    };
  }
  if (cmd === 'node' || cmd === 'js' || cmd === 'run') {
    let code = '';
    const inlineMatch = arg.match(/^(?:-e|--eval)\s+([\s\S]+)$/);
    if (inlineMatch) {
      code = stripOuterQuotes(inlineMatch[1]);
    } else {
      const target = normalizeVfsKey(vfs, arg || '/js/script.js');
      code = vfs ? vfs.read(target) : '';
      if (!code) return { ok: false, output: 'Berkas kosong atau tidak ditemukan: ' + target };
    }
    if (env.jsSandbox && typeof env.jsSandbox.run === 'function') {
      const res = await env.jsSandbox.run(code);
      const logs = Array.isArray(res.logs) && res.logs.length ? res.logs.join('\n') : '';
      if (res.ok) return { ok: true, output: logs || (res.value != null ? String(res.value) : '[Node Sandbox] Selesai (0 galat).') };
      if (/unsafe-eval|Content Security Policy|Evaluating a string|document is not defined|window is not defined/i.test(res.error || '')) {
        return { ok: true, output: logs || runSafeJsFallback(code) };
      }
      return { ok: false, output: (logs ? logs + '\n' : '') + 'Galat: ' + (res.error || 'eksekusi gagal') };
    }
  }
  if (cmd === 'python' || cmd === 'py' || cmd === 'python3') {
    let code = '';
    const inlineMatch = arg.match(/^-c\s+([\s\S]+)$/);
    if (inlineMatch) {
      code = stripOuterQuotes(inlineMatch[1]);
    } else {
      const target = normalizeVfsKey(vfs, arg || '/main.py');
      code = vfs ? vfs.read(target) : '';
      if (!code) return { ok: false, output: 'Berkas Python kosong atau tidak ditemukan: ' + target };
    }
    if (env.pySandbox && typeof env.pySandbox.run === 'function') {
      const res = await env.pySandbox.run(code);
      if (res.ok) return { ok: true, output: res.output || '[Python Sandbox] Selesai (0 galat).' };
      return { ok: false, output: (res.output ? res.output + '\n' : '') + 'Galat Python: ' + res.error };
    }
  }
  if (/^[0-9+\-*/().\s]+$/.test(raw)) {
    try {
      return { ok: true, output: String(runTerminal(raw)) };
    } catch (err) {
      return { ok: false, output: 'Galat ekspresi: ' + err.message };
    }
  }
  return {
    ok: false,
    output: 'Perintah "' + cmd + '" tidak dikenali. Ketik "help" untuk daftar perintah CLI Studio Kode.',
  };
}
