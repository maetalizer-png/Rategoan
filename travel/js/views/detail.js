import { ic } from '../icons.js';
import { data } from '../loader.js';
import { low, byCountry, fmtN, stat, errorCard, regionOf } from '../utils.js';
import { RATES } from '../constants.js';
import { getStats, saveStats } from '../storage.js';
import { openSheet, renderJelajah } from './jelajah.js';
import { climateCard } from '../features/climate.js';
import { openConverter } from '../features/currency.js';

const $ = (s) => document.querySelector(s);
const view = $('#view');

export async function openDetail(c) {
  const d = await data();
  if (!d) return errorCard();
  const { foods, wisata, cities, senbud, sej, langs } = d;
  const st = getStats();
  st.viewed++;
  saveStats(st);

  const m = c.metadata || {};
  const name = m.name || '';
  const myFoods = byCountry(foods, name).slice(0, 4);
  const myWisata = byCountry(wisata, name).slice(0, 4);
  const myCities = byCountry(cities, name).slice(0, 6);
  const myBudaya = byCountry(senbud, name).slice(0, 3);
  const mySej = (sej || []).filter((x) => {
    const mm = x.metadata || {};
    return low(mm.country) === low(name) || (mm.tags || []).some((t) => low(t).includes(low(name)));
  }).slice(0, 2);
  const myLangs = (langs || []).filter((l) =>
    ((l.metadata || {}).officialIn || []).some((x) => low(x) === low(name))
  ).slice(0, 2);
  const rate = RATES[m.currency];

  view.innerHTML =
    '<div class="rowbtn"><button class="btn" id="back">' + ic('back') + ' Kembali</button>' +
    '<button class="btn" id="share">' + ic('share') + ' Bagikan kartu</button></div>' +
    '<div class="card"><h3>' + name + '</h3>' +
    '<p class="desc" style="-webkit-line-clamp:99">' + String(c.text || '') + '</p>' +
    '<div class="stats">' +
      stat('bank', m.capital || '-') + stat('cash', m.currency || '-') +
      (m.population ? stat('users', fmtN(m.population)) : '') +
      (m.area ? stat('area', fmtN(m.area) + ' km2') : '') +
    '</div>' +
    (myLangs.length ? '<div class="sec">' + ic('lang') + ' Bahasa</div><div class="tags">' + myLangs.map((l) => '<span class="tag">' + l.metadata.name + '</span>').join('') + '</div>' : '') +
    (myFoods.length ? '<div class="sec">' + ic('food') + ' Kuliner</div><div class="tags">' + myFoods.map((f) => '<span class="tag">' + f.metadata.name + '</span>').join('') + '</div>' : '') +
    (myWisata.length ? '<div class="sec">' + ic('map') + ' Wisata</div><div class="tags">' + myWisata.map((w, i) => '<button class="tag" data-w="' + i + '">' + w.metadata.name + '</button>').join('') + '</div>' : '') +
    (myBudaya.length ? '<div class="sec">' + ic('book') + ' Budaya</div><div class="tags">' + myBudaya.map((b, i) => '<button class="tag" data-b="' + i + '">' + b.metadata.name + '</button>').join('') + '</div>' : '') +
    (mySej.length ? '<div class="sec">' + ic('clock') + ' Sejarah</div><div class="tags">' + mySej.map((s2, i) => '<button class="tag" data-h="' + i + '">' + s2.metadata.name + '</button>').join('') + '</div>' : '') +
    (myCities.length ? '<div class="sec">' + ic('city') + ' Kota</div><div class="tags">' + myCities.map((x) => '<span class="tag">' + x.metadata.name + '</span>').join('') + '</div>' : '') +
    (rate ? '<div class="sec">' + ic('swap') + ' Konversi (kurs perkiraan)</div><div class="conv"><input id="amt" type="number" inputmode="decimal" value="100"><span>1 ' + m.currency + ' = Rp ' + rate.toLocaleString('id-ID') + '</span><b id="convOut"></b></div><div class="tags"><button class="tag" id="openConv">' + ic('swap') + ' Buka konverter</button></div>' : '') +
    '</div>' + climateCard(regionOf(name));

  $('#back').onclick = () => renderJelajah('');
  $('#share').onclick = (ev) => {
    const lines = [
      name.toUpperCase(),
      'Ibukota: ' + (m.capital || '-') + ' | Mata uang: ' + (m.currency || '-'),
      m.population ? 'Populasi: ' + fmtN(m.population) : '',
      myFoods.length ? 'Kuliner: ' + myFoods.map((f) => f.metadata.name).join(', ') : '',
      myWisata.length ? 'Wisata: ' + myWisata.map((w) => w.metadata.name).join(', ') : '',
      '- dari Jalanin',
    ].filter(Boolean).join('\n');
    if (navigator.share) navigator.share({ text: lines }).catch(() => {});
    else if (navigator.clipboard) navigator.clipboard.writeText(lines).then(() => { ev.currentTarget.innerHTML = ic('share') + ' Tersalin'; });
  };
  view.querySelectorAll('[data-w]').forEach((b) => b.onclick = () => {
    const w = myWisata[+b.dataset.w];
    openSheet('<h3>' + w.metadata.name + '</h3><p>' + (w.metadata.city ? w.metadata.city + ' - ' : '') + String(w.text || '') + '</p>');
  });
  view.querySelectorAll('[data-b]').forEach((b) => b.onclick = () => {
    const x = myBudaya[+b.dataset.b];
    openSheet('<h3>' + x.metadata.name + '</h3><p>' + String(x.text || '') + '</p>');
  });
  view.querySelectorAll('[data-h]').forEach((b) => b.onclick = () => {
    const x = mySej[+b.dataset.h];
    openSheet('<h3>' + x.metadata.name + '</h3><p>' + String(x.text || '') + '</p>');
  });
  if (rate) {
    const amt = $('#amt'), out = $('#convOut');
    const calc = () => { out.textContent = 'Rp ' + Math.round((parseFloat(amt.value) || 0) * rate).toLocaleString('id-ID'); };
    amt.addEventListener('input', calc);
    calc();
    $('#openConv').onclick = () => openConverter(m.currency);
  }
}
