import { $, scrollBottom } from '../utils/dom.js';

export const scrolldown = {
  unseen: 0,
  isFar() {
    const box = $('messages');
    return box.scrollHeight - box.scrollTop - box.clientHeight > 160;
  },
  update() {
    const btn = $('btn-scroll-down');
    const far = this.isFar();
    if (!far) {
      this.unseen = 0;
      this.badge();
    }
    btn.hidden = !far;
  },
  ping() {
    if (this.isFar()) {
      this.unseen++;
      this.badge();
    }
  },
  badge() {
    const b = $('scroll-badge');
    if (!b) return;
    b.hidden = !this.unseen;
    b.textContent = this.unseen > 9 ? '9+' : String(this.unseen);
  },
  bind() {
    const box = $('messages');
    const btn = $('btn-scroll-down');
    box.addEventListener('scroll', () => this.update(), { passive: true });
    btn.onclick = () => {
      scrollBottom();
      this.unseen = 0;
      this.badge();
      btn.hidden = true;
    };
  },
};
