import { dataries } from './dataries-registry.js';
import { formatter } from './formatter.js';
import { streakStore } from '../raget-memory/streak-store.js';

let pending = null;

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

async function buildQuizQuestions() {
  const [countries, tokoh] = await Promise.all([dataries.loadAll('country'), dataries.loadAll('tokoh')]);
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

async function ask() {
  const questions = await buildQuizQuestions();
  const picked = questions[0];
  pending = picked;
  return formatter.blocks([formatter.h('Kuis', 3), picked.q, formatter.numbered(picked.options)]) + '\n\nJawab dengan angka (1-4) atau ketik jawabannya.';
}

function hasPending() {
  return !!pending;
}

function matchOption(question, text) {
  const t = String(text || '').trim();
  const numMatch = t.match(/^([1-4])\b/);
  if (numMatch) {
    const idx = Number(numMatch[1]) - 1;
    return question.options[idx] || null;
  }
  const lower = t.toLowerCase();
  return question.options.find((o) => o.toLowerCase() === lower) || null;
}

function checkPending(text) {
  if (!pending) return null;
  const question = pending;
  pending = null;
  const chosen = matchOption(question, text);
  if (!chosen) return null;
  const correct = chosen === question.answer;
  if (correct) {
    const streak = streakStore.bump();
    return 'Benar! Jawabannya ' + question.answer + '. Streak: ' + streak + ' hari.';
  }
  return 'Belum tepat. Jawaban yang benar: ' + question.answer + '.';
}

export const quizSession = Object.freeze({ ask, hasPending, checkPending });
