# Status Korpus & Lisensi — Rategoan

Diperbarui: 2026-09-20 (sinkron git G1+G2: K1 v6 / K2 v6 / K3 v10).
K4 v1 hidup terpisah, tidak di lantai 3 rak.

## Release hidup
| Tag | Isi |
|-----|-----|
| `korpus-ensiklopedia-bersih` | K1 v6 7.617.040 dokumen, gzip 1611.9 MB, SHA `31d6ccbf…` |
| `korpus-dialog-daerah-bersih` | K2 v6 807.558 dokumen, gzip 174.7 MB, SHA `29690c3b…` |
| `korpus-pelengkap-bersih` | K3 v10 85.774.410 dokumen, 28 part, gzip 10263 MB, SHA concat `4852018c…` |
| `checkpoint-100m` | 100M di GitHub Release |
| `checkpoint-200m` | arsip PPL 1068; **yang dipakai PWA** = HF `Maetalizer19/rategoan-neural` SHA `69daa21d…` PPL 932, CORS terkonfirmasi (`access-control-allow-origin: *`) |
| `prd-data-release` | riwayat aturan awal penyaringan korpus (sudah dilebur ke dokumen internal) |
| `penampung-tersaring-2026-09` | tetap utuh (~104 aset); sumber merge K1/K2/K3, bukan rak kanonik |
| `penampung-kode-2026-09` | staging G6, bukan rak kanonik, tidak masuk lantai 16,79 miliar |
| `korpus-kode-bersih` | **K4 v1** (dirigen 20 Sep). Kode JS/Python/HTML/CSS permissive. Token **tidak** dijumlahkan ke 16.794.935.092 |

## RETIRE — `panen-madlad400-id`

Sample 600 baris (part 0011/0018/0027): spam ketat 8,8%, 1 frasa spam
12,3%, navigasi blog 15,3%. Bukan mayoritas judi murni tapi mayoritas
bukan ensiklopedia — tidak lolos aturan saring korpus, tidak digabung ke K1,
tidak dihitung ke token kanonik. Workflow `panen.yml` sudah dihapus,
tidak akan dipanen ulang otomatis.

## Token
Angka BPE 3 rak setelah G1+G2: **16.794.935.124**
(K1 968.515.547 + K2 264.815.163 + K3 15.561.604.414).
Lantai gel4 **16.794.935.092 tidak turun** (+32 BPE sapaan G2).
K4 tidak dijumlahkan.

## OSCAR / 1p8b di K3
Yang masuk K3 v9 sudah tersaring di tag `penampung-tersaring-2026-09`
(PERINTAH LANJUT memetakan ke K3). Bukan crawl mentah MADLAD/OSCAR/mC4.
Tidak di-relitigasi.

## Dilarang
MADLAD / OSCAR mentah / mC4 / tag `panen-*` sebagai rak kanonik baru.
Workflow `panen.yml` sudah dihapus. Jangan hapus penampung teks.
K4 `korpus-kode-bersih` disetujui dirigen; jangan tuang kode ke K2;
jangan jumlahkan token K4 ke lantai tiga rak sampai tokenizer K4 resmi.

## Pintu data berikutnya
Dump `idwikibooks` / `idwikiquote` / `idwiktionary` + buku PD. Bukan HF crawl.
