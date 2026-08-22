# PRD Pitutur — Struktur dan Alur

Versi: 2026-08-21  
Status: acuan pengembangan aktif  
Lingkup: modul siaran di dalam Rategoan

---

## 1. Masalah yang diselesaikan

Pengguna punya materi (fakta lokal, dokumen, teks tempel, kelak dari induk), tetapi membacanya di layar melelahkan. Pitutur mengubah materi itu menjadi siaran audio berpersona agar bisa didengar sambil melakukan hal lain, dengan progres yang bisa dilanjutkan.

Pitutur bukan chat AI. Pitutur adalah mesin siaran: sumber masuk, naskah disusun, audio diputar.

---

## 2. Posisi di Rategoan

```
Rategoan (aplikasi induk)
  └── Pitutur (modul siaran)
        namespace publik: Rategoan.Pitutur
```

- Induk boleh mengirim teks/hasil kerja lewat embed.
- Pitutur merangkai dan membacakan, tidak mengarang ulang lewat LLM di dalam modul.
- Namespace dan file modul memakai pola yang stabil agar integrasi tidak rapuh.

---

## 3. Prinsip produk

1. Satu alur utama yang jelas: Sumber -> Susun -> Putar.
2. Unit kerja utama adalah Materi, bukan Notebook.
3. Mode siaran (Monolog / Dialog / Diskusi) mengubah cara bicara, bukan mengganti aplikasi.
4. Offline-first untuk inti: state, dokumen tersimpan, pustaka lokal.
5. UI tipis: setiap kontrol harus punya efek yang langsung terasa di telinga atau di progres.

---

## 4. Mengapa Notebook versi sebelumnya kurang berguna

Temuan dari uji pakai:

| Yang terjadi | Akibat |
|--------------|--------|
| Setiap dokumen otomatis jadi notebook | Daftar dobel (dokumen + notebook) tanpa beda manfaat |
| Tidak ada tujuan belajar di notebook | User tidak tahu kapan harus membuka notebook |
| Tidak ada aksi unik | Buka notebook = sama seperti pilih dokumen |
| Progres tersebar | Sulit menjawab "saya berhenti di mana?" |

Kesimpulan: Notebook 1:1 dengan dokumen adalah abstraksi kosong. Jangan dipaksa di UI utama.

### Keputusan struktur data

**Materi** = unit utama (dokumen unggahan, tempelan, URL, item dataries yang dipilih, sumber dari induk).

**Notebook** = fitur lanjutan opsional (fase berikutnya), hanya jika memenuhi syarat:
- punya nama yang diberi user,
- berisi satu atau lebih materi,
- punya tujuan singkat opsional,
- menyimpan mode siaran + posisi terakhir + topik terakhir.

Sampai notebook memenuhi syarat itu, UI utama hanya menampilkan **Materi**, bukan dua daftar paralel.

---

## 5. Arsitektur informasi (layar)

Empat panel yang sudah ada tetap dipakai, dengan peran tegas:

| Panel | Nama di UI | Isi wajib |
|-------|------------|-----------|
| Kendali | Kendali | kecepatan, bahasa, sleep, room tone, wake lock, suara persona |
| Mode | Mode | Monolog / Dialog / Diskusi |
| Sumber | Sumber | sumber data, daftar materi, unggah/URL/tempel, saluran, topik, Susun Naskah |
| Riwayat | Riwayat | siaran selesai, putar ulang naskah |

Panggung tengah: status persona (W/T/K), visualizer, transkrip, Putar/Stop/Jeda.

Yang tidak masuk lingkup UI inti:
- pengaturan aksesibilitas khusus (kontras, skala teks),
- notebook sebagai daftar paralel wajib,
- fitur yang tidak mengubah naskah atau audio.

---

## 6. Alur utama (happy path)

### 6.1 Siaran dari pustaka lokal (Dataries)

```
Buka Pitutur
  -> Sumber: nyalakan Dataries
  -> pilih Saluran
  -> (opsional) isi Topik
  -> Mode: Dialog atau Diskusi
  -> Susun Naskah
  -> Putar
  -> selesai / lanjut siaran berikutnya
```

### 6.2 Siaran dari materi pengguna

```
Sumber: nyalakan Dokumen
  -> tambah PDF/JSON/TXT/MD atau tempel teks atau URL
  -> materi muncul di daftar Materi
  -> pilih materi
  -> pilih Baca | Ringkasan | FAQ
  -> Susun Naskah
  -> Putar
  -> siaran berikutnya melanjutkan progres Baca
```

### 6.3 Dari aplikasi induk

```
Induk memanggil Rategoan.Pitutur.loadSource({ title, text })
  -> materi tersimpan
  -> user (atau induk) memicu susun + putar
  -> episode:ended dikirim balik ke induk
```

---

## 7. Model objek (sederhana)

### Materi
- id
- name
- type (pdf | json | txt | md | url | induk)
- text
- chunks[]
- words
- progress (index chunk terakhir)
- addedAt

### Siaran (episode)
- nomor
- channel / materi id
- mode
- topik
- lines[] (naskah final)
- words
- date

### Notebook (opsional, nanti)
- id
- title (wajib dari user)
- materialIds[]
- goal (opsional, satu kalimat)
- lastMode, lastTopic, lastMaterialId, lastProgress
- updatedAt

Aturan: jangan membuat notebook otomatis hanya karena ada materi baru.

---

## 8. Alur naskah (pipeline)

```
Sumber terpilih
  -> ambil teks / chunk
  -> naturalisasi lisan (label field jadi kalimat)
  -> pecah unit bicara
  -> (jika topik) retrieve chunk relevan
  -> susun giliran persona menurut Mode
  -> terjemahan UI jika lang != id (konten lokal tetap diutamakan)
  -> session TTS memutar baris demi baris
```

Mode:
- Monolog: Warta saja, unit pendek beruntun, penutup jelas.
- Dialog: Warta + Tanya; satu pertanyaan dalam per segmen, bukan template berulang.
- Diskusi: Warta + Tanya + Kisah; Kisah wajib muncul minimal sekali per episode.

---

## 9. Struktur kode (modul)

```
js/
  pitutur-main.js              entry + sesi putar
  pitutur-namespace.js         Rategoan.Pitutur
  pitutur-i18n.js
  core/pitutur-state.js
  ui/pitutur-handlers.js
  ui/pitutur-renderer.js
  naskah/pitutur-script.js
  naskah/pitutur-chunk.js
  naskah/pitutur-retrieve.js
  sumber/pitutur-dataries.js
  sumber/pitutur-dokumen.js
  sumber/pitutur-http.js
  sumber/pitutur-channels.js
  audio/pitutur-voice.js
  audio/pitutur-session.js
  notebook/pitutur-notebook-store.js   (backend opsional)
  embed/pitutur-embed.js
  translate/
raget-dataries/
```

Import/export ES modules. Nama file modul Pitutur berprefix pitutur-, kecuali translate dan raget-dataries.

---

## 10. Prioritas pengembangan (urut)

### P0 — Alur inti terasa berguna
1. Daftar Materi tunggal (hilangkan dobel notebook di UI).
2. Progres Baca terlihat dan akurat ("bagian x dari y").
3. Dialog/Diskusi tidak formulaik; monolog tidak satu blok raksasa.
4. Susun Naskah selalu menghasilkan naskah yang bisa diputar.

### P1 — Materi dari luar
1. Tempel teks dan unggah stabil.
2. URL dengan fallback tempel jika CORS gagal.
3. Embed loadSource dari induk.

### P2 — Notebook yang benar-benar berguna
Hanya dikerjakan jika P0 selesai. Syarat rilis notebook:
- user membuat notebook dengan nama,
- menambah materi ke dalamnya,
- satu tombol "Lanjut notebook ini" memulihkan materi + mode + posisi,
- tanpa notebook, semua fitur inti tetap utuh.

### P3 — Polesan
- variasi pembuka/penutup per saluran,
- cache shell PWA,
- pengerasan error dan batas ukuran file.

---

## 11. Kriteria sukses

1. User baru memahami alur Sumber -> Susun -> Putar dalam satu sesi tanpa penjelasan panjang.
2. Materi pengguna bisa dilanjutkan di sesi berikutnya tanpa mengulang dari awal.
3. Mode Dialog terdengar beda dari Monolog (ada giliran Tanya yang bermakna).
4. Tidak ada dua daftar yang isinya sama (materi vs notebook kloning).
5. Rategoan.Pitutur.status() dan loadSource() siap dipakai induk.

---

## 12. Non-tujuan

- LLM di dalam Pitutur untuk mengarang naskah.
- Notebook sebagai salinan otomatis setiap unggahan.
- Panel aksesibilitas khusus di Kendali.
- Menyatukan seluruh Rategoan ke dalam repo Pitutur pada fase ini.

---

## 13. Ringkasan arahan

Pitutur = studio siaran.  
Materi = bahan.  
Mode = gaya bicara.  
Susun + Putar = aksi inti.  

Notebook hanya boleh muncul lagi sebagai wadah multi-materi yang user buat sendiri, bukan bayangan daftar dokumen.

---
Lihat docs/STATUS_RILIS.md untuk status penutupan fase ini.
