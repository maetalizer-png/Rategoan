import { pituturVoice as V } from './pitutur-voice.js';

function hitungJeda(line, next) {
  if (!next) return 300;
  if (line.intent === 'backchannel' || next.intent === 'backchannel') return 200;
  if (next.speaker !== line.speaker) return 800;
  return 450;
}

export function buatSession(opts) {
  const lines = opts.lines || [];
  const onState = opts.onState || function () {};
  const onLine = opts.onLine || function () {};
  const onWord = opts.onWord || function () {};

  let state = 'idle';
  let idx = 0;
  let controller = null;
  let pausedFlag = false;
  let pausedAntarBaris = false;
  let destroyed = false;
  let sleepHandle = null;
  let wakeLockObj = null;
  let advanceHandle = null;

  function setState(s) {
    state = s;
    onState(s);
  }

  function acquireWakeLock() {
    if (!opts.wakeLock || !navigator.wakeLock) return;
    navigator.wakeLock.request('screen').then(function (wl) {
      wakeLockObj = wl;
    }).catch(function () {});
  }

  function releaseWakeLock() {
    if (wakeLockObj) {
      try { wakeLockObj.release(); } catch (e) {}
      wakeLockObj = null;
    }
  }

  function clearSleepTimer() {
    if (sleepHandle) { clearTimeout(sleepHandle); sleepHandle = null; }
  }

  function clearAdvance() {
    if (advanceHandle) { clearTimeout(advanceHandle); advanceHandle = null; }
  }

  function setupMediaSession() {
    if (!('mediaSession' in navigator)) return;
    try {
      if (opts.mediaTitle) {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: opts.mediaTitle,
          artist: opts.mediaArtist || ''
        });
      }
      navigator.mediaSession.setActionHandler('play', function () { if (state === 'paused') lanjut(); });
      navigator.mediaSession.setActionHandler('pause', function () { if (state === 'playing') jeda(); });
      navigator.mediaSession.setActionHandler('stop', function () { stop('user'); });
    } catch (e) {}
  }

  function lepasMediaSession() {
    if (!('mediaSession' in navigator)) return;
    try {
      navigator.mediaSession.setActionHandler('play', null);
      navigator.mediaSession.setActionHandler('pause', null);
      navigator.mediaSession.setActionHandler('stop', null);
    } catch (e) {}
  }

  function playNext() {
    if (destroyed || state !== 'playing') return;
    if (idx >= lines.length) { selesai(); return; }
    const line = lines[idx];
    onLine(line, idx);
    controller = V.speakLine(
      line,
      opts.lang,
      function (ci, cl) { onWord(line, ci, cl); },
      function () {
        const next = lines[idx + 1];
        const gap = hitungJeda(line, next);
        idx++;
        if (state === 'playing') {
          advanceHandle = setTimeout(function () {
            advanceHandle = null;
            if (state === 'playing') playNext();
          }, gap);
        }
      },
      { isPaused: function () { return pausedFlag; } }
    );
  }

  function selesai() {
    setState('ended');
    V.stinger('outro', opts.channel);
    if (opts.roomTone) V.roomTone(false);
    releaseWakeLock();
    clearSleepTimer();
  }

  function mulai() {
    if (destroyed || state === 'playing') return;
    setState('playing');
    V.stinger('intro', opts.channel);
    if (opts.roomTone) V.roomTone(true);
    acquireWakeLock();
    setupMediaSession();
    playNext();
  }

  function jeda() {
    if (state !== 'playing') return;
    pausedFlag = true;

    pausedAntarBaris = !!advanceHandle;
    clearAdvance();
    if (V.dukungJedaNative() && !pausedAntarBaris) {
      try { window.speechSynthesis.pause(); } catch (e) {}
    }
    setState('paused');
  }

  function lanjut() {
    if (state !== 'paused') return;
    pausedFlag = false;
    setState('playing');
    if (pausedAntarBaris) {

      pausedAntarBaris = false;
      playNext();
      return;
    }
    if (V.dukungJedaNative()) {
      try { window.speechSynthesis.resume(); } catch (e) {}
      return;
    }

  }

  function stop(reason) {
    if (state === 'idle') return;
    pausedFlag = false;
    clearAdvance();
    if (controller) { controller.cancel(); controller = null; }
    try { window.speechSynthesis.cancel(); } catch (e) {}
    clearSleepTimer();
    releaseWakeLock();
    if (opts.roomTone) V.roomTone(false);
    setState(reason === 'sleep' ? 'sleep' : 'stopped');
  }

  function lompatKe(target) {
    if (destroyed) return;
    if (target < 0 || target >= lines.length) return;
    clearAdvance();
    if (controller) { controller.cancel(); controller = null; }
    try { window.speechSynthesis.cancel(); } catch (e) {}
    idx = target;
    pausedFlag = false;
    setState('playing');
    playNext();
  }

  function aturSleep(menit) {
    clearSleepTimer();
    if (!menit) return;
    sleepHandle = setTimeout(function () { stop('sleep'); }, menit * 60000);
  }

  function onVisibility() {
    if (document.visibilityState === 'visible' && state === 'playing' && opts.wakeLock) {
      acquireWakeLock();
    }
  }
  document.addEventListener('visibilitychange', onVisibility);

  function hancurkan() {
    if (destroyed) return;
    destroyed = true;
    clearAdvance();
    if (controller) { controller.cancel(); controller = null; }
    try { window.speechSynthesis.cancel(); } catch (e) {}
    clearSleepTimer();
    releaseWakeLock();
    if (opts.roomTone) V.roomTone(false);
    lepasMediaSession();
    document.removeEventListener('visibilitychange', onVisibility);
  }

  return {
    mulai: mulai,
    jeda: jeda,
    lanjut: lanjut,
    stop: stop,
    lompatKe: lompatKe,
    aturSleep: aturSleep,
    hancurkan: hancurkan
  };
}
