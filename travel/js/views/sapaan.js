import { ic } from '../icons.js';
import { data } from '../loader.js';
import { errorCard, low } from '../utils.js';
import { getStats, saveStats } from '../storage.js';

const $ = (s) => document.querySelector(s);
const view = $('#view');

let sIdx = 0, sList = [], sRevealed = false, sMode = 'kartu', tebak = null;

export async function renderSapaan() {
  const d = await data();
  if (!d) return errorCard();
  sList = d.langs.filter((l) => l.metadata && l.metadata.greetings);
  view.innerHTML =
    '<div class="seg">' +
      '<button id="mk" class="' + (sMode === 'kartu' ? 'on' : '') + '">Kartu</button>' +
      '<button id="mt" class="' + (sMode === 'tebak' ? 'on' : '') + '">Tebak bahasa</button>' +
    '</div>' +
    '<div id="sapOut"></div>';
  $('#mk').onclick = () => { sMode = 'kartu'; renderSapaan(); };
  $('#mt').onclick = () => { sMode = 'tebak'; renderSapaan(); };
  if (sMode === 'tebak') { startTebak(); return; }
  sIdx = 0;
  sRevealed = false;
  drawSapaan();
}

function langCode(l) {
  const n = low(l.metadata.name);
  const map = {
    indonesian: 'id', indonesia: 'id', english: 'en', japanese: 'ja', korean: 'ko',
    mandarin: 'zh', chinese: 'zh', spanish: 'es', french: 'fr', german: 'de',
    arabic: 'ar', russian: 'ru', thai: 'th', vietnamese: 'vi', dutch: 'nl',
    italian: 'it', portuguese: 'pt',
  };
  return map[n] || 'id';
}

function drawSapaan() {
  const out = $('#sapOut') || view;
  const l = sList[sIdx];
  if (!l) { out.innerHTML = '<div class="card"><p class="desc">Sapaan belum tersedia.</p></div>'; return; }
  const g = l.metadata.greetings || {};
  const body = sRevealed
    ? '<h3>' + ic('lang') + ' ' + (g.halo || '-') + '</h3>' +
      '<p class="desc">pagi: ' + (g.pagi || '-') + ' &middot; terima kasih: ' + (g.terimakasih || '-') + '</p>' +
      '<div class="rowbtn"><button class="btn" id="tts">' + ic('vol') + ' Dengar</button>' +
      '<button class="btn" id="prev">' + ic('back') + '</button>' +
      '<button class="btn" id="next">' + ic('next') + '</button></div>'
    : '<div class="flipq">?</div><p class="desc" style="text-align:center">tap kartu untuk buka sapaan ' + l.metadata.name + '</p>';
  out.innerHTML =
    '<div class="hud"><span>' + (sIdx + 1) + '/' + sList.length + '</span><span>' + l.metadata.name + '</span></div>' +
    '<div class="card" id="flip">' + body + '</div>';
  if (!sRevealed) {
    $('#flip').onclick = () => {
      sRevealed = true;
      const st = getStats();
      st.sapaan++;
      saveStats(st);
      drawSapaan();
    };
    return;
  }
  $('#tts').onclick = () => {
    const u = new SpeechSynthesisUtterance(g.halo || '');
    u.lang = langCode(l);
    speechSynthesis.cancel();
    speechSynthesis.speak(u);
  };
  $('#prev').onclick = () => { sIdx = (sIdx - 1 + sList.length) % sList.length; sRevealed = false; drawSapaan(); };
  $('#next').onclick = () => { sIdx = (sIdx + 1) % sList.length; sRevealed = false; drawSapaan(); };
}

function startTebak() {
  tebak = {
    i: 0, score: 0,
    items: [...sList].sort(() => Math.random() - 0.5).slice(0, 10).map((l) => {
      const wrong = [...new Set(sList.map((x) => x.metadata.name).filter((n) => n !== l.metadata.name))]
        .sort(() => Math.random() - 0.5).slice(0, 3);
      return { g: l.metadata.greetings, ans: l.metadata.name, opts: [l.metadata.name].concat(wrong).sort(() => Math.random() - 0.5) };
    }),
  };
  drawTebak();
}

function drawTebak() {
  const out = $('#sapOut') || view;
  if (tebak.i >= tebak.items.length) {
    out.innerHTML =
      '<div class="card"><h3>' + ic('lang') + ' Tebak selesai, skor ' + tebak.score + '/10</h3>' +
      '<div class="rowbtn"><button class="btn" id="lagi">' + ic('shuffle') + ' Ulangi</button>' +
      '<button class="btn" id="kartu">Mode kartu</button></div></div>';
    $('#lagi').onclick = startTebak;
    $('#kartu').onclick = () => { sMode = 'kartu'; renderSapaan(); };
    return;
  }
  const it = tebak.items[tebak.i];
  out.innerHTML =
    '<div class="hud"><span>Soal ' + (tebak.i + 1) + '/10</span><span>Skor ' + tebak.score + '</span></div>' +
    '<div class="card"><h3>' + ic('lang') + ' "' + it.g.halo + '"</h3>' +
    '<p class="desc">pagi: ' + it.g.pagi + ' &middot; makasih: ' + it.g.terimakasih + '</p>' +
    it.opts.map((o) => '<button class="q-opt">' + o + '</button>').join('') + '</div>';
  out.querySelectorAll('.q-opt').forEach((b) => {
    b.onclick = () => {
      out.querySelectorAll('.q-opt').forEach((x) => (x.onclick = null));
      if (b.textContent === it.ans) { b.classList.add('ok'); tebak.score++; }
      else {
        b.classList.add('no');
        out.querySelectorAll('.q-opt').forEach((x) => { if (x.textContent === it.ans) x.classList.add('ok'); });
      }
      const st = getStats();
      st.sapaan++;
      saveStats(st);
      setTimeout(() => { tebak.i++; drawTebak(); }, 700);
    };
  });
}
