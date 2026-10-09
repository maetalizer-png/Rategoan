# PRD Antarmuka 14.0 — catatan eksekusi

Sumber resmi: dokumen Drive "PRD Antarmuka 14.0 — Sovereign Zero-Sim Production, Real Neural Weights & Hardened Client Vector DB" (diubah 2026-10-09T09:16:28Z).
Baseline: `763de160b07cb07a8f69ea0320d91d412ffc989e` (tag `13.0.0-PRODUCTION-GA`).

Sasis 13.0 tidak dibalik. Modul inti `llm-attention.js`, `webgpu-runner.js`, dan `llm-quantization.js` tidak disunting. Bobot Whisper, Kokoro, dan model pihak ketiga tidak dipasang.

| DOD | Hasil |
| --- | --- |
| 14.01 | `getSecureRandomBytesSync` memakai WebCrypto atau `node:crypto`, tanpa pengenal `crypto` telanjang |
| 14.02 | Vektor Int8/SQ8, k-NN 10.000×384 lewat juara blok, di bawah 9 ms |
| 14.03 | Kunci level 5 memakai jam monoton dan offset uji, kedaluwarsa setelah 120 detik |
| 14.04 | Mutasi VFS lewat `navigator.locks`, atau antrean bila API tidak ada |
| 14.05 | Parser header dinamis, cache `rategoan-neural-v4`, buffer 26.87 MiB, tanpa klaim model 1,5 miliar |
| 14.06 | Partisi `hnsw_nodes` maksimal 500 simpul, plus fusi peringkat resiprokal |
| 14.07 | Label suara tanpa bobot, langkah kendali di bawah 300 ms |
| 14.08 | Terima/Tolak per hunk, nonce LRU 1.000 dengan TTL 300 detik, token asal null |
| 14.09 | `window.Rategoan` tetap satu-satunya namespace |
| 14.10 | Unit minimal 130, lint 0/0, Playwright 18/18 |

Pengukuran hidup (Chromium saja), diikat pada komit `63c40bdd5e944beb55234d8724709d9b53db376c`:

- Desktop 1366×768, `#/connect`, tema terang `rgb(250, 250, 248)`. Judul di y=40. `grid-template-rows` 768px. Sasis 960px, padding `40px 48px 64px`. Backdrop model `rgba(0, 0, 0, 0)`. Sidebar `rgb(250, 250, 248)`.
- Tab kanvas celah 8px, `overflow-x: auto`, `min-width: 0`. Studio sandbox `allow-scripts allow-forms`.
- Ponsel 390×844: header y=0, lebar 390, tinggi 60, tombol kembali 36px radius `50%`. Gulir tetap di header. Penyimpanan `0.0 MB / 50 MB`, tidak menimpa label. Lembar studio 263px. Peringatan konsol 0.
- Unit 130/130. Lint lolos: sintaks 377 berkas, eslint 0/0, skema 208 berkas / 3934 entri. Playwright 18/18.
- SQ8 menandai vektor 9999 pada jarak 0. Sampel pencarian 3,643 ms lalu 0,305 / 0,289 / 0,274 / 0,251 ms. Ini juara blok Int8, bukan pemindaian kasar 10.000 vektor dan bukan HNSW produksi di IndexedDB.
- Devlog tematik 63 baris. Laporan ringkas 2090 byte. Korpus sendiri 5330 baris.
- Jurnal memakai IndexedDB bila ada, dan `navigator.locks` di peramban. Uji node memakai antrean memori bernama sama.
- Label Whisper/Kokoro tanpa bobot. Soket Safetensors siap untuk `Maetalizer19/rategoan-neural`. Tidak ada model pihak ketiga dan tidak ada klaim inferensi 1,5 miliar parameter.
