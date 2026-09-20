<!-- KEPUTUSAN DIRIGEN 2026-09-20: gerbang §5 TERJAWAB. Lihat PRD-CODING-KEPUTUSAN.md. K4 korpus-kode-bersih DISETUJUI. Build boleh buat tag. -->

# PRD — Raget: Kemampuan Coding (Jalur Neural)

Dokumen ini dan dua turunannya (`PRD-CODING-ARSITEKTUR.md`,
`PRD-CODING-DATA.md`) disusun untuk **Grok** (agen luar sandbox
dengan akses tulis GitHub Release, peran yang sama seperti Manus —
lihat `PRD-MANUS-DATA-MENTAH.md`) sebagai rencana kerja penuh
supaya mesin neural Raget (`raget-neural/`) punya kemampuan
menghasilkan & menjelaskan kode JavaScript yang valid secara
sintaks.

Ini BUKAN pengganti `PRD-RELEASE.md`/`PRD-MANUS-DATA-MENTAH.md` —
seluruh aturan teknis di sana (taksonomi, penamaan tag, SHA256,
skema manifest, prosedur dedupe) tetap berlaku penuh. Dokumen ini
MENAMBAH cakupan baru (kode) ke sistem yang sudah ada.

## 0. Untuk Grok — baca urutan ini

1. Dokumen ini dulu — ringkasan, status baseline, gerbang keputusan
2. `PRD-CODING-ARSITEKTUR.md` — perubahan mesin/struktur kode di repo
3. `PRD-CODING-DATA.md` — data/korpus kode yang harus dikumpulkan
4. **Jangan mulai kerja apa pun dari dokumen turunan sebelum Gerbang
   Keputusan di §5 dokumen ini dijawab dirigen** — sama seperti
   `PRD-RELEASE.md` §0 melarang publish tag sebelum gerbang checklist
   terpenuhi, prinsip yang sama berlaku di sini untuk kategori baru.

## 1. Tujuan

Model neural Raget mampu:
- Menghasilkan kode JavaScript yang valid secara sintaks untuk
  permintaan umum ("buatkan fungsi cek palindrome", "perbaiki bug
  di kode ini")
- Menjelaskan cara kerja kode yang diberikan user

Ini kemampuan TAMBAHAN di luar rule-engine yang sudah ada —
`stem-engine.js` dkk di `raget-agents/` tetap jalan terpisah untuk
matematika/logika deterministik, tidak diganti atau disentuh.

## 2. Status Baseline (per audit 2026-09-20, bukan asumsi)

| Aspek | Kondisi sekarang |
|---|---|
| Tokenizer | BPE vocab 30.368, dilatih murni dari korpus Indonesia (K1+K2+K3 = 16.794.935.092 token). **Nol token kode di dalamnya.** |
| Model | ~100M parameter (`checkpoint-100m.safetensors`), belum koheren gramatikal untuk Bahasa Indonesia sendiri (didokumentasikan jujur di `ARSITEKTUR.md`/`NEURAL_NOTE`) |
| Data kode | **Nol** — tidak ada satu pun sumber kode di K1/K2/K3 atau di taksonomi `PRD-RELEASE.md` §1 |
| Status freeze | Model neural berstatus "freeze DITUTUP" per catatan pengembangan sebelumnya |

**Kesimpulan baseline: ini dibangun dari nol total, bukan penyesuaian kecil ke sistem yang sudah ada.**

## 3. Prasyarat Urutan — JANGAN dibalik

Preseden nyata: model **SmallCoder (303M parameter, skala mirip
target Raget)** melatih kurikulum 4 tahap — bahasa umum dulu sampai
stabil (tahap 1, 6,3 miliar token), BARU tahap kode terpisah
(tahap 2, 7,5 miliar token). Roadmap Raget sendiri di
`ARSITEKTUR.md` juga sudah menetapkan koherensi gramatikal sebagai
gerbang sebelum kemampuan lanjutan apa pun.

→ **Rekomendasi: tunda training kode sampai model koheren berbahasa
Indonesia lebih dulu.** Kalau dirigen tetap mau jalan paralel
(kumpulkan data kode sambil training bahasa jalan), itu boleh —
tapi keputusan itu harus eksplisit, lihat §5 poin 4.

## 4. Ringkasan Kebutuhan

- **Mesin/struktur** — lihat `PRD-CODING-ARSITEKTUR.md`: perubahan
  di `llm-tokenizer.js`, `llm-trainer.js`, `llm-sampler.js`,
  `llm-checkpoint.js`, `engine-router.js`, plus 3 file baru
  (`syntax-validator.js`, `js-sandbox.js`, pipeline ingest kode).
- **Data** — lihat `PRD-CODING-DATA.md`: minimum kalibrasi ~7,5
  miliar token kode (preseden SmallCoder tahap 2), sumber
  berlisensi permisif, prosedur sama seperti `PRD-MANUS-DATA-MENTAH.md` §2.

## 5. Gerbang Keputusan — WAJIB dijawab dirigen sebelum Grok eksekusi APA PUN dari dokumen turunan

Ini bukan basa-basi — setiap poin di bawah kalau dilewati akan
menghasilkan kerja yang harus diulang (persis semangat gerbang
checklist `PRD-RELEASE.md` §0).

1. **Kategori rak baru.** Taksonomi `PRD-RELEASE.md` §1 saat ini
   cuma kenal 3 rak permanen (K1/K2/K3) dari 5 kategori resmi.
   Kode BUKAN salah satu dari itu. Apakah dirigen menyetujui rak
   ke-4 permanen (`korpus-kode-bersih` / "K4")? **Tanpa jawaban
   ini, Grok TIDAK BOLEH membuat tag Release kategori kode apa
   pun** — sama seperti preseden data hukum yang hampir jadi "K4"
   sendiri tanpa izin dan ditahan.
2. **Cakupan bahasa kode.** JavaScript-only (karena cuma JS yang
   bisa dieksekusi/diverifikasi di sandbox browser Raget), atau
   ikut kumpulkan bahasa lain (Python, dll) meski outputnya tidak
   bisa diverifikasi otomatis di dalam app?
3. **Strategi checkpoint.** Satu model gabungan (risiko kemampuan
   bahasa umum menurun/*catastrophic forgetting*), atau checkpoint
   terpisah khusus kode yang dimuat sesuai permintaan (menambah
   ukuran unduhan PWA)?
4. **Urutan kerja.** Tunda training kode sampai koherensi Bahasa
   Indonesia tercapai (rekomendasi §3), atau kumpulkan data kode
   sekarang secara paralel sambil training bahasa tetap jalan?
5. **Retrain tokenizer.** BPE vocab baru dengan kode di dalamnya
   berarti checkpoint yang ada sekarang tidak kompatibel lagi —
   status "freeze DITUTUP" harus dibuka. Disetujui?

## 6. Sumber/Rujukan yang Dipakai Menyusun Dokumen Ini

- **SmallCoder (303M parameter)** — kurikulum training 4 tahap,
  29,8 miliar token total, tahap kode 7,5 miliar token, performa
  HumanEval 27,4% (menyaingi model 1–7 miliar parameter).
  https://huggingface.co/Beebey/smallcoder-303m
- **StarCoder/BigCode (The Stack)** — proses filter lisensi untuk
  korpus kode skala besar berlisensi permisif.
  https://arxiv.org/pdf/2308.09895
- **Eloquent JavaScript** — lisensi Creative Commons
  Attribution-NonCommercial, kode di dalamnya juga bisa dianggap
  berlisensi MIT. https://eloquentjavascript.net/
