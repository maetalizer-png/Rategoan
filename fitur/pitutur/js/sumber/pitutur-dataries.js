const KEY_RECENT = 'raget_pitutur_recent';
const DINGIN_MS = 5000;

const SUMBER = {
  entries: [],
  extra: [],
  siap: false,
  cursor: 0,
  terhubung: false,
  jalurAktif: ''
};

let api = null;
let regions = null;
let janjiMuat = null;
let waktuGagal = 0;
const sidikTerlihat = new Set();

function bacaRecent() {
  try {
    return JSON.parse(localStorage.getItem(KEY_RECENT) || '[]');
  } catch (e) {
    return [];
  }
}

function sidik(e) {
  return String(e.text || e.title || '').slice(0, 60);
}

function baruRecent(e) {
  return bacaRecent().indexOf(sidik(e)) === -1;
}

function tandaiRecent(e) {
  const recent = bacaRecent();
  recent.push(sidik(e));
  while (recent.length > 10) recent.shift();
  try {
    localStorage.setItem(KEY_RECENT, JSON.stringify(recent));
  } catch (e) {}
}

function hubungkan(apiBaru, regionsBaru, label) {
  if (!apiBaru) return;
  api = apiBaru;
  regions = regionsBaru || null;
  SUMBER.terhubung = true;
  SUMBER.jalurAktif = label || SUMBER.jalurAktif || 'injeksi';
  SUMBER.siap = false;
  janjiMuat = null;
  waktuGagal = 0;
}

async function ambilApi() {
  if (api) return api;
  if (window.dataries) {
    hubungkan(window.dataries, window.REGIONS || null, 'global');
    return api;
  }
  const jalur = [
    '../../../raget/raget-dataries/index.js',
    '/raget/raget-dataries/index.js'
  ];
  for (let i = 0; i < jalur.length; i++) {
    try {
      const mod = await import(jalur[i]);
      const d = mod && (mod.dataries || mod.default || mod.api);
      if (d) {
        hubungkan(d, mod.REGIONS || (d.REGIONS || null), jalur[i]);
        break;
      }
    } catch (e) {}
  }
  return api;
}

const UJI = [
  ['country', 'asian-tenggara'],
  ['country', 'asian-barat'],
  ['country', 'eropan-barat'],
  ['country', 'american-utara'],
  ['tokoh', 'sains'],
  ['tokoh', 'teknologi'],
  ['tokoh', 'sejarah'],
  ['tokoh', 'pemimpin'],
  ['makanan', 'asia'],
  ['makanan', 'eropa'],
  ['minuman', 'asia'],
  ['lingo', 'asean-tenggara'],
  ['sapaan', 'greetings'],
  ['sejarah', 'indonesia'],
  ['sejarah', 'dunia'],
  ['sains', 'umum'],
  ['sains', 'biologi'],
  ['penemuan', 'teknologi'],
  ['alam', 'asia'],
  ['wisata', 'asia'],
  ['wisata', 'eropa'],
  ['etika', 'asia']
];

function terima(list, grup, data) {
  (data || []).forEach(function (e) {
    if (!e || typeof e !== 'object' || !(e.text || e.title)) return;
    const s = sidik(e);
    if (sidikTerlihat.has(s)) return;
    sidikTerlihat.add(s);
    e._grup = grup;
    e._metaStr = JSON.stringify(e.metadata || {}).toLowerCase();
    list.push(e);
  });
}

function muatInternal() {
  janjiMuat = (async function () {
    const d = await ambilApi();
    if (d) {
      const hasil = await Promise.all(UJI.map(function (pair) {
        return d.loadRegion(pair[0], pair[1])
          .then(function (data) { return { grup: pair[0], data: data || [] }; })
          .catch(function () { return { grup: pair[0], data: [] }; });
      }));
      hasil.forEach(function (h) { terima(SUMBER.entries, h.grup, h.data); });
      SUMBER.siap = true;
    } else {
      waktuGagal = Date.now();
    }
    return SUMBER;
  })().finally(function () { janjiMuat = null; });
  return janjiMuat;
}

async function muat() {
  if (SUMBER.siap) return SUMBER;
  if (janjiMuat) return janjiMuat;
  if (Date.now() - waktuGagal < DINGIN_MS) return SUMBER;
  return muatInternal();
}

function segarkan() {
  SUMBER.entries = [];
  SUMBER.extra = [];
  SUMBER.siap = false;
  SUMBER.cursor = 0;
  sidikTerlihat.clear();
  janjiMuat = null;
  waktuGagal = 0;
  return muat();
}

function poolAll() {
  return SUMBER.entries.concat(SUMBER.extra);
}

function skor(e, t) {
  const m = e.metadata || {};
  const nama = String(m.name || e.title || '').toLowerCase();
  const teks = String(e.text || '').toLowerCase();
  if (nama && nama === t) return 4;
  if (nama && t.length >= 3 && nama.indexOf(t) === 0) return 3;
  if (teks.indexOf(t) === 0) return 2;
  if (teks.indexOf(t) !== -1) return 1;
  if ((e._metaStr || '').indexOf(t) !== -1) return 0;
  return -1;
}

function cari(topik, grupArr, n) {
  const t = (topik || '').toLowerCase();
  let pool = poolAll();
  if (grupArr && grupArr.length) {
    const byGrup = pool.filter(function (e) { return grupArr.indexOf(e._grup) !== -1; });
    if (byGrup.length) pool = byGrup;
  }
  if (t) {
    const scored = [];
    pool.forEach(function (e, i) {
      const s = skor(e, t);
      if (s >= 0) scored.push({ s: s, i: i, e: e });
    });
    scored.sort(function (a, b) {
      const ra = baruRecent(a.e) ? 0 : 1;
      const rb = baruRecent(b.e) ? 0 : 1;
      return b.s - a.s || ra - rb || a.i - b.i;
    });
    if (scored.length) return scored.slice(0, n || 1).map(function (x) { return x.e; });
  }
  const out = [];
  const len = pool.length;
  if (!len) return out;
  let start = SUMBER.cursor;
  for (let i = 0; i < (n || 1); i++) {
    let idxSel = -1;
    for (let step = 0; step < len; step++) {
      const cand = (start + step) % len;
      if (baruRecent(pool[cand])) {
        idxSel = cand;
        start = cand + 1;
        break;
      }
    }
    if (idxSel === -1) {
      idxSel = start % len;
      start = idxSel + 1;
    }
    out.push(pool[idxSel]);
  }
  SUMBER.cursor = start;
  return out;
}

function cariRegionManual(t) {
  const out = [];
  if (!regions) return out;
  const nt = t.replace(/\s+/g, '');
  Object.keys(regions).forEach(function (g) {
    (regions[g] || []).forEach(function (r) {
      (r.names || []).forEach(function (nm) {
        const cn = String(nm).replace(/\s+/g, '');
        if (cn === nt || (nt.length >= 3 && cn.length >= 3 && (nt.indexOf(cn) !== -1 || cn.indexOf(nt) !== -1))) {
          out.push({ grup: g, id: r.id });
        }
      });
    });
  });
  return out;
}

async function muatRegionUntukTopik(topik, grupPrioritas) {
  const d = await ambilApi();
  if (!d) return;
  const t = String(topik || '').toLowerCase().trim();
  if (!t) return;
  const target = [];
  const grupCari = (grupPrioritas && grupPrioritas.length) ? grupPrioritas : ['country', 'cities', 'languages', 'lingo'];
  grupCari.forEach(function (g) {
    try {
      (d.findRegionsByName(g, t) || []).forEach(function (r) { target.push({ grup: g, id: r.id }); });
    } catch (e) {}
  });
  if (!target.length) {
    cariRegionManual(t).forEach(function (x) { target.push(x); });
  }
  const seen = {};
  for (let i = 0; i < target.length; i++) {
    const key = target[i].grup + '/' + target[i].id;
    if (seen[key]) continue;
    seen[key] = true;
    try {
      const data = await d.loadRegion(target[i].grup, target[i].id);
      if (data && data.length) terima(SUMBER.extra, target[i].grup, data);
    } catch (e) {}
  }
}

async function ambilCerdas(topik, grupArr, n) {
  let hasil = cari(topik, grupArr, n);
  if (!hasil.length && (topik || '').trim()) {
    await muatRegionUntukTopik(topik, grupArr);
    hasil = cari(topik, grupArr, n);
  }
  if (!hasil.length) hasil = cari(null, grupArr, n);
  hasil.forEach(tandaiRecent);
  return hasil;
}

function perGrup() {
  const hasil = {};
  poolAll().forEach(function (e) {
    const g = e._grup || '?';
    hasil[g] = (hasil[g] || 0) + 1;
  });
  return hasil;
}

function diagnosa() {
  return {
    terhubung: SUMBER.terhubung,
    jalur: SUMBER.jalurAktif,
    siap: SUMBER.siap,
    entri: poolAll().length
  };
}

function rincian() {
  return {
    terhubung: SUMBER.terhubung,
    jalur: SUMBER.jalurAktif,
    siap: SUMBER.siap,
    entri: poolAll().length,
    perGrup: perGrup()
  };
}

export const pituturSumber = {
  muat: muat,
  segarkan: segarkan,
  hubungkan: hubungkan,
  diagnosa: diagnosa,
  rincian: rincian,
  jumlah: function () { return poolAll().length; },
  terhubung: function () { return SUMBER.terhubung; },
  jalur: function () { return SUMBER.jalurAktif; },
  query: function (grupArr, topik, n) { return ambilCerdas(topik, grupArr, n); },
  fakta: function (topik) { return ambilCerdas(topik, null, 1); },
  tokoh: function (topik) { return ambilCerdas(topik, ['tokoh'], 1); },
  kuliner: function (topik) { return ambilCerdas(topik, ['makanan', 'minuman'], 1); },
  sains: function (topik) { return ambilCerdas(topik, ['sains', 'penemuan'], 1); },
  sejarah: function (topik) { return ambilCerdas(topik, ['sejarah'], 1); },
  catatan: function (topik) { return ambilCerdas(topik, null, 2); }
};
