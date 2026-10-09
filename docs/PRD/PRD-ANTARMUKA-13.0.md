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

Pengukuran hidup diikat pada komit implementasi di paket bukti.
