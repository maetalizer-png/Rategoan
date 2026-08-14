export const REGIONS = Object.freeze({
  country: [
    { id: 'african-barat', file: './country/african-barat.js', names: ['nigeria', 'ghana', 'pantai gading', 'senegal', 'mali', 'kamerun'] },
    { id: 'african-selatan', file: './country/african-selatan.js', names: ['afrika selatan', 'namibia', 'botswana', 'zambia', 'zimbabwe', 'eswatini', 'lesotho', 'mozambik'] },
    { id: 'african-tengah', file: './country/african-tengah.js', names: ['kongo', 'angola', 'gabon', 'chad', 'republik afrika tengah', 'guinea khatulistiwa', 'sao tome dan principe'] },
    { id: 'african-timur', file: './country/african-timur.js', names: ['etiopia', 'kenya', 'tanzania', 'uganda', 'somalia', 'rwanda', 'madagaskar', 'eritrea', 'djibouti', 'sudan selatan', 'burundi', 'malawi'] },
    { id: 'african-utara', file: './country/african-utara.js', names: ['mesir', 'maroko', 'aljazair', 'tunisia', 'libya', 'sudan', 'mauritania'] },
    { id: 'american-karibia', file: './country/american-karibia.js', names: ['jamaika', 'haiti', 'republik dominika', 'bahama', 'barbados', 'trinidad dan tobago', 'puerto rico'] },
    { id: 'american-selatan', file: './country/american-selatan.js', names: ['brasil', 'argentina', 'kolombia', 'chili', 'peru', 'venezuela', 'ekuador', 'bolivia', 'paraguay', 'uruguay', 'guyana', 'suriname'] },
    { id: 'american-tengah', file: './country/american-tengah.js', names: ['guatemala', 'honduras', 'nikaragua', 'kosta rika', 'panama', 'belize', 'el salvador', 'kuba'] },
    { id: 'american-utara', file: './country/american-utara.js', names: ['amerika serikat', 'kanada', 'meksiko'] },
    { id: 'asian-barat', file: './country/asian-barat.js', names: ['arab saudi', 'iran', 'irak', 'turki', 'suriah', 'yaman', 'oman', 'uni emirat arab', 'qatar', 'kuwait', 'bahrain', 'yordania', 'lebanon', 'israel', 'siprus', 'palestina'] },
    { id: 'asian-selatan', file: './country/asian-selatan.js', names: ['india', 'pakistan', 'bangladesh', 'sri lanka', 'nepal', 'bhutan', 'maladewa', 'afghanistan'] },
    { id: 'asian-tengah', file: './country/asian-tengah.js', names: ['kazakhstan', 'uzbekistan', 'turkmenistan', 'kirgistan', 'tajikistan'] },
    { id: 'asian-tenggara', file: './country/asian-tenggara.js', names: ['indonesia', 'malaysia', 'singapura', 'thailand', 'vietnam', 'filipina', 'myanmar', 'kamboja', 'laos', 'brunei', 'timor leste'] },
    { id: 'asian-timur', file: './country/asian-timur.js', names: ['china', 'jepang', 'korea selatan', 'taiwan', 'mongolia', 'hong kong', 'makau', 'tibet'] },
    { id: 'eropan-barat', file: './country/eropan-barat.js', names: ['jerman', 'prancis', 'inggris', 'belanda', 'belgia', 'swiss', 'austria', 'irlandia'] },
    { id: 'eropan-selatan', file: './country/eropan-selatan.js', names: ['italia', 'spanyol', 'portugal', 'yunani', 'kroasia', 'slovenia', 'malta', 'san marino'] },
    { id: 'eropan-tengah', file: './country/eropan-tengah.js', names: ['polandia', 'ceko', 'hungaria', 'slowakia', 'austria', 'swiss'] },
    { id: 'eropan-timur', file: './country/eropan-timur.js', names: ['rusia', 'ukraina', 'polandia', 'rumania', 'ceko', 'hungaria', 'belarus', 'bulgaria', 'slowakia', 'moldova'] },
    { id: 'eropan-utara', file: './country/eropan-utara.js', names: ['norwegia', 'swedia', 'finlandia', 'denmark', 'islandia', 'estonia', 'latvia', 'lithuania'] },
    { id: 'osenian', file: './country/osenian.js', names: ['australia', 'selandia baru', 'fiji', 'papua new guinea', 'kepulauan solomon', 'vanuatu', 'samoa', 'tonga', 'kepulauan marshall'] },
  ],
  cities: [
    { id: 'asia-tenggara', file: './cities/asia-tenggara.js', names: ['indonesia', 'malaysia', 'singapura', 'thailand', 'vietnam', 'filipina', 'myanmar', 'kamboja', 'laos', 'brunei'] },
  ],
  sapaan: [
    { id: 'greetings', file: './sapaan/greetings.js', names: [] },
    { id: 'interaktif', file: './sapaan/interaktif.js', names: [] },
  ],
});

const cache = new Map();

async function loadRegion(group, id) {
  const key = group + '/' + id;
  if (cache.has(key)) return cache.get(key);
  const list = REGIONS[group] || [];
  const entry = list.find((r) => r.id === id);
  if (!entry) return null;
  const mod = await import(new URL(entry.file, import.meta.url).href);
  cache.set(key, mod.DATA);
  return mod.DATA;
}

function findRegionsByName(group, name) {
  const n = String(name || '').toLowerCase().trim();
  if (!n) return [];
  return (REGIONS[group] || []).filter((r) => r.names.some((candidate) => candidate === n || n.includes(candidate) || candidate.includes(n)));
}

async function loadAll(group) {
  const list = REGIONS[group] || [];
  const chunks = await Promise.all(list.map((r) => loadRegion(group, r.id)));
  return chunks.filter(Boolean).flat();
}

export const dataries = Object.freeze({
  loadRegion,
  findRegionsByName,
  loadAll,
});
