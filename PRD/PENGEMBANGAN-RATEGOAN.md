# Pengembangan Rategoan

Dokumen sendiri. Bukan PRD data. Bukan model luar.
Sumber Drive `Pengembangan_Rategoan.md` + evaluasi isi repo `js/`.

## Sekarang (sudah ada, belum nyambung)

`js/chat` obrolan. `chatsearch` kueri. `collection` simpan. `composer` susun jawaban. `pptx-local` / `slides-export` unduh. `ai/engine` + `memory`. Router tipis.

Lubang nyata: web masih potongan; koleksi folder pasif; slide potong teks + “cek koneksi”; HTML/tautan bocor; sapaan salah jalur FAQ; tidak ada satu alur topik → bahan → slide.

## Alur yang harus hidup

pertanyaan → pecah 2–3 kueri → artikel bersih + sitasi → simpan koleksi (ringkas 3 poin) → tanya ke koleksi → slide dari koleksi → pratinjau kanan + PPTX.

Sitasi hanya jika sumber web. Tanpa `target=_blank` mentah. Tanpa markdown bocor.

## Mesin yang harus ada (buat baru / kencangkan yang ada)

1. **Perencana** — sapaan / hitung / fakta lokal / web / koleksi / slide. File: perkuat `js/core/router.js` + planner di chat.
2. **Pencari bersih** — 3 kueri, ambil isi, buang nav/iklan, sitasi paragraf. Perkuat `chatsearch.js`.
3. **Perangkai** — paragraf dari fakta K1-lokal + web + koleksi. Perkuat `composer.js`. Ini yang bikin dalam, bukan tombol baru.
4. **Koleksi hidup** — simpan otomatis dari web, ringkas 3 poin, cari ulang di koleksi. Perkuat `collection.js`.
5. **Penyusun slide** — cover / isi / tutup dari fakta, bukan cuplikan acak. Perkuat `pptx-local.js`.
6. **Kanvas kanan** — pratinjau slide di samping chat. UI baru, jangan Wasm.
7. **Orkestrator** — satu state: cari → simpan → tanya → slide. Jangan 4 tombol yang tidak saling tahu.

## Jangan dibuat

BGE-M3, Pyodide, Qwen, Google Slides API sebagai syarat. Raget orisinal.

## Urutan kerja Build

1. Perencana + pencari bersih + jawaban tanpa bocor HTML.
2. Web → koleksi → tanya koleksi.
3. Slide dari koleksi + pratinjau kanan + PPTX.

Selesai tahap = bisa dipakai di app, bukan dokumen baru.
