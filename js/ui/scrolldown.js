import { $, scrollBottom } from '../../shared/dom.js';

export const scrolldown = {
  unseen: 0,
  userLocked: false,
  _lastTop: 0,
  _touchStartY: null,
  _ro: null,
  isFar() {
    const box = $('messages');
    if (!box) return false;
    return box.scrollHeight - box.scrollTop - box.clientHeight > 80;
  },
  hasComposerOverlay() {
    if (typeof document === 'undefined') return false;
    const attRow = $('attach-row');
    const quoteRow = $('quote-row');
    const hasAttach = !!(attRow && !attRow.hidden && attRow.childNodes.length > 0);
    const hasQuote = !!(quoteRow && !quoteRow.hidden && quoteRow.childNodes.length > 0);
    const kbOpen = !!(document.body && document.body.classList.contains('keyboard-open'));
    return hasAttach || hasQuote || kbOpen;
  },
  syncPosition() {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    const btn = $('btn-scroll-down');
    const card = $('composer-card') || $('composer');
    if (!card || typeof card.getBoundingClientRect !== 'function') return;
    const rect = card.getBoundingClientRect();
    const vh = (window.visualViewport && window.visualViewport.height) || window.innerHeight || 0;
    if (rect && rect.height > 0 && vh > 0) {
      const fromBottom = Math.max(138, Math.round(vh - rect.top + 14));
      document.documentElement.style.setProperty('--scroll-down-bottom', fromBottom + 'px');
      if (btn) btn.style.bottom = fromBottom + 'px';
      const msgBox = $('messages');
      if (msgBox) {
        const padBottom = Math.max(116, Math.round(vh - rect.top + 18));
        document.documentElement.style.setProperty('--composer-pad-bottom', padBottom + 'px');
      }
    }
  },
  shouldAutoScroll() {
    if (this.userLocked) return false;
    const box = $('messages');
    if (!box) return true;
    if (box.querySelector('.thought-accordion[open]')) {
      const dist = box.scrollHeight - box.scrollTop - box.clientHeight;
      if (dist > 36) return false;
    }
    return !this.isFar();
  },
  resetLock() {
    this.userLocked = false;
    const box = $('messages');
    if (box) this._lastTop = box.scrollTop;
  },
  update() {
    const btn = $('btn-scroll-down');
    this.syncPosition();
    const far = this.isFar();
    if (!far && !this.userLocked) {
      this.unseen = 0;
      this.badge();
    }
    const overlayActive = this.hasComposerOverlay();
    if (btn) btn.hidden = overlayActive || !(far || this.userLocked);
  },
  ping() {
    if (this.isFar() || this.userLocked) {
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
    if (!box || !btn) return;
    this.syncPosition();
    if (typeof ResizeObserver === 'function' && !this._ro) {
      this._ro = new ResizeObserver(() => this.update());
      const card = $('composer-card');
      const comp = $('composer');
      const attRow = $('attach-row');
      if (card) this._ro.observe(card);
      if (comp) this._ro.observe(comp);
      if (attRow) this._ro.observe(attRow);
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', () => this.update(), { passive: true });
      if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', () => this.update(), { passive: true });
      }
    }
    box.addEventListener('wheel', (ev) => {
      if (ev.deltaY < -2) {
        this.userLocked = true;
        this.update();
      } else if (ev.deltaY > 4) {
        const dist = box.scrollHeight - box.scrollTop - box.clientHeight;
        if (dist <= 24) this.userLocked = false;
        this.update();
      }
    }, { passive: true });
    box.addEventListener('touchstart', (ev) => {
      if (ev.touches && ev.touches.length === 1) {
        this._touchStartY = ev.touches[0].clientY;
      }
    }, { passive: true });
    box.addEventListener('touchmove', (ev) => {
      if (this._touchStartY != null && ev.touches && ev.touches.length === 1) {
        const dy = ev.touches[0].clientY - this._touchStartY;
        if (dy > 6) {
          this.userLocked = true;
          this.update();
        } else if (dy < -10) {
          const dist = box.scrollHeight - box.scrollTop - box.clientHeight;
          if (dist <= 24) this.userLocked = false;
          this.update();
        }
      }
    }, { passive: true });
    box.addEventListener('scroll', () => {
      const isProg = box._progScrollTs && (Date.now() - box._progScrollTs < 80);
      const curTop = box.scrollTop;
      const dist = box.scrollHeight - curTop - box.clientHeight;
      if (!isProg) {
        if (curTop < this._lastTop - 4) {
          this.userLocked = true;
        } else if (curTop > this._lastTop + 2 && dist <= 24) {
          this.userLocked = false;
        }
      }
      this._lastTop = curTop;
      this.update();
    }, { passive: true });
    btn.onclick = () => {
      this.userLocked = false;
      scrollBottom();
      this.unseen = 0;
      this.badge();
      btn.hidden = true;
    };
  },
};
