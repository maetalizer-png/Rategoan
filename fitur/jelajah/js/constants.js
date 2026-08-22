export const RATES = {
  'Rupiah': 1, 'Euro': 17200, 'Pound Sterling': 20500, 'Dolar Amerika': 16300,
  'Dolar Singapura': 12600, 'Ringgit': 3500, 'Baht': 470, 'Yen': 110, 'Yuan': 2280,
  'Won': 12, 'Riyal': 4350, 'Dirham': 4450, 'Rupee': 196, 'Dolar Australia': 10700,
  'Franc CFA': 28, 'Cedi': 1060, 'Naira': 101, 'Rand': 890, 'Rubel': 182, 'Lira': 500, 'Peso': 290,
};

export const POPULAR = ['indonesia', 'malaysia', 'singapura', 'thailand', 'vietnam', 'jepang', 'korea selatan', 'china', 'arab saudi', 'turki', 'prancis', 'inggris', 'amerika serikat', 'australia', 'mesir', 'maroko'];
export const ASEAN = ['indonesia', 'malaysia', 'singapura', 'thailand', 'vietnam', 'filipina', 'myanmar', 'kamboja', 'laos', 'brunei', 'timor leste'];
export const DEFAULT_PACK = ['Paspor / KTP', 'Tiket & bukti booking', 'Charger & powerbank', 'Obat pribadi', 'Pakaian secukupnya', 'Uang tunai & kartu'];
export const FILTERS = [['all', 'Semua'], ['asean', 'ASEAN'], ['asia', 'Asia'], ['eropa', 'Eropa'], ['afrika', 'Afrika'], ['amerika', 'Amerika'], ['osenia', 'Osenia']];
export const BUDGET_BASE = { asean: 600000, asia: 900000, eropa: 1800000, afrika: 800000, amerika: 1500000, osenia: 1700000, lain: 1000000 };
export const TIER_MULT = { hemat: 1, sedang: 1.8, nyaman: 3 };
export const PACK_TIPS = {
  asean: ['Jas hujan tipis', 'Obat nyamuk', 'Sandar nyaman'],
  asia: ['Adaptor colokan', 'Jaket ringan'],
  eropa: ['Jaket hangat', 'Adaptor tipe C/F', 'Payung lipat'],
  afrika: ['Tabir surya', 'Air botol', 'Konsultasi obat pribadi'],
  amerika: ['Adaptor colokan', 'Jaket ringan'],
  osenia: ['Tabir surya', 'Topi'],
  lain: ['Adaptor universal'],
};
export const BADGES = [
  { id: 'asean', label: 'Penjelajah ASEAN', test: (s) => s.bestSantai >= 8, desc: 'Diberikan saat skor kuis Santai mencapai 8 dari 10 soal.' },
  { id: 'dunia', label: 'Penakluk Dunia', test: (s) => s.bestDunia >= 8, desc: 'Diberikan saat skor kuis Tantangan (dunia) mencapai 8 dari 10 soal.' },
  { id: 'streak', label: 'Konsisten', test: () => +localStorage.getItem('travel_streak') >= 3, desc: 'Diberikan saat streak tantangan harian mencapai 3 hari berturut-turut.' },
  { id: 'collector', label: 'Kolektor', test: (s) => s.viewed >= 20, desc: 'Diberikan setelah membuka detail 20 negara berbeda.' },
  { id: 'poliglot', label: 'Poliglot', test: (s) => s.sapaan >= 30, desc: 'Diberikan setelah membuka 30 kartu sapaan bahasa.' },
  { id: 'planner', label: 'Perencana', test: (s) => s.trips >= 1, desc: 'Diberikan setelah menyimpan rencana perjalanan pertama.' },
];
