import { $ } from '../core/utils.js';
import { chat } from './chat.js';
import { quote } from './quote.js';

export const msgmenu = Object.freeze({
  init() {
    const m = $('messages');
    if (!m) return;
    m.addEventListener('contextmenu', (e) => this.onContext(e));
    m.addEventListener('click', (e) => this.onClick(e));
  },
  onContext(e) {
    const msgEl = e.target.closest('.msg');
    if (!msgEl) return;
    e.preventDefault();
    const idx = parseInt(msgEl.dataset.idx, 10);
    const msgs = chat.getMessages();
    const msg = msgs[idx];
    if (!msg) return;
    // Simple menu via prompt for now
    const action = prompt('Pilih: 1=Salin, 2=Balas, 3=Hapus');
    if (action === '1') {
      navigator.clipboard.writeText(msg.content);
      if (window.RG.toast) window.RG.toast.show('Disalin');
    } else if (action === '2') {
      if (quote.show) quote.show(msg.content);
      else if (window.RG.composer) window.RG.composer.setQuote({ text: msg.content });
    } else if (action === '3') {
      msgs.splice(idx, 1);
      chat.render();
    }
  },
  onClick(e) {
    // Handle long-press simulation
  },
});

window.RG = window.RG || {};
window.RG.msgmenu = msgmenu;
