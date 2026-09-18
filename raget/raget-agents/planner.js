import { detectTone } from '../../utils/text.js';
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

function planFallback(text, results) {
  if (isSocialChitChat(text) || isShortNonFact(text)) return null;
  const list = (Array.isArray(results) ? results : [])
    .filter((r) => STABLE_TYPES.has(r.type) || r.type === 'dataries')
    .slice()
    .sort((a, b) => b.score - a.score);
  const top = list[0];
  if (!top) return null;

  const topThreshold = top.type === 'dataries' ? DATARIES_THRESHOLD : retrieval.AUGMENT_THRESHOLD;
  if (top.score >= topThreshold) {
    const body = formatter.formatByType('terbuka', {
      title: 'Yang saya tahu',
      items: list.slice(0, 3).map((r) => r.text),
    });
    return {
      text: quality.guardLength(body, 'terbuka') + '\n\n(sumber: ' + top.type + ')',
      sourceType: top.type,
      sourceEntryId: top.type === 'dataries' && top.id ? top.id : null,
    };
  }

  if (top.score >= CHOICE_THRESHOLD) {
    const second = list[1];
    if (second && second.score >= CHOICE_THRESHOLD) {
      return {
        text: 'Maksudnya yang mana ya: 1) ' + top.text.slice(0, 70) + ' atau 2) ' + second.text.slice(0, 70) + '?',
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
  CHOICE_THRESHOLD,
});
