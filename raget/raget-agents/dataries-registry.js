export const REGIONS = Object.freeze({
  country: [
    { id: 'african-barat', file: './country/african-barat.js', names: ['nigeria', 'ghana', 'pantai gading', 'senegal', 'mali'] },
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
    { id: 'eropan-tengah', file: './country/eropan-tengah.js', names: ['polandia', 'ceko', 'hungaria', 'slowakia'] },
    { id: 'eropan-timur', file: './country/eropan-timur.js', names: ['rusia', 'ukraina', 'rumania', 'belarus', 'bulgaria', 'moldova'] },
    { id: 'eropan-utara', file: './country/eropan-utara.js', names: ['norwegia', 'swedia', 'finlandia', 'denmark', 'islandia', 'estonia', 'latvia', 'lithuania'] },
    { id: 'osenian', file: './country/osenian.js', names: ['australia', 'selandia baru', 'fiji', 'papua new guinea', 'kepulauan solomon', 'vanuatu', 'samoa', 'tonga', 'kepulauan marshall'] },
  ],
  cities: [
    { id: 'asia-tenggara', file: './cities/asia-tenggara.js', names: ['indonesia', 'malaysia', 'singapura', 'thailand', 'vietnam', 'filipina', 'myanmar', 'kamboja', 'laos', 'brunei'] },
    { id: 'asian-timur', file: './cities/asian-timur.js', names: ['china', 'jepang', 'korea selatan', 'taiwan', 'mongolia', 'hong kong'] },
    { id: 'asian-selatan', file: './cities/asian-selatan.js', names: ['india', 'pakistan', 'bangladesh', 'sri lanka', 'nepal'] },
    { id: 'asian-barat', file: './cities/asian-barat.js', names: ['arab saudi', 'uni emirat arab', 'turki', 'iran', 'irak', 'israel', 'qatar'] },
    { id: 'asian-tengah', file: './cities/asian-tengah.js', names: ['kazakhstan', 'uzbekistan', 'kirgistan', 'tajikistan'] },
    { id: 'eropan-barat', file: './cities/eropan-barat.js', names: ['prancis', 'jerman', 'inggris', 'belanda', 'belgia', 'swiss', 'austria', 'irlandia'] },
    { id: 'eropan-selatan', file: './cities/eropan-selatan.js', names: ['italia', 'spanyol', 'portugal', 'yunani', 'kroasia'] },
    { id: 'eropan-tengah', file: './cities/eropan-tengah.js', names: ['polandia', 'ceko', 'hungaria', 'slowakia'] },
    { id: 'eropan-timur', file: './cities/eropan-timur.js', names: ['rusia', 'ukraina', 'rumania', 'belarus', 'bulgaria'] },
    { id: 'eropan-utara', file: './cities/eropan-utara.js', names: ['norwegia', 'swedia', 'finlandia', 'denmark', 'islandia', 'estonia', 'latvia', 'lithuania'] },
    { id: 'american-utara', file: './cities/american-utara.js', names: ['amerika serikat', 'kanada', 'meksiko'] },
    { id: 'american-tengah', file: './cities/american-tengah.js', names: ['guatemala', 'honduras', 'kosta rika', 'panama', 'el salvador', 'kuba'] },
    { id: 'american-karibia', file: './cities/american-karibia.js', names: ['jamaika', 'haiti', 'republik dominika', 'bahama', 'puerto rico'] },
    { id: 'american-selatan', file: './cities/american-selatan.js', names: ['brasil', 'argentina', 'kolombia', 'chili', 'peru', 'venezuela'] },
    { id: 'african-utara', file: './cities/african-utara.js', names: ['mesir', 'maroko', 'aljazair', 'tunisia', 'libya'] },
    { id: 'african-barat', file: './cities/african-barat.js', names: ['nigeria', 'ghana', 'pantai gading', 'senegal', 'mali'] },
    { id: 'african-timur', file: './cities/african-timur.js', names: ['etiopia', 'kenya', 'tanzania', 'uganda', 'somalia', 'rwanda'] },
    { id: 'african-selatan', file: './cities/african-selatan.js', names: ['afrika selatan', 'namibia', 'botswana', 'zimbabwe'] },
    { id: 'african-tengah', file: './cities/african-tengah.js', names: ['kongo', 'angola', 'gabon', 'chad'] },
    { id: 'osenian', file: './cities/osenian.js', names: ['australia', 'selandia baru', 'fiji', 'papua new guinea'] },
  ],
  languages: [
    { id: 'asian-timur', file: './languages/asian-timur.js', names: ['china', 'jepang', 'korea', 'mongolia', 'taiwan', 'hong kong', 'tibet'] },
    { id: 'asian-tenggara', file: './languages/asian-tenggara.js', names: ['indonesia', 'thailand', 'vietnam', 'filipina', 'malaysia', 'myanmar', 'kamboja', 'laos'] },
    { id: 'asian-selatan', file: './languages/asian-selatan.js', names: ['india', 'pakistan', 'bangladesh', 'sri lanka', 'nepal', 'bhutan', 'maladewa', 'afghanistan'] },
    { id: 'asian-barat', file: './languages/asian-barat.js', names: ['arab saudi', 'iran', 'turki', 'israel', 'yordania', 'kuwait'] },
    { id: 'asian-tengah', file: './languages/asian-tengah.js', names: ['kazakhstan', 'uzbekistan', 'turkmenistan', 'kirgistan', 'tajikistan'] },
    { id: 'eropan-barat', file: './languages/eropan-barat.js', names: ['jerman', 'prancis', 'inggris', 'belanda', 'swiss', 'irlandia'] },
    { id: 'eropan-selatan', file: './languages/eropan-selatan.js', names: ['italia', 'spanyol', 'portugal', 'yunani', 'kroasia', 'malta'] },
    { id: 'eropan-tengah', file: './languages/eropan-tengah.js', names: ['polandia', 'ceko', 'hungaria', 'slowakia'] },
    { id: 'eropan-timur', file: './languages/eropan-timur.js', names: ['rusia', 'ukraina', 'rumania', 'belarus', 'bulgaria'] },
    { id: 'eropan-utara', file: './languages/eropan-utara.js', names: ['norwegia', 'swedia', 'finlandia', 'denmark', 'islandia', 'estonia', 'latvia', 'lithuania'] },
    { id: 'american-utara', file: './languages/american-utara.js', names: ['amerika serikat', 'kanada', 'meksiko'] },
    { id: 'american-tengah', file: './languages/american-tengah.js', names: ['guatemala', 'honduras', 'nikaragua', 'kosta rika', 'panama', 'belize', 'el salvador', 'kuba'] },
    { id: 'american-karibia', file: './languages/american-karibia.js', names: ['jamaika', 'haiti', 'republik dominika', 'bahama', 'barbados', 'trinidad dan tobago', 'puerto rico'] },
    { id: 'american-selatan', file: './languages/american-selatan.js', names: ['brasil', 'argentina', 'kolombia', 'chili', 'peru', 'venezuela', 'bolivia', 'paraguay', 'uruguay', 'guyana', 'suriname'] },
    { id: 'african-utara', file: './languages/african-utara.js', names: ['mesir', 'maroko', 'aljazair', 'tunisia', 'libya', 'sudan'] },
    { id: 'african-barat', file: './languages/african-barat.js', names: ['nigeria', 'ghana', 'pantai gading', 'senegal', 'mali', 'kamerun'] },
    { id: 'african-timur', file: './languages/african-timur.js', names: ['etiopia', 'kenya', 'tanzania', 'uganda', 'somalia', 'rwanda', 'madagaskar'] },
    { id: 'african-selatan', file: './languages/african-selatan.js', names: ['afrika selatan', 'namibia', 'botswana', 'zimbabwe', 'mozambik'] },
    { id: 'african-tengah', file: './languages/african-tengah.js', names: ['kongo', 'angola', 'gabon', 'chad', 'republik afrika tengah'] },
    { id: 'osenian', file: './languages/osenian.js', names: ['australia', 'selandia baru', 'fiji', 'papua nugini', 'samoa', 'tonga'] },
  ],
  wisata: [
    { id: 'asia', file: './wisata/asia.js', names: [] },
    { id: 'eropa', file: './wisata/eropa.js', names: [] },
    { id: 'amerika', file: './wisata/amerika.js', names: [] },
    { id: 'afrika', file: './wisata/afrika.js', names: [] },
    { id: 'osenia', file: './wisata/osenia.js', names: [] },
    { id: 'timur-tengah', file: './wisata/timur-tengah.js', names: [] },
  ],
  tokoh: [
    { id: 'sains', file: './tokoh/sains.js', names: [] },
    { id: 'teknologi', file: './tokoh/teknologi.js', names: [] },
    { id: 'sejarah', file: './tokoh/sejarah.js', names: [] },
    { id: 'seni', file: './tokoh/seni.js', names: [] },
    { id: 'penjelajah', file: './tokoh/penjelajah.js', names: [] },
    { id: 'pemimpin', file: './tokoh/pemimpin.js', names: [] },
    { id: 'perempuan-berpengaruh', file: './tokoh/perempuan-berpengaruh.js', names: [] },
  ],
  makanan: [
    { id: 'asia', file: './makanan/asia.js', names: [] },
    { id: 'eropa', file: './makanan/eropa.js', names: [] },
    { id: 'amerika', file: './makanan/amerika.js', names: [] },
    { id: 'afrika', file: './makanan/afrika.js', names: [] },
    { id: 'osenia', file: './makanan/osenia.js', names: [] },
  ],
  sains: [
    { id: 'fisika-kimia', file: './sains/fisika-kimia.js', names: [] },
    { id: 'biologi', file: './sains/biologi.js', names: [] },
    { id: 'umum', file: './sains/umum.js', names: [] },
  ],
  olahraga: [
    { id: 'sepakbola', file: './olahraga/sepakbola.js', names: [] },
    { id: 'olimpiade', file: './olahraga/olimpiade.js', names: [] },
    { id: 'lain', file: './olahraga/lain.js', names: [] },
  ],
  platform: [
    { id: 'ecommerce', file: './platform/ecommerce.js', names: [] },
    { id: 'freelance', file: './platform/freelance.js', names: [] },
    { id: 'karir', file: './platform/karir.js', names: [] },
    { id: 'otomotif', file: './platform/otomotif.js', names: [] },
    { id: 'properti', file: './platform/properti.js', names: [] },
  ],
  peluang: [
    { id: 'investasi', file: './peluang/investasi.js', names: [] },
    { id: 'kompetensi', file: './peluang/kompetensi.js', names: [] },
    { id: 'peluang-daerah', file: './peluang/peluang-daerah.js', names: [] },
    { id: 'sektor', file: './peluang/sektor.js', names: [] },
    { id: 'tren', file: './peluang/tren.js', names: [] },
  ],
  sejarah: [
    { id: 'kuno', file: './sejarah/kuno.js', names: [] },
    { id: 'pertengahan', file: './sejarah/pertengahan.js', names: [] },
    { id: 'modern', file: './sejarah/modern.js', names: [] },
    { id: 'indonesia', file: './sejarah/indonesia.js', names: [] },
    { id: 'dunia', file: './sejarah/dunia.js', names: [] },
  ],
  alam: [
    { id: 'asia', file: './alam/asia.js', names: [] },
    { id: 'eropa', file: './alam/eropa.js', names: [] },
    { id: 'amerika', file: './alam/amerika.js', names: [] },
    { id: 'afrika', file: './alam/afrika.js', names: [] },
    { id: 'osenia', file: './alam/osenia.js', names: [] },
  ],
  penemuan: [
    { id: 'sains', file: './penemuan/sains.js', names: [] },
    { id: 'teknologi', file: './penemuan/teknologi.js', names: [] },
    { id: 'kedokteran', file: './penemuan/kedokteran.js', names: [] },
  ],
  'seni-budaya': [
    { id: 'asia', file: './seni-budaya/asia.js', names: [] },
    { id: 'eropa', file: './seni-budaya/eropa.js', names: [] },
    { id: 'amerika', file: './seni-budaya/amerika.js', names: [] },
    { id: 'afrika', file: './seni-budaya/afrika.js', names: [] },
    { id: 'osenia', file: './seni-budaya/osenia.js', names: [] },
  ],
  ekonomi: [
    { id: 'komoditas', file: './ekonomi/komoditas.js', names: [] },
    { id: 'perusahaan', file: './ekonomi/perusahaan.js', names: [] },
    { id: 'indikator', file: './ekonomi/indikator.js', names: [] },
  ],
  etika: [
    { id: 'asia', file: './etika/asia.js', names: [] },
    { id: 'eropa', file: './etika/eropa.js', names: [] },
    { id: 'amerika', file: './etika/amerika.js', names: [] },
    { id: 'afrika', file: './etika/afrika.js', names: [] },
    { id: 'osenia', file: './etika/osenia.js', names: [] },
    { id: 'timur-tengah', file: './etika/timur-tengah.js', names: [] },
  ],
  minuman: [
    { id: 'asia', file: './minuman/asia.js', names: [] },
    { id: 'eropa', file: './minuman/eropa.js', names: [] },
    { id: 'amerika', file: './minuman/amerika.js', names: [] },
    { id: 'afrika', file: './minuman/afrika.js', names: [] },
    { id: 'osenia', file: './minuman/osenia.js', names: [] },
    { id: 'timur-tengah', file: './minuman/timur-tengah.js', names: [] },
  ],
  biologi: [
    { id: 'sel-genetika-dan-metabolisme', file: './mata-pelajaran/biologi/sel-genetika-dan-metabolisme.js', names: ['biologi'] },
    { id: 'fisiologi-ekosistem-dan-bioteknologi', file: './mata-pelajaran/biologi/fisiologi-ekosistem-dan-bioteknologi.js', names: ['biologi'] },
  ],
  matematika: [
    { id: 'aljabar-dan-fungsi', file: './mata-pelajaran/matematika/aljabar-dan-fungsi.js', names: ['matematika'] },
    { id: 'geometri-dan-statistika', file: './mata-pelajaran/matematika/geometri-dan-statistika.js', names: ['matematika'] },
  ],
  fisika: [
    { id: 'mekanika-dan-energi', file: './mata-pelajaran/fisika/mekanika-dan-energi.js', names: ['fisika'] },
    { id: 'gelombang-listrik-dan-materi', file: './mata-pelajaran/fisika/gelombang-listrik-dan-materi.js', names: ['fisika'] },
  ],
  kimia: [
    { id: 'struktur-atom-dan-ikatan', file: './mata-pelajaran/kimia/struktur-atom-dan-ikatan.js', names: ['kimia'] },
    { id: 'reaksi-larutan-dan-kimia-organik', file: './mata-pelajaran/kimia/reaksi-larutan-dan-kimia-organik.js', names: ['kimia'] },
  ],
  'bahasa-indonesia': [
    { id: 'jenis-teks-dan-struktur', file: './mata-pelajaran/bahasa-indonesia/jenis-teks-dan-struktur.js', names: ['bahasa indonesia'] },
    { id: 'kebahasaan-dan-sastra', file: './mata-pelajaran/bahasa-indonesia/kebahasaan-dan-sastra.js', names: ['bahasa indonesia'] },
  ],
  'bahasa-inggris': [
    { id: 'tenses-dan-part-of-speech', file: './mata-pelajaran/bahasa-inggris/tenses-dan-part-of-speech.js', names: ['bahasa inggris'] },
    { id: 'text-types-dan-grammar-lanjutan', file: './mata-pelajaran/bahasa-inggris/text-types-dan-grammar-lanjutan.js', names: ['bahasa inggris'] },
  ],
  geografi: [
    { id: 'geografi-fisik', file: './mata-pelajaran/geografi/geografi-fisik.js', names: ['geografi'] },
    { id: 'geografi-sosial-dan-kependudukan', file: './mata-pelajaran/geografi/geografi-sosial-dan-kependudukan.js', names: ['geografi'] },
  ],
  'sejarah-sekolah': [
    { id: 'sejarah-indonesia-kuno-dan-kolonial', file: './mata-pelajaran/sejarah/sejarah-indonesia-kuno-dan-kolonial.js', names: ['sejarah sekolah'] },
    { id: 'sejarah-indonesia-modern-dan-dunia', file: './mata-pelajaran/sejarah/sejarah-indonesia-modern-dan-dunia.js', names: ['sejarah sekolah'] },
  ],
  'ekonomi-sekolah': [
    { id: 'konsep-dasar-dan-mikroekonomi', file: './mata-pelajaran/ekonomi/konsep-dasar-dan-mikroekonomi.js', names: ['ekonomi sekolah'] },
    { id: 'makroekonomi-dan-perdagangan', file: './mata-pelajaran/ekonomi/makroekonomi-dan-perdagangan.js', names: ['ekonomi sekolah'] },
  ],
  ppkn: [
    { id: 'pancasila-dan-uud', file: './mata-pelajaran/ppkn/pancasila-dan-uud.js', names: ['ppkn', 'pendidikan kewarganegaraan'] },
    { id: 'kenegaraan-dan-kewarganegaraan', file: './mata-pelajaran/ppkn/kenegaraan-dan-kewarganegaraan.js', names: ['ppkn', 'pendidikan kewarganegaraan'] },
  ],
});

const cache = new Map();

const JSON_MIGRATED_GROUPS = { country: 'negara', cities: 'kota', languages: 'bahasa', etika: 'etika', minuman: 'minuman', wisata: 'wisata', sejarah: 'sejarah', makanan: 'makanan', alam: 'alam', sains: 'sains', olahraga: 'olahraga', platform: 'platform', ekonomi: 'ekonomi', peluang: 'peluang', penemuan: 'penemuan', 'seni-budaya': 'seni-budaya', tokoh: 'tokoh', biologi: 'mata-pelajaran/biologi', matematika: 'mata-pelajaran/matematika', fisika: 'mata-pelajaran/fisika', kimia: 'mata-pelajaran/kimia', 'bahasa-indonesia': 'mata-pelajaran/bahasa-indonesia', 'bahasa-inggris': 'mata-pelajaran/bahasa-inggris', geografi: 'mata-pelajaran/geografi', 'sejarah-sekolah': 'mata-pelajaran/sejarah', 'ekonomi-sekolah': 'mata-pelajaran/ekonomi', ppkn: 'mata-pelajaran/ppkn' };

function unifiedToLegacyShape(entry, group) {
  return {
    id: entry.id,
    text: entry.teks,
    metadata: { ...entry.meta, category: group, region: entry.wilayah, name: entry.nama, tags: entry.tags || [] },
  };
}

async function loadRegionFromJson(group, id, dataFolder) {
  const res = await fetch(new URL('../raget-data/json/' + dataFolder + '/' + id + '.json', import.meta.url));
  if (!res.ok) throw new Error('Gagal fetch raget-data/json/' + dataFolder + '/' + id + '.json: HTTP ' + res.status);
  const raw = await res.json();
  return raw.map((entry) => unifiedToLegacyShape(entry, group));
}

async function loadRegion(group, id) {
  const key = group + '/' + id;
  if (cache.has(key)) return cache.get(key);
  const list = REGIONS[group] || [];
  const entry = list.find((r) => r.id === id);
  if (!entry) return null;
  const dataFolder = JSON_MIGRATED_GROUPS[group];
  const data = dataFolder ? await loadRegionFromJson(group, id, dataFolder) : (await import(new URL('../raget-dataries/' + entry.file.replace('./', ''), import.meta.url).href)).DATA;
  cache.set(key, data);
  return data;
}

function findRegionsByName(group, name) {
  const n = String(name || '').toLowerCase().trim();
  if (!n) return [];
  return (REGIONS[group] || []).filter((r) =>
    r.names.some((candidate) => candidate === n || (n.length >= 3 && candidate.length >= 3 && (n.includes(candidate) || candidate.includes(n))))
  );
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
