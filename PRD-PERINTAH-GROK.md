# PRD — Perintah untuk Grok: Olah Data Release Terbaru + Bereskan Branch Staging

Status: **SEBAGIAN BESAR SUDAH DIKERJAKAN** (dikonfirmasi Claude
2026-09-01, sesi terpisah, lewat commit nyata + `docs/STATUS-KORPUS-LISENSI.md`
yang ditulis ulang). Bagian A dan B.1-B.4 di bawah **selesai**: sample
review `panen-madlad400-id` selesai (isi web-crawl judi/forex/blog,
di-retire, tidak masuk K1), `staging/korpus-parts` sudah diangkat ke
K1/K3. **Belum dikerjakan**: B.5 (hapus branch `staging/korpus-parts`)
— branch masih ada, sengaja dibiarkan sampai dikonfirmasi eksplisit
tidak ada lagi pekerjaan aktif yang menyentuhnya. Detail lengkap status
terkini + temuan tambahan ada di `PRD-PRODUKSI-READY.md`.

Ditulis oleh Claude setelah audit langsung ke GitHub Release, tag, dan
branch repo ini (2026-09-01). Semua angka di bawah **diverifikasi**,
bukan perkiraan — lihat cara cek di tiap bagian. Dipertahankan sebagai
catatan sejarah tugas, bukan dihapus, karena masih jadi acuan aktif
pihak yang mengerjakannya.

Alasan dokumen ini ditujukan ke **Grok** (bukan dikerjakan Claude sendiri):
sesi sandbox Claude Code Remote tidak diizinkan publish/upload Release
asset maupun push/hapus branch remote secara langsung (lihat
`raget/raget-tools/CHECKPOINT-POLICY.md` dan `PRD-DATA-RELEASE.md` §5).
Semua langkah di sini **wajib mengikuti `PRD-DATA-RELEASE.md`** (kategori,
skema manifest §7, segel SHA256 §8) — dokumen ini cuma daftar tugas
konkret ronde ini, bukan pengganti PRD utama.

---

## Bagian A — Olah data release terbaru (`panen-madlad400-id`)

### A.1 Kondisi terverifikasi (dicek via GitHub API 2026-09-01)

Release **`panen-madlad400-id`** (dipublikasikan otomatis oleh GitHub
Actions `panen.yml`, 2026-09-01T07:25Z):

| Asset | Ukuran | Isi |
|---|---|---|
| `madlad400-id.jsonl.gz` | 206.193.577 byte (~206MB) | 150.000 dokumen diterima (lihat manifest) |
| `manifest-madlad400-id.json` | 647 byte | metadata sesi |
| `progress.json` | 164 byte | state resume: 2 file HF sudah diproses, 300.000 dokumen mentah diambil |

Isi `manifest-madlad400-id.json`:
- `status`: **"STAGING - belum masuk korpus kanonik, wajib review manual (PRD Sec5)"**
- `sumberHuggingFace`: `allenai/madlad-400`, `lisensi`: CC-BY-4.0
- `totalDokumenSesiIni`: 150.000, `totalKataApprox`: 80.077.599
- `sha256`: `5842a933cd741e1b089c4c09237cf972b9e15b63468c4e72f86e8e2face61793` (cocokkan wajib sebelum dipakai)
- **Catatan jujur**: 300.000 dokumen mentah diambil tapi cuma 150.000 diterima
  — sisanya dibuang oleh filter panjang/bahasa/dedup (normal, bukan bug).
- `dedup`: cuma dalam sesi ini (SHA1 per-teks), **belum dedupe lintas-sesi**
  kalau workflow `panen.yml` dijalankan ulang.

Ini adalah asset **tunggal, belum di-part-split** — dibuat SEBELUM
`tools/panen_hf.py` diperbarui (commit `57ae6fd`) untuk memecah file
>1.8GB jadi part. Kalau workflow `panen.yml` dijalankan ulang dengan
budget besar (180 menit, sudah di-set jadi default), asset baru akan
otomatis ter-part-split dan MENGGABUNG (bukan menimpa) hasil sesi ini —
lihat `gabung_dan_upload()` di `tools/panen_hf.py`.

### A.2 Tugas Grok

1. **Unduh + verifikasi** `madlad400-id.jsonl.gz`, cocokkan SHA256 di atas.
2. **Sample-review manual** ±200 baris acak — MADLAD-400 adalah web-crawl
   multibahasa yang difilter otomatis per-bahasa (bukan ensiklopedia
   kurasi manusia seperti Wikipedia), jadi wajib dicek kualitasnya nyata:
   - Apakah isinya benar teks naratif Indonesia yang koheren (bukan
     spam/boilerplate/menu situs/hasil OCR rusak)?
   - Apakah ada campuran bahasa lain yang lolos filter `lang=id`?
3. **Klasifikasi kategori** sesuai `PRD-DATA-RELEASE.md` §1 berdasarkan
   ISI hasil sample-review — kemungkinan besar `ensiklopedia` (narasi
   faktual volume besar) kalau sample bersih, tapi **jangan asumsikan**
   — putuskan dari isi asli, bukan dari nama sumber.
4. **Kalau lolos review** (bersih, bahasa Indonesia asli, bukan spam):
   ikuti `PRD-DATA-RELEASE.md` §5 langkah 6b — unduh pack kanonik
   kategori yang dipilih (`korpus-ensiklopedia-bersih` / K1, atau
   kategori lain sesuai hasil klasifikasi), gabungkan, **dedupe ulang
   lintas-file** (bukan cuma dedupe dalam sesi ini), upload ulang sebagai
   asset baru di tag yang sama, tulis/timpa `manifest-<kategori>.json`
   sesuai skema §7, update `docs/STATUS-KORPUS-LISENSI.md`.
5. **Kalau TIDAK lolos review** (banyak sampah/spam/bahasa campur):
   laporkan temuan jujur (persentase sampah dari sample), JANGAN
   dipromosikan ke kanonik — retire tag `panen-madlad400-id` atau biarkan
   sebagai staging sampai ada perbaikan filter di `tools/panen_hf.py`.
6. Setelah selesai (lolos maupun tidak), **beri tahu dirigen manusia**
   hasilnya (persentase lolos review, keputusan kategori/retire) supaya
   `tools/panen_hf.py` bisa diperbaiki lagi kalau filternya ternyata
   masih longgar.

---

## Bagian B — Branch `staging/korpus-parts`: JANGAN langsung hapus, ada isi berharga belum dipublikasi

### B.1 Kondisi terverifikasi (dicek via `git log`/`git ls-tree` 2026-09-01)

Branch **`origin/staging/korpus-parts`** — 253 commit di belakang `main`,
4 commit di depan `main` (diverge lama, tidak pernah di-merge). Isinya
**BUKAN kode**, murni data yang sengaja dipisah dari `main` (baca
`raget/raget-data/jsonl/external/staging/README.md` di branch itu sendiri
— sudah berisi instruksi + checksum lengkap, tinggal dieksekusi):

| File di branch staging | Ukuran | Status publikasi |
|---|---|---|
| `korpus-jilid1-clean.jsonl.gz.00.part` .. `.04.part` (5 bagian, gabung jadi 1 file ~470MB) | ~470MB total | **BELUM** ada di tag `korpus-jilid-1-clean` — dicek via `get_release_by_tag`: tag ini **404, tidak punya Release/asset sama sekali**, cuma tag git kosong |
| `korpus-jilid3-clean.jsonl.gz` | 13.264.843 byte | **BELUM** dipublikasikan (tag `korpus-jilid-3-clean` tidak ada) |
| `korpus-jilid4-clean.jsonl.gz` | 15.840.292 byte | **BELUM** dipublikasikan (tag `korpus-jilid-4-clean` tidak ada) |
| `korpus-jilid5-clean.jsonl.gz` | 2.907.630 byte | **BELUM** dipublikasikan (tag `korpus-jilid-5-clean` tidak ada) |
| `raget-neural-massive200m.safetensors.part.00/.01` | ~171MB total | **REDUNDAN** — checkpoint 200M SUDAH ada di Release resmi tag `checkpoint-200m` (dicek: ada, published). Versi git-part di branch ini dari alur lama SEBELUM kebijakan "checkpoint >95MB wajib Release asset, bukan git" berlaku — **jangan di-merge ke manapun**, aman diabaikan. |

Menurut `raget/raget-data/jsonl/external/korpus-manifest-total.json` di
`main`, jilid 1 (versi Round 10, diregenerasi dari nol) bernilai
**~307 juta token**, jilid 3 **~9,1 juta**, jilid 4 **~11,8 juta**, jilid 5
**~1,5 juta** (kolom `tokenWindow126`, window 126 token) — total **~329
juta token korpus bersih, sudah di-checksum, siap publikasi, tapi
cuma ada satu-satunya di branch orphan ini.** Kalau branch ini dihapus
sebelum diekstrak, data itu hilang (masih ada di reflog/riwayat commit
untuk sementara, tapi tidak dijamin bertahan).

### B.2 Tugas Grok (URUTAN WAJIB — jangan lompat ke langkah hapus)

1. **Checkout branch staging**, ikuti PERSIS instruksi + checksum di
   `raget/raget-data/jsonl/external/staging/README.md` (sudah ada di
   branch itu, termasuk perintah `cat` untuk menggabung 5 part jilid 1
   dan tabel SHA256 tiap file — jangan tulis ulang, verifikasi checksum
   HARUS cocok sebelum lanjut).
2. **Publikasikan** ke Release pakai
   `raget-tools/publish-checkpoint-release.py` (generik, idempoten,
   perintah persisnya sudah ada di README branch staging):
   - Jilid 1 → cek dulu apakah kontennya tumpang tindih/superset dari
     data yang SUDAH ada di tag kanonik `korpus-ensiklopedia-bersih`
     (K1) saat ini. Kalau jilid 1 Round 10 ini lebih lengkap/baru →
     ikuti PRD-DATA-RELEASE.md §5 langkah 6c (gantikan, tag sama K1).
     Kalau ternyata sudah sepenuhnya tercakup di K1 → **tidak perlu**
     dipublikasi ulang, cukup dicatat di laporan.
   - Jilid 3, 4, 5 → klasifikasikan kategori sesuai isi (kemungkinan
     `pelengkap` per `PRD-DATA-RELEASE.md` §6 tabel migrasi, karena isinya
     wikibooks/wikivoyage/wikisource/wikiquote/wiktionary — bukan
     ensiklopedia volume utama) → gabung ke `korpus-pelengkap-bersih`
     (K3) kalau kategori itu benar, ikuti §5 langkah 6b (unduh K3 yang
     ada, gabung, dedupe ulang, upload asset baru di tag sama K3, JANGAN
     bikin tag baru).
3. **Update** `raget/raget-data/jsonl/external/korpus-manifest-total.json`
   → field `statusArsipBersih` tiap jilid jadi "SUDAH diarsipkan" +
   sebutkan tag/kategori tujuannya, dan update `docs/STATUS-KORPUS-LISENSI.md`.
4. **Verifikasi ulang**: unduh asset yang baru diupload, cocokkan SHA256
   dengan yang tercatat di manifest baru (PRD-DATA-RELEASE.md §8 — tiga
   gerbang wajib, bukan opsional).
5. **BARU SETELAH langkah 1-4 selesai dan diverifikasi**, branch
   `staging/korpus-parts` sudah tidak menyimpan apa pun yang tidak ada
   di tempat lain (data sudah di Release, checkpoint-200m-part sudah
   redundan) — **hapus branch ini** (`git push origin --delete
   staging/korpus-parts` + hapus ref lokal kalau ada). Jangan hapus
   sebelum langkah 1-4 selesai — itu satu-satunya salinan ~329 juta
   token korpus bersih yang belum dipublikasikan.

---

## Ringkasan checklist untuk Grok

- [ ] A: Sample-review `madlad400-id.jsonl.gz` (200 baris), putuskan
      lolos/tidak, publikasikan atau retire sesuai hasil.
- [ ] B1-B4: Ekstrak + publikasikan jilid 1/3/4/5 dari branch staging ke
      Release yang tepat (K1 kalau jilid1 menggantikan, K3/pelengkap
      untuk jilid 3/4/5), update manifest total + STATUS-KORPUS-LISENSI.
- [ ] B5: Hapus `staging/korpus-parts` HANYA setelah B1-B4 terverifikasi.
- [ ] Laporkan hasil ke dirigen manusia (ringkas: apa yang dipublikasi,
      apa yang di-retire, apa yang dihapus).
