# Keputusan dirigen — gerbang coding (2026-09-20)

Ini jawaban resmi atas `PRD-CODING-RAGET.md` §5. Grok Build **boleh eksekusi**.

| # | Pertanyaan | Keputusan |
|---|---|---|
| 1 | Rak ke-4? | **Ya.** Tag permanen `korpus-kode-bersih` (**K4**). Hanya kode. Bukan K1–K3. |
| 2 | Bahasa kode? | **JavaScript prioritas** (bisa diuji di sandbox). Python + HTML/CSS boleh masuk K4 sebagai pelengkap, tidak wajib diverifikasi jalan. |
| 3 | Checkpoint? | **Terpisah + lazy load.** Checkpoint kode tidak menimpa 50/100/200M bahasa. User yang tidak minta kode tidak wajib unduh. |
| 4 | Urutan? | **Paralel:** kumpulkan + saring data kode **sekarang**. Training kode (Tahap B) setelah pack K4 tersegel dan bench C1 hidup. Jangan tunda panen. |
| 5 | Retrain BPE? | **Belum untuk K1–K3.** Vocab 30.368 tetap untuk rak bahasa. Tokenizer kode = vocab **varian K4** saat Tahap B. Jangan hitung ulang 16,79 miliar dengan vocab baru di gelombang panen. |

Lantai K1+K2+K3 **16.794.935.092** tidak boleh turun karena kerja K4.
K4 tidak dijumlahkan ke lantai itu sampai tokenizer K4 resmi dan manifest K4 terbit.

## Yang Build kerjakan segera

1. Buat tag Release `penampung-kode-2026-09` (staging) lalu `korpus-kode-bersih` setelah saring.
2. Cari dan unduh sumber di `PRD-CODING-DATA.md` + daftar di bawah, filter lisensi.
3. C0–C1 mesin: router intent kode, `syntax-validator.js`, `tools-kode.js`, bench 20 soal JS.
4. Jangan pasang Qwen-Coder / StarCoder **berat model**. The Stack = **data**, bukan checkpoint luar.

## Sumber wajib dicari (urut)

1. The Stack / StarCoderData — subset **JavaScript** + lisensi MIT/Apache/BSD per file  
2. MDN Web Docs (JS/DOM) — CC BY-SA, atribusi  
3. Eloquent JavaScript — CC BY-NC; **tahan** jika produk dijual, catat di manifest  
4. Rosetta Code halaman JS — cek lisensi per halaman  
5. Kode repo Rategoan sendiri  
6. Wikibooks ID pemrograman (pelajaran → boleh mirror ringkas di K1, kode contoh ke K4)

You Don't Know JS: baca `LICENSE.txt` dulu; tanpa izin jelas = tahan.

Target volume arah SmallCoder tahap kode (~7,5 miliar token kode) = **arah**, bukan syarat publish K4 pertama. K4 v1 boleh mulai dari pack bersih ≥50–100 juta token JS tersaring + 200 entri SFT ID, lalu tumbuh.
