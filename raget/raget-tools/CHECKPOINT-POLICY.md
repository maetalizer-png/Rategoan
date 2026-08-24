# Kebijakan Gudang Besar - checkpoint neural

Aturan PERMANEN sejak Round 9 (kebijakan "dirigen"):

- **git** hanya menyimpan kode + checkpoint **di bawah 100MB** (batas keras
  GitHub). Saat ini itu berarti `raget-neural-tiny.safetensors`,
  `raget-neural-massive50m.safetensors` (35,9MB), dan
  `raget-neural-massive100m.safetensors` (77,8MB) tetap sebagai blob git
  biasa.
- **Checkpoint >100MB** (mis. `raget-neural-massive200m.safetensors`,
  163,41MB) **TIDAK** boleh di-commit ke git. Publikasikan sebagai asset
  di GitHub Release, tag `checkpoint-200m` (atau ukuran terkait untuk
  model yang lebih besar nanti: `checkpoint-300m`, dst).
- **JANGAN pakai Git LFS.** Kuota bandwidth LFS gratis GitHub kecil dan
  gampang habis ("jebakan" kuota) - Release asset tidak kena kuota
  bandwidth LFS.
- `.gitignore` di root repo sudah memuat pola untuk checkpoint >100MB
  (massive200m dan pola nama 300m/500m/1b/2b untuk model masa depan).

## Cara mengunduh checkpoint besar

Notebook Colab (`raget-tools/colab-train-gpu.ipynb`) dan
`train-massive-colab-gpu.py` mengunduh checkpoint >100MB dari Release
lewat GitHub API (pola yang sama dipakai untuk korpus jilid 2):

```
curl -H "Authorization: Bearer $GITHUB_TOKEN" \
     -H "Accept: application/octet-stream" \
     https://api.github.com/repos/<owner>/<repo>/releases/assets/<asset_id> \
     -o raget-neural-massive200m.safetensors
```

Asset ID dicari lewat `GET /repos/<owner>/<repo>/releases/tags/checkpoint-200m`.

## Saat checkpoint baru >100MB selesai training

1. Simpan checkpoint seperti biasa (lokal saja, jangan `git add`).
2. Upload sebagai Release asset baru (tag sesuai ukuran model).
3. Update dokumentasi/notebook yang menunjuk ke asset lama jika nama
   berubah.
4. `git status` harus tetap bersih untuk file checkpoint >100MB - kalau
   muncul sebagai "untracked", itu memang seharusnya begitu (dicegah
   `.gitignore`), bukan bug.
