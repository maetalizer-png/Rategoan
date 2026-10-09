# PRD Antarmuka 12.0 — catatan eksekusi

Sumber resmi: dokumen Drive "PRD Antarmuka 12.0 — Living Canvas, Browser Flash-Decoding & Autonomous Coding Agent" (diubah 2026-10-09T03:00:39Z).
Baseline: `191bb4ef1c49e48abe44179102eaf6ce1e429eb5` (tag `11.0.0-PRODUCTION-GA`).

Modul inti `llm-attention.js`, `webgpu-runner.js`, dan `llm-quantization.js` tidak disunting. Flash-decoding, BitNet, penjadwal prefill, dan deteksi subgroup hidup di berkas baru di samping runner.

| DOD | Hasil |
| --- | --- |
| 12.01 | `assert` mengembalikan argumen tersaring; kunci terlarang ditolak |
| 12.02 | `getWorkspaceAesKey` AES-GCM 256-bit, tidak terekstrak, alias per workspace |
| 12.03 | Jurnal memori PREPARE, lalu COMMITTED atau ROLLED_BACK; pemulihan setelah PREPARE |
| 12.04 | `stageHunks` menerima atau menolak tiap hunk sebelum tambalan diterapkan |
| 12.05 | Replika dokumen di `canvas-editor.js` menyisipkan tanpa menimpa suntingan lawan |
| 12.06 | `describePick` mengirim tag, kelas, dan pemilih ke konteks agen |
| 12.07 | Softmax daring, deviasi di bawah 1.25e-8, tanpa matriks perhatian penuh |
| 12.08 | Langkah sintetis kecil di atas 30 token/detik; bukan model 1,5 miliar parameter |
| 12.09 | BM25 ditambah kosinus; 180 dokumen di bawah 15 milidetik |
| 12.10 | Jabat tangan MCP hanya untuk localhost atau 127.0.0.1 |
| 12.11 | Segel proyek AES-GCM, kunci tidak terekstrak |
| 12.12 | Unit minimal 100, lint 0 galat dan 0 peringatan, Playwright 16/16 |

Pengukuran hidup Chromium diikat pada komit implementasi lewat paket bukti.
