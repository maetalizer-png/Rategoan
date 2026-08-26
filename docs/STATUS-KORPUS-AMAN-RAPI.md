# STATUS KORPUS AMAN — RAPI (FINAL)

Tanggal rapi: 2026-08-26  
Struktur **dikunci**. Jangan redesign; hanya pakai daftar ini.

## Aturan tetap
- Semua di bawah ini **AMAN** (CC-BY-SA / milik sendiri / public domain tercatat)
- Training mengikuti `docs/MIX-TRAINING-SEIMBANG.md`
- Dilarang: balanced-v1, jilid-2, news, opensubtitles, Release X/terhapus

## Paket training (yang dipakai Claude)

| Peran | Tag Release | Keterangan |
|-------|-------------|------------|
| Ensiklopedia ID (utama) | `korpus-jilid-1-clean` (**A1**) | Satu-satunya wiki ID utama. Jangan campur A14/A15 bareng ini. |
| Dialog / gaya | `korpus-train-seimbang-bersih-v1` (**A3**) + `korpus-a3-dialog-seimbang-v2` (**A3v2**) | Upsample sampai ~20–25% |
| Daerah ID | `korpus-wiki-lokal-bersih-v1` (**A5**), `korpus-daerah-id-extra-v1` (**A9**), `korpus-idwikiquote-bersih-v1` (**A13**), `korpus-idwikivoyage-bersih-v1` (**A16**) | Gabungan ~10–15% |
| Pelengkap (pilih 1) | `korpus-simplewiki-bersih-v1` (**A17**) **atau** `korpus-edukasi-bersih-v1` (**A8**) | Max ~10–15% |

## Stok lain (ada di Release, tidak wajib tiap sesi)

| Tag | Catatan |
|-----|---------|
| `korpus-wiki-se-asia-bersih-v1` (A6) | Melayu + lokal kecil — opsional |
| `korpus-buku-naskah-bersih-v1` (A7) | enwikibooks — opsional |
| `korpus-idwiki-hf-bersih-v1` (A14) | Overlap A1 — **jangan** bareng A1 |
| `korpus-idwiki-derhan-bersih-v1` (A15) | Overlap A1 — **jangan** bareng A1 |
| `korpus-inti-id-buatan-v*` (A10–A12) | Kecil; boleh gabung upsample dialog |

## Yang tidak dipakai training
- Semua Release/data yang sudah dihapus karena risiko lisensi
- balanced-v1, jilid-2, news, subtitle

## Checklist sebelum training
1. [ ] Hanya load dari tabel **Paket training**
2. [ ] A14/A15 tidak ikut jika A1 aktif
3. [ ] A3+A3v2 di-upsample
4. [ ] 1 model per sesi
