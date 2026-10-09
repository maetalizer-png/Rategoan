# PRD Antarmuka 11.0 — catatan eksekusi

Sumber resmi: dokumen Drive "PRD Antarmuka 11.0".
Baseline: `9b014e020f51725ed9c4aba95d5c5a3911fdaaae` (tag `10.0.0-GA`).

Modul inti `llm-attention.js`, `webgpu-runner.js`, dan `llm-quantization.js` tidak disunting.

Popover lampiran chat dan studio memakai `shared/popover.js` yang sama. Sasis menu menjadi 960px. Ikon pindah ke `assets/icons/`. Sebelas dokumen usang dihapus dan diganti `docs/HISTORY-ANTARMUKA.md`. Fakta ibu kota Indonesia dikunci ke Jakarta, populasi ~282 juta jiwa. Sapaan bantuan tidak lagi menjawab "Maaf sebelumnya", dan sapaan waktu tidak menyindir jam perangkat.

| DOD | Hasil |
| --- | --- |
| 11.01–11.02 | Popover ter-clamp, lantai atas 20px, satu helper |
| 11.03 | Sasis `.settings-page` 960px, padding 40px 48px 64px |
| 11.04 | Kartu artefak bertingkat, pratinjau 110px, Pratinjau dan Unduh |
| 11.05 | Escape dan klik luar menutup, backdrop transparan |
| 11.06 | Ikon di `assets/icons/`, tautan HTML, manifes, dan service worker ikut |
| 11.07 | 11 berkas usang hilang, `HISTORY-ANTARMUKA.md` terbit |
| 11.08 | Iframe tetap `allow-scripts allow-forms` |
| 11.09 | `deriveVaultKey` tetap AES-GCM tidak terekstrak |
| 11.10 | Alat tak dikenal tingkat 5, gagal tertutup |
| 11.11 | Frasa pindah IKN hilang, populasi 282 juta |
| 11.12 | Bantuan ramah, tanpa sindiran jam perangkat |
| 11.13 | `external/` dan tiga jsonl usang hilang, korpus tunggal diperbarui |
| 11.14 | 21 entri sejarah di `sejarah.js` |
| 11.15 | Laporan neural diringkas, log tematik satu berkas |
| 11.16 | Unit, lint, dan Playwright diikat pada bukti |
| 11.17 | Paket bukti di `docs/evidence/antarmuka-11.0/` |
