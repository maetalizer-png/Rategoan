# Status uji jawaban Raget

Diisi Grok Build gelombang G5, 2026-09-20. Prompt nyata di `main`.

| ID | Prompt | Output ringkas | Lulus | SHA / commit |
|---|---|---|---|---|
| 5.1a | Selamat malam | Selamat malam juga! (bukan FAQ/WA) | YA | 7d9bb71 + G5 sync |
| 5.1b | Bagaimana kabar anda | Saya baik, terima kasih sudah nanya | YA | 7d9bb71 |
| 5.1c | Apakah bisa membantu saya | Siap, saya bantu. Ceritakan singkat keperluannya | YA | 7d9bb71 |
| 5.1d | Halo | Halo! Ada yang bisa saya bantu? | YA | 7d9bb71 |
| 5.2a | Apa itu ilmu fisika | Paragraf definisi materi/energi, bukan bullet FAQ | YA | stem-engine |
| 5.2b | Siapa Yohanes Surya | Yohanes Surya (Fisika) lahir 1963 Indonesia, Gasing | YA | tokoh.json |
| 5.2c | hitung 12*8 | 96 | YA | tools-math |
| 5.4a | Apa itu function di JavaScript | Penjelasan + fence function | YA | tools-kode |
| 5.4b | Perbaiki: consle.log("a") | console.log | YA | tools-kode |
| 5.4c | Tulis fungsi jumlah(a,b) di Python | def jumlah | YA | tools-kode |

## §5.3 Bukan retrieve

| ID | Kasus | Hasil | Lulus |
|---|---|---|---|
| 5.3 web | `googling …` | route web; tanpa `target=_blank` | YA |
| 5.3 sitasi | `(sumber: faq)` / “Yang saya tahu” | tidak muncul di chat biasa | YA |
| 5.3 slide | slide tidak menyuntik bubble user | route slide, bukan engine | YA |
| 5.3 chitchat | Halo vs hit FAQ | `planFallback` = null | YA |

Kriteria: `PRD/PRD-GROK-BUILD.md` §5.
Sapaan di `respondCore` sebelum `tryFactoid`. Bench: `raget/raget-tools/bench-g5.mjs` 14/14.
