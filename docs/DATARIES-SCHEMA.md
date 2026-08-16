# Skema Data Dataries

Setiap item di seluruh folder `raget/raget-dataries/` mengikuti bentuk dasar yang sama:

```js
{ text: 'Kalimat deskripsi siap tampil...', metadata: { ...field per folder... } }
```

`text` selalu string siap tampil ke pengguna. `metadata` berisi field terstruktur
untuk pencarian/filter programatis. Berikut skema tiap folder:

| Folder | Field metadata | Contoh |
|---|---|---|
| `country/` | name, capital, population, currency, languages[], area, independenceDay, governmentType, dll (±100 field per negara) | `{ name: 'Indonesia', capital: 'Jakarta', population: 277000000, ... }` |
| `cities/` | region, country, name, type, population, knownFor, tags[] | `{ region: 'asia-tenggara', country: 'Indonesia', name: 'Bandung', ... }` |
| `languages/` | region, name, nativeName, speakers, script, family, officialIn[], greetings{halo,pagi,terimakasih}, tags[] | `{ name: 'Jepang', speakers: '125 juta', greetings: { halo: 'konnichiwa' } }` |
| `wisata/` | region, country, name, city, type ('alam'\|'budaya'\|'ikon'), unesco, tags[] | `{ name: 'Borobudur', country: 'Indonesia', type: 'budaya', unesco: true }` |
| `tokoh/` | name, field, knownFor, country, born, tags[] | `{ name: 'Thomas Edison', field: 'teknologi', knownFor: 'bola lampu' }` |
| `makanan/` | name, country, region, type, tags[] | `{ name: 'Kimchi', country: 'Korea Selatan', type: 'lauk fermentasi' }` |
| `sains/` | topic, field, tags[] | `{ topic: 'Fotosintesis', field: 'biologi' }` |
| `olahraga/` | topic, category, tags[] | `{ topic: 'Piala Dunia FIFA', category: 'turnamen' }` |
| `sejarah/` | name, period, year, location, tags[] | `{ name: 'Proklamasi Kemerdekaan Indonesia', year: '1945' }` |
| `alam/` | region, name, type ('fauna'\|'flora'), habitat, tags[] | `{ name: 'Komodo', type: 'fauna', habitat: 'Indonesia' }` |
| `penemuan/` | name, inventor, year, field, tags[] | `{ name: 'Telepon', inventor: 'Alexander Graham Bell', year: '1876' }` |
| `seni-budaya/` | region, country, name, type ('tari'\|'musik'\|'festival'\|'pakaian'), tags[] | `{ name: 'Tari Kecak', country: 'Indonesia', type: 'tari' }` |
| `ekonomi/` | name, type, value, tags[] | `{ name: 'PDB', type: 'indikator makro' }` |

## Pola Registrasi & Lazy Load

Semua region terdaftar di `raget/raget-dataries/index.js` lewat `REGIONS`, dimuat lazy
per region (dynamic `import()` + cache `Map`) lewat `dataries.loadRegion(group, id)`.
Ini menjaga waktu boot tetap cepat meski total data terus bertambah.

## Pola Pencarian

Pencarian dasar (word-overlap, fuzzy substring) dicontohkan di
`raget/raget-agents/dataries-bridge.js` — fungsi `fuzzyEq`, `matchScore`, dan
`findBestInList` bisa dipakai ulang untuk skenario pencarian lain di luar
chatbot (mis. filter/kartu UI seperti di `jalanin/app.js`).
