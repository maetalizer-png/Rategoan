import { pituturState } from '../core/pitutur-state.js';
import { pituturDokumen } from '../sumber/pitutur-dokumen.js';

const LISTENERS = [];

function emit(type, payload) {
  const event = { type: type, payload: payload || {}, at: Date.now() };
  LISTENERS.forEach(function (fn) {
    try { fn(event); } catch (e) {}
  });
  try {
    window.parent.postMessage({ source: 'pitutur', ...event }, '*');
  } catch (e) {}
  try {
    window.dispatchEvent(new CustomEvent('pitutur', { detail: event }));
  } catch (e) {}
}

function onEvent(fn) {
  if (typeof fn === 'function') LISTENERS.push(fn);
  return function () {
    const i = LISTENERS.indexOf(fn);
    if (i >= 0) LISTENERS.splice(i, 1);
  };
}

async function terimaSumber(input) {
  if (!input) throw new Error('Sumber kosong');
  if (typeof input === 'string') {
    const doc = await pituturDokumen.tambahTeks('Sumber induk.txt', input, 'txt');
    const state = pituturState.state;
    state.sources.dokumen = true;
    state.channel = 'doc:' + doc.id;
    pituturState.save();
    emit('source:ready', { docId: doc.id, words: doc.words, name: doc.name });
    try { window.dispatchEvent(new Event('pitutur-materi-update')); } catch (e) {}
    return doc;
  }
  if (input.text) {
    const name = input.title || input.name || 'Sumber induk.txt';
    const doc = await pituturDokumen.tambahTeks(name, input.text, input.type || 'txt');
    const state = pituturState.state;
    state.sources.dokumen = true;
    state.channel = 'doc:' + doc.id;
    if (input.mode === 'ringkas' || input.mode === 'faq' || input.mode === 'baca') {
      state.docMode = input.mode;
    }
    if (input.lang) state.lang = input.lang;
    if (input.speakMode) state.mode = input.speakMode;
    pituturState.save();
    emit('source:ready', { docId: doc.id, words: doc.words, name: doc.name });
    try { window.dispatchEvent(new Event('pitutur-materi-update')); } catch (e) {}
    return doc;
  }
  if (input.docId) {
    const doc = await pituturDokumen.ambil(input.docId);
    if (!doc) throw new Error('docId tidak ditemukan');
    const state = pituturState.state;
    state.sources.dokumen = true;
    state.channel = 'doc:' + doc.id;
    pituturState.save();
    emit('source:ready', { docId: doc.id, words: doc.words, name: doc.name });
    try { window.dispatchEvent(new Event('pitutur-materi-update')); } catch (e) {}
    return doc;
  }
  throw new Error('Format sumber tidak dikenali');
}

function bacaProgres() {
  const state = pituturState.state;
  return {
    docPos: Object.assign({}, state.docPos || {}),
    channel: state.channel,
    mode: state.mode,
    docMode: state.docMode,
    episode: state.episode,
    plays: state.plays
  };
}

function bacaStatus() {
  const state = pituturState.state;
  return {
    channel: state.channel,
    mode: state.mode,
    docMode: state.docMode,
    lang: state.lang,
    rate: state.rate,
    sources: Object.assign({}, state.sources),
    progress: bacaProgres()
  };
}

function terapkanOpsi(opsi) {
  if (!opsi || typeof opsi !== 'object') return bacaStatus();
  const state = pituturState.state;
  if (opsi.mode) state.mode = opsi.mode;
  if (opsi.docMode) state.docMode = opsi.docMode;
  if (opsi.lang) state.lang = opsi.lang;
  if (typeof opsi.rate === 'number') state.rate = opsi.rate;
  if (opsi.channel) state.channel = opsi.channel;
  if (opsi.sources && typeof opsi.sources === 'object') {
    Object.keys(opsi.sources).forEach(function (k) {
      state.sources[k] = !!opsi.sources[k];
    });
  }
  pituturState.save();
  emit('options:applied', bacaStatus());
  return bacaStatus();
}

function handleMessage(ev) {
  const data = ev && ev.data;
  if (!data || data.target !== 'pitutur') return;
  const action = data.action;
  const id = data.id;
  const reply = function (ok, result, error) {
    try {
      (ev.source || window.parent).postMessage({
        source: 'pitutur',
        id: id,
        ok: ok,
        result: result,
        error: error || null
      }, '*');
    } catch (e) {}
  };

  if (action === 'ping') {
    reply(true, { version: 1, name: 'pitutur' });
    return;
  }
  if (action === 'status') {
    reply(true, bacaStatus());
    return;
  }
  if (action === 'progress') {
    reply(true, bacaProgres());
    return;
  }
  if (action === 'setOptions') {
    reply(true, terapkanOpsi(data.payload));
    return;
  }
  if (action === 'loadSource') {
    terimaSumber(data.payload).then(function (doc) {
      reply(true, { docId: doc.id, words: doc.words, name: doc.name });
    }).catch(function (err) {
      reply(false, null, err && err.message ? err.message : 'gagal');
    });
    return;
  }
  if (action === 'play' || action === 'stop' || action === 'preview') {
    emit('command:' + action, data.payload || {});
    reply(true, { accepted: true });
    return;
  }
  reply(false, null, 'unknown action');
}

function deepLinkDariQuery() {
  try {
    const q = new URLSearchParams(window.location.search);
    const docId = q.get('doc');
    const mode = q.get('mode');
    const docMode = q.get('docMode');
    const lang = q.get('lang');
    const state = pituturState.state;
    if (docId) {
      state.sources.dokumen = true;
      state.channel = 'doc:' + docId;
    }
    if (mode) state.mode = mode;
    if (docMode) state.docMode = docMode;
    if (lang) state.lang = lang;
    pituturState.save();
  } catch (e) {}
}

export function initEmbed() {
  deepLinkDariQuery();
  window.addEventListener('message', handleMessage);
  emit('ready', bacaStatus());
}

export function laporSelesai(meta) {
  emit('episode:ended', meta || {});
}

export function laporProgres(meta) {
  emit('progress', meta || bacaProgres());
}

export const pituturEmbed = {
  init: initEmbed,
  on: onEvent,
  loadSource: terimaSumber,
  status: bacaStatus,
  progress: bacaProgres,
  setOptions: terapkanOpsi,
  emit: emit,
  laporSelesai: laporSelesai,
  laporProgres: laporProgres
};
