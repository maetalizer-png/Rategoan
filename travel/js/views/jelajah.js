import { ic } from '../icons.js';
import { data } from '../loader.js';
import { low, byCountry, fmtN, stat, errorCard, regionOf, fuzzyCountry, daysUntil, hashText, mulberry } from '../utils.js';
import { POPULAR, FILTERS } from '../constants.js';
import { getRecent, pushRecent, getViewed, getTrips, isFav, toggleFav } from '../storage.js';
import { openDetail } from './detail.js';

const $ = (s) => document.querySelector(s);
const view = $('#view');

let regionFilter = 'all';
let jelajahMode = 'negara';
let cityFilter = '';

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
    '<div class="card-head"><h3>' + (m.name || '-') + ic('chev') + '</h3>' +
    '<button class="fav-btn' + (isFav(m.name) ? ' on' : '') + '" data-fav="' + m.name + '" aria-label="Favorit">' + ic('star') + '</button></div>' +
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
  el.querySelector('h3').onclick = () => openDetail(c);
  el.querySelector('[data-fav]').onclick = (ev) => {
    ev.stopPropagation();
    const on = toggleFav(m.name);
    ev.currentTarget.classList.toggle('on', on);
  };
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

function countdownWidget() {
  const upcoming = getTrips()
    .map((t) => ({ t, hn: daysUntil(t.depart) }))
    .filter((x) => x.hn != null && x.hn >= 0)
    .sort((a, b) => a.hn - b.hn)[0];
  if (!upcoming) return null;
  const box = document.createElement('div');
  box.className = 'card countdown-card';
  box.innerHTML =
    '<div><div class="sec" style="margin:0">' + ic('cal') + ' Perjalanan mendatang</div>' +
    '<p class="desc" style="margin:2px 0 0">' + upcoming.t.country + '</p></div>' +
    '<div class="countdown-num">H-' + upcoming.hn + '</div>';
  return box;
}

function sapaanHariIniWidget(langs) {
  const pool = (langs || []).filter((l) => l.metadata && l.metadata.greetings);
  if (!pool.length) return null;
  const today = new Date().toISOString().slice(0, 10);
  const rng = mulberry(hashText('sapaan-' + today));
  const pick = pool[Math.floor(rng() * pool.length)];
  const g = pick.metadata.greetings;
  const box = document.createElement('div');
  box.className = 'card';
  box.innerHTML =
    '<div class="sec" style="margin:0">' + ic('lang') + ' Sapaan hari ini</div>' +
    '<p class="desc">"' + (g.halo || '-') + '" &mdash; ' + pick.metadata.name + '</p>';
  box.onclick = () => document.querySelector('.bot button[data-tab="sapaan"]').click();
  return box;
}

export async function renderJelajah(q) {
  const d = await data();
  if (!d) return errorCard();
  const { countries, foods, wisata, langs } = d;
  view.innerHTML = '';

  if (!q) {
    const cd = countdownWidget();
    if (cd) view.appendChild(cd);

    const sw = sapaanHariIniWidget(langs);
    if (sw) view.appendChild(sw);

    const seg = document.createElement('div');
    seg.className = 'seg';
    seg.innerHTML =
      '<button data-m="negara" class="' + (jelajahMode === 'negara' ? 'on' : '') + '">Negara</button>' +
      '<button data-m="wisata" class="' + (jelajahMode === 'wisata' ? 'on' : '') + '">Wisata</button>' +
      '<button data-m="kuliner" class="' + (jelajahMode === 'kuliner' ? 'on' : '') + '">Kuliner</button>';
    view.appendChild(seg);
    seg.querySelectorAll('[data-m]').forEach((b) => {
      b.onclick = () => { jelajahMode = b.dataset.m; cityFilter = ''; renderJelajah(''); };
    });

    const chips = document.createElement('div');
    chips.className = 'tags';
    chips.innerHTML = FILTERS.map((f) =>
      '<button class="tag' + (regionFilter === f[0] ? ' on' : '') + '" data-f="' + f[0] + '">' + f[1] + '</button>'
    ).join('') + '<button class="tag" id="cmpOpen">' + ic('swap') + ' Bandingkan</button>';
    view.appendChild(chips);
    chips.querySelectorAll('[data-f]').forEach((b) => {
      b.onclick = () => { regionFilter = b.dataset.f; renderJelajah(''); };
    });
    chips.querySelector('#cmpOpen').onclick = async () => {
      const { openCompare } = await import('../features/compare.js');
      openCompare(countries);
    };

    if (jelajahMode !== 'negara') {
      const list = jelajahMode === 'wisata' ? wisata : foods;
      let filtered = regionFilter === 'all' ? list : list.filter((x) => regionOf(x.metadata.country) === regionFilter);
      if (jelajahMode === 'wisata') {
        const cities = [...new Set(filtered.map((x) => x.metadata.city).filter(Boolean))].sort();
        if (cities.length > 1) {
          const cityBox = document.createElement('div');
          cityBox.className = 'tags';
          cityBox.innerHTML =
            '<button class="tag' + (!cityFilter ? ' on' : '') + '" data-city="">Semua kota</button>' +
            cities.map((c) => '<button class="tag' + (cityFilter === c ? ' on' : '') + '" data-city="' + c + '">' + c + '</button>').join('');
          view.appendChild(cityBox);
          cityBox.querySelectorAll('[data-city]').forEach((b) => {
            b.onclick = () => { cityFilter = b.dataset.city; renderJelajah(''); };
          });
        }
        if (cityFilter) filtered = filtered.filter((x) => x.metadata.city === cityFilter);
      }
      filtered.slice(0, 30).forEach((x) => view.appendChild(cardItem(x)));
      return;
    }

    const viewedNames = getViewed();
    if (viewedNames.length) {
      const box = document.createElement('div');
      box.innerHTML =
        '<div class="sec">' + ic('map') + ' Terakhir dilihat</div>' +
        '<div class="tags">' + viewedNames.map((t, i) => '<button class="tag" data-v="' + i + '">' + t + '</button>').join('') + '</div>';
      view.appendChild(box);
      box.querySelectorAll('[data-v]').forEach((b) => {
        b.onclick = () => {
          const c = countries.find((x) => low(x.metadata.name) === low(viewedNames[+b.dataset.v]));
          if (c) openDetail(c);
        };
      });
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

    const popularNames = POPULAR.slice(0, 8);
    const popBox = document.createElement('div');
    popBox.innerHTML =
      '<div class="sec">' + ic('award') + ' Populer</div>' +
      '<div class="tags">' + popularNames.map((n, i) => '<button class="tag" data-pop="' + i + '">' + n.charAt(0).toUpperCase() + n.slice(1) + '</button>').join('') + '</div>';
    view.appendChild(popBox);
    popBox.querySelectorAll('[data-pop]').forEach((b) => {
      b.onclick = () => {
        const c = countries.find((x) => low(x.metadata.name) === popularNames[+b.dataset.pop]);
        if (c) openDetail(c);
      };
    });

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
