# PRD — Pengembangan AI Rategoan

> Dokumen ini adalah rangkuman pengembangan yang diturunkan dari pembacaan repo Rategoan branch `main`, dokumentasi PRD/docs, arsitektur, jalur orkestrasi, Template, Neural, memory, retrieval, data, tools, dan temuan audit engineering. Dokumen ini menjadi peta kerja pengembangan AI Rategoan; bukan pengganti PRD teknis yang sudah ada.

**Status:** baseline pengembangan aktif  
**Branch acuan:** `main`  
**Tujuan:** menjadikan Rategoan sebagai AI lokal yang makin mampu, konsisten, dapat diverifikasi, dan tetap mempunyai arsitektur milik Rategoan sendiri.

---

## 1. Visi pengembangan

Rategoan dikembangkan sebagai AI **local-first** dengan satu jalur orkestrasi dan dua otak milik sendiri:

- **Raget Template** — deterministic/rule-based + retrieval + structured knowledge + tools. Ini adalah baseline kualitas dan jalur aman.
- **Raget Neural** — transformer Rategoan yang dibangun sendiri dan dilatih sendiri. Jalur ini aktif/eksperimental dan menjadi arah peningkatan kemampuan generatif.

Tidak dibuat otak AI ketiga. Semua kemampuan baru harus masuk melalui pipeline, tool, retrieval, Template, atau Neural yang sudah ada.

README menegaskan bahwa aplikasi adalah PWA HTML/CSS/ES6 Modules tanpa framework/build step, dengan memory, database, tools, retrieval, Template, dan Neural di dalam repo. fileciteturn73file0

---

## 2. Kondisi repo saat ini

### 2.1 Fondasi aplikasi

Sudah tersedia:

- UI chat PWA;
- memory pendek/panjang;
- database lokal;
- retrieval BM25;
- intent router;
- planner dan quality layer;
- berbagai tool khusus;
- domain knowledge terstruktur;
- koleksi dan artefak;
- Raget Template;
- Raget Neural;
- benchmark Playwright;
- lint/syntax check;
- pipeline korpus dan checkpoint.

Jalur satu pesan secara konseptual adalah:

```text
User
  ↓
Memory / context
  ↓
Intent + tools / agents
  ↓
Engine Router
  ├── Template
  └── Neural
  ↓
Quality / post-process
  ↓
Response + database
```

`agent.js` saat ini memang menjadi orkestrator besar yang menghubungkan memory, database, retrieval, planner, quality, tools, domain engine, Template, dan Neural. fileciteturn74file0

### 2.2 Engine Router

Router memakai kontrak adapter yang sama untuk dua otak:

```text
id
label
init()
ask(prompt, context)
status()
```

Preference pengguna menentukan urutan Template/Neural. Router memeriksa `status().ready` sebelum `ask()`, lalu melakukan fallback bila adapter gagal. fileciteturn75file0

### 2.3 Neural

Neural sudah aktif dan dapat dipilih pengguna. Namun kualitas generasi belum koheren secara gramatikal. Adapter saat ini menyatakan `ready: true` tanpa memeriksa kesiapan checkpoint; `init()` juga hanya mengembalikan `true`. fileciteturn76file0

Ini menjadi salah satu prioritas engineering utama.

---

## 3. Masalah konkret yang harus diselesaikan

### P0 — Neural readiness tidak sesuai keadaan nyata

Saat ini:

```js
function status() {
  return { ready: true, reason: 'Raget 1.0' };
}
```

Sementara provider baru benar-benar siap setelah checkpoint berhasil dimuat.

**Masalah:** router dapat menganggap Neural siap padahal model belum termuat.

**Target perbaikan:** gunakan state nyata:

```text
idle → loading → ready
              ↘ error
```

`status()` harus mencerminkan keadaan provider, bukan sekadar mengaktifkan Neural secara paksa.

### P0 — loading Neural tidak boleh menjadi kejutan bagi pengguna

Cascade checkpoint dapat membuat request pertama ikut menanggung proses download/load model.

**Target:**
- prefetch dilakukan secara eksplisit/background;
- UI mengetahui `idle/loading/ready/error`;
- chat tidak menggantung tanpa informasi;
- Neural mempunyai timeout/fallback yang terukur;
- Template tetap dapat melayani pengguna saat Neural belum siap.

### P0 — server mode harus mempunyai boundary privasi yang jelas

Server mode menyimpan URL endpoint dan mengirim prompt ke endpoint tersebut.

**Target:**
- validasi URL;
- indikator jelas bahwa prompt akan keluar dari perangkat ketika mode server aktif;
- status endpoint yang aktif terlihat;
- jangan menyamarkan server mode sebagai local-only.

### P1 — fallback harus cepat dan deterministik

Fallback saat ini terjadi setelah `ask()` selesai/gagal. Jika Neural lambat karena loading model, Template ikut menunggu.

**Target:**
- timeout Neural;
- fallback cepat ke Template;
- kegagalan Neural tidak menghilangkan jawaban yang sebenarnya dapat diberikan Template;
- catat alasan fallback untuk debugging/benchmark.

### P1 — persistent data harus dibedakan dari preference kecil

Repo menggunakan IndexedDB untuk history, tetapi sejumlah state masih menggunakan `localStorage`.

**Target:**
- preference kecil: localStorage;
- history/memory/workspace/artifact besar: IndexedDB;
- kegagalan penyimpanan data penting tidak boleh diam-diam dianggap sukses.

### P1 — lifecycle DOM chat perlu dikendalikan

Benchmark telah menunjukkan penumpukan DOM/history dapat membuat pengujian panjang semakin berat.

**Target:**
- virtualisasi/pruning DOM history;
- jumlah node aktif dibatasi;
- benchmark panjang tidak membutuhkan reset sebagai workaround utama.

---

## 4. Arah pengembangan kemampuan AI

### Fase A — stabilisasi otak yang sudah ada

Fokus pertama bukan menambah fitur AI baru, tetapi memastikan kontrak dasar benar.

#### A1. Router

- satu sumber kebenaran status engine;
- urutan prioritas jelas;
- timeout dan fallback;
- telemetry internal untuk mengetahui engine mana yang menjawab;
- tidak ada error mentah ke pengguna.

#### A2. Template

Template menjadi baseline evaluasi.

Target:
- coverage intent meningkat;
- retrieval semakin akurat;
- typo/parafrase lebih baik;
- jawaban tetap deterministik untuk fakta/operasi yang membutuhkan kepastian;
- unmatched log menjadi sumber prioritas perbaikan data/intent.

#### A3. Memory

Target:
- konteks percakapan tetap konsisten;
- memory jangka panjang hanya menyimpan fakta yang memang dimaksudkan;
- recall tidak salah entitas;
- memory tidak mengalahkan fakta terbaru tanpa aturan yang jelas.

#### A4. Retrieval

Target:
- BM25 tetap baseline;
- evaluasi sinonim/parafrase;
- re-ranking yang sudah dibuat benar-benar tersambung ke jalur produksi;
- retrieval evaluation dipisahkan dari generative evaluation.

---

## 5. Fase B — meningkatkan Raget Template menjadi AI lokal yang kuat

Sebelum Neural dianggap berhasil, Template harus terus menjadi sistem yang berguna.

Prioritas:

1. perluas coverage domain berdasarkan unmatched queries;
2. perbaiki kualitas data domain;
3. perbaiki ranking/retrieval;
4. perbaiki multi-turn context;
5. tingkatkan tool routing;
6. tingkatkan quality control;
7. buat benchmark per kemampuan, bukan hanya satu angka total.

### Benchmark Template

Minimal dipisahkan menjadi:

```text
intent accuracy
retrieval hit rate
entity resolution
context continuity
tool routing accuracy
factual exactness
response usefulness
fallback correctness
```

Jangan menyimpulkan peningkatan AI hanya dari jumlah test yang lulus.

---

## 6. Fase C — membuat Neural benar-benar berguna

Neural tidak boleh dinilai hanya dari `PPL` atau berhasil menghasilkan token.

Urutan pengembangan:

```text
checkpoint valid
  ↓
tokenizer konsisten
  ↓
load/inference stabil
  ↓
training reproducible
  ↓
loss/PPL masuk akal
  ↓
grammatical coherence
  ↓
short-answer coherence
  ↓
multi-turn coherence
  ↓
RAG/retrieval integration
  ↓
quality benchmark
```

### C1. Infrastruktur

- satu tokenizer resmi;
- manifest checkpoint;
- metadata training;
- ukuran model yang benar-benar terverifikasi;
- checkpoint SHA/manifest;
- reproducible evaluation.

### C2. Data

Training corpus harus mempunyai satu sumber kebenaran numerik.

Dokumentasi saat ini menunjukkan adanya angka korpus dari snapshot berbeda. Sebelum keputusan scaling berikutnya, tetapkan:

```text
total documents
raw token count
BPE token count
training-window token count
active training corpus
snapshot/date
manifest SHA256
```

### C3. Quality

PPL hanyalah salah satu metrik.

Wajib ada evaluasi:
- grammar;
- repetition;
- factual consistency;
- instruction following sederhana;
- short dialogue;
- context retention;
- hallucination rate pada tugas terkontrol.

---

## 7. Fase D — integrasi Neural dengan RAG dan tools

Neural tidak langsung diberi semua tanggung jawab.

Arsitektur target:

```text
                    USER
                      ↓
                 Intent Router
                      ↓
        ┌─────────────┼─────────────┐
        ↓             ↓             ↓
      Tools        Retrieval      Memory
        │             │             │
        └─────────────┼─────────────┘
                      ↓
                 Context Pack
                      ↓
              ┌───────────────┐
              │ Engine Router │
              └───────┬───────┘
                  ┌───┴───┐
                  ↓       ↓
              Template  Neural
                  │       │
                  └───┬───┘
                      ↓
                  Quality
                      ↓
                   Answer
```

Neural berfungsi sebagai generator/penyusun bahasa, bukan sumber tunggal semua fakta.

Fakta yang membutuhkan kepastian harus tetap berasal dari tools, retrieval, atau structured data.

---

## 8. Fase E — personalization dan continual improvement

Feedback pengguna tidak langsung mengubah bobot Neural.

Urutan aman:

```text
feedback
 ↓
classification
 ↓
unmatched / weak retrieval / wrong intent / bad generation
 ↓
perbaikan data/rule/retrieval
 ↓
benchmark
 ↓
baru dipertimbangkan untuk training
```

Hal ini menjaga perubahan model tetap dapat dilacak.

Memory pengguna juga bukan otomatis training data.

---

## 9. Data governance AI

Pipeline data harus tetap:

```text
raw
 ↓
clean
 ↓
dedupe
 ↓
language filter
 ↓
tokenize
 ↓
chunk
 ↓
count
 ↓
manifest
 ↓
SHA256
 ↓
release
 ↓
training
```

Data mentah, data kanonik, dan data training harus dapat dibedakan.

### Source of truth

Satu manifest harus menjadi sumber angka resmi. File laporan otomatis tidak boleh menyimpan angka manual yang dapat berbeda dari manifest.

Perbedaan angka yang ditemukan antara status korpus dan audit neural harus diselesaikan sebelum scaling model berikutnya.

---

## 10. Kontrak arsitektur yang tidak boleh rusak

### Aturan 1 — hanya dua otak

Tidak membuat provider/model AI ketiga di luar:

- Template;
- Neural.

### Aturan 2 — satu router

Semua keputusan engine lewat `engine-router.js`.

### Aturan 3 — satu pipeline giliran

Fitur baru masuk melalui:

```text
intent → context → route → compose → qc → act
```

bukan melalui jalur AI paralel baru.

### Aturan 4 — fakta bukan tugas Neural

Jika jawaban tersedia dari data/tool yang lebih pasti, gunakan sumber tersebut.

### Aturan 5 — status harus nyata

`ready` berarti benar-benar siap menerima pekerjaan, bukan sekadar fitur diaktifkan.

### Aturan 6 — semua perubahan harus bisa diuji

Perubahan AI harus mempunyai bukti melalui lint, benchmark, test case, atau evaluasi yang relevan.

---

## 11. Roadmap pengembangan prioritas

### P0 — Stabilkan fondasi

- [ ] perbaiki Neural `status()` agar mencerminkan provider;
- [ ] state `idle/loading/ready/error`;
- [ ] prefetch Neural yang dapat diamati;
- [ ] timeout + fallback Neural;
- [ ] boundary privacy server mode;
- [ ] verifikasi Template tetap selalu dapat menjadi fallback.

### P1 — Naikkan kualitas Template

- [ ] unmatched-query pipeline;
- [ ] retrieval benchmark;
- [ ] re-ranking produksi;
- [ ] context/entity continuity;
- [ ] tool routing benchmark;
- [ ] quality benchmark per kategori.

### P1 — Rapikan data/state

- [ ] tetapkan source of truth korpus;
- [ ] sinkronkan seluruh angka MD dengan manifest;
- [ ] pisahkan persistent data dan preference;
- [ ] audit silent storage failures.

### P2 — Perkuat Neural

- [ ] tokenizer/checkpoint manifest;
- [ ] reproducible training metadata;
- [ ] grammar/coherence benchmark;
- [ ] short-dialogue benchmark;
- [ ] context retention benchmark;
- [ ] evaluasi scaling sebelum menaikkan parameter.

### P2 — Integrasi AI lanjutan

- [ ] RAG + Neural;
- [ ] controlled generation;
- [ ] personalized style;
- [ ] feedback-to-training pipeline yang terpisah dari memory pengguna.

---

## 12. Definition of Done untuk pengembangan AI

Sebuah fitur AI dianggap selesai hanya jika:

1. masuk ke arsitektur yang sudah ada;
2. tidak membuat otak/provider ketiga;
3. mempunyai jalur error/fallback;
4. mempunyai test/benchmark yang sesuai;
5. tidak merusak Template baseline;
6. tidak mencampur data pengguna dengan training data tanpa mekanisme eksplisit;
7. dokumentasi status diperbarui;
8. angka/model/checkpoint dapat ditelusuri ke manifest atau sumber resmi;
9. perubahan lint/syntax bersih;
10. perilaku aktual diverifikasi di browser bila menyentuh UI/chat.

---

## 13. Kriteria keberhasilan Rategoan

Keberhasilan tidak didefinisikan sebagai "model semakin besar".

Rategoan berhasil bila pengguna mendapatkan:

- jawaban yang tepat untuk tugas deterministik;
- retrieval yang relevan;
- memory yang konsisten;
- tools yang benar-benar bekerja;
- percakapan multi-turn yang tidak mudah kehilangan konteks;
- generator Neural yang semakin koheren;
- fallback yang aman;
- transparansi kapan data lokal digunakan dan kapan server digunakan;
- seluruh peningkatan dapat dibuktikan dengan benchmark.

Target akhirnya adalah AI lokal yang **berguna lebih dulu, lalu semakin generatif**, bukan sekadar model besar yang dapat menghasilkan teks.

---

## 14. Catatan audit baseline

Audit branch `main` menemukan beberapa isu engineering konkret yang menjadi dasar PRD ini:

- Neural adapter menyatakan `ready: true` walaupun checkpoint belum tentu termuat;
- `init()` Neural belum melakukan readiness initialization yang nyata;
- loading cascade Neural berpotensi menjadi bottleneck request pertama;
- fallback router menunggu `ask()` selesai sebelum berpindah engine;
- server mode perlu boundary privasi/validasi endpoint yang lebih eksplisit;
- penyimpanan state besar perlu dipisahkan dari preference kecil;
- DOM history perlu lifecycle/pruning yang lebih kuat untuk sesi panjang.

Temuan ini adalah **prioritas engineering**, bukan alasan untuk mengganti arsitektur dua otak.

---

## 15. Dokumen rujukan

- `README.md` — gambaran produk dan arsitektur tingkat atas.
- `PRD/PRD-ATURAN-KERJA.md` — aturan kerja pengembangan.
- `PRD/FONDASI-TEORI-RAGET.md` — teori AI/RAGET.
- `PRD/PRD-RAGET-TEMPLATE.md` — roadmap Template.
- `PRD/PRD-RAGET-NEURAL.md` — roadmap Neural.
- `PRD/PRD-RELEASE.md` — governance data/release.
- `docs/ARSITEKTUR.md` — peta kode.
- `docs/DATA-STRUCTURE.md` — struktur data.
- `docs/KERANGKA-MESIN.md` — pipeline turn.
- `docs/STATUS-KORPUS-LISENSI.md` — status korpus/lisensi.
- `raget/raget-devlog/neural/corpus-token-audit.md` — audit token korpus.
- `raget/raget-tools/CHECKPOINT-POLICY.md` — kebijakan checkpoint.
- `raget/raget-tools/tambah-data-baru.md` — pipeline penambahan data.

---

## 16. Prinsip terakhir

**Jangan mengejar model besar sebelum sistem kecil sudah benar.**

Urutan pengembangan Rategoan:

```text
stabil
  ↓
benar
  ↓
terukur
  ↓
berguna
  ↓
koheren
  ↓
generatif
  ↓
scale
```

Dengan urutan tersebut, Rategoan tetap mempunyai produk yang berguna pada setiap tahap, sementara Neural berkembang secara bertahap di atas fondasi yang dapat diverifikasi.
