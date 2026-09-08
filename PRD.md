# PRD — Ronde mutu jawaban Raget (sementara)

File ini **hanya untuk Claude**. Bukan dokumen pembeli.
Setelah ronde tuntas: **hapus `PRD.md` dari root `main`**, commit, push.
Jangan sisakan rujukan baru ke file ini di kode atau README.

---

## 0. Cara kerja

Satu perintah, satu tujuan, satu laporan.
Kerjakan di balik layar, senyap. Jangan tanya. Jangan potong tengah jalan.
Hemat token. Jawaban keluar setelah semua butir selesai.
Hasil kerja wajib di `main`. Jangan buka PRD v2 (vektor, P2P, WASM, schema pack baru).

---

## 1. Tujuan ronde ini

Pembeli yang sudah bisa **langsung chat tanpa login** tetap sering dapat
kalimat “Tambah satu kalimat konteks…”. Itu terasa bodoh.

Tujuan tunggal:

1. Perpendek fallback kalau benar-benar tidak tahu.
2. Isi lubang jawaban dari log miss + uji live bahasa Indonesia sehari-hari
   (pola/data, **bukan** longgarkan fuzzy).
3. Hapus file PRD ini dari root.

Bukan ronde fitur. Bukan ronde training. Bukan ronde toko.

---

## 2. State yang sudah selesai — jangan diulang

| Item | Commit / fakta |
|---|---|
| BM25 + fuzzy 0,82 + logger unmatched | `63694b3` |
| Chat tanpa wajib login, Masuk opsional | `8829356` |
| QC sisa rujukan PRD lama | `9bb32d0` |
| Landing teks + video chat langsung | branch `landing-page` `076c1d7` |
| Neural | `NEURAL_ANSWERS_ENABLED = false` — biarkan |
| Fuzzy | ambang **0,82** — jangan dikendurkan |
| Tombol Model | tetap ada |
| Empty-state | hanya merek “Rategoan”, tanpa chip/teks petunjuk |

---

## 3. Pekerjaan wajib

### A. Fallback jujur

Di `raget/raget-llm/llm-engine.js` fungsi `replyGeneric` (dan teks sejenis
di cabang klarifikasi yang sama artinya):

- Ganti kalimat panjang “Saya dengar: … Tambah satu kalimat konteks…”
- Teks baru, pendek, bahasa Indonesia, tanpa berpura-pura paham.
- Contoh yang diizinkan: `Belum punya jawaban untuk itu.`
- `isRealAnswer()` harus tetap menganggap teks ini **bukan** jawaban nyata
  supaya logger unmatched tetap jalan.

Verifikasi live: ketik gibberish (`asdfghqwerty`) → teks baru, bukan
minta konteks. `2+2` dan `apa ibu kota indonesia` tidak berubah.

### B. Isi lubang dari miss

Sumber, urut:

1. `raget-tools/export-unmatched-queries.mjs` — kalau ada profil/log.
2. Transkrip / pola yang sudah diketahui gagal: sapaan + “ya”, meta-bot
   yang belum kena, layanan harian, sekolah, kerja, transport, rumah.
3. Uji Playwright sendiri: 20–40 kueri bahasa Indonesia sehari-hari
   (formal + informal). Catat yang jatuh ke fallback.

Tindakan untuk tiap miss yang sah:

- Konteks **sudah ada** foldernya di `raget-data/json/sapaan/` atau domain
  JSON → **tambah entri di file yang ada**. Jangan bikin folder baru.
- Konteks **benar-benar baru** dan tidak punya folder → baru boleh file
  baru di folder sapaan yang temanya sama, daftarkan ke
  `SAPAAN_EXTRA_FILES` / trigger yang sudah ada.
- Jangan menambah trigger fuzzy yang menelan pertanyaan faktual.
- Jangan longgarkan 0,82.
- Jangan masukkan sampah TED / kalimat lepas / bahasa campur acak.

Prioritas isi: Indonesia, percakapan harian, layanan, sekolah, kerja,
bukan ensiklopedia dunia.

### C. Regresi wajib (live, bukan klaim)

Harus tetap benar setelah A+B:

- `apa ibu kota indonesia`
- `2+2`
- `biologi fotosintesis` (atau setara STEM yang sudah lolos)
- `mksih` → terima kasih
- `kmpuan kamu apa` → bucket kemampuan
- `mksih ya` → **boleh tidak kena fuzzy**; jangan turunkan ambang
- Gibberish → fallback baru, tidak dibajak ke smalltalk

Lint: `node raget/raget-tools/lint-check.mjs` → 0 error.

### D. Tutup ronde

1. Commit kerja A–C di `main`, pesan jelas.
2. **Hapus `PRD.md` di root.** Commit terpisah: `Hapus PRD.md ronde mutu — sudah dikerjakan`.
3. Pastikan README / kode tidak menunjuk file itu lagi.
4. Satu laporan, format §5. Berhenti.

---

## 4. Dilarang

- IndexedDB rewrite, enkripsi vault, P2P, embedding, WASM/ONNX
- Nyalakan neural
- Longgarkan fuzzy
- Ubah router login (sudah opsional)
- Empty-state chip / slogan
- Branch `landing-page`, Colab, Release korpus, Gumroad, Lynk
- Folder OS, landing di dalam `main`, jasa pasang
- PRD v2.0 / pecah schema knowledge-pack
- Tanya di tengah jalan

---

## 5. Laporan (wajib, hanya ini)

```
LAPORAN — Ronde mutu jawaban Raget
1. Step: fallback diganti / tidak; berapa entri pola/data baru; file mana.
2. Query live: tabel singkat (kueri → lolos/gagal).
3. Lint: error/warning.
4. Commit: hash kerja + hash hapus PRD.md.
5. Tidak dikerjakan: (daftar).
6. Gagal: ada/tidak.
```

Berhenti. Tunggu perintah berikutnya.
