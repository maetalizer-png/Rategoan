export async function backupToDrive(token, files, fetchImpl) {
  const fetchFn = fetchImpl || fetch;
  if (!token) return { ok: false, reason: 'token', id: '' };
  const payload = JSON.stringify(files || {});
  const meta = {
    name: 'studio-rategoan.json',
    mimeType: 'application/json',
  };
  const boundary = 'rategoan8';
  const body = '--' + boundary + '\r\n'
    + 'Content-Type: application/json; charset=UTF-8\r\n\r\n'
    + JSON.stringify(meta) + '\r\n--' + boundary + '\r\n'
    + 'Content-Type: application/json\r\n\r\n'
    + payload + '\r\n--' + boundary + '--';
  const res = await fetchFn('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
    method: 'POST',
    headers: {
      authorization: 'Bearer ' + token,
      'content-type': 'multipart/related; boundary=' + boundary,
    },
    body,
  });
  if (!res.ok) return { ok: false, reason: 'api', id: '' };
  const saved = await res.json();
  return { ok: true, reason: '', id: saved.id || '' };
}
