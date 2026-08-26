#!/usr/bin/env python3
"""Kebijakan Gudang Besar (Round 9): checkpoint >100MB tidak boleh masuk
git, harus dipublikasikan sebagai GitHub Release asset.

Segel PRD §8: SHA256 dihitung dari FILE FINAL yang di-upload.
Setelah upload, digest GitHub dibanding hash lokal; gak cocok = asset
dihapus dan publish DIBLOKIR.

Pakai:
  export GITHUB_TOKEN=ghp_xxx
  python3 raget-tools/publish-checkpoint-release.py \
      <path/ke/checkpoint.safetensors> <tag_name> [judul] [deskripsi]
"""
import hashlib
import json
import os
import sys
import urllib.request
import urllib.error

OWNER = 'maetalizer-png'
REPO = 'Rategoan'
API = 'https://api.github.com/repos/{}/{}'.format(OWNER, REPO)


def sha256_file(path):
    h = hashlib.sha256()
    with open(path, 'rb') as f:
        while True:
            chunk = f.read(1024 * 1024)
            if not chunk:
                break
            h.update(chunk)
    return h.hexdigest()


def api(method, path, token, body=None, headers=None):
    url = path if path.startswith('http') else API + path
    h = {'Authorization': 'Bearer ' + token, 'Accept': 'application/vnd.github+json'}
    h.update(headers or {})
    data = json.dumps(body).encode('utf-8') if body is not None else None
    if data is not None:
        h['Content-Type'] = 'application/json'
    req = urllib.request.Request(url, data=data, headers=h, method=method)
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            return resp.status, json.loads(resp.read() or b'{}')
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read() or b'{}')


def main():
    if len(sys.argv) < 3:
        raise SystemExit('Pakai: publish-checkpoint-release.py <checkpoint.safetensors> <tag_name> [judul] [deskripsi]')
    ckpt_path = sys.argv[1]
    tag = sys.argv[2]
    title = sys.argv[3] if len(sys.argv) > 3 else tag
    body_text = sys.argv[4] if len(sys.argv) > 4 else 'Checkpoint neural (>100MB, di luar git per kebijakan Gudang Besar).'
    token = os.environ.get('GITHUB_TOKEN')
    if not token:
        raise SystemExit('GITHUB_TOKEN belum di-set di environment.')
    if not os.path.exists(ckpt_path):
        raise SystemExit('File tidak ditemukan: ' + ckpt_path)

    size = os.path.getsize(ckpt_path)
    name = os.path.basename(ckpt_path)
    local_sha = sha256_file(ckpt_path)
    print('File:', ckpt_path, '-', round(size / 1024 / 1024, 2), 'MB')
    print('sha256(file final):', local_sha)

    status, release = api('GET', '/releases/tags/' + tag, token)
    if status == 404:
        print('Release', tag, 'belum ada, membuat baru...')
        status, release = api('POST', '/releases', token, {'tag_name': tag, 'name': title, 'body': body_text, 'draft': False, 'prerelease': False})
        if status not in (200, 201):
            raise SystemExit('Gagal membuat release: ' + json.dumps(release))
    elif status != 200:
        raise SystemExit('Gagal cek release: ' + json.dumps(release))
    else:
        print('Release', tag, 'sudah ada, dipakai ulang.')

    existing = next((a for a in release.get('assets', []) if a['name'] == name), None)
    if existing:
        print('Asset', name, 'sudah ada (id', existing['id'], ') - menghapus dulu untuk upload ulang...')
        del_status, _ = api('DELETE', '/releases/assets/{}'.format(existing['id']), token)
        if del_status not in (200, 204):
            raise SystemExit('Gagal hapus asset lama, status ' + str(del_status))
        status, release = api('GET', '/releases/' + str(release['id']), token)

    upload_url = release['upload_url'].split('{')[0] + '?name=' + name
    with open(ckpt_path, 'rb') as f:
        data = f.read()
    req = urllib.request.Request(
        upload_url, data=data, method='POST',
        headers={'Authorization': 'Bearer ' + token, 'Content-Type': 'application/octet-stream', 'Accept': 'application/vnd.github+json'},
    )
    with urllib.request.urlopen(req, timeout=1800) as resp:
        result = json.loads(resp.read())
    digest = (result.get('digest') or '')
    gh_hex = digest.split(':', 1)[1].lower() if digest.startswith('sha256:') else digest.lower()
    print('GitHub digest:', digest or '(kosong)')
    if gh_hex and gh_hex != local_sha:
        print('SEGEL GAGAL — hapus asset, publish diblokir.', file=sys.stderr)
        api('DELETE', '/releases/assets/{}'.format(result['id']), token)
        raise SystemExit(2)
    print('Upload selesai:', result.get('browser_download_url'))
    print('PUBLISH OK — segel cocok.')


if __name__ == '__main__':
    main()
