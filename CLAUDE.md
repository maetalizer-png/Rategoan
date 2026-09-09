# Aturan kerja Rategoan

- Kode bersih: JANGAN tulis komentar penjelas panjang di kode. Nama
  variabel/fungsi yang jelas menggantikan komentar. Kalau butuh
  penjelasan konteks/keputusan, taruh di commit message, bukan di kode.
- JANGAN `console.log`/`console.warn`/`console.info`/`console.debug` di
  kode aplikasi (`js/`, `raget/raget-agents/`, `raget/raget-template/`,
  `raget/raget-neural/`, `raget/raget-memory/`, `raget/raget-database/`,
  `raget/raget-retrieval/`). `raget-tools/` (skrip CLI) boleh, karena
  output-nya memang lewat console.
- JANGAN `var` — pakai `let`/`const`.
- Sebelum klaim "selesai": `node raget/raget-tools/lint-check.mjs` WAJIB
  LOLOS 0 error. Perubahan yang menyentuh jawaban/UI WAJIB diverifikasi
  live (Playwright), bukan diasumsikan dari baca kode.
- Dokumen (README/PRD/LICENSE) singkat dan langsung ke poin — bukan esai.
- LLM lokal proyek ini SATU: RAGET (`raget-template/` + `raget-neural/`).
  Jangan pernah menyiratkan ada model/mesin AI lain di proyek ini.
