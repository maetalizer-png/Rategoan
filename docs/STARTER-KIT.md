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
2. **Ganti identitas** di `dataset/persona.json` — nama asisten, gaya bicara,
   aturan balasan. Tidak perlu sentuh kode sama sekali.
3. **Ganti data pengetahuan** di folder `dataries/` dan `dataset/knowledge/` —
   tambah/ganti file `.json`/`.js` sesuai domain Anda (lihat bagian Kustomisasi).
4. Selesai — buka di browser, chat langsung berjalan dengan identitas baru.

## Struktur Folder

```
index.html, css/, js/          kerangka aplikasi (UI, state, riwayat, akun)
ai-agent/                       router intent + orkestrasi tools
rategoan-llm/                   mesin balasan berbasis template
raget-memory/, raget-database/  memori jangka pendek/panjang + riwayat lokal
dataset/                        persona, fewshot, bench, pengetahuan umum
dataries/                       basis data terstruktur (negara, kota, bahasa, dst)
reminders/ export/ email/       fitur tambahan (pengingat, ekspor, email)
calendar/ ocr/ translate/       fitur opt-in (butuh paket unduhan sekali)
pdf/ notion/ evernote/ whatsapp/ importer sumber pengetahuan pribadi
jalanin/                        contoh PWA turunan berdiri sendiri
```

## Kustomisasi Tanpa Kode

Semua ini bisa diganti dengan hanya mengedit file data (`.json`/`.js`), **tidak
perlu menyentuh logic**:

- **Kepribadian & gaya bicara** → `dataset/persona.json`
- **Contoh gaya balasan** → `dataset/fewshot.json`
- **Pengetahuan umum tentang produk Anda** → `dataset/knowledge/*.json`
- **Basis data dunia** (negara, kota, bahasa, makanan, wisata, tokoh, sains,
  olahraga, sejarah, alam, penemuan, seni-budaya, ekonomi) → folder `dataries/`,
  format array objek `{ text, metadata }`, kompak (2-4 baris per item)
- **Aturan struktur jawaban** → `dataset/metadata/answer-rules.json`
- **Kasus uji regresi** → `dataset/bench.json`

## Syarat Pakai

- Butuh browser modern yang mendukung ES6 Modules dan Service Worker.
- Beberapa fitur (baca gambar/OCR, terjemahan offline, impor PDF/Notion)
  butuh paket unduhan satu kali dari CDN publik — lihat `docs/LICENSE-KIT.md`
  untuk batasan pemakaian, dan Settings > Unduhan Fitur di aplikasi.
- Tidak ada API key yang dibutuhkan untuk fitur inti chat/data lokal.
- Lihat `docs/LICENSE-KIT.md` sebelum menjual ulang atau mendistribusikan.
