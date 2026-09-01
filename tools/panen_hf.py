"""Panen dataset Bahasa Indonesia via HuggingFace `datasets` streaming.

Dijalankan lewat GitHub Actions (.github/workflows/panen.yml, trigger
workflow_dispatch - "Tab Actions -> panen -> Run workflow"). Token
`GITHUB_TOKEN` datang otomatis dari secrets.GITHUB_TOKEN bawaan Actions
(bukan PAT manual) - workflow sudah diberi izin `contents: write` supaya
token itu boleh membuat Release + upload asset.

Cuma dataset aggregator (MADLAD-400 id/OSCAR id/Indo4B), TIDAK ada crawl
situs. Hasil di-upload ke tag Release STAGING `panen-<dataset>` - BUKAN
tag kanonik `korpus-<kategori>-bersih`. Masuk korpus training resmi tetap
butuh review manual sesuai PRD-DATA-RELEASE.md Sec5.
"""

import collections
import datetime
import gzip
import hashlib
import json
import os
import re
import sys
import time

import requests
from datasets import load_dataset

OWNER, REPO = os.environ.get("GITHUB_REPOSITORY", "maetalizer-png/Rategoan").split("/")
GITHUB_TOKEN = os.environ.get("GITHUB_TOKEN")
MODE_PANEN = os.environ.get("RAGET_MODE_PANEN", "SEMUA") or "SEMUA"

BASE_MAKS_DOKUMEN_PER_DATASET = int(os.environ.get("RAGET_MAKS_DOKUMEN", "80000"))
BASE_MAKS_MENIT_PER_DATASET = int(os.environ.get("RAGET_MAKS_MENIT", "60"))
PENGALI_LUMBUNG_UTAMA = 3  # MADLAD-400 id dapat anggaran 3x dataset lain

WORK_DIR = os.environ.get("RAGET_PANEN_WORK_DIR", "/tmp/panen_hf")

API = "https://api.github.com/repos/{}/{}".format(OWNER, REPO)

WHITELIST_MODE_B = [
    dict(slug="madlad400-id", nama="MADLAD-400 id (lumbung utama)", hf_id="allenai/madlad-400",
         config="id", split="clean", field_text="text", lisensi="CC-BY-4.0", lumbung_utama=True),
    dict(slug="oscar-id", nama="OSCAR id", hf_id="oscar-corpus/OSCAR-2301",
         config="id", split="train", field_text="text", lisensi="CC-BY-SA-4.0", lumbung_utama=False),
    dict(slug="indo4b", nama="Indo4B", hf_id="indobenchmark/indo4b",
         config=None, split="train", field_text="text", lisensi="CC0", lumbung_utama=False),
]

STOPWORD_ID = set("""
yang dan di ke dari ini itu tidak dengan untuk pada akan adalah dalam oleh
sebagai juga atau karena namun sudah telah bisa dapat para lebih tersebut
tahun kata orang jika saat setelah sebelum antara tentang seperti bagi
""".split())

_ws_re = re.compile(r"[ \t ]+")
_ctrl_re = re.compile(r"[\x00-\x08\x0b\x0c\x0e-\x1f]")


def rasio_stopword_id(teks):
    kata = re.findall(r"[a-zA-Z]+", teks.lower())
    if len(kata) < 20:
        return 0.0
    cocok = sum(1 for k in kata if k in STOPWORD_ID)
    return cocok / len(kata)


def cukup_indonesia(teks, ambang=0.06):
    """Pengaman fallback (PRD Sec1.1 poin 5) - dihitung dari field text yang
    SUDAH diekstrak, bukan dari label dataset yang belum tentu akurat."""
    return rasio_stopword_id(teks) >= ambang


def bersihkan_teks(teks):
    teks = _ctrl_re.sub("", teks)
    teks = _ws_re.sub(" ", teks)
    baris = [b.strip() for b in teks.split("\n")]
    baris = [b for b in baris if b]
    return "\n".join(baris).strip()


def hash_dedup(teks):
    return hashlib.sha1(teks.strip().lower().encode("utf-8")).hexdigest()


def _api(method, path, body=None, timeout=60):
    url = path if path.startswith("http") else API + path
    headers = {"Authorization": "Bearer " + GITHUB_TOKEN, "Accept": "application/vnd.github+json"}
    if body is not None:
        resp = requests.request(method, url, headers=headers, json=body, timeout=timeout)
    else:
        resp = requests.request(method, url, headers=headers, timeout=timeout)
    try:
        parsed = resp.json()
    except ValueError:
        parsed = {"raw": resp.text}
    return resp.status_code, parsed


def get_or_create_release(tag, title=None, body="Panen dataset staging - lihat manifest.json. BUKAN tag kanonik."):
    st, rel = _api("GET", "/releases/tags/" + tag)
    if st == 404:
        st, rel = _api("POST", "/releases", {
            "tag_name": tag, "name": title or tag, "body": body, "draft": False, "prerelease": False,
        })
        if st not in (200, 201):
            raise RuntimeError("Gagal buat release {}: {}".format(tag, rel))
    elif st != 200:
        raise RuntimeError("Gagal cek release {}: {}".format(tag, rel))
    return rel


def unduh_asset(tag, nama_asset, tujuan_lokal):
    st, rel = _api("GET", "/releases/tags/" + tag)
    if st != 200:
        return False
    asset = next((a for a in rel.get("assets", []) if a["name"] == nama_asset), None)
    if not asset:
        return False
    headers = {"Authorization": "Bearer " + GITHUB_TOKEN, "Accept": "application/octet-stream"}
    try:
        resp = requests.get(asset["url"], headers=headers, timeout=120)
        resp.raise_for_status()
        with open(tujuan_lokal, "wb") as f:
            f.write(resp.content)
        return True
    except Exception as e:
        print("  gagal unduh asset resume", nama_asset, ":", e)
        return False


def unggah_asset(tag, nama_asset, path_lokal, title=None):
    rel = get_or_create_release(tag, title=title)
    existing = next((a for a in rel.get("assets", []) if a["name"] == nama_asset), None)
    if existing:
        _api("DELETE", "/releases/assets/{}".format(existing["id"]))
        _, rel = _api("GET", "/releases/" + str(rel["id"]))
    upload_url = rel["upload_url"].split("{")[0]
    headers = {"Authorization": "Bearer " + GITHUB_TOKEN, "Content-Type": "application/octet-stream"}
    with open(path_lokal, "rb") as f:
        resp = requests.post(upload_url, headers=headers, params={"name": nama_asset}, data=f, timeout=1800)
    resp.raise_for_status()
    return resp.json()


def muat_progres(slug, default):
    tag = "panen-" + slug
    lokal = os.path.join(WORK_DIR, "_progres_{}.json".format(slug))
    if unduh_asset(tag, "progress.json", lokal):
        try:
            with open(lokal, encoding="utf-8") as f:
                progres = json.load(f)
            print("  resume:", slug, "-", progres.get("ringkasan", "progres sebelumnya ditemukan"))
            return progres
        except Exception:
            pass
    return default


def simpan_progres(slug, progres):
    tag = "panen-" + slug
    lokal = os.path.join(WORK_DIR, "_progres_{}.json".format(slug))
    with open(lokal, "w", encoding="utf-8") as f:
        json.dump(progres, f, ensure_ascii=False)
    try:
        unggah_asset(tag, "progress.json", lokal)
    except Exception as e:
        print("  peringatan: gagal unggah progress.json ke", tag, ":", e)


def panen_dataset(d, laporan_sumber):
    slug = d["slug"]
    batas_dokumen = BASE_MAKS_DOKUMEN_PER_DATASET * (PENGALI_LUMBUNG_UTAMA if d["lumbung_utama"] else 1)
    batas_menit = BASE_MAKS_MENIT_PER_DATASET * (PENGALI_LUMBUNG_UTAMA if d["lumbung_utama"] else 1)

    progres = muat_progres(slug, {"offset": 0, "diambil": 0, "ringkasan": ""})
    offset = progres["offset"]
    diambil_total_akumulasi = progres["diambil"]

    try:
        ds = load_dataset(d["hf_id"], d["config"], split=d["split"], streaming=True)
    except Exception as e:
        print("- GAGAL memuat dataset", d["nama"], "(", d["hf_id"], "):", e)
        print("  Kemungkinan id/config HF berubah - cek https://huggingface.co/datasets/" + d["hf_id"])
        print("  LEWATI dataset ini, lanjut ke dataset berikutnya.")
        laporan_sumber[slug] = {"nama": d["nama"], "status": "gagal dimuat: " + str(e)[:200], "dokumen": 0}
        return []

    if offset:
        ds = ds.skip(offset)

    hasil = []
    dilihat_hash = set()
    dibuang_bahasa = 0
    dibuang_duplikat = 0
    t_mulai = time.time()

    for contoh in ds:
        if len(hasil) >= batas_dokumen:
            break
        if (time.time() - t_mulai) / 60.0 >= batas_menit:
            break
        mentah = (contoh.get(d["field_text"]) or "").strip()
        offset += 1
        if len(mentah) < 200:
            continue
        teks = bersihkan_teks(mentah)
        if len(teks) < 200:
            continue
        if not cukup_indonesia(teks):
            dibuang_bahasa += 1
            continue
        h = hash_dedup(teks)
        if h in dilihat_hash:
            dibuang_duplikat += 1
            continue
        dilihat_hash.add(h)
        hasil.append({"text": teks, "source": d["nama"], "url": "hf://" + d["hf_id"], "license": d["lisensi"], "lang": "id"})
        if len(hasil) % 2000 == 0:
            simpan_progres(slug, {"offset": offset, "diambil": diambil_total_akumulasi + len(hasil),
                                   "ringkasan": "{} dokumen terkumpul".format(diambil_total_akumulasi + len(hasil))})

    simpan_progres(slug, {"offset": offset, "diambil": diambil_total_akumulasi + len(hasil),
                           "ringkasan": "{} dokumen terkumpul (sesi ini selesai)".format(diambil_total_akumulasi + len(hasil))})
    laporan_sumber[slug] = {
        "nama": d["nama"], "status": "selesai", "dokumenSesiIni": len(hasil),
        "totalAkumulasi": diambil_total_akumulasi + len(hasil),
        "dibuangBukanIndonesia": dibuang_bahasa, "dibuangDuplikat": dibuang_duplikat,
        "detikDipakai": round(time.time() - t_mulai, 1),
    }
    print("- {}: {} dokumen sesi ini (total akumulasi {}), buang {} non-Indonesia + {} duplikat, {:.0f}s".format(
        d["nama"], len(hasil), diambil_total_akumulasi + len(hasil), dibuang_bahasa, dibuang_duplikat, time.time() - t_mulai))
    return hasil


def tulis_jsonl_gz(path, records):
    with gzip.open(path, "wt", encoding="utf-8") as f:
        for r in records:
            f.write(json.dumps(r, ensure_ascii=False) + "\n")


def sha256_file(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        while True:
            chunk = f.read(1024 * 1024)
            if not chunk:
                break
            h.update(chunk)
    return h.hexdigest()


def komposisi_bahasa(records):
    c = collections.Counter(r.get("lang", "id") for r in records)
    total = sum(c.values()) or 1
    return {k: round(v / total, 4) for k, v in c.items()}


def buat_manifest(d, records):
    slug = d["slug"]
    path_gz = os.path.join(WORK_DIR, "{}.jsonl.gz".format(slug))
    tulis_jsonl_gz(path_gz, records)
    manifest = {
        "tag": "panen-" + slug,
        "status": "STAGING - belum masuk korpus kanonik, wajib review manual (PRD Sec5)",
        "sumberHuggingFace": d["hf_id"],
        "lisensi": d["lisensi"],
        "generatedAt": datetime.datetime.utcnow().strftime("%Y-%m-%d"),
        "totalDokumenSesiIni": len(records),
        "totalKataApprox": sum(len(r["text"].split()) for r in records),
        "format": "jsonl.gz",
        "fields": ["text", "source", "license", "url", "lang"],
        "komposisiBahasa": komposisi_bahasa(records),
        "sha256": sha256_file(path_gz) if records else None,
        "dedup": "hash SHA1 per-teks dalam sesi ini (lintas-sesi lewat offset resume, bukan hash persist)",
    }
    path_manifest = os.path.join(WORK_DIR, "manifest-{}.json".format(slug))
    with open(path_manifest, "w", encoding="utf-8") as f:
        json.dump(manifest, f, ensure_ascii=False, indent=2)
    return path_gz, path_manifest, manifest


def main():
    if not GITHUB_TOKEN:
        print("GITHUB_TOKEN tidak diset (harus lewat env, dari secrets.GITHUB_TOKEN di workflow).")
        sys.exit(1)

    os.makedirs(WORK_DIR, exist_ok=True)

    daftar = WHITELIST_MODE_B
    if MODE_PANEN != "SEMUA":
        daftar = [d for d in WHITELIST_MODE_B if d["slug"] == MODE_PANEN]
        if not daftar:
            print('RAGET_MODE_PANEN "{}" tidak dikenal. Pilihan: SEMUA, madlad400-id, oscar-id, indo4b.'.format(MODE_PANEN))
            sys.exit(1)

    print("=== Panen dataset: {} ===".format([d["slug"] for d in daftar]))
    laporan_sumber = {}
    for d in daftar:
        records = panen_dataset(d, laporan_sumber)
        if not records:
            continue
        path_gz, path_manifest, manifest = buat_manifest(d, records)
        print(d["slug"] + ":", manifest["totalDokumenSesiIni"], "dokumen ->", path_gz)

        tag = "panen-" + d["slug"]
        judul = "Panen Dataset - {} ({} dokumen sesi ini)".format(d["slug"], manifest["totalDokumenSesiIni"])
        print("Upload ke tag", tag, "...")
        up_gz = unggah_asset(tag, os.path.basename(path_gz), path_gz, title=judul)
        print("  data:", up_gz.get("browser_download_url"))
        up_man = unggah_asset(tag, os.path.basename(path_manifest), path_manifest, title=judul)
        print("  manifest:", up_man.get("browser_download_url"))

    print()
    print(json.dumps({"modePanen": MODE_PANEN, "dataset": laporan_sumber}, ensure_ascii=False, indent=2))
    print()
    print("SELESAI. Semua tag panen-* adalah STAGING, bukan korpus-<kategori>-bersih kanonik.")
    print("Masuk korpus training resmi tetap butuh review manual (dedupe lintas-file + klasifikasi")
    print("kategori K1/K2/K3) sesuai PRD-DATA-RELEASE.md Sec5.")


if __name__ == "__main__":
    main()
