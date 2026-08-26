# STATUS KORPUS — patuh PRD §3.1 + §8

Tanggal perbaikan: 2026-08-26  
Acuan: `/PRD-DATA-RELEASE.md`

## Release aktif

| Tag | Satu file fisik | sha256 di manifest | Status |
|-----|-----------------|--------------------|--------|
| `korpus-ensiklopedia-bersih` | ✅ 503.9 MB | ✅ `cc81c779...` | **PATUH** |
| `korpus-dialog-daerah-bersih` | ✅ 67.8 MB | ✅ | **PATUH** |
| `korpus-pelengkap-bersih` | ✅ 467.7 MB | ✅ `d4d1afa4...` | **PATUH** |
| `checkpoint-100m` / `checkpoint-200m` | — | — | tidak diubah |

## Mix training
- ensiklopedia 55–65%
- dialog+daerah 25–35% (upsample)
- pelengkap 5–15%

## Catatan
K1 & K3 diperbaiki dari multi-file → **satu** `.jsonl.gz` + `manifest.sha256` (wajib §3.1 + §8).
