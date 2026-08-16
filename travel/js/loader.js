import { dataries, REGIONS } from '../../raget/raget-dataries/index.js';

let countries = null, langs = null, foods = null, cities = null, wisata = null, senbud = null, sej = null;

export async function loadDataries() {
  return dataries;
}

export async function data() {
  if (!dataries) return null;
  if (!countries) {
    [countries, langs, foods, cities, wisata, senbud, sej] = await Promise.all([
      dataries.loadAll('country'), dataries.loadAll('languages'), dataries.loadAll('makanan'),
      dataries.loadAll('cities'), dataries.loadAll('wisata'), dataries.loadAll('seni-budaya'), dataries.loadAll('sejarah'),
    ]);
  }
  return { countries, langs, foods, cities, wisata, senbud, sej };
}

export { dataries, REGIONS };
