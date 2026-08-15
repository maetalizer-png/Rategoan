import { quiz } from '../dataries/quiz.js';
import { formatter } from './formatter.js';
import { streakStore } from '../raget-memory/streak-store.js';

let pending = null;

async function ask() {
  const questions = await quiz.buildQuizQuestions();
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
