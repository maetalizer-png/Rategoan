# PRD — Perintah untuk Grok: KERJAKAN 2 Tugas Ini (bukan cuma review)

Status: **BERLAKU, ditulis ulang 2026-09-01 malam.** Ini perintah
EKSEKUSI, bukan permintaan laporan/analisis. Selesai berarti: ada
commit baru di repo (manifest berubah, asset Release berubah). Kalau
sampai laporan berikutnya tidak ada commit baru sama sekali, berarti
tugas ini BELUM dikerjakan, bukan cuma "belum dilaporkan".

---

## Tugas 1 — EKSEKUSI: putuskan nasib `panen-madlad400-id`, JALANKAN keputusannya

Jangan berhenti di "sudah dicek, spam-nya sekian persen" — itu baru
separuh jalan. Tugas ini SELESAI kalau salah satu dari dua ini SUDAH
TERJADI di repo:
- **K1 bertambah** (commit baru ke `korpus-ensiklopedia-bersih`, dokumen
  count naik dari 759.587), ATAU
- **Tag `panen-madlad400-id` ditandai retire** di
  `docs/STATUS-KORPUS-LISENSI.md` (commit baru).

Langkah untuk sampai ke salah satu di atas:

1. **KERJAKAN**: sample ≥500 baris acak dari part `0011`, `0018`,
   `0027` (17 part total, ~30 GB, 46.288.458 dokumen per
   `progress.json`). Hitung % spam judi/forex/slot/blog vs teks
   naratif Indonesia koheren.
2. **KERJAKAN**: dedupe hasil sample yang bersih terhadap K1
   (759.587 dokumen, tag `korpus-ensiklopedia-bersih`).
3. **PUTUSKAN DAN JALANKAN** (pilih satu, JANGAN berhenti di analisis):
   - **Lolos** (mayoritas bersih) → filter ketat seluruh data (bukan
     cuma sample) buang pola spam, gabung sisa unik ke K1, **upload
     asset gzip baru + `manifest.json` ke Release
     `korpus-ensiklopedia-bersih`** (`totalTokenBPEResmi` boleh
     `null`+catatan kalau belum sempat hitung BPE, Claude bisa
     lanjutkan itu).
   - **Gagal** (mayoritas spam, sesuai pola sebelumnya 18,7%) →
     **commit** penanda retire ke `docs/STATUS-KORPUS-LISENSI.md`
     SEKARANG (bukan nanti), JANGAN panen ulang sumber ini sampai
     filter `deteksi_spam()` (commit `7b8a433`, sudah di `main`)
     benar-benar dipakai di run panen berikutnya.
4. **KERJAKAN**: commit `korpus-manifest-total.json` dengan hasil final
   (basis sebelum tugas ini: 471.390.047 token kanonik).

---

## Tugas 2 — EKSEKUSI: publish checkpoint ke Release SEKARANG

Ini bukan langkah opsional atau "kalau sempat" — jalankan urutan
perintah ini langsung:

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

git rm -r checkpoint-200m/
git commit -m "chore: hapus part checkpoint setelah publish Release"
git push origin main
```

Tugas ini SELESAI kalau: Release `checkpoint-200m` di GitHub menunjukkan
asset dengan SHA256 `d4aba4d8…` (bukan `b5aeb665…` yang lama), DAN
folder `checkpoint-200m/` sudah hilang dari repo.

---

## Checklist (centang HANYA setelah commit/upload benar-benar terjadi)

- [ ] Tugas 1: commit nyata ada — K1 bertambah ATAU
      `STATUS-KORPUS-LISENSI.md` menandai retire.
- [ ] Tugas 2: asset Release `checkpoint-200m` sudah SHA256
      `d4aba4d8…`, folder `checkpoint-200m/` sudah dihapus.
- [ ] Laporkan ke dirigen: % spam MADLAD-400, keputusan final (K1
      bertambah / retire), angka token kanonik baru kalau berubah.
