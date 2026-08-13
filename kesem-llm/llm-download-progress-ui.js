// Core Engine v2 download progress UI — floating progress bar with
// real-time percentage while Core Engine v2 (llm-transformers-bridge.js)
// downloads model files the first time. Purely presentational — never
// touches download/cache logic, just subscribes to KesempatanLLM2.onProgress().
// Once files are cached in IndexedDB, subsequent initializations are
// near-instant so this bar almost never appears again.

import { KesempatanLLM2 } from './llm-transformers-bridge.js';

const STYLE_ID = 'kes-llm-download-progress-style';
const CONTAINER_ID = 'kesLlmDownloadProgress';

function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
        #${CONTAINER_ID} {
            position: fixed; left: 50%; bottom: 18px; transform: translateX(-50%) translateY(120%);
            width: min(360px, 92vw); z-index: 99997; background: #0B0F14;
            border: 1px solid rgba(0,255,163,0.18); border-radius: 12px; padding: 12px 16px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.45); font-family: -apple-system, "Segoe UI", sans-serif;
            opacity: 0; transition: transform 220ms ease-out, opacity 220ms ease-out;
            pointer-events: none;
        }
        #${CONTAINER_ID}.visible { transform: translateX(-50%) translateY(0); opacity: 1; pointer-events: auto; }
        #${CONTAINER_ID} .kes-dlp-row { display: flex; justify-content: space-between; align-items: center; gap: 10px; margin-bottom: 8px; }
        #${CONTAINER_ID} .kes-dlp-label { color: #E4E9F0; font-size: 12px; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        #${CONTAINER_ID} .kes-dlp-pct { color: #00FFA3; font-size: 12px; font-weight: 700; font-variant-numeric: tabular-nums; flex-shrink: 0; }
        #${CONTAINER_ID} .kes-dlp-track { width: 100%; height: 6px; background: rgba(255,255,255,0.08); border-radius: 4px; overflow: hidden; }
        #${CONTAINER_ID} .kes-dlp-fill { height: 100%; width: 0%; background: linear-gradient(90deg, #00FFA3, #00AA6E); border-radius: 4px; transition: width 200ms ease-out; }
        #${CONTAINER_ID} .kes-dlp-sub { color: #8A94A6; font-size: 10px; margin-top: 6px; }
    `;
    document.head.appendChild(style);
}

function ensureContainer() {
    let el = document.getElementById(CONTAINER_ID);
    if (el) return el;
    ensureStyle();
    el = document.createElement('div');
    el.id = CONTAINER_ID;
    el.setAttribute('role', 'status');
    el.setAttribute('aria-live', 'polite');
    el.innerHTML = `
        <div class="kes-dlp-row">
            <span class="kes-dlp-label" id="kesDlpLabel">Menyiapkan Core Engine v2…</span>
            <span class="kes-dlp-pct" id="kesDlpPct">0%</span>
        </div>
        <div class="kes-dlp-track"><div class="kes-dlp-fill" id="kesDlpFill"></div></div>
        <div class="kes-dlp-sub" id="kesDlpSub">Model diunduh satu kali, lalu dicache di perangkat ini (IndexedDB)</div>
    `;
    document.body.appendChild(el);
    return el;
}

let hideTimer = null;
function show() {
    const el = ensureContainer();
    if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; }
    requestAnimationFrame(function () { el.classList.add('visible'); });
}
function hideAfterDelay(delayMs) {
    const el = document.getElementById(CONTAINER_ID);
    if (!el) return;
    if (hideTimer) clearTimeout(hideTimer);
    hideTimer = setTimeout(function () { el.classList.remove('visible'); }, delayMs);
}

// Lacak progress PER BERKAS (transformers.js mengunduh beberapa file:
// config, tokenizer, beberapa shard bobot) — persentase keseluruhan
// dihitung dari total loaded/total semua berkas yang sudah diketahui
// ukurannya, bukan cuma persentase berkas TERAKHIR yang dilaporkan
// (itu akan membuat progress bar melompat-lompat mundur tiap ganti berkas).
const fileProgress = new Map();

function computeOverallPercent() {
    let loaded = 0, total = 0, anyTotal = false;
    fileProgress.forEach(function (p) {
        loaded += p.loaded || 0;
        if (p.total) { total += p.total; anyTotal = true; }
    });
    if (!anyTotal) return null;
    return Math.min(100, Math.round((loaded / total) * 100));
}

function formatMB(bytes) {
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function handleProgress(data) {
    const label = document.getElementById('kesDlpLabel');
    const pctEl = document.getElementById('kesDlpPct');
    const fillEl = document.getElementById('kesDlpFill');
    const subEl = document.getElementById('kesDlpSub');
    if (!label || !pctEl || !fillEl) return;

    if (data.status === 'detecting-device') {
        show();
        label.textContent = 'Mendeteksi WebGPU/WASM…';
        pctEl.textContent = '0%';
        fillEl.style.width = '2%';
        return;
    }

    if (data.status === 'ready') {
        pctEl.textContent = '100%';
        fillEl.style.width = '100%';
        label.textContent = 'Core Engine v2 siap (' + (data.device || 'wasm').toUpperCase() + ')';
        if (subEl) subEl.textContent = 'Unduhan berikutnya tidak diperlukan lagi — model tersimpan di perangkat ini';
        hideAfterDelay(2500);
        return;
    }

    if (data.file) {
        fileProgress.set(data.file, { loaded: data.loaded || 0, total: data.total || 0 });
    }
    const overall = computeOverallPercent();
    show();
    if (overall !== null) {
        pctEl.textContent = overall + '%';
        fillEl.style.width = overall + '%';
    }
    label.textContent = 'Mengunduh model: ' + (data.file || '…');
    if (subEl && data.total) {
        subEl.textContent = formatMB(data.loaded || 0) + ' / ' + formatMB(data.total) + ' — ' + (data.device || '').toUpperCase();
    }
}

KesempatanLLM2.onProgress(handleProgress);
