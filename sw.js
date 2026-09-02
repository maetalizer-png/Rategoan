'use strict';
const CDN_PACKAGE_CACHE = 'raget-cdn-packages-v1';
const CDN_PACKAGE_ORIGINS = [
  'https://cdn.jsdelivr.net',
  // huggingface.co juga menyajikan checkpoint 200M (~163MB, diambil
  // otomatis di background - lihat neural-provider.js) - sekali diunduh,
  // disajikan dari cache ini terus (offline-capable) sampai versi cache
  // di atas dinaikkan.
  'https://huggingface.co',
];

self.addEventListener('install', () => {
  self.skipWaiting();
});
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k === CDN_PACKAGE_CACHE ? Promise.resolve() : caches.delete(k))))
    ).then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', (e) => {
  const url = e.request.url;
  if (!CDN_PACKAGE_ORIGINS.some((origin) => url.indexOf(origin) === 0)) return;
  e.respondWith(
    caches.open(CDN_PACKAGE_CACHE).then((cache) =>
      cache.match(e.request).then((cached) => {
        if (cached) return cached;
        return fetch(e.request).then((res) => {
          if (res && res.ok) cache.put(e.request, res.clone());
          return res;
        });
      })
    )
  );
});