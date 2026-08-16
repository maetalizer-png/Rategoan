import { pickVariant } from '../../utils/text.js';

const MONTHS_ID = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

const FACTOID_OPENERS = [
  '', 'Setahu saya, ', 'Sepengetahuan saya, ', 'Kalau data saya benar, ', 'Berdasarkan catatan saya, ', 'Kalau tidak salah, ',
  'Setahu saya sih, ', 'Kalau nggak salah ingat, ', 'Dari yang saya tahu, ',
  'Berdasarkan yang saya ingat, ', 'Setahu saya dari catatan, ',
];

const REGION_LABELS = {
  'african-barat': 'Afrika Barat',
  'african-selatan': 'Afrika Selatan',
  'african-tengah': 'Afrika Tengah',
  'african-timur': 'Afrika Timur',
  'african-utara': 'Afrika Utara',
  'american-karibia': 'Karibia',
  'american-selatan': 'Amerika Selatan',
  'american-tengah': 'Amerika Tengah',
  'american-utara': 'Amerika Utara',
  'asian-barat': 'Asia Barat',
  'asian-selatan': 'Asia Selatan',
  'asian-tengah': 'Asia Tengah',
  'asian-tenggara': 'Asia Tenggara',
  'asian-timur': 'Asia Timur',
  'eropan-barat': 'Eropa Barat',
  'eropan-selatan': 'Eropa Selatan',
  'eropan-tengah': 'Eropa Tengah',
  'eropan-timur': 'Eropa Timur',
  'eropan-utara': 'Eropa Utara',
  osenian: 'Oseania',
};

function formatCount(n) {
  const num = Number(n);
  if (!isFinite(num)) return String(n);
  if (num >= 1e9) return Math.round((num / 1e9) * 10) / 10 + ' miliar';
  if (num >= 1e6) return Math.round((num / 1e6) * 10) / 10 + ' juta';
  if (num >= 1e3) return Math.round((num / 1e3) * 10) / 10 + ' ribu';
  return num.toLocaleString('id-ID');
}

function formatIndependence(dateStr) {
  const m = String(dateStr || '').match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return String(dateStr);
  const month = MONTHS_ID[parseInt(m[2], 10) - 1] || m[2];
  const year = parseInt(m[1], 10);
  const yearsAgo = new Date().getFullYear() - year;
  const agoText = yearsAgo > 0 ? ' (±' + yearsAgo + ' tahun lalu)' : '';
  return m[1] + ' (' + parseInt(m[3], 10) + ' ' + month + ')' + agoText;
}

function formatLanguages(languages) {
  if (!Array.isArray(languages)) return String(languages || '');
  const official = languages.filter((l) => l && l.official).map((l) => l.name);
  const names = official.length ? official : languages.map((l) => l.name);
  return names.map((n) => (/^bahasa\b/i.test(n) ? n : 'Bahasa ' + n)).join(' dan ');
}

function formatValue(field, raw) {
  if (field === 'population') return '±' + formatCount(raw) + ' jiwa';
  if (field === 'area') return formatCount(raw) + ' km²';
  if (field === 'independenceDay') return formatIndependence(raw);
  if (field === 'languages') return formatLanguages(raw);
  return String(raw);
}

const TRIVIA_FIELDS = ['population', 'largestCity', 'area', 'currency', 'independenceDay'];
const TRIVIA_LABELS = {
  population: 'Populasinya sekitar',
  largestCity: 'Kota terbesarnya',
  area: 'Luasnya sekitar',
  currency: 'Mata uangnya',
  independenceDay: 'Merdeka pada',
};
const CROSSREF_MODES = ['yes', 'yes', 'no'];
const CROSSREF_SUGGESTIONS = {
  capital: (label) => 'Mau tahu juga makanan khas ' + label + '?',
  population: (label) => 'Mau tahu juga ibukota ' + label + '?',
  currency: (label) => 'Mau tahu juga tempat wisata di ' + label + '?',
  languages: (label) => 'Mau tahu juga makanan khas ' + label + '?',
};

function maybeCrossRef(out, field, label, richness) {
  const suggest = CROSSREF_SUGGESTIONS[field];
  if (!suggest || richness === 'singkat') return out;
  const mode = pickVariant('crossref_mode', CROSSREF_MODES, label + field);
  return mode === 'yes' ? out + ' ' + suggest(label) : out;
}

function triviaFact(item, excludeField) {
  if (!item || !item.metadata) return null;
  const meta = item.metadata;
  const candidates = TRIVIA_FIELDS.filter((f) => f !== excludeField && meta[f] != null);
  if (!candidates.length) return null;
  const f = pickVariant('trivia_field_' + meta.name, candidates, meta.name + excludeField);
  return TRIVIA_LABELS[f] + ' ' + formatValue(f, meta[f]) + '.';
}

function craftAnswer(field, label, value, item, richness) {
  const sentences = {
    capital: 'Ibukota ' + label + ' adalah ' + value + '.',
    totalProvinces: label + ' memiliki ' + value + ' provinsi.',
    administrativeDivisions: label + ' memiliki ' + value + ' provinsi.',
    totalCities: label + ' memiliki ' + value + ' kota/kabupaten.',
    kabupaten: label + ' memiliki ' + value + ' kabupaten.',
    population: 'Populasi ' + label + ' sekitar ' + value + '.',
    currency: 'Mata uang ' + label + ' adalah ' + value + '.',
    languages: 'Bahasa resmi ' + label + ' adalah ' + value + '.',
    governmentType: 'Sistem pemerintahan ' + label + ' adalah ' + value + '.',
    independenceDay: label + ' merdeka pada ' + value + '.',
    largestCity: 'Kota terbesar di ' + label + ' adalah ' + value + '.',
    area: 'Luas ' + label + ' sekitar ' + value + '.',
    phoneCode: 'Kode telepon ' + label + ' adalah ' + value + '.',
  };
  const base = sentences[field] || label + ': ' + value + '.';
  const opener = pickVariant('dataries_opener', FACTOID_OPENERS, label + value + field);
  let out = opener ? opener + base.charAt(0).toLowerCase() + base.slice(1) : base;
  if (richness !== 'singkat' && item) {
    const trivia = triviaFact(item, field);
    if (trivia && !trivia.includes(String(value))) {
      out += ' ' + trivia;
    } else {
      out = maybeCrossRef(out, field, label, richness);
    }
  }
  return out;
}

function summarizeItem(item, richness) {
  const sentences = String(item.text || '')
    .split(/(?<=[.!?])\s+/)
    .filter(Boolean);
  const count = richness === 'singkat' ? 1 : 3;
  const summary = sentences.slice(0, count).join(' ');
  if (richness === 'singkat') return summary;
  const heading = '### ' + (item.metadata.name || '');
  const meta = item.metadata || {};
  const bullets = [];
  if (meta.capital) bullets.push('- Ibukota: ' + meta.capital);
  if (meta.population != null) bullets.push('- Populasi: ' + formatValue('population', meta.population));
  if (!bullets.length) return heading + '\n' + summary;
  return heading + '\n' + summary + '\n' + bullets.slice(0, 2).join('\n');
}

export const bridgeFormat = Object.freeze({
  MONTHS_ID,
  FACTOID_OPENERS,
  REGION_LABELS,
  formatValue,
  craftAnswer,
  summarizeItem,
});
