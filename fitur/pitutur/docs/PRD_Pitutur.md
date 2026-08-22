# PRD — Pitutur (modul siaran Rategoan)

## 1. Ringkasan produk

Pitutur adalah modul siaran audio bergaya radio di ekosistem Rategoan. Pengguna memilih sumber materi, menyusun naskah, lalu memutar siaran dengan persona Warta, Tanya, dan Kisah.

Pitutur **tidak** mengandalkan LLM di dalam modul. Naskah dibangun dari pustaka lokal (Dataries), dokumen pengguna, dan aturan dialog. Integrasi dengan AI induk (Rategoan) dilakukan lewat penyerahan teks/sumber, bukan generasi bebas di dalam Pitutur.

## 2. Tujuan

1. Menjadikan materi teks mudah dikonsumsi sebagai audio berpersona.
2. Memberi ritme belajar: monolog, dialog, diskusi.
3. Offline-first: inti aplikasi jalan tanpa jaringan setelah aset termuat.
4. Siap disematkan ke aplikasi induk lewat API embed.

## 3. Persona

| Persona | Peran | Gaya |
|---------|--------|------|
| Warta | Pembawa materi | Jelas, terstruktur |
| Tanya | Penguji / interupsi | Singkat, menantang |
| Kisah | Makna / analogi | Lambat, reflektif |

Mode: Monolog (Warta) · Dialog (Warta+Tanya) · Diskusi (ketiga persona).

## 4. Sumber materi

| Sumber | Keterangan |
|--------|------------|
| Dataries | Pustaka fakta lokal (negara, tokoh, sains, dll.) |
| Koleksi | Simpanan pengguna (jika tersedia dari induk) |
| Dokumen | PDF, JSON, TXT, MD — di-chunk & dilanjutkan progres |
| URL / tempel | Ambil artikel atau tempel teks manual |
| Mode dokumen | Baca · Ringkasan · FAQ |

## 5. Alur utama

```
Pilih sumber → (opsional) topik / mode dokumen
→ Susun Naskah → Putar / Jeda / Stop
→ Progres tersimpan (dokumen & notebook)
```

## 6. Kualitas naskah (wajib)

- Teks berlabel (`Populasi: …`) dinaturalisasi ke kalimat lisan.
- Unit bicara digabung (hindari potongan 3–5 kata).
- Dialog tidak formulaik berulang setiap blok.
- Kata kunci Tanya tidak boleh dari stop-word / awalan template.
- Satu pertanyaan mendalam per segmen cukup; sisanya reaksi singkat.

## 7. Arsitektur teknis

### 7.1 Modul ES6

Entry: `js/pitutur-main.js`  
Semua modul memakai `import` / `export`. Tidak ada bundler wajib.

### 7.2 Struktur direktori

```
js/
  pitutur-main.js
  pitutur-i18n.js
  core/pitutur-state.js
  ui/pitutur-handlers.js, pitutur-renderer.js
  naskah/pitutur-script.js, pitutur-chunk.js, pitutur-retrieve.js
  sumber/pitutur-dataries.js, pitutur-dokumen.js, pitutur-http.js, pitutur-channels.js
  audio/pitutur-voice.js, pitutur-session.js
  notebook/pitutur-notebook-store.js
  embed/pitutur-embed.js
  translate/          (nama file internal tetap)
raget-dataries/       (pustaka data, bukan prefix pitutur)
```

### 7.3 Namespace (arah Rategoan)

Target namespace tunggal agar selaras induk:

```js
globalThis.Rategoan = globalThis.Rategoan || {};
Rategoan.Pitutur = {
  state, buildScript, embed, dokumen, …
};
```

Tahap awal: `window.Pitutur` (embed API) tetap didukung.  
Tahap lanjut: seluruh ekspor publik digabung ke `Rategoan.Pitutur` tanpa memecah ES modules internal.

### 7.4 Persistensi

- `localStorage` — preferensi siaran, cast suara, state ringan
- IndexedDB — dokumen, notebook, progres chunk

### 7.5 Audio

Web Speech API + penyesuaian pitch/rate per persona dan intent.

## 8. API embed (induk ↔ Pitutur)

| Arah | Mekanisme |
|------|-----------|
| Induk → Pitutur | `postMessage` (`target: 'pitutur'`) atau `Rategoan.Pitutur` |
| Pitutur → Induk | event `ready`, `source:ready`, `episode:ended`, `progress` |
| Deep-link | `?doc=&mode=&docMode=&lang=` |

Aksi: `ping`, `status`, `progress`, `setOptions`, `loadSource`, `play`, `stop`, `preview`.

## 9. Non-tujuan (saat ini)

- Generasi naskah oleh LLM di dalam Pitutur
- Streaming model suara cloud
- Editor naskah kaya fitur (WYSIWYG)

## 10. Metrik sukses

1. Naskah Dialog terdengar seperti siaran, bukan bacaan label.
2. Dokumen panjang bisa dilanjutkan tanpa mengulang dari awal.
3. Embed dari induk memuat sumber ≤ 2 detik setelah `loadSource`.
4. Instalasi PWA & cache shell berhasil di Chromium mobile.

## 11. Risiko

| Risiko | Mitigasi |
|--------|----------|
| CORS URL | Fallback tempel teks |
| Suara perangkat terbatas | Preferensi cast + otomatis |
| Naskah kaku | Evaluasi skenario kualitas berkala |
