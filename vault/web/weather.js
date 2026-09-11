// Cuaca real-time via Open-Meteo (geocoding-api.open-meteo.com +
// api.open-meteo.com) - gratis, tanpa API key, CORS terbuka langsung dari
// browser. Ini kapabilitas yang beda kelas dari Wikipedia/Wiktionary: bukan
// ensiklopedia statis, tapi data cuaca yang benar-benar berubah tiap jam.
const NETWORK_FAIL_MESSAGE =
  'Gagal mengakses internet untuk cek cuaca ini — bisa karena tidak ada koneksi, atau layanan cuaca sedang tidak bisa diakses dari sini. Raget 100% berjalan lokal tanpa server perantara, jadi cek cuaca langsung bergantung pada koneksi perangkat ini.';

const WEATHER_CODE_ID = {
  0: 'cerah', 1: 'cerah berawan sebagian', 2: 'berawan sebagian', 3: 'berawan tebal',
  45: 'berkabut', 48: 'berkabut dengan embun beku',
  51: 'gerimis ringan', 53: 'gerimis sedang', 55: 'gerimis lebat',
  56: 'gerimis beku ringan', 57: 'gerimis beku lebat',
  61: 'hujan ringan', 63: 'hujan sedang', 65: 'hujan lebat',
  66: 'hujan beku ringan', 67: 'hujan beku lebat',
  71: 'salju ringan', 73: 'salju sedang', 75: 'salju lebat', 77: 'butiran salju',
  80: 'hujan lokal ringan', 81: 'hujan lokal sedang', 82: 'hujan lokal lebat',
  85: 'hujan salju ringan', 86: 'hujan salju lebat',
  95: 'badai petir', 96: 'badai petir dengan hujan es ringan', 99: 'badai petir hebat dengan hujan es',
};

async function fetchJson(url) {
  const res = await fetch(url, { mode: 'cors' });
  if (!res.ok) throw new Error('HTTP ' + res.status);
  return res.json();
}

async function geocode(name) {
  const url =
    'https://geocoding-api.open-meteo.com/v1/search?name=' +
    encodeURIComponent(name) + '&count=1&language=id&format=json';
  const data = await fetchJson(url);
  const hit = data && data.results && data.results[0];
  if (!hit) return null;
  return { name: hit.name, country: hit.country, lat: hit.latitude, lon: hit.longitude };
}

async function currentForecast(lat, lon) {
  const url =
    'https://api.open-meteo.com/v1/forecast?latitude=' + lat + '&longitude=' + lon +
    '&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto';
  return await fetchJson(url);
}

async function search(place) {
  const q = String(place || '').trim();
  if (!q) return { ok: false, message: 'Cuaca di kota mana yang mau dicek?' };
  if (typeof fetch !== 'function') return { ok: false, message: NETWORK_FAIL_MESSAGE };
  try {
    const loc = await geocode(q);
    if (!loc) return { ok: false, message: 'Tidak ketemu lokasi "' + q + '" untuk cek cuaca.' };
    const data = await currentForecast(loc.lat, loc.lon);
    const cur = data && data.current;
    if (!cur || cur.temperature_2m == null) return { ok: false, message: NETWORK_FAIL_MESSAGE };
    return {
      ok: true,
      place: loc.name + (loc.country ? ', ' + loc.country : ''),
      temp: cur.temperature_2m,
      humidity: cur.relative_humidity_2m,
      wind: cur.wind_speed_10m,
      desc: WEATHER_CODE_ID[cur.weather_code] || 'kondisi tidak diketahui',
      time: cur.time,
    };
  } catch (e) {
    return { ok: false, message: NETWORK_FAIL_MESSAGE };
  }
}

export const weather = Object.freeze({ search });
