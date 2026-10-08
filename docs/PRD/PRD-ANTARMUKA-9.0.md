# PRD ANTARMUKA 9.0 — catatan eksekusi

Sumber resmi: dokumen Drive "PRD Antarmuka 9.0" (8 Oktober 2026).
Baseline: `9fd270c3d49dab637acee327725d43aaedbc824d`.
Implementasi: `c4d6732817d90ab7bb184c5371c1586aa63c57b5`.

Modul inti `llm-attention.js`, `webgpu-runner.js`, dan `llm-quantization.js` tidak disunting.

Studio Kode tetap meja observasi. Tidak ada tombol Edit Manual, Terapkan Kode, atau Buka Pratinjau. Instruksi rekayasa yang tidak masuk tujuh pola lama dirakit lewat pintu lokal, bukan ditolak sebagai tidak dipahami. Omong kosong tanpa niat rekayasa tetap ditolak.

| DOD | Hasil |
| --- | --- |
| 9.01 Tema terang | Lulus, latar `rgb(250, 250, 248)`, topbar `rgb(255, 255, 255)`. Token gelap hanya di `data-theme=dark` |
| 9.02 Lembar ponsel | Lulus, tinggi terukur 263px, di bawah 320px |
| 9.03 Brankas | Kunci AES tidak terekstrak. PBKDF2 100000 bila IndexedDB tidak ada |
| 9.04 Path | Null byte, `..`, `.git`, `.env` ditolak. `style.css` dan `script.js` tetap alias |
| 9.05 CORS | `https://egoan.vercel.app` diizinkan, header `x-rategoan-confirm-nonce` ikut |
| 9.06 Kebijakan | Alat tak dikenal tingkat 5. Katalog dan status tetap 0 |
| 9.07 Injeksi | Spasi nol, komentar HTML, NFKC, dan homoglif disaring sebelum memori |
| 9.08 Pratinjau | `postMessage` ke asal induk, bukan `*`. Nonce 16 byte. Iframe `allow-same-origin` supaya asal itu sah |
| 9.09 Token GitHub | Studio lama membaca `connectorState.token('github')` |
| 9.10 JSON-RPC | -32700, -32600, -32601, -32602, -32603 |
| 9.11 Sintesis | Halaman daftar belanja dirakit. Teks acak tetap `unrecognized_instruction` |
| 9.12 Uji | 69/69, lint 0 galat 0 peringatan, Playwright 15/15 |
