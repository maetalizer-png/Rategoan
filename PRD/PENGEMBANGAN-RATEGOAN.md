# Pengembangan Rategoan

Satu file app. Bukan korpus, bukan Release.
Vercel = panggung bangun. Nanti server sendiri.
Dua otak: **Raget Template** + **Raget 1.0**. Jangan semat model pihak lain.

Jalur: pesan → memori/bahan → rute → Template atau 1.0 → mutu → jawaban.

---

## Sudah dikerjakan

- [x] Chat PWA, riwayat, cari riwayat
- [x] Template jalan (aturan + JSON + retrieval)
- [x] Raget 1.0 bisa dipilih (checkpoint ada; kalimat sering belum koheren)
- [x] Router dua otak + fallback
- [x] Memori singkat/panjang, ingat fakta
- [x] Kamera / foto / file
- [x] Pencarian web + simpan koleksi
- [x] Slide + panel kanan + PPTX
- [x] Tanya koleksi
- [x] Saklar berpikir / riset
- [x] Proyek (sheet, bukan prompt)
- [x] Daftar artefak slide
- [x] Belajar terpandu
- [x] Nama model bersih, login bersih, toast acak mati
- [x] Registry mesin (`raget/raget-runtime/mesin.js`)
- [x] Antrian jadwal lokal (belum kirim keluar)

---

## Harus dikerjakan (urut)

### 1. Stabilkan otak — kerjakan dulu

- [ ] Status 1.0 nyata: idle / loading / ready / error (sekarang `ready` palsu)
- [ ] Prefetch model di belakang; chat jangan menggantung
- [ ] Timeout 1.0 → Template segera
- [ ] Perangkai web: banyak sumber, paragraf utuh (bukan 1 wiki)
- [ ] Berpikir: nalar, bukan 4 baris template
- [ ] Riset: beberapa sumber, bukan 1 kali wiki
- [ ] Satukan rute (`router-intent` / `turn-pipeline` / `flow-hub`), jangan hapus tool lama

### 2. Naikkan Template

- [ ] Perbaiki intent yang sering salah / unmatched
- [ ] Retrieval lebih tepat (sinonim, konteks)
- [ ] Multi-turn tidak kehilangan entitas
- [ ] Tool routing akurat

### 3. Mutu Raget 1.0

- [ ] Kalimat Indonesia utuh, tidak acak
- [ ] Jawaban pendek koheren dulu, baru multi-turn
- [ ] Fakta tetap dari Template/tool, 1.0 merangkai bahasa

### 4. State & UI

- [ ] Artefak selain slide (laporan, kode)
- [ ] Halaman proyek penuh
- [ ] History panjang: potong DOM, jangan menumpuk
- [ ] Data besar di IndexedDB; preferensi kecil di localStorage

### 5. Server sendiri — setelah 1–3

- [ ] `mesin.setServerBase` hidup
- [ ] Konektor (Drive/WA) + kirim jadwal
- [ ] Mode server terlihat: prompt keluar perangkat

### 6. Belum

- [ ] Studio kode
- [ ] Jangan: gen gambar/video/musik pihak lain, community, toko plugin

---

## Aturan

Hanya dua otak. Satu rute. Fakta bukan tugas 1.0. `ready` harus benar-benar siap. Jangan rusak Template.
