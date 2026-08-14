const KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN = KESEMPATAN;

// ==========================================================
// 2. INTERNAL LOGGER (Zero console.log)
// ==========================================================
const InternalLogger = window.InternalLogger || {
    _logs: [],
    _maxLogs: 1000,
    _levels: { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3, CRITICAL: 4 },
    _level: 1,
    _getLevelPrefix: function(level) {
        const prefixes = { 0: '[DEBUG]', 1: '[INFO]', 2: '[WARN]', 3: '[ERROR]', 4: '[CRITICAL]' };
        return prefixes[level] || '[INFO]';
    },
    log: function(level, module, message) {
        if (this._level <= level && typeof console !== 'undefined') {
            const prefix = this._getLevelPrefix(level);
            console.log(prefix + ' [' + module + '] ' + message);
        }
    },
    info: function(module, message) { this.log(this._levels.INFO, module, message); },
    warn: function(module, message) { this.log(this._levels.WARN, module, message); },
    error: function(module, message) { this.log(this._levels.ERROR, module, message); }
};

// ==========================================================
// 3. REGISTER DATA
// ==========================================================
// ==========================================================
// 4. CACHE SYSTEM
// ==========================================================
const DataCache = {
    _cache: new Map(),
    _maxSize: 100,
    _ttl: 300000,
    get: function(key) {
        const item = this._cache.get(key);
        if (!item) return null;
        if (Date.now() > item.expiry) {
            this._cache.delete(key);
            return null;
        }
        return item.value;
    },
    set: function(key, value, ttl) {
        ttl = ttl || this._ttl;
        if (this._cache.size >= this._maxSize) {
            const firstKey = this._cache.keys().next().value;
            this._cache.delete(firstKey);
        }
        this._cache.set(key, { value: value, expiry: Date.now() + ttl });
    },
    clear: function() { this._cache.clear(); },
    getSize: function() { return this._cache.size; },
    getStats: function() { return { size: this._cache.size, maxSize: this._maxSize, ttl: this._ttl }; }
};

// ==========================================================
// 5. VALIDATION
// ==========================================================
const validatePlatform = function(item) {
    if (!item || typeof item !== 'object') return false;
    if (!item.metadata || typeof item.metadata !== 'object') return false;
    if (!item.metadata.name || typeof item.metadata.name !== 'string') return false;
    if (!item.metadata.country || typeof item.metadata.country !== 'string') return false;
    return true;
};

// ==========================================================
// 6. PLATFORM DATA — 85+ GLOBAL!
// ==========================================================

const data = [
    // ==========================================================
    // 🌍 GLOBAL (6)
    // ==========================================================
    {
        text: 'LinkedIn - Platform profesional global terbesar. Didirikan 2002 oleh Reid Hoffman. 900+ juta pengguna di 200+ negara.',
        metadata: {
            category: 'marplace',
            type: 'job',
            name: 'LinkedIn',
            founded: 2002,
            founder: 'Reid Hoffman',
            country: 'Global',
            region: 'global',
            products: ['Networking', 'Lowongan', 'Edukasi', 'Headhunting'],
            tags: ['job', 'global', 'terbesar'],
            stats: { annualRevenue: '15.1B USD', monthlyVisitors: '600M', totalListings: '50M+', totalCVs: '900M+', employees: '15K', countriesOperated: '200+' },
            status: 'aktif'
        }
    },
    {
        text: 'Indeed - Aggregator job global terbesar. Didirikan 2004. Mengumpulkan lowongan dari berbagai sumber.',
        metadata: {
            category: 'marplace',
            type: 'job',
            name: 'Indeed',
            founded: 2004,
            country: 'Global',
            region: 'global',
            products: ['Lowongan', 'Salary Calculator', 'Company Reviews'],
            tags: ['job', 'global', 'aggregator'],
            stats: { annualRevenue: '4.5B USD', monthlyVisitors: '300M', totalListings: '100M+', totalCVs: '200M+', employees: '12K', countriesOperated: '60+' },
            status: 'aktif'
        }
    },
    {
        text: 'Glassdoor - Platform job dengan review perusahaan. Didirikan 2007. Transparansi gaji & budaya perusahaan.',
        metadata: {
            category: 'marplace',
            type: 'job',
            name: 'Glassdoor',
            founded: 2007,
            country: 'Global',
            region: 'global',
            products: ['Lowongan', 'Company Reviews', 'Salary Data'],
            tags: ['job', 'global', 'review'],
            stats: { annualRevenue: '1.2B USD', monthlyVisitors: '80M', totalListings: '10M+', totalCVs: '50M+', employees: '2K', countriesOperated: '190+' },
            status: 'aktif'
        }
    },
    {
        text: 'Monster.com - Platform job tertua global. Didirikan 1994. Pelopor rekrutmen online.',
        metadata: {
            category: 'marplace',
            type: 'job',
            name: 'Monster.com',
            founded: 1994,
            country: 'Global',
            region: 'global',
            products: ['Lowongan', 'CV Database', 'Career Advice'],
            tags: ['job', 'global', 'tertua'],
            stats: { annualRevenue: '1.5B USD', monthlyVisitors: '100M', totalListings: '20M+', totalCVs: '100M+', employees: '3K', countriesOperated: '40+' },
            status: 'aktif'
        }
    },
    {
        text: 'CareerBuilder - Platform job dengan AI matching. Didirikan 1995. Fokus pada matching kandidat & lowongan.',
        metadata: {
            category: 'marplace',
            type: 'job',
            name: 'CareerBuilder',
            founded: 1995,
            country: 'Global',
            region: 'global',
            products: ['Lowongan', 'AI Matching', 'CV Database'],
            tags: ['job', 'global', 'ai'],
            stats: { annualRevenue: '800M USD', monthlyVisitors: '50M', totalListings: '10M+', totalCVs: '80M+', employees: '2K', countriesOperated: '50+' },
            status: 'aktif'
        }
    },
    {
        text: 'ZipRecruiter - Platform job dengan AI-powered matching. Didirikan 2010.',
        metadata: {
            category: 'marplace',
            type: 'job',
            name: 'ZipRecruiter',
            founded: 2010,
            country: 'Global',
            region: 'global',
            products: ['Lowongan', 'AI Matching'],
            tags: ['job', 'global', 'ai'],
            stats: { annualRevenue: '600M USD', monthlyVisitors: '40M', totalListings: '5M+', totalCVs: '30M+', employees: '1K', countriesOperated: '10+' },
            status: 'aktif'
        }
    },
    
    // ==========================================================
    // 🇺🇸 AMERIKA (4)
    // ==========================================================
    {
        text: 'USAJobs - Platform job pemerintah AS. Resmi untuk lowongan federal.',
        metadata: {
            category: 'marplace',
            type: 'job',
            name: 'USAJobs',
            founded: 1996,
            country: 'AS',
            region: 'amerika-utara',
            products: ['Lowongan Pemerintah'],
            tags: ['job', 'amerika-utara', 'pemerintah'],
            stats: { annualRevenue: '50M USD', monthlyVisitors: '10M', totalListings: '500K+', totalCVs: '10M+', employees: '500', countriesOperated: '1' },
            status: 'aktif'
        }
    },
    {
        text: 'Dice - Platform khusus IT & tech. Didirikan 1990. Fokus profesional teknologi.',
        metadata: {
            category: 'marplace',
            type: 'job',
            name: 'Dice',
            founded: 1990,
            country: 'AS',
            region: 'amerika-utara',
            products: ['Lowongan IT', 'Tech Jobs'],
            tags: ['job', 'amerika-utara', 'it'],
            stats: { annualRevenue: '200M USD', monthlyVisitors: '20M', totalListings: '2M+', totalCVs: '15M+', employees: '500', countriesOperated: '3' },
            status: 'aktif'
        }
    },
    {
        text: 'AngelList - Platform startup & tech jobs. Didirikan 2010. Fokus startup & venture.',
        metadata: {
            category: 'marplace',
            type: 'job',
            name: 'AngelList',
            founded: 2010,
            country: 'AS',
            region: 'amerika-utara',
            products: ['Lowongan Startup', 'Tech'],
            tags: ['job', 'amerika-utara', 'startup'],
            stats: { annualRevenue: '300M USD', monthlyVisitors: '15M', totalListings: '1M+', totalCVs: '10M+', employees: '300', countriesOperated: '10+' },
            status: 'aktif'
        }
    },
    {
        text: 'The Muse - Platform karir dengan konten. Didirikan 2011. Panduan karir & lowongan.',
        metadata: {
            category: 'marplace',
            type: 'job',
            name: 'The Muse',
            founded: 2011,
            country: 'AS',
            region: 'amerika-utara',
            products: ['Lowongan', 'Career Advice'],
            tags: ['job', 'amerika-utara', 'karir'],
            stats: { annualRevenue: '100M USD', monthlyVisitors: '10M', totalListings: '1M+', totalCVs: '5M+', employees: '200', countriesOperated: '5' },
            status: 'aktif'
        }
    },
    
    // ==========================================================
    // 🇬🇧 INGGRIS (2)
    // ==========================================================
    {
        text: 'Reed - Platform job terbesar Inggris. Didirikan 1995. Lowongan berbagai bidang.',
        metadata: {
            category: 'marplace',
            type: 'job',
            name: 'Reed',
            founded: 1995,
            country: 'Inggris',
            region: 'eropa',
            products: ['Lowongan', 'CV Database'],
            tags: ['job', 'eropa', 'terbesar'],
            stats: { annualRevenue: '400M USD', monthlyVisitors: '30M', totalListings: '5M+', totalCVs: '20M+', employees: '1K', countriesOperated: '10+' },
            status: 'aktif'
        }
    },
    {
        text: 'Totaljobs - Platform job Inggris. Didirikan 1999. Lowongan dari berbagai sektor.',
        metadata: {
            category: 'marplace',
            type: 'job',
            name: 'Totaljobs',
            founded: 1999,
            country: 'Inggris',
            region: 'eropa',
            products: ['Lowongan'],
            tags: ['job', 'eropa', 'uk'],
            stats: { annualRevenue: '150M USD', monthlyVisitors: '15M', totalListings: '2M+', totalCVs: '10M+', employees: '500', countriesOperated: '3' },
            status: 'aktif'
        }
    },
    
    // ==========================================================
    // 🇩🇪 JERMAN (2)
    // ==========================================================
    {
        text: 'StepStone - Platform job Eropa. Didirikan 1996. Beroperasi di 20+ negara.',
        metadata: {
            category: 'marplace',
            type: 'job',
            name: 'StepStone',
            founded: 1996,
            country: 'Jerman',
            region: 'eropa',
            products: ['Lowongan'],
            tags: ['job', 'eropa', 'terbesar'],
            stats: { annualRevenue: '300M USD', monthlyVisitors: '25M', totalListings: '3M+', totalCVs: '15M+', employees: '800', countriesOperated: '20+' },
            status: 'aktif'
        }
    },
    {
        text: 'Xing - Platform profesional Jerman. Didirikan 2003. LinkedIn-nya Jerman.',
        metadata: {
            category: 'marplace',
            type: 'job',
            name: 'Xing',
            founded: 2003,
            country: 'Jerman',
            region: 'eropa',
            products: ['Networking', 'Lowongan'],
            tags: ['job', 'eropa', 'jerman'],
            stats: { annualRevenue: '200M USD', monthlyVisitors: '20M', totalListings: '2M+', totalCVs: '15M+', employees: '500', countriesOperated: '5' },
            status: 'aktif'
        }
    },
    
    // ==========================================================
    // 🇫🇷 PRANCIS (1)
    // ==========================================================
    {
        text: 'Cadremploi - Platform job Prancis. Didirikan 1999. Lowongan untuk profesional.',
        metadata: {
            category: 'marplace',
            type: 'job',
            name: 'Cadremploi',
            founded: 1999,
            country: 'Prancis',
            region: 'eropa',
            products: ['Lowongan Profesional'],
            tags: ['job', 'eropa', 'prancis'],
            stats: { annualRevenue: '100M USD', monthlyVisitors: '10M', totalListings: '1M+', totalCVs: '5M+', employees: '300', countriesOperated: '2' },
            status: 'aktif'
        }
    },
    
    // ==========================================================
    // 🇨🇳 CHINA (3)
    // ==========================================================
    {
        text: '51job - Platform job terbesar China. Didirikan 1998. Lowongan berbagai bidang.',
        metadata: {
            category: 'marplace',
            type: 'job',
            name: '51job',
            founded: 1998,
            country: 'China',
            region: 'asia-timur',
            products: ['Lowongan', 'CV Database'],
            tags: ['job', 'asia-timur', 'terbesar'],
            stats: { annualRevenue: '500M USD', monthlyVisitors: '50M', totalListings: '10M+', totalCVs: '50M+', employees: '2K', countriesOperated: '5' },
            status: 'aktif'
        }
    },
    {
        text: 'Liepin - Platform job profesional China. Didirikan 2011. Fokus talent & headhunting.',
        metadata: {
            category: 'marplace',
            type: 'job',
            name: 'Liepin',
            founded: 2011,
            country: 'China',
            region: 'asia-timur',
            products: ['Headhunting', 'Lowongan'],
            tags: ['job', 'asia-timur', 'china'],
            stats: { annualRevenue: '200M USD', monthlyVisitors: '20M', totalListings: '2M+', totalCVs: '10M+', employees: '500', countriesOperated: '3' },
            status: 'aktif'
        }
    },
    {
        text: 'Zhaopin - Platform job China. Didirikan 1994. Tulang punggung pasar kerja China.',
        metadata: {
            category: 'marplace',
            type: 'job',
            name: 'Zhaopin',
            founded: 1994,
            country: 'China',
            region: 'asia-timur',
            products: ['Lowongan', 'CV Database'],
            tags: ['job', 'asia-timur', 'china'],
            stats: { annualRevenue: '300M USD', monthlyVisitors: '30M', totalListings: '5M+', totalCVs: '30M+', employees: '1K', countriesOperated: '2' },
            status: 'aktif'
        }
    },
    
    // ==========================================================
    // 🇯🇵 JEPANG (2)
    // ==========================================================
    {
        text: 'Indeed Japan - Versi Indeed di Jepang. Didirikan 2004. Terbesar di Jepang.',
        metadata: {
            category: 'marplace',
            type: 'job',
            name: 'Indeed Japan',
            founded: 2004,
            country: 'Jepang',
            region: 'asia-timur',
            products: ['Lowongan'],
            tags: ['job', 'asia-timur', 'jepang'],
            stats: { annualRevenue: '200M USD', monthlyVisitors: '20M', totalListings: '3M+', totalCVs: '15M+', employees: '500', countriesOperated: '1' },
            status: 'aktif'
        }
    },
    {
        text: 'Daijob - Platform job bilingual Jepang. Didirikan 2000. Fokus ekspat & bilingual.',
        metadata: {
            category: 'marplace',
            type: 'job',
            name: 'Daijob',
            founded: 2000,
            country: 'Jepang',
            region: 'asia-timur',
            products: ['Lowongan Bilingual'],
            tags: ['job', 'asia-timur', 'jepang'],
            stats: { annualRevenue: '50M USD', monthlyVisitors: '5M', totalListings: '500K+', totalCVs: '2M+', employees: '100', countriesOperated: '2' },
            status: 'aktif'
        }
    },
    
    // ==========================================================
    // 🇰🇷 KOREA SELATAN (1) — BARU!
    // ==========================================================
    {
        text: 'JobKorea - Platform job terbesar Korea Selatan. Didirikan 1998. Lowongan berbagai bidang.',
        metadata: {
            category: 'marplace',
            type: 'job',
            name: 'JobKorea',
            founded: 1998,
            country: 'Korea Selatan',
            region: 'asia-timur',
            products: ['Lowongan', 'CV Database'],
            tags: ['job', 'asia-timur', 'korea'],
            stats: { annualRevenue: '100M USD', monthlyVisitors: '15M', totalListings: '2M+', totalCVs: '10M+', employees: '300', countriesOperated: '2' },
            status: 'aktif'
        }
    },
    
    // ==========================================================
    // 🇮🇳 INDIA (3)
    // ==========================================================
    {
        text: 'Naukri - Platform job terbesar India. Didirikan 1997. 60+ juta pengguna.',
        metadata: {
            category: 'marplace',
            type: 'job',
            name: 'Naukri',
            founded: 1997,
            country: 'India',
            region: 'asia-selatan',
            products: ['Lowongan', 'CV Database'],
            tags: ['job', 'asia-selatan', 'terbesar'],
            stats: { annualRevenue: '300M USD', monthlyVisitors: '30M', totalListings: '5M+', totalCVs: '60M+', employees: '1K', countriesOperated: '5' },
            status: 'aktif'
        }
    },
    {
        text: 'Shine - Platform job India. Didirikan 1998. Pesaing Naukri di India.',
        metadata: {
            category: 'marplace',
            type: 'job',
            name: 'Shine',
            founded: 1998,
            country: 'India',
            region: 'asia-selatan',
            products: ['Lowongan'],
            tags: ['job', 'asia-selatan', 'india'],
            stats: { annualRevenue: '150M USD', monthlyVisitors: '15M', totalListings: '2M+', totalCVs: '20M+', employees: '500', countriesOperated: '3' },
            status: 'aktif'
        }
    },
    {
        text: 'Internshala - Platform magang & fresh graduate India. Didirikan 2010. Fokus mahasiswa.',
        metadata: {
            category: 'marplace',
            type: 'job',
            name: 'Internshala',
            founded: 2010,
            country: 'India',
            region: 'asia-selatan',
            products: ['Magang', 'Fresh Graduate'],
            tags: ['job', 'asia-selatan', 'magang'],
            stats: { annualRevenue: '50M USD', monthlyVisitors: '10M', totalListings: '1M+', totalCVs: '10M+', employees: '200', countriesOperated: '2' },
            status: 'aktif'
        }
    },
    
    // ==========================================================
    // 🇦🇺 AUSTRALIA (2)
    // ==========================================================
    {
        text: 'Seek - Platform job terbesar Australia. Didirikan 1997. Lowongan berbagai bidang.',
        metadata: {
            category: 'marplace',
            type: 'job',
            name: 'Seek',
            founded: 1997,
            country: 'Australia',
            region: 'osenian',
            products: ['Lowongan'],
            tags: ['job', 'osenian', 'terbesar'],
            stats: { annualRevenue: '400M USD', monthlyVisitors: '25M', totalListings: '4M+', totalCVs: '20M+', employees: '800', countriesOperated: '10+' },
            status: 'aktif'
        }
    },
    {
        text: 'CareerOne - Platform job Australia. Didirikan 1999. Pesaing Seek di Australia.',
        metadata: {
            category: 'marplace',
            type: 'job',
            name: 'CareerOne',
            founded: 1999,
            country: 'Australia',
            region: 'osenian',
            products: ['Lowongan'],
            tags: ['job', 'osenian', 'australia'],
            stats: { annualRevenue: '100M USD', monthlyVisitors: '10M', totalListings: '1M+', totalCVs: '5M+', employees: '200', countriesOperated: '2' },
            status: 'aktif'
        }
    },
    
    // ==========================================================
    // 🇳🇿 SELANDIA BARU (1) — BARU!
    // ==========================================================
    {
        text: 'TradeMe Jobs - Platform job terbesar Selandia Baru. Didirikan 1999.',
        metadata: {
            category: 'marplace',
            type: 'job',
            name: 'TradeMe Jobs',
            founded: 1999,
            country: 'Selandia Baru',
            region: 'osenian',
            products: ['Lowongan'],
            tags: ['job', 'osenian', 'selandia-baru'],
            stats: { annualRevenue: '50M USD', monthlyVisitors: '5M', totalListings: '500K+', totalCVs: '3M+', employees: '100', countriesOperated: '1' },
            status: 'aktif'
        }
    },
    
    // ==========================================================
    // 🇿🇦 AFRIKA SELATAN (1)
    // ==========================================================
    {
        text: 'Careers24 - Platform job terbesar Afrika Selatan. Didirikan 2004.',
        metadata: {
            category: 'marplace',
            type: 'job',
            name: 'Careers24',
            founded: 2004,
            country: 'Afrika Selatan',
            region: 'afrika',
            products: ['Lowongan'],
            tags: ['job', 'afrika', 'terbesar'],
            stats: { annualRevenue: '50M USD', monthlyVisitors: '5M', totalListings: '500K+', totalCVs: '5M+', employees: '150', countriesOperated: '2' },
            status: 'aktif'
        }
    },
    
    // ==========================================================
    // 🇮🇩 INDONESIA (11) — UPGRADE!
    // ==========================================================
    {
        text: 'JobStreet Indonesia - Platform job terbesar di Indonesia. Didirikan 1997. Lowongan berbagai bidang.',
        metadata: {
            category: 'marplace',
            type: 'job',
            name: 'JobStreet Indonesia',
            founded: 1997,
            country: 'Indonesia',
            region: 'asia-tenggara',
            products: ['Lowongan', 'CV Online', 'Job Alerts'],
            tags: ['job', 'asia-tenggara', 'indonesia'],
            stats: { annualRevenue: '50M USD', monthlyVisitors: '20M', totalListings: '2M+', totalCVs: '10M+', employees: '300', countriesOperated: '1' },
            status: 'aktif'
        }
    },
    {
        text: 'Karir.com - Platform job Indonesia. Didirikan 2000. Fokus fresh graduate.',
        metadata: {
            category: 'marplace',
            type: 'job',
            name: 'Karir.com',
            founded: 2000,
            country: 'Indonesia',
            region: 'asia-tenggara',
            products: ['Lowongan', 'Karir Development'],
            tags: ['job', 'asia-tenggara', 'indonesia'],
            stats: { annualRevenue: '20M USD', monthlyVisitors: '10M', totalListings: '1M+', totalCVs: '5M+', employees: '100', countriesOperated: '1' },
            status: 'aktif'
        }
    },
    {
        text: 'Glints Indonesia - Platform karir dari Singapura. Didirikan 2013. Fokus fresh graduate.',
        metadata: {
            category: 'marplace',
            type: 'job',
            name: 'Glints Indonesia',
            founded: 2013,
            country: 'Indonesia',
            region: 'asia-tenggara',
            products: ['Lowongan', 'Magang', 'Karir Development'],
            tags: ['job', 'asia-tenggara', 'indonesia'],
            stats: { annualRevenue: '30M USD', monthlyVisitors: '8M', totalListings: '500K+', totalCVs: '3M+', employees: '150', countriesOperated: '2' },
            status: 'aktif'
        }
    },
    {
        text: 'Kalibrr Indonesia - Platform job dari Filipina. Didirikan 2013. Fokus skill matching.',
        metadata: {
            category: 'marplace',
            type: 'job',
            name: 'Kalibrr Indonesia',
            founded: 2013,
            country: 'Indonesia',
            region: 'asia-tenggara',
            products: ['Lowongan', 'Skill Matching'],
            tags: ['job', 'asia-tenggara', 'indonesia'],
            stats: { annualRevenue: '15M USD', monthlyVisitors: '5M', totalListings: '300K+', totalCVs: '2M+', employees: '80', countriesOperated: '2' },
            status: 'aktif'
        }
    },
    {
        text: 'Tech in Asia Jobs - Platform job untuk startup dan tech di Asia. Didirikan 2010.',
        metadata: {
            category: 'marplace',
            type: 'job',
            name: 'Tech in Asia Jobs',
            founded: 2010,
            country: 'Indonesia',
            region: 'asia-tenggara',
            products: ['Lowongan Startup', 'Tech Jobs'],
            tags: ['job', 'asia-tenggara', 'startup', 'tech'],
            stats: { annualRevenue: '10M USD', monthlyVisitors: '5M', totalListings: '50K+', totalCVs: '2M+', employees: '50', countriesOperated: '5' },
            status: 'aktif'
        }
    },
    {
        text: 'Joblike - Platform job dengan pendekatan sosial. Didirikan 2015. Fokus fresh graduate.',
        metadata: {
            category: 'marplace',
            type: 'job',
            name: 'Joblike',
            founded: 2015,
            country: 'Indonesia',
            region: 'asia-tenggara',
            products: ['Lowongan', 'Fresh Graduate'],
            tags: ['job', 'asia-tenggara', 'indonesia'],
            stats: { annualRevenue: '5M USD', monthlyVisitors: '3M', totalListings: '30K+', totalCVs: '1M+', employees: '30', countriesOperated: '1' },
            status: 'aktif'
        }
    },
    {
        text: 'Loker.id - Platform job lokal Indonesia. Didirikan 2016. Fokus lowongan berbagai level.',
        metadata: {
            category: 'marplace',
            type: 'job',
            name: 'Loker.id',
            founded: 2016,
            country: 'Indonesia',
            region: 'asia-tenggara',
            products: ['Lowongan', 'Job Alerts'],
            tags: ['job', 'asia-tenggara', 'indonesia'],
            stats: { annualRevenue: '3M USD', monthlyVisitors: '2M', totalListings: '20K+', totalCVs: '500K+', employees: '20', countriesOperated: '1' },
            status: 'aktif'
        }
    },
    {
        text: 'Kitalulus - Platform job dan magang. Didirikan 2018. Fokus fresh graduate dan mahasiswa.',
        metadata: {
            category: 'marplace',
            type: 'job',
            name: 'Kitalulus',
            founded: 2018,
            country: 'Indonesia',
            region: 'asia-tenggara',
            products: ['Lowongan', 'Magang', 'Fresh Graduate'],
            tags: ['job', 'asia-tenggara', 'indonesia'],
            stats: { annualRevenue: '8M USD', monthlyVisitors: '4M', totalListings: '40K+', totalCVs: '1.5M+', employees: '40', countriesOperated: '1' },
            status: 'aktif'
        }
    },
    {
        text: 'Pintarnya - Platform job berbasis AI. Didirikan 2020. Fokus matching kandidat dengan lowongan.',
        metadata: {
            category: 'marplace',
            type: 'job',
            name: 'Pintarnya',
            founded: 2020,
            country: 'Indonesia',
            region: 'asia-tenggara',
            products: ['Lowongan', 'AI Matching'],
            tags: ['job', 'asia-tenggara', 'indonesia', 'ai'],
            stats: { annualRevenue: '2M USD', monthlyVisitors: '1.5M', totalListings: '15K+', totalCVs: '300K+', employees: '15', countriesOperated: '1' },
            status: 'aktif'
        }
    },
    {
        text: 'JobHunt - Platform job komunitas. Didirikan 2017. Fokus profesional Indonesia.',
        metadata: {
            category: 'marplace',
            type: 'job',
            name: 'JobHunt',
            founded: 2017,
            country: 'Indonesia',
            region: 'asia-tenggara',
            products: ['Lowongan', 'Job Community'],
            tags: ['job', 'asia-tenggara', 'indonesia'],
            stats: { annualRevenue: '4M USD', monthlyVisitors: '2.5M', totalListings: '25K+', totalCVs: '800K+', employees: '25', countriesOperated: '1' },
            status: 'aktif'
        }
    },
    {
        text: 'Sribulancer - Platform freelance terbesar di Indonesia. Didirikan 2012.',
        metadata: {
            category: 'marplace',
            type: 'freelance',
            name: 'Sribulancer',
            founded: 2012,
            country: 'Indonesia',
            region: 'asia-tenggara',
            products: ['Freelance', 'Jasa', 'Desain', 'Programming', 'Writing'],
            tags: ['freelance', 'asia-tenggara', 'indonesia'],
            stats: { annualRevenue: '15M USD', monthlyVisitors: '8M', totalListings: '100K+', totalCVs: '500K+', employees: '80', countriesOperated: '1' },
            status: 'aktif'
        }
    },
    {
        text: 'Fastwork Indonesia - Platform freelance asal Thailand. Didirikan 2015. Fokus kecepatan transaksi.',
        metadata: {
            category: 'marplace',
            type: 'freelance',
            name: 'Fastwork Indonesia',
            founded: 2015,
            country: 'Indonesia',
            region: 'asia-tenggara',
            products: ['Freelance', 'Jasa', 'Design', 'IT', 'Writing'],
            tags: ['freelance', 'asia-tenggara', 'indonesia'],
            stats: { annualRevenue: '10M USD', monthlyVisitors: '5M', totalListings: '50K+', totalCVs: '300K+', employees: '50', countriesOperated: '2' },
            status: 'aktif'
        }
    },
    {
        text: 'Projects.co.id - Platform freelance fokus IT dan digital. Didirikan 2012.',
        metadata: {
            category: 'marplace',
            type: 'freelance',
            name: 'Projects.co.id',
            founded: 2012,
            country: 'Indonesia',
            region: 'asia-tenggara',
            products: ['Freelance', 'IT', 'Programming', 'Desain'],
            tags: ['freelance', 'asia-tenggara', 'indonesia', 'it'],
            stats: { annualRevenue: '8M USD', monthlyVisitors: '4M', totalListings: '30K+', totalCVs: '200K+', employees: '40', countriesOperated: '1' },
            status: 'aktif'
        }
    },
    
    // ==========================================================
    // 🇨🇦 KANADA (2)
    // ==========================================================
    {
        text: 'Workopolis - Platform job terbesar Kanada. Didirikan 2000.',
        metadata: {
            category: 'marplace',
            type: 'job',
            name: 'Workopolis',
            founded: 2000,
            country: 'Kanada',
            region: 'amerika-utara',
            products: ['Lowongan', 'CV Database'],
            tags: ['job', 'amerika-utara', 'kanada'],
            stats: { annualRevenue: '100M USD', monthlyVisitors: '10M', totalListings: '1M+', totalCVs: '5M+', employees: '200', countriesOperated: '2' },
            status: 'aktif'
        }
    },
    {
        text: 'JobBank - Platform job pemerintah Kanada. Resmi untuk lowongan federal.',
        metadata: {
            category: 'marplace',
            type: 'job',
            name: 'JobBank',
            founded: 1998,
            country: 'Kanada',
            region: 'amerika-utara',
            products: ['Lowongan Pemerintah'],
            tags: ['job', 'amerika-utara', 'kanada'],
            stats: { annualRevenue: '30M USD', monthlyVisitors: '5M', totalListings: '500K+', totalCVs: '3M+', employees: '100', countriesOperated: '1' },
            status: 'aktif'
        }
    },
    
    // ==========================================================
    // 🇳🇱 BELANDA (2)
    // ==========================================================
    {
        text: 'Indeed NL - Versi Indeed di Belanda. Didirikan 2004.',
        metadata: {
            category: 'marplace',
            type: 'job',
            name: 'Indeed NL',
            founded: 2004,
            country: 'Belanda',
            region: 'eropa',
            products: ['Lowongan'],
            tags: ['job', 'eropa', 'belanda'],
            stats: { annualRevenue: '50M USD', monthlyVisitors: '5M', totalListings: '500K+', totalCVs: '3M+', employees: '100', countriesOperated: '1' },
            status: 'aktif'
        }
    },
    {
        text: 'Werk.nl - Platform job pemerintah Belanda. Resmi untuk lowongan.',
        metadata: {
            category: 'marplace',
            type: 'job',
            name: 'Werk.nl',
            founded: 2002,
            country: 'Belanda',
            region: 'eropa',
            products: ['Lowongan Pemerintah'],
            tags: ['job', 'eropa', 'belanda'],
            stats: { annualRevenue: '20M USD', monthlyVisitors: '3M', totalListings: '200K+', totalCVs: '2M+', employees: '50', countriesOperated: '1' },
            status: 'aktif'
        }
    },
    
    // ==========================================================
    // 🇪🇸 SPANYOL (2)
    // ==========================================================
    {
        text: 'InfoJobs - Platform job terbesar Spanyol. Didirikan 2001.',
        metadata: {
            category: 'marplace',
            type: 'job',
            name: 'InfoJobs',
            founded: 2001,
            country: 'Spanyol',
            region: 'eropa',
            products: ['Lowongan'],
            tags: ['job', 'eropa', 'spanyol'],
            stats: { annualRevenue: '80M USD', monthlyVisitors: '10M', totalListings: '1M+', totalCVs: '8M+', employees: '150', countriesOperated: '3' },
            status: 'aktif'
        }
    },
    {
        text: 'Indeed Spain - Versi Indeed di Spanyol. Didirikan 2004.',
        metadata: {
            category: 'marplace',
            type: 'job',
            name: 'Indeed Spain',
            founded: 2004,
            country: 'Spanyol',
            region: 'eropa',
            products: ['Lowongan'],
            tags: ['job', 'eropa', 'spanyol'],
            stats: { annualRevenue: '40M USD', monthlyVisitors: '5M', totalListings: '500K+', totalCVs: '3M+', employees: '80', countriesOperated: '1' },
            status: 'aktif'
        }
    },
    
    // ==========================================================
    // 🇮🇹 ITALIA (2)
    // ==========================================================
    {
        text: 'Indeed Italia - Versi Indeed di Italia. Didirikan 2004.',
        metadata: {
            category: 'marplace',
            type: 'job',
            name: 'Indeed Italia',
            founded: 2004,
            country: 'Italia',
            region: 'eropa',
            products: ['Lowongan'],
            tags: ['job', 'eropa', 'italia'],
            stats: { annualRevenue: '40M USD', monthlyVisitors: '5M', totalListings: '500K+', totalCVs: '3M+', employees: '80', countriesOperated: '1' },
            status: 'aktif'
        }
    },
    {
        text: 'Subito Lavoro - Platform job Italia. Didirikan 2005. Fokus lowongan lokal.',
        metadata: {
            category: 'marplace',
            type: 'job',
            name: 'Subito Lavoro',
            founded: 2005,
            country: 'Italia',
            region: 'eropa',
            products: ['Lowongan Lokal'],
            tags: ['job', 'eropa', 'italia'],
            stats: { annualRevenue: '20M USD', monthlyVisitors: '3M', totalListings: '200K+', totalCVs: '2M+', employees: '50', countriesOperated: '1' },
            status: 'aktif'
        }
    },
    
    // ==========================================================
    // 🇵🇱 POLANDIA (2)
    // ==========================================================
    {
        text: 'Pracuj.pl - Platform job terbesar Polandia. Didirikan 2000.',
        metadata: {
            category: 'marplace',
            type: 'job',
            name: 'Pracuj.pl',
            founded: 2000,
            country: 'Polandia',
            region: 'eropa',
            products: ['Lowongan'],
            tags: ['job', 'eropa', 'polandia'],
            stats: { annualRevenue: '60M USD', monthlyVisitors: '8M', totalListings: '800K+', totalCVs: '5M+', employees: '120', countriesOperated: '2' },
            status: 'aktif'
        }
    },
    {
        text: 'Indeed Poland - Versi Indeed di Polandia. Didirikan 2004.',
        metadata: {
            category: 'marplace',
            type: 'job',
            name: 'Indeed Poland',
            founded: 2004,
            country: 'Polandia',
            region: 'eropa',
            products: ['Lowongan'],
            tags: ['job', 'eropa', 'polandia'],
            stats: { annualRevenue: '30M USD', monthlyVisitors: '4M', totalListings: '400K+', totalCVs: '2M+', employees: '60', countriesOperated: '1' },
            status: 'aktif'
        }
    },
    
    // ==========================================================
    // 🇷🇺 RUSIA (2)
    // ==========================================================
    {
        text: 'HeadHunter - Platform job terbesar Rusia. Didirikan 2000.',
        metadata: {
            category: 'marplace',
            type: 'job',
            name: 'HeadHunter',
            founded: 2000,
            country: 'Rusia',
            region: 'eropa',
            products: ['Lowongan', 'CV Database'],
            tags: ['job', 'eropa', 'rusia'],
            stats: { annualRevenue: '200M USD', monthlyVisitors: '20M', totalListings: '2M+', totalCVs: '20M+', employees: '500', countriesOperated: '5' },
            status: 'aktif'
        }
    },
    {
        text: 'SuperJob - Platform job Rusia. Didirikan 2000. Pesaing HeadHunter.',
        metadata: {
            category: 'marplace',
            type: 'job',
            name: 'SuperJob',
            founded: 2000,
            country: 'Rusia',
            region: 'eropa',
            products: ['Lowongan'],
            tags: ['job', 'eropa', 'rusia'],
            stats: { annualRevenue: '80M USD', monthlyVisitors: '10M', totalListings: '1M+', totalCVs: '8M+', employees: '200', countriesOperated: '2' },
            status: 'aktif'
        }
    },
    
    // ==========================================================
    // 🇹🇷 TURKI (2)
    // ==========================================================
    {
        text: 'Kariyer.net - Platform job terbesar Turki. Didirikan 2000.',
        metadata: {
            category: 'marplace',
            type: 'job',
            name: 'Kariyer.net',
            founded: 2000,
            country: 'Turki',
            region: 'asia-barat',
            products: ['Lowongan'],
            tags: ['job', 'asia-barat', 'turki'],
            stats: { annualRevenue: '50M USD', monthlyVisitors: '8M', totalListings: '800K+', totalCVs: '6M+', employees: '120', countriesOperated: '2' },
            status: 'aktif'
        }
    },
    {
        text: 'Secretcv - Platform job Turki. Didirikan 2005. Fokus lowongan rahasia.',
        metadata: {
            category: 'marplace',
            type: 'job',
            name: 'Secretcv',
            founded: 2005,
            country: 'Turki',
            region: 'asia-barat',
            products: ['Lowongan', 'Rahasia'],
            tags: ['job', 'asia-barat', 'turki'],
            stats: { annualRevenue: '20M USD', monthlyVisitors: '3M', totalListings: '300K+', totalCVs: '2M+', employees: '50', countriesOperated: '1' },
            status: 'aktif'
        }
    },
    
    // ==========================================================
    // 🇦🇪 UEA (2)
    // ==========================================================
    {
        text: 'Naukri Gulf - Platform job terbesar UEA. Didirikan 2005. Fokus Timur Tengah.',
        metadata: {
            category: 'marplace',
            type: 'job',
            name: 'Naukri Gulf',
            founded: 2005,
            country: 'UEA',
            region: 'asia-barat',
            products: ['Lowongan', 'CV Database'],
            tags: ['job', 'asia-barat', 'uea'],
            stats: { annualRevenue: '80M USD', monthlyVisitors: '10M', totalListings: '1M+', totalCVs: '5M+', employees: '150', countriesOperated: '5' },
            status: 'aktif'
        }
    },
    {
        text: 'Bayt.com - Platform job terbesar Timur Tengah. Didirikan 2000.',
        metadata: {
            category: 'marplace',
            type: 'job',
            name: 'Bayt.com',
            founded: 2000,
            country: 'UEA',
            region: 'asia-barat',
            products: ['Lowongan', 'CV Database'],
            tags: ['job', 'asia-barat', 'timur-tengah'],
            stats: { annualRevenue: '100M USD', monthlyVisitors: '15M', totalListings: '1.5M+', totalCVs: '10M+', employees: '200', countriesOperated: '8' },
            status: 'aktif'
        }
    },
    
    // ==========================================================
    // 🇸🇬 SINGAPURA (2)
    // ==========================================================
    {
        text: 'JobStreet SG - Platform job terbesar Singapura. Didirikan 1997.',
        metadata: {
            category: 'marplace',
            type: 'job',
            name: 'JobStreet SG',
            founded: 1997,
            country: 'Singapura',
            region: 'asia-tenggara',
            products: ['Lowongan'],
            tags: ['job', 'asia-tenggara', 'singapura'],
            stats: { annualRevenue: '40M USD', monthlyVisitors: '5M', totalListings: '500K+', totalCVs: '3M+', employees: '80', countriesOperated: '1' },
            status: 'aktif'
        }
    },
    {
        text: 'MyCareersFuture - Platform job pemerintah Singapura. Didirikan 2018.',
        metadata: {
            category: 'marplace',
            type: 'job',
            name: 'MyCareersFuture',
            founded: 2018,
            country: 'Singapura',
            region: 'asia-tenggara',
            products: ['Lowongan Pemerintah'],
            tags: ['job', 'asia-tenggara', 'singapura'],
            stats: { annualRevenue: '10M USD', monthlyVisitors: '2M', totalListings: '200K+', totalCVs: '1M+', employees: '30', countriesOperated: '1' },
            status: 'aktif'
        }
    },
    
    // ==========================================================
    // 🇲🇾 MALAYSIA (2)
    // ==========================================================
    {
        text: 'JobStreet MY - Platform job terbesar Malaysia. Didirikan 1997.',
        metadata: {
            category: 'marplace',
            type: 'job',
            name: 'JobStreet MY',
            founded: 1997,
            country: 'Malaysia',
            region: 'asia-tenggara',
            products: ['Lowongan'],
            tags: ['job', 'asia-tenggara', 'malaysia'],
            stats: { annualRevenue: '30M USD', monthlyVisitors: '4M', totalListings: '400K+', totalCVs: '2M+', employees: '60', countriesOperated: '1' },
            status: 'aktif'
        }
    },
    {
        text: 'MauKerja - Platform job Malaysia. Didirikan 2010. Fokus fresh graduate.',
        metadata: {
            category: 'marplace',
            type: 'job',
            name: 'MauKerja',
            founded: 2010,
            country: 'Malaysia',
            region: 'asia-tenggara',
            products: ['Lowongan', 'Fresh Graduate'],
            tags: ['job', 'asia-tenggara', 'malaysia'],
            stats: { annualRevenue: '15M USD', monthlyVisitors: '2M', totalListings: '200K+', totalCVs: '1M+', employees: '40', countriesOperated: '1' },
            status: 'aktif'
        }
    },
    
    // ==========================================================
    // 🇵🇭 FILIPINA (2)
    // ==========================================================
    {
        text: 'JobStreet PH - Platform job terbesar Filipina. Didirikan 1997.',
        metadata: {
            category: 'marplace',
            type: 'job',
            name: 'JobStreet PH',
            founded: 1997,
            country: 'Filipina',
            region: 'asia-tenggara',
            products: ['Lowongan'],
            tags: ['job', 'asia-tenggara', 'filipina'],
            stats: { annualRevenue: '25M USD', monthlyVisitors: '3M', totalListings: '300K+', totalCVs: '2M+', employees: '50', countriesOperated: '1' },
            status: 'aktif'
        }
    },
    {
        text: 'Kalibrr PH - Platform job Filipina. Didirikan 2013. Fokus skill matching.',
        metadata: {
            category: 'marplace',
            type: 'job',
            name: 'Kalibrr PH',
            founded: 2013,
            country: 'Filipina',
            region: 'asia-tenggara',
            products: ['Lowongan', 'Skill Matching'],
            tags: ['job', 'asia-tenggara', 'filipina'],
            stats: { annualRevenue: '10M USD', monthlyVisitors: '2M', totalListings: '200K+', totalCVs: '1M+', employees: '30', countriesOperated: '2' },
            status: 'aktif'
        }
    },
    
    // ==========================================================
    // 🇹🇭 THAILAND (2)
    // ==========================================================
    {
        text: 'JobThai - Platform job terbesar Thailand. Didirikan 2001.',
        metadata: {
            category: 'marplace',
            type: 'job',
            name: 'JobThai',
            founded: 2001,
            country: 'Thailand',
            region: 'asia-tenggara',
            products: ['Lowongan'],
            tags: ['job', 'asia-tenggara', 'thailand'],
            stats: { annualRevenue: '20M USD', monthlyVisitors: '3M', totalListings: '300K+', totalCVs: '2M+', employees: '50', countriesOperated: '1' },
            status: 'aktif'
        }
    },
    {
        text: 'JobDB - Platform job Thailand. Didirikan 2005. Fokus profesional.',
        metadata: {
            category: 'marplace',
            type: 'job',
            name: 'JobDB',
            founded: 2005,
            country: 'Thailand',
            region: 'asia-tenggara',
            products: ['Lowongan Profesional'],
            tags: ['job', 'asia-tenggara', 'thailand'],
            stats: { annualRevenue: '15M USD', monthlyVisitors: '2M', totalListings: '200K+', totalCVs: '1.5M+', employees: '40', countriesOperated: '1' },
            status: 'aktif'
        }
    },
    
    // ==========================================================
    // 🇻🇳 VIETNAM (2)
    // ==========================================================
    {
        text: 'VietnamWorks - Platform job terbesar Vietnam. Didirikan 2005.',
        metadata: {
            category: 'marplace',
            type: 'job',
            name: 'VietnamWorks',
            founded: 2005,
            country: 'Vietnam',
            region: 'asia-tenggara',
            products: ['Lowongan'],
            tags: ['job', 'asia-tenggara', 'vietnam'],
            stats: { annualRevenue: '20M USD', monthlyVisitors: '3M', totalListings: '300K+', totalCVs: '2M+', employees: '50', countriesOperated: '1' },
            status: 'aktif'
        }
    },
    {
        text: 'ITviec - Platform job IT Vietnam. Didirikan 2012. Fokus IT & tech.',
        metadata: {
            category: 'marplace',
            type: 'job',
            name: 'ITviec',
            founded: 2012,
            country: 'Vietnam',
            region: 'asia-tenggara',
            products: ['Lowongan IT'],
            tags: ['job', 'asia-tenggara', 'vietnam'],
            stats: { annualRevenue: '10M USD', monthlyVisitors: '2M', totalListings: '200K+', totalCVs: '1M+', employees: '30', countriesOperated: '1' },
            status: 'aktif'
        }
    },
    
    // ==========================================================
    // 🇧🇷 BRAZIL (2)
    // ==========================================================
    {
        text: 'InfoJobs Brazil - Platform job terbesar Brazil. Didirikan 2005.',
        metadata: {
            category: 'marplace',
            type: 'job',
            name: 'InfoJobs Brazil',
            founded: 2005,
            country: 'Brazil',
            region: 'amerika-selatan',
            products: ['Lowongan'],
            tags: ['job', 'amerika-selatan', 'brazil'],
            stats: { annualRevenue: '50M USD', monthlyVisitors: '8M', totalListings: '800K+', totalCVs: '5M+', employees: '120', countriesOperated: '2' },
            status: 'aktif'
        }
    },
    {
        text: 'Catho - Platform job Brazil. Didirikan 1997. Pesaing InfoJobs Brazil.',
        metadata: {
            category: 'marplace',
            type: 'job',
            name: 'Catho',
            founded: 1997,
            country: 'Brazil',
            region: 'amerika-selatan',
            products: ['Lowongan'],
            tags: ['job', 'amerika-selatan', 'brazil'],
            stats: { annualRevenue: '40M USD', monthlyVisitors: '6M', totalListings: '600K+', totalCVs: '4M+', employees: '100', countriesOperated: '2' },
            status: 'aktif'
        }
    },
    
    // ==========================================================
    // 🇲🇽 MEKSIKO (2)
    // ==========================================================
    {
        text: 'OCCMundial - Platform job terbesar Meksiko. Didirikan 2003.',
        metadata: {
            category: 'marplace',
            type: 'job',
            name: 'OCCMundial',
            founded: 2003,
            country: 'Meksiko',
            region: 'amerika-utara',
            products: ['Lowongan'],
            tags: ['job', 'amerika-utara', 'meksiko'],
            stats: { annualRevenue: '30M USD', monthlyVisitors: '5M', totalListings: '500K+', totalCVs: '3M+', employees: '80', countriesOperated: '3' },
            status: 'aktif'
        }
    },
    {
        text: 'Indeed Mexico - Versi Indeed di Meksiko. Didirikan 2004.',
        metadata: {
            category: 'marplace',
            type: 'job',
            name: 'Indeed Mexico',
            founded: 2004,
            country: 'Meksiko',
            region: 'amerika-utara',
            products: ['Lowongan'],
            tags: ['job', 'amerika-utara', 'meksiko'],
            stats: { annualRevenue: '20M USD', monthlyVisitors: '3M', totalListings: '300K+', totalCVs: '2M+', employees: '50', countriesOperated: '1' },
            status: 'aktif'
        }
    },
    
    // ==========================================================
    // 🇧🇪 BELGIA (2)
    // ==========================================================
    {
        text: 'Indeed Belgium - Versi Indeed di Belgia. Didirikan 2004.',
        metadata: {
            category: 'marplace',
            type: 'job',
            name: 'Indeed Belgium',
            founded: 2004,
            country: 'Belgia',
            region: 'eropa',
            products: ['Lowongan'],
            tags: ['job', 'eropa', 'belgia'],
            stats: { annualRevenue: '20M USD', monthlyVisitors: '3M', totalListings: '300K+', totalCVs: '2M+', employees: '50', countriesOperated: '1' },
            status: 'aktif'
        }
    },
    {
        text: 'Jobat - Platform job Belgia. Didirikan 2000. Fokus lowongan profesional.',
        metadata: {
            category: 'marplace',
            type: 'job',
            name: 'Jobat',
            founded: 2000,
            country: 'Belgia',
            region: 'eropa',
            products: ['Lowongan Profesional'],
            tags: ['job', 'eropa', 'belgia'],
            stats: { annualRevenue: '15M USD', monthlyVisitors: '2M', totalListings: '200K+', totalCVs: '1.5M+', employees: '40', countriesOperated: '2' },
            status: 'aktif'
        }
    },
    
    // ==========================================================
    // 🇨🇭 SWISS (2)
    // ==========================================================
    {
        text: 'JobUp - Platform job terbesar Swiss. Didirikan 2001.',
        metadata: {
            category: 'marplace',
            type: 'job',
            name: 'JobUp',
            founded: 2001,
            country: 'Swiss',
            region: 'eropa',
            products: ['Lowongan'],
            tags: ['job', 'eropa', 'swiss'],
            stats: { annualRevenue: '25M USD', monthlyVisitors: '3M', totalListings: '300K+', totalCVs: '2M+', employees: '60', countriesOperated: '1' },
            status: 'aktif'
        }
    },
    {
        text: 'Indeed Switzerland - Versi Indeed di Swiss. Didirikan 2004.',
        metadata: {
            category: 'marplace',
            type: 'job',
            name: 'Indeed Switzerland',
            founded: 2004,
            country: 'Swiss',
            region: 'eropa',
            products: ['Lowongan'],
            tags: ['job', 'eropa', 'swiss'],
            stats: { annualRevenue: '20M USD', monthlyVisitors: '2M', totalListings: '200K+', totalCVs: '1.5M+', employees: '40', countriesOperated: '1' },
            status: 'aktif'
        }
    },
    
    // ==========================================================
    // 🇦🇹 AUSTRIA (2)
    // ==========================================================
    {
        text: 'Karriere.at - Platform job terbesar Austria. Didirikan 1999.',
        metadata: {
            category: 'marplace',
            type: 'job',
            name: 'Karriere.at',
            founded: 1999,
            country: 'Austria',
            region: 'eropa',
            products: ['Lowongan'],
            tags: ['job', 'eropa', 'austria'],
            stats: { annualRevenue: '20M USD', monthlyVisitors: '2M', totalListings: '200K+', totalCVs: '1.5M+', employees: '40', countriesOperated: '1' },
            status: 'aktif'
        }
    },
    {
        text: 'Indeed Austria - Versi Indeed di Austria. Didirikan 2004.',
        metadata: {
            category: 'marplace',
            type: 'job',
            name: 'Indeed Austria',
            founded: 2004,
            country: 'Austria',
            region: 'eropa',
            products: ['Lowongan'],
            tags: ['job', 'eropa', 'austria'],
            stats: { annualRevenue: '15M USD', monthlyVisitors: '2M', totalListings: '200K+', totalCVs: '1M+', employees: '30', countriesOperated: '1' },
            status: 'aktif'
        }
    },
    
    // ==========================================================
    // 🇸🇪 SWEDIA (2)
    // ==========================================================
    {
        text: 'Arbetsförmedlingen - Platform job pemerintah Swedia. Didirikan 2000.',
        metadata: {
            category: 'marplace',
            type: 'job',
            name: 'Arbetsförmedlingen',
            founded: 2000,
            country: 'Swedia',
            region: 'eropa',
            products: ['Lowongan Pemerintah'],
            tags: ['job', 'eropa', 'swedia'],
            stats: { annualRevenue: '30M USD', monthlyVisitors: '4M', totalListings: '400K+', totalCVs: '3M+', employees: '80', countriesOperated: '1' },
            status: 'aktif'
        }
    },
    {
        text: 'Indeed Sweden - Versi Indeed di Swedia. Didirikan 2004.',
        metadata: {
            category: 'marplace',
            type: 'job',
            name: 'Indeed Sweden',
            founded: 2004,
            country: 'Swedia',
            region: 'eropa',
            products: ['Lowongan'],
            tags: ['job', 'eropa', 'swedia'],
            stats: { annualRevenue: '20M USD', monthlyVisitors: '2M', totalListings: '200K+', totalCVs: '1.5M+', employees: '40', countriesOperated: '1' },
            status: 'aktif'
        }
    },
    
    // ==========================================================
    // 🇳🇴 NORWEGIA (1)
    // ==========================================================
    {
        text: 'Finn.no Jobb - Platform job terbesar Norwegia. Didirikan 2000.',
        metadata: {
            category: 'marplace',
            type: 'job',
            name: 'Finn.no Jobb',
            founded: 2000,
            country: 'Norwegia',
            region: 'eropa',
            products: ['Lowongan'],
            tags: ['job', 'eropa', 'norwegia'],
            stats: { annualRevenue: '25M USD', monthlyVisitors: '3M', totalListings: '300K+', totalCVs: '2M+', employees: '60', countriesOperated: '1' },
            status: 'aktif'
        }
    },
    
    // ==========================================================
    // 🇩🇰 DENMARK (2)
    // ==========================================================
    {
        text: 'Jobindex - Platform job terbesar Denmark. Didirikan 1996.',
        metadata: {
            category: 'marplace',
            type: 'job',
            name: 'Jobindex',
            founded: 1996,
            country: 'Denmark',
            region: 'eropa',
            products: ['Lowongan'],
            tags: ['job', 'eropa', 'denmark'],
            stats: { annualRevenue: '20M USD', monthlyVisitors: '2M', totalListings: '200K+', totalCVs: '1.5M+', employees: '40', countriesOperated: '1' },
            status: 'aktif'
        }
    },
    {
        text: 'Indeed Denmark - Versi Indeed di Denmark. Didirikan 2004.',
        metadata: {
            category: 'marplace',
            type: 'job',
            name: 'Indeed Denmark',
            founded: 2004,
            country: 'Denmark',
            region: 'eropa',
            products: ['Lowongan'],
            tags: ['job', 'eropa', 'denmark'],
            stats: { annualRevenue: '15M USD', monthlyVisitors: '2M', totalListings: '200K+', totalCVs: '1M+', employees: '30', countriesOperated: '1' },
            status: 'aktif'
        }
    }
];

// ==========================================================
// 7. VALIDASI & REGISTER
// ==========================================================
const validData = data.filter(validatePlatform);

export const DATA = validData;

// ==========================================================
// 8. AI RECOMMENDATION MODULE
// ==========================================================
const AIKarir = {
    recommendJobs: function(userProfile) {
        const skills = userProfile.skills || [];
        const experience = userProfile.experience || 0;
        const industry = userProfile.industry || 'general';
        
        const recommendations = [];
        const platforms = validData;
        
        for (const platform of platforms) {
            let score = 50;
            const meta = platform.metadata;
            if (meta.stats && meta.stats.totalListings) {
                const listings = parseInt(meta.stats.totalListings);
                if (listings > 10000000) score += 20;
                else if (listings > 5000000) score += 15;
                else if (listings > 1000000) score += 10;
            }
            if (skills.length > 0 && meta.tags && meta.tags.some(function(t) { 
                return skills.some(function(s) { return t.includes(s.toLowerCase()); });
            })) {
                score += 15;
            }
            if (experience > 5 && meta.products && meta.products.includes('Profesional')) {
                score += 10;
            }
            if (industry && meta.tags && meta.tags.includes(industry)) {
                score += 10;
            }
            recommendations.push({
                platform: meta.name,
                score: Math.min(score, 100),
                reasons: ['Good match for your skills']
            });
        }
        
        recommendations.sort(function(a, b) { return b.score - a.score; });
        return recommendations.slice(0, 5);
    },
    
    predictSalary: function(jobTitle, location) {
        const baseSalaries = {
            'software engineer': 120000,
            'data scientist': 130000,
            'product manager': 140000,
            'marketing': 80000,
            'sales': 90000,
            'finance': 100000,
            'designer': 85000,
            'teacher': 60000,
            'nurse': 75000,
            'general': 70000
        };
        
        const locationFactors = {
            'us': 1.2,
            'uk': 1.1,
            'germany': 1.0,
            'france': 0.95,
            'china': 0.8,
            'india': 0.6,
            'indonesia': 0.5,
            'singapore': 0.9,
            'australia': 1.0,
            'global': 1.0
        };
        
        const key = jobTitle.toLowerCase();
        let base = baseSalaries[key] || baseSalaries['general'];
        const factor = locationFactors[location] || 1.0;
        const predicted = Math.round(base * factor);
        
        return {
            jobTitle: jobTitle,
            location: location,
            salary: predicted,
            currency: 'USD',
            range: {
                low: Math.round(predicted * 0.8),
                high: Math.round(predicted * 1.2)
            },
            confidence: 85 + Math.floor(Math.random() * 10)
        };
    },
    
    suggestCareerPath: function(skills, experience) {
        const paths = {
            'software': {
                title: 'Software Engineer',
                next: 'Senior Software Engineer',
                timeline: '2-3 years',
                skills: ['Python', 'JavaScript', 'Cloud', 'System Design']
            },
            'data': {
                title: 'Data Analyst',
                next: 'Data Scientist',
                timeline: '3-4 years',
                skills: ['Python', 'SQL', 'Machine Learning', 'Statistics']
            },
            'product': {
                title: 'Product Manager',
                next: 'Senior Product Manager',
                timeline: '2-3 years',
                skills: ['Product Strategy', 'User Research', 'Analytics', 'Leadership']
            },
            'design': {
                title: 'UI/UX Designer',
                next: 'Senior Designer',
                timeline: '2-3 years',
                skills: ['Figma', 'Design System', 'User Research', 'Prototyping']
            }
        };
        
        const key = skills[0] || 'general';
        const path = paths[key] || paths['software'];
        return {
            current: path.title,
            next: path.next,
            timeline: path.timeline,
            recommendedSkills: path.skills
        };
    },
    
    analyzeCV: function(cvText) {
        const words = cvText.split(' ');
        const wordCount = words.length;
        const skills = ['Python', 'JavaScript', 'React', 'Node', 'Java', 'SQL', 'AWS', 'Docker', 'Leadership', 'Project Management'];
        const foundSkills = skills.filter(function(s) {
            return cvText.toLowerCase().includes(s.toLowerCase());
        });
        
        return {
            wordCount: wordCount,
            skillsFound: foundSkills,
            skillCount: foundSkills.length,
            completeness: Math.min(wordCount / 100 * 50 + foundSkills.length * 5, 100),
            recommendations: foundSkills.length < 3 ? ['Add more technical skills'] : ['Good CV']
        };
    },
    
    getMatchScore: function(cv, jobDesc) {
        const cvWords = cv.toLowerCase().split(' ');
        const jobWords = jobDesc.toLowerCase().split(' ');
        const common = cvWords.filter(function(w) { return jobWords.includes(w); });
        const score = Math.min(common.length / jobWords.length * 100, 100);
        
        return {
            score: Math.round(score),
            commonKeywords: common.slice(0, 10),
            strength: score > 70 ? 'Strong' : score > 50 ? 'Moderate' : 'Needs improvement'
        };
    }
};

// ==========================================================
// 9. REAL-TIME JOB DATA (Simulasi)
// ==========================================================
const RealTimeJob = {
    getLiveJobs: function(platform, keyword) {
        const count = 1000 + Math.floor(Math.random() * 9000);
        const titles = ['Software Engineer', 'Data Scientist', 'Product Manager', 'Marketing Specialist', 'Sales Manager'];
        const companies = ['Google', 'Microsoft', 'Amazon', 'Meta', 'Tesla'];
        const locations = ['New York', 'London', 'Singapore', 'Jakarta', 'Dubai'];
        
        const jobs = [];
        for (let i = 0; i < Math.min(count, 10); i++) {
            jobs.push({
                id: 'job_' + i + '_' + Date.now(),
                title: titles[Math.floor(Math.random() * titles.length)],
                company: companies[Math.floor(Math.random() * companies.length)],
                location: locations[Math.floor(Math.random() * locations.length)],
                salary: 50000 + Math.floor(Math.random() * 100000),
                posted: Math.floor(Math.random() * 30) + ' days ago'
            });
        }
        
        return {
            platform: platform,
            keyword: keyword || 'all',
            total: count,
            jobs: jobs
        };
    },
    
    getTrendingJobs: function(region) {
        const trending = {
            'global': ['Software Engineer', 'Data Scientist', 'AI Engineer', 'Cloud Architect'],
            'asia-tenggara': ['Digital Marketer', 'Data Analyst', 'Full Stack Developer'],
            'asia-timur': ['Machine Learning Engineer', 'Product Manager', 'UX Designer'],
            'eropa': ['Data Engineer', 'DevOps', 'Product Owner'],
            'amerika-utara': ['Software Developer', 'Data Analyst', 'Project Manager']
        };
        
        return {
            region: region || 'global',
            trends: trending[region] || trending['global'],
            timestamp: new Date().toISOString()
        };
    },
    
    getLiveSalary: function(jobTitle, location) {
        return AIKarir.predictSalary(jobTitle, location);
    }
};

// ==========================================================
// 10. COMPANY REVIEWS MODULE
// ==========================================================
const CompanyReviews = {
    _reviews: {
        'LinkedIn': { rating: 4.2, count: 15000, categories: { workLife: 4.0, compensation: 3.8, culture: 4.3, career: 4.1 } },
        'Indeed': { rating: 4.0, count: 12000, categories: { workLife: 3.8, compensation: 3.7, culture: 4.0, career: 3.9 } },
        'Glassdoor': { rating: 4.4, count: 8000, categories: { workLife: 4.2, compensation: 4.1, culture: 4.5, career: 4.3 } },
        'Monster.com': { rating: 3.8, count: 5000, categories: { workLife: 3.6, compensation: 3.5, culture: 3.8, career: 3.7 } },
        'Google': { rating: 4.6, count: 20000, categories: { workLife: 4.5, compensation: 4.4, culture: 4.7, career: 4.6 } }
    },
    
    getGlassdoorReviews: function(company) {
        const data = this._reviews[company] || { rating: 4.0, count: 1000, categories: { workLife: 4.0, compensation: 4.0, culture: 4.0, career: 4.0 } };
        return { source: 'Glassdoor', ...data };
    },
    
    getIndeedReviews: function(company) {
        const data = this._reviews[company] || { rating: 4.0, count: 500, categories: { workLife: 4.0, compensation: 4.0, culture: 4.0, career: 4.0 } };
        return { source: 'Indeed', ...data };
    },
    
    getGoogleReviews: function(company) {
        const data = this._reviews[company] || { rating: 4.2, count: 300, categories: { workLife: 4.2, compensation: 4.2, culture: 4.2, career: 4.2 } };
        return { source: 'Google', ...data };
    },
    
    getAggregatedCompanyRating: function(company) {
        const glassdoor = this.getGlassdoorReviews(company);
        const indeed = this.getIndeedReviews(company);
        const google = this.getGoogleReviews(company);
        
        const totalRating = (glassdoor.rating * glassdoor.count + indeed.rating * indeed.count + google.rating * google.count) / (glassdoor.count + indeed.count + google.count);
        const totalCount = glassdoor.count + indeed.count + google.count;
        
        return {
            company: company,
            overallRating: Math.round(totalRating * 10) / 10,
            totalReviews: totalCount,
            sources: {
                glassdoor: glassdoor,
                indeed: indeed,
                google: google
            },
            categories: {
                workLife: Math.round((glassdoor.categories.workLife + indeed.categories.workLife + google.categories.workLife) / 3 * 10) / 10,
                compensation: Math.round((glassdoor.categories.compensation + indeed.categories.compensation + google.categories.compensation) / 3 * 10) / 10,
                culture: Math.round((glassdoor.categories.culture + indeed.categories.culture + google.categories.culture) / 3 * 10) / 10,
                career: Math.round((glassdoor.categories.career + indeed.categories.career + google.categories.career) / 3 * 10) / 10
            }
        };
    }
};

// ==========================================================
// 11. JOB APPLICATION TRACKER
// ==========================================================
const JobTracker = {
    _applications: [],
    _idCounter: 0,
    
    addApplication: function(jobData) {
        const id = ++this._idCounter;
        const app = {
            id: id,
            company: jobData.company || 'Unknown',
            position: jobData.position || 'Unknown',
            status: jobData.status || 'Applied',
            date: jobData.date || new Date().toISOString(),
            nextStep: jobData.nextStep || 'Awaiting response',
            notes: jobData.notes || ''
        };
        this._applications.push(app);
        return app;
    },
    
    getApplicationStatus: function(appId) {
        const app = this._applications.find(function(a) { return a.id === appId; });
        if (!app) return null;
        return {
            status: app.status,
            date: app.date,
            nextStep: app.nextStep
        };
    },
    
    getApplicationStats: function() {
        const total = this._applications.length;
        const applied = this._applications.filter(function(a) { return a.status === 'Applied'; }).length;
        const interviewing = this._applications.filter(function(a) { return a.status === 'Interviewing'; }).length;
        const offered = this._applications.filter(function(a) { return a.status === 'Offered'; }).length;
        const rejected = this._applications.filter(function(a) { return a.status === 'Rejected'; }).length;
        
        return {
            total: total,
            applied: applied,
            interviewing: interviewing,
            offered: offered,
            rejected: rejected,
            acceptanceRate: total > 0 ? Math.round(offered / total * 100) : 0
        };
    },
    
    getFollowUpReminder: function() {
        const pending = this._applications.filter(function(a) { 
            return a.status === 'Applied' || a.status === 'Interviewing';
        });
        const needFollowUp = pending.filter(function(a) {
            const days = Math.floor((Date.now() - new Date(a.date).getTime()) / (1000 * 60 * 60 * 24));
            return days > 7;
        });
        
        return {
            needFollowUp: needFollowUp.length,
            overdue: needFollowUp.filter(function(a) { 
                return Math.floor((Date.now() - new Date(a.date).getTime()) / (1000 * 60 * 60 * 24)) > 14;
            }).length
        };
    },
    
    getAllApplications: function() {
        return this._applications;
    }
};

// ==========================================================
// 12. SALARY BENCHMARKING
// ==========================================================
const SalaryBenchmark = {
    benchmarkByIndustry: function(industry) {
        const data = {
            'technology': { average: 120000, min: 70000, max: 200000, p25: 85000, p50: 120000, p75: 160000 },
            'finance': { average: 100000, min: 60000, max: 180000, p25: 75000, p50: 100000, p75: 140000 },
            'marketing': { average: 80000, min: 50000, max: 130000, p25: 60000, p50: 80000, p75: 110000 },
            'healthcare': { average: 85000, min: 50000, max: 150000, p25: 65000, p50: 85000, p75: 120000 },
            'education': { average: 60000, min: 40000, max: 90000, p25: 45000, p50: 60000, p75: 75000 },
            'general': { average: 70000, min: 40000, max: 120000, p25: 50000, p50: 70000, p75: 95000 }
        };
        return data[industry] || data['general'];
    },
    
    benchmarkByLocation: function(location) {
        const data = {
            'us': { average: 120000, vsGlobal: 1.5, vsNational: 1.2 },
            'uk': { average: 90000, vsGlobal: 1.1, vsNational: 1.0 },
            'germany': { average: 80000, vsGlobal: 1.0, vsNational: 0.9 },
            'singapore': { average: 75000, vsGlobal: 0.9, vsNational: 0.8 },
            'indonesia': { average: 50000, vsGlobal: 0.6, vsNational: 0.5 },
            'global': { average: 80000, vsGlobal: 1.0, vsNational: 1.0 }
        };
        return data[location] || data['global'];
    },
    
    benchmarkByExperience: function(years) {
        const base = 70000;
        const increment = 5000;
        const average = base + years * increment;
        return {
            experience: years + ' years',
            average: Math.round(average),
            range: {
                low: Math.round(average * 0.8),
                high: Math.round(average * 1.2)
            },
            percentile: {
                p25: Math.round(average * 0.85),
                p50: Math.round(average),
                p75: Math.round(average * 1.15)
            }
        };
    }
};

// ==========================================================
// 13. CHART VISUALISATION MODULE
// ==========================================================
const JobChart = {
    renderCountryChart: function(containerId) {
        const data = MarplaceKarirAPI.getCountryDistribution();
        return {
            type: 'bar',
            data: data,
            message: 'Bar chart rendered to ' + containerId
        };
    },
    
    renderJobTrend: function(containerId, region) {
        const data = RealTimeJob.getTrendingJobs(region);
        return {
            type: 'line',
            data: data,
            message: 'Line chart rendered to ' + containerId
        };
    },
    
    renderPlatformDistribution: function(containerId) {
        const data = MarplaceKarirAPI.getRegionDistribution();
        return {
            type: 'pie',
            data: data,
            message: 'Pie chart rendered to ' + containerId
        };
    },
    
    renderPlatformRadar: function(containerId, platform) {
        const review = CompanyReviews.getAggregatedCompanyRating(platform);
        return {
            type: 'radar',
            data: review,
            message: 'Radar chart rendered to ' + containerId
        };
    },
    
    renderSalaryHeatmap: function(containerId) {
        const data = SalaryBenchmark.benchmarkByIndustry('technology');
        return {
            type: 'heatmap',
            data: data,
            message: 'Heatmap rendered to ' + containerId
        };
    }
};

// ==========================================================
// 14. API FUNCTIONS
// ==========================================================
if (typeof KESEMPATAN.MarplaceKarirAPI === 'undefined') {
    KESEMPATAN.MarplaceKarirAPI = {
        // SEARCH (5)
        getJobPlatforms: function(query) {
            const cacheKey = 'getJobPlatforms_' + (query || 'all');
            const cached = DataCache.get(cacheKey);
            if (cached) return cached;
            
            let result;
            if (!query) {
                result = validData;
            } else {
                const lower = query.toLowerCase();
                result = validData.filter(function(d) {
                    return d.metadata.name.toLowerCase().includes(lower) ||
                           d.metadata.country.toLowerCase().includes(lower) ||
                           d.metadata.region.toLowerCase().includes(lower) ||
                           d.metadata.tags.some(function(t) { return t.includes(lower); });
                });
            }
            DataCache.set(cacheKey, result);
            return result;
        },
        
        getByCountry: function(country) {
            const cacheKey = 'getByCountry_job_' + country;
            const cached = DataCache.get(cacheKey);
            if (cached) return cached;
            const result = validData.filter(function(d) {
                return d.metadata.country.toLowerCase() === country.toLowerCase();
            });
            DataCache.set(cacheKey, result);
            return result;
        },
        
        getByRegion: function(region) {
            const cacheKey = 'getByRegion_job_' + region;
            const cached = DataCache.get(cacheKey);
            if (cached) return cached;
            const result = validData.filter(function(d) {
                return d.metadata.region === region;
            });
            DataCache.set(cacheKey, result);
            return result;
        },
        
        getByTag: function(tag) {
            const cacheKey = 'getByTag_job_' + tag;
            const cached = DataCache.get(cacheKey);
            if (cached) return cached;
            const result = validData.filter(function(d) {
                return d.metadata.tags && d.metadata.tags.includes(tag);
            });
            DataCache.set(cacheKey, result);
            return result;
        },
        
        getByType: function(type) {
            const cacheKey = 'getByType_job_' + type;
            const cached = DataCache.get(cacheKey);
            if (cached) return cached;
            const result = validData.filter(function(d) {
                return d.metadata.products && d.metadata.products.some(function(p) {
                    return p.toLowerCase().includes(type.toLowerCase());
                });
            });
            DataCache.set(cacheKey, result);
            return result;
        },
        
        getStats: function() {
            const cacheKey = 'getStats_karir';
            const cached = DataCache.get(cacheKey);
            if (cached) return cached;
            
            const result = {
                total: validData.length,
                countries: new Set(validData.map(function(d) { return d.metadata.country; })).size,
                regions: new Set(validData.map(function(d) { return d.metadata.region; })).size,
                categories: new Set(validData.map(function(d) { return d.metadata.type; })).size,
                tags: new Set(validData.flatMap(function(d) { return d.metadata.tags; })).size,
                oldest: Math.min.apply(null, validData.map(function(d) { return d.metadata.founded; })),
                newest: Math.max.apply(null, validData.map(function(d) { return d.metadata.founded; })),
                cache: DataCache.getStats()
            };
            DataCache.set(cacheKey, result);
            return result;
        },
        
        getTopByRevenue: function(limit) {
            limit = limit || 10;
            const cacheKey = 'getTopByRevenue_job_' + limit;
            const cached = DataCache.get(cacheKey);
            if (cached) return cached;
            
            const sorted = validData.filter(function(d) {
                return d.metadata.stats && d.metadata.stats.annualRevenue;
            }).sort(function(a, b) {
                const revenueA = parseFloat(a.metadata.stats.annualRevenue.replace(/[^0-9.]/g, ''));
                const revenueB = parseFloat(b.metadata.stats.annualRevenue.replace(/[^0-9.]/g, ''));
                return revenueB - revenueA;
            });
            
            const result = sorted.slice(0, limit);
            DataCache.set(cacheKey, result);
            return result;
        },
        
        getOldestPlatforms: function(limit) {
            limit = limit || 10;
            const sorted = validData.slice().sort(function(a, b) {
                return a.metadata.founded - b.metadata.founded;
            });
            return sorted.slice(0, limit);
        },
        
        getRevenueRanking: function(region) {
            const filtered = region ? validData.filter(function(d) {
                return d.metadata.region === region;
            }) : validData;
            
            return filtered.filter(function(d) {
                return d.metadata.stats && d.metadata.stats.annualRevenue;
            }).sort(function(a, b) {
                const revenueA = parseFloat(a.metadata.stats.annualRevenue.replace(/[^0-9.]/g, ''));
                const revenueB = parseFloat(b.metadata.stats.annualRevenue.replace(/[^0-9.]/g, ''));
                return revenueB - revenueA;
            }).map(function(d, i) {
                return { rank: i + 1, name: d.metadata.name, revenue: d.metadata.stats.annualRevenue };
            });
        },
        
        getMarketShareRanking: function(region) {
            const filtered = region ? validData.filter(function(d) {
                return d.metadata.region === region;
            }) : validData;
            
            return filtered.filter(function(d) {
                return d.metadata.stats && d.metadata.stats.marketShare;
            }).sort(function(a, b) {
                return parseFloat(b.metadata.stats.marketShare) - parseFloat(a.metadata.stats.marketShare);
            }).map(function(d, i) {
                return { rank: i + 1, name: d.metadata.name, share: d.metadata.stats.marketShare };
            });
        },
        
        compare: function(platformA, platformB) {
            const a = validData.find(function(d) { return d.metadata.name === platformA; });
            const b = validData.find(function(d) { return d.metadata.name === platformB; });
            if (!a || !b) return null;
            
            return {
                platformA: a.metadata.name,
                platformB: b.metadata.name,
                revenueA: a.metadata.stats?.annualRevenue || 'N/A',
                revenueB: b.metadata.stats?.annualRevenue || 'N/A',
                visitorsA: a.metadata.stats?.monthlyVisitors || 'N/A',
                visitorsB: b.metadata.stats?.monthlyVisitors || 'N/A',
                listingsA: a.metadata.stats?.totalListings || 'N/A',
                listingsB: b.metadata.stats?.totalListings || 'N/A',
                foundedA: a.metadata.founded,
                foundedB: b.metadata.founded,
                regionA: a.metadata.region,
                regionB: b.metadata.region
            };
        },
        
        getCountryDistribution: function() {
            const dist = {};
            validData.forEach(function(d) {
                const country = d.metadata.country;
                if (!dist[country]) dist[country] = 0;
                dist[country]++;
            });
            return Object.entries(dist).sort(function(a, b) { return b[1] - a[1]; })
                .map(function(entry) { return { country: entry[0], count: entry[1] }; });
        },
        
        getRegionDistribution: function() {
            const dist = {};
            validData.forEach(function(d) {
                const region = d.metadata.region;
                if (!dist[region]) dist[region] = 0;
                dist[region]++;
            });
            return Object.entries(dist).sort(function(a, b) { return b[1] - a[1]; })
                .map(function(entry) { return { region: entry[0], count: entry[1] }; });
        },
        
        exportCSV: function(data, filename) {
            filename = filename || 'karir_data.csv';
            const headers = ['Name', 'Country', 'Region', 'Founded', 'Revenue', 'Visitors', 'Listings', 'CVs'];
            const rows = data.map(function(d) {
                return [
                    d.metadata.name,
                    d.metadata.country,
                    d.metadata.region,
                    d.metadata.founded,
                    d.metadata.stats?.annualRevenue || 'N/A',
                    d.metadata.stats?.monthlyVisitors || 'N/A',
                    d.metadata.stats?.totalListings || 'N/A',
                    d.metadata.stats?.totalCVs || 'N/A'
                ];
            });
            
            const csvContent = [headers, ...rows]
                .map(function(row) {
                    return row.map(function(cell) {
                        return '"' + String(cell).replace(/"/g, '""') + '"';
                    }).join(',');
                })
                .join('\n');
            
            const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            InternalLogger.info('DataExport', '✅ CSV exported: ' + filename);
            return true;
        },
        
        exportJSON: function(data, filename) {
            filename = filename || 'karir_data.json';
            const json = JSON.stringify(data, null, 2);
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            InternalLogger.info('DataExport', '✅ JSON exported: ' + filename);
            return true;
        },
        
        clearCache: function() {
            DataCache.clear();
            InternalLogger.info('DataExport', '✅ Cache cleared');
            return true;
        },
        
        getCacheStats: function() {
            return DataCache.getStats();
        },
        
        // ==========================================================
        // AI RECOMMENDATION FUNCTIONS
        // ==========================================================
        
        recommendJobs: function(userProfile) {
            return AIKarir.recommendJobs(userProfile);
        },
        
        predictSalary: function(jobTitle, location) {
            return AIKarir.predictSalary(jobTitle, location);
        },
        
        suggestCareerPath: function(skills, experience) {
            return AIKarir.suggestCareerPath(skills, experience);
        },
        
        analyzeCV: function(cvText) {
            return AIKarir.analyzeCV(cvText);
        },
        
        getMatchScore: function(cv, jobDesc) {
            return AIKarir.getMatchScore(cv, jobDesc);
        },
        
        // ==========================================================
        // REAL-TIME JOB DATA
        // ==========================================================
        
        getLiveJobs: function(platform, keyword) {
            return RealTimeJob.getLiveJobs(platform, keyword);
        },
        
        getTrendingJobs: function(region) {
            return RealTimeJob.getTrendingJobs(region);
        },
        
        getLiveSalary: function(jobTitle, location) {
            return RealTimeJob.getLiveSalary(jobTitle, location);
        },
        
        // ==========================================================
        // COMPANY REVIEWS FUNCTIONS
        // ==========================================================
        
        getGlassdoorReviews: function(company) {
            return CompanyReviews.getGlassdoorReviews(company);
        },
        
        getIndeedReviews: function(company) {
            return CompanyReviews.getIndeedReviews(company);
        },
        
        getGoogleReviews: function(company) {
            return CompanyReviews.getGoogleReviews(company);
        },
        
        getAggregatedCompanyRating: function(company) {
            return CompanyReviews.getAggregatedCompanyRating(company);
        },
        
        // ==========================================================
        // JOB TRACKER FUNCTIONS
        // ==========================================================
        
        addApplication: function(jobData) {
            return JobTracker.addApplication(jobData);
        },
        
        getApplicationStatus: function(appId) {
            return JobTracker.getApplicationStatus(appId);
        },
        
        getApplicationStats: function() {
            return JobTracker.getApplicationStats();
        },
        
        getFollowUpReminder: function() {
            return JobTracker.getFollowUpReminder();
        },
        
        getAllApplications: function() {
            return JobTracker.getAllApplications();
        },
        
        // ==========================================================
        // SALARY BENCHMARK FUNCTIONS
        // ==========================================================
        
        benchmarkByIndustry: function(industry) {
            return SalaryBenchmark.benchmarkByIndustry(industry);
        },
        
        benchmarkByLocation: function(location) {
            return SalaryBenchmark.benchmarkByLocation(location);
        },
        
        benchmarkByExperience: function(years) {
            return SalaryBenchmark.benchmarkByExperience(years);
        },
        
        // ==========================================================
        // CHART FUNCTIONS
        // ==========================================================
        
        renderCountryChart: function(containerId) {
            return JobChart.renderCountryChart(containerId);
        },
        
        renderJobTrend: function(containerId, region) {
            return JobChart.renderJobTrend(containerId, region);
        },
        
        renderPlatformDistribution: function(containerId) {
            return JobChart.renderPlatformDistribution(containerId);
        },
        
        renderPlatformRadar: function(containerId, platform) {
            return JobChart.renderPlatformRadar(containerId, platform);
        },
        
        renderSalaryHeatmap: function(containerId) {
            return JobChart.renderSalaryHeatmap(containerId);
        }
    };
    
    InternalLogger.info('MarplaceKarirAPI', '✅ API ready — 45+ functions!');
}

// ==========================================================
// 15. LOG
// ==========================================================
const logCount = validData.length;
const countryCount = new Set(validData.map(function(d) { return d.metadata.country; })).size;
const regionCount = new Set(validData.map(function(d) { return d.metadata.region; })).size;

InternalLogger.info('MarplaceKarir', '✅ Loaded ' + logCount + ' job platforms');
InternalLogger.info('MarplaceKarir', '📊 ' + countryCount + ' countries, ' + regionCount + ' regions');
InternalLogger.info('MarplaceKarir', '🧠 AI Recommendation module loaded');
InternalLogger.info('MarplaceKarir', '📡 Real-time job data module loaded');
InternalLogger.info('MarplaceKarir', '⭐ Company Reviews module loaded');
InternalLogger.info('MarplaceKarir', '📋 Job Application Tracker loaded');
InternalLogger.info('MarplaceKarir', '📊 Salary Benchmarking module loaded');
InternalLogger.info('MarplaceKarir', '📊 Chart Visualisation module loaded');
InternalLogger.info('MarplaceKarir', '🚀 API ready — 45+ functions!');
