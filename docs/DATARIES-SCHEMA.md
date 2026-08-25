# Skema Data Dataries

> **Update 2026-08-26:** Seluruh domain (termasuk sapaan & tokoh) dimuat dari
> `raget/raget-data/json/<domain>/` lewat `dataries-registry.js`. Folder
> `raget/raget-dataries/` (modul JS legacy) sudah dikosongkan/dihapus.

Setiap item mengikuti skema JSON seragam Fase B:

```json
{ "id": "...", "kategori": "...", "wilayah": null, "nama": "...", "tags": [], "teks": "...", "meta": {} }
```

Saat di-load, registry mengubahnya ke bentuk legacy `{ text, metadata }` supaya
`dataries-bridge.js` tidak perlu diubah.

## Pola Registrasi & Lazy Load

Semua region terdaftar di `raget/raget-agents/dataries-registry.js` lewat `REGIONS`, dimuat lazy
per region (dynamic `import()` + cache `Map`) lewat `dataries.loadRegion(group, id)`.
Ini menjaga waktu boot tetap cepat meski total data terus bertambah.

## Pola Pencarian

Pencarian dasar (word-overlap, fuzzy substring) dicontohkan di
`raget/raget-agents/dataries-bridge.js` — fungsi `fuzzyEq`, `matchScore`, dan
`findBestInList` bisa dipakai ulang untuk skenario pencarian lain di luar
chatbot (mis. filter/kartu UI seperti di `jalanin/app.js`).
