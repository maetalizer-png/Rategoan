# PRD Coding — satu dokumen (K4 + mesin + data)

Ganti semua pecahan: `PRD-RAGET-CODING`, `PRD-CODING-RAGET`,
`PRD-CODING-ARSITEKTUR`, `PRD-CODING-DATA`, `PRD-CODING-KEPUTUSAN`.
Baca ini saja. Pagar rak bahasa tetap `PRD-RELEASE.md` + `PRD-GROK-BUILD.md`.

Dirigen 20 Sep: **K4 khusus data coding.** Tag `korpus-kode-bersih`.
Staging `penampung-kode-2026-09`. Bukan K1–K3.

---

## 1. Sudah selesai (jangan diulang)

| Item | Bukti |
|---|---|
| Gabung penampung teks → K1 v6 / K3 v9 | 20 Sep pagi |
| G1 hukum K2→K3 | K2 v6, K3 v10, `LAPORAN-PINDAH-HUKUM.json` |
| G2 QC sapaan K2 | `LAPORAN-QC-K2.json` |
| G5 uji chat | 13/13, commit `7d9bb71` / `d29e126` |
| C1 jalur kode tipis | router + pack + validator + bench `88853d6` |
| Tag K4 + penampung-kode | ada, **masih ~10 MB** — belum volume |

BPE bahasa sekarang:

| Rak | Versi | BPE |
|---|---|---:|
| K1 | v6 | 968.515.547 |
| K2 | v6 | 264.815.163 |
| K3 | v10 | 15.561.604.414 |
| Jumlah K1–K3 | | **16.794.935.124** (≥ lantai 16.794.935.092) |

---

## 2. Keputusan (terkunci)

- K4 = kode saja. Hukum/wiki/sapaan dilarang.
- JS prioritas (sandbox). Python/HTML boleh.
- Checkpoint kode terpisah, lazy load. Jangan timpa 50/100/200M.
- Panen data **sekarang**. Training kode belakangan.
- Vocab 30.368 K1–K3 jangan dirombak di gelombang ini.
- The Stack = **data**. Jangan pasang StarCoder/Qwen-Coder sebagai otak.

---

## 3. Yang belum (kerjakan tanpa jeda)

### P1 — isi K4 (utama)
Cari, saring, unggah ke `penampung-kode-2026-09` lalu gabung `korpus-kode-bersih`.

Sumber wajib, urut:
1. The Stack / StarCoderData — JS, lisensi MIT/Apache/BSD per file  
2. MDN Web Docs JS/DOM — CC BY-SA + atribusi  
3. Rosetta Code halaman JS — cek lisensi halaman  
4. Kode repo Rategoan sendiri  
5. Wikibooks ID pemrograman (pelajaran ringkas K1; cuplikan kode K4)  
6. Eloquent JS — CC BY-NC; **tahan** jika etalase berbayar  

YDKJS: baca LICENSE; tanpa izin = tahan.

Saring: buang minified, node_modules, tanpa SPDX, duplikat.
JSONL: `code`, `source`, `license`, `lang` (js/py/html).
K4 v1 lolos jika gzip bersih **≥ 200 MB** dan ≥ 50 ribu dokumen JS, plus SFT ID ≥ 200.
Arah jauh ~7,5 miliar token kode (SmallCoder) — **bukan** syarat v1.

### P2 — mesin (lanjut C1, jangan file dobel)
Sudah ada jalur tipis. Lanjutkan di file hidup:
`router-intent.js`, `tools-kode.js`, validator, `llm-sampler` constrained decode,
`vault/code/js-sandbox.js` jika belum. Bench ≥8/20 JS.

### P3 — G3 teks (sejajar, jangan nabrak K4)
Saring `id-hf-more-new-quality` ~89 GB ke penampung teks, bukan ke K4.

---

## 4. Aturan sesi Build

Satu sesi = P1 sampai ada gzip K4 ≥ 200 MB **atau** disk habis dengan laporan bagian yang sudah diunggah.
Jangan berhenti setelah baca PRD. Jangan buat PRD pecahan baru.
Tiap 1 sumber selesai: unggah part + baris laporan, lalu sumber berikutnya.

---

## 5. Perintah tempel

> Baca HANYA `PRD/PRD-CODING.md`. K4 khusus kode.  
> Isi `penampung-kode-2026-09` dari The Stack JS permissive + MDN + Rosetta + repo.  
> Gabung ke `korpus-kode-bersih` sampai ≥200 MB bersih.  
> Jangan model luar. Jangan sentuh lantai K1–K3. Jangan berhenti setelah baca.
