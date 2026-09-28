# Pengembangan Rategoan

Khusus aplikasi. Bukan korpus, bukan Release, bukan BPE.

Vercel = panggung bangun. Nanti server sendiri. Dua otak: **Raget Template** + **Raget 1.0**. Jangan semat model pihak lain.

## Mesin wajib

| Mesin | Status |
|---|---|
| Otak Template | Ada, jalan |
| Otak Raget 1.0 | Ada; jawaban sering belum koheren |
| Perencana (rute mode) | Ada; masih tumpang dengan intent lama |
| Bahan (file, kamera, web, koleksi, chat) | Ada |
| Perangkai | Kerangka ada; hasil web masih dangkal |
| Kanvas slide + PPTX + daftar artefak | Ada |
| Ingat + proyek | Ada |
| Belajar terpandu | Ada |
| Jadwal lokal | Antrian ada; kirim keluar belum |
| Konektor | Port saja, belum hidup |
| Studio kode | Belum |
| Server app | Belum |

Jangan dibuat di dalam Raget: gen gambar/video/musik pihak lain, community, toko plugin.

## Ceklis pintu

- [x] Chat + riwayat
- [x] Kamera / foto / file
- [x] Pencarian web
- [x] Slide + panel + PPTX
- [x] Koleksi + tanya koleksi
- [x] Berpikir / riset (saklar)
- [x] Proyek (sheet)
- [x] Artefak (daftar slide)
- [x] Belajar terpandu
- [x] Nama model bersih, login bersih, toast acak mati
- [ ] Artefak selain slide
- [ ] Halaman proyek penuh
- [ ] Jawaban web setara app lain

## Disempurnakan dulu (bukan fitur baru)

1. Perangkai web — multi sumber, paragraf utuh.
2. Berpikir — bukan 4 baris template.
3. Riset — bukan 1 kali wiki.
4. Raget 1.0 — mutu kalimat.
5. Satukan rute (intent / pipeline / flow-hub), jangan hapus tool lama.
6. State pecah (banyak kunci storage) → nanti satu API server.

## Urutan app

1. Perangkai + rute.
2. Mutu Raget 1.0.
3. Server sendiri → konektor + kirim jadwal.
4. Studio kode.
