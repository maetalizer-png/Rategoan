# Sejarah pengembangan Pitutur

Dokumen ini merangkum seluruh percakapan dan keputusan desain dari awal hingga tahap korpus/weight Raget. Tujuan: konteks lengkap untuk lanjutan kerja (manusia, Claude, atau Raget yang sudah berbobot).

---

## 1. Identitas produk

| Item | Isi |
|------|-----|
| Nama | Pitutur |
| Peran | Studio siaran audio bergaya radio |
| Induk | Rategoan (belum digabung penuh; dikerjakan terpisah) |
| AI | Tidak memakai LLM di dalam modul. Naskah dari rule + dataries + materi user |
| Persona | Warta (kabar), Tanya (uji), Kisah (makna) |
| Mode | Monolog · Dialog · Diskusi |
| Stack | PWA murni HTML/CSS/JS ES modules, tanpa build step |
| Offline | Service Worker + IndexedDB (notebook) |

Pitutur = ruang siaran. Raget = otak chat induk. Saat digabung: AI Raget tetap di induk; di Pitutur “di kurung” (tidak generate bebas tiap baris).

---

## 2. Alur kerja pengguna (stabil)

```
Sumber → Susun Naskah → Putar
```

1. **Sumber**
   - Pustaka: saluran (Warta Hari Ini, Kisah Tokoh, …) + Dataries / Koleksi / Devlog + topik opsional
   - Materi saya: satu panel (Teks / URL / File), simpan ke notebook lokal
2. **Susun Naskah** — pecah materi, bangun dialog persona, terjemahan bahasa
3. **Putar** — Web Speech API multi-persona, highlight kata, kontrol rate/jeda/stop

Sheets: Sumber · Susun · Putar · Kendali · Riwayat · Mode.

---

## 3. Struktur kode (arah production)

```
Pitutur/
├── index.html
├── sw.js
├── manifest.webmanifest
├── css/
│   ├── main.css
│   └── modules/          (tokens, base, header, sheet, kontrol, panggung, …)
├── js/
│   ├── pitutur-main.js
│   ├── pitutur-namespace.js
│   ├── pitutur-i18n.js
│   ├── core/             state
│   ├── naskah/           script, chunk, retrieve
│   ├── audio/            voice, session
│   ├── notebook/         IndexedDB store
│   ├── translate/        kamus + kalimat per bahasa
│   └── …
├── raget-dataries/       salinan lokal (nanti path ke induk)
└── docs/
```

Aturan yang disepakati:
- Kode bersih, siap produksi
- Tanpa komentar generik AI, tanpa label versi v1/v2 di UI
- File JS berawalan `pitutur-` kecuali folder yang disepakati (dataries, translate)
- Namespace tunggal ES6, selaras pola Rategoan (`window.RG` / `Rategoan.Pitutur`)

---

## 4. Timeline isu dan perbaikan (dari percakapan)

### 4.1 UI Sumber & Materi
- Panel bertumpuk, user bingung → disederhanakan ke Pustaka | Materi saya
- Materi: satu panel mode Teks / URL / File (bukan banyak panel terpisah)
- Kolom topik dan tempel teks: background putih (bukan cream)
- Chip saluran / Dataries / Koleksi / Devlog: gaya card seragam, tanpa border hitam kasar
- Tombol Susun Naskah: ukuran dan warna diselaraskan
- Dokumen sebagai label “materi user” — hapus tab Dokumen terpisah yang membingungkan

### 4.2 Kendali & playback
- Suara persona berantakan → dirapikan
- Tombol Putar / Stop / Jeda sempat hilang saat mulai → dikembalikan
- Mode Monolog / Dialog / Diskusi di bottom bar

### 4.3 Highlight (warna coklat) vs suara
- Highlight kadang lebih cepat / lambat dari bicara
- Kadang loncat ke akhir kalimat lalu macet
- Perbaikan: ticker dibatasi ke panjang kalimat yang sedang diucapkan (`panjangKalimat`), estimasi durasi berbasis teks ucapan, progress time-based
- Naskah tampil penuh saat putar (bukan caption loncat saja); baris aktif di-highlight
- Masih area sensitif antar-perangkat (tempo TTS OS)

### 4.4 Kualitas dialog / naskah
Masalah berulang yang dilaporkan user:
- Terasa baca teks / flat
- Frasa formulaik: “Fokus ke X dulu”, “Sip”, “Oke dilanjut”, pertanyaan Tanya berulang
- Angka terpotong di ringkas fakta
- Double chip “rujukan”
- Pembuka tanpa tanggal di teks padahal disebut
- Naskah seluruhnya muncul sekaligus (bukan mengikuti bicara) — dibedakan: full naskah di panel vs highlight progresif

Arah perbaikan:
- Variasi anggukan Tanya, jembatan Warta, tutup dialog
- Hindari echo materi mentah
- `naturalisasiLisan` untuk ID
- Ringkas fakta tanpa memotong desimal/angka penting

### 4.5 Materi user & ekstraksi
- URL YouTube gagal CORS — batasan browser; transkrip harus tempel manual
- Tempel HTML membawa menu/nav/timestamp (`0.040 detik`) → `bersihkanTeksMateri` / filter noise
- Ekstrak dokumen terbatas dulu, lalu memadai untuk teks/PDF sederhana
- Chunking cerdas untuk materi panjang (siaran bertahap)

### 4.6 Multibahasa
- Setting English tetap keluar hybrid ID/EN atau sisa kata Indonesia
- Jawa campur ID
- Perbaikan: `negaraTemplate`, `parseCountry`, `rapikanEn`, kamus frasa panjang, `kalimat/jv.js` + `kamus/jv.js` diperluas
- Residual filter per bahasa
- Bahasa lain (Sunda, dll.) cakupan kamus masih tipis

### 4.7 Warna & desain token
- Inkonsistensi hitam / cokelat / cream antar halaman
- Border chip tidak seragam
- Sistem token: `--bg` putih utama, `--cream` pendukung, `--card`, `--line`, `--brown`/`--caramel`
- Fokus input: ring lembut, bukan border hitam tebal

---

## 5. Relasi dengan Rategoan / Raget

### Yang sudah dipelajari dari repo/zip Rategoan
- PWA chat local-first; Raget = rule/template (+ neural eksperimental)
- Pintu AI tunggal: `js/ai/ai.js` → neural opt-in → `agent.respond`
- Dataries lazy per region; retrieval TF-IDF
- Namespace `window.RG`
- Travel/Jalanin = PWA anak terpisah (pola yang Pitutur bisa ikuti)
- Vault: PDF, OCR, translate, reminders
- Arah terbaru (info user): **semua data masuk korpus dan dijadikan weight** — Raget naik dari murni template ke model berbobot dari korpus sendiri

### Kebijakan kerja (disepakati user)
| Area | Status |
|------|--------|
| Pitutur standalone | Fokus pengembangan aktif |
| Integrasi ke Rategoan | Ditunda; boleh dikerjakan Claude |
| Travel / Jelajah Dunia | Terpisah nanti; UI masih kurang |
| Pakai Raget untuk generate tiap baris siaran | Tidak; AI di Pitutur “di kurung” |

### Saat integrasi nanti
1. Path dataries ke induk (hapus duplikasi bila perlu)
2. Entry drawer / route ke Pitutur
3. Opsional: Raget bantu **Susun Naskah** (satu kali generate outline), bukan TTS per kalimat
4. Namespace `Rategoan.Pitutur` / `RG.pitutur`
5. SW: precache path pitutur atau SW anak seperti travel

---

## 6. API embed (sudah diarahkan)

```js
Rategoan.Pitutur.status()
Rategoan.Pitutur.loadSource({ title, text })
Rategoan.Pitutur.play()
```

Detail: `docs/EMBED.md`.

---

## 7. Skenario produk yang dikejar

Mirip konsumsi NotebookLM, tapi offline-first dan berpersona radio:

1. User bawa materi (pustaka atau tempel)
2. Pilih mode bicara
3. Dengar siaran yang terasa diskusi, bukan robot baca PDF
4. Bisa lanjut sesi, riwayat, streak ringan
5. Multi-bahasa untuk saluran fakta (minimal ID + EN; JV ditingkatkan)

Skenario struktur lanjutan: lihat `docs/SKENARIO_LANJUTAN.md`, `docs/SKENARIO_KUALITAS.md`.

---

## 8. Utang teknis / prioritas berikutnya

1. **Dialog natural** — kurangi template; lebih variasi kontekstual per chunk
2. **Highlight sync** — kalibrasi per rate TTS / perangkat
3. **i18n** — EN dan JV bersih; bahasa lain bertahap
4. **Materi panjang** — chunk + “siaran berikutnya” tanpa putus makna
5. **URL/CORS** — dokumentasikan batas; opsi tempel transkrip
6. **Kualitas suara** — mapping voice persona stabil di Android/iOS
7. **Tes regresi** — skrip negara ASEAN + materi tempelan sebagai gold transcript
8. **Siap korpus** — contoh naskah bagus/jelek bisa masuk korpus Raget (lihat `docs/KORPUS_KONTEKS_RAGET.md`)

---

## 9. Catatan proses kolaborasi

- User sering kirim screenshot + transkrip mentah sebagai ground truth
- ZIP Pitutur dikirim bolak-balik; hard refresh wajib karena SW
- Pernah ada duplikasi folder/zip di luar folder kerja — disepakati edit di dalam folder Pitutur yang sama
- Claude sempat mengerjakan cabang UI; user memilih lanjut dari hasil Grok
- Aksesibilitas ukuran teks besar / fitur Claude yang tidak dipakai: diabaikan sesuai arahan user

---

## 10. Definisi “selesai” tahap standalone

- Sumber jelas, satu ruangan, tidak sesak
- Susun naskah menghasilkan dialog yang terasa obrolan (bukan hafalan frasa)
- Putar: highlight mengikuti suara secara konsisten di Chrome Android
- ID stabil; EN dan JV usable tanpa hybrid parah
- Dokumentasi di `docs/` cukup untuk handoff
- Siap digabung tanpa rewrite besar (ES modules + namespace)

---

*Dokumen ini disusun dari percakapan pengembangan Pitutur (Agustus 2026) dan audit struktur Rategoan. Perbarui saat keputusan besar berubah.*
