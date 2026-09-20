# PRD Grok Build — satu perintah kerja

Jangan buat PRD baru. Jangan berhenti setelah baca.

## Alur

```
mentah → saring → rak K → hapus staging → QC rak (bukan pangkas token)
```

## Gerbang

**A.** K4 `korpus-kode-bersih` ≥200 MB gzip (The Stack JS permissive, MDN, Rosetta, repo). Bukan model luar.

**B.** Habiskan `id-hf-more-new-quality-2026-09` ke K1 (pelajaran/wiki) atau K3. Lalu hapus tag mentah.

**C. QC tingkat tinggi K1 K2 K3 — wajib, bukan opsional.**
Bukan buang topik. Bukan turunkan lantai **16.794.935.092**.
Periksa dan perbaiki:
- tata bahasa, tata kalimat, tata kata
- kepadatan informasi (bukan template 20×)
- fakta / pelajaran utuh
- penempatan: wiki/pelajaran → K1, sapaan → K2, hukum/berita/crawl → K3, kode → K4
Kalau dokumen jelek: rapikan atau ganti setara token. Jangan dikosongkan.
Laporan: `LAPORAN-QC-RAK.json` (contoh 20 dokumen per rak: sebelum/sesudah, lulus/gagal).

## Denah

K1 ensiklopedia (arah Phi). K2 dialog saja. K3 pelengkap. K4 kode.
Audio jangan ke rak teks.

Berhenti hanya jika A+B+C ada artefak di Release.
