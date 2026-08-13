import { $ } from '../core/utils.js';
import { store } from '../core/store.js';
import { auth } from '../core/auth.js';
import { fmtTime } from '../core/utils.js';

export const chat = Object.freeze({
  state: { messages: [], loading: false, model: null },
  init() {
    this.state.messages = [];
    this.render();
  },
  add(msg) {
    this.state.messages.push(msg);
    store.save();
    this.render();
  },
  clear() {
    this.state.messages = [];
    store.save();
    this.render();
  },
  render() {
    const m = $('messages');
    const empty = $('empty-state');
    if (!m) return;
    m.innerHTML = '';
    let lastDate = null;
    this.state.messages.forEach((msg, i) => {
      const d = new Date(msg.time).toLocaleDateString('id-ID');
      if (d !== lastDate) {
        const sep = document.createElement('div');
        sep.className = 'date-sep';
        sep.textContent = d;
        m.appendChild(sep);
        lastDate = d;
      }
      const el = document.createElement('div');
      el.className = 'msg msg-' + msg.role;
      el.dataset.idx = i;
      if (msg.role === 'user') {
        el.innerHTML = '<div class="msg-bubble">' + msg.content + '</div>';
      } else {
        el.innerHTML = '<div class="msg-bubble">' + msg.content + '</div>';
        if (msg.model) {
          const badge = document.createElement('span');
          badge.className = 'msg-model';
          badge.textContent = msg.model;
          el.appendChild(badge);
        }
      }
      if (msg.attachments && msg.attachments.length) {
        const att = document.createElement('div');
        att.className = 'msg-attachments';
        msg.attachments.forEach(a => {
          const thumb = document.createElement('div');
          thumb.className = 'attach-thumb';
          if (a.type.startsWith('image/')) {
            thumb.innerHTML = '<img src="' + a.url + '" alt="">';
          } else {
            thumb.innerHTML = '<span class="ico ico-file"></span>' + a.name;
          }
          att.appendChild(thumb);
        });
        el.appendChild(att);
      }
      m.appendChild(el);
    });
    if (empty) empty.hidden = this.state.messages.length > 0;
    if (window.RG.scrolldown) window.RG.scrolldown.update();
  },
  getMessages() { return this.state.messages; },
  setModel(m) { this.state.model = m; },
  getModel() { return this.state.model; },
});

window.RG = window.RG || {};
window.RG.chat = chat;
