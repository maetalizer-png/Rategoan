import { $ } from '../../shared/dom.js';
import { router } from '../core/router.js';
import { artifact } from '../ui/artifact.js';
import { jsSandbox } from '../../vault/code/js-sandbox.js';
import { zipStore, healScript, mountPreview } from './sandbox-runner.js';
import { toast } from '../core/toast.js';
import { drawer } from '../ui/drawer.js';
import { workspace } from '../state/workspace.js';
import { indexPinned } from '../project/pin-index.js';
import { listZipEntries, readZipText } from '../../shared/zip-local.js';
import { idbGateway } from '../../raget/raget-database/idb-gateway.js';
import { craftInstruction, wantsPublish, publishOnly, wantsPull, pushGithub, pullGithub, commitNote } from './studio-agent.js';

const SAMPLE = 'function jumlah(a, b) {\n  return a + b;\n}\n\nconsole.log(jumlah(2, 3));\njumlah(2, 3);';
const WEB = {
  'index.html': '<!doctype html>\n<html>\n<head></head>\n<body>\n  <h1>Halo</h1>\n</body>\n</html>\n',
  'style.css': 'body { font-family: sans-serif; margin: 24px; }\nh1 { color: #1a4b8c; }\n',
  'script.js': SAMPLE,
};
let cm = null;
let pyPromise = null;
let lang = 'javascript';
let webFile = 'script.js';
let pythonCode = 'print("halo")\n';
let baseline = '';

function editor() {
  return $('studio-editor');
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-src="' + src + '"]');
    if (existing) { resolve(); return; }
    const script = document.createElement('script');
    script.src = src;
    script.dataset.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('gagal memuat ' + src));
    document.head.appendChild(script);
  });
}

function loadStyle(href) {
  if (document.querySelector('link[data-href="' + href + '"]')) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  link.dataset.href = href;
  document.head.appendChild(link);
}

async function ensureEditor() {
  const area = editor();
  if (!area || cm) return;
  try {
    loadStyle('https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.18/codemirror.min.css');
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.18/codemirror.min.js');
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.18/mode/javascript/javascript.min.js');
    if (!globalThis.CodeMirror) return;
    cm = globalThis.CodeMirror.fromTextArea(area, {
      lineNumbers: true,
      mode: lang,
      extraKeys: {
        'Ctrl-Enter': () => { const run = $('studio-run'); if (run) run.click(); },
        'Cmd-Enter': () => { const run = $('studio-run'); if (run) run.click(); },
      },
    });
    cm.on('change', paintDirty);
  } catch (e) {
    cm = null;
  }
}

function showConsole(text, ms) {
  const out = $('studio-console');
  const status = $('studio-terminal-status');
  if (status) {
    status.textContent = ms == null ? 'Konsol' : 'Selesai dalam ' + ms + ' ms';
    status.classList.toggle('studio-status-ok', ms != null);
  }
  if (!out) return;
  out.hidden = false;
  out.textContent = text;
}

function rememberEditor() {
  const text = codeText();
  if (lang === 'python') pythonCode = text;
  else WEB[webFile] = text;
}

const clean = {};

function activeFileName() {
  return lang === 'python' ? 'main.py' : webFile;
}

function storedFile(name) {
  return name === 'main.py' ? pythonCode : (WEB[name] || '');
}

function paintDirty() {
  const live = activeFileName();
  document.querySelectorAll('#studio-files [data-studio-file]').forEach((btn) => {
    const name = btn.dataset.studioFile;
    const label = btn.querySelector('.studio-file-name');
    if (!label) return;
    const value = name === live ? codeText() : storedFile(name);
    const dirty = clean[name] != null && value !== clean[name];
    btn.classList.toggle('is-dirty', dirty);
    label.textContent = name + (dirty ? '*' : '');
  });
}

function writeEditor(text, mode) {
  const area = editor();
  baseline = String(text || '');
  if (cm) {
    cm.setValue(text);
    cm.setOption('mode', mode);
  } else if (area) area.value = text;
  const name = activeFileName();
  if (clean[name] == null) clean[name] = String(text || '');
  paintDirty();
}

function escapeHtml(value) {
  return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function diffLines(before, after) {
  const a = String(before || '').split('\n');
  const b = String(after || '').split('\n');
  const n = a.length;
  const m = b.length;
  if (n * m > 20000) return [{ kind: 'add', text: after }];
  const dp = Array.from({ length: n + 1 }, () => new Uint16Array(m + 1));
  for (let i = n - 1; i >= 0; i -= 1) {
    for (let j = m - 1; j >= 0; j -= 1) {
      dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  const out = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      out.push({ kind: '', text: a[i] });
      i += 1;
      j += 1;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      out.push({ kind: 'del', text: '- ' + a[i] });
      i += 1;
    } else {
      out.push({ kind: 'add', text: '+ ' + b[j] });
      j += 1;
    }
  }
  while (i < n) { out.push({ kind: 'del', text: '- ' + a[i] }); i += 1; }
  while (j < m) { out.push({ kind: 'add', text: '+ ' + b[j] }); j += 1; }
  return out;
}

function codeText() {
  if (cm) return cm.getValue();
  const area = editor();
  return area ? area.value : '';
}

export const studioPage = {
  paint() {
    const el = editor();
    if (el && !el.value.trim()) el.value = WEB[webFile] || SAMPLE;
    ensureEditor();
    if (!baseline) baseline = codeText();
  },
  bind() {
    const back = $('studio-back');
    if (back) back.onclick = () => router.go('chat');
    const run = $('studio-run');
    if (run) run.onclick = async () => {
      const started = performance.now();
      if (lang === 'python') {
        await this.runPython();
        const status = $('studio-terminal-status');
        if (status) status.textContent = 'Selesai dalam ' + Math.round(performance.now() - started) + ' ms';
        return;
      }
      rememberEditor();
      const code = WEB['script.js'] || codeText();
      const res = await jsSandbox.run(code);
      const body = res.ok
        ? ((res.logs || []).join('\n') + (res.value ? '\n\u2192 ' + res.value : '')).trim() || 'Selesai.'
        : ('Gagal: ' + (res.error || 'error'));
      showConsole(body, Math.round(performance.now() - started));
      const studioView = $('view-studio');
      if (studioView && window.matchMedia('(max-width: 1023px)').matches) {
        studioView.classList.remove('pane-editor', 'pane-preview');
        studioView.classList.add('pane-console');
      }
    };
    const view = $('view-studio');
    document.querySelectorAll('#studio-panes button').forEach((btn) => {
      btn.onclick = () => {
        if (!view) return;
        view.classList.remove('pane-editor', 'pane-preview', 'pane-console');
        view.classList.add('pane-' + btn.dataset.pane);
        document.querySelectorAll('#studio-panes button').forEach((other) => other.classList.toggle('on', other === btn));
        if (btn.dataset.pane === 'preview') {
          rememberEditor();
          const frame = $('studio-preview-frame');
          if (frame) {
            frame.hidden = false;
            mountPreview(frame, WEB);
          }
        }
        if (btn.dataset.pane === 'console') {
          const out = $('studio-console');
          if (out && !out.textContent.trim()) out.textContent = 'Belum ada keluaran konsol. Ketuk Jalankan untuk mengeksekusi kode.';
        }
      };
    });
    if (view && !view.classList.contains('pane-editor')) view.classList.add('pane-editor');
    const tabJs = $('studio-tab-js');
    const tabPy = $('studio-tab-py');
    const pick = (next) => {
      rememberEditor();
      lang = next;
      if (tabJs) tabJs.classList.toggle('on', next === 'javascript');
      if (tabPy) tabPy.classList.toggle('on', next === 'python');
      const files = $('studio-files');
      const previewBtn = $('studio-preview');
      if (files) files.hidden = false;
      document.querySelectorAll('[data-studio-file]').forEach((btn) => {
        const py = btn.dataset.studioKind === 'python';
        btn.hidden = next === 'python' ? !py : py;
        if (next === 'python') btn.classList.toggle('on', py);
      });
      if (previewBtn) previewBtn.hidden = next === 'python';
      writeEditor(next === 'python' ? pythonCode : (WEB[webFile] || ''), next === 'python' ? 'python' : 'javascript');
    };
    if (tabJs) tabJs.onclick = () => pick('javascript');
    if (tabPy) tabPy.onclick = () => pick('python');
    document.querySelectorAll('[data-studio-file]').forEach((btn) => {
      btn.onclick = (event) => {
        if (event.target.closest('[data-close]')) {
          const visible = Array.from(document.querySelectorAll('#studio-files [data-studio-file]')).filter((other) => other !== btn && !other.hidden);
          if (!visible.length) return;
          btn.hidden = true;
          if (btn.classList.contains('on')) visible[0].click();
          return;
        }
        rememberEditor();
        if (btn.dataset.studioKind === 'python') {
          pick('python');
          return;
        }
        lang = 'javascript';
        webFile = btn.dataset.studioFile;
        if (tabJs) tabJs.classList.add('on');
        if (tabPy) tabPy.classList.remove('on');
        document.querySelectorAll('[data-studio-file]').forEach((other) => other.classList.toggle('on', other === btn));
        const mode = webFile.endsWith('.css') ? 'css' : (webFile.endsWith('.html') ? 'htmlmixed' : 'javascript');
        writeEditor(WEB[webFile] || '', mode);
      };
    });
    const zipBtn = $('studio-zip');
    if (zipBtn) zipBtn.onclick = () => {
      rememberEditor();
      const bytes = zipStore(WEB);
      const blob = new Blob([bytes], { type: 'application/zip' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'studio-rategoan.zip';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 500);
      toast.show('Zip proyek diunduh');
    };
    const copyBtn = $('studio-copy');
    if (copyBtn) copyBtn.onclick = () => {
      const text = codeText();
      if (navigator.clipboard) navigator.clipboard.writeText(text).then(() => toast.show('Kode disalin'));
    };
    const diffBtn = $('studio-diff');
    if (diffBtn) diffBtn.onclick = () => {
      const view = $('studio-diff-view');
      if (!view) return;
      view.hidden = !view.hidden;
      if (view.hidden) return;
      const rows = diffLines(baseline, codeText());
      view.innerHTML = rows.map((row) => '<span class="md-diff-line ' + row.kind + '">' + escapeHtml(row.text) + '</span>').join('');
    };
    const folderBtn = $('studio-folder');
    const openZip = $('studio-open-zip');
    const showZipList = async (file) => {
      const list = $('studio-folder-list');
      if (!list || !file) return;
      const bytes = new Uint8Array(await file.arrayBuffer());
      const entries = listZipEntries(bytes).filter((entry) => entry.name && !entry.name.endsWith('/')).slice(0, 24);
      list.innerHTML = '';
      list.hidden = false;
      entries.forEach((entry) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.textContent = entry.name;
        btn.onclick = async () => {
          try {
            const text = await readZipText(bytes, entry.name);
            const name = entry.name;
            const mode = name.endsWith('.py') ? 'python' : (name.endsWith('.css') ? 'css' : (name.endsWith('.html') ? 'htmlmixed' : 'javascript'));
            writeEditor(text, mode);
            toast.show(name);
          } catch (e) { console.warn('[Rategoan Fallback] Studio:', e); }
        };
        list.appendChild(btn);
      });
      if (!entries.length) toast.show('ZIP tidak berisi berkas teks');
    };
    if (openZip) openZip.onchange = () => {
      const file = openZip.files && openZip.files[0];
      if (file) showZipList(file);
      openZip.value = '';
    };
    if (folderBtn) folderBtn.onclick = async () => {
      if (typeof window.showDirectoryPicker !== 'function') {
        if (openZip) openZip.click();
        else toast.show('Peramban ini tidak membuka folder lokal');
        return;
      }
      let dir;
      try { dir = await window.showDirectoryPicker(); } catch (e) {
        console.warn('[Rategoan Fallback] Studio:', e);
        return;
      }
      const list = $('studio-folder-list');
      if (!list) return;
      list.innerHTML = '';
      list.hidden = false;
      try {
        for await (const [name, handle] of dir.entries()) {
          if (handle.kind !== 'file' || list.children.length >= 24) continue;
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.textContent = name;
          btn.onclick = async () => {
            try {
              const file = await handle.getFile();
              const text = await file.text();
              const mode = name.endsWith('.py') ? 'python' : (name.endsWith('.css') ? 'css' : (name.endsWith('.html') ? 'htmlmixed' : 'javascript'));
              writeEditor(text, mode);
              toast.show(name);
            } catch (e) { console.warn('[Rategoan Fallback] Studio:', e); }
          };
          list.appendChild(btn);
        }
      } catch (e) { console.warn('[Rategoan Fallback] Studio:', e); }
    };
    const editorBox = $('studio-editor');
    if (editorBox) {
      editorBox.addEventListener('input', paintDirty);
      editorBox.addEventListener('keydown', (event) => {
        if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
          event.preventDefault();
          if (run) run.click();
        }
      });
    }
    const pin = $('studio-pin-project');
    if (pin) pin.onclick = () => {
      const cur = workspace.current();
      if (!cur) {
        toast.show('Pilih atau buat proyek dulu');
        return;
      }
      const name = activeFileName();
      const text = codeText();
      const pinned = (cur.pinnedFiles || []).filter((item) => item.name !== name);
      pinned.push({ name, textContent: text.slice(0, 4000), size: text.length });
      workspace.update(cur.id, { pinnedFiles: pinned.slice(-12) });
      indexPinned(cur, pinned);
      toast.show('Disematkan ke proyek ' + cur.name);
    };
    document.addEventListener('rategoan:studio-code', (event) => {
      const code = (event.detail && event.detail.code) || '';
      const codeLang = (event.detail && event.detail.lang) || '';
      sessionStorage.setItem('rategoan_studio_seed', JSON.stringify({ code, lang: codeLang }));
      location.href = 'studio.html';
    });
    const toArt = $('studio-to-artifact');
    if (toArt) toArt.onclick = () => {
      artifact.open({ type: 'code', code: codeText(), title: 'Cuplikan studio', fileName: 'studio.js' }, 'Cuplikan studio', 'studio.js');
      toast.show('Kode dibuka sebagai artefak');
      router.go('chat');
    };
    const clear = $('studio-clear');
    if (clear) clear.onclick = () => showConsole('', null);
    const py = $('studio-py');
    if (py) py.onclick = () => this.runPython();
    let healTries = 0;
    window.addEventListener('message', (event) => {
      const frame = $('studio-preview-frame');
      if (!frame || event.source !== frame.contentWindow) return;
      if (event.origin !== 'null' && event.origin !== location.origin) return;
      const data = event.data || {};
      if (data.type !== 'studio:error' || healTries >= 3) return;
      const now = codeText();
      const next = healScript(now, data.error || {});
      if (!next || next === now) return;
      healTries += 1;
      writeEditor(next, 'javascript');
      rememberEditor();
      mountPreview(frame, WEB);
    });
    const preview = $('studio-preview');
    if (preview) preview.onclick = () => {
      rememberEditor();
      const frame = $('studio-preview-frame');
      if (!frame) return;
      frame.hidden = false;
      mountPreview(frame, WEB);
      const studioView = $('view-studio');
      if (studioView && window.matchMedia('(max-width: 1023px)').matches) {
        studioView.classList.remove('pane-editor', 'pane-console');
        studioView.classList.add('pane-preview');
        document.querySelectorAll('#studio-panes button').forEach((other) => other.classList.toggle('on', other.dataset.pane === 'preview'));
      }
    };
    const open = $('studio-open-panel');
    if (open) open.onclick = () => {
      const code = codeText();
      artifact.open({ type: 'code', code: code, lang: 'js', title: 'Studio', fileName: 'studio.js' }, 'Studio');
    };
    const side = $('btn-studio');
    if (side) side.onclick = () => {
      drawer.close();
      this.paint();
      router.go('studio');
    };
    const log = $('studio-messages');
    const say = (cls, text) => {
      if (!log) return;
      const line = document.createElement('div');
      line.className = cls;
      line.textContent = text;
      log.appendChild(line);
      log.scrollTop = log.scrollHeight;
    };
    const persist = () => idbGateway.setList('studio-vfs', Object.keys(WEB).concat(['main.py']).filter((path, index, all) => all.indexOf(path) === index).map((path) => ({
      path,
      content: path === 'main.py' ? pythonCode : (WEB[path] || ''),
    })));
    const applyCraft = async (text) => {
      say('studio-line', text);
      const token = localStorage.getItem('rategoan_github_token') || '';
      const repo = localStorage.getItem('rategoan_github_repo') || '';
      if (wantsPull(text)) {
        say('studio-step', 'Baca berkas');
        const pulled = await pullGithub(token, repo);
        if (!pulled.ok) {
          say('studio-line', 'Repositori belum bisa dimuat. Tautkan token dan pemilik/repo sekali di Pengaturan.');
          return;
        }
        Object.keys(pulled.files).forEach((path) => {
          if (path === 'main.py') pythonCode = pulled.files[path];
          else if (Object.prototype.hasOwnProperty.call(WEB, path)) WEB[path] = pulled.files[path];
        });
        if (pulled.files['main.py'] && !pulled.files['script.js']) pick('python');
        else {
          if (lang === 'python') pick('javascript');
          writeEditor(WEB[webFile] || '', 'javascript');
          rememberEditor();
          const frame = $('studio-preview-frame');
          if (frame) {
            frame.hidden = false;
            mountPreview(frame, WEB);
          }
        }
        say('studio-line', 'Berkas repositori sudah masuk pohon kerja Studio.');
        try { await persist(); } catch (e) { console.warn('[Rategoan Fallback] studio-vfs:', e); }
        return;
      }
      const before = Object.assign({ 'main.py': pythonCode }, WEB);
      const plan = publishOnly(text)
        ? { files: before, lang: lang === 'python' ? 'python' : 'web', steps: ['Baca berkas'], reply: 'Berkas proyek siap diterbitkan.' }
        : craftInstruction(text, before);
      plan.steps.forEach((step) => say('studio-step', step));
      const changed = Object.keys(plan.files).filter((path) => String(before[path] || '') !== String(plan.files[path] || ''));
      if (changed.length) say('studio-step', 'Berkas berubah: ' + changed.join(', '));
      Object.keys(plan.files).forEach((path) => {
        if (path === 'main.py') pythonCode = plan.files[path];
        else WEB[path] = plan.files[path];
      });
      if (plan.lang === 'python') pick('python');
      else {
        if (lang === 'python') pick('javascript');
        let healed = WEB['script.js'] || '';
        for (let i = 0; healed && i < 3; i += 1) {
          const res = await jsSandbox.run(healed);
          if (res.ok) break;
          const next = healScript(healed, { msg: res.error || '' });
          if (!next || next === healed) break;
          healed = next;
          say('studio-step', 'Perbaikan mandiri ' + (i + 1));
        }
        WEB['script.js'] = healed;
        writeEditor(WEB[webFile] || healed, 'javascript');
        rememberEditor();
        const frame = $('studio-preview-frame');
        if (frame) {
          frame.hidden = false;
          mountPreview(frame, WEB);
        }
      }
      let note = plan.reply;
      if (wantsPublish(text)) {
        say('studio-step', 'Kemas');
        const bundle = Object.assign({}, WEB, { 'main.py': pythonCode });
        const pushed = token ? await pushGithub(token, repo, bundle, commitNote(text)) : { ok: false, reason: 'token', sha: '' };
        if (!pushed.ok) {
          const zip = $('studio-zip');
          if (zip) zip.click();
          note += ' Aplikasi sudah selesai dan saya kemas dalam berkas ZIP studio-rategoan.zip. Untuk push otomatis ke repositori di masa depan, tautkan token GitHub Anda sekali saja di Pengaturan.';
        } else {
          say('studio-step', 'Push');
          note += ' Perubahan sudah dikirim ke GitHub' + (pushed.sha ? ' (' + pushed.sha.slice(0, 7) + ').' : '.');
        }
      }
      say('studio-line', note);
      try { await persist(); } catch (e) { console.warn('[Rategoan Fallback] studio-vfs:', e); }
    };
    document.querySelectorAll('[data-studio-ask]').forEach((btn) => {
      btn.onclick = () => applyCraft(btn.dataset.studioAsk || '');
    });
    const form = $('studio-composer');
    if (form) form.onsubmit = (event) => {
      event.preventDefault();
      const box = $('studio-ask');
      const text = box ? box.value.trim() : '';
      if (!text) return;
      box.value = '';
      applyCraft(text);
    };
    const mic = $('studio-mic');
    if (mic) mic.onclick = () => {
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      const box = $('studio-ask');
      if (!SR || !box) {
        toast.show('Dikte suara tidak didukung di peramban ini');
        return;
      }
      let rec;
      try { rec = new SR(); } catch (e) {
        toast.show('Dikte suara gagal dimulai');
        return;
      }
      rec.lang = 'id-ID';
      rec.onresult = (event) => {
        const last = event.results && event.results[event.results.length - 1];
        const said = last && last[0] ? last[0].transcript : '';
        if (said) box.value = (box.value ? box.value + ' ' : '') + said;
      };
      rec.onerror = (event) => {
        const code = (event && event.error) || '';
        toast.show(code === 'not-allowed' ? 'Mikrofon ditolak. Izinkan mikrofon di peramban untuk mendikte.' : 'Dikte suara gagal');
      };
      try { rec.start(); toast.show('Dikte suara berjalan'); } catch (e) { toast.show('Dikte suara gagal dimulai'); }
    };
    const publish = $('studio-publish');
    if (publish) publish.onclick = () => applyCraft('Terbitkan ke GitHub');
    const load = $('studio-load-project');
    if (load) load.onclick = () => {
      const cur = workspace.current();
      if (!cur) {
        toast.show('Pilih atau buat proyek dulu');
        return;
      }
      say('studio-line', 'Proyek aktif: ' + cur.name);
    };
    idbGateway.getList('studio-vfs').then((rows) => {
      (rows || []).forEach((row) => {
        if (!row || !row.path) return;
        if (row.path === 'main.py') pythonCode = row.content || pythonCode;
        else if (Object.prototype.hasOwnProperty.call(WEB, row.path)) WEB[row.path] = row.content || '';
      });
    }).catch(() => {});
  },
  async runPython() {
    const out = $('studio-console');
    const code = codeText();
    if (out) {
      out.hidden = false;
      out.textContent = 'Memuat Python\u2026';
    }
    try {
      if (!pyPromise) {
        pyPromise = import('https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.mjs').then((mod) => mod.loadPyodide());
      }
      const pyodide = await pyPromise;
      if (pyodide.setStdout) pyodide.setStdout({ batched: (text) => { if (out) out.textContent = text; } });
      const value = await pyodide.runPythonAsync(code);
      const shown = value == null ? '' : String(value);
      if (out) out.textContent = ((out.textContent && out.textContent !== 'Memuat Python\u2026') ? out.textContent + '\n' : '') + (shown || 'Selesai.');
      toast.show('Python selesai');
    } catch (e) {
      if (out) out.textContent = 'Gagal: ' + (e && e.message ? e.message : 'Python tidak termuat');
      toast.show('Python gagal');
    }
  },
  open() {
    drawer.close();
    this.paint();
    router.go('studio');
  },
};
