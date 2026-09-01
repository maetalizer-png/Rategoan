# Checkpoint 200M — pending publish ke Release `checkpoint-200m`

Ditaruh di sini (bukan dikirim lewat chat) karena sesi sandbox Claude Code
Remote **tidak bisa** publish GitHub Release langsung (diblokir classifier
keamanan harness — lihat `PRD-PERINTAH-GROK.md` §1 untuk detail). Jadi
checkpoint di-commit sebagai file biasa di git, dipecah 2 part supaya di
bawah batas keras GitHub 100MB/file, biar Grok/dirigen tinggal ambil dari
sini dan publish ke Release.

## Cara pakai

```bash
cat raget-neural-massive200m.safetensors.part.00 \
    raget-neural-massive200m.safetensors.part.01 \
    > raget-neural-massive200m.safetensors

sha256sum raget-neural-massive200m.safetensors
# harus = b5aeb66551d0f73d853e74e4901c202425bce5a72f2f8479f2b0ddcd7a6df13c
# (lihat checksum-parts.txt untuk detail ukuran tiap part)

cd ..
export GITHUB_TOKEN=<token dengan izin repo:contents write>
python3 raget/raget-tools/publish-checkpoint-release.py \
    checkpoint-200m/raget-neural-massive200m.safetensors checkpoint-200m \
    "01 · Checkpoint 200M (ronde 2026-09-01, sesi 90 menit lanjutan)" \
    "1570 step akumulasi / 245,24 menit, held-out PPL 2361,03->1242,11 (mix K1 55-65%/K2 25-35%/K3 <=15% sesuai PRD-DATA-RELEASE §10). Generasi belum koheren - lihat PRD-PRODUKSI-READY.md."
```

Setelah berhasil publish ke Release, folder `checkpoint-200m/` ini
(2 part + checksum-parts.txt + README ini) **aman dihapus dari repo**
supaya tidak membengkakkan sejarah git — checkpoint sudah tersimpan
permanen sebagai Release asset.

Preseden format yang sama pernah dipakai commit `e9929ec` (ronde 25
Agustus), bedanya kali ini ditaruh di root (`checkpoint-200m/`) bukan
`raget/raget-data/neural/`, sesuai permintaan dirigen.
