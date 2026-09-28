# PRD-GROK-BUILD

Satu perintah. Sumber Drive: `Pengembangan_Rategoan.md` (28 Sep).
Data korpus: sortir mutu + kemas ≤1,5 GB (lihat juga tag `prd-data-release`).
Aplikasi: sambungkan web → koleksi → slide. Jangan pasang model luar (BGE-M3/Pyodide/Qwen) di dalam Raget.

---

## A. Data (Release)

Patah: sambung; tidak bisa → buang kalimat.
Dobel/ulang: simpan yang paling utuh.
Infobox/header/nav: buang blok.
Jangan buang hukum/berita/wiki karena topik.
Kemas file ≤1,5 GB. Pecahan <100 MB gabung.
Mentah → penampung → rak. Tag penampung jangan dihapus.

---

## B. Aplikasi (dari Drive)

Alur wajib:
pertanyaan → cari web (3 kueri, artikel bersih, sitasi) → simpan koleksi (ringkas 3 poin) → tanya ke koleksi → buat slide dari koleksi → panel kanan pratinjau + unduh PPTX.

### B1 sekarang
Hasil web bisa disimpan ke koleksi tanpa chip rusak.
Jawaban web: paragraf, bukan HTML bocor, bukan `target=_blank` mentah.
Slide: cover / isi / tutup dari fakta koleksi atau jawaban, bukan potong acak.

### B2
Chat ke koleksi pakai indeks yang sudah ada di app (bukan BGE-M3).
Tombol slide memakai bahan koleksi aktif, bukan cek koneksi kosong.

### B3
Panel kanan pratinjau. Jangan Wasm/Python di browser.

Dilarang: file PRD baru, model pihak ketiga di repo, unduh korpus ke git.
