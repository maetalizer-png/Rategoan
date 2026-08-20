# Rategoan

<p>
  <img alt="100% Local-First" src="https://img.shields.io/badge/AI-100%25%20Local--First-2ea44f?style=flat-square">
  <img alt="No Backend" src="https://img.shields.io/badge/backend-none-blue?style=flat-square">
  <img alt="No Build Step" src="https://img.shields.io/badge/build%20step-none-blue?style=flat-square">
  <img alt="PWA" src="https://img.shields.io/badge/type-PWA-informational?style=flat-square">
  <img alt="Bench" src="https://img.shields.io/badge/bench-1180%20kasus%20core--suite%20%7C%20100%25%20lolos-success?style=flat-square">
  <img alt="License" src="https://img.shields.io/badge/license-starter%20kit%20(personal%2Fkomersial)-lightgrey?style=flat-square">
</p>

Chat AI 100% local-first — tanpa server, tanpa API key, tanpa biaya per-pesan.
Seluruh percakapan, memori, dan basis pengetahuan berjalan langsung di
perangkat pengguna lewat Progressive Web App (PWA) murni HTML/CSS/JavaScript
modular (ES6 Modules), tanpa framework dan tanpa build step.

Satu repo ini berisi dua produk yang saling terhubung:

| Produk | Deskripsi |
|---|---|
| **Rategoan** | Kerangka chat inti dengan **Raget**, mesin balasan template/rule-based (bukan model bahasa besar). |
| **Jalanin** ("Jelajah Dunia") | PWA turunan berdiri sendiri di [`travel/`](travel/), asisten perjalanan yang berbagi arsitektur dan basis data yang sama. |

## Daftar Isi

- [Prinsip Desain](#prinsip-desain)
- [Fitur](#fitur)
- [Arsitektur](#arsitektur)
- [Basis Data](#basis-data)
- [Kualitas & Pengujian](#kualitas--pengujian)
- [Menjalankan](#menjalankan)
- [Kustomisasi](#kustomisasi)
- [Status](#status)

## Prinsip Desain

- **100% lokal** — tidak ada panggilan API AI berbayar untuk fitur inti; data
  percakapan tidak pernah meninggalkan perangkat.
- **Deterministik & jujur** — balasan dihasilkan dari pencocokan pola dan data
  terstruktur, bukan generasi probabilistik; saat tidak tahu, mengaku tidak
  tahu alih-alih mengarang.
- **Data terpisah dari kode** — kepribadian, gaya bicara, dan basis
  pengetahuan sepenuhnya ada di file `.json`/`.js`, bisa diganti tanpa
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
- Skor kualitas (Q) yang dihitung dari lima komponen terukur: Akurasi (dari
  feedback nyata), Kekayaan, Utilitas, Kedalaman, Variasi.

**Koleksi**
- Ruang simpan pribadi untuk catatan, tautan, dan hasil chat yang ingin
  disimpan di luar riwayat percakapan.

**Jalanin**
- Rencana perjalanan, jelajah negara dengan konteks budaya, asisten travel,
  offline pack untuk data penting saat tanpa koneksi.

## Arsitektur

```
index.html, css/, js/            kerangka aplikasi (UI, state, riwayat, akun)
js/ai/                            satu-satunya pintu integrasi ke otak AI
utils/                            util murni bersama (dipakai lintas raget/)
raget/                            induk seluruh otak AI Raget
  raget-agents/                   router intent + orkestrasi tool + mesin khusus
  raget-llm/                      mesin balasan berbasis template
  raget-memory/                   memori jangka pendek (konteks) & jangka panjang (fakta)
  raget-database/                 riwayat catatan Q&A lokal (untuk feedback loop)
  raget-retrieval/                pencarian TF-IDF satu pintu lintas sumber
  raget-devlog/                   riwayat pengembangan proyek (dipakai balasan chat)
  raget-dataset/                  persona, few-shot, bench, basis pengetahuan umum
  raget-dataries/                 basis data terstruktur (negara, kota, bahasa, tokoh, dst)
  raget-tools/                    skrip verifikasi: bench runner, pengukuran KV, devlog
vault/                            fitur opt-in: pengingat, kalender, ekspor, importer
travel/                           Jalanin — PWA turunan berdiri sendiri
docs/                             panduan kustomisasi & lisensi (starter kit)
```

### Alur satu pesan

```
Pesan pengguna
  → raget-memory (konteks percakapan + fakta jangka panjang)
  → raget-agents (router intent → deret mesin khusus, lihat di bawah)
  → raget-llm (fallback: pencocokan pola template)
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
| `world-context.js` | Hari internasional, deteksi 5 bahasa, konteks lokasi Jelajah Dunia |
| `intelligence-rumus.js` | Perpustakaan kerangka berpikir/keputusan/belajar (SWOT, 5 Whys, Decision Matrix, dst) |
| `framework-apply.js` | Mode "terapkan" interaktif untuk Decision Matrix, 5 Whys, dan SWOT — sesi tanya-jawab bertahap |
| `tokoh-store.js` | Profil tokoh publik terstruktur (pencapaian, kutipan, trivia, relasi) — 236 entri |
| `kuliner-store.js` | Basis data kuliner dunia terstruktur (asal, bahan utama, trivia), dipecah per-region — 143 entri |
| `daily-briefing.js` | Ringkasan harian personal (acara, pengingat) dengan sapaan dinamis sesuai nama pengguna |
| `feedback-store.js` | Statistik suka/tidak-suka nyata untuk komponen Akurasi (A) |

## Basis Data

`raget/raget-dataries/` berisi lebih dari 1.000 entri terstruktur lintas kategori: negara,
kota, bahasa, tokoh, sains, sejarah, kuliner, olahraga, etika budaya per
negara, dan lainnya — dapat diperluas atau diganti total tanpa menyentuh kode.
`raget/raget-dataset/knowledge/` menyimpan pengetahuan umum berformat factoid sederhana
yang dimuat lewat pencarian satu-pintu.

## Kualitas & Pengujian

Setiap perubahan diverifikasi lewat suite bench Playwright
(`raget/raget-tools/run-bench.mjs`) sebelum dianggap selesai — **1.180 kasus**
core-suite dengan target lolos ≥97% (saat ini 100%), plus 10 kasus stub
informatif (butuh attach file nyata, tidak dihitung ke target). Skor kualitas gabungan
(Q) dan komponen K/A/U/D/V diukur lewat `raget/raget-tools/measure-kv.mjs`
dengan komposisi 100 kueri tetap agar hasil antar-perubahan bisa dibandingkan
apel-ke-apel — skor terakhir **Q=82**.

```
node raget/raget-tools/run-bench.mjs http://localhost:8099
node raget/raget-tools/measure-kv.mjs http://localhost:8099
```

Riwayat lengkap perubahan, keputusan desain, dan kelemahan yang jujur
dilaporkan (bukan disembunyikan) tersimpan di `raget/raget-devlog/` (18 entri,
92 commit) dan bisa ditanyakan langsung ke Raget lewat chat (mis. "sejarahmu",
"perkembangan skormu").

## Menjalankan

JavaScript diorganisir sebagai ES6 Modules, sehingga wajib diakses lewat
server HTTP (bukan `file://`):

```bash
python3 -m http.server 8099
# atau
npx http-server -p 8099
```

Lalu buka `http://localhost:8099/index.html`.

Untuk Jalanin, jalankan server yang sama lalu buka `http://localhost:8099/travel/index.html`.

## Kustomisasi

Rategoan dirancang agar bisa diubah jadi produk lain hanya lewat file data,
tanpa menyentuh kode:

- **Identitas & gaya bicara** → `raget/raget-dataset/persona.json`
- **Basis pengetahuan** → `raget/raget-dataries/` dan `raget/raget-dataset/knowledge/`

Panduan lengkap kustomisasi ada di [`docs/STARTER-KIT.md`](docs/STARTER-KIT.md).
Ketentuan penggunaan dan lisensi ada di [`docs/LICENSE-KIT.md`](docs/LICENSE-KIT.md).

## Status

Kerangka aplikasi, otak AI Raget, dan Jalanin sudah dalam tahap pengembangan
aktif dan berfungsi penuh secara lokal, dengan deployment produksi terverifikasi
berjalan di Vercel. Pengembangan berjalan dalam ronde inkremental yang
masing-masing didokumentasikan di `raget/raget-devlog/` — riwayat lengkapnya,
termasuk kelemahan yang belum tuntas dan rencana lanjutan, tercatat apa
adanya di sana alih-alih di roadmap statis yang cepat basi.
