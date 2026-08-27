# PRD — Struktur Data Release & Penamaan Korpus Rategoan

Status: **BERLAKU, mengikat**. Dokumen ini adalah rumus tunggal untuk
mengukur, menata, menamakan, dan menggabungkan data training (korpus
teks + checkpoint neural) di GitHub Release proyek Rategoan.

Ditulis untuk dibaca dan diikuti oleh **siapa pun/agen apa pun** (manusia,
Grok, Claude, atau lainnya) yang menambah/mengelola data Release —
bukan hanya catatan sekali pakai. Kalau ada aturan lama di `docs/` yang
bertentangan dengan dokumen ini, **dokumen ini yang menang**.

## 0. Masalah yang diperbaiki

Audit tanggal 2026-08-26 menemukan **19 Release** dengan penamaan
`A1..A17` + `PACK` yang tidak konsisten: nomor tidak mencerminkan ukuran
maupun kategori, ada file yang cuma **1014 byte** dapat Release sendiri,
ada versi berulang (`A3`, `A3v2`) sebagai tag terpisah alih-alih
memperbarui tag yang sama, dan tag lama yang sudah digabung ke `PACK`
dibiarkan tetap hidup alih-alih dihapus. Akibatnya: pilihan mana yang
harus di-load untuk training jadi tidak jelas kecuali baca beberapa file
`STATUS-*.md` sekaligus.

Dokumen ini mengganti semua itu dengan **rumus tetap** — bukan
keputusan ad-hoc per sesi.

## 1. Kategori (taksonomi tertutup — hanya 5)

Setiap data baru **wajib** masuk salah satu dari 5 kategori ini. Kalau
benar-benar tidak cocok satupun, **berhenti dan tanya dirigen** sebelum
membuat kategori ke-6 — jangan langsung menambah huruf/angka baru.

| Kategori | Isi | Peran dalam mix training |
|---|---|---|
| `ensiklopedia` | Narasi faktual volume besar — Wikipedia/Wikimedia ID + serumpun (Melayu, regional) | 55–65% |
| `dialog` | Percakapan, gaya Raget, tanya-jawab, sapaan, obrolan buatan | bagian dari 25–35% |
| `daerah` | Bahasa daerah Indonesia sebagai teks (Jawa, Sunda, Minang, Madura, Ngapak, dst) | bagian dari 25–35% |
| `pelengkap` | Tambahan kecil opsional — simple-wiki, wikiquote, wikivoyage, edukasi, buku/naskah | 5–15% |
| `checkpoint` | Bobot model neural (safetensors) | bukan korpus — diatur `raget/raget-tools/CHECKPOINT-POLICY.md`, PRD ini cuma merujuk, tidak menggantikan |

`dialog` dan `daerah` **selalu digabung jadi satu file pack** saat
training (lihat §4) karena sama-sama porsi kecil yang perlu di-upsample
bersama — tapi tetap dua kategori terpisah saat diukur/dinamai, supaya
komposisi tetap terlihat kalau dibongkar lagi nanti.

### 1.1 Aturan bahasa per kategori — wajib, bukan saran

**Temuan `keputusan-014`**: audit lang-field pada `korpus-pelengkap-bersih`
(K3) menunjukkan **94% baris berlabel `lang: en-simple`** (Simple English
Wikipedia) — korpus yang namanya "pelengkap" (harusnya Indonesia)
ternyata didominasi konten Inggris salah kategori. Model yang dilatih
dari korpus tercemar ini nyata-nyata menghasilkan jawaban campur bahasa
(fragmen Inggris di tengah kalimat Indonesia) — bukan cuma masalah
kerapian data, tapi **langsung merusak kualitas jawaban**. Aturan di
bawah ini wajib dipatuhi untuk semua data baru maupun audit ulang data
lama, supaya kejadian ini tidak terulang:

1. **`ensiklopedia` (K1)** — wajib mayoritas `lang: id` (eksplisit di
   field `lang` tiap dokumen), atau kalau field `lang` tidak tersedia
   dari sumbernya, wajib lolos filter rasio kata-tugas Bahasa Indonesia
   (lihat rumus di poin 5) sebelum masuk korpus. Dokumen yang gagal
   kedua syarat ini **tidak boleh** masuk tag `korpus-ensiklopedia-bersih`.
2. **`dialog` (bagian dari K2)** — setiap dokumen **wajib** berlabel
   `lang` eksplisit. Wajib dipisah jadi dua sub-kelompok yang bisa
   dibedakan lewat field `lang`/`kategori` internal: dialog Bahasa
   Indonesia baku (`lang: id`) vs dialog bahasa daerah (`lang: jv`,
   `su`, `min`, `mad`, `map-bms`, dst). Sub-kelompok daerah tetap boleh
   ada (itu tugas kategori `daerah`) tapi **harus bisa difilter keluar
   secara terpisah** saat training butuh komposisi Indonesia lebih
   tinggi — jangan sampai tercampur tanpa label seperti sebelumnya.
3. **`pelengkap` (K3)** — wajib **mayoritas** `lang: id`. Konten
   non-Indonesia (`lang` apa pun selain awalan `id`) **dilarang** masuk
   tag `korpus-pelengkap-bersih` kecuali diberi label terpisah yang
   eksplisit dan proporsinya dilaporkan jujur di manifest (lihat poin
   4) — tidak boleh diam-diam dominan seperti kasus `en-simple` di atas.
4. **Setiap `manifest.json` korpus wajib memuat komposisi bahasa** —
   field baru `komposisiBahasa` berisi persentase dokumen per nilai
   `lang` yang ditemukan (lihat skema di §7). Ini bukan opsional -
   tanpa field ini, Release korpus dianggap **belum patuh PRD**, sama
   seperti SHA256 yang hilang (§8).
5. **Prosedur filter bahasa wajib** (dipakai saat membangun campuran
   training dari korpus mana pun): cek field `lang` eksplisit dulu -
   kalau ada dan tidak berawalan `id`, buang. Kalau field `lang` kosong/
   tidak ada, fallback ke rasio kata-tugas Bahasa Indonesia (stopword:
   yang/dan/di/ke/dari/ini/itu/tidak/dengan/untuk/pada/akan/adalah/dll)
   dihitung pada field `text` yang **sudah diekstrak dari JSON** — BUKAN
   pada baris JSON mentah (kalau dihitung dari baris mentah, field
   metadata seperti `source`/`license`/`url` yang berbahasa Inggris ikut
   mencemari hitungan dan salah membuang data Indonesia yang sah, seperti
   yang sempat terjadi di percobaan pertama `keputusan-014`).

**PERINGATAN TEGAS**: campuran training yang lolos gerbang SHA256 (§8)
tapi TIDAK lolos filter bahasa di atas tetap **dilarang** dipakai untuk
training model produksi. Model yang dilatih dari korpus bahasa campur
akan menghasilkan jawaban campur bahasa (Inggris/daerah menyelip di
tengah kalimat Indonesia) — ini pernah terjadi nyata dan terekam di
`keputusan-013`/`keputusan-014`. Gerbang bahasa ini WAJIB dijalankan
sebelum gerbang mix ratio (§4), bukan opsi tambahan.

## 2. Penamaan — satu tag permanen per kategori

**Tag** (nama teknis yang dipakai skrip) mengikuti pola tetap:

```
korpus-<kategori>-bersih
```

Tidak ada `-v1`, `-v2`, `-vN` di **tag**. Versi hidup di dalam
`manifest.json` (field `versi`, integer, naik terus) dan di judul
Release (field "name"), BUKAN di tag. Saat ada data baru untuk kategori
yang sama: **timpa asset di tag yang sama**, jangan bikin tag baru.

Contoh tag yang benar (final, setelah migrasi §6):

| Tag | Kategori |
|---|---|
| `korpus-ensiklopedia-bersih` | ensiklopedia |
| `korpus-dialog-daerah-bersih` | dialog + daerah (satu pack gabungan) |
| `korpus-pelengkap-bersih` | pelengkap |
| `checkpoint-<ukuran>` (mis. `checkpoint-100m`) | checkpoint — sudah benar, tidak diubah |

**Pengecualian version-pin** (langka, butuh alasan tertulis di manifest
field `alasanPin`): kalau satu training run yang SUDAH dipublikasikan
harus tetap bisa direproduksi persis dari korpus versi lama, boleh
membekukan satu snapshot sebagai `korpus-<kategori>-bersih-v<N>-pinned`.
Ini bukan alur normal — jangan dipakai untuk update rutin.

Field "name" (judul tampilan Release, boleh bebas/enak dibaca manusia)
tetap boleh punya indeks display seperti `K1 · Ensiklopedia ID` — itu
kosmetik saja, bukan identitas teknis. Jangan sampai script bergantung
pada nomor display ini.

## 3. Ukuran — rumus tingkatan kapasitas ("1 ukuran sesuai kapasitasnya")

Ukur ukuran file **gzip final** (bukan raw) dalam MB:

```
size_mb = bytes(file.jsonl.gz) / 1_000_000
```

| Tingkat | Rentang | Aturan |
|---|---|---|
| **XS** | < 20 MB | **DILARANG jadi Release sendiri.** Wajib digabung ke pack kategorinya (§5) sebelum publish. |
| **S** | 20–95 MB | Boleh Release tersendiri satu file per kategori. |
| **M** | 95–500 MB | Ideal — cukup besar untuk volume berarti, cukup kecil untuk diunduh/verifikasi cepat. Target band utama untuk `ensiklopedia`. |
| **L** | 500 MB–1.5 GB | Masih satu file (GitHub Release single-asset limit ~2GB), tapi mulai pertimbangkan split kalau mendekati batas. |
| **XL** | > 1.5 GB | **Wajib dipecah** jadi part berurutan `<tag-file>.partNN` (NN 2-digit, mulai `00`), tiap part idealnya ~300–500 MB, plus `manifest.json` berisi SHA256 tiap part + SHA256 file utuh + urutan gabung. |

Batas 20 MB (XS) dipilih supaya tidak ada lagi Release seperti
`korpus-inti-id-buatan-v1` (1014 byte) atau `korpus-inti-id-buatan-v3`
yang berdiri sendiri padahal isinya recehan.

**Catatan penting — ini beda dari aturan git.** Batas 100MB/95MB-part
di `CHECKPOINT-POLICY.md` itu khusus untuk file yang MUNGKIN masuk git
(checkpoint kecil) atau branch `staging/korpus-parts` (batas keras
GitHub per-blob). Release asset **tidak** kena batas itu — GitHub
Release boleh sampai ~2GB per file. Jangan pecah korpus jadi part
95MB kalau tujuannya Release, itu cuma bikin part berlebihan tanpa
alasan (lihat masalah §0).

### 3.1 SATU FILE FISIK per kategori — ini bukan pilihan, ini wajib

Klarifikasi tegas karena sempat disalahpahami: "boleh Release tersendiri"
di tabel di atas berarti **satu file `.jsonl.gz`**, BUKAN "boleh beberapa
file digabung jadi satu Release asal semua sudah lolos 20MB masing-masing".

**Dilarang keras:** menaruh 2+ file `.jsonl.gz` sumber-terpisah (mis.
`<tag>.jilid1.jsonl.gz`, `<tag>.jilid3.jsonl.gz`, `<tag>.buku.jsonl.gz`,
dst) sebagai asset-asset lepas di bawah satu tag dan menyebutnya
"kanonik". Itu bukan "digabung" — itu cuma dipindah-taruh di folder yang
sama. Loader/training tetap harus tahu ada berapa file dan mana urutan
mana, persis masalah fragmentasi yang PRD ini dibuat untuk membereskan.

**Satu-satunya pengecualian yang sah**: split XL (§3, tier XL) — dan itu
HARUS berupa part **berurutan dari satu file yang sama** (`partNN`,
hasil `split` biner atas satu `.jsonl.gz` utuh), bukan gabungan beberapa
sumber berbeda yang kebetulan ditaruh bersebelahan. Beda mendasar: part
XL direkonstruksi dengan `cat part00 part01 ... > file.jsonl.gz` dan
hasilnya **wajib** cocok satu SHA256 yang tercatat di manifest (§9).
Bundel multi-sumber tidak punya sha256 tunggal untuk dicocokkan — itu
tandanya itu bukan pola part yang sah.

**Cara benar menggabungkan banyak sumber jadi satu kategori:**

```bash
# semua sumber dalam kategori sama, sudah dalam format {"text":...} per baris
zcat sumber1.jsonl.gz sumber2.jsonl.gz sumber3.jsonl.gz | gzip -9 > korpus-<kategori>-bersih.jsonl.gz
sha256sum korpus-<kategori>-bersih.jsonl.gz   # simpan hasilnya ke manifest field "sha256"
```

Hasilnya **satu file**, satu SHA256, satu baris di tabel §6. Titik.

## 4. Rumus campuran training (mix ratio)

Target resmi (generalisasi dari `docs/MIX-TRAINING-SEIMBANG.md`, berlaku
untuk kategori, bukan tag spesifik):

```
ensiklopedia   : 55–65%
dialog+daerah  : 25–35%   (upsampled — lihat rumus oversample di bawah)
pelengkap      : 5–15%
```

### Rumus oversample (dipakai kalau kategori kecil harus dinaikkan porsinya)

Ini rumus yang sudah dipakai berulang kali sesi ini (mis. `own_corpus`
5×, A1+A3 65:35) — sekarang resmi dikodifikasi:

```
target_share   = porsi yang diinginkan kategori kecil (mis. 0.35)
anchor_bytes   = ukuran byte kategori acuan (biasanya ensiklopedia, boleh disample dulu ke ukuran kerja yang wajar, mis. 100-300MB)
small_bytes    = ukuran byte asli kategori kecil (sebelum diulang)

repeat_factor  = ceil( (target_share / (1 - target_share)) * anchor_bytes / small_bytes )
```

Setelah repeat, gabungkan lalu **shuffle** (`shuf`) sebelum tokenisasi —
supaya kategori tidak mengelompok jadi blok besar di korpus akhir (data
mengelompok = model belajar satu jenis dulu baru jenis lain dalam satu
sesi training, tidak diinginkan).

Verifikasi rasio SELALU dengan menghitung ulang byte hasil akhir
per kategori, dicatat di manifest (`proporsiAktual`), bukan cuma
diasumsikan dari repeat_factor teoretis.

## 5. Alur wajib untuk data baru (checklist "pagar")

Jalankan urutan ini **setiap kali** ada korpus baru mau dipublikasikan.
Ini berlaku untuk siapa pun/agen apa pun yang punya akses publish Release
(saat ini: dirigen manusia atau proses di luar sandbox Claude Code Remote
— lihat catatan di `CHECKPOINT-POLICY.md` kenapa Claude sendiri tidak
bisa publish Release).

1. **Bersihkan + dedupe** data mentah dulu. Jangan publish data mentah.
2. **Ukur**: jumlah dokumen, kata approx (`wc -w` atau split whitespace),
   byte gzip, breakdown bahasa (%), lisensi per sumber.
3. **Klasifikasi kategori** — pilih SATU dari 5 kategori §1 berdasarkan
   ISI, bukan berdasarkan urutan kedatangan.
4. **Hitung `size_mb`** dan tentukan tingkat (§3).
5. **Kalau XS (<20MB):**
   a. Unduh pack kategori yang sudah ada (`korpus-<kategori>-bersih`,
      atau `korpus-dialog-daerah-bersih` untuk dialog/daerah).
   b. Gabungkan data baru ke situ, **dedupe ulang lintas-file**.
   c. Upload ulang sebagai asset baru **di tag yang sama** (timpa file
      lama), naikkan `versi` di manifest.
   d. **Jangan** buat tag baru.
6. **Kalau S/M/L (≥20MB):**
   a. Kalau kategori ini BELUM punya file kanonik → publish langsung ke
      tag `korpus-<kategori>-bersih` (tag baru dibuat sekali di sini).
   b. Kalau kategori ini SUDAH punya file kanonik dan data baru
      dimaksudkan **menambah** volume (bukan menggantikan) → unduh yang
      lama, gabung, dedupe, upload ulang sebagai asset baru di tag yang
      sama (bukan bikin `-v2`).
   c. Kalau data baru SECARA SADAR dimaksudkan menggantikan (mis. jauh
      lebih bersih dari sumber yang sama) → tetap pakai tag yang sama,
      upload ulang menimpa asset lama.
7. **Kalau XL (>1.5GB)**: pecah jadi part sesuai §3, semua part + manifest
   di tag yang sama.
8. **Tulis/timpa `manifest-<kategori>.json`** dengan skema wajib (§7) —
   selalu ikut ter-upload sebagai asset kedua di release yang sama.
9. **Retire tag lama** yang isinya sudah sepenuhnya masuk ke pack/file
   baru — hapus Release-nya (bukan cuma dibiarkan "tidak wajib diload").
   Release yang aktif harus selalu bisa dipetakan 1:1 ke tabel §1/§2 —
   tidak ada tag "nganggur" di listing.
10. **Update `docs/STATUS-KORPUS-LISENSI.md`** (satu baris per kategori,
    bukan per tag) supaya tetap sinkron.

## 6. Migrasi dari kondisi sekarang (audit 2026-08-26)

Tabel ini memetakan 19 Release yang ada sekarang ke kategori final.
`AKSI` adalah rekomendasi, dijalankan oleh dirigen/Grok (bukan Claude —
lihat §5 soal siapa yang bisa publish Release):

| Tag lama | Kategori target | Ukuran | Aksi |
|---|---|---|---|
| `korpus-jilid-1-clean` (A1) | ensiklopedia | ~479MB | **KANONIK** — rename tujuan jadi `korpus-ensiklopedia-bersih` (atau alias tag lama ke situ), jadi acuan utama |
| `korpus-wiki-se-asia-bersih-v1` (A6) | ensiklopedia | ? | Cek overlap dgn A1 → kalau tambahan asli, gabung; kalau tumpang tindih penuh, retire |
| `korpus-buku-naskah-bersih-v1` (A7) | pelengkap (buku/naskah) | ? | Gabung ke `korpus-pelengkap-bersih` |
| `korpus-edukasi-bersih-v1` (A8) | pelengkap | ? | Gabung ke `korpus-pelengkap-bersih` |
| `korpus-idwikivoyage-bersih-v1` (A16) | ensiklopedia (niche) | ? | Cek isi — voyage/travel teks faktual → `ensiklopedia`, bukan `dialog` (PACK saat ini salah taruh A16 di sini, perbaiki) |
| `korpus-idwikiquote-bersih-v1` (A13) | pelengkap | ? | Gabung ke `korpus-pelengkap-bersih` |
| `korpus-idwiki-hf-bersih-v1` (A14) | ensiklopedia | ? | Cek overlap dgn A1, gabung atau retire |
| `korpus-idwiki-derhan-bersih-v1` (A15) | ensiklopedia | ? | Cek overlap dgn A1, gabung atau retire |
| `korpus-simplewiki-bersih-v1` (A17) | pelengkap | ? | Gabung ke `korpus-pelengkap-bersih` |
| `korpus-wiki-lokal-bersih-v1` (A5) | daerah | ? | Gabung ke `korpus-dialog-daerah-bersih` |
| `korpus-daerah-id-extra-v1` (A9) | daerah | 8.2MB (XS) | Sudah masuk PACK — **retire tag lama** |
| `korpus-train-seimbang-bersih-v1` (A3) | dialog | 1.4MB (XS) | Sudah masuk PACK — **retire tag lama** |
| `korpus-a3-dialog-seimbang-v2` (A3v2) | dialog | ? | Sudah masuk PACK — **retire**, ini contoh persis pola `-v2` yang dilarang §2 |
| `korpus-inti-id-buatan-v1/v2/v3` (A10/A11/A12) | dialog | 1KB tiap file (XS) | Sudah masuk PACK — **retire ketiganya**, contoh persis masalah §0 |
| `korpus-dialog-daerah-pack-v1` | dialog+daerah | 13MB | Rename tujuan jadi `korpus-dialog-daerah-bersih` (drop `-v1` dari tag, ikuti §2) |
| `checkpoint-100m`, `checkpoint-200m` | checkpoint | — | Tidak diubah, sudah sesuai kebijakan |

`?` = ukuran belum diverifikasi di sesi ini, wajib dicek sebelum retire
(unduh, cek `manifest.json`-nya, konfirmasi benar-benar sudah tercakup
di pack/kanonik sebelum hapus — **jangan hapus tanpa verifikasi**).

Setelah migrasi selesai, jumlah Release aktif untuk korpus seharusnya
**3** (`korpus-ensiklopedia-bersih`, `korpus-dialog-daerah-bersih`,
`korpus-pelengkap-bersih`) + checkpoint yang berlaku, bukan 17.

## 7. Skema manifest wajib

Setiap Release korpus **wajib** punya `manifest.json` dengan field ini
(field baru dibanding pola lama ditandai **[BARU]**):

```json
{
  "kategori": "ensiklopedia",           // [BARU] salah satu dari §1, wajib
  "tag": "korpus-ensiklopedia-bersih",  // [BARU] harus cocok §2
  "tierUkuran": "M",                    // [BARU] XS/S/M/L/XL sesuai §3
  "versi": 3,                           // [BARU] integer naik tiap update, bukan di nama tag
  "name": "korpus-ensiklopedia-bersih",
  "generatedAt": "2026-08-26",
  "totalDokumen": 683516,
  "totalKataApprox": 305971509,
  "totalByte": 470656011,
  "sha256": "...",
  "format": "jsonl",
  "fields": ["text", "source", "license", "url", "lang"],
  "license": "...",
  "komposisiBahasa": { "id": 0.94, "en-simple": 0.04, "jv": 0.02 }, // [BARU] wajib, lihat §1.1
  "proporsiInternal": { "...": "..." },
  "proporsiAktual": { "...": "..." },   // [BARU] hasil ukur ulang setelah oversample+shuffle, lihat §4
  "rekomendasiCampuranTraining": { "...": "..." },
  "status": "AMAN — siap dipakai training",
  "janganPakai": ["..."]
}
```

## 8. SEGEL SHA256 — verifikasi wajib, bukan opsional

Field `sha256` di manifest (§7) bukan sekadar metadata dokumentasi — ia
adalah **gerbang go/no-go**. Prinsipnya:

```
File apa pun → SHA256 → string 64 karakter tetap
File sama       = sidik jari sama, selamanya
Ubah 1 byte saja = sidik jari beda TOTAL
```

Artinya SHA256 mendeteksi korup, kepotong, ketukar, atau gagal unduh —
hal yang tidak bisa dideteksi cuma dari ukuran file (ukuran bisa
kebetulan sama padahal isi beda/rusak).

### Tiga gerbang wajib verifikasi

**Gerbang 1 — saat publish (penulis/dirigen/Grok).**
SHA256 **WAJIB** dihitung dari file **FINAL yang di-upload** (gzip
`.jsonl.gz` akhir), **bukan** JSONL mentah sebelum kompresi. Kompresi
ulang (level gzip berbeda) mengubah byte → hash berbeda meski teks sama.

Setelah file final (§3.1, satu file) selesai dibuat:
```bash
sha256sum korpus-<kategori>-bersih.jsonl.gz
```
Hasilnya ditulis ke `manifest.json` field `sha256` **dari file gzip itu**,
lalu file **yang sama** di-upload. File tanpa `sha256` di manifest
**tidak dianggap selesai**.

Pipa resmi: `raget/raget-tools/publish-korpus-release.py` (korpus) dan
`raget/raget-tools/publish-checkpoint-release.py` (checkpoint). Skrip
menghitung hash dari file yang akan di-upload, menulis manifest, lalu
upload.

**Gerbang 1b — self-verify setelah upload (otomatis, wajib).**
Setelah asset masuk GitHub, bandingkan:
```
manifest.sha256  ==  digest GitHub asset (field digest: sha256:...)
                 ==  sha256sum lokal file yang baru di-upload
```
Tidak cocok = **publish DIBLOKIR**: asset baru dihapus, proses exit ≠ 0.
Jangan biarkan Release hidup dengan segel palsu. Ini akar masalah K2
(hash mentah vs gzip) yang sudah pernah terjadi.

**Gerbang 2 — saat reassembly part (khusus tier XL, §3).**
```bash
cat korpus-<kategori>-bersih.jsonl.gz.part00 \
    korpus-<kategori>-bersih.jsonl.gz.part01 \
    ... > korpus-<kategori>-bersih.jsonl.gz
sha256sum korpus-<kategori>-bersih.jsonl.gz
# WAJIB cocok dengan manifest.sha256 (file utuh), bukan cuma sha256 tiap part
```
Kalau tidak cocok: **berhenti, jangan lanjut ke tokenisasi/training.**
Unduh ulang dari awal, atau kalau tetap gagal, laporkan ke dirigen —
jangan dipaksa dipakai "kira-kira sama".

**Gerbang 3 — sebelum training dimulai (siapa pun yang load korpus).**
Setelah unduh (dan reassembly bila perlu), sebelum file masuk ke
`tokenize-chunk-corpus.py` atau skrip training manapun:
```bash
echo "<sha256_dari_manifest>  korpus-<kategori>-bersih.jsonl.gz" | sha256sum -c -
```
Keluaran harus `OK`. Kalau `FAILED` → **jangan training pakai file itu**.
Ini satu baris, murah, dan mencegah menghabiskan puluhan menit CPU
melatih model di atas data yang diam-diam rusak/tertukar — kesalahan
yang baru ketahuan dari kualitas output yang aneh, jauh lebih mahal
untuk didiagnosis daripada dicegah di sini.

### Ringkasan aturan
- **Segel utuh** (SHA256 cocok) = isi tidak ada yang tersentuh, aman dipakai.
- **Segel beda** (SHA256 tidak cocok) = isi tertukar/rusak/korup → **berhenti**, jangan dipakai, jangan "coba saja".
- Setiap Release korpus (K1/K2/K3, dan kategori baru ke depan) **wajib** punya `sha256` di `manifest.json` — tidak terkecuali, tidak "nanti saja".
- SHA256 publish = hash **gzip final yang benar-benar diupload**, bukan raw.
- Setelah upload, digest GitHub **wajib** dicocokkan; gagal = publish batal.
- Pipa: `publish-korpus-release.py` / `publish-checkpoint-release.py`.

- SHA256 dihitung dari file **gzip final** yang benar-benar diupload — bukan dari file mentah sebelum kompresi (kompresi ulang dengan level berbeda menghasilkan byte berbeda meski isi teksnya identik).

## 9. Status kepatuhan saat ini (audit 2026-08-26, setelah migrasi §6)

Setelah perbaikan Grok 2026-08-26 — **ketiga korpus PATUH**:

| Tag | §3.1 (satu file fisik) | §8 (sha256 di manifest) | Status |
|---|---|---|---|
| `korpus-ensiklopedia-bersih` (K1) | ✅ — satu file 503.9MB | ✅ — `cc81c7797265cf800a33d9003e6e842b3ae9fad047a942421d086ef937a100db` | **PATUH** |
| `korpus-dialog-daerah-bersih` (K2) | ✅ — satu file 67.8MB | ✅ — sha256 ada | **PATUH** |
| `korpus-pelengkap-bersih` (K3) | ✅ — satu file 467.7MB | ✅ — `d4d1afa43bf999cc42d841a78f39e605b9fa572382b1c7811dd101cba3b808fa` | **PATUH** |

Multi-file lama di K1/K3 sudah dihapus. Training hanya load **satu** `.jsonl.gz` per kategori + verifikasi `sha256sum -c` terhadap `manifest.json`.

## 10. Resep training per ukuran model — arsitektur, token, batas aman

Ini "resep" yang dimaksud: satu tabel rujukan tunggal supaya setiap
ronde training ke depan (50M/100M/200M, dan nanti 300M/400M) pakai
angka yang SAMA, bukan diputuskan ulang tiap sesi secara ad-hoc. Angka
50M/100M/200M di bawah **nyata**, diambil langsung dari log training
sesi ini (bukan perkiraan) — 300M/400M **estimasi**, belum pernah
dijalankan, ditandai jelas.

### 10.1 Arsitektur (harus konsisten dengan `DIMS` di `train-massive-colab-gpu.py`)

| Model | dModel | nLayers | nHeads | dFF | parameterCount | Status |
|---|---|---|---|---|---|---|
| 50M | 512 | 6 | 8 | 2048 | **49.999.872** | ✅ terverifikasi (dipakai berulang) |
| 100M | 768 | 8 | 12 | 3072 | **103.325.184** | ✅ terverifikasi |
| 200M | 1024 | 11 | 16 | 4096 | **200.709.120** | ✅ terverifikasi |
| 300M | 1152 | 14 | 18 | 4608 | ~293.000.000 | ⚠️ **ESTIMASI** — pola diturunkan dari 3 baris di atas (dFF=4×dModel, nHeads=dModel/64), belum pernah di-training sekali pun. Wajib validasi `parameterCount` asli dari log begitu pertama kali dijalankan, lalu pindahkan baris ini ke status ✅. |
| 400M | 1280 | 16 | 20 | 5120 | ~392.000.000 | ⚠️ **ESTIMASI** — sama seperti 300M, belum pernah dijalankan |

Kalau/ketika 300M atau 400M mau ditambahkan ke `train-massive-colab-gpu.py`,
tambahkan baris berikut ke dict `DIMS` (ikuti pola dFF=4×dModel dan
nHeads=dModel/64 yang sudah konsisten di 3 ukuran existing — jangan pakai
angka lain tanpa alasan tertulis):
```python
DIMS = {
    '50m':  {'dModel': 512,  'nLayers': 6,  'nHeads': 8,  'dFF': 2048},
    '100m': {'dModel': 768,  'nLayers': 8,  'nHeads': 12, 'dFF': 3072},
    '200m': {'dModel': 1024, 'nLayers': 11, 'nHeads': 16, 'dFF': 4096},
    '300m': {'dModel': 1152, 'nLayers': 14, 'nHeads': 18, 'dFF': 4608},  # BARU, verifikasi parameterCount asli setelah run pertama
    '400m': {'dModel': 1280, 'nLayers': 16, 'nHeads': 20, 'dFF': 5120},  # BARU, verifikasi parameterCount asli setelah run pertama
}
```

### 10.2 Throughput & batas aman (dari log nyata — anti-crash)

| Model | Throughput solo (tok/s, terverifikasi) | Batch aman **solo** | Batch aman **paralel** (2+ model bersamaan) | Catatan crash |
|---|---|---|---|---|
| 50M | 580–890 (bervariasi per korpus) | 32 | 32 — **tapi throughput jatuh ke 3–27 tok/s** kalau 200M ikut jalan bersamaan | Tidak pernah OOM, tapi 2× gagal tulis checkpoint karena kehabisan waktu sesi saat throughput kolaps di mode paralel |
| 100M | 410–440 (60 menit); s/d 700+ pada sesi pendek | 32 | 32 — **throughput jatuh ke 2–17 tok/s** dalam mode paralel | Sama seperti 50M |
| 200M | 210–235 | 32 | **TIDAK ADA batch yang aman** — OOM (cgroup memory limit) 2× berturut-turut saat jalan bersamaan model lain, termasuk sudah dicoba batch 16 | OOM total, checkpoint sesi itu **hilang** (tapi checkpoint lama tidak korup — `write_checkpoint()` cuma jalan di akhir) |
| 300M/400M | ⚠️ belum diukur | ⚠️ **mulai dari 16, bukan 32** — makin besar model makin kecil batch amannya (lihat tren 200M) | **JANGAN dicoba paralel dulu** sampai 200M solo di sesi 300M+ juga stabil | — |

**Kesimpulan operasional (wajib diikuti):** jalankan **satu model per
sesi** (sekuensial), bukan 3 model bersamaan penuh-budget. Ini bukan
preferensi — ini kesimpulan dari 2 percobaan paralel nyata yang gagal
(lihat `keputusan-011` di `raget/raget-devlog/jsonl/keputusan.jsonl`).
Kalau suatu saat sandbox/mesin berganti ke kapasitas lebih besar, aturan
ini boleh ditinjau ulang — tapi harus ada bukti throughput solo dulu di
mesin baru sebelum coba paralel lagi, jangan asumsi.

### 10.3 Rumus token per sesi (realistis) vs target jangka panjang (Chinchilla)

Dua angka berbeda, jangan tertukar:

**Token per sesi** (berapa token benar-benar terlatih dalam satu sesi 60
menit — angka operasional, dipakai untuk isi laporan):
```
token_per_sesi ≈ throughput_tok_per_s (tabel 10.2) × 3600
```
| Model | Token/sesi (60 menit) |
|---|---|
| 50M | ≈ 2.000.000–3.200.000 |
| 100M | ≈ 1.480.000–1.580.000 |
| 200M | ≈ 756.000–846.000 |
| 300M (estimasi) | ≈ 400.000–550.000 |
| 400M (estimasi) | ≈ 300.000–420.000 |

**Target total token jangka panjang** (rujukan compute-optimal Chinchilla,
`20 × parameterCount` — target akhir kalau model ini suatu saat benar-benar
dikonvergenkan penuh, BUKAN syarat yang harus dicapai satu-dua sesi):
```
target_token_total = 20 × parameterCount
```
| Model | Target token total (referensi jangka panjang) | Estimasi jumlah sesi 60-menit untuk mencapainya |
|---|---|---|
| 50M | ≈ 1,0 miliar | ≈ 350–500 sesi |
| 100M | ≈ 2,1 miliar | ≈ 1.300–1.400 sesi |
| 200M | ≈ 4,0 miliar | ≈ 4.700–5.300 sesi |
| 300M | ≈ 5,9 miliar | ≈ 10.700–14.700 sesi |
| 400M | ≈ 7,8 miliar | ≈ 18.600–26.000 sesi |

**Jangan panik lihat angka sesi yang besar itu** — ini memang gambaran
jujur bahwa sandbox CPU 4-core tidak akan pernah sampai compute-optimal
penuh dalam waktu wajar (total step terkumpul 50M sejauh sesi ini baru
±33 juta token, jauh dari 1 miliar). Itu bukan kegagalan — target ini
cuma acuan arah, bukan gerbang lulus/gagal per sesi. Yang jadi ukuran
sukses per sesi adalah **perplexity turun + sampel eval tidak
degenerate** (§ laporan standar 10.5), bukan persentase menuju 20×params.

### 10.4 Ukuran korpus minimum yang wajib disiapkan (bukan token per sesi)

Supaya korpus tidak habis diulang-ulang terlalu cepat (overfitting ke
pengulangan, bukan ke variasi data), sediakan korpus dengan token **jauh
lebih besar** dari token per sesi — minimal cukup untuk puluhan sesi
sebelum korpus yang sama mulai berulang penuh:

```
token_korpus_minimum ≈ 50 × token_per_sesi   (≈ cukup untuk 50 sesi tanpa pengulangan penuh)
```

K1 (ensiklopedia, ~503MB gz, ratusan juta token) sudah jauh melampaui
ini untuk semua ukuran model — aman dipakai sebagai backbone volume.
K2/K3 kecil (dialog/pelengkap) memang di bawah ambang ini secara alami
— makanya wajib di-oversample (rumus §4), bukan dipakai apa adanya.

### 10.5 Template instruksi standar ("1 tujuan 1 perintah")

Pakai bentuk ini untuk SETIAP ronde training baru, isi bagian
`[...]` saja — jangan susun instruksi bebas dari nol tiap kali (sumber
utama kenapa aturan "berubah-ubah" dan gampang bikin bingung/crash):

```
TUJUAN: Training model [50M|100M|200M] SAJA, maksimal 60 menit, sekuensial (tidak paralel).
DATA: A1 (korpus-ensiklopedia-bersih) + A3 (korpus-dialog-daerah-bersih)
      rasio ~[60-70]% : ~[30-40]%, verifikasi saat load (§9 PRD ini).
BATCH: 32 (lihat batas aman §10.2 kalau model >200M atau ada rencana paralel).
LARANGAN: model lain jalan bersamaan; ubah arsitektur; hapus checkpoint lama; sentuh rule-engine.
LAPORAN: pakai format §10.6 di bawah, satu kali di akhir.
```

### 10.6 Template laporan standar ("1 laporan sama")

Format ini **tetap sama** setiap kali, field-nya jangan ditambah/dikurangi
tanpa alasan — supaya laporan antar-sesi bisa dibandingkan apel-ke-apel:

```
1. Step: [awal] → [akhir] (total [N] step sesi ini, [durasi] menit, [X] tok/s)
2. PPL (held-out): [awal] → [akhir]
3. Checkpoint: [path] ([ukuran] MB) — [tertulis sukses / GAGAL + alasan]
4. 5 sampel generasi (prompt Bahasa Indonesia): [daftar]
5. Corpus ter-load: [nama tag/kategori] rasio [X]:[Y] — [terverifikasi/tidak]
6. Kalau gagal: [penyebab singkat] + [state checkpoint terakhir yang aman, dengan SHA256 kalau ada]
```

## 11. Yang TIDAK berubah

- `raget/raget-tools/CHECKPOINT-POLICY.md` tetap berlaku penuh untuk
  checkpoint (>100MB git → Release, larangan Git LFS, cara publish).
  PRD ini tidak menggantikannya, hanya menambah aturan korpus teks.
- Larangan sumber berisiko (`balanced-v1`, `jilid-2`, `news crawl`,
  `opensubtitles`, Release yang sudah dihapus) tetap berlaku, lihat
  `docs/STATUS-KORPUS-LISENSI.md`.
- Tokenizer tunggal (vocab 30.368, `train=runtime`) tetap dipakai untuk
  semua korpus tanpa kecuali.
