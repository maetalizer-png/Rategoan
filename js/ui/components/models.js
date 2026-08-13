/**
 * Models - AI model selection
 * @module ui/components/models
 */

import { RG } from '../../core/index.js';

/**
 * Model selector manager
 */
RG.models = {
  KEY: 'rategoan_model',
  list: [
    { id: 'raget-1.0', name: 'Raget 1.0' },
  ],
  active: 'raget-1.0',

  /**
   * Load saved model preference
   */
  load() {
    const v = localStorage.getItem(this.KEY);
    if (v) this.active = v;
  },

  /**
   * Open model selection sheet
   */
  open() {
    this.render();
    RG.$('model-sheet').hidden = false;
    RG.$('sheet-backdrop').classList.add('show');
  },

  /**
   * Render model list
   */
  render() {
    const box = RG.$('model-list');
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
        ck.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
        b.appendChild(ck);
      }
      b.onclick = () => {
        this.active = m.id;
        localStorage.setItem(this.KEY, m.id);
        if (RG.ai) RG.ai.setStatus('Model: ' + m.name);
        RG.sheets.close();
        RG.haptics.tap(10);
        RG.toast.show('Model aktif: ' + m.name);
      };
      box.appendChild(b);
    });
  },

  /**
   * Bind models event listeners
   */
  bind() {
    this.load();
    RG.$('btn-model').onclick = () => this.open();
  },
};

export { RG };
