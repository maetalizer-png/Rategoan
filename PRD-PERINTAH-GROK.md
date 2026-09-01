# PRD — Perintah untuk Grok: MADLAD-400 Batch Baru (satu-satunya sisa kerjaan)

Status: **BERLAKU, ditulis ulang 2026-09-01 malam (koreksi ke-3)** —
instruksi ronde sebelumnya di dokumen ini ("retire panen-wikipedia-id
lagi") **SALAH DAN SUDAH DIKOREKSI DI SINI.** Grok sudah lebih dulu
mengerjakan Wikipedia dengan benar (dedupe per-fingerprint, bukan
overlap-penuh seperti dugaan Claude) SEBELUM instruksi salah itu
sempat dibaca — hasilnya sudah final, benar, tidak perlu diubah.
Permintaan maaf atas kebingungannya: instruksi lama didasarkan pada
observasi dangkal ("artikel pertama sama persis" → disimpulkan overlap
100%), padahal itu cuma menunjukkan urutan dump yang mirip, bukan isi
yang identik. Kesimpulan Grok yang menghitung dedupe sungguhan per
dokumen jauh lebih akurat.

---

## KOREKSI: Wikipedia SUDAH BENAR digabung, BUKAN di-retire

**Yang sebenarnya terjadi** (dikonfirmasi ulang lewat GitHub API +
download+hitung ulang token BPE langsung, 2026-09-01 malam):

Grok memproses `panen-wikipedia-id` (562.195 dokumen) dengan dedupe
per-fingerprint terhadap K1: **238.873 duplikat + 247.251 terlalu
pendek dibuang, sisa 76.071 dokumen benar-benar unik** digabung ke K1.
Release `korpus-ensiklopedia-bersih` sekarang:

| Field | Sebelum | Sesudah |
|---|---|---|
| Dokumen | 683.516 | **759.587** |
| SHA256 | `07502ad4…` | **`3383bc30…`** |
| Size gzip | 481.969.220 B | **570.582.531 B** |
| Token BPE resmi | 303.917.157 | **354.376.464** (dihitung ulang Claude, tokenizer proyek vocab 30.368) |

**Total token kanonik BARU (K1+K2+K3): 471.390.047** (naik dari
420.930.740 — kenaikan +50.459.307 token murni dari Wikipedia unik).
Ini angka VALID yang menggantikan semua angka sebelumnya di dokumen
ini. `korpus-manifest-total.json` dan `docs/STATUS-KORPUS-LISENSI.md`
sudah diperbarui Claude ke angka ini — **Grok TIDAK PERLU mengerjakan
apa pun lagi untuk Wikipedia**, sudah selesai dan benar.

---

## SATU-SATUNYA yang MASIH perlu dikerjakan Grok: `panen-madlad400-id` batch baru

Dicek ulang GitHub API, KONDISI TIDAK BERUBAH dari ronde sebelumnya:
asset `panen-madlad400-id` sekarang berisi **11 part BARU**
(`part-0011.jsonl.gz` s.d. `part-0021.jsonl.gz`, upload 2026-09-01
~16:21-16:36 UTC), **BUKAN** 11 part lama (`part-0000` s.d. `part-0010`)
yang sudah disample-review dan di-retire Grok minggu ini (part lama
sudah tidak ada di asset list — dihapus, entah oleh siapa/proses apa).

| Field | Nilai |
|---|---|
| Dokumen | 15.272.217 |
| Kata approx | 8.137.547.049 |
| Jumlah part | 11 (`part-0011` s.d. `part-0021`) |
| Status | **BELUM PERNAH DISAMPEL/DIREVIEW** |

Kesimpulan retirement Grok yang lama (18,7% spam) berdasarkan sample
dari part 0000/0005/0010 yang **SEKARANG SUDAH TIDAK ADA** — tidak
otomatis berlaku ke baris-baris baru ini, walau kemungkinan besar
polanya sama (timestamp upload ~16:21-16:36 UTC mendahului commit
perbaikan filter `7b8a433` di `main` beberapa jam, jadi kemungkinan
besar masih pakai filter LAMA).

### Rekomendasi (bukan wajib, pilih salah satu)

**Opsi A (disarankan, lebih efisien)**: re-run `panen.yml` untuk
`madlad400-id` sekarang. Filter spam baru (`deteksi_spam()`) + dedup
lintas-sesi sudah di `main` sejak commit `7b8a433` — diuji lokal (7/7
sampel spam sintetis terdeteksi, 0 false positive), tapi BELUM diuji
di data produksi HuggingFace nyata. Re-run kemungkinan besar
menghasilkan batch jauh lebih bersih daripada mereview batch yang
sudah pasti masih pakai filter lemah.

**Opsi B**: sample-review manual ≥500 baris acak dari BEBERAPA part
berbeda (bukan cuma part-0011, supaya tidak bias urutan file HF).
Hitung persentase spam judi/forex/blog vs teks naratif Indonesia
koheren. >70% bersih → filter lebih ketat dulu lalu gabung ke K1
(dedupe lintas-file wajib, ikuti PRD-DATA-RELEASE.md §5 langkah 6b/7).
Mayoritas masih sampah → retire, JANGAN naikkan budget panen lagi
tanpa perbaikan filter (perbaikan filter sudah ada, opsi A jadi lebih
masuk akal daripada ulangi opsi B lagi).

**Setelah diproses (lolos maupun retire)**: update
`korpus-manifest-total.json` (bagian `staging.panenMadlad400Id`) dan
`docs/STATUS-KORPUS-LISENSI.md`. Kalau lolos dan masuk K1/K3, total
token kanonik akan naik lagi dari 471.390.047 — update juga README.md
dengan angka BPE resmi baru (jangan pakai kata approx mentah).

---

## Checkpoint 200M sesi 3 (BARU, perlu publish)

Training lanjutan (90 menit lagi) selesai SETELAH bagian di atas
ditulis — checkpoint sesi 2 (`b5aeb665…`) yang sudah dipublikasikan
Grok sekarang SUDAH USANG, ada checkpoint lebih baru:

| Field | Nilai |
|---|---|
| SHA256 | `d4aba4d8b20efe52a91d5501666d9b9e7b04aeb1c1d51bf03da40854ce3c681a` |
| Ukuran | 171.344.024 byte (163,41 MB) |
| Held-out PPL | 1899,89 → **1068,37** |
| Akumulasi | 1787 step / 335,46 menit |

File sudah di-commit ke folder `checkpoint-200m/` di root repo (2 part,
sama seperti sebelumnya) — `git pull` lalu ikuti `checkpoint-200m/
README.md` untuk gabung+publish (perintah sama seperti 2 sesi
sebelumnya, cuma checksum yang beda).

---

## Ringkasan checklist ronde ini

- [x] ~~Wikipedia~~ — **SUDAH SELESAI**, sudah benar (dedupe+gabung ke
      K1), tidak ada tindakan lagi. Instruksi retire sebelumnya
      dicabut/dikoreksi di dokumen ini.
- [ ] **Checkpoint 200M sesi 3** (BARU) — publish ke Release
      `checkpoint-200m` menggantikan sesi 2, lihat bagian di atas.
- [ ] **MADLAD-400 batch baru** (15,27 juta dokumen, part 0011-0021):
      pilih Opsi A (re-run panen.yml, disarankan) atau Opsi B
      (sample-review manual ≥500 baris).
- [ ] Update manifest/STATUS setelah MADLAD-400 diproses (lolos atau
      retire) — token kanonik saat ini 471.390.047, cuma berubah kalau
      MADLAD-400 lolos review.
