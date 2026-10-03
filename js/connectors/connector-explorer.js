import { connectorState } from './connector-state.js';
import { emitConnector } from './connector-events.js';
import { runConnectorTool } from './tool-card.js';

function field(label, id) {
  const wrap = document.createElement('label');
  wrap.className = 'hub-field';
  const span = document.createElement('span');
  span.textContent = label;
  const input = document.createElement('input');
  input.id = id;
  input.type = 'text';
  input.autocomplete = 'off';
  wrap.appendChild(span);
  wrap.appendChild(input);
  return wrap;
}

function button(label, onClick) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'hub-action';
  btn.textContent = label;
  btn.onclick = onClick;
  return btn;
}

export function mountExplorer(root, serviceId, onBack) {
  root.innerHTML = '';
  const bar = document.createElement('div');
  bar.className = 'hub-explore-bar';
  const back = button('Kembali', onBack);
  const title = document.createElement('strong');
  const svc = connectorState.read().services[serviceId] || {};
  title.textContent = svc.display_name || serviceId;
  bar.appendChild(back);
  bar.appendChild(title);
  root.appendChild(bar);
  const out = document.createElement('pre');
  out.className = 'hub-log';
  const show = (value) => {
    out.textContent = typeof value === 'string' ? value : JSON.stringify(value, null, 2).slice(0, 8000);
  };
  async function run(name, parameters) {
    show('Menelusuri…');
    const result = await runConnectorTool(name, parameters);
    show(result.data || result);
    if (result.error === 'belum_terhubung') emitConnector('rategoan:reconnect-required', { service: serviceId });
  }
  if (serviceId === 'google_drive') {
    root.appendChild(field('Kueri berkas', 'hub-q'));
    root.appendChild(button('Cari berkas', () => run('drive_search_files', { query: root.querySelector('#hub-q').value })));
    root.appendChild(button('Isi folder root', () => run('drive_list_children', { folder_id: 'root' })));
  } else if (serviceId === 'github') {
    root.appendChild(field('Pemilik', 'hub-owner'));
    root.appendChild(field('Repositori', 'hub-repo'));
    root.appendChild(button('Baca repo', () => run('github_get_repo', {
      owner: root.querySelector('#hub-owner').value.trim(),
      repo: root.querySelector('#hub-repo').value.trim(),
    })));
    root.appendChild(button('Daftar repo saya', () => run('github_list_repos', { per_page: 20 })));
  } else if (serviceId === 'gmail') {
    root.appendChild(field('Kueri inbox', 'hub-q'));
    root.appendChild(button('Cari thread', () => run('gmail_search_threads', { q: root.querySelector('#hub-q').value })));
  } else if (serviceId === 'google_calendar') {
    root.appendChild(button('Agenda mendatang', () => run('calendar_list_events', { maxResults: 10, singleEvents: true, orderBy: 'startTime', timeMin: new Date().toISOString() })));
    root.appendChild(button('Cari slot kosong', () => run('calendar_suggest_time', {})));
  } else if (serviceId === 'web_search_reader') {
    root.appendChild(field('Kueri web', 'hub-q'));
    root.appendChild(button('Cari', () => run('web_search', { q: root.querySelector('#hub-q').value })));
  } else {
    const note = document.createElement('p');
    note.className = 'hub-note';
    note.textContent = 'Sandbox berjalan di Studio kode pada perangkat ini. Tidak ada panggilan server.';
    root.appendChild(note);
  }
  const attach = button('Sematkan ke chat', () => {
    const text = out.textContent || '';
    if (!text) return;
    emitConnector('rategoan:attach-context', { service: serviceId, text: text.slice(0, 4000) });
  });
  root.appendChild(attach);
  root.appendChild(out);
}
