# Status Korpus & Lisensi — Rategoan

Diperbarui: 2026-09-20 (sinkron dengan `korpus-manifest-total.json`
setelah K3 v9 / K1 v6 / K2 v5 digabung).

## Release hidup
| Tag | Isi |
|-----|-----|
| `korpus-ensiklopedia-bersih` | K1 v6 7.617.040 dokumen, gzip 1611.9 MB, SHA `31d6ccbf…` |
| `korpus-dialog-daerah-bersih` | K2 v5 20.356.387 dokumen, gzip 671.5 MB, SHA `63095c23…` |
| `korpus-pelengkap-bersih` | K3 v9 66.225.205 dokumen, 26 part XL, gzip 9767.3 MB, SHA concat `87fddf2e…` |
| `checkpoint-100m` | 100M di GitHub Release |
| `checkpoint-200m` | arsip PPL 1068; **yang dipakai PWA** = HF `Maetalizer19/rategoan-neural` SHA `69daa21d…` PPL 932, CORS terkonfirmasi (`access-control-allow-origin: *`) |
| `prd-data-release` | riwayat aturan awal penyaringan korpus (sudah dilebur ke dokumen internal) |
| `penampung-tersaring-2026-09` | tetap utuh (~104 aset); sumber merge K1/K2/K3, bukan rak kanonik |

## RETIRE — `panen-madlad400-id`

Sample 600 baris (part 0011/0018/0027): spam ketat 8,8%, 1 frasa spam
12,3%, navigasi blog 15,3%. Bukan mayoritas judi murni tapi mayoritas
bukan ensiklopedia — tidak lolos aturan saring korpus, tidak digabung ke K1,
tidak dihitung ke token kanonik. Workflow `panen.yml` sudah dihapus,
tidak akan dipanen ulang otomatis.

## Token
Angka BPE dicatat 2026-09-20 (lantai git + BPE dokumen baru): **16.794.935.092**
(K1 968.515.547 + K2 4.375.251.274 + K3 11.451.168.271).
Gerbang 1 miliar tercapai; target jangka panjang 4 miliar sudah terlewati.
Lantai git tidak turun: K1 459.594.014, K2 4.375.227.575, K3 388.817.480.

## OSCAR / 1p8b di K3
Yang masuk K3 v9 sudah tersaring di tag `penampung-tersaring-2026-09`
(PERINTAH LANJUT memetakan ke K3). Bukan crawl mentah MADLAD/OSCAR/mC4.
Tidak di-relitigasi.

## Dilarang
MADLAD / OSCAR mentah / mC4 / tag `panen-*` sebagai rak kanonik baru.
Workflow `panen.yml` sudah dihapus. Jangan hapus penampung. Jangan buat K4.

## Pintu data berikutnya
Dump `idwikibooks` / `idwikiquote` / `idwiktionary` + buku PD. Bukan HF crawl.
