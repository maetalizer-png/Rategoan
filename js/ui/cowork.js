import { $ } from '../../shared/dom.js';
import { idbGateway } from '../../raget/raget-database/idb-gateway.js';
import { buildDocxBytes } from '../../shared/docx-local.js';
import { downloadBytes } from '../../shared/pptx-local.js';

const KEY = 'cowork_canvas';
let openFlag = false;
let pendingEdit = false;

function editor() {
  return $('cowork-editor');
}

function textOf() {
  const node = editor();
  return node ? node.innerText : '';
}

function save() {
  const text = textOf();
  idbGateway.setList(KEY, [text]).catch((e) => console.warn('[Rategoan Fallback] Kanvas:', e));
}

function download(name, blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function ask(prefix) {
  const selected = window.getSelection ? String(window.getSelection()).trim() : '';
  const chunk = selected || textOf().slice(0, 700);
  const inp = $('chat-input');
  if (!inp) return;
  pendingEdit = true;
  inp.value = prefix + (chunk ? '\n' + chunk : '');
  const send = $('btn-send');
  if (send) send.click();
}

function wide() {
  return window.matchMedia('(min-width: 1024px)').matches;
}

function showPane(which) {
  const view = $('view-chat');
  if (!view) return;
  view.classList.toggle('pane-canvas', !wide() && which === 'canvas');
  view.classList.toggle('pane-chat', !wide() && which === 'chat');
  const chatTab = $('cowork-tab-chat');
  const canvasTab = $('cowork-tab-canvas');
  if (chatTab) chatTab.classList.toggle('on', which !== 'canvas' || wide());
  if (canvasTab) canvasTab.classList.toggle('on', which === 'canvas' || wide());
}

export const cowork = {
  isOpen() {
    return openFlag;
  },
  expectsEdit() {
    return pendingEdit;
  },
  applyReply(reply) {
    if (!pendingEdit) return;
    pendingEdit = false;
    this.open(reply);
  },
  open(text) {
    const node = editor();
    const panel = $('cowork');
    const view = $('view-chat');
    if (!node || !panel || !view) return;
    openFlag = true;
    if (text != null) node.textContent = String(text);
    panel.hidden = false;
    view.classList.add('with-cowork');
    showPane('canvas');
    save();
  },
  close() {
    const panel = $('cowork');
    const view = $('view-chat');
    openFlag = false;
    pendingEdit = false;
    if (panel) panel.hidden = true;
    if (view) {
      view.classList.remove('with-cowork', 'pane-canvas', 'pane-chat');
    }
  },
  bind() {
    const panel = $('cowork');
    const node = editor();
    if (!panel || !node || panel.dataset.bound) return;
    panel.dataset.bound = '1';
    node.addEventListener('input', save);
    idbGateway.getList(KEY).then((list) => {
      if (!node.textContent && list && list[0]) node.textContent = String(list[0]);
    }).catch((e) => console.warn('[Rategoan Fallback] Kanvas:', e));
    const chatTab = $('cowork-tab-chat');
    const canvasTab = $('cowork-tab-canvas');
    if (chatTab) chatTab.onclick = () => showPane('chat');
    if (canvasTab) canvasTab.onclick = () => showPane('canvas');
    const copy = $('cowork-copy');
    if (copy) copy.onclick = async () => {
      try { await navigator.clipboard.writeText(textOf()); } catch (e) { console.warn('[Rategoan Fallback] Kanvas:', e); }
    };
    const md = $('cowork-md');
    if (md) md.onclick = () => download('kanvas.md', new Blob([textOf()], { type: 'text/markdown' }));
    const docx = $('cowork-docx');
    if (docx) docx.onclick = () => downloadBytes(buildDocxBytes(textOf()), 'kanvas.docx');
    const pdf = $('cowork-pdf');
    if (pdf) pdf.onclick = () => {
      const frame = document.createElement('iframe');
      frame.setAttribute('title', 'Cetak kanvas');
      frame.style.position = 'fixed';
      frame.style.left = '-9999px';
      document.body.appendChild(frame);
      const doc = frame.contentDocument;
      doc.open();
      doc.write('<pre style="font:16px/1.5 sans-serif;white-space:pre-wrap">' + textOf().replace(/[&<>]/g, (c) => ({ '&': '&', '<': '<', '>': '>' }[c])) + '</pre>');
      doc.close();
      frame.contentWindow.focus();
      frame.contentWindow.print();
      setTimeout(() => frame.remove(), 1000);
    };
    const fix = $('cowork-fix');
    if (fix) fix.onclick = () => ask('Perbaiki bagian ini, lalu kembalikan naskah lengkapnya:');
    const expand = $('cowork-expand');
    if (expand) expand.onclick = () => ask('Perluas pembahasan ini, lalu kembalikan naskah lengkapnya:');
    const close = $('cowork-close');
    if (close) close.onclick = () => this.close();
  },
};
