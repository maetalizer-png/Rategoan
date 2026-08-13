/**
 * Chat History - Session list management
 * @module views/history
 */

import { RG } from '../core/index.js';

/**
 * Chat history manager
 */
RG.history = {
  query: '',

  /**
   * Get day index for grouping
   * @param {number} ts - Timestamp
   * @returns {number} 0=today, 1=yesterday, 2=older
   */
  dayIndex(ts) {
    const d = new Date(ts).toDateString();
    const now = new Date();
    if (d === now.toDateString()) return 0;
    if (d === new Date(now.getTime() - 86400000).toDateString()) return 1;
    return 2;
  },

  /**
   * Create history item element
   * @param {Object} s - Session object
   * @param {Object} st - Store state
   * @returns {HTMLElement}
   */
  makeItem(s, st) {
    const li = document.createElement('li');
    li.className = 'hist-item' + (s.id === st.currentId ? ' active' : '');
    li.dataset.id = s.id;
    if (s.pinned) {
      const pin = document.createElement('span');
      pin.className = 'hist-pin';
      pin.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 17v5"/><path d="M9 3h6l1 7 2 2H6l2-2z"/></svg>';
      li.appendChild(pin);
    }
    const t = document.createElement('span');
    t.className = 'hist-title';
    t.textContent = s.title;
    li.appendChild(t);
    const del = document.createElement('button');
    del.className = 'hist-del';
    del.setAttribute('aria-label', 'Delete');
    del.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" fill="none"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
    del.onclick = (e) => { e.stopPropagation(); this.remove(s.id); };
    li.appendChild(del);
    li.onclick = () => {
      if (RG.histmenu.suppress) {
        RG.histmenu.suppress = false;
        return;
      }
      RG.store.set({ currentId: s.id });
      this.render();
      RG.chat.renderMessages();
      RG.drawer.close();
    };
    return li;
  },

  /**
   * Render history list
   */
  render() {
    const list = RG.$('history-list');
    const emptyEl = RG.$('history-empty');
    list.innerHTML = '';
    const st = RG.store.get();
    const q = this.query;
    const all = q
      ? st.sessions.filter((s) => (s.title || '').toLowerCase().includes(q))
      : st.sessions;
    emptyEl.style.display = all.length ? 'none' : 'flex';
    emptyEl.textContent = q ? 'Tidak ada hasil' : 'Belum ada chat';
    const pinned = all.filter((s) => s.pinned);
    const rest = all.filter((s) => !s.pinned);
    if (pinned.length) {
      const h = document.createElement('div');
      h.className = 'hist-group';
      h.textContent = 'Disematkan';
      list.appendChild(h);
      pinned.forEach((s) => list.appendChild(this.makeItem(s, st)));
    }
    let lastGroup = -1;
    rest.forEach((s) => {
      const ts = (s.messages && s.messages.length && s.messages[0].time) || s.created || 0;
      const g = this.dayIndex(ts);
      if (g !== lastGroup) {
        const h = document.createElement('div');
        h.className = 'hist-group';
        h.textContent = ['Hari ini', 'Kemarin', 'Lebih lama'][g];
        list.appendChild(h);
        lastGroup = g;
      }
      list.appendChild(this.makeItem(s, st));
    });
  },

  /**
   * Toggle pin status
   * @param {string} id - Session ID
   */
  togglePin(id) {
    const st = RG.store.get();
    const s = st.sessions.find((x) => x.id === id);
    if (!s) return;
    s.pinned = !s.pinned;
    RG.store.save();
    this.render();
    RG.toast.show(s.pinned ? 'Disematkan' : 'Sematan dilepas');
  },

  /**
   * Remove session
   * @param {string} id - Session ID
   */
  remove(id) {
    const st = RG.store.get();
    RG.store.set({
      sessions: st.sessions.filter((s) => s.id !== id),
      currentId: st.currentId === id ? null : st.currentId,
    });
    RG.store.save();
    this.render();
    RG.chat.renderMessages();
    RG.haptics.tap(20);
    RG.toast.show('Chat dihapus');
  },

  /**
   * Clear all sessions
   */
  clearAll() {
    RG.store.set({ sessions: [], currentId: null });
    RG.store.save();
    this.query = '';
    const search = RG.$('history-search');
    if (search) search.value = '';
    this.render();
    RG.chat.renderMessages();
    RG.haptics.tap(20);
    RG.toast.show('Semua chat dihapus');
  },

  /**
   * Bind history event listeners
   */
  bind() {
    RG.$('btn-new-chat').onclick = () => {
      RG.store.set({ currentId: null });
      this.render();
      RG.chat.renderMessages();
      RG.drawer.close();
    };
    RG.$('history-search').addEventListener('input', (e) => {
      this.query = e.target.value.trim().toLowerCase();
      this.render();
    });
  },
};

export { RG };
