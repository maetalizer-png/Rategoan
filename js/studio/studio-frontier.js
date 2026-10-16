export function highlightCode(source, lang) {
  const text = String(source || '');
  const kind = String(lang || 'txt');
  const escaped = text.replace(/[&<>]/g, (ch) => {
    if (ch === '&') return '&' + 'amp;';
    if (ch === '<') return '&' + 'lt;';
    return '&' + 'gt;';
  });
  let html = escaped;
  if (kind === 'js' || kind === 'javascript') {
    html = escaped.replace(/\b(const|let|function|return|if|else)\b/g, '<span class="tok-key">$1</span>');
  } else if (kind === 'css') {
    html = escaped.replace(/([.#]?[a-zA-Z_-][\w-]*)\s*\{/g, '<span class="tok-key">$1</span>{');
  } else if (kind === 'html') {
    html = escaped.replace(/(<\/?)([a-zA-Z0-9-]+)/g, '$1<span class="tok-key">$2</span>');
  } else if (kind === 'json') {
    html = escaped.replace(/(".*?")(\s*:)/g, '<span class="tok-key">$1</span>$2');
  }
  return { lang: kind, html, lines: text.split('\n').length };
}

export function langOf(path) {
  const name = String(path || '');
  if (/\.css$/i.test(name)) return 'css';
  if (/\.html?$/i.test(name)) return 'html';
  if (/\.json$/i.test(name)) return 'json';
  if (/\.js$/i.test(name)) return 'js';
  return 'txt';
}

export function bundleStandalone(files) {
  const map = files || {};
  const html = String(map['index.html'] || map['/index.html'] || '<!doctype html><html><head></head><body></body></html>');
  const css = String(map['style.css'] || map['/css/style.css'] || map['css/style.css'] || '');
  const js = String(map['script.js'] || map['/js/script.js'] || map['js/script.js'] || '');
  const style = '<style>' + css.replace(/<\/style/gi, '<\\/style') + '</style>';
  const script = '<script>' + js.replace(/<\/script/gi, '<\\/script') + '<\/script>';
  if (/<\/head>/i.test(html)) {
    return html.replace(/<\/head>/i, style + '</head>').replace(/<\/body>/i, script + '</body>');
  }
  return '<!doctype html><html><head>' + style + '</head><body>' + html + script + '</body></html>';
}

export function buildPwaPack(name, files) {
  const title = String(name || 'Studio');
  const manifest = {
    name: title,
    display: 'standalone',
    start_url: './index.html',
    icons: [],
  };
  const sw = 'self.addEventListener("install",function(e){e.waitUntil(caches.open("studio-pwa").then(function(c){return c.addAll(["./index.html","./css/style.css","./js/script.js"]);}));});'
    + 'self.addEventListener("fetch",function(e){e.respondWith(caches.match(e.request).then(function(r){return r||fetch(e.request);}));});';
  return { manifest, sw, index: bundleStandalone(files) };
}

export function buildVirtualImportMap(files, createUrl) {
  const map = files || {};
  const make = typeof createUrl === 'function'
    ? createUrl
    : (body, spec) => 'blob:rategoan/' + spec + '/' + String(body || '').length;
  const imports = {
    react: 'blob:rategoan/vendor/react',
    tailwindcss: 'blob:rategoan/vendor/tailwind',
    lucide: 'blob:rategoan/vendor/lucide',
    'chart.js': 'blob:rategoan/vendor/chart',
  };
  Object.keys(map).forEach((path) => {
    if (!/\.js$/i.test(path)) return;
    const spec = './' + String(path).replace(/^\//, '');
    imports[spec] = make(String(map[path] || ''), spec);
  });
  return { imports };
}

export function importMapTag(imports) {
  return '<script type="importmap">' + JSON.stringify({ imports: imports || {} }) + '<\/script>';
}

export function astOutline(source) {
  const text = String(source || '');
  const nodes = [];
  const re = /\bfunction\s+([A-Za-z_$][\w$]*)|\bclass\s+([A-Za-z_$][\w$]*)/g;
  let match = re.exec(text);
  while (match) {
    nodes.push(match[1] || match[2]);
    match = re.exec(text);
  }
  return nodes;
}

export function streamCode(state, token) {
  const previous = state && state.text ? state.text : '';
  const next = previous + String(token || '');
  return {
    text: next,
    plan: morphPlan(previous, next),
    outline: astOutline(next),
    blanked: false,
  };
}

export function paintStream(manual, highlight, state) {
  if (!manual || !state) return state;
  if (manual.value !== state.text) manual.value = state.text;
  if (highlight) highlight.innerHTML = highlightCode(state.text, 'js').html;
  return state;
}

export function quotaAllows(freeBytes, needBytes) {
  const free = Number(freeBytes) || 0;
  const need = Number(needBytes) || 0;
  return { ok: free >= need, free, need };
}

export function morphPlan(previous, next) {
  const before = String(previous || '');
  const after = String(next || '');
  if (before === after) return { changed: false, keep: before.length, replace: 0 };
  let i = 0;
  const limit = Math.min(before.length, after.length);
  while (i < limit && before[i] === after[i]) i += 1;
  return { changed: true, keep: i, replace: after.length - i };
}

export function mountStudioFrontier(ctx) {
  const root = ctx || {};
  const vfs = root.vfs;
  const git = root.git;
  const q = typeof root.$ === 'function' ? root.$ : (id) => document.getElementById(id);
  if (!vfs || typeof document === 'undefined') return { ok: false };

  const manual = q('code-manual');
  const pre = q('code-editor');
  const gutter = q('code-gutter');
  const highlight = q('code-highlight');
  const slider = q('commit-slider');
  const frame = q('studio-preview-frame');

  function pathNow() {
    return typeof root.getPath === 'function' ? root.getPath() : '/js/script.js';
  }

  function paintGutter(text) {
    if (!gutter) return;
    const n = String(text || '').split('\n').length;
    const rows = [];
    for (let i = 1; i <= n; i += 1) rows.push(String(i));
    gutter.textContent = rows.join('\n');
  }

  function paintHighlight() {
    if (!highlight || !manual || manual.hidden) return;
    const painted = highlightCode(manual.value, langOf(pathNow()));
    highlight.innerHTML = painted.html;
  }

  function releaseInspect() {
    if (document.body.dataset.inspect !== '1') return;
    document.body.dataset.inspect = '0';
    const inspect = q('btn-inspect-dom');
    if (!inspect) return;
    inspect.setAttribute('aria-pressed', 'false');
    inspect.classList.remove('is-on');
  }

  function setMode(mode) {
    const isEdit = mode === 'edit';
    document.body.dataset.editorMode = isEdit ? 'edit' : 'diff';
    const diffBtn = q('btn-mode-diff');
    const editBtn = q('btn-mode-edit');
    if (diffBtn) diffBtn.classList.toggle('is-active', !isEdit);
    if (editBtn) editBtn.classList.toggle('is-active', isEdit);
    if (isEdit) releaseInspect();
    if (typeof root.paintTree === 'function') root.paintTree();
  }

  if (manual) {
    manual.addEventListener('input', () => {
      releaseInspect();
      paintGutter(manual.value);
      paintHighlight();
    });
    manual.addEventListener('keydown', (event) => {
      if (!(event.ctrlKey || event.metaKey) || event.key !== 's') return;
      event.preventDefault();
      vfs.write(pathNow(), manual.value);
      if (typeof root.paintTree === 'function') root.paintTree();
    });
  }

  const bindClick = (id, run) => {
    const btn = q(id);
    if (btn) btn.addEventListener('click', run);
  };

  bindClick('btn-mode-diff', () => setMode('diff'));
  bindClick('btn-mode-edit', () => setMode('edit'));
  bindClick('btn-file-add', () => {
    const box = q('file-name');
    const raw = box && box.value ? box.value : ('/js/berkas-' + Date.now().toString(36) + '.js');
    try {
      vfs.write(raw, '');
      if (typeof root.setPath === 'function') root.setPath(raw.startsWith('/') ? raw : '/' + raw);
      if (typeof root.paintTree === 'function') root.paintTree();
    } catch (error) {
      if (typeof root.appendConsole === 'function') root.appendConsole('Berkas ditolak: ' + (error && error.message ? error.message : 'kuota'));
    }
  });
  bindClick('btn-file-rename', () => {
    const box = q('file-name');
    const next = box && box.value ? box.value : '';
    if (!next) return;
    const cur = pathNow();
    const body = vfs.read(cur);
    try {
      vfs.write(next, body);
      vfs.remove(cur);
      if (typeof root.setPath === 'function') root.setPath(next.startsWith('/') ? next : '/' + next);
      if (typeof root.paintTree === 'function') root.paintTree();
    } catch (error) {
      if (typeof root.appendConsole === 'function') root.appendConsole('Ubah nama ditolak');
    }
  });
  bindClick('btn-file-del', () => {
    const cur = pathNow();
    if (cur === '/index.html') return;
    vfs.remove(cur);
    if (typeof root.setPath === 'function') root.setPath('/js/script.js');
    if (typeof root.paintTree === 'function') root.paintTree();
  });

  function setWidth(px) {
    if (!frame) return;
    frame.style.width = px + 'px';
    frame.style.maxWidth = '100%';
    frame.style.height = px < 500 ? '700px' : '100%';
  }
  bindClick('btn-view-390', () => setWidth(390));
  bindClick('btn-view-768', () => setWidth(768));
  bindClick('btn-view-1200', () => setWidth(1200));
  bindClick('btn-view-full', () => {
    if (!frame) return;
    frame.style.width = '100%';
    frame.style.maxWidth = '100%';
    frame.style.height = '100%';
  });
  bindClick('btn-view-rotate', () => {
    if (!frame) return;
    const w = parseInt(frame.style.width, 10) || 390;
    const h = parseInt(frame.style.height, 10) || 700;
    frame.style.width = h + 'px';
    frame.style.height = w + 'px';
  });

  function filesFlat() {
    const out = {};
    vfs.list().forEach((path) => { out[path.replace(/^\//, '')] = vfs.read(path); });
    return out;
  }

  function downloadText(filename, text, type) {
    const blob = new Blob([text], { type: type || 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 400);
  }

  bindClick('btn-export-html', () => {
    downloadText('studio.html', bundleStandalone(filesFlat()), 'text/html');
  });
  bindClick('btn-pwa-pack', () => {
    const pack = buildPwaPack('Studio', filesFlat());
    downloadText('manifest.json', JSON.stringify(pack.manifest, null, 2), 'application/json');
  });

  function commits() {
    if (!git || !git.commits) return [];
    return Array.from(git.commits.values()).sort((a, b) => a.time - b.time);
  }

  function paintSlider() {
    if (!slider) return;
    const rows = commits();
    slider.max = String(Math.max(0, rows.length - 1));
    slider.value = slider.max;
  }

  bindClick('btn-rollback', () => {
    const rows = commits();
    if (!rows.length || !slider) return;
    const row = rows[Math.max(0, Math.min(rows.length - 1, Number(slider.value) || 0))];
    const files = git.checkout(row.id);
    if (!files) return;
    Object.keys(files).forEach((path) => {
      try { vfs.write(path, files[path]); } catch (e) { void e; }
    });
    if (typeof root.paintTree === 'function') root.paintTree();
    if (typeof root.showPreview === 'function') root.showPreview();
    if (typeof root.appendConsole === 'function') root.appendConsole('Kembali ke ' + String(row.id).slice(0, 12));
  });

  if (slider) slider.addEventListener('input', paintSlider);
  paintSlider();
  return { ok: true, paintSlider, setMode };
}
