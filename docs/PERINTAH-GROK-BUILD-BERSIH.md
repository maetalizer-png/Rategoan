# Perintah Grok Build — bersihkan semua data mentah

Status: **BERLAKU**. Satu pekerjaan: mentah → JSONL bersih di penampung.  
Bukan pekerjaan masuk rak. Bukan pekerjaan UI.

Baca dulu: `PRD/PRD-RELEASE.md` §0–§5b, `PRD/PRD-MANUS-DATA-MENTAH.md`, `docs/SCENARIO-PROSES-MENTAH.md`.

Repo: `maetalizer-png/Rategoan`. Branch kerja: `main`.

---

## 0. Tujuan sesi ini

1. Semua tag staging mentah disaring jadi JSONL `{text,source,license,lang}` berbahasa Indonesia.
2. Hasil hanya di tag **`penampung-tersaring-2026-09`**.
3. **Jangan** upload ke `korpus-ensiklopedia-bersih` / `korpus-dialog-daerah-bersih` / `korpus-pelengkap-bersih`.
4. **Jangan** buat rak K4 atau tag `korpus-<nama>-bersih`.
5. Angka BPE resmi K1+K2+K3 **5.223.639.069** tidak diubah di sesi ini.

Selesai = setiap berkas payload staging punya pasangan `*-bersih.jsonl.gz` di penampung **atau** tercatat ditolak (alasan: audio / lisensi / pendek / non-id / spam) di `LAPORAN-ANTRIAN.json`.

---

## 1. Pagar (wajib, jangan dilanggar)

- Satu berkas mentah di disk pada satu waktu. Disk kerja ~19 GB; pecahan Indo4B 1,5 GB.
- Setelah saring + `gzip -t` lulus + upload penampung sukses: **hapus file mentah lokal**.
- Resume: daftar asset penampung dulu. Nama yang sudah ada **jangan dikerjakan ulang**.
- Filter teks (semua sumber):
  - field wajib: `text`, `source`, `license`, `lang` (`id` atau `id-*`)
  - buang `< 30` kata
  - buang non-Indonesia (minimal 2 kata tugas ID: yang/dan/di/ke/dari/adalah/untuk/pada/sebagai/dengan/dalam/…)
  - buang judul meta wiki (`Wikisumber:`, `Templat:`, `Kategori:`, …)
  - buang spam (`slot gacor`, `judi online`, …)
  - dedupe fingerprint SHA1 400 karakter ternormalisasi **di dalam berkas itu**
- Audio (`id-hf-safe-indonesian-audio-*`): **jangan** masuk penampung teks. Catat “bukan korpus teks”.
- OSCAR/Indo4B crawl: tetap disaring ketat, jangan ditolak massal hanya karena nama OSCAR. Yang gagal gerbang di atas dibuang per dokumen, bukan per tag.
- Tokenizer BPE / gabung ke K1–K3: **bukan** tugas perintah ini.

---

## 2. Tag sumber (mentah) vs tujuan

**Tujuan satu-satunya:** `penampung-tersaring-2026-09`  
Kalau tag belum ada, buat. Body: “Hasil saring. BUKAN rak K1/K2/K3.”

**Sumber mentah (kerjakan berurutan A→E):**

| Gelombang | Tag | Perkiraan | Keterangan |
|---|---|---|---|
| A | `id-hf-idx-prose-filtered-2026-09` | ~1,3 GB | 5 shard `idx_prose_shard_000N.jsonl.gz` |
| B | `id-hf-more-new-quality-2026-09` | sisa besar | agama csv, squad-nli 851 MB, dll. File kecil sebagian **sudah** bersih |
| C | `id-hf-quality-text-batch-2026-09` | ~4–6 GB | berita politik parquet + `Lyon28__Corpus-Indonesia__*.parquet` (7 file) |
| D | `id-wikisource-public-text-2026-09` | sudah | `wikisource-id-bersih.jsonl.gz` sudah di penampung — **skip** |
| E | `indo4b-wiki.part-000` dulu, baru pecahan lain | wiki ~554 MB | pecahan OSCAR/Plus/1.8B 1,5 GB: satu per siklus |
| Tahan | `id-hf-safe-indonesian-audio-*` | — | bukan teks |
| Stub | `id-training-data-manifest-2026-09` | — | bukan payload |

Sudah di penampung (jangan ulang):  
`wikisource-id-bersih.jsonl.gz`, `kesehatan-berita-bersih.jsonl.gz`, `hukum-qa-bersih.jsonl.gz`, `dialog-skenario-bersih.jsonl.gz`, `ringkasan-bersih.jsonl.gz`, `nli-bersih.jsonl.gz`, `mrc-nli-bersih.jsonl.gz`, `LAPORAN-BERSIH.json`.

---

## 3. Siklus satu berkas (ulang sampai antrian habis)

```
1. GET release penampung → himpun nama asset yang sudah ada.
2. Pilih 1 asset mentah berikutnya yang belum punya pasangan *-bersih.jsonl.gz.
3. Unduh lewat API:
   GET /repos/maetalizer-png/Rategoan/releases/assets/<id>
   header: Accept: application/octet-stream  + token
   (browser_download_url 404 di repo privat — jangan pakai itu).
4. Extract teks sesuai format (jsonl / jsonl.gz / csv / parquet / conllu / plain).
5. Saring §1 → tulis <nama>-bersih.jsonl.gz
6. gzip -t wajib lulus. Kalau putus di tengah, jangan upload.
7. Upload ke tag penampung (timpa nama yang sama hanya jika gzip lama rusak).
8. Tambah baris ke LAPORAN-ANTRIAN.json (masuk/lolos/buang/kata/sumber).
9. Upload ulang LAPORAN-ANTRIAN.json.
10. Hapus mentah + hasil lokal.
11. Lanjut berkas berikutnya. Jangan berhenti untuk tanya.
```

Nama file bersih: huruf kecil, strip, akhiran `-bersih.jsonl.gz`.  
Contoh: `idx-prose-0-bersih.jsonl.gz`, `indo4b-wiki-bersih.jsonl.gz`.

---

## 4. Urutan E (keluarga miliar token)

Kerjakan **berurutan ini**, jangan acak:

1. `indo4b-wiki.part-000`  
2. `indo4b-wikipedia-conllu.part-000`  
3. `Lyon28__Corpus-Indonesia` yang belum  
4. `id-corpus-1p8b-split` part-00 … part-03  
5. `indo4b-plus.part-000` … part-006  
6. `indo4b-conllu-all-uncased` part-000 …  
7. `indo4b-oscar-all-uncased` part-000 … terakhir  

Alasan: wiki dulu (pintu PRD), crawl/OSCAR terakhir (filter paling ketat, paling lambat).

---

## 5. Yang tidak dikerjakan Grok Build di perintah ini

- Publish / timpa K1 K2 K3  
- Hitung `totalTokenBPEResmi` rak  
- Hapus tag staging mentah (baru setelah dirigen bilang rak sudah menerima)  
- Pack on-device / perangkai / UI  
- OSCAR ditolak utuh tanpa saring per dokumen  

Setelah **semua** payload punya file bersih atau alasan tolak, berhenti dan tulis satu laporan: daftar file bersih + dokumen lolos + yang belum + SHA gzip tiap file bersih.

---

## 6. Laporan wajib di akhir

Isi `LAPORAN-ANTRIAN.json`:

```json
{
  "mode": "penampung-bukan-rak",
  "tagTujuan": "penampung-tersaring-2026-09",
  "rakKanonikDisentuh": false,
  "berkas": [
    {"mentah": "...", "bersih": "...", "masuk": 0, "lolos": 0, "pendek": 0, "bahasa": 0, "dup": 0, "spam": 0, "kata": 0}
  ]
}
```

Satu commit git hanya untuk dokumen ini + laporan ringkas di `docs/SCENARIO-PROSES-MENTAH.md`. Jangan commit file korpus ke git.

---

## 7. Perintah pembuka untuk Grok Build (salin apa adanya)

> Kerjakan `docs/PERINTAH-GROK-BUILD-BERSIH.md` sampai tuntas.  
> Jangan tanya di tengah. Jangan sentuh tag `korpus-*-bersih`.  
> Satu berkas per siklus. Resume dari asset yang sudah ada di `penampung-tersaring-2026-09`.  
> Laporan hanya setelah antrian A–E selesai atau disk/waktu habis — kalau habis, tulis pecahan terakhir yang lulus gzip + daftar sisa.  
> Jawaban keluar setelah kerja berhenti.

Itu seluruh perintah.
