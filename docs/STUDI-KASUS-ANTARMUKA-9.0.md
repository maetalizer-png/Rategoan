# Studi kasus Antarmuka 9.0

Diuji hidup pada server studio, Chromium sungguhan, dua ukuran layar. Tema dipaksa terang dan kunci `rategoan_theme` dikosongkan sebelum muat.

Desktop 1366×768: latar halaman `rgb(250, 250, 248)`, bilah atas putih `rgb(255, 255, 255)`, sidebar 260px, obrolan 42% layar, kanvas tiga tab dengan kartu "Ruang Kerja Siap". Popover lampiran tanpa scrollbar, jarak ikon ke label 10px. Jarak popover ke tombol tambah terukur 10px (batas kotak; aturan CSS tetap `calc(100% + 8px)`). Kalimat injeksi tidak masuk ke obrolan.

Instruksi bebas "buat halaman daftar belanja dengan tombol tambah" dijawab "Halaman sudah dirakit dari instruksi itu." Pratinjau menampilkan judul, kolom butir, dan tombol Tambah. Bukan kalimat "tidak dapat dipahami".

Ponsel 390×844: latar sama terang, tidak pecah dua kolom, tidak meluber. Lembar lampiran memeluk isi setinggi 263px, bukan 86vh. Konsol halaman 0 galat. Chromium tetap memperingatkan bahwa iframe pratinjau memakai `allow-scripts` bersama `allow-same-origin`; itu syarat agar pesan menuju asal induk, bukan `*`.

Path `../etc/passwd` ditolak. Origin `https://egoan.vercel.app` lolos CORS, origin asing menjadi `null`.

Hasil: 15/15. Tangkapan ada di `docs/evidence/antarmuka-9.0/`.
Commit yang diuji: `c4d6732817d90ab7bb184c5371c1586aa63c57b5`.
