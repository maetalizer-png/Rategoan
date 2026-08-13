/**
 * Composer - Message input and sending
 * @module ui/chat/composer
 */

import { RG } from '../../core/index.js';

/**
 * Chat composer manager
 */
RG.composer = {
  /**
   * Auto-grow textarea based on content
   */
  autoGrow() {
    const inp = RG.$('chat-input');
    inp.style.height = 'auto';
    inp.style.height = Math.min(inp.scrollHeight, 120) + 'px';
  },

  /**
   * Ensure current session exists
   * @returns {Object} Session object
   */
  ensure() {
    const st = RG.store.get();
    let s = st.sessions.find((x) => x.id === st.currentId);
    if (!s) {
      s = { id: Date.now().toString(36), title: 'Chat', messages: [], created: Date.now() };
      RG.store.set({ sessions: [s].concat(st.sessions), currentId: s.id });
    }
    return s;
  },

  /**
   * Send message
   * @param {string} text - Message text
   */
  async send(text) {
    const s = this.ensure();
    if (!s.messages.length) s.title = text.slice(0, 28);
    const att = RG.attach.consume();
    const q = RG.quote.consume();
    s.messages.push({
      role: 'user',
      text: text,
      time: Date.now(),
      attach: att,
      quote: q ? { name: q.role === 'user' ? 'Anda' : 'Rategoan', text: String(q.text).slice(0, 140) } : null,
    });
    RG.store.save();
    RG.history.render();
    RG.chat.renderMessages();
    RG.haptics.tap(10);
    const reply = await RG.chat.ask(text);
    if (reply == null) {
      RG.toast.show('AI belum terpasang');
      return;
    }
    RG.store.save();
    RG.history.render();
  },

  /**
   * Bind composer event listeners
   */
  bind() {
    const inp = RG.$('chat-input');
    inp.addEventListener('input', () => this.autoGrow());
    inp.addEventListener('focus', () => setTimeout(RG.scrollBottom, 250));
    RG.$('btn-send').onclick = () => {
      const t = inp.value.trim();
      if (!t && !RG.attach.current && !RG.quote.current) return;
      inp.value = '';
      this.autoGrow();
      this.send(t);
    };
    RG.$('btn-plus').onclick = () => RG.attach.open();
    RG.$('btn-login').onclick = () => {
      RG.drawer.close();
      if (RG.auth.state) {
        RG.router.go('settings');
      } else {
        RG.router.go('login');
      }
    };
    document.querySelectorAll('.empty-chip').forEach((c) => {
      c.onclick = () => {
        inp.value = c.textContent;
        this.autoGrow();
        inp.focus();
      };
    });
  },
};

export { RG };
