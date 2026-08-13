import { $ } from '../utils/dom.js';
import { haptics } from '../utils/haptics.js';
import { copy } from '../utils/clipboard.js';
import { toast } from '../core/toast.js';
import { store } from '../state/store.js';
import { quote } from '../ui/quote.js';
import { history } from './history.js';
import { chat } from '../chat/chat.js';
import { composer } from '../chat/composer.js';
import { voice } from '../chat/voice.js';

export const msgmenu = {
  el: null,
  timer: null,
  idx: null,
  build() {
    if (this.el) return this.el;
    const m = document.createElement('div');
    m.id = 'msg-menu';
    m.hidden = true;
    document.body.appendChild(m);
    this.el = m;
    return m;
  },
  show(x, y, idx) {
    const m = this.build();
    this.idx = idx;
    m.innerHTML = '';
    const s = chat.current();
    const msg = s && s.messages[idx];
    const mk = (label, cls, fn) => {
      const b = document.createElement('button');
      b.textContent = label;
      if (cls) b.className = cls;
      b.onclick = () => {
        this.hide();
        fn();
      };
      m.appendChild(b);
    };
    mk('Salin', null, () => this.act('copy'));
    mk('Balas', null, () => this.act('reply'));
    if (msg && msg.role === 'user') {
      mk('Ubah', null, () => this.act('edit'));
      mk('Kirim ulang', null, () => this.act('resend'));
    }
    mk('Baca', null, () => this.act('speak'));
    mk('Hapus', 'danger', () => this.act('delete'));
    m.hidden = false;
    const r = m.getBoundingClientRect();
    m.style.left = Math.min(Math.max(8, x - r.width / 2), window.innerWidth - r.width - 8) + 'px';
    m.style.top = Math.min(Math.max(8, y - r.height - 12), window.innerHeight - r.height - 8) + 'px';
  },
  hide() {
    if (this.el) this.el.hidden = true;
    this.idx = null;
  },
  act(kind) {
    const s = chat.current();
    if (!s || this.idx == null) return;
    const m = s.messages[this.idx];
    if (!m) return;
    if (kind === 'copy') {
      copy(m.text)
        .then(() => toast.show('Disalin'))
        .catch(() => toast.show('Gagal menyalin'));
    } else if (kind === 'reply') {
      quote.set(m);
      $('chat-input').focus();
    } else if (kind === 'edit') {
      const t = prompt('Ubah pesan:', m.text);
      if (t !== null && t.trim() && t !== m.text) {
        m.text = t.trim();
        store.save();
        chat.renderMessages();
        toast.show('Pesan diubah');
      }
    } else if (kind === 'resend') {
      composer.send(m.text);
    } else if (kind === 'speak') {
      voice.speak(m.text);
    } else if (kind === 'delete') {
      s.messages.splice(this.idx, 1);
      store.save();
      history.render();
      chat.renderMessages();
      haptics.tap(20);
      toast.show('Pesan dihapus');
    }
  },
  bind() {
    const box = $('messages');
    let start = null;
    box.addEventListener(
      'touchstart',
      (e) => {
        const msg = e.target.closest('.msg');
        if (!msg || msg.dataset.idx == null) return;
        start = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        const idx = Number(msg.dataset.idx);
        this.timer = setTimeout(() => {
          haptics.tap(15);
          this.show(start.x, start.y, idx);
        }, 480);
      },
      { passive: true }
    );
    box.addEventListener(
      'touchmove',
      (e) => {
        if (!this.timer || !start) return;
        const dx = e.touches[0].clientX - start.x;
        const dy = e.touches[0].clientY - start.y;
        if (dx * dx + dy * dy > 100) {
          clearTimeout(this.timer);
          this.timer = null;
        }
      },
      { passive: true }
    );
    const cancel = () => {
      if (this.timer) {
        clearTimeout(this.timer);
        this.timer = null;
      }
    };
    box.addEventListener('touchend', cancel, { passive: true });
    box.addEventListener('touchcancel', cancel, { passive: true });
    box.addEventListener('contextmenu', (e) => e.preventDefault());
    document.addEventListener(
      'touchstart',
      (e) => {
        if (this.el && !this.el.hidden && !this.el.contains(e.target)) this.hide();
      },
      { passive: true, capture: true }
    );
    window.addEventListener('scroll', () => this.hide(), { passive: true });
  },
};
