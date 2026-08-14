// JALANIN — sw.js
// Default: TANPA cache, semua request langsung ke jaringan (jujur, selalu
// versi terbaru saat online). Paket offline bersifat OPT-IN: hanya dicache
// bila pengguna memilih "unduh paket offline", dan hanya dipakai sebagai
// fallback SAAT jaringan gagal (network-first, bukan cache-first).

const PACK_CACHE = 'travel_pack_v1';

const PACK_FILES = [
  './', './index.html', './manifest.webmanifest', './icon.svg',
  './css/tokens.css', './css/components.css', './css/views.css',
  './js/app.js', './js/constants.js', './js/icons.js', './js/loader.js',
  './js/storage.js', './js/utils.js',
  './js/features/climate.js', './js/features/install.js', './js/features/journal.js',
  './js/features/currency.js', './js/features/offline-pack.js',
  './js/views/detail.js', './js/views/jelajah.js', './js/views/kuis.js',
  './js/views/sapaan.js', './js/views/trip.js', './js/views/profil.js',
];

self.addEventListener('install', () => { self.skipWaiting(); });

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    try {
      const keys = await caches.keys();
      // Hapus semua cache LAMA, tapi pertahankan paket offline versi saat
      // ini bila pengguna sudah pernah mengunduhnya.
      await Promise.all(keys.filter((k) => k !== PACK_CACHE).map((k) => caches.delete(k)));
    } catch (err) {}
    await clients.claim();
  })());
});

self.addEventListener('message', (e) => {
  const msg = e.data || {};
  const respond = (data) => { if (e.ports && e.ports[0]) e.ports[0].postMessage(data); };
  if (msg.type === 'CACHE_PACK') {
    e.waitUntil((async () => {
      try {
        const cache = await caches.open(PACK_CACHE);
        await cache.addAll(PACK_FILES);
        respond({ ok: true, count: PACK_FILES.length });
      } catch (err) {
        respond({ ok: false, reason: String(err) });
      }
    })());
  } else if (msg.type === 'CLEAR_PACK') {
    e.waitUntil((async () => {
      try {
        await caches.delete(PACK_CACHE);
        respond({ ok: true });
      } catch (err) {
        respond({ ok: false, reason: String(err) });
      }
    })());
  }
});

// Network-first: request selalu dicoba ke jaringan dulu. Cache paket offline
// HANYA dipakai sebagai fallback bila jaringan gagal DAN paket sudah pernah
// diunduh — tidak pernah menyajikan versi cache saat jaringan sehat.
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith((async () => {
    try {
      return await fetch(e.request);
    } catch (err) {
      const has = await caches.has(PACK_CACHE);
      if (!has) throw err;
      const cache = await caches.open(PACK_CACHE);
      const cached = await cache.match(e.request);
      if (cached) return cached;
      throw err;
    }
  })());
});
