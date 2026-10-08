function levelOf(name) {
  const key = String(name || '').toLowerCase();
  if (!key) return 5;
  if (/delet|reset|destroy|revoke|hapus/.test(key)) return 5;
  if (/github|drive|gmail|fetch|network|http|push/.test(key)) return 4;
  if (/write|edit|stage|commit|vfs/.test(key)) return 3;
  if (/draft/.test(key)) return 2;
  if (/read|get|list|grep/.test(key)) return 1;
  if (/info|meta|symbol|catalog|status/.test(key)) return 0;
  return 5;
}

const BANNED = /^(token|access_token|secret|password|authorization|cookie|api_key|apikey|auth)$/i;

const DEFAULT_ALLOW = [
  'per_page', 'page', 'sort', 'direction', 'state', 'q', 'type', 'since', 'until',
  'pageToken', 'fields', 'orderBy', 'query', 'ref', 'sha', 'branch', 'message',
  'content', 'title', 'body', 'name', 'description', 'color', 'public', 'folder_id',
  'file_id', 'parent_id', 'path', 'mimeType', 'parents', 'add_parents', 'remove_parents',
  'alt', 'pageSize', 'base', 'head', 'draft', 'labels', 'assignees',
];

export function filterParams(params, allow, used) {
  const permit = new Set(allow && allow.length ? allow : DEFAULT_ALLOW);
  const skip = used || new Set();
  const kept = {};
  const banned = [];
  Object.keys(params || {}).forEach((key) => {
    if (skip.has(key)) return;
    if (BANNED.test(key)) {
      banned.push(key);
      return;
    }
    if (!permit.has(key)) return;
    kept[key] = params[key];
  });
  return { kept, banned };
}

export class PolicyEngine {
  constructor(opts = {}) {
    this.confirmed = typeof opts.confirmed === 'function' ? opts.confirmed : () => false;
    this.reauth = typeof opts.reauth === 'function' ? opts.reauth : () => false;
  }

  assert(name, args) {
    const level = levelOf(name);
    const payload = args && typeof args === 'object' ? args : {};
    if (level >= 5 && !this.reauth(name, payload)) {
      const err = new Error('Otentikasi ulang diperlukan');
      err.level = level;
      throw err;
    }
    if (level >= 3 && !this.confirmed(name, payload)) {
      const err = new Error('Konfirmasi diff diperlukan');
      err.level = level;
      throw err;
    }
    const screened = filterParams(payload);
    if (screened.banned.length) {
      const err = new Error('parameter_ditolak');
      err.level = level;
      throw err;
    }
    return { name: String(name || ''), level, args: payload };
  }
}
