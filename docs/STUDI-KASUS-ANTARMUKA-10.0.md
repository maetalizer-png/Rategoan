# Studi kasus Antarmuka 10.0

Diuji hidup pada server statis port 8080, Chromium sungguhan saja. Firefox, Safari, dan Edge tidak dipasang di lingkungan ini, jadi tidak diklaim. Tema dipaksa terang dan kunci `rategoan_theme` dikosongkan sebelum muat.

Desktop studio 1366×768: latar `rgb(250, 250, 248)`, bilah atas `rgb(255, 255, 255)`. Iframe pratinjau `allow-scripts allow-forms`, tanpa `allow-same-origin`. Popover lampiran berjarak 9px di atas tombol tambah, backdrop `rgba(0, 0, 0, 0)`, animasi 0,15 detik. Escape menutup popover. Tidak ada peringatan Chromium tentang `allow-same-origin`.

Instruksi "buat halaman daftar belanja dengan tombol tambah" dijawab sudah dirakit. Pratinjau menampilkan formulir lewat MessageChannel, bukan templat HTML kaleng. Kalimat cuaca tidak mengarang kartu belanja.

Obrolan desktop: popover yang sama berjarak 9px, backdrop langsung `rgba(0, 0, 0, 0)` (transisi warna dimatikan supaya lapisan gelap tidak sempat menyala). Sasis Artefak, Konektor, Proyek, dan Koleksi `920px`, padding `32px 40px`, galeri `repeat(auto-fill, minmax(260px, 1fr))`.

Ponsel studio 390×844: lembar lampiran memeluk isi setinggi 263px. Konsol 0 galat halaman.

Regresi studi kasus 9.0 pada commit yang sama: 15/15, termasuk formulir yang tetap muncul.

Hasil 10.0: 15/15. Tangkapan ada di `docs/evidence/antarmuka-10.0/`.
Commit yang diuji: `55ec5a4399f2d90fbf986733d365520499483ba6`.
