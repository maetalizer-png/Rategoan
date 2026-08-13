/**
 * Scroll Down Button - Track unread messages and scroll position
 * @module ui/chat/scrolldown
 */

import { RG } from '../../core/index.js';

/**
 * Scroll position tracker with unread badge
 */
RG.scrolldown = {
  unseen: 0,

  /**
   * Check if scrolled far from bottom
   * @returns {boolean}
   */
  isFar() {
    const box = RG.$('messages');
    return box.scrollHeight - box.scrollTop - box.clientHeight > 160;
  },

  /**
   * Update scroll button visibility
   */
  update() {
    const btn = RG.$('btn-scroll-down');
    const far = this.isFar();
    if (!far) {
      this.unseen = 0;
      this.badge();
    }
    btn.hidden = !far;
  },

  /**
   * Increment unseen message count
   */
  ping() {
    if (this.isFar()) {
      this.unseen++;
      this.badge();
    }
  },

  /**
   * Update badge display
   */
  badge() {
    const b = RG.$('scroll-badge');
    if (!b) return;
    b.hidden = !this.unseen;
    b.textContent = this.unseen > 9 ? '9+' : String(this.unseen);
  },

  /**
   * Bind scroll event listeners
   */
  bind() {
    const box = RG.$('messages');
    const btn = RG.$('btn-scroll-down');
    box.addEventListener('scroll', () => this.update(), { passive: true });
    btn.onclick = () => {
      RG.scrollBottom();
      this.unseen = 0;
      this.badge();
      btn.hidden = true;
    };
  },
};

export { RG };
