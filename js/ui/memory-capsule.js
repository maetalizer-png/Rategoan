import { $ } from '../../shared/dom.js';
import { bindFilterTabs } from '../../shared/filter-tabs.js';
import { memoryLong } from '../../raget/raget-memory/memory-long.js';
import { toast } from '../core/toast.js';

const GROUPS = {
  identitas: ['nama', 'kota', 'pekerjaan', 'umur', 'domisili'],
  preferensi: ['suka', 'mode_tone', 'mode_richness', 'slide_pref', 'gaya'],
};

const BACK_SVG = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>';
const PLUS_SVG = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>';
const TRASH_SVG = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>';

function groupOf(key, kind) {
  if (kind === 'note') return 'instruksi';
  if (kind === 'learned') return 'kebiasaan';
  if (GROUPS.identitas.indexOf(key) >= 0) return 'identitas';
  if (GROUPS.preferensi.indexOf(key) >= 0) return 'preferensi';
  return 'instruksi';
}

function rows() {
  const facts = memoryLong.allFacts();
  const notes = memoryLong.allNotes();
  const learned = memoryLong.allLearned();
  const list = [];
  Object.keys(facts).forEach((key) => list.push({ kind: 'fact', group: groupOf(key, 'fact'), key, value: String(facts[key]) }));
  notes.forEach((note) => list.push({ kind: 'note', group: 'instruksi', key: 'catatan', value: note.text || '' }));
  learned.forEach((item) => list.push({ kind: 'learned', group: 'kebiasaan', key: item.subject || '', value: item.value || '' }));
  return list;
}

export function paintMemoryBadge() {
  const n = rows().length;
  const badge = $('memory-fact-badge');
  if (badge) badge.textContent = n + ' fakta';
  const pill = $('header-memory-pill');
  if (pill) pill.textContent = 'Memori: ' + n + ' fakta';
}

function paint(host) {
  if (!host) return;
  host.innerHTML = '';
  const filter = host.dataset.filter || 'semua';
  const all = rows();
  const count = $('memory-count');
  if (count) count.textContent = all.length + ' fakta tersimpan';
  paintMemoryBadge();
  const shown = filter === 'semua' ? all : all.filter((row) => row.group === filter);
  if (!shown.length) {
    const empty = document.createElement('div');
    empty.className = 'coll-empty-card';
    empty.innerHTML = '<strong>Kapsul masih kosong</strong><p>Fakta yang kamu ajarkan di obrolan, atau yang kamu tulis di formulir, muncul di sini.</p>';
    host.appendChild(empty);
    return;
  }
  shown.forEach((row) => {
    const card = document.createElement('div');
    card.className = 'memory-card';
    const body = document.createElement('div');
    body.className = 'memory-card-body';
    const badge = document.createElement('span');
    badge.className = 'coll-badge memory-badge ' + row.group;
    badge.textContent = row.group;
    const key = document.createElement('strong');
    key.textContent = row.key;
    const value = document.createElement('span');
    value.textContent = row.value;
    body.appendChild(badge);
    body.appendChild(key);
    body.appendChild(value);
    const del = document.createElement('button');
    del.type = 'button';
    del.className = 'memory-del-btn';
    del.textContent = 'Hapus';
    del.onclick = () => {
      if (row.kind === 'fact') memoryLong.forgetFact(row.key);
      else if (row.kind === 'note') memoryLong.forgetNote(row.value);
      else memoryLong.forgetLearned(row.key);
      paint(host);
    };
    card.appendChild(body);
    card.appendChild(del);
    host.appendChild(card);
  });
}

export function mountMemoryCapsule() {
  const root = document.createElement('section');
  root.id = 'memory-capsule';
  root.className = 'settings-page';
  root.hidden = true;
  root.innerHTML = '<header class="settings-header"><button type="button" id="memory-back" class="back-btn plain" aria-label="Kembali">' + BACK_SVG + '</button><h1>Kapsul memori</h1></header><p id="memory-count" class="coll-tab-desc">0 fakta tersimpan</p><div class="coll-filters memory-tabs" id="memory-tabs"><button type="button" data-memory-tab="semua" class="coll-filter-chip on">Semua</button><button type="button" data-memory-tab="identitas" class="coll-filter-chip">Identitas</button><button type="button" data-memory-tab="preferensi" class="coll-filter-chip">Preferensi</button><button type="button" data-memory-tab="kebiasaan" class="coll-filter-chip">Kebiasaan</button><button type="button" data-memory-tab="instruksi" class="coll-filter-chip">Instruksi</button></div><form id="memory-form" class="memory-form-card"><div class="memory-form-row"><select id="memory-kind" class="memory-select"><option value="identitas">Identitas Diri</option><option value="preferensi">Preferensi AI</option><option value="kebiasaan">Kebiasaan Kerja</option><option value="instruksi">Instruksi Khusus</option></select></div><div class="memory-form-grid"><input id="memory-key" class="memory-input" placeholder="Kunci (misal: kota, nama, kopi favorit)" autocomplete="off"><input id="memory-value" class="memory-input" placeholder="Nilai (misal: Surabaya, Maetalizer, americano)" autocomplete="off"></div><button type="submit" class="memory-submit-btn">' + PLUS_SVG + ' Simpan ke Kapsul</button></form><div id="memory-list" class="memory-list"></div><div class="memory-footer"><button type="button" id="memory-clear" class="memory-clear-btn">' + TRASH_SVG + ' Kosongkan Semua Fakta</button></div>';
  if (document.body) document.body.appendChild(root);
  const close = () => { root.hidden = true; };
  const open = () => {
    root.hidden = false;
    paint($('memory-list'));
  };
  document.addEventListener('click', (event) => {
    const hit = event.target && event.target.closest && event.target.closest('[data-open-memory]');
    if (hit) {
      event.preventDefault();
      open();
    }
  });
  window.addEventListener('hashchange', close);
  const back = $('memory-back');
  if (back) back.onclick = close;
  const list = $('memory-list');
  bindFilterTabs($('memory-tabs'), (_id, btn) => {
    if (list) list.dataset.filter = btn.dataset.memoryTab || 'semua';
    paint(list);
  });
  const form = $('memory-form');
  if (form) form.onsubmit = (event) => {
    event.preventDefault();
    const kind = $('memory-kind').value;
    const key = $('memory-key').value.trim();
    const value = $('memory-value').value.trim();
    if (!key || !value) return;
    if (kind === 'kebiasaan') memoryLong.learnFact(key, value);
    else if (kind === 'instruksi') memoryLong.rememberNote(key + ': ' + value);
    else memoryLong.remember(key, value);
    $('memory-key').value = '';
    $('memory-value').value = '';
    paint(list);
    toast.show('Fakta ditambahkan');
  };
  const clear = $('memory-clear');
  if (clear) clear.onclick = () => {
    if (!confirm('Kosongkan seluruh fakta yang tersimpan di Kapsul Memori?')) return;
    memoryLong.clear();
    paint($('memory-list'));
    toast.show('Memori dikosongkan');
  };
  return open;
}
