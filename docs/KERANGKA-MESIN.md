# Kerangka mesin giliran

App AI lain tumbuh karena **satu jalur giliran**, bukan tumpukan tombol.
Rategoan memakai kerangka ini untuk setiap pesan.

```
intent → context → route → compose → qc → act
```

| Tahap | Isi | File |
|---|---|---|
| intent | definisi / daftar / prosedur / tool | `router-intent.js` |
| context | jawaban terakhir, file, memori | `turn-pipeline.js` |
| route | slide / file / web / tool / engine | `turn-pipeline.js` |
| compose | Template atau Neural | `engine-router.js` |
| qc | cuplikan, terkait, sitasi | `vault/web/web-qc.js` |
| act | unduh slide, chip lanjut, simpan | `composer.js`, `chat.js` |

Dua otak tetap milik Rategoan (`template`, `neural`). Fitur baru masuk
sebagai **route** atau **act**, bukan jalur ketiga yang menyelinap ke UI.

Pack K1 + perangkai (indeks on-device) menyusul di tahap `context`,
bukan di UI.
