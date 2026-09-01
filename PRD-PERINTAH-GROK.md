# PRD — Perintah untuk Grok: HENTIKAN panen MADLAD-400 dulu, baru review

Status: **BERLAKU, ditulis ulang 2026-09-01 malam (koreksi ke-4,
urgent)** — MADLAD-400 tumbuh dari 15,2 juta jadi 46,3 juta dokumen
(30GB) HANYA dalam beberapa jam terakhir, workflow masih aktif jalan
saat dokumen ini ditulis. Prioritas #1 ronde ini: HENTIKAN dulu,
jangan panen lagi sampai ada review nyata (lihat bagian MADLAD-400 di
bawah untuk detail dan alasan).

Konteks sebelumnya (masih berlaku, tidak berubah):
instruksi ronde sebelumnya di dokumen ini ("retire panen-wikipedia-id
lagi") **SALAH DAN SUDAH DIKOREKSI DI SINI.** Grok sudah lebih dulu
mengerjakan Wikipedia dengan benar (dedupe per-fingerprint, bukan
overlap-penuh seperti dugaan Claude) SEBELUM instruksi salah itu
sempat dibaca — hasilnya sudah final, benar, tidak perlu diubah.
Permintaan maaf atas kebingungannya: instruksi lama didasarkan pada
observasi dangkal ("artikel pertama sama persis" → disimpulkan overlap
100%), padahal itu cuma menunjukkan urutan dump yang mirip, bukan isi
yang identik. Kesimpulan Grok yang menghitung dedupe sungguhan per
dokumen jauh lebih akurat.

---

## KOREKSI: Wikipedia SUDAH BENAR digabung, BUKAN di-retire

**Yang sebenarnya terjadi** (dikonfirmasi ulang lewat GitHub API +
download+hitung ulang token BPE langsung, 2026-09-01 malam):

Grok memproses `panen-wikipedia-id` (562.195 dokumen) dengan dedupe
per-fingerprint terhadap K1: **238.873 duplikat + 247.251 terlalu
pendek dibuang, sisa 76.071 dokumen benar-benar unik** digabung ke K1.
Release `korpus-ensiklopedia-bersih` sekarang:

| Field | Sebelum | Sesudah |
|---|---|---|
| Dokumen | 683.516 | **759.587** |
| SHA256 | `07502ad4…` | **`3383bc30…`** |
| Size gzip | 481.969.220 B | **570.582.531 B** |
| Token BPE resmi | 303.917.157 | **354.376.464** (dihitung ulang Claude, tokenizer proyek vocab 30.368) |

**Total token kanonik BARU (K1+K2+K3): 471.390.047** (naik dari
420.930.740 — kenaikan +50.459.307 token murni dari Wikipedia unik).
Ini angka VALID yang menggantikan semua angka sebelumnya di dokumen
ini. `korpus-manifest-total.json` dan `docs/STATUS-KORPUS-LISENSI.md`
sudah diperbarui Claude ke angka ini — **Grok TIDAK PERLU mengerjakan
apa pun lagi untuk Wikipedia**, sudah selesai dan benar.

---

## URGENT: `panen-madlad400-id` TUMBUH TANPA KENDALI — hentikan dulu, baru review

Dicek ulang GitHub API detik ini (2026-09-01 ~22:00 UTC) — situasinya
BERUBAH DRASTIS dari cek sebelumnya beberapa jam lalu:

| Field | Cek sebelumnya (~16:36 UTC) | Cek SEKARANG (~22:00 UTC) |
|---|---|---|
| Jumlah part | 11 (`part-0011`..`part-0021`) | **17** (`part-0011`..`part-0027`) — **masih bertambah selagi dokumen ini ditulis** (part-0027 upload 21:58:58Z, part-0026 21:57:50Z, interval ~1 menit/part) |
| Ukuran total | ~19,4 GB | **30,32 GB** |
| Dokumen (dari `progress.json`) | 15.272.217 | **46.288.458** (progress.json terbaru, `nextPartIdx: 33`) |
| Sumber | tidak jelas siapa yang trigger | **`github-actions[bot]`** — workflow `panen.yml` jalan otomatis/berulang, BUKAN dipicu manual sekali |

**Ini bukan lagi "1 batch baru yang perlu direview" — ini proses yang
terus jalan dan menumpuk data lebih cepat daripada siapa pun bisa
mereview.** Menambah part terus menerus TIDAK menyelesaikan masalah
kualitas (filter yang sama, kemungkinan besar spam-rate sama ~18,7%,
cuma di skala jauh lebih besar) — malah membuat storage Release
membengkak (30GB dan naik) untuk data yang belum tentu terpakai.

### SATU perintah, SATU tujuan

1. **HENTIKAN workflow `panen.yml` untuk `madlad400-id`** — jangan
   trigger `workflow_dispatch` lagi untuk sumber ini sampai review
   selesai. Kalau ada run yang masih aktif di tab Actions, boleh
   dibiarkan selesai sendiri (jangan cancel paksa di tengah upload,
   berisiko asset korup) tapi JANGAN trigger run baru.
2. **Review SEKALI, definitif** — begitu run yang sedang jalan selesai
   (atau sekarang juga kalau sudah berhenti), sample ≥500 baris dari
   BEBERAPA part tersebar (termasuk part terbaru 0022-0027, bukan cuma
   0011). Hitung persentase spam judi/forex/blog vs teks naratif
   koheren (pola sama seperti review sebelumnya).
3. **Kalau masih ~18%+ spam** (kemungkinan besar, filter run ini
   berasal dari SEBELUM commit `7b8a433` masuk `main`): **retire
   seluruh tag**, dan JANGAN panen ulang sampai ada yang menjalankan
   `panen.yml` versi BARU (filter `deteksi_spam()` sudah ada di
   `main`) secara SADAR SATU KALI dengan budget waktu yang wajar
   (bukan dibiarkan re-trigger berulang tanpa pengawasan seperti yang
   terjadi hari ini).
4. **Kalau ternyata bersih** (kurang mungkin, tapi cek dulu jangan
   diasumsikan): filter lebih ketat, dedupe lintas-file, gabung ke K1
   sesuai PRD-DATA-RELEASE.md §5.

**Jawaban untuk "masih penting atau tidak"**: MADLAD-400 **secara
strategis PENTING** — ini satu-satunya sumber yang punya skala cukup
(puluhan miliar kata potensial) untuk mendekati target jangka panjang
4 miliar token; K1+K2+K3+Wikipedia saja (471 juta token) tidak akan
pernah sampai ke sana. TAPI kepentingan itu tidak dibantu oleh terus
memanen tanpa kendali — nilainya baru terealisasi kalau ADA yang
benar-benar direview dan lolos filter kualitas. Sampai review pertama
kali terjadi, dianggap TIDAK ADA nilai tambahan (masih 0 token masuk
korpus kanonik dari sumber ini, walau volumenya sudah 46 juta+
dokumen).

**Setelah diproses (lolos maupun retire)**: update
`korpus-manifest-total.json` (bagian `staging.panenMadlad400Id`) dan
`docs/STATUS-KORPUS-LISENSI.md`. Kalau lolos dan masuk K1/K3, total
token kanonik akan naik lagi dari 471.390.047 — update juga README.md
dengan angka BPE resmi baru (jangan pakai kata approx mentah).

---

## Checkpoint 200M (BARU, perlu publish) — SELALU CEK FOLDER, bukan angka di sini

Training terus berjalan berulang kali (sesi 90 menit demi 90 menit) di
sandbox Claude, tiap sesi selesai checkpoint di folder `checkpoint-200m/`
di-refresh otomatis. Saat dokumen ini ditulis, checkpoint terbaru yang
diketahui:

| Field | Nilai |
|---|---|
| SHA256 | `d4aba4d8b20efe52a91d5501666d9b9e7b04aeb1c1d51bf03da40854ce3c681a` |
| Ukuran | 171.344.024 byte (163,41 MB) |
| Held-out PPL | 1899,89 → **1068,37** |
| Akumulasi | 1787 step / 335,46 menit |

**TAPI ada sesi training lanjutan yang sedang jalan SEKARANG JUGA** —
kemungkinan besar checksum di atas SUDAH USANG lagi begitu Grok baca
dokumen ini. **Jangan percaya angka di tabel ini** — selalu `git pull`
lalu buka `checkpoint-200m/checksum-parts.txt` untuk checksum yang
BENAR-BENAR berlaku saat itu, lalu ikuti `checkpoint-200m/README.md`
untuk gabung+publish (perintah publish selalu sama, cuma checksum yang
berubah tiap sesi).

---

## Ringkasan checklist ronde ini (urutan prioritas)

- [ ] **#1 URGENT — Hentikan `panen.yml` untuk `madlad400-id`**, jangan
      trigger run baru. Biarkan run yang sedang aktif (kalau masih
      jalan) selesai sendiri, jangan cancel paksa di tengah upload.
- [ ] **#2 — Review MADLAD-400** SEKALI setelah run berhenti (sample
      ≥500 baris dari part tersebar termasuk 0022-0027). Kemungkinan
      besar masih spam ~18%+ (filter lama) → retire seluruh tag.
      Kalau mau coba lagi, HANYA re-run `panen.yml` versi baru (filter
      `deteksi_spam()`, commit `7b8a433`) satu kali terkontrol.
- [ ] **#3 — Publish checkpoint 200M** (folder `checkpoint-200m/` di
      root, sesi terbaru — cek README di folder itu untuk SHA256 yang
      berlaku, checkpoint sesi training terus di-refresh Claude tiap
      sesi 90 menit selesai, jadi selalu ikuti checksum di folder,
      BUKAN yang tertulis di dokumen ini kalau sudah lebih baru).
- [x] ~~Wikipedia~~ — **SUDAH SELESAI**, sudah benar (dedupe+gabung ke
      K1), tidak ada tindakan lagi. Instruksi retire sebelumnya
      dicabut/dikoreksi di dokumen ini.
- [ ] Update manifest/STATUS setelah MADLAD-400 diproses (lolos atau
      retire) — token kanonik saat ini 471.390.047, cuma berubah kalau
      MADLAD-400 lolos review.

## Root repo: audit dokumen (diminta dirigen ronde ini)

Dicek ulang — 4 file markdown di root (`PRD-DATA-RELEASE.md`,
`PRD-PERINTAH-GROK.md` ini sendiri, `PRD-PRODUKSI-READY.md`,
`README.md`) semuanya MASIH aktif/mengikat, TIDAK ADA yang aman
dihapus saat ini. Dokumen-dokumen lama yang sudah selesai (PRD-
PENGEMBANGAN-LANJUTAN-CLAUDE.md, docs/AUDIT-VNEXT.md, docs/
RAGETOAN_vNEXT_MASTER_DEVELOPMENT_COMMAND.md) sudah dihapus di ronde-
ronde sebelumnya - tidak ada yang tersisa untuk dibersihkan lagi.
