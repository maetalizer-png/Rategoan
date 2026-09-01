# Capability Matrix — Rategoan/RAGET

Status per 2026-09-01 (ronde konsolidasi `PRD-PRODUKSI-READY.md`).
Status: **Stable** (diuji, dipakai produksi) / **Experimental** (jalan,
belum lulus gerbang kualitas) / **Browser-dependent** (butuh API
browser tertentu) / **Partial** (sebagian jalan, ada celah diketahui).

| Kapabilitas | Status | Bukti/Test | Catatan |
|---|---|---|---|
| Chat rule-based (default) | Stable | Bench CORE-SUITE 1175/1180 = 99,58% | Default aktif, lihat `llm-models.js` |
| Intent harian (sapaan, kabar, capek, sekolah, layanan) | Partial | Playwright live-query manual | Frasa pendek lolos; pola "cara X gimana ya" masih salah rute ke tool generik (`PRD-PRODUKSI-READY.md` §1-2) |
| Retrieval faktual (negara, tokoh, dst) | Partial | Bench + 3 kegagalan tercatat | Heuristik "lanjutan topik?" kadang menyela pertanyaan faktual jelas |
| Memory (fakta/preferensi) | Experimental | Belum diaudit ulang ronde ini | Panel "Fakta tentang saya" ada (devlog historis), fungsi inspect/edit/delete belum diverifikasi live ronde ini |
| Matematika (`math-engine.js`) | Stable | Bench (parser aman, tanpa `eval`) | — |
| Dwibahasa ID/EN (`bilingual.js`) | Stable | Bench | — |
| Koleksi (simpan chat/catatan) | Stable | Playwright screenshot verified | — |
| Pitutur (siaran audio) | Stable | Screenshot verified, render bersih | Produk terpisah, basis data sama |
| Voice/TTS | Browser-dependent | — | Tergantung dukungan API Speech browser |
| Neural (50M/100M/200M) | Experimental | PPL turun konsisten tiap ronde (100M: 1272→525 ronde terakhir); generasi belum gramatikal, `fullEpochsCompleted: 0` | Bukan default; lihat `PRD-PRODUKSI-READY.md` |
| PWA offline (app shell) | Experimental/Belum diverifikasi | `sw.js` cuma cache CDN (jsDelivr/HuggingFace), TIDAK cache index.html/js/css | Klaim "offline penuh" belum akurat sampai ini diverifikasi/diperbaiki |
| Privasi (lokal vs Google vs server) | Stable | UI note ditambahkan + verified Playwright | Lihat Pengaturan → Privasi & Keamanan |
| Keamanan (XSS di `innerHTML`) | Belum diaudit | Grep: 36 penggunaan, 12 file | Ada `escapeHtml()` dipakai sebagian; cakupan penuh belum diverifikasi satu-satu |
| Boundary arsitektur UI→Intelligence | Partial | Grep 3 file bocor | `js/chat/chat.js`, `chatsearch.js`, `collection.js` impor `raget-retrieval`/`raget-memory`/`raget-database` langsung |
| CI/CD | Partial | `.github/workflows/panen.yml` saja | Belum ada gerbang bench-per-push |

Rujukan detail tiap baris: `PRD-PRODUKSI-READY.md` (checklist Definition
of Done + temuan bench presisi).
