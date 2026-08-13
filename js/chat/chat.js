import { $, sleep, scrollBottom } from '../utils/dom.js';
import { fmtTime } from '../utils/format.js';
import { reduceMotion } from '../utils/haptics.js';
import { markdown } from '../utils/markdown.js';
import { store } from '../state/store.js';
import { scrolldown } from '../ui/scrolldown.js';
import { voice } from './voice.js';
import { ai } from '../ai/ai.js';

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
    voice.speak(reply);
    return reply;
  },
};
