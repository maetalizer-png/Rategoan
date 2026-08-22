# Catatan P1 — sumber luar

## URL
- Fetch langsung; banyak situs memblokir CORS.
- Jika gagal: fokus pindah ke tempel teks, status menjelaskan langkah berikutnya.

## Tempel
- Minimal ~20 karakter.
- Disimpan sebagai materi biasa (chunk + progres).

## Embed induk
```js
await Rategoan.Pitutur.loadSource({ title: 'Catatan', text: '...', speakMode: 'dialog' });
Rategoan.Pitutur.susun();
Rategoan.Pitutur.play();
```

Tidak membuat notebook otomatis.
