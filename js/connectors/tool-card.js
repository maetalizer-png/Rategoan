import { connectorState } from './connector-state.js';
import { emitConnector } from './connector-events.js';
import { isLocalTool, runLocalTool } from './local-tools.js';

const ROUTES = [
  ['drive_', '/api/connectors/drive', 'google_drive'],
  ['github_', '/api/connectors/github', 'github'],
  ['gmail_', '/api/connectors/gmail', 'gmail'],
  ['calendar_', '/api/connectors/calendar', 'google_calendar'],
  ['web_', '/api/connectors/web/search', 'web_search_reader'],
];

const LEVEL3 = {
  drive_delete_file: 1,
  drive_move_file: 1,
  github_commit_changes: 1,
  github_create_pull_request: 1,
  github_merge_pull: 1,
  github_delete_file: 1,
  gmail_send_email: 1,
  gmail_send_draft: 1,
  gmail_trash_message: 1,
  gmail_delete_label: 1,
  gmail_delete_draft: 1,
  gmail_delete_filter: 1,
  calendar_update_event: 1,
};

export function toolRoute(name) {
  const hit = ROUTES.find((row) => name.indexOf(row[0]) === 0);
  return hit ? { url: hit[1], service: hit[2] } : null;
}

export function toolLevel(name) {
  return LEVEL3[name] ? 3 : (name.indexOf('create') >= 0 || name.indexOf('update') >= 0 || name.indexOf('draft') >= 0 ? 2 : 1);
}

export async function runConnectorTool(name, parameters) {
  if (isLocalTool(name)) return runLocalTool(name, parameters);
  const route = toolRoute(name);
  if (!route) return { ok: false, error: 'alat_tidak_dikenal' };
  const headers = { 'content-type': 'application/json' };
  if (route.service !== 'web_search_reader') {
    const token = connectorState.token(route.service);
    if (!token) return { ok: false, error: 'belum_terhubung' };
    headers.authorization = 'Bearer ' + token;
  }
  const res = await fetch(route.url, {
    method: 'POST',
    headers,
    body: JSON.stringify({ name, parameters: parameters || {} }),
  });
  const text = await res.text();
  let data = text;
  try { data = JSON.parse(text); } catch (e) { data = { text }; }
  return { ok: res.ok, status: res.status, data };
}

function summary(name, result) {
  if (!result.ok) return result.error || ('Gagal (' + result.status + ')');
  const data = result.data || {};
  if (Array.isArray(data.files)) return data.files.length + ' berkas ditemukan';
  if (Array.isArray(data.results)) return data.results.length + ' hasil ditemukan';
  if (Array.isArray(data)) return data.length + ' baris';
  if (data.suggestion) return 'Slot kosong: ' + data.suggestion;
  return 'Selesai';
}

export function mountToolCalls(container, tools) {
  (tools || []).forEach((tool) => {
    const card = document.createElement('div');
    card.className = 'tool-card';
    const title = document.createElement('div');
    title.className = 'tool-card-title';
    title.textContent = tool.name;
    const status = document.createElement('div');
    status.className = 'tool-card-status';
    const level = toolLevel(tool.name);
    status.textContent = level === 3 ? 'Menunggu persetujuan' : 'Siap dijalankan';
    const log = document.createElement('pre');
    log.className = 'tool-card-log';
    log.hidden = true;
    const row = document.createElement('div');
    row.className = 'tool-card-actions';
    const run = document.createElement('button');
    run.type = 'button';
    run.textContent = level === 3 ? 'Setujui & Jalankan' : 'Jalankan';
    const cancel = document.createElement('button');
    cancel.type = 'button';
    cancel.textContent = 'Batalkan';
    cancel.hidden = level !== 3;
    cancel.onclick = () => {
      status.textContent = 'Dibatalkan';
      run.disabled = true;
    };
    run.onclick = async () => {
      status.textContent = 'Menjalankan…';
      run.disabled = true;
      try {
        const result = await runConnectorTool(tool.name, tool.parameters);
        status.textContent = summary(tool.name, result);
        log.hidden = false;
        log.textContent = JSON.stringify(result.data, null, 2).slice(0, 4000);
        if (result.error === 'belum_terhubung') {
          emitConnector('rategoan:reconnect-required', { service: (toolRoute(tool.name) || {}).service });
        }
      } catch (e) {
        status.textContent = 'Gagal dijalankan';
        run.disabled = false;
      }
    };
    row.appendChild(cancel);
    row.appendChild(run);
    card.appendChild(title);
    card.appendChild(status);
    card.appendChild(row);
    card.appendChild(log);
    container.appendChild(card);
  });
}
