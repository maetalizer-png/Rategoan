import en_kalimat from './kalimat/en.js';
import jv_kalimat from './kalimat/jv.js';
import su_kalimat from './kalimat/su.js';
import es_kalimat from './kalimat/es.js';
import de_kalimat from './kalimat/de.js';
import pt_kalimat from './kalimat/pt.js';
import zh_kalimat from './kalimat/zh.js';
import ja_kalimat from './kalimat/ja.js';
import ko_kalimat from './kalimat/ko.js';

import en_kamus from './kamus/en.js';
import jv_kamus from './kamus/jv.js';
import su_kamus from './kamus/su.js';
import es_kamus from './kamus/es.js';
import de_kamus from './kamus/de.js';
import pt_kamus from './kamus/pt.js';
import zh_kamus from './kamus/zh.js';
import ja_kamus from './kamus/ja.js';
import ko_kamus from './kamus/ko.js';

import { terjemahkanKalimat, parseCountry, negaraTemplate, rapikanAngka, kamus, rapikanEn } from './core.js';

export { LOCALE } from './labels.js';

const KALIMAT = {
  en: en_kalimat, jv: jv_kalimat, su: su_kalimat, es: es_kalimat, de: de_kalimat,
  pt: pt_kalimat, zh: zh_kalimat, ja: ja_kalimat, ko: ko_kalimat
};

const KAMUS = {
  en: en_kamus, jv: jv_kamus, su: su_kamus, es: es_kamus, de: de_kamus,
  pt: pt_kamus, zh: zh_kamus, ja: ja_kamus, ko: ko_kamus
};

export function terjemahkan(teks, lang) {
  if (!lang || lang === 'id') return teks;
  let out = terjemahkanKalimat(teks, lang, KALIMAT);
  const c = parseCountry(teks);
  if (c) {
    out = negaraTemplate(c, lang, KAMUS);
  } else {
    out = kamus(out, lang, KAMUS);
  }
  if (lang === 'en') out = rapikanEn(out);
  if (lang === 'jv') out = out.replace(/\b dan \b/g, ' lan ').replace(/\b di \b/g, ' ing ').replace(/\b yang \b/g, ' sing ');
  return rapikanAngka(out, lang);
}

export function sudahDiterjemahkan(teks, lang) {
  if (!lang || lang === 'id') return true;
  return terjemahkan(teks, lang) !== teks;
}
