<!-- KEPUTUSAN DIRIGEN 2026-09-20: gerbang §5 TERJAWAB. Lihat PRD-CODING-KEPUTUSAN.md. K4 korpus-kode-bersih DISETUJUI. Build boleh buat tag. -->

# PRD — Data Korpus Kode untuk Raget

Baca `PRD-CODING-RAGET.md` dulu — dokumen ini tidak berlaku sebelum
Gerbang Keputusan di sana dijawab dirigen, terutama poin 1
(kategori rak baru) dan poin 2 (cakupan bahasa).

## 0. Status Baseline

K1/K2/K3 saat ini (16.794.935.092 token, per
`korpus-manifest-total.json` 2026-09-20) = **0% kode**. Kategori
kode belum ada di taksonomi `PRD-RELEASE.md` §1 (5 kategori resmi:
ensiklopedia/dialog/daerah/pelengkap + satu lagi — kode bukan salah
satunya).

**JANGAN buat tag Release kategori kode apa pun sebelum Gerbang
Keputusan §5 poin 1 di `PRD-CODING-RAGET.md` dijawab dirigen** —
persis preseden data hukum/regulasi yang hampir jadi "K4" sendiri
tanpa izin dan akhirnya ditahan sampai jelas kategorinya.

## 1. Sumber Data yang Direkomendasikan

| Sumber | Isi | Lisensi | Catatan |
|---|---|---|---|
| **The Stack / StarCoderData** | Kode nyata lintas bahasa, sudah difilter lisensi permisif oleh BigCode | Permisif (MIT/Apache/BSD per file, sudah lolos proses cek BigCode) | Sumber utama volume besar |
| **Eloquent JavaScript** (Marijn Haverbeke) | Buku teks JS lengkap — bahasa, DOM, async, proyek nyata | CC BY-NC, kode di dalamnya bisa dianggap MIT | Non-komersial — aman untuk pemakaian non-komersial dengan kredit penulis; cek ulang kalau Rategoan ke depan dimonetisasi |
| **You Don't Know JS (Yet)** | Referensi mendalam scope, closure, prototype, async | File `LICENSE.txt` sendiri di repo ("license: other", bukan MIT standar) | **WAJIB baca isi LICENSE.txt langsung sebelum dipakai** — jangan asumsikan setara MIT |
| **MDN Web Docs** | Referensi sintaks/API resmi JS & DOM | CC BY-SA | Perlu atribusi |
| **Rosetta Code** | Solusi algoritma sama, ditulis lintas bahasa | GFDL/CC, bervariasi per halaman | Cek per-halaman sebelum ambil massal |
| **CodeSearchNet / Stack Overflow Q&A kode** | Pasangan kode + penjelasan, mirip struktur K2 (dialog) tapi domain kode | Bervariasi per sumber | Filter sama ketatnya seperti audit K2 kemarin (37% dokumen tanpa tag bahasa) |

## 2. Skala Target

Preseden **SmallCoder (303M parameter)** — skala mirip target
Raget — butuh **7,5 miliar token khusus kode** di tahap 2 kurikulum
training untuk mencapai kompetensi dasar yang kompetitif (HumanEval
27,4%, menyaingi model 1–7 miliar parameter). Ini DI LUAR korpus
bahasa yang sudah ada.

**Target awal Raget: kumpulkan minimum setara itu (~7,5 miliar
token kode) sebelum Tahap B training (lihat
`PRD-CODING-ARSITEKTUR.md` §2.2) dimulai.** Ini bukan gerbang 1
miliar seperti K1-K3 — itu standar untuk korpus bahasa umum, beda
kelas kebutuhan dengan kode.

## 3. Prosedur — ikuti `PRD-MANUS-DATA-MENTAH.md` §2 PENUH, tanpa dipersingkat

Prosedur teknisnya SAMA PERSIS dengan yang sudah dipakai K1/K2/K3
(klasifikasi → bersihkan → dedupe → filter → gabung → tokenize →
ukur → SHA256 → manifest → publish → retire staging). Dokumen ini
cuma menambah catatan khusus kode di tiap langkah:

1. **KLASIFIKASI** — kategori kode belum ada di 5 kategori resmi.
   **BERHENTI di sini** kalau Gerbang Keputusan §5 poin 1 belum
   dijawab dirigen. Jangan buat tag sendiri dengan nama apa pun
   termasuk "candidate"/"staging-kode" permanen.
2. **BERSIHKAN** — extract teks kode bersih ke JSONL
   `{"code":...,"source":...,"license":...,"lang":...}` — field
   `lang` di sini berarti bahasa PEMROGRAMAN (js/py/dst), bukan
   bahasa natural seperti di K1-K3. Jangan tertukar skema.
3. **DEDUPE** — fingerprint/minhash, sama seperti K1-K3. Kode
   punya tingkat duplikasi tinggi secara alami (boilerplate,
   fork repo) — dedupe LEBIH penting di sini, bukan kurang.
4. **FILTER BAHASA PEMROGRAMAN** — sesuai keputusan Gerbang §5
   poin 2: kalau JavaScript-only, buang semua bahasa lain di
   langkah ini, bukan belakangan.
5. **GABUNG** — sama seperti K1-K3: satu rak permanen untuk kode
   (nama final tergantung persetujuan Gerbang §5 poin 1), bukan
   tag baru per sumber data.
6. **TOKENIZE BPE** — **PENTING, beda dari aturan lama**: langkah
   ini baru bisa jalan SETELAH tokenizer baru (dengan kode di
   dalamnya) selesai diretrain — lihat `PRD-CODING-ARSITEKTUR.md`
   §2.1. Jangan tokenize pakai vocab 30.368 lama, hasilnya akan
   boros token dan tidak mewakili polanya dengan baik.
7. **UKUR** — sama seperti K1-K3: totalDokumen, totalKataApprox,
   totalByte, totalTokenBPEResmi, komposisi bahasa pemrograman (%).
8. **SHA256** — dari file gzip final, sama seperti K1-K3.
9. **MANIFEST** — skema wajib sama seperti `PRD-RELEASE.md` §6,
   plus field tambahan komposisi-bahasa-pemrograman.
10. **PUBLISH** — tag mengikuti pola penamaan yang sudah ada
    (`korpus-<kategori>-bersih`), nama kategori final sesuai
    Gerbang §5 poin 1.
11. **RETIRE** — staging data mentah dihapus setelah 100% masuk
    file kanonik, sama seperti prosedur K1-K3.

## 4. Batasan Bahasa Kode

JavaScript sebagai prioritas utama — **satu-satunya bahasa yang
bisa dieksekusi/diverifikasi** lewat `js-sandbox.js` di dalam app
(lihat `PRD-CODING-ARSITEKTUR.md` §2.7). Bahasa lain (Python, dll)
bisa dikumpulkan sebagai data tambahan sesuai Gerbang §5 poin 2,
tapi outputnya tidak akan pernah bisa diverifikasi otomatis oleh
Raget sendiri — cuma dihasilkan berdasarkan pola statistik, tanpa
jaring pengaman eksekusi seperti yang dimiliki JavaScript.

## 5. Risiko Lisensi Spesifik Kode

Beda dengan korpus teks (K1-K3), kode punya risiko kontaminasi
lisensi yang lebih diawasi di industri AI — proyek kode-LLM besar
seperti StarCoder/BigCode membangun mekanisme *opt-out* dan
deteksi hampir-duplikat justru karena isu ini. Terapkan disiplin
yang sama seperti audit `garuda-indonesian`/`LaMini-Instruction`
kemarin: kode tanpa lisensi eksplisit **ditahan**, bukan otomatis
masuk rak kanonik.
