import { dispatchTools } from '../_dispatch.js';
import { sendJson } from '../_http.js';

export const DRIVE_TOOLS = [
  { name: 'drive_search_files', method: 'GET', path: '/drive/v3/files', level: 1 },
  { name: 'drive_read_content', method: 'GET', path: '/drive/v3/files/{file_id}', level: 1 },
  { name: 'drive_get_metadata', method: 'GET', path: '/drive/v3/files/{file_id}', level: 1 },
  { name: 'drive_list_children', method: 'GET', path: '/drive/v3/files', level: 1 },
  { name: 'drive_create_file', method: 'POST', path: '/drive/v3/files', level: 2 },
  { name: 'drive_create_folder', method: 'POST', path: '/drive/v3/files', level: 2 },
  { name: 'drive_copy_file', method: 'POST', path: '/drive/v3/files/{file_id}/copy', level: 2 },
  { name: 'drive_export_file', method: 'GET', path: '/drive/v3/files/{file_id}/export', level: 1 },
  { name: 'drive_update_file', method: 'PATCH', path: '/drive/v3/files/{file_id}', level: 2 },
  { name: 'drive_move_file', method: 'PATCH', path: '/drive/v3/files/{file_id}', level: 3 },
  { name: 'drive_delete_file', method: 'DELETE', path: '/drive/v3/files/{file_id}', level: 3 },
];

async function googleGet(url, token) {
  const res = await fetch(url, { headers: { authorization: 'Bearer ' + token, accept: 'application/json' } });
  const text = await res.text();
  return { ok: res.ok, status: res.status, text, type: res.headers.get('content-type') || 'application/json' };
}

async function special(tool, params, token, res) {
  if (tool.name === 'drive_search_files') {
    const q = params.q || params.query || '';
    const url = 'https://www.googleapis.com/drive/v3/files?pageSize=20&fields=files(id,name,mimeType,modifiedTime)&q=' + encodeURIComponent(q);
    const upstream = await googleGet(url, token);
    res.statusCode = upstream.status;
    res.setHeader('content-type', upstream.type);
    res.end(upstream.text);
    return true;
  }
  if (tool.name === 'drive_list_children') {
    const parent = params.folder_id || params.parent_id || 'root';
    const q = "'" + parent.replace(/'/g, '') + "' in parents and trashed=false";
    const url = 'https://www.googleapis.com/drive/v3/files?pageSize=40&fields=files(id,name,mimeType)&q=' + encodeURIComponent(q);
    const upstream = await googleGet(url, token);
    res.statusCode = upstream.status;
    res.setHeader('content-type', upstream.type);
    res.end(upstream.text);
    return true;
  }
  if (tool.name === 'drive_read_content') {
    const id = params.file_id || params.id || '';
    const meta = await googleGet('https://www.googleapis.com/drive/v3/files/' + encodeURIComponent(id) + '?fields=mimeType,name', token);
    let mime = '';
    try { mime = JSON.parse(meta.text).mimeType || ''; } catch (e) { mime = ''; }
    const url = mime.indexOf('application/vnd.google-apps.') === 0
      ? 'https://www.googleapis.com/drive/v3/files/' + encodeURIComponent(id) + '/export?mimeType=text/plain'
      : 'https://www.googleapis.com/drive/v3/files/' + encodeURIComponent(id) + '?alt=media';
    const upstream = await googleGet(url, token);
    res.statusCode = upstream.status;
    res.setHeader('content-type', upstream.type);
    res.end(upstream.text);
    return true;
  }
  if (tool.name === 'drive_create_folder') {
    const upstream = await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: { authorization: 'Bearer ' + token, 'content-type': 'application/json' },
      body: JSON.stringify({
        name: params.name || 'Folder baru',
        mimeType: 'application/vnd.google-apps.folder',
        parents: params.parent_id ? [params.parent_id] : undefined,
      }),
    });
    res.statusCode = upstream.status;
    res.setHeader('content-type', 'application/json');
    res.end(await upstream.text());
    return true;
  }
  if (tool.name === 'drive_move_file') {
    const id = encodeURIComponent(params.file_id || '');
    const url = 'https://www.googleapis.com/drive/v3/files/' + id + '?addParents=' + encodeURIComponent(params.add_parents || '') + '&removeParents=' + encodeURIComponent(params.remove_parents || '');
    const upstream = await fetch(url, {
      method: 'PATCH',
      headers: { authorization: 'Bearer ' + token, 'content-type': 'application/json' },
      body: JSON.stringify({ name: params.name }),
    });
    res.statusCode = upstream.status;
    res.setHeader('content-type', 'application/json');
    res.end(await upstream.text());
    return true;
  }
  if (!params.file_id && !params.id && tool.path.indexOf('{file_id}') >= 0) {
    sendJson(res, 400, { error: 'file_id_wajib' });
    return true;
  }
  return false;
}

export default function handler(req, res) {
  return dispatchTools(req, res, {
    tools: DRIVE_TOOLS,
    base: 'https://www.googleapis.com',
    special,
  });
}
