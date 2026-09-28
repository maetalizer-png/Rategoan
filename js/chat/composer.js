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
import { summarizeFileText, answerFromFile } from '../utils/file-summary.js';
import { memoryLong } from '../../raget/raget-memory/memory-long.js';
import { collectionStore } from '../../raget/raget-memory/collection-store.js';
import { buildOutline, exportSlides, previewOutline, rememberSlide } from '../utils/slides-export.js';
import { turnPipeline } from '../../raget/raget-agents/turn-pipeline.js';
import { toolsKoleksi } from '../../raget/raget-agents/tools-koleksi.js';
import { flowHub } from '../../raget/raget-agents/flow-hub.js';

const FILE_READ_RE = /\b(baca|ringkas|rangkum|ekstrak|extract|impor|import)\b/i;
const FILE_ASK_RE = /\b(baca|ringkas|rangkum|jelaskan|uraikan|apa\s+(isi|kata|yang)|tentang\s+(file|dokumen|lampiran|pdf)|dokumen|lampiran)\b/i;
const WORK_RE = /\b(tugas|skripsi|makalah|rencana|langkah|proyek|pekerjaan|kerjakan)\b/i;

function titleFrom(text) {
  const t = String(text || '').replace(/\s+/g, ' ').trim();
  if (!t) return 'Chat';
  if (t.length <= 36) return t;
  return t.slice(0, 36).replace(/\s+\S*$/, '') || t.slice(0, 36);
}

function lastAttachedFile(session) {
  const msgs = (session && session.messages) || [];
  for (let i = msgs.length - 1; i >= 0; i -= 1) {
    const att = msgs[i].attach;
    if (att && att.fileText) return att;
  }
  return null;
}

const SLIDE_ACTION_RE = /\b(buat(kan)?|bikin|jadikan|susun|export|unduh)\b/i;
const SLIDE_NOUN_RE = /\b(slide|ppt|pptx)\b/i;

async function pickSlideMaterial(session, att) {
  if (att && att.fileText) {
    return { text: att.fileText, title: (att.name || 'Presentasi').replace(/\.[a-z0-9]+$/i, '') };
  }
  const msgs = (session && session.messages) || [];
  for (let i = msgs.length - 1; i >= 0; i -= 1) {
    const m = msgs[i];
    if (!m || m.role === 'user' || !m.text) continue;
    if (/Pratinjau slide|Unduh file slide|sudah diunduh/.test(m.text)) continue;
    if (m.source === 'websearch' || m.text.length >= 160) {
      return { text: m.text, title: session.title && session.title !== 'Chat' ? session.title : 'Presentasi' };
    }
  }
  const items = await collectionStore.allItems();
  for (let i = items.length - 1; i >= 0; i -= 1) {
    const it = items[i];
    if (it && it.text && it.text.length >= 80) {
      return { text: it.text, title: it.chatTitle || 'Koleksi' };
    }
  }
  return null;
}

function lastAiText(session) {
  const msgs = (session && session.messages) || [];
  for (let i = msgs.length - 1; i >= 0; i -= 1) {
    if (msgs[i].role !== 'user' && msgs[i].text) return msgs[i].text;
  }
  return '';
}

async function trySlideRequest(text, att, session) {
  if (!(SLIDE_ACTION_RE.test(text) && SLIDE_NOUN_RE.test(text))) return null;
  const fromLast = /\b(dari\s+ini|dari\s+jawaban|dari\s+hasil|jawaban\s+ini)\b/i.test(text);
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
      if (topicMatch && !fromLast) judul = topicMatch[1].trim();
    }
  }
  if (!material || fromLast) {
    const prev = lastAiText(session);
    if (prev) {
      material = prev;
      if (session && session.title && session.title !== 'Chat') judul = session.title;
    }
  }
  if (!material) {
    const picked = await pickSlideMaterial(session, att);
    if (picked) {
      material = picked.text;
      judul = picked.title || judul;
    }
  }
  if (!material) {
    return 'Boleh, tapi saya butuh bahannya dulu — lampirkan file, ketik "buatkan slide tentang judul: isi", tanya dulu, atau simpan ke Koleksi lalu tap Slide.';
  }
  try {
    const outline = buildOutline(material, judul);
    const fileName = judul.replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '').toLowerCase() || 'slide';
    rememberSlide(outline, fileName + '.pptx');
    return previewOutline(outline) + '\n\nKetuk Unduh file slide kalau mau simpan PPTX.';
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
    if (!s.messages.length) s.title = titleFrom(text);
    if (WORK_RE.test(text) && !s.project) {
      s.project = { goal: titleFrom(text), started: Date.now() };
    }
    try { memoryLong.learnFromText(text); } catch (e) {}
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
    const plan = turnPipeline.inspect(text, {
      messages: s.messages,
      attach: att,
      websearch: this.websearchActive,
    });
    const isWebsearch = plan.route === 'web';
    const routedText = isWebsearch ? 'googling ' + text : text;
    if (plan.route === 'slide' && /^(lanjut|lanjutkan|dari ini)$/i.test(text.trim())) {
      text = 'buatkan slide dari ini';
    }
    let directReply = await trySlideRequest(text, att, s);
    if (directReply == null && plan.route === 'collection') {
      directReply = await toolsKoleksi.run('cari_koleksi', text);
    }
    const fileSrc = (att && (att.fileText || att.fileTextError)) ? att : lastAttachedFile(s);
    if (directReply == null && fileSrc && (FILE_ASK_RE.test(text) || FILE_READ_RE.test(text))) {
      if (fileSrc.fileText) {
        if (FILE_READ_RE.test(text) && !/\b(apa|jelaskan|tentang)\b/i.test(text)) {
          directReply = summarizeFileText(fileSrc.fileText, fileSrc.name);
        } else {
          directReply = answerFromFile(fileSrc.fileText, text, fileSrc.name);
        }
      } else if (fileSrc.fileTextError) directReply = fileSrc.fileTextError;
    }
    const reply = await chat.ask(routedText, { searching: isWebsearch, directReply });
    if (reply == null) {
      toast.show('AI belum terpasang');
      return;
    }
    if (isWebsearch && reply) {
      try {
        if (!(await collectionStore.existsByText(reply))) {
          await collectionStore.addItem({
            text: reply,
            role: 'ai',
            tag: 'web',
            kind: 'web',
            note: flowHub.threePoints(reply),
            chatTitle: s.title || '',
          });
        }
      } catch (e) {}
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
      websearchCard.onclick = () => {
        this.setWebsearch(!this.websearchActive);
      };
    }
    const slideCard = $('sheet-slide');
    if (slideCard) {
      slideCard.onclick = async () => {
        sheets.close();
        const s = this.ensure();
        const att = attach.consume();
        const picked = await pickSlideMaterial(s, att);
        if (!picked) {
          toast.show('Tanya topiknya dulu, atau simpan ke Koleksi, baru tap Slide');
          return;
        }
        try {
          const outline = buildOutline(picked.text, picked.title);
          const stamp = Date.now().toString(36);
          const fileName = (picked.title.replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '').toLowerCase() || 'slide') + '-' + stamp + '.pptx';
          rememberSlide(outline, fileName);
          const reply = previewOutline(outline) + '\n\nKetuk Unduh file slide kalau mau simpan PPTX.';
          s.messages.push({ role: 'ai', text: reply, time: Date.now() });
          store.save();
          history.render();
          chat.renderMessages();
        } catch (e) {
          toast.show('Gagal merangkai slide');
        }
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
