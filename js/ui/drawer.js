import { $ } from '../../shared/dom.js';
import { auth } from '../state/auth.js';

export const drawer = {
  s: null,
  open() {
    $('sidebar').classList.add('open');
    $('backdrop').classList.add('show');
  },
  close() {
    $('sidebar').classList.remove('open');
    $('backdrop').classList.remove('show');
  },
  onStart(e) {
    const x = e.touches[0].clientX;
    const y = e.touches[0].clientY;
    const isOpen = $('sidebar').classList.contains('open');
    let mode = null;
    if (!isOpen && x <= 24) mode = 'open';
    else if (isOpen) mode = 'close';
    this.s = { x, y, mode, dragging: false, pos: 0, lastX: x, lastT: Date.now(), vx: 0 };
  },
  onMove(e) {
    const t = this.s;
    if (!t || !t.mode) return;
    const dx = e.touches[0].clientX - t.x;
    const dy = e.touches[0].clientY - t.y;
    if (!t.dragging) {
      if (Math.abs(dx) > 12 && Math.abs(dx) > Math.abs(dy)) {
        if ((t.mode === 'open' && dx > 0) || (t.mode === 'close' && dx < 0)) {
          t.dragging = true;
          $('sidebar').style.transition = 'none';
          $('backdrop').style.transition = 'none';
        } else {
          this.s = null;
          return;
        }
      } else return;
    }
    if (e.cancelable) e.preventDefault();
    const w = $('sidebar').offsetWidth;
    let pos = t.mode === 'open' ? dx : w + dx;
    pos = Math.max(0, Math.min(w, pos));
    const now = Date.now();
    const dt = Math.max(1, now - t.lastT);
    t.vx = (e.touches[0].clientX - t.lastX) / dt;
    t.lastX = e.touches[0].clientX;
    t.lastT = now;
    t.pos = pos;
    $('sidebar').style.transform = 'translateX(' + (pos - w) + 'px)';
    $('backdrop').style.opacity = String(pos / w);
    $('backdrop').style.pointerEvents = 'auto';
  },
  onEnd() {
    const t = this.s;
    this.s = null;
    if (!t || !t.dragging) return;
    const sb = $('sidebar');
    const bd = $('backdrop');
    const w = sb.offsetWidth;
    sb.style.transition = '';
    bd.style.transition = '';
    void sb.offsetWidth;
    sb.style.transform = '';
    bd.style.opacity = '';
    bd.style.pointerEvents = '';
    const flickOpen = t.vx > 0.45;
    const flickClose = t.vx < -0.45;
    if (t.mode === 'open' ? (t.pos > w * 0.38 || flickOpen) : (t.pos > w * 0.62 && !flickClose)) this.open();
    else this.close();
  },
  bind() {
    $('btn-menu').onclick = () => this.open();
    $('backdrop').onclick = () => this.close();
    document.addEventListener('touchstart', (e) => this.onStart(e), { passive: true });
    document.addEventListener('touchmove', (e) => this.onMove(e), { passive: false });
    document.addEventListener('touchend', () => this.onEnd(), { passive: true });
    document.addEventListener('touchcancel', () => this.onEnd(), { passive: true });
  },
};
