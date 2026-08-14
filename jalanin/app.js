import { dataries, REGIONS } from '../dataries/index.js';
import { scorer } from '../ai-agent/scorer.js';

const STREAK_KEY = 'raget_jalanin_streak';
const QUIZ_BEST_KEY = 'raget_jalanin_quiz_best';

function $(id) {
  return document.getElementById(id);
}

async function loadAllCountries() {
  return dataries.loadAll('country');
}

async function loadAllCities() {
  return dataries.loadAll('cities');
}

async function loadAllLanguages() {
  return dataries.loadAll('languages');
}

async function loadAllMakanan() {
  return dataries.loadAll('makanan');
}

async function loadAllWisata() {
  return dataries.loadAll('wisata');
}

async function loadAllTokoh() {
  return dataries.loadAll('tokoh');
}

function fuzzyCountryMatch(a, b) {
  if (!a || !b) return false;
  const x = a.toLowerCase();
  const y = b.toLowerCase();
  return x === y || x.includes(y) || y.includes(x);
}

/* ---------- JELAJAH ---------- */

let countryCache = null;

async function searchCountries(query) {
  if (!countryCache) countryCache = await loadAllCountries();
  const tokens = scorer.tokenize(query);
  if (!tokens.length) return countryCache.slice(0, 12);
  return countryCache
    .filter((it) => {
      const hay = (it.metadata.name + ' ' + (it.text || '')).toLowerCase();
      return tokens.some((t) => hay.includes(t));
    })
    .slice(0, 20);
}

async function renderCountryCard(item) {
  const meta = item.metadata;
  const [languages, makanan, wisata] = await Promise.all([loadAllLanguages(), loadAllMakanan(), loadAllWisata()]);
  const lang = languages.find((l) => (l.metadata.officialIn || []).some((c) => fuzzyCountryMatch(c, meta.name)));
  const foods = makanan.filter((f) => fuzzyCountryMatch(f.metadata.country, meta.name)).slice(0, 3);
  const places = wisata.filter((w) => fuzzyCountryMatch(w.metadata.country, meta.name)).slice(0, 3);

  const card = document.createElement('div');
  card.className = 'jl-card jl-country-card';
  card.innerHTML =
    '<h3>' + meta.name + '</h3>' +
    '<div class="jl-facts">' +
    '<span>🏛️ ' + (meta.capital || '-') + '</span>' +
    '<span>💰 ' + (meta.currency || '-') + '</span>' +
    '<span>🗣️ ' + (lang ? lang.metadata.name : '-') + '</span>' +
    '</div>' +
    (foods.length ? '<div class="jl-sub">🍽️ ' + foods.map((f) => f.metadata.name).join(', ') + '</div>' : '') +
    (places.length ? '<div class="jl-sub">📍 ' + places.map((w) => w.metadata.name).join(', ') + '</div>' : '');
  return card;
}

async function runSearch(query) {
  const results = $('jl-results');
  results.innerHTML = '<div class="jl-loading">Mencari...</div>';
  const matches = await searchCountries(query);
  results.innerHTML = '';
  if (!matches.length) {
    results.innerHTML = '<div class="jl-empty">Tidak ditemukan. Coba nama negara lain.</div>';
    return;
  }
  for (const item of matches) {
    results.appendChild(await renderCountryCard(item));
  }
}

function initJelajah() {
  const input = $('jl-search');
  let timer = null;
  input.addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(() => runSearch(input.value), 200);
  });
  runSearch('');
}

/* ---------- KUIS TEBAK DUNIA ---------- */

let quizState = null;

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

async function buildQuizQuestions() {
  const [countries, tokoh] = await Promise.all([loadAllCountries(), loadAllTokoh()]);
  const capitalCountries = countries.filter((c) => c.metadata.capital);
  const populationCountries = countries.filter((c) => c.metadata.population);
  const questions = [];

  shuffle(capitalCountries).slice(0, 5).forEach((c) => {
    const correct = c.metadata.capital;
    const distractors = shuffle(capitalCountries.filter((x) => x.metadata.name !== c.metadata.name))
      .slice(0, 3)
      .map((x) => x.metadata.capital);
    questions.push({
      q: 'Apa ibukota ' + c.metadata.name + '?',
      options: shuffle([correct].concat(distractors)),
      answer: correct,
    });
  });

  shuffle(tokoh).slice(0, 3).forEach((t) => {
    const correct = t.metadata.name;
    const distractors = shuffle(tokoh.filter((x) => x.metadata.name !== t.metadata.name))
      .slice(0, 3)
      .map((x) => x.metadata.name);
    questions.push({
      q: 'Siapa tokoh yang dikenal karena: ' + t.metadata.knownFor + '?',
      options: shuffle([correct].concat(distractors)),
      answer: correct,
    });
  });

  shuffle(populationCountries).slice(0, 2).forEach((c) => {
    const correct = c.metadata.name;
    const distractors = shuffle(populationCountries.filter((x) => x.metadata.name !== c.metadata.name))
      .slice(0, 3)
      .map((x) => x.metadata.name);
    questions.push({
      q: 'Negara mana yang punya ibukota ' + c.metadata.capital + '?',
      options: shuffle([correct].concat(distractors)),
      answer: correct,
    });
  });

  return shuffle(questions).slice(0, 10);
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function updateStreak() {
  let data = { lastDate: null, streak: 0 };
  try {
    data = JSON.parse(localStorage.getItem(STREAK_KEY)) || data;
  } catch (e) {}
  const today = todayKey();
  if (data.lastDate === today) return data.streak;
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  data.streak = data.lastDate === yesterday ? data.streak + 1 : 1;
  data.lastDate = today;
  try {
    localStorage.setItem(STREAK_KEY, JSON.stringify(data));
  } catch (e) {}
  return data.streak;
}

function saveBestScore(score) {
  let best = 0;
  try {
    best = Number(localStorage.getItem(QUIZ_BEST_KEY)) || 0;
  } catch (e) {}
  if (score > best) {
    try {
      localStorage.setItem(QUIZ_BEST_KEY, String(score));
    } catch (e) {}
    return score;
  }
  return best;
}

function renderQuizQuestion() {
  const box = $('jl-quiz-box');
  if (quizState.index >= quizState.questions.length) {
    const streak = updateStreak();
    const best = saveBestScore(quizState.score);
    box.innerHTML =
      '<div class="jl-quiz-done"><h3>Selesai!</h3><p>Skor: ' + quizState.score + '/10</p>' +
      '<p>🔥 Streak harian: ' + streak + ' hari</p><p>🏆 Skor terbaik: ' + best + '/10</p>' +
      '<button class="jl-btn" id="jl-quiz-restart">Main Lagi</button></div>';
    $('jl-quiz-restart').onclick = startQuiz;
    return;
  }
  const q = quizState.questions[quizState.index];
  box.innerHTML =
    '<div class="jl-quiz-progress">Soal ' + (quizState.index + 1) + '/10 · Skor ' + quizState.score + '</div>' +
    '<div class="jl-quiz-q">' + q.q + '</div>' +
    '<div class="jl-quiz-options">' +
    q.options.map((o, i) => '<button class="jl-quiz-opt" data-i="' + i + '">' + o + '</button>').join('') +
    '</div>';
  box.querySelectorAll('.jl-quiz-opt').forEach((btn) => {
    btn.onclick = () => {
      const chosen = q.options[Number(btn.dataset.i)];
      const isCorrect = chosen === q.answer;
      if (isCorrect) quizState.score++;
      btn.classList.add(isCorrect ? 'correct' : 'wrong');
      box.querySelectorAll('.jl-quiz-opt').forEach((b) => (b.disabled = true));
      setTimeout(() => {
        quizState.index++;
        renderQuizQuestion();
      }, 600);
    };
  });
}

async function startQuiz() {
  $('jl-quiz-box').innerHTML = '<div class="jl-loading">Menyiapkan soal...</div>';
  const questions = await buildQuizQuestions();
  quizState = { questions, index: 0, score: 0 };
  renderQuizQuestion();
}

/* ---------- SAPAAN FLASHCARD ---------- */

let flashcards = [];
let flashcardIndex = 0;

async function loadFlashcards() {
  const languages = await loadAllLanguages();
  flashcards = shuffle(languages.filter((l) => l.metadata.greetings));
  flashcardIndex = 0;
}

function speak(text, lang) {
  if (!('speechSynthesis' in window)) return;
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = lang || 'id-ID';
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utter);
}

function renderFlashcard() {
  const box = $('jl-flash-box');
  if (!flashcards.length) {
    box.innerHTML = '<div class="jl-empty">Belum ada data bahasa.</div>';
    return;
  }
  const item = flashcards[flashcardIndex % flashcards.length];
  const g = item.metadata.greetings;
  box.innerHTML =
    '<div class="jl-flash-card" id="jl-flash-card">' +
    '<div class="jl-flash-front"><h3>' + item.metadata.name + '</h3><p>' + item.metadata.nativeName + '</p><span class="jl-flash-hint">Ketuk untuk lihat sapaan</span></div>' +
    '<div class="jl-flash-back" hidden>' +
    '<p>Halo: <b>' + g.halo + '</b></p>' +
    '<p>Pagi: <b>' + g.pagi + '</b></p>' +
    '<p>Terima kasih: <b>' + g.terimakasih + '</b></p>' +
    '<button class="jl-btn jl-flash-speak">🔊 Dengar</button>' +
    '</div></div>';
  const card = $('jl-flash-card');
  const front = card.querySelector('.jl-flash-front');
  const back = card.querySelector('.jl-flash-back');
  card.onclick = (e) => {
    if (e.target.closest('.jl-flash-speak')) return;
    front.hidden = !front.hidden;
    back.hidden = !back.hidden;
  };
  card.querySelector('.jl-flash-speak').onclick = (e) => {
    e.stopPropagation();
    speak(g.halo);
  };
}

function initSapaan() {
  $('jl-flash-next').onclick = () => {
    flashcardIndex++;
    renderFlashcard();
  };
  loadFlashcards().then(renderFlashcard);
}

/* ---------- TABS ---------- */

function initTabs() {
  const tabs = document.querySelectorAll('.jl-tab');
  const views = document.querySelectorAll('.jl-view');
  tabs.forEach((tab) => {
    tab.onclick = () => {
      tabs.forEach((t) => t.classList.remove('active'));
      views.forEach((v) => v.hidden = true);
      tab.classList.add('active');
      $('jl-view-' + tab.dataset.view).hidden = false;
      if (tab.dataset.view === 'kuis' && !quizState) startQuiz();
    };
  });
}

function boot() {
  initTabs();
  initJelajah();
  initSapaan();
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
}

document.addEventListener('DOMContentLoaded', boot);
