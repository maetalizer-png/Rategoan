import { $ } from '../utils/dom.js';
import { sheets } from './sheets.js';

const X_SVG =
  '<svg width="14" height="14" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" fill="none"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';

export const attach = {
  current: null,
  open() {
    $('attach-sheet').hidden = false;
    $('sheet-backdrop').classList.add('show');
  },
  pick(kind) {
    $('pick-' + kind).click();
  },
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
  readAsText(file) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => resolve('');
      reader.readAsText(file);
    });
  },
  readAsArrayBuffer(file) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => resolve(null);
      reader.readAsArrayBuffer(file);
    });
  },
  async onPick(input) {
    const f = input.files && input.files[0];
    input.value = '';
    if (!f) return;
    this.current = { name: f.name, type: f.type, size: f.size, thumb: null };
    if (f.type && f.type.indexOf('image/') === 0) {
      this.current.thumb = await this.makeThumb(f);
      this.current.full = await this.makeThumb(f, 1600);
    } else if (/\.(ics|txt|enex|md|csv)$/i.test(f.name || '')) {
      this.current.fileText = await this.readAsText(f);
    } else if (/\.(pdf|zip)$/i.test(f.name || '')) {
      this.current.fileBinary = await this.readAsArrayBuffer(f);
    }
    this.renderChip();
    sheets.close();
  },
  renderChip() {
    const row = $('attach-row');
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
    x.innerHTML = X_SVG;
    x.onclick = () => {
      this.current = null;
      this.renderChip();
    };
    chip.appendChild(name);
    chip.appendChild(x);
    row.appendChild(chip);
  },
  consume() {
    const c = this.current;
    this.current = null;
    this.renderChip();
    return c;
  },
  openTravel() {
    sheets.close();
    const frame = $('travel-frame');
    if (!frame.src) frame.src = 'travel/index.html';
    $('travel-sheet').hidden = false;
    $('sheet-backdrop').classList.add('show');
  },
  closeTravel() {
    $('travel-sheet').hidden = true;
    $('sheet-backdrop').classList.remove('show');
  },
  bind() {
    $('sheet-camera').onclick = () => this.pick('camera');
    $('sheet-photo').onclick = () => this.pick('photo');
    $('sheet-file').onclick = () => this.pick('file');
    $('sheet-travel').onclick = () => this.openTravel();
    $('travel-close').onclick = () => this.closeTravel();
    $('travel-full').onclick = () => { location.href = 'travel/'; };
    $('pick-camera').onchange = (e) => this.onPick(e.target);
    $('pick-photo').onchange = (e) => this.onPick(e.target);
    $('pick-file').onchange = (e) => this.onPick(e.target);
  },
};
