import { $ } from '../core/utils.js';
import { chat } from '../chat/chat.js';

export const models = Object.freeze({
  sheet: null,
  list: null,
  items: [
    { id: 'raget-1', name: 'Raget 1.0' },
    { id: 'raget-lite', name: 'Raget Lite' },
    { id: 'raget-pro', name: 'Raget Pro' },
  ],
  init() {
    this.sheet = $('model-sheet');
    this.list = $('model-list');
    const close = $('model-close');
    if (close) close.onclick = () => this.close();
    this.render();
  },
  render() {
    if (!this.list) return;
    this.list.innerHTML = '';
    const current = chat.getModel();
    this.items.forEach(m => {
      const btn = document.createElement('button');
      btn.className = 'model-item' + (current === m.id ? ' active' : '');
      btn.innerHTML = '<span class="ico ico-chip"></span> ' + m.name;
      btn.onclick = () => this.select(m.id);
      this.list.appendChild(btn);
    });
  },
  open() {
    this.render();
    if (this.sheet) this.sheet.hidden = false;
    const backdrop = $('sheet-backdrop');
    if (backdrop) backdrop.classList.add('show');
  },
  close() {
    if (this.sheet) this.sheet.hidden = true;
    const backdrop = $('sheet-backdrop');
    if (backdrop) backdrop.classList.remove('show');
  },
  select(id) {
    chat.setModel(id);
    const modelStatus = $('model-status');
    const m = this.items.find(x => x.id === id);
    if (modelStatus && m) {
      modelStatus.textContent = 'Model: ' + m.name;
      setTimeout(() => { modelStatus.textContent = ''; }, 2000);
    }
    localStorage.setItem('rategoan_model', id);
    this.close();
  },
});

window.RG = window.RG || {};
window.RG.models = models;
