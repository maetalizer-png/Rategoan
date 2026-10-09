import { $ } from '../../shared/dom.js';
import { haptics } from '../../shared/haptics.js';
import { toast } from '../core/toast.js';
import { router } from '../core/router.js';
import { auth } from '../state/auth.js';
import { theme } from '../state/theme.js';
import { font } from '../state/font.js';
import { storage } from '../state/storage.js';
import { pin } from '../state/pin.js';
import { vaultKey } from '../../shared/vault-key.js';
import { drawer } from '../ui/drawer.js';
import { history } from '../history/history.js';
import { backup } from '../system/backup.js';
import { exportVaultBytes, restoreVaultBytes } from '../../shared/vault-backup.js';
import { downloadBytes } from '../../shared/pptx-local.js';
import { account } from './account.js';
import { ocrReader } from '../../vault/ocr/reader.js';
import { translator } from '../../vault/translate/translator.js';
import { pdfReader } from '../../vault/pdf/reader.js';
import { tts } from '../state/tts.js';
import { hemat } from '../state/hemat.js';
import { llmMode } from '../state/llm-mode.js';
import { enginePreference } from '../state/engine-preference.js';
import { memoryPreference } from '../state/memory-preference.js';
import { paintMemoryBadge } from '../ui/memory-capsule.js';
import { memory } from '../ai/memory.js';
import { exportLog } from '../../raget/raget-memory/export-log.js';
import { sheets } from '../sheets/sheets.js';
import { readPolicyAudit, filterPolicyAudit, exportPolicyAudit } from '../connectors/policy-engine.js';

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
const ERASE_ICON =
  '<svg class="side-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>';
const EXPORT_LOG_ICON =
  '<svg class="side-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>';
const MEMORY_ICON =
  '<svg class="side-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a5 5 0 0 0-5 5v1a4 4 0 0 0-2 7.2V17a3 3 0 0 0 3 3h1"/><path d="M12 2a5 5 0 0 1 5 5v1a4 4 0 0 1 2 7.2V17a3 3 0 0 1-3 3h-1"/><path d="M9 21h6"/><path d="M12 17v4"/></svg>';
const MOON_ICON =
  '<svg class="side-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
const LOCK_ICON =
  '<svg class="side-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>';
const KEY_ICON =
  '<svg class="side-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 2l-2 2m-1.5 1.5l-3 3m-2 2l-3 3m-2 2a5 5 0 1 1-7.07-7.07 5 5 0 0 1 7.07 0z"/><path d="M15 5l4 4"/></svg>';
const STORAGE_ICON =
  '<svg class="side-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>';
const INFO_ICON =
  '<svg class="side-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>';
const CHEVRON_ICON =
  '<svg class="chevron-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>';

const CATEGORIES = [
  { key: 'tampilan', title: 'Tampilan', icon: MOON_ICON },
  { key: 'ai', title: 'Model', icon: SERVER_MODE_ICON },
  { key: 'privasi', title: 'Privasi & Keamanan', icon: LOCK_ICON },
  { key: 'data', title: 'Data', icon: STORAGE_ICON },
  { key: 'preferensi', title: 'Preferensi', icon: TTS_ICON },
  { key: 'lainnya', title: 'Lainnya', icon: INFO_ICON },
];

const MENU_ROWS = CATEGORIES.map(
  (c) => `
            <div class="set-row clickable cat-row" data-cat="${c.key}">
              <span>${c.icon} ${c.title}</span>
              ${CHEVRON_ICON}
            </div>`
).join('');

const TEMPLATE = `
      <div class="settings-page">
        <header class="settings-header">
          <button id="btn-back" class="back-btn plain" aria-label="Kembali">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"/>
              <polyline points="12 19 5 12 12 5"/>
            </svg>
          </button>
          <h1 id="settings-title">Pengaturan</h1>
        </header>
        <hr class="divider">
        <div id="profile-head" class="profile-head" hidden>
          <div class="profile-avatar" id="profile-avatar"></div>
          <div class="profile-name" id="profile-name"></div>
          <div class="profile-mail" id="profile-mail"></div>
          <div class="storage-meter" aria-hidden="true"><span id="storage-meter-bar"></span></div>
        </div>
        <hr class="divider" id="profile-divider" hidden>

        <div id="settings-menu">
          <div class="set-section">${MENU_ROWS}
          </div>
        </div>

        <div id="settings-content" hidden>
          <div class="settings-category" data-cat="tampilan">
            <div class="set-section">
              <div class="set-row set-row-theme set-row-stack">
                <span>
                  <svg class="side-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                  </svg>
                  Mode Gelap
                </span>
                <span class="theme-segmented">
                  <button class="theme-btn" data-theme="light">Terang</button>
                  <button class="theme-btn" data-theme="auto">Sistem</button>
                  <button class="theme-btn" data-theme="dark">Gelap</button>
                </span>
              </div>
              <div class="set-hint" id="theme-hint"></div>
              <div class="set-row set-row-font set-row-stack">
                <span>
                  <svg class="side-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="4 7 4 5 20 5 20 7"/>
                    <line x1="9" y1="12" x2="15" y2="12"/>
                    <line x1="12" y1="9" x2="12" y2="15"/>
                    <rect x="6" y="9" width="12" height="10" rx="2"/>
                  </svg>
                  Ukuran Teks
                </span>
                <span class="theme-segmented">
                  <button class="font-btn" data-font="small">Kecil</button>
                  <button class="font-btn" data-font="normal">Normal</button>
                  <button class="font-btn" data-font="large">Besar</button>
                </span>
              </div>
            </div>
          </div>

          <div class="settings-category" data-cat="ai">
            <div class="set-section">
              <div id="set-section-ai"></div>
            </div>
          </div>

          <div class="settings-category" data-cat="privasi">
            <div class="set-section">
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
          </div>

          <div class="settings-category" data-cat="data">
            <div class="set-section">
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
              <div class="set-row clickable" id="row-policy-audit">
                <span>Jejak izin</span>
                <span class="set-value" id="policy-audit-info">0</span>
              </div>
              <pre id="policy-audit-log" class="policy-audit-log" hidden></pre>
              <div id="policy-audit-tools" class="policy-audit-tools" hidden>
                <input id="policy-audit-q" type="search" aria-label="Saring jejak izin">
                <button type="button" data-sev="INFO">INFO</button>
                <button type="button" data-sev="WARN">WARN</button>
                <button type="button" data-sev="CRITICAL">CRITICAL</button>
                <button type="button" id="policy-audit-export">JSON</button>
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
              <div class="set-row clickable" id="row-vault-export">
                <span>${LOCK_ICON} Ekspor Cadangan Brankas</span>
              </div>
              <div class="set-row clickable" id="row-vault-restore">
                <span>${KEY_ICON} Pulihkan Cadangan Brankas</span>
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
              <div class="set-row clickable" id="btn-settings-memory" data-open-memory="1">
                <span>
                  ${MEMORY_ICON}
                  Kapsul Memori
                </span>
                <span id="memory-fact-badge" class="memory-count-badge">0 fakta</span>
                ${CHEVRON_ICON}
              </div>
              <div id="set-section-data"></div>
            </div>
          </div>

          <div class="settings-category" data-cat="preferensi">
            <div class="set-section">
              <div id="set-section-preferensi"></div>
            </div>
          </div>

          <div class="settings-category" data-cat="lainnya">
            <div class="set-section">
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
              <div class="set-row clickable danger" id="row-wipe-all">
                <span>Bersihkan Seluruh Data & Riwayat</span>
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

function buildSwitchRow(id, icon, label) {
  const row = document.createElement('div');
  row.className = 'set-row clickable';
  row.id = id;
  row.setAttribute('role', 'switch');
  const span = document.createElement('span');
  span.innerHTML = icon + label;
  const sw = document.createElement('span');
  sw.className = 'switch';
  sw.innerHTML = '<span class="switch-thumb"></span>';
  row.appendChild(span);
  row.appendChild(sw);
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
    const memoriRow = buildSwitchRow('row-memori', MEMORY_ICON, 'Memori');
    const hapusMemoriRow = buildRow('row-hapus-memori', ERASE_ICON, 'Hapus memori tersimpan');
    const eksporLogRow = buildRow('row-riwayat-ekspor', EXPORT_LOG_ICON, 'Riwayat ekspor');
    const hub = document.createElement('div');
    hub.className = 'model-hub';
    const card = document.createElement('div');
    card.className = 'model-solo';
    const title = document.createElement('strong');
    title.textContent = 'Model Utama: Raget 1.0';
    card.appendChild(title);
    const speed = document.createElement('label');
    speed.className = 'model-speed-label';
    speed.textContent = 'Mode';
    const select = document.createElement('select');
    select.id = 'engine-speed';
    [['template', 'Cepat'], ['neural', 'Mendalam']].forEach((pair) => {
      const opt = document.createElement('option');
      opt.value = pair[0];
      opt.textContent = pair[1];
      select.appendChild(opt);
    });
    speed.appendChild(select);
    card.appendChild(speed);
    hub.appendChild(card);
    select.onchange = () => {
      const pick = select.value;
      llmMode.setMode('lokal');
      enginePreference.set(pick);
      document.dispatchEvent(new CustomEvent('rategoan:command', { detail: pick === 'neural' ? 'think' : 'think-off' }));
      window.dispatchEvent(new CustomEvent('rategoan:model-switched', { detail: { id: pick } }));
      toast.show(pick === 'neural' ? 'Mode: Mendalam' : 'Mode: Cepat');
    };
    const paintHub = () => {
      if (llmMode.mode() === 'server') llmMode.setMode('lokal');
      select.value = enginePreference.get();
    };
    paintHub();
    window.addEventListener('rategoan:model-switched', paintHub);
    aiSection.appendChild(hub);
    dataSection.appendChild(knowledgeRow);
    dataSection.appendChild(dataHealthRow);
    dataSection.appendChild(downloadRow);
    privasiSection.appendChild(memoriRow);
    privasiSection.appendChild(hapusMemoriRow);
    dataSection.appendChild(eksporLogRow);
    prefSection.appendChild(ttsRow);
    prefSection.appendChild(hematRow);
    this.refreshPackageStatus();
    this.refreshTtsStatus();
    this.refreshHematStatus();
    this.refreshMemoriStatus();
    this.refreshExportLogStatus();
    downloadRow.onclick = () => this.handleUnduhanFitur();
    dataHealthRow.onclick = () => sheets.openDataHealth();
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
    memoriRow.onclick = () => {
      const on = !memoryPreference.get();
      memoryPreference.set(on);
      toast.show(on ? 'Memori diaktifkan - Raget memakai fakta yang sudah diingat saat menjawab' : 'Memori dinonaktifkan - Raget tidak memakai fakta yang diingat saat menjawab');
      this.refreshMemoriStatus();
    };
    hapusMemoriRow.onclick = () => {
      const n = Object.keys(memory.recallFacts() || {}).length;
      memory.forget();
      toast.show(n ? 'Memori tersimpan dihapus (' + n + ')' : 'Tidak ada memori tersimpan');
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
    const row = $('row-memori');
    if (!row) return;
    const on = memoryPreference.get();
    row.classList.toggle('switch-on', on);
    row.setAttribute('aria-checked', String(on));
  },
  refreshExportLogStatus() {
    const val = $('row-riwayat-ekspor-value');
    if (!val) return;
    const items = exportLog.getAll();
    if (!items.length) {
      val.textContent = 'Kosong';
      return;
    }
    const last = items[0];
    const when = last.time ? new Date(last.time).toLocaleString('id-ID') : '';
    val.textContent = (last.label || last.kind || 'ekspor') + (when ? ' · ' + when : '');
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
  currentCategory() {
    const sub = (router.sub || '').split('/')[0];
    return CATEGORIES.find((c) => c.key === sub) || null;
  },
  refresh() {
    paintMemoryBadge();
    const st = auth.state;
    const head = $('profile-head');
    const divider = $('profile-divider');
    const avatar = $('profile-avatar');
    const name = $('profile-name');
    const mail = $('profile-mail');
    const inCategory = !!this.currentCategory();
    if (head && avatar && name && mail) {
      if (!st || inCategory) {
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
      const used = Math.max(1, storage.usage());
      const cap = 50 * 1024 * 1024;
      const mb = (used / (1024 * 1024)).toFixed(1);
      const pct = Math.min(100, Math.round((used / cap) * 100));
      info.textContent = mb + ' MB / 50 MB';
      const bar = $('storage-meter-bar');
      if (bar) bar.style.width = pct + '%';
      if (pct >= 80 && !this._warned) {
        this._warned = true;
        toast.show('Penyimpanan hampir penuh (' + pct + '%)');
      }
    }
    const out = $('row-logout');
    if (out) out.hidden = !st;
    const pinInfo = $('pin-info');
    if (pinInfo) pinInfo.textContent = pin.has() ? 'Aktif' : 'Nonaktif';
    const audit = readPolicyAudit();
    const auditInfo = $('policy-audit-info');
    const auditLog = $('policy-audit-log');
    const auditQ = $('policy-audit-q');
    const auditTools = $('policy-audit-tools');
    if (auditInfo) auditInfo.textContent = String(audit.length);
    if (auditLog) {
      const shown = filterPolicyAudit(auditQ ? auditQ.value : '', auditTools ? auditTools.dataset.sev : '');
      auditLog.textContent = shown.map((row) => row.severity + ' ' + row.name + ' ' + row.status).join('\n');
    }
    document.querySelectorAll('.font-btn').forEach((b) => {
      b.classList.toggle('active', b.dataset.font === font.value);
    });
    document.querySelectorAll('.theme-btn').forEach((b) => {
      b.classList.toggle('active', b.dataset.theme === theme.value);
    });
    const themeHint = $('theme-hint');
    if (themeHint) {
      themeHint.textContent =
        theme.value === 'auto'
          ? 'Otomatis: mengikuti tema perangkat - saat ini ' + (theme.isDark() ? 'Gelap' : 'Terang') + '.'
          : theme.value === 'light'
            ? 'Terang dipilih manual - tidak ikut tema perangkat.'
            : 'Gelap dipilih manual - tidak ikut tema perangkat.';
    }
  },
  renderRoute() {
    const menu = $('settings-menu');
    const content = $('settings-content');
    const title = $('settings-title');
    if (!menu || !content || !title) return;
    const cat = this.currentCategory();
    document.querySelectorAll('.settings-category').forEach((el) => {
      el.hidden = el.dataset.cat !== (cat && cat.key);
    });
    menu.hidden = !!cat;
    content.hidden = !cat;
    title.textContent = cat ? cat.title : 'Pengaturan';
    this.refresh();
  },
  bind() {
    $('view-settings').innerHTML = TEMPLATE;
    this.injectExtraRows();
    $('btn-settings').onclick = () => {
      drawer.close();
      router.go('settings');
      this.renderRoute();
    };
    $('btn-back').onclick = () => {
      if (this.currentCategory()) {
        router.go('settings');
        this.renderRoute();
      } else {
        router.go('chat');
        drawer.open();
      }
    };
    document.querySelectorAll('.cat-row').forEach((row) => {
      row.onclick = () => {
        router.go('settings/' + row.dataset.cat);
        this.renderRoute();
      };
    });
    const auditRow = $('row-policy-audit');
    if (auditRow) {
      auditRow.onclick = () => {
        const log = $('policy-audit-log');
        const tools = $('policy-audit-tools');
        if (!log) return;
        log.hidden = !log.hidden;
        if (tools) tools.hidden = log.hidden;
        this.refresh();
      };
    }
    const auditQ = $('policy-audit-q');
    if (auditQ) auditQ.oninput = () => this.refresh();
    document.querySelectorAll('#policy-audit-tools [data-sev]').forEach((btn) => {
      btn.onclick = () => {
        const host = btn.parentElement;
        host.dataset.sev = host.dataset.sev === btn.dataset.sev ? '' : btn.dataset.sev;
        this.refresh();
      };
    });
    const auditExport = $('policy-audit-export');
    if (auditExport) {
      auditExport.onclick = () => {
        const log = $('policy-audit-log');
        if (log) {
          log.hidden = false;
          log.textContent = exportPolicyAudit('json');
        }
      };
    }
    window.addEventListener('hashchange', () => {
      const top = (location.hash || '').replace(/^#\/?/, '').split('/')[0];
      if (top === 'settings') this.renderRoute();
    });
    document.querySelectorAll('.theme-btn').forEach((b) => {
      b.onclick = () => {
        theme.set(b.dataset.theme);
        haptics.tap(10);
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
    const wipe = $('row-wipe-all');
    if (wipe) wipe.onclick = async () => {
      if (!window.confirm('Hapus seluruh data, riwayat, dan kunci di perangkat ini? Tindakan ini tidak bisa dibatalkan.')) return;
      vaultKey.drop();
      try { localStorage.clear(); } catch (e) { console.warn('[Rategoan Fallback]', e); }
      await Promise.all(['raget_idb', 'raget_folder'].map((name) => new Promise((resolve) => {
        const req = indexedDB.deleteDatabase(name);
        req.onsuccess = () => resolve();
        req.onerror = () => resolve();
        req.onblocked = () => resolve();
      })));
      location.reload();
    };
    if (!$('row-privacy')) {
      const privacyRow = document.createElement('div');
      privacyRow.className = 'set-row clickable';
      privacyRow.id = 'row-privacy';
      const privacyLabel = document.createElement('span');
      privacyLabel.textContent = 'Kebijakan Privasi Publik';
      privacyRow.appendChild(privacyLabel);
      const privasiSection = $('set-section-privasi');
      if (privasiSection) {
        privasiSection.appendChild(privacyRow);
        privacyRow.onclick = () => window.open('privacy.html', '_blank', 'noopener');
      }
    }
    $('row-logout').onclick = () => {
      auth.logout();
      account.refresh();
      haptics.tap(15);
      toast.show('Anda keluar');
      router.go('chat');
    };
    $('row-backup').onclick = () => backup.export();
    $('row-restore').onclick = () => $('pick-restore').click();
    const vaultExport = $('row-vault-export');
    if (vaultExport) vaultExport.onclick = async () => {
      if (!window.confirm('Unduh cadangan brankas perangkat ini?')) return;
      try {
        downloadBytes(await exportVaultBytes(), 'cadangan.rategoan');
        toast.show('Cadangan brankas diunduh');
      } catch (e) {
        toast.show('Gagal mengekspor brankas');
      }
    };
    const vaultRestore = $('row-vault-restore');
    const vaultPick = $('pick-vault');
    if (vaultRestore && vaultPick) {
      vaultRestore.onclick = () => vaultPick.click();
      vaultPick.onchange = async (event) => {
        const file = event.target.files && event.target.files[0];
        event.target.value = '';
        if (!file) return;
        try {
          await restoreVaultBytes(new Uint8Array(await file.arrayBuffer()));
          toast.show('Cadangan digabung');
        } catch (e) {
          toast.show(e && e.message ? e.message : 'Gagal memulihkan');
        }
      };
    }
    $('row-pin').onclick = () => {
      if (pin.has()) {
        pin.clear().then(() => {
          toast.show('Kunci dinonaktifkan');
          this.refresh();
        });
        return;
      } else {
        const p = prompt('Buat PIN (4-6 digit):');
        if (p === null) return;
        if (/^\d{4,6}$/.test(p)) {
          pin.set(p).then(() => {
            toast.show('Kunci diaktifkan');
            this.refresh();
          });
          return;
        } else {
          toast.show('PIN harus 4-6 digit');
        }
      }
      this.refresh();
    };
    this.renderRoute();
  },
};

export function armIncognito(on) {
  try {
    if (on) sessionStorage.setItem('rategoan_incognito', '1');
    else sessionStorage.removeItem('rategoan_incognito');
  } catch (e) { /* sesi tertutup */ }
  return !!on;
}
