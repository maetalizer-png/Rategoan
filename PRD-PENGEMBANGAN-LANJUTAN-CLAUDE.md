# PRD — Pengembangan Lanjutan RATEGOAN (dikerjakan & diselesaikan oleh Claude)

Status: **BERLAKU**. Ditulis 2026-09-01 berdasarkan audit langsung ke
kode, korpus, checkpoint, dan alat kualitas (lint/bench) — bukan asumsi.
Beda dengan `PRD-PERINTAH-GROK.md` (tugas yang PERLU akses luar sandbox),
dokumen ini khusus tugas yang **BISA dan HARUS dikerjakan Claude sendiri**
dari sandbox ini (kode, data yang sudah ada di repo, dokumentasi).

Setiap Fase punya **Definition of Done (DoD)** — jangan tandai selesai
kalau DoD belum terpenuhi semua.

---

## Fase 1 — Perbaiki alat kualitas yang diam-diam rusak

**Temuan langsung ronde ini**: `raget/raget-tools/run-bench.mjs` (gerbang
regresi 1190 kasus, target pass-rate >=97%) GAGAL TOTAL sebelum diperbaiki
— `submitGmail()` di `js/account/login.js` mewajibkan password >=4 karakter,
tapi skrip bench cuma mengisi email lalu langsung klik submit. Akibatnya
skrip macet permanen menunggu `#chat-input` yang tidak pernah muncul
(gerbang login tidak pernah lolos). **Ini sudah diperbaiki di commit
ronde ini** (isi juga `#login-password`) — tapi ini bukti nyata gerbang
kualitas proyek bisa diam-diam rusak tanpa terdeteksi kalau tidak
benar-benar dijalankan tiap ronde, bukan cuma diasumsikan masih jalan.

1. **Jalankan bench penuh 1190 kasus** (pakai `run-bench-chunked.mjs`
   supaya tidak kena batas proses ~23 menit), catat pass-rate CORE-SUITE
   nyata — bukan asumsi dari ronde lama.
2. Kalau ada kasus yang gagal, investigasi tiap kegagalan: apakah
   regresi kode nyata, atau bench yang perlu diperbarui (mis. selector
   UI berubah seperti kasus login di atas).
3. Tambahkan 1 baris di README atau CI note: "jalankan bench penuh
   sebelum klaim 'X% pass'" supaya tidak terulang.

**DoD**: pass-rate CORE-SUITE penuh 1190 kasus dilaporkan dengan angka
nyata (bukan dari sesi lama), semua kegagalan (kalau ada) sudah
diklasifikasi (bug kode vs bench usang) dan diperbaiki salah satunya.

---

## Fase 2 — Tuntaskan capaian token korpus ke gerbang 1 miliar

`raget/raget-data/jsonl/external/korpus-manifest-total.json` mencatat
**750.704.630 token gabungan** dari target **1.000.000.000** (kurang
249.295.370). Tapi audit ronde ini menemukan **~329 juta token korpus
bersih SUDAH ADA, sudah dibersihkan, sudah di-checksum** — cuma
tersangkut di branch `staging/korpus-parts` yang belum pernah di-merge
(lihat `PRD-PERINTAH-GROK.md` Bagian B). Kalau jilid 1/3/4/5 di situ
dipublikasikan (tugas Grok, di luar sandbox), gerbang 1 miliar token
kemungkinan **tercapai tanpa perlu panen data baru sama sekali** — cuma
perlu:

1. Setelah Grok publish (Fase 2 ini BLOCKED sampai `PRD-PERINTAH-GROK.md`
   Bagian B selesai) — update `korpus-manifest-total.json` dengan token
   count final dari jilid 1/3/4/5 yang sudah dipublikasi.
2. Verifikasi ulang `targetTercapai` jadi `true` kalau memang tercapai,
   atau hitung ulang `kekuranganToken` yang sebenarnya kalau belum.
3. Cek data `panen-madlad400-id` (80 juta kata approx, ~150.000 dokumen)
   — kalau lolos review kualitas Grok, ini token tambahan lagi di luar
   329 juta itu.

**DoD**: `korpus-manifest-total.json` mencerminkan token count NYATA
setelah publikasi jilid 1/3/4/5 + (opsional) madlad400-id, `targetTercapai`
dihitung ulang dengan jujur (true/false, bukan diasumsikan).

---

## Fase 3 — Neural checkpoint: dari "PPL turun" ke "generasi koheren"

Audit `training-report-massive100m-round8-colab-gpu.json` (ronde training
terbaru sebelum sesi ini): held-out perplexity turun signifikan tiap
ronde (1335.85 → 641.18 ronde lalu), TAPI sampel generasi masih berupa
rangkaian kata acak tidak gramatikal ("nama oleh " dan sama Kiai -,
mereka untuk budak hari adalah terus habitat..."). Ini **bukan kegagalan
training** — PPL yang turun konsisten membuktikan model memang belajar
sesuatu — tapi ~3000 step kumulatif untuk model 103 juta parameter di
korpus jutaan dokumen masih sangat dini (`fullEpochsCompleted: 0` di
setiap laporan sejauh ini, model belum pernah melihat seluruh korpus
satu putaran penuh).

1. **Ukur, jangan asumsikan, titik infleksi**: setelah tiap sesi
   training >=60 menit, catat bukan cuma PPL tapi juga: apakah sampel
   generasi mulai membentuk kata-kata gramatikal berurutan (subjek-
   predikat), meski maknanya masih salah. Ini sinyal lebih awal
   daripada "PPL sudah rendah" untuk tahu kapan model mulai "belajar
   bahasa" vs "belajar statistik kata".
2. Jalankan training lanjutan job besar (>=90 menit per sesi, berulang)
   sampai `fullEpochsCompleted` >=1 untuk model 100M, dengan korpus yang
   sudah diperbesar dari Fase 2.
3. Kalau setelah beberapa epoch penuh generasi TETAP acak (bukan cuma
   pelan membaik), itu temuan diagnostik penting — laporkan jujur
   (kemungkinan: batch size/learning rate/arsitektur perlu ditinjau
   ulang, bukan cuma "kurang step") alih-alih terus menaikkan step
   tanpa evaluasi akar masalah.
4. Setiap sesi training WAJIB menghasilkan laporan (`training-report-*.json`
   + entri devlog) — jangan biarkan sesi tanpa laporan seperti yang
   nyaris terjadi ronde ini.

**DoD**: minimal 1 checkpoint 100M mencapai `fullEpochsCompleted >= 1`
dengan laporan lengkap, DAN evaluasi kualitatif eksplisit (koheren/tidak)
tercatat di laporan — bukan cuma angka PPL.

---

## Fase 4 — Bersihkan utang dokumentasi (kontradiksi aktif)

Audit menemukan `docs/STATUS-KORPUS-LISENSI.md` (terakhir diperbarui
2026-08-26) masih menyebut tag lama `korpus-jilid-1-clean` dan
`korpus-train-seimbang-bersih-v1` sebagai "Release yang aktif" — padahal
`PRD-DATA-RELEASE.md` §6 (dokumen yang menang kalau ada konflik, sesuai
pernyataannya sendiri) sudah memigrasikan semuanya ke 3 tag kanonik
(`korpus-ensiklopedia-bersih`, `korpus-dialog-daerah-bersih`,
`korpus-pelengkap-bersih`) dan migrasi itu **sudah selesai** (dikonfirmasi
lewat `list_releases` API — 3 tag itu memang ada, tag lama sudah tidak
punya Release). Dokumen lain di `docs/` (`STATUS-FASE-A-A4.md`,
`STATUS-KORPUS-AMAN-RAPI.md`, `RENCANA-DATA-AMAN-200M-400M.md`,
`MIX-TRAINING-SEIMBANG.md`) kemungkinan besar juga sudah usang dengan
pola yang sama — **audit satu-satu, jangan hapus membabi buta.**

1. Untuk tiap file di `docs/`: baca isinya, bandingkan dengan kondisi
   Release/kode NYATA saat ini (bukan asumsi), putuskan: masih akurat
   (biarkan) / usang tapi bernilai sejarah (pindah ke
   `raget/raget-devlog/` sebagai arsip) / usang dan menyesatkan kalau
   dibaca orang baru (hapus).
2. Update `docs/STATUS-KORPUS-LISENSI.md` supaya cocok dengan realita
   3-tag-kanonik + (setelah Fase 2) jilid 1/3/4/5 + madlad400-id kalau
   sudah masuk kanonik.

**DoD**: tidak ada dokumen aktif di `docs/`/root yang menyebut tag/aturan
yang sudah terbukti berbeda dari kondisi Release nyata saat dicek via API.
(Ini tumpang tindih dengan tugas pembersihan root yang lebih luas — lihat
laporan kualitas ronde ini untuk daftar kandidat konkret per file.)

---

## Fase 5 — UI/UX: audit sistematis, bukan cuma reaktif

Dua ronde terakhir menemukan bug nyata lewat pengujian Playwright manual
per-halaman (default tema `light` yang salah, sidebar bocor di layar
login) — keduanya lolos dari lint/bench karena keduanya alat correctness
kode, bukan alat visual/UX. Pola "cari 1 bug per ronde secara ad-hoc"
sudah dua kali berhasil tapi tidak sistematis.

1. Buat 1 skrip Playwright screenshot-diff sederhana yang menjalankan
   seluruh alur utama (login → chat → kirim pesan → Koleksi → Pitutur →
   Pengaturan → logout) di 2 viewport x 2 tema x (opsional) 2 ukuran
   teks, simpan sebagai baseline PNG di scratchpad (bukan git — terlalu
   besar), supaya ronde berikutnya bisa diff otomatis alih-alih menebak
   halaman mana yang perlu dicek manual.
2. Jalankan alur itu, dokumentasikan temuan per halaman satu kali secara
   menyeluruh (bukan cuma layar yang kebetulan diuji).

**DoD**: skrip audit visual tersimpan di `raget/raget-tools/` (bukan
cuma di scratchpad sesi ini, supaya ronde depan bisa pakai ulang), minimal
1 kali dijalankan penuh dengan temuan didokumentasikan.

---

## Fase 6 — Putuskan nasib fitur yang sudah tidak aktif

Audit menemukan modul "Jelajah Dunia"/travel yang dulu dibangun lewat
banyak ronde (lihat riwayat `raget/raget-devlog/sejarah/10-travel-integrasi.js`
dan seterusnya) **tidak lagi ada** di `fitur/` maupun sidebar aplikasi
saat ini (`index.html` cuma punya Chat Baru/Koleksi/Pitutur). Ini mungkin
memang keputusan sadar konsolidasi — tapi tidak ada catatan eksplisit
KENAPA di devlog terbaru, jadi tidak jelas apakah ini disengaja atau
kehilangan yang tidak disadari.

1. Telusuri devlog/riwayat commit kapan & kenapa Jelajah Dunia dilepas
   dari sidebar (kalau memang disengaja).
2. Kalau disengaja: catat 1 entri devlog eksplisit ("Jelajah Dunia
   dinonaktifkan karena X") supaya tidak jadi pertanyaan lagi ronde
   depan, dan putuskan apakah kodenya (kalau masih ada di suatu tempat)
   perlu dihapus atau diarsipkan.
3. Kalau TIDAK disengaja (hilang saat refactor tanpa sadar): laporkan
   ke dirigen sebagai temuan, jangan langsung kembalikan tanpa
   konfirmasi (bisa jadi memang sengaja dipangkas demi fokus).

**DoD**: status Jelajah Dunia (aktif/sengaja nonaktif/hilang tanpa
sengaja) tercatat eksplisit satu kali di devlog, bukan jadi misteri
di kode.

---

## Urutan prioritas yang disarankan

1. **Fase 1** (bench rusak) — murah, cepat, langsung menaikkan
   kepercayaan ke semua klaim kualitas lain.
2. **Fase 4** (dokumentasi kontradiktif) — murah, cepat, mencegah
   keputusan salah di ronde depan yang baca `docs/` lama.
3. **Fase 6** (nasib Jelajah Dunia) — murah (investigasi), penting
   untuk kejelasan, tapi tidak mendesak.
4. **Fase 2** (token 1 miliar) — BLOCKED oleh Grok, tapi siapkan
   verifikasi manifest supaya begitu Grok selesai, Fase 2 langsung
   bisa dituntaskan tanpa jeda.
5. **Fase 5** (audit visual sistematis) — investasi alat, bayar di
   ronde-ronde depan.
6. **Fase 3** (neural ke arah koheren) — paling mahal (butuh banyak
   jam training berulang), jalankan paralel dengan fase lain karena
   background training tidak menghalangi kerja kode.
