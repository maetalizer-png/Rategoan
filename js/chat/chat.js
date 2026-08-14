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

const URL_RE = /https?:\/\/\S+/i;

const CHIPS_BY_PERIOD = {
  pagi: ['Ringkas hari saya', 'Apa ibukota Indonesia', 'Ide konten produktif'],
  siang: ['Kuis', 'Ringkas hari saya', 'Jelaskan sesuatu'],
  sore: ['Ide konten', 'Manfaat olahraga', 'Cara membuat kopi'],
  malam: ['Ceritakan tentang Jepang', 'Kuis', 'Ringkas percakapan'],
};

function periodOfDay() {
  const h = new Date().getHours();
  if (h >= 4 && h < 10) return 'pagi';
  if (h >= 10 && h < 15) return 'siang';
  if (h >= 15 && h < 18) return 'sore';
  return 'malam';
}

function applySmartChips() {
  const chips = document.querySelectorAll('.empty-chip');
  const labels = CHIPS_BY_PERIOD[periodOfDay()];
  chips.forEach((c, i) => {
    if (labels[i]) {
      c.textContent = labels[i];
      c.setAttribute('aria-label', 'Kirim contoh: ' + labels[i]);
    }
  });
}

function buildExtraChip(label, onClick) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'msg-action-btn';
  btn.textContent = label;
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
    return ['Kuis', 'Wisata ' + negara];
  }
  if (/^#{1,3}\s|\n- |\n\d+\.\s/.test(text)) {
    return ['Ringkas hari saya'];
  }
  return [];
}

function buildActions(text) {
  const row = document.createElement('div');
  row.className = 'msg-actions';

  const copyBtn = document.createElement('button');
  copyBtn.type = 'button';
  copyBtn.className = 'msg-action-btn';
  copyBtn.textContent = '⧉ Salin';
  copyBtn.onclick = () => {
    copy(text)
      .then(() => toast.show('Disalin'))
      .catch(() => toast.show('Gagal menyalin'));
  };

  const speakBtn = document.createElement('button');
  speakBtn.type = 'button';
  speakBtn.className = 'msg-action-btn';
  speakBtn.textContent = '🔊 Baca';
  speakBtn.onclick = () => voice.speak(text);

  const shareBtn = document.createElement('button');
  shareBtn.type = 'button';
  shareBtn.className = 'msg-action-btn';
  shareBtn.textContent = '↗ Bagikan';
  shareBtn.onclick = () => {
    if (navigator.share) {
      navigator.share({ text }).catch(() => {});
    } else {
      copy(text)
        .then(() => toast.show('Disalin'))
        .catch(() => toast.show('Gagal menyalin'));
    }
  };

  row.appendChild(copyBtn);
  row.appendChild(speakBtn);
  row.appendChild(shareBtn);
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
      applySmartChips();
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
        a.textContent = '📎 ' + m.attach.name;
        d.appendChild(a);
      }
      const tm = document.createElement('span');
      tm.className = 'time';
      tm.textContent = fmtTime(m.time);
      d.appendChild(tm);
      if (m.role === 'user' && m.attach && m.attach.full) {
        const row = document.createElement('div');
        row.className = 'msg-actions';
        row.appendChild(buildExtraChip('🔍 Baca Gambar Ini', () => fillComposer('baca foto ini')));
        d.appendChild(row);
      }
      if (m.role !== 'user') {
        const actions = buildActions(m.text);
        if (URL_RE.test(m.text)) {
          actions.appendChild(buildExtraChip('🌐 Bedah', () => fillComposer('bedah ' + m.text.match(URL_RE)[0])));
        }
        detectQuickChips(m.text).slice(0, 2).forEach((label) => {
          actions.appendChild(buildExtraChip(label, () => fillAndSend(label)));
        });
        d.appendChild(actions);
      }
      box.appendChild(d);
    });
    scrollBottom();
    scrolldown.update();
  },
  async typeReply(text, follow) {
    const d = document.createElement('div');
    d.className = 'msg ai';
    const body = document.createElement('div');
    const tm = document.createElement('span');
    tm.className = 'time';
    tm.textContent = fmtTime(Date.now());
    d.appendChild(body);
    d.appendChild(tm);
    $('messages').appendChild(d);
    if (follow && !reduceMotion()) {
      for (let i = 0; i < text.length; i += 3) {
        body.innerHTML = markdown.render(text.slice(0, i + 3));
        scrollBottom();
        await sleep(12);
      }
    }
    body.innerHTML = markdown.render(text);
    const actions = buildActions(text);
    if (URL_RE.test(text)) {
      actions.appendChild(buildExtraChip('🌐 Bedah', () => fillComposer('bedah ' + text.match(URL_RE)[0])));
    }
    detectQuickChips(text).slice(0, 2).forEach((label) => {
      actions.appendChild(buildExtraChip(label, () => fillAndSend(label)));
    });
    d.appendChild(actions);
    if (follow) {
      scrollBottom();
    } else {
      scrolldown.ping();
    }
  },
  async ask(prompt) {
    const s = this.current();
    const typing = document.createElement('div');
    typing.className = 'msg ai typing';
    typing.textContent = '…';
    $('messages').appendChild(typing);
    scrollBottom();
    const reply = ai ? await ai.generate(s.messages, prompt) : null;
    typing.remove();
    if (reply == null) return null;
    s.messages.push({ role: 'ai', text: reply, time: Date.now() });
    await this.typeReply(reply, !scrolldown.isFar());
    if (tts.enabled()) voice.speak(reply);
    return reply;
  },
};
