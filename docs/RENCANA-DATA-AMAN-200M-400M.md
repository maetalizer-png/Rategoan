# Rencana Data Aman untuk 200M → 300–400M

Diperbarui: 2026-08-26

## 1. Target token (acuan Chinchilla ~20 token/parameter)

| Model | Ideal dari nol | Target praktis Raget (lanjut training) | Keterangan |
|-------|----------------|----------------------------------------|------------|
| **200M** | ~4 miliar token | **0,8 – 2 miliar token** | Cukup untuk perbaikan koherensi + pengetahuan |
| **300M** | ~6 miliar token | **1,5 – 3 miliar token** | Perlu stok aman lebih besar |
| **400M** | ~8 miliar token | **2 – 4 miliar token** | Tahap berikutnya |

> Catatan: Ideal Chinchilla untuk training dari nol. Raget memakai **continued training** dari checkpoint, jadi target praktis lebih rendah tetap bermanfaat.

## 2. Stok aman saat ini (setelah pembersihan)

| Sumber | Estimasi | Status |
|--------|----------|--------|
| A1 Wikimedia clean | ~ratusan juta token (kompres ~480 MB) | Ada |
| A3 seimbang bersih | ~0,1 juta token | Ada |
| Own corpus + domain JSON | kecil | Ada |
| **Total kasar** | **jauh di bawah 1B token** | **Belum cukup untuk 200M “kenyang”** |

## 3. Sumber AMAN yang boleh digali (prioritas)

### Tier 1 — Paling aman & terbesar
1. **Dump resmi Wikimedia** (CC-BY-SA)
   - idwiki, idwikibooks, idwikisource, idwiktionary, idwikivoyage, idwikiquote
   - Plus wiki lokal: jv, su, min, ban, dll (CC-BY-SA)
   - Cara: unduh dari `dumps.wikimedia.org` → clean → dedupe → JSONL
2. **Wikidata teks / deskripsi** (CC0 / CC-BY)
3. **Domain publik Indonesia** (habis masa hak cipta) — sastra, naskah

### Tier 2 — Boleh dengan filter ketat
4. **Indo4B / SEACrowd** — packaging CC0, tapi isi campuran; **hanya ambil subset yang jelas terbuka** (Wikipedia-derived), jangan serap seluruhnya buta
5. **Leipzig** — ada bagian Wikipedia; skip bagian news/web jika tidak jelas

### Tier 3 — JANGAN
- OSCAR, CC-100, CulturaX, KoPI-CC, mC4, news crawl, OpenSubtitles
- KBBI resmi, konten berita media

## 4. Proporsi seimbang target (korpus training final)

| Komponen | Proporsi | Sumber |
|----------|----------|--------|
| Ensiklopedia / pengetahuan panjang | 50–60% | Wikimedia clean (A1 + dump baru) |
| Dialog + gaya Raget | 15–20% | A3 + perluasan sapaan/obrolan |
| Fakta pendek / wawasan | 10–15% | Domain JSON + Wikidata teks |
| Buku / naskah / pelajaran | 10–15% | Wikibooks + Wikisource + domain publik |

## 5. Tahapan pengisian stok

### Fase A — 200M (sekarang → 3 bulan)
- Target stok aman: **≥ 1 miliar token**
- Aksi:
  1. Unduh ulang dump Wikimedia terbaru (resmi)
  2. Proses full clean + dedupe → release **A4**
  3. Perluas A3 (dialog/fakta) 5–10× lipat
  4. Campur final: 60% A4/A1 + 40% dialog/fakta bersih

### Fase B — 300M
- Target stok aman: **≥ 2 miliar token**
- Tambah wiki lokal + Wikisource full + Wikidata teks

### Fase C — 400M
- Target stok aman: **≥ 3–4 miliar token**
- + domain publik + OER berlisensi CC-BY/CC-BY-SA saja

## 6. Aturan keras
- Setiap batch baru wajib `manifest.json` (token, SHA256, breakdown sumber, lisensi)
- Prefix Release: **A** = aman training
- Jangan naikkan volume dengan data abu-abu

## 7. Estimasi jujur
Mencapai 4B+ token **murni CC-BY-SA/Public Domain** untuk bahasa Indonesia **sulit** tanpa crawl web.  
Strategi Raget yang realistis:
- Maksimalkan Wikimedia + domain publik + data buatan sendiri
- Continuous training bertahap
- Kualitas data > mengejar volume berisiko
