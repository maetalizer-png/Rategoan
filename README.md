# RATEGOAN

Aplikasi asisten pribadi lokal — kerangka antarmuka chat yang bersih,
privat, dan siap dihubungkan dengan model AI yang berjalan sepenuhnya di perangkat.

---

## 1. Ringkasan

Rategoan adalah single-page application (SPA) tanpa framework dan tanpa build tool:
HTML, CSS, dan JavaScript modular murni berbasis ES6 Modules (import/export).
Dirancang mobile-first dengan tema light/dark, gestur sentuh, serta arsitektur
local-first — tidak ada data percakapan yang meninggalkan perangkat.

## 2. Berkas Inti

| Berkas / Folder    | Tanggung Jawab                                              |
|---------------------|--------------------------------------------------------------|
| `index.html`         | Shell aplikasi: topbar, area chat, composer, sidebar 2 view |
| `css/`                | Design system light/dark, layout, komponen, utilitas       |
| `js/main.js`          | Entry point ES module: wiring & bootstrap aplikasi          |
| `js/utils/`           | Fungsi murni: DOM helper, format, haptics, clipboard, markdown |
| `js/state/`           | State & penyimpanan: store, theme, auth, font, storage, pin |
| `js/core/`            | Layanan inti: toast, router                                 |
| `js/ui/`              | Komponen UI lepas: drawer, scroll-to-bottom, quote           |
| `js/chat/`            | Alur percakapan: chat, composer, pencarian chat, suara       |
| `js/history/`         | Riwayat chat & menu kontekstualnya                          |
| `js/sheets/`          | Bottom sheet: lampiran & pemilihan model                     |
| `js/account/`         | Akun: profil, login, pengaturan                              |
| `js/system/`          | Integrasi sistem: jaringan, install PWA, backup, shortcut, onboarding |
| `js/ai/`              | (Fase 2) titik integrasi model AI lokal                      |
| `sw.js`                | Service worker (cache lifecycle)                             |
| `README.md`           | Dokumen ini                                                   |

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

JavaScript diorganisir sebagai ES6 Modules (`import`/`export`), sehingga wajib
diakses melalui server HTTP, bukan `file://`. Contoh:

    npx http-server -p 8080
    # atau
    python3 -m http.server 8080

Lalu buka:

    http://localhost:8080/index.html

## 6. Struktur Folder

    Rategoan/
    ├── index.html
    ├── manifest.webmanifest
    ├── sw.js
    ├── icon.svg
    ├── README.md
    ├── css/
    │   ├── base.css
    │   ├── layout.css
    │   ├── components.css
    │   └── utilities.css
    └── js/
        ├── main.js
        ├── utils/       (dom, format, haptics, clipboard, markdown)
        ├── state/       (store, theme, auth, font, storage, pin)
        ├── core/        (toast, router)
        ├── ui/          (drawer, scrolldown, quote)
        ├── chat/        (chat, composer, chatsearch, voice)
        ├── history/     (history, histmenu, msgmenu)
        ├── sheets/      (sheets, attach, models)
        ├── account/     (account, login, settings)
        ├── system/      (netmon, install, backup, shortcuts, onboard)
        └── ai/          (titik integrasi model AI)

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