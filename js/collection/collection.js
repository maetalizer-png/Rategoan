import { $ } from '../../shared/dom.js';
import { ic } from '../../shared/icons.js';
import { toast } from '../core/toast.js';
import { router } from '../core/router.js';
import { collectionStore } from '../../raget/raget-memory/collection-store.js';
import { collectionSearch } from '../../raget/raget-memory/collection-search.js';
import { memoryLong } from '../../raget/raget-memory/memory-long.js';
import { remindersStore } from '../../vault/reminders/reminders-store.js';
import { drawer } from '../ui/drawer.js';
import { whatsappImporter } from '../../vault/whatsapp/importer.js';
import { evernoteImporter } from '../../vault/evernote/importer.js';
import { notionImporter } from '../../vault/notion/importer.js';
import { searchDocs, indexDocs } from '../../raget/raget-vault/local-rag.js';
import { icsParser } from '../../vault/calendar/ics-parser.js';

const TEMPLATE = `
      <div class="settings-page">
        <header class="settings-header">
          <button id="coll-back" class="back-btn plain" aria-label="Kembali">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"/>
              <polyline points="12 19 5 12 12 5"/>
            </svg>
          </button>
          <h1>Koleksi</h1>
          <span class="row-spacer"></span>
          <button type="button" id="coll-new-note" class="coll-head-note" data-open-note="1">+ Catatan</button>
          <button id="coll-more" class="icon-btn" aria-label="Menu lainnya">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg>
          </button>
        </header>
        <hr class="divider">
        <div class="coll-tabs">
          <button type="button" class="coll-tab on" data-ctab="tersimpan">Tersimpan</button>
          <button type="button" class="coll-tab" data-ctab="perpus">Perpustakaan</button>
        </div>
        <p id="coll-tab-desc" class="coll-tab-desc"></p>
        <div class="coll-search-box">
          <svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.3-4.3"/></svg>
          <input id="coll-search" type="search" placeholder="Cari di koleksi…" autocomplete="off">
        </div>
        <div id="coll-filters" class="coll-filters"></div>
        <div id="coll-note-modal" class="app-modal" hidden>
          <form id="coll-note-form" class="app-modal-card">
            <h2>Catatan koleksi</h2>
            <input id="coll-note-title" type="text" placeholder="Judul catatan" autocomplete="off">
            <div class="coll-note-tags" id="coll-note-tags">
              <button type="button" data-coll-tag="prompt" class="on">Prompt</button>
              <button type="button" data-coll-tag="kode">Kode</button>
              <button type="button" data-coll-tag="riset">Riset</button>
              <button type="button" data-coll-tag="fakta">Fakta</button>
              <button type="button" data-coll-tag="web">Web</button>
              <button type="button" data-coll-tag="dokumen">Dokumen</button>
            </div>
            <textarea id="coll-note-body" rows="5" placeholder="Catatan atau kutipan"></textarea>
            <div class="app-modal-actions">
              <button type="button" id="coll-note-cancel">Batal</button>
              <button type="submit" id="coll-note-save">Simpan ke koleksi</button>
            </div>
          </form>
        </div>
        <input type="file" id="coll-import-file" accept="application/json,.json" hidden>
        <div id="coll-content"></div>
      </div>
      <div id="coll-menu" hidden>
        <button id="coll-export-md" type="button">Ekspor Markdown</button>
        <button id="coll-export-json" type="button">Backup JSON</button>
        <button id="coll-import" type="button">Impor JSON</button>
        <button id="coll-import-wa" type="button">Impor WhatsApp</button>
        <button id="coll-import-enex" type="button">Impor Evernote</button>
        <button id="coll-import-notion" type="button">Impor Notion</button>
        <button id="coll-import-ics" type="button">Impor Kalender</button>
      </div>
`;

const COMMON_TAGS = ['faktoid', 'hitung', 'pengingat', 'obrolan', 'ingatan', 'umum', 'artefak'];

const FACT_LABEL = {
  nama: 'Nama',
  pekerjaan: 'Pekerjaan',
  kota: 'Kota tinggal',
  suka: 'Suka',
  mode_richness: 'Gaya jawaban',
  mode_tone: 'Nada bicara',
};

function fmtFactValue(value) {
  return Array.isArray(value) ? value.join(', ') : String(value);
}

const TAB_DESC = {
  tersimpan: 'Pesan dan balasan AI yang kamu simpan sendiri dari chat, lengkap dengan tag dan catatan pribadi.',
  perpus: 'Semua yang Raget ingat otomatis: catatan, fakta yang diajarkan, dan file yang kamu impor.',
  artefak: 'Hasil kerja yang layak disimpan: draf email, kartu negara, dan ekspor catatan.',
};

let state = { tab: 'tersimpan', filter: null, query: '' };
let renderGen = 0;

function badgeFor(kind) {
  const key = String(kind || 'catatan');
  const label = {
    pdf: 'PDF',
    notion: 'Notion',
    evernote: 'Evernote',
    whatsapp: 'WhatsApp',
    fact: 'Memori',
    learned: 'Memori',
    note: 'Catatan',
    web: 'Web',
  }[key] || key;
  return '<span class="coll-badge coll-badge-' + escapeHtml(key) + '">' + escapeHtml(label) + '</span>';
}

function chipCaption(f) {
  if (f.key === 'pinned') return ic('pin') + ' Pin';
  if (f.key === 'archived') return ic('archive') + ' Arsip';
  return escapeHtml(String(f.label || ''));
}

function escapeHtml(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function fmtDate(t) {
  return new Date(t).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

function relTime(t) {
  const mins = Math.round((Date.now() - Number(t || 0)) / 60000);
  if (mins < 1) return 'baru saja';
  if (mins < 60) return mins + ' menit lalu';
  const hours = Math.round(mins / 60);
  if (hours < 24) return hours + ' jam lalu';
  const days = Math.round(hours / 24);
  if (days < 14) return days + ' hari lalu';
  return fmtDate(t);
}

async function renderTersimpan() {
  const myGen = ++renderGen;
  const content = $('coll-content');
  const allActive = await collectionStore.allItems();
  if (myGen !== renderGen) return;
  const chatItems = allActive.filter((it) => it.kind === 'chat');

  const stats = await collectionStore.stats();
  if (myGen !== renderGen) return;
  const withArchivedForCount = await collectionStore.allItems({ includeArchived: true });
  if (myGen !== renderGen) return;
  const archivedCount = withArchivedForCount.filter((it) => it.archived && it.kind === 'chat').length;
  const tagCounts = new Map();
  chatItems.forEach((it) => {
    if (!it.tag || it.tag === 'prompt' || it.tag === 'kode' || it.tag === 'riset') return;
    tagCounts.set(it.tag, (tagCounts.get(it.tag) || 0) + 1);
  });
  const filterChips = [
    { key: null, label: 'Semua', count: chatItems.length },
    { key: 'prompt', label: 'Prompt favorit', count: chatItems.filter((it) => it.tag === 'prompt').length },
    { key: 'kode', label: 'Kutipan kode', count: chatItems.filter((it) => it.tag === 'kode').length },
    { key: 'riset', label: 'Ringkasan riset', count: chatItems.filter((it) => it.tag === 'riset').length },
    { key: 'pinned', label: ic('pin') + ' Pin', count: chatItems.filter((it) => it.pinned).length },
    ...Array.from(tagCounts.entries()).map(([tag, count]) => ({ key: tag, label: tag, count })),
    { key: 'archived', label: ic('archive') + ' Arsip', count: archivedCount },
  ];
  const noteBtn = $('coll-new-note');
  if (!chatItems.length) {
    if ($('coll-filters')) {
      $('coll-filters').innerHTML = '';
      $('coll-filters').hidden = true;
    }
    if (noteBtn) noteBtn.hidden = true;
    $('coll-tab-desc').textContent = TAB_DESC.tersimpan;
    if (myGen !== renderGen) return;
    content.innerHTML =
      '<div class="coll-empty">' + ic('bookmark') +
      '<div class="coll-empty-title">Koleksi ini masih sepi</div>' +
      '<div class="coll-empty-body">Simpan balasan dari obrolan, atau tulis catatan sendiri untuk prompt favorit dan cuplikan kode.</div>' +
      '<button type="button" class="coll-empty-note" data-open-note="1">+ Catatan Baru</button></div>';
    return;
  }
  if ($('coll-filters')) $('coll-filters').hidden = false;
  if (noteBtn) noteBtn.hidden = false;
  $('coll-tab-desc').textContent = TAB_DESC.tersimpan;
  $('coll-filters').innerHTML = filterChips
    .map((f) => '<button type="button" class="coll-filter-chip' + (state.filter === f.key ? ' on' : '') + '" data-filter="' + escapeHtml(String(f.key)) + '">' + chipCaption(f) + ' (' + f.count + ')</button>')
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
  else if (state.filter === 'archived') list = withArchivedForCount.filter((it) => it.archived && it.kind === 'chat');
  else if (state.filter) list = list.filter((it) => it.tag === state.filter);

  let matchInfo = new Map();
  if (state.query.trim()) {
    const results = collectionSearch.fuzzySearch(list, state.query, 100);
    if (results.length) {
      list = results.map((r) => r.item);
      results.forEach((r) => matchInfo.set(r.item.id, r.matched));
    } else {
      const ranked = searchDocs(list.map((it) => ({ id: it.id, text: [it.text, it.note, it.tag, it.chatTitle].filter(Boolean).join(' ') })), state.query, 20);
      const ids = new Set(ranked.map((hit) => hit.id));
      list = list.filter((it) => ids.has(it.id));
    }
  }

  list.sort((a, b) => (b.pinned - a.pinned) || (b.time - a.time));

  const statsRow =
    '<div class="coll-stats-row"><span>Total <b>' + chatItems.length + '</b></span>' +
    (stats.topTags.length ? '<span>Top tag: <b>' + stats.topTags.slice(0, 3).map((t) => t.tag).join(', ') + '</b></span>' : '') +
    '<span>Pin <b>' + chatItems.filter((it) => it.pinned).length + '</b></span></div>';

  if (myGen !== renderGen) return;
  if (!list.length) {
    content.innerHTML = (chatItems.length ? statsRow : '') +
      '<div class="coll-empty">' + ic('bookmark') +
      '<div class="coll-empty-title">Koleksi ini masih sepi</div>' +
      '<div class="coll-empty-body">Simpan balasan dari obrolan, atau tulis catatan sendiri. Contoh: prompt yang sering dipakai, potongan kode, atau ringkasan riset.</div>' +
      '<button type="button" class="coll-empty-note" data-open-note="1">+ Catatan</button></div>';
    return;
  }

  content.innerHTML =
    statsRow +
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
    '<span class="coll-item-time">' + relTime(it.time) + '</span>' +
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
    '<button type="button" data-chat="' + it.id + '">Kirim ke chat</button>' +
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
  content.querySelectorAll('[data-chat]').forEach((b) => b.onclick = () => {
    const item = list.find((x) => x.id === b.dataset.chat);
    const inp = $('chat-input');
    if (!item || !inp) return;
    inp.value = item.text;
    inp.dispatchEvent(new Event('input'));
    router.go('chat');
    toast.show('Catatan masuk ke kotak tulis');
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

function libGroupHtml(title, items, emptyText) {
  if (!items.length) {
    return '<div class="coll-lib-group"><div class="coll-lib-group-head">' + title + '</div>' +
      '<div class="coll-empty-cta">' + emptyText + '</div></div>';
  }
  return '<div class="coll-lib-group"><div class="coll-lib-group-head">' + title +
    ' <span class="coll-lib-group-count">(' + items.length + ')</span></div>' +
    items.map((x) => (
      '<div class="coll-item" data-lib-id="' + x.id + '" data-lib-kind="' + x.kind + '">' +
      '<div class="coll-item-head">' + badgeFor(x.kind) +
      (x.time ? '<span class="coll-item-time">' + fmtDate(x.time) + '</span>' : '') + '</div>' +
      '<div class="coll-item-text">' + collectionSearch.highlightText(x.text, x._matched) + '</div>' +
      '<div class="coll-item-actions"><button type="button" class="danger" data-lib-del="' + x.id + '" data-lib-del-kind="' + x.kind + '" data-lib-del-store="' + (x.store || '') + '">' + ic('trash') + ' Hapus</button></div>' +
      '</div>'
    )).join('') + '</div>';
}

async function renderPerpustakaan() {
  const myGen = ++renderGen;
  const content = $('coll-content');
  $('coll-tab-desc').textContent = TAB_DESC.perpus;
  const notes = memoryLong.allNotes().map((n, i) => ({ id: 'note-' + i, kind: 'note', text: n.text, time: n.time }));
  const learned = memoryLong.allLearned().map((f, i) => ({ id: 'learned-' + i, kind: 'learned', text: f.subject + ': ' + f.value, time: f.time, subject: f.subject }));
  const facts = Object.entries(memoryLong.allFacts()).map(([key, value]) => ({
    id: 'fact-' + key,
    kind: 'fact',
    text: (FACT_LABEL[key] || key) + ': ' + fmtFactValue(value),
    time: null,
    key,
  }));

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
  } catch (e) { console.warn('[Rategoan Fallback] collection:', e); }
  if (myGen !== renderGen) return;

  const memoryImport = await import('../../raget/raget-memory/memory-index.js');
  const knowStats = await memoryImport.memoryIndex.stats();
  if (myGen !== renderGen) return;

  $('coll-filters').innerHTML = '';

  const applyQuery = (items) => {
    if (!state.query.trim()) return items;
    const results = collectionSearch.fuzzySearch(items.map((x) => ({ ...x, note: '', tag: '', chatTitle: '' })), state.query, 100);
    const matchedIds = new Map(results.map((r) => [r.item.id, r.matched]));
    return items.filter((x) => matchedIds.has(x.id)).map((x) => ({ ...x, _matched: matchedIds.get(x.id) }));
  };

  const savedWeb = (await collectionStore.allItems()).filter((it) => it.kind === 'web');
  if (myGen !== renderGen) return;
  const notesQ = applyQuery(notes).sort((a, b) => b.time - a.time);
  const factsQ = applyQuery(facts).sort((a, b) => a.key.localeCompare(b.key));
  const learnedQ = applyQuery(learned).sort((a, b) => b.time - a.time);
  const vaultQ = applyQuery(vaultItems).sort((a, b) => b.time - a.time);
  const webQ = applyQuery(savedWeb.map((it) => ({ id: it.id, kind: 'web', store: 'collection', text: it.text, time: it.time }))).sort((a, b) => b.time - a.time);
  indexDocs([...notesQ, ...factsQ, ...learnedQ, ...vaultQ, ...webQ].map((item) => ({ id: item.kind + ':' + item.id, text: item.text, kind: item.kind }))).catch(() => {});

  const q = state.query.trim().toLowerCase();
  const knowledgeMatches = !q || 'pengetahuan faq umum'.includes(q);

  content.innerHTML =
    libGroupHtml('Catatan', notesQ, 'Belum ada catatan. Minta Raget mengingat sesuatu, mis. "ingat ya, aku suka kopi".') +
    libGroupHtml('Fakta tentang saya', factsQ, 'Belum ada fakta pribadi tersimpan. Muncul otomatis kalau kamu cerita, mis. "nama saya Dinda".') +
    libGroupHtml('Fakta diajarkan', learnedQ, 'Belum ada fakta yang diajarkan. Ajari Raget lewat chat, mis. "ulang tahunku itu 5 Mei".') +
    libGroupHtml('Chunk impor (PDF/Notion/Evernote/WhatsApp)', vaultQ, 'Belum ada file diimpor. Kirim PDF di chat, ketik: baca pdf ini.') +
    libGroupHtml('Hasil pencarian web', webQ, 'Belum ada hasil pencarian yang disimpan.') +
    '<div class="coll-lib-group"><div class="coll-lib-group-head">Pengetahuan (umum &amp; FAQ)</div>' +
    (knowledgeMatches
      ? '<div class="coll-stats-row"><span>Topik umum <b>' + knowStats.umumCount + '</b></span><span>FAQ <b>' + knowStats.faqCount + '</b></span></div>' +
        '<p class="coll-tab-desc" style="margin-top:0">Bawaan aplikasi, selalu tersedia untuk dijawab Raget — tidak bisa dihapus dari sini.</p>'
      : '<div class="coll-empty-cta">Tidak cocok dengan pencarian.</div>') +
    '</div>';

  content.querySelectorAll('[data-lib-del]').forEach((b) => b.onclick = async () => {
    const kind = b.dataset.libDelKind;
    const id = b.dataset.libDel;
    if (kind === 'note') {
      const n = notes.find((x) => x.id === id);
      if (n) memoryLong.forgetNote(n.text);
    } else if (kind === 'fact') {
      const f = facts.find((x) => x.id === id);
      if (f) memoryLong.forgetFact(f.key);
    } else if (kind === 'learned') {
      const f = learned.find((x) => x.id === id);
      if (f) memoryLong.forgetLearned(f.subject);
    } else if (b.dataset.libDelStore === 'collection') {
      await collectionStore.removeItem(id);
    } else {
      const storeName = b.dataset.libDelStore;
      try {
        const mod = await import('../../vault/' + storeName + '/' + storeName + '-store.js');
        const storeObj = mod[storeName + 'Store'];
        if (storeObj && storeObj.removeItem) await storeObj.removeItem(id);
      } catch (e) { console.warn('[Rategoan Fallback] collection:', e); }
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

function goToChatWithPrompt(text) {
  router.go('chat');
  const inp = document.getElementById('chat-input');
  if (inp) {
    inp.value = text;
    inp.focus();
  }
}

async function renderArtefak() {
  const myGen = ++renderGen;
  const content = $('coll-content');
  $('coll-tab-desc').textContent = TAB_DESC.artefak;
  const artifacts = (await collectionStore.allItems()).filter((it) => it.kind === 'artifact');
  if (myGen !== renderGen) return;
  const trips = readTravelJson('travel_trips').map((t, i) => ({ id: 'trip-' + i, kind: 'itinerary', text: 'Rencana ' + t.country + ' — ' + t.days + ' hari (' + t.tier + ')', time: t.time }));
  const favs = readTravelJson('travel_fav').map((f, i) => ({ id: 'fav-' + i, kind: 'favorit', text: 'Favorit: ' + (f.name || f), time: f.time || 0 }));
  const exports = readTravelJson('raget_exports').map((x, i) => ({ id: 'export-' + i, kind: x.kind || 'ekspor', text: x.label, time: x.time || 0 }));

  $('coll-filters').innerHTML = '';
  let all = [
    ...artifacts.map((a) => ({ id: a.id, kind: a.artifactType || 'artefak', text: a.text, time: a.time, deletable: true })),
    ...trips.map((t) => ({ ...t, deletable: false })),
    ...favs.map((f) => ({ ...f, deletable: false })),
    ...exports.map((x) => ({ ...x, deletable: false })),
  ];

  if (state.query.trim()) {
    const results = collectionSearch.fuzzySearch(all.map((x) => ({ ...x, note: '', tag: '', chatTitle: '' })), state.query, 100);
    const matchedIds = new Map(results.map((r) => [r.item.id, r.matched]));
    all = all.filter((x) => matchedIds.has(x.id));
  }
  all.sort((a, b) => b.time - a.time);

  if (myGen !== renderGen) return;
  if (!all.length) {
    content.innerHTML =
      '<div class="coll-empty-cta">' + ic('download') +
      '<div class="coll-empty-title">Belum ada hasil kerja tersimpan</div>' +
      '<div class="coll-empty-body">Berbeda dari tab Tersimpan (pesan chat) - Artefak muncul OTOMATIS dari draf email, kartu negara, dan ekspor catatan, tanpa perlu tap Simpan.</div>' +
      '<div class="coll-empty-actions">' +
      '<button type="button" id="artCtaEmail">' + ic('mail') + ' Buat email</button>' +
      '<button type="button" id="artCtaExport">' + ic('download') + ' Ekspor chat</button>' +
      '</div></div>';
    const ctaEmail = document.getElementById('artCtaEmail');
    const ctaExport = document.getElementById('artCtaExport');
    if (ctaEmail) ctaEmail.onclick = () => goToChatWithPrompt('buatkan email tentang ');
    if (ctaExport) ctaExport.onclick = () => goToChatWithPrompt('ekspor catatan');
    return;
  }

  content.innerHTML = all.map((x) => (
    '<div class="coll-item" data-art-id="' + x.id + '">' +
    '<div class="coll-item-head"><span class="coll-item-tag">' + x.kind + '</span>' +
    (x.time ? '<span class="coll-item-time">' + fmtDate(x.time) + '</span>' : '') + '</div>' +
    '<div class="coll-item-text">' + escapeHtml(x.text) + '</div>' +
    '<div class="coll-item-actions">' +
    '<button type="button" data-art-copy="' + x.id + '">' + ic('copy') + ' Salin</button>' +
    (x.deletable ? '<button type="button" class="danger" data-art-del="' + x.id + '">' + ic('trash') + ' Hapus</button>' : '') +
    '</div></div>'
  )).join('');

  content.querySelectorAll('[data-art-copy]').forEach((b) => b.onclick = () => {
    const item = all.find((x) => x.id === b.dataset.artCopy);
    if (item && navigator.clipboard) navigator.clipboard.writeText(item.text).then(() => toast.show('Disalin'));
  });
  content.querySelectorAll('[data-art-del]').forEach((b) => b.onclick = async () => {
    await collectionStore.removeItem(b.dataset.artDel);
    toast.show('Dihapus');
    renderArtefak();
  });
}

async function renderTab() {
  const desc = $('coll-tab-desc');
  if (desc) desc.textContent = state.tab === 'perpus' ? TAB_DESC.perpus : TAB_DESC.tersimpan;
  const filters = $('coll-filters');
  if (state.tab !== 'tersimpan' && filters) filters.innerHTML = '';
  const run = state.tab === 'perpus' ? renderPerpustakaan : renderTersimpan;
  return Promise.resolve(run()).catch((e) => {
    const content = $('coll-content');
    if (content) content.innerHTML = '<div class="coll-empty"><div class="coll-empty-title">Gagal memuat tab</div><div class="coll-empty-body">' + escapeHtml(e && e.message ? e.message : 'error') + '</div></div>';
  });
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

function armImport(kind, accept) {
  const input = $('coll-import-file');
  input.dataset.kind = kind;
  input.accept = accept;
  input.click();
}

async function rememberChunk(text, tag, title) {
  const clean = String(text || '').trim();
  if (!clean) return 0;
  await collectionStore.addItem({ text: clean.slice(0, 4000), role: 'user', tag: tag, kind: 'note', chatTitle: title || '', note: 'Impor ' + tag });
  return 1;
}

async function importPersonal(kind, file) {
  if (kind === 'json') {
    const items = JSON.parse(await file.text());
    return collectionStore.importItems(items);
  }
  if (kind === 'whatsapp') {
    const parsed = whatsappImporter.importWhatsApp(await file.text());
    if (!parsed.ok) throw new Error(parsed.message || 'WhatsApp tidak terbaca');
    let n = 0;
    for (const chunk of parsed.chunks || []) n += await rememberChunk(chunk.text, 'whatsapp', file.name);
    return n;
  }
  if (kind === 'enex') {
    const parsed = evernoteImporter.importENEX(await file.text());
    if (!parsed.ok) throw new Error(parsed.message || 'ENEX tidak terbaca');
    let n = 0;
    for (const chunk of parsed.chunks || []) n += await rememberChunk((chunk.title ? chunk.title + '\n' : '') + chunk.text, 'evernote', chunk.title);
    return n;
  }
  if (kind === 'ics') {
    const events = icsParser.parseICS(await file.text());
    if (!events.length) throw new Error('Tidak ada acara di berkas kalender');
    let n = 0;
    for (const event of events) {
      const when = event.start ? new Date(event.start).toLocaleString('id-ID') : '';
      n += await rememberChunk([event.summary, when, event.location || '', event.description || ''].filter(Boolean).join('\n'), 'kalender', event.summary);
    }
    return n;
  }
  if (/\.md$/i.test(file.name || '')) {
    return rememberChunk(await file.text(), 'notion', file.name);
  }
  const ready = await notionImporter.downloadPackage();
  if (!ready) throw new Error('Paket Notion belum siap. Coba lagi saat jaringan ada.');
  const parsed = await notionImporter.importZip(await file.arrayBuffer());
  if (!parsed.ok) throw new Error(parsed.message || 'Arsip Notion tidak terbaca');
  let n = 0;
  for (const chunk of parsed.chunks || []) n += await rememberChunk((chunk.breadcrumb ? chunk.breadcrumb + '\n' : '') + chunk.text, 'notion', chunk.title);
  return n;
}

export const collectionPage = {
  async open() {
    state = { tab: 'tersimpan', filter: null, query: '' };
    $('coll-search').value = '';
    document.querySelectorAll('.coll-tab').forEach((t) => t.classList.toggle('on', t.dataset.ctab === 'tersimpan'));
    await renderTab();
  },
  bind() {
    $('view-collection').innerHTML = TEMPLATE;
    $('btn-collection').onclick = () => {
      drawer.close();
      this.open();
      router.go('collection');
    };
    window.addEventListener('hashchange', () => {
      if ((location.hash || '').indexOf('collection') >= 0) this.open();
    });
    $('coll-back').onclick = () => router.go('chat');
    const collMenu = $('coll-menu');
    const moreBtn = $('coll-more');
    const closeCollMenu = () => { collMenu.hidden = true; };
    moreBtn.onclick = () => {
      if (!collMenu.hidden) { closeCollMenu(); return; }
      collMenu.hidden = false;
      const r = moreBtn.getBoundingClientRect();
      const m = collMenu.getBoundingClientRect();
      collMenu.style.top = r.bottom + 6 + 'px';
      collMenu.style.left = Math.max(8, r.right - m.width) + 'px';
    };
    document.addEventListener('click', (e) => {
      if (!collMenu.hidden && e.target !== moreBtn && !collMenu.contains(e.target) && !moreBtn.contains(e.target)) {
        closeCollMenu();
      }
    });
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
      closeCollMenu();
      const items = (await collectionStore.allItems()).filter((it) => it.kind === 'chat');
      if (!items.length) { toast.show('Belum ada yang tersimpan'); return; }
      downloadFile(exportMarkdown(items), 'text/markdown', 'koleksi-' + new Date().toISOString().slice(0, 10) + '.md');
    };
    $('coll-export-json').onclick = async () => {
      closeCollMenu();
      const items = await collectionStore.allItems({ includeArchived: true });
      downloadFile(JSON.stringify(items, null, 2), 'application/json', 'koleksi-backup-' + new Date().toISOString().slice(0, 10) + '.json');
    };
    const noteBtn = $('coll-new-note');
    const modal = $('coll-note-modal');
    const openNote = () => { if (modal) modal.hidden = false; };
    if (noteBtn) noteBtn.onclick = openNote;
    $('view-collection').addEventListener('click', (event) => {
      if (event.target.closest('[data-open-note]') && event.target !== noteBtn) openNote();
    });
    const chosenTag = () => {
      const on = document.querySelector('#coll-note-tags button.on');
      return (on && on.dataset.collTag) || 'prompt';
    };
    document.querySelectorAll('#coll-note-tags button').forEach((btn) => {
      btn.onclick = () => {
        document.querySelectorAll('#coll-note-tags button').forEach((other) => other.classList.toggle('on', other === btn));
      };
    });
    const cancel = $('coll-note-cancel');
    if (cancel) cancel.onclick = () => { modal.hidden = true; };
    const form = $('coll-note-form');
    if (form) form.onsubmit = async (event) => {
      event.preventDefault();
      const title = ($('coll-note-title').value || '').trim();
      const text = ($('coll-note-body').value || '').trim();
      if (!text && !title) return;
      await collectionStore.addItem({
        kind: 'chat',
        role: 'user',
        text: text || title,
        tag: chosenTag(),
        chatTitle: title || 'Catatan',
        note: title,
      });
      $('coll-note-title').value = '';
      $('coll-note-body').value = '';
      modal.hidden = true;
      toast.show('Catatan masuk koleksi');
      renderTab();
    };
    $('coll-import').onclick = () => {
      closeCollMenu();
      armImport('json', 'application/json,.json');
    };
    $('coll-import-wa').onclick = () => {
      closeCollMenu();
      armImport('whatsapp', '.txt,text/plain');
    };
    $('coll-import-enex').onclick = () => {
      closeCollMenu();
      armImport('enex', '.enex,application/xml,text/xml');
    };
    $('coll-import-notion').onclick = () => {
      closeCollMenu();
      armImport('notion', '.zip,.md,application/zip,text/markdown');
    };
    $('coll-import-ics').onclick = () => {
      closeCollMenu();
      armImport('ics', '.ics,text/calendar');
    };
    $('coll-import-file').onchange = async (e) => {
      const f = e.target.files && e.target.files[0];
      const kind = e.target.dataset.kind || 'json';
      e.target.value = '';
      if (!f) return;
      try {
        const added = await importPersonal(kind, f);
        toast.show(added + ' item diimpor');
        renderTab();
      } catch (err) {
        toast.show(err && err.message ? err.message : 'Gagal membaca berkas');
      }
    };
  },
};
