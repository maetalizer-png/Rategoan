# Skenario lanjutan pengembangan Pitutur

## Fase sekarang (stabilisasi)

- Prefix file `pitutur-*.js` (kecuali `translate/`, `raget-dataries/`)
- Struktur folder per fungsi tetap
- Kualitas dialog & naturalisasi lisan

**Uji:** Dialog + Dataries negara; Dokumen Baca dua kali (progres); Ringkasan; FAQ.

---

## Fase F1 — Namespace Rategoan ✅

**Tujuan:** Satu pintu publik selaras aplikasi induk.

Sudah:
- `js/pitutur-namespace.js`
- `Rategoan.Pitutur` + alias `window.Pitutur`
- Kontrol play/stop/susun terikat ke namespace
- `docs/EMBED.md` diperbarui

**Selesai jika:** dari konsol, `Rategoan.Pitutur.status()` mengembalikan objek status.

---

## Fase F2 — Kualitas siaran (dengar) ✅

1. Variasi penutup & pembuka per saluran (bukan satu template global).
2. Hindari jembatan identik tiga kali beruntun.
3. Mode Diskusi: pastikan Kisah muncul minimal sekali per episode.
4. Tes regresi dengan skenario di `SKENARIO_KUALITAS.md`.

---

## Fase F3 — Notebook & multi-sumber

1. Satu notebook = banyak dokumen.
2. Progres per dokumen di UI notebook.
3. Gabungan ringkas lintas dokumen (retrieve top-k).

---

## Fase F4 — Integrasi induk (tanpa merge besar)

1. Induk memanggil `loadSource({ text, title })` setelah AI induk selesai.
2. Pitutur hanya merangkai & membacakan.
3. `episode:ended` mengirim ringkasan progres ke induk.

---

## Fase F5 — Hardening ✅ (sebagian)

1. Service worker: versi cache & skip aset API.
2. Batas ukuran dokumen & pesan error jelas.
3. Uji offline: matikan jaringan setelah load pertama.

---

## Urutan kerja disarankan

```
F1 namespace → F2 kualitas dengar → F3 notebook multi
→ F4 kontrak induk → F5 hardening
```

---
Lihat docs/STATUS_RILIS.md untuk status penutupan fase ini.
