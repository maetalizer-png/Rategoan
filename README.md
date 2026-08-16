# Rategoan

Chat AI 100% local-first — tanpa server, tanpa API key, tanpa biaya per-pesan.
Seluruh percakapan, memori, dan basis pengetahuan berjalan langsung di
perangkat pengguna lewat Progressive Web App (PWA) murni HTML/CSS/JavaScript
modular (ES6 Modules), tanpa framework dan tanpa build step.

Satu repo ini berisi dua produk yang saling terhubung:

- **Rategoan** — kerangka chat inti dengan "Raget", mesin balasan
  template/rule-based (bukan model bahasa besar).
- **Jalanin** ("Jelajah Dunia") — PWA turunan berdiri sendiri di `travel/`,
  asisten perjalanan yang berbagi arsitektur dan basis data yang sama.

---

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

**Otak AI (Raget)**
- Router intent yang mencoba serangkaian tool khusus sebelum jatuh ke jawaban
  umum: matematika, pengingat, tanggal, faktual dua-bahasa, kuis, dan lebih.
- Toleransi typo, gaya jawaban adaptif, follow-up percakapan yang menjaga
  konteks entitas across giliran.
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
index.html, css/, js/       kerangka aplikasi (UI, state, riwayat, akun)
js/ai/                       satu-satunya pintu integrasi ke otak AI
ai-agent/                    router intent + orkestrasi tool + mesin khusus
rategoan-llm/                mesin balasan berbasis template
raget-memory/                memori jangka pendek (konteks) & jangka panjang (fakta)
raget-database/              riwayat catatan Q&A lokal (untuk feedback loop)
raget-retrieval/             pencarian TF-IDF satu pintu lintas sumber
raget-devlog/                riwayat pengembangan proyek (dipakai balasan chat)
dataset/                     persona, few-shot, bench, basis pengetahuan umum
dataries/                    basis data terstruktur (negara, kota, bahasa, tokoh, dst)
vault/                       fitur opt-in: pengingat, kalender, ekspor, importer
travel/                      Jalanin — PWA turunan berdiri sendiri
tools/                       skrip verifikasi: bench runner, pengukuran KV, devlog
docs/                        panduan kustomisasi & lisensi (starter kit)
```

### Alur satu pesan

```
Pesan pengguna
  → raget-memory (konteks percakapan + fakta jangka panjang)
  → ai-agent (router intent → deret mesin khusus, lihat di bawah)
  → rategoan-llm (fallback: pencocokan pola template)
  → post-processing (rapikan teks, jawaban jujur bila kosong)
  → tampil sebagai balasan + tersimpan ke raget-database
```

`ai-agent/agent.js` mengorkestrasi kurang lebih selusin mesin khusus,
masing-masing dicoba berurutan sebelum jatuh ke fallback umum:

| Mesin | Cakupan |
|---|---|
| `math-engine.js` | Parser matematika aman (tanpa `eval`): aritmatika, konversi satuan/mata uang |
| `bilingual.js` | Deteksi ID/EN, faktual dan terjemahan frasa dasar dua bahasa |
| `knowledge-graph.js` | Deskripsi negara adaptif, follow-up dialog lintas giliran |
| `answer-composer.js` | Koreksi typo (Levenshtein + fonetik) |
| `stem-engine.js` | Aljabar, geometri, statistika, kalkulus ringan, fisika, konsep teknologi, biologi |
| `social-engine.js` | Intent sosial (curhat, diskusi, humor, motivasi), kerangka customer service |
| `context-engine.js` | Sapaan sadar-waktu, klasifikasi situasi, deteksi darurat dengan hotline |
| `world-context.js` | Hari internasional, deteksi 5 bahasa, konteks lokasi Jelajah Dunia |
| `intelligence-rumus.js` | Perpustakaan kerangka berpikir/keputusan/belajar (SWOT, 5W1H, dst) |
| `tokoh-store.js` | Profil tokoh publik terstruktur (pencapaian, kutipan, trivia, relasi) |
| `feedback-store.js` | Statistik suka/tidak-suka nyata untuk komponen Akurasi (A) |

## Basis Data

`dataries/` berisi lebih dari 1.000 entri terstruktur lintas kategori: negara,
kota, bahasa, tokoh, sains, sejarah, kuliner, olahraga, etika budaya per
negara, dan lainnya — dapat diperluas atau diganti total tanpa menyentuh kode.
`dataset/knowledge/` menyimpan pengetahuan umum berformat factoid sederhana
yang dimuat lewat pencarian satu-pintu.

## Kualitas & Pengujian

Setiap perubahan diverifikasi lewat suite bench Playwright
(`tools/run-bench.mjs`) sebelum dianggap selesai — 841 kasus core-suite
dengan target lolos ≥97%. Skor kualitas gabungan (Q) dan komponen K/A/U/D/V
diukur lewat `tools/measure-kv.mjs` dengan komposisi 100 kueri tetap agar
hasil antar-perubahan bisa dibandingkan apel-ke-apel.

```
node tools/run-bench.mjs http://localhost:8099
node tools/measure-kv.mjs http://localhost:8099
```

Riwayat lengkap perubahan, keputusan desain, dan kelemahan yang jujur
dilaporkan (bukan disembunyikan) tersimpan di `raget-devlog/` dan bisa
ditanyakan langsung ke Raget lewat chat (mis. "sejarahmu", "perkembangan
skormu").

## Menjalankan

JavaScript diorganisir sebagai ES6 Modules, sehingga wajib diakses lewat
server HTTP (bukan `file://`):

```
python3 -m http.server 8099
# atau
npx http-server -p 8099
```

Lalu buka `http://localhost:8099/index.html`.

Untuk Jalanin, jalankan server yang sama lalu buka `http://localhost:8099/travel/index.html`.

## Kustomisasi

Rategoan dirancang agar bisa diubah jadi produk lain hanya lewat file data,
tanpa menyentuh kode:

- **Identitas & gaya bicara** → `dataset/persona.json`
- **Basis pengetahuan** → `dataries/` dan `dataset/knowledge/`

Panduan lengkap kustomisasi ada di [`docs/STARTER-KIT.md`](docs/STARTER-KIT.md).
Ketentuan penggunaan dan lisensi ada di [`docs/LICENSE-KIT.md`](docs/LICENSE-KIT.md).

## Status

Kerangka aplikasi, otak AI Raget, dan Jalanin sudah dalam tahap pengembangan
aktif dan berfungsi penuh secara lokal. Pengembangan berjalan dalam ronde
inkremental yang masing-masing didokumentasikan di `raget-devlog/` — riwayat
lengkapnya, termasuk kelemahan yang belum tuntas dan rencana lanjutan,
tercatat apa adanya di sana alih-alih di roadmap statis yang cepat basi.
