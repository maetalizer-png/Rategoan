# Struktur Data

Rategoan memisahkan data ke dua akar berdasarkan **tentang apa** datanya,
lalu di dalam tiap akar memisahkan lagi berdasarkan **bentuk file**:

- **`raget/raget-data/`** — data dunia: pengetahuan tentang negara, kota,
  bahasa, wisata, sejarah, sains, dan domain-domain lain yang Rategoan bisa
  jawab. Tidak spesifik ke Rategoan sendiri.
- **`raget/raget-devlog/`** — data tentang Rategoan sendiri: kepribadian
  (`persona.json`), contoh gaya balasan (`fewshot.json`), aturan format
  jawaban, dan riwayat pengembangan proyek (devlog).

Di dalam tiap akar:

| Subfolder | Isi |
|---|---|
| `json/` | Data terstruktur, satu file/folder per domain |
| `jsonl/` | Data baris-per-baris (korpus, daftar datar) |
| `neural/` | Artefak biner untuk mesin neural eksperimental (checkpoint `.safetensors`, laporan training) |

`raget-data/neural/` menyimpan bobot model; `raget-devlog/neural/` menyimpan
laporan/log dari eksperimen training itu (`training-report.json`,
`compute-budget-report.json`, dst) — beda isi, sama-sama "seputar neural".

`raget-devlog/sejarah/` (narasi historis per-ronde) dan `raget-devlog/index.js`
(agregator devlog) tetap di akar `raget-devlog/`, tidak ikut masuk
`json/`/`jsonl/`/`neural/` — keduanya bagian dari mesin devlog itu sendiri,
bukan data mentah.

`raget/raget-tools/bench.json` (kasus uji regresi rule engine) hidup di
`raget-tools/` bersama skrip yang memakainya (`run-bench.mjs`), bukan di
`raget-data/` — isinya soal tes, bukan pengetahuan.

## Dua Mekanisme Baca Data Dunia

Domain di `raget-data/json/` dibaca lewat dua jalur berbeda tergantung
kapan domain itu ditulis:

**1. Lewat `raget-agents/dataries-registry.js` (`dataries.loadRegion(group, id)`)** —
dipakai domain hasil migrasi Fase B: `negara`, `kota`, `bahasa`, `etika`,
`minuman`, `wisata`, `sejarah`, `makanan`, `alam`, `sains`, `olahraga`.
`index.js` mendaftarkan tiap domain ini di `JSON_MIGRATED_GROUPS`, lalu
`loadRegionFromJson()` melakukan `fetch()` ke
`raget-data/json/<domain>/<id>.json` dan membentuk ulang tiap entri jadi
bentuk lama `{text, metadata}` — supaya `dataries-bridge.js` dan seluruh
pipeline resolusi entitas tidak perlu tahu format aslinya berubah.

**2. Loader tipis khusus per domain** — dipakai domain yang punya query
lebih spesifik dari pola generik dataries: `tokoh-store.js` (fetch
`raget-data/json/tokoh/tokoh.json`), `kuliner-store.js` (fetch per-region
`raget-data/json/kuliner/<region>.json`), `world-context.js` (fetch
`raget-data/json/hari-internasional/hari-internasional.json`), dan
`llm-engine.js` (fetch `raget-data/json/sapaan/sapaan.json` + daftar
`SAPAAN_EXTRA_FILES` untuk file sapaan-*.json lainnya). Masing-masing
loader ini cache hasil fetch dan expose fungsi query sendiri (`find*/try*`),
bukan lewat `dataries.loadRegion()`.

Catatan: `dataries-registry.js` dulu JUGA mendaftarkan `sapaan` dan
`greeting` di `REGIONS`/`JSON_MIGRATED_GROUPS` (jalur #1), padahal
`llm-engine.js` (jalur #2) sudah jadi satu-satunya konsumen nyata —
tidak ada kode lain yang pernah memanggil `dataries.loadRegion('sapaan', ...)`
atau `loadAll('sapaan'/'greeting')`. Registrasi ganda yang mati itu (plus
folder `greeting/` yang isinya duplikat penuh dari `sapaan/`, tidak
pernah dibaca sama sekali) sudah dihapus - `sapaan/` sekarang murni
domain jalur #2.

Skema unified di balik `raget-data/json/*/*.json` sama untuk kedua jalur:

```json
{ "id": "...", "kategori": "...", "wilayah": "...", "nama": "...", "tags": [], "teks": "...", "meta": { } }
```

`teks` adalah kalimat siap tampil; `meta` menyimpan field spesifik domain
(mis. `capital`/`population`/`currency` untuk negara, `topic` untuk
sains/olahraga). Skrip migrasi (`raget-tools/migrate-*-domain.mjs`) yang
menghasilkan file-file ini sudah dijalankan dan diarsipkan — jangan
dijalankan ulang kalau sumber JS aslinya sudah dihapus.

## `raget-dataries/` yang Belum Dimigrasi

`raget-dataries/` sekarang folder DATA murni (loader/logika sudah dipindah
ke `raget-agents/dataries-registry.js`). Sebagian domain masih berupa folder
`.js` literal (belum masuk skema unified): folder `sapaan/` dan `tokoh/` legacy
(entri ringkas
terpisah dari `raget-data/json/sapaan|tokoh`, dijangkau lewat
`trySiapaTokoh()` di `bridge-extras.js` — bukan duplikasi, tapi pendalaman
sudut pandang lain). Domain-domain ini dimuat lewat jalur `.js` asli
(`import()` lazy per region, didaftarkan di `REGIONS`), bukan
`loadRegionFromJson()`.

## `raget-data/json/pengetahuan/`

Pengetahuan umum berformat factoid sederhana (`{q,a}`, `{subject,answer}`,
atau `{title,text}`) — dipakai `memoryIndex.search()` (retrieval TF-IDF)
sebagai fallback saat tidak ada match terstruktur dari dataries. Dulu ada
di `raget-dataset/knowledge/`, lalu `raget-data/json/knowledge/`, sekarang
`raget-data/json/pengetahuan/` (nama Indonesia, konsisten dengan folder
domain lain) sebagai saudara folder-folder domain lainnya (bukan di bawah
domain manapun — `dataries-ke-korpus.mjs` sengaja mengecualikannya dari
loop domain unified karena bentuknya beda).

## `raget-data/jsonl/`

- **`raget_own_corpus.jsonl`** — korpus latih milik Rategoan sendiri,
  dihasilkan `raget-tools/dataries-ke-korpus.mjs` dari gabungan
  `raget-devlog/json/{persona,fewshot}` + `raget-data/json/pengetahuan/*` +
  `raget-data/json/*/*.json` (domain unified). Dipakai training neural
  eksperimental, bukan rule engine.
- **`languages.jsonl`** — versi teks polos entri bahasa, dipakai sebagai
  cadangan pencarian umum lewat `memoryIndex.search()`.
- **`sumber-eksternal/`** — titik penerimaan teks korpus eksternal
  (lihat `raget-tools/tambah-korpus-eksternal.mjs`); kosong sampai ada
  sumber yang divalidasi dan ditaruh di sini.

## Aturan Kebersihan Data

- **Tanpa komentar** di file data (`.js`/`.json`/`.jsonl`) — komentar
  banner dekoratif (`// ====`) tidak menambah nilai pencarian dan hanya
  menambah ukuran file. Penjelasan tentang suatu entri harus masuk ke
  `teks`/`text` atau `meta`/`metadata`, bukan komentar kode.
- **Tanpa emoji** di file data — termasuk emoji bendera negara yang
  sebelumnya dipakai sebagai penanda bagian. Emoji pada balasan chat
  (dibatasi maksimal satu lewat `quality.guardEmoji()`) adalah keputusan
  lapisan orkestrasi (`raget-agents/`), bukan lapisan data.
