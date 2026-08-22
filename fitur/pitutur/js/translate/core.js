import { LABEL, ANGKA_KOMA, LABELS_NEGARA } from './labels.js';

const kamusCache = {};

function esc(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function terjemahkanKalimat(teks, lang, KALIMAT) {
  const daftar = KALIMAT[lang];
  if (!daftar) return teks;
  let out = teks;
  daftar.forEach(function (p) { out = out.split(p[0]).join(p[1]); });
  return out;
}

export function kamus(teks, lang, KAMUS) {
  const dict = KAMUS[lang];
  if (!dict) return teks;
  if (!kamusCache[lang]) {
    kamusCache[lang] = Object.keys(dict)
      .sort(function (a, b) { return b.length - a.length; })
      .map(function (k) {
        return { re: new RegExp('\\b' + esc(k).replace(/\s+/g, '\\s+') + '\\b', 'gi'), t: dict[k] };
      });
  }
  let out = teks;
  kamusCache[lang].forEach(function (p) {
    out = out.replace(p.re, function (m) {
      return /^[A-Z]/.test(m) ? p.t.charAt(0).toUpperCase() + p.t.slice(1) : p.t;
    });
  });
  return out;
}

function ambilField(sisa, label) {
  const re = new RegExp(label + '\\s*:\\s*([^\\.]+)\\.', 'i');
  const x = sisa.match(re);
  return x ? x[1].trim() : null;
}

function ambilPola(sisa, re) {
  const x = sisa.match(re);
  return x ? x[1].trim() : null;
}

export function parseCountry(teks) {
  let raw = String(teks || '').trim();
  let m = raw.match(/^Tentang\s+([^.]+)\.\s*(.*)$/i);
  if (m) {
    raw = m[1].trim() + ' - ' + m[2].trim();
  }
  m = raw.match(/^([^-]+)-\s*(.*)$/);
  if (!m) return null;
  const sisa = m[2];
  if (sisa.indexOf('Negara') !== 0 && sisa.indexOf('negara') !== 0) return null;
  const desc = sisa.split(/Ibu kota|Ibu kotanya|Kota terbesar|Populasi|Populasinya|Mata uang|Mata uangnya|Bahasa|Bahasanya|Sistem pemerintahan|Sistem pemerintahannya|Anggota|Rumah bagi|Destinasi wisata/)[0].replace(/[.\s]+$/, '').trim();
  let lain = sisa;
  LABELS_NEGARA.forEach(function (lb) {
    lain = lain.replace(new RegExp(lb + '\\s*:[^.]*\\.\\s*', 'gi'), ' ');
  });
  [
    /Ibu kotanya\s+[^.]+\./gi,
    /Populasinya(?:\s+tercatat)?(?:\s+sekitar)?\s+[^.]+\./gi,
    /Mata uangnya\s+[^.]+\./gi,
    /Bahasanya\s+[^.]+\./gi,
    /Sistem pemerintahannya\s+[^.]+\./gi,
    /Anggota\s+[^.]+\./gi,
    /Rumah bagi\s+[^.]+\./gi
  ].forEach(function (re) { lain = lain.replace(re, ' '); });
  if (lain.indexOf(desc) === 0) lain = lain.slice(desc.length);
  lain = lain.replace(/\s+/g, ' ').trim();
  return {
    nama: m[1].trim(),
    desc: desc,
    lain: lain,
    ibu: ambilField(sisa, 'Ibu kota') || ambilPola(sisa, /Ibu kotanya\s+([^.]+)\./i),
    kotaBesar: ambilField(sisa, 'Kota terbesar'),
    pop: ambilField(sisa, 'Populasi') || ambilPola(sisa, /Populasinya(?:\s+tercatat)?(?:\s+sekitar)?\s+([^.]+)\./i),
    uang: ambilField(sisa, 'Mata uang') || ambilPola(sisa, /Mata uangnya\s+([^.]+)\./i),
    bahasa: ambilField(sisa, 'Bahasa') || ambilPola(sisa, /Bahasanya\s+([^.]+)\./i),
    gov: ambilField(sisa, 'Sistem pemerintahan') || ambilPola(sisa, /Sistem pemerintahannya\s+([^.]+)\./i),
    anggota: ambilField(sisa, 'Anggota') || ambilPola(sisa, /Anggota\s+([^.]+)\./i),
    rumah: ambilField(sisa, 'Rumah bagi') || ambilPola(sisa, /Rumah bagi\s+([^.]+)\./i),
    wisata: ambilField(sisa, 'Destinasi wisata')
  };
}

export function rapikanEn(s) {
  let x = String(s || '');
  x = x.replace(/\bCountry an archipelago\b/gi, 'An archipelago');
  x = x.replace(/\bsegera pindah ke\b/gi, 'soon moving to');
  x = x.replace(/\bterbesar in dunia dengan\b/gi, 'the largest in the world, with');
  x = x.replace(/\bterbesar in\b/gi, 'the largest in');
  x = x.replace(/\beconomy the largest in\b/gi, 'the largest economy in');
  x = x.replace(/\bCountry a kingdom\b/gi, 'A kingdom');
  x = x.replace(/\bCountry a country\b/gi, 'A country');
  x = x.replace(/\bA city-state di\b/gi, 'A city-state in');
  x = x.replace(/\byang famous as\b/gi, 'famous as');
  x = x.replace(/\bfamous as financial center global\b/gi, 'famous as a global financial center');
  x = x.replace(/\bfinancial center global\b/gi, 'a global financial center');
  x = x.replace(/\bIbu kotanya\b/gi, 'Its capital is');
  x = x.replace(/\bPopulasinya sekitar\b/gi, 'Its population is about');
  x = x.replace(/\bPopulasinya tercatat sekitar\b/gi, 'Its population is about');
  x = x.replace(/\bMata uangnya\b/gi, 'Its currency is');
  x = x.replace(/\bBahasanya\b/gi, 'Its languages are');
  x = x.replace(/\bSistem pemerintahannya\b/gi, 'Its government system is');
  x = x.replace(/\bRepublic Parliamentary\b/gi, 'Parliamentary Republic');
  x = x.replace(/\bA member of of\b/gi, 'A member of');
  x = x.replace(/\ba member of of\b/gi, 'a member of');
  x = x.replace(/\bmember of of\b/gi, 'member of');
  x = x.replace(/\blargest kedua\b/gi, 'the second largest');
  x = x.replace(/\b dan \b/g, ' and ');
  x = x.replace(/\band and\b/g, 'and');
  x = x.replace(/\bMelayu\b/g, 'Malay');
  x = x.replace(/\bDolar Singapura\b/gi, 'Singapore Dollar');
  x = x.replace(/\b dan \b/g, ' and ');
  x = x.replace(/\.+/g, '.');
  x = x.replace(/\s+\./g, '.');
  x = x.replace(/\s+,/g, ',');
  x = x.replace(/\s{2,}/g, ' ').trim();
  if (x && !/[.!?]$/.test(x)) x += '.';
  return x;
}

export function negaraTemplate(c, lang, KAMUS) {
  const L = LABEL[lang];
  const k = function (t) {
    if (!t) return '';
    let out = kamus(t, lang, KAMUS);
    if (lang === 'en') out = rapikanEn(out);
    return out;
  };
  if (!L) return k(c.nama + ' - ' + c.desc);
  const parts = [];
  parts.push(c.nama + '. ' + k(c.desc));
  if (c.ibu) parts.push(L.cap + ': ' + k(c.ibu) + '.');
  if (c.kotaBesar) parts.push(L.big + ': ' + k(c.kotaBesar) + '.');
  if (c.pop) parts.push(L.pop + ': ' + k(c.pop) + '.');
  if (c.uang) parts.push(L.cur + ': ' + k(c.uang) + '.');
  if (c.bahasa) parts.push(L.lan + ': ' + k(c.bahasa) + '.');
  if (c.gov) parts.push(L.gov + ': ' + k(c.gov) + '.');
  if (c.anggota) parts.push(L.mem + ' ' + k(c.anggota) + '.');
  if (c.rumah) parts.push(L.home + ' ' + k(c.rumah) + '.');
  if (c.wisata) parts.push(L.tour + ': ' + k(c.wisata) + '.');
  if (c.lain) {
    const lain = k(c.lain);
    if (lain && lain.length > 12) parts.push(lain);
  }
  let out = parts.join(' ').replace(/\s+/g, ' ').trim();
  if (lang === 'en') out = rapikanEn(out);
  return out;
}

export function rapikanAngka(t, lang) {
  if (!ANGKA_KOMA[lang]) return t;
  return t.replace(/[0-9]{1,3}([.][0-9]{3})+/g, function (m) { return m.split('.').join(','); });
}
