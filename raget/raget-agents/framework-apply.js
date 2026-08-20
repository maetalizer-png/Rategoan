// Mode "terapkan" untuk kerangka berpikir - bukan cuma mendefinisikan kerangkanya, tapi
// benar-benar menjalankan langkah-langkahnya bareng user lewat sesi bertahap, mengikuti
// pola state-machine modul-level yang sama seperti quiz-session.js.
//
// Ronde v6 B5: Decision Matrix (pilihan -> kriteria -> skor per pilihan -> kesimpulan).
// Ronde v7 B5: ditambah 5 Whys (masalah -> "kenapa" berulang sampai 5x -> akar masalah) dan
// SWOT (topik -> Strengths -> Weaknesses -> Opportunities -> Threats -> ringkasan), memakai
// field session.kind untuk membedakan alur tanpa mengubah perilaku Decision Matrix yang sudah ada.

let session = null;

const KIND_NAME_RE = {
  decision_matrix: /\bdecision\s*matrix\b/i,
  '5whys': /\b5\s*whys?\b/i,
  swot: /\bswot\b/i,
};
const TRIGGER_RE = /\b(terapkan|coba|isi(kan)?|jalankan)\b|\b(bareng|bersama|barengan|sama-sama)\b/i;

function detectStart(text) {
  const t = String(text || '');
  if (!TRIGGER_RE.test(t)) return null;
  const kind = Object.keys(KIND_NAME_RE).find((k) => KIND_NAME_RE[k].test(t));
  return kind || null;
}

function parseList(text) {
  return String(text || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function hasPending() {
  return !!session;
}

function cancel() {
  session = null;
}

// ---------- DECISION MATRIX ----------

function askScoring() {
  const opt = session.options[session.optionIdx];
  return 'Beri skor 1-5 untuk "' + opt + '" pada tiap kriteria, pisahkan dengan koma, urutan: ' + session.criteria.join(', ') + '.';
}

function finishDecisionMatrix() {
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

function checkDecisionMatrix(t) {
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
    return finishDecisionMatrix();
  }

  return null;
}

// ---------- 5 WHYS ----------

const STOP_RE = /^(selesai|sudah|cukup|berhenti)\.?$/i;

function askWhy() {
  return 'Kenapa "' + session.whys[session.whys.length - 1] + '" bisa terjadi? (why ke-' + session.whys.length + ' dari maks 5, ketik "selesai" kalau sudah merasa cukup)';
}

function finish5Whys() {
  const chain = session.whys.map((w, i) => i + 1 + '. ' + w).join('\n');
  const root = session.whys[session.whys.length - 1];
  const out =
    '5 Whys selesai, rangkaian penyebabnya:\n' +
    chain +
    '\n\nKemungkinan akar masalahnya: "' + root + '". Ini bukan kesimpulan final otomatis — tetap validasi lagi sebelum mengambil tindakan.';
  session = null;
  return out;
}

function check5Whys(t) {
  if (session.step === 'problem') {
    if (!t) return 'Sebutkan masalah atau gejala yang kamu hadapi (contoh: Website sering down).';
    session.whys.push(t);
    session.step = 'why';
    return askWhy();
  }

  if (session.step === 'why') {
    if (STOP_RE.test(t)) {
      if (session.whys.length < 2) return 'Isi dulu minimal 1 alasan "kenapa" sebelum berhenti.';
      return finish5Whys();
    }
    if (!t) return askWhy();
    session.whys.push(t);
    if (session.whys.length >= 6) return finish5Whys();
    return askWhy();
  }

  return null;
}

// ---------- SWOT ----------

function finishSwot() {
  const out =
    'SWOT untuk "' + session.topic + '" selesai:\n' +
    '- Strengths: ' + session.strengths.join(', ') + '\n' +
    '- Weaknesses: ' + session.weaknesses.join(', ') + '\n' +
    '- Opportunities: ' + session.opportunities.join(', ') + '\n' +
    '- Threats: ' + session.threats.join(', ') +
    '\n\nIni ringkasan posisi berdasarkan input kamu — pertimbangkan juga faktor lain yang mungkin belum masuk sebelum mengambil keputusan.';
  session = null;
  return out;
}

function checkSwot(t) {
  if (session.step === 'topic') {
    if (!t) return 'Sebutkan ide, proyek, atau hal yang mau dianalisis (contoh: Buka usaha kedai kopi).';
    session.topic = t;
    session.step = 'strengths';
    return 'Oke, analisis SWOT untuk "' + t + '". Sebutkan kekuatan (Strengths)-nya, pisahkan dengan koma.';
  }

  if (session.step === 'strengths') {
    const items = parseList(t);
    if (!items.length) return 'Sebutkan minimal 1 kekuatan (Strengths), pisahkan dengan koma.';
    session.strengths = items;
    session.step = 'weaknesses';
    return 'Sekarang sebutkan kelemahan (Weaknesses)-nya, pisahkan dengan koma.';
  }

  if (session.step === 'weaknesses') {
    const items = parseList(t);
    if (!items.length) return 'Sebutkan minimal 1 kelemahan (Weaknesses), pisahkan dengan koma.';
    session.weaknesses = items;
    session.step = 'opportunities';
    return 'Sekarang sebutkan peluang (Opportunities)-nya, pisahkan dengan koma.';
  }

  if (session.step === 'opportunities') {
    const items = parseList(t);
    if (!items.length) return 'Sebutkan minimal 1 peluang (Opportunities), pisahkan dengan koma.';
    session.opportunities = items;
    session.step = 'threats';
    return 'Terakhir, sebutkan ancaman (Threats)-nya, pisahkan dengan koma.';
  }

  if (session.step === 'threats') {
    const items = parseList(t);
    if (!items.length) return 'Sebutkan minimal 1 ancaman (Threats), pisahkan dengan koma.';
    session.threats = items;
    return finishSwot();
  }

  return null;
}

// ---------- ENTRY POINTS ----------

function start(kind) {
  if (kind === 'decision_matrix') {
    session = { kind, step: 'options', options: [], criteria: [], scores: {}, optionIdx: 0 };
    return 'Oke, kita isi Decision Matrix bareng. Sebutkan pilihan-pilihan yang sedang kamu pertimbangkan, pisahkan dengan koma (contoh: Kerja Kantor, Kerja Remote).';
  }
  if (kind === '5whys') {
    session = { kind, step: 'problem', whys: [] };
    return 'Oke, kita telusuri akar masalahnya bareng pakai 5 Whys. Sebutkan masalah atau gejala yang kamu hadapi (contoh: Website sering down).';
  }
  if (kind === 'swot') {
    session = { kind, step: 'topic', topic: '', strengths: [], weaknesses: [], opportunities: [], threats: [] };
    return 'Oke, kita analisis SWOT bareng. Sebutkan ide, proyek, atau hal yang mau dianalisis (contoh: Buka usaha kedai kopi).';
  }
  return null;
}

function checkPending(text) {
  if (!session) return null;
  const t = String(text || '').trim();
  if (session.kind === 'decision_matrix') return checkDecisionMatrix(t);
  if (session.kind === '5whys') return check5Whys(t);
  if (session.kind === 'swot') return checkSwot(t);
  return null;
}

export const frameworkApply = Object.freeze({
  detectStart,
  start,
  hasPending,
  checkPending,
  cancel,
});
