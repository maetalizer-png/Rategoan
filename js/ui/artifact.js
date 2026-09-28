import { $ } from '../utils/dom.js';
import { exportSlides, rememberSlide } from '../utils/slides-export.js';
import { toast } from '../core/toast.js';

function readOutline() {
  const stage = $('artifact-stage');
  if (!stage) return [];
  return Array.from(stage.querySelectorAll('.art-slide')).map((el) => {
    const titleEl = el.querySelector('h3');
    const items = Array.from(el.querySelectorAll('[data-bullet]')).map((b) => b.textContent.trim()).filter(Boolean);
    return {
      kind: el.dataset.kind || 'body',
      title: titleEl ? titleEl.textContent.trim() : '',
      bullets: items,
    };
  });
}

function render(outline, title) {
  const stage = $('artifact-stage');
  const head = $('artifact-title');
  if (!stage) return;
  if (head) head.textContent = title || 'Slide';
  stage.innerHTML = '';
  (outline || []).forEach((s, i) => {
    const card = document.createElement('article');
    card.className = 'art-slide';
    card.dataset.kind = s.kind || 'body';
    const h = document.createElement('h3');
    h.contentEditable = 'true';
    h.textContent = (i + 1) + '. ' + (s.title || '');
    card.appendChild(h);
    const ul = document.createElement('ul');
    (s.bullets || []).forEach((b) => {
      const li = document.createElement('li');
      li.dataset.bullet = '1';
      li.contentEditable = 'true';
      li.textContent = b;
      ul.appendChild(li);
    });
    card.appendChild(ul);
    stage.appendChild(card);
  });
}

export const artifact = {
  open(outline, title, fileName) {
    const panel = $('artifact-panel');
    const app = $('app');
    if (!panel) return;
    render(outline, title);
    rememberSlide(outline, fileName || 'slide.pptx');
    panel.classList.add('open');
    if (app) app.classList.add('split');
    panel.hidden = false;
  },
  close() {
    const panel = $('artifact-panel');
    const app = $('app');
    if (panel) {
      panel.classList.remove('open');
      panel.hidden = true;
    }
    if (app) app.classList.remove('split');
  },
  exportNow() {
    const outline = readOutline();
    if (!outline.length) {
      toast.show('Tidak ada slide');
      return;
    }
    const name = (($('artifact-title') || {}).textContent || 'slide').replace(/[^a-z0-9]+/gi, '-').toLowerCase() + '.pptx';
    rememberSlide(outline, name);
    exportSlides(outline, name);
  },
  bind() {
    const close = $('artifact-close');
    const exp = $('artifact-export');
    if (close) close.onclick = () => this.close();
    if (exp) exp.onclick = () => this.exportNow();
  },
};
