# PRD — Raget Coding (kemampuan kode di atas mesin sendiri)

Status: **BERLAKU 2026-09-20**.  
Untuk Grok Build. Satu gelombang = satu artefak (file + laporan).

Baca dulu: `PRD-RAGET-NEURAL.md`, `PRD-RELEASE.md`, `docs/KERANGKA-MESIN.md`.

**Bukan** menyematkan Copilot / Qwen-Coder / CodeLlama ke dalam aplikasi.
Otak tetap `raget-neural/` milik RATEGOAN.

---

## 0. Putusan atas usulan Qwen

Tabel Qwen (GQA, RoPE, SwiGLU, RMSNorm, train-coding-model.py, …) itu
**arsitektur model besar**, bukan syarat “Raget bisa bantu ngoding”.

Yang sudah ada di repo:

| Komponen | File | Nyata |
|---|---|---|
| Attention kausal | `raget-neural/llm-attention.js` | MHA, belum GQA |
| Embedding + posisi | `llm-embedding.js` | ada; RoPE belum |
| FFN | `llm-transformer.js` | GELU + LayerNorm, bukan SwiGLU/RMSNorm |
| Tokenizer BPE 30.368 | `llm-tokenizer.js` + vocab checkpoint | khusus teks ID, miskin token kode |
| Inference JS | `llm-inference.js`, `neural-provider.js` | ada; KV-cache penuh belum |
| Training | `llm-trainer.js` + skrip torch/Colab existing | ada untuk 50/100/200M |
| Checkpoint hidup | Release `checkpoint-100m` / HF 200M | PPL masih tinggi |

Jangan buat file paralel `neural-inference.js` / `train-coding-model.py`
kalau fungsinya sudah ada. **Perluas file hidup.**

GQA / RoPE / SwiGLU / RMSNorm = gelombang **skala 1B**, setelah korpus
kode + ID cukup. Bukan gerbang pertama coding.

---

## 1. Target kemampuan (jujur)

Raget coding v1 **bukan** Copilot.

Lolos v1 kalau:

1. Intent `kode` / `jelaskan kode` / `perbaiki cuplikan` terdeteksi,
   tidak jatuh ke FAQ/sapaan.
2. Pertanyaan “apa itu function di JavaScript” dijawab paragraf + contoh
   pendek dari pack kode, bukan kartu WA.
3. Cuplikan ≤40 baris JS/Python/HTML bisa dijelaskan baris demi niat.
4. Lengkapi 1 fungsi kecil dari komentar (bench 20 soal, ≥8 lolos uji).
5. Tidak mengunduh model pihak ketiga.

Gagal v1: generate repo utuh, Rust/CUDA, “jadi Cursor”.

---

## 2. Kerangka mesin

```
intent (router)  →  context (pack kode + K1 istilah)
                 →  route  (tool kode | neural | template)
                 →  compose (contoh + penjelasan ID)
                 →  qc     (parse cuplikan, jangan HTML bocor)
                 →  act    (salin kode / bench)
```

Modul baru yang diizinkan (nama wajib, jangan dobel):

| Peran | File |
|---|---|
| Intent kode | perluas `raget-agents/router-intent.js` (`detectTool` → `kode`) |
| Pack retrieve | `raget-agents/tools-kode.js` |
| Grammar decode | perluas `raget-neural/llm-json-grammar.js` → mode `code_fence` |
| Parser cuplikan | `raget-neural/llm-code-parser.js` (JS/Py/HTML saja) |
| Bench | `raget-tools/bench-kode.mjs` + `bench-kode-cases.json` |
| Data | `raget-data/jsonl/kode/` (bukan folder `coding/` Qwen) |
| Validasi lisensi | `raget-tools/validate-kode-data.mjs` |

Training kode: perluas skrip torch **yang sudah ada**, mix 80% korpus ID
kanonik + 20% pack kode. Jangan latih dari nol hanya di kode (model
lupa bahasa Indonesia).

---

## 3. Data yang boleh dikumpulkan

Masuk **penampung-kode dulu**. Rak kanonik kode: **K4** `korpus-kode-bersih`
(disetujui dirigen 20 Sep). Pelajaran padat (wikibooks ID) ringkas boleh di K1;
badan kode ke K4. Jangan tuang kode ke K2.

### 3.1 Wajib (lisensi jelas)

| Sumber | Isi | Lisensi tipikal | Catatan |
|---|---|---|---|
| Wikibooks ID pemrograman | teks pelajaran | CC BY-SA | K1 |
| Dokumentasi MDN / Web (cuplikan pendek + ringkasan ID) | JS/HTML/CSS | CC BY-SA | tulis atribusi |
| Kode milik repo Rategoan sendiri | contoh nyata mesin | milik sendiri | SFT kecil |
| MBPP / HumanEval | soal uji | audit lisensi | **eval saja**, jangan campur latih kalau lisensi sempit |
| The Stack **permissive only** (MIT/BSD/Apache) bahasa JS, Python, HTML | kode mentah | filter SPDX | saring, dedupe, buang minified |
| Python/JS tutorial PD / teks resmi | pelajaran | PD atau CC | K1 jika padat |

### 3.2 Boleh setelah lolos saring

- CodeSearchNet (subset lisensi permissive)
- Soal + solusi pendek berbahasa Indonesia (buatan sendiri / CC)
- Komentar ID + badan kode (pasangan `teks` / `kode`)

### 3.3 Dilarang

- Repo GitHub tanpa filter lisensi
- Dump Copilot/ChatGPT
- Minified / node_modules / lockfile
- CSAM, malware, kunci API
- Menyematkan berat Qwen-Coder / DeepSeek-Coder ke PWA

Gerbang dokumen kode: bukan “30 kata” semata — lolos jika
`baris kode ≥ 8` ATAU `kata penjelasan ≥ 30`. Dedupe fingerprint.
Bahasa UI penjelasan diusahakan ID.

---

## 4. Urutan kerja Build

### Gelombang C0 — audit (laporan dulu)
Tulis `docs/STATUS-KODE.md`: file neural yang hidup, apa yang belum
(GQA/RoPE/KV), 10 contoh intent kode yang sekarang salah jawab.

### Gelombang C1 — jalur aplikasi
Router + `tools-kode.js` + pack JSONL awal (≥200 entri ID, milik sendiri
+ wikibooks). Bench 20 kasus. Tidak perlu GQA.

### Gelombang C2 — data
Panen sumber §3 ke tag Release `penampung-kode-2026-09` (tag baru
penampung, **bukan K4 korpus-*-bersih**). Saring → jsonl.gz.
Laporan jumlah file, lisensi, bahasa.

### Gelombang C3 — masuk rak
Wikibooks/pelajaran → K1 versi +1.
Kode + pasangan SFT → K3 versi +1.
Jangan tuang ke K2.
Total BPE tiga rak **≥ 16.794.935.092**.

### Gelombang C4 — mix-train (hanya jika C1 bench ≥8/20)
Mix 80/20 ke checkpoint 50M dulu (preseden PPL). Bandingkan PPL + bench
kode. 200M jangan diutak-atik dulu (PPL held-out sempat memburuk).

### Gelombang C5 — arsitektur skala (opsional, terpisah)
RoPE, RMSNorm, SwiGLU, GQA, KV-cache — PRD Neural, bukan syarat v1 coding.

---

## 5. Yang sudah dikerjakan Build (korpus, 20 Sep)

Bukan pekerjaan coding. Jangan diulang:

- K1 v6 968.515.547 BPE
- K2 v5 4.375.251.274 BPE (hukum masih di sini)
- K3 v9 11.451.168.271 BPE
- Total **16.794.935.092**
- Penampung teks 12,64 GB tetap utuh

Gelombang korpus tersisa (PRD rak 20 Sep) **sejajar**, jangan ditabrak:
pindah hukum K2→K3 tetap sah. Coding memakai tag penampung **terpisah**.

---

## 6. Kriteria selesai v1

- `tools-kode.js` + router hidup di `main`
- `raget-data/jsonl/kode/` ≥200 entri valid
- `bench-kode.mjs` ≥8/20
- `docs/STATUS-KODE.md` terisi
- Tidak ada berat model luar di repo/PWA
- Tag K4 `korpus-kode-bersih` boleh, setelah penampung tersaring
- Tidak menanam berat model coder luar

---

## Perintah pembuka Build

> Baca `PRD/PRD-RAGET-CODING.md`.  
> Jangan pasang model coder pihak ketiga.  
> Jangan mengarang file Qwen jika padanannya sudah ada di `raget-neural/`.  
> Mulai C0 audit + C1 jalur intent/pack/bench. Data ke `penampung-kode-2026-09`.  
> Jangan pangkas lantai 16.794.935.092. Jangan tuang kode ke K2.
