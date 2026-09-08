# PRD — Ronde intent harian vs BM25 (sementara)

File ini **hanya untuk Claude**. Bukan dokumen pembeli.
Setelah tuntas: **hapus `PRD.md` dari root `main`**, commit, push.
Jangan sisakan rujukan baru ke file ini di kode atau README.

---

## 0. Cara kerja

Satu perintah, satu tujuan, satu laporan.
Kerjakan di balik layar, senyap. Jangan tanya. Jangan potong tengah jalan.
Hemat token. Jawaban keluar setelah semua butir selesai.
Hasil di `main` saja.

---

## 1. Tujuan ronde ini

Sisa laporan ronde mutu (`1eb2375`): kueri **layanan / sekolah / kerja /
transport / kesehatan** sering dijawab dulu oleh **retrieval BM25** pakai
fakta ensiklopedis yang kurang relevan. Pembeli nanya urusan sehari-hari,
dapat kartu negara / tokoh / definisi.

Tujuan tunggal: kalau kueri jelas urusan harian, **mesin sapaan/domain
harian menang dulu**. BM25 tetap untuk fakta (“ibu kota”, “siapa tokoh”).

Bukan ronde training. Bukan longgarkan fuzzy. Bukan nyalakan neural.

---

## 2. State yang sudah selesai — jangan diulang

- Fallback pendek “Belum punya jawaban untuk itu.” (`d310e08`)
- `halo ya`, cucian/piring, fuzzy 0,82
- Chat tanpa wajib login
- Landing + video
- `NEURAL_ANSWERS_ENABLED = false`

---

## 3. Pekerjaan wajib

### A. Audit live dulu

Buat daftar 25–40 kueri Indonesia, campur:

**Harian (harus bukan ensiklopedia):**
- cara buat KTP / perpanjang SIM
- PR matematika belum selesai / ulangan besok
- atasan minta lembur / gaji telat
- macet parah / kereta delay
- demam anak / obat warung

**Fakta (harus tetap BM25 / mesin fakta):**
- apa ibu kota indonesia
- ibu kota jepang
- siapa albert einstein
- 2+2
- biologi fotosintesis

Catat rantai mana yang menjawab (sapaan, extras, datariesFallback,
planner, llm). Jangan menebak.

### B. Perbaikan urutan / gerbang

Pilih **satu** cara yang paling kecil risikonya, jangan rewrite agent:

- Intent harian (sekolah, layanan, kerja, transport, kesehatan, rumah)
  dieksekusi **sebelum** `datariesFallback` / planner BM25; atau
- BM25 menolak kandidat ensiklopedia jika kueri sudah match trigger
  harian yang punya jawaban di sapaan/JSON.

Syarat:

- Ambang fuzzy **0,82** tidak berubah.
- Hit fakta yang sudah lolos ronde lalu tidak boleh rusak.
- Jangan hapus BM25. Jangan ganti rumus BM25.
- Folder baru hanya jika konteks benar-benar tidak punya folder.
  Konteks sama → tambah entri di file yang ada.

### C. Data kalau trigger hidup tapi jawaban kosong

Kalau setelah gerbang A/B kueri harian masih fallback karena **tidak ada
teks**: tambah entri di `raget-data/json/sapaan/` (kerja-layanan,
harian-rumah, transportasi-perjalanan, kesehatan-cuaca, sekolah) —
bahasa Indonesia wajar, bukan template kaku, bukan sampah placeholder.

### D. Regresi live wajib

| Kueri | Harus |
|---|---|
| apa ibu kota indonesia | fakta benar |
| ibu kota jepang | fakta benar |
| siapa albert einstein | tokoh, bukan sapaan |
| 2+2 | 4 |
| biologi fotosintesis | STEM |
| mksih | terima kasih |
| asdfghqwerty | fallback pendek |
| minimal 8 kueri harian dari §3.A | bucket harian, bukan ensiklopedia nyasar |

Lint: `node raget/raget-tools/lint-check.mjs` → 0 error.

### E. Tutup

1. Commit kerja di `main`.
2. Hapus `PRD.md`. Commit: `Hapus PRD.md ronde intent harian — sudah dikerjakan`.
3. Laporan §5. Berhenti.

---

## 4. Dilarang

- Neural on, fuzzy longgar, P2P, embedding, pecah schema
- Ubah login/router auth, empty-state, tombol Model
- Branch landing-page, Colab, Release, Gumroad, Lynk
- Rewrite `retrieve.js` / ganti BM25 ke algoritma lain
- Tanya di tengah jalan

---

## 5. Laporan

```
LAPORAN — Intent harian vs BM25
1. Step: gerbang apa yang diubah; file; berapa entri data baru.
2. Query live: tabel harian + fakta (lolos/gagal + mesin yang menjawab).
3. Lint.
4. Commit kerja + commit hapus PRD.md.
5. Tidak dikerjakan.
6. Gagal: ada/tidak.
```
