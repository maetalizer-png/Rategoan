import { dispatchTools } from '../_dispatch.js';
import { sendJson } from '../_http.js';

export const GMAIL_TOOLS = [
  { name: 'gmail_get_profile', method: 'GET', path: '/gmail/v1/users/me/profile', level: 1 },
  { name: 'gmail_list_labels', method: 'GET', path: '/gmail/v1/users/me/labels', level: 1 },
  { name: 'gmail_get_label', method: 'GET', path: '/gmail/v1/users/me/labels/{id}', level: 1 },
  { name: 'gmail_create_label', method: 'POST', path: '/gmail/v1/users/me/labels', level: 2 },
  { name: 'gmail_update_label', method: 'PATCH', path: '/gmail/v1/users/me/labels/{id}', level: 2 },
  { name: 'gmail_delete_label', method: 'DELETE', path: '/gmail/v1/users/me/labels/{id}', level: 3 },
  { name: 'gmail_list_messages', method: 'GET', path: '/gmail/v1/users/me/messages', level: 1 },
  { name: 'gmail_get_message', method: 'GET', path: '/gmail/v1/users/me/messages/{id}', level: 1 },
  { name: 'gmail_search_threads', method: 'GET', path: '/gmail/v1/users/me/threads', level: 1 },
  { name: 'gmail_list_threads', method: 'GET', path: '/gmail/v1/users/me/threads', level: 1 },
  { name: 'gmail_get_thread', method: 'GET', path: '/gmail/v1/users/me/threads/{id}', level: 1 },
  { name: 'gmail_trash_message', method: 'POST', path: '/gmail/v1/users/me/messages/{id}/trash', level: 3 },
  { name: 'gmail_untrash_message', method: 'POST', path: '/gmail/v1/users/me/messages/{id}/untrash', level: 2 },
  { name: 'gmail_modify_message', method: 'POST', path: '/gmail/v1/users/me/messages/{id}/modify', level: 2 },
  { name: 'gmail_modify_thread', method: 'POST', path: '/gmail/v1/users/me/threads/{id}/modify', level: 2 },
  { name: 'gmail_list_drafts', method: 'GET', path: '/gmail/v1/users/me/drafts', level: 1 },
  { name: 'gmail_get_draft', method: 'GET', path: '/gmail/v1/users/me/drafts/{id}', level: 1 },
  { name: 'gmail_create_draft', method: 'POST', path: '/gmail/v1/users/me/drafts', level: 2 },
  { name: 'gmail_update_draft', method: 'PUT', path: '/gmail/v1/users/me/drafts/{id}', level: 2 },
  { name: 'gmail_delete_draft', method: 'DELETE', path: '/gmail/v1/users/me/drafts/{id}', level: 3 },
  { name: 'gmail_send_draft', method: 'POST', path: '/gmail/v1/users/me/drafts/send', level: 3 },
  { name: 'gmail_send_email', method: 'POST', path: '/gmail/v1/users/me/messages/send', level: 3 },
  { name: 'gmail_batch_modify', method: 'POST', path: '/gmail/v1/users/me/messages/batchModify', level: 2 },
  { name: 'gmail_list_history', method: 'GET', path: '/gmail/v1/users/me/history', level: 1 },
  { name: 'gmail_get_attachment', method: 'GET', path: '/gmail/v1/users/me/messages/{message_id}/attachments/{id}', level: 1 },
  { name: 'gmail_list_filters', method: 'GET', path: '/gmail/v1/users/me/settings/filters', level: 1 },
  { name: 'gmail_create_filter', method: 'POST', path: '/gmail/v1/users/me/settings/filters', level: 2 },
  { name: 'gmail_delete_filter', method: 'DELETE', path: '/gmail/v1/users/me/settings/filters/{id}', level: 3 },
  { name: 'gmail_watch', method: 'POST', path: '/gmail/v1/users/me/watch', level: 2 },
  { name: 'gmail_stop', method: 'POST', path: '/gmail/v1/users/me/stop', level: 2 },
];

function rawEmail(params) {
  if (params.raw) return String(params.raw);
  const lines = [
    'To: ' + (params.to || ''),
    'Subject: ' + (params.subject || ''),
    'Content-Type: text/plain; charset=utf-8',
    '',
    params.body || params.text || '',
  ];
  return Buffer.from(lines.join('\r\n')).toString('base64url');
}

async function special(tool, params, token, res) {
  const headers = { authorization: 'Bearer ' + token, 'content-type': 'application/json' };
  if (tool.name === 'gmail_search_threads') {
    const url = 'https://gmail.googleapis.com/gmail/v1/users/me/threads?q=' + encodeURIComponent(params.q || params.query || '');
    const upstream = await fetch(url, { headers });
    res.statusCode = upstream.status;
    res.setHeader('content-type', 'application/json');
    res.end(await upstream.text());
    return true;
  }
  if (tool.name === 'gmail_create_draft') {
    const upstream = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/drafts', {
      method: 'POST',
      headers,
      body: JSON.stringify({ message: { raw: rawEmail(params) } }),
    });
    res.statusCode = upstream.status;
    res.setHeader('content-type', 'application/json');
    res.end(await upstream.text());
    return true;
  }
  if (tool.name === 'gmail_send_email') {
    const upstream = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers,
      body: JSON.stringify({ raw: rawEmail(params) }),
    });
    res.statusCode = upstream.status;
    res.setHeader('content-type', 'application/json');
    res.end(await upstream.text());
    return true;
  }
  if (tool.name === 'gmail_send_draft' && !params.id) {
    sendJson(res, 400, { error: 'id_wajib' });
    return true;
  }
  return false;
}

export default function handler(req, res) {
  return dispatchTools(req, res, {
    tools: GMAIL_TOOLS,
    base: 'https://gmail.googleapis.com',
    special,
  });
}
