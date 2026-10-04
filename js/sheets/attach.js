import { $ } from '../../shared/dom.js';
import { sheets } from './sheets.js';
import { extractPdfText } from '../../shared/pdf-extract.js';
import { readZipText } from '../../shared/zip-local.js';
import { toast } from '../core/toast.js';

const X_SVG =
  '<svg width="14" height="14" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" fill="none"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';

export const attach = {
  current: null,
  files: [],
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
    max = max || 800;
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
          resolve(canvas.toDataURL('image/jpeg', 0.85));
        } catch (e) {
          console.warn('[Rategoan Fallback] Lampiran:', e);
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
    if (this.files.length >= 5) {
      toast.show('Maksimal 5 berkas.');
      return;
    }
    const item = { name: f.name, type: f.type, size: f.size, thumb: null };
    if (f.type && f.type.indexOf('image/') === 0) {
      item.thumb = await this.makeThumb(f);
      item.full = await this.makeThumb(f, 1600);
    } else if (/\.(ics|txt|enex|md|csv|tsv|json|xml|html?|log|ya?ml|srt|rtf)$/i.test(f.name || '')) {
      item.fileText = await this.readAsText(f);
    } else if (/\.docx$/i.test(f.name || '')) {
      item.fileBinary = await this.readAsArrayBuffer(f);
      if (item.fileBinary) {
        try {
          const xml = await readZipText(item.fileBinary, 'word/document.xml');
          item.fileText = xml
            .replace(/<w:p\b[^>]*>/g, '\n')
            .replace(/<[^>]+>/g, '')
            .replace(/&/g, '&')
            .replace(/</g, '<')
            .replace(/>/g, '>')
            .replace(/\n{3,}/g, '\n\n')
            .trim();
        } catch (e) {
          item.fileTextError = 'Gagal membaca isi DOCX.';
        }
      }
    } else if (/\.(pdf|zip)$/i.test(f.name || '')) {
      item.fileBinary = await this.readAsArrayBuffer(f);
      if (item.fileBinary && /\.pdf$/i.test(f.name || '')) {
        try {
          item.fileText = await extractPdfText(item.fileBinary.slice(0));
        } catch (e) {
          item.fileTextError = 'Gagal membaca isi PDF: ' + (e && e.message ? e.message : 'error tidak diketahui');
        }
      }
    }
    this.files.push(item);
    this.current = this.files[0];
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
    if (!this.files.length) {
      row.hidden = true;
      return;
    }
    row.hidden = false;
    this.files.forEach((file, index) => {
      const chip = document.createElement('div');
      chip.className = 'attach-chip';
      if (file.thumb) {
        const img = document.createElement('img');
        img.className = 'attach-thumb';
        img.src = file.thumb;
        img.alt = file.name;
        chip.appendChild(img);
      }
      const name = document.createElement('span');
      name.className = 'attach-name';
      name.textContent = file.name;
      const x = document.createElement('button');
      x.className = 'hist-del';
      x.setAttribute('aria-label', 'Hapus ' + file.name);
      x.innerHTML = X_SVG;
      x.onclick = () => {
        this.files.splice(index, 1);
        this.current = this.files[0] || null;
        this.renderChip();
      };
      chip.appendChild(name);
      if (file.ocrNote) {
        const note = document.createElement('span');
        note.className = 'attach-ocr';
        note.textContent = file.ocrNote;
      chip.appendChild(note);
      }
      chip.appendChild(x);
      row.appendChild(chip);
    });
  },
  consume() {
    const files = this.files.slice();
    this.files = [];
    this.current = null;
    this.renderChip();
    if (!files.length) return null;
    const texts = files.map((file, index) => {
      if (file.fileText) return '[Berkas ' + (index + 1) + ': ' + file.name + ']\n' + file.fileText;
      if (file.fileTextError) return '[Berkas ' + (index + 1) + ': ' + file.name + ']\n' + file.fileTextError;
      return '';
    }).filter(Boolean);
    return {
      name: files.map((file) => file.name).join(', '),
      type: files[0].type,
      size: files[0].size,
      thumb: files[0].thumb || null,
      full: files[0].full || null,
      files,
      fileText: texts.join('\n\n'),
      fileTextError: texts.length ? '' : (files[0].fileTextError || ''),
    };
  },
  bind() {
    $('sheet-photo').onclick = () => this.pick('photo');
    $('sheet-file').onclick = () => this.pick('file');
    $('pick-camera').onchange = (e) => this.onPick(e.target);
    $('pick-photo').onchange = (e) => this.onPick(e.target);
    $('pick-file').onchange = (e) => this.onPick(e.target);
  },
};
