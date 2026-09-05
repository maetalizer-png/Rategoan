import { bridgeResolve } from './bridge-resolve.js';
import { bridgeFormat } from './bridge-format.js';
import { bridgeReasoning } from './bridge-reasoning.js';
import { pickVariant } from '../../utils/text.js';
import { mathEngine } from './math-engine.js';

async function tryLetakGeografis(text) {
  const m =
    text.match(/^(.+?)\s+terletak\s+di\s*mana\??$/i) ||
    text.match(/^di\s*mana\s+letak\s+(.+?)\??$/i) ||
    text.match(/^letak\s+geografis\s+(.+?)\??$/i);
  if (!m) return null;
  const entity = bridgeResolve.resolveCountryAlias(bridgeResolve.cleanEntity(m[1]));
  if (!entity) return null;
  const item = await bridgeResolve.lookupInGroup('country', entity);
  if (!item || !item.metadata.region) return null;
  const label = bridgeFormat.REGION_LABELS[item.metadata.region] || item.metadata.region;
  const base = item.metadata.name + ' terletak di ' + label + '.';
  const opener = pickVariant('letak_opener', bridgeFormat.FACTOID_OPENERS, item.metadata.name + label);
  return opener ? opener + base.charAt(0).toLowerCase() + base.slice(1) : base;
}

async function tryPenuturBahasa(text) {
  const m = text.match(/penutur\s+bahasa\s+(.+)/i);
  if (!m) return null;
  const entity = bridgeResolve.cleanEntity(m[1]);
  const item = await bridgeResolve.findLanguageByCountry(entity);
  if (!item) return null;
  let out = item.metadata.name + ' memiliki sekitar ' + item.metadata.speakers + ' penutur.';
  if (item.metadata.family) out += ' Termasuk rumpun bahasa ' + item.metadata.family + (item.metadata.script ? ', ditulis dengan aksara ' + item.metadata.script + '.' : '.');
  return out;
}

async function tryGreetingBahasa(text) {
  const m = text.match(/(halo|hai|terima\s*kasih|sapaan|cara\s+menyapa(?:\s+di)?|ucapkan\s+selamat\s+pagi)\s+(?:dalam\s+)?bahasa\s+(.+)/i);
  if (!m) return null;
  const kind = m[1].toLowerCase();
  const entity = bridgeResolve.cleanEntity(m[2]);
  if (!entity) return null;
  const item = await bridgeResolve.findLanguageByCountry(entity);
  if (!item || !item.metadata.greetings) return null;
  const g = item.metadata.greetings;
  if (/terima\s*kasih/.test(kind)) return 'Terima kasih dalam bahasa ' + item.metadata.name + ' adalah "' + g.terimakasih + '".';
  if (/ucapkan\s+selamat\s+pagi/.test(kind)) return 'Selamat pagi dalam bahasa ' + item.metadata.name + ' adalah "' + g.pagi + '".';
  if (/sapaan|cara\s+menyapa/.test(kind)) {
    return 'Sapaan dalam bahasa ' + item.metadata.name + ': halo "' + g.halo + '", selamat pagi "' + g.pagi + '".';
  }
  return 'Sapaan dalam bahasa ' + item.metadata.name + ' adalah "' + g.halo + '".';
}

async function tryBahasaDi(text) {
  const m = text.match(/^(apa\s+bahasa\s+di|bahasa\s+apa\s+di|bahasa)\s+(.+)$/i);
  if (!m) return null;
  const entity = bridgeResolve.cleanEntity(m[2]);
  if (!entity) return null;
  const item = await bridgeResolve.findLanguageByCountry(entity);
  if (!item) return null;
  let out = 'Bahasa di ' + bridgeResolve.capitalize(entity) + ' adalah ' + item.metadata.name + '.';
  if (item.metadata.speakers) out += ' Dituturkan oleh sekitar ' + item.metadata.speakers + ' orang' + (item.metadata.family ? ', rumpun ' + item.metadata.family + '.' : '.');
  return out;
}

async function tryKotaTerkenal(text) {
  const m = text.match(/^kota\s+(.+?)\s+terkenal\s+apa$/i) || text.match(/^tentang\s+kota\s+(.+)$/i);
  if (!m) return null;
  const entity = bridgeResolve.cleanEntity(m[1]);
  if (!entity) return null;
  const item = await bridgeResolve.findInList('cities', (it) => it.metadata.type === 'city' && it.metadata.name && it.metadata.name.toLowerCase() === entity);
  if (!item) return null;
  return item.text;
}

async function tryWisataDi(text) {
  const m = text.match(/^(?:tempat\s+)?wisata\s+(?:paling\s+)?(?:terkenal\s+|populer\s+|favorit\s+)?di\s+(.+)$/i);
  if (!m) return null;
  const entity = bridgeResolve.cleanEntity(m[1]);
  if (!entity) return null;
  const items = await bridgeResolve.findAllInList('wisata', (it) => it.metadata.country && bridgeResolve.fuzzyEq(it.metadata.country.toLowerCase(), entity), 3);
  if (!items.length) return null;
  return 'Tempat wisata terkenal di ' + bridgeResolve.capitalize(entity) + '.\n' + items.map((it) => '- ' + it.text).join('\n');
}

async function trySiapaTokoh(text) {
  const m = text.match(/^siapa\s+(?:penemu\s+|pelukis\s+|penulis\s+|pencipta\s+)?(.+)$/i);
  if (!m) return null;
  const entity = bridgeResolve.cleanEntity(m[1]);
  if (!entity) return null;
  const tokohItem = await bridgeResolve.findBestInList('tokoh', entity, (it) => [it.metadata.knownFor, it.metadata.name]);
  if (tokohItem) return tokohItem.text;
  const penemuanItem = await bridgeResolve.findBestInList('penemuan', entity, (it) => [it.metadata.name, ...(it.metadata.tags || [])]);
  if (penemuanItem) return penemuanItem.text;
  return null;
}

async function tryTopicSearch(text) {
  const m = text.match(/^(?:apa\s+itu|jelaskan)\s+(.+)$/i);
  if (!m) return null;
  const entity = bridgeResolve.cleanEntity(m[1]);
  if (!entity) return null;
  for (const group of ['sains', 'olahraga']) {
    const item = await bridgeResolve.findBestInList(group, entity, (it) => [it.metadata.topic, ...(it.metadata.tags || [])]);
    if (item) return item.text;
  }
  const sejarahItem = await bridgeResolve.findBestInList('sejarah', entity, (it) => [it.metadata.name, ...(it.metadata.tags || [])]);
  if (sejarahItem) return sejarahItem.text;
  return null;
}

const MAKANAN_OPENERS = [
  'Ini beberapa makanan khas',
  'Kalau soal kuliner',
  'Rekomendasi makanan dari',
];

async function tryMakananKhas(text) {
  const m = text.match(/^(?:apa\s+)?(makanan|kuliner|masakan)\s+(khas|favorit|terkenal|enak|populer)\s+(?:(?:di|dari)\s+)?(.+)$/i);
  if (!m) return null;
  const entity = bridgeResolve.resolveCountryAlias(bridgeResolve.cleanEntity(m[3]));
  if (!entity) return null;
  const items = await bridgeResolve.findAllInList('makanan', (it) => it.metadata.country && bridgeResolve.fuzzyEq(it.metadata.country.toLowerCase(), entity), 3);
  if (!items.length) return null;
  const opener = pickVariant('makanan_opener', MAKANAN_OPENERS, text);
  return opener + ' ' + bridgeResolve.capitalize(entity) + '.\n' + items.map((it) => '- ' + it.text).join('\n');
}

const MINUMAN_OPENERS = [
  'Ini beberapa minuman khas',
  'Kalau soal minuman',
  'Rekomendasi minuman dari',
];

async function tryMinumanKhas(text) {
  const m = text.match(/^(?:apa\s+)?minuman\s+(khas|favorit|terkenal|enak|populer)\s+(?:(?:di|dari)\s+)?(.+)$/i);
  if (!m) return null;
  const entity = bridgeResolve.resolveCountryAlias(bridgeResolve.cleanEntity(m[2]));
  if (!entity) return null;
  const items = await bridgeResolve.findAllInList('minuman', (it) => it.metadata.country && bridgeResolve.fuzzyEq(it.metadata.country.toLowerCase(), entity), 3);
  if (!items.length) return null;
  const opener = pickVariant('minuman_opener', MINUMAN_OPENERS, text);
  return opener + ' ' + bridgeResolve.capitalize(entity) + '.\n' + items.map((it) => '- ' + it.text).join('\n');
}

async function tryEtika(text) {
  const m =
    text.match(/^etika\s+(?:di\s+|budaya\s+)?(.+)$/i) ||
    text.match(/^tabu\s+(?:di\s+|budaya\s+)?(.+)$/i) ||
    text.match(/^tip\s+(?:budaya\s+)?di\s+(.+)$/i) ||
    text.match(/^sopan\s+santun\s+(?:di\s+)?(.+)$/i);
  if (!m) return null;
  const isTabu = /^tabu/i.test(text);
  const isTip = /^tip/i.test(text);
  const entity = bridgeResolve.resolveCountryAlias(bridgeResolve.cleanEntity(m[1]));
  if (!entity) return null;
  const items = await bridgeResolve.findAllInList(
    'etika',
    (it) => {
      if (it.metadata.country && bridgeResolve.fuzzyEq(it.metadata.country.toLowerCase(), entity)) return true;
      const tags = it.metadata.tags;
      return Array.isArray(tags) && tags.some((t) => bridgeResolve.fuzzyEq(String(t).toLowerCase(), entity));
    },
    6
  );
  if (!items.length) return null;
  const filtered = isTabu ? items.filter((it) => it.metadata.type === 'tabu') : isTip ? items.filter((it) => it.metadata.type === 'tip') : items;
  const list = (filtered.length ? filtered : items).slice(0, 3);
  const label = isTabu ? 'Tabu' : isTip ? 'Kebiasaan tip' : 'Etika';
  return label + ' di ' + bridgeResolve.capitalize(entity) + ':\n' + list.map((it) => '- ' + it.text).join('\n');
}

async function trySejarah(text) {
  const m = text.match(/^sejarah\s+(.+)$/i) || text.match(/^kapan\s+(.+?)\s+(?:dibangun|terjadi|dimulai|diikrarkan|didirikan|dibacakan|diselenggarakan)$/i);
  if (!m) return null;
  const entity = bridgeResolve.cleanEntity(m[1]);
  if (!entity) return null;
  const item = await bridgeResolve.findBestInList('sejarah', entity, (it) => [it.metadata.name, ...(it.metadata.tags || [])]);
  if (!item) return null;
  return item.text;
}

async function tryAlam(text) {
  const m = text.match(/^(?:hewan|fauna)\s+khas\s+(.+)$/i) || text.match(/^flora\s+(.+)$/i);
  if (!m) return null;
  const entity = bridgeResolve.resolveCountryAlias(bridgeResolve.cleanEntity(m[1]));
  if (!entity) return null;
  const items = await bridgeResolve.findAllInList('alam', (it) => bridgeResolve.wordOverlap(entity, (it.metadata.habitat || '').toLowerCase()), 3);
  if (!items.length) return null;
  return 'Fauna/flora khas ' + bridgeResolve.capitalize(entity) + '.\n' + items.map((it) => '- ' + it.text).join('\n');
}

async function tryPenemuan(text) {
  const m = text.match(/^penemuan\s+(.+)$/i);
  if (!m) return null;
  const entity = bridgeResolve.cleanEntity(m[1]);
  if (!entity) return null;
  const item = await bridgeResolve.findBestInList('penemuan', entity, (it) => [it.metadata.name, ...(it.metadata.tags || [])]);
  if (!item) return null;
  return item.text;
}

async function trySeniBudaya(text) {
  const m = text.match(/^(budaya|tari|festival)\s+(?:khas\s+)?(.+)$/i);
  if (!m) return null;
  const entity = bridgeResolve.resolveCountryAlias(bridgeResolve.cleanEntity(m[2]));
  if (!entity) return null;
  const items = await bridgeResolve.findAllInList(
    'seni-budaya',
    (it) => (it.metadata.country && bridgeResolve.fuzzyEq(it.metadata.country.toLowerCase(), entity)) || bridgeResolve.wordOverlap(entity, (it.metadata.tags || []).join(' ').toLowerCase()),
    3
  );
  if (!items.length) return null;
  return 'Seni budaya khas ' + bridgeResolve.capitalize(entity) + '.\n' + items.map((it) => '- ' + it.text).join('\n');
}

async function tryEkonomi(text) {
  const m = text.match(/^ekonomi\s+(.+)$/i) || text.match(/^ekspor\s+(?:utama\s+)?(.+)$/i);
  if (!m) return null;
  const entity = bridgeResolve.cleanEntity(m[1]);
  if (!entity) return null;
  const item = await bridgeResolve.findBestInList('ekonomi', entity, (it) => [it.metadata.name, it.metadata.value, ...(it.metadata.tags || [])]);
  if (!item) return null;
  return item.text;
}

async function tryPlatform(text) {
  const m = text.match(/^marplace\s+(.+)$/i) || text.match(/^platform\s+(.+)$/i);
  if (!m) return null;
  const entity = bridgeResolve.cleanEntity(m[1]);
  if (!entity) return null;
  const item = await bridgeResolve.findBestInList('platform', entity, (it) => [it.metadata.name, ...(it.metadata.tags || [])]);
  if (!item) return null;
  return item.text;
}

const MATA_PELAJARAN_MAP = {
  biologi: 'biologi',
  matematika: 'matematika',
  fisika: 'fisika',
  kimia: 'kimia',
  geografi: 'geografi',
  ppkn: 'ppkn',
  'pendidikan kewarganegaraan': 'ppkn',
  'bahasa indonesia': 'bahasa-indonesia',
  'bahasa inggris': 'bahasa-inggris',
  'sejarah sekolah': 'sejarah',
  'ekonomi sekolah': 'ekonomi',
};

async function tryMataPelajaran(text) {
  const m = text.match(/^(biologi|matematika|fisika|kimia|geografi|ppkn|pendidikan\s+kewarganegaraan|bahasa\s+indonesia|bahasa\s+inggris|sejarah\s+sekolah|ekonomi\s+sekolah)\s+(.+)$/i);
  if (!m) return null;
  const subjectKey = m[1].toLowerCase().replace(/\s+/g, ' ').trim();
  const regionId = MATA_PELAJARAN_MAP[subjectKey];
  if (!regionId) return null;
  const entity = bridgeResolve.cleanEntity(m[2]);
  if (!entity) return null;
  const item = await bridgeResolve.findBestInRegion('mata-pelajaran', regionId, entity, (it) => [it.metadata.topic, ...(it.metadata.tags || [])]);
  if (!item) return null;
  return item.text;
}

async function extras(q) {
  const rawText = String(q || '').trim();
  if (!rawText) return null;
  const reverseLookup = await bridgeReasoning.tryReverseLookup(rawText);
  if (reverseLookup) return reverseLookup;

  const text = bridgeResolve.splitPossessiveSuffix(rawText);
  if (!text) return null;

  const superlatif = await bridgeReasoning.trySuperlatif(text);
  if (superlatif) return superlatif;

  const agregasi = await bridgeReasoning.tryAgregasi(text);
  if (agregasi) return agregasi;

  const regionList = await bridgeReasoning.tryRegionList(text);
  if (regionList) return regionList;

  const konversiSatuan = await bridgeReasoning.tryKonversiSatuan(text);
  if (konversiSatuan) return konversiSatuan;

  const unitFallback = mathEngine.tryConvertUnit(text);
  if (unitFallback) return 'Hasilnya sekitar ' + unitFallback.value + ' ' + unitFallback.unit + '.';

  const konversiMataUang = await bridgeReasoning.tryKonversiMataUang(text);
  if (konversiMataUang) return konversiMataUang;

  const currencyFallback = mathEngine.tryConvertCurrency(text);
  if (currencyFallback) {
    return 'Sekitar ' + currencyFallback.value + ' ' + currencyFallback.to + ' (kurs statis, bukan kurs real-time).';
  }

  const penalaranTanggal = await bridgeReasoning.tryPenalaranTanggal(text);
  if (penalaranTanggal) return penalaranTanggal;

  const letak = await tryLetakGeografis(text);
  if (letak) return letak;

  const penutur = await tryPenuturBahasa(text);
  if (penutur) return penutur;

  const greeting = await tryGreetingBahasa(text);
  if (greeting) return greeting;

  const kotaTerkenal = await tryKotaTerkenal(text);
  if (kotaTerkenal) return kotaTerkenal;

  const wisata = await tryWisataDi(text);
  if (wisata) return wisata;

  const makanan = await tryMakananKhas(text);
  if (makanan) return makanan;

  const minuman = await tryMinumanKhas(text);
  if (minuman) return minuman;

  const etika = await tryEtika(text);
  if (etika) return etika;

  const bahasa = await tryBahasaDi(text);
  if (bahasa) return bahasa;

  const tokoh = await trySiapaTokoh(text);
  if (tokoh) return tokoh;

  const sejarah = await trySejarah(text);
  if (sejarah) return sejarah;

  const alam = await tryAlam(text);
  if (alam) return alam;

  const penemuan = await tryPenemuan(text);
  if (penemuan) return penemuan;

  const seniBudaya = await trySeniBudaya(text);
  if (seniBudaya) return seniBudaya;

  const ekonomi = await tryEkonomi(text);
  if (ekonomi) return ekonomi;

  const platform = await tryPlatform(text);
  if (platform) return platform;

  const topic = await tryTopicSearch(text);
  if (topic) return topic;

  return null;
}

export const bridgeExtras = Object.freeze({
  extras,
  tryMataPelajaran,
});
