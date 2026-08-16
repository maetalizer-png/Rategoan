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

export const DATA = data;
