# PRD — Data Release: Alur Kerja, Penamaan, Token BPE, Sinkronisasi

Status: **BERLAKU, mengikat**. Rumus tunggal untuk mengukur, menata,
menamakan, dan menggabungkan data training (korpus teks + checkpoint
neural) yang masuk/keluar lewat GitHub Release proyek Rategoan.

## 0. Kenapa dokumen ini ada di DUA tempat, dan mana yang menang

Aturan mengikat ini **sudah ada sejak 2026-08-26**, tapi sebelumnya
CUMA hidup sebagai isi Release GitHub (tag `prd-data-release`, asset
`PRD-DATA-RELEASE.md`) — tidak pernah jadi file di git. Akibatnya
susah ditemukan (harus tahu nama tag persis), tidak muncul di `git
log`/diff biasa, dan skrip yang mengacu ke "PRD §8" (mis.
`publish-korpus-release.py`) merujuk sesuatu yang tidak kelihatan
siapa pun yang baca repo lewat cara normal. Inilah akar "ambigu" yang
dirasakan — bukan karena aturannya tidak ada, tapi karena aturannya
tersembunyi di tempat yang tidak biasa dibaca.

**Mulai sekarang**: dokumen **INI** (`PRD/PRD-RELEASE.md`, di git) yang
jadi sumber utama untuk diedit dan dibaca sehari-hari. Salinan di
Release (tag `prd-data-release`) tetap dipertahankan sebagai cermin
sealed yang dibaca skrip pipeline dari luar sandbox — **Grok/Manus/
dirigen tolong sinkronkan isi Release itu supaya sama persis dengan
dokumen git ini setiap kali dokumen ini berubah.** Kalau isi keduanya
pernah beda, **dokumen git ini yang benar** — versi Release yang harus
menyusul, bukan sebaliknya.

### Siapa mengerjakan apa, dan kenapa Claude tidak bisa publish Release

| Peran | Bisa apa | Tidak bisa apa |
|---|---|---|
| **Sesi Claude Code (sandbox ini)** | Baca Release/unduh asset, jalankan clean/dedupe/tokenize/hitung token secara lokal, verifikasi SHA256, edit file git (manifest, PRD, kode), commit+push ke git | **TIDAK BISA** membuat/mengedit/menghapus GitHub Release — API mengembalikan `"Creating, editing, or deleting releases is not permitted for this session type."` (pembatasan level-sesi yang disengaja, dikonfirmasi di `CHECKPOINT-POLICY.md`) |
| **Grok / Manus / dirigen (luar sandbox)** | Upload raw data ke Release (tag ad-hoc utk staging), publish korpus/checkpoint bersih ke Release (`publish-korpus-release.py`/`publish-checkpoint-release.py`), hapus tag lama, sinkronkan salinan Release dokumen ini | Idealnya tetap ikuti rumus di dokumen ini supaya tidak bentrok dengan kerja Claude di sisi git — Manus: lihat `PRD-MANUS-DATA-MENTAH.md` untuk prosedur langkah-demi-langkah |

**Titik serah terima yang jelas** (ini yang mencegah "bentrok"): Claude
mengerjakan SEMUA langkah yang bisa dijalankan lokal (unduh untuk
dibaca, bersihkan, dedupe, tokenisasi, hitung token, update
manifest+PRD di git, commit) sampai mentok di langkah **upload/publish
ke Release** — di situ pekerjaan berhenti dan diserahkan ke Grok/dirigen
dengan instruksi persis apa yang perlu di-publish (nama tag, file mana,
SHA256 berapa yang harus cocok). Tidak ada tumpang tindih karena
wilayah kerjanya memang terpisah oleh batas teknis (bukan kesepakatan
yang bisa dilanggar).

## 1. Kategori (taksonomi tertutup — hanya 5)

Setiap data baru **wajib** masuk salah satu dari 5 kategori ini. Kalau
benar-benar tidak cocok satu pun, **berhenti dan tanya dirigen** sebelum
membuat kategori ke-6.

| Kategori | Isi | Peran dalam mix training |
|---|---|---|
| `ensiklopedia` | Narasi faktual volume besar — Wikipedia/Wikimedia ID + serumpun | 55–65% |
| `dialog` | Percakapan, gaya Raget, tanya-jawab, sapaan, obrolan buatan | bagian dari 25–35% |
| `daerah` | Bahasa daerah Indonesia sebagai teks (Jawa, Sunda, Minang, dst) | bagian dari 25–35% |
| `pelengkap` | Tambahan kecil opsional — simple-wiki, wikiquote, wikivoyage, buku/naskah | 5–15% |
| `checkpoint` | Bobot model neural (safetensors) | bukan korpus — diatur `raget-tools/CHECKPOINT-POLICY.md`, PRD ini cuma merujuk |

`dialog` dan `daerah` **selalu digabung jadi satu file pack** saat
training (tag `korpus-dialog-daerah-bersih`) karena sama-sama porsi
kecil yang di-upsample bersama — tetap dua kategori terpisah saat
diukur/dinamai internal.

### 1.1 Aturan bahasa per kategori — wajib, bukan saran

Temuan nyata (`keputusan-014`): audit lang-field pada
`korpus-pelengkap-bersih` (K3) pernah menunjukkan **94% baris berlabel
`lang: en-simple`** — korpus "pelengkap" (harusnya Indonesia) didominasi
konten Inggris salah kategori, dan model yang dilatih darinya
menghasilkan jawaban campur bahasa. Aturan wajib:

1. **`ensiklopedia`** — mayoritas `lang: id` eksplisit, atau lolos
   filter rasio kata-tugas Bahasa Indonesia kalau field `lang` tidak
   tersedia dari sumbernya.
2. **`dialog`** — setiap dokumen wajib berlabel `lang` eksplisit,
   dipisah jadi sub-kelompok `id` vs bahasa daerah yang bisa difilter
   terpisah.
3. **`pelengkap`** — wajib mayoritas `lang: id`; konten non-Indonesia
   dilarang dominan diam-diam.
4. **Setiap `manifest.json` wajib memuat `komposisiBahasa`** (persentase
   dokumen per nilai `lang`) — tanpa field ini, Release dianggap
   **belum patuh PRD**, sama seperti SHA256 yang hilang (§4).
5. **Prosedur filter**: cek field `lang` eksplisit dulu, buang yang
   bukan `id*`. Kalau kosong, fallback ke rasio kata-tugas Bahasa
   Indonesia dihitung dari field `text` yang SUDAH diekstrak dari JSON
   — BUKAN dari baris JSON mentah (metadata `source`/`license`/`url`
   berbahasa Inggris ikut mencemari hitungan kalau dihitung dari baris
   mentah).

Gerbang bahasa ini **wajib** dijalankan sebelum gerbang mix ratio (§3),
bukan opsi tambahan — campuran yang lolos SHA256 tapi tidak lolos
filter bahasa tetap **dilarang** dipakai training produksi.

## 2. Penamaan — satu tag permanen per kategori

```
korpus-<kategori>-bersih
```

**Tidak ada `-v1`/`-v2`/`-vN` di TAG.** Versi hidup di `manifest.json`
(field `versi`, integer naik terus) dan judul Release ("name"), bukan
di tag. Data baru untuk kategori yang sama = **timpa asset di tag yang
sama**, jangan bikin tag baru — ini aturan anti-bentrok #1: satu
kategori, satu tag, selamanya, cuma isinya yang di-update.

| Tag | Kategori |
|---|---|
| `korpus-ensiklopedia-bersih` | ensiklopedia (K1) |
| `korpus-dialog-daerah-bersih` | dialog + daerah gabungan (K2) |
| `korpus-pelengkap-bersih` | pelengkap (K3) |
| `checkpoint-<ukuran>` | checkpoint — lihat `CHECKPOINT-POLICY.md` |

**Pengecualian version-pin** (langka, butuh `alasanPin` tertulis di
manifest): kalau satu training run sudah dipublikasikan harus tetap
bisa direproduksi persis dari korpus versi lama, boleh membekukan satu
snapshot sebagai `korpus-<kategori>-bersih-v<N>-pinned`. Bukan alur
normal.

## 3. Ukuran — rumus tingkatan kapasitas

```
size_mb = bytes(file.jsonl.gz) / 1_000_000        (ukur file GZIP FINAL, bukan raw)
```

| Tingkat | Rentang | Aturan |
|---|---|---|
| **XS** | < 20 MB | **DILARANG jadi Release sendiri** — wajib digabung ke pack kategorinya dulu |
| **S** | 20–95 MB | Boleh Release tersendiri, satu file per kategori |
| **M** | 95–500 MB | Ideal — target band utama `ensiklopedia` |
| **L** | 500 MB–1.5 GB | Masih satu file (limit single-asset GitHub ~2GB) |
| **XL** | > 1.5 GB | **Wajib dipecah** jadi part berurutan `<tag-file>.partNN` (~300–500 MB tiap part) + manifest berisi SHA256 tiap part + SHA256 file utuh |

Batas 20MB mencegah Release recehan (preseden nyata: pernah ada asset
1014 byte berdiri sendiri sebagai satu Release).

**Beda dari batas git**: 100MB/95MB di `CHECKPOINT-POLICY.md` itu
khusus file yang MUNGKIN masuk git — Release asset TIDAK kena batas
itu, boleh sampai ~2GB.

### 3.1 SATU FILE FISIK per kategori — wajib, bukan pilihan

**Dilarang keras**: menaruh 2+ file `.jsonl.gz` sumber-terpisah sebagai
asset-asset lepas di bawah satu tag dan menyebutnya "kanonik" — itu
bukan "digabung", cuma dipindah-taruh di folder yang sama, dan loader
tetap harus tahu urutan mana yang mana (masalah fragmentasi yang PRD
ini dibuat untuk membereskan).

**Satu-satunya pengecualian**: split XL (§3, tier XL) — part berurutan
dari SATU file yang sama, direkonstruksi `cat part00 part01 ... >
file.jsonl.gz`, hasilnya wajib cocok SATU SHA256 di manifest.

**Cara benar gabung banyak sumber jadi satu kategori:**
```bash
zcat sumber1.jsonl.gz sumber2.jsonl.gz sumber3.jsonl.gz | gzip -9 > korpus-<kategori>-bersih.jsonl.gz
sha256sum korpus-<kategori>-bersih.jsonl.gz   # simpan ke manifest field "sha256"
```
Hasilnya satu file, satu SHA256. Titik.

## 4. SEGEL SHA256 — tiga gerbang wajib (ini mekanisme anti-bentrok utama)

SHA256 bukan metadata dokumentasi — ia **gerbang go/no-go**. File sama
= sidik jari sama selamanya; ubah 1 byte = sidik jari beda total. Ini
yang mendeteksi korup/kepotong/tertukar/gagal-unduh — hal yang tidak
bisa dideteksi cuma dari ukuran file.

**Gerbang 1 — saat publish (Grok/dirigen).** SHA256 **wajib** dihitung
dari file **FINAL yang di-upload** (gzip `.jsonl.gz` akhir), BUKAN JSONL
mentah sebelum kompresi (kompresi ulang level berbeda = byte berbeda
walau teks sama). Ditulis ke manifest field `sha256`, file yang SAMA
yang di-upload. Tanpa `sha256` = belum dianggap selesai.

**Gerbang 1b — self-verify setelah upload (otomatis, wajib).**
`manifest.sha256 == digest GitHub asset == sha256sum lokal file yang
baru di-upload`. Tidak cocok = publish **DIBLOKIR**, asset dihapus,
exit ≠ 0. Ini akar masalah K2 lama (hash mentah vs gzip) yang sudah
pernah kejadian nyata.

**Gerbang 2 — saat reassembly part (khusus tier XL).**
```bash
cat korpus-<kategori>-bersih.jsonl.gz.part00 ... > korpus-<kategori>-bersih.jsonl.gz
sha256sum korpus-<kategori>-bersih.jsonl.gz   # wajib cocok manifest.sha256 (file utuh)
```
Tidak cocok = berhenti, jangan lanjut ke tokenisasi.

**Gerbang 3 — sebelum training (siapa pun yang load korpus).**
```bash
echo "<sha256_dari_manifest>  korpus-<kategori>-bersih.jsonl.gz" | sha256sum -c -
```
Harus `OK`. `FAILED` = jangan training pakai file itu.

Pipa resmi: `raget-tools/publish-korpus-release.py` (korpus),
`raget-tools/publish-checkpoint-release.py` (checkpoint) — keduanya
menghitung hash dari file yang akan diupload, menulis manifest, upload,
lalu verifikasi digest GitHub cocok.

## 5. Alur wajib untuk data baru (checklist "pagar")

Ini yang menjawab langsung **"kalau ada data baru mentah, json/jsonl,
bagaimana cara mengerjakannya biar gak bentrok"**:

1. **Bersihkan + dedupe** data mentah dulu — jangan publish data mentah
   apa adanya.
2. **Ukur**: jumlah dokumen, kata approx, byte gzip, breakdown bahasa
   (%), lisensi per sumber.
3. **Klasifikasi kategori** — pilih SATU dari 5 (§1) berdasarkan ISI,
   bukan urutan kedatangan.
4. **Hitung `size_mb`** dan tentukan tingkat (§3).
5. **Kalau XS (<20MB)**: unduh pack kategori yang sudah ada → gabung
   data baru → dedupe ULANG lintas-file → upload ulang **di tag yang
   sama** (timpa file lama), naikkan `versi` di manifest. **Jangan**
   buat tag baru.
6. **Kalau S/M/L (≥20MB)**:
   - Kategori belum punya file kanonik → publish langsung ke
     `korpus-<kategori>-bersih` (tag baru dibuat sekali di sini saja).
   - Kategori sudah punya file kanonik, data baru MENAMBAH volume →
     unduh yang lama, gabung, dedupe, upload ulang di tag yang sama.
   - Data baru MENGGANTIKAN (mis. sumber sama tapi jauh lebih bersih)
     → tetap tag yang sama, timpa asset lama.
7. **Kalau XL (>1.5GB)**: pecah jadi part sesuai §3.
8. **Tulis/timpa `manifest-<kategori>.json`** skema wajib (§6) — selalu
   ikut ter-upload sebagai asset kedua di Release yang sama.
9. **Retire tag lama** yang isinya sudah sepenuhnya masuk pack/file
   baru — hapus Release-nya, jangan dibiarkan "nganggur". Release aktif
   harus selalu bisa dipetakan 1:1 ke §1/§2.
10. **Update `docs/STATUS-KORPUS-LISENSI.md`** (satu baris per kategori)
    supaya tetap sinkron.

## 5b. Alur khusus: raw → token BPE (rumus yang sebelumnya ambigu)

Ini menjawab langsung **"perhitungan agar menjadi TOKEN BPE
bagaimana"**. Urutan wajib, tidak boleh dibalik atau dilewati:

```
1. RAW               data mentah (dump XML/JSON/parquet dari sumber asli)
        │             — diunggah Grok/dirigen ke Release, tag AD-HOC sementara
        │               (raw TIDAK disimpan permanen - hanya untuk diproses ulang kalau perlu)
        ▼
2. EXTRACT+CLEAN      extract-clean-wikipedia.py / extract-clean-wiktionary.py /
        │             parse-korpus-jilid2.py, dst sesuai jenis sumber
        │             → JSONL {"text":..., "source":..., "license":..., "lang":...}
        ▼
3. DEDUPE             clean-dedupe-korpus-jilid2.py (atau setara) — dedupe berbasis
        │             fingerprint/minhash, BUKAN cuma exact-match string
        ▼
4. FILTER BAHASA      §1.1 - buang non-`id*` sesuai kategori, WAJIB sebelum lanjut
        ▼
5. TOKENIZE BPE       tokenize-chunk-corpus.py, PAKAI TOKENIZER YANG SAMA PERSIS
        │             dengan runtime (vocab 30.368, bpe-tokenizer.json - kalau
        │             tokenizer sumbernya checkpoint, ekstrak dulu lewat
        │             extract-tokenizer-from-checkpoint.py supaya token ID
        │             DIJAMIN identik dengan yang dipakai training - token ID
        │             berbeda = embedding jadi salah tanpa error yang kelihatan)
        ▼
6. CHUNK              rechunk-corpus-window.py — potong jadi window tetap
        │             (126 token + BOS/EOS, konvensi yang sudah dipakai)
        ▼
7. HITUNG             jumlah token hasil langkah 6 = angka BPE RESMI untuk
        │             rak ini (field totalTokenBPEResmi / totalTokenWindow126SetelahRechunk)
        ▼
8. TULIS MANIFEST     manifest-<kategori>.json (skema §6), termasuk sha256
        │             dari file GZIP FINAL (§4 Gerbang 1)
        ▼
9. PUBLISH            Grok/dirigen: publish-korpus-release.py --file ... --tag ...
        │             (LUAR SANDBOX - lihat §0 kenapa Claude berhenti di sini)
        ▼
10. GABUNG KE KANONIK  update raget-data/jsonl/external/korpus-manifest-total.json:
        │              tambah/perbarui entry di kanonik.entries, LALU jalankan
        │              raget-tools/check-korpus-manifest-sync.mjs (WAJIB, lihat
        │              di bawah) sebelum commit
        ▼
11. RE-AUDIT           raget-tools/audit-corpus-tokens.mjs (PRD-RAGET-NEURAL.md
                       Fase A.1) supaya persentase kecukupan data ikut ter-update
```

**Rumus totalnya** (satu-satunya formula resmi untuk "total token
proyek"):

```
totalTokenBPEResmiKanonik = SUM( kanonik.entries[i].totalTokenBPEResmi )   untuk semua rak K1..Kn
```

**Tidak ada cara lain yang sah** untuk menghitung total ini — bukan
dijumlah dari `totalKataApprox` (itu perkiraan kata, bukan token BPE
sungguhan), bukan diketik manual terpisah dari `entries`, dan TIDAK
BOLEH dijumlah dengan angka `staging` (data yang belum lolos
review/dedupe/BPE — lihat kasus nyata MADLAD-400 di §7).

### Bug nyata yang pernah terjadi (contoh kenapa rumus ini harus ditegakkan mekanis)

Ditemukan dan diperbaiki 2026-09-09: `korpus-manifest-total.json`
punya DUA field yang sama-sama mengklaim "satu-satunya total token
valid" — `kanonik.totalTokenBPEResmiKanonik` (543.202.593, dihitung
dari `kanonik.entries` yang sudah diperbarui setelah batch K2/K3
2026-09-02) vs `ringkasanTotal.totalTokenKanonikTerverifikasi`
(471.390.047, angka LAMA dari sebelum batch itu — luput ikut
diperbarui). Selisih 71.812.546 token, cuma ketahuan lewat pengecekan
manual silang, bukan otomatis. **Sudah direkonsiliasi** (lihat commit
yang menyertakan PRD ini) — dan skrip baru
`raget-tools/check-korpus-manifest-sync.mjs` sekarang memverifikasi
mekanis bahwa `ringkasanTotal`/`tokenKanonikPerintahClaude`/
`kekuranganTokenKanonik` SELALU derivasi otomatis dari `kanonik.entries`,
exit 1 kalau ada drift. **Jalankan skrip ini setiap kali
`kanonik.entries` berubah, sebelum commit** — ini rumus/gerbang yang
sebelumnya tidak ada dan sekarang wajib.

## 6. Skema manifest wajib

```json
{
  "kategori": "ensiklopedia",
  "tag": "korpus-ensiklopedia-bersih",
  "tierUkuran": "M",
  "versi": 3,
  "name": "korpus-ensiklopedia-bersih",
  "generatedAt": "2026-08-26",
  "totalDokumen": 683516,
  "totalKataApprox": 305971509,
  "totalByte": 470656011,
  "sha256": "...",
  "format": "jsonl",
  "fields": ["text", "source", "license", "url", "lang"],
  "license": "...",
  "komposisiBahasa": { "id": 0.94, "en-simple": 0.04, "jv": 0.02 },
  "proporsiInternal": { "...": "..." },
  "proporsiAktual": { "...": "..." },
  "rekomendasiCampuranTraining": { "...": "..." },
  "status": "AMAN — siap dipakai training",
  "janganPakai": ["..."]
}
```

Semua field wajib. Tanpa `komposisiBahasa` atau `sha256` = Release
dianggap belum patuh PRD.

## 7. Rumus campuran training (mix ratio)

```
ensiklopedia   : 55–65%
dialog+daerah  : 25–35%   (upsampled)
pelengkap      : 5–15%
```

**Rumus oversample** (kategori kecil yang perlu dinaikkan porsinya):
```
target_share   = porsi yang diinginkan kategori kecil (mis. 0.35)
anchor_bytes   = ukuran byte kategori acuan (biasanya ensiklopedia, boleh disample ke 100-300MB)
small_bytes    = ukuran byte asli kategori kecil (sebelum diulang)
repeat_factor  = ceil( (target_share / (1 - target_share)) * anchor_bytes / small_bytes )
```
Setelah repeat, gabung lalu **shuffle** sebelum tokenisasi (data
mengelompok = model belajar satu jenis dulu, tidak diinginkan).
Verifikasi rasio SELALU dari hitung ulang byte hasil akhir per
kategori (`proporsiAktual` di manifest), bukan diasumsikan dari
`repeat_factor` teoretis.

**Catatan penting** (dari `korpus-manifest-total.json#staging`): angka
`totalKataApprox` dari data staging yang BELUM lolos review/dedupe
TIDAK BOLEH dipakai untuk klaim "total token proyek" — preseden nyata
`panenMadlad400Id` (46 juta dokumen, 8,1 miliar kata approx) di-RETIRE
FINAL 2026-09-02 karena sample manual menunjukkan mayoritas bukan
ensiklopedia (spam/navigasi blog), meski angka kata approx-nya besar.
Angka kata approx BUKAN angka token BPE dan BUKAN jaminan kualitas.

## 8. Status kepatuhan saat ini (dicek ulang 2026-09-09, live GitHub API)

```
node -e "..." via mcp__github__list_releases owner=maetalizer-png repo=Rategoan
```

Release aktif hari ini: **8 tag** — 3 korpus kanonik + 2 checkpoint +
1 tag PRD (Release ini sendiri) + 2 tag penampung baru (lihat catatan
di bawah):

| Tag | Kategori | Status |
|---|---|---|
| `korpus-ensiklopedia-bersih` | K1 | ✅ kanonik, dipakai training |
| `korpus-dialog-daerah-bersih` | K2 | ✅ kanonik, dipakai training |
| `korpus-pelengkap-bersih` | K3 | ✅ kanonik, dipakai training |
| `checkpoint-100m` | checkpoint | ✅ sesuai `CHECKPOINT-POLICY.md` |
| `checkpoint-200m` | checkpoint | ⚠️ lihat catatan — checkpoint 200m TERBARU sudah pindah ke Hugging Face (`huggingface.co/Maetalizer19/rategoan-neural`), bukan Release ini lagi (`korpus-manifest-total.json#checkpoint200m`) — tag Release ini kemungkinan berisi versi lama, JANGAN diasumsikan checkpoint 200m terbaru ada di sini tanpa cek ulang |
| `prd-data-release` | dokumen PRD | Salinan Release dari PRD ini — lihat §0 soal sinkronisasi |
| `korpus-sejarah-indonesia-bersih` | belum masuk kanonik §1 | **Dikonfirmasi via body Release**: *"CC-BY-SA. Belum digabung K1."* — punya `manifest.json` (643B) + satu asset `.jsonl.gz` (564KB), tapi secara eksplisit BELUM digabung ke `korpus-ensiklopedia-bersih`. Perlakukan sebagai kandidat tambahan K1 yang masih menunggu langkah 6b (§5) — bukan bagian kanonik hari ini |
| `korpus-mentah-id` | staging, belum diklasifikasi §1 | **Dikonfirmasi via body Release**: *"Belum sort. CC-BY-SA. Wiki Firecrawl + Wiktionary dump."* — 3 asset `.jsonl.gz` terpisah (dump daerah, kamus, wiki — total ~7,9MB) + `manifest.json` (1,6KB), namanya sendiri ("mentah") dan body-nya ("belum sort") menyatakan BELUM lolos §5 langkah 1-3 (bersihkan+dedupe+klasifikasi kategori). **Jangan dipakai training** sampai diproses lewat alur §5b penuh dan diklasifikasikan ke salah satu dari 5 kategori §1 |

**Dua tag ini contoh nyata kenapa §0 dan §5 penting**: keduanya muncul
2026-09-05 (setelah audit migrasi 2026-08-26, jadi belum tercakup di
riwayat migrasi lama di dokumen sumber), dan judul "(penampung)" di
keduanya sudah dikonfirmasi cocok dengan isi body Release-nya — bukan
staging kosong tanpa keterangan, tapi staging yang sudah diberi
catatan status jelas oleh dirigen. **Langkah berikutnya untuk
keduanya** (Grok/dirigen, luar sandbox): jalankan §5b penuh (`korpus-mentah-id`
perlu classify+clean+dedupe dari nol; `korpus-sejarah-indonesia-bersih`
tinggal langkah gabung ke K1 + hitung ulang token BPE + update
`kanonik.entries` + jalankan `check-korpus-manifest-sync.mjs`) sebelum
dianggap kanonik.

## 9. Resep training per ukuran model (rujukan, tidak diulang penuh di sini)

Arsitektur (dModel/nLayers/nHeads/dFF), throughput, batas batch aman,
rumus token-per-sesi vs target Chinchilla, dan template instruksi/laporan
standar — semua sudah dijelaskan lengkap di
[`PRD-RAGET-NEURAL.md`](PRD-RAGET-NEURAL.md) §1 dan §6 (angka param
sama persis, sudah diverifikasi silang dengan `docs/ARSITEKTUR.md`
§6). Dokumen ini tidak menduplikasi angka itu — cukup menegaskan:
**angka arsitektur di kedua dokumen WAJIB selalu sama**, kalau salah
satu diperbarui yang lain harus ikut diperbarui di commit yang sama.

## 10. Yang TIDAK berubah / catatan tooling usang

- `raget-tools/CHECKPOINT-POLICY.md` tetap berlaku penuh untuk
  checkpoint. PRD ini tidak menggantikannya, hanya menambah aturan
  korpus teks.
- Tokenizer tunggal (vocab 30.368) tetap dipakai semua korpus tanpa
  kecuali — kalau butuh tokenizer dari checkpoint tertentu, ekstrak
  lewat `extract-tokenizer-from-checkpoint.py`, jangan retrain BPE
  baru tanpa alasan kuat (token ID beda = embedding lama tidak
  kompatibel).
- **`raget-tools/merge-korpus-manifest.py` BERISIKO USANG** — skrip
  ini menulis skema lama (`entries`+`totalTokenGabungan`+`targetGerbang`)
  yang JAUH lebih sederhana dari skema `kanonik`/`staging`/`ringkasanTotal`
  yang sekarang dipakai `korpus-manifest-total.json`. **Menjalankan
  skrip ini apa adanya akan MENIMPA manifest kaya-informasi sekarang
  dengan skema lama yang lebih miskin** — JANGAN dijalankan sampai
  skrip ini diperbarui untuk membaca+mempertahankan struktur `kanonik`
  yang ada, atau secara eksplisit digantikan alur §5b di atas.

## 11. Ringkasan mekanisme anti-bentrok (satu paragraf)

Satu kategori = satu tag permanen (§2). Versi hidup di manifest, bukan
di nama tag — tidak ada dua tag untuk hal yang sama. Satu file fisik
per kategori (§3.1) — tidak ada asset terfragmentasi yang harus
disatukan manual saat load. SHA256 tiga gerbang (§4) — data yang rusak/
tertukar terdeteksi sebelum dipakai, bukan sesudah hasil training aneh.
Total token SELALU derivasi mekanis dari `kanonik.entries` (§5b),
diverifikasi `check-korpus-manifest-sync.mjs` — tidak ada dua angka
yang sama-sama "satu-satunya valid". Titik serah terima Claude→Grok
jelas di batas publish Release (§0) — tidak ada dua pihak yang
sama-sama mencoba mempublikasikan hal yang sama secara bersamaan.
