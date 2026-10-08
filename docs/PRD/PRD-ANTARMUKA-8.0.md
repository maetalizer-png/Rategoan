# PRD ANTARMUKA 8.0 — catatan eksekusi

Sumber resmi: dokumen Drive "PRD Antarmuka 8.0" (8 Oktober 2026).
Baseline: `fcac972c41dfc4a0c3a73df5f0663cb923a9a32e`.
Implementasi: `967b434ce574d5846cd9a688b637d4e7a5e19eff`.

Modul inti `llm-attention.js`, `webgpu-runner.js`, dan `llm-quantization.js` tidak disunting.

Studio Kode adalah meja observasi. Pengguna menulis tujuan di obrolan. Kanvas kanan (pratinjau, berkas, terminal) mengikuti agen. Tidak ada tombol Edit Manual, Terapkan Kode, atau Buka Pratinjau.

| DOD | Hasil |
| --- | --- |
| 8.01 Topbar rata dengan permukaan | Lulus, latar `rgb(5, 8, 12)`, remah transparan |
| 8.02 Popover 8px, tanpa scrollbar | Lulus, jarak terukur 10px (batas kotak), scroll 0 |
| 8.03 Gap ikon–label 10px | Lulus |
| 8.04 Crypto universal | Lulus, termasuk pengunduh model |
| 8.05 VFS CAS dan rollback | Lulus |
| 8.06 MCP JSON-RPC dan allowlist | Lulus |
| 8.07 Push GitHub atomik | Lulus, Git Data API |
| 8.08 Uji dan lint | 58/58, lint 0 galat 0 peringatan |
| 8.09 Playwright | 14/14 pada 1366×768 dan 390×844 |
| 8.10 Paket bukti | `docs/evidence/antarmuka-8.0` |
