import { $, sleep, scrollBottom } from '../utils/dom.js';
import { fmtTime } from '../utils/format.js';
import { reduceMotion } from '../utils/haptics.js';
import { markdown } from '../utils/markdown.js';
import { copy } from '../utils/clipboard.js';
import { store } from '../state/store.js';
import { scrolldown } from '../ui/scrolldown.js';
import { toast } from '../core/toast.js';
import { voice } from './voice.js';
import { ai } from '../ai/ai.js';
import { tts } from '../state/tts.js';
import { ic } from '../utils/icons.js';
import { router } from '../core/router.js';
import { ragetDb } from '../../raget/raget-database/raget-db.js';
import { collectionStore } from '../../raget/raget-memory/collection-store.js';
import { feedbackStore } from '../../raget/raget-memory/feedback-store.js';

const URL_RE = /https?:\/\/\S+/i;

function buildSourceBadge() {
  const badge = document.createElement('div');
  badge.className = 'msg-source-badge';
  badge.innerHTML = ic('globe') + '<span>Hasil pencarian web</span>';
  return badge;
}

function buildExtraChip(label, onClick, iconName) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'msg-action-btn';
  if (iconName) {
    btn.innerHTML = ic(iconName);
    btn.appendChild(document.createTextNode(' ' + label));
  } else {
    btn.textContent = label;
  }
  btn.onclick = onClick;
  return btn;
}

function fillComposer(text) {
  const inp = $('chat-input');
  if (!inp) return;
  inp.value = text;
  inp.dispatchEvent(new Event('input'));
  inp.focus();
}

function fillAndSend(text) {
  const inp = $('chat-input');
  if (!inp) return;
  inp.value = text;
  inp.dispatchEvent(new Event('input'));
  const btn = $('btn-send');
  if (btn) btn.click();
}

function detectQuickChips(text) {
  if (/pengingat\b.*(dibatalkan|ditambahkan)|akan mengingatkan|sudah saya catat sebagai pengingat/i.test(text)) {
    return ['Batalkan pengingat'];
  }
  const capitalMatch = text.match(/[Ii]bukota\s+([A-Z][a-zA-Z\s]+?)\s+adalah/);
  if (capitalMatch) {
    const negara = capitalMatch[1].trim();
    return ['Wisata ' + negara];
  }
  if (/^#{1,3}\s|\n- |\n\d+\.\s/.test(text)) {
    return ['Ringkas hari saya'];
  }
  return [];
}

function buildMoreBtn() {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'msg-more-btn';
  btn.setAttribute('aria-label', 'Menu pesan');
  btn.innerHTML =
    '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg>';
  return btn;
}

// Jam + tombol menu (titik tiga) satu baris rata kanan - dulu keduanya
// di-append terpisah ke .msg, yang bikin tombolnya turun ke baris sendiri
// (elemen .time pakai display:block) alih-alih sejajar dengan jam.
function buildMetaRow(time) {
  const row = document.createElement('div');
  row.className = 'msg-meta';
  const tm = document.createElement('span');
  tm.className = 'time';
  tm.textContent = fmtTime(time);
  row.appendChild(tm);
  row.appendChild(buildMoreBtn());
  return row;
}

function buildActions(text) {
  const row = document.createElement('div');
  row.className = 'msg-actions';

  const copyBtn = document.createElement('button');
  copyBtn.type = 'button';
  copyBtn.className = 'msg-action-btn';
  copyBtn.innerHTML = ic('copy') + ' Salin';
  copyBtn.onclick = () => {
    copy(text)
      .then(() => toast.show('Disalin'))
      .catch(() => toast.show('Gagal menyalin'));
  };

  const speakBtn = document.createElement('button');
  speakBtn.type = 'button';
  speakBtn.className = 'msg-action-btn';
  speakBtn.innerHTML = ic('speaker') + ' Baca';
  speakBtn.onclick = () => voice.speak(text);

  const shareBtn = document.createElement('button');
  shareBtn.type = 'button';
  shareBtn.className = 'msg-action-btn';
  shareBtn.innerHTML = ic('share') + ' Bagikan';
  shareBtn.onclick = () => {
    if (navigator.share) {
      navigator.share({ text }).catch(() => {});
    } else {
      copy(text)
        .then(() => toast.show('Disalin'))
        .catch(() => toast.show('Gagal menyalin'));
    }
  };

  const saveBtn = document.createElement('button');
  saveBtn.type = 'button';
  saveBtn.className = 'msg-action-btn';
  saveBtn.innerHTML = ic('bookmark') + ' Simpan';
  saveBtn.onclick = async () => {
    if (await collectionStore.existsByText(text)) {
      toast.show('Sudah ada di Koleksi');
      return;
    }
    const notes = await ragetDb.allNotes();
    const match = notes.slice().reverse().find((n) => n.answer.trim() === text.trim());
    const tag = collectionStore.tagFromIntent(match ? match.intent : null);
    const current = chat.current();
    await collectionStore.addItem({ text, role: 'ai', tag, chatTitle: (current && current.title) || '' });
    saveBtn.innerHTML = ic('bookmarkFilled') + ' Tersimpan';
    saveBtn.disabled = true;
    toast.show('Disimpan ke Koleksi');
    if (!row.querySelector('.coll-view-chip')) {
      const viewChip = buildExtraChip('Lihat Koleksi', () => router.go('collection'), 'bookmark');
      viewChip.classList.add('coll-view-chip');
      row.appendChild(viewChip);
    }
  };

  const upBtn = document.createElement('button');
  upBtn.type = 'button';
  upBtn.className = 'msg-action-btn';
  upBtn.innerHTML = ic('thumbUp');
  upBtn.setAttribute('aria-label', 'Balasan bagus');
  const downBtn = document.createElement('button');
  downBtn.type = 'button';
  downBtn.className = 'msg-action-btn';
  downBtn.innerHTML = ic('thumbDown');
  downBtn.setAttribute('aria-label', 'Balasan kurang tepat');
  async function noteOfAnswer() {
    const notes = await ragetDb.allNotes();
    const match = notes.slice().reverse().find((n) => n.answer.trim() === text.trim());
    return { intent: match ? match.intent : null, sourceEntryId: match ? match.sourceEntryId || null : null };
  }

  upBtn.onclick = async () => {
    await ragetDb.rateByAnswer(text, true);
    const note = await noteOfAnswer();
    feedbackStore.record(true, note.intent, note.sourceEntryId);
    upBtn.classList.add('rated');
    downBtn.classList.remove('rated');
    toast.show('Makasih atas masukannya');
    if (!(await collectionStore.existsByText(text)) && !row.querySelector('.coll-suggest-chip')) {
      const suggestChip = buildExtraChip('Simpan ke Koleksi?', () => saveBtn.click(), 'bookmark');
      suggestChip.classList.add('coll-suggest-chip');
      row.appendChild(suggestChip);
    }
  };
  downBtn.onclick = async () => {
    await ragetDb.rateByAnswer(text, false);
    const note = await noteOfAnswer();
    feedbackStore.record(false, note.intent, note.sourceEntryId);
    downBtn.classList.add('rated');
    upBtn.classList.remove('rated');
    toast.show('Dicatat, makasih');
  };

  row.appendChild(copyBtn);
  row.appendChild(speakBtn);
  row.appendChild(shareBtn);
  row.appendChild(saveBtn);
  row.appendChild(upBtn);
  row.appendChild(downBtn);
  return row;
}

export const chat = {
  current() {
    const st = store.get();
    return st.sessions.find((s) => s.id === st.currentId) || null;
  },
  dayLabel(t) {
    const d = new Date(t).toDateString();
    const now = new Date();
    if (d === now.toDateString()) return 'Hari ini';
    if (d === new Date(now.getTime() - 86400000).toDateString()) return 'Kemarin';
    return new Date(t).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  },
  renderMessages() {
    const box = $('messages');
    const empty = $('empty-state');
    box.innerHTML = '';
    const s = this.current();
    const has = !!(s && s.messages.length);
    if (empty) empty.hidden = has;
    box.style.display = has ? '' : 'none';
    if (!has) {
      scrolldown.update();
      return;
    }
    let lastDay = '';
    s.messages.forEach((m, idx) => {
      const day = new Date(m.time).toDateString();
      if (day !== lastDay) {
        lastDay = day;
        const dv = document.createElement('div');
        dv.className = 'day-divider';
        dv.textContent = this.dayLabel(m.time);
        box.appendChild(dv);
      }
      const d = document.createElement('div');
      d.className = 'msg ' + (m.role === 'user' ? 'user' : 'ai');
      d.dataset.idx = String(idx);
      if (m.quote) {
        const q = document.createElement('span');
        q.className = 'msg-quote';
        q.textContent = m.quote.name + ': ' + m.quote.text;
        d.appendChild(q);
      }
      if (m.role === 'user') {
        const t = document.createElement('span');
        t.textContent = m.text;
        d.appendChild(t);
      } else {
        if (m.source === 'websearch') d.appendChild(buildSourceBadge());
        const b = document.createElement('div');
        b.innerHTML = markdown.render(m.text);
        d.appendChild(b);
      }
      if (m.attach) {
        if (m.attach.thumb) {
          const img = document.createElement('img');
          img.className = 'msg-thumb';
          img.src = m.attach.thumb;
          img.alt = m.attach.name || 'lampiran';
          d.appendChild(img);
        }
        const a = document.createElement('span');
        a.className = 'msg-attach';
        a.innerHTML = ic('paperclip');
        a.appendChild(document.createTextNode(m.attach.name));
        d.appendChild(a);
      }
      // Menu pesan (Salin/Balas/Ubah/Kirim ulang/Hapus) dipicu tombol titik
      // tiga di baris ini (klik, bukan tahan-lama) - dulu dipicu
      // touch-and-hold di mana pun pada bubble, yang bentrok dengan gestur
      // select-teks native (copy jadi tidak pernah kepicu karena keburu
      // ke-hijack timer 480ms).
      d.appendChild(buildMetaRow(m.time));
      if (m.role === 'user' && m.attach && m.attach.full) {
        const row = document.createElement('div');
        row.className = 'msg-actions';
        row.appendChild(buildExtraChip('Baca Gambar Ini', () => fillComposer('baca foto ini'), 'search'));
        d.appendChild(row);
      }
      if (m.role !== 'user') {
        const actions = buildActions(m.text);
        if (URL_RE.test(m.text)) {
          actions.appendChild(buildExtraChip('Bedah', () => fillComposer('bedah ' + m.text.match(URL_RE)[0]), 'globe'));
        }
        detectQuickChips(m.text).slice(0, 1).forEach((label) => {
          actions.appendChild(buildExtraChip(label, () => fillAndSend(label)));
        });
        d.appendChild(actions);
      }
      box.appendChild(d);
    });
    scrollBottom();
    scrolldown.update();
  },
  async typeReply(text, follow, opts) {
    const s = this.current();
    const d = document.createElement('div');
    d.className = 'msg ai';
    d.dataset.idx = String(s.messages.length - 1);
    if (opts && opts.searching) d.appendChild(buildSourceBadge());
    const body = document.createElement('div');
    d.appendChild(body);
    $('messages').appendChild(d);
    if (follow && !reduceMotion() && text.length > 0) {
      let skip = false;
      const onTap = () => { skip = true; };
      body.addEventListener('pointerdown', onTap, { once: true });
      const long = text.length > 400;
      let i = 0;
      while (i < text.length && !skip) {
        const step = long ? 4 + Math.floor(Math.random() * 3) : 1 + Math.floor(Math.random() * 2);
        i += step;
        body.innerHTML = markdown.render(text.slice(0, i));
        scrollBottom();
        const wait = long ? 16 : 18 + Math.floor(Math.random() * 7);
        await sleep(wait);
      }
      body.removeEventListener('pointerdown', onTap);
    }
    body.innerHTML = markdown.render(text);
    d.appendChild(buildMetaRow(Date.now()));
    const actions = buildActions(text);
    if (URL_RE.test(text)) {
      actions.appendChild(buildExtraChip('Bedah', () => fillComposer('bedah ' + text.match(URL_RE)[0]), 'globe'));
    }
    detectQuickChips(text).slice(0, 1).forEach((label) => {
      actions.appendChild(buildExtraChip(label, () => fillAndSend(label)));
    });
    d.appendChild(actions);
    if (follow) {
      scrollBottom();
    } else {
      scrolldown.ping();
    }
  },
  async ask(prompt, opts) {
    const s = this.current();
    const hasDirectReply = !!(opts && opts.directReply != null);
    // directReply (slide/baca-file) tidak pernah dianggap "hasil pencarian
    // web" walau toggle Pencarian Web sedang aktif - dulu badge globe +
    // "Mencari di internet..." tetap muncul di jawaban slide/baca-file
    // cuma karena toggle-nya lupa dimatikan, bikin fitur itu kelihatan
    // salah nyambung ke internet padahal jawabannya lokal murni.
    const searching = !hasDirectReply && !!(opts && opts.searching);
    const typing = document.createElement('div');
    typing.className = 'msg ai typing' + (searching ? ' searching' : '');
    if (searching) {
      typing.innerHTML = ic('globe') + '<span>Mencari di internet…</span>';
    } else {
      typing.textContent = '…';
    }
    $('messages').appendChild(typing);
    scrollBottom();
    const searchStart = Date.now();
    // directReply: dipakai composer.js saat file terlampir (PDF/teks) sudah
    // diekstrak lokal - jawab langsung dari isi file, tidak lewat mesin
    // Raget (yang tidak punya akses ke isi file terlampir sama sekali).
    const reply = hasDirectReply ? opts.directReply : ai ? await ai.generate(s.messages, prompt) : null;
    if (searching) {
      // Koneksi cepat bisa bikin fetch selesai dalam hitungan puluhan ms -
      // indikator "Mencari di internet..." bisa kelewat kedip tanpa sempat
      // kebaca user. Jamin tampil minimal sebentar biar user beneran lihat
      // ada pencarian internet yang jalan, bukan cuma template instan.
      const elapsed = Date.now() - searchStart;
      if (elapsed < 700) await sleep(700 - elapsed);
    }
    typing.remove();
    if (reply == null) return null;
    // source disimpan di sesi (bukan cuma opts lokal) supaya badge "Hasil
    // pencarian web" tidak hilang saat renderMessages() render ulang SEMUA
    // pesan dari data tersimpan (kejadian setiap kali pesan baru dikirim) -
    // tanpa ini badge cuma nempel sesaat lalu ke-reset begitu chat re-render.
    s.messages.push({ role: 'ai', text: reply, time: Date.now(), source: searching ? 'websearch' : undefined });
    await this.typeReply(reply, !scrolldown.isFar(), { searching });
    if (tts.enabled()) voice.speak(reply);
    return reply;
  },
};
