# Rategoan Starter Kit — Panduan Cepat

Chat AI local-first berbasis template engine — tanpa server, tanpa API key,
100% jalan di perangkat pengguna. Kit ini adalah kerangka lengkap yang siap
dikustomisasi jadi produk Anda sendiri.

## Quickstart (3 menit)

1. **Buka `index.html` langsung di browser**, atau jalankan server statis lokal:
   ```
   python3 -m http.server 8099
   ```
   lalu buka `http://localhost:8099/index.html`.
2. **Ganti identitas** di `raget/raget-devlog/json/persona.json` — nama asisten, gaya bicara,
   aturan balasan. Tidak perlu sentuh kode sama sekali.
3. **Ganti data pengetahuan** di folder `raget/raget-data/json/` (domain terstruktur) dan
   `raget/raget-data/json/knowledge/` — tambah/ganti file `.json`/`.js` sesuai domain Anda
   (lihat bagian Kustomisasi).
4. Selesai — buka di browser, chat langsung berjalan dengan identitas baru.

## Struktur Folder

```
index.html, css/, js/          kerangka aplikasi (UI, state, riwayat, akun)
raget/raget-agents/                       router intent + orkestrasi tools
raget/raget-llm/                   mesin balasan berbasis template
raget/raget-memory/, raget/raget-database/  memori jangka pendek/panjang + riwayat lokal
raget/raget-devlog/json/                    persona, fewshot, metadata (tentang Rategoan sendiri)
raget/raget-data/json/                      basis data dunia (negara, kota, bahasa, dst) + knowledge/
raget/raget-dataries/                       loader tipis untuk data terstruktur
reminders/ export/ email/       fitur tambahan (pengingat, ekspor, email)
calendar/ ocr/ translate/       fitur opt-in (butuh paket unduhan sekali)
pdf/ notion/ evernote/ whatsapp/ importer sumber pengetahuan pribadi
jalanin/                        contoh PWA turunan berdiri sendiri
```

## Kustomisasi Tanpa Kode

Semua ini bisa diganti dengan hanya mengedit file data (`.json`/`.js`), **tidak
perlu menyentuh logic**:

- **Kepribadian & gaya bicara** → `raget/raget-devlog/json/persona.json`
- **Contoh gaya balasan** → `raget/raget-devlog/json/fewshot.json`
- **Pengetahuan umum tentang produk Anda** → `raget/raget-data/json/knowledge/*.json`
- **Basis data dunia** (negara, kota, bahasa, makanan, wisata, tokoh, sains,
  olahraga, sejarah, alam, penemuan, seni-budaya, ekonomi) → folder `raget/raget-data/json/`
  (domain sudah dimigrasi, skema `{id, kategori, wilayah, nama, tags, teks, meta}`) atau
  `raget/raget-dataries/` (domain belum dimigrasi, format array objek `{ text, metadata }`,
  kompak 2-4 baris per item)
- **Aturan struktur jawaban** → `raget/raget-devlog/json/metadata/answer-rules.json`
- **Kasus uji regresi** → `raget/raget-tools/bench.json`

## Syarat Pakai

- Butuh browser modern yang mendukung ES6 Modules dan Service Worker.
- Beberapa fitur (baca gambar/OCR, terjemahan offline, impor PDF/Notion)
  butuh paket unduhan satu kali dari CDN publik — lihat `docs/LICENSE-KIT.md`
  untuk batasan pemakaian, dan Settings > Unduhan Fitur di aplikasi.
- Tidak ada API key yang dibutuhkan untuk fitur inti chat/data lokal.
- Lihat `docs/LICENSE-KIT.md` sebelum menjual ulang atau mendistribusikan.
