# Rategoan

<p>
  <img alt="100% Local-First" src="https://img.shields.io/badge/AI-100%25%20Local--First-2ea44f?style=flat-square">
  <img alt="No Backend" src="https://img.shields.io/badge/backend-none-blue?style=flat-square">
  <img alt="No Build Step" src="https://img.shields.io/badge/build%20step-none-blue?style=flat-square">
  <img alt="PWA" src="https://img.shields.io/badge/type-PWA-informational?style=flat-square">
  <img alt="License" src="https://img.shields.io/badge/license-RATEGOAN%20v1.0-blue?style=flat-square">
</p>

Chat AI 100% local-first — tanpa server, tanpa API key, tanpa biaya per-pesan.
Seluruh percakapan, memori, dan basis pengetahuan berjalan langsung di
perangkat pengguna lewat Progressive Web App (PWA) murni HTML/CSS/JavaScript
modular (ES6 Modules), tanpa framework dan tanpa build step.

Repo ini adalah **RATEGOAN**, kerangka chat inti dengan **Raget**, mesin
balasan template/rule-based (bukan model bahasa besar).

## Daftar Isi

- [Prinsip Desain](#prinsip-desain)
- [Fitur](#fitur)
- [Arsitektur](#arsitektur)
- [Basis Data](#basis-data)
- [Kualitas & Pengujian](#kualitas--pengujian)
- [Menjalankan](#menjalankan)
- [Kustomisasi](#kustomisasi)
- [Lisensi](#lisensi)

## Prinsip Desain

- **100% lokal** — tidak ada panggilan API AI berbayar untuk fitur inti; data
  percakapan tidak pernah meninggalkan perangkat.
- **Deterministik & jujur** — balasan dihasilkan dari pencocokan pola dan data
  terstruktur, bukan generasi probabilistik; saat tidak tahu, mengaku tidak
  tahu alih-alih mengarang.
- **Data terpisah dari kode** — kepribadian, gaya bicara, dan basis
  pengetahuan sepenuhnya ada di file `.json` di `raget-data/json/`, bisa diganti tanpa
  menyentuh logic aplikasi.
- **Diverifikasi dengan angka nyata** — setiap perubahan diuji lewat suite
  bench otomatis (Playwright) sebelum dianggap selesai, bukan diasumsikan
  benar.

## Fitur

**Percakapan**
- Riwayat chat tersimpan lokal (IndexedDB), pencarian lintas riwayat & catatan.
- Animasi ketik natural, mode hemat (reduced motion), tema terang/gelap/otomatis.
- Text-to-Speech dan input suara (bila didukung perangkat).
- Ekspor catatan ke PDF/Markdown, impor dari PDF/Notion/Evernote/WhatsApp (opt-in).
- Sapaan harian dinamis yang menyapa nama pengguna yang sedang login.

**Otak AI (Raget)**
- Router intent yang mencoba serangkaian tool khusus sebelum jatuh ke jawaban
  umum: matematika (termasuk soal cerita), pengingat, tanggal, faktual
  dua-bahasa, kuis, dan lebih.
- Toleransi typo, gaya jawaban adaptif, follow-up percakapan yang menjaga
  konteks entitas antar-giliran, termasuk kontinuitas nada emosi (positif
  maupun negatif) lintas beberapa giliran.
- Mode "terapkan" interaktif untuk kerangka berpikir (Decision Matrix, 5
  Whys, SWOT) — bukan cuma menjelaskan definisinya, tapi benar-benar
  menjalankan langkah-langkahnya bareng pengguna lewat sesi tanya-jawab.

**Koleksi**
- **Tersimpan** — pesan & balasan AI yang disimpan manual dari chat, dengan
  tag dan catatan pribadi, dicari dan diekspor (Markdown/JSON).
- **Perpustakaan** — semua yang Raget ingat otomatis: catatan yang diminta
  diingat, fakta pribadi/diajarkan, dan chunk file yang diimpor
  (PDF/Notion/Evernote/WhatsApp).
- **Artefak** — hasil kerja yang muncul otomatis dari chat (draf email,
  kartu negara, ekspor catatan) tanpa perlu tap Simpan.

## Arsitektur

```
index.html, css/, js/            kerangka aplikasi (UI, state, riwayat, akun)
js/ai/                            satu-satunya pintu integrasi ke otak AI
utils/                            util murni bersama (dipakai lintas raget/)
raget/                            induk seluruh otak AI Raget
  raget-agents/                   router intent + orkestrasi tool + mesin khusus + kontrak/router adapter otak
  raget-template/                 otak rule-based/template yang aktif jalan (llm-engine.js, fuzzy-smalltalk.js)
  raget-neural/                   otak neural terlatih tapi nonaktif (transformer JS murni + neural-provider.js)
  raget-llm-lokal/                stub kontrak — model pihak ketiga, SENGAJA TIDAK DIKEJAR (fokus AI di template+neural)
  raget-memory/                   memori jangka pendek (konteks) & jangka panjang (fakta)
  raget-database/                 riwayat catatan Q&A lokal (untuk feedback loop)
  raget-retrieval/                pencarian BM25 satu pintu lintas sumber
  raget-data/                     sumber data resmi — json/ (domain terstruktur), jsonl/ (korpus), neural/ (checkpoint)
  raget-devlog/                   log pengembangan & laporan training (termasuk neural/)
  raget-tools/                    skrip verifikasi: bench runner, pengukuran kualitas, migrasi data
vault/                            fitur opt-in: pengingat, kalender, ekspor, importer
docs/                             struktur data, lisensi korpus, dan peta arsitektur (lihat docs/ARSITEKTUR.md)
```

Peta lengkap otak Raget — Template dan Neural (fokus pengembangan AI
milik sendiri) plus stub LLM Lokal yang sengaja tidak dikejar — kontrak
adapter `init()/ask()/status()`, dan aturan router ada di
[`docs/ARSITEKTUR.md`](docs/ARSITEKTUR.md).

### Alur satu pesan

```
Pesan pengguna
  → raget-memory (konteks percakapan + fakta jangka panjang)
  → raget-agents (router intent → deret mesin khusus, lihat di bawah)
  → raget-agents/engine-router.js (template ↔ neural, llm-lokal tak dikejar — lihat docs/ARSITEKTUR.md)
  → post-processing (rapikan teks, jawaban jujur bila kosong)
  → tampil sebagai balasan + tersimpan ke raget-database
```

`raget/raget-agents/agent.js` mengorkestrasi lebih dari selusin mesin khusus,
masing-masing dicoba berurutan sebelum jatuh ke fallback umum:

| Mesin | Cakupan |
|---|---|
| `math-engine.js` | Parser matematika aman (tanpa `eval`): aritmatika, konversi satuan/mata uang, soal cerita harga & persen |
| `bilingual.js` | Deteksi ID/EN, faktual dan terjemahan frasa dasar dua bahasa |
| `knowledge-graph.js` | Deskripsi negara adaptif, follow-up dialog lintas giliran |
| `answer-composer.js` | Koreksi typo (Levenshtein + fonetik) |
| `stem-engine.js` | Aljabar, geometri, statistika, kalkulus ringan, fisika, konsep teknologi, biologi |
| `social-engine.js` | Intent sosial (curhat, diskusi, humor, motivasi), kerangka customer service |
| `context-engine.js` | Sapaan sadar-waktu, klasifikasi situasi, deteksi darurat dengan hotline, kontinuitas emosi lintas giliran |
| `intelligence-rumus.js` | Perpustakaan kerangka berpikir/keputusan/belajar (SWOT, 5 Whys, Decision Matrix, dst) |
| `framework-apply.js` | Mode "terapkan" interaktif untuk Decision Matrix, 5 Whys, dan SWOT — sesi tanya-jawab bertahap |
| `tokoh-store.js` | Profil tokoh publik terstruktur (pencapaian, kutipan, trivia, relasi) |
| `kuliner-store.js` | Basis data kuliner dunia terstruktur (asal, bahan utama, trivia), dipecah per-region |
| `daily-briefing.js` | Ringkasan harian personal (acara, pengingat) dengan sapaan dinamis sesuai nama pengguna |
| `feedback-store.js` | Statistik suka/tidak-suka untuk mengukur kualitas jawaban |

## Basis Data

`raget/raget-data/json/` adalah satu-satunya sumber data domain, dimuat lewat
loader tipis `raget-agents/dataries-registry.js` (fetch JSON → bentuk
`{text, metadata}`). Domain mencakup: negara, kota, bahasa, tokoh, sains,
sejarah, wisata, kuliner/makanan, olahraga, etika, minuman, platform, ekonomi,
peluang, penemuan, alam, seni-budaya, mata pelajaran sekolah & kuliah, dan
`sapaan/` (smalltalk harian, dimuat langsung oleh `raget-template/llm-engine.js`).

Skema data seragam di seluruh domain: `{id, kategori, wilayah, nama, tags,
teks, meta}` — file `.json` biasa, gampang ditambah/diedit tanpa menyentuh
kode aplikasi. Lihat [`docs/DATA-STRUCTURE.md`](docs/DATA-STRUCTURE.md) untuk
cara menambah domain data sendiri.

## RAGET Neural (belum aktif menjawab)

Panel Model di UI menampilkan dua pilihan: **Raget Template** (aktif, selalu
bisa dipilih) dan **Raget Neural** (ditandai belum bisa dipakai). Di balik
layar Raget Neural adalah eksperimen jaringan neural (transformer kecil yang
ditulis dari nol dalam JavaScript murni, bukan wrapper provider apa pun) di
`raget/raget-neural/`. Bobotnya sudah dilatih nyata, tapi output
generasinya **belum koheren secara gramatikal** — karena itu fitur ini
dikunci nonaktif (`NEURAL_ANSWERS_ENABLED = false` di `js/ai/ai.js`, dan
`status().ready === false` di `raget-neural/neural-adapter.js`) dan jawaban
tetap sepenuhnya dari mesin rule-based/template di atas sampai generasinya
benar-benar layak pakai. Detail kontrak adapter dan cara melanjutkan tiap
lapis ada di [`docs/ARSITEKTUR.md`](docs/ARSITEKTUR.md).

## Kualitas & Pengujian

Setiap perubahan lewat dua gerbang sebelum dianggap selesai:

1. **Lint/syntax** (`raget/raget-tools/lint-check.mjs`) — `node --check` di
   seluruh file `.js`/`.mjs` + ESLint dengan aturan correctness-only
   (variabel tak terdefinisi, import/export salah, dead code jelas — bukan
   gaya penulisan).
2. **Bench Playwright** (`raget/raget-tools/run-bench.mjs`) — ratusan kasus
   uji otomatis lintas domain dengan target lolos tinggi, dicek ulang di
   browser sungguhan (bukan asumsi).

```bash
npm run lint     # atau: node raget/raget-tools/lint-check.mjs
npm run bench    # atau: node raget/raget-tools/run-bench.mjs http://localhost:8099
npm run measure-kv
```

## Menjalankan

JavaScript diorganisir sebagai ES6 Modules, sehingga wajib diakses lewat
server HTTP (bukan `file://`):

```bash
python3 -m http.server 8099
# atau
npx http-server -p 8099
```

Lalu buka `http://localhost:8099/index.html`.

## Kustomisasi

Rategoan dirancang agar bisa diubah jadi produk lain hanya lewat file data,
tanpa menyentuh kode:

- **Identitas & gaya bicara** → `raget/raget-devlog/json/persona.json`
- **Basis pengetahuan** → `raget/raget-data/json/` (domain terstruktur) dan `raget/raget-data/json/pengetahuan/`

## Lisensi

Ketentuan penggunaan dan lisensi lengkap ada di [`LICENSE.md`](LICENSE.md).
Pertanyaan atau izin komersial: **maetalizer@gmail.com**.
