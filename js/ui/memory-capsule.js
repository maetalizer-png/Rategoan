import { $ } from '../../shared/dom.js';
import { memoryLong } from '../../raget/raget-memory/memory-long.js';
import { toast } from '../core/toast.js';

function paint(host) {
  host.innerHTML = '';
  const facts = memoryLong.allFacts();
  const notes = memoryLong.allNotes();
  const learned = memoryLong.allLearned();
  const rows = [];
  Object.keys(facts).forEach((key) => rows.push({ kind: 'fact', key, text: key + ': ' + facts[key] }));
  notes.forEach((note) => rows.push({ kind: 'note', key: note.text || '', text: note.text || '' }));
  learned.forEach((item) => rows.push({ kind: 'learned', key: item.subject || '', text: (item.subject || '') + ': ' + (item.value || '') }));
  if (!rows.length) {
    host.textContent = 'Kapsul masih kosong. Fakta yang kamu ajarkan di obrolan akan muncul di sini.';
    return;
  }
  rows.forEach((row) => {
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
  root.innerHTML = '<header class="settings-header"><button type="button" id="memory-back" class="back-btn plain">Kembali</button><h1>Kapsul memori</h1></header><div id="memory-list"></div><button type="button" id="memory-clear">Kosongkan semua</button>';
  const app = $('app');
  if (app) app.appendChild(root);
  const open = () => {
    root.hidden = false;
    paint($('memory-list'));
  };
  document.addEventListener('click', (event) => {
    const hit = event.target && event.target.closest && event.target.closest('[data-open-memory]');
    if (hit) open();
  });
  const back = $('memory-back');
  if (back) back.onclick = () => { root.hidden = true; };
  const clear = $('memory-clear');
  if (clear) clear.onclick = () => {
    memoryLong.clear();
    paint($('memory-list'));
    toast.show('Memori dikosongkan');
  };
  return open;
}
