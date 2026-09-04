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

const JSON_FOLDER = {
  country: 'negara',
  cities: 'kota',
  languages: 'bahasa',
  etika: 'etika',
  minuman: 'minuman',
  wisata: 'wisata',
  sejarah: 'sejarah',
  makanan: 'makanan',
  alam: 'alam',
  sains: 'sains',
  olahraga: 'olahraga',
  marplace: 'marplace',
  lingo: 'lingo',
  ekonomi: 'ekonomi',
  paluang: 'paluang',
  penemuan: 'penemuan',
  'seni-budaya': 'seni-budaya',
  tokoh: 'tokoh',
  sapaan: 'sapaan'
};

function unifiedToLegacy(entry, group) {
  const meta = entry && entry.meta ? Object.assign({}, entry.meta) : {};
  meta.category = group;
  meta.region = entry.wilayah;
  meta.name = entry.nama;
  meta.tags = entry.tags || [];
  return { text: entry.teks || entry.text || '', metadata: meta };
}

async function loadRegionJson(group, id) {
  const folder = JSON_FOLDER[group];
  if (!folder) return [];
  const urls = [
    '/raget/raget-data/json/' + folder + '/' + id + '.json',
    '../../../raget/raget-data/json/' + folder + '/' + id + '.json'
  ];
  for (let i = 0; i < urls.length; i++) {
    try {
      const res = await fetch(urls[i]);
      if (!res.ok) continue;
      const raw = await res.json();
      if (!Array.isArray(raw)) continue;
      return raw.map(function (e) { return unifiedToLegacy(e, group); });
    } catch (e) {}
  }
  return [];
}

function buatApiFallback() {
  return {
    loadRegion: function (group, id) { return loadRegionJson(group, id); },
    loadAll: async function (group) { return []; },
    findRegionsByName: function () { return []; }
  };
}

async function ambilApi() {
  if (api) return api;
  if (window.dataries) {
    hubungkan(window.dataries, window.REGIONS || null, 'global');
    return api;
  }
  const jalur = [
    '/raget/raget-agents/dataries-registry.js',
    '../../../raget/raget-agents/dataries-registry.js'
  ];
  for (let i = 0; i < jalur.length; i++) {
    try {
      const mod = await import(jalur[i]);
      const d = mod && (mod.dataries || mod.default || mod.api);
      if (d && typeof d.loadRegion === 'function') {
        hubungkan(d, mod.REGIONS || null, jalur[i]);
        return api;
      }
    } catch {}
  }
  hubungkan(buatApiFallback(), null, 'json-fallback');
  return api;
}

const UJI = [
  ['country', 'asian-tenggara'],
  ['country', 'asian-barat'],
  ['country', 'asian-timur'],
  ['country', 'eropan-barat'],
  ['country', 'american-utara'],
  ['country', 'african-utara'],
  ['cities', 'asia-tenggara'],
  ['cities', 'eropan-barat'],
  ['languages', 'asian-tenggara'],
  ['languages', 'asian-timur'],
  ['tokoh', 'sains'],
  ['tokoh', 'teknologi'],
  ['tokoh', 'sejarah'],
  ['tokoh', 'seni'],
  ['tokoh', 'penjelajah'],
  ['tokoh', 'pemimpin'],
  ['tokoh', 'perempuan-berpengaruh'],
  ['sapaan', 'greetings'],
  ['sapaan', 'interaktif'],
  ['sejarah', 'indonesia'],
  ['sejarah', 'dunia'],
  ['sejarah', 'modern'],
  ['sains', 'umum'],
  ['sains', 'biologi'],
  ['sains', 'fisika-kimia'],
  ['penemuan', 'teknologi'],
  ['penemuan', 'sains'],
  ['penemuan', 'kedokteran'],
  ['makanan', 'asia'],
  ['makanan', 'eropa'],
  ['minuman', 'asia'],
  ['minuman', 'eropa'],
  ['wisata', 'asia'],
  ['wisata', 'eropa'],
  ['wisata', 'amerika'],
  ['alam', 'asia'],
  ['alam', 'afrika'],
  ['etika', 'asia'],
  ['etika', 'eropa'],
  ['lingo', 'asean-tenggara'],
  ['lingo', 'asean-timur'],
  ['ekonomi', 'indikator'],
  ['ekonomi', 'komoditas'],
  ['paluang', 'tren'],
  ['paluang', 'sektor'],
  ['olahraga', 'sepakbola'],
  ['olahraga', 'olimpiade'],
  ['marplace', 'karir'],
  ['marplace', 'ecommerce']
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

function tokenTopik(topik) {
  return String(topik || '')
    .toLowerCase()
    .replace(/[^a-z0-9À-ɏ\s]/g, ' ')
    .split(/\s+/)
    .filter(function (w) { return w.length > 2; });
}

function skor(e, tokens) {
  const m = e.metadata || {};
  const nama = String(m.name || e.title || '').toLowerCase();
  const teks = String(e.text || '').toLowerCase();
  const metaStr = e._metaStr || '';
  let hit = 0;
  let terbaik = -1;
  tokens.forEach(function (tok) {
    if (nama && nama === tok) { terbaik = Math.max(terbaik, 6); hit++; }
    else if (nama && nama.indexOf(tok) !== -1) { terbaik = Math.max(terbaik, 4); hit++; }
    else if (teks.indexOf(tok) !== -1) { terbaik = Math.max(terbaik, 2); hit++; }
    else if (metaStr.indexOf(tok) !== -1) { terbaik = Math.max(terbaik, 1); hit++; }
  });
  if (!hit) return -1;
  return terbaik * 10 + hit;
}

function cari(topik, grupArr, n) {
  const tokens = tokenTopik(topik);
  let pool = poolAll();
  if (grupArr && grupArr.length) {
    const byGrup = pool.filter(function (e) { return grupArr.indexOf(e._grup) !== -1; });
    if (byGrup.length) pool = byGrup;
  }
  if (tokens.length) {
    const scored = [];
    pool.forEach(function (e, i) {
      const s = skor(e, tokens);
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
