/**
 * Drawer Service - Sidebar navigation with touch gestures
 * @module ui/components/drawer
 */

import { RG } from '../../core/index.js';

/**
 * Sidebar drawer manager with swipe gestures
 */
RG.drawer = {
  s: null,

  /**
   * Open sidebar drawer
   */
  open() {
    if (!RG.auth.state) return;
    RG.$('sidebar').classList.add('open');
    RG.$('backdrop').classList.add('show');
  },

  /**
   * Close sidebar drawer
   */
  close() {
    RG.$('sidebar').classList.remove('open');
    RG.$('backdrop').classList.remove('show');
  },

  /**
   * Handle touch start for swipe gestures
   * @param {TouchEvent} e
   */
  onStart(e) {
    const x = e.touches[0].clientX;
    const y = e.touches[0].clientY;
    const isOpen = RG.$('sidebar').classList.contains('open');
    let mode = null;
    if (!isOpen && x <= 24 && RG.auth.state) mode = 'open';
    else if (isOpen) mode = 'close';
    this.s = { x, y, mode, dragging: false, pos: 0 };
  },

  /**
   * Handle touch move for swipe gestures
   * @param {TouchEvent} e
   */
  onMove(e) {
    const t = this.s;
    if (!t || !t.mode) return;
    const dx = e.touches[0].clientX - t.x;
    const dy = e.touches[0].clientY - t.y;
    if (!t.dragging) {
      if (Math.abs(dx) > 12 && Math.abs(dx) > Math.abs(dy)) {
        if ((t.mode === 'open' && dx > 0) || (t.mode === 'close' && dx < 0)) {
          t.dragging = true;
          RG.$('sidebar').style.transition = 'none';
          RG.$('backdrop').style.transition = 'none';
        } else { this.s = null; return; }
      } else return;
    }
    if (e.cancelable) e.preventDefault();
    const w = RG.$('sidebar').offsetWidth;
    let pos = t.mode === 'open' ? dx : w + dx;
    pos = Math.max(0, Math.min(w, pos));
    t.pos = pos;
    RG.$('sidebar').style.transform = 'translateX(' + (pos - w) + 'px)';
    RG.$('backdrop').style.opacity = String(pos / w);
    RG.$('backdrop').style.pointerEvents = 'auto';
  },

  /**
   * Handle touch end for swipe gestures
   */
  onEnd() {
    const t = this.s;
    this.s = null;
    if (!t || !t.dragging) return;
    const sb = RG.$('sidebar');
    const bd = RG.$('backdrop');
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

  /**
   * Bind drawer event listeners
   */
  bind() {
    RG.$('btn-menu').onclick = () => this.open();
    RG.$('backdrop').onclick = () => this.close();
    document.addEventListener('touchstart', (e) => this.onStart(e), { passive: true });
    document.addEventListener('touchmove', (e) => this.onMove(e), { passive: false });
    document.addEventListener('touchend', () => this.onEnd(), { passive: true });
    document.addEventListener('touchcancel', () => this.onEnd(), { passive: true });
  },
};

export { RG };
