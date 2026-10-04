export const markdown = {
  escape(s) {
    return String(s)
      .replace(/&/g, '&')
      .replace(/</g, '<')
      .replace(/>/g, '>')
      .replace(/"/g, '"');
  },
  fence(lang, code) {
    const names = { js: 'JavaScript', javascript: 'JavaScript', json: 'JSON', py: 'Python', python: 'Python', html: 'HTML', css: 'CSS', sql: 'SQL', md: 'Markdown' };
    const label = names[lang] || (lang ? lang.toUpperCase() : 'Teks');
    const runnable = lang === 'js' || lang === 'javascript' || lang === 'json';
    const lines = String(code || '').split('\n');
    const body = lines.map((line, i) => '<span class="md-ln">' + (i + 1) + '</span><span class="md-src">' + this.escape(line) + '</span>').join('\n');
    const diff = lines.map((line) => {
      const kind = line.startsWith('+') ? 'add' : line.startsWith('-') ? 'del' : '';
      return '<span class="md-diff-line ' + kind + '">' + this.escape(line) + '</span>';
    }).join('');
    return '<div class="md-fence" data-lang="' + this.escape(lang || 'text') + '" data-run="' + (runnable ? '1' : '0') + '">'
      + '<div class="md-fence-bar"><span class="md-lang">' + this.escape(label) + '</span>'
      + '<button type="button" data-act="code">Kode Final</button>'
      + '<button type="button" data-act="diff">Tinjau Perubahan</button>'
      + (runnable ? '<button type="button" data-act="run">Uji Kode</button>' : '')
      + '</div><pre class="md-pre">' + body + '</pre><div class="md-diff" hidden>' + diff + '</div><pre class="md-console" hidden></pre>'
      + '<textarea class="md-raw" hidden>' + this.escape(code) + '</textarea></div>';
  },
  decorate(root) {
    if (!root || !root.querySelectorAll) return;
    root.querySelectorAll('.md-fence').forEach((box) => {
      if (box.dataset.ready) return;
      box.dataset.ready = '1';
      const pre = box.querySelector('.md-pre');
      const diff = box.querySelector('.md-diff');
      const term = box.querySelector('.md-console');
      const raw = box.querySelector('.md-raw');
      box.querySelectorAll('button').forEach((btn) => {
        btn.onclick = () => {
          const act = btn.getAttribute('data-act');
          if (act === 'code') {
            pre.hidden = false;
            diff.hidden = true;
          } else if (act === 'diff') {
            pre.hidden = true;
            diff.hidden = false;
          } else if (act === 'run') this.run(box.getAttribute('data-lang'), raw.value, term);
        };
      });
    });
  },
  run(lang, code, term) {
    if (!term) return;
    term.hidden = false;
    term.textContent = 'Menjalankan…';
    const source = lang === 'json'
      ? 'postMessage({ ok: true, text: JSON.stringify(JSON.parse(' + JSON.stringify(code) + '), null, 2) });'
      : 'self.onmessage = function (event) {'
        + 'var logs = [];'
        + 'var console = { log: function () { logs.push([].join.call(arguments, " ")); }, error: function () { logs.push([].join.call(arguments, " ")); } };'
        + 'try { var result = Function("\\"use strict\\";\\n" + event.data)();'
        + 'if (result !== undefined) logs.push(String(result));'
        + 'self.postMessage({ ok: true, text: logs.join("\\n") || "(tanpa keluaran)" }); }'
        + 'catch (e) { self.postMessage({ ok: false, text: String(e && e.message || e) }); }'
        + '};';
    let worker;
    try {
      const url = URL.createObjectURL(new Blob([lang === 'json' ? '' : source], { type: 'text/javascript' }));
      if (lang === 'json') {
        const pretty = JSON.stringify(JSON.parse(code), null, 2);
        term.textContent = pretty;
        return;
      }
      worker = new Worker(url);
      const timer = setTimeout(() => {
        worker.terminate();
        term.textContent = 'Waktu habis';
        URL.revokeObjectURL(url);
      }, 1500);
      worker.onmessage = (event) => {
        clearTimeout(timer);
        const data = event.data || {};
        term.textContent = data.text || (data.ok ? '(tanpa keluaran)' : 'Gagal');
        worker.terminate();
        URL.revokeObjectURL(url);
      };
      worker.onerror = () => {
        clearTimeout(timer);
        term.textContent = 'Kode gagal dijalankan';
        worker.terminate();
        URL.revokeObjectURL(url);
      };
      worker.postMessage(code);
    } catch (e) {
      term.textContent = e && e.message ? e.message : 'Gagal';
      if (worker) worker.terminate();
    }
  },
  render(text) {
    const fences = [];
    let src = String(text || '');
    src = src.replace(/```([\s\S]*?)```/g, (m, raw) => {
      let lang = '';
      let code = String(raw || '').replace(/^\n+|\n+$/g, '');
      const cut = code.indexOf('\n');
      if (cut >= 0 && cut < 20 && /^[a-z0-9#+.-]+$/i.test(code.slice(0, cut))) {
        lang = code.slice(0, cut).toLowerCase();
        code = code.slice(cut + 1);
      }
      fences.push(this.fence(lang, code));
      return ' F' + (fences.length - 1) + ' ';
    });
    let out = this.escape(src);
    out = out.replace(/`([^`\n]+)`/g, '<code class="md-code">$1</code>');
    out = out.replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>');
    out = out.replace(/^#{1,3}\s+(.+)$/gm, '<strong class="md-h">$1</strong>');
    out = out.replace(/(^|\n)[ \t]*[-•][ \t]+(.*)/g, '<div class="md-li-row"><span class="md-li">•</span> $2</div>');
    out = out.replace(/(^|\n)[ \t]*(\d+)\.[ \t]+(.*)/g, '<div class="md-li-row"><span class="md-li">$2.</span> $3</div>');
    out = out.replace(/(^|\n)Sumber::([^|\n]+)\|(https?:\/\/\S+)/g, '$1<div class="md-cite"><span class="md-cite-k">Sumber</span><a class="md-link" href="$3" target="_blank" rel="noopener noreferrer">$2</a></div>');
    out = out.replace(/(^|\n)\(Sumber:\s*([^)]+)\)/g, '$1<div class="md-cite"><span class="md-cite-k">Sumber</span><span>$2</span></div>');
    out = out.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a class="md-link" href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    out = out.replace(/\bhttps?:\/\/[^\s<]+/g, (m, off, str) => {
      if (/href=["']$/.test(str.slice(Math.max(0, off - 6), off))) return m;
      const trailing = m.match(/[).,;:!?]+$/);
      const url = trailing ? m.slice(0, -trailing[0].length) : m;
      const rest = trailing ? trailing[0] : '';
      if (!url) return m;
      return '<a class="md-link" href="' + url + '" target="_blank" rel="noopener noreferrer">' + url + '</a>' + rest;
    });
    out = out.replace(/ F(\d+) /g, (m, i) => fences[Number(i)]);
    return out;
  },
};
