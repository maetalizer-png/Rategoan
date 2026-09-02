# PRD — Pengembangan RATEGOAN (antrian kerja Claude)

Status: **BERLAKU, ditulis 2026-09-02.**  
Ini peta kerja **keseluruhan** + antrian ronde untuk Claude.  
Bukan pengganti `PRD-DATA-RELEASE.md` (menang soal rak/SHA) dan
bukan pengganti `PRD-PRODUKSI-READY.md` (menang soal definisi produksi).

Kalau dokumen ini bertentangan dengan dua PRD itu: **dua PRD itu yang
menang**. Dokumen ini hanya mengatur **urutan kerja** supaya proyek
tidak muter (buru data HF → ganti struktur → training putus).

---

## 0. Keputusan yang tidak dinegosiasi ulang

1. Produk default = **rule-based**. Neural 50/100/200M = mode uji, bukan
   toko utama.
2. Rak korpus tetap **3**: K1 ensiklopedia ID, K2 dialog+daerah, K3
   pelengkap. Jangan bikin K4–K8 atau seri A1–A17.
3. Mix training: K1 55–65% / K2 25–35% (upsample boleh) / K3 5–15%.
4. Satu sesi training = **60 menit**, model lain tidak dipotong.
5. 1 perintah Claude = 1 tujuan = 1 laporan tuntas di
   `raget/raget-devlog/`. Kerja senyap, jangan tanya di tengah jalan,
   jangan potong ronde yang sedang masak.
6. Data baru **bukan dari** MADLAD / OSCAR / mC4 / Common Crawl / koran
   HF. Pintu data berikutnya: dump Wikimedia resmi + buku domain publik.
7. Checkpoint 200M yang dipakai browser ada di
   `huggingface.co/Maetalizer19/rategoan-neural`
   (`raget-neural-massive200m.safetensors`). GitHub Release
   `checkpoint-200m` adalah arsip lama.

---

## 1. Kondisi sekarang (titik berangkat, 2026-09-02)

| Lapisan | Status jujur |
|---|---|
| Rule-based | Jalan, bench ~1180, Q~82. Masih sempit di obrolan sektor (sekolah/layanan/kerja). |
| Neural 50/100M | Ada di git `raget/raget-data/neural/`. PPL pernah turun. Generasi belum koheren. |
| Neural 200M | Sesi 4: PPL 1068→932, SHA `69daa21d…`, file di HF, CORS `*`. Generasi belum koheren. |
| K1 | ~759.587 dokumen, gzip ~571 MB, Wikipedia ID + unik. |
| K2 | 638.371 dokumen, gzip ~131 MB (dialog + wiki daerah + PersonaChat ID). |
| K3 | 99.557 dokumen, gzip ~54 MB (pelengkap + Wikisource ID). |
| Token BPE resmi | Angka terakhir yang dicatat Claude ~471 juta **sebelum** batch K2/K3 2 Sep. Wajib dihitung ulang di Ronde C1, jangan dikarang. |
| Target token | 2–4 miliar untuk 200–400M kelak. **Belum tercapai.** Jangan klaim sudah kenyang. |

---

## 2. Tujuan 90 hari (bukan slogan)

1. Rule-based terasa lebih “hidup” di chat sehari-hari (sekolah, layanan
   publik, kerja, kesehatan ringan, formal/informal) tanpa mengarang.
2. Neural 200M: 5 prompt baku tidak kosong / tidak spam token.
   Prompt baku:
   - Apa ibu kota Indonesia?
   - Siapa itu Albert Einstein?
   - Ceritakan tentang Rategoan
   - Halo, apa kabar?
   - Apa itu localStorage?
3. Token BPE dihitung ulang dari gzip K1+K2+K3 yang **hidup di Release**.
4. Satu jalur data baru yang tidak muter: dump `idwikibooks` /
   `idwikiquote` / `idwiktionary` + buku PD, masuk K3 (atau K2 jika
   dialog/daerah).
5. 300M/400M **dilarang mulai** sebelum tujuan 2 tercapai.

---

## 3. Aturan main Claude (wajib di setiap ronde)

```
1 perintah = 1 tujuan = 1 laporan selesai.
Kerja di background, senyap, jangan tanya, jangan potong tengah jalan.
Hemat token. Jawaban ke dirigen hanya setelah pekerjaan tuntas.
Hasil wajib ditulis di raget/raget-devlog/ (training-report atau
catatan ronde). Checkpoint >100MB: part <100MB di git ATAU langsung
HF sesuai skrip publish-checkpoint-huggingface.py.
Jangan sentuh Release K1/K2/K3 kecuali Grok/dirigen minta — Claude
masak dari file yang sudah tersegel.
Gagal SHA / OOM / PPL naik liar = BERHENTI, lapor, jangan “lanjut saja”.
```

Template laporan training (tetap):

```
LAPORAN — <model> <sesi>
1. Step: ...
2. PPL held-out: ...
3. Checkpoint: path + SHA256 + ukuran
4. 5 sampel generasi (5 prompt baku)
5. Corpus ter-load + rasio K1:K2:K3
6. Gagal / tidak
```

---

## 4. Antrian ronde (kerjakan BERURUTAN)

Setiap ronde = satu perintah terpisah. Jangan gabung A+B+C dalam satu
jalan kecuali dirigen menulis “kerjakan ronde X saja”.

### Ronde A — Rule-based (produk, prioritas terasa user)

**Tujuan:** perluas mesin template tanpa merusak bench.

A1. Audit `llm-engine.js` + `dataries-registry.js`: daftar intent yang
    masih jatuh ke `replyGeneric`.
A2. Tambah JSON sapaan/obrolan di folder yang **sudah ada** kalau
    konteks sama; folder baru hanya kalau konteks baru (aturan dirigen).
    Target sektor: sekolah, layanan publik, kerja/kantor, kesehatan
    ringan, transport, pasar/warung, formal vs informal vs jenaka.
A3. Trigger spesifik didahulukan (jangan “sekolah” menelan “izin”).
A4. Jalan `npm run lint` + bench core. Target: tidak turun di bawah
    99% lolos. Kalau turun, revert potongan yang merusak, lapor angka.
A5. Tulis devlog: berapa file JSON baru, berapa intent baru, skor bench.

Selesai A kalau: bench tidak pecah + ada devlog + commit di `main`.

### Ronde B — Neural 200M lanjut masak (jangan ganti arsitektur)

**Tujuan:** 1 sesi 60 menit dari K1+K2+K3 tersegel.

B1. Baca eval/devlog 200M terbaru dulu. Lanjut dari checkpoint HF
    `69daa21d…` atau file lokal setara, **jangan** mulai dari nol.
B2. Load K1+K2+K3 sesuai PRD mix. Verifikasi SHA gzip vs manifest
    sebelum step pertama. Gagal = berhenti.
B3. 60 menit, catat tok/s, PPL, 5 prompt baku.
B4. Publish checkpoint: skrip HF jika >100MB. Jangan numpuk folder
    `checkpoint-200m/` di root setelah publish sukses.
B5. Devlog + commit laporan. Generasi masih jelek boleh — yang wajib
    jujur.

Selesai B kalau: ada checkpoint baru + laporan 6 poin.

Ulangi B2–B5 sebagai B6, B7, … selama PPL turun atau generasi 5 prompt
membaik. Berhenti seri B kalau PPL naik 2 sesi berturut atau OOM.

### Ronde C — Ukur token + pagar data (bukan buru HF)

**Tujuan:** angka token yang bisa dikutip dirigen.

C1. Hitung BPE (tokenizer proyek vocab ~30.368) dari gzip K1+K2+K3
    **yang ada di Release sekarang**. Tulis ke
    `raget/raget-data/jsonl/external/korpus-manifest-total.json`
    dan `docs/STATUS-KORPUS-LISENSI.md`.
C2. Jangan masukkan PersonaChat ke klaim “ensiklopedia”. Tetap K2.
C3. Daftar pintu data **berikutnya** yang legal (lihat §5). Jangan
    unduh MADLAD “sekalian”.

Selesai C kalau: satu angka token + breakdown rak, commit.

### Ronde D — Satu dump Wikimedia selain Wikipedia

**Tujuan:** tambah K3 tanpa muter HF Wikipedia.

D1. Ambil **satu** dump:
    `https://dumps.wikimedia.org/idwikibooks/latest/idwikibooks-latest-pages-articles.xml.bz2`
    (kalau latest berubah, pakai yang “Dump complete”).
D2. Parse artikel ns0, buang stub <100 kata, boilerplate, unduh
    ganda vs K3 (fingerprint 250 char).
D3. Format JSONL `{text,source,license,url,lang:id}` license
    `cc-by-sa-3.0`.
D4. Serahkan ke Grok/dirigen untuk merge+segel Release K3 — Claude
    **jangan** unggah Release sendiri kalau token tidak punya izin
    asset. Kalau izin ada dan PRD §8 diikuti (SHA dari gzip final +
    cocok digest GitHub), boleh merge sendiri lalu lapor tabel SHA.
D5. Devlog: jumlah dokumen lolos, kata, SHA calon file.

Setelah D1 sukses, ronde terpisah: D6 `idwikiquote`, D7 `idwiktionary`.
Satu dump per perintah.

### Ronde E — Buku domain publik Indonesia (K3)

**Tujuan:** naskah utuh, bukan crawl.

E1. Sumber wajib: Wikimedia Commons PD-Indonesia, Gutenberg yang
    jelas PD, katalog CCID/Figshare domain publik Indonesia.
E2. Bukan hasil scan kotor tanpa OCR rapi. Bukan novel modern.
E3. JSONL sama seperti D. Merge K3 lewat gerbang yang sama.

### Ronde F — Kualitas neural (baru setelah B berulang + C)

**Tujuan:** 200M tidak lagi “spesies spesies”.

F1. Eval tetap 5 prompt baku + 20 prompt held-out tertulis di
    `raget/raget-devlog/neural/`.
F2. Kalau 0/5 koheren setelah ≥3 sesi B pasca-PRD ini: jangan naik
    parameter. Perbaiki data mix (K2 upsample dialog ID murni) atau
    decoding (suhu/penalties) — satu perubahan per ronde.
F3. Syarat buka riset 300M: 3/5 prompt baku kalimat Indonesia utuh
    dan tidak mengulang token sampah, PPL held-out < 400, SHA
    checkpoint tercatat.

### Ronde G — PWA / produksi (jangan campur training)

G1. Pastikan pemilih model 200M fetch URL HF
    `Maetalizer19/rategoan-neural/...` dan `sw.js` mengizinkan
    `huggingface.co` + `cdn.hf.co`.
G2. Pitutur: 404 yang sudah pernah pecah jangan balik.
G3. Bench Playwright utuh setelah ubah UI.

---

## 5. Pintu data yang BOLEH vs DILARANG

Boleh:
- Dump Wikimedia: idwiki (hanya jika unik vs K1, jangan dobel
  penuh), idwikibooks, idwikiquote, idwiktionary, idwikisource
  (sebagian sudah di K3), wiki daerah yang belum ada di K2
- Buku/naskah PD Indonesia
- Dataset berlisensi CC-BY/CC-BY-SA yang **bukan** Common Crawl
  (contoh: NusaX untuk K2, sudah boleh)

Dilarang:
- MADLAD-400, OSCAR, mC4, KoPI-CC, FineWeb crawl, koran HF
- Tag Release `panen-*`
- KBBI scrape
- Mengubah nama rak atau pecah file 1 MB

---

## 6. Pembagian peran (supaya tidak dobel)

| Pihak | Kerja | Jangan |
|---|---|---|
| Claude | Training 60 menit, kode rule/neural, dump parse, devlog, bench | Ganti taksonomi rak; buru HF berputar; tanya di tengah sesi |
| Grok | Segel Release, SHA, hapus sampah tag, README, PRD antrian | Potong training Claude; klaim token tanpa BPE |
| Dirigen | Satu perintah per ronde | “Kerjakan semua A–G sekaligus” |

---

## 7. Perintah siap tempel (ambil SATU)

### Perintah A (rule-based)
```
Ronde A PRD-PENGEMBANGAN-RATEGOAN.md.
Perluas rule-based (sapaan/sekolah/layanan/kerja/formal-informal)
tanpa pecah bench. 1 tujuan, senyap, laporan di devlog setelah tuntas.
Jangan sentuh korpus Release. Jangan mulai training neural.
```

### Perintah B (200M 60 menit)
```
Ronde B PRD-PENGEMBANGAN-RATEGOAN.md.
Satu sesi 200M 60 menit dari checkpoint HF 69daa21d (atau setara
lokal), mix K1+K2+K3 sesuai PRD-DATA-RELEASE, verifikasi SHA dulu.
Laporan 6 poin + 5 prompt baku. Publish checkpoint sesuai skrip HF
kalau sesi selesai. Jangan tanya. Jangan potong.
```

### Perintah C (hitung token)
```
Ronde C1 PRD-PENGEMBANGAN-RATEGOAN.md.
Hitung BPE tokenizer proyek dari gzip K1+K2+K3 di Release hidup.
Tulis angka + breakdown ke korpus-manifest-total.json dan
STATUS-KORPUS-LISENSI.md. Jangan unduh MADLAD. Jangan training.
```

### Perintah D (Wikibooks)
```
Ronde D1 PRD-PENGEMBANGAN-RATEGOAN.md.
Satu dump idwikibooks-latest-pages-articles, bersih, JSONL, dedupe
vs K3. Laporan jumlah dokumen/kata/SHA calon. Jangan sentuh K1.
```

---

## 8. Definition of Done keseluruhan (90 hari)

- [ ] Ronde A selesai, bench ≥99% core
- [ ] Minimal 3 sesi B tercatat di devlog
- [ ] C1: satu angka token BPE hidup
- [ ] D1: Wikibooks masuk antrian/Release K3
- [ ] 5 prompt baku 200M tidak 5/5 sampah (target 3/5 waras)
- [ ] Tidak ada tag `panen-*` baru
- [ ] Tidak ada folder `checkpoint-200m/` nyangkut di root setelah publish

---

## 9. Yang sengaja tidak dikerjakan di PRD ini

- Desain 300M/400M
- Colab/Kaggle notebook baru
- Workflow GitHub `panen.yml` (sudah dihapus, jangan dihidupkan)
- Ganti default chat ke neural
