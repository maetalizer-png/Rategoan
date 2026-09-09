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

## 4. Status Release per pengecekan langsung 2026-09-09 (live, bukan asumsi)

Dicek ulang lewat `mcp__github__list_releases`/`get_release_by_tag` —
**13 tag aktif total**. Status ini berubah terus, anggap sebagai titik
awal bukan daftar tetap — cek ulang sebelum mulai kerja.

### 4.1 Kabar baik: K1/K2/K3 SUDAH digabung ulang hari ini (2026-09-09)

`korpus-sejarah-indonesia-bersih` dan `korpus-mentah-id` (dua tag
"penampung" yang sebelumnya didokumentasikan di §4 versi lama dokumen
ini) **SUDAH TIDAK ADA lagi di Release** — sudah digabung ke K1/K2/K3
(body Release baru: *"Digabung penampung wiki tersaring 2026-09-09"*
untuk K1, *"Digabung penampung tersaring 2026-09-09"* untuk K2 dan K3).
Ketiganya naik ke **versi 4**, dengan sha256 dan jumlah dokumen baru:

| Tag | totalDokumen | sha256 | `totalTokenBPEResmi` (Claude, terverifikasi) |
|---|---:|---|---:|
| `korpus-ensiklopedia-bersih` (K1) | 760.199 | `0ac714ce...b488d` | 362.003.221 — komposisiBahasa 100% id |
| `korpus-dialog-daerah-bersih` (K2) | 639.391 | `24e50740...eb853` | 157.206.944 — 37,15% dokumen TANPA field `lang` (lihat catatan kualitas) |
| `korpus-pelengkap-bersih` (K3) | 114.343 | `181fc855...f02f4` | 47.911.030 — komposisiBahasa 100% id |

**Sudah dikerjakan Claude 2026-09-09** (bukan lagi tugas terbuka):
unduh file final tiap kategori, verifikasi SHA256 (cocok dengan digest
asset DAN hash yang dikutip di body Release), ekstrak tokenizer BPE
resmi (vocab 30.368) dari `checkpoint-100m.safetensors`, tokenize+hitung
ulang penuh (bukan sampel), update `kanonik.entries` di
`korpus-manifest-total.json`, jalankan `check-korpus-manifest-sync.mjs`
(SEMUA SINKRON) dan `audit-corpus-tokens.mjs`. **Total token kanonik
proyek sekarang 567.121.195** (naik dari 543.202.593 sebelumnya).

**Manifest K1/K2/K3 di Release masih belum punya field `komposisiBahasa`**
(wajib per `PRD-RELEASE.md` §1.1) — Manus tolong lengkapi di publish
berikutnya. Nilai per-rak sudah dihitung Claude di atas kalau perlu
referensi cepat: K1/K3 100% id; **K2 punya masalah kualitas nyata**
(37,15% dokumen sama sekali tanpa `lang`, cuma 22,07% eksplisit `id`,
22,07% `min`, sisanya 12 bahasa daerah lain) — PRD-RELEASE.md §1.1
mewajibkan dialog punya `lang` eksplisit per dokumen, K2 **belum
patuh**.

### 4.2 Data mentah BARU — 6 rilis, ~46GB total, semua BELUM diproses

Enam tag baru muncul 2026-09-09 (15:29–17:37 UTC), semuanya dari
dataset HuggingFace publik, semuanya **eksplisit dinyatakan di body
Release-nya sendiri sebagai BELUM dedupe/BELUM difilter untuk
training produksi** — jangan dianggap siap pakai:

| Tag | Sumber (HuggingFace) | Ukuran | Lisensi (klaim sumber) | Catatan wajib dari body Release |
|---|---|---:|---|---|
| `indo4b-multi-billion-token-corpus-2026-09` | taufiqdp/Indo4B | ~23,6 GB (24 part) | MIT (klaim metadata) | ~3,6 miliar kata, ~250 juta kalimat. "Inspect and deduplicate before production training." |
| `indo4b-plus-multi-billion-token-corpus-2026-09` | taufiqdp/Indo4B-Plus | ~9,4 GB (7 part) | MIT (klaim metadata) | "Inspect overlap with Indo4B and deduplicate" — tumpang tindih dengan tag di atas SUDAH diperingatkan sendiri oleh Manus |
| `id-training-data-manifest-2026-09` | img-gemina/indonesian-corpus-2b-deepclean-indo4b | kecil (cuma manifest+sample) | CC BY 4.0 (klaim metadata) | ~1,8 miliar token, ~25,5 juta dokumen — korpus PENUH tidak disalin ke Release (cuma 5 baris sample) |
| `id-corpus-1p8b-split-2026-09` | sumber sama seperti di atas | ~4,4 GB (4 part) | CC BY 4.0 (klaim metadata) | Payload sungguhan dari sumber yang sama dengan manifest di atas |
| `id-specialized-qa-legal-instruction-2026-09` | garuda-indonesian + Indonesian_Regulation_QA + LaMini-Instruction-Indonesian | ~4,0 GB (33 file parquet) | campuran (2 tanpa lisensi jelas, 1 Apache-2.0, 1 MIT) | garuda: 3.812.494 baris QA/percakapan (TANPA lisensi eksplisit — cek provenance sebelum pakai komersial). LaMini: ~2,6 juta instruksi hasil TERJEMAHAN MESIN, "documented translation errors, quality-filter before training". Body sendiri: "not claimed to be clean corpus tokens" |
| `id-knowledge-science-language-batch-2026-09` | wikipedia-id + id_newspapers_2018 + alpaca-id-cleaned + id_recipe + indonesian-proper-nouns + data-science-en-id (6 dataset sekaligus) | ~3,8 GB (34 file) | campuran per dataset (lihat tabel di body Release) | wikipedia-id **TUMPANG TINDIH dengan K1** (idwiki sudah 2x digali — lihat `PRD-RAGET-NEURAL.md` §2b, WAJIB dedupe silang sebelum masuk K1, bukan ditambah begitu saja) |

**Tidak ada satu pun dari 6 rilis ini yang punya `manifest.json` skema
wajib PRD-RELEASE.md §6** — belum patuh PRD, ini yang harus dibereskan
sebelum salah satu kandidat ini boleh masuk kategori kanonik.

**Klasifikasi awal (indikatif, WAJIB dicek ulang isinya sebelum
diproses — lihat §2 langkah 1, jangan asumsikan dari nama saja):**
- Kemungkinan `ensiklopedia`: `wikipedia-id` (dalam batch #6) — tapi
  cek dulu overlap dengan K1 sebelum diklaim tambahan bersih.
- Kemungkinan `dialog`: `garuda-indonesian`, `alpaca-id-cleaned`,
  `LaMini-Instruction` (gaya instruksi/percakapan) — TAPI PRD-RELEASE.md
  §1 mendefinisikan `dialog` sebagai korpus PRETRAINING gaya Raget,
  bukan data SFT/instruction-tuning generik hasil terjemahan mesin;
  body Release `id-specialized-qa-legal-instruction` sendiri menyarankan
  data ini masuk "SFT atau domain-adaptation mixture" — **kemungkinan
  besar TIDAK cocok masuk 5 kategori §1 apa adanya, tanya dirigen dulu**
  sebelum dipaksakan ke kategori `dialog`.
- Kemungkinan `pelengkap`: `id_recipe`, `indonesian-proper-nouns`,
  `Indonesian_Regulation_QA` (volume kecil, konten spesifik/pelengkap).
- Perlu keputusan eksplisit dulu (bukan otomatis diklasifikasi): 
  `Indo4B`/`Indo4B-Plus`/`indonesian-corpus-2b-deepclean-indo4b` (~37GB
  gabungan, OSCAR/CommonCrawl-derived) — inilah kandidat nyata untuk
  menutup gap 18,4x yang diidentifikasi `PRD-RAGET-NEURAL.md` §2b, TAPI
  ketiganya sendiri mengaku belum dedupe dan preseden `panen-madlad400-id`
  (juga OSCAR-derived) gagal 18,7% spam — **filter kualitas ketat WAJIB
  sebelum diklaim `ensiklopedia`**, jangan langsung publish ke tag K1.

**Catatan identitas**: API GitHub tidak menunjukkan akun terpisah untuk
Manus — semua upload (lama dan baru) tercatat atas nama akun pemilik
repo yang sama. Tidak masalah untuk prosedur ini (siapa pun yang
publish, aturan §2 tetap sama), dicatat saja sebagai fakta, bukan
dugaan soal siapa sebenarnya yang mengunggah.

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
