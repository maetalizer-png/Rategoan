import { $ } from '../core/utils.js';

export const attach = Object.freeze({
  sheet: null,
  init() {
    this.sheet = $('attach-sheet');
    const close = $('attach-close');
    const camera = $('sheet-camera');
    const photo = $('sheet-photo');
    const file = $('sheet-file');
    if (close) close.onclick = () => this.close();
    if (camera) camera.onclick = () => {
      this.close();
      $('pick-camera').click();
    };
    if (photo) photo.onclick = () => {
      this.close();
      $('pick-photo').click();
    };
    if (file) file.onclick = () => {
      this.close();
      $('pick-file').click();
    };
    // Handle file picks
    ['pick-camera', 'pick-photo', 'pick-file'].forEach(id => {
      const el = $(id);
      if (el) el.addEventListener('change', (e) => this.handleFile(e));
    });
  },
  open() {
    if (this.sheet) this.sheet.hidden = false;
    const backdrop = $('sheet-backdrop');
    if (backdrop) backdrop.classList.add('show');
  },
  close() {
    if (this.sheet) this.sheet.hidden = true;
    const backdrop = $('sheet-backdrop');
    if (backdrop) backdrop.classList.remove('show');
  },
  handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const att = {
        name: file.name,
        type: file.type,
        url: ev.target.result,
      };
      if (window.RG.composer) window.RG.composer.addAttachment(att);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  },
});

window.RG = window.RG || {};
window.RG.attach = attach;
