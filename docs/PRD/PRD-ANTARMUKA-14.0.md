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

Pengukuran hidup diikat pada komit implementasi di paket bukti.
