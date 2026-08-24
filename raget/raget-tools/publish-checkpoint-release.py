#!/usr/bin/env python3
"""Kebijakan Gudang Besar (Round 9): checkpoint >100MB tidak boleh masuk
git, harus dipublikasikan sebagai GitHub Release asset. Sesi sandbox
Claude Code Remote (tempat skrip ini ditulis) TIDAK diizinkan
membuat/mengedit/menghapus Release ("Creating, editing, or deleting
releases is not permitted for this session type" - pembatasan level sesi,
bukan masalah izin repo) - jadi skrip ini harus dijalankan dari tempat
lain yang punya GITHUB_TOKEN dengan scope penuh (repo): notebook Colab
(sudah set GITHUB_TOKEN di sel awal) atau mesin lokal dengan Personal
Access Token (scope `repo`).

Pakai:
  export GITHUB_TOKEN=ghp_xxx
  python3 raget-tools/publish-checkpoint-release.py \
      <path/ke/checkpoint.safetensors> <tag_name> [judul] [deskripsi]

Idempoten: kalau tag Release sudah ada, dipakai ulang (tidak dibuat baru);
kalau asset dengan nama sama sudah ada di tag itu, asset lama dihapus dulu
baru upload ulang (supaya bisa dipakai untuk update checkpoint yang sama).
"""
import json
import os
import sys
import urllib.request
import urllib.error

OWNER = 'maetalizer-png'
REPO = 'Rategoan'
API = 'https://api.github.com/repos/{}/{}'.format(OWNER, REPO)


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
    print('File:', ckpt_path, '-', round(size / 1024 / 1024, 2), 'MB')

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

    upload_url = release['upload_url'].split('{')[0] + '?name=' + name
    with open(ckpt_path, 'rb') as f:
        data = f.read()
    req = urllib.request.Request(
        upload_url, data=data, method='POST',
        headers={'Authorization': 'Bearer ' + token, 'Content-Type': 'application/octet-stream'},
    )
    with urllib.request.urlopen(req, timeout=1800) as resp:
        result = json.loads(resp.read())
    print('Upload selesai:', result.get('browser_download_url'))


if __name__ == '__main__':
    main()
