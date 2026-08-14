const CDN_ORIGINS = ['https://cdn.jsdelivr.net', 'https://cdn.jsdelivr.net/npm/@xenova'];

const loadedScripts = new Map();

function loadScript(url, globalCheck) {
  if (typeof window === 'undefined') return Promise.reject(new Error('no window'));
  if (globalCheck && globalCheck()) return Promise.resolve(true);
  if (loadedScripts.has(url)) return loadedScripts.get(url);
  const promise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = url;
    script.onload = () => resolve(true);
    script.onerror = () => reject(new Error('gagal memuat ' + url));
    document.head.appendChild(script);
  });
  loadedScripts.set(url, promise);
  return promise;
}

function loadModule(url) {
  return import(/* webpackIgnore: true */ url);
}

export const libLoader = Object.freeze({
  loadScript,
  loadModule,
  CDN_ORIGINS,
});
