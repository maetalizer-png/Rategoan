# Pengembangan Rategoan

Vercel = panggung bangun app. Bukan rumah akhir. Server sendiri menyusul setelah kerangka client lengkap.

## Jangan dirusak
Template, Raget 1.0, rak Release, web/slide/koleksi. Tidak menyemat model pihak lain.

## Mesin (`raget/raget-runtime/mesin.js`)
Client siap: otak-template, otak-1.0, perencana, bahan, perangkai, kanvas, ingat, belajar, jadwal (antrian lokal).
Menunggu server sendiri: konektor Drive/WA, flush outbox kirim.
Studio kode: belum.

Ganti host nanti: `mesin.setServerBase('https://server-kamu')` lalu `mesin.flushJobs()` / `mesin.serverCall`. UI tidak dirombak.

## Skenario
A client (sekarang) → B perangkai dalam → C 1.0 dari rak → D server sendiri.
