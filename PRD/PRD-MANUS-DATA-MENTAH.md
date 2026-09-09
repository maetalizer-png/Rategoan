# PRD — Manus: Data Mentah → Korpus Kanonik (GitHub Release)

Dokumen ini untuk **Manus** (agen luar sandbox dengan akses tulis
GitHub Release, sama seperti Grok/dirigen — Claude Code TIDAK bisa
menulis Release, lihat `PRD-RELEASE.md` §0). Aturan teknis lengkap
(taksonomi, penamaan, ukuran, SHA256, skema manifest, rumus mix) ada di
`PRD-RELEASE.md` — dokumen ini **TIDAK mengulang**, cuma memberi
prosedur kerja langsung untuk Manus supaya data mentah yang sudah
ditemukan jadi korpus kanonik, sinkron dengan `kanonik.entries` yang
Claude pakai untuk audit token.

## 1. Sebelum mulai — baca urutan ini

1. `PRD-RELEASE.md` — SATU-SATUNYA aturan teknis (kategori, tag,
   ukuran, SHA256, skema manifest, mix ratio). Wajib, bukan opsional.
2. `raget-data/jsonl/external/korpus-manifest-total.json` — status
   `kanonik.entries` (K1/K2/K3) TERKINI. Ini yang menentukan apa yang
   sudah masuk vs belum.
3. Release aktif saat ini (cek `mcp__github__list_releases` atau API) —
   tag mana yang statusnya masih "penampung"/mentah/belum sort.

## 2. Prosedur per batch data mentah (ulangi untuk SETIAP sumber baru)

```
1. KLASIFIKASI    Data ini masuk kategori mana? (ensiklopedia/dialog/
                   daerah/pelengkap — PRD-RELEASE.md §1). Kalau tidak
                   cocok satu pun, BERHENTI, jangan buat kategori ke-6
                   sendiri — tanya dulu.
2. BERSIHKAN       Extract teks bersih dari format mentah (XML/JSON/
                   parquet/HTML apa pun sumbernya) → JSONL
                   {"text":...,"source":...,"license":...,"lang":...}
3. DEDUPE          Fingerprint/minhash, BUKAN cuma exact-match string.
                   Dedupe LINTAS seluruh data kategori itu (data lama +
                   data baru), bukan cuma di dalam batch baru sendiri.
4. FILTER BAHASA   PRD-RELEASE.md §1.1 — buang non-`id*` sesuai aturan
                   kategori. WAJIB sebelum lanjut, bukan langkah opsional.
5. GABUNG          Kategori sudah punya file kanonik di Release?
                   → unduh file lama, gabung dengan data baru,
                     dedupe ULANG hasil gabungan, siap upload ulang
                     DI TAG YANG SAMA (PRD-RELEASE.md §2 — SATU tag
                     permanen per kategori, tidak ada tag ke-2 untuk
                     kategori yang sama).
                   Kategori belum punya file kanonik?
                   → ini jadi file kanonik pertama kategori itu.
6. TOKENIZE BPE    PRD-RELEASE.md §5b langkah 5-7. PAKAI TOKENIZER
                   YANG SAMA PERSIS (vocab 30.368) — kalau ragu,
                   ekstrak dari checkpoint lewat
                   extract-tokenizer-from-checkpoint.py. JANGAN
                   retrain BPE baru.
7. UKUR            Hitung ulang: totalDokumen, totalKataApprox,
                   totalByte (file gzip FINAL), totalTokenBPEResmi
                   (hasil langkah 6), komposisiBahasa (%).
8. SHA256          Hitung dari file GZIP FINAL yang akan diupload
                   (bukan JSONL mentah). PRD-RELEASE.md §4 Gerbang 1.
9. MANIFEST        Tulis/timpa manifest-<kategori>.json sesuai skema
                   wajib PRD-RELEASE.md §6. SEMUA field wajib terisi —
                   tanpa komposisiBahasa/sha256 = belum patuh PRD.
10. PUBLISH        Upload file + manifest ke tag
                   korpus-<kategori>-bersih (TIMPA asset lama kalau
                   sudah ada, JANGAN buat tag baru). Naikkan
                   manifest.versi. Verifikasi digest GitHub == sha256
                   lokal (PRD-RELEASE.md §4 Gerbang 1b) — tidak cocok,
                   HAPUS asset, ulangi.
11. RETIRE         Kalau data mentah/staging asalnya (tag "penampung"/
                   "belum sort") isinya sudah 100% masuk file kanonik
                   baru, hapus Release staging itu. Jangan biarkan
                   nganggur — setiap tag aktif harus terpetakan jelas
                   ke salah satu dari 5 kategori atau berstatus
                   eksplisit "belum diproses".
```

## 3. Sinkronisasi dengan Claude — WAJIB, ini yang mencegah dua angka "total token" berbeda

Setelah publish (langkah 10 di atas selesai dan digest cocok), kabari
lewat commit/catatan supaya Claude bisa:

1. Update `kanonik.entries` di
   `raget-data/jsonl/external/korpus-manifest-total.json` — tambah
   entry baru atau perbarui entry kategori yang isinya berubah, dengan
   `totalTokenBPEResmi` PERSIS SAMA dengan yang Manus hitung di langkah
   7 (rumus formula sudah identik, PRD-RELEASE.md §5b — tidak ada
   rumus kedua).
2. Jalankan `raget-tools/check-korpus-manifest-sync.mjs` — WAJIB
   sebelum commit. Ini mendeteksi drift antara `kanonik.entries` dan
   `ringkasanTotal` (kejadian nyata 2026-09-09: selisih 71 juta token
   karena satu field lupa diperbarui — lihat PRD-RELEASE.md §5b).
3. Jalankan ulang `raget-tools/audit-corpus-tokens.mjs` (persentase
   kecukupan data terhadap target scaling di PRD-RAGET-NEURAL.md ikut
   terupdate).

**Kalau Manus dan Claude sama-sama menghitung `totalTokenBPEResmi`
untuk kategori yang sama dan angkanya BEDA** — itu tanda salah satu
langkah §2 di atas dilewati atau tokenizer-nya beda. Berhenti, jangan
timpa manifest dengan angka yang belum cocok, cari akar selisihnya
dulu (biasanya: tokenizer beda vocab, atau dedupe belum lintas-file).

## 4. Data mentah yang SUDAH ada di Release hari ini (per pengecekan terakhir)

Status ini berubah tiap Manus publish — anggap sebagai titik awal,
bukan daftar tetap. Cek ulang `mcp__github__list_releases` sebelum
mulai kerja untuk memastikan tidak ada tag baru di luar daftar ini.

| Tag | Status (per body Release) | Langkah berikutnya |
|---|---|---|
| `korpus-sejarah-indonesia-bersih` | "CC-BY-SA. Belum digabung K1." | Gabung ke `korpus-ensiklopedia-bersih` lewat prosedur §2 langkah 5 (kategori sudah punya kanonik → gabung, dedupe ulang, upload ulang di tag K1 yang sama) |
| `korpus-mentah-id` | "Belum sort. CC-BY-SA. Wiki Firecrawl + Wiktionary dump." (3 file: dump daerah mentah, kamus ID, wiki ID mentah) | Proses dari langkah 1 (klasifikasi) — 3 file ini kemungkinan masuk kategori BERBEDA (daerah / dialog atau pelengkap / ensiklopedia), jangan asumsikan satu kategori untuk ketiganya sebelum dicek isinya |

## 5. Supaya tidak terputus — data mentah baru berikutnya

Ini bukan pekerjaan sekali selesai. Setelah batch di §4 tuntas (masuk
kanonik, ter-sinkron dengan Claude via §3), Manus lanjut siklus yang
sama untuk sumber data mentah berikutnya:

1. Cari/temukan sumber data mentah baru (sesuai keputusan produk
   soal sumber mana yang boleh dipakai — Common Crawl/OSCAR ID makin
   relevan karena Wikipedia ID sudah nyaris habis digali, lihat
   `PRD-RAGET-NEURAL.md` §2b — TAPI perlu filter kualitas jauh lebih
   ketat dari preseden gagal `panen-madlad400-id`, 18,7% spam).
2. Ulangi prosedur §2 penuh dari langkah 1 — bukan versi dipersingkat.
3. Ulangi sinkronisasi §3 — setiap batch, bukan ditumpuk lalu
   disinkronkan sekaligus di akhir (supaya `kanonik.entries` selalu
   mencerminkan Release sungguhan, tidak pernah stale berhari-hari).
4. Ulangi §4 (perbarui status tag) setiap kali ada tag baru muncul
   atau tag lama retire.

Tidak ada titik "selesai final" untuk siklus ini — cuma titik "batch
ini sudah kanonik dan tersinkron, lanjut ke sumber berikutnya". Satu
batch = satu pekerjaan tuntas dan akurat (SHA256 cocok, manifest
lengkap, token BPE tersinkron), bukan progres sebagian yang menunggu
batch lain untuk divalidasi.
