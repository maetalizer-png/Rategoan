import { $ } from '../../shared/dom.js';
import { memoryLong } from '../../raget/raget-memory/memory-long.js';
import { toast } from '../core/toast.js';

const GROUPS = {
  identitas: ['nama', 'kota', 'pekerjaan', 'umur', 'domisili'],
  preferensi: ['suka', 'mode_tone', 'mode_richness', 'slide_pref'],
};

function groupOf(key) {
  if (GROUPS.identitas.indexOf(key) >= 0) return 'identitas';
  if (GROUPS.preferensi.indexOf(key) >= 0) return 'preferensi';
  return 'instruksi';
}

function paint(host) {
  host.innerHTML = '';
  const filter = host.dataset.filter || 'semua';
  const facts = memoryLong.allFacts();
  const notes = memoryLong.allNotes();
  const learned = memoryLong.allLearned();
  const rows = [];
  Object.keys(facts).forEach((key) => rows.push({ kind: 'fact', group: groupOf(key), key, text: key + ': ' + facts[key] }));
  notes.forEach((note) => rows.push({ kind: 'note', group: 'instruksi', key: note.text || '', text: note.text || '' }));
  learned.forEach((item) => rows.push({ kind: 'learned', group: 'kebiasaan', key: item.subject || '', text: (item.subject || '') + ': ' + (item.value || '') }));
  const count = $('memory-count');
  if (count) count.textContent = rows.length + ' fakta tersimpan';
  const shown = filter === 'semua' ? rows : rows.filter((row) => row.group === filter);
  if (!shown.length) {
    host.textContent = 'Kapsul masih kosong. Fakta yang kamu ajarkan di obrolan, atau yang kamu tulis di formulir, muncul di sini.';
    return;
  }
  shown.forEach((row) => {
    const card = document.createElement('div');
    card.className = 'memory-card';
    const text = document.createElement('p');
    text.textContent = row.text;
    const del = document.createElement('button');
    del.type = 'button';
    del.textContent = 'Hapus';
    del.onclick = () => {
      if (row.kind === 'fact') memoryLong.forgetFact(row.key);
      else if (row.kind === 'note') memoryLong.forgetNote(row.key);
      else memoryLong.forgetLearned(row.key);
      paint(host);
    };
    card.appendChild(text);
    card.appendChild(del);
    host.appendChild(card);
  });
}

export function mountMemoryCapsule() {
  const root = document.createElement('section');
  root.id = 'memory-capsule';
  root.hidden = true;
  root.innerHTML = '<header class="settings-header"><button type="button" id="memory-back" class="back-btn plain">Kembali</button><h1>Kapsul memori</h1></header><p id="memory-count"></p><div class="memory-tabs"><button type="button" data-memory-tab="semua" class="on">Semua</button><button type="button" data-memory-tab="identitas">Identitas</button><button type="button" data-memory-tab="preferensi">Preferensi</button><button type="button" data-memory-tab="kebiasaan">Kebiasaan</button><button type="button" data-memory-tab="instruksi">Instruksi</button></div><form id="memory-form" class="memory-form"><select id="memory-kind"><option value="identitas">Identitas diri</option><option value="preferensi">Preferensi AI</option><option value="kebiasaan">Kebiasaan kerja</option><option value="instruksi">Instruksi khusus</option></select><input id="memory-key" placeholder="Kunci, misalnya kota" autocomplete="off"><input id="memory-value" placeholder="Nilai" autocomplete="off"><button type="submit">Tambah fakta</button></form><div id="memory-list"></div><button type="button" id="memory-clear">Kosongkan semua</button>';
  const app = document.body;
  if (app) app.appendChild(root);
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
  root.querySelectorAll('[data-memory-tab]').forEach((btn) => {
    btn.onclick = () => {
      root.querySelectorAll('[data-memory-tab]').forEach((other) => other.classList.toggle('on', other === btn));
      if (list) list.dataset.filter = btn.dataset.memoryTab;
      paint(list);
    };
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
    memoryLong.clear();
    paint($('memory-list'));
    toast.show('Memori dikosongkan');
  };
  return open;
}
