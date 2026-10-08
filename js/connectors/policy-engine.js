function levelOf(name) {
  const key = String(name || '').toLowerCase();
  if (/delet|reset|destroy|revoke|hapus/.test(key)) return 5;
  if (/github|drive|gmail|fetch|network|http|push/.test(key)) return 4;
  if (/write|edit|stage|commit|vfs/.test(key)) return 3;
  if (/draft/.test(key)) return 2;
  if (/read|get|list|grep/.test(key)) return 1;
  return 0;
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
    return { name: String(name || ''), level, args: payload };
  }
}
