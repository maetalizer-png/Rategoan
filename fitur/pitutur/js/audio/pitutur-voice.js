import { pituturState } from '../core/pitutur-state.js';

const SPEAKERS = {
  Warta: { pitch: 1.0, rate: 1.0, gender: 'male', pauseFactor: 0.9, pitchVariance: 0.03, gaya: 'warta' },
  Tanya: { pitch: 1.22, rate: 1.12, gender: 'female', pauseFactor: 0.7, pitchVariance: 0.08, gaya: 'tanya' },
  Kisah: { pitch: 0.72, rate: 0.8, gender: 'male', pauseFactor: 1.5, pitchVariance: 0.05, gaya: 'kisah' }
};

const RESEP = {
  inform: { pitch: 1.0, rate: 1.0, jeda: 260 },
  tanya: { pitch: 1.08, rate: 1.05, jeda: 240 },
  ragu: { pitch: 0.95, rate: 0.92, jeda: 380 },
  backchannel: { pitch: 1.05, rate: 1.1, jeda: 150 },
  canda: { pitch: 1.12, rate: 1.08, jeda: 220 },
  tegas: { pitch: 0.92, rate: 0.95, jeda: 320 },
  kisah: { pitch: 0.95, rate: 0.88, jeda: 420 }
};

const NADA_SALURAN = {
  pagi: [523.25, 659.25, 783.99, 1046.5],
  tokoh: [440, 554.37, 659.25, 880],
  koleksi: [493.88, 587.33, 739.99, 987.77]
};

const KODE_BAHASA = {
  id: 'id-ID', en: 'en-US', jv: 'jv-ID', su: 'su-ID',
  es: 'es-ES', de: 'de-DE', pt: 'pt-BR', zh: 'zh-CN', ja: 'ja-JP', ko: 'ko-KR'
};

const INTERJECTION_RE = /^(Wah|Hmm+|Eh|Iya nih|Lho|Oke|Nah|Waduh)[,!]?[ ]*/i;
const MALE_RE = /(male|pria|laki|man)/i;
const FEMALE_RE = /(female|wanita|perempuan|woman)/i;
const KATA_ANGKA = ['nol', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan', 'sepuluh', 'sebelas'];

function terbilang(n) {
  n = Math.floor(Math.abs(n));
  if (n < 12) return KATA_ANGKA[n];
  if (n < 20) return terbilang(n - 10) + ' belas';
  if (n < 100) return terbilang(Math.floor(n / 10)) + ' puluh ' + terbilang(n % 10);
  if (n < 200) return 'seratus ' + terbilang(n - 100);
  if (n < 1000) return terbilang(Math.floor(n / 100)) + ' ratus ' + terbilang(n % 100);
  if (n < 2000) return 'seribu ' + terbilang(n - 1000);
  if (n < 1000000) return terbilang(Math.floor(n / 1000)) + ' ribu ' + terbilang(n % 1000);
  if (n < 1000000000) return terbilang(Math.floor(n / 1000000)) + ' juta ' + terbilang(n % 1000000);
  return terbilang(Math.floor(n / 1000000000)) + ' miliar ' + terbilang(n % 1000000000);
}

function eja(t) {
  return String(t).replace(/[0-9]{1,3}([.][0-9]{3})+(,[0-9]+)?/g, function (m) {
    const n = parseFloat(m.split('.').join('').replace(',', '.'));
    if (!isFinite(n)) return m;
    return terbilang(n);
  });
}

const TITIK = String.fromCharCode(1);

function sentences(text) {
  const aman = text
    .replace(/([0-9])[.]([0-9][0-9][0-9])/g, '$1' + TITIK + '$2')
    .replace(/([0-9])[.]([0-9])/g, '$1' + TITIK + '$2');
  const parts = aman.match(/[^.!?]+[.!?]*/g) || [aman];
  const out = [];
  for (let i = 0; i < parts.length; i++) {
    const s = parts[i].split(TITIK).join('.').trim();
    if (s) out.push(s);
  }
  return out;
}

let voicesReady = null;
let roomNode = null;
let ctxStinger = null;
const charVoiceCache = {};

function daftarVoice() {
  return window.speechSynthesis ? window.speechSynthesis.getVoices() : [];
}

function bacaCast() {
  try { return JSON.parse(localStorage.getItem('raget_pitutur_cast') || 'null') || {}; } catch (e) { return {}; }
}

function simpanCast(cast) {
  try {
    localStorage.setItem('raget_pitutur_cast', JSON.stringify(cast || {}));
  } catch (e) {}
  bersihkanCacheVoice();
}

function bersihkanCacheVoice() {
  Object.keys(charVoiceCache).forEach(function (k) { delete charVoiceCache[k]; });
}

function waitForVoices(ms) {
  if (!window.speechSynthesis) return Promise.resolve([]);
  if (voicesReady) return voicesReady;
  voicesReady = new Promise(function (resolve) {
    const existing = daftarVoice();
    if (existing.length) {
      resolve(existing);
      window.dispatchEvent(new Event('pitutur-voices'));
      return;
    }
    let done = false;
    const onChange = function () { finish(daftarVoice()); };
    const finish = function (v) {
      if (!done) {
        done = true;
        window.speechSynthesis.removeEventListener('voiceschanged', onChange);
        resolve(v || []);
        window.dispatchEvent(new Event('pitutur-voices'));
      }
    };
    window.speechSynthesis.addEventListener('voiceschanged', onChange);
    setTimeout(function () { finish(daftarVoice()); }, ms || 1500);
  });
  return voicesReady;
}

function filterBahasa() {
  const select = document.getElementById('lang');
  if (!select) return;
  const all = daftarVoice();
  if (!all.length) return;
  const state = pituturState.state;
  Array.prototype.forEach.call(select.options, function (opt) {
    const kode = KODE_BAHASA[opt.value] || opt.value;
    const prefix = kode.split('-')[0];
    const ada = all.some(function (v) {
      return v.lang === kode || (v.lang && v.lang.indexOf(prefix) === 0);
    });
    opt.disabled = !ada && opt.value !== state.lang;
  });
}

function voiceUntuk(langCode, speaker, sp) {
  const key = langCode + '|' + speaker;
  if (charVoiceCache[key]) return charVoiceCache[key];
  const all = daftarVoice();
  const pool = all.filter(function (v) { return v.lang === langCode; });
  const search = pool.length ? pool : all.filter(function (v) { return v.lang && v.lang.indexOf(langCode.split('-')[0]) === 0; });
  const castName = bacaCast()[speaker];
  let chosen = castName ? (search.find(function (v) { return v.name === castName; }) || all.find(function (v) { return v.name === castName; })) : null;
  if (!chosen) {
    const terpakai = Object.keys(charVoiceCache)
      .filter(function (k) { return k.indexOf(langCode + '|') === 0; })
      .map(function (k) { return charVoiceCache[k] ? charVoiceCache[k].name : null; });
    const want = sp.gender === 'female' ? FEMALE_RE : MALE_RE;
    chosen =
      search.find(function (v) { return want.test(v.name) ? terpakai.indexOf(v.name) === -1 : false; }) ||
      search.find(function (v) { return terpakai.indexOf(v.name) === -1; }) ||
      search.find(function (v) { return want.test(v.name); }) ||
      search[0] || null;
  }
  charVoiceCache[key] = chosen;
  return chosen;
}

function ambilCtx() {
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return null;
  if (!ctxStinger || ctxStinger.state === 'closed') ctxStinger = new Ctx();
  if (ctxStinger.state === 'suspended') ctxStinger.resume();
  return ctxStinger;
}

function stinger(type, channel) {
  const ctx = ambilCtx();
  if (!ctx) return;
  const now = ctx.currentTime;
  const base = NADA_SALURAN[channel] || NADA_SALURAN.pagi;
  const notes = type === 'outro' ? base.slice().reverse() : base;
  notes.forEach(function (freq, i) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    const start = now + i * 0.12;
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(0.15, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.35);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + 0.4);
  });
}

function roomTone(on) {
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return;
  if (on && !roomNode) {
    const ctx = new Ctx();
    const len = ctx.sampleRate * 2;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) {
      const white = Math.random() * 2 - 1;
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 3.5;
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    const gain = ctx.createGain();
    gain.gain.value = 0.015;
    src.connect(gain);
    gain.connect(ctx.destination);
    src.start();
    roomNode = { ctx: ctx, src: src };
  } else if (!on && roomNode) {
    try { roomNode.src.stop(); roomNode.ctx.close(); } catch (e) {}
    roomNode = null;
  }
}

function prosodi(s, sp, intent) {
  const bawaan = sp.gaya === 'kisah' ? 'kisah' : (sp.gaya === 'tanya' ? 'tanya' : 'inform');
  const r = RESEP[intent] || RESEP[bawaan];
  let pitch = sp.pitch * r.pitch;
  let rate = sp.rate * r.rate;
  pitch = pitch * (1 + (Math.random() * 2 - 1) * sp.pitchVariance);
  const isQ = s.indexOf('?') >= 0;
  const isX = s.indexOf('!') >= 0;
  if (isQ) pitch *= 1.06;
  if (isX) { pitch *= 1.04; rate *= 1.04; }
  if (s.length < 40) { rate *= 0.95; pitch *= 1.02; }
  if (/(ribu|juta|miliar|seribu|seratus)/.test(s)) rate *= 0.95;
  if (sp.gaya === 'kisah' && s.length > 60) rate *= 0.9;
  if (sp.gaya === 'warta' && /,/.test(s)) rate *= 0.97;
  return { pitch: pitch, rate: rate, jeda: r.jeda };
}

function dukungJedaNative() {
  if (!window.speechSynthesis) return false;
  const ada = typeof window.speechSynthesis.pause === 'function' && typeof window.speechSynthesis.resume === 'function';
  const ua = navigator.userAgent || '';
  const android = /Android/i.test(ua);
  return ada && !android;
}

function estimasiMs(teks, rate) {
  const kata = Math.max(1, String(teks || '').trim().split(/\s+/).filter(Boolean).length);
  const r = Math.max(0.5, rate || 1);
  const base = (kata / 1.7) * 1000 / r;
  const bonus = Math.min(1200, kata * 40);
  return Math.round(base + bonus * 0.15);
}

function speakLine(line, lang, onBoundary, onDone, opts) {
  const efektifLang = line.lang || lang;
  const langCode = KODE_BAHASA[efektifLang] || efektifLang;
  const sp = SPEAKERS[line.speaker] || SPEAKERS.Warta;
  const voice = voiceUntuk(langCode, line.speaker, sp);
  const sents = sentences(line.text);
  const isPausedFn = (opts && typeof opts.isPaused === 'function') ? opts.isPaused : function () { return false; };
  let i = 0;
  let searchFrom = 0;
  let cancelled = false;
  let watchdogTimer = null;
  let tickerTimer = null;
  function bersihkanWatchdog() {
    if (watchdogTimer) { clearTimeout(watchdogTimer); watchdogTimer = null; }
  }
  function stopTicker() {
    if (tickerTimer) { clearInterval(tickerTimer); tickerTimer = null; }
  }
  function mulaiTickerKata(teksUtuh, startOffset, rate, teksUcapan, teksKalimat) {
    stopTicker();
    if (!onBoundary || startOffset < 0) return;
    const kalimat = teksKalimat != null ? teksKalimat : teksUtuh.slice(startOffset);
    const tokens = [];
    const re = /\S+/g;
    let m;
    while ((m = re.exec(kalimat)) !== null) {
      tokens.push({ start: startOffset + m.index, len: m[0].length });
    }
    if (!tokens.length) return;
    const durasi = Math.max(900, estimasiMs(teksUcapan || kalimat, rate));
    const t0 = Date.now();
    let lastTi = -1;
    let pausedAt = 0;
    let pauseAcc = 0;
    function tick() {
      if (cancelled) return;
      if (isPausedFn()) {
        if (!pausedAt) pausedAt = Date.now();
        return;
      }
      if (pausedAt) {
        pauseAcc += Date.now() - pausedAt;
        pausedAt = 0;
      }
      const elapsed = Date.now() - t0 - pauseAcc;
      const ratio = Math.min(0.999, elapsed / durasi);
      let ti = Math.floor(ratio * tokens.length);
      if (ti < 0) ti = 0;
      if (ti >= tokens.length) ti = tokens.length - 1;
      if (ti !== lastTi) {
        lastTi = ti;
        onBoundary(tokens[ti].start, tokens[ti].len);
      }
      if (elapsed >= durasi) {
        stopTicker();
        const last = tokens[tokens.length - 1];
        onBoundary(last.start, last.len);
      }
    }
    onBoundary(tokens[0].start, tokens[0].len);
    lastTi = 0;
    tickerTimer = setInterval(tick, 80);
  }
  function next() {
    if (cancelled) return;
    if (i >= sents.length) { onDone(); return; }
    const s = sents[i];
    const start = line.text.indexOf(s, searchFrom);
    if (start >= 0) searchFrom = start + s.length;
    const spoken = (efektifLang === 'id') ? eja(s) : s;
    const p = prosodi(s, sp, line.intent);
    const hasInt = INTERJECTION_RE.test(s);
    const u = new SpeechSynthesisUtterance(spoken);
    u.lang = langCode;
    u.pitch = Math.max(0.5, Math.min(2, p.pitch));
    u.rate = Math.max(0.5, Math.min(2, p.rate * pituturState.state.rate));
    if (voice) u.voice = voice;
    let boundaryHit = 0;
    u.onboundary = function (e) {
      if (start < 0 || !onBoundary) return;
      if (e.name && e.name !== 'word') return;
      const len = e.charLength || 0;
      const idx = e.charIndex || 0;
      if (spoken === s && len > 0) {
        boundaryHit++;
        onBoundary(start + idx, len);
      }
    };
    let jeda = p.jeda;
    if (hasInt) jeda += 100;
    const gapAntarKalimat = Math.round(jeda * sp.pauseFactor + Math.random() * 120);
    let selesai = false;
    function tandaiSelesai() {
      if (selesai || cancelled) return;
      selesai = true;
      stopTicker();
      bersihkanWatchdog();
      i++;
      function cobaLanjut() {
        if (cancelled) return;
        if (isPausedFn()) { setTimeout(cobaLanjut, 300); return; }
        next();
      }
      setTimeout(cobaLanjut, gapAntarKalimat);
    }
    u.onend = tandaiSelesai;
    u.onerror = tandaiSelesai;
    function jadwalkanWatchdog() {
      const ms = estimasiMs(spoken, u.rate) * 2 + 3000;
      watchdogTimer = setTimeout(function () {
        if (cancelled || selesai) return;
        if (isPausedFn()) { jadwalkanWatchdog(); return; }
        window.speechSynthesis.cancel();
        tandaiSelesai();
      }, ms);
    }
    window.speechSynthesis.speak(u);
    mulaiTickerKata(line.text, start >= 0 ? start : 0, u.rate, spoken, s);
    setTimeout(function () {
      if (cancelled || selesai) return;
      if (boundaryHit >= 2) stopTicker();
    }, 900);
    jadwalkanWatchdog();
  }
  next();
  return { cancel: function () { cancelled = true; stopTicker(); bersihkanWatchdog(); } };
}

export const pituturVoice = {
  SPEAKERS: SPEAKERS,
  RESEP: RESEP,
  KODE_BAHASA: KODE_BAHASA,
  daftarVoice: daftarVoice,
  bacaCast: bacaCast,
  simpanCast: simpanCast,
  bersihkanCacheVoice: bersihkanCacheVoice,
  waitForVoices: waitForVoices,
  filterBahasa: filterBahasa,
  voiceUntuk: voiceUntuk,
  stinger: stinger,
  roomTone: roomTone,
  speakLine: speakLine,
  estimasiMs: estimasiMs,
  dukungJedaNative: dukungJedaNative
};
