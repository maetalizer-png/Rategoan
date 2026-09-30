# PRD — Aturan Kerja

Berlaku untuk semua pekerjaan pengembangan di repo ini, sekarang dan
seterusnya.

## 1. Kode

- Tanpa komentar penjelas di kode. Nama variabel/fungsi yang jelas
  menggantikan komentar. Konteks/alasan keputusan taruh di commit
  message, bukan di kode.
- Tanpa `console.log`/`console.warn`/`console.info`/`console.debug` di
  kode aplikasi (`js/`, `raget/raget-agents/`, `raget/raget-template/`,
  `raget/raget-neural/`, `raget/raget-memory/`, `raget/raget-database/`,
  `raget/raget-retrieval/`). `raget-tools/` (skrip CLI) boleh.
- Tanpa `var` — pakai `let`/`const`.
- LLM lokal proyek ini SATU: RAGET (`raget-template/` + `raget-neural/`).
  Jangan pernah menyiratkan ada model/mesin AI lain di proyek ini.

## 2. Struktur & sektor

- Satu sesi kerja fokus satu sektor (Template/Neural/Data/UI/Tooling/
  Dokumentasi). Jangan sentuh sektor lain di luar yang diminta.
- Jangan buat folder/konsep arsitektur baru (mesin baru, adapter baru,
  lapisan baru) tanpa konfirmasi eksplisit dari pemilik produk dulu.
- Jangan hapus/timpa pekerjaan kolaborator lain tanpa `git fetch` +
  cek riwayat dulu.
- `js/`, `css/`, `index.html` tetap di root. Bukan `src/` — aplikasi ini
  static-serve/PWA tanpa build step.

## 3. Verifikasi sebelum klaim "selesai"

- `node raget/raget-tools/lint-check.mjs` WAJIB LOLOS 0 error.
- Perubahan yang menyentuh jawaban/UI WAJIB diverifikasi live
  (Playwright) — bukan diasumsikan benar dari baca kode.
- Perubahan sudah di-commit (dan di-push kalau diminta).

## 4. Dokumentasi

- README/PRD/LICENSE singkat dan langsung ke poin — bukan esai.
- LICENSE berbahasa Indonesia.
- Folder PRD produk ada di `docs/PRD/`. Perintah Grok Build hanya di
  Release tag `prd-data-release` / `penampung`, file `PRD-GROK-BUILD.md`.

## 5. Kalau ada perintah lain di tengah jalan

Boleh pindah fokus, tapi WAJIB nyatakan status pekerjaan yang
ditinggalkan (selesai/belum, apa yang tertunda) dulu.
