import { $, scrollBottom } from '../utils/dom.js';
import { haptics } from '../utils/haptics.js';
import { toast } from '../core/toast.js';
import { store } from '../state/store.js';
import { auth } from '../state/auth.js';
import { router } from '../core/router.js';
import { drawer } from '../ui/drawer.js';
import { quote } from '../ui/quote.js';
import { history } from '../history/history.js';
import { chat } from './chat.js';
import { attach } from '../sheets/attach.js';
import { sheets } from '../sheets/sheets.js';
import { googleAuth } from '../state/google-auth.js';
import { memoryPreference } from '../state/memory-preference.js';
import { summarizeFileText } from '../utils/file-summary.js';
import { buildOutline, exportSlides } from '../utils/slides-export.js';

// Hanya kepicu kalau ADA file terlampir dengan isi teks berhasil diambil
// (att.fileText) - tanpa itu, kata-kata ini tetap lewat mesin Raget biasa
// seperti sebelumnya (mis. "ringkas hari saya" tanpa lampiran apa pun).
const FILE_READ_RE = /\b(baca|ringkas|rangkum|ekstrak|extract|impor|import)\b/i;
// Sengaja TIDAK menyertakan "presentasi" sendirian sebagai pemicu - kata itu
// sudah dipakai tool nasihat struktur (Pyramid Principle di
// intelligence-rumus.js, trigger "bingung strukturnya"/"susun presentasi").
// Wajib ada "slide"/"ppt"/"pptx" eksplisit supaya jelas maksudnya minta
// FILE dibuat, bukan minta saran cara menyusun presentasi.
const SLIDE_ACTION_RE = /\b(buat(kan)?|bikin|jadikan|susun|export|unduh)\b/i;
const SLIDE_NOUN_RE = /\b(slide|ppt|pptx)\b/i;

async function trySlideRequest(text, att) {
  if (!(SLIDE_ACTION_RE.test(text) && SLIDE_NOUN_RE.test(text))) return null;
  let material = null;
  let judul = 'Presentasi';
  if (att && att.fileText) {
    material = att.fileText;
    judul = (att.name || judul).replace(/\.[a-z0-9]+$/i, '');
  } else {
    const afterColon = text.split(':').slice(1).join(':').trim();
    if (afterColon) {
      material = afterColon;
      const topicMatch = text.match(/\b(?:tentang|untuk|dari)\s+([^:]+?)(?::|$)/i);
      if (topicMatch) judul = topicMatch[1].trim();
    }
  }
  if (!material) {
    return 'Boleh, tapi saya butuh bahannya dulu - lampirkan file (PDF/teks), atau ketik "buatkan slide tentang <judul>: <isi materinya>".';
  }
  try {
    const outline = buildOutline(material, judul);
    const fileName = judul.replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '').toLowerCase() || 'slide';
    await exportSlides(outline, fileName + '.pptx');
    return 'Slide "' + judul + '" (' + outline.length + ' halaman) sudah dibuat dan diunduh sebagai ' + fileName + '.pptx.';
  } catch (e) {
    return 'Gagal membuat slide: ' + (e && e.message ? e.message : 'error tidak diketahui');
  }
}

export const composer = {
  websearchActive: false,
  autoGrow() {
    const inp = $('chat-input');
    inp.style.height = 'auto';
    inp.style.height = Math.min(inp.scrollHeight, 120) + 'px';
  },
  ensure() {
    const st = store.get();
    let s = st.sessions.find((x) => x.id === st.currentId);
    if (!s) {
      s = { id: Date.now().toString(36), title: 'Chat', messages: [], created: Date.now() };
      store.set({ sessions: [s].concat(st.sessions), currentId: s.id });
    }
    return s;
  },
  async send(text) {
    const s = this.ensure();
    if (!s.messages.length) s.title = text.slice(0, 28);
    const att = attach.consume();
    const q = quote.consume();
    s.messages.push({
      role: 'user',
      text: text,
      time: Date.now(),
      attach: att,
      quote: q ? { name: q.role === 'user' ? 'Anda' : 'Rategoan', text: String(q.text).slice(0, 140) } : null,
    });
    store.save();
    history.render();
    chat.renderMessages();
    haptics.tap(10);
    const isWebsearch = this.websearchActive;
    const routedText = isWebsearch ? 'googling ' + text : text;
    let directReply = await trySlideRequest(text, att);
    if (directReply == null && att && FILE_READ_RE.test(text)) {
      if (att.fileText) directReply = summarizeFileText(att.fileText, att.name);
      else if (att.fileTextError) directReply = att.fileTextError;
    }
    const reply = await chat.ask(routedText, { searching: isWebsearch, directReply });
    if (reply == null) {
      toast.show('AI belum terpasang');
      return;
    }
    store.save();
    history.render();
  },
  setWebsearch(active) {
    this.websearchActive = active;
    const card = $('sheet-websearch');
    const inp = $('chat-input');
    if (card) {
      card.classList.toggle('active', active);
      card.setAttribute('aria-checked', String(active));
    }
    if (inp) inp.placeholder = active ? 'Cari di internet…' : 'Tanya Rategoan';
  },
  setMemori(active) {
    memoryPreference.set(active);
    const card = $('sheet-memori');
    if (card) {
      card.classList.toggle('active', active);
      card.setAttribute('aria-checked', String(active));
    }
  },
  bind() {
    const inp = $('chat-input');
    inp.addEventListener('input', () => this.autoGrow());
    inp.addEventListener('focus', () => setTimeout(scrollBottom, 250));
    $('btn-send').onclick = () => {
      const t = inp.value.trim();
      if (!t && !attach.current && !quote.current) return;
      inp.value = '';
      this.autoGrow();
      this.send(t);
    };
    $('btn-plus').onclick = () => attach.open();
    const modelBtn = $('btn-model');
    if (modelBtn) modelBtn.onclick = () => sheets.openModel();
    const websearchCard = $('sheet-websearch');
    if (websearchCard) {
      // Sengaja TIDAK sheets.close() / toast di sini - toggle-nya sendiri
      // sudah jelas nunjukin status ON/OFF, jadi user bisa lihat langsung
      // switch-nya geser tanpa sheet mendadak tertutup atau notifikasi
      // besar yang malah menghalangi.
      websearchCard.onclick = () => {
        this.setWebsearch(!this.websearchActive);
      };
    }
    const memoriCard = $('sheet-memori');
    if (memoriCard) {
      // Sama kayak sheet-websearch di atas - toggle-nya sendiri sudah
      // cukup jelas nunjukin status ON/OFF, jadi klik tidak menutup sheet.
      // Beda dari toggle Pencarian Web, status Memori persisten (disimpan
      // localStorage lewat memoryPreference) bukan cuma per-sesi chat -
      // sinkronkan tampilan switch ke nilai tersimpan saat sheet dibuka.
      this.setMemori(memoryPreference.get());
      memoriCard.onclick = () => {
        this.setMemori(!memoryPreference.get());
      };
    }
    const slideCard = $('sheet-slide');
    if (slideCard) {
      // Bukan toggle kayak websearch/memori - ini tombol contoh isian.
      // Diisi CONTOH SIAP KIRIM (bukan placeholder <judul>/<isi> abstrak)
      // supaya fitur ini langsung kelihatan cara pakainya - tekan Kirim
      // apa adanya buat lihat demo nyata, atau timpa dulu (sudah ke-select
      // semua) dengan judul+materi sendiri sebelum kirim.
      slideCard.onclick = () => {
        sheets.close();
        inp.value =
          'buatkan slide tentang Tips Menabung: Sisihkan penghasilan di awal bulan, bukan di akhir. Pisahkan rekening tabungan dari rekening harian. Catat semua pengeluaran setiap hari. Evaluasi progres tiap akhir bulan.';
        this.autoGrow();
        inp.focus();
        inp.setSelectionRange(0, inp.value.length);
      };
    }
    $('btn-login').onclick = () => {
      drawer.close();
      if (auth.state) {
        router.go('settings');
      } else {
        googleAuth.ensure();
        router.go('login');
      }
    };
  },
};
