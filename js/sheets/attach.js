import { $ } from '../../shared/dom.js';
import { sheets } from './sheets.js';
import { extractPdfText } from '../../shared/pdf-extract.js';
import { readZipText } from '../../shared/zip-local.js';

const X_SVG =
  '<svg width="14" height="14" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" fill="none"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';

export const attach = {
  current: null,
  modes: { websearch: false, think: false, research: false },
  onModeOff: null,
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
  async handleFile(f) {
    if (!f) return;
    this.current = { name: f.name, type: f.type, size: f.size, thumb: null };
    if (f.type && f.type.indexOf('image/') === 0) {
      this.current.thumb = await this.makeThumb(f);
      this.current.full = await this.makeThumb(f, 1600);
    } else if (/\.(ics|txt|enex|md|csv|tsv|json|xml|html?|log|ya?ml|srt|rtf)$/i.test(f.name || '')) {
      this.current.fileText = await this.readAsText(f);
    } else if (/\.docx$/i.test(f.name || '')) {
      this.current.fileBinary = await this.readAsArrayBuffer(f);
      if (this.current.fileBinary) {
        try {
          const xml = await readZipText(this.current.fileBinary, 'word/document.xml');
          this.current.fileText = xml
            .replace(/<w:p\b[^>]*>/g, '\n')
            .replace(/<[^>]+>/g, '')
            .replace(/&/g, '&')
            .replace(/</g, '<')
            .replace(/>/g, '>')
            .replace(/\n{3,}/g, '\n\n')
            .trim();
        } catch (e) {
          this.current.fileTextError = 'Gagal membaca isi DOCX.';
        }
      }
    } else if (/\.(pdf|zip)$/i.test(f.name || '')) {
      this.current.fileBinary = await this.readAsArrayBuffer(f);
      if (this.current.fileBinary && /\.pdf$/i.test(f.name || '')) {
        try {
          this.current.fileText = await extractPdfText(this.current.fileBinary.slice(0));
        } catch (e) {
          this.current.fileTextError = 'Gagal membaca isi PDF: ' + (e && e.message ? e.message : 'error tidak diketahui');
        }
      }
    }
    this.renderChip();
    sheets.close();
  },
  async onPick(input) {
    const f = input.files && input.files[0];
    input.value = '';
    await this.handleFile(f);
  },
  setModes(modes) {
    this.modes = {
      websearch: !!(modes && modes.websearch),
      think: !!(modes && modes.think),
      research: !!(modes && modes.research),
    };
    this.renderChip();
  },
  renderChip() {
    const row = $('attach-row');
    if (!row) return;
    row.innerHTML = '';
    const modes = this.modes || {};
    const active = [
      modes.websearch ? ['websearch', 'Pencarian Web'] : null,
      modes.think ? ['think', 'Berpikir lebih keras'] : null,
      modes.research ? ['research', 'Riset mendalam'] : null,
    ].filter(Boolean);
    if (!this.current && !active.length) {
      row.hidden = true;
      return;
    }
    row.hidden = false;
    if (active.length) {
      const modeRow = document.createElement('div');
      modeRow.className = 'mode-row';
      active.forEach((pair) => {
        const chip = document.createElement('span');
        chip.className = 'mode-chip' + (pair[0] === 'websearch' ? ' web' : '');
        const label = document.createElement('span');
        label.textContent = pair[1];
        const x = document.createElement('button');
        x.type = 'button';
        x.setAttribute('aria-label', 'Tutup ' + pair[1]);
        x.textContent = 'x';
        x.onclick = () => {
          if (this.onModeOff) this.onModeOff(pair[0]);
        };
        chip.appendChild(label);
        chip.appendChild(x);
        modeRow.appendChild(chip);
      });
      row.appendChild(modeRow);
    }
    if (!this.current) return;
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
  bind() {
        const cam = $('sheet-camera');
    if (cam) cam.onclick = () => this.pick('camera');
    $('sheet-photo').onclick = () => this.pick('photo');
    $('sheet-file').onclick = () => this.pick('file');
    $('pick-camera').onchange = (e) => this.onPick(e.target);
    $('pick-photo').onchange = (e) => this.onPick(e.target);
    $('pick-file').onchange = (e) => this.onPick(e.target);
  },
};
