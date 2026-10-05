export const store = {
  KEY: 'rategoan_sessions',
  state: { sessions: [], currentId: null },
  init() {
    try {
      this.state.sessions = JSON.parse(localStorage.getItem(this.KEY) || '[]');
    } catch (e) {
      this.state.sessions = [];
    }
  },
  save() {
    const sessions = this.state.sessions.map((session) => ({
      ...session,
      messages: (session.messages || []).map((message) => {
        if (!message.attach || !message.attach.full || String(message.attach.full).length < 80000) return message;
        const attach = { ...message.attach, full: message.attach.thumb || '' };
        return { ...message, attach };
      }),
    }));
    const json = JSON.stringify(sessions);
    try {
      localStorage.setItem(this.KEY, json);
    } catch (e) {
      console.warn('[Rategoan Fallback] Penyimpanan:', e);
      const slim = sessions.slice(-12).map((session) => ({
        ...session,
        messages: (session.messages || []).slice(-20).map((message) => ({ ...message, attach: message.attach ? { name: message.attach.name } : undefined })),
      }));
      try { localStorage.setItem(this.KEY, JSON.stringify(slim)); } catch (again) {
        console.warn('[Rategoan Fallback] Penyimpanan:', again);
      }
      this.keepInDb(json);
    }
  },
  keepInDb(json) {
    if (!globalThis.indexedDB) return;
    const open = indexedDB.open('rategoan_db', 1);
    open.onupgradeneeded = () => open.result.createObjectStore('sessions');
    open.onsuccess = () => {
      const db = open.result;
      const tx = db.transaction('sessions', 'readwrite');
      tx.objectStore('sessions').put(json, 'backup');
      tx.oncomplete = () => db.close();
    };
  },
  get() {
    return this.state;
  },
  set(patch) {
    Object.assign(this.state, patch);
  },
};
