#!/usr/bin/env python3
"""Publish korpus ke GitHub Release — pipa bersegel (PRD §8).

SHA256 WAJIB dihitung dari file FINAL yang di-upload (gzip .jsonl.gz),
bukan JSONL mentah sebelum kompresi.

Setelah upload: bandingkan manifest.sha256 vs digest GitHub asset.
Tidak cocok = asset dihapus, publish DIBLOKIR (exit 2).

Pakai:
  export GITHUB_TOKEN=...
  python3 raget/raget-tools/publish-korpus-release.py \\
      --file korpus-ensiklopedia-bersih.jsonl.gz \\
      --tag korpus-ensiklopedia-bersih \\
      --manifest manifest.json
"""
from __future__ import print_function

import argparse
import hashlib
import json
import os
import sys
import urllib.error
import urllib.request

OWNER = "maetalizer-png"
REPO = "Rategoan"
API = "https://api.github.com/repos/{}/{}".format(OWNER, REPO)


def sha256_file(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        while True:
            chunk = f.read(1024 * 1024)
            if not chunk:
                break
            h.update(chunk)
    return h.hexdigest()


def api(method, path, token, body=None, timeout=60):
    url = path if path.startswith("http") else API + path
    headers = {
        "Authorization": "Bearer " + token,
        "Accept": "application/vnd.github+json",
    }
    data = None
    if body is not None:
        data = json.dumps(body).encode("utf-8")
        headers["Content-Type"] = "application/json"
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            raw = resp.read() or b"{}"
            return resp.status, json.loads(raw)
    except urllib.error.HTTPError as e:
        raw = e.read() or b"{}"
        try:
            parsed = json.loads(raw)
        except Exception:
            parsed = {"raw": raw.decode("utf-8", "replace")}
        return e.code, parsed


def delete_asset_named(release, name, token):
    existing = next((a for a in release.get("assets", []) if a["name"] == name), None)
    if not existing:
        return
    st, _ = api("DELETE", "/releases/assets/{}".format(existing["id"]), token)
    if st not in (200, 204):
        raise SystemExit("Gagal hapus asset lama {}: status {}".format(name, st))


def upload_bytes(release, name, data, token, content_type="application/octet-stream"):
    upload_url = release["upload_url"].split("{")[0] + "?name=" + name
    req = urllib.request.Request(
        upload_url,
        data=data,
        method="POST",
        headers={
            "Authorization": "Bearer " + token,
            "Content-Type": content_type,
            "Accept": "application/vnd.github+json",
        },
    )
    with urllib.request.urlopen(req, timeout=1800) as resp:
        return json.loads(resp.read())


def github_digest_hex(asset):
    d = (asset or {}).get("digest") or ""
    if d.startswith("sha256:"):
        return d.split(":", 1)[1].lower()
    return d.lower()


def main():
    p = argparse.ArgumentParser(description="Publish korpus bersegel (PRD §8)")
    p.add_argument("--file", required=True, help="File FINAL .jsonl.gz yang akan di-upload")
    p.add_argument("--tag", required=True, help="Tag kanonik, mis. korpus-ensiklopedia-bersih")
    p.add_argument("--manifest", required=True, help="Path manifest.json (akan diisi sha256 gzip)")
    p.add_argument("--title", default=None)
    p.add_argument("--body", default="Korpus kanonik. Segel SHA256 = gzip final (PRD §8).")
    args = p.parse_args()

    token = os.environ.get("GITHUB_TOKEN")
    if not token:
        raise SystemExit("GITHUB_TOKEN belum di-set.")
    if not os.path.exists(args.file):
        raise SystemExit("File tidak ditemukan: " + args.file)
    if not args.file.endswith(".jsonl.gz") and not args.file.endswith(".gz"):
        print("PERINGATAN: file bukan .gz — SHA tetap dihitung dari file ini apa adanya.", file=sys.stderr)

    local_sha = sha256_file(args.file)
    size = os.path.getsize(args.file)
    print("FINAL file:", args.file)
    print("size:", size)
    print("sha256(gzip final):", local_sha)

    if os.path.exists(args.manifest):
        with open(args.manifest, "r", encoding="utf-8") as f:
            manifest = json.load(f)
    else:
        manifest = {}
    manifest["sha256"] = local_sha
    manifest["sizeByteGz"] = size
    manifest["tag"] = args.tag
    manifest.setdefault("patuhPRD", {})
    manifest["patuhPRD"]["sha256Dari"] = "gzip-final-yang-diupload"
    with open(args.manifest, "w", encoding="utf-8") as f:
        json.dump(manifest, f, ensure_ascii=False, indent=2)
        f.write("\n")
    print("manifest.sha256 ditulis dari gzip final.")

    st, release = api("GET", "/releases/tags/" + args.tag, token)
    if st == 404:
        st, release = api("POST", "/releases", token, {
            "tag_name": args.tag,
            "name": args.title or args.tag,
            "body": args.body,
            "draft": False,
            "prerelease": False,
        })
        if st not in (200, 201):
            raise SystemExit("Gagal buat release: " + json.dumps(release))
    elif st != 200:
        raise SystemExit("Gagal cek release: " + json.dumps(release))

    asset_name = os.path.basename(args.file)
    delete_asset_named(release, asset_name, token)
    delete_asset_named(release, "manifest.json", token)

    # refresh release after deletes
    _, release = api("GET", "/releases/" + str(release["id"]), token)

    with open(args.file, "rb") as f:
        gz_data = f.read()
    uploaded = upload_bytes(release, asset_name, gz_data, token)
    gh_hex = github_digest_hex(uploaded)
    print("GitHub digest:", uploaded.get("digest"))

    if gh_hex and gh_hex != local_sha:
        print("SEGEL GAGAL: manifest/local sha256 != digest GitHub", file=sys.stderr)
        print("  local :", local_sha, file=sys.stderr)
        print("  github:", gh_hex, file=sys.stderr)
        api("DELETE", "/releases/assets/{}".format(uploaded["id"]), token)
        raise SystemExit(2)

    if not gh_hex:
        print("PERINGATAN: GitHub tidak mengembalikan digest — gerbang parsial.", file=sys.stderr)

    with open(args.manifest, "rb") as f:
        man_data = f.read()
    man_up = upload_bytes(release, "manifest.json", man_data, token)
    print("Upload manifest:", man_up.get("browser_download_url"))
    print("PUBLISH OK — segel cocok.")
    print("sha256:", local_sha)


if __name__ == "__main__":
    main()
