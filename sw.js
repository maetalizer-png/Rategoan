'use strict';
const CDN_PACKAGE_CACHE = 'raget-cdn-packages-v1';
const CDN_PACKAGE_ORIGINS = [
  'https://cdn.jsdelivr.net',
  // huggingface.co menyajikan seluruh checkpoint neural (ringan, berat,
  // super). Sekali diunduh, disajikan dari cache ini sampai versi cache
  // di atas dinaikkan.
  'https://huggingface.co',
];
// Shell aplikasi sendiri (index.html/js/css) - tanpa ini, app tidak
// benar-benar bisa dibuka offline walau CDN package sudah di-cache.
const APP_SHELL_CACHE = 'raget-app-shell-v1';

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(APP_SHELL_CACHE).then((cache) => cache.addAll(['./', './index.html'])).catch(() => {})
  );
  self.skipWaiting();
});
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k === CDN_PACKAGE_CACHE || k === APP_SHELL_CACHE ? Promise.resolve() : caches.delete(k))))
    ).then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', (e) => {
  const url = e.request.url;
  if (CDN_PACKAGE_ORIGINS.some((origin) => url.indexOf(origin) === 0)) {
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
    return;
  }

  if (e.request.method !== 'GET' || new URL(url).origin !== self.location.origin) return;
  // Shell aplikasi sendiri: network-first (supaya selalu dapat versi
  // terbaru saat online) dengan cache ditulis ulang tiap sukses, jatuh
  // ke cache (atau index.html untuk navigasi) kalau offline.
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(APP_SHELL_CACHE).then((cache) => cache.put(e.request, copy));
        }
        return res;
      })
      .catch(() =>
        caches.open(APP_SHELL_CACHE).then((cache) =>
          cache.match(e.request).then((cached) => cached || (e.request.mode === 'navigate' ? cache.match('./index.html') : undefined))
        )
      )
  );
});