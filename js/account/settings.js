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
import { ocrReader } from '../../vault/ocr/reader.js';
import { translator } from '../../vault/translate/translator.js';
import { pdfReader } from '../../vault/pdf/reader.js';
import { tts } from '../state/tts.js';
import { hemat } from '../state/hemat.js';
import { llmMode } from '../state/llm-mode.js';
import { memoryPreference } from '../state/memory-preference.js';
import { sheets } from '../sheets/sheets.js';

const DOWNLOAD_ICON =
  '<svg class="side-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>';
const KNOWLEDGE_ICON =
  '<svg class="side-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>';
const TTS_ICON =
  '<svg class="side-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/></svg>';
const HEMAT_ICON =
  '<svg class="side-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>';
const SERVER_MODE_ICON =
  '<svg class="side-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>';
const DATA_HEALTH_ICON =
  '<svg class="side-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>';
const MEMORY_ICON =
  '<svg class="side-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a5 5 0 0 0-5 5v1a4 4 0 0 0-2 7.2V17a3 3 0 0 0 3 3h1"/><path d="M12 2a5 5 0 0 1 5 5v1a4 4 0 0 1 2 7.2V17a3 3 0 0 1-3 3h-1"/><path d="M9 21h6"/><path d="M12 17v4"/></svg>';

const TEMPLATE = `
      <div class="settings-page">
        <header class="settings-header">
          <button id="btn-back" class="back-btn plain" aria-label="Kembali">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"/>
              <polyline points="12 19 5 12 12 5"/>
            </svg>
          </button>
          <h1>Pengaturan</h1>
        </header>
        <hr class="divider">
        <div id="profile-head" class="profile-head" hidden>
          <div class="profile-avatar" id="profile-avatar"></div>
          <div class="profile-name" id="profile-name"></div>
          <div class="profile-mail" id="profile-mail"></div>
        </div>
        <hr class="divider" id="profile-divider" hidden>
        <div id="settings-content">
          <div class="set-section">
            <div class="set-section-title">Tampilan</div>
            <div class="set-row">
              <span>
                <svg class="side-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
                Mode Gelap
              </span>
              <span class="font-btns">
                <button class="theme-btn" data-theme="light">T</button>
                <button class="theme-btn" data-theme="auto">A</button>
                <button class="theme-btn" data-theme="dark">G</button>
              </span>
            </div>
            <div class="set-row">
              <span>
                <svg class="side-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="4 7 4 5 20 5 20 7"/>
                  <line x1="9" y1="12" x2="15" y2="12"/>
                  <line x1="12" y1="9" x2="12" y2="15"/>
                  <rect x="6" y="9" width="12" height="10" rx="2"/>
                </svg>
                Ukuran Teks
              </span>
              <span class="font-btns">
                <button class="font-btn" data-font="small">K</button>
                <button class="font-btn" data-font="normal">N</button>
                <button class="font-btn" data-font="large">B</button>
              </span>
            </div>
          </div>

          <div class="set-section">
            <div class="set-section-title">AI & Model</div>
            <div id="set-section-ai"></div>
          </div>

          <div class="set-section">
            <div class="set-section-title">Privasi & Keamanan</div>
            <div class="set-row clickable" id="row-pin">
              <span>
                <svg class="side-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                Kunci Aplikasi
              </span>
              <span class="set-value" id="pin-info">Nonaktif</span>
            </div>
            <div id="set-section-privasi"></div>
          </div>

          <div class="set-section">
            <div class="set-section-title">Data</div>
            <div class="set-row">
              <span>
                <svg class="side-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <ellipse cx="12" cy="5" rx="9" ry="3"/>
                  <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
                  <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
                </svg>
                Penyimpanan
              </span>
              <span class="set-value" id="storage-info">—</span>
            </div>
            <div class="set-row clickable" id="row-backup">
              <span>
                <svg class="side-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Cadangkan Chat
              </span>
            </div>
            <div class="set-row clickable" id="row-restore">
              <span>
                <svg class="side-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/>
                  <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
                Pulihkan Chat
              </span>
            </div>
            <div class="set-row clickable" id="row-install" hidden>
              <span>
                <svg class="side-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="5" y="2" width="14" height="20" rx="2"/>
                  <line x1="12" y1="18" x2="12.01" y2="18"/>
                </svg>
                Instal Aplikasi
              </span>
            </div>
            <div id="set-section-data"></div>
          </div>

          <div class="set-section">
            <div class="set-section-title">Preferensi</div>
            <div id="set-section-preferensi"></div>
          </div>

          <div class="set-section">
            <div class="set-section-title">Lainnya</div>
            <div class="set-row">
              <span>
                <svg class="side-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="16" x2="12" y2="12"/>
                  <line x1="12" y1="8" x2="12.01" y2="8"/>
                </svg>
                Tentang
              </span>
              <span class="set-value">Rategoan version 1.0</span>
            </div>
          </div>

          <div class="set-section set-section-danger">
            <div class="set-row clickable danger" id="row-clear-chat">
              <span>
                <svg class="side-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                </svg>
                Hapus Semua Chat
              </span>
            </div>
            <div class="set-row clickable danger" id="row-logout">
              <span>
                <svg class="side-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                Keluar
              </span>
            </div>
          </div>
        </div>
      </div>
`;

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
    const aiSection = $('set-section-ai');
    const dataSection = $('set-section-data');
    const prefSection = $('set-section-preferensi');
    const privasiSection = $('set-section-privasi');
    if (!aiSection || !dataSection || !prefSection || !privasiSection) return;
    const downloadRow = buildRow('row-unduhan-fitur', DOWNLOAD_ICON, 'Unduhan Fitur');
    const knowledgeRow = buildRow('row-pengetahuan-saya', KNOWLEDGE_ICON, 'Buka Koleksi');
    const dataHealthRow = buildRow('row-data-health', DATA_HEALTH_ICON, 'Kesehatan Data');
    const ttsRow = buildRow('row-tts', TTS_ICON, 'Baca Otomatis (TTS)');
    const hematRow = buildRow('row-hemat', HEMAT_ICON, 'Mode Hemat');
    // Memori ditaruh di Privasi & Keamanan (bareng Kunci Aplikasi), BUKAN
    // Preferensi - ini bukan preferensi tampilan/perilaku app kayak TTS/Mode
    // Hemat, tapi soal data pribadi apa yang diingat+dipakai AI (pola yang
    // sama dipakai ChatGPT/Gemini: Memory ada di bagian privasi/personalisasi).
    const memoriRow = buildRow('row-memori', MEMORY_ICON, 'Memori');
    const llmModeRow = buildRow('row-llm-mode', SERVER_MODE_ICON, 'Server Kustom (opsional)');
    aiSection.appendChild(llmModeRow);
    dataSection.appendChild(knowledgeRow);
    dataSection.appendChild(dataHealthRow);
    dataSection.appendChild(downloadRow);
    privasiSection.appendChild(memoriRow);
    prefSection.appendChild(ttsRow);
    prefSection.appendChild(hematRow);
    this.refreshPackageStatus();
    this.refreshTtsStatus();
    this.refreshHematStatus();
    this.refreshMemoriStatus();
    this.refreshLlmModeStatus();
    downloadRow.onclick = () => this.handleUnduhanFitur();
    dataHealthRow.onclick = () => sheets.openDataHealth();
    llmModeRow.onclick = () => this.handleLlmModeToggle();
    ttsRow.onclick = () => {
      const on = tts.toggle();
      toast.show(on ? 'Baca otomatis diaktifkan' : 'Baca otomatis dinonaktifkan');
      this.refreshTtsStatus();
    };
    hematRow.onclick = () => {
      const on = hemat.toggle();
      toast.show(on ? 'Mode hemat aktif: animasi, getar, dan TTS dimatikan' : 'Mode hemat nonaktif');
      this.refreshHematStatus();
      this.refreshTtsStatus();
    };
    // Dulu toggle di sheet lampiran (+) - dipindah ke Pengaturan (standar
    // aplikasi lain: memori itu pengaturan personalisasi akun yang jarang
    // diubah, bukan aksi sekali pakai per pesan seperti Pencarian Web).
    memoriRow.onclick = () => {
      const on = !memoryPreference.get();
      memoryPreference.set(on);
      toast.show(on ? 'Memori diaktifkan - Raget memakai fakta yang sudah diingat saat menjawab' : 'Memori dinonaktifkan - Raget tidak memakai fakta yang diingat saat menjawab');
      this.refreshMemoriStatus();
    };
    knowledgeRow.onclick = () => {
      router.go('collection');
      import('../collection/collection.js').then((m) => m.collectionPage.open());
    };
  },
  refreshTtsStatus() {
    const val = $('row-tts-value');
    if (!val) return;
    val.textContent = tts.enabled() ? 'Aktif' : 'Nonaktif';
  },
  refreshHematStatus() {
    const val = $('row-hemat-value');
    if (!val) return;
    val.textContent = hemat.enabled() ? 'Aktif' : 'Nonaktif';
  },
  refreshMemoriStatus() {
    const val = $('row-memori-value');
    if (!val) return;
    val.textContent = memoryPreference.get() ? 'Aktif' : 'Nonaktif';
  },
  refreshLlmModeStatus() {
    const val = $('row-llm-mode-value');
    if (!val) return;
    if (llmMode.mode() === 'server') {
      const url = llmMode.serverUrl();
      val.textContent = url ? 'Aktif (' + url.replace(/^https?:\/\//, '').slice(0, 24) + ')' : 'Aktif (URL belum diisi)';
    } else {
      val.textContent = 'Nonaktif (pakai RAGET)';
    }
  },
  handleLlmModeToggle() {
    if (llmMode.mode() === 'server') {
      llmMode.setMode('lokal');
      toast.show('Server kustom dimatikan - kembali ke RAGET.');
      this.refreshLlmModeStatus();
      return;
    }
    const url = prompt('Alamat server inference sendiri (mis. https://vps-anda.com):', llmMode.serverUrl() || 'https://');
    if (url === null) return;
    const trimmed = url.trim();
    if (!/^https?:\/\/.+/.test(trimmed)) {
      toast.show('URL tidak valid - harus diawali http:// atau https://');
      return;
    }
    llmMode.setServerUrl(trimmed);
    llmMode.setMode('server');
    toast.show('Server kustom aktif. Server tidak terjangkau -> fallback otomatis ke RAGET per jawaban.');
    this.refreshLlmModeStatus();
  },
  refreshPackageStatus() {
    const val = $('row-unduhan-fitur-value');
    if (!val) return;
    const ocrStatus = ocrReader.isReady() ? 'OCR siap' : 'OCR belum';
    const trStatus = translator.isReady() ? 'Terjemahan siap' : 'Terjemahan belum';
    const pdfStatus = pdfReader.isReady() ? 'PDF siap' : 'PDF belum';
    val.textContent = ocrStatus + ' • ' + trStatus + ' • ' + pdfStatus;
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
    if (!pdfReader.isReady()) {
      const wantPdf = confirm('Unduh paket baca PDF (±' + pdfReader.packageSizeMB + ' MB)? Butuh internet sekali, setelah itu bisa dipakai offline.');
      if (wantPdf) {
        toast.show('Mengunduh paket PDF...');
        const ok = await pdfReader.downloadPackage();
        toast.show(ok ? 'Paket PDF siap dipakai offline.' : 'Gagal mengunduh paket PDF. Coba lagi saat online.');
        this.refreshPackageStatus();
      }
    }
    if (ocrReader.isReady() && translator.isReady() && pdfReader.isReady()) toast.show('Semua paket sudah siap offline.');
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
    const out = $('row-logout');
    if (out) out.hidden = !st;
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
    $('view-settings').innerHTML = TEMPLATE;
    this.injectExtraRows();
    $('btn-settings').onclick = () => {
      drawer.close();
      this.refresh();
      router.go('settings');
    };
    $('btn-back').onclick = () => {
      router.go('chat');
      drawer.open();
    };
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
      router.go('chat');
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
