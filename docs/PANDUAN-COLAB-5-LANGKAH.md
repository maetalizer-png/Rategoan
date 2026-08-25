# Panduan Colab 5 Langkah — Publikasikan Checkpoint 200M + Korpus Bersih

Panduan ini untuk **dirigen** (pemilik repo), ditulis untuk pemula —
tidak mengasumsikan kamu sudah paham Colab, Git, atau terminal. Ikuti
urutan, salin-tempel tiap blok kode ke Colab, klik tombol play (▶) di
kiri tiap sel.

**Kenapa harus lewat Colab, bukan lewat Claude langsung?** Sesi sandbox
tempat Claude bekerja diblokir dari dua hal: (1) mengunduh langsung dari
`dumps.wikimedia.org`, dan (2) membuat/mengubah GitHub Release — ini
sudah dikonfirmasi lewat percobaan langsung (termasuk pakai token
pribadimu — errornya tetap sama, jadi ini pembatasan level-sesi, bukan
soal izin token). Colab tidak kena pembatasan itu, jadi lima langkah di
bawah semuanya dijalankan di Colab.

**Istilah dasar:**
- **Colab** = colab.research.google.com, aplikasi Google untuk menjalankan
  kode Python gratis di browser (dengan GPU gratis).
- **Sel (cell)** = satu blok kode di notebook Colab. Tiap sel dijalankan
  dengan klik tombol ▶ di pojok kiri-atasnya, atau Shift+Enter.
- **Secret** = tempat aman di Colab untuk menyimpan token/password supaya
  tidak ketik ulang tiap kali dan tidak kelihatan di kode.
- **Token (GITHUB_TOKEN)** = "kunci" yang memberi izin Colab
  membaca/menulis ke repo GitHub-mu. Buat baru di
  https://github.com/settings/tokens (Fine-grained → pilih repo
  `Rategoan` saja → izinkan **Contents: Read and write**).

Buka notebook: buka file `raget-tools/colab-train-gpu.ipynb` di GitHub,
klik tombol "Open in Colab" (atau upload manual file itu ke
colab.research.google.com).

---

## Langkah 1 — Upload 7 bagian checkpoint, gabungkan, cek SHA256

Checkpoint `raget-neural-massive200m.safetensors` (163MB) sudah dikirim
Claude ke kamu lewat chat, terpecah jadi 7 file `.part` (karena limit
kirim file 30MB) + 1 file panduan teks.

1. Di Colab, klik ikon folder 📁 di sidebar kiri.
2. Seret (drag & drop) ke-7 file `.part` itu ke area file Colab (folder
   `/content/`). Tunggu sampai semua selesai ter-upload (progress bar di
   tiap file hilang).
3. Buat sel kode BARU di notebook (klik `+ Code`), tempel dan jalankan:

```python
!cat /content/raget-neural-massive200m.safetensors.*.part > /content/raget-neural-massive200m.safetensors
!sha256sum /content/raget-neural-massive200m.safetensors
```

4. Bandingkan hasil `sha256sum` dengan angka ini — **harus sama persis**:

```
2c7238f309d333f5b011c574d7aa705383274b87969f215d128af5f63378ed72
```

Kalau sama persis → file utuh, lanjut ke Langkah 2. Kalau beda → ada
bagian yang gagal upload, hapus semua `.part` di Colab dan upload ulang
dari awal.

---

## Langkah 2 — Set token di Colab Secrets

1. Klik ikon **kunci 🔑** di sidebar kiri Colab (namanya "Secrets").
2. Klik "Add new secret".
3. Nama: `GITHUB_TOKEN` (persis, huruf besar semua).
4. Value: tempel token GitHub-mu (yang scope `Contents: Read and write`
   khusus repo Rategoan).
5. Aktifkan toggle "Notebook access" di sebelahnya (harus hijau/menyala).

Sekarang jalankan sel notebook **"0. Cek GPU tersedia"**, lalu
**"1. Ambil GitHub token"**, lalu **"2. Clone repo Rategoan"** — jalankan
satu-satu, tunggu tiap sel selesai (tanda ▶ berubah jadi angka) sebelum
lanjut ke sel berikutnya. Sel "2. Clone repo Rategoan" akan membuat folder
`/content/repo/` berisi salinan repo Rategoan.

Setelah sel "2. Clone repo Rategoan" selesai, pindahkan checkpoint hasil
Langkah 1 ke tempat yang benar:

```python
!mkdir -p /content/repo/raget/raget-data/neural
!mv /content/raget-neural-massive200m.safetensors /content/repo/raget/raget-data/neural/
!ls -la /content/repo/raget/raget-data/neural/
```

---

## Langkah 3 — Publikasikan Release `checkpoint-200m`

Jalankan sel **"13b. (Opsional) Publikasikan checkpoint >100MB ke
Release"** di notebook. Sebelum klik ▶, centang kotak parameter
`ARSIPKAN_CHECKPOINT_BESAR` (klik supaya jadi ✅/True) — lokasinya di
kanan atas sel itu (Colab menampilkan checkbox untuk baris
`# @param {type:"boolean"}`).

Setelah selesai, akan muncul baris terakhir seperti:
```
Upload selesai: https://github.com/maetalizer-png/Rategoan/releases/download/checkpoint-200m/raget-neural-massive200m.safetensors
```
Itu tandanya **berhasil**. Simpan URL itu untuk laporan nanti.

---

## Langkah 4 — Buat korpus bersih (jilid 1 + jilid 2)

Jalankan sel-sel berikut **satu per satu, berurutan** (tunggu tiap sel
selesai sebelum lanjut — proses ini makan waktu, terutama sel "5"
[jilid 1] dan "9"/"10" [jilid 2], bisa belasan-puluhan menit tergantung
kecepatan Colab hari itu):

- **"3. Unduh dump Wikipedia"** — otomatis coba dari Release dulu, kalau
  tidak ada, langsung unduh dari `dumps.wikimedia.org` (Colab tidak
  diblokir dari sana, beda dengan sandbox Claude).
- **"4. Ekstrak tokenizer"**
- **"5. Extract + bersihkan wikitext"** — ini yang menghasilkan korpus
  bersih jilid 1, tersimpan di `/content/idwiki-clean.jsonl`.
- **"8. Unduh 4 aset korpus JILID 2 dari GitHub Release 'Corpus'"**
- **"9. Parse jilid 2"**
- **"10. Bersihkan + dedupe jilid 2"** — ini yang menghasilkan korpus
  bersih jilid 2, tersimpan di
  `/content/jilid2/korpus-jilid2-clean.jsonl`.

Sel "6", "7", "11", "12" (tokenisasi/training) **boleh dilewati** kalau
tujuanmu cuma publikasi korpus bersih, bukan training.

---

## Langkah 5 — Publikasikan Release korpus bersih

Jalankan sel **"10b. (Opsional) Arsipkan korpus BERSIH ke Release"**.
Centang kotak parameter `ARSIPKAN_KORPUS_BERSIH` jadi ✅ sebelum klik ▶.

Kalau berhasil, muncul dua baris seperti:
```
Upload selesai: https://github.com/maetalizer-png/Rategoan/releases/download/korpus-jilid-1-clean/idwiki-clean.jsonl
Upload selesai: https://github.com/maetalizer-png/Rategoan/releases/download/korpus-jilid-2-clean/korpus-jilid2-clean.jsonl
```

Simpan kedua URL itu.

Setelah dua Release ini terkonfirmasi ada (buka URL-nya di browser, pastikan
halaman Release muncul dan bisa diunduh), **raw asset lama boleh dihapus**
dari Release tag `Corpus` (`newspapers-json.tgz` + 3 file `.parquet`) lewat
halaman Releases repo di GitHub — klik Release `Corpus` → Edit → hapus
asset satu-satu → Update release. Ini opsional, tujuannya menghemat ruang
penyimpanan repo karena data mentahnya sudah tidak diperlukan lagi (versi
bersihnya sudah aman di `korpus-jilid-2-clean`).

---

## Selesai — cara cek semuanya benar

Buka tiga URL ini di browser (harus semuanya menampilkan halaman Release
dengan file yang bisa diunduh):
- `https://github.com/maetalizer-png/Rategoan/releases/tag/checkpoint-200m`
- `https://github.com/maetalizer-png/Rategoan/releases/tag/korpus-jilid-1-clean`
- `https://github.com/maetalizer-png/Rategoan/releases/tag/korpus-jilid-2-clean`

Kalau ketiganya muncul dengan asset di dalamnya — lima langkah selesai.
