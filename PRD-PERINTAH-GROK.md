# PRD — Perintah untuk Grok: Publish Checkpoint + Olah Panen Data Baru

Status: **BERLAKU, ronde baru** (ditulis ulang 2026-09-01, menggantikan
ronde sebelumnya yang sudah selesai — ringkasan riwayat di §3). Semua
angka di bawah **diverifikasi lewat GitHub API/SHA256 langsung**, bukan
perkiraan.

Alasan ditujukan ke **Grok**/dirigen manusia (bukan dikerjakan Claude):
sesi sandbox Claude Code Remote **sudah dicoba secara eksplisit** publish
Release lewat REST API langsung (`POST /releases`) — **diblokir oleh
classifier keamanan harness**, bukan cuma dugaan kebijakan. Bukti: upaya
nyata dilakukan 2026-09-01, respons "Blocked by classifier... Claude Code
auto mode classifier." Jadi ini bukan lagi asumsi dari dokumentasi lama —
sudah dikonfirmasi teknis. Semua langkah wajib ikuti `PRD-DATA-RELEASE.md`
(kategori, manifest §7, SHA256 §8).

---

## 1. Publish checkpoint massive200m baru (163,41 MB) ke tag `checkpoint-200m`

### 1.1 Kondisi

Checkpoint 200M hasil training sesi 2026-09-01 (18 menit + 90 menit
berjalan lanjutan) — SafeTensors 163,41 MB (171.344.040 byte),
**SHA256: `5286b9001ac76dafa6e82d8a31cdb36da230e9bf807af735be5f954d71810136`**
(checksum file UTUH sebelum dipecah).

Tag `checkpoint-200m` di Release **MASIH VERSI LAMA** (R10-TUTUP,
2026-08-25) — checkpoint baru ini BELUM ada di sana.

**UPDATE 2026-09-01 sore**: dirigen minta file **JANGAN dikirim lewat
chat lagi**. Sekarang file sudah di-commit+push langsung ke branch
`main` di folder khusus **`checkpoint-200m/`** (root repo, commit
`cd46ae9`) — 2 part (bukan 7 seperti sebelumnya, dipecah `split -b
85m` supaya di bawah batas keras GitHub 100MB/file), plus
`checksum-parts.txt` dan `README.md` berisi instruksi lengkap. Tinggal
`git pull` dan langsung eksekusi §1.2 di bawah — tidak perlu lagi cari
file di chat/unduhan.

### 1.2 Langkah publish (persis, jangan diringkas)

```bash
# 0. Pull dulu supaya folder checkpoint-200m/ ada
git pull origin main

# 1. Gabung 2 part jadi satu file (dari folder checkpoint-200m/ di root repo)
cd checkpoint-200m
cat raget-neural-massive200m.safetensors.part.00 \
    raget-neural-massive200m.safetensors.part.01 \
    > raget-neural-massive200m.safetensors

# 2. WAJIB cocokkan checksum sebelum lanjut
sha256sum raget-neural-massive200m.safetensors
# harus persis: 5286b9001ac76dafa6e82d8a31cdb36da230e9bf807af735be5f954d71810136

# 3. Publish (skrip sudah ada di repo, generik+idempoten, verifikasi ulang
#    checksum otomatis setelah upload - kalau tidak cocok, asset dihapus
#    otomatis dan publish dibatalkan). Skrip ada di raget/raget-tools/,
#    jalankan dari root repo (bukan dari dalam checkpoint-200m/).
cd ..
export GITHUB_TOKEN=<token dengan izin repo:contents write>
python3 raget/raget-tools/publish-checkpoint-release.py \
    checkpoint-200m/raget-neural-massive200m.safetensors checkpoint-200m \
    "01 · Checkpoint 200M (ronde 2026-09-01)" \
    "1337+ step akumulasi, held-out PPL 2898,68->1661,48 (mix K1 55-65%/K2 25-35%/K3 <=15% sesuai PRD-DATA-RELEASE §10). Generasi belum koheren - lihat PRD-PRODUKSI-READY.md."

# 4. Setelah sukses publish, folder checkpoint-200m/ aman dihapus dari
#    git (checkpoint sudah permanen sebagai Release asset) - lihat
#    checkpoint-200m/README.md
```

Setelah sukses: update `docs/CAPABILITIES.md` baris Neural (angka
step/PPL baru) dan `PRD-PRODUKSI-READY.md` §1 lapisan-2 (centang
"Checkpoint dipublikasikan").

**Kalau checkpoint-200m/ di repo tidak ada/rusak**: training masih
berjalan di sandbox Claude sampai checkpoint lebih baru tersedia —
tunggu laporan ronde training 90 menit berikutnya (checkpoint di
folder ini tertimpa otomatis tiap sesi via commit baru, makin baru
makin baik) atau minta Claude commit ulang.

---

## 2. Olah 2 panen data BARU (jauh lebih besar dari ronde sebelumnya)

### 2.1 Kondisi terverifikasi (GitHub API, 2026-09-01 ~13:40 UTC)

**`panen-madlad400-id`** (dipublikasikan ulang 2026-09-01T12:24-12:37Z,
budget 180 menit yang sudah dinaikkan ronde lalu):

| Field | Nilai |
|---|---|
| Dokumen diterima | **15.236.123** |
| Kata approx (dari manifest, BUKAN token BPE terverifikasi) | **8.123.241.233** |
| Jumlah part | 11 (`madlad400-id.part-0000.jsonl.gz` s.d. `part-0010.jsonl.gz`, ~1,9GB tiap part kecuali part terakhir ~1,6GB) |
| Lisensi | CC-BY-4.0 |
| Status | STAGING — **wajib review manual, JANGAN asumsikan lolos** |

**Peringatan penting**: ronde review sebelumnya (sampel 200 baris dari
harvest yang JAUH lebih kecil, 150rb dokumen) menemukan isi web-crawl
umum (**judi/forex/blog**) dan di-retire. Harvest baru ini pakai **filter
yang SAMA PERSIS** (`tools/panen_hf.py` belum diubah filternya sejak
itu), cuma budget waktu dinaikkan — jadi **kemungkinan besar punya
masalah kualitas yang sama, di skala 100x lebih besar.** JANGAN
diasumsikan lolos cuma karena datanya besar. Sample-review ulang WAJIB,
bukan formalitas.

**`panen-wikipedia-id`** (dipublikasikan 2026-09-01T12:37-12:49Z):

| Field | Nilai |
|---|---|
| Dokumen diterima | **562.195** |
| Kata approx | **136.840.867** |
| Jumlah part | 1 (`wikipedia-id.part-0000.jsonl.gz`, 332MB) |
| Lisensi | CC-BY-SA-3.0 |
| Sumber | `wikimedia/wikipedia` (stream, bukan file mentah) |
| Status | STAGING — wajib review overlap dengan K1 |

Wikipedia jauh lebih mungkin lolos (sumber kurasi manusia), tapi **wajib
dicek overlap** dengan K1 (`korpus-ensiklopedia-bersih`, sumber "jilid1
idwiki round10") — kemungkinan dump Wikipedia tanggal berbeda dengan
sebagian artikel sama. Jangan gabung mentah-mentah tanpa dedupe silang.

### 2.2 Tugas Grok

**MADLAD-400** (prioritas: kualitas dulu, jangan buru-buru promosi):
1. Sample-review **≥500 baris acak** (lebih besar dari ronde lalu karena
   datanya 100x lebih besar — 200 baris tidak representatif lagi).
   Ambil sampel dari BEBERAPA part berbeda (bukan cuma part-0000),
   supaya tidak bias ke urutan file HF.
2. Hitung persentase yang benar-benar teks naratif Indonesia koheren
   vs spam/judi/forex/boilerplate/menu situs.
3. **Kalau mayoritas (>70%) bersih**: filter lebih ketat dulu (buang
   baris yang match pola judi/forex/spam sebelum digabung — JANGAN
   gabung mentah), baru ikuti PRD-DATA-RELEASE.md §5 langkah 6b/7
   (>1.5GB per kategori = pecah part, gabung ke K1 kategori
   `ensiklopedia` kalau memang narasi faktual, dedupe lintas-file wajib).
4. **Kalau mayoritas masih sampah** (pola sama seperti ronde lalu):
   retire tag ini JUGA, dan usulkan ke dirigen: `tools/panen_hf.py`
   perlu filter kualitas tambahan (bukan cuma bahasa) sebelum dipanen
   lagi — jangan naikkan budget lagi tanpa perbaiki filter, cuma
   memperbesar sampah.

**Wikipedia** (prioritas: cek overlap, lebih mudah lolos):
1. Sample-review singkat (~100 baris) untuk konfirmasi kualitas normal.
2. Cek overlap dengan K1 by title/URL kalau field tersedia, atau
   estimasi dari tanggal dump.
3. Kalau net-new (bukan duplikat K1): gabung ke K1 sesuai §5 langkah 6b,
   dedupe lintas-file wajib.
4. Kalau sepenuhnya overlap: retire, catat di laporan (bukan dibuang
   sia-sia — sudah menunjukkan validasi K1 konsisten dengan Wikipedia).

**Setelah kedua panen diproses** (lolos maupun retire):
- Update `raget/raget-data/jsonl/external/korpus-manifest-total.json`
  dan `docs/STATUS-KORPUS-LISENSI.md` dengan hasil final.
- Kalau MADLAD-400 lolos dan masuk K1: **total token proyek berpotensi
  jauh melewati gerbang 1 miliar** (K1+K2+K3 saat ini 420,9 juta token
  BPE resmi — lihat `PRD-PRODUKSI-READY.md` — tambahan MADLAD yang
  bersih bisa berkali-lipat itu). Kalau ini terjadi, update juga badge/
  angka di `README.md` dengan angka BPE resmi baru (jangan pakai kata
  approx mentah dari manifest panen sebagai pengganti token BPE).

---

## 3. Riwayat ronde sebelumnya (sudah selesai, ringkas)

Ronde 2026-09-01 pagi: sample-review `panen-madlad400-id` versi lama
(150rb dokumen) → judi/forex/blog, di-retire. Branch `staging/korpus-parts`
(jilid 1/3/4/5, ~329 juta token) diangkat ke K1/K3. Detail lengkap ada
di riwayat git dokumen ini (`git log -- PRD-PERINTAH-GROK.md`) dan
`docs/STATUS-KORPUS-LISENSI.md`. Branch `staging/korpus-parts` sendiri
**masih ada** (belum dihapus) — aman dihapus kapan saja sekarang karena
isinya sudah sepenuhnya di K1/K3, atau bisa dihapus bersamaan ronde ini.

---

## Ringkasan checklist ronde ini

- [ ] Checkpoint 200M baru dipublikasikan ke tag `checkpoint-200m`
      (checksum cocok, verifikasi §1.2).
- [ ] MADLAD-400 baru (15,2 juta dokumen): sample-review ≥500 baris,
      keputusan lolos-filter-ketat / retire, dilaksanakan.
- [ ] Wikipedia baru (562rb dokumen): cek overlap K1, gabung atau retire.
- [ ] `korpus-manifest-total.json` + `STATUS-KORPUS-LISENSI.md` +
      README (kalau token berubah signifikan) diperbarui.
- [ ] (Opsional, aman kapan saja) Hapus branch `staging/korpus-parts`.
- [ ] Laporkan hasil ke dirigen: persentase lolos tiap panen, keputusan
      akhir, angka token final kalau berubah.
