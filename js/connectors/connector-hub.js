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

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
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
    const intro = el('p', 'hub-intro', 'Konektor memungkinkan Rategoan memakai alat eksternal dan data Anda untuk membaca, menulis, dan mengelola tugas.');
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
    const search = document.createElement('input');
    search.className = 'hist-search-input';
    search.type = 'search';
    search.placeholder = 'Cari konektor atau alat';
    search.oninput = () => this.paintLists(root, search.value);
    root.appendChild(search);
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
    const mark = el('span', 'hub-mark', (svc.display_name || id).slice(0, 1));
    const body = el('span', 'hub-card-body');
    const name = el('strong', null, svc.display_name);
    const badge = el('span', 'hub-badge', String(svc.tools_count) + ' alat');
    const line = el('span', 'hub-card-title');
    line.appendChild(name);
    line.appendChild(badge);
    const desc = el('span', 'hub-card-desc', COPY[id] || '');
    const account = svc.account_email || svc.account_username;
    if (account) desc.textContent = desc.textContent + ' · ' + account;
    body.appendChild(line);
    body.appendChild(desc);
    const side = el('span', 'hub-card-side');
    if (svc.system_native) side.textContent = 'Bawaan';
    else if (svc.connected) side.textContent = 'Kelola';
    else side.textContent = 'Hubungkan';
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
    if (svc.connected && !svc.system_native) {
      const cut = el('button', 'hub-cut', 'Putuskan');
      cut.type = 'button';
      cut.onclick = (event) => {
        event.stopPropagation();
        connectorState.disconnect(id);
        toast.show(svc.display_name + ' diputus.');
        this.paint(root);
      };
      card.appendChild(cut);
    }
    return card;
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
