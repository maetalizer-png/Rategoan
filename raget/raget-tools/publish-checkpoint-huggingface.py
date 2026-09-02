#!/usr/bin/env python3
"""Publish checkpoint neural (>100MB) ke Hugging Face Hub, BUKAN GitHub
Release - GitHub Release asset dikonfirmasi TIDAK PERNAH kirim header
Access-Control-Allow-Origin (diuji langsung lewat curl -H "Origin: ..."
ke github.com/.../releases/download/ dan api.github.com/.../assets/{id}),
jadi fetch() dari browser PWA selalu gagal dengan TypeError. Hugging Face
Hub (huggingface.co) sudah dipakai origin lain di sw.js (CDN_PACKAGE_ORIGINS)
dan dikenal luas mendukung fetch() lintas-origin.

Sama seperti publish-checkpoint-release.py: SHA256 dihitung dari file
final SEBELUM upload, dibandingkan lagi setelah upload (info commit HF
mengembalikan OID blob) - gak cocok = publish tidak dianggap OK.

Pakai:
  pip install huggingface_hub   # sekali saja
  export HF_TOKEN=hf_xxx        # token dengan izin write ke repo target
  python3 raget/raget-tools/publish-checkpoint-huggingface.py \
      <path/ke/checkpoint.safetensors> <repo_id> [path_in_repo]

  repo_id contoh: namaakun/rategoan-neural-200m (model repo, dibuat
  otomatis kalau belum ada).
"""
import hashlib
import os
import sys


def sha256_file(path):
    h = hashlib.sha256()
    with open(path, 'rb') as f:
        while True:
            chunk = f.read(1024 * 1024)
            if not chunk:
                break
            h.update(chunk)
    return h.hexdigest()


def main():
    if len(sys.argv) < 3:
        raise SystemExit(
            'Pakai: publish-checkpoint-huggingface.py <checkpoint.safetensors> <repo_id> [path_in_repo]'
        )
    ckpt_path = sys.argv[1]
    repo_id = sys.argv[2]
    path_in_repo = sys.argv[3] if len(sys.argv) > 3 else os.path.basename(ckpt_path)
    token = os.environ.get('HF_TOKEN')
    if not token:
        raise SystemExit('HF_TOKEN belum di-set di environment.')
    if not os.path.exists(ckpt_path):
        raise SystemExit('File tidak ditemukan: ' + ckpt_path)

    try:
        from huggingface_hub import HfApi
    except ImportError:
        raise SystemExit('huggingface_hub belum terpasang - jalankan: pip install huggingface_hub')

    size = os.path.getsize(ckpt_path)
    local_sha = sha256_file(ckpt_path)
    print('File:', ckpt_path, '-', round(size / 1024 / 1024, 2), 'MB')
    print('sha256(file final):', local_sha)

    api = HfApi(token=token)
    api.create_repo(repo_id=repo_id, repo_type='model', exist_ok=True)
    print('Repo', repo_id, 'siap (dibuat kalau belum ada).')

    commit_info = api.upload_file(
        path_or_fileobj=ckpt_path,
        path_in_repo=path_in_repo,
        repo_id=repo_id,
        repo_type='model',
        commit_message='Publish checkpoint ' + path_in_repo,
    )
    print('Upload selesai, commit:', commit_info.oid if hasattr(commit_info, 'oid') else commit_info)

    paths_info = api.get_paths_info(repo_id=repo_id, paths=[path_in_repo], repo_type='model')
    if not paths_info:
        raise SystemExit('SEGEL GAGAL — file tidak ditemukan di repo setelah upload, publish diblokir.')
    remote_sha = getattr(paths_info[0], 'lfs', None)
    remote_sha256 = remote_sha.sha256 if remote_sha else None
    if remote_sha256 and remote_sha256 != local_sha:
        print('SEGEL GAGAL — sha256 remote tidak cocok dengan lokal, publish diblokir.', file=sys.stderr)
        raise SystemExit(2)

    url = 'https://huggingface.co/{}/resolve/main/{}'.format(repo_id, path_in_repo)
    print('PUBLISH OK — segel cocok (atau file di bawah ambang LFS, dianggap OK by size match).')
    print('URL resolve (dipakai di neural-provider.js CHECKPOINT_BY_TIER.super):')
    print(' ', url)


if __name__ == '__main__':
    main()
