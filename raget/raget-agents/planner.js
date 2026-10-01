import { detectTone } from '../../shared/text.js';
import { formatter } from './formatter.js';
import { retrieval } from '../raget-retrieval/retrieve.js';
import { quality } from './quality.js';

const CHOICE_THRESHOLD = 0.2;

function detectTipe(text) {
  const t = String(text || '').trim().toLowerCase();
  if (/^apa\s*itu\b/.test(t)) return 'definisi';
  if (/\b(sebutkan|ide|manfaat)\b/.test(t)) return 'daftar';
  if (/\b(cara|langkah)\b/.test(t)) return 'prosedur';
  if (/\bbandingkan\b/.test(t)) return 'perbandingan';
  if (/^(berapa|hitung)\b/.test(t)) return 'matematika';
  return 'terbuka';
}

function planAnswer(text, results, options) {
  const opts = options || {};
  return {
    tipe: detectTipe(text),
    isi: results || [],
    nada: detectTone(text),
    richness: opts.richness || null,
  };
}

const STABLE_TYPES = new Set(['faq', 'umum', 'fact']);
const DATARIES_THRESHOLD = 0.3;

function isSocialChitChat(text) {
  const raw = String(text || '').trim();
  if (!raw) return false;
  if (/^(selamat|met)?\s*(pagi|siang|sore|malam)\b/i.test(raw) && raw.split(/\s+/).length <= 5) return true;
  if (/\b(apa|gimana|bagaimana)\s+kabar(\s+\w+){0,3}\??$/i.test(raw)) return true;
  if (/^apa\s+kabar\b/i.test(raw)) return true;
  if (/\bhow\s+are\s+you\b/i.test(raw)) return true;
  if (/\b(apakah\s+)?((kamu|anda|engkau)\s+)?(bisa|dapat)\s+memb?antu(\s+(saya|aku))?\b/i.test(raw)) return true;
  if (/^(bisa|tolong)\s+bantu/i.test(raw)) return true;
  return false;
}

function isShortNonFact(text) {
  const raw = String(text || '').trim();
  if (!raw) return true;
  if (isSocialChitChat(raw)) return true;
  const words = raw.split(/\s+/).filter(Boolean);
  if (words.length > 3) return false;
  if (/^(apa|siapa|kapan|dimana|di\s+mana|mengapa|kenapa|bagaimana|berapa|gimana)\b/i.test(raw)) return false;
  if (/\b(ibu\s*kota|ibukota|apa\s+itu)\b/i.test(raw)) return false;
  if (/\d/.test(raw) && /[+\-x×*/÷=]/.test(raw)) return false;
  return true;
}

const QUERY_STOP = new Set([
  'apa', 'itu', 'yang', 'saya', 'anda', 'kamu', 'adalah', 'tentang', 'bagaimana',
  'apakah', 'bisa', 'dengan', 'dari', 'untuk', 'dan', 'atau', 'di', 'ke', 'ini',
  'yg', 'the', 'a', 'an', 'of',
]);

function queryTokens(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !QUERY_STOP.has(w));
}

function overlapCount(text, tokens) {
  const hay = String(text || '').toLowerCase();
  return tokens.reduce((n, t) => n + (hay.includes(t) ? 1 : 0), 0);
}

function cleanSnippet(text) {
  return String(text || '')
    .replace(/\s+/g, ' ')
    .replace(/^[-•*#\s]+/, '')
    .trim();
}

function planFallback(text, results) {
  if (isSocialChitChat(text) || isShortNonFact(text)) return null;
  const tokens = queryTokens(text);
  const list = (Array.isArray(results) ? results : [])
    .filter((r) => STABLE_TYPES.has(r.type) || r.type === 'dataries')
    .map((r) => ({
      ...r,
      ov: tokens.length ? overlapCount(r.text, tokens) : 1,
    }))
    .filter((r) => !tokens.length || r.ov > 0)
    .sort((a, b) => b.ov - a.ov || b.score - a.score);

  const preferred = list.filter((r) => r.type === 'fact' || r.type === 'dataries');
  const pool = preferred.length ? preferred : list;
  const top = pool[0];
  if (!top) return null;

  const topThreshold = top.type === 'dataries' ? DATARIES_THRESHOLD : retrieval.AUGMENT_THRESHOLD;
  if (top.score >= topThreshold && cleanSnippet(top.text).length >= 40) {
    const tipe = detectTipe(text);
    const snippet = cleanSnippet(top.text);
    let body;
    if (tipe === 'daftar' || tipe === 'prosedur') {
      body = formatter.formatByType(tipe, {
        title: '',
        items: pool.slice(0, 3).map((r) => cleanSnippet(r.text).slice(0, 180)),
      });
    } else {
      body = formatter.formatByType('definisi', { text: snippet });
    }
    return {
      text: quality.guardLength(body, tipe === 'daftar' ? 'daftar' : 'terbuka'),
      sourceType: top.type,
      sourceEntryId: top.type === 'dataries' && top.id ? top.id : null,
    };
  }

  if (top.score >= CHOICE_THRESHOLD) {
    const second = pool[1];
    if (second && second.score >= CHOICE_THRESHOLD && second.ov === top.ov) {
      return {
        text: 'Maksudnya yang mana ya: 1) ' + cleanSnippet(top.text).slice(0, 70) + ' atau 2) ' + cleanSnippet(second.text).slice(0, 70) + '?',
        sourceType: top.type,
        sourceEntryId: null,
      };
    }
  }

  return null;
}

export const planner = Object.freeze({
  planAnswer,
  planFallback,
  detectTipe,
  isSocialChitChat,
  CHOICE_THRESHOLD,
});
