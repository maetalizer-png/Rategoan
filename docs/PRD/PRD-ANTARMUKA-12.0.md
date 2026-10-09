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

Pengukuran hidup (Chromium saja), diikat pada komit `47d61acda068e9eedebbc4cf0bab03484ef3d8d8`:

- Desktop 1366×768, `#/connect`, tema terang `rgb(250, 250, 248)`. Judul di y=40. `grid-template-rows` 768px, bukan track 60px. Header `static`, latar transparan. Sasis 960px, padding `40px 48px 64px`.
- Ponsel 390×844: header y=0, kiri 0, lebar 390, tinggi 60, judul 17px berat 650, blur 14px, garis `1px solid`. Tombol kembali 36px, radius `50%`. Saat digulir, titik (20, 8) mengenai HEADER.
- Pengaturan, artefak, koleksi, dan proyek: header y=0, tinggi 60.
- Studio: sandbox `allow-scripts allow-forms`, tanpa Edit Manual atau Terapkan Kode, tab dokumen dan sheet ada. Lembar ponsel tinggi 263px. Peringatan konsol 0.
- Unit 104/104. Lint lolos: sintaks 363 berkas, eslint 0/0, skema 208 berkas / 3934 entri.
- Devlog tematik 63 baris. Laporan ringkas 2090 byte. Korpus sendiri 5330 baris.
- Jurnal VFS adalah peta memori berstatus PREPARE, COMMITTED, atau ROLLED_BACK. IndexedDB tidak ada pada uji node.
- Throughput spekulatif dan anggaran suara 300ms diukur pada fungsi lokal kecil, bukan bobot Whisper atau model 1,5 miliar parameter.

