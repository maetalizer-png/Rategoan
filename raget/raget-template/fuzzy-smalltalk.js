// FR-1.1-1.3: typo/fuzzy tolerance for smalltalk intent routing.
//
// llm-engine.js#craft() already tries every SMALLTALK_TRIGGERS regex (exact rule
// match) first. This module is the fallback tried ONLY when none of those regexes
// matched: it fuzzy-matches the (case/punctuation-normalized) input against a small,
// hand-curated set of canonical example phrases per smalltalk key, using
// Jaro-Winkler similarity at a conservative threshold. A high threshold (0.82) with a
// small curated phrase set is deliberate - this must catch near-miss typos of a real
// smalltalk phrase ("kmpuan kamu apa", "mksih") without becoming a broad net that
// hijacks unrelated factual/math queries that simply share a word or two.
//
// answer-composer.js already has Levenshtein + phonetic normalization, but that
// module corrects individual KEYWORDS (ibukota, populasi, ...) against a small
// dictionary - it does not do whole-phrase similarity against example sentences,
// which is what's needed here to catch a garbled whole trigger phrase.
import { scorer } from '../raget-agents/scorer.js';

const THRESHOLD = 0.82;

// 2-4 canonical phrases per bucket, written as plausible real user phrasing that
// exercises that SMALLTALK_TRIGGERS regex (see llm-engine.js) - not an exhaustive
// paraphrase net, just enough anchor points for typo-distance matching to work.
const CANONICAL_PHRASES = {
  kemampuan: ['kamu bisa apa', 'apa kemampuanmu', 'kemampuan kamu apa', 'apa yang bisa kamu lakukan'],
  terima_kasih: ['terima kasih', 'makasih', 'makasih banyak ya', 'thanks ya'],
  siapa: ['kamu siapa', 'siapa kamu', 'kenalan dong', 'siapa nama kamu'],
  kabar: ['apa kabar', 'gimana kabar kamu', 'kabar kamu gimana'],
  jumpa: ['sampai jumpa', 'selamat tinggal', 'see you'],
  bantu: ['tolong bantu', 'bantuin saya', 'butuh bantuan dong'],
  maaf: ['maaf ya', 'maafkan saya', 'sorry ya'],
  lagi_apa: ['lagi apa', 'kamu lagi ngapain', 'lagi ngapain kamu'],
  capek: ['aku capek', 'aku lelah', 'ngantuk berat nih'],
  bosen: ['aku bosen', 'aku bosan', 'gabut nih'],
  izin: ['izin tidak masuk', 'minta izin', 'izin kelas'],
  tugas: ['tugas menumpuk', 'deadline tugas', 'pr menumpuk'],
  layanan: ['antre di loket', 'komplain layanan', 'urus berkas'],
  rumah: ['gas bocor', 'listrik padam', 'air mati'],
  sekolah: ['ulangan sekolah', 'pr sekolah', 'guru wali kelas'],
  pasar: ['tawar harga di pasar', 'belanja di warung'],
  transport: ['naik angkot', 'jalan macet parah', 'naik ojek'],
  sehat: ['badan demam', 'pusing kepala', 'butuh obat'],
  uang: ['pinjam uang', 'tagihan listrik', 'lagi diskon belanja'],
  tetangga: ['kerja bakti dengan tetangga', 'iuran rt'],
  kerja: ['rapat kantor', 'lembur kerja', 'atasan di kantor'],
};

// Jaro-Winkler similarity, in [0, 1]. Standard algorithm (Winkler's prefix boost on
// top of Jaro distance) - good fit for short phrases with typos/transpositions.
function jaroWinkler(a, b) {
  if (a === b) return 1;
  const aLen = a.length;
  const bLen = b.length;
  if (!aLen || !bLen) return 0;
  const matchDist = Math.max(Math.floor(Math.max(aLen, bLen) / 2) - 1, 0);
  const aMatched = new Array(aLen).fill(false);
  const bMatched = new Array(bLen).fill(false);
  let matches = 0;
  for (let i = 0; i < aLen; i++) {
    const start = Math.max(0, i - matchDist);
    const end = Math.min(i + matchDist + 1, bLen);
    for (let j = start; j < end; j++) {
      if (bMatched[j] || a[i] !== b[j]) continue;
      aMatched[i] = true;
      bMatched[j] = true;
      matches++;
      break;
    }
  }
  if (!matches) return 0;
  let transpositions = 0;
  let k = 0;
  for (let i = 0; i < aLen; i++) {
    if (!aMatched[i]) continue;
    while (!bMatched[k]) k++;
    if (a[i] !== b[k]) transpositions++;
    k++;
  }
  transpositions /= 2;
  const jaro = (matches / aLen + matches / bLen + (matches - transpositions) / matches) / 3;
  let prefix = 0;
  const maxPrefix = Math.min(4, aLen, bLen);
  while (prefix < maxPrefix && a[prefix] === b[prefix]) prefix++;
  return jaro + prefix * 0.1 * (1 - jaro);
}

// Text preprocessing (FR-1.2): case normalization + stripping non-semantic
// punctuation, reusing scorer.normalize() (lowercase, strip everything but
// letters/digits/whitespace, collapse whitespace) rather than reinventing it.
function preprocess(text) {
  return scorer.normalize(text);
}

function bestSimilarityInBucket(normalizedText, phrases) {
  let best = 0;
  for (const phrase of phrases) {
    const sim = jaroWinkler(normalizedText, preprocess(phrase));
    if (sim > best) best = sim;
  }
  return best;
}

// Returns the smalltalk key of the best-matching bucket if its similarity is
// >= THRESHOLD, otherwise null. Never called when an exact SMALLTALK_TRIGGERS
// regex already matched - see llm-engine.js#craft().
function matchFuzzySmalltalk(text) {
  const normalized = preprocess(text);
  if (!normalized || normalized.length < 3) return null;
  let bestKey = null;
  let bestScore = 0;
  for (const key of Object.keys(CANONICAL_PHRASES)) {
    const score = bestSimilarityInBucket(normalized, CANONICAL_PHRASES[key]);
    if (score > bestScore) {
      bestScore = score;
      bestKey = key;
    }
  }
  return bestScore >= THRESHOLD ? bestKey : null;
}

export const fuzzySmalltalk = Object.freeze({
  THRESHOLD,
  jaroWinkler,
  matchFuzzySmalltalk,
});
