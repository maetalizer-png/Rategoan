# PRD — Rategoan (satu-satunya dokumen kerja)

Status: **BERLAKU.** Ditulis 2026-09-02, menggantikan dan menghapus
`PRD-DATA-RELEASE.md`, `PRD-PRODUKSI-READY.md`,
`PRD-PENGEMBANGAN-RATEGOAN.md`, `PRD-PERINTAH-GROK.md` — semua isi yang
masih berlaku dilebur ke sini. **Satu dokumen, satu sumber kebenaran.**
Kalau ada catatan lama di `docs/` yang bertentangan dengan ini, dokumen
ini yang menang.

---

## 0. Aturan tak dinegosiasi ulang

1. Produk default = **rule-based** (Raget). Neural 50/100/200M = mode
   uji eksplisit (opt-in di pemilih model), bukan default, bukan toko
   utama.
2. Rak korpus tetap **3**: K1 ensiklopedia ID, K2 dialog+daerah, K3
   pelengkap. Jangan bikin K4–K8 atau seri A1–A17.
3. Mix training: K1 55–65% / K2 25–35% (upsample boleh) / K3 5–15%.
4. Satu sesi training = 60 menit, satu model per sesi (sekuensial —
   jalan bareng 2+ model terbukti OOM/throughput kolaps, lihat §5).
5. 1 perintah = 1 tujuan = 1 laporan tuntas di `raget/raget-devlog/`.
   Kerja di background, senyap, jangan tanya di tengah jalan, jangan
   potong ronde yang sedang berjalan.
6. Data korpus baru **bukan dari** MADLAD/OSCAR/mC4/Common Crawl/koran
   HF/KBBI scrape. Pintu data berikutnya: dump Wikimedia resmi
   (idwikibooks/idwikiquote/idwiktionary/wiki daerah) + buku domain
   publik Indonesia.
7. Checkpoint 200M yang dipakai browser: `huggingface.co/Maetalizer19/rategoan-neural`.
   GitHub Release `checkpoint-200m` adalah arsip lama, tidak dipakai kode.
8. Claude (sandbox ini) **tidak bisa** menjangkau `huggingface.co` sama
   sekali (diblokir egress proxy, kebijakan organisasi) — publish/verify
   HF selalu lewat Grok.

---

## 1. Kondisi sekarang (fakta terverifikasi, bukan klaim)

| Lapisan | Status |
|---|---|
| Rule-based | Default aktif, bench CORE-SUITE 1176/1180 = 99,66%, Q=82 |
| Neural 200M | File LIVE di HF (dipakai browser) = checkpoint sesi-5, sha256 `69daa21d...`, PPL 932,47 — CORS **terkonfirmasi Grok** (`access-control-allow-origin: *`). Sesi-6 (mix K1+K2+K3 penuh baru, 154 step, sha256 `9a5bf4ad...`) PPL **NAIK ke 1494,15** di held-out set baru (24.746 contoh) — **SENGAJA TIDAK dipublish**, lihat `keputusan-025`. **PERINGATAN**: file lokal `raget/raget-data/neural/raget-neural-massive200m.safetensors` SEKARANG berisi bobot sesi-6 (yang lebih buruk) — training resume otomatis pakai file lokal ini, BUKAN versi HF yang lebih baik. Sandbox Claude tidak bisa unduh ulang dari HF (diblokir). Sebelum Ronde B berikutnya: putuskan lanjut dari sesi-6 (uji apakah PPL pulih dengan step lebih banyak di corpus baru) atau minta Grok ambilkan file HF yang PPL 932,47 untuk ditaruh lokal dulu — jangan asumsikan salah satu tanpa keputusan eksplisit. |
| K1 `korpus-ensiklopedia-bersih` | 759.587 dokumen, gzip ±571 MB, 354.376.464 token BPE |
| K2 `korpus-dialog-daerah-bersih` | 638.371 dokumen, gzip ±131 MB, 151.487.572 token BPE (81% dokumen tanpa tag bahasa — belum direview manual) |
| K3 `korpus-pelengkap-bersih` | 99.557 dokumen, gzip ±54 MB, 37.338.557 token BPE |
| **Total token kanonik** | **543.202.593** — angka valid SATU-SATUNYA, cek ulang di `korpus-manifest-total.json` sebelum kutip kalau ragu sudah berubah lagi |
| MADLAD-400 | RETIRE final (spam gate gagal), tag dihapus dari Release, `panen.yml` dihapus dari repo — tidak akan dipanen ulang |
| CI/CD | Tidak ada sama sekali (`panen.yml` dihapus) |

Bug rule-based yang masih terbuka (root cause sudah ketemu, sengaja
belum ditambal — butuh data akurat bukan tebakan):
- `negara terkecil di eropa` (harap Vatikan — data Vatikan belum ada di
  `raget-data/json/negara/eropan-selatan.json`) dan `negara terbanyak
  penduduk di asia` (harap "Tiongkok" — field `nama` China masih
  `"China"`, belum ada alias). `trySuperlatif()` di `bridge-reasoning.js`
  juga belum menyaring per-benua.
- `what is the capital of atlantis` — belum ada kategori "tolak sopan"
  untuk entitas fiksi.
- `gimana menurutmu kualitas kerjaanku` — deflection generik, belum ada
  entri self-review/metode sandwich.

---

## 2. Taksonomi data & Release (mengikat)

5 kategori tertutup — data baru wajib masuk salah satu, kalau tidak
cocok satupun **berhenti dan tanya dirigen**, jangan bikin kategori baru:

| Kategori | Isi | Peran mix |
|---|---|---|
| `ensiklopedia` | Wikipedia/Wikimedia ID + serumpun | 55–65% |
| `dialog` | Percakapan/tanya-jawab/sapaan buatan | bagian dari 25–35% |
| `daerah` | Bahasa daerah Indonesia sebagai teks | bagian dari 25–35% |
| `pelengkap` | simple-wiki/wikiquote/wikivoyage/edukasi/buku | 5–15% |
| `checkpoint` | Bobot neural — diatur `raget/raget-tools/CHECKPOINT-POLICY.md` |

`dialog`+`daerah` selalu satu file pack (`korpus-dialog-daerah-bersih`)
tapi tetap dua kategori terpisah saat diukur.

**Aturan bahasa wajib** (pelajaran dari korpus tercemar `en-simple`):
setiap dokumen K1/K3 wajib mayoritas `lang: id` (tag eksplisit, atau
fallback rasio kata-tugas ID kalau tag kosong — dihitung dari field
`text` yang sudah diekstrak, BUKAN baris JSON mentah). K2 boleh
campuran (itu tujuannya), tapi tiap sub-dokumen wajib bertag `lang`
supaya bisa difilter terpisah. Setiap `manifest.json` wajib punya field
`komposisiBahasa` — tanpa ini Release dianggap tidak patuh.

**Penamaan**: tag pola `korpus-<kategori>-bersih`, TIDAK ADA `-v1/-v2`
di tag (versi hidup di field `versi` manifest). Data baru kategori yang
sama = timpa asset di tag yang sama, jangan bikin tag baru.

**Ukuran**: ukur gzip final. <20MB dilarang jadi Release sendiri (wajib
gabung ke pack). 20–95MB boleh sendiri. >1,5GB wajib split part
berurutan (`partNN`) dari SATU file sumber, bukan gabungan sumber beda.
**Satu file fisik per kategori** — dilarang keras taruh 2+ file
`.jsonl.gz` sumber-terpisah di bawah satu tag.

## 3. SEGEL SHA256 — wajib, 3 gerbang

1. **Saat publish**: SHA256 dari file gzip FINAL yang diupload (bukan
   raw), tulis ke manifest, upload file yang sama. Cocokkan lagi
   terhadap digest GitHub setelah upload — tidak cocok = asset dihapus,
   publish batal. Pipa resmi: `raget/raget-tools/publish-korpus-release.py`.
2. **Saat reassembly part** (tier XL): `cat part00 part01 ... >
   file.jsonl.gz`, `sha256sum` wajib cocok manifest. Tidak cocok =
   berhenti, jangan lanjut tokenisasi.
3. **Sebelum training**: `echo "<sha256>  file.jsonl.gz" | sha256sum -c -`
   wajib `OK` sebelum file masuk `tokenize-chunk-corpus.py` atau skrip
   training manapun.

## 4. Rumus campuran training

```
ensiklopedia(K1) : 55–65%
dialog+daerah(K2): 25–35%  (upsample kalau perlu)
pelengkap(K3)    : 5–15%

repeat_factor = ceil( (target_share/(1-target_share)) * anchor_bytes / small_bytes )
```
Setelah repeat, gabung lalu **shuffle** sebelum tokenisasi. Verifikasi
rasio hasil akhir dari byte nyata (`proporsiAktual` di manifest), bukan
cuma diasumsikan dari rumus.

## 5. Resep training (arsitektur & batas aman — angka nyata dari log)

| Model | dModel/nLayers/nHeads/dFF | parameterCount | Throughput solo (tok/s) | Batch aman |
|---|---|---|---|---|
| 50M | 512/6/8/2048 | 49.999.872 | 580–890 | 32 |
| 100M | 768/8/12/3072 | 103.325.184 | 410–440 | 32 |
| 200M | 1024/11/16/4096 | 200.709.120 | 210–235 | 32 (TIDAK ADA batch aman kalau paralel — OOM 2x terbukti) |
| 300M/400M | 1152/14/18/4608, 1280/16/20/5120 | ~293M/~392M | ⚠️ belum pernah dijalankan | mulai dari 16 |

**Wajib satu model per sesi, sekuensial** — 2 percobaan paralel nyata
gagal (throughput jatuh ke 2–27 tok/s atau OOM total).

300M/400M **dilarang mulai** sebelum tujuan §7 (5 prompt baku 200M
tidak 0/5 sampah) tercapai.

## 6. Aturan main tiap ronde + template laporan

```
1 perintah = 1 tujuan = 1 laporan selesai.
Kerja di background, senyap, jangan tanya, jangan potong tengah jalan.
Hasil wajib ditulis di raget/raget-devlog/. Checkpoint >100MB: part
<100MB di git ATAU langsung HF via publish-checkpoint-huggingface.py.
Jangan sentuh Release K1/K2/K3 kecuali Grok/dirigen minta.
Gagal SHA / OOM / PPL naik liar = BERHENTI, lapor, jangan "lanjut saja".
```

Template laporan training (tetap, jangan tambah/kurang field):
```
1. Step: awal -> akhir (total N step sesi ini, durasi menit, X tok/s)
2. PPL held-out: awal -> akhir
3. Checkpoint: path + SHA256 + ukuran
4. 5 sampel generasi (5 prompt baku di bawah)
5. Corpus ter-load + rasio K1:K2:K3 (terverifikasi SHA/tidak)
6. Gagal / tidak + state checkpoint aman terakhir
```

5 prompt baku (dipakai konsisten tiap eval neural):
`Apa ibu kota Indonesia?` · `Siapa itu Albert Einstein?` ·
`Ceritakan tentang Rategoan` · `Halo, apa kabar?` · `Apa itu localStorage?`

Syarat buka riset 300M: 3/5 prompt baku kalimat Indonesia utuh (tidak
mengulang token sampah), PPL held-out < 400, SHA checkpoint tercatat.

---

## 7. Antrian ronde (kerjakan satu per satu — ambil SATU perintah)

### Ronde A — Rule-based (Grok sudah mulai: sekolah-izin, layanan-kantor-bank, sapaan-transportasi, kerja-kantor-harian, kesehatan-harian-ringan — lanjutkan, jangan ulang)
```
Ronde A PRD.md §7.
Perluas rule-based (sapaan/sekolah/layanan/kerja/formal-informal) tanpa
pecah bench. 1 tujuan, senyap, laporan devlog setelah tuntas. Jangan
sentuh korpus Release. Jangan mulai training neural.
```
Fokus: audit `llm-engine.js`+`dataries-registry.js` untuk intent yang
jatuh ke `replyGeneric`; tambah JSON di folder yang SUDAH ada kalau
konteks sama; trigger spesifik didahulukan (jangan "sekolah" menelan
"izin"); lint+bench core wajib ≥99%. Selesai kalau: bench tidak pecah +
devlog + commit.

### Ronde B — Neural 200M lanjut (jangan ganti arsitektur)
```
Ronde B PRD.md §7.
Satu sesi 200M 60 menit dari checkpoint HF terbaru, mix K1+K2+K3
verifikasi SHA dulu (§3). Laporan 6 poin (§6) + 5 prompt baku. Publish
checkpoint via publish-checkpoint-huggingface.py kalau sesi selesai.
Jangan numpuk folder checkpoint-200m/ di root. Jangan tanya, jangan potong.
```
Ulangi sebagai B2, B3, ... selama PPL turun atau generasi membaik.
Berhenti kalau PPL naik 2 sesi berturut atau OOM.

### Ronde C — Ukur token (bukan buru HF)
```
Ronde C PRD.md §7.
Hitung BPE (tokenizer proyek vocab ~30.368) dari gzip K1+K2+K3 di
Release SEKARANG. Tulis ke korpus-manifest-total.json dan
docs/STATUS-KORPUS-LISENSI.md. Jangan unduh MADLAD/OSCAR/mC4. Jangan training.
```

### Ronde D — Satu dump Wikimedia baru
```
Ronde D PRD.md §7.
Satu dump (idwikibooks ATAU idwikiquote ATAU idwiktionary — satu per
perintah), bersih, JSONL {text,source,license,url,lang:id}, dedupe vs
K3 (fingerprint 250 char). Laporan jumlah dokumen/kata/SHA calon.
Jangan sentuh K1. Serahkan ke Grok untuk merge+segel Release (Claude
tidak publish Release sendiri kecuali token akses ada).
```

### Ronde E — Buku domain publik Indonesia (K3)
Sumber wajib: Wikimedia Commons PD-Indonesia, Gutenberg PD jelas,
katalog domain publik Indonesia. Bukan scan kotor tanpa OCR, bukan
novel modern. Format sama seperti D.

### Ronde F — Kualitas neural (setelah B berulang + C)
Eval 5 prompt baku + 20 prompt held-out tertulis di
`raget/raget-devlog/neural/`. Kalau 0/5 koheren setelah ≥3 sesi B:
jangan naik parameter — perbaiki data mix atau decoding, satu
perubahan per ronde.

### Ronde G — PWA/produksi (jangan campur training)
Pastikan pemilih model 200M fetch URL HF §0.7 dan `sw.js` mengizinkan
origin `huggingface.co`. Bench Playwright utuh setelah ubah UI apa pun.

### Ronde HF — Cari + panen data tambahan Hugging Face (Grok, akses jaringan)
Kandidat untuk DICEK (bukan daftar terjamin masih hidup): config
`wikimedia/wikipedia` bahasa daerah yang belum ada di K2, `SEACrowd`
(cek lisensi per-dataset), `indonesian-nlp/*` (cek satu-satu). WAJIB
lewat `deteksi_spam()` + cek lisensi + taruh di staging dulu (bukan
langsung K1/K2/K3) sebelum Claude verifikasi SHA+token.

---

## 8. Dilarang keras

- MADLAD-400, OSCAR, mC4, KoPI-CC, FineWeb crawl, koran HF, KBBI scrape.
- Tag Release `panen-*` baru, workflow `panen.yml` baru.
- K4–K8 atau nama rak baru; split file jadi part <100MB kalau tujuannya
  Release (itu aturan git, bukan Release — lihat §2).
- Mengembalikan Simple Wiki/mswiki/jilid-2/OSCAR ke rak kanonik.
- Mengubah `DIMS` arsitektur 50/100/200M yang sudah terverifikasi.
- Mengklaim bench 100%/token 1 miliar/neural koheren tanpa bukti ronde
  berjalan.
- Desain 300M/400M sebelum syarat §6 tercapai. Notebook Colab/Kaggle baru.

## 9. Pembagian peran

| Pihak | Kerja | Jangan |
|---|---|---|
| Claude | Training 60 menit, kode rule/neural, dump parse, devlog, bench, hitung token | Ganti taksonomi rak; publish Release sendiri (kecuali token akses ada); buru HF (tidak ada akses jaringan) |
| Grok | Segel Release, SHA, publish HF, hapus sampah tag, cari+panen data HF | Potong training Claude; klaim token tanpa BPE nyata |
| Dirigen | Satu perintah per ronde | "Kerjakan semua sekaligus" |
