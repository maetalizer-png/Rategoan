const PHONEMIZE_JS = 'https://cdn.jsdelivr.net/npm/@mintplex-labs/piper-tts-web@1.0.5/dist/piper-o91UDS6e.js';
const PIPER_WASM_BASE = 'https://cdn.jsdelivr.net/npm/@diffusionstudio/piper-wasm@1.0.0/build/piper_phonemize';
const ORT_MODULE_URL = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.18.0/dist/esm/ort.wasm.min.js';
const ORT_WASM_BASE = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.18.0/dist/';
const MODEL_URL = 'https://huggingface.co/rhasspy/piper-voices/resolve/main/id/id_ID/news_tts/medium/id_ID-news_tts-medium.onnx';
const MODEL_CONFIG_URL = MODEL_URL + '.json';

const DB_NAME = 'pitutur_tts_lokal';
const DB_VERSION = 1;
const STORE = 'model';
const MAX_CHUNK_LENGTH = 400;

function bukaDb() {
  return new Promise(function (resolve, reject) {
    if (!window.indexedDB) {
      reject(new Error('IndexedDB tidak didukung di perangkat ini.'));
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = function () {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'id' });
      }
    };
    req.onsuccess = function () { resolve(req.result); };
    req.onerror = function () { reject(req.error); };
  });
}

async function ambilCache(id) {
  try {
    const db = await bukaDb();
    return await new Promise(function (resolve, reject) {
      const tx = db.transaction(STORE, 'readonly');
      const req = tx.objectStore(STORE).get(id);
      req.onsuccess = function () { resolve(req.result ? req.result.blob : null); };
      req.onerror = function () { reject(req.error); };
    });
  } catch (e) {
    return null;
  }
}

async function simpanCache(id, blob) {
  try {
    const db = await bukaDb();
    await new Promise(function (resolve, reject) {
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).put({ id: id, blob: blob });
      tx.oncomplete = function () { resolve(); };
      tx.onerror = function () { reject(tx.error); };
    });
  } catch (e) {}
}

export async function modelSudahTersimpan() {
  const blob = await ambilCache('id_ID-news_tts-medium');
  return !!blob;
}

export async function hapusModelTersimpan() {
  try {
    const db = await bukaDb();
    await new Promise(function (resolve, reject) {
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).delete('id_ID-news_tts-medium');
      tx.oncomplete = function () { resolve(); };
      tx.onerror = function () { reject(tx.error); };
    });
  } catch (e) {}
}

async function unduhDenganProgres(url, onProgress) {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Gagal unduh suara: HTTP ' + res.status);
  const total = Number(res.headers.get('Content-Length') || 0);
  const reader = res.body ? res.body.getReader() : null;
  if (!reader) return res.blob();
  let loaded = 0;
  const chunks = [];
  while (true) {
    const hasil = await reader.read();
    if (hasil.done) break;
    chunks.push(hasil.value);
    loaded += hasil.value.length;
    if (onProgress) onProgress({ tahap: 'unduh', loaded: loaded, total: total });
  }
  return new Blob(chunks);
}

async function ambilModelBlob(onProgress) {
  const cached = await ambilCache('id_ID-news_tts-medium');
  if (cached) return cached;
  const blob = await unduhDenganProgres(MODEL_URL, onProgress);
  await simpanCache('id_ID-news_tts-medium', blob);
  return blob;
}

function pcm2wav(buffer, numChannels, sampleRate) {
  const bufferLength = buffer.length;
  const headerLength = 44;
  const view = new DataView(new ArrayBuffer(bufferLength * numChannels * 2 + headerLength));
  view.setUint32(0, 1179011410, true);
  view.setUint32(4, view.buffer.byteLength - 8, true);
  view.setUint32(8, 1163280727, true);
  view.setUint32(12, 544501094, true);
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, numChannels * 2 * sampleRate, true);
  view.setUint16(32, numChannels * 2, true);
  view.setUint16(34, 16, true);
  view.setUint32(36, 1635017060, true);
  view.setUint32(40, 2 * bufferLength, true);
  let p = headerLength;
  for (let i = 0; i < bufferLength; i++) {
    const v = buffer[i];
    if (v >= 1) view.setInt16(p, 32767, true);
    else if (v <= -1) view.setInt16(p, -32768, true);
    else view.setInt16(p, v * 32768 | 0, true);
    p += 2;
  }
  return view.buffer;
}

function splitIntoChunks(text, maxLength) {
  const max = maxLength || MAX_CHUNK_LENGTH;
  const trimmed = String(text || '').trim();
  if (!trimmed) return [];
  if (trimmed.length <= max) return [trimmed];
  const sentences = trimmed.match(/[^.!?…\n]+[.!?…]*\s*/g) || [trimmed];
  const chunks = [];
  let current = '';
  function pushCurrent() {
    const c = current.trim();
    if (c) chunks.push(c);
    current = '';
  }
  sentences.forEach(function (sentence) {
    if ((current + sentence).length > max) pushCurrent();
    if (sentence.length > max) {
      let piece = '';
      sentence.split(/\s+/).forEach(function (word) {
        if ((piece + ' ' + word).trim().length > max) {
          const p = piece.trim();
          if (p) chunks.push(p);
          piece = word;
        } else {
          piece = piece ? piece + ' ' + word : word;
        }
      });
      current = piece;
    } else {
      current += sentence;
    }
  });
  pushCurrent();
  return chunks;
}

let sesiPromise = null;

async function siapkanSesi(onProgress) {
  if (sesiPromise) return sesiPromise;
  sesiPromise = (async function () {
    const [phonemizeMod, ortMod, modelConfig, modelBlob] = await Promise.all([
      import(/* webpackIgnore: true */ PHONEMIZE_JS),
      import(/* webpackIgnore: true */ ORT_MODULE_URL),
      fetch(MODEL_CONFIG_URL).then(function (r) {
        if (!r.ok) throw new Error('Gagal ambil konfigurasi suara: HTTP ' + r.status);
        return r.json();
      }),
      ambilModelBlob(onProgress)
    ]);
    const ort = ortMod.default || ortMod;
    if (ort.env && ort.env.wasm) {
      ort.env.wasm.numThreads = 1;
      ort.env.wasm.wasmPaths = ORT_WASM_BASE;
    }
    const ortSession = await ort.InferenceSession.create(await modelBlob.arrayBuffer(), { executionProviders: ['wasm'] });
    return {
      createPiperPhonemize: phonemizeMod.createPiperPhonemize,
      ort: ort,
      ortSession: ortSession,
      modelConfig: modelConfig
    };
  })().catch(function (err) {
    sesiPromise = null;
    throw err;
  });
  return sesiPromise;
}

function fonemkanTeks(createPiperPhonemize, teks, espeakVoice) {
  const input = JSON.stringify([{ text: teks.trim() }]);
  return new Promise(function (resolve, reject) {
    createPiperPhonemize({
      print: function (data) {
        try { resolve(JSON.parse(data).phoneme_ids); }
        catch (e) { reject(e); }
      },
      printErr: function (message) { reject(new Error(String(message))); },
      locateFile: function (url) {
        if (url.endsWith('.wasm')) return PIPER_WASM_BASE + '.wasm';
        if (url.endsWith('.data')) return PIPER_WASM_BASE + '.data';
        return url;
      }
    }).then(function (module) {
      module.callMain(['-l', espeakVoice, '--input', input, '--espeak_data', '/espeak-ng-data']);
    }, reject);
  });
}

async function bacakanChunk(sesi, teks) {
  const phonemeIds = await fonemkanTeks(sesi.createPiperPhonemize, teks, sesi.modelConfig.espeak.voice);
  const ort = sesi.ort;
  const cfg = sesi.modelConfig;
  const feeds = {
    input: new ort.Tensor('int64', phonemeIds, [1, phonemeIds.length]),
    input_lengths: new ort.Tensor('int64', [phonemeIds.length]),
    scales: new ort.Tensor('float32', [cfg.inference.noise_scale, cfg.inference.length_scale, cfg.inference.noise_w])
  };
  if (cfg.speaker_id_map && Object.keys(cfg.speaker_id_map).length) {
    feeds.sid = new ort.Tensor('int64', [0]);
  }
  const hasil = await sesi.ortSession.run(feeds);
  return hasil.output.data;
}

export async function buatAudioDariNaskah(baris, onProgress) {
  const teksGabung = (baris || []).map(function (b) { return b.text; }).filter(Boolean).join(' ');
  if (!teksGabung.trim()) throw new Error('Naskah kosong, gak ada yang bisa dijadikan audio.');
  const sesi = await siapkanSesi(onProgress);
  const sampleRate = sesi.modelConfig.audio.sample_rate;
  const potongan = splitIntoChunks(teksGabung);
  const pcms = [];
  for (let i = 0; i < potongan.length; i++) {
    if (onProgress) onProgress({ tahap: 'suara', selesai: i, total: potongan.length });
    pcms.push(await bacakanChunk(sesi, potongan[i]));
  }
  if (onProgress) onProgress({ tahap: 'suara', selesai: potongan.length, total: potongan.length });
  const totalLength = pcms.reduce(function (n, p) { return n + p.length; }, 0);
  const merged = new Float32Array(totalLength);
  let offset = 0;
  pcms.forEach(function (p) { merged.set(p, offset); offset += p.length; });
  return new Blob([pcm2wav(merged, 1, sampleRate)], { type: 'audio/x-wav' });
}

export const pituturTtsLokal = {
  buatAudioDariNaskah: buatAudioDariNaskah,
  siapkanSesi: siapkanSesi,
  modelSudahTersimpan: modelSudahTersimpan,
  hapusModelTersimpan: hapusModelTersimpan
};
