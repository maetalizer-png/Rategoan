# PRD — Perintah untuk Grok: 2 Tugas (MADLAD-400 + Publish Checkpoint)

Status: **BERLAKU, ditulis ulang 2026-09-01 malam.** 2 tugas konkret,
tidak ada lagi — kerjakan berurutan.

---

## Tugas 1 — Review `panen-madlad400-id` (17 asset, ±30 GB), promosikan ke K1 kalau lolos

`panen-madlad400-id` sekarang 17 part (`part-0011` s.d. `part-0027`),
~30 GB, 46.288.458 dokumen per `progress.json`. Belum pernah direview
(part lama yang sudah direview dan di-retire minggu ini, 0000-0010,
sudah tidak ada di Release — angka baru ini sepenuhnya baru).

**Langkah:**
1. Cek spam-rate: sample ≥500 baris acak dari BEBERAPA part (bukan
   cuma satu — ambil dari part awal 0011, tengah 0018, akhir 0027).
   Hitung persentase spam judi/forex/slot/blog vs teks naratif
   Indonesia koheren (pola sama seperti review sebelumnya yang
   menemukan 18,7% spam di batch lama).
2. Dedupe vs K1 (`korpus-ensiklopedia-bersih`, sekarang 759.587
   dokumen setelah Wikipedia digabung) — buang baris yang sudah ada
   di K1.
3. **Kalau lolos ambang kualitas** (mayoritas bersih, PRD-DATA-RELEASE.md
   §5): promosikan sisa unik ke K1 kanonik — filter ketat dulu (buang
   pola spam yang match), gabung, upload asset baru + `manifest.json`
   dengan `totalTokenBPEResmi` (biar Claude bisa hitung ulang BPE
   setelahnya, atau isi `null` + catatan seperti pola Wikipedia
   kemarin kalau belum sempat hitung).
4. **Kalau mayoritas masih spam**: retire tag, catat di
   `docs/STATUS-KORPUS-LISENSI.md`, JANGAN panen ulang sumber ini
   sampai `tools/panen_hf.py` filter spam (`deteksi_spam()`, sudah di
   `main` sejak commit `7b8a433`) benar-benar dipakai jalan ulang.
5. Update `korpus-manifest-total.json` sesuai hasil (lolos atau
   retire) — total kanonik saat ini 471.390.047 token, jadi basis
   sebelum tugas ini.

---

## Tugas 2 — Publish checkpoint 200M terbaru (PPL 1068,37) ke Release

```bash
git pull origin main
cd checkpoint-200m
cat raget-neural-massive200m.safetensors.part.00 \
    raget-neural-massive200m.safetensors.part.01 \
    > raget-neural-massive200m.safetensors

sha256sum raget-neural-massive200m.safetensors
# harus = d4aba4d8b20efe52a91d5501666d9b9e7b04aeb1c1d51bf03da40854ce3c681a
# (cek ulang checksum-parts.txt di folder ini kalau sudah lebih baru
# saat Grok baca ini - training di sandbox Claude terus berjalan)

cd ..
export GITHUB_TOKEN=<token dengan izin repo:contents write>
python3 raget/raget-tools/publish-checkpoint-release.py \
    checkpoint-200m/raget-neural-massive200m.safetensors checkpoint-200m \
    "01 · Checkpoint 200M (ronde 2026-09-01, PPL 1068,37)" \
    "1787 step akumulasi / 335,46 menit, held-out PPL 1899,89->1068,37 (mix K1 55-65%/K2 25-35%/K3 <=15% sesuai PRD-DATA-RELEASE §10). Generasi belum koheren - lihat PRD-PRODUKSI-READY.md."
```

Setelah sukses, folder `checkpoint-200m/` aman dihapus dari repo.

---

## Checklist

- [ ] Tugas 1: MADLAD-400 direview (spam-rate + dedupe), hasil
      dieksekusi (promosi ke K1 atau retire), manifest diperbarui.
- [ ] Tugas 2: checkpoint PPL 1068,37 dipublikasikan ke Release
      `checkpoint-200m`.
- [ ] Laporkan hasil ke dirigen: persentase spam MADLAD-400, keputusan
      final, angka token kanonik baru kalau berubah.
