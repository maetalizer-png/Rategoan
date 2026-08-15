import { bridgeResolve } from './bridge-resolve.js';
import { bridgeFormat } from './bridge-format.js';

const RELATIONS = [
  { keys: ['kota terbesar'], fields: ['largestCity'] },
  { keys: ['ibukota', 'ibu kota'], fields: ['capital'] },
  { keys: ['jumlah provinsi', 'berapa provinsi', 'provinsi'], fields: ['administrativeDivisions', 'totalProvinces'] },
  { keys: ['kabupaten'], fields: ['kabupaten'] },
  { keys: ['kota'], fields: ['totalCities'] },
  { keys: ['populasi', 'penduduk', 'pendudukan'], fields: ['population'] },
  { keys: ['mata uang'], fields: ['currency'] },
  { keys: ['bahasa'], fields: ['languages'] },
  { keys: ['pemerintahan'], fields: ['governmentType'] },
  { keys: ['merdeka', 'kemerdekaan'], fields: ['independenceDay'] },
  { keys: ['luas'], fields: ['area'] },
  { keys: ['kode telepon', 'kode telpon'], fields: ['phoneCode'] },
];

const LANGUAGE_EXTRAS_RE = /sapaan|penutur|cara\s+menyapa|dalam\s+bahasa|ucapkan\s+selamat\s+pagi/i;

function detectRelation(text) {
  const t = text.toLowerCase();
  for (const rel of RELATIONS) {
    if (rel.fields.includes('languages') && LANGUAGE_EXTRAS_RE.test(t)) continue;
    if (rel.keys.some((k) => bridgeResolve.hasKeyword(t, k))) return rel;
  }
  return null;
}

async function resolveValue(relation, entity) {
  if (!entity) return null;
  const countryItem = await bridgeResolve.lookupInGroup('country', entity);
  if (countryItem) {
    for (const f of relation.fields) {
      if (countryItem.metadata[f] != null) {
        return { value: bridgeFormat.formatValue(f, countryItem.metadata[f]), field: f, label: countryItem.metadata.name, item: countryItem };
      }
    }
  }
  const cityItem = await bridgeResolve.lookupInGroup('cities', entity);
  if (cityItem) {
    for (const f of relation.fields) {
      if (cityItem.metadata[f] != null) {
        return { value: bridgeFormat.formatValue(f, cityItem.metadata[f]), field: f, label: cityItem.metadata.name, item: cityItem };
      }
    }
  }
  if (relation.fields.includes('capital') || relation.fields.includes('kabupaten')) {
    const prov = await bridgeResolve.findProvince(entity);
    if (prov) {
      const f = relation.fields.includes('kabupaten') ? 'kabupaten' : 'capital';
      const raw = prov.province[f];
      if (raw != null) return { value: bridgeFormat.formatValue(f, raw), field: f, label: bridgeResolve.capitalize(entity), item: null };
    }
  }
  return null;
}

export const bridgeRelations = Object.freeze({
  detectRelation,
  resolveValue,
});
