const KEY = 'travel_journal';

function getAll() {
  try {
    const o = JSON.parse(localStorage.getItem(KEY));
    return o && typeof o === 'object' ? o : {};
  } catch (e) {
    return {};
  }
}
function saveAll(o) { localStorage.setItem(KEY, JSON.stringify(o)); }

export function getNotes(tripKey) {
  const all = getAll();
  return Array.isArray(all[tripKey]) ? all[tripKey] : [];
}
export function addNote(tripKey, text) {
  const all = getAll();
  if (!Array.isArray(all[tripKey])) all[tripKey] = [];
  all[tripKey].push({ text, time: Date.now() });
  saveAll(all);
}
export function removeNote(tripKey, idx) {
  const all = getAll();
  if (Array.isArray(all[tripKey])) {
    all[tripKey].splice(idx, 1);
    saveAll(all);
  }
}

export function journalCard(tripKey, tripLabel) {
  const notes = getNotes(tripKey);
  return '<div class="sec">Jurnal Catatan</div><div class="card">' +
    (notes.length
      ? notes.map((n, i) => '<div class="rowbtn" style="justify-content:space-between;margin:4px 0"><span class="desc">' + n.text + '</span><button class="btn" data-jdel="' + i + '">Hapus</button></div>').join('')
      : '<p class="desc">Belum ada catatan.</p>') +
    '<div class="rowbtn" style="margin-top:8px"><input id="jNew" class="q-opt" style="margin:0" placeholder="Tambah catatan...">' +
    '<button class="btn" id="jAdd">Tambah</button></div>' +
    (notes.length ? '<div class="rowbtn" style="margin-top:8px"><button class="btn" id="jExport">Ekspor Markdown</button></div>' : '') +
    '</div>';
}

function toMarkdown(tripLabel, notes) {
  const lines = ['# Jurnal ' + (tripLabel || 'Perjalanan'), ''];
  notes.forEach((n) => {
    lines.push('- ' + n.text + ' _(' + new Date(n.time).toLocaleDateString('id-ID') + ')_');
  });
  return lines.join('\n');
}

export function bindJournal(view, tripKey, onChange, tripLabel) {
  view.querySelectorAll('[data-jdel]').forEach((b) => b.onclick = () => { removeNote(tripKey, +b.dataset.jdel); onChange(); });
  const add = view.querySelector('#jAdd');
  if (add) {
    add.onclick = () => {
      const v = (view.querySelector('#jNew').value || '').trim();
      if (!v) return;
      addNote(tripKey, v);
      onChange();
    };
  }
  const exp = view.querySelector('#jExport');
  if (exp) {
    exp.onclick = (ev) => {
      const md = toMarkdown(tripLabel, getNotes(tripKey));
      if (navigator.share) navigator.share({ text: md }).catch(() => {});
      else if (navigator.clipboard) navigator.clipboard.writeText(md).then(() => { ev.currentTarget.textContent = 'Tersalin (Markdown)'; });
    };
  }
}
