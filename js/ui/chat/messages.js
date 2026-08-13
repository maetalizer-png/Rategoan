/**
 * Chat Messages - Message rendering and AI interaction
 * @module ui/chat/messages
 */

import { RG } from '../../core/index.js';

/**
 * Chat message manager
 */
RG.chat = {
  /**
   * Get current chat session
   * @returns {Object|null}
   */
  current() {
    const st = RG.store.get();
    return st.sessions.find((s) => s.id === st.currentId) || null;
  },

  /**
   * Format date as day label
   * @param {number} t - Timestamp
   * @returns {string}
   */
  dayLabel(t) {
    const d = new Date(t).toDateString();
    const now = new Date();
    if (d === now.toDateString()) return 'Hari ini';
    if (d === new Date(now.getTime() - 86400000).toDateString()) return 'Kemarin';
    return new Date(t).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  },

  /**
   * Render all messages for current chat
   */
  renderMessages() {
    const box = RG.$('messages');
    const empty = RG.$('empty-state');
    box.innerHTML = '';
    const s = this.current();
    const has = !!(s && s.messages.length);
    if (empty) empty.hidden = has;
    box.style.display = has ? '' : 'none';
    if (!has) {
      if (RG.scrolldown.update) RG.scrolldown.update();
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
        b.innerHTML = RG.markdown.render(m.text);
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
      tm.textContent = RG.fmtTime(m.time);
      d.appendChild(tm);
      box.appendChild(d);
    });
    RG.scrollBottom();
    if (RG.scrolldown.update) RG.scrolldown.update();
  },

  /**
   * Type AI reply with animation
   * @param {string} text - Reply text
   * @param {boolean} follow - Whether to auto-scroll
   */
  async typeReply(text, follow) {
    const d = document.createElement('div');
    d.className = 'msg ai';
    const body = document.createElement('div');
    const tm = document.createElement('span');
    tm.className = 'time';
    tm.textContent = RG.fmtTime(Date.now());
    d.appendChild(body);
    d.appendChild(tm);
    RG.$('messages').appendChild(d);
    if (follow && !RG.reduceMotion()) {
      for (let i = 0; i < text.length; i += 3) {
        body.innerHTML = RG.markdown.render(text.slice(0, i + 3));
        RG.scrollBottom();
        await RG.sleep(12);
      }
    }
    body.innerHTML = RG.markdown.render(text);
    if (follow) {
      RG.scrollBottom();
    } else {
      RG.scrolldown.ping();
    }
  },

  /**
   * Send prompt to AI and get reply
   * @param {string} prompt - User prompt
   * @returns {Promise<string|null>}
   */
  async ask(prompt) {
    const s = this.current();
    const typing = document.createElement('div');
    typing.className = 'msg ai typing';
    typing.textContent = '…';
    RG.$('messages').appendChild(typing);
    RG.scrollBottom();
    const reply = RG.ai ? await RG.ai.generate(s.messages, prompt) : null;
    typing.remove();
    if (reply == null) return null;
    s.messages.push({ role: 'ai', text: reply, time: Date.now() });
    await this.typeReply(reply, !RG.scrolldown.isFar());
    RG.voice.speak(reply);
    return reply;
  },
};

export { RG };
