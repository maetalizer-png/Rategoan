# Status jalur kode Raget (C0 audit + C1)

Berlaku 2026-09-20. Otak tetap milik RATEGOAN. Tidak ada Qwen-Coder / StarCoder / Copilot.

## Neural yang hidup

| File | Nyata |
|---|---|
| `raget-neural/llm-attention.js` | MHA, belum GQA |
| `llm-embedding.js` | posisi ada; RoPE belum |
| `llm-transformer.js` | GELU + LayerNorm, bukan SwiGLU/RMSNorm |
| `llm-tokenizer.js` | BPE 30.368, miskin token kode |
| `llm-inference.js` | ada; KV-cache penuh belum |
| `llm-json-grammar.js` | JSON; mode `code_fence` belum |
| Checkpoint 50/100/200M | bahasa ID; PPL masih tinggi |

GQA / RoPE / SwiGLU / RMSNorm = gelombang skala, bukan v1 coding.

## C1 yang baru

| Peran | File |
|---|---|
| Intent `kode` | `raget-agents/router-intent.js` (sebelum `cara`/`fungsi`/`jelaskan`) |
| Pack + compose | `raget-agents/tools-kode.js` |
| QC kurung/fence | `raget-agents/syntax-validator.js` |
| Parser fence | `raget-neural/llm-code-parser.js` |
| Sandbox JS | `raget/vault/code/js-sandbox.js` |
| Pack ≥200 | `raget-data/jsonl/kode/pack-v1.jsonl` |
| Bench 20 | `raget-tools/bench-kode.mjs` |
| Validasi lisensi | `raget-tools/validate-kode-data.mjs` |

## 10 prompt yang dulu salah jalur

| Prompt | Dulu | Sekarang |
|---|---|---|
| Apa itu function di JavaScript | `jelaskan` / FAQ | `kode` |
| Perbaiki: consle.log("a") | sapaan/retrieve | `kode` |
| Tulis fungsi jumlah(a,b) di Python | `fungsi` | `kode` |
| Buatkan kode palindrome JavaScript | `ide`/`cara` | `kode` |
| Jelaskan cuplikan: const x = a.map | `jelaskan` | `kode` |
| async await fetch JSON | retrieve dangkal | `kode` |
| HTML form input nama | `jelaskan` | `kode` |
| CSS box model | `jelaskan` | `kode` |
| Selamat malam | — | sapaan (bukan kode) |
| Apa fungsi jantung | `fungsi` | `fungsi` (bukan kode) |

## Pagar

- K4 tag `korpus-kode-bersih` setelah penampung `penampung-kode-2026-09` tersaring.
- Token K4 tidak dijumlahkan ke lantai 16.794.935.092.
- Jangan tuang kode ke K2.
- Jangan retrain BPE K1–K3 di gelombang ini.
