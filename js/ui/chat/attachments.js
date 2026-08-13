/**
 * Attachment System - File and image attachments
 * @module ui/chat/attachments
 */

import { RG } from '../../core/index.js';

/**
 * Attachment manager for file uploads
 */
RG.attach = {
  current: null,

  /**
   * Open attachment sheet
   */
  open() {
    RG.$('attach-sheet').hidden = false;
    RG.$('sheet-backdrop').classList.add('show');
  },

  /**
   * Pick attachment type
   * @param {string} kind - Type: 'camera', 'photo', or 'file'
   */
  pick(kind) {
    RG.$('pick-' + kind).click();
  },

  /**
   * Generate thumbnail for image
   * @param {File} file - Image file
   * @param {number} max - Max dimension
   * @returns {Promise<string|null>} Data URL
   */
  makeThumb(file, max) {
    max = max || 96;
    return new Promise((resolve) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        try {
          const scale = Math.min(1, max / Math.max(img.width, img.height));
          const w = Math.max(1, Math.round(img.width * scale));
          const h = Math.max(1, Math.round(img.height * scale));
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          canvas.getContext('2d').drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        } catch (e) {
          resolve(null);
        }
        URL.revokeObjectURL(url);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(null);
      };
      img.src = url;
    });
  },

  /**
   * Handle file picker change
   * @param {HTMLInputElement} input - File input element
   */
  async onPick(input) {
    const f = input.files && input.files[0];
    input.value = '';
    if (!f) return;
    this.current = { name: f.name, type: f.type, size: f.size, thumb: null };
    if (f.type && f.type.indexOf('image/') === 0) {
      this.current.thumb = await this.makeThumb(f);
    }
    this.renderChip();
    RG.sheets.close();
  },

  /**
   * Render attachment chip UI
   */
  renderChip() {
    const row = RG.$('attach-row');
    row.innerHTML = '';
    if (!this.current) {
      row.hidden = true;
      return;
    }
    row.hidden = false;
    const chip = document.createElement('div');
    chip.className = 'attach-chip';
    if (this.current.thumb) {
      const img = document.createElement('img');
      img.className = 'attach-thumb';
      img.src = this.current.thumb;
      img.alt = this.current.name;
      chip.appendChild(img);
    }
    const name = document.createElement('span');
    name.className = 'attach-name';
    name.textContent = this.current.name;
    const x = document.createElement('button');
    x.className = 'hist-del';
    x.setAttribute('aria-label', 'Remove');
    x.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" fill="none"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
    x.onclick = () => {
      this.current = null;
      this.renderChip();
    };
    chip.appendChild(name);
    chip.appendChild(x);
    row.appendChild(chip);
  },

  /**
   * Consume and clear current attachment
   * @returns {Object|null} Attachment data
   */
  consume() {
    const c = this.current;
    this.current = null;
    this.renderChip();
    return c;
  },

  /**
   * Bind attachment event listeners
   */
  bind() {
    RG.$('sheet-camera').onclick = () => this.pick('camera');
    RG.$('sheet-photo').onclick = () => this.pick('photo');
    RG.$('sheet-file').onclick = () => this.pick('file');
    RG.$('pick-camera').onchange = (e) => this.onPick(e.target);
    RG.$('pick-photo').onchange = (e) => this.onPick(e.target);
    RG.$('pick-file').onchange = (e) => this.onPick(e.target);
  },
};

export { RG };
