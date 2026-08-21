import { $ } from '../utils/dom.js';
import { haptics } from '../utils/haptics.js';
import { toast } from '../core/toast.js';
import { sheets } from './sheets.js';
import { ai } from '../ai/ai.js';
import { llmModels } from '../../raget/raget-llm/llm-models.js';

const CHECK_SVG =
  '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';

// Daftar model DAN status aktif TIDAK didefinisikan di sini - keduanya
// diambil langsung dari registry tunggal raget/raget-llm/llm-models.js
// (kontrak provider) supaya UI picker ini tidak bisa lagi berbeda dari
// engine yang benar-benar berjalan (llmModels.active dipakai js/ai/ai.js
// untuk routing generate() sejak vNext Fase C, bukan cuma kosmetik lagi).
export const models = {
  get list() {
    return llmModels.list;
  },
  get active() {
    return llmModels.active;
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
      const info = document.createElement('span');
      info.className = 'model-info';
      const nm = document.createElement('span');
      nm.className = 'model-name';
      nm.textContent = m.name;
      const cls = document.createElement('span');
      cls.className = 'model-class';
      cls.textContent = llmModels.classLabel(m.engineClass);
      info.appendChild(nm);
      info.appendChild(cls);
      if (m.description) {
        const desc = document.createElement('span');
        desc.className = 'model-desc';
        desc.textContent = m.description;
        info.appendChild(desc);
      }
      b.appendChild(info);
      if (m.id === this.active) {
        const ck = document.createElement('span');
        ck.className = 'model-check';
        ck.innerHTML = CHECK_SVG;
        b.appendChild(ck);
      }
      b.onclick = () => {
        llmModels.setActive(m.id);
        if (ai) ai.setStatus('Model: ' + m.name);
        sheets.close();
        haptics.tap(10);
        toast.show('Model aktif: ' + m.name);
      };
      box.appendChild(b);
    });
  },
  bind() {
    $('btn-model').onclick = () => this.open();
  },
};
