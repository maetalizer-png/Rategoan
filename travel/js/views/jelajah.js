import { ic } from '../icons.js';
import { data } from '../loader.js';
import { low, byCountry, fmtN, stat, errorCard, regionOf, fuzzyCountry } from '../utils.js';
import { POPULAR, FILTERS } from '../constants.js';
import { getRecent, pushRecent } from '../storage.js';
import { openDetail } from './detail.js';

const $ = (s) => document.querySelector(s);
const view = $('#view');

let regionFilter = 'all';
let jelajahMode = 'negara';

export function openSheet(html) {
  let sh = $('#sheet');
  if (!sh) {
    sh = document.createElement('div');
    sh.className = 'sheet';
    sh.id = 'sheet';
    sh.innerHTML = '<div class="sheet-card"><div class="rowbtn"><button class="btn" id="sheetX">Tutup</button></div><div id="sheetBody"></div></div>';
    document.body.appendChild(sh);
    sh.querySelector('#sheetX').onclick = () => { sh.hidden = true; };
    sh.onclick = (e) => { if (e.target === sh) sh.hidden = true; };
  }
  $('#sheetBody').innerHTML = html;
  sh.hidden = false;
}

function cardCountry(c, foods) {
  const m = c.metadata || {};
  const fo = byCountry(foods, m.name).slice(0, 2);
  const el = document.createElement('div');
  el.className = 'card';
  el.innerHTML =
    '<h3>' + (m.name || '-') + ic('chev') + '</h3>' +
    '<p class="desc">' + String(c.text || '') + '</p>' +
    '<div class="stats">' +
      stat('bank', m.capital || '-') +
      stat('cash', m.currency || '-') +
      (m.population ? stat('users', fmtN(m.population)) : '') +
    '</div>' +
    (fo.length
      ? '<div class="sec">' + ic('food') + ' Kuliner</div><div class="tags">' +
        fo.map((f) => '<span class="tag">' + f.metadata.name + '</span>').join('') + '</div>'
      : '');
  el.onclick = () => openDetail(c);
  return el;
}

function cardItem(x) {
  const m = x.metadata || {};
  const el = document.createElement('div');
  el.className = 'card';
  el.innerHTML = '<h3>' + (m.name || '-') + '</h3><p class="desc">' + (m.city ? m.city + ' &middot; ' : '') + (m.country || '') + '</p>';
  el.onclick = () => openSheet('<h3>' + (m.name || '-') + '</h3><p>' + (m.city ? m.city + ' - ' : '') + String(x.text || '') + '</p>');
  return el;
}

function defaultList(countries) {
  let base = countries;
  if (regionFilter !== 'all') base = base.filter((c) => regionOf(c.metadata.name) === regionFilter);
  const rank = (c) => {
    const i = POPULAR.indexOf(low(c.metadata.name));
    return i < 0 ? 999 : i;
  };
  return base.slice().sort((a, b) => rank(a) - rank(b)).slice(0, 20);
}

export async function renderJelajah(q) {
  const d = await data();
  if (!d) return errorCard();
  const { countries, foods, wisata } = d;
  view.innerHTML = '';

  if (!q) {
    const seg = document.createElement('div');
    seg.className = 'seg';
    seg.innerHTML =
      '<button data-m="negara" class="' + (jelajahMode === 'negara' ? 'on' : '') + '">Negara</button>' +
      '<button data-m="wisata" class="' + (jelajahMode === 'wisata' ? 'on' : '') + '">Wisata</button>' +
      '<button data-m="kuliner" class="' + (jelajahMode === 'kuliner' ? 'on' : '') + '">Kuliner</button>';
    view.appendChild(seg);
    seg.querySelectorAll('[data-m]').forEach((b) => {
      b.onclick = () => { jelajahMode = b.dataset.m; renderJelajah(''); };
    });

    const chips = document.createElement('div');
    chips.className = 'tags';
    chips.innerHTML = FILTERS.map((f) =>
      '<button class="tag' + (regionFilter === f[0] ? ' on' : '') + '" data-f="' + f[0] + '">' + f[1] + '</button>'
    ).join('');
    view.appendChild(chips);
    chips.querySelectorAll('[data-f]').forEach((b) => {
      b.onclick = () => { regionFilter = b.dataset.f; renderJelajah(''); };
    });

    if (jelajahMode !== 'negara') {
      const list = jelajahMode === 'wisata' ? wisata : foods;
      const filtered = (regionFilter === 'all' ? list : list.filter((x) => regionOf(x.metadata.country) === regionFilter)).slice(0, 30);
      filtered.forEach((x) => view.appendChild(cardItem(x)));
      return;
    }

    const rec = getRecent();
    if (rec.length) {
      const box = document.createElement('div');
      box.innerHTML =
        '<div class="sec">' + ic('clock') + ' Terakhir dicari</div>' +
        '<div class="tags">' + rec.map((t, i) => '<button class="tag" data-r="' + i + '">' + t + '</button>').join('') + '</div>';
      view.appendChild(box);
      box.querySelectorAll('[data-r]').forEach((b) => {
        b.onclick = () => {
          $('#q').value = rec[+b.dataset.r];
          renderJelajah(rec[+b.dataset.r]);
        };
      });
    }

    defaultList(countries).forEach((c) => view.appendChild(cardCountry(c, foods)));
    return;
  }

  let lc = countries.filter((c) => low(c.metadata.name).includes(low(q)));
  if (!lc.length) {
    const fz = fuzzyCountry(q, countries);
    if (fz) lc = [fz];
  }
  lc.forEach((c) => view.appendChild(cardCountry(c, foods)));

  const cf = foods.filter((f) => low(f.metadata.name).includes(low(q))).slice(0, 6);
  if (cf.length) {
    const sec = document.createElement('div');
    sec.innerHTML =
      '<div class="sec">' + ic('food') + ' Kuliner</div><div class="tags">' +
      cf.map((f) => '<button class="tag" data-c="' + f.metadata.country + '">' + f.metadata.name + ' &middot; ' + f.metadata.country + '</button>').join('') +
      '</div>';
    view.appendChild(sec);
    sec.querySelectorAll('[data-c]').forEach((b) => b.onclick = () => openDetailByName(b.dataset.c));
  }

  const cw = wisata.filter((w) => low(w.metadata.name).includes(low(q))).slice(0, 6);
  if (cw.length) {
    const sec = document.createElement('div');
    sec.innerHTML =
      '<div class="sec">' + ic('map') + ' Wisata</div><div class="tags">' +
      cw.map((w, i) => '<button class="tag" data-w="' + i + '">' + w.metadata.name + ' &middot; ' + w.metadata.country + '</button>').join('') +
      '</div>';
    view.appendChild(sec);
    sec.querySelectorAll('[data-w]').forEach((b) => b.onclick = () => {
      const w = cw[+b.dataset.w];
      openSheet('<h3>' + w.metadata.name + '</h3><p>' + (w.metadata.city ? w.metadata.city + ' - ' : '') + String(w.text || '') + '</p>');
    });
  }

  if (!lc.length && !cf.length && !cw.length) {
    view.innerHTML = '<div class="card"><p class="desc">Tidak ditemukan.</p></div>';
  }
}

export async function openDetailByName(name) {
  const d = await data();
  if (!d) return errorCard();
  const c = d.countries.find((x) => low(x.metadata.name) === low(name));
  if (c) openDetail(c);
}
