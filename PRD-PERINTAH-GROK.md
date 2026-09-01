# PRD — Perintah untuk Grok: Klarifikasi Token + Panen Baru (ronde kejelasan)

Status: **BERLAKU, dicek ULANG 2026-09-01 malam (re-konfirmasi ke-2)**
— dirigen minta cek ulang Release, dicek langsung lewat GitHub API
detik ini juga: **isinya PERSIS SAMA dengan temuan pertama di §3, tidak
ada perubahan lagi.** "2 file baru" yang dimaksud dirigen = 2 tag panen
di §3 (`panen-madlad400-id` + `panen-wikipedia-id`), keduanya sudah
diidentifikasi dan sudah ada instruksi konkret di §3-4 di bawah — bukan
temuan baru lagi, ini KONFIRMASI ULANG bahwa arahan di bawah masih
akurat dan Grok tinggal eksekusi.

**Checkpoint 200M: SUDAH beres, tidak perlu dikerjakan lagi** — Release
`checkpoint-200m` sekarang berisi asset 171.344.036 byte (dikonfirmasi
lewat GitHub API), cocok dengan checkpoint sesi training ke-2 (PPL
1242,11) yang sudah dipublikasikan Grok. Ronde sebelumnya (publish
checkpoint + review madlad/wikipedia LAMA) sudah **SELESAI dikerjakan
Grok** (terverifikasi: `docs/STATUS-KORPUS-LISENSI.md` diperbarui,
commit `309ff63`/`4a091d2`/dst menghapus folder handoff setelah publish
sukses). Dokumen ini fokus ke 2 hal yang MASIH terbuka: (1) klarifikasi
angka token yang valid (§1-2), (2) 2 batch panen baru yang belum
direview (§3-4).

---

## ARAHAN LANGSUNG UNTUK GROK (baca ini dulu, detail di §1-4 di bawah)

1. **Jangan ubah/klaim angka token apa pun** — total kanonik TETAP
   420.930.740 (K1+K2+K3) sampai salah satu dari 2 file baru di bawah
   lolos review dan resmi digabung. Lihat §1.
2. **`panen-madlad400-id`** (11 part baru, `part-0011` s.d. `part-0021`,
   15,27 juta dokumen) — **WAJIB direview**, BELUM pernah disampel.
   Pilihan tercepat: re-run `panen.yml` sekarang (filter spam baru
   sudah di `main`, commit `7b8a433`) daripada review manual batch yang
   masih pakai filter lama. Detail: §3-4.
3. **`panen-wikipedia-id`** (1 part baru, 562.195 dokumen) — angkanya
   IDENTIK batch yang sudah di-retire minggu ini. Cukup **retire lagi**
   dengan catatan singkat di `STATUS-KORPUS-LISENSI.md`, TIDAK perlu
   sample-review ulang dari nol. Detail: §3.
4. **Checkpoint 200M**: sudah beres, TIDAK ADA tindakan diperlukan.

---

## 1. JAWABAN LANGSUNG: token mana yang valid?

**Yang valid dipakai training HANYA K1+K2+K3 = 420.930.740 token BPE.**
Ini angka yang dikutip dirigen — **BENAR**, sudah dikonfirmasi ulang
lewat pengecekan langsung ke GitHub Release + tokenizer BPE proyek
(vocab 30.368) di ronde ini juga.

| Rak | Dokumen | Token BPE resmi |
|---|---|---|
| K1 ensiklopedia | 683.516 | 303.917.157 |
| K2 dialog+daerah | 291.928 | 85.003.080 |
| K3 pelengkap | 97.548 | 32.010.503 |
| **Total kanonik** | **1.072.992** | **420.930.740** |

**Angka LAIN yang BUKAN valid untuk training (jangan dipakai, jangan
dicampur dengan angka di atas):**
- **~750 juta** — ini mengandung jilid2 (sumber HPLT/CommonCrawl,
  risiko lisensi/kualitas tinggi) yang SUDAH DIBUANG dari korpus
  kanonik sejak awal. Bukan valid, bukan token BPE juga (kemungkinan
  campuran metode hitung lama).
- **~8 miliar kata MADLAD** — ini KATA APPROX (bukan token BPE, metode
  hitung beda) dari data STAGING `panen-madlad400-id`, yang **SUDAH
  DI-RETIRE** oleh Grok minggu ini (18,7% spam judi/forex/slot dari
  sample 750 baris — lihat `docs/STATUS-KORPUS-LISENSI.md`). Staging
  yang di-retire TIDAK PERNAH masuk hitungan token training.

**Target jangka panjang tetap ≈ 4 miliar token** (kertas rencana lama)
— stok kanonik sekarang (421 juta) memang masih jauh di bawah itu.
Ini **BUKAN masalah/bug** — target 4 miliar itu memang untuk model
jauh lebih besar/rencana jangka panjang, bukan gerbang yang harus
dicapai sekarang untuk checkpoint 200M yang sedang dilatih.

---

## 2. Kenapa terasa "stagnan"? (jawaban ke keluhan dirigen)

Token kanonik TIDAK NAIK sejak beberapa ronde terakhir — ini **BUKAN
bug atau kelalaian**, ini persis cara gerbang kualitas bekerja:

- Tiap kali ada panen data baru (`panen-madlad400-id`,
  `panen-wikipedia-id`), data itu masuk sebagai **STAGING** dulu,
  WAJIB direview manual sebelum bisa naik ke K1/K2/K3 (PRD-DATA-RELEASE
  §5). Data yang gagal review (spam/overlap) **DI-RETIRE**, bukan
  dipaksa masuk supaya angka kelihatan naik.
- Sejauh ini SEMUA panen baru yang direview GAGAL: MADLAD-400 dua kali
  berturut-turut (judi/forex/blog), Wikipedia overlap penuh dengan K1
  yang sudah lebih lengkap. Jadi total kanonik memang belum naik dari
  420,9 juta — **itu gerbang kualitas bekerja sesuai desain, bukan
  proses yang macet.**

---

## 3. PENTING: ada panen BARU LAGI di Release (baru muncul, BELUM direview)

Dicek langsung ke GitHub API saat dokumen ini ditulis — **kedua tag
panen berubah isinya** dibanding yang sudah direview Grok:

**`panen-madlad400-id`** — asset SEKARANG cuma berisi **11 part BARU**
(`part-0011.jsonl.gz` s.d. `part-0021.jsonl.gz`, upload 2026-09-01
~16:21-16:36 UTC), **BUKAN** 11 part lama (`part-0000` s.d.
`part-0010`) yang sudah direview Grok minggu ini (part lama sudah
tidak ada di asset list). Total manifest baru: **15.272.217 dokumen,
±8,14 miliar kata approx** — angka SANGAT MIRIP batch lama (15.236.123
dok), kemungkinan besar hasil re-run `panen.yml` dengan filter LAMA
(belum termasuk perbaikan spam filter di §4). **INI BELUM PERNAH
DISAMPEL/DIREVIEW** — kesimpulan retirement Grok yang lama (18,7%
spam) berdasarkan sample dari part 0000/0005/0010 yang SEKARANG SUDAH
TIDAK ADA, jadi tidak otomatis berlaku ke baris-baris baru ini
walau kemungkinan besar polanya sama (filter yang menghasilkannya
belum berubah saat run ini terjadi).

**`panen-wikipedia-id`** — asset baru (upload ~16:48 UTC) tapi angkanya
**PERSIS SAMA** dengan yang sudah direview & di-retire Grok (562.195
dokumen, 136.840.867 kata, artikel pertama sama). Kemungkinan besar
cuma re-run yang menghasilkan output identik (dump Wikipedia sumbernya
statis). **Kesimpulan retire Grok yang lama (overlap penuh dengan K1)
MASIH BERLAKU untuk batch ini** — tidak perlu direview ulang dari nol,
cukup dikonfirmasi datanya benar identik (SHA256 part-0000 kalau mau
dipastikan) lalu retire lagi dengan catatan singkat.

---

## 4. Rekomendasi: perbaikan filter SUDAH ADA di `main`, pertimbangkan re-run dulu

Ronde ini (`tools/panen_hf.py`, commit `7b8a433`) sudah ditambahkan:
- **Filter spam** (`deteksi_spam()`) — pola judi/togel/slot/forex/
  boilerplate blog, diuji lokal (korpus sintetis: 7/7 spam terdeteksi,
  0 false positive pada teks bersih). BELUM diuji di data produksi
  HuggingFace nyata (butuh jalan lewat `panen.yml` sungguhan).
- **Dedup lintas-sesi** (`muat_hash_lama`/`simpan_hash_baru`) — dulu
  tiap run `panen_hf.py` reset hash dedup dari nol, jadi run berulang
  bisa menyimpan dokumen sama persis lagi. Sekarang hash disimpan
  sebagai asset `dedup-hashes.txt.gz` per tag, dimuat ulang tiap sesi.

**Saran (bukan wajib)**: batch MADLAD-400 baru di §3 di atas dipanen
SEBELUM perbaikan filter ini masuk `main`. Kalau Grok punya waktu/akses
`workflow_dispatch`, **menjalankan ulang `panen.yml` untuk
`madlad400-id` sekarang** (dengan filter baru aktif) kemungkinan
menghasilkan batch yang jauh lebih bersih daripada mereview batch lama
yang sudah pasti masih pakai filter lemah — lebih efisien daripada
sample-review manual 500 baris yang kemungkinan besar tetap gagal.
Kalau tidak ada waktu, sample-review manual batch §3 tetap valid
sebagai alternatif (ikuti langkah §2.2 versi lama di riwayat git
dokumen ini kalau perlu rujukan detail langkah).

---

## Ringkasan checklist ronde ini

- [ ] Konfirmasi ke dirigen: 420.930.740 token BPE (K1+K2+K3) adalah
      SATU-SATUNYA angka valid — sudah dijelaskan §1, tinggal
      dikonfirmasi diterima/dipahami.
- [ ] MADLAD-400 batch baru (§3, 15,27 juta dokumen, part 0011-0021):
      pilih salah satu — (a) re-run `panen.yml` dengan filter baru
      (§4, disarankan), atau (b) sample-review manual ≥500 baris dari
      part baru ini.
- [ ] Wikipedia batch baru (§3): konfirmasi identik dengan yang sudah
      di-retire, retire lagi dengan catatan singkat (kemungkinan besar
      tidak perlu review ulang penuh).
- [ ] Update `korpus-manifest-total.json`/`STATUS-KORPUS-LISENSI.md`
      HANYA kalau ada perubahan nyata (data baru lolos review) — kalau
      tetap retire semua, cukup catat tanggal+kesimpulan baru di
      `STATUS-KORPUS-LISENSI.md`, angka kanonik 420.930.740 tetap sama.
