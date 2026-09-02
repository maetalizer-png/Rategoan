# Capability Matrix — Rategoan/RAGET

Status per 2026-09-02 (lihat `PRD.md` §1 untuk status kerja terbaru).
Status: **Stable** (diuji, dipakai produksi) / **Experimental** (jalan,
belum lulus gerbang kualitas) / **Browser-dependent** (butuh API
browser tertentu) / **Partial** (sebagian jalan, ada celah diketahui).

| Kapabilitas | Status | Bukti/Test | Catatan |
|---|---|---|---|
| Chat rule-based (default) | Stable | Bench CORE-SUITE 1175/1180 = 99,58% | Default aktif, lihat `llm-models.js` |
| Intent harian (sapaan, kabar, capek, sekolah, layanan) | Stable | Bench + Playwright live-query manual | Termasuk "cara X gimana ya" untuk domain layanan publik (KTP dkk) - sudah diperbaiki `router-intent.js` |
| Retrieval faktual (negara, tokoh, dst) | Partial | Bench + 2 kegagalan tercatat | Query superlatif lintas-benua ("negara terkecil di X") belum didukung `trySuperlatif()` + data Vatikan/alias Tiongkok belum ada (`PRD.md` §1) |
| Memory (fakta/preferensi) | Experimental | Belum diaudit ulang ronde ini | Panel "Fakta tentang saya" ada (devlog historis), fungsi inspect/edit/delete belum diverifikasi live ronde ini |
| Matematika (`math-engine.js`) | Stable | Bench (parser aman, tanpa `eval`) | — |
| Dwibahasa ID/EN (`bilingual.js`) | Stable | Bench | — |
| Koleksi (simpan chat/catatan) | Stable | Playwright screenshot verified | — |
| Pitutur (siaran audio) | Stable | Screenshot verified, render bersih | Fitur RATEGOAN (bukan produk terpisah), basis data sama, dibangun sebagai PWA turunan mandiri/offline di `fitur/pitutur/` |
| Voice/TTS | Browser-dependent | — | Tergantung dukungan API Speech browser |
| Neural (RAGET otomatis, 200M→100M→50M) | Experimental, belum menjawab | Held-out PPL masih naik-turun di atas 900 (lihat devlog terbaru); generasi belum gramatikal | Tidak ada pemilih model - satu nama "RAGET" tampil ke user. Cascade + prefetch background sudah aktif (`neural-provider.js`), tapi `js/ai/ai.js` `NEURAL_ANSWERS_ENABLED = false` mengunci jawaban tetap dari rule-based sampai generasi koheren |
| PWA offline (app shell) | Experimental/Belum diverifikasi | `sw.js` cache CDN (jsDelivr/HuggingFace) + Release checkpoint-200m, TIDAK cache index.html/js/css | Klaim "offline penuh" belum akurat untuk shell aplikasi sendiri - cuma paket unduhan opsional (OCR/Terjemahan/PDF/checkpoint 200M) yang offline-capable |
| Privasi (lokal vs Google vs server) | Stable | UI note ditambahkan + verified Playwright | Lihat Pengaturan → Privasi & Keamanan |
| Keamanan (XSS di `innerHTML`) | Stable | Audit penuh 48 site (bukan 36) di 12 file, 0 risiko nyata | Semua data user-controllable sudah lewat escapeHtml()/escapeAttr()/markdown.escape() atau textContent; 1 titik borderline diperbaiki defense-in-depth |
| Boundary arsitektur UI→Intelligence | Partial | Grep 3 file bocor | `js/chat/chat.js`, `chatsearch.js`, `collection.js` impor `raget-retrieval`/`raget-memory`/`raget-database` langsung |
| CI/CD | Tidak ada | `.github/workflows/panen.yml` sudah dihapus (2026-09-02) | Belum ada gerbang bench-per-push maupun workflow apa pun |

Rujukan detail tiap baris: `PRD.md` (aturan mengikat + status kerja).
