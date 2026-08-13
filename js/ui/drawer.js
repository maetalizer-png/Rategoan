import { $ } from '../core/utils.js';
import { auth } from '../core/auth.js';

export const drawer = Object.freeze({
  s: null,
  open() {
    if (!auth.state) return;
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
    if (!isOpen && x <= 24 && auth.state) mode = 'open';
    else if (isOpen) mode = 'close';
    this.s = { x, y, mode, dragging: false, pos: 0 };
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
        } else { this.s = null; return; }
      } else return;
    }
    if (e.cancelable) e.preventDefault();
    const w = $('sidebar').offsetWidth;
    let pos = t.mode === 'open' ? dx : w + dx;
    pos = Math.max(0, Math.min(w, pos));
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
    if (t.pos > w / 2) this.open();
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
});

window.RG = window.RG || {};
window.RG.drawer = drawer;
