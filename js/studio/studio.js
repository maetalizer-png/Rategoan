import { $ } from '../../shared/dom.js';
import { router } from '../core/router.js';
import { artifact } from '../ui/artifact.js';
import { jsSandbox } from '../../vault/code/js-sandbox.js';
import { toast } from '../core/toast.js';
import { drawer } from '../ui/drawer.js';

const SAMPLE = 'function jumlah(a, b) {\n  return a + b;\n}\n\nconsole.log(jumlah(2, 3));\njumlah(2, 3);';
let cm = null;
let pyPromise = null;
let lang = 'javascript';

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
    cm = globalThis.CodeMirror.fromTextArea(area, { lineNumbers: true, mode: lang });
  } catch (e) {
    cm = null;
  }
}

function showConsole(text, ms) {
  const out = $('studio-console');
  const status = $('studio-terminal-status');
  if (status) status.textContent = ms == null ? 'Konsol' : 'Selesai dalam ' + ms + ' ms';
  if (!out) return;
  out.hidden = false;
  out.textContent = text;
}

function codeText() {
  if (cm) return cm.getValue();
  const area = editor();
  return area ? area.value : '';
}

export const studioPage = {
  paint() {
    const el = editor();
    if (el && !el.value.trim()) el.value = SAMPLE;
    ensureEditor();
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
      const code = codeText();
      const res = await jsSandbox.run(code);
      const body = res.ok
        ? ((res.logs || []).join('\n') + (res.value ? '\n→ ' + res.value : '')).trim() || 'Selesai.'
        : ('Gagal: ' + (res.error || 'error'));
      showConsole(body, Math.round(performance.now() - started));
    };
    const tabJs = $('studio-tab-js');
    const tabPy = $('studio-tab-py');
    const pick = (next) => {
      lang = next;
      if (tabJs) tabJs.classList.toggle('on', next === 'javascript');
      if (tabPy) tabPy.classList.toggle('on', next === 'python');
      if (cm) cm.setOption('mode', next === 'python' ? 'python' : 'javascript');
    };
    if (tabJs) tabJs.onclick = () => pick('javascript');
    if (tabPy) tabPy.onclick = () => pick('python');
    const copyBtn = $('studio-copy');
    if (copyBtn) copyBtn.onclick = () => {
      const text = codeText();
      if (navigator.clipboard) navigator.clipboard.writeText(text).then(() => toast.show('Kode disalin'));
    };
    const editorBox = $('studio-editor');
    if (editorBox) editorBox.addEventListener('keydown', (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        event.preventDefault();
        if (run) run.click();
      }
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
    const preview = $('studio-preview');
    if (preview) preview.onclick = () => {
      const frame = $('studio-preview-frame');
      const code = codeText();
      if (!frame) return;
      frame.hidden = false;
      frame.srcdoc = /<\w+/.test(code) ? code : '<pre>' + code.replace(/</g, '<') + '</pre>';
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
  },
  async runPython() {
    const out = $('studio-console');
    const code = codeText();
    if (out) {
      out.hidden = false;
      out.textContent = 'Memuat Python…';
    }
    try {
      if (!pyPromise) {
        pyPromise = import('https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.mjs').then((mod) => mod.loadPyodide());
      }
      const pyodide = await pyPromise;
      if (pyodide.setStdout) pyodide.setStdout({ batched: (text) => { if (out) out.textContent = text; } });
      const value = await pyodide.runPythonAsync(code);
      const shown = value == null ? '' : String(value);
      if (out) out.textContent = ((out.textContent && out.textContent !== 'Memuat Python…') ? out.textContent + '\n' : '') + (shown || 'Selesai.');
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
