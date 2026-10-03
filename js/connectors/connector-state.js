const KEY = 'rategoan_connectors_state';

const CATALOG = {
  google_drive: { display_name: 'Google Drive Workspace', tools_count: 11, scopes: ['drive'] },
  github: { display_name: 'GitHub Developer', tools_count: 45, scopes: ['repo', 'read:user'], auth_type: 'oauth' },
  gmail: { display_name: 'Gmail Assistant', tools_count: 30, scopes: ['gmail.modify'] },
  google_calendar: { display_name: 'Google Calendar', tools_count: 6, scopes: ['calendar'] },
  web_search_reader: { display_name: 'Web Search & Reader', tools_count: 4, system_native: true, connected: true },
  local_sandbox: { display_name: 'Sandbox Komputer & Kode', tools_count: 5, system_native: true, connected: true },
};

function blank() {
  const services = {};
  Object.keys(CATALOG).forEach((id) => {
    const meta = CATALOG[id];
    services[id] = {
      connected: !!meta.connected,
      display_name: meta.display_name,
      tools_count: meta.tools_count,
      scopes: meta.scopes || [],
      system_native: !!meta.system_native,
      reconnect_required: false,
      auth_type: meta.auth_type || 'oauth',
    };
  });
  return { version: '1.0', autonomous_discovery: true, services };
}

function freshen(state) {
  const now = Date.now();
  Object.keys(state.services || {}).forEach((id) => {
    const svc = state.services[id];
    if (!svc || svc.system_native) return;
    if (svc.connected && svc.token_expires_at && svc.token_expires_at < now) {
      svc.connected = false;
      svc.reconnect_required = true;
    }
  });
  return state;
}

function read() {
  const base = blank();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return base;
    const parsed = JSON.parse(raw);
    const services = Object.assign({}, base.services, parsed.services || {});
    Object.keys(base.services).forEach((id) => {
      services[id] = Object.assign({}, base.services[id], services[id] || {});
      services[id].tools_count = base.services[id].tools_count;
      services[id].display_name = base.services[id].display_name;
      if (base.services[id].system_native) {
        services[id].connected = true;
        services[id].system_native = true;
      }
    });
    return freshen({
      version: '1.0',
      autonomous_discovery: parsed.autonomous_discovery !== false,
      services,
    });
  } catch (e) {
    return base;
  }
}

function write(state) {
  localStorage.setItem(KEY, JSON.stringify(state));
  return state;
}

export const connectorState = {
  KEY,
  read,
  write,
  token(id) {
    const svc = read().services[id];
    return (svc && svc.access_token) || '';
  },
  setDiscovery(on) {
    const state = read();
    state.autonomous_discovery = !!on;
    return write(state);
  },
  markConnected(id, info) {
    const state = read();
    const svc = state.services[id];
    if (!svc || svc.system_native) return state;
    const expiresIn = Number(info.expiresIn || 3600);
    svc.connected = true;
    svc.reconnect_required = false;
    svc.access_token = info.access_token || '';
    svc.token_expires_at = Date.now() + expiresIn * 1000;
    if (id === 'github') svc.account_username = info.account || svc.account_username || '';
    else svc.account_email = info.account || svc.account_email || '';
    return write(state);
  },
  disconnect(id) {
    const state = read();
    const svc = state.services[id];
    if (!svc || svc.system_native) return state;
    svc.connected = false;
    svc.access_token = '';
    svc.reconnect_required = false;
    svc.token_expires_at = 0;
    return write(state);
  },
  absorbReturn() {
    const params = new URLSearchParams(location.search);
    const token = params.get('access_token');
    const service = params.get('connector');
    if (!token || !service) return false;
    this.markConnected(service, {
      access_token: token,
      account: params.get('account') || '',
      expiresIn: Number(params.get('expires_in') || 3600),
    });
    params.delete('access_token');
    params.delete('connector');
    params.delete('expires_in');
    params.delete('account');
    const next = location.pathname + (params.toString() ? '?' + params.toString() : '') + location.hash;
    history.replaceState(null, '', next);
    return true;
  },
};
