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
js/core|naskah|audio|notebook|translate/
raget-dataries/
css/modules/
docs/
```

## Dokumentasi (baca ini dulu sebelum ubah besar)

| Dokumen | Isi |
|---------|-----|
| [docs/SEJARAH_PENGEMBANGAN.md](docs/SEJARAH_PENGEMBANGAN.md) | Seluruh konteks percakapan, isu, perbaikan, relasi Raget |
| [docs/KORPUS_KONTEKS_RAGET.md](docs/KORPUS_KONTEKS_RAGET.md) | Batas peran Pitutur vs Raget ber-weight/korpus |
| [docs/PETA_KEPUTUSAN.md](docs/PETA_KEPUTUSAN.md) | Keputusan desain yang terkunci |
| [docs/PRD_STRUKTUR_ALUR.md](docs/PRD_STRUKTUR_ALUR.md) | PRD struktur & alur |
| [docs/PRD_Pitutur.md](docs/PRD_Pitutur.md) | PRD produk |
| [docs/SKENARIO_KUALITAS.md](docs/SKENARIO_KUALITAS.md) | Target kualitas dialog |
| [docs/SKENARIO_LANJUTAN.md](docs/SKENARIO_LANJUTAN.md) | Roadmap skenario |
| [docs/EMBED.md](docs/EMBED.md) | API embed |
| [docs/STATUS_RILIS.md](docs/STATUS_RILIS.md) | Status rilis |
| [docs/CATATAN_P1.md](docs/CATATAN_P1.md) | Catatan prioritas P1 |

## Catatan induk

Rategoan/Raget: data korpus + weight dikerjakan di jalur terpisah. Integrasi Pitutur ke induk ditunda. Travel/Jalanin juga terpisah.
