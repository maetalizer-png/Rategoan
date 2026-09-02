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

export const composer = {
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
    const reply = await chat.ask(text);
    if (reply == null) {
      toast.show('AI belum terpasang');
      return;
    }
    store.save();
    history.render();
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
    $('btn-model').onclick = () => sheets.openModel();
    $('btn-login').onclick = () => {
      drawer.close();
      if (auth.state) {
        router.go('settings');
      } else {
        router.go('login');
      }
    };
  },
};
