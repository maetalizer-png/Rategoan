import { pituturState } from './core/pitutur-state.js';
import { pituturEmbed } from './embed/pitutur-embed.js';
import { pituturDokumen } from './sumber/pitutur-dokumen.js';
import { notebookStore } from './notebook/pitutur-notebook-store.js';
import { daftarSemua } from './sumber/pitutur-channels.js';

const VERSION = '1.0.0';

function pastikanRoot() {
  const g = typeof globalThis !== 'undefined' ? globalThis : window;
  if (!g.Rategoan) g.Rategoan = {};
  return g;
}

export function ikatNamespace(kontrol) {
  const g = pastikanRoot();
  const api = {
    version: VERSION,
    name: 'Pitutur',
    state: pituturState.state,
    saveState: function () { return pituturState.save(true); },
    embed: pituturEmbed,
    loadSource: function (payload) { return pituturEmbed.loadSource(payload); },
    status: function () { return pituturEmbed.status(); },
    progress: function () { return pituturEmbed.progress(); },
    setOptions: function (opsi) { return pituturEmbed.setOptions(opsi); },
    on: function (fn) { return pituturEmbed.on(fn); },
    play: function () { if (kontrol && kontrol.play) return kontrol.play(); },
    stop: function () { if (kontrol && kontrol.stop) return kontrol.stop(); },
    susun: function () { if (kontrol && kontrol.susun) return kontrol.susun(); },
    pause: function () { if (kontrol && kontrol.togglePause) return kontrol.togglePause(); },
    channels: function () { return daftarSemua(); },
    dokumen: pituturDokumen,
    notebook: notebookStore
  };

  g.Rategoan.Pitutur = api;
  g.Pitutur = api;
  return api;
}

export function bacaNamespace() {
  const g = typeof globalThis !== 'undefined' ? globalThis : window;
  return (g.Rategoan && g.Rategoan.Pitutur) || g.Pitutur || null;
}
