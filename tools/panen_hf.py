"""Panen dataset Bahasa Indonesia via HuggingFace, dua metode per sumber.

Dijalankan lewat GitHub Actions (.github/workflows/panen.yml, trigger
workflow_dispatch - "Tab Actions -> panen -> Run workflow"). Token
`GITHUB_TOKEN` datang otomatis dari secrets.GITHUB_TOKEN bawaan Actions
(bukan PAT manual) - workflow sudah diberi izin `contents: write` supaya
token itu boleh membuat Release + upload asset. `HF_TOKEN` opsional (secret
terpisah) hanya dipakai untuk dataset gated seperti OSCAR - tanpa token itu
dataset gated dilewati dengan peringatan, bukan error keras.

Dua metode panen per sumber (field `metode` di WHITELIST_MODE_B):
- "file": daftar file repo HF lewat HfApi.list_repo_files, saring nama file
  yang cocok kode bahasa, unduh satu-satu lewat hf_hub_download, parse
  isinya (jsonl/jsonl.gz/json.gz/parquet/txt/txt.gz semua didukung). Dipakai
  untuk dataset yang loading-script Python-nya sudah tidak didukung lagi
  oleh `datasets>=4` (mis. MADLAD-400) - `datasets` versi baru menghapus
  total mekanisme loading-script, jadi baca file mentah langsung adalah
  satu-satunya jalan, bukan cuma fallback kalau streaming "rapuh".
- "stream": `datasets.load_dataset(..., streaming=True)` biasa, untuk
  dataset yang memang Parquet-native (tidak butuh loading-script).

Cuma dataset aggregator, TIDAK ada crawl situs. Hasil di-upload ke tag
Release STAGING `panen-<dataset>` - BUKAN tag kanonik
`korpus-<kategori>-bersih`. Masuk korpus training resmi tetap butuh review
manual sesuai PRD-DATA-RELEASE.md Sec5.
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
HF_TOKEN = os.environ.get("HF_TOKEN") or None
MODE_PANEN = os.environ.get("RAGET_MODE_PANEN", "SEMUA") or "SEMUA"

BASE_MAKS_DOKUMEN_PER_DATASET = int(os.environ.get("RAGET_MAKS_DOKUMEN", "200000"))
BASE_MAKS_MENIT_PER_DATASET = int(os.environ.get("RAGET_MAKS_MENIT", "60"))
PENGALI_LUMBUNG_UTAMA = 3  # MADLAD-400 id dapat anggaran 3x dataset lain

WORK_DIR = os.environ.get("RAGET_PANEN_WORK_DIR", "/tmp/panen_hf")

API = "https://api.github.com/repos/{}/{}".format(OWNER, REPO)

EXT_DIDUKUNG = (".jsonl.gz", ".jsonl", ".json.gz", ".parquet", ".txt.gz", ".txt")

# MADLAD-400: repo HF-nya masih pakai loading-script Python (madlad-400.py).
# datasets>=4 MENGHAPUS TOTAL dukungan loading-script (bukan sekadar
# menggerbanginya di belakang trust_remote_code) - jadi satu-satunya cara
# yang benar-benar bekerja adalah baca file data mentah langsung lewat
# huggingface_hub (metode "file"), bukan datasets.load_dataset().
#
# OSCAR-2301 gated di HF (butuh akun + terima ToS + HF_TOKEN) - tetap
# didaftarkan supaya otomatis jalan begitu HF_TOKEN dengan ToS diterima
# ditambahkan, tapi dilewati bersih (bukan gagal) tanpa token.
#
# Indo4B (indobenchmark/indo4b) diganti wikimedia/wikipedia config id -
# id HF Indo4B yang lama TIDAK ADA di Hub (dibuktikan run Actions #1:
# "doesn't exist on the Hub or cannot be accessed"). wikimedia/wikipedia
# adalah repo Parquet-native resmi HF/Wikimedia, non-gated, definitif ada.
WHITELIST_MODE_B = [
    dict(slug="madlad400-id", nama="MADLAD-400 id (lumbung utama)", hf_id="allenai/madlad-400",
         metode="file", lang_code="id", lisensi="CC-BY-4.0", lumbung_utama=True, gated=False),
    dict(slug="oscar-id", nama="OSCAR id", hf_id="oscar-corpus/OSCAR-2301",
         metode="stream", config="id", split="train", field_text="text",
         lisensi="CC-BY-SA-4.0", lumbung_utama=False, gated=True),
    dict(slug="wikipedia-id", nama="Wikipedia id (pengganti Indo4B - id lama tidak ada di Hub)",
         hf_id="wikimedia/wikipedia", metode="stream", config="20231101.id", split="train",
         field_text="text", lisensi="CC-BY-SA-3.0", lumbung_utama=False, gated=False),
]

STOPWORD_ID = set("""
yang dan di ke dari ini itu tidak dengan untuk pada akan adalah dalam oleh
sebagai juga atau karena namun sudah telah bisa dapat para lebih tersebut
tahun kata orang jika saat setelah sebelum antara tentang seperti bagi
""".split())

_ws_re = re.compile(r"[ \t ]+")
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


def _open_maybe_gzip(path):
    if path.endswith(".gz"):
        return gzip.open(path, "rt", encoding="utf-8", errors="ignore")
    return open(path, "r", encoding="utf-8", errors="ignore")


def iter_records_from_file(path):
    """Hasilkan teks mentah per dokumen dari satu file yang sudah diunduh.
    Mendukung jsonl/jsonl.gz/json.gz (satu record JSON per baris - field
    text/content/raw_content diambil), parquet (kolom text/content/
    raw_content/document), dan txt/txt.gz (satu baris = satu dokumen,
    fallback kalau bukan JSONL)."""
    lower = path.lower()
    if lower.endswith(".parquet"):
        import pyarrow.parquet as pq

        table = pq.read_table(path)
        kolom_teks = next((c for c in ("text", "content", "raw_content", "document") if c in table.column_names), None)
        if kolom_teks is None:
            return
        for value in table.column(kolom_teks):
            v = value.as_py()
            if v:
                yield v
        return

    try:
        with _open_maybe_gzip(path) as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                try:
                    rec = json.loads(line)
                except json.JSONDecodeError:
                    yield line  # bukan JSONL - anggap teks polos per baris
                    continue
                if isinstance(rec, dict):
                    teks = rec.get("text") or rec.get("content") or rec.get("raw_content") or ""
                    if teks:
                        yield teks
                elif isinstance(rec, str):
                    yield rec
    except UnicodeDecodeError:
        return


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


def _terima_dokumen(mentah, hasil, dilihat_hash, batas_dokumen, penghitung):
    """True kalau sudah mentok batas_dokumen (caller harus berhenti)."""
    if len(hasil) >= batas_dokumen:
        return True
    mentah = (mentah or "").strip()
    if len(mentah) < 200:
        return False
    teks = bersihkan_teks(mentah)
    if len(teks) < 200:
        return False
    if not cukup_indonesia(teks):
        penghitung["bahasa"] += 1
        return False
    h = hash_dedup(teks)
    if h in dilihat_hash:
        penghitung["duplikat"] += 1
        return False
    dilihat_hash.add(h)
    hasil.append({"teks": teks, "hash": h})
    return len(hasil) >= batas_dokumen


def panen_dataset_stream(d, laporan_sumber):
    slug = d["slug"]
    if d.get("gated") and not HF_TOKEN:
        print("- LEWATI (gated, HF_TOKEN tidak diset):", d["nama"])
        laporan_sumber[slug] = {"nama": d["nama"], "status": "dilewati (gated, tanpa HF_TOKEN)", "dokumen": 0}
        return []

    batas_dokumen = BASE_MAKS_DOKUMEN_PER_DATASET * (PENGALI_LUMBUNG_UTAMA if d["lumbung_utama"] else 1)
    batas_menit = BASE_MAKS_MENIT_PER_DATASET * (PENGALI_LUMBUNG_UTAMA if d["lumbung_utama"] else 1)

    progres = muat_progres(slug, {"offset": 0, "diambil": 0, "ringkasan": ""})
    offset = progres["offset"]
    diambil_total_akumulasi = progres["diambil"]

    try:
        ds = load_dataset(d["hf_id"], d["config"], split=d["split"], streaming=True,
                           token=HF_TOKEN if d.get("gated") else None)
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
    penghitung = {"bahasa": 0, "duplikat": 0}
    t_mulai = time.time()

    for contoh in ds:
        offset += 1
        mentah = contoh.get(d["field_text"]) or ""
        habis = _terima_dokumen(mentah, hasil, dilihat_hash, batas_dokumen, penghitung)
        if len(hasil) % 2000 == 0 and hasil:
            simpan_progres(slug, {"offset": offset, "diambil": diambil_total_akumulasi + len(hasil),
                                   "ringkasan": "{} dokumen terkumpul".format(diambil_total_akumulasi + len(hasil))})
        if habis or (time.time() - t_mulai) / 60.0 >= batas_menit:
            break

    simpan_progres(slug, {"offset": offset, "diambil": diambil_total_akumulasi + len(hasil),
                           "ringkasan": "{} dokumen terkumpul (sesi ini selesai)".format(diambil_total_akumulasi + len(hasil))})
    laporan_sumber[slug] = {
        "nama": d["nama"], "status": "selesai", "dokumenSesiIni": len(hasil),
        "totalAkumulasi": diambil_total_akumulasi + len(hasil),
        "dibuangBukanIndonesia": penghitung["bahasa"], "dibuangDuplikat": penghitung["duplikat"],
        "detikDipakai": round(time.time() - t_mulai, 1),
    }
    print("- {}: {} dokumen sesi ini (total akumulasi {}), buang {} non-Indonesia + {} duplikat, {:.0f}s".format(
        d["nama"], len(hasil), diambil_total_akumulasi + len(hasil), penghitung["bahasa"], penghitung["duplikat"], time.time() - t_mulai))
    return [{"text": h["teks"], "source": d["nama"], "url": "hf://" + d["hf_id"], "license": d["lisensi"], "lang": "id"} for h in hasil]


def panen_dataset_file(d, laporan_sumber):
    slug = d["slug"]
    from huggingface_hub import HfApi, hf_hub_download

    token = HF_TOKEN if d.get("gated") else None
    api = HfApi(token=token)
    print("  [{}] memanggil list_repo_files (bisa lambat untuk repo besar tanpa HF_TOKEN)...".format(slug))
    t_list = time.time()
    try:
        semua_file = api.list_repo_files(d["hf_id"], repo_type="dataset")
    except Exception as e:
        print("- GAGAL list file dataset", d["nama"], "(", d["hf_id"], "):", e)
        laporan_sumber[slug] = {"nama": d["nama"], "status": "gagal list file: " + str(e)[:200], "dokumen": 0}
        return []
    print("  [{}] list_repo_files selesai ({:.1f}s)".format(slug, time.time() - t_list))

    lang_code = d.get("lang_code", "id")
    pola = re.compile(r"(^|[/_.\-])" + re.escape(lang_code) + r"([/_.\-]|$)", re.I)
    kandidat = sorted(f for f in semua_file if f.lower().endswith(EXT_DIDUKUNG) and pola.search(f))
    print("  total file di repo:", len(semua_file), '| cocok pola bahasa "{}":'.format(lang_code), len(kandidat))
    if not kandidat:
        print("  tidak ada file cocok - contoh 5 nama file pertama untuk debug:", semua_file[:5])
        laporan_sumber[slug] = {"nama": d["nama"], "status": "tidak ada file cocok pola bahasa di repo", "dokumen": 0}
        return []

    batas_dokumen = BASE_MAKS_DOKUMEN_PER_DATASET * (PENGALI_LUMBUNG_UTAMA if d["lumbung_utama"] else 1)
    batas_menit = BASE_MAKS_MENIT_PER_DATASET * (PENGALI_LUMBUNG_UTAMA if d["lumbung_utama"] else 1)

    progres = muat_progres(slug, {"fileSelesai": [], "diambil": 0, "ringkasan": ""})
    sudah = set(progres.get("fileSelesai", []))
    diambil_total_akumulasi = progres.get("diambil", 0)

    hasil = []
    dilihat_hash = set()
    penghitung = {"bahasa": 0, "duplikat": 0}
    file_selesai_sesi = list(sudah)
    t_mulai = time.time()

    for fname in kandidat:
        if fname in sudah:
            continue
        if len(hasil) >= batas_dokumen or (time.time() - t_mulai) / 60.0 >= batas_menit:
            break
        print("  [{}] unduh file {} ...".format(slug, fname))
        t_file = time.time()
        try:
            local_path = hf_hub_download(d["hf_id"], fname, repo_type="dataset", token=token)
        except Exception as e:
            print("  gagal unduh file", fname, ":", e)
            continue
        ukuran_mb = os.path.getsize(local_path) / (1024 * 1024)
        print("  [{}] {} terunduh ({:.1f} MB, {:.1f}s) - parsing...".format(slug, fname, ukuran_mb, time.time() - t_file))
        for mentah in iter_records_from_file(local_path):
            if _terima_dokumen(mentah, hasil, dilihat_hash, batas_dokumen, penghitung):
                break
        print("  [{}] {} selesai diparsing - {} dokumen terkumpul sejauh ini ({:.1f}s total file ini)".format(
            slug, fname, len(hasil), time.time() - t_file))
        file_selesai_sesi.append(fname)
        if hasil and len(hasil) % 2000 == 0:
            simpan_progres(slug, {"fileSelesai": file_selesai_sesi, "diambil": diambil_total_akumulasi + len(hasil),
                                   "ringkasan": "{} dokumen terkumpul".format(diambil_total_akumulasi + len(hasil))})
        if (time.time() - t_mulai) / 60.0 >= batas_menit:
            break

    simpan_progres(slug, {"fileSelesai": file_selesai_sesi, "diambil": diambil_total_akumulasi + len(hasil),
                           "ringkasan": "{} dokumen terkumpul (sesi ini selesai)".format(diambil_total_akumulasi + len(hasil))})
    laporan_sumber[slug] = {
        "nama": d["nama"], "status": "selesai", "dokumenSesiIni": len(hasil),
        "totalAkumulasi": diambil_total_akumulasi + len(hasil), "fileDiprosesSesiIni": len(file_selesai_sesi) - len(sudah),
        "dibuangBukanIndonesia": penghitung["bahasa"], "dibuangDuplikat": penghitung["duplikat"],
        "detikDipakai": round(time.time() - t_mulai, 1),
    }
    print("- {}: {} dokumen sesi ini (total akumulasi {}), {} file diproses, buang {} non-Indonesia + {} duplikat, {:.0f}s".format(
        d["nama"], len(hasil), diambil_total_akumulasi + len(hasil), len(file_selesai_sesi) - len(sudah),
        penghitung["bahasa"], penghitung["duplikat"], time.time() - t_mulai))
    return [{"text": h["teks"], "source": d["nama"], "url": "hf://" + d["hf_id"], "license": d["lisensi"], "lang": "id"} for h in hasil]


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
        "metode": d["metode"],
        "lisensi": d["lisensi"],
        "generatedAt": datetime.datetime.utcnow().strftime("%Y-%m-%d"),
        "totalDokumenSesiIni": len(records),
        "totalKataApprox": sum(len(r["text"].split()) for r in records),
        "format": "jsonl.gz",
        "fields": ["text", "source", "license", "url", "lang"],
        "komposisiBahasa": komposisi_bahasa(records),
        "sha256": sha256_file(path_gz) if records else None,
        "dedup": "hash SHA1 per-teks dalam sesi ini (lintas-sesi lewat resume berbasis offset/file, bukan hash persist)",
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
            pilihan = ", ".join(["SEMUA"] + [d["slug"] for d in WHITELIST_MODE_B])
            print('RAGET_MODE_PANEN "{}" tidak dikenal. Pilihan: {}.'.format(MODE_PANEN, pilihan))
            sys.exit(1)

    print("=== Panen dataset: {} ===".format([d["slug"] for d in daftar]))
    laporan_sumber = {}
    for d in daftar:
        fn = panen_dataset_file if d["metode"] == "file" else panen_dataset_stream
        records = fn(d, laporan_sumber)
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
