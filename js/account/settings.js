import { $ } from '../utils/dom.js';
import { haptics } from '../utils/haptics.js';
import { toast } from '../core/toast.js';
import { router } from '../core/router.js';
import { store } from '../state/store.js';
import { auth } from '../state/auth.js';
import { theme } from '../state/theme.js';
import { font } from '../state/font.js';
import { storage } from '../state/storage.js';
import { pin } from '../state/pin.js';
import { drawer } from '../ui/drawer.js';
import { history } from '../history/history.js';
import { backup } from '../system/backup.js';
import { account } from './account.js';
import { ocrReader } from '../../ocr/reader.js';
import { translator } from '../../translate/translator.js';

const DOWNLOAD_ICON =
  '<svg class="side-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>';
const KNOWLEDGE_ICON =
  '<svg class="side-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>';

function buildRow(id, icon, label) {
  const row = document.createElement('div');
  row.className = 'set-row clickable';
  row.id = id;
  const span = document.createElement('span');
  span.innerHTML = icon + label;
  const value = document.createElement('span');
  value.className = 'set-value';
  value.id = id + '-value';
  row.appendChild(span);
  row.appendChild(value);
  return row;
}

export const settings = {
  _warned: false,
  injectExtraRows() {
    if ($('row-unduhan-fitur')) return;
    const anchor = $('row-restore');
    if (!anchor) return;
    const downloadRow = buildRow('row-unduhan-fitur', DOWNLOAD_ICON, 'Unduhan Fitur');
    const knowledgeRow = buildRow('row-pengetahuan-saya', KNOWLEDGE_ICON, 'Pengetahuan Saya');
    anchor.insertAdjacentElement('afterend', knowledgeRow);
    anchor.insertAdjacentElement('afterend', downloadRow);
    this.refreshPackageStatus();
    downloadRow.onclick = () => this.handleUnduhanFitur();
    knowledgeRow.onclick = () => {
      router.go('chat');
      const inp = $('chat-input');
      if (inp) {
        inp.value = 'laporan otak';
        inp.focus();
      }
    };
  },
  refreshPackageStatus() {
    const val = $('row-unduhan-fitur-value');
    if (!val) return;
    const ocrStatus = ocrReader.isReady() ? 'OCR siap' : 'OCR belum';
    const trStatus = translator.isReady() ? 'Terjemahan siap' : 'Terjemahan belum';
    val.textContent = ocrStatus + ' • ' + trStatus;
  },
  async handleUnduhanFitur() {
    if (!ocrReader.isReady()) {
      const wantOcr = confirm('Unduh paket OCR/baca gambar (±' + ocrReader.packageSizeMB + ' MB)? Butuh internet sekali, setelah itu bisa dipakai offline.');
      if (wantOcr) {
        toast.show('Mengunduh paket OCR...');
        const ok = await ocrReader.downloadPackage();
        toast.show(ok ? 'Paket OCR siap dipakai offline.' : 'Gagal mengunduh paket OCR. Coba lagi saat online.');
        this.refreshPackageStatus();
      }
    }
    if (!translator.isReady()) {
      const wantTr = confirm('Unduh paket Terjemahan (±' + translator.packageSizeMB + ' MB)? Butuh internet sekali, setelah itu bisa dipakai offline.');
      if (wantTr) {
        toast.show('Mengunduh paket Terjemahan...');
        const ok = await translator.downloadPackage();
        toast.show(ok ? 'Paket Terjemahan siap dipakai offline.' : 'Gagal mengunduh paket Terjemahan. Coba lagi saat online.');
        this.refreshPackageStatus();
      }
    }
    if (ocrReader.isReady() && translator.isReady()) toast.show('Semua paket sudah siap offline.');
  },
  refresh() {
    const st = auth.state;
    const head = $('profile-head');
    const divider = $('profile-divider');
    const avatar = $('profile-avatar');
    const name = $('profile-name');
    const mail = $('profile-mail');
    if (head && avatar && name && mail) {
      if (!st) {
        head.hidden = true;
        if (divider) divider.hidden = true;
      } else {
        head.hidden = false;
        if (divider) divider.hidden = false;
        if (st.method === 'gmail') {
          const local = String(st.id).split('@')[0] || 'user';
          const pretty = local.charAt(0).toUpperCase() + local.slice(1);
          avatar.textContent = pretty.charAt(0).toUpperCase();
          name.textContent = pretty;
          mail.textContent = st.id;
        } else {
          avatar.textContent = 'P';
          name.textContent = 'Pengguna Telepon';
          mail.textContent = st.id;
        }
      }
    }
    const info = $('storage-info');
    if (info) {
      const sessions = store.get().sessions;
      const kb = Math.max(1, Math.round(storage.usage() / 1024));
      const pct = storage.percent();
      info.textContent = sessions.length + ' chat • ' + kb + ' KB (' + pct + '%)';
      if (pct >= 80 && !this._warned) {
        this._warned = true;
        toast.show('Penyimpanan hampir penuh (' + pct + '%)');
      }
    }
    const pinInfo = $('pin-info');
    if (pinInfo) pinInfo.textContent = pin.has() ? 'Aktif' : 'Nonaktif';
    document.querySelectorAll('.font-btn').forEach((b) => {
      b.classList.toggle('active', b.dataset.font === font.value);
    });
    document.querySelectorAll('.theme-btn').forEach((b) => {
      b.classList.toggle('active', b.dataset.theme === theme.value);
    });
  },
  bind() {
    this.injectExtraRows();
    $('btn-settings').onclick = () => {
      drawer.close();
      this.refresh();
      router.go('settings');
    };
    $('btn-back').onclick = () => router.go('chat');
    document.querySelectorAll('.theme-btn').forEach((b) => {
      b.onclick = () => {
        theme.set(b.dataset.theme);
        this.refresh();
      };
    });
    document.querySelectorAll('.font-btn').forEach((b) => {
      b.onclick = () => {
        font.set(b.dataset.font);
        this.refresh();
      };
    });
    $('row-clear-chat').onclick = () => history.clearAll();
    $('row-logout').onclick = () => {
      auth.logout();
      account.refresh();
      haptics.tap(15);
      toast.show('Anda keluar');
      router.go('login');
    };
    $('row-backup').onclick = () => backup.export();
    $('row-restore').onclick = () => $('pick-restore').click();
    $('row-pin').onclick = () => {
      if (pin.has()) {
        pin.clear();
        toast.show('Kunci dinonaktifkan');
      } else {
        const p = prompt('Buat PIN (4-6 digit):');
        if (p === null) return;
        if (/^\d{4,6}$/.test(p)) {
          pin.set(p);
          toast.show('Kunci diaktifkan');
        } else {
          toast.show('PIN harus 4-6 digit');
        }
      }
      this.refresh();
    };
    this.refresh();
  },
};
