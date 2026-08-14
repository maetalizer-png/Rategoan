import { $ } from '../utils/dom.js';
import { ic } from '../utils/icons.js';
import { toast } from '../core/toast.js';
import { router } from '../core/router.js';
import { collectionStore } from '../../raget-memory/collection-store.js';
import { collectionSearch } from '../../raget-memory/collection-search.js';
import { memoryLong } from '../../raget-memory/memory-long.js';
import { remindersStore } from '../../vault/reminders/reminders-store.js';
import { drawer } from '../ui/drawer.js';

const COMMON_TAGS = ['faktoid', 'hitung', 'pengingat', 'obrolan', 'ingatan', 'umum', 'artefak'];

let state = { tab: 'tersimpan', filter: null, query: '' };

function escapeHtml(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function fmtDate(t) {
  return new Date(t).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

async function renderTersimpan() {
  const content = $('coll-content');
  const allActive = await collectionStore.allItems();
  const chatItems = allActive.filter((it) => it.kind === 'chat');

  const stats = await collectionStore.stats();
  const filterChips = [
    { key: null, label: 'Semua', count: chatItems.length },
    { key: 'pinned', label: ic('pin') + ' Pin', count: chatItems.filter((it) => it.pinned).length },
    ...stats.topTags.filter((t) => t.tag !== 'artefak').map((t) => ({ key: t.tag, label: t.tag, count: t.count })),
    { key: 'archived', label: ic('archive') + ' Arsip', count: (await collectionStore.allItems({ includeArchived: true })).filter((it) => it.archived && it.kind === 'chat').length },
  ];
  $('coll-filters').innerHTML = filterChips
    .map((f) => '<button type="button" class="coll-filter-chip' + (state.filter === f.key ? ' on' : '') + '" data-filter="' + escapeHtml(String(f.key)) + '">' + f.label + ' (' + f.count + ')</button>')
    .join('');
  $('coll-filters').querySelectorAll('[data-filter]').forEach((b) => {
    b.onclick = () => {
      const v = b.dataset.filter;
      state.filter = v === 'null' ? null : v;
      renderTersimpan();
    };
  });

  let list = chatItems;
  if (state.filter === 'pinned') list = list.filter((it) => it.pinned);
  else if (state.filter === 'archived') {
    const withArchived = await collectionStore.allItems({ includeArchived: true });
    list = withArchived.filter((it) => it.archived && it.kind === 'chat');
  } else if (state.filter) list = list.filter((it) => it.tag === state.filter);

  let matchInfo = new Map();
  if (state.query.trim()) {
    const results = collectionSearch.fuzzySearch(list, state.query, 100);
    list = results.map((r) => r.item);
    results.forEach((r) => matchInfo.set(r.item.id, r.matched));
  }

  list.sort((a, b) => (b.pinned - a.pinned) || (b.time - a.time));

  if (!list.length) {
    content.innerHTML = '<div class="coll-empty">Belum ada yang tersimpan. Tap "Simpan" pada balasan AI di chat untuk mulai mengumpulkan.</div>';
    return;
  }

  content.innerHTML =
    (state.filter === 'archived' ? '<div class="coll-archive-note">Item di sini otomatis diarsipkan setelah 30 hari tanpa dipin. Bisa dipulihkan kapan saja.</div>' : '') +
    list.map((it) => itemCardHtml(it, matchInfo.get(it.id))).join('');

  bindItemCards(list, renderTersimpan);
}

function itemCardHtml(it, matched) {
  const highlighted = collectionSearch.highlightText(it.text, matched);
  return (
    '<div class="coll-item" data-id="' + it.id + '">' +
    '<div class="coll-item-head">' +
    '<button type="button" class="coll-item-tag" data-tag-btn="' + it.id + '">' + escapeHtml(it.tag) + '</button>' +
    '<span class="coll-item-time">' + fmtDate(it.time) + '</span>' +
    '<button type="button" class="coll-item-pin' + (it.pinned ? ' on' : '') + '" data-pin="' + it.id + '" aria-label="Pin">' + ic('pin') + '</button>' +
    '</div>' +
    '<div class="coll-item-text">' + highlighted + '</div>' +
    '<div class="coll-tag-picker" id="tagpick-' + it.id + '" hidden></div>' +
    '<div class="coll-item-note">' +
    '<textarea data-note="' + it.id + '" placeholder="Tambah catatan pribadi…" rows="1">' + escapeHtml(it.note) + '</textarea>' +
    '</div>' +
    '<div class="coll-item-actions">' +
    '<button type="button" data-remind="' + it.id + '">' + ic('bell') + ' Ingatkan</button>' +
    '<button type="button" data-copy="' + it.id + '">' + ic('copy') + ' Salin</button>' +
    (it.archived ? '<button type="button" data-restore="' + it.id + '">' + ic('archive') + ' Pulihkan</button>' : '') +
    '<button type="button" class="danger" data-del="' + it.id + '">' + ic('trash') + ' Hapus</button>' +
    '</div></div>'
  );
}

function bindItemCards(list, rerender) {
  const content = $('coll-content');
  content.querySelectorAll('[data-pin]').forEach((b) => b.onclick = async () => {
    await collectionStore.togglePin(b.dataset.pin);
    rerender();
  });
  content.querySelectorAll('[data-del]').forEach((b) => b.onclick = async () => {
    await collectionStore.removeItem(b.dataset.del);
    toast.show('Dihapus dari Koleksi');
    rerender();
  });
  content.querySelectorAll('[data-restore]').forEach((b) => b.onclick = async () => {
    await collectionStore.restore(b.dataset.restore);
    toast.show('Dipulihkan');
    rerender();
  });
  content.querySelectorAll('[data-copy]').forEach((b) => b.onclick = () => {
    const item = list.find((x) => x.id === b.dataset.copy);
    if (item && navigator.clipboard) navigator.clipboard.writeText(item.text).then(() => toast.show('Disalin'));
  });
  content.querySelectorAll('[data-remind]').forEach((b) => b.onclick = () => {
    const item = list.find((x) => x.id === b.dataset.remind);
    if (!item) return;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(8, 0, 0, 0);
    remindersStore.add({ text: item.text, action: item.text.slice(0, 60), timestamp: tomorrow.getTime() });
    toast.show('Pengingat dibuat untuk besok jam 08.00');
  });
  content.querySelectorAll('[data-note]').forEach((t) => {
    t.addEventListener('blur', async () => {
      await collectionStore.updateItem(t.dataset.note, { note: t.value.trim() });
    });
  });
  content.querySelectorAll('[data-tag-btn]').forEach((b) => b.onclick = () => {
    const id = b.dataset.tagBtn;
    const picker = $('tagpick-' + id);
    if (!picker) return;
    if (!picker.hidden) { picker.hidden = true; return; }
    const item = list.find((x) => x.id === id);
    const suggested = item ? collectionSearch.suggestTags(item.text, list, 2) : [];
    const tags = Array.from(new Set([...suggested, ...COMMON_TAGS]));
    picker.innerHTML = tags.map((t) => '<button type="button" data-set-tag="' + escapeHtml(t) + '" data-set-tag-id="' + id + '">' + escapeHtml(t) + '</button>').join('');
    picker.hidden = false;
    picker.querySelectorAll('[data-set-tag]').forEach((tb) => tb.onclick = async () => {
      await collectionStore.updateItem(tb.dataset.setTagId, { tag: tb.dataset.setTag });
      rerender();
    });
  });
}

async function renderPerpustakaan() {
  const content = $('coll-content');
  const notes = memoryLong.allNotes().map((n, i) => ({ id: 'note-' + i, kind: 'note', text: n.text, time: n.time }));
  const learned = memoryLong.allLearned().map((f, i) => ({ id: 'learned-' + i, kind: 'learned', text: f.subject + ': ' + f.value, time: f.time, subject: f.subject }));

  let vaultItems = [];
  try {
    const [pdf, notion, evernote, whatsapp] = await Promise.all([
      import('../../vault/pdf/pdf-store.js').then((m) => m.pdfStore.allItems()).catch(() => []),
      import('../../vault/notion/notion-store.js').then((m) => m.notionStore.allItems()).catch(() => []),
      import('../../vault/evernote/evernote-store.js').then((m) => m.evernoteStore.allItems()).catch(() => []),
      import('../../vault/whatsapp/whatsapp-store.js').then((m) => m.whatsappStore.allItems()).catch(() => []),
    ]);
    vaultItems = [
      ...pdf.map((it) => ({ id: it.id, kind: 'pdf', store: 'pdf', text: (it.title || 'PDF') + ' — ' + (it.text || '').slice(0, 140), time: it.addedAt || 0 })),
      ...notion.map((it) => ({ id: it.id, kind: 'notion', store: 'notion', text: (it.title || 'Notion') + ' — ' + (it.text || '').slice(0, 140), time: it.addedAt || 0 })),
      ...evernote.map((it) => ({ id: it.id, kind: 'evernote', store: 'evernote', text: (it.title || 'Evernote') + ' — ' + (it.text || '').slice(0, 140), time: it.addedAt || 0 })),
      ...whatsapp.map((it) => ({ id: it.id, kind: 'whatsapp', store: 'whatsapp', text: (it.text || '').slice(0, 140), time: it.addedAt || 0 })),
    ];
  } catch (e) {}

  let all = [...notes, ...learned, ...vaultItems];
  $('coll-filters').innerHTML = '';

  if (state.query.trim()) {
    const results = collectionSearch.fuzzySearch(all.map((x) => ({ ...x, note: '', tag: '', chatTitle: '' })), state.query, 100);
    const matchedIds = new Map(results.map((r) => [r.item.id, r.matched]));
    all = all.filter((x) => matchedIds.has(x.id));
    all.forEach((x) => { x._matched = matchedIds.get(x.id); });
  }
  all.sort((a, b) => b.time - a.time);

  if (!all.length) {
    content.innerHTML = '<div class="coll-empty">Perpustakaan kosong. Catatan, hal yang dipelajari Raget, dan file yang diimpor (PDF/Notion/Evernote/WhatsApp) akan muncul di sini.</div>';
    return;
  }

  content.innerHTML = all.map((x) => (
    '<div class="coll-item" data-lib-id="' + x.id + '" data-lib-kind="' + x.kind + '">' +
    '<div class="coll-item-head"><span class="coll-item-tag">' + x.kind + '</span>' +
    (x.time ? '<span class="coll-item-time">' + fmtDate(x.time) + '</span>' : '') + '</div>' +
    '<div class="coll-item-text">' + collectionSearch.highlightText(x.text, x._matched) + '</div>' +
    '<div class="coll-item-actions"><button type="button" class="danger" data-lib-del="' + x.id + '" data-lib-del-kind="' + x.kind + '" data-lib-del-store="' + (x.store || '') + '">' + ic('trash') + ' Hapus</button></div>' +
    '</div>'
  )).join('');

  content.querySelectorAll('[data-lib-del]').forEach((b) => b.onclick = async () => {
    const kind = b.dataset.libDelKind;
    const id = b.dataset.libDel;
    if (kind === 'note') {
      const n = notes.find((x) => x.id === id);
      if (n) memoryLong.forgetNote(n.text);
    } else if (kind === 'learned') {
      const f = learned.find((x) => x.id === id);
      if (f) memoryLong.forgetLearned(f.subject);
    } else {
      const storeName = b.dataset.libDelStore;
      try {
        const mod = await import('../../vault/' + storeName + '/' + storeName + '-store.js');
        const storeObj = mod[storeName + 'Store'];
        if (storeObj && storeObj.removeItem) await storeObj.removeItem(id);
      } catch (e) {}
    }
    toast.show('Dihapus');
    renderPerpustakaan();
  });
}

function readTravelJson(key) {
  try {
    const raw = localStorage.getItem(key);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch (e) {
    return [];
  }
}

async function renderArtefak() {
  const content = $('coll-content');
  const artifacts = (await collectionStore.allItems()).filter((it) => it.kind === 'artifact');
  const trips = readTravelJson('travel_trips').map((t, i) => ({ id: 'trip-' + i, kind: 'itinerary', text: 'Rencana ' + t.country + ' — ' + t.days + ' hari (' + t.tier + ')', time: t.time }));
  const favs = readTravelJson('travel_fav').map((f, i) => ({ id: 'fav-' + i, kind: 'favorit', text: 'Favorit: ' + (f.name || f), time: f.time || 0 }));

  $('coll-filters').innerHTML = '';
  let all = [
    ...artifacts.map((a) => ({ id: a.id, kind: a.artifactType || 'artefak', text: a.text, time: a.time, deletable: true })),
    ...trips.map((t) => ({ ...t, deletable: false })),
    ...favs.map((f) => ({ ...f, deletable: false })),
  ];

  if (state.query.trim()) {
    const results = collectionSearch.fuzzySearch(all.map((x) => ({ ...x, note: '', tag: '', chatTitle: '' })), state.query, 100);
    const matchedIds = new Map(results.map((r) => [r.item.id, r.matched]));
    all = all.filter((x) => matchedIds.has(x.id));
  }
  all.sort((a, b) => b.time - a.time);

  if (!all.length) {
    content.innerHTML = '<div class="coll-empty">Belum ada artefak. Draft email, kartu negara, ekspor catatan, dan rencana/favorit Jalanin akan otomatis muncul di sini.</div>';
    return;
  }

  content.innerHTML = all.map((x) => (
    '<div class="coll-item" data-art-id="' + x.id + '">' +
    '<div class="coll-item-head"><span class="coll-item-tag">' + x.kind + '</span>' +
    (x.time ? '<span class="coll-item-time">' + fmtDate(x.time) + '</span>' : '') + '</div>' +
    '<div class="coll-item-text">' + escapeHtml(x.text) + '</div>' +
    '<div class="coll-item-actions">' +
    '<button type="button" data-art-copy="' + x.id + '">' + ic('copy') + ' Salin</button>' +
    (x.kind === 'itinerary' || x.kind === 'favorit' ? '<button type="button" data-art-open>' + ic('globe') + ' Buka Jalanin</button>' : '') +
    (x.deletable ? '<button type="button" class="danger" data-art-del="' + x.id + '">' + ic('trash') + ' Hapus</button>' : '') +
    '</div></div>'
  )).join('');

  content.querySelectorAll('[data-art-copy]').forEach((b) => b.onclick = () => {
    const item = all.find((x) => x.id === b.dataset.artCopy);
    if (item && navigator.clipboard) navigator.clipboard.writeText(item.text).then(() => toast.show('Disalin'));
  });
  content.querySelectorAll('[data-art-open]').forEach((b) => b.onclick = () => { location.href = 'travel/'; });
  content.querySelectorAll('[data-art-del]').forEach((b) => b.onclick = async () => {
    await collectionStore.removeItem(b.dataset.artDel);
    toast.show('Dihapus');
    renderArtefak();
  });
}

async function renderTab() {
  if (state.tab === 'tersimpan') return renderTersimpan();
  if (state.tab === 'perpus') return renderPerpustakaan();
  return renderArtefak();
}

function exportMarkdown(items) {
  const byTag = new Map();
  items.forEach((it) => {
    const list = byTag.get(it.tag) || [];
    list.push(it);
    byTag.set(it.tag, list);
  });
  const lines = ['# Koleksi Saya', '', '_Diekspor ' + new Date().toLocaleString('id-ID') + '_', ''];
  Array.from(byTag.keys()).sort().forEach((tag) => {
    lines.push('## ' + tag, '');
    byTag.get(tag).forEach((it) => {
      lines.push('- ' + it.text.replace(/\n/g, ' ') + (it.note ? ' _(catatan: ' + it.note + ')_' : ''));
    });
    lines.push('');
  });
  return lines.join('\n');
}

function downloadFile(content, mime, filename) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 500);
}

export const collectionPage = {
  async open() {
    state = { tab: 'tersimpan', filter: null, query: '' };
    $('coll-search').value = '';
    document.querySelectorAll('.coll-tab').forEach((t) => t.classList.toggle('on', t.dataset.ctab === 'tersimpan'));
    await renderTab();
  },
  bind() {
    $('btn-collection').onclick = () => {
      drawer.close();
      router.go('collection');
      this.open();
    };
    $('coll-back').onclick = () => router.go('chat');
    document.querySelectorAll('.coll-tab').forEach((tb) => {
      tb.onclick = () => {
        state.tab = tb.dataset.ctab;
        state.filter = null;
        document.querySelectorAll('.coll-tab').forEach((t) => t.classList.toggle('on', t === tb));
        renderTab();
      };
    });
    let searchTimer = null;
    $('coll-search').addEventListener('input', (e) => {
      clearTimeout(searchTimer);
      const v = e.target.value;
      searchTimer = setTimeout(() => {
        state.query = v;
        renderTab();
      }, 200);
    });
    $('coll-export-md').onclick = async () => {
      const items = (await collectionStore.allItems()).filter((it) => it.kind === 'chat');
      if (!items.length) { toast.show('Belum ada yang tersimpan'); return; }
      downloadFile(exportMarkdown(items), 'text/markdown', 'koleksi-' + new Date().toISOString().slice(0, 10) + '.md');
    };
    $('coll-export-json').onclick = async () => {
      const items = await collectionStore.allItems({ includeArchived: true });
      downloadFile(JSON.stringify(items, null, 2), 'application/json', 'koleksi-backup-' + new Date().toISOString().slice(0, 10) + '.json');
    };
    $('coll-import').onclick = () => $('coll-import-file').click();
    $('coll-import-file').onchange = async (e) => {
      const f = e.target.files && e.target.files[0];
      e.target.value = '';
      if (!f) return;
      try {
        const text = await f.text();
        const items = JSON.parse(text);
        const added = await collectionStore.importItems(items);
        toast.show(added + ' item diimpor');
        renderTab();
      } catch (err) {
        toast.show('Gagal membaca file JSON');
      }
    };
  },
};
