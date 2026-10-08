function mimeOf(path) {
  if (/\.html?$/i.test(path)) return 'text/html';
  if (/\.css$/i.test(path)) return 'text/css';
  if (/\.py$/i.test(path)) return 'text/x-python';
  return 'text/javascript';
}

export function vfsPath(path) {
  const raw = String(path || '').replace(/\\/g, '/').replace(/^\.?\//, '');
  if (raw === 'style.css') return '/css/style.css';
  if (raw === 'script.js') return '/js/script.js';
  if (!raw) return '/';
  return '/' + raw;
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
  function snapshot() {
    return list().map((path) => ({
      path,
      content: rows[path].content,
      mime: rows[path].mime,
      updatedAt: rows[path].updatedAt,
    }));
  }
  function reset(seed) {
    Object.keys(rows).forEach((key) => { delete rows[key]; });
    Object.keys(seed || {}).forEach((path) => write(path, seed[path]));
  }
  Object.keys(seed || {}).forEach((path) => write(path, seed[path]));
  return { write, read, list, load, flat, bundle, snapshot, reset };
}
