import { pituturState } from './core/pitutur-state.js';
import { buildScript } from './naskah/pitutur-script.js';
import { pituturVoice as V } from './audio/pitutur-voice.js';
import { pituturRenderer as R } from './ui/pitutur-renderer.js';
import { attach } from './ui/pitutur-handlers.js';
import { buatSession } from './audio/pitutur-session.js';
import { kanal } from './sumber/pitutur-channels.js';
import { pituturEmbed } from './embed/pitutur-embed.js';
import { ikatNamespace } from './pitutur-namespace.js';
import { buatAudioDariNaskah } from './audio/pitutur-tts-lokal.js';

const PANDUAN =
  'Buka <b>Sumber</b>, unggah dokumenmu (PDF/teks/URL), lalu tekan Susun Naskah dan <b>Putar</b>. ' +
  'Mau coba topik dari pustaka kami saja? Bisa, tapi cakupannya masih terbatas. ' +
  'Mode dan kecepatan ada di bawah.';

const FALLBACK_NASKAH = [
  { speaker: 'Warta', text: 'Selamat datang. Ini siaran singkat dari Pitutur.', intent: 'inform' },
  { speaker: 'Warta', text: 'Pitutur membaca dokumenmu — PDF, teks, atau URL — lalu membacakan ringkasannya dengan suara perangkatmu.', intent: 'inform' },
  { speaker: 'Warta', text: 'Tidak perlu internet untuk memutar. Unggah dokumen di Sumber, susun, dan dengarkan.', intent: 'inform' },
  { speaker: 'Warta', text: 'Tekan Sumber kalau mau coba topik dari pustaka kami — tapi cakupannya masih terbatas, kadang meleset.', intent: 'inform' },
  { speaker: 'Warta', text: 'Ambil satu ide dari siaran ini. Coba hari ini, jangan besok.', intent: 'tegas' }
];

const state = pituturState.state;

let session = null;
let naskah = null;
let menyiapkan = false;
let topikNaskah = 'siaran umum';
let isPaused = false;
let sudahSiapPertama = false;

function countWords(lines) {
  return lines.reduce(function (n, l) { return n + l.text.split(/\s+/).length; }, 0);
}

function onSeek(idx) {
  if (session) session.lompatKe(idx);
}

function adaMasukanUntukSusun() {
  const topik = R.$('topic') ? R.$('topic').value.trim() : '';
  if (topik) return true;
  return String(state.channel || '').indexOf('doc:') === 0;
}

function bukaSumber() {
  const sheet = R.$('sheetSumber');
  const scrim = R.$('scrim');
  const btn = document.querySelector('.barBtn[data-sheet="sheetSumber"]');
  if (sheet) sheet.classList.add('open');
  if (scrim) scrim.classList.add('on');
  if (btn) btn.classList.add('on');
}

function perbaruiTombolUnduh() {
  const btn = R.$('btnUnduhAudio');
  const hint = R.$('unduhAudioHint');
  if (btn) btn.hidden = !naskah;
  if (hint) hint.hidden = !naskah;
}

function susun() {
  const topik = R.$('topic') ? R.$('topic').value.trim() : '';
  return buildScript(topik).then(function (lines) {
    if (!lines.length) {
      R.toast('Belum ada naskah');
      return null;
    }
    topikNaskah = topik || 'siaran umum';
    naskah = lines;
    R.renderNaskah(lines, onSeek);
    R.updateEpInfo(countWords(lines));
    perbaruiTombolUnduh();
    const nBaris = lines.length;
    R.toast('Naskah siap · ' + nBaris + ' baris — tekan Putar');
    return lines;
  });
}

function batalNaskah() {
  naskah = null;
  R.$('transcript').innerHTML = PANDUAN;
  perbaruiTombolUnduh();
}

function lineDariHist(l) {
  return { speaker: l.s, text: l.i, intent: l.t || 'inform' };
}

function loadHist(h) {
  const lines = (h.lines || []).map(lineDariHist).filter(function (l) { return l.text; });
  if (!lines.length) return;
  topikNaskah = h.topik || 'siaran umum';
  naskah = lines;
  R.renderNaskah(lines, onSeek);
  R.updateEpInfo(h.words);
  perbaruiTombolUnduh();
  R.toast('Naskah Siaran #' + h.n + ' dimuat — tekan Putar');
}

function bariskanUntukHistori(lines) {
  return lines.map(function (l) {
    return { s: l.speaker, t: l.intent || 'inform', i: l.text, g: l.sumber ? l.sumber.grup : null };
  });
}

function tampilkanStats() {
  R.showStats({ plays: state.plays, minutes: state.stats.minutes, streak: state.stats.streak });
}

function finish(words, lines) {
  state.plays += 1;
  state.lastListen = Date.now();
  state.history.push({
    n: state.episode,
    channel: state.channel,
    words: words,
    date: Date.now(),
    topik: topikNaskah,
    lines: bariskanUntukHistori(lines)
  });
  if (state.history.length > 8) state.history = state.history.slice(-8);
  const mins = Math.max(1, Math.round(words / (138 * state.rate)));
  pituturState.catatMenit(mins);
  if (lines._koleksiKunci) pituturState.catatKoleksi(lines._koleksiKunci);
  if (lines._dokumenPos) {
    pituturState.catatDokumenPos(lines._dokumenPos.docId, lines._dokumenPos.pos);
    try { window.dispatchEvent(new Event('pitutur-materi-update')); } catch (e) {}
  }
  pituturState.save(true);
  R.clearSeats();
  R.waveOn(false);
  R.setAir(false);
  R.updateControls(false);
  R.renderHistory(loadHist);
  tampilkanStats();
  R.updateEpInfo(words);
  if (lines._dokumenPos) {
    R.toast('Siaran #' + state.episode + ' selesai — Susun Naskah lagi untuk lanjut materi');
  } else {
    R.toast('Siaran #' + state.episode + ' selesai');
  }
  pituturEmbed.laporSelesai({
    episode: state.episode,
    words: words,
    channel: state.channel,
    topik: topikNaskah,
    progress: pituturEmbed.progress()
  });
  if (session) { session.hancurkan(); session = null; }
}

function hentikanUI(alasan) {
  R.clearSeats();
  R.waveOn(false);
  R.setAir(false);
  R.updateControls(false);
  if (naskah) R.renderNaskah(naskah, onSeek);
  if (alasan === 'sleep') R.toast('Tidur nyenyak, siaran dihentikan.');
  if (session) { session.hancurkan(); session = null; }
}

function onSessionState(s) {
  if (s === 'playing') {
    isPaused = false;
    R.updateControls(true);
    R.setPaused(false);
    R.waveOn(true);
    R.setAir(true);
    return;
  }
  if (s === 'paused') {
    isPaused = true;
    R.setPaused(true);
    return;
  }
  if (s === 'ended') return;
  if (s === 'stopped' || s === 'sleep') {
    hentikanUI(s);
    return;
  }
}

function onLine(line, idx) {
  R.setActive(line.speaker);
  if (typeof R.setNaskahAktif === 'function' && typeof idx === 'number') {
    R.setNaskahAktif(idx);
  }
  R.showCaption(line, idx);
}

function onWord(line, ci, cl) {
  R.highlightWord(line, ci, cl);
}

function mulaiSesi(lines) {
  const words = countWords(lines);
  R.updateEpInfo(words);
  state.episode += 1;
  session = buatSession({
    lines: lines,
    lang: state.lang,
    rate: state.rate,
    channel: state.channel,
    roomTone: state.settings.roomTone,
    wakeLock: state.settings.wakeLock,
    mediaTitle: 'Siaran #' + state.episode,
    mediaArtist: kanal(state.channel).label,
    onState: function (s) {
      onSessionState(s);
      if (s === 'ended') finish(words, lines);
    },
    onLine: onLine,
    onWord: onWord
  });
  session.aturSleep(state.settings.sleep);
  session.mulai();
}

function play() {
  if (session) return;
  if (menyiapkan) return;
  if (!window.speechSynthesis) { R.toast('Perangkat tidak mendukung suara'); return; }
  if (naskah) {
    mulaiSesi(naskah);
    return;
  }
  if (!adaMasukanUntukSusun()) {
    R.toast('Isi topik atau pilih dokumen dulu di Sumber');
    bukaSumber();
    return;
  }
  menyiapkan = true;
  susun().then(function (lines) {
    if (lines) mulaiSesi(lines);
    else if (FALLBACK_NASKAH.length) {
      naskah = FALLBACK_NASKAH.slice();
      R.renderNaskah(naskah, onSeek);
      perbaruiTombolUnduh();
      mulaiSesi(naskah);
    }
  }).finally(function () {
    menyiapkan = false;
  });
}

function stop() { if (!session) return; session.stop('user'); }

function togglePause() {
  if (!session) return;
  if (isPaused) session.lanjut();
  else session.jeda();
}

function aturSleep(menit) {
  if (session) session.aturSleep(menit);
}

function siapkanPertama() {
  if (sudahSiapPertama) return;
  sudahSiapPertama = true;
  if (!state.channel || String(state.channel).indexOf('doc:') === 0) {
    state.channel = 'pagi';
  }
  if (state.sources.dataries == null) state.sources.dataries = true;
  pituturState.save();
  if (!naskah) {
    R.$('transcript').innerHTML = PANDUAN;
    R.updateEpInfo(0);
  }
}

let sedangUnduhAudio = false;

function unduhAudioSekarang() {
  if (sedangUnduhAudio || !naskah) return;
  sedangUnduhAudio = true;
  const btn = R.$('btnUnduhAudio');
  const label = R.$('unduhAudioLabel');
  if (btn) btn.disabled = true;
  buatAudioDariNaskah(naskah, function (progres) {
    if (!label) return;
    if (progres.tahap === 'unduh') {
      label.textContent = progres.total
        ? 'Mengunduh suara ' + Math.round((progres.loaded / progres.total) * 100) + '%…'
        : 'Mengunduh suara…';
    } else if (progres.tahap === 'suara') {
      label.textContent = 'Menyusun audio ' + progres.selesai + '/' + progres.total + '…';
    }
  }).then(function (blob) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pitutur-siaran-' + (state.episode + 1) + '.wav';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
    R.toast('Audio siap diunduh');
  }).catch(function (err) {
    R.toast('Gagal bikin audio: ' + (err && err.message ? err.message : 'tidak diketahui'));
  }).finally(function () {
    sedangUnduhAudio = false;
    if (btn) btn.disabled = false;
    if (label) label.textContent = 'Unduh Audio (suara lokal Indonesia)';
  });
}

const btnUnduhAudio = R.$('btnUnduhAudio');
if (btnUnduhAudio) btnUnduhAudio.addEventListener('click', unduhAudioSekarang);

attach({
  play: play,
  stop: stop,
  susun: susun,
  batal: batalNaskah,
  togglePause: togglePause,
  aturSleep: aturSleep
});
R.waveInit();
R.clearSeats();
R.setAir(false);
R.renderHistory(loadHist);
tampilkanStats();
R.updateControls(false);
R.$('transcript').innerHTML = PANDUAN;

V.waitForVoices().then(function () {
  if (V.filterBahasa) V.filterBahasa();
  siapkanPertama();
});

setTimeout(function () {
  if (!sudahSiapPertama) siapkanPertama();
}, 2500);

pituturEmbed.init();
pituturEmbed.on(function (ev) {
  if (!ev || !ev.type) return;
  if (ev.type === 'command:play') play();
  if (ev.type === 'command:stop') stop();
  if (ev.type === 'command:preview') susun();
  if (ev.type === 'source:ready') {
    batalNaskah();
    try { window.dispatchEvent(new Event('pitutur-materi-update')); } catch (e) {}
    R.toast('Sumber dari aplikasi induk siap — Susun Naskah lalu Putar');
  }
});
const kontrol = {
  play: play,
  stop: stop,
  susun: susun,
  togglePause: togglePause
};
ikatNamespace(kontrol);
