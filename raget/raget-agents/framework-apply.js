// Mode "terapkan" untuk Decision Matrix - bukan cuma mendefinisikan kerangka berpikir,
// tapi benar-benar menjalankan langkah-langkahnya bareng user lewat sesi bertahap
// (pilihan -> kriteria -> skor per pilihan -> kesimpulan), mengikuti pola state-machine
// modul-level yang sama seperti quiz-session.js.

let session = null;

const START_RE = /\b(terapkan|coba|isi(kan)?|jalankan)\b.*\bdecision\s*matrix\b|\bdecision\s*matrix\b.*\b(bareng|bersama|barengan|sama-sama)\b/i;

function parseList(text) {
  return String(text || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function askScoring() {
  const opt = session.options[session.optionIdx];
  return 'Beri skor 1-5 untuk "' + opt + '" pada tiap kriteria, pisahkan dengan koma, urutan: ' + session.criteria.join(', ') + '.';
}

function start() {
  session = { step: 'options', options: [], criteria: [], scores: {}, optionIdx: 0 };
  return 'Oke, kita isi Decision Matrix bareng. Sebutkan pilihan-pilihan yang sedang kamu pertimbangkan, pisahkan dengan koma (contoh: Kerja Kantor, Kerja Remote).';
}

function hasPending() {
  return !!session;
}

function cancel() {
  session = null;
}

function finish() {
  const rows = session.options.map((opt) => {
    const scores = session.scores[opt];
    const total = scores.reduce((a, b) => a + b, 0);
    return { opt, scores, total };
  });
  rows.sort((a, b) => b.total - a.total);
  const table = rows.map((r) => '- ' + r.opt + ': ' + r.scores.join(', ') + ' (total ' + r.total + ')').join('\n');
  const winner = rows[0];
  const out =
    'Decision Matrix selesai (kriteria: ' + session.criteria.join(', ') + ', semua kriteria dianggap berbobot sama):\n' +
    table +
    '\n\nBerdasarkan total skor, "' + winner.opt + '" unggul dengan ' + winner.total + ' poin. Ini bukan keputusan final otomatis — tetap pertimbangkan faktor lain yang mungkin belum masuk kriteria di atas.';
  session = null;
  return out;
}

function checkPending(text) {
  if (!session) return null;
  const t = String(text || '').trim();

  if (session.step === 'options') {
    const options = parseList(t);
    if (options.length < 2) {
      return 'Sebutkan minimal 2 pilihan yang sedang kamu pertimbangkan, pisahkan dengan koma (contoh: Kerja Kantor, Kerja Remote).';
    }
    session.options = options;
    session.step = 'criteria';
    return 'Oke, pilihanmu: ' + options.join(', ') + '. Sekarang sebutkan kriteria penting buat kamu, pisahkan dengan koma (contoh: Gaji, Fleksibilitas, Jarak).';
  }

  if (session.step === 'criteria') {
    const criteria = parseList(t);
    if (criteria.length < 1) {
      return 'Sebutkan minimal 1 kriteria penting, pisahkan dengan koma (contoh: Gaji, Fleksibilitas, Jarak).';
    }
    session.criteria = criteria;
    session.step = 'scoring';
    session.optionIdx = 0;
    return askScoring();
  }

  if (session.step === 'scoring') {
    const parts = parseList(t).map((s) => parseFloat(s.replace(',', '.')));
    if (parts.length !== session.criteria.length || parts.some((n) => !isFinite(n) || n < 1 || n > 5)) {
      return 'Beri ' + session.criteria.length + ' angka (1-5) dipisah koma, urutan: ' + session.criteria.join(', ') + '.';
    }
    session.scores[session.options[session.optionIdx]] = parts;
    session.optionIdx++;
    if (session.optionIdx < session.options.length) return askScoring();
    return finish();
  }

  return null;
}

export const frameworkApply = Object.freeze({
  START_RE,
  start,
  hasPending,
  checkPending,
  cancel,
});
