# PRD ANTARMUKA 10.0 — catatan eksekusi

Sumber resmi: dokumen Drive "PRD Antarmuka 10.0" (8 Oktober 2026).
Baseline: `c4d6732817d90ab7bb184c5371c1586aa63c57b5` dan bukti `3c9dde02451d70b6e551c2749fa633fd3d8db765`.
Implementasi: `55ec5a4399f2d90fbf986733d365520499483ba6`.
Segel SHA-256 objek commit implementasi: `e2c194036f55e3681f674ea58578629bc9e06d9913cd4a3071da8f1c6574a5ba`.
Tag: `10.0.0-GA`. Bukan terbitan npm. Bukan tanda GPG.

Modul inti `llm-attention.js`, `webgpu-runner.js`, dan `llm-quantization.js` tidak disunting.

| DOD | Hasil |
| --- | --- |
| 10.01 Kripto web | `getWebCrypto` memakai subtle di jendela, lalu `node:crypto`. `deriveVaultKey(storage)` tidak melempar ReferenceError |
| 10.02 Brankas | AES-GCM, extractable false, PBKDF2 100000, garam di penyimpanan. Token mentah dikosongkan setelah disegel |
| 10.03 Iframe | `sandbox="allow-scripts allow-forms"`. `allow-same-origin` dihapus |
| 10.04 Kanal | HTML pratinjau lewat MessageChannel: `INIT_PORT`, `PORT_READY`, `RENDER_PAYLOAD`. Nonce 16 byte |
| 10.05 Peringatan Chromium | 0 peringatan `allow-same-origin` pada uji hidup |
| 10.06 Tanpa templat kaku | Tidak ada regex `/daftar\|list\|belanja/` yang menempelkan HTML kaleng |
| 10.07 AST | IntentNode menjadi AST. "daftar belanja" tetap `form#form` dan `ul#daftar`. Kalimat cuaca tidak mengarang kartu atau kolom angka |
| 10.08 Stream | Pagar kode belum utuh tetap menghasilkan HTML aman, di bawah 20ms |
| 10.09 Regresi | Unit 78/78. Studi kasus 9.0 tetap 15/15. Studi kasus 10.0 15/15 |
| 10.10 CSP pratinjau | `default-src 'none'`. Skrip pratinjau hanya `unsafe-inline` |
| 10.11 Port | `cycleSandboxPorts(1000)` mengembalikan `{cycles:1000, open:0}` |
| 10.12 Rilis | Tag `10.0.0-GA` pada bukti. Segel SHA-256 di atas. Tidak ada `npm publish` |
| 10.13 Popover | Desktop, jarak terukur 9px di atas tombol tambah (aturan 8px, batas kotak menambah 1px). Backdrop `rgba(0, 0, 0, 0)`, transisi dimatikan supaya tidak menyala gelap dulu. Animasi popover 150ms. Escape dan panah jalan |
| 10.14 Sasis | Kanvas Koleksi, Konektor, Artefak, Pengaturan, dan Proyek `max-width: 920px`, padding `32px 40px`. Galeri `minmax(260px, 1fr)`. Lembar ponsel tetap 263px |

Telemetri dikunci per id proyek, tanpa teks pengguna. Peringatan hanya bila `kind === 'parse'` dan `ms > 20`. Muatan MCP menolak `access_token`. Pohon Merkle punya `verifyIntegrity` dan `recover`.
