import { ic } from '../icons.js';
import { data } from '../loader.js';
import { errorCard, low, mulberry, hashText } from '../utils.js';
import { ASEAN, POPULAR, BADGES } from '../constants.js';
import { getStats, saveStats, getDays, pushDay } from '../storage.js';

const $ = (s) => document.querySelector(s);
const view = $('#view');

let quiz = null;

function streakDots() {
  const days = getDays();
  const out = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
    out.push('<span class="dot' + (days.includes(d) ? ' on' : '') + '"></span>');
  }
  return '<span class="dots">' + out.join('') + '</span>';
}

export function showKuisHome() {
  const st = getStats();
  const acc = st.played ? Math.round((st.correct / (st.played * 10)) * 100) : 0;
  const today = new Date().toISOString().slice(0, 10);
  const dailyDone = localStorage.getItem('travel_daily') === today;
  view.innerHTML =
    '<div class="card"><h3>' + ic('quiz') + ' Kuis</h3>' +
    '<p class="desc">Akurasi ' + acc + '% dari ' + st.played + ' main &middot; ' + ic('flame') + ' ' +
    (localStorage.getItem('travel_streak') || 0) + ' &middot; ' + ic('award') + ' ' +
    (localStorage.getItem('travel_best') || 0) + ' ' + streakDots() + '</p>' +
    '<div class="rowbtn"><button class="btn" id="m1">Santai (ASEAN & populer)</button>' +
    '<button class="btn" id="m2">Tantangan (dunia)</button></div>' +
    '<div class="rowbtn"><button class="btn" id="m3"' + (dailyDone ? ' disabled' : '') + '>' + ic('cal') +
    (dailyDone ? ' Tantangan harian (selesai)' : ' Tantangan harian (bonus streak)') + '</button></div>' +
    '<div class="sec">' + ic('award') + ' Pencapaian</div><div class="tags">' +
    BADGES.map((b) => '<span class="bdg' + (b.test(st) ? ' on' : '') + '">' + b.label + '</span>').join('') +
    '</div></div>';
  $('#m1').onclick = () => startKuis('santai');
  $('#m2').onclick = () => startKuis('dunia');
  if (!dailyDone) $('#m3').onclick = () => startKuis('daily');
}

function buildGens(pool, foods, wisata, langs) {
  const poolNames = new Set(pool.map((c) => c.metadata.name));
  const nameOpts = pool.map((c) => c.metadata.name);
  const capOpts = pool.map((c) => c.metadata.capital);
  const curOpts = pool.map((c) => c.metadata.currency);
  const gens = [];
  pool.forEach((c) => {
    gens.push({ q: 'Ibukota ' + c.metadata.name + '?', ans: c.metadata.capital, pool: capOpts });
    gens.push({ q: 'Mata uang ' + c.metadata.name + '?', ans: c.metadata.currency, pool: curOpts });
  });
  foods.forEach((f) => {
    if (f.metadata && poolNames.has(f.metadata.country)) {
      gens.push({ q: f.metadata.name + ' khas negara...?', ans: f.metadata.country, pool: nameOpts });
    }
  });
  wisata.forEach((w) => {
    if (w.metadata && poolNames.has(w.metadata.country)) {
      gens.push({ q: w.metadata.name + ' ada di...?', ans: w.metadata.country, pool: nameOpts });
    }
  });
  langs.forEach((l) => {
    const off = (l.metadata && l.metadata.officialIn) || [];
    if (off.length && l.metadata.greetings) {
      gens.push({ q: '"' + l.metadata.greetings.halo + '" sapaan bahasa...?', ans: l.metadata.name, pool: langs.map((x) => x.metadata.name) });
    }
  });
  return gens;
}

function toItems(gens, n, rng) {
  const r = rng || Math.random;
  return [...gens].sort(() => r() - 0.5).slice(0, n).map((g) => {
    const wrong = [...new Set(g.pool.filter((p) => p && p !== g.ans))].sort(() => r() - 0.5).slice(0, 3);
    return { q: g.q, ans: g.ans, opts: [g.ans].concat(wrong).sort(() => r() - 0.5) };
  });
}

async function startKuis(mode) {
  const d = await data();
  if (!d) return errorCard();
  const { countries, foods, wisata, langs } = d;
  const all = countries.filter((c) => c.metadata.capital && c.metadata.currency);

  if (mode === 'daily') {
    const today = new Date().toISOString().slice(0, 10);
    const rng = mulberry(hashText(today));
    quiz = { i: 0, score: 0, timer: null, mode, items: toItems(buildGens(all, foods, wisata, langs), 5, rng) };
    drawKuis();
    return;
  }

  const santaiNames = ASEAN.concat(POPULAR);
  const poolS = all.filter((c) => santaiNames.includes(low(c.metadata.name)));
  let items;
  if (mode === 'santai') {
    const bonus = buildGens(all.filter((c) => !santaiNames.includes(low(c.metadata.name))), foods, wisata, langs);
    items = toItems(buildGens(poolS, foods, wisata, langs), 8).concat(toItems(bonus, 2));
  } else {
    items = toItems(buildGens(all, foods, wisata, langs), 10);
  }
  quiz = { i: 0, score: 0, timer: null, mode, items: items.sort(() => Math.random() - 0.5) };
  drawKuis();
}

function reveal(b) {
  clearInterval(quiz.timer);
  view.querySelectorAll('.q-opt').forEach((x) => (x.onclick = null));
  const it = quiz.items[quiz.i];
  if (b && b.textContent === it.ans) { b.classList.add('ok'); quiz.score++; }
  else {
    if (b) b.classList.add('no');
    view.querySelectorAll('.q-opt').forEach((x) => { if (x.textContent === it.ans) x.classList.add('ok'); });
  }
  setTimeout(() => { quiz.i++; drawKuis(); }, 700);
}

function drawKuis() {
  if (!quiz) return;
  clearInterval(quiz.timer);
  if (quiz.i >= quiz.items.length) return finishKuis();
  const it = quiz.items[quiz.i];
  view.innerHTML =
    '<div class="hud"><span>Soal ' + (quiz.i + 1) + '/' + quiz.items.length + (quiz.mode === 'daily' ? ' (harian)' : '') + '</span>' +
    '<span>Skor ' + quiz.score + ic('flame') + (localStorage.getItem('travel_streak') || 0) +
    ic('award') + (localStorage.getItem('travel_best') || 0) + ic('clock') + '<b id="tleft">15</b></span></div>' +
    '<div class="card"><h3>' + it.q + '</h3>' + it.opts.map((o) => '<button class="q-opt">' + o + '</button>').join('') + '</div>';
  quiz.left = 15;
  quiz.timer = setInterval(() => {
    quiz.left--;
    const el = $('#tleft');
    if (el) el.textContent = quiz.left;
    if (quiz.left <= 0) reveal(null);
  }, 1000);
  view.querySelectorAll('.q-opt').forEach((b) => { b.onclick = () => reveal(b); });
}

function finishKuis() {
  clearInterval(quiz.timer);
  const today = new Date().toISOString().slice(0, 10);
  const st = getStats();
  st.played++;
  st.correct += quiz.score;
  saveStats(st);

  let headline = 'Selesai, skor ' + quiz.score + '/' + quiz.items.length;
  if (quiz.mode === 'daily') {
    localStorage.setItem('travel_daily', today);
    if (quiz.score >= 4) {
      const s = +localStorage.getItem('travel_streak') || 0;
      localStorage.setItem('travel_streak', s + 1);
      pushDay(today);
      headline = 'Tantangan harian lulus! Streak +1';
    } else {
      headline = 'Tantangan harian belum lulus (minimal 4). Coba lagi besok!';
    }
  } else {
    const s = +localStorage.getItem('travel_streak') || 0;
    const streak = quiz.score >= 6 ? s + 1 : 0;
    localStorage.setItem('travel_streak', streak);
    if (quiz.score >= 6) pushDay(today);
    if (quiz.mode === 'santai') st.bestSantai = Math.max(st.bestSantai, quiz.score);
    else st.bestDunia = Math.max(st.bestDunia, quiz.score);
    saveStats(st);
  }

  const best = Math.max(+localStorage.getItem('travel_best') || 0, quiz.score);
  localStorage.setItem('travel_best', best);
  view.innerHTML =
    '<div class="card"><h3>' + headline + '</h3>' +
    '<p class="desc">' + ic('flame') + ' Streak ' + (localStorage.getItem('travel_streak') || 0) +
    ' &middot; ' + ic('award') + ' Terbaik ' + best +
    ' &middot; akurasi total ' + Math.round((st.correct / (st.played * 10)) * 100) + '% ' + streakDots() + '</p>' +
    '<div class="rowbtn"><button class="btn" id="again">' + ic('shuffle') + ' Main lagi</button>' +
    '<button class="btn" id="home">Beranda kuis</button></div></div>';
  $('#again').onclick = () => startKuis(quiz.mode === 'daily' ? 'santai' : quiz.mode);
  $('#home').onclick = showKuisHome;
}
