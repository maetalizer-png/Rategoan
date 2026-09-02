# Pitutur

Studio siaran audio untuk ekosistem Rategoan (dikembangkan standalone dulu).

## Menjalankan

```bash
python3 -m http.server 8080
# atau: npx serve .
```

Buka URL lokal. Jangan pakai `file://`. Setelah update, hard refresh (bypass cache Service Worker).

## Alur

1. **Sumber** — Pustaka (saluran + Dataries) dan/atau Materi saya (teks, URL, file)
2. **Mode** — Monolog / Dialog / Diskusi
3. **Susun Naskah** → **Putar**

## Namespace

```js
Rategoan.Pitutur.status()
Rategoan.Pitutur.loadSource({ title, text })
Rategoan.Pitutur.play()
```

## Struktur

```
js/pitutur-main.js
js/pitutur-namespace.js
js/core|ui|naskah|sumber|audio|notebook|embed|translate/
css/modules/
docs/
```

## Dokumentasi

| Dokumen | Isi |
|---------|-----|
| [docs/EMBED.md](docs/EMBED.md) | API embed & namespace (`Rategoan.Pitutur`, `postMessage`, deep-link) |
| [docs/KORPUS_KONTEKS_RAGET.md](docs/KORPUS_KONTEKS_RAGET.md) | Batas peran Pitutur vs Raget, persona Warta/Tanya/Kisah |
| [docs/SKENARIO_KUALITAS.md](docs/SKENARIO_KUALITAS.md) | Skenario uji kualitas dialog |

## Catatan induk

Pitutur adalah fitur RATEGOAN (lihat README.md root), dibangun sebagai
PWA turunan mandiri/offline. Data korpus + weight Raget dikerjakan di
jalur terpisah — lihat `PRD.md` di root.
