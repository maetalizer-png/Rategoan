# Menambah data korpus baru (jilid 3, 4, dst)

Pipeline korpus Rategoan (Round 7-8) dibuat **idempoten** - menambah jilid
baru tidak perlu tulis kode baru, cukup 3 langkah:

## Langkah 1 - Upload aset ke GitHub Release

Upload file data baru (tgz artikel, parquet, atau format serupa) sebagai
aset di sebuah GitHub Release repo ini, dengan **tag baru** (mis. `Corpus-jilid3`).
Kalau sumbernya `.tgz` berisi file `.json` per-dokumen dengan field
`{url, date, title, content}` (format sama seperti `newspapers-json.tgz`),
atau `.parquet` dengan kolom `text`/`u`/`lang` (format sama seperti shard
CommonCrawl jilid 2), langsung kompatibel dengan skrip yang ada.

## Langkah 2 - Jalankan pipeline (4 perintah, sama persis)

```bash
# Ganti TAG, path file, dan angka jilid sesuai punyamu
python3 raget-tools/parse-korpus-jilid2.py <tgz_atau_none> <parquet1> <parquet2> ... <out_dir>
python3 raget-tools/clean-dedupe-korpus-jilid2.py <out_dir> <out_dir>/korpus-jilid3-clean.jsonl <out_dir>/fase3-report.json
python3 raget-tools/extract-tokenizer-from-checkpoint.py raget-data/neural/raget-neural-massive50m.safetensors <out_dir>/tokenizer.json
python3 raget-tools/tokenize-chunk-corpus.py <out_dir>/korpus-jilid3-clean.jsonl <out_dir>/tokenizer.json <out_dir>/jilid3-chunks-512.txt 512
python3 raget-tools/rechunk-corpus-window.py <out_dir>/jilid3-chunks-512.txt <out_dir>/jilid3-chunks-126.txt 126
```

- `parse-korpus-jilid2.py` menerima **jumlah parquet berapa pun** (bukan
  cuma 3) - tinggal tambahkan sebanyak yang ada.
- Kalau jilid baru tidak punya sumber `.tgz`, pakai `none` sebagai
  argumen pertama - tgz dilewati otomatis.
- Tokenizer SELALU diekstrak dari checkpoint 50M yang sudah ada (bukan
  dilatih ulang) - token ID dijamin identik lintas semua jilid dan ukuran
  model.

Tulis manifest jilid baru (format sama seperti
`raget-data/jsonl/external/korpus-jilid2-manifest.json`, isi field
`gabunganJilid1DanJilid2.jilid2TokenWindow126` dengan total token jilid
baru) sebagai `korpus-jilid3-manifest.json`, dst.

## Langkah 3 - Gabungkan manifest + update notebook Colab

```bash
python3 raget-tools/merge-korpus-manifest.py
```

Skrip ini otomatis men-scan SEMUA `korpus-jilid*-manifest.json` di
`raget-data/jsonl/external/` dan menjumlahkan totalnya ke
`korpus-manifest-total.json` - tidak perlu edit kode.

Di `colab-train-gpu.ipynb`, duplikasi sel 8-11 (unduh + parse + clean +
tokenize jilid) untuk jilid baru dengan `JILID2_TAG` diganti tag Release
barumu, lalu tambahkan hasil `jilidN-chunks-126.txt` ke perintah `cat`
di sel penggabungan korpus (sel 11) sebelum training di sel 12.

**Itu saja - 3 langkah, tanpa kode baru.**
