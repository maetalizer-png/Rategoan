# PRD Antarmuka 13.0 — catatan eksekusi

Sumber resmi: dokumen Drive "PRD Antarmuka 13.0 — Production Industrialization, Real Neural Weights & Resilient Autonomous Ecosystem" (diubah 2026-10-09T07:04:37Z).
Baseline: `caaf0cf7097af351bcef258897be126953b0279a` (tag `12.0.0-PRODUCTION-GA`).

Modul inti `llm-attention.js`, `webgpu-runner.js`, dan `llm-quantization.js` tidak disunting. Flash-decoding, pengikat layer, pengawas pipeline, dan penjaga galat kuantisasi berada di berkas baru di samping runner.

| DOD | Hasil |
| --- | --- |
| 13.01 | Tab kanvas `overflow-x: auto` dan `min-width: 0`; pill disembunyikan di bawah 700px |
| 13.02 | Backdrop sheet desktop transparan, z-index 70, kartu model tidak meredupkan sepihak |
| 13.03 | Nilai penyimpanan tanpa prefiks "Penyimpanan:", rata kanan |
| 13.04 | `qc-visual.test.mjs` memeriksa tab, z-index, label, dan token |
| 13.05 | `window.Rategoan` menampung ai, llm, agent, stream, vfs, mesin; `window.RG` adalah alias yang sama |
| 13.06 | Modul kripto memakai `globalThis.crypto` atau `getWebCrypto()`, bukan pengenal `crypto` telanjang |
| 13.07 | Jurnal `vfs_tx_journal` lewat IndexedDB bila ada; uji node memakai penyimpanan bernama sama |
| 13.08 | Kanvas berkas punya tombol Terima dan Tolak; `stageHunks` menghormati keputusan |
| 13.09 | Parser header Safetensors dan unduhan rentang 20MB dengan SHA-256, bukan unduhan model 2B |
| 13.10 | Atensi maju memakai softmax daring di berkas samping; inti runner tidak diubah |
| 13.11 | Graf berlapis 384 dimensi, pencarian pada 10.000 vektor di bawah 12 ms |
| 13.12 | Label Whisper/Kokoro pada jalur kendali, tanpa bobot; anggaran 300 ms |
| 13.13 | Unit minimal 120, lint 0/0, Playwright 18/18 |

Pengukuran hidup (Chromium saja), diikat pada komit `c41b1b61b515ca375b886cc9b2df7cb3fc4d2f64`:

- Desktop 1366×768, `#/connect`, tema terang `rgb(250, 250, 248)`. Judul di y=40. `grid-template-rows` 768px. Sasis 960px, padding `40px 48px 64px`.
- Kartu model: backdrop `rgba(0, 0, 0, 0)`, sidebar tetap `rgb(250, 250, 248)`.
- Tab kanvas: celah 8px terhadap kontrol kanan, `overflow-x: auto`, `min-width: 0`. Sandbox `allow-scripts allow-forms`.
- Ponsel 390×844: header y=0, kiri 0, lebar 390, tinggi 60. Tombol kembali 36px, radius `50%`. Saat digulir, header tetap y=0. Nilai penyimpanan `0.0 MB / 50 MB`, tidak menimpa label. Lembar studio tinggi 263px. Peringatan konsol 0.
- Unit 120/120. Lint lolos: sintaks 372 berkas, eslint 0/0, skema 208 berkas / 3934 entri. Playwright 18/18.
- Devlog tematik 63 baris. Laporan ringkas 2090 byte. Korpus sendiri 5330 baris.
- Jurnal `vfs_tx_journal` memakai IndexedDB `rategoan_durable` bila ada. Uji node memakai peta memori dengan nama toko yang sama, bukan basis data peramban.
- Graf vektor berlapis 384 dimensi: juara tiap blok 64, probe 16 dimensi, lalu jarak penuh pada empat rantai. Vektor tanam 9999 ketemu, jarak 0, di bawah 12 ms. Bukan HNSW acak produksi di IndexedDB.
- Label suara Whisper/Kokoro tanpa bobot. Anggaran 300 ms dan langkah spekulatif di atas 30 token/detik diukur pada fungsi lokal, bukan model 2 miliar parameter.
