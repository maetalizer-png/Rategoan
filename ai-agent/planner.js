import { detectTone } from '../utils/text.js';
import { formatter } from './formatter.js';
import { retrieval } from '../raget-retrieval/retrieve.js';

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

function planFallback(text, results) {
  const list = (Array.isArray(results) ? results : []).filter((r) => STABLE_TYPES.has(r.type));
  const top = list[0];
  if (!top) return null;

  if (top.score >= retrieval.AUGMENT_THRESHOLD) {
    const body = formatter.formatByType('terbuka', {
      title: 'Yang saya tahu',
      items: list.slice(0, 3).map((r) => r.text),
    });
    return body + '\n\n(sumber: ' + top.type + ')';
  }

  if (top.score >= CHOICE_THRESHOLD) {
    const second = list[1];
    if (second && second.score >= CHOICE_THRESHOLD) {
      return 'Maksudnya yang mana ya: 1) ' + top.text.slice(0, 70) + ' atau 2) ' + second.text.slice(0, 70) + '?';
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
