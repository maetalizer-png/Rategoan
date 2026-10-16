import { $ } from '../../shared/dom.js';
import { sheets } from './sheets.js';
import { folderBridge } from '../project/folder-bridge.js';
import { extractPdfText } from '../../shared/pdf-extract.js';
import { listZipEntries, readZipText } from '../../shared/zip-local.js';
import { toast } from '../core/toast.js';
import { positionDesktopPopover } from '../../shared/popover.js';
import { visionOcr } from '../multimodal/vision-ocr.js';

export const MAX_ATTACH_BYTES = 25 * 1024 * 1024;
export const MAX_ATTACH_TEXT_CHARS = 32000;
export const MAX_ZIP_TOTAL_BYTES = 2 * 1024 * 1024;
export const MAX_ZIP_ENTRIES = 40;

const TEXT_FILE_EXT_RE = /\.(ics|txt|enex|md|markdown|csv|tsv|json|jsonl|xml|html?|htm|log|ya?ml|srt|rtf|js|mjs|cjs|ts|jsx|tsx|py|css|scss|less|sql|sh|bash|zsh|toml|ini|conf|env|c|cpp|cc|h|hpp|java|go|rs|php|rb|kt|swift|dart|lua|r|pl|vue|svelte)$/i;
const ZIP_TEXT_ENTRY_RE = /\.(txt|md|markdown|csv|tsv|json|xml|html?|css|js|mjs|cjs|ts|jsx|tsx|py|sql|sh|ya?ml|toml|ini|c|cpp|h|java|go|rs|php|rb)$/i;

export function hasXmlEntityBomb(rawXml) {
  const s = String(rawXml || '');
  return /<!ENTITY\b/i.test(s) || /<!DOCTYPE[^>]*\[/i.test(s);
}

export function sanitizeSvgContent(rawSvg) {
  const s = String(rawSvg || '');
  if (hasXmlEntityBomb(s)) return '';
  return s
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<foreignObject[\s\S]*?<\/foreignObject>/gi, '')
    .replace(/\son[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/(?:href|xlink:href)\s*=\s*(?:"\s*(?:javascript:|data:text\/html)[^"]*"|'\s*(?:javascript:|data:text\/html)[^']*')/gi, '');
}

export function isSafeZipEntryPath(entryPath) {
  const p = String(entryPath || '');
  if (!p || p.length > 240) return false;
  if (p.startsWith('/') || p.startsWith('\\') || p.includes('\\') || /[\x00-\x1f]/.test(p)) return false;
  const parts = p.split('/');
  if (parts.some((seg) => seg === '..' || seg === '.')) return false;
  return true;
}

export function formatBytesLabel(bytes) {
  const n = Number(bytes) || 0;
  if (n <= 0) return '0 KB';
  if (n >= 1024 * 1024) return (n / (1024 * 1024)).toFixed(1) + ' MB';
  return Math.max(1, Math.round(n / 1024)) + ' KB';
}

export function classifyFileMeta(file) {
  const name = String((file && file.name) || 'berkas');
  const type = String((file && file.type) || '').toLowerCase();
  const extMatch = name.match(/\.([a-z0-9]+)$/i);
  const ext = extMatch ? extMatch[1].toLowerCase() : '';
  const sizeLabel = formatBytesLabel(file && file.size);

  if (type.startsWith('image/') || /^(jpg|jpeg|png|webp|gif|bmp|svg)$/i.test(ext)) {
    return { kind: 'image', badge: (ext || 'IMG').toUpperCase(), tone: 'blue', sizeLabel };
  }
  if (ext === 'pdf' || type === 'application/pdf') {
    return { kind: 'pdf', badge: 'PDF', tone: 'red', sizeLabel };
  }
  if (ext === 'zip' || /zip/.test(type)) {
    return { kind: 'zip', badge: 'ZIP', tone: 'amber', sizeLabel };
  }
  if (ext === 'docx' || ext === 'doc') {
    return { kind: 'docx', badge: 'DOCX', tone: 'blue', sizeLabel };
  }
  if (ext === 'xlsx' || ext === 'xls' || ext === 'csv' || ext === 'tsv') {
    return { kind: 'sheet', badge: ext.toUpperCase() || 'XLSX', tone: 'green', sizeLabel };
  }
  if (ext === 'pptx' || ext === 'ppt') {
    return { kind: 'slides', badge: 'PPTX', tone: 'orange', sizeLabel };
  }
  if (/^(js|mjs|cjs|ts|jsx|tsx|py|css|scss|html?|json|xml|ya?ml|sql|sh|c|cpp|h|java|go|rs|php|rb)$/i.test(ext)) {
    return { kind: 'code', badge: ext.toUpperCase(), tone: 'violet', sizeLabel };
  }
  if (type.startsWith('audio/') || /^(webm|mp3|wav|ogg|m4a)$/i.test(ext)) {
    return { kind: 'audio', badge: 'AUDIO', tone: 'orange', sizeLabel };
  }
  return { kind: 'text', badge: (ext || 'TXT').toUpperCase().slice(0, 5), tone: 'slate', sizeLabel };
}

function fileTypeIconSvg(kind) {
  if (kind === 'pdf') {
    return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M9 15h6"/><path d="M9 11h6"/></svg>';
  }
  if (kind === 'zip') {
    return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8v13H3V8"/><rect x="1" y="3" width="22" height="5" rx="1"/><line x1="10" y1="12" x2="14" y2="12"/><line x1="10" y1="16" x2="14" y2="16"/></svg>';
  }
  if (kind === 'sheet') {
    return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/></svg>';
  }
  if (kind === 'slides') {
    return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>';
  }
  if (kind === 'code') {
    return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>';
  }
  return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>';
}

async function extractArchiveSummary(buf) {
  const entries = listZipEntries(buf);
  if (!entries.length) return '';
  const safeNames = entries
    .map((e) => (typeof e === 'string' ? e : e.name))
    .filter((n) => isSafeZipEntryPath(n) && !n.endsWith('/'));
  const extCounts = {};
  safeNames.forEach((n) => {
    const m = n.match(/\.([a-z0-9]+)$/i);
    const k = m ? m[1].toLowerCase() : 'lainnya';
    extCounts[k] = (extCounts[k] || 0) + 1;
  });
  const topExts = Object.entries(extCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([ext, cnt]) => '.' + ext + ' (' + cnt + ')')
    .join(', ');

  const headerLines = [
    'Daftar berkas arsip ZIP (' + safeNames.length + ' berkas' + (topExts ? ' — komposisi: ' + topExts : '') + '):',
  ];
  const priorityRe = /(?:^|\/)(?:package\.json|version\.json|README\.md|index\.html|studio\.html|main\.js|app\.js|composer\.js)$/i;
  const prioritized = safeNames.filter((n) => priorityRe.test(n)).concat(safeNames.filter((n) => !priorityRe.test(n)));
  prioritized.slice(0, 18).forEach((name) => headerLines.push('- `' + name + '`'));
  if (safeNames.length > 18) {
    headerLines.push('- … serta ' + (safeNames.length - 18) + ' berkas lainnya di dalam arsip.');
  }

  const textChunks = [];
  let totalReadBytes = 0;
  for (let i = 0; i < prioritized.length && textChunks.length < 12; i += 1) {
    const name = prioritized[i];
    if (!ZIP_TEXT_ENTRY_RE.test(name) || /(?:^|\/)(?:node_modules|\.git|dist|build)\//i.test(name)) continue;
    try {
      const content = await readZipText(buf, name);
      if (!content) continue;
      totalReadBytes += content.length;
      if (totalReadBytes > MAX_ZIP_TOTAL_BYTES) break;
      if (hasXmlEntityBomb(content)) continue;
      const cleaned = /\.html?$/i.test(name)
        ? content.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
        : content.trim();
      if (cleaned) {
        textChunks.push('Cuplikan `' + name + '`:\n' + cleaned.slice(0, 1200));
      }
    } catch (e) { void e; }
  }
  return [headerLines.join('\n'), textChunks.join('\n\n')].filter(Boolean).join('\n\n').slice(0, MAX_ATTACH_TEXT_CHARS);
}

const X_SVG =
  '<svg width="14" height="14" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" fill="none"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';

function syncComposerSendButton(hasFiles) {
  if (typeof document === 'undefined') return;
  const inp = $('chat-input');
  const sendBtn = $('btn-send');
  const hasDraft = !!((inp && inp.value && inp.value.trim()) || hasFiles);
  document.body.classList.toggle('has-draft', hasDraft);
  if (sendBtn) {
    sendBtn.disabled = !hasDraft;
    sendBtn.classList.toggle('is-idle', !hasDraft);
  }
}

export const attach = {
  current: null,
  files: [],
  modes: { websearch: false, think: false, research: false },
  onModeOff: null,
  open() {
    const sheet = $('attach-sheet');
    sheet.hidden = false;
    sheet.classList.add('is-anchored');
    document.body.classList.add('attach-open');
    $('sheet-backdrop').classList.add('show');
    if (window.innerWidth >= 860) positionDesktopPopover(sheet, $('btn-plus'));
  },
  pick(kind) {
    const el = $('pick-' + kind) || $(kind + '-input');
    if (el) el.click();
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
    if (Number(f.size) > MAX_ATTACH_BYTES) {
      toast.show('Ukuran berkas melebihi batas aman 25 MB.');
      return;
    }
    if (this.files.length >= 5) {
      toast.show('Maksimal 5 berkas.');
      return;
    }
    const meta = classifyFileMeta(f);
    const isSvg = f.type === 'image/svg+xml' || /\.svg$/i.test(f.name || '');
    const item = {
      name: f.name,
      type: f.type,
      size: f.size,
      kind: meta.kind,
      badge: meta.badge,
      tone: meta.tone,
      sizeLabel: meta.sizeLabel,
      statusLabel: 'Mengekstrak…',
      thumb: null,
      full: null,
      fileText: '',
      fileTextError: '',
      visionMeta: null,
      _readyPromise: null,
    };
    this.files.push(item);
    this.current = this.files[0];
    this.renderChip();
    sheets.close();

    const extractPromise = (async () => {
      if (isSvg) {
        const rawSvg = await this.readAsText(f);
        if (hasXmlEntityBomb(rawSvg)) {
          item.fileTextError = 'Berkas SVG ditolak karena mengandung entitas XML berbahaya (XXE).';
          item.statusLabel = 'Ditolak (XXE)';
          toast.show(item.fileTextError);
        } else {
          const cleanSvg = sanitizeSvgContent(rawSvg);
          const textOnly = cleanSvg.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
          item.fileText = (textOnly || cleanSvg).slice(0, MAX_ATTACH_TEXT_CHARS);
          const safeBlob = new Blob([cleanSvg], { type: 'image/svg+xml;charset=utf-8' });
          item.thumb = await this.makeThumb(safeBlob);
          item.full = item.thumb;
          item.statusLabel = 'SVG siap';
        }
      } else if (meta.kind === 'image' || (f.type && f.type.indexOf('image/') === 0)) {
        item.thumb = await this.makeThumb(f);
        item.full = await this.makeThumb(f, 1600);
        item.statusLabel = 'Gambar siap';
        this.renderChip();
        try {
          const ocrRes = await visionOcr.recognize(f);
          if (ocrRes && ocrRes.text) {
            item.fileText = String(ocrRes.text).slice(0, MAX_ATTACH_TEXT_CHARS);
            item.visionMeta = ocrRes.meta || null;
            item.ocrNote = 'Visi & OCR siap';
            item.statusLabel = 'Visi & OCR siap';
          }
        } catch (e) { void e; }
      } else if (meta.kind === 'audio') {
        item.fileText = '[Memo suara / berkas audio terlampir: ' + (f.name || 'audio') + ' (' + meta.sizeLabel + ')]';
        item.statusLabel = 'Audio siap';
      } else if (TEXT_FILE_EXT_RE.test(f.name || '') || (f.type && f.type.indexOf('text/') === 0)) {
        const rawText = await this.readAsText(f);
        if (/\.xml$|\.enex$/i.test(f.name || '') && hasXmlEntityBomb(rawText)) {
          item.fileTextError = 'Berkas XML ditolak karena mengandung deklarasi entitas berbahaya.';
          item.statusLabel = 'Ditolak (XXE)';
          toast.show(item.fileTextError);
        } else {
          item.fileText = rawText.slice(0, MAX_ATTACH_TEXT_CHARS);
          const lines = item.fileText.split('\n').length;
          item.statusLabel = lines + ' baris siap';
        }
      } else if (/\.docx$/i.test(f.name || '')) {
        item.fileBinary = await this.readAsArrayBuffer(f);
        if (item.fileBinary) {
          try {
            const xml = await readZipText(item.fileBinary, 'word/document.xml');
            if (hasXmlEntityBomb(xml)) {
              item.fileTextError = 'Dokumen DOCX ditolak karena mengandung entitas XML berbahaya.';
              item.statusLabel = 'Ditolak (XXE)';
            } else {
              item.fileText = xml
                .replace(/<w:p\b[^>]*>/g, '\n')
                .replace(/<[^>]+>/g, '')
                .replace(/&amp;/g, '&')
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/\n{3,}/g, '\n\n')
                .trim()
                .slice(0, MAX_ATTACH_TEXT_CHARS);
              const words = item.fileText.split(/\s+/).filter(Boolean).length;
              item.statusLabel = words + ' kata siap';
            }
          } catch (e) {
            item.fileTextError = 'Gagal membaca isi DOCX.';
            item.statusLabel = 'Gagal ekstrak';
          }
        }
      } else if (/\.(pdf|zip|pptx|xlsx)$/i.test(f.name || '')) {
        item.fileBinary = await this.readAsArrayBuffer(f);
        if (item.fileBinary && /\.pdf$/i.test(f.name || '')) {
          try {
            item.fileText = String((await extractPdfText(item.fileBinary.slice(0))) || '').slice(0, MAX_ATTACH_TEXT_CHARS);
            const pageHit = item.fileText.match(/(\d+)\s+halaman/);
            item.statusLabel = (pageHit ? pageHit[1] + ' hlm · ' : '') + 'Teks siap';
          } catch (e) {
            item.fileTextError = 'Gagal membaca isi PDF: ' + (e && e.message ? e.message : 'error tidak diketahui');
            item.statusLabel = 'Gagal ekstrak';
          }
        } else if (item.fileBinary && /\.zip$/i.test(f.name || '')) {
          try {
            const bytes = new Uint8Array(item.fileBinary);
            const entries = listZipEntries(bytes).filter((e) => !String(e.name || e).endsWith('/'));
            item.fileText = await extractArchiveSummary(bytes);
            item.statusLabel = entries.length + ' berkas diekstrak';
          } catch (e) {
            item.fileTextError = 'Gagal mengekstrak arsip ZIP.';
            item.statusLabel = 'Gagal ekstrak';
          }
        } else if (item.fileBinary && /\.pptx$/i.test(f.name || '')) {
          try {
            const bytes = new Uint8Array(item.fileBinary);
            const entries = listZipEntries(bytes).filter((e) => /^ppt\/slides\/slide\d+\.xml$/i.test(e.name));
            const slides = [];
            for (let i = 0; i < entries.length && i < 30; i += 1) {
              const xml = await readZipText(bytes, entries[i].name);
              if (xml && !hasXmlEntityBomb(xml)) {
                slides.push('Slide ' + (i + 1) + ': ' + xml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());
              }
            }
            item.fileText = slides.join('\n').slice(0, MAX_ATTACH_TEXT_CHARS);
            item.statusLabel = entries.length + ' slide siap';
          } catch (e) {
            item.fileTextError = 'Gagal membaca isi PPTX.';
            item.statusLabel = 'Gagal ekstrak';
          }
        } else if (item.fileBinary && /\.xlsx$/i.test(f.name || '')) {
          try {
            const sharedXml = await readZipText(item.fileBinary, 'xl/sharedStrings.xml');
            const sheetXml = await readZipText(item.fileBinary, 'xl/worksheets/sheet1.xml');
            const combined = [sharedXml, sheetXml].filter((x) => x && !hasXmlEntityBomb(x)).join('\n');
            item.fileText = combined.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, MAX_ATTACH_TEXT_CHARS);
            item.statusLabel = 'Tabel siap';
          } catch (e) {
            item.fileTextError = 'Gagal membaca isi XLSX.';
            item.statusLabel = 'Gagal ekstrak';
          }
        }
      }
      this.renderChip();
    })();

    item._readyPromise = extractPromise;
    await extractPromise;
  },
  setVoiceBlob(blob) {
    if (!blob) return;
    const item = {
      name: 'Memo Suara.webm',
      type: blob.type || 'audio/webm',
      size: blob.size || 0,
      kind: 'audio',
      badge: 'SUARA',
      tone: 'orange',
      sizeLabel: formatBytesLabel(blob.size || 0),
      statusLabel: 'Rekaman siap',
      blob,
      fileText: '[Memo suara pengguna terlampir]',
    };
    this.files.push(item);
    this.current = this.files[0];
    this.renderChip();
  },
  async onPick(input) {
    const chosen = Array.from((input && input.files) || []);
    if (input) input.value = '';
    const cap = Math.min(chosen.length, 5 - this.files.length);
    for (let i = 0; i < cap; i += 1) {
      await this.handleFile(chosen[i]);
    }
    if (chosen.length > cap && cap > 0) {
      toast.show(cap + ' berkas pertama dimuat (maksimal 5 berkas per pesan).');
    }
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
      syncComposerSendButton(false);
      return;
    }
    row.hidden = false;
    this.files.forEach((file, index) => {
      const meta = classifyFileMeta(file);
      const kind = file.kind || meta.kind;
      const badge = file.badge || meta.badge;
      const tone = file.tone || meta.tone;
      const sizeLabel = file.sizeLabel || meta.sizeLabel;
      const statusLabel = file.statusLabel || (file.fileText ? 'Siap dibaca' : 'Terlampir');

      const chip = document.createElement('div');
      chip.className = 'attach-chip attach-card-' + kind + ' tone-' + tone;

      if (file.thumb) {
        const img = document.createElement('img');
        img.className = 'attach-thumb';
        img.src = file.thumb;
        img.alt = file.name;
        chip.appendChild(img);
      } else {
        const ico = document.createElement('div');
        ico.className = 'attach-type-badge tone-' + tone;
        ico.innerHTML = fileTypeIconSvg(kind) + '<span>' + badge + '</span>';
        chip.appendChild(ico);
      }

      const info = document.createElement('div');
      info.className = 'attach-info';
      const name = document.createElement('span');
      name.className = 'attach-name';
      name.textContent = file.name;
      const sub = document.createElement('small');
      sub.className = 'attach-meta-sub';
      sub.textContent = [badge, sizeLabel, statusLabel].filter(Boolean).join(' · ');
      info.appendChild(name);
      info.appendChild(sub);
      chip.appendChild(info);

      const x = document.createElement('button');
      x.type = 'button';
      x.className = 'hist-del attach-rm-btn';
      x.setAttribute('aria-label', 'Hapus ' + file.name);
      x.innerHTML = X_SVG;
      x.onclick = () => {
        this.files.splice(index, 1);
        this.current = this.files[0] || null;
        this.renderChip();
      };
      chip.appendChild(x);
      row.appendChild(chip);
    });
    syncComposerSendButton(true);
  },
  consume() {
    const files = this.files.slice();
    this.files = [];
    this.current = null;
    this.renderChip();
    if (!files.length) return null;
    const buildPayload = () => {
      const texts = files.map((file, index) => {
        if (file.fileText) return '[Berkas ' + (index + 1) + ': ' + file.name + ' (' + (file.badge || 'FILE') + ', ' + (file.sizeLabel || '') + ')]\n' + file.fileText;
        if (file.fileTextError) return '[Berkas ' + (index + 1) + ': ' + file.name + ']\n' + file.fileTextError;
        return '[Berkas ' + (index + 1) + ': ' + file.name + ' (' + (file.badge || 'FILE') + ', ' + (file.sizeLabel || '') + ')]';
      }).filter(Boolean);
      const firstImg = files.find((f) => f.full || f.thumb) || files[0];
      return {
        name: files.map((file) => file.name).join(', '),
        type: files[0].type,
        size: files[0].size,
        kind: files[0].kind,
        sizeLabel: files[0].sizeLabel,
        statusLabel: files[0].statusLabel,
        visionMeta: firstImg.visionMeta || null,
        thumb: firstImg.thumb || null,
        full: firstImg.full || firstImg.thumb || null,
        files: files.map((f) => ({
          name: f.name,
          type: f.type,
          size: f.size,
          kind: f.kind,
          badge: f.badge,
          tone: f.tone,
          sizeLabel: f.sizeLabel,
          statusLabel: f.statusLabel,
          visionMeta: f.visionMeta || null,
          thumb: f.thumb || null,
          full: f.full || f.thumb || null,
          fileText: f.fileText || '',
          fileTextError: f.fileTextError || '',
        })),
        fileText: texts.join('\n\n'),
        fileTextError: texts.length ? '' : (files[0].fileTextError || ''),
      };
    };
    const out = buildPayload();
    out._sourceFiles = files;
    out._refresh = () => Object.assign(out, buildPayload());
    return out;
  },
  async ensureReady(consumed) {
    if (!consumed || !Array.isArray(consumed._sourceFiles)) return consumed;
    const pending = consumed._sourceFiles.map((f) => f && f._readyPromise).filter(Boolean);
    if (pending.length) {
      await Promise.allSettled(pending);
      if (typeof consumed._refresh === 'function') consumed._refresh();
    }
    return consumed;
  },
  bind() {
    const photoBtn = $('sheet-photo');
    if (photoBtn) photoBtn.onclick = () => {
      const inp = $('pick-photo') || $('photo-input');
      if (inp) inp.click();
    };
    const fileBtn = $('sheet-file') || $('sheet-Upload');
    if (fileBtn) fileBtn.onclick = () => {
      const inp = $('pick-file') || $('file-input');
      if (inp) inp.click();
    };
    ['pick-camera', 'pick-photo', 'pick-file', 'pick-folder', 'pick-audio', 'camera-input', 'photo-input', 'file-input'].forEach((id) => {
      const inp = $(id);
      if (inp) inp.onchange = (e) => this.onPick(e.target);
    });
    const folder = $('sheet-folder') || $('sheet-local-folder');
    if (folder) folder.onclick = () => {
      sheets.close();
      folderBridge.pick();
    };
  },
};
