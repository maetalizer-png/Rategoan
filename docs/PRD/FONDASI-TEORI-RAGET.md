# Fondasi Teori, Matematika & Struktur AI Raget

Dokumen ini menjawab satu permintaan langsung: **jelaskan hulu sampai
hilir apa yang dibutuhkan membangun AI sendiri — kerangka, mesin, otak,
teori, rumus, matematika, pola, dan target — supaya pondasinya benar-benar
lengkap sebagai konsep, bukan cuma daftar tugas.**

Ini BUKAN PRD tugas seperti file lain di folder ini — ini peta teori
yang MENDASARI mereka. Baca urutan: dokumen ini dulu (kenapa &
bagaimana secara prinsip), baru `PRD-RAGET-TEMPLATE.md`/
`PRD-RAGET-NEURAL.md` (apa yang dikerjakan, sudah sejauh mana). Semua
rumus dan angka di sini diambil LANGSUNG dari kode yang sudah berjalan
di repo — bukan teori abstrak yang belum diimplementasikan. Di mana
Raget belum mengerjakan sesuatu, itu dicatat jujur, bukan ditutupi.

## 0. Definisi: apa itu "kecerdasan" untuk Raget

Kecerdasan di sini didefinisikan operasional, bukan filosofis: **fungsi
yang memetakan input (kalimat pengguna) ke output (jawaban/aksi) yang
berguna**, dengan tingkat "pemahaman" yang bertingkat dari pencocokan
persis sampai generasi bebas. RATEGOAN sengaja membangun DUA paradigma
sekaligus, karena keduanya punya jaminan yang berbeda dan saling
melengkapi — bukan satu "menang" atas yang lain:

| Paradigma | Jaminan | Kelemahan | Analogi |
|---|---|---|---|
| **Template (simbolik/deterministik)** | Kalau cocok, JAWABAN PASTI BENAR (ditulis manusia, diverifikasi) — bisa dijelaskan persis kenapa jawaban itu muncul | Tidak bisa menjawab di luar data yang ditulis; kaku terhadap parafrase | Buku pintar dengan indeks sangat baik |
| **Neural (statistik/dipelajari)** | Bisa generalisasi ke pola yang tidak pernah ditulis eksplisit; luwes terhadap variasi bahasa | Tidak ada jaminan benar (bisa "mengarang" - halusinasi); perlu data+compute besar untuk koheren | Orang yang belajar dari banyak bacaan, kadang salah ingat |

Prinsip desain: **Template adalah baseline yang harus selalu benar dan
selalu tersedia. Neural adalah lapisan tambahan yang dikejar supaya
makin luwes, TANPA PERNAH menggantikan jaminan kebenaran Template.**
Ini bukan kompromi sementara — ini keputusan arsitektur permanen (lihat
`docs/ARSITEKTUR.md` §4: default aplikasi selalu Template).

## 1. Urutan hulu ke hilir membangun AI — teori, rumus, dan pemetaan nyata

Delapan tahap berurutan. Tiap tahap: **teori umum** (berlaku untuk
membangun AI apa pun) → **rumus konkret** → **di mana ini nyata di
kode Raget hari ini**.

### 1.1 Representasi data — tokenisasi

**Teori**: komputer tidak memproses kata, cuma angka. Kalimat harus
dipecah jadi unit diskret (token) lalu dipetakan ke ID integer. Metode
standar industri: **Byte Pair Encoding (BPE)** — mulai dari karakter
tunggal, ulangi: cari pasangan token-berdampingan yang paling sering
muncul di korpus, gabung jadi satu token baru, sampai ukuran vocab
target tercapai. Ini menyeimbangkan antara vocab kata utuh (butuh vocab
raksasa) dan karakter tunggal (urutan jadi sangat panjang).

**Nyata di Raget**: tokenizer BPE ditulis dari nol
(`raget-neural/llm-tokenizer.js`), vocab size **30.368 token** (preset
massive50m/100m/200m) atau 8.000 (preset `tiny`, untuk eksperimen
cepat). Token spesial: `<pad>`, `<unk>`, `<bos>`, `<eos>` (id 0-3,
`llm-config.js`).

### 1.2 Representasi vektor — embedding & positional encoding

**Teori**: tiap token ID dipetakan ke vektor padat (dense) berdimensi
`dModel` lewat matriks embedding `E ∈ R^(vocabSize × dModel)` —
lookup `E[tokenId]`. Tapi urutan kata ikut menentukan makna
("anjing gigit orang" ≠ "orang gigit anjing"), padahal attention
(§1.5) sendiri tidak tahu urutan — makanya perlu **positional
encoding** ditambahkan ke tiap embedding, formula sinusoidal standar
(Vaswani dkk. 2017):

```
PE(pos, 2i)   = sin( pos / 10000^(2i/dModel) )
PE(pos, 2i+1) = cos( pos / 10000^(2i/dModel) )
```

**Nyata di Raget**: `raget-neural/llm-embedding.js#getPositionalEncoding()`
— rumus di atas diimplementasikan PERSIS sama (baris 121-126: `angle =
pos / Math.pow(10000, i / dModel)`, lalu `sin`/`cos`), embedding
matrix diinisialisasi Gaussian (`randomMatrix` pakai Box-Muller
transform).

### 1.3 Retrieval / pencocokan simbolik (matematika Template)

**Teori**: sebelum (atau sebagai pengganti) generasi bebas, cara paling
murah dan pasti benar untuk "menjawab" adalah MENEMUKAN dokumen/entri
yang sudah ditulis manusia yang paling relevan dengan query. Tiga alat
matematika inti:

- **BM25** (ranking relevansi berbasis frekuensi kata, standar mesin
  pencari):
  ```
  score(q,d) = Σ idf(t) · ( tf(t,d)·(k1+1) ) / ( tf(t,d) + k1·(1-b+b·|d|/avgdl) )
  idf(t) = ln( 1 + (N-df(t)+0.5)/(df(t)+0.5) )
  ```
  `k1=1.5, b=0.75` (default Lucene/Elasticsearch) — `raget-retrieval/bm25.js`.
- **Levenshtein distance** (jarak edit minimal antar dua string —
  insert/delete/substitute) untuk koreksi typo, dihitung lewat
  pemrograman dinamis `D[i][j] = min(D[i-1][j]+1, D[i][j-1]+1,
  D[i-1][j-1]+cost)` — `raget-agents/answer-composer.js#levenshtein()`.
- **Jaro-Winkler similarity** (kemiripan string berbobot prefiks, lebih
  toleran typo daripada Levenshtein untuk kalimat pendek) — threshold
  **0.82** — `raget-template/fuzzy-smalltalk.js`.

**Nyata di Raget**: `raget-retrieval/retrieve.js#rank()` memanggil BM25
lewat `scorer.tokenize()`, hasilnya dicache LRU (50 entri). Dipakai di
SEMUA 24 domain data terstruktur.

### 1.4 Reasoning rule-based (logika Template)

**Teori**: aturan `JIKA pola X cocok MAKA jawab Y` adalah **automata
hingga deterministik** (regex = notasi ringkas untuk DFA/NFA). Rangkaian
banyak aturan dicoba berurutan sampai satu cocok = pola desain
**Chain of Responsibility**: `output = pertama_dari(E1(q), E2(q), ...,
En(q)) yang bukan null, kalau semua null -> fallback`.

**Nyata di Raget**: `raget-agents/agent.js` mengorkestrasi >selusin
mesin (math, bilingual, stem, social, context, dst) persis pola ini;
`SMALLTALK_TRIGGERS` di `llm-engine.js` adalah kumpulan regex (~20
bucket) yang jadi lapisan pencocokan pola untuk smalltalk.

### 1.5 Representasi neural — self-attention (jantung Transformer)

**Teori**: masalah representasi urutan sebelum Transformer (RNN/LSTM)
memproses token satu-satu secara sekuensial — lambat, susah paralel.
**Self-attention** membiarkan SETIAP token "melihat" semua token lain
sekaligus, dengan bobot yang dipelajari. Untuk tiap token, tiga vektor
diturunkan dari input `x`: Query (Q), Key (K), Value (V) lewat proyeksi
linear terpelajar. Skor kecocokan antar token = dot product Q·K,
diskalakan supaya gradiennya stabil, lalu **softmax** mengubahnya jadi
distribusi probabilitas (bobot perhatian):

```
Attention(Q,K,V) = softmax( Q·Kᵀ / √dₖ ) · V
softmax(xᵢ) = exp(xᵢ) / Σⱼ exp(xⱼ)     (dikurangi max(x) dulu untuk stabilitas numerik)
```

**Multi-head attention**: jalankan attention di atas beberapa "kepala"
paralel (tiap kepala dimensi lebih kecil, `dModel/nHeads`), gabung
hasilnya — supaya model bisa fokus ke beberapa jenis hubungan sekaligus
(mis. hubungan sintaksis DAN semantik) dalam satu layer.

**Causal mask**: untuk model generatif (memprediksi token berikutnya),
token ke-i TIDAK BOLEH melihat token setelahnya — dipaksa lewat matriks
mask yang menambah `-∞` pada skor posisi masa depan sebelum softmax.

**Nyata di Raget**: `raget-neural/llm-attention.js` — `softmaxRow()`
persis rumus di atas (dengan pengurangan max untuk stabilitas numerik,
baris 39), `scaledDotProductAttention()` persis
`Q·Kᵀ/√dₖ` lalu mask lalu softmax lalu `·V`, `createCausalMask()`
untuk masking, `splitHeads()`/`mergeHeads()` untuk multi-head. Semua
ditulis dari nol dalam JavaScript murni, bukan wrapper library.

### 1.6 Blok Transformer lengkap

**Teori**: satu layer Transformer = Multi-Head Attention → residual
connection (`x + Sublayer(x)`, supaya gradien tidak hilang di jaringan
dalam) → Layer Normalization → Feed-Forward Network (dua matriks linear
dengan non-linearitas di antaranya, biasanya ReLU/GELU:
`FFN(x) = max(0, xW1+b1)W2+b2`) → residual lagi → LayerNorm lagi.
Susun `nLayers` blok seperti ini bertumpuk.

**Nyata di Raget**: `raget-neural/llm-transformer.js` menyusun blok ini
sesuai `nLayers` per preset (`llm-config.js`): tiny=4 layer,
massive50m=6, massive100m=8, massive200m=11.

### 1.7 Fungsi objektif & pembelajaran (bagaimana model "belajar")

**Teori**: model bahasa adalah distribusi probabilitas
`P(tokenₙ | token₁...tokenₙ₋₁)`. "Belajar" = menyesuaikan parameter
model (`θ`) supaya distribusi ini makin dekat dengan distribusi token
sungguhan di data training. Diukur dengan **cross-entropy loss**:

```
L(θ) = -Σ log P(token_benar | konteks; θ)
```

**Perplexity** (ukuran kualitas yang lebih mudah dibaca manusia) = 
`PPL = exp(L)` — makin rendah makin baik; PPL=1 berarti model selalu
100% yakin dan selalu benar (tidak realistis), PPL=vocabSize berarti
model menebak seacak mungkin.

**Gradient descent**: parameter diperbarui berlawanan arah gradien
loss, `θ ← θ - η·∇L(θ)` (`η` = learning rate), gradien dihitung lewat
**backpropagation** (aturan rantai kalkulus diterapkan mundur dari
output ke tiap parameter). **Adam optimizer** (dipakai Raget, bukan SGD
polos) menyesuaikan learning rate PER-PARAMETER berdasarkan rata-rata
bergerak gradien (momentum) dan kuadrat gradien (adaptif skala) —
lebih stabil untuk jaringan dalam.

**Nyata di Raget**: `raget-neural/llm-optimizer.js` — `sgdUpdate()`
(rumus dasar di atas persis) DAN `adamUpdate()`/`createAdamState()`
(Adam lengkap dengan momentum+adaptif). Angka PPL nyata dari training
(`raget-devlog/neural/training-report-*-round8-colab-gpu.json`):

| Preset | PPL sebelum sesi | PPL akhir |
|---|---:|---:|
| massive50m | 331,05 | **141,90** |
| massive100m | 1272,30 | 525,05 |
| massive200m | 426,93 | **825,55** |

(Catatan §1.9 di bawah: kenapa model lebih besar PPL-nya lebih buruk —
ini BUKAN kegagalan arsitektur, ini kekurangan data, dibuktikan
kuantitatif di `PRD-RAGET-NEURAL.md` §2.)

### 1.8 Scaling laws — berapa data dibutuhkan untuk berapa parameter

**Teori**: parameter model dan volume data training HARUS tumbuh
BERSAMA — riset scaling law (mis. Hoffmann dkk./"Chinchilla", 2022)
menemukan rasio mendekati optimal di sekitar **20 token training per
parameter model**. Melatih model besar di atas data yang sama dengan
model kecil = model besar UNDERTRAINED, sering PPL-nya malah lebih
buruk daripada model kecil yang lebih "pas" dengan data yang tersedia.

**Nyata di Raget**: lantai resmi di `docs/STATUS-KORPUS-LISENSI.md`
adalah **17.651.050.443 token BPE** dari 91.395.436 dokumen
(K1 = 2,20 miliar, K2 = 0,43 miliar, K3 = 15,01 miliar).
Dicocokkan ke rasio 20:1:

| Preset | Param | Token ideal | Token tersedia | Tercukupi |
|---|---:|---:|---:|---:|
| massive50m | 49.999.872 | 1,00 miliar | 17,65 miliar | tertutup |
| massive100m | 103.325.184 | 2,07 miliar | 17,65 miliar | tertutup |
| massive200m | 200.709.120 | 4,01 miliar | 17,65 miliar | tertutup |

Urutan lama yang memakai ratusan juta token tidak berlaku.
Korpus resmi 17,65 miliar menutup ketiga preset di tabel ini.

### 1.9 Kompresi model — kuantisasi

**Teori**: bobot model biasanya disimpan 32-bit float (F32), 4 byte per
angka — mahal untuk disimpan/diunduh di perangkat pengguna. **Kuantisasi
affine int8** memetakan rentang nilai float ke 254 level integer 8-bit
(1 byte), dengan dua parameter per matriks: `scale` (skala) dan
`zeroPoint` (offset):

```
scale = (max - min) / 254
zeroPoint = min
q = round( (x - zeroPoint) / scale ) - 127        (kuantisasi, simpan 1 byte)
x̂ = (q + 127) · scale + zeroPoint                  (dekuantisasi saat inference)
```

**Nyata di Raget**: `raget-neural/llm-quantization.js#quantizeMatrix()`
— rumus di atas PERSIS (`scale = (max-min)/254`, dst). Matriks bobot
disimpan int8, vektor bias/LayerNorm tetap F32 (lebih sensitif
presisi, ukurannya kecil jadi tidak menghemat banyak). Hasil nyata:
rasio ~1,01-1,18 byte/parameter tersimpan (bukan 4 byte penuh) — lihat
`docs/ARSITEKTUR.md` §6 untuk tabel lengkap per checkpoint.

### 1.10 Evaluasi & feedback loop (menutup lingkaran)

**Teori**: model/aturan tidak boleh dianggap "selesai" tanpa diukur.
Untuk retrieval: **hit@k** (persentase query yang jawaban benarnya ada
di k hasil teratas), **MRR** (Mean Reciprocal Rank, rata-rata
`1/posisi jawaban benar` — menghukum jawaban benar yang terkubur jauh
di bawah). Untuk sistem yang dipakai nyata: kumpulkan sinyal dari
pengguna (like/dislike, pertanyaan yang gagal) dan gunakan itu untuk
mengarahkan perbaikan berikutnya — **closed loop**: Data → Model/Aturan
→ Output → Feedback → Data (lagi).

**Nyata di Raget**: `raget-tools/bench-retrieval*.mjs` (hit@1/hit@3/MRR
untuk domain country, wisata, dan semua domain) sudah pernah dijalankan
dan dicatat di devlog. Closed loop pengguna: `raget-memory/feedback-store.js`
(`record()`/`statsByIntent()`) + `raget-database/raget-db.js`
(`logUnmatched()`/`allUnmatched()`) — infrastruktur SUDAH DIBANGUN dan
sudah punya panel tampilan (`js/sheets/data-health-sheet.js`), status
lengkap di `PRD-RAGET-TEMPLATE.md` Fase 1 (SELESAI).

## 2. Pola arsitektur (design patterns) yang dipakai

Bukan kebetulan struktur kode Raget bentuknya begini — ini pola desain
software baku, dipetakan ke nama filenya:

| Pola | Definisi singkat | Di mana di Raget |
|---|---|---|
| **Strategy / Adapter** | Beberapa implementasi berbeda di balik satu antarmuka sama | `raget-agents/engine-contract.js` (`{id,label,init,ask,status}`) — Template dan Neural adalah dua "strategy" yang bisa ditukar tanpa mengubah pemanggilnya |
| **Chain of Responsibility** | Rangkaian handler dicoba berurutan sampai satu menangani | `agent.js` mencoba >selusin mesin berurutan; `engine-router.js` mencoba Template/Neural berurutan |
| **Repository** | Abstraksi akses data di balik fungsi sederhana, sembunyikan detail penyimpanan | `raget-database/raget-db.js` (di atas IndexedDB lewat `idb-gateway.js`) |
| **Facade** | Satu pintu masuk sederhana ke subsistem kompleks | `js/ai/ai.js#generate()` — satu-satunya pintu ke seluruh otak AI dari sisi UI |
| **Registry** | Peta nama→loader yang bisa didaftar/dicari dinamis | `raget-agents/dataries-registry.js` (`REGIONS`/`JSON_MIGRATED_GROUPS`) |
| **Observer / Feedback loop** | Komponen mencatat kejadian, komponen lain membaca & bereaksi nanti | `feedback-store.js` mencatat, `data-health-sheet.js` membaca & menampilkan |

Kenapa ini penting dicatat: pola-pola ini SUDAH konsisten dipakai di
seluruh kode — pengembangan lanjutan (fase-fase di PRD lain) harus
mengikuti pola yang sama, bukan menciptakan pola baru per fitur.

## 3. Peta tingkat kecerdasan (Capability Maturity Levels)

Menjawab langsung: **"nanti bisa apa, pintar dalam hal apa, kalau bisa
melewatinya semua"**. Enam tingkat, tiap tingkat = kemampuan BARU yang
tidak ada di tingkat sebelumnya, dengan kriteria lulus yang bisa diukur
(bukan klaim subjektif):

| Level | Nama | Bisa apa | Kriteria lulus | Status hari ini |
|---|---|---|---|---|
| **L0** | Pencocokan pola murni | Jawab sapaan/smalltalk yang persis mirip pola yang ditulis | Regex/fuzzy-match cocok, respons instan | ✅ JALAN (`SMALLTALK_TRIGGERS`, `fuzzy-smalltalk.js`) |
| **L1** | Retrieval terstruktur | Jawab pertanyaan faktual dari data terstruktur (negara, tokoh, sains, dst) lewat BM25 | hit@k/MRR terukur di atas baseline | ✅ JALAN (24 domain, `bench-retrieval*.mjs`) |
| **L2** | Closed-loop lokal | Tahu pertanyaan mana yang gagal, tahu jawaban mana yang di-dislike, TANPA training model apa pun | Log unmatched + feedback per-intent tercatat & terlihat manusia | ✅ SEBAGIAN — pencatatan+panel SELESAI (`PRD-RAGET-TEMPLATE.md` Fase 1); re-ranking otomatis dari sinyal ini BELUM (Fase 2.1/4) |
| **L3** | Pemahaman semantik | Menjawab benar walau kata-katanya beda dari data (sinonim/parafrase), bukan cuma keyword-match | Bench retrieval menangkap kasus yang BM25 gagal tapi semantic search berhasil | ❌ BELUM (`PRD-RAGET-TEMPLATE.md` Fase 3.1 - butuh pooling kalimat di atas `llm-embedding.js` yang sudah ada) |
| **L4** | Generasi koheren kecil | Neural bisa menjawab bebas dengan kalimat gramatikal masuk akal (bukan sekadar retrieval) | Held-out PPL rendah DAN manusia membaca output-nya masuk akal (bukan cuma angka) | ❌ BELUM — korpus baru 13,5-54,3% dari kebutuhan preset yang ada (§1.8); lihat `PRD-RAGET-NEURAL.md` |
| **L5** | Generasi besar + RAG + personalisasi | Menggabungkan retrieval presisi + generasi lancar + preferensi personal per pengguna, tetap 100% lokal atau server milik sendiri | Ketiga prasyarat (L3 semantic, L4 koheren, data preferensi personal) semua lulus dulu | ❌ BELUM, urutan prasyaratnya sudah dipetakan di `PRD-RAGET-NEURAL.md` §7 |

**Prinsip penting**: tingkat-tingkat ini TIDAK BISA dilompati — L4
(generasi koheren) tidak berguna tanpa L1 (data terstruktur) sebagai
sumber kebenaran untuk dicek silang, L5 (RAG) secara definisi butuh L3
DAN L4 lulus dulu (sudah dijelaskan matematis di `PRD-RAGET-NEURAL.md`
§7). Ini bukan pilihan desain sembarangan, ini konsekuensi logis dari
apa yang masing-masing level butuhkan sebagai fondasi.

## 4. Alur kerja end-to-end (satu pesan, hulu ke hilir)

```
Pesan pengguna (teks mentah)
  │
  ▼
[1.1] Tokenisasi/normalisasi (normalizeSlang, scorer.tokenize)
  │
  ▼
[raget-memory] Konteks percakapan (short-term) + fakta jangka panjang (facts)
  │
  ▼
[raget-agents/router-intent.js] Deteksi intent kasar (matematika? faktual? smalltalk? framework?)
  │
  ▼
[1.4] agent.js — Chain of Responsibility lewat >selusin mesin rule-based:
      math → bilingual → knowledge-graph → stem → social → context → ...
      Tiap mesin pakai [1.3] BM25/Levenshtein/Jaro-Winkler untuk cocokkan ke data
  │  (kalau ADA yang cocok)          (kalau SEMUA gagal)
  ▼                                    ▼
[Jawaban dari Template]        [raget-agents/engine-router.js]
  │                              → coba Template (selalu berhasil, fallback generik)
  │                              → (kalau user pilih) coba Neural [1.5-1.9]:
  │                                embedding→attention→FFN→softmax→sampling
  ▼                                    │
[Post-processing: rapikan teks]  ◄─────┘
  │
  ▼
Tampil ke pengguna + tersimpan raget-database
  │
  ▼
[1.10] Feedback (like/dislike, unmatched log) → raget-memory/raget-database
  │
  └──► (lingkaran balik) mengarahkan penulisan data baru / re-ranking / training berikutnya
```

Diagram ini SATU-SATUNYA sumber kebenaran untuk urutan "hulu ke hilir"
— setiap PRD tugas lain adalah pekerjaan yang memperkuat SATU node di
diagram ini, bukan menambah node baru di luar diagram (kalau memang
perlu node baru, itu keputusan arsitektur yang butuh dokumen ini
diperbarui dulu dan dikonfirmasi ke pemilik produk, bukan ditambah
diam-diam).

## 5. Target & goals — ringkasan silang-referensi

| Horizon | Target konkret | Diukur dengan | PRD rujukan |
|---|---|---|---|
| Sudah tercapai | L0 + L1 jalan penuh, L2 pencatatan+panel jalan | hit@k/MRR bench, 0 error lint/live | `PRD-RAGET-TEMPLATE.md` Fase 1 (SELESAI) |
| Jangka pendek | L2 penuh (re-ranking dari feedback), granularitas feedback per-entry | Bench sebelum/sesudah re-ranking menunjukkan entry buruk turun peringkat | `PRD-RAGET-TEMPLATE.md` Fase 2.1, Fase 4.1-4.2 |
| Jangka pendek-menengah | L3 semantic search pelengkap BM25 | Kasus parafrase/sinonim yang BM25 gagal, semantic berhasil | `PRD-RAGET-TEMPLATE.md` Fase 3.1 |
| Jangka menengah | Korpus tumbuh 18,4x (menuju 500M layak latih) | Audit token ulang (`audit-corpus-tokens.mjs`) menunjukkan >80% tercukupi | `PRD-RAGET-NEURAL.md` Fase A.1b |
| Jangka panjang | L4: Neural koheren gramatikal terukur manusia | PPL rendah DAN generasi dibaca-manual masuk akal, bukan cuma angka | `PRD-RAGET-NEURAL.md` Fase A-B |
| Horizon jauh (spekulatif, butuh keputusan produk) | L5: RAG + personalisasi + skala 4B-40B | Prasyarat L3+L4 lulus dulu, keputusan eksplisit soal prinsip 100% lokal | `PRD-RAGET-NEURAL.md` Fase B-C |

## 6. Kesimpulan

**Pondasi konsep — teori, matematika, struktur, pola, dan peta level
kecerdasan — sekarang lengkap dan terhubung ujung ke ujung.** Semua
rumus di dokumen ini sudah punya implementasi nyata yang bisa dicek
langsung di kode (bukan rencana di atas kertas): BPE tokenizer, embedding
+ positional encoding sinusoidal, BM25/Levenshtein/Jaro-Winkler, self-
attention/multi-head/FFN/LayerNorm, cross-entropy/perplexity/Adam
optimizer, scaling law Chinchilla-ratio dengan angka korpus riil,
kuantisasi affine int8, dan closed-loop feedback dengan panel nyata.

Yang tersisa BUKAN "pondasi belum ada" — pondasinya sudah ada dan
sudah dipetakan lengkap di sini. Yang tersisa adalah **eksekusi
bertahap** sesuai urutan prasyarat yang sudah dijelaskan di §3 (peta
level) dan §5 (target): tiap fase di `PRD-RAGET-TEMPLATE.md` dan
`PRD-RAGET-NEURAL.md` adalah satu langkah konkret menaiki peta level
ini — satu bukti verifikasi nyata (lint LOLOS + Playwright/benchmark)
sebelum diklaim selesai, baru lanjut ke langkah berikutnya.
