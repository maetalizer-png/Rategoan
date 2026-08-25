# Kebijakan Gudang Besar - checkpoint neural

## Catatan audit (temuan Round 9 lanjutan) - "200.709.120 parameter" massive200m

Audit checkpoint `checkpoint-200m` (SHA256 `2c7238f3...78ed72`, byte-identik
dengan yang dikirim ke dirigen) menemukan: header safetensors-nya cuma
punya SATU tensor `embedding.weight` [30368, 1024] - tidak ada tensor
proyeksi output terpisah. Ini karena `llm-checkpoint.js` men-derive
`outputProjection` lewat transpose dari `embeddingMatrix` saat load
(weight tying, desain yang memang disengaja, BENAR dan kompatibel runtime -
bukan bug). Konsekuensinya: **jumlah nilai unik yang benar-benar tersimpan
di file cuma 169.612.288**, bukan 200.709.120. Selisihnya persis
30.368 x 1024 = 31.096.832 - besar embedding yang dihitung dua kali oleh
`countMatrixParams()` di `llm-weights.js` (sekali sebagai `embeddingMatrix`,
sekali lagi sebagai `outputProjection` turunannya, padahal keduanya adalah
angka yang sama, cuma ditranspose).

Kedua angka itu SAMA-SAMA hasil perhitungan nyata (bukan karangan) - cuma
menjawab pertanyaan berbeda: 200.709.120 = ukuran arsitektur kalau
embedding TIDAK di-tie (formula analitis `2VD + ...`), 169.612.288 = jumlah
nilai unik yang benar-benar tersimpan di disk (dengan tying). Konvensi umum
di luar (mis. laporan resmi ukuran GPT-2) biasanya sudah memperhitungkan
tying, jadi "200.709.120" sebaiknya TIDAK disebut sebagai satu-satunya
angka "parameter checkpoint ini" tanpa embel-embel penjelasan tying.

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

1. Simpan checkpoint seperti biasa (lokal saja, jangan `git add` -
   `git_auto_commit()` di `train-massive-colab-gpu.py` sudah otomatis
   skip file >95MB).
2. Upload sebagai Release asset baru:
   `python3 raget-tools/publish-checkpoint-release.py <path.safetensors> checkpoint-<ukuran>`
   (butuh `GITHUB_TOKEN` scope `repo` di environment - di notebook Colab
   sudah otomatis ter-set di sel awal).
3. Update dokumentasi/notebook yang menunjuk ke asset lama jika nama
   berubah.
4. `git status` harus tetap bersih untuk file checkpoint >100MB - kalau
   muncul sebagai "untracked", itu memang seharusnya begitu (dicegah
   `.gitignore`), bukan bug.

## Catatan penting: kenapa Claude tidak bisa upload sendiri

Sesi sandbox Claude Code Remote (tempat kode ini biasanya ditulis) TIDAK
diizinkan membuat/mengedit/menghapus GitHub Release - API mengembalikan
`"Creating, editing, or deleting releases is not permitted for this
session type."` walau token yang sama BISA baca release/unduh asset. Ini
pembatasan level-sesi yang disengaja (bukan bug, bukan masalah izin
repo) - jadi setiap kali ada checkpoint/korpus baru >100MB yang perlu
diarsipkan ke Release, publikasinya harus dijalankan dari luar sandbox itu
(notebook Colab dengan token milik pemilik repo, atau mesin lokal) memakai
`publish-checkpoint-release.py` di atas. Skrip itu generik - bisa dipakai
juga untuk mengarsipkan korpus bersih (`korpus-jilid-N-clean`), bukan
cuma checkpoint.
