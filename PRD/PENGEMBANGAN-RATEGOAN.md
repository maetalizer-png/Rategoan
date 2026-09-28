# Pengembangan Rategoan

Satu catatan app. Bukan PRD data (itu Release).

## Jangan dirusak
- Dua otak: Raget Template + Raget 1.0 (neural). Tidak menyemat model pihak lain.
- Korpus K1–K4 tetap di Release. App Vercel tidak menelan gzip rak.
- Web, slide, koleksi, proyek, artefak, unggah: tambah, jangan ganti nama id yang sudah hidup.
- Satu file perintah data: PRD-GROK-BUILD di tag Release.

## Struktur target (lapisan, bukan tumpuk file)
1. Pintu — sheet + sidebar (sudah: web, pikir, riset, slide, proyek, artefak).
2. Perencana — flow-hub + turn-pipeline. Semua mode baru masuk sini dulu.
3. Bahan — file, wiki/web, koleksi, chat, proyek.
4. Otak — Template (pasti) / Raget 1.0 (checkpoint). Router jangan dipecah.
5. Kanvas — panel kanan + daftar artefak.
6. Ingatan — memory-long + projectId.
7. Nanti server — konektor, jadwal kirim. Tidak dipalsukan di client.

## Skenario menuju app modern
A. Sekarang (client, aman): pintu lengkap, belajar terpandu dari jawaban yang ada, proyek/artefak hidup.
B. Berikut: perangkai web lebih dari 1 halaman wiki (tetap tanpa model luar di dalam Raget).
C. Raget 1.0 koheren lewat data rak + latih — bukan ganti UI.
D. Server kecil: konektor Drive/WA, jadwal. Baru setelah A–B stabil.

## Ceklis
- [x] Unggah, web, slide+panel, koleksi, pikir, riset, proyek sheet, artefak list, riwayat per proyek, memori
- [x] Belajar terpandu (dari jawaban/koleksi, bukan model baru)
- [ ] Perangkai multi-sumber
- [ ] Konektor / jadwal (butuh server)
- [ ] Studio kode
