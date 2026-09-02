# Konteks Pitutur untuk korpus dan weight Raget

Raget kini menuju tahap: data di korpus dan dijadikan weight. Dokumen ini menjelaskan apa yang perlu diketahui model/induk tentang Pitutur agar tidak menyampur peran.

---

## 1. Batas tanggung jawab

| Sistem | Tugas |
|--------|--------|
| **Raget (induk)** | Chat, intent, fakta, memori, tools, (neural) generate teks balasan |
| **Pitutur** | Menyusun naskah siaran berpersona + memutar TTS lokal |

Pitutur **bukan** chat. Jangan generate jawaban chat di dalam loop highlight/TTS.

Integrasi yang benar:
- Raget boleh membantu **sekali** saat “Susun Naskah” (outline / rapikan dialog)
- Atau menyerahkan `{ title, text }` lewat `loadSource`
- Playback dan persona tetap milik Pitutur

---

## 2. Persona (untuk few-shot / korpus dialog)

### Warta
- Membawa fakta dan kerangka
- Kalimat lengkap, jelas, tidak menguji
- Boleh jembatan: “Dan ini yang membuatnya beda:”, “Tambahan singkat, tapi penting:”

### Tanya
- Menguji atau memilih fokus
- Singkat; jangan mengulang pertanyaan sama tiap chunk
- Hindari hanya “Sip” / “Oke dilanjut” tanpa substansi
- Contoh arah bagus: “Kalau hanya satu yang dibawa pulang, apa?” / “Apa yang sering disalahpahami soal X?”

### Kisah
- Analogi, makna, pelan
- Tidak menumpuk fakta baru

Mode:
- Monolog = Warta saja
- Dialog = Warta + Tanya
- Diskusi = Warta + Tanya + Kisah

---

## 3. Contoh pola naskah yang diinginkan (positif)

```
Warta: Selamat sore. Kita buka siaran dengan hal yang sederhana, tapi tajam.
Warta: Tentang Indonesia. Negara kepulauan terbesar di dunia dengan lebih dari 17.000 pulau. …
Tanya: Soal kepulauan — apa yang sering disalahpahami?
Warta: Bawa pulang kepulauan dulu. Angka lengkap bisa menyusul.
Warta: Sistem pemerintahannya Republik Presidensial. Anggota G20, ASEAN, dan OKI.
…
Warta: Siaran selesai. Yang penting ikut dalam keputusan hari ini.
```

Ciri positif:
- Fakta utuh (angka tidak terpotong)
- Tanya bervariasi dan relevan ke chunk
- Warta tidak menduplikasi pertanyaan Tanya
- Satu ide inti di penutup

---

## 4. Pola yang harus dihindari (negatif / filter korpus)

- “Fokus ke X dulu. Sisanya pelengkap.” diulang tiap segmen
- Tanya: “Sip” berulang
- Hybrid bahasa: “Country an archipelago… Ibu kotanya…”
- Noise materi web: “menu Logo Search”, “0.040 detik”, nav boilerplate
- Double “rujukan rujukan”
- Echo: Warta mengulang hampir identik jawaban ringkas yang baru dikatakan

---

## 5. Skema sumber data

### Dataries (pustaka)
- Kategori: country, cities, languages, wisata, tokoh, makanan, sains, …
- Load per region (lazy), sama filosofi `raget-dataries` induk
- Saluran Pitutur memetakan ke subset (Warta Hari Ini, Kisah Tokoh, Lingo, …)

### Materi user
- Teks tempel, URL (batas CORS), file
- Harus dilalui pembersihan sebelum chunking
- Chunk panjang → beberapa “bagian” siaran

### Notebook lokal
- IndexedDB: materi tersimpan, sesi lanjut, riwayat siaran

---

## 6. Field berguna jika Raget menyusun naskah

Input yang ideal ke generator (rule atau weight):

```json
{
  "lang": "id",
  "mode": "dialog",
  "channel": "warta_hari_ini",
  "topic": "Indonesia",
  "chunks": [
    { "id": 1, "text": "Negara kepulauan terbesar..." },
    { "id": 2, "text": "Sistem pemerintahan..." }
  ],
  "constraints": {
    "max_tanya_per_chunk": 1,
    "forbid_phrases": ["Sip", "Oke dilanjut"],
    "must_keep_numbers": true
  }
}
```

Output: array giliran `{ "speaker": "Warta"|"Tanya"|"Kisah", "text": "..." }`.

---

## 7. Bahasa

| Kode | Status di Pitutur |
|------|-------------------|
| id | Primer, naturalisasi lisan |
| en | Template negara + kamus frasa; rapikan residual ID |
| jv | Kalimat + kamus diperluas; masih perlu frasa dialog |
| lain | Kamus tipis; jangan dipaksa full broadcast tanpa data |

Weight Raget yang multilingual membantu **Susun Naskah**; kamus Pitutur tetap ada untuk offline murni tanpa neural.

---

## 8. Travel / Jalanin (konteks saudara)

Bukan bagian Pitutur. PWA di `fitur/jelajah/`: Jelajah, Kuis, Sapaan, Trip, Asisten. Jangan campur intent “siaran radio” dengan “rencana trip”.

---

## 9. Kata kunci untuk retrieval korpus

`pitutur`, `siaran`, `warta`, `tanya`, `kisah`, `naskah`, `dataries`, `highlight`, `tts`, `monolog`, `dialog`, `diskusi`, `notebooklm-like`, `offline pwa`

---

*Pakai dokumen ini saat menyusun few-shot, filter korpus, atau system prompt untuk mode “bantu susun naskah Pitutur”.*
