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

Output dipecah jadi beberapa file part (`<slug>.part-0000.jsonl.gz`, dst)
kalau satu part mendekati batas ukuran asset Release GitHub (2 GB) - lihat
PenampungHasil/BATAS_BYTE_PER_PART. Tiap kali workflow ini dijalankan lagi,
manifest.json LAMA diunduh dulu dan part baru DITAMBAHKAN ke situ (bukan
menimpa) - supaya berulang kali "Run workflow" benar-benar menumpuk korpus,
bukan menghapus hasil sesi sebelumnya.
"""

import concurrent.futures
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

# Anggaran dipisah eksplisit per peran (bukan pengali implisit) - lumbung
# utama (MADLAD-400) dapat jatah jauh lebih besar karena satu-satunya
# sumber yang terbukti punya puluhan file besar per bahasa (72 file "id"
# ditemukan lewat pengujian nyata), sumber lain (streaming) dibatasi lebih
# ketat karena anggaran waktunya juga dipakai bersama dalam satu job.
BASE_MAKS_DOKUMEN = int(os.environ.get("RAGET_MAKS_DOKUMEN", "2000000"))
BASE_MAKS_MENIT = int(os.environ.get("RAGET_MAKS_MENIT", "60"))
LUMBUNG_MAKS_DOKUMEN = int(os.environ.get("RAGET_MAKS_DOKUMEN_LUMBUNG_UTAMA", "20000000"))
LUMBUNG_MAKS_MENIT = int(os.environ.get("RAGET_MAKS_MENIT_LUMBUNG_UTAMA", "180"))

WORK_DIR = os.environ.get("RAGET_PANEN_WORK_DIR", "/tmp/panen_hf")

API = "https://api.github.com/repos/{}/{}".format(OWNER, REPO)

EXT_DIDUKUNG = (".jsonl.gz", ".jsonl", ".json.gz", ".parquet", ".txt.gz", ".txt")

# Batas GitHub untuk satu asset Release adalah 2 GB - dipakai 1.8 GB supaya
# ada margin aman (flush gzip per 500 dokumen, bukan per byte, jadi bisa
# sedikit lewat dari titik cek terakhir sebelum part ditutup).
BATAS_BYTE_PER_PART = int(1.8 * 1024 ** 3)


def batas_untuk(d):
    """(maks_dokumen, maks_menit) - lumbung utama dapat anggaran sendiri,
    bukan hasil kali dari anggaran dasar (lebih jelas & langsung sesuai
    yang diminta, tidak perlu hitung mental kali 3)."""
    if d["lumbung_utama"]:
        return LUMBUNG_MAKS_DOKUMEN, LUMBUNG_MAKS_MENIT
    return BASE_MAKS_DOKUMEN, BASE_MAKS_MENIT

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


class PenampungHasil:
    """Terima dokumen mentah, bersihkan+filter+dedup, tulis LANGSUNG ke file
    part gzip (bukan ditampung sebagai list Python di RAM - satu sesi bisa
    puluhan juta dokumen untuk lumbung utama, menampungnya semua di memori
    berisiko kehabisan RAM runner Actions). Part baru dibuka otomatis kalau
    part yang sedang ditulis mendekati batas ukuran asset Release GitHub
    (2 GB) - dicek tiap 500 dokumen (bukan tiap dokumen, supaya tidak
    memanggil os.path.getsize terlalu sering)."""

    def __init__(self, slug, meta, part_idx_awal, batas_dokumen):
        self.slug = slug
        self.meta = meta  # {"source", "url", "license"}
        self.batas_dokumen = batas_dokumen
        self.part_idx = part_idx_awal
        self.dilihat_hash = set()
        self.diterima = 0
        self.dibuang_bahasa = 0
        self.dibuang_duplikat = 0
        self.total_kata_approx = 0
        self.parts_selesai = []  # [(path, docCount), ...]
        self.f = None
        self.path = None
        self.docs_in_part = 0
        self._buka_part_baru()

    def _buka_part_baru(self):
        self.path = os.path.join(WORK_DIR, "{}.part-{:04d}.jsonl.gz".format(self.slug, self.part_idx))
        self.f = gzip.open(self.path, "wt", encoding="utf-8")
        self.docs_in_part = 0

    def _tutup_part_sekarang(self):
        self.f.close()
        if self.docs_in_part > 0:
            self.parts_selesai.append((self.path, self.docs_in_part))
        elif os.path.exists(self.path):
            os.remove(self.path)
        self.part_idx += 1

    def terima(self, mentah):
        """True kalau batas_dokumen sesi ini sudah tercapai (caller berhenti)."""
        if self.diterima >= self.batas_dokumen:
            return True
        mentah = (mentah or "").strip()
        if len(mentah) < 200:
            return False
        teks = bersihkan_teks(mentah)
        if len(teks) < 200:
            return False
        if not cukup_indonesia(teks):
            self.dibuang_bahasa += 1
            return False
        h = hash_dedup(teks)
        if h in self.dilihat_hash:
            self.dibuang_duplikat += 1
            return False
        self.dilihat_hash.add(h)
        rec = {"text": teks, "source": self.meta["source"], "url": self.meta["url"],
               "license": self.meta["license"], "lang": "id"}
        self.f.write(json.dumps(rec, ensure_ascii=False) + "\n")
        self.docs_in_part += 1
        self.diterima += 1
        self.total_kata_approx += len(teks.split())
        if self.docs_in_part % 500 == 0:
            self.f.flush()
            if os.path.getsize(self.path) >= BATAS_BYTE_PER_PART:
                self._tutup_part_sekarang()
                self._buka_part_baru()
        return self.diterima >= self.batas_dokumen

    def selesai(self):
        """Tutup part yang masih terbuka, kembalikan daftar (path, docCount)."""
        self._tutup_part_sekarang()
        return self.parts_selesai


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


def panen_dataset_stream(d, laporan_sumber):
    slug = d["slug"]
    if d.get("gated") and not HF_TOKEN:
        print("- LEWATI (gated, HF_TOKEN tidak diset):", d["nama"])
        laporan_sumber[slug] = {"nama": d["nama"], "status": "dilewati (gated, tanpa HF_TOKEN)", "dokumen": 0}
        return None

    batas_dokumen, batas_menit = batas_untuk(d)

    progres = muat_progres(slug, {"offset": 0, "diambil": 0, "nextPartIdx": 0, "ringkasan": ""})
    offset = progres["offset"]
    diambil_total_akumulasi = progres["diambil"]

    try:
        ds = _dengan_batas_waktu(60, load_dataset, d["hf_id"], d["config"], split=d["split"], streaming=True,
                                  token=HF_TOKEN if d.get("gated") else None)
    except concurrent.futures.TimeoutError:
        print("- TIMEOUT memuat dataset", d["nama"], "(", d["hf_id"], ") - lewat 60 detik, dilewati.")
        laporan_sumber[slug] = {"nama": d["nama"], "status": "timeout saat load_dataset", "dokumen": 0}
        return None
    except Exception as e:
        print("- GAGAL memuat dataset", d["nama"], "(", d["hf_id"], "):", e)
        print("  Kemungkinan id/config HF berubah - cek https://huggingface.co/datasets/" + d["hf_id"])
        print("  LEWATI dataset ini, lanjut ke dataset berikutnya.")
        laporan_sumber[slug] = {"nama": d["nama"], "status": "gagal dimuat: " + str(e)[:200], "dokumen": 0}
        return None

    if offset:
        ds = ds.skip(offset)

    meta = {"source": d["nama"], "url": "hf://" + d["hf_id"], "license": d["lisensi"]}
    penampung = PenampungHasil(slug, meta, progres.get("nextPartIdx", 0), batas_dokumen)
    t_mulai = time.time()

    for contoh in ds:
        offset += 1
        mentah = contoh.get(d["field_text"]) or ""
        habis = penampung.terima(mentah)
        if penampung.diterima and penampung.diterima % 2000 == 0:
            simpan_progres(slug, {"offset": offset, "diambil": diambil_total_akumulasi + penampung.diterima,
                                   "nextPartIdx": penampung.part_idx,
                                   "ringkasan": "{} dokumen terkumpul".format(diambil_total_akumulasi + penampung.diterima)})
        if habis or (time.time() - t_mulai) / 60.0 >= batas_menit:
            break

    parts = penampung.selesai()
    simpan_progres(slug, {"offset": offset, "diambil": diambil_total_akumulasi + penampung.diterima,
                           "nextPartIdx": penampung.part_idx,
                           "ringkasan": "{} dokumen terkumpul (sesi ini selesai)".format(diambil_total_akumulasi + penampung.diterima)})
    laporan_sumber[slug] = {
        "nama": d["nama"], "status": "selesai", "dokumenSesiIni": penampung.diterima,
        "totalAkumulasi": diambil_total_akumulasi + penampung.diterima,
        "dibuangBukanIndonesia": penampung.dibuang_bahasa, "dibuangDuplikat": penampung.dibuang_duplikat,
        "detikDipakai": round(time.time() - t_mulai, 1),
    }
    print("- {}: {} dokumen sesi ini (total akumulasi {}), buang {} non-Indonesia + {} duplikat, {:.0f}s".format(
        d["nama"], penampung.diterima, diambil_total_akumulasi + penampung.diterima,
        penampung.dibuang_bahasa, penampung.dibuang_duplikat, time.time() - t_mulai))
    return {"parts": parts, "dokumen": penampung.diterima, "kata": penampung.total_kata_approx}


def _dengan_batas_waktu(batas_detik, fn, *args, **kwargs):
    """Jalankan fn di thread terpisah dan paksa TimeoutError kalau lewat
    batas_detik - HfApi/hf_hub_download tidak punya opsi timeout bawaan
    yang bisa diandalkan untuk repo besar tanpa HF_TOKEN (rate limit publik
    bisa membuat satu request tergantung sangat lama), jadi proses ini
    TIDAK BOLEH menggantung selamanya menunggunya.

    PENTING: TIDAK pakai `with ThreadPoolExecutor()` - __exit__ context
    manager itu memanggil shutdown(wait=True) yang balik menunggu thread
    selesai walau future.result() sudah keburu timeout, jadi batas waktu
    yang dijanjikan tidak pernah benar-benar ditegakkan. shutdown(wait=False)
    di sini membiarkan thread yang lambat itu jalan sendiri di latar
    belakang (tidak bisa dipaksa berhenti dari Python) sementara caller
    tetap lanjut begitu batas_detik habis."""
    ex = concurrent.futures.ThreadPoolExecutor(max_workers=1)
    future = ex.submit(fn, *args, **kwargs)
    try:
        return future.result(timeout=batas_detik)
    finally:
        ex.shutdown(wait=False)


def _daftar_file_repo(api, hf_id, lang_code):
    """Coba jalur murah dulu (list_repo_tree dibatasi ke folder bahasa),
    baru fallback ke list_repo_files (daftar SELURUH repo - bisa sangat
    lambat untuk repo ratusan bahasa seperti MADLAD-400 tanpa HF_TOKEN)."""
    for prefix in ("data/" + lang_code, lang_code):
        try:
            print("  mencoba list_repo_tree(path_in_repo='{}') ...".format(prefix))
            entri = _dengan_batas_waktu(30, lambda: list(api.list_repo_tree(
                hf_id, repo_type="dataset", path_in_repo=prefix, recursive=True)))
            file_di_folder = [e.path for e in entri if getattr(e, "path", None) and "." in e.path.rsplit("/", 1)[-1]]
            if file_di_folder:
                print("  list_repo_tree('{}') sukses: {} file".format(prefix, len(file_di_folder)))
                return file_di_folder
        except Exception as e:
            print("  list_repo_tree('{}') gagal/kosong ({}), coba jalur lain...".format(prefix, str(e)[:150]))

    print("  fallback: list_repo_files SELURUH repo (bisa lambat, batas 90 detik)...")
    return _dengan_batas_waktu(90, api.list_repo_files, hf_id, repo_type="dataset")


def panen_dataset_file(d, laporan_sumber):
    slug = d["slug"]
    from huggingface_hub import HfApi, hf_hub_download

    token = HF_TOKEN if d.get("gated") else None
    api = HfApi(token=token)
    lang_code = d.get("lang_code", "id")
    t_list = time.time()
    try:
        semua_file = _daftar_file_repo(api, d["hf_id"], lang_code)
    except concurrent.futures.TimeoutError:
        print("- TIMEOUT list file dataset", d["nama"], "(", d["hf_id"], ") - lewat batas waktu, dilewati.")
        laporan_sumber[slug] = {"nama": d["nama"], "status": "timeout saat list file repo", "dokumen": 0}
        return []
    except Exception as e:
        print("- GAGAL list file dataset", d["nama"], "(", d["hf_id"], "):", e)
        laporan_sumber[slug] = {"nama": d["nama"], "status": "gagal list file: " + str(e)[:200], "dokumen": 0}
        return []
    print("  [{}] daftar file selesai ({:.1f}s)".format(slug, time.time() - t_list))

    pola = re.compile(r"(^|[/_.\-])" + re.escape(lang_code) + r"([/_.\-]|$)", re.I)
    kandidat = sorted(f for f in semua_file if f.lower().endswith(EXT_DIDUKUNG) and pola.search(f))
    print("  total file ditemukan:", len(semua_file), '| cocok pola bahasa "{}":'.format(lang_code), len(kandidat))
    if not kandidat:
        print("  tidak ada file cocok - contoh 5 nama file pertama untuk debug:", semua_file[:5])
        laporan_sumber[slug] = {"nama": d["nama"], "status": "tidak ada file cocok pola bahasa di repo", "dokumen": 0}
        return []

    batas_dokumen, batas_menit = batas_untuk(d)

    progres = muat_progres(slug, {"fileSelesai": [], "diambil": 0, "nextPartIdx": 0, "ringkasan": ""})
    sudah = set(progres.get("fileSelesai", []))
    diambil_total_akumulasi = progres.get("diambil", 0)

    meta = {"source": d["nama"], "url": "hf://" + d["hf_id"], "license": d["lisensi"]}
    penampung = PenampungHasil(slug, meta, progres.get("nextPartIdx", 0), batas_dokumen)
    file_selesai_sesi = list(sudah)
    t_mulai = time.time()

    for fname in kandidat:
        if fname in sudah:
            continue
        if penampung.diterima >= batas_dokumen or (time.time() - t_mulai) / 60.0 >= batas_menit:
            break
        print("  [{}] unduh file {} ...".format(slug, fname))
        t_file = time.time()
        try:
            local_path = _dengan_batas_waktu(300, hf_hub_download, d["hf_id"], fname, repo_type="dataset", token=token)
        except concurrent.futures.TimeoutError:
            print("  TIMEOUT unduh file (>300s)", fname, "- dilewati")
            continue
        except Exception as e:
            print("  gagal unduh file", fname, ":", e)
            continue
        ukuran_mb = os.path.getsize(local_path) / (1024 * 1024)
        print("  [{}] {} terunduh ({:.1f} MB, {:.1f}s) - parsing...".format(slug, fname, ukuran_mb, time.time() - t_file))
        for mentah in iter_records_from_file(local_path):
            if penampung.terima(mentah):
                break
        os.remove(local_path)  # hemat disk runner - file HF sudah tidak perlu setelah diparsing
        print("  [{}] {} selesai diparsing - {} dokumen terkumpul sejauh ini ({:.1f}s total file ini)".format(
            slug, fname, penampung.diterima, time.time() - t_file))
        file_selesai_sesi.append(fname)
        if penampung.diterima and penampung.diterima % 2000 == 0:
            simpan_progres(slug, {"fileSelesai": file_selesai_sesi, "diambil": diambil_total_akumulasi + penampung.diterima,
                                   "nextPartIdx": penampung.part_idx,
                                   "ringkasan": "{} dokumen terkumpul".format(diambil_total_akumulasi + penampung.diterima)})
        if (time.time() - t_mulai) / 60.0 >= batas_menit:
            break

    parts = penampung.selesai()
    simpan_progres(slug, {"fileSelesai": file_selesai_sesi, "diambil": diambil_total_akumulasi + penampung.diterima,
                           "nextPartIdx": penampung.part_idx,
                           "ringkasan": "{} dokumen terkumpul (sesi ini selesai)".format(diambil_total_akumulasi + penampung.diterima)})
    laporan_sumber[slug] = {
        "nama": d["nama"], "status": "selesai", "dokumenSesiIni": penampung.diterima,
        "totalAkumulasi": diambil_total_akumulasi + penampung.diterima, "fileDiprosesSesiIni": len(file_selesai_sesi) - len(sudah),
        "dibuangBukanIndonesia": penampung.dibuang_bahasa, "dibuangDuplikat": penampung.dibuang_duplikat,
        "detikDipakai": round(time.time() - t_mulai, 1),
    }
    print("- {}: {} dokumen sesi ini (total akumulasi {}), {} file diproses, buang {} non-Indonesia + {} duplikat, {:.0f}s".format(
        d["nama"], penampung.diterima, diambil_total_akumulasi + penampung.diterima, len(file_selesai_sesi) - len(sudah),
        penampung.dibuang_bahasa, penampung.dibuang_duplikat, time.time() - t_mulai))
    return {"parts": parts, "dokumen": penampung.diterima, "kata": penampung.total_kata_approx}


def sha256_file(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        while True:
            chunk = f.read(1024 * 1024)
            if not chunk:
                break
            h.update(chunk)
    return h.hexdigest()


def unduh_manifest_lama(slug):
    """Manifest lama (kalau ada) diunduh dulu supaya part baru sesi ini
    DITAMBAHKAN ke daftar part, bukan menggantikannya - setiap sesi panen
    baru semestinya menambah data, bukan menghapus hasil sesi sebelumnya."""
    tag = "panen-" + slug
    lokal = os.path.join(WORK_DIR, "_manifest_lama_{}.json".format(slug))
    if unduh_asset(tag, "manifest-{}.json".format(slug), lokal):
        try:
            with open(lokal, encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return None


def gabung_dan_upload(d, hasil_sesi):
    """Upload tiap file part sesi ini + manifest.json GABUNGAN (manifest
    lama dari Release + part baru) - supaya berulang kali menjalankan
    workflow ini benar-benar MENAMBAH korpus, bukan menimpa hasil sesi
    sebelumnya (bug yang diperbaiki di ronde ini: versi lama upload cuma
    berisi hasil sesi TERAKHIR, sesi-sesi sebelumnya hilang tertimpa)."""
    slug = d["slug"]
    tag = "panen-" + slug
    parts = hasil_sesi["parts"]
    if not parts:
        print("  tidak ada part baru untuk", slug, "- lewati upload.")
        return

    manifest_lama = unduh_manifest_lama(slug) or {}
    daftar_part = list(manifest_lama.get("parts", []))
    kata_lama = manifest_lama.get("totalKataApprox", 0)

    for path, jumlah_dok in parts:
        nama_asset = os.path.basename(path)
        sha = sha256_file(path)
        ukuran = os.path.getsize(path)
        judul = "Panen Dataset - {} ({})".format(slug, nama_asset)
        print("  upload part {} ({} dokumen, {:.1f} MB) ...".format(nama_asset, jumlah_dok, ukuran / 1024 / 1024))
        up = unggah_asset(tag, nama_asset, path, title=judul)
        print("    ->", up.get("browser_download_url"))
        daftar_part.append({"file": nama_asset, "sha256": sha, "totalDokumen": jumlah_dok, "sizeByte": ukuran})

    manifest = {
        "tag": tag,
        "status": "STAGING - belum masuk korpus kanonik, wajib review manual (PRD Sec5)",
        "sumberHuggingFace": d["hf_id"],
        "metode": d["metode"],
        "lisensi": d["lisensi"],
        "generatedAt": datetime.datetime.utcnow().strftime("%Y-%m-%d"),
        "totalDokumen": sum(p["totalDokumen"] for p in daftar_part),
        "totalKataApprox": kata_lama + hasil_sesi["kata"],
        "format": "jsonl.gz, dipecah per part <= 1.8GB (batas asset Release GitHub 2GB) - lihat 'parts'",
        "fields": ["text", "source", "license", "url", "lang"],
        "komposisiBahasa": {"id": 1.0},
        "jumlahPart": len(daftar_part),
        "parts": daftar_part,
        "dedup": "hash SHA1 per-teks per sesi (bukan lintas-sesi/lintas-part - lihat catatan jujur README)",
    }
    path_manifest = os.path.join(WORK_DIR, "manifest-{}.json".format(slug))
    with open(path_manifest, "w", encoding="utf-8") as f:
        json.dump(manifest, f, ensure_ascii=False, indent=2)
    up_man = unggah_asset(tag, os.path.basename(path_manifest), path_manifest,
                           title="Panen Dataset - {} (manifest gabungan, {} part)".format(slug, len(daftar_part)))
    print("  manifest gabungan ({} part, {} dokumen total):".format(len(daftar_part), manifest["totalDokumen"]),
          up_man.get("browser_download_url"))


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
        hasil_sesi = fn(d, laporan_sumber)
        if not hasil_sesi:
            continue
        print("Upload ke tag panen-{} ...".format(d["slug"]))
        gabung_dan_upload(d, hasil_sesi)

    print()
    print(json.dumps({"modePanen": MODE_PANEN, "dataset": laporan_sumber}, ensure_ascii=False, indent=2))
    print()
    print("SELESAI. Semua tag panen-* adalah STAGING, bukan korpus-<kategori>-bersih kanonik.")
    print("Masuk korpus training resmi tetap butuh review manual (dedupe lintas-file + klasifikasi")
    print("kategori K1/K2/K3) sesuai PRD-DATA-RELEASE.md Sec5.")


if __name__ == "__main__":
    main()
