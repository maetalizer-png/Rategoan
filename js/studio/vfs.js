const FORBIDDEN_SEGMENTS = new Set(['..', '.', '.git', '.env', 'node_modules', '__pycache__']);

function mimeOf(path) {
  if (/\.html?$/i.test(path)) return 'text/html';
  if (/\.css$/i.test(path)) return 'text/css';
  if (/\.py$/i.test(path)) return 'text/x-python';
  return 'text/javascript';
}

export function vfsPath(rawPath) {
  const str = String(rawPath || '').replace(/\\/g, '/');
  if (str.indexOf('\0') >= 0) throw new Error('Path memuat null byte terlarang');
  if (str.length > 4096) throw new Error('Path terlalu besar');
  const segments = str.split('/').filter(Boolean);
  const safe = [];
  for (let i = 0; i < segments.length; i += 1) {
    const seg = segments[i];
    if (FORBIDDEN_SEGMENTS.has(seg.toLowerCase())) {
      throw new Error('Segmen path terlarang: "' + seg + '"');
    }
    const clean = seg.replace(/[\x00-\x1f\x7f]/g, '');
    if (clean) safe.push(clean);
  }
  const normalized = safe.join('/');
  if (normalized === 'style.css') return '/css/style.css';
  if (normalized === 'script.js') return '/js/script.js';
  if (!normalized) return '/';
  return '/' + normalized;
}

export function createVfs(seed) {
  const rows = Object.create(null);
  function write(path, content) {
    const key = vfsPath(path);
    rows[key] = {
      content: String(content == null ? '' : content),
      mime: mimeOf(key),
      updatedAt: Date.now(),
    };
    return rows[key];
  }
  function read(path) {
    const row = rows[vfsPath(path)];
    return row ? row.content : '';
  }
  function remove(path) {
    delete rows[vfsPath(path)];
  }
  function list() {
    return Object.keys(rows).filter((path) => path !== '/').sort();
  }
  function load(entries) {
    (entries || []).forEach((row) => {
      if (!row || !row.path) return;
      write(row.path, row.content || '');
      if (row.updatedAt) rows[vfsPath(row.path)].updatedAt = row.updatedAt;
    });
  }
  function flat() {
    return {
      'index.html': read('/index.html'),
      'style.css': read('/css/style.css'),
      'script.js': read('/js/script.js'),
      'main.py': read('/main.py'),
    };
  }
  function bundle() {
    const out = {};
    list().forEach((path) => {
      out[path.replace(/^\//, '')] = read(path);
    });
    return out;
  }
  function previewMap() {
    const out = flat();
    list().forEach((path) => {
      const rel = path.replace(/^\//, '');
      if (rel === 'index.html' || rel === 'css/style.css' || rel === 'js/script.js' || rel === 'main.py') return;
      out[rel] = read(path);
    });
    return out;
  }
  function snapshot() {
    return list().map((path) => ({
      path,
      content: rows[path].content,
      mime: rows[path].mime,
      updatedAt: rows[path].updatedAt,
    }));
  }
  function reset(next) {
    Object.keys(rows).forEach((key) => { delete rows[key]; });
    Object.keys(next || {}).forEach((path) => write(path, next[path]));
  }
  Object.keys(seed || {}).forEach((path) => write(path, seed[path]));
  return { write, read, remove, list, load, flat, bundle, previewMap, snapshot, reset };
}

export function createEphemeralWorkspace(seed) {
  const vfs = createVfs(seed);
  let alive = true;
  return {
    vfs,
    read(path) { return alive ? vfs.read(path) : ''; },
    write(path, body) { return alive ? vfs.write(path, body) : null; },
    close() {
      alive = false;
      vfs.reset({});
    },
  };
}
