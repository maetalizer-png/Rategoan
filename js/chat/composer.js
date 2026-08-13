import { $ } from '../core/utils.js';
import { store } from '../core/store.js';
import { chat } from './chat.js';
import { history } from '../history/history.js';
import { attach } from '../sheets/attach.js';
import { drawer } from '../ui/drawer.js';

export const composer = Object.freeze({
  el: null,
  quote: null,
  attachments: [],
  init() {
    this.el = $('chat-input');
    if (!this.el) return;
    this.el.addEventListener('input', () => this.autoGrow());
    this.el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.send();
      }
    });
    const btnSend = $('btn-send');
    if (btnSend) btnSend.onclick = () => this.send();
    const btnPlus = $('btn-plus');
    if (btnPlus) btnPlus.onclick = () => {
      if (window.RG.attach) window.RG.attach.open();
      if (drawer.close) drawer.close();
    };
    const btnModel = $('btn-model');
    if (btnModel) btnModel.onclick = () => {
      if (window.RG.models) window.RG.models.open();
      if (drawer.close) drawer.close();
    };
    this.autoGrow();
  },
  autoGrow() {
    if (!this.el) return;
    this.el.style.height = 'auto';
    this.el.style.height = Math.min(this.el.scrollHeight, 120) + 'px';
  },
  setQuote(q) {
    this.quote = q;
    const row = $('quote-row');
    if (row) {
      row.hidden = !q;
      if (q) row.innerHTML = '<span class="ico ico-chat-plus"></span> ' + q.text.substring(0, 50) + '... <button id="quote-clear">✕</button>';
      const clear = $('quote-clear');
      if (clear) clear.onclick = () => this.setQuote(null);
    }
  },
  addAttachment(a) {
    this.attachments.push(a);
    this.renderAttachments();
  },
  clearAttachments() {
    this.attachments = [];
    this.renderAttachments();
  },
  renderAttachments() {
    const row = $('attach-row');
    if (!row) return;
    row.hidden = !this.attachments.length;
    row.innerHTML = '';
    this.attachments.forEach((a, i) => {
      const chip = document.createElement('span');
      chip.className = 'attach-chip';
      chip.innerHTML = (a.type.startsWith('image/') ? '<span class="ico ico-image"></span>' : '<span class="ico ico-file"></span>') + a.name + ' <button data-idx="' + i + '">✕</button>';
      chip.querySelector('button').onclick = () => {
        this.attachments.splice(i, 1);
        this.renderAttachments();
      };
      row.appendChild(chip);
    });
  },
  send() {
    const text = (this.el.value || '').trim();
    if (!text && !this.attachments.length) return;
    const msg = {
      role: 'user',
      content: text,
      time: Date.now(),
      attachments: this.attachments.length ? [...this.attachments] : undefined,
      quote: this.quote,
    };
    chat.add(msg);
    this.el.value = '';
    this.autoGrow();
    this.setQuote(null);
    this.clearAttachments();
    // Simulate response
    setTimeout(() => {
      chat.add({
        role: 'assistant',
        content: 'Ini adalah respons simulasi dari Rategoan.',
        time: Date.now(),
        model: chat.getModel() || 'Raget 1.0',
      });
    }, 500);
  },
});

window.RG = window.RG || {};
window.RG.composer = composer;
