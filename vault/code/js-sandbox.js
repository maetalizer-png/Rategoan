export const SANDBOX_WATCH_MS = 2000;

function workerSrc() {
  return (
    'function lock(name){try{Object.defineProperty(self,name,{configurable:false,get:function(){throw new DOMException("diblokir sandbox","SecurityError");}});}catch(e){try{self[name]=undefined;}catch(e2){}}}' +
    '["indexedDB","fetch","XMLHttpRequest","WebSocket","EventSource","importScripts","BroadcastChannel"].forEach(lock);' +
    'self.onmessage = function (ev) {' +
    '  let code = String(ev.data && ev.data.code || "");' +
    '  let logs = [];' +
    '  let fake = { log: function () { logs.push(Array.prototype.slice.call(arguments).map(String).join(" ")); },' +
    '    warn: function () { logs.push(Array.prototype.slice.call(arguments).map(String).join(" ")); },' +
    '    error: function () { logs.push(Array.prototype.slice.call(arguments).map(String).join(" ")); } };' +
    '  try {' +
    '    let fn = new Function("console", "return (function(){\\n" + code + "\\n})();");' +
    '    let value = fn(fake);' +
    '    self.postMessage({ ok: true, logs: logs, value: value == null ? "" : String(value) });' +
    '  } catch (e) {' +
    '    self.postMessage({ ok: false, logs: logs, error: e && e.message ? e.message : String(e) });' +
    '  }' +
    '};' +
    'try{Object.freeze(Object.prototype);}catch(e){}'
  );
}

function run(code) {
  const src = String(code || '');
  if (!src.trim()) return Promise.resolve({ ok: false, error: 'Tidak ada kode.' });
  return new Promise((resolve) => {
    let done = false;
    const blob = new Blob([workerSrc()], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const worker = new Worker(url);
    const timer = setTimeout(() => {
      if (done) return;
      done = true;
      worker.terminate();
      URL.revokeObjectURL(url);
      resolve({ ok: false, error: 'Timeout ' + SANDBOX_WATCH_MS + ' ms.' });
    }, SANDBOX_WATCH_MS);
    worker.onmessage = (ev) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      worker.terminate();
      URL.revokeObjectURL(url);
      resolve(ev.data || { ok: false, error: 'Kosong.' });
    };
    worker.onerror = (ev) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      worker.terminate();
      URL.revokeObjectURL(url);
      resolve({ ok: false, error: ev && ev.message ? ev.message : 'Worker error.' });
    };
    worker.postMessage({ code: src });
  });
}

export const jsSandbox = Object.freeze({ run });
