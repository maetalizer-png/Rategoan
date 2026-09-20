/** Sandbox JS: Web Worker di browser, vm di Node. Timeout wajib. Tanpa fs/network. */

const DEFAULT_MS = 800;

function wrapSource(src) {
  return (
    '"use strict";\n' +
    'const result = (function(){\n' +
    String(src || '') +
    '\n})();\n' +
    'result;'
  );
}

export async function runJs(src, timeoutMs) {
  const ms = timeoutMs || DEFAULT_MS;
  if (typeof Worker !== 'undefined' && typeof Blob !== 'undefined') {
    const body =
      'self.onmessage=function(){try{var r=(function(){\n' +
      String(src || '') +
      '\n})();self.postMessage({ok:true,value:String(r)});}catch(e){self.postMessage({ok:false,error:String(e&&e.message||e)});}};';
    const blob = new Blob([body], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    return await new Promise((resolve) => {
      const w = new Worker(url);
      const t = setTimeout(() => {
        w.terminate();
        URL.revokeObjectURL(url);
        resolve({ ok: false, error: 'timeout' });
      }, ms);
      w.onmessage = (ev) => {
        clearTimeout(t);
        w.terminate();
        URL.revokeObjectURL(url);
        resolve(ev.data);
      };
      w.onerror = (ev) => {
        clearTimeout(t);
        w.terminate();
        URL.revokeObjectURL(url);
        resolve({ ok: false, error: String(ev.message || 'worker') });
      };
      w.postMessage(1);
    });
  }
  const vm = await import('node:vm');
  try {
    const ctx = vm.createContext(Object.create(null));
    const script = new vm.Script(wrapSource(src), { timeout: ms });
    const value = script.runInContext(ctx, { timeout: ms });
    return { ok: true, value };
  } catch (e) {
    return { ok: false, error: String(e && e.message ? e.message : e) };
  }
}

export const jsSandbox = Object.freeze({ runJs });
