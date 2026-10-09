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
| 11.16 | Unit 87/87, lint 0/0, Playwright 16/16 |
| 11.17 | Bukti di `docs/evidence/antarmuka-11.0/`, segel SHA-256 objek komit, tanpa GPG |

Pengukuran hidup (Chromium saja), diikat pada komit `c79b12a78e9cb060691348ac504a407070f068db`:

- Studio kosong: popover `top` 61px, 7 opsi seluruhnya di dalam viewport, animasi 0.15s. Celah 10px tidak dipakai di sini karena komposer masih di tengah.
- Chat kosong: `top` 125px, 10 opsi utuh, backdrop `rgba(0, 0, 0, 0)`.
- Chat aktif: celah 10px di atas tombol tambah, `sheet.top` 176px, batas bawah topbar 60px.
- Sasis artefak: `max-width` 960px, padding `40px 48px 64px`.
- Galeri: aturan `minmax(280px, 1fr)`; lebar terhitung `422px 422px`; pratinjau 110px; tombol Pratinjau dan Unduh.
- Hub konektor: 2 kolom pada 1366px. Lembar studio ponsel: tinggi 263px.
- Unit 87/87. Lint 0/0 (sintaks 332 berkas, skema 208 berkas / 3934 entri).
- Devlog tematik 63 baris. Laporan ringkas 2090 byte, tanpa frasa round 8.
