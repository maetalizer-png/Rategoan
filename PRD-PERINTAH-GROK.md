# PRD — Perintah untuk Grok: Pindahkan checkpoint 200M ke Hugging Face Hub

Status: **BERLAKU, ditulis 2026-09-02.** Perintah EKSEKUSI. Selesai
berarti: file checkpoint benar-benar ada di `huggingface.co/maetalizer/rategoan-neural`
dan URL resolve-nya kirim header CORS (dibuktikan lewat `curl`, bukan
diasumsikan).

## Kenapa

Kode di `raget/raget-llm/neural-provider.js` sudah diubah untuk fetch
checkpoint tier "Raget 200M" dari Hugging Face Hub, BUKAN GitHub Release
lagi — sudah dikonfirmasi lewat pengujian langsung (`curl -H "Origin: ..."`)
bahwa asset GitHub Release TIDAK PERNAH kirim header
`Access-Control-Allow-Origin`, jadi `fetch()` dari browser PWA selalu
gagal dengan `TypeError` (pesan di UI: "Belum bisa diunduh: browser
memblokir akses..."). Tapi kodenya sekarang menunjuk ke file yang BELUM
ADA di Hugging Face — sampai tugas ini selesai, tier "Raget 200M" tetap
rusak total, cuma pindah lokasi masalahnya.

## Tugas — EKSEKUSI langkah ini persis

Ada checkpoint LEBIH BARU dari sesi training ke-4 (PPL 1068,37 → 932,47)
di `checkpoint-200m/` (root repo, split 2 part git-tracked) - pakai INI,
bukan yang lama di GitHub Release. Sekalian lompati GitHub Release sama
sekali, langsung ke Hugging Face:

```bash
git pull origin main
cd checkpoint-200m
cat raget-neural-massive200m.safetensors.part.00 \
    raget-neural-massive200m.safetensors.part.01 \
    > raget-neural-massive200m.safetensors

sha256sum raget-neural-massive200m.safetensors
# harus = 69daa21dd674643e68aa7fd648d592692db15017076d140adbef5dad8b5fc2a3
# (cek ulang checksum-parts.txt di folder ini kalau training lanjut lagi
# sebelum Grok baca ini)
cd ..

# Siapkan token HF (butuh akun huggingface.co dengan izin write,
# namespace "maetalizer" - kalau belum ada akun/repo, buat dulu di
# huggingface.co, repo model "rategoan-neural", visibility Public)
pip install huggingface_hub
export HF_TOKEN=hf_xxx

# Upload lewat skrip yang sudah disiapkan (verifikasi sha256 otomatis)
python3 raget/raget-tools/publish-checkpoint-huggingface.py \
    checkpoint-200m/raget-neural-massive200m.safetensors \
    maetalizer/rategoan-neural \
    raget-neural-massive200m.safetensors

# BUKTIKAN CORS beneran nyala (jangan asumsi) - harus muncul header
# access-control-allow-origin di response
curl -sI -H "Origin: https://rategoan.vercel.app" \
  https://huggingface.co/maetalizer/rategoan-neural/resolve/main/raget-neural-massive200m.safetensors \
  | grep -i "access-control-allow-origin"
# kalau baris ini KOSONG, migrasi GAGAL - jangan lapor selesai

git rm -r checkpoint-200m/
git commit -m "chore: hapus part ckpt 200M setelah publish ke Hugging Face"
git push origin main
```

Tugas ini SELESAI kalau `curl` di atas benar-benar mencetak header
`access-control-allow-origin` (nilainya boleh `*` atau echo origin,
dua-duanya cukup untuk `fetch()` browser) DAN folder `checkpoint-200m/`
sudah hilang dari repo (commit+push).

## Kalau langkah 5 gagal (HF juga tidak kirim CORS)

Jangan coba-coba hosting lain sendiri — laporkan balik ke dirigen dengan
output `curl` lengkapnya. Itu artinya asumsi soal HF Hub (dipakai luas
untuk `transformers.js`/WebLLM di browser) perlu dicek ulang untuk kasus
file besar non-model-card seperti ini.

## Opsional (JANGAN dikerjakan sebelum curl CORS di atas SUKSES)

Setelah checkpoint terbukti bisa diunduh dari HF dengan CORS OK, asset
lama di GitHub Release `checkpoint-200m` (sha256 `d4aba4d8…`, checkpoint
sesi ke-3, sudah kalah PPL dari yang baru ini) boleh dihapus - hemat
storage, sudah tidak dipakai kode sama sekali. Opsional, bukan syarat
"selesai".

## Checklist (centang HANYA setelah benar-benar terjadi)

- [ ] File ada di `huggingface.co/maetalizer/rategoan-neural`, sha256
      cocok `69daa21d…`.
- [ ] `curl -H "Origin: ..."` ke URL resolve HF MENUNJUKKAN header
      `access-control-allow-origin` (bukti tertulis di laporan).
- [ ] Folder `checkpoint-200m/` sudah dihapus dari repo (commit+push).
- [ ] Laporkan ke dirigen: URL final, hasil curl CORS, sudah/belum hapus
      asset GitHub Release lama.
