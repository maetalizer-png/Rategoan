# RATEGOAN

Aplikasi asisten pribadi lokal — kerangka antarmuka chat yang bersih,
privat, dan siap dihubungkan dengan model AI yang berjalan sepenuhnya di perangkat.

---

## 1. Ringkasan

Rategoan adalah single-page application (SPA) tanpa framework dan tanpa build tool:
HTML, CSS, dan JavaScript modular murni. Dirancang mobile-first dengan tema
light/dark, gestur sentuh, serta arsitektur local-first — tidak ada data
percakapan yang meninggalkan perangkat.

## 2. Berkas Inti

| Berkas            | Tanggung Jawab                                              |
|-------------------|-------------------------------------------------------------|
| `rategoan.html`   | Shell aplikasi: topbar, area chat, composer, sidebar 2 view |
| `style.css`       | Design system light/dark, tata letak, ikon SVG              |
| `app.js`          | Logika UI modular (Theme, Store, Voice, Chat, Swipe, AI)    |
| `model/`          | (Fase 2) berkas model ONNX lokal                            |
| `README.md`       | Dokumen ini                                                 |

## 3. Fitur Kerangka

### Percakapan
- Kirim melalui tombol atau Enter; Shift+Enter untuk baris baru.
- Textarea auto-grow (maksimal ±5 baris).
- Pesan pengguna berbentuk kotak; balasan AI bergaya typewriter cepat.
- Timestamp per pesan; scroll halus dengan auto-scroll.

### Sidebar
- Drawer dengan tiga kendali: tombol, tap backdrop, dan gestur swipe.
- Garis pembatas presisi 50% serta garis di bawah brand.
- Riwayat percakapan tersimpan di localStorage; hapus per-item.
- View Pengaturan internal: toggle Mode Gelap + slot ekspansi.

### Audio
- Text-to-Speech (SpeechSynthesis) dengan tombol berhenti.
- Input suara (SpeechRecognition) bila perangkat mendukung.

### Kualitas Visual
- Tanpa tap-highlight biru; umpan balik tekan halus mengikuti tema.
- Tema bawaan light; preferensi tersimpan.

## 4. Titik Integrasi

| Fungsi                   | Tujuan                                  |
|--------------------------|-----------------------------------------|
| `AI.loadModel()`         | Memuat model ONNX lokal                 |
| `AI.generate()`          | Inference; mengembalikan string balasan |
| `onLogin()`              | Alur login Gmail                        |
| `onPlus()`               | Fitur tambahan                          |
| `exportTxt()` / `search()` | Dormant, siap diaktifkan              |

## 5. Menjalankan

Serve folder ini melalui server lokal:

    http://localhost:8080/rategoan.html

Mode `file://` dapat digunakan untuk pengujian UI murni;
fitur model dan WebGPU bekerja optimal melalui HTTP.

## 6. Struktur Folder

    rategoan/
    ├── rategoan.html
    ├── style.css
    ├── app.js
    ├── model/
    ├── assets/
    └── README.md

## 7. Roadmap

| Fase | Deskripsi                          | Status    |
|------|------------------------------------|-----------|
| 0    | Kerangka bersih + gestur swipe     | Selesai   |
| 1    | README, struktur, polish sentuhan  | Selesai   |
| 2    | Integrasi model lokal              | Berikutnya|
| 3    | Manajemen konteks + streaming      | Rencana   |
| 4    | Cache offline penuh                | Rencana   |
| 5    | Fitur tambahan (Gmail, export)     | Rencana   |

---

Rategoan — privat, lokal, profesional.