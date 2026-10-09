import { sha256Sync } from './vfs-git.js';

function wait(ms, hooks) {
  if (hooks && typeof hooks.delay === 'function') return hooks.delay(ms);
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function checksumManifest(files) {
  const names = Object.keys(files || {}).sort();
  return {
    files: names.map((name) => ({ name, sha256: sha256Sync(String(files[name])) })),
  };
}

export async function backupToDrive(token, files, fetchImpl, hooks) {
  const fetchFn = fetchImpl || fetch;
  const notify = hooks && hooks.notify;
  if (!token) {
    if (notify) notify('Google Drive belum tertaut');
    return { ok: false, reason: 'token', id: '' };
  }
  const manifest = checksumManifest(files);
  const payload = JSON.stringify({ files: files || {}, manifest });
  const meta = { name: 'studio-rategoan.json', mimeType: 'application/json' };
  const boundary = 'rategoan9';
  const body = '--' + boundary + '\r\n'
    + 'Content-Type: application/json; charset=UTF-8\r\n\r\n'
    + JSON.stringify(meta) + '\r\n--' + boundary + '\r\n'
    + 'Content-Type: application/json\r\n\r\n'
    + payload + '\r\n--' + boundary + '--';
  let pause = 40;
  let last = { ok: false, reason: 'api', id: '' };
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const res = await fetchFn('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: {
          authorization: 'Bearer ' + token,
          'content-type': 'multipart/related; boundary=' + boundary,
        },
        body,
      });
      if (res && res.ok) {
        const saved = await res.json();
        if (notify) notify('Cadangan Drive tersimpan');
        return { ok: true, reason: '', id: saved.id || '', attempts: attempt + 1 };
      }
      last = { ok: false, reason: 'api', id: '' };
      if (res && res.status && res.status < 500 && res.status !== 429) break;
    } catch (e) {
      last = { ok: false, reason: 'network', id: '' };
    }
    if (attempt < 2) {
      await wait(pause, hooks);
      pause *= 2;
    }
  }
  if (notify) notify('Cadangan Drive gagal');
  return last;
}