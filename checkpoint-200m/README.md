# Checkpoint 200M — sesi training ke-4 (siap publish ke Hugging Face)

Sesi training ke-4 (90 menit, 240 step tambahan, total 2027 step / 425,5
menit). Held-out perplexity turun dari **1068,37 → 932,47**.

Ini BUKAN untuk GitHub Release lagi — kode sudah pindah ke Hugging Face
Hub (lihat `raget/raget-llm/neural-provider.js` + `PRD-PERINTAH-GROK.md`
di root repo untuk alasan lengkap: asset GitHub Release tidak pernah
kirim header CORS, jadi tidak bisa diunduh browser).

## Gabungkan lagi

```bash
cat raget-neural-massive200m.safetensors.part.00 \
    raget-neural-massive200m.safetensors.part.01 \
    > raget-neural-massive200m.safetensors

sha256sum raget-neural-massive200m.safetensors
# harus = 69daa21dd674643e68aa7fd648d592692db15017076d140adbef5dad8b5fc2a3
```

## Lalu ikuti `PRD-PERINTAH-GROK.md` di root repo

Upload langsung ke `huggingface.co/maetalizer/rategoan-neural` (bukan
GitHub Release), lalu buktikan header CORS-nya dengan `curl`, baru
hapus folder ini.
