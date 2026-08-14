import { dataries } from './index.js';

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

export const quiz = Object.freeze({ shuffle, buildQuizQuestions });
