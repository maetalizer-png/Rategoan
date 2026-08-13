import { $ } from '../core/utils.js';

export const quote = Object.freeze({
  el: null,
  init() {
    this.el = $('quote-row');
  },
  show(text) {
    if (!this.el) return;
    this.el.hidden = false;
    this.el.innerHTML = '<span class="ico ico-chat-plus"></span> ' + text.substring(0, 50) + '... <button id="quote-clear">✕</button>';
    const clear = $('quote-clear');
    if (clear) clear.onclick = () => this.hide();
  },
  hide() {
    if (!this.el) return;
    this.el.hidden = true;
    this.el.innerHTML = '';
  },
});

window.RG = window.RG || {};
window.RG.quote = quote;
