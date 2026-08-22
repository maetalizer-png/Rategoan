const CACHE = 'pitutur-shell-v33';
const SHELL = [
  './',
  './index.html',
  './css/main.css',
  './js/pitutur-main.js',
  './js/pitutur-namespace.js',
  './js/core/pitutur-state.js',
  './js/ui/pitutur-handlers.js',
  './js/ui/pitutur-renderer.js',
  './js/naskah/pitutur-script.js',
  './js/naskah/pitutur-chunk.js',
  './js/naskah/pitutur-retrieve.js',
  './js/sumber/pitutur-dataries.js',
  './js/sumber/pitutur-dokumen.js',
  './js/sumber/pitutur-http.js',
  './js/sumber/pitutur-channels.js',
  './js/audio/pitutur-voice.js',
  './js/audio/pitutur-session.js',
  './js/notebook/pitutur-notebook-store.js',
  './js/embed/pitutur-embed.js',
  './js/pitutur-i18n.js',
  './manifest.webmanifest'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (cache) {
      return cache.addAll(SHELL).catch(function () {});
    }).then(function () {
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) {
        return k !== CACHE;
      }).map(function (k) {
        return caches.delete(k);
      }));
    }).then(function () {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function (e) {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  const isCode = url.pathname.endsWith('.js') || url.pathname.endsWith('.css') || url.pathname.endsWith('.html') || url.pathname.endsWith('/');
  e.respondWith(
    fetch(req).then(function (res) {
      if (res && res.ok && isCode) {
        const clone = res.clone();
        caches.open(CACHE).then(function (cache) { cache.put(req, clone); });
      }
      return res;
    }).catch(function () {
      return caches.match(req);
    })
  );
});
