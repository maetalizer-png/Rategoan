// =========================================================
// JALANIN — app.js
// Teman travel offline: jelajah, kuis, sapaan, trip
// =========================================================

const $ = (s) => document.querySelector(s);
const view = $('#view');

let dataries = null;
let REGIONS = null;
let countries = null, langs = null, foods = null, cities = null,
  wisata = null, senbud = null, sej = null;
let quiz = null, tebak = null;
let sIdx = 0, sList = [], sRevealed = false, sMode = 'kartu';
let regionFilter = 'all';

// ---------- Ikon SVG ----------
const ICONS = {
  bank: '<path d="M12 3 3 9h18L12 3z"/><path d="M5 9v9M9.5 9v9M14.5 9v9M19 9v9"/><path d="M3 21h18"/>',
  cash: '<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/>',
  users: '<path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"/><circle cx="10" cy="7" r="4"/><path d="M21 21v-2a4 4 0 0 0-3-3.9"/><path d="M16 3.1a4 4 0 0 1 0 7.8"/>',
  area: '<path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/>',
  lang: '<path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.5 8.5 0 1 1 16.1-3.8z"/>',
  food: '<path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>',
  map: '<path d="M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4z"/><path d="M8 2v16M16 6v16"/>',
  city: '<rect x="5" y="2" width="14" height="20" rx="1"/><path d="M9 6h2M13 6h2M9 10h2M13 10h2M9 14h2M13 14h2"/>',
  vol: '<path d="M11 5 6 9H2v6h4l5 4V5z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 5.5a9 9 0 0 1 0 13"/>',
  back: '<path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/>',
  next: '<path d="M5 12h14"/><path d="M12 5l7 7-7 7"/>',
  chev: '<path d="M9 18l6-6-6-6"/>',
  share: '<path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M16 6l-4-4-4 4"/><path d="M12 2v13"/>',
  shuffle: '<path d="M16 3h5v5"/><path d="M4 20 21 3"/><path d="M21 16v5h-5"/><path d="M15 15l6 6"/><path d="M4 4l5 5"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="M21 21l-4.3-4.3"/>',
  flame: '<path d="M12 22c4.4 0 7-2.8 7-6.7 0-2.8-1.7-5-3.2-6.6-.6 1-1.4 1.8-2.3 2.3.3-2.8-.8-6-2.5-8-.3 3-1.7 4.6-3.1 6.2C6.4 10.9 5 12.8 5 15.3c0 3.9 2.6 6.7 7 6.7z"/>',
  award: '<circle cx="12" cy="8" r="6"/><path d="M15.5 13 17 21l-5-3-5 3 1.5-8"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/>',
  swap: '<path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a13.5 13.5 0 0 1 0 18"/><path d="M12 3a13.5 13.5 0 0 0 0 18"/>',
  quiz: '<circle cx="12" cy="12" r="9"/><path d="M9.3 9a2.7 2.7 0 0 1 5.4 0c0 1.6-2.7 2.1-2.7 3.7"/><path d="M12 17h.01"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  cal: '<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M16 2v4M8 2v4M3 9h18"/>',
  book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15z"/><path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5"/>',
};

function ic(n) {
  return '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true">' + ICONS[n] + '</svg>';
}

// ---------- Konstanta ----------
const RATES = {
  'Rupiah': 1, 'Euro': 17200, 'Pound Sterling': 20500, 'Dolar Amerika': 16300,
  'Dolar Singapura': 12600, 'Ringgit': 3500, 'Baht': 470, 'Yen': 110, 'Yuan': 2280,
  'Won': 12, 'Riyal': 4350, 'Dirham': 4450, 'Rupee': 196, 'Dolar Australia': 10700,
  'Franc CFA': 28, 'Cedi': 1060, 'Naira': 101, 'Rand': 890, 'Rubel': 182, 'Lira': 500, 'Peso': 290,
};
const POPULAR = ['indonesia', 'malaysia', 'singapura', 'thailand', 'vietnam', 'jepang', 'korea selatan', 'china', 'arab saudi', 'turki', 'prancis', 'inggris', 'amerika serikat', 'australia', 'mesir', 'maroko'];
const ASEAN = ['indonesia', 'malaysia', 'singapura', 'thailand', 'vietnam', 'filipina', 'myanmar', 'kamboja', 'laos', 'brunei', 'timor leste'];
const DEFAULT_PACK = ['Paspor / KTP', 'Tiket & bukti booking', 'Charger & powerbank', 'Obat pribadi', 'Pakaian secukupnya', 'Uang tunai & kartu'];
const FILTERS = [['all', 'Semua'], ['asean', 'ASEAN'], ['asia', 'Asia'], ['eropa', 'Eropa'], ['afrika', 'Afrika'], ['amerika', 'Amerika'], ['osenia', 'Osenia']];
const BUDGET_BASE = { asean: 600000, asia: 900000, eropa: 1800000, afrika: 800000, amerika: 1500000, osenia: 1700000, lain: 1000000 };
const TIER_MULT = { hemat: 1, sedang: 1.8, nyaman: 3 };
const PACK_TIPS = {
  asean: ['Jas hujan tipis', 'Obat nyamuk', 'Sandar nyaman'],
  asia: ['Adaptor colokan', 'Jaket ringan'],
  eropa: ['Jaket hangat', 'Adaptor tipe C/F', 'Payung lipat'],
  afrika: ['Tabir surya', 'Air botol', 'Konsultasi obat pribadi'],
  amerika: ['Adaptor colokan', 'Jaket ringan'],
  osenia: ['Tabir surya', 'Topi'],
  lain: ['Adaptor universal'],
};
const BADGES = [
  { id: 'asean', label: 'Penjelajah ASEAN', test: (s) => s.bestSantai >= 8 },
  { id: 'dunia', label: 'Penakluk Dunia', test: (s) => s.bestDunia >= 8 },
  { id: 'streak', label: 'Konsisten', test: () => +localStorage.getItem('travel_streak') >= 3 },
  { id: 'collector', label: 'Kolektor', test: (s) => s.viewed >= 20 },
  { id: 'poliglot', label: 'Poliglot', test: (s) => s.sapaan >= 30 },
  { id: 'planner', label: 'Perencana', test: (s) => s.trips >= 1 },
];

// ---------- Loader dataries ----------
const DATARIES_PATHS = ['../dataries/index.js', '../../dataries/index.js', '../../../dataries/index.js'];

async function loadDataries() {
  if (dataries) return dataries;
  for (const p of DATARIES_PATHS) {
    try {
      const mod = await import(p);
      if (mod && mod.dataries) {
        dataries = mod.dataries;
        REGIONS = mod.REGIONS || null;
        return dataries;
      }
    } catch (e) { /* coba jalur berikutnya */ }
  }
  return null;
}

async function data() {
  const d = await loadDataries();
  if (!d) return null;
  if (!countries) {
    [countries, langs, foods, cities, wisata, senbud, sej] = await Promise.all([
      d.loadAll('country'), d.loadAll('languages'), d.loadAll('makanan'),
      d.loadAll('cities'), d.loadAll('wisata'), d.loadAll('seni-budaya'), d.loadAll('sejarah'),
    ]);
  }
  return { countries, langs, foods, cities, wisata, senbud, sej };
}

// ---------- Util ----------
const low = (s) => String(s || '').toLowerCase();
const fmtN = (n) => n >= 1e9 ? Math.round(n / 1e9 * 10) / 10 + ' M'
  : n >= 1e6 ? Math.round(n / 1e6) + ' jt'
  : n >= 1e3 ? Math.round(n / 1e3) + ' rb' : n;
const byCountry = (list, name) => (list || []).filter((x) => low(((x || {}).metadata || {}).country) === low(name));

function getStats() {
  try {
    return Object.assign(
      { played: 0, correct: 0, viewed: 0, sapaan: 0, trips: 0, bestSantai: 0, bestDunia: 0 },
      JSON.parse(localStorage.getItem('travel_stats'))
    );
  } catch (e) {
    return { played: 0, correct: 0, viewed: 0, sapaan: 0, trips: 0, bestSantai: 0, bestDunia: 0 };
  }
}
function saveStats(s) { localStorage.setItem('travel_stats', JSON.stringify(s)); }

function getCheck() {
  try {
    const l = JSON.parse(localStorage.getItem('travel_check'));
    return Array.isArray(l) && l.length ? l : DEFAULT_PACK.map((t) => ({ t, done: false }));
  } catch (e) {
    return DEFAULT_PACK.map((t) => ({ t, done: false }));
  }
}
function saveCheck(l) { localStorage.setItem('travel_check', JSON.stringify(l)); }

function getTrips() {
  try {
    const l = JSON.parse(localStorage.getItem('travel_trips'));
    return Array.isArray(l) ? l : [];
  } catch (e) { return []; }
}
function saveTrips(l) { localStorage.setItem('travel_trips', JSON.stringify(l)); }

function getDays() {
  try {
    const l = JSON.parse(localStorage.getItem('travel_days'));
    return Array.isArray(l) ? l : [];
  } catch (e) { return []; }
}
function pushDay(d) {
  const l = getDays();
  if (!l.includes(d)) {
    l.push(d);
    localStorage.setItem('travel_days', JSON.stringify(l.slice(-30)));
  }
}

function getRecent() {
  try {
    const l = JSON.parse(localStorage.getItem('travel_recent'));
    return Array.isArray(l) ? l : [];
  } catch (e) { return []; }
}
function pushRecent(t) {
  const l = getRecent().filter((x) => x !== t);
  l.unshift(t);
  localStorage.setItem('travel_recent', JSON.stringify(l.slice(0, 5)));
}

function hashText(t) {
  let h = 0;
  const s = String(t || '');
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}
function mulberry(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function lev(a, b) {
  const m = a.length, n = b.length;
  if (!m) return n;
  if (!n) return m;
  let prev = Array.from({ length: n + 1 }, (_, i) => i);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = cur;
  }
  return prev[n];
}
function fuzzyCountry(q) {
  const t = low(q).trim();
  if (t.length < 4) return null;
  let best = null, bestD = 3;
  countries.forEach((c) => {
    const d = lev(t, low(c.metadata.name));
    if (d < bestD) { bestD = d; best = c; }
  });
  return bestD <= 2 ? best : null;
}
function daysUntil(dateStr) {
  if (!dateStr) return null;
  const target = new Date(dateStr + 'T00:00:00');
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.round((target - now) / 86400000);
}
function clusterByCity(items) {
  const groups = [];
  items.forEach((w) => {
    const city = low(w.metadata.city || '');
    const last = groups[groups.length - 1];
    if (last && last.city === city) last.items.push(w);
    else groups.push({ city, items: [w] });
  });
  return groups.flatMap((g) => g.items);
}
function phrasesFor(name) {
  return (langs || []).find((l) =>
    ((l.metadata || {}).officialIn || []).some((c) => low(c) === low(name))
  ) || null;
}
function errorCard() {
  view.innerHTML = '<div class="card"><h3>Data tidak ditemukan</h3>' +
    '<p class="desc">Salin folder dataries ke dalam travel, atau taruh travel di repo yang punya dataries.</p></div>';
}
function stat(icon, label) {
  return '<span class="stat">' + ic(icon) + '<b>' + label + '</b></span>';
}
function regionOf(name) {
  const n = low(name);
  const R = (REGIONS && REGIONS.country) || [];
  for (const r of R) {
    if ((r.names || []).includes(n)) {
      if (r.id === 'asian-tenggara') return 'asean';
      if (r.id.indexOf('asian') === 0) return 'asia';
      if (r.id.indexOf('eropan') === 0) return 'eropa';
      if (r.id.indexOf('african') === 0) return 'afrika';
      if (r.id.indexOf('american') === 0) return 'amerika';
      if (r.id === 'osenian') return 'osenia';
    }
  }
  return 'lain';
}

// ---------- Jelajah ----------
function cardCountry(c) {
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

function defaultList() {
  let base = countries;
  if (regionFilter !== 'all') base = base.filter((c) => regionOf(c.metadata.name) === regionFilter);
  const rank = (c) => {
    const i = POPULAR.indexOf(low(c.metadata.name));
    return i < 0 ? 999 : i;
  };
  return base.slice().sort((a, b) => rank(a) - rank(b)).slice(0, 20);
}

async function renderJelajah(q) {
  if (!(await data())) return errorCard();
  view.innerHTML = '';

  if (!q) {
    const chips = document.createElement('div');
    chips.className = 'tags';
    chips.innerHTML = FILTERS.map((f) =>
      '<button class="tag' + (regionFilter === f[0] ? ' on' : '') + '" data-f="' + f[0] + '">' + f[1] + '</button>'
    ).join('');
    view.appendChild(chips);
    chips.querySelectorAll('[data-f]').forEach((b) => {
      b.onclick = () => { regionFilter = b.dataset.f; renderJelajah(''); };
    });

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

    defaultList().forEach((c) => view.appendChild(cardCountry(c)));
    return;
  }

  let lc = countries.filter((c) => low(c.metadata.name).includes(low(q)));
  if (!lc.length) {
    const fz = fuzzyCountry(q);
    if (fz) lc = [fz];
  }
  lc.forEach((c) => view.appendChild(cardCountry(c)));

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

async function openDetailByName(name) {
  const d = await data();
  if (!d) return errorCard();
  const c = countries.find((x) => low(x.metadata.name) === low(name));
  if (c) openDetail(c);
}

function openSheet(html) {
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

// ---------- Detail negara ----------
async function openDetail(c) {
  const d = await data();
  if (!d) return errorCard();
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
    (rate ? '<div class="sec">' + ic('swap') + ' Konversi (kurs perkiraan)</div><div class="conv"><input id="amt" type="number" inputmode="decimal" value="100"><span>1 ' + m.currency + ' = Rp ' + rate.toLocaleString('id-ID') + '</span><b id="convOut"></b></div>' : '') +
    '</div>';

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
  }
}

// ---------- Kuis ----------
function streakDots() {
  const days = getDays();
  const out = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
    out.push('<span class="dot' + (days.includes(d) ? ' on' : '') + '"></span>');
  }
  return '<span class="dots">' + out.join('') + '</span>';
}

function showKuisHome() {
  const st = getStats();
  const acc = st.played ? Math.round((st.correct / (st.played * 10)) * 100) : 0;
  const today = new Date().toISOString().slice(0, 10);
  const dailyDone = localStorage.getItem('travel_daily') === today;
  view.innerHTML =
    '<div class="card"><h3>' + ic('quiz') + ' Kuis</h3>' +
    '<p class="desc">Akurasi ' + acc + '% dari ' + st.played + ' main &middot; ' + ic('flame') + ' ' +
    (localStorage.getItem('travel_streak') || 0) + ' &middot; ' + ic('award') + ' ' +
    (localStorage.getItem('travel_best') || 0) + ' ' + streakDots() + '</p>' +
    '<div class="rowbtn"><button class="btn" id="m1">Santai (ASEAN & populer)</button>' +
    '<button class="btn" id="m2">Tantangan (dunia)</button></div>' +
    '<div class="rowbtn"><button class="btn" id="m3"' + (dailyDone ? ' disabled' : '') + '>' + ic('cal') +
    (dailyDone ? ' Tantangan harian (selesai)' : ' Tantangan harian (bonus streak)') + '</button></div>' +
    '<div class="sec">' + ic('award') + ' Pencapaian</div><div class="tags">' +
    BADGES.map((b) => '<span class="bdg' + (b.test(st) ? ' on' : '') + '">' + b.label + '</span>').join('') +
    '</div></div>';
  $('#m1').onclick = () => startKuis('santai');
  $('#m2').onclick = () => startKuis('dunia');
  if (!dailyDone) $('#m3').onclick = () => startKuis('daily');
}

function buildGens(pool, rng) {
  const r = rng || Math.random;
  const poolNames = new Set(pool.map((c) => c.metadata.name));
  const nameOpts = pool.map((c) => c.metadata.name);
  const capOpts = pool.map((c) => c.metadata.capital);
  const curOpts = pool.map((c) => c.metadata.currency);
  const gens = [];
  pool.forEach((c) => {
    gens.push({ q: 'Ibukota ' + c.metadata.name + '?', ans: c.metadata.capital, pool: capOpts });
    gens.push({ q: 'Mata uang ' + c.metadata.name + '?', ans: c.metadata.currency, pool: curOpts });
  });
  foods.forEach((f) => {
    if (f.metadata && poolNames.has(f.metadata.country)) {
      gens.push({ q: f.metadata.name + ' khas negara...?', ans: f.metadata.country, pool: nameOpts });
    }
  });
  wisata.forEach((w) => {
    if (w.metadata && poolNames.has(w.metadata.country)) {
      gens.push({ q: w.metadata.name + ' ada di...?', ans: w.metadata.country, pool: nameOpts });
    }
  });
  langs.forEach((l) => {
    const off = (l.metadata && l.metadata.officialIn) || [];
    if (off.length && l.metadata.greetings) {
      gens.push({ q: '"' + l.metadata.greetings.halo + '" sapaan bahasa...?', ans: l.metadata.name, pool: langs.map((x) => x.metadata.name) });
    }
  });
  return gens;
}

function toItems(gens, n, rng) {
  const r = rng || Math.random;
  return [...gens].sort(() => r() - 0.5).slice(0, n).map((g) => {
    const wrong = [...new Set(g.pool.filter((p) => p && p !== g.ans))].sort(() => r() - 0.5).slice(0, 3);
    return { q: g.q, ans: g.ans, opts: [g.ans].concat(wrong).sort(() => r() - 0.5) };
  });
}

async function startKuis(mode) {
  const d = await data();
  if (!d) return errorCard();
  const all = countries.filter((c) => c.metadata.capital && c.metadata.currency);

  if (mode === 'daily') {
    const today = new Date().toISOString().slice(0, 10);
    const rng = mulberry(hashText(today));
    quiz = { i: 0, score: 0, timer: null, mode, items: toItems(buildGens(all, rng), 5, rng) };
    drawKuis();
    return;
  }

  const santaiNames = ASEAN.concat(POPULAR);
  const poolS = all.filter((c) => santaiNames.includes(low(c.metadata.name)));
  let items;
  if (mode === 'santai') {
    const bonus = buildGens(all.filter((c) => !santaiNames.includes(low(c.metadata.name))));
    items = toItems(buildGens(poolS), 8).concat(toItems(bonus, 2));
  } else {
    items = toItems(buildGens(all), 10);
  }
  quiz = { i: 0, score: 0, timer: null, mode, items: items.sort(() => Math.random() - 0.5) };
  drawKuis();
}

function reveal(b) {
  clearInterval(quiz.timer);
  view.querySelectorAll('.q-opt').forEach((x) => (x.onclick = null));
  const it = quiz.items[quiz.i];
  if (b && b.textContent === it.ans) { b.classList.add('ok'); quiz.score++; }
  else {
    if (b) b.classList.add('no');
    view.querySelectorAll('.q-opt').forEach((x) => { if (x.textContent === it.ans) x.classList.add('ok'); });
  }
  setTimeout(() => { quiz.i++; drawKuis(); }, 700);
}

function drawKuis() {
  if (!quiz) return;
  clearInterval(quiz.timer);
  if (quiz.i >= quiz.items.length) return finishKuis();
  const it = quiz.items[quiz.i];
  view.innerHTML =
    '<div class="hud"><span>Soal ' + (quiz.i + 1) + '/' + quiz.items.length + (quiz.mode === 'daily' ? ' (harian)' : '') + '</span>' +
    '<span>Skor ' + quiz.score + ic('flame') + (localStorage.getItem('travel_streak') || 0) +
    ic('award') + (localStorage.getItem('travel_best') || 0) + ic('clock') + '<b id="tleft">15</b></span></div>' +
    '<div class="card"><h3>' + it.q + '</h3>' + it.opts.map((o) => '<button class="q-opt">' + o + '</button>').join('') + '</div>';
  quiz.left = 15;
  quiz.timer = setInterval(() => {
    quiz.left--;
    const el = $('#tleft');
    if (el) el.textContent = quiz.left;
    if (quiz.left <= 0) reveal(null);
  }, 1000);
  view.querySelectorAll('.q-opt').forEach((b) => { b.onclick = () => reveal(b); });
}

function finishKuis() {
  clearInterval(quiz.timer);
  const today = new Date().toISOString().slice(0, 10);
  const st = getStats();
  st.played++;
  st.correct += quiz.score;
  saveStats(st);

  let headline = 'Selesai, skor ' + quiz.score + '/' + quiz.items.length;
  if (quiz.mode === 'daily') {
    localStorage.setItem('travel_daily', today);
    if (quiz.score >= 4) {
      const s = +localStorage.getItem('travel_streak') || 0;
      localStorage.setItem('travel_streak', s + 1);
      pushDay(today);
      headline = 'Tantangan harian lulus! Streak +1';
    } else {
      headline = 'Tantangan harian belum lulus (minimal 4). Coba lagi besok!';
    }
  } else {
    const s = +localStorage.getItem('travel_streak') || 0;
    const streak = quiz.score >= 6 ? s + 1 : 0;
    localStorage.setItem('travel_streak', streak);
    if (quiz.score >= 6) pushDay(today);
    if (quiz.mode === 'santai') st.bestSantai = Math.max(st.bestSantai, quiz.score);
    else st.bestDunia = Math.max(st.bestDunia, quiz.score);
    saveStats(st);
  }

  const best = Math.max(+localStorage.getItem('travel_best') || 0, quiz.score);
  localStorage.setItem('travel_best', best);
  view.innerHTML =
    '<div class="card"><h3>' + headline + '</h3>' +
    '<p class="desc">' + ic('flame') + ' Streak ' + (localStorage.getItem('travel_streak') || 0) +
    ' &middot; ' + ic('award') + ' Terbaik ' + best +
    ' &middot; akurasi total ' + Math.round((st.correct / (st.played * 10)) * 100) + '% ' + streakDots() + '</p>' +
    '<div class="rowbtn"><button class="btn" id="again">' + ic('shuffle') + ' Main lagi</button>' +
    '<button class="btn" id="home">Beranda kuis</button></div></div>';
  $('#again').onclick = () => startKuis(quiz.mode === 'daily' ? 'santai' : quiz.mode);
  $('#home').onclick = showKuisHome;
}

// ---------- Sapaan ----------
async function renderSapaan() {
  const d = await data();
  if (!d) return errorCard();
  sList = langs.filter((l) => l.metadata && l.metadata.greetings);
  view.innerHTML =
    '<div class="seg">' +
      '<button id="mk" class="' + (sMode === 'kartu' ? 'on' : '') + '">Kartu</button>' +
      '<button id="mt" class="' + (sMode === 'tebak' ? 'on' : '') + '">Tebak bahasa</button>' +
    '</div>' +
    '<div id="sapOut"></div>';
  $('#mk').onclick = () => { sMode = 'kartu'; renderSapaan(); };
  $('#mt').onclick = () => { sMode = 'tebak'; renderSapaan(); };
  if (sMode === 'tebak') { startTebak(); return; }
  sIdx = 0;
  sRevealed = false;
  drawSapaan();
}

function langCode(l) {
  const n = low(l.metadata.name);
  const map = {
    indonesian: 'id', indonesia: 'id', english: 'en', japanese: 'ja', korean: 'ko',
    mandarin: 'zh', chinese: 'zh', spanish: 'es', french: 'fr', german: 'de',
    arabic: 'ar', russian: 'ru', thai: 'th', vietnamese: 'vi', dutch: 'nl',
    italian: 'it', portuguese: 'pt',
  };
  return map[n] || 'id';
}

function drawSapaan() {
  const out = $('#sapOut') || view;
  const l = sList[sIdx];
  if (!l) { out.innerHTML = '<div class="card"><p class="desc">Sapaan belum tersedia.</p></div>'; return; }
  const g = l.metadata.greetings || {};
  const body = sRevealed
    ? '<h3>' + ic('lang') + ' ' + (g.halo || '-') + '</h3>' +
      '<p class="desc">pagi: ' + (g.pagi || '-') + ' &middot; terima kasih: ' + (g.terimakasih || '-') + '</p>' +
      '<div class="rowbtn"><button class="btn" id="tts">' + ic('vol') + ' Dengar</button>' +
      '<button class="btn" id="prev">' + ic('back') + '</button>' +
      '<button class="btn" id="next">' + ic('next') + '</button></div>'
    : '<div class="flipq">?</div><p class="desc" style="text-align:center">tap kartu untuk buka sapaan ' + l.metadata.name + '</p>';
  out.innerHTML =
    '<div class="hud"><span>' + (sIdx + 1) + '/' + sList.length + '</span><span>' + l.metadata.name + '</span></div>' +
    '<div class="card" id="flip">' + body + '</div>';
  if (!sRevealed) {
    $('#flip').onclick = () => {
      sRevealed = true;
      const st = getStats();
      st.sapaan++;
      saveStats(st);
      drawSapaan();
    };
    return;
  }
  $('#tts').onclick = () => {
    const u = new SpeechSynthesisUtterance(g.halo || '');
    u.lang = langCode(l);
    speechSynthesis.cancel();
    speechSynthesis.speak(u);
  };
  $('#prev').onclick = () => { sIdx = (sIdx - 1 + sList.length) % sList.length; sRevealed = false; drawSapaan(); };
  $('#next').onclick = () => { sIdx = (sIdx + 1) % sList.length; sRevealed = false; drawSapaan(); };
}

function startTebak() {
  tebak = {
    i: 0, score: 0,
    items: [...sList].sort(() => Math.random() - 0.5).slice(0, 10).map((l) => {
      const wrong = [...new Set(sList.map((x) => x.metadata.name).filter((n) => n !== l.metadata.name))]
        .sort(() => Math.random() - 0.5).slice(0, 3);
      return { g: l.metadata.greetings, ans: l.metadata.name, opts: [l.metadata.name].concat(wrong).sort(() => Math.random() - 0.5) };
    }),
  };
  drawTebak();
}

function drawTebak() {
  const out = $('#sapOut') || view;
  if (tebak.i >= tebak.items.length) {
    out.innerHTML =
      '<div class="card"><h3>' + ic('lang') + ' Tebak selesai, skor ' + tebak.score + '/10</h3>' +
      '<div class="rowbtn"><button class="btn" id="lagi">' + ic('shuffle') + ' Ulangi</button>' +
      '<button class="btn" id="kartu">Mode kartu</button></div></div>';
    $('#lagi').onclick = startTebak;
    $('#kartu').onclick = () => { sMode = 'kartu'; renderSapaan(); };
    return;
  }
  const it = tebak.items[tebak.i];
  out.innerHTML =
    '<div class="hud"><span>Soal ' + (tebak.i + 1) + '/10</span><span>Skor ' + tebak.score + '</span></div>' +
    '<div class="card"><h3>' + ic('lang') + ' "' + it.g.halo + '"</h3>' +
    '<p class="desc">pagi: ' + it.g.pagi + ' &middot; makasih: ' + it.g.terimakasih + '</p>' +
    it.opts.map((o) => '<button class="q-opt">' + o + '</button>').join('') + '</div>';
  out.querySelectorAll('.q-opt').forEach((b) => {
    b.onclick = () => {
      out.querySelectorAll('.q-opt').forEach((x) => (x.onclick = null));
      if (b.textContent === it.ans) { b.classList.add('ok'); tebak.score++; }
      else {
        b.classList.add('no');
        out.querySelectorAll('.q-opt').forEach((x) => { if (x.textContent === it.ans) x.classList.add('ok'); });
      }
      const st = getStats();
      st.sapaan++;
      saveStats(st);
      setTimeout(() => { tebak.i++; drawTebak(); }, 700);
    };
  });
}

// ---------- Trip ----------
async function openTrip() {
  const d = await data();
  if (!d) return errorCard();
  view.innerHTML =
    '<div class="card"><h3>' + ic('cal') + ' Rencana Perjalanan</h3>' +
    '<div class="search" style="margin-top:8px">' + ic('search') + '<input id="tq" placeholder="Negara tujuan..."></div>' +
    '<input id="td" type="date" class="q-opt" style="margin:8px 0 0">' +
    '<div class="rowbtn" style="margin-top:8px">' +
      [2, 3, 4].map((x) => '<button class="btn days' + (x === 3 ? ' on' : '') + '" data-d="' + x + '">' + x + ' hari</button>').join('') +
    '</div>' +
    '<div class="rowbtn">' +
      ['hemat', 'sedang', 'nyaman'].map((t2, i) =>
        '<button class="btn days' + (i === 0 ? ' on' : '') + '" data-t="' + t2 + '">' + t2.charAt(0).toUpperCase() + t2.slice(1) + '</button>'
      ).join('') +
    '</div>' +
    '<div class="rowbtn"><button class="btn" id="gen">' + ic('map') + ' Buat rencana</button></div>' +
    '<div id="tripOut"></div></div>' +
    checklistCard() + savedTripsCard();

  let days = 3, tier = 'hemat', depart = '';
  view.querySelectorAll('[data-d]').forEach((b) => b.onclick = () => {
    days = +b.dataset.d;
    view.querySelectorAll('[data-d]').forEach((x) => x.classList.toggle('on', x === b));
  });
  view.querySelectorAll('[data-t]').forEach((b) => b.onclick = () => {
    tier = b.dataset.t;
    view.querySelectorAll('[data-t]').forEach((x) => x.classList.toggle('on', x === b));
  });
  $('#td').onchange = (e) => { depart = e.target.value; };
  $('#gen').onclick = () => {
    const name = ($('#tq').value || '').trim();
    const c = countries.find((x) => low(x.metadata.name).includes(low(name))) || fuzzyCountry(name);
    if (!c) { $('#tripOut').innerHTML = '<p class="desc">Negara tidak ditemukan.</p>'; return; }
    renderTrip(c, days, tier, depart);
  };
  bindChecklist();
  bindSavedTrips();
}

function renderTrip(c, days, tier, depart) {
  const name = c.metadata.name;
  const w = clusterByCity(byCountry(wisata, name));
  const f = byCountry(foods, name);
  const per = Math.max(1, Math.ceil(w.length / days));
  const reg = regionOf(name);
  const perDay = Math.round(BUDGET_BASE[reg] * TIER_MULT[tier]);
  const hn = daysUntil(depart);

  let html = '<div class="sec">' + ic('map') + ' Itinerari ' + name +
    (hn != null && hn >= 0 ? ' &middot; <span class="hn">H-' + hn + '</span>' : '') + '</div>';
  for (let dd = 0; dd < days; dd++) {
    const items = w.slice(dd * per, (dd + 1) * per);
    const city = items.length ? (items[0].metadata.city || '') : '';
    html +=
      '<div class="card"><h3>Hari ' + (dd + 1) + (city ? ' &middot; ' + city : '') + '</h3>' +
      (items.length
        ? '<div class="tags">' + items.map((x) => '<span class="tag">' + x.metadata.name + '</span>').join('') + '</div>'
        : '<p class="desc">Jelajah santai sekitar ' + (c.metadata.capital || 'pusat kota') + '.</p>') +
      (f.length ? '<p class="desc">Kuliner: ' + f[dd % f.length].metadata.name + '</p>' : '') +
      '</div>';
  }

  const lang = phrasesFor(name);
  if (lang && lang.metadata.greetings) {
    const g = lang.metadata.greetings;
    html +=
      '<div class="card"><h3>' + ic('lang') + ' Frasa berguna (' + lang.metadata.name + ')</h3>' +
      '<div class="tags">' +
        '<span class="tag">halo: ' + (g.halo || '-') + '</span>' +
        '<span class="tag">pagi: ' + (g.pagi || '-') + '</span>' +
        '<span class="tag">makasih: ' + (g.terimakasih || '-') + '</span>' +
      '</div></div>';
  }

  html +=
    '<div class="card"><h3>' + ic('swap') + ' Estimasi budget (' + tier + ')</h3>' +
    '<p class="desc">Per hari ~Rp ' + fmtN(perDay) + ' &middot; total ' + days + ' hari ~Rp ' + fmtN(perDay * days) + '</p>' +
    '<p class="desc">Hotel 40% &middot; Makan 30% &middot; Wisata 20% &middot; Transport 10% (perkiraan kasar)</p></div>';

  const tips = PACK_TIPS[reg] || PACK_TIPS.lain;
  html +=
    '<div class="card"><h3>' + ic('check') + ' Saran bawaan (' + reg + ')</h3>' +
    '<div class="tags">' + tips.map((t, i) => '<button class="tag" data-p="' + i + '">' + ic('plus') + ' ' + t + '</button>').join('') + '</div></div>' +
    '<div class="rowbtn"><button class="btn" id="tshare">' + ic('share') + ' Bagikan</button>' +
    '<button class="btn" id="tsave">' + ic('check') + ' Simpan rencana</button></div>';
  $('#tripOut').innerHTML = html;

  view.querySelectorAll('[data-p]').forEach((b) => b.onclick = () => {
    const t = tips[+b.dataset.p];
    const l = getCheck();
    if (!l.some((x) => x.t === t)) {
      l.push({ t, done: false });
      saveCheck(l);
      b.classList.add('on');
      b.innerHTML = ic('check') + ' ' + t;
    }
  });
  $('#tshare').onclick = (ev) => {
    const lines = [
      'Rencana ' + days + ' hari di ' + name + ' (' + tier + ')' + (depart ? ' — berangkat ' + depart : ''),
      ...Array.from({ length: days }, (_, i) => {
        const items = w.slice(i * per, (i + 1) * per);
        return 'Hari ' + (i + 1) + ': ' +
          (items.length ? items.map((x) => x.metadata.name).join(', ') : 'jelajah ' + (c.metadata.capital || 'kota')) +
          (f.length ? ' | kuliner ' + f[i % f.length].metadata.name : '');
      }),
      'Estimasi total ~Rp ' + fmtN(perDay * days),
      '- dari Jalanin',
    ].join('\n');
    if (navigator.share) navigator.share({ text: lines }).catch(() => {});
    else if (navigator.clipboard) navigator.clipboard.writeText(lines).then(() => { ev.currentTarget.innerHTML = ic('share') + ' Tersalin'; });
  };
  $('#tsave').onclick = (ev) => {
    const l = getTrips();
    l.push({ country: name, days, tier, depart, time: Date.now() });
    saveTrips(l);
    const st = getStats();
    st.trips++;
    saveStats(st);
    ev.currentTarget.innerHTML = ic('check') + ' Tersimpan';
  };
}

function checklistCard() {
  const list = getCheck();
  const done = list.filter((x) => x.done).length;
  const pct = list.length ? Math.round((done / list.length) * 100) : 0;
  return '<div class="sec">' + ic('check') + ' Checklist bawaan</div><div class="card">' +
    '<div class="prog"><i id="progBar" style="width:' + pct + '%"></i></div>' +
    '<p class="desc" id="progLabel">' + done + '/' + list.length + ' siap (' + pct + '%)</p>' +
    list.map((it, i) =>
      '<label class="ck"><input type="checkbox" data-i="' + i + '"' + (it.done ? ' checked' : '') + '><span>' + it.t + '</span></label>'
    ).join('') +
    '<div class="rowbtn" style="margin-top:8px"><input id="ckNew" class="q-opt" style="margin:0" placeholder="Tambah bawaan...">' +
    '<button class="btn" id="ckAdd">' + ic('plus') + '</button></div></div>';
}

function bindChecklist() {
  const refresh = () => {
    const list = getCheck();
    const done = list.filter((x) => x.done).length;
    const pct = list.length ? Math.round((done / list.length) * 100) : 0;
    const bar = $('#progBar');
    const lab = $('#progLabel');
    if (bar) bar.style.width = pct + '%';
    if (lab) lab.textContent = done + '/' + list.length + ' siap (' + pct + '%)';
  };
  view.querySelectorAll('.ck input').forEach((cb) => {
    cb.onchange = () => {
      const l = getCheck();
      l[+cb.dataset.i].done = cb.checked;
      saveCheck(l);
      refresh();
    };
  });
  $('#ckAdd').onclick = () => {
    const v = ($('#ckNew').value || '').trim();
    if (!v) return;
    const l = getCheck();
    l.push({ t: v, done: false });
    saveCheck(l);
    openTrip();
  };
}

function savedTripsCard() {
  const list = getTrips();
  if (!list.length) return '';
  return '<div class="sec">' + ic('cal') + ' Rencana tersimpan</div><div class="card">' +
    list.map((t, i) => {
      const hn = daysUntil(t.depart);
      const label = t.country + ' &middot; ' + t.days + ' hari &middot; ' + t.tier +
        (hn != null && hn >= 0 ? ' &middot; H-' + hn : '');
      return '<div class="rowbtn" style="justify-content:space-between;margin:6px 0"><b>' + label + '</b>' +
        '<span style="display:flex;gap:6px"><button class="btn" data-open="' + i + '">Buka</button>' +
        '<button class="btn" data-del="' + i + '">Hapus</button></span></div>';
    }).join('') + '</div>';
}

function bindSavedTrips() {
  view.querySelectorAll('[data-open]').forEach((b) => b.onclick = async () => {
    const t = getTrips()[+b.dataset.open];
    const c = countries.find((x) => low(x.metadata.name) === low(t.country));
    if (c) renderTrip(c, t.days, t.tier, t.depart);
  });
  view.querySelectorAll('[data-del]').forEach((b) => b.onclick = () => {
    const l = getTrips();
    l.splice(+b.dataset.del, 1);
    saveTrips(l);
    openTrip();
  });
}

// ---------- Navigasi & init ----------
const TAB_ICON = { jelajah: 'globe', kuis: 'quiz', sapaan: 'lang', trip: 'cal' };

function goTab(t) {
  document.querySelectorAll('.bot button').forEach((x) => x.classList.toggle('on', x.dataset.tab === t));
  $('.top').hidden = t !== 'jelajah';
  if (t === 'jelajah') renderJelajah(($('#q') || {}).value || '');
  if (t === 'kuis') showKuisHome();
  if (t === 'sapaan') renderSapaan();
  if (t === 'trip') openTrip();
}

document.querySelectorAll('.bot button').forEach((b) => {
  b.innerHTML = ic(TAB_ICON[b.dataset.tab]) + '<span>' + b.textContent.trim() + '</span>';
  b.onclick = () => goTab(b.dataset.tab);
});

const wrap = document.createElement('div');
wrap.className = 'search';
wrap.innerHTML = ic('search');
const inp = $('#q');
inp.parentNode.insertBefore(wrap, inp);
wrap.appendChild(inp);
inp.addEventListener('input', (e) => renderJelajah(e.target.value));
inp.addEventListener('change', (e) => {
  const v = e.target.value.trim();
  if (v.length >= 3) pushRecent(v);
});

$('#fab').innerHTML = ic('shuffle');
$('#fab').onclick = async () => {
  const d = await data();
  if (!d) return errorCard();
  openDetail(countries[Math.floor(Math.random() * countries.length)]);
};

if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});

if (!localStorage.getItem('travel_coach')) {
  localStorage.setItem('travel_coach', '1');
  setTimeout(() => openSheet(
    '<h3>Selamat datang di Jalanin</h3>' +
    '<p>1. Tap kartu negara untuk detail lengkap: wisata, budaya, sejarah, konversi mata uang.<br>' +
    '2. Tab Kuis punya tantangan harian berbonus streak dan 6 badge.<br>' +
    '3. Tab Trip menyusun itinerari, estimasi budget, dan saran bawaan otomatis sesuai tujuan.</p>'
  ), 400);
}

renderJelajah('');