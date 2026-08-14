// JALANIN — sw.js (install-only, TANPA cache)
// Semua request langsung ke server → update file langsung terlihat,
// tidak ada file lama / 404 nyangkut di cache.
self.addEventListener('install', () => { self.skipWaiting(); });
self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    try {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
    } catch (err) {}
    await clients.claim();
  })());
});
// sengaja TIDAK ada fetch handler — jaringan langsung