import { $ } from '../utils/dom.js';
import { haptics } from '../utils/haptics.js';
import { toast } from '../core/toast.js';
import { sheets } from './sheets.js';
import { ai } from '../ai/ai.js';
import { llmModels } from '../../raget/raget-llm/llm-models.js';
import { llmMode } from '../state/llm-mode.js';
import { neuralProvider } from '../../raget/raget-llm/neural-provider.js';

const CHECK_SVG =
  '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';

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
      info.appendChild(nm);
      if (m.desc) {
        const desc = document.createElement('span');
        desc.className = 'model-desc';
        desc.textContent = m.desc;
        info.appendChild(desc);
      }
      b.appendChild(info);
      if (m.id === this.active) {
        const ck = document.createElement('span');
        ck.className = 'model-check';
        ck.innerHTML = CHECK_SVG;
        b.appendChild(ck);
      }
      b.onclick = () => this.selectModel(m);
      box.appendChild(b);
    });
  },
  async selectModel(m) {
    const tierKey = (m.neuralTier || '').replace(/^lokal-/, '');
    if (m.downloadSizeMB && !neuralProvider.tierReady(tierKey)) {
      const want = confirm(
        'Model ' + m.name + ' (' + (m.desc || 'eksperimental') + ') butuh paket unduhan ±' +
          m.downloadSizeMB + ' MB sekali, lalu bisa dipakai offline. Unduh sekarang?'
      );
      if (!want) return;
      toast.show('Mengunduh ' + m.name + ' (±' + m.downloadSizeMB + ' MB)...');
      const ok = await neuralProvider.downloadTier(tierKey);
      if (!ok) {
        toast.show('Gagal mengunduh ' + m.name + '. Coba lagi saat koneksi stabil.');
        return;
      }
    }
    llmModels.setActive(m.id);
    if (m.neuralTier) llmMode.setMode(m.neuralTier);
    if (ai) ai.setStatus('Model: ' + m.name);
    sheets.close();
    haptics.tap(10);
    toast.show('Model aktif: ' + m.name);
  },
  bind() {
    $('btn-model').onclick = () => this.open();
  },
};
