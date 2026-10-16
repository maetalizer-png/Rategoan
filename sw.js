'use strict';
const CDN_PACKAGE_CACHE = 'raget-cdn-packages';
const CDN_PACKAGE_ORIGINS = [
  'https://cdn.jsdelivr.net',
  'https://huggingface.co',
];
const APP_SHELL_CACHE = 'raget-app-shell';
const DATA_CACHE = 'raget-knowledge-json';

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(APP_SHELL_CACHE).then((cache) => Promise.all([
      './',
      './index.html',
      './privacy.html',
      './manifest.webmanifest',
      './assets/icons/icon-192.png',
      './assets/icons/icon-512.png',
      './assets/icons/icon.svg',
      './css/layout/shell.css',
      './css/main.css',
      './css/tokens.css',
      './css/chat/messages.css',
      './css/account/settings.css',
      './js/main.js',
      './studio.html',
      './studio-preview.html',
      './css/ui/studio.css',
      './css/ui/thought.css',
      './js/studio/studio-app.js',
      './js/studio/studio-agent.js',
      './js/studio/vfs.js',
    ].map((url) => cache.add(new Request(url, { cache: 'reload' })).catch(() => {}))))
  );
  self.skipWaiting();
});
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (
        k === CDN_PACKAGE_CACHE || k === APP_SHELL_CACHE || k === DATA_CACHE || k.indexOf('rategoan-') === 0
          ? Promise.resolve()
          : caches.delete(k)
      )))
    ).then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', (e) => {
  if (e.request.headers && e.request.headers.has('range')) return;
  const url = e.request.url;
  if (url.indexOf('/raget-data/json/') >= 0 || url.indexOf('/raget/raget-data/json/') >= 0) {
    e.respondWith(
      caches.open(DATA_CACHE).then((cache) =>
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
  if (CDN_PACKAGE_ORIGINS.some((origin) => url.indexOf(origin) === 0)) {
    e.respondWith(
      caches.open(CDN_PACKAGE_CACHE).then((cache) =>
        cache.match(e.request).then((cached) => {
          if (cached) return cached;
          return fetch(e.request).then((res) => {
            if (res && res.ok && res.status !== 206) cache.put(e.request, res.clone()).catch(() => {});
            return res;
          });
        })
      )
    );
    return;
  }

  if (e.request.method !== 'GET' || new URL(url).origin !== self.location.origin) return;
  e.respondWith(
    fetch(e.request, { cache: 'no-cache' })
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