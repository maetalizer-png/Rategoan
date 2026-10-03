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

Aturan sejak 3 Oktober 2026. Menggantikan aturan Round 9 yang menyimpan checkpoint di bawah 100MB di git dan yang di atasnya di GitHub Release.

- **Semua** berkas `.safetensors`, tanpa kecuali ukuran, disimpan di satu repo Hugging Face: `huggingface.co/Maetalizer19/rategoan-neural`.
- **Bukan git, bukan GitHub Release.** Asset Release tidak mengirim `Access-Control-Allow-Origin`, jadi `fetch()` browser gagal diam-diam dan tier jatuh ke model yang lebih ringan. HF `resolve/main` mengirim `access-control-allow-origin: *`.
- **Jangan pakai Git LFS** di repo GitHub.
- `.gitignore` menolak `raget/raget-data/neural/*.safetensors`.

Tier browser di `neural-provider.js` (berkas yang tadinya di git, bukan aset tag rilis):

| Tier | Berkas | SHA256 |
|---|---|---|
| ringan | `raget-neural-massive50m.safetensors` | `5695724eb0b21f510ae608441ce794cfd037fc34715de2cc1db197f578525c67` |
| berat | `raget-neural-massive100m.safetensors` | `2e382d64ad224ec8b9a703f2a3d9015a737466a9b58dc878158189e9f9567729` |
| super | `raget-neural-massive200m.safetensors` | `69daa21dd674643e68aa7fd648d592692db15017076d140adbef5dad8b5fc2a3` |

Bukan tier browser, tetap disimpan di HF supaya tidak hilang:

- `raget-neural-tiny.safetensors` — tidak dipetakan ke tier. Pemakainya hanya skrip arsip `train-tiny-checkpoint.mjs` dan `diagnose-neural-generation.mjs`.
- `raget-neural-50m.safetensors` — keluaran training preset small, bukan jalur muat browser.
- `raget-neural-massive100m-rilis.safetensors`, SHA256 `50a2f579382ce21d29ba0f1d26ec4dcb8bc0d5c07694bc4a74df41bfeaf7444e`, 81.589.032 byte. Ini salinan tag GitHub `checkpoint-100m`. Byte-nya berbeda dari berkas tier berat.

## Cara menerbitkan checkpoint

```
export HF_TOKEN=...
python3 raget/raget-tools/publish-checkpoint-huggingface.py <path.safetensors> Maetalizer19/rategoan-neural
```

Skrip menolak dianggap selesai kalau SHA256 remote tidak cocok. Ubah `CHECKPOINT_BY_TIER` hanya jika berkas itu memang tier browser.

Tag GitHub `checkpoint-100m` dan `checkpoint-200m` tidak dipakai lagi setelah salinan HF di atas cocok. Jangan membuat tag checkpoint baru di GitHub Release.
