import { $ } from '../utils/dom.js';
import { haptics } from '../utils/haptics.js';
import { toast } from '../core/toast.js';
import { sheets } from './sheets.js';
import { ai } from '../ai/ai.js';

const CHECK_SVG =
  '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';

export const models = {
  KEY: 'rategoan_model',
  list: [{ id: 'raget-1.0', name: 'Raget 1.0' }],
  active: 'raget-1.0',
  load() {
    const v = localStorage.getItem(this.KEY);
    if (v) this.active = v;
  },
  open() {
    this.render();
    $('model-sheet').hidden = false;
    $('sheet-backdrop').classList.add('show');
  },
  render() {
    const box = $('model-list');
    box.innerHTML = '';
    this.list.forEach((m) => {
      const b = document.createElement('button');
      b.className = 'model-item' + (m.id === this.active ? ' active' : '');
      const nm = document.createElement('span');
      nm.className = 'model-name';
      nm.textContent = m.name;
      b.appendChild(nm);
      if (m.id === this.active) {
        const ck = document.createElement('span');
        ck.className = 'model-check';
        ck.innerHTML = CHECK_SVG;
        b.appendChild(ck);
      }
      b.onclick = () => {
        this.active = m.id;
        localStorage.setItem(this.KEY, m.id);
        if (ai) ai.setStatus('Model: ' + m.name);
        sheets.close();
        haptics.tap(10);
        toast.show('Model aktif: ' + m.name);
      };
      box.appendChild(b);
    });
  },
  bind() {
    this.load();
    $('btn-model').onclick = () => this.open();
  },
};
