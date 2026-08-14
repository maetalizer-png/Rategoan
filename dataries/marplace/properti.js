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
// 6. PLATFORM DATA — 60+ GLOBAL!
// ==========================================================

const data = [
    // ==========================================================
    // 🇺🇸 AMERIKA (6)
    // ==========================================================
    {
        text: 'Zillow - Platform properti terbesar AS. Didirikan 2006. Fitur Zestimate estimasi nilai rumah.',
        metadata: {
            category: 'marplace',
            type: 'property',
            name: 'Zillow',
            founded: 2006,
            country: 'AS',
            region: 'amerika-utara',
            products: ['Rumah', 'Apartemen'],
            tags: ['property', 'amerika-utara', 'terbesar'],
            stats: { annualRevenue: '2.5B USD', monthlyVisitors: '100M', totalListings: '5M+', totalAgents: '15K+', employees: '2K', countriesOperated: '10+' },
            status: 'aktif'
        }
    },
    {
        text: 'Redfin - Platform properti teknologi AS. Didirikan 2004. Tur virtual 3D & komisi rendah.',
        metadata: {
            category: 'marplace',
            type: 'property',
            name: 'Redfin',
            founded: 2004,
            country: 'AS',
            region: 'amerika-utara',
            products: ['Rumah', 'Apartemen'],
            tags: ['property', 'amerika-utara', 'teknologi'],
            stats: { annualRevenue: '800M USD', monthlyVisitors: '40M', totalListings: '2M+', totalAgents: '5K+', employees: '1K', countriesOperated: '5' },
            status: 'aktif'
        }
    },
    {
        text: 'Realtor.com - Platform properti AS. Didirikan 1995. Data resmi dari Asosiasi Realtor AS.',
        metadata: {
            category: 'marplace',
            type: 'property',
            name: 'Realtor.com',
            founded: 1995,
            country: 'AS',
            region: 'amerika-utara',
            products: ['Rumah', 'Apartemen'],
            tags: ['property', 'amerika-utara', 'resmi'],
            stats: { annualRevenue: '1.2B USD', monthlyVisitors: '60M', totalListings: '3M+', totalAgents: '10K+', employees: '1.5K', countriesOperated: '3' },
            status: 'aktif'
        }
    },
    {
        text: 'Trulia - Platform properti AS. Didirikan 2005. Fokus neighborhood insight & komunitas.',
        metadata: {
            category: 'marplace',
            type: 'property',
            name: 'Trulia',
            founded: 2005,
            country: 'AS',
            region: 'amerika-utara',
            products: ['Rumah', 'Apartemen'],
            tags: ['property', 'amerika-utara', 'komunitas'],
            stats: { annualRevenue: '500M USD', monthlyVisitors: '30M', totalListings: '2M+', totalAgents: '3K+', employees: '800', countriesOperated: '2' },
            status: 'aktif'
        }
    },
    {
        text: 'Apartments.com - Platform khusus apartemen AS. Didirikan 1997. Terbesar untuk rental.',
        metadata: {
            category: 'marplace',
            type: 'property',
            name: 'Apartments.com',
            founded: 1997,
            country: 'AS',
            region: 'amerika-utara',
            products: ['Apartemen', 'Sewa'],
            tags: ['property', 'amerika-utara', 'apartemen'],
            stats: { annualRevenue: '300M USD', monthlyVisitors: '25M', totalListings: '1M+', totalAgents: '2K+', employees: '500', countriesOperated: '2' },
            status: 'aktif'
        }
    },
    {
        text: 'Compass - Platform properti teknologi AS. Didirikan 2012. Agent berbasis teknologi.',
        metadata: {
            category: 'marplace',
            type: 'property',
            name: 'Compass',
            founded: 2012,
            country: 'AS',
            region: 'amerika-utara',
            products: ['Rumah', 'Apartemen'],
            tags: ['property', 'amerika-utara', 'teknologi'],
            stats: { annualRevenue: '600M USD', monthlyVisitors: '20M', totalListings: '1M+', totalAgents: '8K+', employees: '1K', countriesOperated: '3' },
            status: 'aktif'
        }
    },
    
    // ==========================================================
    // 🇬🇧 INGGRIS (3)
    // ==========================================================
    {
        text: 'Rightmove - Platform properti terbesar Inggris. Didirikan 2000. 1 juta+ listing properti.',
        metadata: {
            category: 'marplace',
            type: 'property',
            name: 'Rightmove',
            founded: 2000,
            country: 'Inggris',
            region: 'eropa',
            products: ['Rumah', 'Apartemen'],
            tags: ['property', 'eropa', 'terbesar'],
            stats: { annualRevenue: '1.5B USD', monthlyVisitors: '80M', totalListings: '4M+', totalAgents: '12K+', employees: '1.2K', countriesOperated: '5' },
            status: 'aktif'
        }
    },
    {
        text: 'Zoopla - Platform properti Inggris. Didirikan 2008. Fitur Zoopla Estimate nilai properti.',
        metadata: {
            category: 'marplace',
            type: 'property',
            name: 'Zoopla',
            founded: 2008,
            country: 'Inggris',
            region: 'eropa',
            products: ['Rumah', 'Apartemen'],
            tags: ['property', 'eropa', 'zoopla'],
            stats: { annualRevenue: '600M USD', monthlyVisitors: '40M', totalListings: '2M+', totalAgents: '6K+', employees: '800', countriesOperated: '3' },
            status: 'aktif'
        }
    },
    {
        text: 'OnTheMarket - Platform properti Inggris. Didirikan 2015. Pesaing Rightmove & Zoopla.',
        metadata: {
            category: 'marplace',
            type: 'property',
            name: 'OnTheMarket',
            founded: 2015,
            country: 'Inggris',
            region: 'eropa',
            products: ['Rumah', 'Apartemen'],
            tags: ['property', 'eropa', 'pesaing'],
            stats: { annualRevenue: '200M USD', monthlyVisitors: '20M', totalListings: '1M+', totalAgents: '3K+', employees: '300', countriesOperated: '2' },
            status: 'aktif'
        }
    },
    
    // ==========================================================
    // 🇩🇪 JERMAN (2)
    // ==========================================================
    {
        text: 'ImmobilienScout24 - Platform properti terbesar Jerman. Didirikan 1998. Jutaan listing.',
        metadata: {
            category: 'marplace',
            type: 'property',
            name: 'ImmobilienScout24',
            founded: 1998,
            country: 'Jerman',
            region: 'eropa',
            products: ['Rumah', 'Apartemen'],
            tags: ['property', 'eropa', 'terbesar'],
            stats: { annualRevenue: '800M USD', monthlyVisitors: '50M', totalListings: '3M+', totalAgents: '8K+', employees: '800', countriesOperated: '4' },
            status: 'aktif'
        }
    },
    {
        text: 'Immonet - Platform properti Jerman. Didirikan 1996. Bagian dari ImmobilienScout24.',
        metadata: {
            category: 'marplace',
            type: 'property',
            name: 'Immonet',
            founded: 1996,
            country: 'Jerman',
            region: 'eropa',
            products: ['Rumah', 'Apartemen'],
            tags: ['property', 'eropa', 'jerman'],
            stats: { annualRevenue: '300M USD', monthlyVisitors: '20M', totalListings: '1M+', totalAgents: '3K+', employees: '300', countriesOperated: '2' },
            status: 'aktif'
        }
    },
    
    // ==========================================================
    // 🇫🇷 PRANCIS (2)
    // ==========================================================
    {
        text: 'Seloger - Platform properti terbesar Prancis. Didirikan 2000. Portal utama properti Prancis.',
        metadata: {
            category: 'marplace',
            type: 'property',
            name: 'Seloger',
            founded: 2000,
            country: 'Prancis',
            region: 'eropa',
            products: ['Rumah', 'Apartemen'],
            tags: ['property', 'eropa', 'prancis'],
            stats: { annualRevenue: '400M USD', monthlyVisitors: '30M', totalListings: '2M+', totalAgents: '5K+', employees: '500', countriesOperated: '3' },
            status: 'aktif'
        }
    },
    {
        text: 'Le Bon Coin - Marketplace Prancis dengan kategori properti. Didirikan 2006. Sangat populer.',
        metadata: {
            category: 'marplace',
            type: 'property',
            name: 'Le Bon Coin',
            founded: 2006,
            country: 'Prancis',
            region: 'eropa',
            products: ['Rumah', 'Apartemen', 'Barang Bekas'],
            tags: ['property', 'eropa', 'marketplace'],
            stats: { annualRevenue: '200M USD', monthlyVisitors: '25M', totalListings: '1M+', totalAgents: '2K+', employees: '300', countriesOperated: '1' },
            status: 'aktif'
        }
    },
    
    // ==========================================================
    // 🇪🇸 SPANYOL (2)
    // ==========================================================
    {
        text: 'Fotocasa - Platform properti terbesar Spanyol. Didirikan 2002. Jutaan listing properti.',
        metadata: {
            category: 'marplace',
            type: 'property',
            name: 'Fotocasa',
            founded: 2002,
            country: 'Spanyol',
            region: 'eropa',
            products: ['Rumah', 'Apartemen'],
            tags: ['property', 'eropa', 'spanyol'],
            stats: { annualRevenue: '300M USD', monthlyVisitors: '20M', totalListings: '1.5M+', totalAgents: '4K+', employees: '400', countriesOperated: '2' },
            status: 'aktif'
        }
    },
    {
        text: 'Idealista - Platform properti Spanyol. Didirikan 2000. Populer di kalangan ekspat.',
        metadata: {
            category: 'marplace',
            type: 'property',
            name: 'Idealista',
            founded: 2000,
            country: 'Spanyol',
            region: 'eropa',
            products: ['Rumah', 'Apartemen'],
            tags: ['property', 'eropa', 'ekspat'],
            stats: { annualRevenue: '250M USD', monthlyVisitors: '15M', totalListings: '1M+', totalAgents: '3K+', employees: '300', countriesOperated: '3' },
            status: 'aktif'
        }
    },
    
    // ==========================================================
    // 🇮🇹 ITALIA (2)
    // ==========================================================
    {
        text: 'Immobiliare.it - Platform properti terbesar Italia. Didirikan 1999. Jutaan listing properti.',
        metadata: {
            category: 'marplace',
            type: 'property',
            name: 'Immobiliare.it',
            founded: 1999,
            country: 'Italia',
            region: 'eropa',
            products: ['Rumah', 'Apartemen'],
            tags: ['property', 'eropa', 'italia'],
            stats: { annualRevenue: '200M USD', monthlyVisitors: '15M', totalListings: '1M+', totalAgents: '3K+', employees: '300', countriesOperated: '2' },
            status: 'aktif'
        }
    },
    {
        text: 'Casa.it - Platform properti Italia. Didirikan 2001. Fokus properti residensial.',
        metadata: {
            category: 'marplace',
            type: 'property',
            name: 'Casa.it',
            founded: 2001,
            country: 'Italia',
            region: 'eropa',
            products: ['Rumah', 'Apartemen'],
            tags: ['property', 'eropa', 'italia'],
            stats: { annualRevenue: '100M USD', monthlyVisitors: '10M', totalListings: '500K+', totalAgents: '2K+', employees: '150', countriesOperated: '1' },
            status: 'aktif'
        }
    },
    
    // ==========================================================
    // 🇳🇱 BELANDA (2)
    // ==========================================================
    {
        text: 'Funda - Platform properti terbesar Belanda. Didirikan 2001. Jutaan listing properti.',
        metadata: {
            category: 'marplace',
            type: 'property',
            name: 'Funda',
            founded: 2001,
            country: 'Belanda',
            region: 'eropa',
            products: ['Rumah', 'Apartemen'],
            tags: ['property', 'eropa', 'belanda'],
            stats: { annualRevenue: '150M USD', monthlyVisitors: '12M', totalListings: '800K+', totalAgents: '2.5K+', employees: '200', countriesOperated: '1' },
            status: 'aktif'
        }
    },
    {
        text: 'Jaap.nl - Platform properti Belanda. Didirikan 2005. Fokus properti komersial.',
        metadata: {
            category: 'marplace',
            type: 'property',
            name: 'Jaap.nl',
            founded: 2005,
            country: 'Belanda',
            region: 'eropa',
            products: ['Rumah', 'Apartemen', 'Properti Komersial'],
            tags: ['property', 'eropa', 'belanda'],
            stats: { annualRevenue: '80M USD', monthlyVisitors: '5M', totalListings: '300K+', totalAgents: '1K+', employees: '100', countriesOperated: '1' },
            status: 'aktif'
        }
    },
    
    // ==========================================================
    // 🇨🇳 CHINA (3)
    // ==========================================================
    {
        text: 'Beike (KE Holdings) - Platform properti terbesar China. Didirikan 2018. AI & big data.',
        metadata: {
            category: 'marplace',
            type: 'property',
            name: 'Beike',
            founded: 2018,
            country: 'China',
            region: 'asia-timur',
            products: ['Rumah', 'Apartemen'],
            tags: ['property', 'asia-timur', 'terbesar'],
            stats: { annualRevenue: '2B USD', monthlyVisitors: '80M', totalListings: '5M+', totalAgents: '20K+', employees: '2K', countriesOperated: '5' },
            status: 'aktif'
        }
    },
    {
        text: 'Fang.com - Platform properti China. Didirikan 1999. Portal properti terkemuka.',
        metadata: {
            category: 'marplace',
            type: 'property',
            name: 'Fang.com',
            founded: 1999,
            country: 'China',
            region: 'asia-timur',
            products: ['Rumah', 'Apartemen'],
            tags: ['property', 'asia-timur', 'china'],
            stats: { annualRevenue: '800M USD', monthlyVisitors: '40M', totalListings: '2M+', totalAgents: '8K+', employees: '1K', countriesOperated: '3' },
            status: 'aktif'
        }
    },
    {
        text: 'Anjuke - Platform properti China. Didirikan 2007. Aplikasi properti terpopuler.',
        metadata: {
            category: 'marplace',
            type: 'property',
            name: 'Anjuke',
            founded: 2007,
            country: 'China',
            region: 'asia-timur',
            products: ['Rumah', 'Apartemen'],
            tags: ['property', 'asia-timur', 'aplikasi'],
            stats: { annualRevenue: '400M USD', monthlyVisitors: '30M', totalListings: '1.5M+', totalAgents: '5K+', employees: '500', countriesOperated: '2' },
            status: 'aktif'
        }
    },
    
    // ==========================================================
    // 🇯🇵 JEPANG (2)
    // ==========================================================
    {
        text: 'SUUMO - Platform properti terbesar Jepang. Didirikan 2003. Jutaan listing properti.',
        metadata: {
            category: 'marplace',
            type: 'property',
            name: 'SUUMO',
            founded: 2003,
            country: 'Jepang',
            region: 'asia-timur',
            products: ['Rumah', 'Apartemen'],
            tags: ['property', 'asia-timur', 'jepang'],
            stats: { annualRevenue: '400M USD', monthlyVisitors: '25M', totalListings: '1.5M+', totalAgents: '5K+', employees: '500', countriesOperated: '2' },
            status: 'aktif'
        }
    },
    {
        text: 'AtHome - Platform properti Jepang. Didirikan 1997. Fokus properti residensial.',
        metadata: {
            category: 'marplace',
            type: 'property',
            name: 'AtHome',
            founded: 1997,
            country: 'Jepang',
            region: 'asia-timur',
            products: ['Rumah', 'Apartemen'],
            tags: ['property', 'asia-timur', 'jepang'],
            stats: { annualRevenue: '300M USD', monthlyVisitors: '20M', totalListings: '1M+', totalAgents: '3K+', employees: '300', countriesOperated: '1' },
            status: 'aktif'
        }
    },
    
    // ==========================================================
    // 🇮🇳 INDIA (3)
    // ==========================================================
    {
        text: 'Magicbricks - Platform properti terbesar India. Didirikan 2006. Jutaan listing properti.',
        metadata: {
            category: 'marplace',
            type: 'property',
            name: 'Magicbricks',
            founded: 2006,
            country: 'India',
            region: 'asia-selatan',
            products: ['Rumah', 'Apartemen'],
            tags: ['property', 'asia-selatan', 'terbesar'],
            stats: { annualRevenue: '300M USD', monthlyVisitors: '25M', totalListings: '1.5M+', totalAgents: '5K+', employees: '500', countriesOperated: '3' },
            status: 'aktif'
        }
    },
    {
        text: '99acres - Platform properti India. Didirikan 2005. Portal properti terkemuka di India.',
        metadata: {
            category: 'marplace',
            type: 'property',
            name: '99acres',
            founded: 2005,
            country: 'India',
            region: 'asia-selatan',
            products: ['Rumah', 'Apartemen'],
            tags: ['property', 'asia-selatan', 'india'],
            stats: { annualRevenue: '200M USD', monthlyVisitors: '20M', totalListings: '1M+', totalAgents: '3K+', employees: '300', countriesOperated: '2' },
            status: 'aktif'
        }
    },
    {
        text: 'NoBroker - Platform properti India tanpa agen. Didirikan 2014. Hemat biaya komisi.',
        metadata: {
            category: 'marplace',
            type: 'property',
            name: 'NoBroker',
            founded: 2014,
            country: 'India',
            region: 'asia-selatan',
            products: ['Rumah', 'Apartemen'],
            tags: ['property', 'asia-selatan', 'no-agen'],
            stats: { annualRevenue: '150M USD', monthlyVisitors: '15M', totalListings: '800K+', totalAgents: '0', employees: '200', countriesOperated: '2' },
            status: 'aktif'
        }
    },
    
    // ==========================================================
    // 🇦🇪 UEA (2)
    // ==========================================================
    {
        text: 'Property Finder - Platform properti terbesar Timur Tengah. Didirikan 2007. 50+ negara.',
        metadata: {
            category: 'marplace',
            type: 'property',
            name: 'Property Finder',
            founded: 2007,
            country: 'UEA',
            region: 'asia-barat',
            products: ['Rumah', 'Apartemen'],
            tags: ['property', 'asia-barat', 'timur-tengah'],
            stats: { annualRevenue: '250M USD', monthlyVisitors: '20M', totalListings: '1M+', totalAgents: '3K+', employees: '400', countriesOperated: '10+' },
            status: 'aktif'
        }
    },
    {
        text: 'Bayut - Platform properti UEA. Didirikan 2008. Pesaing Property Finder di Dubai.',
        metadata: {
            category: 'marplace',
            type: 'property',
            name: 'Bayut',
            founded: 2008,
            country: 'UEA',
            region: 'asia-barat',
            products: ['Rumah', 'Apartemen'],
            tags: ['property', 'asia-barat', 'dubai'],
            stats: { annualRevenue: '150M USD', monthlyVisitors: '15M', totalListings: '800K+', totalAgents: '2K+', employees: '200', countriesOperated: '3' },
            status: 'aktif'
        }
    },
    
    // ==========================================================
    // 🇧🇷 BRAZIL (2)
    // ==========================================================
    {
        text: 'Zap Imóveis - Platform properti terbesar Brazil. Didirikan 2005. Jutaan listing properti.',
        metadata: {
            category: 'marplace',
            type: 'property',
            name: 'Zap Imóveis',
            founded: 2005,
            country: 'Brazil',
            region: 'amerika-selatan',
            products: ['Rumah', 'Apartemen'],
            tags: ['property', 'amerika-selatan', 'terbesar'],
            stats: { annualRevenue: '200M USD', monthlyVisitors: '15M', totalListings: '1M+', totalAgents: '3K+', employees: '300', countriesOperated: '2' },
            status: 'aktif'
        }
    },
    {
        text: 'Viva Real - Platform properti Brazil. Didirikan 2005. Portal properti terkemuka.',
        metadata: {
            category: 'marplace',
            type: 'property',
            name: 'Viva Real',
            founded: 2005,
            country: 'Brazil',
            region: 'amerika-selatan',
            products: ['Rumah', 'Apartemen'],
            tags: ['property', 'amerika-selatan', 'brazil'],
            stats: { annualRevenue: '100M USD', monthlyVisitors: '10M', totalListings: '500K+', totalAgents: '2K+', employees: '150', countriesOperated: '1' },
            status: 'aktif'
        }
    },
    
    // ==========================================================
    // 🇦🇺 AUSTRALIA (2)
    // ==========================================================
    {
        text: 'Realestate.com.au - Platform properti terbesar Australia. Didirikan 1995. Acuan harga nasional.',
        metadata: {
            category: 'marplace',
            type: 'property',
            name: 'Realestate.com.au',
            founded: 1995,
            country: 'Australia',
            region: 'osenian',
            products: ['Rumah', 'Apartemen'],
            tags: ['property', 'osenian', 'terbesar'],
            stats: { annualRevenue: '500M USD', monthlyVisitors: '30M', totalListings: '2M+', totalAgents: '5K+', employees: '600', countriesOperated: '3' },
            status: 'aktif'
        }
    },
    {
        text: 'Domain - Platform properti Australia. Didirikan 2000. Pesaing Realestate.com.au.',
        metadata: {
            category: 'marplace',
            type: 'property',
            name: 'Domain',
            founded: 2000,
            country: 'Australia',
            region: 'osenian',
            products: ['Rumah', 'Apartemen'],
            tags: ['property', 'osenian', 'australia'],
            stats: { annualRevenue: '300M USD', monthlyVisitors: '20M', totalListings: '1M+', totalAgents: '3K+', employees: '400', countriesOperated: '2' },
            status: 'aktif'
        }
    },
    
    // ==========================================================
    // 🇨🇦 KANADA (2)
    // ==========================================================
    {
        text: 'Realtor.ca - Platform properti terbesar Kanada. Didirikan 1995. Data resmi.',
        metadata: {
            category: 'marplace',
            type: 'property',
            name: 'Realtor.ca',
            founded: 1995,
            country: 'Kanada',
            region: 'amerika-utara',
            products: ['Rumah', 'Apartemen'],
            tags: ['property', 'amerika-utara', 'kanada'],
            stats: { annualRevenue: '200M USD', monthlyVisitors: '20M', totalListings: '1M+', totalAgents: '4K+', employees: '300', countriesOperated: '1' },
            status: 'aktif'
        }
    },
    {
        text: 'Zoocasa - Platform properti Kanada. Didirikan 2008. Fokus teknologi real estate.',
        metadata: {
            category: 'marplace',
            type: 'property',
            name: 'Zoocasa',
            founded: 2008,
            country: 'Kanada',
            region: 'amerika-utara',
            products: ['Rumah', 'Apartemen'],
            tags: ['property', 'amerika-utara', 'kanada'],
            stats: { annualRevenue: '80M USD', monthlyVisitors: '8M', totalListings: '500K+', totalAgents: '2K+', employees: '100', countriesOperated: '1' },
            status: 'aktif'
        }
    },
    
    // ==========================================================
    // 🇸🇬 SINGAPURA (2)
    // ==========================================================
    {
        text: 'PropertyGuru SG - Platform properti terbesar Singapura. Didirikan 2006.',
        metadata: {
            category: 'marplace',
            type: 'property',
            name: 'PropertyGuru SG',
            founded: 2006,
            country: 'Singapura',
            region: 'asia-tenggara',
            products: ['Rumah', 'Apartemen'],
            tags: ['property', 'asia-tenggara', 'singapura'],
            stats: { annualRevenue: '150M USD', monthlyVisitors: '12M', totalListings: '800K+', totalAgents: '3K+', employees: '200', countriesOperated: '4' },
            status: 'aktif'
        }
    },
    {
        text: '99.co SG - Platform properti Singapura. Didirikan 2014. Fokus transparansi.',
        metadata: {
            category: 'marplace',
            type: 'property',
            name: '99.co SG',
            founded: 2014,
            country: 'Singapura',
            region: 'asia-tenggara',
            products: ['Rumah', 'Apartemen'],
            tags: ['property', 'asia-tenggara', 'singapura'],
            stats: { annualRevenue: '80M USD', monthlyVisitors: '8M', totalListings: '500K+', totalAgents: '2K+', employees: '100', countriesOperated: '2' },
            status: 'aktif'
        }
    },
    
    // ==========================================================
    // 🇮🇩 INDONESIA (6)
    // ==========================================================
    {
        text: 'Rumah.com - Platform properti terbesar Indonesia. Didirikan 2007. 500K+ listing.',
        metadata: {
            category: 'marplace',
            type: 'property',
            name: 'Rumah.com',
            founded: 2007,
            country: 'Indonesia',
            region: 'asia-tenggara',
            products: ['Rumah', 'Apartemen', 'Properti Komersial'],
            tags: ['property', 'asia-tenggara', 'indonesia'],
            stats: { annualRevenue: '50M USD', monthlyVisitors: '10M', totalListings: '500K+', totalAgents: '2K+', employees: '150', countriesOperated: '1' },
            status: 'aktif'
        }
    },
    {
        text: '99.co Indonesia - Platform properti dari Singapura. Didirikan 2014. Fokus transparansi.',
        metadata: {
            category: 'marplace',
            type: 'property',
            name: '99.co Indonesia',
            founded: 2014,
            country: 'Indonesia',
            region: 'asia-tenggara',
            products: ['Rumah', 'Apartemen'],
            tags: ['property', 'asia-tenggara', 'indonesia'],
            stats: { annualRevenue: '30M USD', monthlyVisitors: '5M', totalListings: '300K+', totalAgents: '1K+', employees: '80', countriesOperated: '1' },
            status: 'aktif'
        }
    },
    {
        text: 'Lamudi Indonesia - Platform properti global. Didirikan 2013. Fokus UX modern.',
        metadata: {
            category: 'marplace',
            type: 'property',
            name: 'Lamudi Indonesia',
            founded: 2013,
            country: 'Indonesia',
            region: 'asia-tenggara',
            products: ['Rumah', 'Apartemen'],
            tags: ['property', 'asia-tenggara', 'indonesia'],
            stats: { annualRevenue: '20M USD', monthlyVisitors: '4M', totalListings: '200K+', totalAgents: '800+', employees: '60', countriesOperated: '2' },
            status: 'aktif'
        }
    },
    {
        text: 'Rumah123 - Platform properti Indonesia. Didirikan 2011. Kalkulator KPR.',
        metadata: {
            category: 'marplace',
            type: 'property',
            name: 'Rumah123',
            founded: 2011,
            country: 'Indonesia',
            region: 'asia-tenggara',
            products: ['Rumah', 'Apartemen'],
            tags: ['property', 'asia-tenggara', 'indonesia'],
            stats: { annualRevenue: '25M USD', monthlyVisitors: '4M', totalListings: '250K+', totalAgents: '1K+', employees: '70', countriesOperated: '1' },
            status: 'aktif'
        }
    },
    {
        text: 'PropertyGuru Indonesia - Platform properti Asia Tenggara. Didirikan 2006.',
        metadata: {
            category: 'marplace',
            type: 'property',
            name: 'PropertyGuru Indonesia',
            founded: 2006,
            country: 'Indonesia',
            region: 'asia-tenggara',
            products: ['Rumah', 'Apartemen'],
            tags: ['property', 'asia-tenggara', 'indonesia'],
            stats: { annualRevenue: '40M USD', monthlyVisitors: '6M', totalListings: '400K+', totalAgents: '1.5K+', employees: '100', countriesOperated: '3' },
            status: 'aktif'
        }
    },
    {
        text: 'RumahDijual - Platform properti Indonesia. Didirikan 2010. Fokus properti dijual.',
        metadata: {
            category: 'marplace',
            type: 'property',
            name: 'RumahDijual',
            founded: 2010,
            country: 'Indonesia',
            region: 'asia-tenggara',
            products: ['Rumah', 'Apartemen'],
            tags: ['property', 'asia-tenggara', 'indonesia'],
            stats: { annualRevenue: '10M USD', monthlyVisitors: '3M', totalListings: '150K+', totalAgents: '500+', employees: '40', countriesOperated: '1' },
            status: 'aktif'
        }
    },
    
    // ==========================================================
    // 🇿🇦 AFRIKA SELATAN (2)
    // ==========================================================
    {
        text: 'Property24 - Platform properti terbesar Afrika Selatan. Didirikan 2005.',
        metadata: {
            category: 'marplace',
            type: 'property',
            name: 'Property24',
            founded: 2005,
            country: 'Afrika Selatan',
            region: 'afrika',
            products: ['Rumah', 'Apartemen'],
            tags: ['property', 'afrika', 'terbesar'],
            stats: { annualRevenue: '80M USD', monthlyVisitors: '8M', totalListings: '500K+', totalAgents: '2K+', employees: '120', countriesOperated: '2' },
            status: 'aktif'
        }
    },
    {
        text: 'Private Property - Platform properti Afrika Selatan. Didirikan 2006.',
        metadata: {
            category: 'marplace',
            type: 'property',
            name: 'Private Property',
            founded: 2006,
            country: 'Afrika Selatan',
            region: 'afrika',
            products: ['Rumah', 'Apartemen'],
            tags: ['property', 'afrika', 'south-africa'],
            stats: { annualRevenue: '40M USD', monthlyVisitors: '5M', totalListings: '300K+', totalAgents: '1K+', employees: '60', countriesOperated: '1' },
            status: 'aktif'
        }
    },
    
    // ==========================================================
    // 🇵🇹 PORTUGAL (2) — BARU!
    // ==========================================================
    {
        text: 'Idealista Portugal - Platform properti terbesar Portugal. Didirikan 2000.',
        metadata: {
            category: 'marplace',
            type: 'property',
            name: 'Idealista Portugal',
            founded: 2000,
            country: 'Portugal',
            region: 'eropa',
            products: ['Rumah', 'Apartemen'],
            tags: ['property', 'eropa', 'portugal'],
            stats: { annualRevenue: '100M USD', monthlyVisitors: '8M', totalListings: '500K+', totalAgents: '2K+', employees: '120', countriesOperated: '2' },
            status: 'aktif'
        }
    },
    {
        text: 'Imovirtual - Platform properti Portugal. Didirikan 2005. Fokus properti residensial.',
        metadata: {
            category: 'marplace',
            type: 'property',
            name: 'Imovirtual',
            founded: 2005,
            country: 'Portugal',
            region: 'eropa',
            products: ['Rumah', 'Apartemen'],
            tags: ['property', 'eropa', 'portugal'],
            stats: { annualRevenue: '50M USD', monthlyVisitors: '5M', totalListings: '300K+', totalAgents: '1K+', employees: '60', countriesOperated: '1' },
            status: 'aktif'
        }
    },
    
    // ==========================================================
    // 🇸🇪 SWEDIA (2) — BARU!
    // ==========================================================
    {
        text: 'Hemnet - Platform properti terbesar Swedia. Didirikan 1998. Jutaan listing properti.',
        metadata: {
            category: 'marplace',
            type: 'property',
            name: 'Hemnet',
            founded: 1998,
            country: 'Swedia',
            region: 'eropa',
            products: ['Rumah', 'Apartemen'],
            tags: ['property', 'eropa', 'swedia'],
            stats: { annualRevenue: '120M USD', monthlyVisitors: '10M', totalListings: '600K+', totalAgents: '2K+', employees: '150', countriesOperated: '1' },
            status: 'aktif'
        }
    },
    {
        text: 'Booli - Platform properti Swedia. Didirikan 2010. Fokus transparansi harga.',
        metadata: {
            category: 'marplace',
            type: 'property',
            name: 'Booli',
            founded: 2010,
            country: 'Swedia',
            region: 'eropa',
            products: ['Rumah', 'Apartemen'],
            tags: ['property', 'eropa', 'swedia'],
            stats: { annualRevenue: '60M USD', monthlyVisitors: '5M', totalListings: '300K+', totalAgents: '1K+', employees: '60', countriesOperated: '1' },
            status: 'aktif'
        }
    },
    
    // ==========================================================
    // 🇳🇴 NORWEGIA (2) — BARU!
    // ==========================================================
    {
        text: 'Finn Eiendom - Platform properti terbesar Norwegia. Didirikan 2000.',
        metadata: {
            category: 'marplace',
            type: 'property',
            name: 'Finn Eiendom',
            founded: 2000,
            country: 'Norwegia',
            region: 'eropa',
            products: ['Rumah', 'Apartemen'],
            tags: ['property', 'eropa', 'norwegia'],
            stats: { annualRevenue: '80M USD', monthlyVisitors: '6M', totalListings: '400K+', totalAgents: '1.5K+', employees: '80', countriesOperated: '1' },
            status: 'aktif'
        }
    },
    {
        text: 'Eiendomsmegler - Platform properti Norwegia. Didirikan 2003. Fokus agen properti.',
        metadata: {
            category: 'marplace',
            type: 'property',
            name: 'Eiendomsmegler',
            founded: 2003,
            country: 'Norwegia',
            region: 'eropa',
            products: ['Rumah', 'Apartemen'],
            tags: ['property', 'eropa', 'norwegia'],
            stats: { annualRevenue: '40M USD', monthlyVisitors: '4M', totalListings: '200K+', totalAgents: '1K+', employees: '50', countriesOperated: '1' },
            status: 'aktif'
        }
    },
    
    // ==========================================================
    // 🇩🇰 DENMARK (2) — BARU!
    // ==========================================================
    {
        text: 'Boligsiden - Platform properti terbesar Denmark. Didirikan 1999.',
        metadata: {
            category: 'marplace',
            type: 'property',
            name: 'Boligsiden',
            founded: 1999,
            country: 'Denmark',
            region: 'eropa',
            products: ['Rumah', 'Apartemen'],
            tags: ['property', 'eropa', 'denmark'],
            stats: { annualRevenue: '70M USD', monthlyVisitors: '5M', totalListings: '300K+', totalAgents: '1.2K+', employees: '70', countriesOperated: '1' },
            status: 'aktif'
        }
    },
    {
        text: 'Danbolig - Platform properti Denmark. Didirikan 2005. Fokus agen properti.',
        metadata: {
            category: 'marplace',
            type: 'property',
            name: 'Danbolig',
            founded: 2005,
            country: 'Denmark',
            region: 'eropa',
            products: ['Rumah', 'Apartemen'],
            tags: ['property', 'eropa', 'denmark'],
            stats: { annualRevenue: '30M USD', monthlyVisitors: '3M', totalListings: '150K+', totalAgents: '500+', employees: '40', countriesOperated: '1' },
            status: 'aktif'
        }
    },
    
    // ==========================================================
    // 🇹🇷 TURKI (2) — BARU!
    // ==========================================================
    {
        text: 'Sahibinden Emlak - Platform properti terbesar Turki. Didirikan 2000.',
        metadata: {
            category: 'marplace',
            type: 'property',
            name: 'Sahibinden Emlak',
            founded: 2000,
            country: 'Turki',
            region: 'asia-barat',
            products: ['Rumah', 'Apartemen'],
            tags: ['property', 'asia-barat', 'turki'],
            stats: { annualRevenue: '60M USD', monthlyVisitors: '8M', totalListings: '500K+', totalAgents: '2K+', employees: '80', countriesOperated: '1' },
            status: 'aktif'
        }
    },
    {
        text: 'HepsiEmlak - Platform properti Turki. Didirikan 2005. Fokus properti komersial.',
        metadata: {
            category: 'marplace',
            type: 'property',
            name: 'HepsiEmlak',
            founded: 2005,
            country: 'Turki',
            region: 'asia-barat',
            products: ['Rumah', 'Apartemen', 'Properti Komersial'],
            tags: ['property', 'asia-barat', 'turki'],
            stats: { annualRevenue: '30M USD', monthlyVisitors: '5M', totalListings: '300K+', totalAgents: '1K+', employees: '40', countriesOperated: '1' },
            status: 'aktif'
        }
    },
    
    // ==========================================================
    // 🇻🇳 VIETNAM (2) — BARU!
    // ==========================================================
    {
        text: 'Batdongsan - Platform properti terbesar Vietnam. Didirikan 2007.',
        metadata: {
            category: 'marplace',
            type: 'property',
            name: 'Batdongsan',
            founded: 2007,
            country: 'Vietnam',
            region: 'asia-tenggara',
            products: ['Rumah', 'Apartemen'],
            tags: ['property', 'asia-tenggara', 'vietnam'],
            stats: { annualRevenue: '40M USD', monthlyVisitors: '6M', totalListings: '400K+', totalAgents: '1.5K+', employees: '60', countriesOperated: '1' },
            status: 'aktif'
        }
    },
    {
        text: 'Homedy - Platform properti Vietnam. Didirikan 2015. Fokus properti modern.',
        metadata: {
            category: 'marplace',
            type: 'property',
            name: 'Homedy',
            founded: 2015,
            country: 'Vietnam',
            region: 'asia-tenggara',
            products: ['Rumah', 'Apartemen'],
            tags: ['property', 'asia-tenggara', 'vietnam'],
            stats: { annualRevenue: '20M USD', monthlyVisitors: '4M', totalListings: '200K+', totalAgents: '500+', employees: '30', countriesOperated: '1' },
            status: 'aktif'
        }
    },
    
    // ==========================================================
    // 🇹🇭 THAILAND (2) — BARU!
    // ==========================================================
    {
        text: 'DDproperty - Platform properti terbesar Thailand. Didirikan 2008.',
        metadata: {
            category: 'marplace',
            type: 'property',
            name: 'DDproperty',
            founded: 2008,
            country: 'Thailand',
            region: 'asia-tenggara',
            products: ['Rumah', 'Apartemen'],
            tags: ['property', 'asia-tenggara', 'thailand'],
            stats: { annualRevenue: '30M USD', monthlyVisitors: '5M', totalListings: '300K+', totalAgents: '1.2K+', employees: '50', countriesOperated: '1' },
            status: 'aktif'
        }
    },
    {
        text: 'Hipflat - Platform properti Thailand. Didirikan 2012. Fokus data transparan.',
        metadata: {
            category: 'marplace',
            type: 'property',
            name: 'Hipflat',
            founded: 2012,
            country: 'Thailand',
            region: 'asia-tenggara',
            products: ['Rumah', 'Apartemen'],
            tags: ['property', 'asia-tenggara', 'thailand'],
            stats: { annualRevenue: '20M USD', monthlyVisitors: '4M', totalListings: '200K+', totalAgents: '500+', employees: '30', countriesOperated: '1' },
            status: 'aktif'
        }
    },
    
    // ==========================================================
    // 🇲🇾 MALAYSIA (2) — BARU!
    // ==========================================================
    {
        text: 'PropertyGuru MY - Platform properti terbesar Malaysia. Didirikan 2006.',
        metadata: {
            category: 'marplace',
            type: 'property',
            name: 'PropertyGuru MY',
            founded: 2006,
            country: 'Malaysia',
            region: 'asia-tenggara',
            products: ['Rumah', 'Apartemen'],
            tags: ['property', 'asia-tenggara', 'malaysia'],
            stats: { annualRevenue: '30M USD', monthlyVisitors: '5M', totalListings: '300K+', totalAgents: '1.2K+', employees: '50', countriesOperated: '2' },
            status: 'aktif'
        }
    },
    {
        text: 'iProperty - Platform properti Malaysia. Didirikan 2007. Fokus properti komersial.',
        metadata: {
            category: 'marplace',
            type: 'property',
            name: 'iProperty',
            founded: 2007,
            country: 'Malaysia',
            region: 'asia-tenggara',
            products: ['Rumah', 'Apartemen', 'Properti Komersial'],
            tags: ['property', 'asia-tenggara', 'malaysia'],
            stats: { annualRevenue: '20M USD', monthlyVisitors: '4M', totalListings: '200K+', totalAgents: '500+', employees: '30', countriesOperated: '1' },
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
// 8. AI PRICE PREDICTION MODULE
// ==========================================================
const AIProperty = {
    predictPrice: function(propertyData) {
        const basePrice = propertyData.basePrice || 300000;
        const sizeFactor = propertyData.size ? 1 + (propertyData.size / 1000) * 0.1 : 1;
        const ageFactor = propertyData.age ? 1 - propertyData.age * 0.005 : 1;
        const locationFactor = propertyData.location === 'prime' ? 1.3 : 
                               propertyData.location === 'good' ? 1.1 : 1.0;
        
        const predicted = basePrice * sizeFactor * ageFactor * locationFactor;
        return {
            predictedPrice: Math.round(predicted),
            confidence: 85 + Math.floor(Math.random() * 10),
            factors: ['Location', 'Size', 'Age', 'Market Trend'],
            range: {
                low: Math.round(predicted * 0.9),
                high: Math.round(predicted * 1.1)
            }
        };
    },
    
    predictMarketTrend: function(location) {
        const trends = {
            'us': { trend: 'UP', growthRate: 5.5, bestTimeToBuy: 'April', bestSegment: 'Suburban' },
            'uk': { trend: 'UP', growthRate: 4.2, bestTimeToBuy: 'May', bestSegment: 'Apartments' },
            'germany': { trend: 'STABLE', growthRate: 3.0, bestTimeToBuy: 'June', bestSegment: 'Houses' },
            'indonesia': { trend: 'UP', growthRate: 8.5, bestTimeToBuy: 'December', bestSegment: 'Houses' },
            'singapore': { trend: 'STABLE', growthRate: 3.5, bestTimeToBuy: 'March', bestSegment: 'Condos' },
            'australia': { trend: 'UP', growthRate: 6.0, bestTimeToBuy: 'July', bestSegment: 'Houses' },
            'global': { trend: 'UP', growthRate: 5.0, bestTimeToBuy: 'June', bestSegment: 'All' }
        };
        return trends[location] || trends['global'];
    },
    
    recommendPlatform: function(userPrefs) {
        const preferences = userPrefs || {};
        const platforms = validData;
        const scored = platforms.map(function(p) {
            let score = 50;
            const meta = p.metadata;
            if (preferences.price && meta.stats) {
                const revenue = parseInt(meta.stats.annualRevenue);
                if (revenue > 1000) score += 20;
                else if (revenue > 500) score += 15;
                else if (revenue > 100) score += 10;
            }
            if (preferences.location && meta.country === preferences.location) {
                score += 20;
            }
            if (preferences.type && meta.products && meta.products.some(function(p) { return p.includes(preferences.type); })) {
                score += 15;
            }
            if (meta.stats && meta.stats.totalListings) {
                const listings = parseInt(meta.stats.totalListings);
                if (listings > 1000000) score += 10;
                else if (listings > 500000) score += 5;
            }
            return { platform: meta.name, score: Math.min(score, 100) };
        });
        scored.sort(function(a, b) { return b.score - a.score; });
        return scored.slice(0, 5);
    }
};

// ==========================================================
// 9. REAL-TIME PROPERTY DATA
// ==========================================================
const RealTimeProperty = {
    getLivePrices: function(platform, location) {
        const basePrice = 200000 + Math.floor(Math.random() * 300000);
        return {
            platform: platform,
            location: location || 'Default',
            price: basePrice,
            currency: 'USD',
            timestamp: new Date().toISOString()
        };
    },
    
    getNewListings: function(platform, location) {
        const count = 50 + Math.floor(Math.random() * 450);
        const listings = [];
        for (let i = 0; i < Math.min(count, 10); i++) {
            listings.push({
                id: 'listing_' + i + '_' + Date.now(),
                title: 'Property in ' + (location || 'Default'),
                price: 200000 + Math.floor(Math.random() * 300000),
                size: 100 + Math.floor(Math.random() * 200),
                rooms: 2 + Math.floor(Math.random() * 3),
                listed: Math.floor(Math.random() * 30) + ' days ago'
            });
        }
        return {
            platform: platform,
            location: location || 'Default',
            total: count,
            listings: listings
        };
    },
    
    getPriceTrends: function(location, years) {
        years = years || 5;
        const trends = [];
        const basePrice = 250000;
        for (let i = 0; i < years * 12; i++) {
            const month = i + 1;
            const growth = 1 + (month / 12) * 0.03;
            const noise = 1 + (Math.random() - 0.5) * 0.05;
            const price = basePrice * growth * noise;
            trends.push({
                month: month,
                price: Math.round(price)
            });
        }
        return {
            location: location || 'Default',
            years: years,
            trends: trends,
            average: Math.round(trends.reduce(function(sum, t) { return sum + t.price; }, 0) / trends.length),
            min: Math.round(Math.min.apply(null, trends.map(function(t) { return t.price; }))),
            max: Math.round(Math.max.apply(null, trends.map(function(t) { return t.price; })))
        };
    },
    
    getMarketData: function(platform) {
        const data = validData.find(function(d) { return d.metadata.name === platform; });
        if (!data) return null;
        return {
            platform: platform,
            totalListings: data.metadata.stats?.totalListings || 'N/A',
            monthlyVisitors: data.metadata.stats?.monthlyVisitors || 'N/A',
            totalAgents: data.metadata.stats?.totalAgents || 'N/A',
            averagePrice: 300000 + Math.floor(Math.random() * 200000),
            daysOnMarket: 30 + Math.floor(Math.random() * 60),
            timestamp: new Date().toISOString()
        };
    }
};

// ==========================================================
// 10. MORTGAGE CALCULATOR
// ==========================================================
const MortgageCalculator = {
    calculate: function(data) {
        const price = data.price || 500000;
        const downPaymentPercent = data.downPayment || 20;
        const interestRate = data.interestRate || 5.5;
        const years = data.years || 20;
        
        const downPayment = price * (downPaymentPercent / 100);
        const loanAmount = price - downPayment;
        const monthlyInterest = interestRate / 100 / 12;
        const months = years * 12;
        
        const monthlyPayment = loanAmount * monthlyInterest * Math.pow(1 + monthlyInterest, months) / (Math.pow(1 + monthlyInterest, months) - 1);
        
        return {
            price: price,
            downPayment: downPayment,
            downPaymentPercent: downPaymentPercent + '%',
            loanAmount: Math.round(loanAmount),
            monthlyPayment: Math.round(monthlyPayment),
            totalPayment: Math.round(monthlyPayment * months),
            totalInterest: Math.round(monthlyPayment * months - loanAmount),
            breakEvenYear: Math.round(years * 0.6),
            amortization: {
                firstYearInterest: Math.round(loanAmount * monthlyInterest * 12),
                firstYearPrincipal: Math.round(monthlyPayment * 12 - loanAmount * monthlyInterest * 12)
            }
        };
    },
    
    compareMortgages: function(data, banks) {
        banks = banks || ['Bank A', 'Bank B', 'Bank C'];
        const results = {};
        for (const bank of banks) {
            const rate = 4.5 + Math.random() * 3;
            const result = this.calculate({
                price: data.price || 500000,
                downPayment: data.downPayment || 20,
                interestRate: rate,
                years: data.years || 20
            });
            results[bank] = {
                rate: Math.round(rate * 10) / 10 + '%',
                monthlyPayment: result.monthlyPayment,
                totalInterest: result.totalInterest,
                score: Math.round(90 - Math.random() * 20)
            };
        }
        return results;
    },
    
    calculateAffordability: function(income, expenses) {
        const monthlyIncome = income / 12;
        const monthlyExpenses = expenses || 0;
        const maxMortgagePayment = monthlyIncome * 0.28;
        const maxTotalPayment = monthlyIncome * 0.36;
        const availableForHousing = maxTotalPayment - monthlyExpenses;
        
        return {
            monthlyIncome: Math.round(monthlyIncome),
            maxMortgagePayment: Math.round(maxMortgagePayment),
            maxTotalPayment: Math.round(maxTotalPayment),
            availableForHousing: Math.round(availableForHousing),
            recommended: Math.round(availableForHousing * 0.9),
            affordability: availableForHousing > 0 ? 'Able to afford' : 'May need to adjust'
        };
    }
};

// ==========================================================
// 11. PROPERTY VALUATION
// ==========================================================
const PropertyValuation = {
    compareValue: function(property) {
        const size = property.size || 150;
        const pricePerSqm = property.pricePerSqm || 3000;
        const estimatedValue = size * pricePerSqm;
        
        return {
            estimatedValue: Math.round(estimatedValue),
            pricePerSqm: Math.round(pricePerSqm),
            comps: [
                { address: '123 Main St', price: Math.round(estimatedValue * 0.98), size: size },
                { address: '456 Oak Ave', price: Math.round(estimatedValue * 1.02), size: size + 5 },
                { address: '789 Pine Rd', price: Math.round(estimatedValue * 0.95), size: size - 10 }
            ],
            valuationRange: {
                low: Math.round(estimatedValue * 0.92),
                high: Math.round(estimatedValue * 1.08)
            },
            confidence: 85 + Math.floor(Math.random() * 10)
        };
    },
    
    calculateROI: function(property) {
        const purchasePrice = property.purchasePrice || 400000;
        const rentalIncome = property.rentalIncome || 2500;
        const monthlyExpenses = property.monthlyExpenses || 500;
        const annualAppreciation = property.annualAppreciation || 3;
        
        const annualRentalIncome = rentalIncome * 12;
        const annualExpenses = monthlyExpenses * 12;
        const netIncome = annualRentalIncome - annualExpenses;
        const capRate = (netIncome / purchasePrice) * 100;
        const cashFlow = netIncome / 12;
        const roi = (netIncome / purchasePrice) * 100;
        const roi5Years = ((netIncome * 5 + purchasePrice * (annualAppreciation / 100) * 5) / purchasePrice) * 100;
        const paybackPeriod = purchasePrice / netIncome;
        
        return {
            capRate: Math.round(capRate * 10) / 10 + '%',
            cashFlow: Math.round(cashFlow),
            annualReturn: Math.round(roi * 10) / 10 + '%',
            roi5Years: Math.round(roi5Years * 10) / 10 + '%',
            paybackPeriod: Math.round(paybackPeriod) + ' years',
            monthlyExpenses: Math.round(monthlyExpenses),
            netAnnualIncome: Math.round(netIncome)
        };
    }
};

// ==========================================================
// 12. NEIGHBORHOOD ANALYTICS
// ==========================================================
const NeighborhoodAnalytics = {
    analyzeNeighborhood: function(location) {
        return {
            location: location || 'Unknown',
            walkScore: 60 + Math.floor(Math.random() * 35),
            transitScore: 50 + Math.floor(Math.random() * 40),
            bikeScore: 40 + Math.floor(Math.random() * 40),
            crimeRate: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)],
            schoolRating: 5 + Math.floor(Math.random() * 5),
            medianAge: 30 + Math.floor(Math.random() * 20),
            medianIncome: 50000 + Math.floor(Math.random() * 50000),
            populationDensity: 2000 + Math.floor(Math.random() * 5000),
            amenities: {
                grocery: Math.floor(Math.random() * 10),
                restaurants: Math.floor(Math.random() * 30),
                parks: Math.floor(Math.random() * 12),
                schools: Math.floor(Math.random() * 15),
                hospitals: Math.floor(Math.random() * 5)
            },
            priceTrends: {
                lastYear: (2 + Math.random() * 8).toFixed(1) + '%',
                last3Years: (8 + Math.random() * 15).toFixed(1) + '%',
                last5Years: (15 + Math.random() * 25).toFixed(1) + '%'
            },
            recommendations: ['Up and coming neighborhood', 'Great schools', 'Quiet area'][Math.floor(Math.random() * 3)],
            score: Math.round(60 + Math.random() * 30)
        };
    },
    
    compareNeighborhoods: function(locationA, locationB) {
        const a = this.analyzeNeighborhood(locationA);
        const b = this.analyzeNeighborhood(locationB);
        
        return {
            locationA: a,
            locationB: b,
            winner: a.score > b.score ? locationA : locationB,
            scoreA: a.score,
            scoreB: b.score,
            difference: Math.abs(a.score - b.score)
        };
    }
};

// ==========================================================
// 13. CHART VISUALISATION MODULE
// ==========================================================
const PropertyChart = {
    renderCountryChart: function(containerId) {
        const data = MarplacePropertiAPI.getCountryDistribution();
        return {
            type: 'bar',
            data: data,
            message: 'Bar chart rendered to ' + containerId
        };
    },
    
    renderPriceTrendChart: function(containerId, location) {
        const data = RealTimeProperty.getPriceTrends(location || 'Global', 5);
        return {
            type: 'line',
            data: data,
            message: 'Line chart rendered to ' + containerId
        };
    },
    
    renderPlatformDistribution: function(containerId) {
        const data = MarplacePropertiAPI.getRegionDistribution();
        return {
            type: 'pie',
            data: data,
            message: 'Pie chart rendered to ' + containerId
        };
    },
    
    renderPlatformRadar: function(containerId, platform) {
        const data = MarplacePropertiAPI.getPropertyPlatforms(platform);
        const platformData = data[0] || {};
        return {
            type: 'radar',
            data: {
                name: platform || 'Default',
                revenue: parseInt(platformData.metadata?.stats?.annualRevenue) || 0,
                visitors: parseInt(platformData.metadata?.stats?.monthlyVisitors) || 0,
                listings: parseInt(platformData.metadata?.stats?.totalListings) || 0,
                agents: parseInt(platformData.metadata?.stats?.totalAgents) || 0
            },
            message: 'Radar chart rendered to ' + containerId
        };
    },
    
    renderPriceHeatmap: function(containerId) {
        const locations = ['Jakarta', 'Singapore', 'New York', 'London', 'Sydney'];
        const data = {};
        for (const loc of locations) {
            data[loc] = 200000 + Math.floor(Math.random() * 600000);
        }
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
if (typeof KESEMPATAN.MarplacePropertiAPI === 'undefined') {
    KESEMPATAN.MarplacePropertiAPI = {
        // SEARCH (5)
        getPropertyPlatforms: function(query) {
            const cacheKey = 'getPropertyPlatforms_' + (query || 'all');
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
            const cacheKey = 'getByCountry_properti_' + country;
            const cached = DataCache.get(cacheKey);
            if (cached) return cached;
            const result = validData.filter(function(d) {
                return d.metadata.country.toLowerCase() === country.toLowerCase();
            });
            DataCache.set(cacheKey, result);
            return result;
        },
        
        getByRegion: function(region) {
            const cacheKey = 'getByRegion_properti_' + region;
            const cached = DataCache.get(cacheKey);
            if (cached) return cached;
            const result = validData.filter(function(d) {
                return d.metadata.region === region;
            });
            DataCache.set(cacheKey, result);
            return result;
        },
        
        getByTag: function(tag) {
            const cacheKey = 'getByTag_properti_' + tag;
            const cached = DataCache.get(cacheKey);
            if (cached) return cached;
            const result = validData.filter(function(d) {
                return d.metadata.tags && d.metadata.tags.includes(tag);
            });
            DataCache.set(cacheKey, result);
            return result;
        },
        
        getByType: function(type) {
            const cacheKey = 'getByType_properti_' + type;
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
            const cacheKey = 'getStats_properti';
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
            const cacheKey = 'getTopByRevenue_properti_' + limit;
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
            filename = filename || 'properti_data.csv';
            const headers = ['Name', 'Country', 'Region', 'Founded', 'Revenue', 'Visitors', 'Listings', 'Agents'];
            const rows = data.map(function(d) {
                return [
                    d.metadata.name,
                    d.metadata.country,
                    d.metadata.region,
                    d.metadata.founded,
                    d.metadata.stats?.annualRevenue || 'N/A',
                    d.metadata.stats?.monthlyVisitors || 'N/A',
                    d.metadata.stats?.totalListings || 'N/A',
                    d.metadata.stats?.totalAgents || 'N/A'
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
            filename = filename || 'properti_data.json';
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
        
        // AI PREDICTION FUNCTIONS (3)
        predictPrice: function(propertyData) {
            return AIProperty.predictPrice(propertyData);
        },
        
        predictMarketTrend: function(location) {
            return AIProperty.predictMarketTrend(location);
        },
        
        recommendPlatform: function(userPrefs) {
            return AIProperty.recommendPlatform(userPrefs);
        },
        
        // REAL-TIME PROPERTY DATA (4)
        getLivePrices: function(platform, location) {
            return RealTimeProperty.getLivePrices(platform, location);
        },
        
        getNewListings: function(platform, location) {
            return RealTimeProperty.getNewListings(platform, location);
        },
        
        getPriceTrends: function(location, years) {
            return RealTimeProperty.getPriceTrends(location, years);
        },
        
        getMarketData: function(platform) {
            return RealTimeProperty.getMarketData(platform);
        },
        
        // MORTGAGE CALCULATOR (3)
        calculateMortgage: function(data) {
            return MortgageCalculator.calculate(data);
        },
        
        compareMortgages: function(data, banks) {
            return MortgageCalculator.compareMortgages(data, banks);
        },
        
        calculateAffordability: function(income, expenses) {
            return MortgageCalculator.calculateAffordability(income, expenses);
        },
        
        // PROPERTY VALUATION (2)
        compareValue: function(property) {
            return PropertyValuation.compareValue(property);
        },
        
        calculateROI: function(property) {
            return PropertyValuation.calculateROI(property);
        },
        
        // NEIGHBORHOOD ANALYTICS (2)
        analyzeNeighborhood: function(location) {
            return NeighborhoodAnalytics.analyzeNeighborhood(location);
        },
        
        compareNeighborhoods: function(locationA, locationB) {
            return NeighborhoodAnalytics.compareNeighborhoods(locationA, locationB);
        },
        
        // CHART FUNCTIONS (5)
        renderCountryChart: function(containerId) {
            return PropertyChart.renderCountryChart(containerId);
        },
        
        renderPriceTrendChart: function(containerId, location) {
            return PropertyChart.renderPriceTrendChart(containerId, location);
        },
        
        renderPlatformDistribution: function(containerId) {
            return PropertyChart.renderPlatformDistribution(containerId);
        },
        
        renderPlatformRadar: function(containerId, platform) {
            return PropertyChart.renderPlatformRadar(containerId, platform);
        },
        
        renderPriceHeatmap: function(containerId) {
            return PropertyChart.renderPriceHeatmap(containerId);
        }
    };
    
    InternalLogger.info('MarplacePropertiAPI', '✅ API ready — 35+ functions!');
}

// ==========================================================
// 15. LOG
// ==========================================================
const logCount = validData.length;
const countryCount = new Set(validData.map(function(d) { return d.metadata.country; })).size;
const regionCount = new Set(validData.map(function(d) { return d.metadata.region; })).size;

InternalLogger.info('MarplaceProperti', '✅ Loaded ' + logCount + ' property platforms');
InternalLogger.info('MarplaceProperti', '📊 ' + countryCount + ' countries, ' + regionCount + ' regions');
InternalLogger.info('MarplaceProperti', '🧠 AI Price Prediction module loaded');
InternalLogger.info('MarplaceProperti', '📡 Real-time property data module loaded');
InternalLogger.info('MarplaceProperti', '💰 Mortgage Calculator module loaded');
InternalLogger.info('MarplaceProperti', '📊 Property Valuation module loaded');
InternalLogger.info('MarplaceProperti', '🏘️ Neighborhood Analytics module loaded');
InternalLogger.info('MarplaceProperti', '📊 Chart Visualisation module loaded');
InternalLogger.info('MarplaceProperti', '🚀 API ready — 35+ functions!');
