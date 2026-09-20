# Status uji jawaban Raget

Diisi Grok Build pada gelombang G5, 2026-09-20. Prompt dijalankan lewat `llm-engine` / `stem-engine` / `tokoh-store` / `tools-math` / `planner` pada commit G5 (sapaan dipindah ke depan `tryFactoid`).

| ID | Prompt | Output ringkas | Lulus | SHA / commit |
|---|---|---|---|---|
| 5.1a | Selamat malam | Selamat malam juga! (Di sini masih siang, tapi tetap semangat ya) | lulus | G5 sapaan-sebelum-factoid |
| 5.1b | Bagaimana kabar anda | Saya baik, terima kasih sudah nanya! Kamu sendiri gimana kabarnya? | lulus | G5 sapaan-sebelum-factoid |
| 5.1c | Apakah bisa membantu saya | Siap, saya bantu. Ceritakan singkat keperluannya. | lulus | G5 sapaan-sebelum-factoid |
| 5.1d | Halo | Halo! Ada yang bisa saya bantu? | lulus | G5 sapaan-sebelum-factoid |
| 5.2a | Apa itu ilmu fisika | Dua paragraf definisi (materi/energi + cabang mekanika–kuantum). Bukan bullet FAQ. | lulus | G5 stem-engine |
| 5.2b | Siapa Yohanes Surya | Yohanes Surya (Fisika) — lahir 1963 di Indonesia. Gasing + olimpiade fisika. Bukan kartu acak. | lulus | G5 tokoh.json |
| 5.2c | hitung 12*8 | 12*8, hasilnya 96. | lulus | tools-math |

## §5.3 Bukan retrieve

| ID | Kasus | Hasil | Lulus |
|---|---|---|---|
| 5.3 web | `googling …` tanpa dump `target=_blank` | Grep agent/planner: tidak ada `target=_blank` | lulus |
| 5.3 sitasi | `(sumber: faq)` di chat biasa | Tidak ada di agent/planner; `cari()` tidak lagi memakai judul “Yang saya tahu” | lulus |
| 5.3 slide | slide tidak menyuntik teks ke bubble user | Tidak ada suntikan perintah slide di jalur chat G5 | lulus |
| 5.3 chitchat | `Halo` vs hit FAQ | `planner.planFallback` mengembalikan null (bukan retrieve) | lulus |

## Gate

- Gagal jika muncul “Yang saya tahu”, “ukuran teks”, “WhatsApp keluarga”: **tidak muncul** pada §5.1–5.2.
- Intent sapaan di `agent.js` sekarang **sebelum** `tryFactoid` / retrieve.
- Definisi (`apa itu X`) = 1–3 paragraf (`formatByType('definisi')` + `guardLength` definisi 900).
- Uji mesin: `node /tmp/rategoan-work/g5_uji.mjs` → 13/13 lulus.

Kriteria lulus: `PRD/PRD-GROK-BUILD.md` §5.
