'use strict';
window.RG = window.RG || {};

RG.haptics = {
  tap(ms) {
    try {
      if (navigator.vibrate) navigator.vibrate(ms || 10);
    } catch (e) {}
  },
};

RG.reduceMotion = () => !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

RG.markdown = {
  escape(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  },
  render(text) {
    const fences = [];
    let src = String(text || '');
    src = src.replace(/```([\s\S]*?)```/g, (m, code) => {
      fences.push('<pre class="md-pre">' + this.escape(code.replace(/^\n+|\n+$/g, '')) + '</pre>');
      return ' F' + (fences.length - 1) + ' ';
    });
    let out = this.escape(src);
    out = out.replace(/`([^`\n]+)`/g, '<code class="md-code">$1</code>');
    out = out.replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>');
    out = out.replace(/^#{1,3}\s+(.+)$/gm, '<strong class="md-h">$1</strong>');
    out = out.replace(/(^|\n)\s*[-•]\s+/g, '$1<span class="md-li">•</span> ');
    out = out.replace(/(^|\n)(\d+)\.\s+/g, '$1<span class="md-li">$2.</span> ');
    out = out.replace(/ F(\d+) /g, (m, i) => fences[Number(i)]);
    return out;
  },
};

RG.copy = (text) => {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text);
  }
  return new Promise((resolve, reject) => {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy') ? resolve() : reject(new Error('copy failed'));
    } catch (e) {
      reject(e);
    }
    ta.remove();
  });
};

RG.download = (name, text) => {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 500);
};

RG.drawer = {
  s: null,
  open() {
    if (!RG.auth.state) return;
    RG.$('sidebar').classList.add('open');
    RG.$('backdrop').classList.add('show');
  },
  close() {
    RG.$('sidebar').classList.remove('open');
    RG.$('backdrop').classList.remove('show');
  },
  onStart(e) {
    const x = e.touches[0].clientX;
    const y = e.touches[0].clientY;
    const isOpen = RG.$('sidebar').classList.contains('open');
    let mode = null;
    if (!isOpen && x <= 24 && RG.auth.state) mode = 'open';
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
  bind() {
    RG.$('btn-menu').onclick = () => this.open();
    RG.$('backdrop').onclick = () => this.close();
    document.addEventListener('touchstart', (e) => this.onStart(e), { passive: true });
    document.addEventListener('touchmove', (e) => this.onMove(e), { passive: false });
    document.addEventListener('touchend', () => this.onEnd(), { passive: true });
    document.addEventListener('touchcancel', () => this.onEnd(), { passive: true });
  },
};

RG.scrolldown = {
  unseen: 0,
  isFar() {
    const box = RG.$('messages');
    return box.scrollHeight - box.scrollTop - box.clientHeight > 160;
  },
  update() {
    const btn = RG.$('btn-scroll-down');
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
    const b = RG.$('scroll-badge');
    if (!b) return;
    b.hidden = !this.unseen;
    b.textContent = this.unseen > 9 ? '9+' : String(this.unseen);
  },
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

RG.quote = {
  current: null,
  XSVG: '<svg width="14" height="14" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" fill="none"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
  set(m) {
    this.current = m ? { role: m.role, text: m.text } : null;
    this.render();
  },
  render() {
    const row = RG.$('quote-row');
    if (!row) return;
    row.innerHTML = '';
    if (!this.current) {
      row.hidden = true;
      return;
    }
    row.hidden = false;
    const chip = document.createElement('div');
    chip.className = 'attach-chip quote-chip';
    const name = document.createElement('span');
    name.className = 'attach-name';
    name.textContent = (this.current.role === 'user' ? 'Anda' : 'Rategoan') + ': ' + this.current.text;
    const x = document.createElement('button');
    x.className = 'hist-del';
    x.setAttribute('aria-label', 'Remove');
    x.innerHTML = this.XSVG;
    x.onclick = () => this.set(null);
    chip.appendChild(name);
    chip.appendChild(x);
    row.appendChild(chip);
  },
  consume() {
    const c = this.current;
    this.current = null;
    this.render();
    return c;
  },
};

RG.chat = {
  current() {
    const st = RG.store.get();
    return st.sessions.find((s) => s.id === st.currentId) || null;
  },
  dayLabel(t) {
    const d = new Date(t).toDateString();
    const now = new Date();
    if (d === now.toDateString()) return 'Hari ini';
    if (d === new Date(now.getTime() - 86400000).toDateString()) return 'Kemarin';
    return new Date(t).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  },
  renderMessages() {
    const box = RG.$('messages');
    const empty = RG.$('empty-state');
    box.innerHTML = '';
    const s = this.current();
    const has = !!(s && s.messages.length);
    if (empty) empty.hidden = has;
    box.style.display = has ? '' : 'none';
    if (!has) {
      if (RG.scrolldown.update) RG.scrolldown.update();
      return;
    }
    let lastDay = '';
    s.messages.forEach((m, idx) => {
      const day = new Date(m.time).toDateString();
      if (day !== lastDay) {
        lastDay = day;
        const dv = document.createElement('div');
        dv.className = 'day-divider';
        dv.textContent = this.dayLabel(m.time);
        box.appendChild(dv);
      }
      const d = document.createElement('div');
      d.className = 'msg ' + (m.role === 'user' ? 'user' : 'ai');
      d.dataset.idx = String(idx);
      if (m.quote) {
        const q = document.createElement('span');
        q.className = 'msg-quote';
        q.textContent = m.quote.name + ': ' + m.quote.text;
        d.appendChild(q);
      }
      if (m.role === 'user') {
        const t = document.createElement('span');
        t.textContent = m.text;
        d.appendChild(t);
      } else {
        const b = document.createElement('div');
        b.innerHTML = RG.markdown.render(m.text);
        d.appendChild(b);
      }
      if (m.attach) {
        if (m.attach.thumb) {
          const img = document.createElement('img');
          img.className = 'msg-thumb';
          img.src = m.attach.thumb;
          img.alt = m.attach.name || 'lampiran';
          d.appendChild(img);
        }
        const a = document.createElement('span');
        a.className = 'msg-attach';
        a.textContent = '📎 ' + m.attach.name;
        d.appendChild(a);
      }
      const tm = document.createElement('span');
      tm.className = 'time';
      tm.textContent = RG.fmtTime(m.time);
      d.appendChild(tm);
      box.appendChild(d);
    });
    RG.scrollBottom();
    if (RG.scrolldown.update) RG.scrolldown.update();
  },
  async typeReply(text, follow) {
    const d = document.createElement('div');
    d.className = 'msg ai';
    const body = document.createElement('div');
    const tm = document.createElement('span');
    tm.className = 'time';
    tm.textContent = RG.fmtTime(Date.now());
    d.appendChild(body);
    d.appendChild(tm);
    RG.$('messages').appendChild(d);
    if (follow && !RG.reduceMotion()) {
      for (let i = 0; i < text.length; i += 3) {
        body.innerHTML = RG.markdown.render(text.slice(0, i + 3));
        RG.scrollBottom();
        await RG.sleep(12);
      }
    }
    body.innerHTML = RG.markdown.render(text);
    if (follow) {
      RG.scrollBottom();
    } else {
      RG.scrolldown.ping();
    }
  },
  async ask(prompt) {
    const s = this.current();
    const typing = document.createElement('div');
    typing.className = 'msg ai typing';
    typing.textContent = '…';
    RG.$('messages').appendChild(typing);
    RG.scrollBottom();
    const reply = RG.ai ? await RG.ai.generate(s.messages, prompt) : null;
    typing.remove();
    if (reply == null) return null;
    s.messages.push({ role: 'ai', text: reply, time: Date.now() });
    await this.typeReply(reply, !RG.scrolldown.isFar());
    RG.voice.speak(reply);
    return reply;
  },
};

RG.chatsearch = {
  matches: [],
  idx: -1,
  open: false,
  toggle() {
    const bar = RG.$('chat-search-bar');
    this.open = !this.open;
    bar.hidden = !this.open;
    if (this.open) {
      RG.$('chat-search-input').value = '';
      this.clear();
      RG.$('chat-search-input').focus();
    } else {
      this.clear();
    }
  },
  clear() {
    this.matches.forEach((el) => el.classList.remove('hit'));
    this.matches = [];
    this.idx = -1;
    this.count();
  },
  run(q) {
    this.clear();
    q = (q || '').toLowerCase().trim();
    if (!q) return;
    Array.from(RG.$('messages').querySelectorAll('.msg')).forEach((el) => {
      if ((el.textContent || '').toLowerCase().includes(q)) this.matches.push(el);
    });
    if (this.matches.length) {
      this.idx = 0;
      this.focus();
    }
    this.count();
  },
  count() {
    const c = RG.$('chat-search-count');
    if (c) c.textContent = this.matches.length ? (this.idx + 1) + '/' + this.matches.length : '0';
  },
  focus() {
    const el = this.matches[this.idx];
    if (!el) return;
    this.matches.forEach((m) => m.classList.remove('hit'));
    el.classList.add('hit');
    el.scrollIntoView({ block: 'center' });
    this.count();
  },
  next() {
    if (!this.matches.length) return;
    this.idx = (this.idx + 1) % this.matches.length;
    this.focus();
  },
  prev() {
    if (!this.matches.length) return;
    this.idx = (this.idx - 1 + this.matches.length) % this.matches.length;
    this.focus();
  },
  bind() {
    RG.$('btn-chat-search').onclick = () => this.toggle();
    RG.$('chat-search-input').addEventListener('input', (e) => this.run(e.target.value));
    RG.$('chat-search-next').onclick = () => this.next();
    RG.$('chat-search-prev').onclick = () => this.prev();
    RG.$('chat-search-close').onclick = () => this.toggle();
  },
};

RG.history = {
  query: '',
  dayIndex(ts) {
    const d = new Date(ts).toDateString();
    const now = new Date();
    if (d === now.toDateString()) return 0;
    if (d === new Date(now.getTime() - 86400000).toDateString()) return 1;
    return 2;
  },
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
  togglePin(id) {
    const st = RG.store.get();
    const s = st.sessions.find((x) => x.id === id);
    if (!s) return;
    s.pinned = !s.pinned;
    RG.store.save();
    this.render();
    RG.toast.show(s.pinned ? 'Disematkan' : 'Sematan dilepas');
  },
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

RG.histmenu = {
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
    const st = RG.store.get();
    const s = st.sessions.find((v) => v.id === id);
    const mk = (label, cls, fn) => {
      const b = document.createElement('button');
      b.textContent = label;
      if (cls) b.className = cls;
      b.onclick = () => { this.hide(); fn(); };
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
    const st = RG.store.get();
    const s = st.sessions.find((x) => x.id === this.id);
    if (!s) return;
    if (kind === 'rename') {
      const t = prompt('Nama chat:', s.title);
      if (t && t.trim()) {
        s.title = t.trim().slice(0, 40);
        RG.store.save();
        RG.history.render();
        RG.toast.show('Nama diubah');
      }
    } else if (kind === 'pin') {
      RG.history.togglePin(s.id);
    } else if (kind === 'info') {
      const count = (s.messages || []).length;
      const kb = Math.max(1, Math.round(JSON.stringify(s).length / 1024));
      const created = s.created || (s.messages && s.messages[0] && s.messages[0].time) || Date.now();
      const d = new Date(created).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
      RG.toast.show(count + ' pesan • ' + kb + ' KB • dibuat ' + d, 4000);
    } else if (kind === 'export') {
      const lines = (s.messages || []).map((m) =>
        '[' + RG.fmtTime(m.time) + '] ' + (m.role === 'user' ? 'Anda' : 'Rategoan') + ': ' + m.text
      );
      RG.download((s.title || 'chat') + '.txt', lines.join('\n'));
      RG.toast.show('Chat diekspor');
    } else if (kind === 'delete') {
      RG.history.remove(s.id);
    }
  },
  bind() {
    const list = RG.$('history-list');
    let start = null;
    list.addEventListener('touchstart', (e) => {
      const item = e.target.closest('.hist-item');
      if (!item || !item.dataset.id) return;
      start = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      const id = item.dataset.id;
      this.timer = setTimeout(() => {
        RG.haptics.tap(15);
        this.suppress = true;
        this.show(start.x, start.y, id);
      }, 480);
    }, { passive: true });
    list.addEventListener('touchmove', (e) => {
      if (!this.timer || !start) return;
      const dx = e.touches[0].clientX - start.x;
      const dy = e.touches[0].clientY - start.y;
      if (dx * dx + dy * dy > 100) {
        clearTimeout(this.timer);
        this.timer = null;
      }
    }, { passive: true });
    const cancel = () => {
      if (this.timer) {
        clearTimeout(this.timer);
        this.timer = null;
      }
    };
    list.addEventListener('touchend', cancel, { passive: true });
    list.addEventListener('touchcancel', cancel, { passive: true });
    document.addEventListener('touchstart', (e) => {
      if (this.el && !this.el.hidden && !this.el.contains(e.target)) this.hide();
    }, { passive: true, capture: true });
  },
};

RG.msgmenu = {
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
    const s = RG.chat.current();
    const msg = s && s.messages[idx];
    const mk = (label, cls, fn) => {
      const b = document.createElement('button');
      b.textContent = label;
      if (cls) b.className = cls;
      b.onclick = () => { this.hide(); fn(); };
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
    const s = RG.chat.current();
    if (!s || this.idx == null) return;
    const m = s.messages[this.idx];
    if (!m) return;
    if (kind === 'copy') {
      RG.copy(m.text).then(() => RG.toast.show('Disalin')).catch(() => RG.toast.show('Gagal menyalin'));
    } else if (kind === 'reply') {
      RG.quote.set(m);
      RG.$('chat-input').focus();
    } else if (kind === 'edit') {
      const t = prompt('Ubah pesan:', m.text);
      if (t !== null && t.trim() && t !== m.text) {
        m.text = t.trim();
        RG.store.save();
        RG.chat.renderMessages();
        RG.toast.show('Pesan diubah');
      }
    } else if (kind === 'resend') {
      RG.composer.send(m.text);
    } else if (kind === 'speak') {
      RG.voice.speak(m.text);
    } else if (kind === 'delete') {
      s.messages.splice(this.idx, 1);
      RG.store.save();
      RG.history.render();
      RG.chat.renderMessages();
      RG.haptics.tap(20);
      RG.toast.show('Pesan dihapus');
    }
  },
  bind() {
    const box = RG.$('messages');
    let start = null;
    box.addEventListener('touchstart', (e) => {
      const msg = e.target.closest('.msg');
      if (!msg || msg.dataset.idx == null) return;
      start = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      const idx = Number(msg.dataset.idx);
      this.timer = setTimeout(() => {
        RG.haptics.tap(15);
        this.show(start.x, start.y, idx);
      }, 480);
    }, { passive: true });
    box.addEventListener('touchmove', (e) => {
      if (!this.timer || !start) return;
      const dx = e.touches[0].clientX - start.x;
      const dy = e.touches[0].clientY - start.y;
      if (dx * dx + dy * dy > 100) {
        clearTimeout(this.timer);
        this.timer = null;
      }
    }, { passive: true });
    const cancel = () => {
      if (this.timer) {
        clearTimeout(this.timer);
        this.timer = null;
      }
    };
    box.addEventListener('touchend', cancel, { passive: true });
    box.addEventListener('touchcancel', cancel, { passive: true });
    box.addEventListener('contextmenu', (e) => e.preventDefault());
    document.addEventListener('touchstart', (e) => {
      if (this.el && !this.el.hidden && !this.el.contains(e.target)) this.hide();
    }, { passive: true, capture: true });
    window.addEventListener('scroll', () => this.hide(), { passive: true });
  },
};

RG.sheets = {
  close() {
    RG.$('attach-sheet').hidden = true;
    RG.$('model-sheet').hidden = true;
    RG.$('sheet-backdrop').classList.remove('show');
  },
  bind() {
    RG.$('sheet-backdrop').onclick = () => this.close();
    RG.$('attach-close').onclick = () => this.close();
    RG.$('model-close').onclick = () => this.close();
  },
};

RG.attach = {
  current: null,
  open() {
    RG.$('attach-sheet').hidden = false;
    RG.$('sheet-backdrop').classList.add('show');
  },
  pick(kind) {
    RG.$('pick-' + kind).click();
  },
  makeThumb(file, max) {
    max = max || 96;
    return new Promise((resolve) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        try {
          const scale = Math.min(1, max / Math.max(img.width, img.height));
          const w = Math.max(1, Math.round(img.width * scale));
          const h = Math.max(1, Math.round(img.height * scale));
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          canvas.getContext('2d').drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        } catch (e) {
          resolve(null);
        }
        URL.revokeObjectURL(url);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(null);
      };
      img.src = url;
    });
  },
  async onPick(input) {
    const f = input.files && input.files[0];
    input.value = '';
    if (!f) return;
    this.current = { name: f.name, type: f.type, size: f.size, thumb: null };
    if (f.type && f.type.indexOf('image/') === 0) {
      this.current.thumb = await this.makeThumb(f);
    }
    this.renderChip();
    RG.sheets.close();
  },
  renderChip() {
    const row = RG.$('attach-row');
    row.innerHTML = '';
    if (!this.current) {
      row.hidden = true;
      return;
    }
    row.hidden = false;
    const chip = document.createElement('div');
    chip.className = 'attach-chip';
    if (this.current.thumb) {
      const img = document.createElement('img');
      img.className = 'attach-thumb';
      img.src = this.current.thumb;
      img.alt = this.current.name;
      chip.appendChild(img);
    }
    const name = document.createElement('span');
    name.className = 'attach-name';
    name.textContent = this.current.name;
    const x = document.createElement('button');
    x.className = 'hist-del';
    x.setAttribute('aria-label', 'Remove');
    x.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" fill="none"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
    x.onclick = () => {
      this.current = null;
      this.renderChip();
    };
    chip.appendChild(name);
    chip.appendChild(x);
    row.appendChild(chip);
  },
  consume() {
    const c = this.current;
    this.current = null;
    this.renderChip();
    return c;
  },
  bind() {
    RG.$('sheet-camera').onclick = () => this.pick('camera');
    RG.$('sheet-photo').onclick = () => this.pick('photo');
    RG.$('sheet-file').onclick = () => this.pick('file');
    RG.$('pick-camera').onchange = (e) => this.onPick(e.target);
    RG.$('pick-photo').onchange = (e) => this.onPick(e.target);
    RG.$('pick-file').onchange = (e) => this.onPick(e.target);
  },
};

RG.models = {
  KEY: 'rategoan_model',
  list: [
    { id: 'raget-1.0', name: 'Raget 1.0' },
  ],
  active: 'raget-1.0',
  load() {
    const v = localStorage.getItem(this.KEY);
    if (v) this.active = v;
  },
  open() {
    this.render();
    RG.$('model-sheet').hidden = false;
    RG.$('sheet-backdrop').classList.add('show');
  },
  render() {
    const box = RG.$('model-list');
    box.innerHTML = '';
    this.list.forEach((m) => {
      const b = document.createElement('button');
      b.className = 'model-item' + (m.id === this.active ? ' active' : '');
      const nm = document.createElement('span');
      nm.className = 'model-name';
      nm.textContent = m.name;
      b.appendChild(nm);
      if (m.id === this.active) {
        const ck = document.createElement('span');
        ck.className = 'model-check';
        ck.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
        b.appendChild(ck);
      }
      b.onclick = () => {
        this.active = m.id;
        localStorage.setItem(this.KEY, m.id);
        if (RG.ai) RG.ai.setStatus('Model: ' + m.name);
        RG.sheets.close();
        RG.haptics.tap(10);
        RG.toast.show('Model aktif: ' + m.name);
      };
      box.appendChild(b);
    });
  },
  bind() {
    this.load();
    RG.$('btn-model').onclick = () => this.open();
  },
};

RG.composer = {
  autoGrow() {
    const inp = RG.$('chat-input');
    inp.style.height = 'auto';
    inp.style.height = Math.min(inp.scrollHeight, 120) + 'px';
  },
  ensure() {
    const st = RG.store.get();
    let s = st.sessions.find((x) => x.id === st.currentId);
    if (!s) {
      s = { id: Date.now().toString(36), title: 'Chat', messages: [], created: Date.now() };
      RG.store.set({ sessions: [s].concat(st.sessions), currentId: s.id });
    }
    return s;
  },
  async send(text) {
    const s = this.ensure();
    if (!s.messages.length) s.title = text.slice(0, 28);
    const att = RG.attach.consume();
    const q = RG.quote.consume();
    s.messages.push({
      role: 'user',
      text: text,
      time: Date.now(),
      attach: att,
      quote: q ? { name: q.role === 'user' ? 'Anda' : 'Rategoan', text: String(q.text).slice(0, 140) } : null,
    });
    RG.store.save();
    RG.history.render();
    RG.chat.renderMessages();
    RG.haptics.tap(10);
    const reply = await RG.chat.ask(text);
    if (reply == null) {
      RG.toast.show('AI belum terpasang');
      return;
    }
    RG.store.save();
    RG.history.render();
  },
  bind() {
    const inp = RG.$('chat-input');
    inp.addEventListener('input', () => this.autoGrow());
    inp.addEventListener('focus', () => setTimeout(RG.scrollBottom, 250));
    RG.$('btn-send').onclick = () => {
      const t = inp.value.trim();
      if (!t && !RG.attach.current && !RG.quote.current) return;
      inp.value = '';
      this.autoGrow();
      this.send(t);
    };
    RG.$('btn-plus').onclick = () => RG.attach.open();
    RG.$('btn-login').onclick = () => {
      RG.drawer.close();
      if (RG.auth.state) {
        RG.router.go('settings');
      } else {
        RG.router.go('login');
      }
    };
    document.querySelectorAll('.empty-chip').forEach((c) => {
      c.onclick = () => {
        inp.value = c.textContent;
        this.autoGrow();
        inp.focus();
      };
    });
  },
};

RG.voice = {
  listening: false,
  rec: null,
  speak(text) {
    if (!('speechSynthesis' in window)) return;
    const u = new SpeechSynthesisUtterance(text.replace(/[*_#`~]/g, ''));
    u.lang = 'id-ID';
    u.onstart = () => RG.$('btn-stop').classList.add('active');
    u.onend = () => RG.$('btn-stop').classList.remove('active');
    u.onerror = () => RG.$('btn-stop').classList.remove('active');
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  },
  stop() {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  },
  listen() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { RG.toast.show('Input suara tidak didukung'); return; }
    if (this.listening) { try { this.rec && this.rec.stop(); } catch (e) {} return; }
    try { this.rec = new SR(); } catch (e) { RG.toast.show('Input suara gagal'); return; }
    this.rec.lang = 'id-ID';
    this.rec.interimResults = false;
    this.rec.onstart = () => {
      this.listening = true;
      RG.$('btn-voice-input').classList.add('listening');
    };
    this.rec.onresult = (e) => {
      const t = e.results[0][0].transcript;
      const inp = RG.$('chat-input');
      inp.value += (inp.value ? ' ' : '') + t;
      RG.composer.autoGrow();
    };
    this.rec.onerror = (e) => RG.toast.show('Suara: ' + (e.error || 'gagal'));
    this.rec.onend = () => {
      this.listening = false;
      RG.$('btn-voice-input').classList.remove('listening');
    };
    try { this.rec.start(); } catch (e) { RG.toast.show('Input suara tidak dapat dimulai'); }
  },
  bind() {
    RG.$('btn-stop').onclick = () => this.stop();
    RG.$('btn-voice-input').onclick = () => this.listen();
  },
};

RG.netmon = {
  bind() {
    window.addEventListener('online', () => RG.toast.show('Koneksi kembali — online'));
    window.addEventListener('offline', () => RG.toast.show('Offline — mode lokal aktif'));
  },
};

RG.install = {
  evt: null,
  bind() {
    const row = RG.$('row-install');
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.evt = e;
      if (row) row.hidden = false;
    });
    window.addEventListener('appinstalled', () => {
      if (row) row.hidden = true;
      RG.toast.show('Aplikasi terpasang');
    });
    if (row) {
      row.onclick = async () => {
        if (!this.evt) { RG.toast.show('Install tidak tersedia'); return; }
        this.evt.prompt();
        await this.evt.userChoice;
        this.evt = null;
        row.hidden = true;
      };
    }
  },
};

RG.backup = {
  export() {
    const st = RG.store.get();
    const payload = {
      app: 'rategoan',
      version: 1,
      exportedAt: Date.now(),
      sessions: st.sessions,
    };
    RG.download(
      'rategoan-backup-' + new Date().toISOString().slice(0, 10) + '.json',
      JSON.stringify(payload, null, 2)
    );
    RG.haptics.tap(10);
    RG.toast.show('Cadangan diunduh');
  },
  onPick(input) {
    const f = input.files && input.files[0];
    input.value = '';
    if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      try {
        const data = JSON.parse(r.result);
        if (!data || !Array.isArray(data.sessions)) throw new Error('format');
        RG.store.set({ sessions: data.sessions, currentId: null });
        RG.store.save();
        RG.history.render();
        RG.chat.renderMessages();
        RG.haptics.tap(10);
        RG.toast.show('Pulihkan berhasil: ' + data.sessions.length + ' chat');
      } catch (e) {
        RG.toast.show('File cadangan tidak valid');
      }
    };
    r.readAsText(f);
  },
  bind() {
    RG.$('pick-restore').onchange = (e) => this.onPick(e.target);
  },
};

RG.account = {
  MAIL_SVG: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>',
  refresh() {
    const btn = RG.$('btn-login');
    if (!btn) return;
    const st = RG.auth.state;
    if (!st) {
      btn.classList.remove('logged');
      btn.setAttribute('aria-label', 'Login');
      btn.innerHTML = this.MAIL_SVG;
      return;
    }
    const local = st.method === 'gmail' ? String(st.id).split('@')[0] : 'P';
    const initial = (local.charAt(0) || 'U').toUpperCase();
    btn.classList.add('logged');
    btn.setAttribute('aria-label', 'Akun');
    btn.innerHTML = '<span class="account-initial">' + initial + '</span>';
  },
};

RG.login = {
  pendingPhone: null,
  pendingCode: null,
  setMethod(m) {
    RG.$('login-form-gmail').hidden = m !== 'gmail';
    RG.$('login-form-phone').hidden = m !== 'phone';
    RG.$('login-otp-row').hidden = true;
    RG.$('login-tab-gmail').classList.toggle('active', m === 'gmail');
    RG.$('login-tab-phone').classList.toggle('active', m === 'phone');
  },
  submitGmail() {
    const v = RG.$('login-email').value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
      RG.toast.show('Format Gmail tidak valid');
      return;
    }
    RG.auth.login('gmail', v);
    RG.account.refresh();
    RG.haptics.tap(15);
    RG.toast.show('Selamat datang');
    RG.router.go('chat');
  },
  submitPhone() {
    const v = RG.$('login-phone').value.trim();
    if (!/^[0-9+\-\s]{8,16}$/.test(v)) {
      RG.toast.show('Nomor telepon tidak valid');
      return;
    }
    this.pendingPhone = v;
    this.pendingCode = String(Math.floor(100000 + Math.random() * 900000));
    RG.toast.show('Kode lokal Anda: ' + this.pendingCode, 8000);
    RG.$('login-otp').value = '';
    RG.$('login-otp-row').hidden = false;
  },
  verify() {
    const v = RG.$('login-otp').value.trim();
    if (v !== this.pendingCode) {
      RG.toast.show('Kode salah');
      return;
    }
    RG.auth.login('phone', this.pendingPhone);
    RG.account.refresh();
    RG.haptics.tap(15);
    RG.toast.show('Selamat datang');
    RG.router.go('chat');
  },
  bind() {
    RG.$('login-tab-gmail').onclick = () => this.setMethod('gmail');
    RG.$('login-tab-phone').onclick = () => this.setMethod('phone');
    RG.$('login-gmail-submit').onclick = () => this.submitGmail();
    RG.$('login-phone-submit').onclick = () => this.submitPhone();
    RG.$('login-otp-submit').onclick = () => this.verify();
    this.setMethod('gmail');
    RG.account.refresh();
  },
};

RG.font = {
  KEY: 'rategoan_font',
  value: 'normal',
  load() {
    this.value = localStorage.getItem(this.KEY) || 'normal';
    this.apply();
  },
  apply() {
    document.documentElement.dataset.font = this.value;
  },
  set(v) {
    this.value = v;
    localStorage.setItem(this.KEY, v);
    this.apply();
  },
};

RG.storage = {
  usage() {
    let total = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      const v = localStorage.getItem(k) || '';
      total += (k.length + v.length) * 2;
    }
    return total;
  },
  quota() {
    return 5 * 1024 * 1024;
  },
  percent() {
    return Math.min(100, Math.round((this.usage() / this.quota()) * 100));
  },
};

RG.pin = {
  KEY: 'rategoan_pin',
  has() {
    return !!localStorage.getItem(this.KEY);
  },
  set(p) {
    localStorage.setItem(this.KEY, this.hash(p));
  },
  clear() {
    localStorage.removeItem(this.KEY);
  },
  hash(s) {
    let h = 5381;
    for (let i = 0; i < s.length; i++) {
      h = ((h << 5) + h + s.charCodeAt(i)) | 0;
    }
    return String(h);
  },
  verify(p) {
    return this.hash(p) === localStorage.getItem(this.KEY);
  },
  lock() {
    const ov = RG.$('pin-overlay');
    if (!ov) return;
    ov.hidden = false;
    const inp = RG.$('pin-input');
    inp.value = '';
    inp.focus();
  },
  unlock() {
    const ov = RG.$('pin-overlay');
    if (ov) ov.hidden = true;
  },
  bind() {
    const submit = RG.$('pin-submit');
    if (!submit) return;
    submit.onclick = () => {
      const v = RG.$('pin-input').value.trim();
      if (this.verify(v)) {
        this.unlock();
        RG.toast.show('Terbuka');
      } else {
        RG.toast.show('PIN salah');
      }
    };
  },
  bindAutoLock() {
    let hiddenAt = 0;
    document.addEventListener('visibilitychange', () => {
      if (!this.has()) return;
      if (document.hidden) {
        hiddenAt = Date.now();
      } else if (hiddenAt && Date.now() - hiddenAt > 5 * 60 * 1000) {
        this.lock();
      }
    });
  },
};

RG.shortcuts = {
  bind() {
    if (!(window.matchMedia && window.matchMedia('(pointer: fine)').matches)) return;
    RG.$('chat-input').addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        RG.$('btn-send').click();
      }
    });
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        RG.drawer.open();
        const s = RG.$('history-search');
        if (s) s.focus();
      }
    });
  },
};

RG.onboard = {
  KEY: 'rategoan_onboarded',
  maybeShow() {
    if (localStorage.getItem(this.KEY)) return;
    if (!RG.auth.state) return;
    const ov = RG.$('onboard-overlay');
    if (ov) ov.hidden = false;
  },
  bind() {
    const ok = RG.$('onboard-ok');
    if (ok) {
      ok.onclick = () => {
        localStorage.setItem(this.KEY, '1');
        const ov = RG.$('onboard-overlay');
        if (ov) ov.hidden = true;
      };
    }
  },
};