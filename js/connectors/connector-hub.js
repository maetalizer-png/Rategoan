import { $ } from '../../shared/dom.js';
import { toast } from '../core/toast.js';
import { connectorState } from './connector-state.js';
import { onConnector } from './connector-events.js';
import { mountExplorer } from './connector-explorer.js';

const ORDER = ['google_drive', 'github', 'gmail', 'google_calendar', 'web_search_reader', 'local_sandbox'];

const COPY = {
  google_drive: 'Membaca, membuat dokumen, dan mengelola berkas Drive.',
  github: 'Kelola repositori, lacak perubahan kode, dan buka PR.',
  gmail: 'Buat balasan, cari kotak masuk, dan rangkum rangkaian.',
  google_calendar: 'Kelola agenda, periksa jadwal bentrok, dan atur rapat.',
  web_search_reader: 'Pencarian DuckDuckGo dan ekstraksi halaman lewat proxy.',
  local_sandbox: 'Eksekusi JavaScript di sandbox dan Python lewat Pyodide.',
};

const AUTH = {
  google_drive: '/api/auth/google?service=google_drive',
  gmail: '/api/auth/google?service=gmail',
  google_calendar: '/api/auth/google?service=google_calendar',
  github: '/api/auth/github?service=github',
};

const ICONS = {
  google_drive: '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path fill="#1a73e8" d="M8 4h8l5 9H10z"/><path fill="#34a853" d="M3 18l5-9 5 9z"/><path fill="#fbbc04" d="M13 18h8l-5-9-3 9z"/></svg>',
  github: '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.1-1.47-1.1-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.89 1.52 2.34 1.08 2.91.83.09-.65.35-1.08.63-1.33-2.22-.25-4.56-1.11-4.56-4.95 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02A9.56 9.56 0 0 1 12 6.8c.85 0 1.7.11 2.5.34 1.9-1.29 2.74-1.02 2.74-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.85-2.34 4.7-4.57 4.95.36.31.68.92.68 1.86v2.76c0 .26.18.58.69.48A10 10 0 0 0 12 2z"/></svg>',
  gmail: '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path fill="#ea4335" d="M4 6h16v12H4z"/><path fill="#fff" d="M4 6l8 6 8-6"/></svg>',
  google_calendar: '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2" fill="#1a73e8"/><path fill="#fff" d="M3 9h18v2H3z"/></svg>',
  web_search_reader: '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><circle cx="10" cy="10" r="6" fill="none" stroke="#1a73e8" stroke-width="2"/><path stroke="#1a73e8" stroke-width="2" d="M15 15l5 5"/></svg>',
  local_sandbox: '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><rect x="3" y="4" width="18" height="12" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8 20h8" stroke="currentColor" stroke-width="2"/></svg>',
};

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
}

async function verifyToken(id, token) {
  const url = id === 'github'
    ? 'https://api.github.com/user'
    : 'https://www.googleapis.com/drive/v3/about?fields=user';
  const res = await fetch(url, {
    headers: {
      Authorization: 'Bearer ' + token,
      Accept: 'application/json',
    },
  });
  if (!res.ok) throw new Error('Token ditolak (' + res.status + ')');
  const data = await res.json();
  if (id === 'github') return data.login || '';
  return (data.user && (data.user.emailAddress || data.user.displayName)) || '';
}

async function startOAuth(id) {
  const path = AUTH[id];
  if (!path) return;
  const url = path + '&format=json&action=start';
  try {
    const res = await fetch(url, { credentials: 'same-origin' });
    const data = await res.json().catch(() => ({}));
    if (res.status === 501 || data.error === 'oauth_not_configured') {
      toast.show('OAuth belum dikonfigurasi di server.');
      return;
    }
    if (!res.ok || !data.url) {
      toast.show('Gagal membuka halaman izin.');
      return;
    }
    location.href = data.url;
  } catch (e) {
    toast.show('Jaringan OAuth tidak terjangkau.');
  }
}

export const connectorHub = {
  mount(root) {
    if (!root) return;
    const paint = () => this.paint(root);
    paint();
    if (this._off) this._off();
    this._off = onConnector('rategoan:reconnect-required', () => paint());
  },
  paint(root) {
    const state = connectorState.read();
    const expired = ORDER.filter((id) => state.services[id] && state.services[id].reconnect_required);
    root.innerHTML = '';
    const intro = el('p', 'hub-intro', 'Alat mandiri perangkat. Dua puluh sembilan alat lokal berjalan di peranti ini, tanpa server.');
    root.appendChild(intro);
    if (expired.length) {
      const banner = el('div', 'hub-banner');
      const msg = el('p', null, 'Perlu dihubungkan ulang: ' + expired.map((id) => state.services[id].display_name).join(', ') + '.');
      const retry = el('button', 'hub-action', 'Hubungkan ulang');
      retry.type = 'button';
      retry.onclick = () => startOAuth(expired[0]);
      banner.appendChild(msg);
      banner.appendChild(retry);
      root.appendChild(banner);
    }
    const toggleRow = el('div', 'hub-toggle');
    const toggleCopy = el('div', null, 'Penemuan konektor otonom. Rategoan boleh memilih alat yang sesuai saat Anda bertanya.');
    const toggle = el('button', 'hub-switch' + (state.autonomous_discovery ? ' on' : ''));
    toggle.type = 'button';
    toggle.setAttribute('role', 'switch');
    toggle.setAttribute('aria-checked', String(!!state.autonomous_discovery));
    toggle.textContent = state.autonomous_discovery ? 'Nyala' : 'Mati';
    toggle.onclick = () => {
      connectorState.setDiscovery(!connectorState.read().autonomous_discovery);
      this.paint(root);
    };
    toggleRow.appendChild(toggleCopy);
    toggleRow.appendChild(toggle);
    root.appendChild(toggleRow);
    const searchWrap = el('div', 'hub-search-box');
    const search = document.createElement('input');
    search.className = 'hub-search-input';
    search.type = 'search';
    search.placeholder = 'Cari konektor atau alat';
    search.oninput = () => this.paintLists(root, search.value);
    const searchIco = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    searchIco.setAttribute('viewBox', '0 0 24 24');
    searchIco.setAttribute('width', '18');
    searchIco.setAttribute('height', '18');
    searchIco.setAttribute('fill', 'none');
    searchIco.setAttribute('stroke', 'currentColor');
    searchIco.setAttribute('stroke-width', '2');
    searchIco.innerHTML = '<circle cx="11" cy="11" r="7"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>';
    searchWrap.appendChild(searchIco);
    searchWrap.appendChild(search);
    root.appendChild(searchWrap);
    const lists = el('div', 'hub-lists');
    root.appendChild(lists);
    this.paintLists(root, '');
  },
  paintLists(root, query) {
    const lists = root.querySelector('.hub-lists');
    if (!lists) return;
    const state = connectorState.read();
    const q = String(query || '').trim().toLowerCase();
    lists.innerHTML = '';
    const connected = [];
    const featured = [];
    ORDER.forEach((id) => {
      const svc = state.services[id];
      if (!svc) return;
      const blob = (svc.display_name + ' ' + (COPY[id] || '')).toLowerCase();
      if (q && blob.indexOf(q) < 0) return;
      if (svc.connected) connected.push(id);
      else featured.push(id);
    });
    const addGroup = (title, ids) => {
      if (!ids.length) return;
      lists.appendChild(el('h2', 'hub-kicker', title));
      const group = el('div', 'hub-group');
      ids.forEach((id) => group.appendChild(this.card(root, id, state.services[id])));
      lists.appendChild(group);
    };
    addGroup('Terhubung', connected);
    addGroup('Unggulan', featured);
    if (!connected.length && !featured.length) lists.appendChild(el('p', 'hub-note', 'Tidak ada konektor yang cocok.'));
  },
  card(root, id, svc) {
    const card = el('div', 'hub-card');
    const mark = el('span', 'hub-mark');
    mark.innerHTML = ICONS[id] || '';
    const body = el('span', 'hub-card-body');
    const name = el('strong', 'hub-card-name', svc.display_name);
    const badge = el('span', 'hub-badge', String(svc.tools_count) + ' alat');
    const line = el('span', 'hub-card-title');
    line.appendChild(name);
    line.appendChild(badge);
    if (svc.connected) line.appendChild(el('span', 'hub-connected-badge', 'Hidup'));
    const desc = el('span', 'hub-card-desc', COPY[id] || '');
    const account = svc.account_email || svc.account_username;
    if (account) desc.textContent = desc.textContent + ' · ' + account;
    body.appendChild(line);
    body.appendChild(desc);
    const side = el('span', 'hub-card-side');
    if (svc.system_native) {
      side.appendChild(el('span', 'hub-tag-builtin', 'Bawaan'));
    } else if (svc.connected) {
      const manage = el('button', 'hub-btn-manage', 'Kelola');
      manage.type = 'button';
      manage.onclick = (event) => {
        event.stopPropagation();
        this.openExplorer(root, id);
      };
      const cut = el('button', 'hub-btn-disconnect', 'Putuskan');
      cut.type = 'button';
      cut.onclick = (event) => {
        event.stopPropagation();
        connectorState.disconnect(id);
        toast.show(svc.display_name + ' diputus.');
        this.paint(root);
      };
      side.appendChild(manage);
      side.appendChild(cut);
    } else {
      const connect = el('button', 'hub-btn-connect', 'Hubungkan');
      connect.type = 'button';
      connect.onclick = (event) => {
        event.stopPropagation();
        startOAuth(id);
      };
      side.appendChild(connect);
      if (id === 'github' || id === 'google_drive') {
        const tokenBtn = el('button', 'hub-btn-token', 'Token');
        tokenBtn.type = 'button';
        tokenBtn.onclick = (event) => {
          event.stopPropagation();
          this.askToken(root, id);
        };
        side.appendChild(tokenBtn);
      }
    }
    card.appendChild(mark);
    card.appendChild(body);
    card.appendChild(side);
    card.onclick = () => {
      if (!svc.connected && !svc.system_native) {
        startOAuth(id);
        return;
      }
      this.openExplorer(root, id);
    };
    return card;
  },
  askToken(root, id) {
    const old = document.getElementById('pat-modal');
    if (old) old.remove();
    const modal = document.createElement('div');
    modal.id = 'pat-modal';
    modal.className = 'app-modal';
    const card = document.createElement('form');
    card.className = 'app-modal-card';
    const title = document.createElement('h2');
    title.textContent = id === 'github' ? 'Token GitHub' : 'Token Google Drive';
    const note = document.createElement('p');
    note.textContent = 'Tempel token akses. Token diuji langsung ke layanan itu, lalu disimpan terenkripsi di perangkat ini.';
    const input = document.createElement('input');
    input.type = 'password';
    input.autocomplete = 'off';
    input.placeholder = id === 'github' ? 'github_pat_…' : 'ya29.…';
    const repo = document.createElement('input');
    repo.autocomplete = 'off';
    repo.placeholder = 'pemilik/repo';
    if (id === 'github') repo.value = ((connectorState.read().services.github || {}).repo) || '';
    const actions = document.createElement('div');
    actions.className = 'app-modal-actions';
    const cancel = document.createElement('button');
    cancel.type = 'button';
    cancel.textContent = 'Batal';
    const save = document.createElement('button');
    save.type = 'submit';
    save.textContent = 'Uji dan simpan';
    actions.appendChild(cancel);
    actions.appendChild(save);
    card.appendChild(title);
    card.appendChild(note);
    card.appendChild(input);
    if (id === 'github') card.appendChild(repo);
    card.appendChild(actions);
    modal.appendChild(card);
    cancel.onclick = () => modal.remove();
    card.onsubmit = async (event) => {
      event.preventDefault();
      const token = input.value.trim();
      if (!token) return;
      save.disabled = true;
      try {
        const account = await verifyToken(id, token);
        connectorState.markConnected(id, { access_token: token, account, expiresIn: 60 * 60 * 24 * 30 });
        if (id === 'github') {
          const state = connectorState.read();
          state.services.github.repo = repo.value.trim();
          connectorState.write(state);
        }
        toast.show(account ? ('Terhubung: ' + account) : 'Token diterima');
        modal.remove();
        this.paint(root);
      } catch (e) {
        toast.show(e && e.message ? e.message : 'Token ditolak');
        save.disabled = false;
      }
    };
    document.body.appendChild(modal);
    input.focus();
  },
  openExplorer(root, id) {
    mountExplorer(root, id, () => this.paint(root));
  },
};

export function bindConnectorReturn() {
  if (connectorState.absorbReturn()) {
    const root = $('connect-hub');
    if (root) connectorHub.mount(root);
  }
}
