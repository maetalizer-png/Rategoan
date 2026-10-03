# Arsitektur Otak AI Raget

Peta ini menjawab satu pertanyaan: **kalau berhenti kerja di proyek ini 6
bulan lalu kembali, dari mana harus mulai membaca?** Ditulis setelah
restrukturisasi `raget-llm/` (dulu satu folder campur rule-based+neural)
menjadi dua folder terpisah per "otak", masing-masing di balik kontrak
yang sama, disatukan oleh satu router. **Cuma dua otak, dan keduanya
MILIK RATEGOAN SENDIRI** - tidak ada model bahasa pihak ketiga yang
disematkan di mana pun dalam proyek ini.

Semua angka dan rumus di dokumen ini diambil langsung dari kode/data yang
ada di repo saat penulisan (dicek ulang, bukan dikarang) - tiap angka
menyebut file sumbernya supaya bisa diverifikasi ulang kapan saja.

Untuk teori/matematika di balik tiap komponen (BM25, attention,
cross-entropy, scaling law, dst) dan peta tingkat kecerdasan L0-L5,
lihat [`docs/PRD/FONDASI-TEORI-RAGET.md`](PRD/FONDASI-TEORI-RAGET.md) -
dokumen ini fokus ke PETA KODE hari ini, dokumen itu fokus ke TEORI
di baliknya.

Lapisan giliran (intent→act) ada di [`docs/KERANGKA-MESIN.md`](KERANGKA-MESIN.md) dan `raget/raget-agents/turn-pipeline.js`.

## 1. Diagram lapisan

```
[ UI chat ]                          <- index.html + js/chat/, js/sheets/ - gak pernah berubah
      |
[ router ]                           <- raget/raget-agents/engine-router.js
      |                                 satu tempat aturan: siapa jawab dulu, fallback ke mana
      |
      +-- rule-based (adapter)       raget/raget-template/template-adapter.js
      |     data inti: harga, stok, FAQ -> instan & pasti benar - JALAN, baseline hari ini
      |
      +-- neural (adapter)           raget/raget-neural/neural-adapter.js
            otak RATEGOAN sendiri, dilatih dari nol - AKTIF, meski belum koheren gramatikal
```

Tiap otak = satu file adapter dengan muka sama: `init()` / `ask()` /
`status()` (lihat §3). Hidupkan/matikan satu lapis = ubah `status()`
adapter itu jadi `{ready: true/false}` + urutan di router, **bukan**
bongkar kode otak lain. Berhenti 6 bulan lalu lanjut = buka
`raget-agents/engine-router.js`, lihat §5 ("Cara melanjutkan tiap
lapis").

## 2. Peta folder `raget/`

| Folder | Isi | Status hari ini |
|---|---|---|
| `raget-agents/` | Router intent (`router-intent.js`), orkestrasi `agent.js` (>selusin mesin: math, bilingual, STEM, sosial, framework, dst - lihat README.md), kontrak adapter (`engine-contract.js`) dan router 2-otak (`engine-router.js`) | **Jalan** - jantung orkestrasi, dipakai tiap pesan |
| `raget-template/` | `llm-engine.js` (craft/greeting/interjection/daily-talk fallback template), `fuzzy-smalltalk.js` (Jaro-Winkler smalltalk), `llm-worker.js` (stub deteksi dukungan Web Worker, tidak dipakai aktif), `template-adapter.js` | **Jalan** - default aplikasi, selalu jadi fallback terakhir yang tidak pernah gagal |
| `raget-neural/` | Transformer JS murni dari nol (`llm-attention.js`, `llm-transformer.js`, `llm-tokenizer.js`, `llm-trainer.js`, dst - 19 file), `neural-provider.js` (cascade unduh+cache 200M→100M→50M), `neural-adapter.js` | **Terlatih nyata dan AKTIF** (`status().ready: true`) - lihat §4 soal kenapa hasilnya masih belum koheren |
| `raget-memory/` | Memori jangka pendek (`memory-short.js`, 10 giliran terakhir), jangka panjang (`memory-long.js`, fakta diajarkan pengguna), index pencarian (`memory-index.js`), few-shot lokal, feedback/streak store | **Jalan** |
| `raget-database/` | `raget-db.js` - riwayat catatan Q&A + log kueri tak terjawab, disimpan lewat `idb-gateway.js` (IndexedDB), skema di `raget-schema.js` | **Jalan** |
| `raget-retrieval/` | `bm25.js` (ranking BM25 satu pintu), `retrieve.js` (pemanggil scoreCorpus lintas domain) | **Jalan** |
| `raget-data/` | `json/` (24 domain data terstruktur), `jsonl/` (korpus eksternal). Checkpoint `.safetensors` tidak lagi di git; semuanya di Hugging Face `Maetalizer19/rategoan-neural` | Data domain tetap di repo. Otak neural tidak di-commit |
| `raget-devlog/` | Log pengembangan, persona/fewshot JSON, `neural/` (laporan training + eval log - **DATA**) | **Data/log, tidak disentuh** |
| `raget-tools/` | Skrip dev-only: `lint-check.mjs`, `run-bench.mjs`, skrip training/eval neural (`train-*.mjs`, `eval-*.mjs`), migrasi data | **Jalan (tooling, bukan bagian app)** |

## 3. Kontrak adapter

Satu bentuk untuk semua otak, didefinisikan di
`raget/raget-agents/engine-contract.js`:

```js
{
  id: string,                    // slug stabil: 'template' | 'neural'
  label: string,                 // nama tampil manusia: 'Raget Template'
  async init(),                  // siapkan resource - idempotent, aman dipanggil berkali-kali
  async ask(prompt, context),    // context = { messages, ... }; LEMPAR Error kalau gagal
  status(),                      // SYNC, minimal { ready: boolean, reason: string }
}
```

Contoh adapter nyata yang sudah jalan hari ini
(`raget-template/template-adapter.js`, diringkas):

```js
import { agent } from '../raget-agents/agent.js';

async function ask(prompt, context) {
  return agent.respond(context.messages || [], prompt);
}
function status() {
  return { ready: true, reason: 'Mesin rule-based/template - selalu siap.' };
}
export const templateAdapter = Object.freeze({ id: 'template', label: 'Raget Template', init: async () => true, ask, status });
```

## 4. Aturan router

`raget/raget-agents/engine-router.js`:

- Preferensi pengguna (dipilih di panel Model, disimpan
  `js/state/engine-preference.js` → `localStorage['raget_engine_preference']`)
  menentukan siapa dicoba duluan: **template** (default aplikasi) atau
  **neural**. Yang satunya jadi fallback kalau yang pertama gagal.
- Sebelum memanggil `ask()`, router cek `status().ready`. Kalau `false`,
  atau kalau `ask()` melempar `Error`, router lanjut ke adapter
  berikutnya - pengguna tidak pernah melihat error mentah selama
  Template (baseline) tetap `ready`.
- **Kedua adapter `status().ready: true` hari ini.** Bedanya:
  Template tidak pernah gagal (fallback generik selalu ada), Neural
  bisa saja `ask()`-nya melempar Error kalau checkpoint gagal dimuat -
  saat itu terjadi, router otomatis jatuh ke Template.
- **Default aplikasi tetap Raget Template** kalau pengguna belum
  memilih apa-apa di panel Model. Memilih "Raget Neural" secara
  eksplisit membuat jawaban benar-benar datang dari generasi neural
  apa adanya, termasuk kalau masih tidak koheren gramatikal - ini
  pilihan produk yang sengaja (lihat di bawah).

Titik masuk nyata: `js/ai/ai.js#generate()` memanggil
`engineRouter.ask(prompt, {messages})` - bukan lagi memanggil
`agent.respond()`/`neuralProvider.generate()` langsung seperti sebelum
refactor ini.

### Kenapa Neural AKTIF tapi belum koheren

Transformer JS murni di `raget-neural/` (bukan wrapper provider apa pun -
attention, embedding, tokenizer BPE, trainer, semua ditulis dari nol) sudah
dilatih nyata berkali-kali di GPU gratis Colab. Laporan training terbaru
(`raget-devlog/neural/training-report-*-round8-colab-gpu.json`):

| Preset | Parameter (lihat §6) | Held-out PPL sebelum sesi | Held-out PPL akhir |
|---|---|---|---|
| massive50m | 49.999.872 | 331.05 | 141.90 |
| massive100m | 103.325.184 | 1272.30 | 525.05 |
| massive200m | 200.709.120 | 426.93 | 825.55 |

PPL turun tapi generasinya **tetap tidak koheren secara gramatikal** -
contoh nyata dari `training-report-massive200m-round8-colab-gpu.json`,
prompt "Apa ibu kota Indonesia?":

> "2009 Dapat resmi manis kota AS 146 - pukul Kecamatan AEnsehluar
> ChampInternational Brnbsp"

**Keputusan produk**: dibanding mengunci lapis ini nonaktif sampai
koheren (pendekatan lama), Neural sekarang AKTIF (`status().ready:
true`) supaya pengguna yang memilihnya di panel Model betul-betul
melihat kemajuan nyata apa adanya - bukan dikunci jadi pajangan mati.
Default aplikasi tetap Template supaya pengguna baru selalu dapat
jawaban yang benar dan pasti; Neural adalah pilihan eksplisit,
eksperimental, jujur soal kualitasnya di UI (lihat `NEURAL_NOTE` di
`js/sheets/model-sheet.js`).

## 5. Cara melanjutkan tiap lapis

### Template (jalan - pemeliharaan, bukan "melanjutkan")

Tambah data baru lewat `raget-data/json/<domain>/` (lihat
`docs/DATA-STRUCTURE.md`), atau tambah mesin baru di `raget-agents/` lalu
panggil dari `agent.js#respond()`. `template-adapter.js` tidak perlu
disentuh - dia cuma membungkus `agent.respond()` apa adanya.

### Neural (aktif, tapi belum koheren - ini yang paling perlu dilanjutkan)

1. Latih ulang pakai notebook yang sudah ada (`raget-tools/colab-train-gpu.ipynb`,
   mencakup preset 50M/100M/200M dalam satu `Run all`).
2. Ukur PPL held-out - **jangan puas cuma karena loss/PPL turun**, baca
   output generasinya kata per kata.
3. Update catatan kualitas di komentar `neural-adapter.js` dan tabel PPL
   di §"Kenapa Neural AKTIF tapi belum koheren" di atas setiap kali ada
   sesi training baru - `status().ready` sudah `true` dari sekarang,
   jadi tidak ada lagi flag yang perlu dinyalakan; yang berubah seiring
   training makin bagus cuma isi `reason` dan seberapa sering hasilnya
   masuk akal.
4. Jalankan lint-check + bench Playwright penuh sebelum commit.

## 6. Angka & rumus nyata dari kode

### BM25 (`raget/raget-retrieval/bm25.js`)

```
score(q, d) = sum atas term query t dari
  idf(t) * ( tf(t, d) * (k1 + 1) ) / ( tf(t, d) + k1 * (1 - b + b * |d| / avgdl) )
idf(t) = ln( 1 + (N - df(t) + 0.5) / (df(t) + 0.5) )
```

`k1 = 1.5`, `b = 0.75` - default standar Lucene/Elasticsearch, dipakai
apa adanya (baris 14-15 file tersebut).

### Jaro-Winkler smalltalk (`raget/raget-template/fuzzy-smalltalk.js`)

Ambang batas kecocokan `THRESHOLD = 0.82` (baris 18) - sengaja tinggi
supaya smalltalk fuzzy tidak salah memicu pada kalimat yang cuma
kebetulan mirip.

### Ukuran checkpoint neural vs jumlah parameter

Setiap preset (`raget-neural/llm-config.js`) punya dua cara menghitung
"jumlah parameter" yang berbeda tapi sama-sama valid:

- **Param "nameplate"** (dipakai di nama preset & laporan training,
  `parameterCount` di `training-report-*.json`) = embedding token
  DIHITUNG DUA KALI (sekali sebagai embedding input, sekali sebagai
  proyeksi output/"lm head" - konvensi umum saat mendeskripsikan
  kapasitas model).
- **Param "tersimpan"** = embedding cuma dihitung SEKALI, karena
  `llm-checkpoint.js#restoreModelFromCheckpointSafetensors()` men-tie
  proyeksi output ke embedding yang sama
  (`outputProjection = transpose(embeddingMatrix)`) - baris 182 file
  tersebut. File `.safetensors` cuma menyimpan versi tied ini.

Rumus param "tersimpan" per preset (dModel, nLayers, nHeads, dFF,
vocabSize dari `llm-config.js`):

```
matrixParams = vocabSize*dModel                       (embedding, tied dgn output)
             + nLayers * ( 4*dModel^2                  (Wq,Wk,Wv,Wo - tanpa bias)
                          + 2*dModel*dFF )              (ffn.W1, ffn.W2)
vectorParams = nLayers * (dFF + 5*dModel)              (ffn bias b1/b2, ln1/ln2 gamma+beta)
             + 2*dModel                                 (final_norm gamma+beta)
```

`matrixParams` disimpan **int8** (1 byte/nilai, kuantisasi affine
per-matriks: satu `scale`+`zeroPoint` per tensor -
`llm-quantization.js#quantizeMatrix()`, rentang 254 level). `vectorParams`
disimpan **F32** (4 byte/nilai) - lihat `llm-checkpoint.js#writeVector()`
vs `#writeMatrix()`.

Dicocokkan ke file nyata di `raget-data/neural/` (byte diukur langsung,
`parameterCount` "nameplate" dikutip dari `training-report-*.json` yang
memuatnya - cocok persis dengan rumus di atas):

| File | Preset | Param nameplate (untied) | Param tersimpan (rumus, tied) | Ukuran file | Bytes/param tersimpan |
|---|---|---:|---:|---:|---:|
| `raget-neural-tiny.safetensors` | tiny | 2.839.296 (`training-report-tiny.json`) | 1.815.296 | 2.141.628 B | 1,180 |
| `raget-neural-50m.safetensors` | small | 57.971.712 (rumus; komentar kode di `build-neural-checkpoint.mjs` sebut "~58 juta") | 41.587.712 | 42.167.768 B | 1,014 |
| `raget-neural-massive50m.safetensors` | massive50m | 49.999.872 (`training-report-massive50m*.json`) | 34.451.456 | 35.949.916 B | 1,043 |
| `raget-neural-massive100m.safetensors` | massive100m | 103.325.184 (`training-report-massive100m*.json`) | 80.002.560 | 81.588.956 B | 1,020 |
| massive200m (di HF Hub, tidak dibundel repo - lihat `neural-provider.js`) | massive200m | 200.709.120 (`training-report-massive200m-round8-colab-gpu.json`) | 169.612.288 | ~171,3 juta B (perkiraan rumus + ~1,4MB header) | ~1,01 (perkiraan) |

Rasio selalu sedikit di atas 1 byte/param karena mayoritas param
(matriks bobot) 1-byte int8, ditambah sebagian kecil param (bias/LayerNorm)
4-byte F32, ditambah header JSON `safetensors` yang memuat seluruh
`vocab.tokenToId` + merges BPE + `scale`/`zeroPoint` per matriks (makin
besar vocab, makin besar header - inilah kenapa `tiny` yang vocab-nya
cuma 8000 rasionya paling tinggi/1,18, sementara preset lain berbagi
vocab 30.368 token dan rasionya turun ke ~1,01-1,04).

## 7. Roadmap masa depan (vector/embedding, RAG, LoRA)

Ketiganya sering disebut sebagai satu paket "upgrade AI", padahal punya
syarat berbeda dan urutan ketergantungan yang nyata secara teknis - bukan
daftar buzzword yang bisa dikerjakan sembarang urutan. Semuanya dibangun
di atas **Neural, otak RATEGOAN sendiri** - tidak ada jalur lain.

1. **Embedding lokal (vector)** - **bisa mulai duluan**, karena tidak
   butuh generator yang koheren sama sekali. `raget-neural/llm-embedding.js`
   sudah punya primitif matematika dasarnya (matmul, lookup embedding
   per-token, positional encoding) yang bisa dipakai ulang, tapi BELUM
   ada pooling kalimat (mean/CLS) atau index similarity - itu yang perlu
   ditambah, bukan ditulis dari nol. Tambah pooling + index
   cosine/dot-product di atas `raget-database`/`raget-data`. Ini fondasi
   paling murah untuk mulai.
2. **RAG (retrieval-augmented generation)** - **butuh Neural yang
   generasinya benar-benar koheren dulu** (bukan cuma `status().ready:
   true` - itu sudah tercapai sekarang, tapi koheren gramatikal belum),
   karena RAG = retrieval (sudah ada, `raget-retrieval/bm25.js` + poin 1
   di atas kalau mau upgrade ke semantic search) **digabung** generation
   yang koheren untuk merangkai potongan hasil retrieval jadi jawaban
   utuh. Tanpa generator yang koheren, "RAG" cuma jadi retrieval biasa
   yang sudah dilakukan `raget-retrieval/` + `agent.js` hari ini - tidak
   ada nilai tambah dari menyebutnya RAG.
3. **LoRA (fine-tuning ringan)** - **butuh Neural koheren dulu sebagai
   model dasar** - LoRA secara definisi menambah adapter kecil di atas
   bobot dasar yang sudah ada dan sudah berfungsi; tidak ada "dasar"
   untuk ditempeli LoRA selama generasi Neural masih acak. Urutan
   realistis: (a) Neural koheren gramatikal -> (b) kumpulkan data
   preferensi/gaya bahasa dari `raget-database`/`raget-memory` -> (c)
   baru LoRA di atas itu.

Urutan ketergantungan ringkas: **embedding lokal** (independen) →
**Neural koheren gramatikal** (prasyarat keduanya di bawah) → **RAG**
(butuh generator dari langkah sebelumnya) dan **LoRA** (butuh model
dasar dari langkah sebelumnya, sejajar dengan RAG, tidak saling
bergantung satu sama lain).
