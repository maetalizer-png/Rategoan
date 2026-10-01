import { $ } from '../../shared/dom.js';
import { haptics } from '../../shared/haptics.js';
import { download } from '../../shared/clipboard.js';
import { fmtTime } from '../../shared/format.js';
import { toast } from '../core/toast.js';
import { store } from '../state/store.js';
import { history } from './history.js';

export const histmenu = {
  el: null,
  timer: null,
  id: null,
  suppress: false,
  build() {
    if (this.el) return this.el;
    const m = document.createElement('div');
    m.id = 'msg-menu';
    m.hidden = true;
    document.body.appendChild(m);
    this.el = m;
    return m;
  },
  show(x, y, id) {
    const m = this.build();
    this.id = id;
    m.innerHTML = '';
    const st = store.get();
    const s = st.sessions.find((v) => v.id === id);
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
    mk('Ubah nama', null, () => this.act('rename'));
    mk(s && s.pinned ? 'Lepas sematan' : 'Sematkan', null, () => this.act('pin'));
    mk('Info', null, () => this.act('info'));
    mk('Ekspor .txt', null, () => this.act('export'));
    mk('Hapus', 'danger', () => this.act('delete'));
    m.hidden = false;
    const r = m.getBoundingClientRect();
    m.style.left = Math.min(Math.max(8, x - r.width / 2), window.innerWidth - r.width - 8) + 'px';
    m.style.top = Math.min(Math.max(8, y - r.height - 12), window.innerHeight - r.height - 8) + 'px';
  },
  hide() {
    if (this.el) this.el.hidden = true;
    this.id = null;
  },
  act(kind) {
    const st = store.get();
    const s = st.sessions.find((x) => x.id === this.id);
    if (!s) return;
    if (kind === 'rename') {
      const t = prompt('Nama chat:', s.title);
      if (t && t.trim()) {
        s.title = t.trim().slice(0, 40);
        store.save();
        history.render();
        toast.show('Nama diubah');
      }
    } else if (kind === 'pin') {
      history.togglePin(s.id);
    } else if (kind === 'info') {
      const count = (s.messages || []).length;
      const kb = Math.max(1, Math.round(JSON.stringify(s).length / 1024));
      const created = s.created || (s.messages && s.messages[0] && s.messages[0].time) || Date.now();
      const d = new Date(created).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
      toast.show(count + ' pesan • ' + kb + ' KB • dibuat ' + d, 4000);
    } else if (kind === 'export') {
      const lines = (s.messages || []).map(
        (m) => '[' + fmtTime(m.time) + '] ' + (m.role === 'user' ? 'Anda' : 'Rategoan') + ': ' + m.text
      );
      download((s.title || 'chat') + '.txt', lines.join('\n'));
      toast.show('Chat diekspor');
    } else if (kind === 'delete') {
      history.remove(s.id);
    }
  },
  bind() {
    const list = $('history-list');
    let start = null;
    list.addEventListener(
      'touchstart',
      (e) => {
        const item = e.target.closest('.hist-item');
        if (!item || !item.dataset.id) return;
        start = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        const id = item.dataset.id;
        this.timer = setTimeout(() => {
          haptics.tap(15);
          this.suppress = true;
          this.show(start.x, start.y, id);
        }, 480);
      },
      { passive: true }
    );
    list.addEventListener(
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
    list.addEventListener('touchend', cancel, { passive: true });
    list.addEventListener('touchcancel', cancel, { passive: true });
    document.addEventListener(
      'touchstart',
      (e) => {
        if (this.el && !this.el.hidden && !this.el.contains(e.target)) this.hide();
      },
      { passive: true, capture: true }
    );
  },
};
