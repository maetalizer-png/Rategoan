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
| `css/main.css`        | Entry point CSS: `@import` seluruh partial dengan namespace tunggal `--rg-*` |
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
| `js/ai/`              | Adapter (3 file) yang menjembatani kerangka Rategoan ke otak AI |
| `rategoan-llm/`        | Mesin balasan lokal berbasis pola, tanpa API key, lazy-init  |
| `raget-database/`      | Penyimpanan catatan Q&A untuk feedback loop (`raget_db`)     |
| `raget-memory/`        | Memori jangka pendek (konteks) & jangka panjang (fakta pengguna) |
| `ai-agent/`            | Orkestrasi: intent routing, tools deterministik, prompt assembly |
| `dataset/`             | Persona, few-shot, benchmark, dan basis pengetahuan statis   |
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

## 4. Otak AI — Raget

Rategoan kini terhubung ke **Raget**, mesin balasan lokal berbasis pola dan
konteks — tanpa API key, tanpa model besar yang diunduh, dan lazy-loaded
(baru dimuat saat pesan pertama dikirim, bukan saat boot).

Alur satu pesan:

    Pesan pengguna
      → raget-memory (konteks 10 giliran terakhir + fakta jangka panjang)
      → ai-agent (deteksi tool: ringkas/hitung/tanggal, atau lanjut ke LLM)
      → rategoan-llm (pencocokan pola: salam, tanya, ide konten, jelaskan)
      → post-processing (rapikan teks, fallback jujur bila kosong)
      → tampil sebagai balasan (typing + TTS) & tersimpan ke raget-database

Titik integrasi publik (dipakai oleh `js/chat/chat.js` dan `js/sheets/models.js`,
tidak perlu diubah):

| Fungsi              | Tujuan                                          |
|----------------------|--------------------------------------------------|
| `ai.generate(messages, prompt)` | Hasilkan balasan; tidak pernah `null` setelah mesin siap |
| `ai.setStatus(text)` | Perbarui indikator status mesin (`#model-status`) |
| `ai.ready`           | Status apakah mesin sudah diinisialisasi         |

Keyspace localStorage milik otak AI terpisah dari kerangka Rategoan:
`raget_memory` (fakta jangka panjang) dan `raget_db` (catatan Q&A), tidak
menyentuh `rategoan_*`.

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
    │   ├── main.css      (entry point, @import semua partial di bawah)
    │   ├── tokens.css    (custom properties, namespace tunggal --rg-*)
    │   ├── reset.css      (reset elemen global + reduced-motion)
    │   ├── utilities.css   (state class lintas-komponen: font-size, status model/suara)
    │   ├── layout/        (shell, sidebar)
    │   ├── ui/            (buttons, toast, menu, scroll)
    │   ├── chat/           (messages, search)
    │   ├── history/         (history)
    │   ├── sheets/           (sheets/attach/model)
    │   ├── account/           (auth, settings)
    │   └── system/             (overlays: onboarding & kunci PIN)
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
        └── ai/          (adapter: engine, memory, ai — satu-satunya pintu ke otak AI)
    ├── rategoan-llm/    (llm-engine, llm-worker stub, llm-models)
    ├── raget-database/  (raget-db, raget-schema)
    ├── raget-memory/    (memory-short, memory-long, memory-index)
    ├── ai-agent/        (agent, agent-tools)
    └── dataset/
        ├── persona.json
        ├── fewshot.json
        ├── bench.json
        └── knowledge/
            ├── umum.json
            └── faq.json

## 7. Roadmap

| Fase | Deskripsi                          | Status    |
|------|------------------------------------|-----------|
| 0    | Kerangka bersih + gestur swipe     | Selesai   |
| 1    | README, struktur, polish sentuhan  | Selesai   |
| 2    | Integrasi model lokal (Raget)      | Selesai   |
| 3    | Manajemen konteks + streaming      | Rencana   |
| 4    | Cache offline penuh                | Rencana   |
| 5    | Fitur tambahan (Gmail, export)     | Rencana   |

---

Rategoan — privat, lokal, profesional.