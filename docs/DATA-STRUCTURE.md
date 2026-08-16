# Struktur Data: Dua Lapisan

Rategoan menyimpan pengetahuan dalam dua lapisan yang sengaja dipisah,
dengan tanggung jawab berbeda: `raget/raget-dataset/` untuk pengetahuan
teks polos, dan `raget/raget-dataries/` untuk data terstruktur yang bisa
dicari/difilter secara programatis.

## Tabel Dua Lapisan

| | `raget-dataset/` | `raget-dataries/` |
|---|---|---|
| Isi | Teks siap tampil, tanpa field pencarian | Teks siap tampil + `metadata` terstruktur |
| Format | `.json` (array objek) atau `.jsonl` (satu objek per baris) | `.js` (array objek, di-`import()` lazy per region) |
| Dipakai lewat | `memoryIndex.search()` — pencarian TF-IDF umum | `dataries.loadRegion(group, id)` — query terarah per field |
| Contoh isi | Pengetahuan umum, FAQ, resep, produktivitas | Negara, kota, bahasa (dengan sapaan), tokoh, wisata |
| Kapan dipakai | Fallback pengetahuan umum saat tidak ada match terstruktur | Jawaban faktual presisi (ibukota, populasi, sapaan bahasa, dst) |

Kedua lapisan bisa memuat topik yang sama dari sudut berbeda — lihat
contoh `languages` di bawah.

## Aturan Per-Entri

**Lapisan `raget-dataset/` (teks polos):**
```json
{ "text": "Kalimat pengetahuan siap tampil, satu fakta per entri." }
```
- Tidak ada field metadata tambahan — kalau butuh field terstruktur, taruh
  di `raget-dataries/`, bukan di sini.
- File `.jsonl`: satu objek JSON valid per baris, tanpa koma di akhir baris
  dan tanpa array pembungkus.
- File `.json` (mis. `knowledge/*.json`): array objek `{ "title", "text" }`
  — `title` opsional, dipakai untuk pencarian judul.

**Lapisan `raget-dataries/` (terstruktur):**
```js
{ text: 'Kalimat deskripsi siap tampil...', metadata: { /* field per folder */ } }
```
- Skema `metadata` lengkap per folder ada di
  [`docs/DATARIES-SCHEMA.md`](DATARIES-SCHEMA.md).
- Setiap folder region terdaftar di `raget-dataries/index.js` lewat
  `REGIONS` dan dimuat lazy — folder baru wajib didaftarkan di situ.

## Contoh: `languages`

Data bahasa hidup di kedua lapisan sekaligus, dengan peran berbeda:

- **`raget-dataries/languages/`** — entri per bahasa dengan metadata penuh
  (`speakers`, `script`, `family`, `officialIn[]`, `greetings{halo,pagi,terimakasih}`).
  Ini yang dipakai router intent untuk menjawab pertanyaan presisi seperti
  "apa bahasa di Jepang" atau "halo dalam bahasa Arab".
- **`raget-dataset/languages.jsonl`** — versi teks polos dari entri yang
  sama (130 baris), tanpa metadata, dipakai sebagai cadangan pencarian umum
  lewat `memoryIndex.search()` bila router intent tidak menemukan match
  terstruktur.
- **`raget-dataries/lingo/`** — entri bahasa per negara dengan metadata
  lebih sederhana (`code`, `speakers`, `family`, `script`, `status`),
  cakupan region ASEAN-sentris; pelengkap `languages/` untuk sudut pandang
  per negara.

## Aturan Kebersihan Data

- **Tanpa komentar** di file data (`.js`/`.json`/`.jsonl`) — komentar
  banner dekoratif (`// ====`) tidak menambah nilai pencarian dan hanya
  menambah ukuran file. Penjelasan tentang suatu entri harus masuk ke
  `text` atau `metadata`, bukan komentar kode.
- **Tanpa emoji** di file data — termasuk emoji bendera negara yang
  sebelumnya dipakai sebagai penanda bagian. Emoji pada balasan chat
  (dibatasi maksimal satu lewat `quality.guardEmoji()`) adalah keputusan
  lapisan orkestrasi (`raget-agents/`), bukan lapisan data.
