# PRD Grok Build — master hulu ke hilir

Berlaku **2026-09-20**. Ini perintah mengikat sesi Build.
Dokumen pagar tetap: `PRD-RELEASE.md`, `PRD-RAGET-NEURAL.md`, `PRD-RAGET-TEMPLATE.md`, `PRD-RAGET-CODING.md`, `PRD-MANUS-DATA-MENTAH.md`.

Satu gelombang = satu tujuan = satu artefak di git **atau** Release + laporan uji.
Jangan tanya di tengah. Jangan timpa rak setengah. Jangan pasang model pihak ketiga.

---

## 0. Keadaan nyata (jangan pakai angka lama)

| Pos | Nyata |
|---|---|
| K1 v6 | 968.515.547 BPE · 7.617.040 dokumen |
| K2 v5 | 4.375.251.274 BPE · QA regulasi **masih di sini** |
| K3 v9 | 11.451.168.271 BPE · 26 part |
| Total kanonik | **16.794.935.092** — lantai baru, jangan turun |
| Penampung teks | ~12,64 GB, sudah digabung ke K1/K3, file tetap |
| Staging extra | `id-hf-more-new-quality` ~89 GB mentah |
| Neural hidup | 50M PPL ~142 · 100M/200M undertrained |
| Aplikasi | sapaan dikunci di `b946a16`/`6a2649e`; retrieve masih dangkal |
| Coding | PRD ada; pack/bench belum |

---

## 1. Definisi QC (wajib sama di semua gelombang)

QC **bukan** pangkas token karena topik.

| Tingkat | Objek | Lulus jika |
|---|---|---|
| Hulu data | mentah → penampung | lisensi jelas, ID, ≥30 kata **atau** ≥8 baris kode, bukan nav/spam |
| Rak | K1/K2/K3 | peran benar; hukum di K3; sapaan di K2; wiki di K1 |
| Kalimat | dokumen rak | utuh, padat, bukan template 20× |
| Mesin | router/planner/neural | uji kasus nyata di §5 hijau |
| Hilir jawaban | chat PWA | sapaan ≠ FAQ; definisi = paragraf; sitasi hanya jika diminta |

Setiap gelombang wajib file `LAPORAN-QC-<gelombang>.json` berisi: kasus, hasil, SHA, apakah lantai BPE aman.

---

## 2. Peta perbaikan (wajib dikerjakan)

### A. Korpus
1. Pindah QA regulasi K2 → K3 (`dipindahRak` harus > 0).
2. QC sapaan K2 (parafrase) tanpa total 3 rak turun.
3. Saring ~89 GB `more-new-quality` ke penampung, lalu rak sesuai peran.
4. Sync git: `korpus-manifest-total.json` + `docs/STATUS-KORPUS-LISENSI.md`.
5. Jangan K4. Jangan hapus penampung. Jangan audio→jsonl.

### B. Aplikasi / kerangka
6. Intent sapaan/kabar/bantu tetap di depan retrieve (regresi tes §5.1).
7. Planner: tanpa judul “Yang saya tahu”; tanpa `(sumber: faq)` di chat biasa.
8. Definisi (`apa itu X`) = 1–3 paragraf dari hit yang **overlap** kata topik.
9. Web search: tanpa `target=_blank` mentah, tanpa URL kecuali user minta sumber.
10. Slide: ikon = pratinjau, bukan menyuntik perintah ke chat.

### C. Neural
11. Jangan naikkan parameter sebelum mix data cukup (rasio ~20 token/param).
12. 200M jangan dilatih dulu kalau PPL held-out memburuk.
13. GQA/RoPE/SwiGLU/RMSNorm = gelombang skala, bukan v1.

### D. Coding (lihat `PRD-CODING-KEPUTUSAN.md` + paket Claude)
14. **K4 disetujui:** tag `korpus-kode-bersih`. Staging `penampung-kode-2026-09`.
15. Cari data: The Stack JS permissive, MDN, Rosetta JS, repo sendiri, wikibooks ID.
16. C0–C1: intent + validator + sandbox JS + bench 20.
17. Tidak menanam Qwen-Coder / StarCoder sebagai otak.

---

## 3. Urutan gelombang (jangan dibalik)

| ID | Kerja | Artefak wajib | Uji lulus |
|---|---|---|---|
| G1 | Pindah hukum K2→K3 | K2 v6 + K3 v10 + `LAPORAN-PINDAH-HUKUM.json` | tag berubah; jumlah BPE ≥ lantai |
| G2 | QC K2 sapaan | `LAPORAN-QC-K2.json` + gzip bila berubah | 10 sapaan unik, bukan 10 salinan |
| G3 | Saring 89 GB | file `*-bersih` di penampung + antrian | sampel 100 baris: spam <5% |
| G4 | Gabung G3 ke rak | manifest rak + git STATUS | pemetaan §2.A |
| G5 | Regresi aplikasi §5 | `docs/STATUS-UJI-JAWABAN.md` | semua kasus §5.1–5.3 |
| G6 | Coding data+K4 | tag penampung-kode + K4 v1 | lisensi lolos; bukan model luar |
| G6b | Coding mesin C1 | router + validator + bench | ≥8/20 JS |
| G7 | Mix-train 50M opsional | laporan PPL + 10 generasi | PPL tidak naik; ID tetap |

Putus di tengah: publish hanya gelombang yang artefaknya utuh.

---

## 4. Data coding yang harus tertulis di laporan G6

Wikibooks pemrograman ID; cuplikan MDN + ringkas ID; kode repo sendiri;
The Stack permissive (MIT/BSD/Apache) JS/Python/HTML; pasangan komentar-ID.
Eval: MBPP/HumanEval (jangan campur latih jika lisensi sempit).
Dilarang: GitHub tanpa SPDX, minified, model luar.

---

## 5. Uji nyata (wajib, ketat)

Jalankan di lingkungan yang memuat `main` terkini. Catat prompt → output → lulus/gagal.

### 5.1 Sapaan (harus bukan FAQ/WA)
- `Selamat malam`
- `Bagaimana kabar anda`
- `Apakah bisa membantu saya`
- `Halo`

Gagal jika muncul “Yang saya tahu”, “ukuran teks”, “WhatsApp keluarga”.

### 5.2 Pengetahuan
- `Apa itu ilmu fisika` → paragraf definisi, bukan bullet FAQ
- `Siapa Yohanes Surya` → orang benar atau “belum yakin”, bukan kartu acak
- `hitung 12*8` → 96

### 5.3 Bukan retrieve
- `googling …` hanya jika user/toggle web
- slide tidak menyuntik teks ke bubble user

### 5.4 Coding (setelah G6)
- `Apa itu function di JavaScript`
- `Perbaiki: consle.log("a")`
- `Tulis fungsi jumlah(a,b) di Python`

---

## 6. Kriteria “Raget cerdas” (bukan slogan)

Cerdas di versi ini = **jawab sesuai niat + fakta padat + tidak mengarang kampus**.
Bukan = parameter 1B atau lolos semua HumanEval.

Pintu 1B hanya jika: korpus peran benar, lantai token aman, PPL 50M tidak rusak,
bench jawaban §5 hijau, pack kode hidup.

---

## Perintah pembuka

> Baca `PRD/PRD-GROK-BUILD.md` lalu pagar PRD lain.  
> Mulai G1. Lantai 16.794.935.092 jangan turun.  
> Tiap gelombang: artefak + laporan uji. Jangan model luar. Jangan K4.
