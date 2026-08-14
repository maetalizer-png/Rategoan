# Copy Gumroad — Rategoan Dataries Data Pack (siap tempel)

## Judul Produk
Dataries Data Pack — Basis Data Dunia Siap Pakai untuk Chatbot

## Tagline (1 baris)
1.500+ item data dunia (negara, bahasa, wisata, tokoh, kuliner) format JS siap plug-and-play ke chatbot atau proyek lokal-mu.

## Deskripsi

Males riset dan nulis data dari nol? Dataries Data Pack kasih kamu basis data
dunia yang sudah rapi, terstruktur, dan siap dipakai — tinggal `import` ke
proyek JavaScript apa pun.

**Isi paket:**
- **country/** — 20 file wilayah, data lengkap tiap negara
- **cities/** — kota-kota utama per wilayah
- **languages/** — bahasa, aksara, jumlah penutur, sapaan per negara
- **wisata/** — tempat wisata terkenal per benua
- **tokoh/** — tokoh sains, teknologi, sejarah, seni
- **makanan/** — kuliner khas per benua
- **sains/, olahraga/, sejarah/, alam/, penemuan/, seni-budaya/, ekonomi/** —
  topik lintas domain, semua format seragam

**Format konsisten & ringan:**
```js
{ text: 'Deskripsi singkat siap pakai...', metadata: { name, country, tags, ... } }
```
Setiap folder punya skema `metadata` sendiri yang didokumentasikan, jadi gampang
di-parse atau dicari programatis.

## Harga
- Basic (semua folder di atas) — **$9**
- Extended (Basic + dokumentasi skema lengkap tiap folder + contoh query
  pencarian) — **$29**

## Yang Termasuk (paket Extended)
- Seluruh folder `dataries/` (JS, siap `import`)
- Dokumentasi skema per folder (field wajib/opsional, contoh nilai)
- Contoh kode pencarian sederhana (word-overlap + fuzzy match)

## Cocok Untuk
- Developer yang bikin chatbot, kuis, atau aplikasi edukasi butuh data dunia instan
- Proyek yang mau data terstruktur tanpa perlu API eksternal atau scraping
- Belajar pola data lokal-first untuk aplikasi offline-capable

## FAQ

**Formatnya apa?**
File `.js` ES6 modules (`export const DATA = [...]`), gampang di-import ke
proyek JavaScript/TypeScript apa pun, browser maupun Node.

**Bisa dipakai komersial?**
Ya, data ini adalah kompilasi fakta umum (bukan berhak cipta), bebas dipakai
untuk proyek personal maupun komersial.

**Datanya akurat?**
Data disusun ringkas untuk kebutuhan chatbot/edukasi (bukan sumber akademik
utama) — cocok untuk fitur "info cepat", bukan referensi ilmiah presisi tinggi.
