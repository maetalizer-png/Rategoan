// PRD-RAGET-TEMPLATE.md Fase 3.1: pooling kalimat (mean) + index cosine
// similarity, dibangun DI ATAS primitif yang sudah ada di
// raget-neural/llm-embedding.js (lookupEmbeddings/addVectors/dotProduct)
// alih-alih menulis ulang matematika vektornya - modul ini cuma menambah
// bagian yang belum ada: agregasi token->kalimat (mean pooling) dan
// pemeringkatan cosine similarity lintas korpus.
//
// CATATAN JUJUR WAJIB (jangan dihapus tanpa membaca raget-tools/
// bench-semantic-vs-bm25.mjs dulu): fungsi di sini BENAR secara matematis
// dan diuji, tapi kualitas hasilnya 100% bergantung pada embeddingTable
// yang dipakai. Kalau embeddingTable itu inisialisasi Gaussian acak (belum
// pernah dilatih - lihat LLMEmbedding.createEmbeddingMatrix), vektor tiap
// token berbeda kira-kira ORTOGONAL satu sama lain (dot product ~ 0 di
// ruang berdimensi tinggi), jadi cosine similarity antar dua kalimat yang
// di-mean-pool kira-kira SEBANDING dengan jumlah token yang sama persis -
// mirip "bag of words overlap" TANPA pembobotan IDF seperti BM25, secara
// teoritis lebih lemah dari BM25 (bukan pengganti). Dibuktikan empiris di
// bench-semantic-vs-bm25.mjs: embedding acak KALAH jauh dari BM25 di
// benchmark hit@1/hit@3/MRR yang sama. Modul ini baru jadi SINYAL TAMBAHAN
// yang genuinely berguna kalau embeddingTable-nya diganti dengan tabel
// embedding dari checkpoint yang SUDAH DILATIH (lihat PRD-RAGET-NEURAL.md) -
// itu prasyarat yang belum terpenuhi saat modul ini ditulis.
import { LLMEmbedding } from '../raget-neural/llm-embedding.js';

function buildVocab(tokenizedCorpus) {
  const vocab = new Map();
  tokenizedCorpus.forEach((tokens) => {
    tokens.forEach((t) => {
      if (!vocab.has(t)) vocab.set(t, vocab.size);
    });
  });
  return vocab;
}

function tokensToIds(tokens, vocab) {
  const ids = [];
  tokens.forEach((t) => {
    const id = vocab.get(t);
    if (id !== undefined) ids.push(id);
  });
  return ids;
}

// Mean pooling: rata-rata vektor embedding tiap token jadi satu vektor
// kalimat. Kalau tidak ada token yang dikenal vocab, kembalikan vektor nol
// (bukan exception - konsisten dengan retrieve.js yang mengembalikan skor
// 0 untuk query kosong, bukan melempar error).
function meanPool(tokenVectors, dModel) {
  if (!tokenVectors.length) return LLMEmbedding.zerosVector(dModel);
  const sum = tokenVectors.reduce((acc, v) => LLMEmbedding.addVectors(acc, v), LLMEmbedding.zerosVector(dModel));
  return LLMEmbedding.scaleVector(sum, 1 / tokenVectors.length);
}

function embedTokens(tokens, vocab, embeddingTable, dModel) {
  const ids = tokensToIds(tokens, vocab);
  if (!ids.length) return LLMEmbedding.zerosVector(dModel);
  const vectors = LLMEmbedding.lookupEmbeddings(embeddingTable, ids);
  return meanPool(vectors, dModel);
}

function vectorNorm(v) {
  return Math.sqrt(LLMEmbedding.dotProduct(v, v));
}

function cosineSimilarity(a, b) {
  const na = vectorNorm(a);
  const nb = vectorNorm(b);
  if (na === 0 || nb === 0) return 0;
  return LLMEmbedding.dotProduct(a, b) / (na * nb);
}

// corpus: array item apa pun. textOf(item) -> string. tokenizeFn(text) ->
// array token string (dipanggil sekali per item, sama seperti retrieve.js
// yang minta caller sudah tokenize).
function buildIndex(corpus, textOf, tokenizeFn, dModel, initStd) {
  const tokenizedCorpus = corpus.map((item) => tokenizeFn(textOf(item)));
  const vocab = buildVocab(tokenizedCorpus);
  const embeddingTable = LLMEmbedding.createEmbeddingMatrix(vocab.size, dModel, initStd || 0.02);
  const vectors = tokenizedCorpus.map((tokens) => embedTokens(tokens, vocab, embeddingTable, dModel));
  return { corpus, vectors, vocab, embeddingTable, dModel };
}

function rank(queryTokens, index, limit) {
  const queryVector = embedTokens(queryTokens, index.vocab, index.embeddingTable, index.dModel);
  const scored = index.corpus.map((item, i) => ({ item, score: cosineSimilarity(queryVector, index.vectors[i]) }));
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit || 10);
}

export const semanticIndex = Object.freeze({
  buildVocab,
  tokensToIds,
  meanPool,
  embedTokens,
  cosineSimilarity,
  buildIndex,
  rank,
});
