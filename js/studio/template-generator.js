function page(title, body) {
  return '<!doctype html><html><head><meta charset="utf-8"><title>' + title + '</title></head><body>' + body + '</body></html>\n';
}

export function scaffoldProject(kind) {
  const name = String(kind || 'form');
  if (name === 'dashboard') {
    return {
      'index.html': page('Dasbor', '<h1>Dasbor</h1><svg id="chart"></svg>'),
      'style.css': 'body{margin:24px;font-family:sans-serif}\n',
      'script.js': 'var data=[1,2,3];\n',
    };
  }
  if (name === 'spa') {
    return {
      'index.html': page('Aplikasi', '<main id="app"></main>'),
      'style.css': 'body{margin:0;font-family:sans-serif}\n',
      'script.js': 'document.getElementById("app").textContent="siap";\n',
    };
  }
  return {
    'index.html': page('Formulir', '<form id="form"><input id="nama" name="nama"><button type="submit">Kirim</button></form><ul id="daftar"></ul>'),
    'style.css': 'body{margin:24px;font-family:sans-serif}\n',
    'script.js': 'document.getElementById("form").onsubmit=function(e){e.preventDefault();};\n',
  };
}
