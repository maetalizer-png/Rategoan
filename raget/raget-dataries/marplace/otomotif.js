const data = [
    // ==========================================================
    // 🇺🇸 AMERIKA SERIKAT (10)
    // ==========================================================
    {
        text: 'Cars.com - Platform otomotif terbesar AS. Didirikan 1998. Review dealer & komparasi harga.',
        metadata: {
            category: 'marplace',
            type: 'automotive',
            name: 'Cars.com',
            founded: 1998,
            country: 'AS',
            region: 'global',
            products: ['Mobil Baru', 'Mobil Bekas'],
            tags: ['automotive', 'global', 'terbesar'],
            stats: { annualRevenue: '2.5B USD', monthlyVisitors: '100M', totalListings: '5M+', totalDealers: '15K+', marketShare: '15%', employees: '2K' },
            status: 'aktif'
        }
    },
    {
        text: 'CarGurus - Platform otomotif AI AS. Didirikan 2006. Analisis harga "Great Deal" atau "Overpriced".',
        metadata: {
            category: 'marplace',
            type: 'automotive',
            name: 'CarGurus',
            founded: 2006,
            country: 'AS',
            region: 'global',
            products: ['Mobil Baru', 'Mobil Bekas'],
            tags: ['automotive', 'global', 'ai'],
            stats: { annualRevenue: '800M USD', monthlyVisitors: '60M', totalListings: '4M+', totalDealers: '10K+', marketShare: '8%', employees: '1.2K' },
            status: 'aktif'
        }
    },
    {
        text: 'Autotrader - Platform otomotif tertua AS. Didirikan 1997. Ikon industri otomotif AS.',
        metadata: {
            category: 'marplace',
            type: 'automotive',
            name: 'Autotrader',
            founded: 1997,
            country: 'AS',
            region: 'global',
            products: ['Mobil Baru', 'Mobil Bekas'],
            tags: ['automotive', 'global', 'tertua'],
            stats: { annualRevenue: '1.2B USD', monthlyVisitors: '80M', totalListings: '6M+', totalDealers: '20K+', marketShare: '12%', employees: '1.5K' },
            status: 'aktif'
        }
    },
    {
        text: 'TrueCar - Platform otomotif AS. Didirikan 2005. Transparansi harga & dealer terpercaya.',
        metadata: {
            category: 'marplace',
            type: 'automotive',
            name: 'TrueCar',
            founded: 2005,
            country: 'AS',
            region: 'global',
            products: ['Mobil Baru', 'Mobil Bekas'],
            tags: ['automotive', 'global', 'transparan'],
            stats: { annualRevenue: '400M USD', monthlyVisitors: '40M', totalListings: '3M+', totalDealers: '8K+', marketShare: '5%', employees: '800' },
            status: 'aktif'
        }
    },
    {
        text: 'Carvana - Platform jual-beli mobil online AS. Didirikan 2012. Beli mobil 100% online.',
        metadata: {
            category: 'marplace',
            type: 'automotive',
            name: 'Carvana',
            founded: 2012,
            country: 'AS',
            region: 'global',
            products: ['Mobil Bekas'],
            tags: ['automotive', 'global', 'online'],
            stats: { annualRevenue: '5B USD', monthlyVisitors: '50M', totalListings: '2M+', totalDealers: '0', marketShare: '6%', employees: '3K' },
            status: 'aktif'
        }
    },
    {
        text: 'Vroom - Platform jual-beli mobil online AS. Didirikan 2013. Pesaing Carvana.',
        metadata: {
            category: 'marplace',
            type: 'automotive',
            name: 'Vroom',
            founded: 2013,
            country: 'AS',
            region: 'global',
            products: ['Mobil Bekas'],
            tags: ['automotive', 'global', 'online'],
            stats: { annualRevenue: '1.5B USD', monthlyVisitors: '20M', totalListings: '1M+', totalDealers: '0', marketShare: '2%', employees: '1K' },
            status: 'aktif'
        }
    },
    {
        text: 'Edmunds - Platform otomotif AS. Didirikan 1966. Review & komparasi mobil.',
        metadata: {
            category: 'marplace',
            type: 'automotive',
            name: 'Edmunds',
            founded: 1966,
            country: 'AS',
            region: 'global',
            products: ['Mobil Baru', 'Mobil Bekas'],
            tags: ['automotive', 'global', 'review'],
            stats: { annualRevenue: '300M USD', monthlyVisitors: '40M', totalListings: '2M+', totalDealers: '5K+', marketShare: '4%', employees: '600' },
            status: 'aktif'
        }
    },
    {
        text: 'Kelly Blue Book - Platform otomotif AS. Didirikan 1926. Estimasi nilai mobil.',
        metadata: {
            category: 'marplace',
            type: 'automotive',
            name: 'Kelly Blue Book',
            founded: 1926,
            country: 'AS',
            region: 'global',
            products: ['Mobil Baru', 'Mobil Bekas'],
            tags: ['automotive', 'global', 'estimasi'],
            stats: { annualRevenue: '200M USD', monthlyVisitors: '30M', totalListings: '1M+', totalDealers: '3K+', marketShare: '3%', employees: '400' },
            status: 'aktif'
        }
    },
    {
        text: 'AutoNation - Dealer mobil terbesar AS. Didirikan 1996. Platform online + dealer fisik.',
        metadata: {
            category: 'marplace',
            type: 'automotive',
            name: 'AutoNation',
            founded: 1996,
            country: 'AS',
            region: 'global',
            products: ['Mobil Baru', 'Mobil Bekas'],
            tags: ['automotive', 'global', 'dealer'],
            stats: { annualRevenue: '25B USD', monthlyVisitors: '20M', totalListings: '500K+', totalDealers: '300+', marketShare: '10%', employees: '25K' },
            status: 'aktif'
        }
    },
    {
        text: 'Shift - Platform jual-beli mobil online AS. Didirikan 2013. Fokus kemudahan transaksi.',
        metadata: {
            category: 'marplace',
            type: 'automotive',
            name: 'Shift',
            founded: 2013,
            country: 'AS',
            region: 'global',
            products: ['Mobil Bekas'],
            tags: ['automotive', 'global', 'online'],
            stats: { annualRevenue: '500M USD', monthlyVisitors: '10M', totalListings: '500K+', totalDealers: '0', marketShare: '1%', employees: '500' },
            status: 'aktif'
        }
    },
    
    // ==========================================================
    // 🇬🇧 INGGRIS (4)
    // ==========================================================
    {
        text: 'AutoTrader UK - Platform otomotif terbesar Inggris. Didirikan 1977. Dari majalah ke digital.',
        metadata: {
            category: 'marplace',
            type: 'automotive',
            name: 'AutoTrader UK',
            founded: 1977,
            country: 'Inggris',
            region: 'eropa',
            products: ['Mobil Baru', 'Mobil Bekas'],
            tags: ['automotive', 'eropa', 'terbesar'],
            stats: { annualRevenue: '1B USD', monthlyVisitors: '60M', totalListings: '4M+', totalDealers: '12K+', marketShare: '25%', employees: '1K' },
            status: 'aktif'
        }
    },
    {
        text: 'PistonHeads - Platform otomotif komunitas Inggris. Didirikan 1999. Forum & review mobil.',
        metadata: {
            category: 'marplace',
            type: 'automotive',
            name: 'PistonHeads',
            founded: 1999,
            country: 'Inggris',
            region: 'eropa',
            products: ['Mobil Baru', 'Mobil Bekas'],
            tags: ['automotive', 'eropa', 'komunitas'],
            stats: { annualRevenue: '50M USD', monthlyVisitors: '10M', totalListings: '1M+', totalDealers: '2K+', marketShare: '5%', employees: '100' },
            status: 'aktif'
        }
    },
    {
        text: 'CarGurus UK - Versi CarGurus di Inggris. Didirikan 2015. AI analisis harga.',
        metadata: {
            category: 'marplace',
            type: 'automotive',
            name: 'CarGurus UK',
            founded: 2015,
            country: 'Inggris',
            region: 'eropa',
            products: ['Mobil Baru', 'Mobil Bekas'],
            tags: ['automotive', 'eropa', 'ai'],
            stats: { annualRevenue: '200M USD', monthlyVisitors: '20M', totalListings: '2M+', totalDealers: '5K+', marketShare: '10%', employees: '300' },
            status: 'aktif'
        }
    },
    {
        text: 'Motors.co.uk - Platform otomotif Inggris. Didirikan 2008. Fokus dealer premium.',
        metadata: {
            category: 'marplace',
            type: 'automotive',
            name: 'Motors.co.uk',
            founded: 2008,
            country: 'Inggris',
            region: 'eropa',
            products: ['Mobil Baru', 'Mobil Bekas'],
            tags: ['automotive', 'eropa', 'premium'],
            stats: { annualRevenue: '150M USD', monthlyVisitors: '15M', totalListings: '1.5M+', totalDealers: '3K+', marketShare: '8%', employees: '200' },
            status: 'aktif'
        }
    },
    
    // ==========================================================
    // 🇩🇪 JERMAN (4)
    // ==========================================================
    {
        text: 'Mobile.de - Platform otomotif terbesar Jerman. Didirikan 1995. Acuan harga mobil Jerman.',
        metadata: {
            category: 'marplace',
            type: 'automotive',
            name: 'Mobile.de',
            founded: 1995,
            country: 'Jerman',
            region: 'eropa',
            products: ['Mobil Baru', 'Mobil Bekas'],
            tags: ['automotive', 'eropa', 'terbesar'],
            stats: { annualRevenue: '800M USD', monthlyVisitors: '50M', totalListings: '3M+', totalDealers: '10K+', marketShare: '30%', employees: '800' },
            status: 'aktif'
        }
    },
    {
        text: 'AutoScout24 - Platform otomotif Eropa. Didirikan 1998. Beroperasi di 11 negara Eropa.',
        metadata: {
            category: 'marplace',
            type: 'automotive',
            name: 'AutoScout24',
            founded: 1998,
            country: 'Jerman',
            region: 'eropa',
            products: ['Mobil Baru', 'Mobil Bekas'],
            tags: ['automotive', 'eropa', 'europa'],
            stats: { annualRevenue: '500M USD', monthlyVisitors: '40M', totalListings: '3M+', totalDealers: '8K+', marketShare: '20%', employees: '600' },
            status: 'aktif'
        }
    },
    {
        text: 'Autoscout24 - Platform otomotif Jerman. Didirikan 1998. Pesaing Mobile.de.',
        metadata: {
            category: 'marplace',
            type: 'automotive',
            name: 'Autoscout24',
            founded: 1998,
            country: 'Jerman',
            region: 'eropa',
            products: ['Mobil Baru', 'Mobil Bekas'],
            tags: ['automotive', 'eropa', 'jerman'],
            stats: { annualRevenue: '300M USD', monthlyVisitors: '25M', totalListings: '2M+', totalDealers: '5K+', marketShare: '15%', employees: '400' },
            status: 'aktif'
        }
    },
    {
        text: 'Bauer Cars - Platform otomotif Jerman. Didirikan 2005. Fokus mobil premium.',
        metadata: {
            category: 'marplace',
            type: 'automotive',
            name: 'Bauer Cars',
            founded: 2005,
            country: 'Jerman',
            region: 'eropa',
            products: ['Mobil Baru', 'Mobil Bekas'],
            tags: ['automotive', 'eropa', 'premium'],
            stats: { annualRevenue: '100M USD', monthlyVisitors: '10M', totalListings: '500K+', totalDealers: '2K+', marketShare: '5%', employees: '150' },
            status: 'aktif'
        }
    },
    
    // ==========================================================
    // 🇫🇷 PRANCIS (3)
    // ==========================================================
    {
        text: 'La Centrale - Platform otomotif terbesar Prancis. Didirikan 1999. Estimasi harga & review.',
        metadata: {
            category: 'marplace',
            type: 'automotive',
            name: 'La Centrale',
            founded: 1999,
            country: 'Prancis',
            region: 'eropa',
            products: ['Mobil Baru', 'Mobil Bekas'],
            tags: ['automotive', 'eropa', 'prancis'],
            stats: { annualRevenue: '200M USD', monthlyVisitors: '20M', totalListings: '1.5M+', totalDealers: '4K+', marketShare: '25%', employees: '300' },
            status: 'aktif'
        }
    },
    {
        text: 'Leboncoin Auto - Kategori otomotif di Le Bon Coin. Didirikan 2006. Sangat populer di Prancis.',
        metadata: {
            category: 'marplace',
            type: 'automotive',
            name: 'Leboncoin Auto',
            founded: 2006,
            country: 'Prancis',
            region: 'eropa',
            products: ['Mobil Bekas'],
            tags: ['automotive', 'eropa', 'prancis'],
            stats: { annualRevenue: '150M USD', monthlyVisitors: '15M', totalListings: '1M+', totalDealers: '2K+', marketShare: '15%', employees: '200' },
            status: 'aktif'
        }
    },
    {
        text: 'AutoScout24 France - Versi AutoScout24 di Prancis. Didirikan 2000.',
        metadata: {
            category: 'marplace',
            type: 'automotive',
            name: 'AutoScout24 France',
            founded: 2000,
            country: 'Prancis',
            region: 'eropa',
            products: ['Mobil Baru', 'Mobil Bekas'],
            tags: ['automotive', 'eropa', 'prancis'],
            stats: { annualRevenue: '100M USD', monthlyVisitors: '10M', totalListings: '800K+', totalDealers: '2K+', marketShare: '10%', employees: '150' },
            status: 'aktif'
        }
    },
    
    // ==========================================================
    // 🇨🇳 CHINA (4)
    // ==========================================================
    {
        text: 'Autohome - Platform otomotif terbesar China. Didirikan 2005. Review & komparasi mobil.',
        metadata: {
            category: 'marplace',
            type: 'automotive',
            name: 'Autohome',
            founded: 2005,
            country: 'China',
            region: 'asia-timur',
            products: ['Mobil Baru', 'Mobil Bekas'],
            tags: ['automotive', 'asia-timur', 'terbesar'],
            stats: { annualRevenue: '1.5B USD', monthlyVisitors: '80M', totalListings: '5M+', totalDealers: '20K+', marketShare: '35%', employees: '2K' },
            status: 'aktif'
        }
    },
    {
        text: 'Bitauto - Platform otomotif China. Didirikan 2000. Portal otomotif terkemuka.',
        metadata: {
            category: 'marplace',
            type: 'automotive',
            name: 'Bitauto',
            founded: 2000,
            country: 'China',
            region: 'asia-timur',
            products: ['Mobil Baru', 'Mobil Bekas'],
            tags: ['automotive', 'asia-timur', 'china'],
            stats: { annualRevenue: '500M USD', monthlyVisitors: '30M', totalListings: '2M+', totalDealers: '8K+', marketShare: '15%', employees: '800' },
            status: 'aktif'
        }
    },
    {
        text: 'Che168 - Platform otomotif China. Didirikan 2005. Fokus mobil bekas & review.',
        metadata: {
            category: 'marplace',
            type: 'automotive',
            name: 'Che168',
            founded: 2005,
            country: 'China',
            region: 'asia-timur',
            products: ['Mobil Bekas'],
            tags: ['automotive', 'asia-timur', 'china'],
            stats: { annualRevenue: '200M USD', monthlyVisitors: '15M', totalListings: '1M+', totalDealers: '3K+', marketShare: '10%', employees: '300' },
            status: 'aktif'
        }
    },
    {
        text: 'Dongchedi - Platform otomotif China. Didirikan 2017. Fokus konten video & review.',
        metadata: {
            category: 'marplace',
            type: 'automotive',
            name: 'Dongchedi',
            founded: 2017,
            country: 'China',
            region: 'asia-timur',
            products: ['Mobil Baru', 'Mobil Bekas'],
            tags: ['automotive', 'asia-timur', 'video'],
            stats: { annualRevenue: '300M USD', monthlyVisitors: '20M', totalListings: '1M+', totalDealers: '2K+', marketShare: '8%', employees: '500' },
            status: 'aktif'
        }
    },
    
    // ==========================================================
    // 🇯🇵 JEPANG (3)
    // ==========================================================
    {
        text: 'Goo-net - Platform otomotif terbesar Jepang. Didirikan 1997. Portal mobil Jepang.',
        metadata: {
            category: 'marplace',
            type: 'automotive',
            name: 'Goo-net',
            founded: 1997,
            country: 'Jepang',
            region: 'asia-timur',
            products: ['Mobil Baru', 'Mobil Bekas'],
            tags: ['automotive', 'asia-timur', 'jepang'],
            stats: { annualRevenue: '600M USD', monthlyVisitors: '30M', totalListings: '2M+', totalDealers: '10K+', marketShare: '30%', employees: '500' },
            status: 'aktif'
        }
    },
    {
        text: 'Car Sensor - Platform otomotif Jepang. Didirikan 2000. Fokus mobil bekas.',
        metadata: {
            category: 'marplace',
            type: 'automotive',
            name: 'Car Sensor',
            founded: 2000,
            country: 'Jepang',
            region: 'asia-timur',
            products: ['Mobil Bekas'],
            tags: ['automotive', 'asia-timur', 'jepang'],
            stats: { annualRevenue: '300M USD', monthlyVisitors: '15M', totalListings: '1M+', totalDealers: '5K+', marketShare: '15%', employees: '300' },
            status: 'aktif'
        }
    },
    {
        text: 'Yahoo! Car - Platform otomotif Jepang. Didirikan 2005. Bagian dari Yahoo! Japan.',
        metadata: {
            category: 'marplace',
            type: 'automotive',
            name: 'Yahoo! Car',
            founded: 2005,
            country: 'Jepang',
            region: 'asia-timur',
            products: ['Mobil Baru', 'Mobil Bekas'],
            tags: ['automotive', 'asia-timur', 'jepang'],
            stats: { annualRevenue: '200M USD', monthlyVisitors: '10M', totalListings: '800K+', totalDealers: '3K+', marketShare: '10%', employees: '200' },
            status: 'aktif'
        }
    },
    
    // ==========================================================
    // 🇰🇷 KOREA SELATAN (2)
    // ==========================================================
    {
        text: 'Encar - Platform otomotif terbesar Korea. Didirikan 2000. Portal mobil Korea.',
        metadata: {
            category: 'marplace',
            type: 'automotive',
            name: 'Encar',
            founded: 2000,
            country: 'Korea Selatan',
            region: 'asia-timur',
            products: ['Mobil Baru', 'Mobil Bekas'],
            tags: ['automotive', 'asia-timur', 'korea'],
            stats: { annualRevenue: '400M USD', monthlyVisitors: '20M', totalListings: '1.5M+', totalDealers: '5K+', marketShare: '35%', employees: '400' },
            status: 'aktif'
        }
    },
    {
        text: 'Bobae Dream - Platform otomotif Korea. Didirikan 2005. Fokus komunitas & review.',
        metadata: {
            category: 'marplace',
            type: 'automotive',
            name: 'Bobae Dream',
            founded: 2005,
            country: 'Korea Selatan',
            region: 'asia-timur',
            products: ['Mobil Baru', 'Mobil Bekas'],
            tags: ['automotive', 'asia-timur', 'korea'],
            stats: { annualRevenue: '100M USD', monthlyVisitors: '8M', totalListings: '500K+', totalDealers: '2K+', marketShare: '10%', employees: '150' },
            status: 'aktif'
        }
    },
    
    // ==========================================================
    // 🇮🇳 INDIA (4)
    // ==========================================================
    {
        text: 'CarDekho - Platform otomotif terbesar India. Didirikan 2008. Video test drive & review.',
        metadata: {
            category: 'marplace',
            type: 'automotive',
            name: 'CarDekho',
            founded: 2008,
            country: 'India',
            region: 'asia-selatan',
            products: ['Mobil Baru', 'Mobil Bekas'],
            tags: ['automotive', 'asia-selatan', 'terbesar'],
            stats: { annualRevenue: '300M USD', monthlyVisitors: '30M', totalListings: '2M+', totalDealers: '8K+', marketShare: '30%', employees: '600' },
            status: 'aktif'
        }
    },
    {
        text: 'CarWale - Platform otomotif India. Didirikan 2005. Komunitas & forum mobil India.',
        metadata: {
            category: 'marplace',
            type: 'automotive',
            name: 'CarWale',
            founded: 2005,
            country: 'India',
            region: 'asia-selatan',
            products: ['Mobil Baru', 'Mobil Bekas'],
            tags: ['automotive', 'asia-selatan', 'india'],
            stats: { annualRevenue: '150M USD', monthlyVisitors: '15M', totalListings: '1M+', totalDealers: '4K+', marketShare: '15%', employees: '300' },
            status: 'aktif'
        }
    },
    {
        text: 'OLX Autos - Kategori otomotif OLX India. Didirikan 2006. Jual-beli mobil bekas.',
        metadata: {
            category: 'marplace',
            type: 'automotive',
            name: 'OLX Autos',
            founded: 2006,
            country: 'India',
            region: 'asia-selatan',
            products: ['Mobil Bekas'],
            tags: ['automotive', 'asia-selatan', 'olx'],
            stats: { annualRevenue: '100M USD', monthlyVisitors: '10M', totalListings: '500K+', totalDealers: '2K+', marketShare: '10%', employees: '200' },
            status: 'aktif'
        }
    },
    {
        text: 'Droom - Platform otomotif India. Didirikan 2014. Fokus transparansi & AI.',
        metadata: {
            category: 'marplace',
            type: 'automotive',
            name: 'Droom',
            founded: 2014,
            country: 'India',
            region: 'asia-selatan',
            products: ['Mobil Baru', 'Mobil Bekas'],
            tags: ['automotive', 'asia-selatan', 'ai'],
            stats: { annualRevenue: '80M USD', monthlyVisitors: '8M', totalListings: '500K+', totalDealers: '2K+', marketShare: '8%', employees: '150' },
            status: 'aktif'
        }
    },
    
    // ==========================================================
    // 🇷🇺 RUSIA (2)
    // ==========================================================
    {
        text: 'Auto.ru - Platform otomotif terbesar Rusia. Didirikan 1999. Portal mobil Rusia.',
        metadata: {
            category: 'marplace',
            type: 'automotive',
            name: 'Auto.ru',
            founded: 1999,
            country: 'Rusia',
            region: 'eropa',
            products: ['Mobil Baru', 'Mobil Bekas'],
            tags: ['automotive', 'eropa', 'rusia'],
            stats: { annualRevenue: '200M USD', monthlyVisitors: '20M', totalListings: '1.5M+', totalDealers: '5K+', marketShare: '30%', employees: '300' },
            status: 'aktif'
        }
    },
    {
        text: 'Drom.ru - Platform otomotif Rusia. Didirikan 2001. Fokus mobil bekas & review.',
        metadata: {
            category: 'marplace',
            type: 'automotive',
            name: 'Drom.ru',
            founded: 2001,
            country: 'Rusia',
            region: 'eropa',
            products: ['Mobil Bekas'],
            tags: ['automotive', 'eropa', 'rusia'],
            stats: { annualRevenue: '100M USD', monthlyVisitors: '10M', totalListings: '800K+', totalDealers: '3K+', marketShare: '15%', employees: '150' },
            status: 'aktif'
        }
    },
    
    // ==========================================================
    // 🇹🇷 TURKI (2)
    // ==========================================================
    {
        text: 'Sahibinden - Platform marketplace terbesar Turki dengan otomotif. Didirikan 2000.',
        metadata: {
            category: 'marplace',
            type: 'automotive',
            name: 'Sahibinden',
            founded: 2000,
            country: 'Turki',
            region: 'asia-barat',
            products: ['Mobil Baru', 'Mobil Bekas'],
            tags: ['automotive', 'asia-barat', 'turki'],
            stats: { annualRevenue: '300M USD', monthlyVisitors: '25M', totalListings: '2M+', totalDealers: '6K+', marketShare: '35%', employees: '500' },
            status: 'aktif'
        }
    },
    {
        text: 'Arabam - Platform otomotif Turki. Didirikan 2001. Fokus mobil bekas & komunitas.',
        metadata: {
            category: 'marplace',
            type: 'automotive',
            name: 'Arabam',
            founded: 2001,
            country: 'Turki',
            region: 'asia-barat',
            products: ['Mobil Baru', 'Mobil Bekas'],
            tags: ['automotive', 'asia-barat', 'turki'],
            stats: { annualRevenue: '100M USD', monthlyVisitors: '10M', totalListings: '500K+', totalDealers: '2K+', marketShare: '15%', employees: '150' },
            status: 'aktif'
        }
    },
    
    // ==========================================================
    // 🇦🇪 UEA (2)
    // ==========================================================
    {
        text: 'Dubizzle - Marketplace UEA dengan otomotif. Didirikan 2005. Populer di kalangan ekspat.',
        metadata: {
            category: 'marplace',
            type: 'automotive',
            name: 'Dubizzle',
            founded: 2005,
            country: 'UEA',
            region: 'asia-barat',
            products: ['Mobil Baru', 'Mobil Bekas'],
            tags: ['automotive', 'asia-barat', 'uea'],
            stats: { annualRevenue: '200M USD', monthlyVisitors: '15M', totalListings: '1M+', totalDealers: '3K+', marketShare: '30%', employees: '300' },
            status: 'aktif'
        }
    },
    {
        text: 'YallaMotor - Platform otomotif UEA. Didirikan 2014. Fokus mobil baru & bekas.',
        metadata: {
            category: 'marplace',
            type: 'automotive',
            name: 'YallaMotor',
            founded: 2014,
            country: 'UEA',
            region: 'asia-barat',
            products: ['Mobil Baru', 'Mobil Bekas'],
            tags: ['automotive', 'asia-barat', 'uea'],
            stats: { annualRevenue: '80M USD', monthlyVisitors: '5M', totalListings: '300K+', totalDealers: '1K+', marketShare: '15%', employees: '100' },
            status: 'aktif'
        }
    },
    
    // ==========================================================
    // 🇧🇷 BRAZIL (2)
    // ==========================================================
    {
        text: 'Webmotors - Platform otomotif terbesar Brazil. Didirikan 1995. Acuan harga mobil Brazil.',
        metadata: {
            category: 'marplace',
            type: 'automotive',
            name: 'Webmotors',
            founded: 1995,
            country: 'Brazil',
            region: 'amerika-selatan',
            products: ['Mobil Baru', 'Mobil Bekas'],
            tags: ['automotive', 'amerika-selatan', 'terbesar'],
            stats: { annualRevenue: '300M USD', monthlyVisitors: '20M', totalListings: '1.5M+', totalDealers: '5K+', marketShare: '35%', employees: '400' },
            status: 'aktif'
        }
    },
    {
        text: 'iCarros - Platform otomotif Brazil. Didirikan 2006. Portal otomotif terkemuka.',
        metadata: {
            category: 'marplace',
            type: 'automotive',
            name: 'iCarros',
            founded: 2006,
            country: 'Brazil',
            region: 'amerika-selatan',
            products: ['Mobil Baru', 'Mobil Bekas'],
            tags: ['automotive', 'amerika-selatan', 'brazil'],
            stats: { annualRevenue: '100M USD', monthlyVisitors: '10M', totalListings: '800K+', totalDealers: '2K+', marketShare: '15%', employees: '150' },
            status: 'aktif'
        }
    },
    
    // ==========================================================
    // 🇦🇺 AUSTRALIA (2)
    // ==========================================================
    {
        text: 'Carsales - Platform otomotif terbesar Australia. Didirikan 1997. Acuan harga mobil Australia.',
        metadata: {
            category: 'marplace',
            type: 'automotive',
            name: 'Carsales',
            founded: 1997,
            country: 'Australia',
            region: 'osenian',
            products: ['Mobil Baru', 'Mobil Bekas'],
            tags: ['automotive', 'osenian', 'terbesar'],
            stats: { annualRevenue: '400M USD', monthlyVisitors: '20M', totalListings: '1.5M+', totalDealers: '4K+', marketShare: '35%', employees: '500' },
            status: 'aktif'
        }
    },
    {
        text: 'Drive - Platform otomotif Australia. Didirikan 1997. Review & komparasi mobil.',
        metadata: {
            category: 'marplace',
            type: 'automotive',
            name: 'Drive',
            founded: 1997,
            country: 'Australia',
            region: 'osenian',
            products: ['Mobil Baru', 'Mobil Bekas'],
            tags: ['automotive', 'osenian', 'australia'],
            stats: { annualRevenue: '150M USD', monthlyVisitors: '10M', totalListings: '800K+', totalDealers: '2K+', marketShare: '15%', employees: '200' },
            status: 'aktif'
        }
    },
    
    // ==========================================================
    // 🇿🇦 AFRIKA SELATAN (2)
    // ==========================================================
    {
        text: 'AutoTrader SA - Platform otomotif terbesar Afrika Selatan. Didirikan 1998.',
        metadata: {
            category: 'marplace',
            type: 'automotive',
            name: 'AutoTrader SA',
            founded: 1998,
            country: 'Afrika Selatan',
            region: 'afrika',
            products: ['Mobil Baru', 'Mobil Bekas'],
            tags: ['automotive', 'afrika', 'terbesar'],
            stats: { annualRevenue: '80M USD', monthlyVisitors: '8M', totalListings: '500K+', totalDealers: '2K+', marketShare: '30%', employees: '150' },
            status: 'aktif'
        }
    },
    {
        text: 'Cars.co.za - Platform otomotif Afrika Selatan. Didirikan 2006. Fokus dealer & review.',
        metadata: {
            category: 'marplace',
            type: 'automotive',
            name: 'Cars.co.za',
            founded: 2006,
            country: 'Afrika Selatan',
            region: 'afrika',
            products: ['Mobil Baru', 'Mobil Bekas'],
            tags: ['automotive', 'afrika', 'south-africa'],
            stats: { annualRevenue: '50M USD', monthlyVisitors: '5M', totalListings: '300K+', totalDealers: '1K+', marketShare: '15%', employees: '100' },
            status: 'aktif'
        }
    },
    
    // ==========================================================
    // 🇲🇽 MEKSIKO (2)
    // ==========================================================
    {
        text: 'Autocosmos - Platform otomotif terbesar Meksiko. Didirikan 1999. Review & komparasi.',
        metadata: {
            category: 'marplace',
            type: 'automotive',
            name: 'Autocosmos',
            founded: 1999,
            country: 'Meksiko',
            region: 'amerika-utara',
            products: ['Mobil Baru', 'Mobil Bekas'],
            tags: ['automotive', 'amerika-utara', 'meksiko'],
            stats: { annualRevenue: '100M USD', monthlyVisitors: '10M', totalListings: '800K+', totalDealers: '3K+', marketShare: '30%', employees: '150' },
            status: 'aktif'
        }
    },
    {
        text: 'Kavak - Platform jual-beli mobil online Meksiko. Didirikan 2016. Startup unicorn Meksiko.',
        metadata: {
            category: 'marplace',
            type: 'automotive',
            name: 'Kavak',
            founded: 2016,
            country: 'Meksiko',
            region: 'amerika-utara',
            products: ['Mobil Bekas'],
            tags: ['automotive', 'amerika-utara', 'startup'],
            stats: { annualRevenue: '2B USD', monthlyVisitors: '15M', totalListings: '500K+', totalDealers: '0', marketShare: '20%', employees: '5K' },
            status: 'aktif'
        }
    },
    
    // ==========================================================
    // 🇮🇩 INDONESIA (3)
    // ==========================================================
    {
        text: 'Mobil123 - Platform otomotif terbesar Indonesia. Didirikan 2007. Listing mobil baru, bekas, dan motor.',
        metadata: {
            category: 'marplace',
            type: 'automotive',
            name: 'Mobil123',
            founded: 2007,
            country: 'Indonesia',
            region: 'asia-tenggara',
            products: ['Mobil Baru', 'Mobil Bekas', 'Motor'],
            tags: ['automotive', 'asia-tenggara', 'indonesia'],
            stats: { annualRevenue: '50M USD', monthlyVisitors: '15M', totalListings: '1M+', totalDealers: '5K+', marketShare: '35%', employees: '200' },
            status: 'aktif'
        }
    },
    {
        text: 'Carmudi - Platform otomotif global di Indonesia. Didirikan 2013. Transparansi transaksi.',
        metadata: {
            category: 'marplace',
            type: 'automotive',
            name: 'Carmudi',
            founded: 2013,
            country: 'Indonesia',
            region: 'asia-tenggara',
            products: ['Mobil Baru', 'Mobil Bekas'],
            tags: ['automotive', 'asia-tenggara', 'indonesia'],
            stats: { annualRevenue: '20M USD', monthlyVisitors: '8M', totalListings: '500K+', totalDealers: '2K+', marketShare: '15%', employees: '100' },
            status: 'aktif'
        }
    },
    {
        text: 'OLX Indonesia - Marketplace otomotif. Didirikan 2006. Jual-beli mobil bekas.',
        metadata: {
            category: 'marplace',
            type: 'automotive',
            name: 'OLX Indonesia',
            founded: 2006,
            country: 'Indonesia',
            region: 'asia-tenggara',
            products: ['Mobil Bekas', 'Motor'],
            tags: ['automotive', 'asia-tenggara', 'indonesia'],
            stats: { annualRevenue: '30M USD', monthlyVisitors: '10M', totalListings: '800K+', totalDealers: '3K+', marketShare: '20%', employees: '150' },
            status: 'aktif'
        }
    },
    
    // ==========================================================
    // 🇪🇸 SPANYOL (2)
    // ==========================================================
    {
        text: 'Coches.net - Platform otomotif terbesar Spanyol. Didirikan 1999. Portal mobil Spanyol.',
        metadata: {
            category: 'marplace',
            type: 'automotive',
            name: 'Coches.net',
            founded: 1999,
            country: 'Spanyol',
            region: 'eropa',
            products: ['Mobil Baru', 'Mobil Bekas'],
            tags: ['automotive', 'eropa', 'spanyol'],
            stats: { annualRevenue: '150M USD', monthlyVisitors: '15M', totalListings: '1M+', totalDealers: '4K+', marketShare: '30%', employees: '200' },
            status: 'aktif'
        }
    },
    {
        text: 'AutoScout24 Spain - Versi AutoScout24 di Spanyol. Didirikan 2000.',
        metadata: {
            category: 'marplace',
            type: 'automotive',
            name: 'AutoScout24 Spain',
            founded: 2000,
            country: 'Spanyol',
            region: 'eropa',
            products: ['Mobil Baru', 'Mobil Bekas'],
            tags: ['automotive', 'eropa', 'spanyol'],
            stats: { annualRevenue: '80M USD', monthlyVisitors: '8M', totalListings: '500K+', totalDealers: '2K+', marketShare: '15%', employees: '100' },
            status: 'aktif'
        }
    },
    
    // ==========================================================
    // 🇮🇹 ITALIA (2)
    // ==========================================================
    {
        text: 'Autoscout24 Italia - Versi AutoScout24 di Italia. Didirikan 2000.',
        metadata: {
            category: 'marplace',
            type: 'automotive',
            name: 'Autoscout24 Italia',
            founded: 2000,
            country: 'Italia',
            region: 'eropa',
            products: ['Mobil Baru', 'Mobil Bekas'],
            tags: ['automotive', 'eropa', 'italia'],
            stats: { annualRevenue: '100M USD', monthlyVisitors: '10M', totalListings: '600K+', totalDealers: '3K+', marketShare: '25%', employees: '150' },
            status: 'aktif'
        }
    },
    {
        text: 'Quattroruote - Platform otomotif Italia. Didirikan 1995. Majalah & portal mobil.',
        metadata: {
            category: 'marplace',
            type: 'automotive',
            name: 'Quattroruote',
            founded: 1995,
            country: 'Italia',
            region: 'eropa',
            products: ['Mobil Baru', 'Mobil Bekas'],
            tags: ['automotive', 'eropa', 'italia'],
            stats: { annualRevenue: '50M USD', monthlyVisitors: '5M', totalListings: '300K+', totalDealers: '1K+', marketShare: '10%', employees: '100' },
            status: 'aktif'
        }
    },
    
    // ==========================================================
    // 🇨🇦 KANADA (2)
    // ==========================================================
    {
        text: 'AutoTrader Canada - Platform otomotif terbesar Kanada. Didirikan 2003.',
        metadata: {
            category: 'marplace',
            type: 'automotive',
            name: 'AutoTrader Canada',
            founded: 2003,
            country: 'Kanada',
            region: 'amerika-utara',
            products: ['Mobil Baru', 'Mobil Bekas'],
            tags: ['automotive', 'amerika-utara', 'kanada'],
            stats: { annualRevenue: '200M USD', monthlyVisitors: '15M', totalListings: '1M+', totalDealers: '4K+', marketShare: '30%', employees: '300' },
            status: 'aktif'
        }
    },
    {
        text: 'Kijiji Autos - Marketplace otomotif Kanada. Didirikan 2005. Bagian dari eBay Classifieds.',
        metadata: {
            category: 'marplace',
            type: 'automotive',
            name: 'Kijiji Autos',
            founded: 2005,
            country: 'Kanada',
            region: 'amerika-utara',
            products: ['Mobil Bekas'],
            tags: ['automotive', 'amerika-utara', 'kanada'],
            stats: { annualRevenue: '150M USD', monthlyVisitors: '10M', totalListings: '800K+', totalDealers: '2K+', marketShare: '20%', employees: '200' },
            status: 'aktif'
        }
    },
    
    // ==========================================================
    // 🇳🇱 BELANDA (3)
    // ==========================================================
    {
        text: 'Autotrack - Platform otomotif terbesar Belanda. Didirikan 1997.',
        metadata: {
            category: 'marplace',
            type: 'automotive',
            name: 'Autotrack',
            founded: 1997,
            country: 'Belanda',
            region: 'eropa',
            products: ['Mobil Baru', 'Mobil Bekas'],
            tags: ['automotive', 'eropa', 'belanda'],
            stats: { annualRevenue: '150M USD', monthlyVisitors: '10M', totalListings: '800K+', totalDealers: '3K+', marketShare: '30%', employees: '200' },
            status: 'aktif'
        }
    },
    {
        text: 'Gaspedaal - Aggregator otomotif Belanda. Didirikan 2005. Bandingkan harga mobil.',
        metadata: {
            category: 'marplace',
            type: 'automotive',
            name: 'Gaspedaal',
            founded: 2005,
            country: 'Belanda',
            region: 'eropa',
            products: ['Mobil Baru', 'Mobil Bekas'],
            tags: ['automotive', 'eropa', 'belanda'],
            stats: { annualRevenue: '80M USD', monthlyVisitors: '5M', totalListings: '500K+', totalDealers: '2K+', marketShare: '15%', employees: '100' },
            status: 'aktif'
        }
    },
    {
        text: 'Viabovag - Platform otomotif Belanda. Didirikan 2000. Fokus dealer.',
        metadata: {
            category: 'marplace',
            type: 'automotive',
            name: 'Viabovag',
            founded: 2000,
            country: 'Belanda',
            region: 'eropa',
            products: ['Mobil Baru', 'Mobil Bekas'],
            tags: ['automotive', 'eropa', 'belanda'],
            stats: { annualRevenue: '60M USD', monthlyVisitors: '5M', totalListings: '400K+', totalDealers: '1.5K+', marketShare: '10%', employees: '80' },
            status: 'aktif'
        }
    },
    
    // ==========================================================
    // 🇨🇭 SWISS (2)
    // ==========================================================
    {
        text: 'AutoScout24 Switzerland - Versi AutoScout24 di Swiss. Didirikan 2000.',
        metadata: {
            category: 'marplace',
            type: 'automotive',
            name: 'AutoScout24 Switzerland',
            founded: 2000,
            country: 'Swiss',
            region: 'eropa',
            products: ['Mobil Baru', 'Mobil Bekas'],
            tags: ['automotive', 'eropa', 'swiss'],
            stats: { annualRevenue: '120M USD', monthlyVisitors: '8M', totalListings: '600K+', totalDealers: '2K+', marketShare: '30%', employees: '150' },
            status: 'aktif'
        }
    },
    {
        text: 'TCS - Platform otomotif Swiss. Didirikan 1920. Fokus komunitas & review.',
        metadata: {
            category: 'marplace',
            type: 'automotive',
            name: 'TCS',
            founded: 1920,
            country: 'Swiss',
            region: 'eropa',
            products: ['Mobil Baru', 'Mobil Bekas'],
            tags: ['automotive', 'eropa', 'swiss'],
            stats: { annualRevenue: '50M USD', monthlyVisitors: '5M', totalListings: '300K+', totalDealers: '1K+', marketShare: '10%', employees: '100' },
            status: 'aktif'
        }
    },
    
    // ==========================================================
    // 🇦🇹 AUSTRIA (1)
    // ==========================================================
    {
        text: 'Autoscout24 Austria - Versi AutoScout24 di Austria. Didirikan 2000.',
        metadata: {
            category: 'marplace',
            type: 'automotive',
            name: 'Autoscout24 Austria',
            founded: 2000,
            country: 'Austria',
            region: 'eropa',
            products: ['Mobil Baru', 'Mobil Bekas'],
            tags: ['automotive', 'eropa', 'austria'],
            stats: { annualRevenue: '80M USD', monthlyVisitors: '5M', totalListings: '400K+', totalDealers: '1.5K+', marketShare: '25%', employees: '100' },
            status: 'aktif'
        }
    },
    
    // ==========================================================
    // 🇵🇱 POLANDIA (2)
    // ==========================================================
    {
        text: 'Otomoto - Platform otomotif terbesar Polandia. Didirikan 2006.',
        metadata: {
            category: 'marplace',
            type: 'automotive',
            name: 'Otomoto',
            founded: 2006,
            country: 'Polandia',
            region: 'eropa',
            products: ['Mobil Baru', 'Mobil Bekas'],
            tags: ['automotive', 'eropa', 'polandia'],
            stats: { annualRevenue: '80M USD', monthlyVisitors: '10M', totalListings: '800K+', totalDealers: '3K+', marketShare: '30%', employees: '150' },
            status: 'aktif'
        }
    },
    {
        text: 'Gratka Motoryzacyjne - Platform otomotif Polandia. Didirikan 2005.',
        metadata: {
            category: 'marplace',
            type: 'automotive',
            name: 'Gratka Motoryzacyjne',
            founded: 2005,
            country: 'Polandia',
            region: 'eropa',
            products: ['Mobil Baru', 'Mobil Bekas'],
            tags: ['automotive', 'eropa', 'polandia'],
            stats: { annualRevenue: '50M USD', monthlyVisitors: '5M', totalListings: '400K+', totalDealers: '1.5K+', marketShare: '15%', employees: '80' },
            status: 'aktif'
        }
    },
    
    // ==========================================================
    // 🇨🇿 CEKO (2)
    // ==========================================================
    {
        text: 'Sauto - Platform otomotif terbesar Ceko. Didirikan 2000.',
        metadata: {
            category: 'marplace',
            type: 'automotive',
            name: 'Sauto',
            founded: 2000,
            country: 'Ceko',
            region: 'eropa',
            products: ['Mobil Baru', 'Mobil Bekas'],
            tags: ['automotive', 'eropa', 'ceko'],
            stats: { annualRevenue: '60M USD', monthlyVisitors: '5M', totalListings: '400K+', totalDealers: '1.5K+', marketShare: '25%', employees: '100' },
            status: 'aktif'
        }
    },
    {
        text: 'TipCars - Platform otomotif Ceko. Didirikan 2005.',
        metadata: {
            category: 'marplace',
            type: 'automotive',
            name: 'TipCars',
            founded: 2005,
            country: 'Ceko',
            region: 'eropa',
            products: ['Mobil Baru', 'Mobil Bekas'],
            tags: ['automotive', 'eropa', 'ceko'],
            stats: { annualRevenue: '40M USD', monthlyVisitors: '3M', totalListings: '300K+', totalDealers: '1K+', marketShare: '15%', employees: '70' },
            status: 'aktif'
        }
    },
    
    // ==========================================================
    // 🇸🇪 SWEDIA (2)
    // ==========================================================
    {
        text: 'Blocket - Platform marketplace terbesar Swedia dengan otomotif. Didirikan 1996.',
        metadata: {
            category: 'marplace',
            type: 'automotive',
            name: 'Blocket',
            founded: 1996,
            country: 'Swedia',
            region: 'eropa',
            products: ['Mobil Baru', 'Mobil Bekas'],
            tags: ['automotive', 'eropa', 'swedia'],
            stats: { annualRevenue: '100M USD', monthlyVisitors: '8M', totalListings: '600K+', totalDealers: '2K+', marketShare: '30%', employees: '150' },
            status: 'aktif'
        }
    },
    {
        text: 'Bytbil - Platform otomotif Swedia. Didirikan 2000. Fokus mobil bekas.',
        metadata: {
            category: 'marplace',
            type: 'automotive',
            name: 'Bytbil',
            founded: 2000,
            country: 'Swedia',
            region: 'eropa',
            products: ['Mobil Bekas'],
            tags: ['automotive', 'eropa', 'swedia'],
            stats: { annualRevenue: '50M USD', monthlyVisitors: '3M', totalListings: '200K+', totalDealers: '1K+', marketShare: '15%', employees: '60' },
            status: 'aktif'
        }
    },
    
    // ==========================================================
    // 🇳🇴 NORWEGIA (2)
    // ==========================================================
    {
        text: 'Finn.no - Platform marketplace terbesar Norwegia dengan otomotif. Didirikan 2000.',
        metadata: {
            category: 'marplace',
            type: 'automotive',
            name: 'Finn.no',
            founded: 2000,
            country: 'Norwegia',
            region: 'eropa',
            products: ['Mobil Baru', 'Mobil Bekas'],
            tags: ['automotive', 'eropa', 'norwegia'],
            stats: { annualRevenue: '80M USD', monthlyVisitors: '5M', totalListings: '400K+', totalDealers: '1.5K+', marketShare: '30%', employees: '100' },
            status: 'aktif'
        }
    },
    {
        text: 'Nettbil - Platform otomotif Norwegia. Didirikan 2015. Fokus mobil bekas online.',
        metadata: {
            category: 'marplace',
            type: 'automotive',
            name: 'Nettbil',
            founded: 2015,
            country: 'Norwegia',
            region: 'eropa',
            products: ['Mobil Bekas'],
            tags: ['automotive', 'eropa', 'norwegia'],
            stats: { annualRevenue: '30M USD', monthlyVisitors: '2M', totalListings: '150K+', totalDealers: '500+', marketShare: '10%', employees: '40' },
            status: 'aktif'
        }
    },
    
    // ==========================================================
    // 🇩🇰 DENMARK (2)
    // ==========================================================
    {
        text: 'Bilbasen - Platform otomotif terbesar Denmark. Didirikan 1999.',
        metadata: {
            category: 'marplace',
            type: 'automotive',
            name: 'Bilbasen',
            founded: 1999,
            country: 'Denmark',
            region: 'eropa',
            products: ['Mobil Baru', 'Mobil Bekas'],
            tags: ['automotive', 'eropa', 'denmark'],
            stats: { annualRevenue: '70M USD', monthlyVisitors: '5M', totalListings: '400K+', totalDealers: '1.5K+', marketShare: '30%', employees: '90' },
            status: 'aktif'
        }
    },
    {
        text: 'DBA - Platform marketplace Denmark dengan otomotif. Didirikan 1995.',
        metadata: {
            category: 'marplace',
            type: 'automotive',
            name: 'DBA',
            founded: 1995,
            country: 'Denmark',
            region: 'eropa',
            products: ['Mobil Baru', 'Mobil Bekas'],
            tags: ['automotive', 'eropa', 'denmark'],
            stats: { annualRevenue: '40M USD', monthlyVisitors: '3M', totalListings: '200K+', totalDealers: '1K+', marketShare: '15%', employees: '60' },
            status: 'aktif'
        }
    },
    
    // ==========================================================
    // 🇫🇮 FINLANDIA (2)
    // ==========================================================
    {
        text: 'Nettiauto - Platform otomotif terbesar Finlandia. Didirikan 2001.',
        metadata: {
            category: 'marplace',
            type: 'automotive',
            name: 'Nettiauto',
            founded: 2001,
            country: 'Finlandia',
            region: 'eropa',
            products: ['Mobil Baru', 'Mobil Bekas'],
            tags: ['automotive', 'eropa', 'finlandia'],
            stats: { annualRevenue: '60M USD', monthlyVisitors: '4M', totalListings: '300K+', totalDealers: '1.2K+', marketShare: '30%', employees: '80' },
            status: 'aktif'
        }
    },
    {
        text: 'Autotalli - Platform otomotif Finlandia. Didirikan 2005.',
        metadata: {
            category: 'marplace',
            type: 'automotive',
            name: 'Autotalli',
            founded: 2005,
            country: 'Finlandia',
            region: 'eropa',
            products: ['Mobil Baru', 'Mobil Bekas'],
            tags: ['automotive', 'eropa', 'finlandia'],
            stats: { annualRevenue: '30M USD', monthlyVisitors: '2M', totalListings: '150K+', totalDealers: '500+', marketShare: '15%', employees: '40' },
            status: 'aktif'
        }
    },
    
    // ==========================================================
    // 🇦🇷 ARGENTINA (2)
    // ==========================================================
    {
        text: 'Mercado Libre Autos - Kategori otomotif Mercado Libre Argentina. Didirikan 1999.',
        metadata: {
            category: 'marplace',
            type: 'automotive',
            name: 'Mercado Libre Autos',
            founded: 1999,
            country: 'Argentina',
            region: 'amerika-selatan',
            products: ['Mobil Baru', 'Mobil Bekas'],
            tags: ['automotive', 'amerika-selatan', 'argentina'],
            stats: { annualRevenue: '200M USD', monthlyVisitors: '15M', totalListings: '1M+', totalDealers: '3K+', marketShare: '40%', employees: '300' },
            status: 'aktif'
        }
    },
    {
        text: 'OLX Autos Argentina - Kategori otomotif OLX Argentina. Didirikan 2006.',
        metadata: {
            category: 'marplace',
            type: 'automotive',
            name: 'OLX Autos Argentina',
            founded: 2006,
            country: 'Argentina',
            region: 'amerika-selatan',
            products: ['Mobil Bekas'],
            tags: ['automotive', 'amerika-selatan', 'argentina'],
            stats: { annualRevenue: '80M USD', monthlyVisitors: '5M', totalListings: '300K+', totalDealers: '1K+', marketShare: '15%', employees: '100' },
            status: 'aktif'
        }
    },
    
    // ==========================================================
    // 🇵🇹 PORTUGAL (2) — BARU!
    // ==========================================================
    {
        text: 'Standvirtual - Platform otomotif terbesar Portugal. Didirikan 2000.',
        metadata: {
            category: 'marplace',
            type: 'automotive',
            name: 'Standvirtual',
            founded: 2000,
            country: 'Portugal',
            region: 'eropa',
            products: ['Mobil Baru', 'Mobil Bekas'],
            tags: ['automotive', 'eropa', 'portugal'],
            stats: { annualRevenue: '50M USD', monthlyVisitors: '5M', totalListings: '300K+', totalDealers: '1.5K+', marketShare: '30%', employees: '80' },
            status: 'aktif'
        }
    },
    {
        text: 'CustoJusto - Platform marketplace Portugal dengan otomotif. Didirikan 2005.',
        metadata: {
            category: 'marplace',
            type: 'automotive',
            name: 'CustoJusto',
            founded: 2005,
            country: 'Portugal',
            region: 'eropa',
            products: ['Mobil Baru', 'Mobil Bekas'],
            tags: ['automotive', 'eropa', 'portugal'],
            stats: { annualRevenue: '30M USD', monthlyVisitors: '3M', totalListings: '200K+', totalDealers: '1K+', marketShare: '15%', employees: '50' },
            status: 'aktif'
        }
    },
    
    // ==========================================================
    // 🇬🇷 YUNANI (2) — BARU!
    // ==========================================================
    {
        text: 'Car.gr - Platform otomotif terbesar Yunani. Didirikan 2001.',
        metadata: {
            category: 'marplace',
            type: 'automotive',
            name: 'Car.gr',
            founded: 2001,
            country: 'Yunani',
            region: 'eropa',
            products: ['Mobil Baru', 'Mobil Bekas'],
            tags: ['automotive', 'eropa', 'yunani'],
            stats: { annualRevenue: '30M USD', monthlyVisitors: '3M', totalListings: '200K+', totalDealers: '1K+', marketShare: '30%', employees: '50' },
            status: 'aktif'
        }
    },
    {
        text: 'Autopark - Platform otomotif Yunani. Didirikan 2005.',
        metadata: {
            category: 'marplace',
            type: 'automotive',
            name: 'Autopark',
            founded: 2005,
            country: 'Yunani',
            region: 'eropa',
            products: ['Mobil Baru', 'Mobil Bekas'],
            tags: ['automotive', 'eropa', 'yunani'],
            stats: { annualRevenue: '15M USD', monthlyVisitors: '2M', totalListings: '100K+', totalDealers: '500+', marketShare: '15%', employees: '30' },
            status: 'aktif'
        }
    },
    
    // ==========================================================
    // 🇷🇴 ROMANIA (2) — BARU!
    // ==========================================================
    {
        text: 'Autovit.ro - Platform otomotif terbesar Romania. Didirikan 2001.',
        metadata: {
            category: 'marplace',
            type: 'automotive',
            name: 'Autovit.ro',
            founded: 2001,
            country: 'Romania',
            region: 'eropa',
            products: ['Mobil Baru', 'Mobil Bekas'],
            tags: ['automotive', 'eropa', 'romania'],
            stats: { annualRevenue: '25M USD', monthlyVisitors: '3M', totalListings: '200K+', totalDealers: '1K+', marketShare: '30%', employees: '50' },
            status: 'aktif'
        }
    },
    {
        text: 'Masini.ro - Platform otomotif Romania. Didirikan 2003.',
        metadata: {
            category: 'marplace',
            type: 'automotive',
            name: 'Masini.ro',
            founded: 2003,
            country: 'Romania',
            region: 'eropa',
            products: ['Mobil Baru', 'Mobil Bekas'],
            tags: ['automotive', 'eropa', 'romania'],
            stats: { annualRevenue: '15M USD', monthlyVisitors: '2M', totalListings: '100K+', totalDealers: '500+', marketShare: '15%', employees: '30' },
            status: 'aktif'
        }
    },
    
    // ==========================================================
    // 🇳🇿 SELANDIA BARU (1) — BARU!
    // ==========================================================
    {
        text: 'TradeMe Motors - Platform otomotif terbesar Selandia Baru. Didirikan 1999.',
        metadata: {
            category: 'marplace',
            type: 'automotive',
            name: 'TradeMe Motors',
            founded: 1999,
            country: 'Selandia Baru',
            region: 'osenian',
            products: ['Mobil Baru', 'Mobil Bekas'],
            tags: ['automotive', 'osenian', 'selandia-baru'],
            stats: { annualRevenue: '50M USD', monthlyVisitors: '5M', totalListings: '300K+', totalDealers: '1.5K+', marketShare: '35%', employees: '80' },
            status: 'aktif'
        }
    },
    
    // ==========================================================
    // 🇸🇦 ARAB SAUDI (1) — BARU!
    // ==========================================================
    {
        text: 'Haraj - Platform marketplace terbesar Arab Saudi dengan otomotif. Didirikan 2006.',
        metadata: {
            category: 'marplace',
            type: 'automotive',
            name: 'Haraj',
            founded: 2006,
            country: 'Arab Saudi',
            region: 'asia-barat',
            products: ['Mobil Baru', 'Mobil Bekas'],
            tags: ['automotive', 'asia-barat', 'saudi'],
            stats: { annualRevenue: '80M USD', monthlyVisitors: '10M', totalListings: '500K+', totalDealers: '2K+', marketShare: '35%', employees: '120' },
            status: 'aktif'
        }
    },
    
    // ==========================================================
    // 🇪🇬 MESIR (1) — BARU!
    // ==========================================================
    {
        text: 'Hatla2ee - Platform otomotif terbesar Mesir. Didirikan 2010.',
        metadata: {
            category: 'marplace',
            type: 'automotive',
            name: 'Hatla2ee',
            founded: 2010,
            country: 'Mesir',
            region: 'afrika',
            products: ['Mobil Baru', 'Mobil Bekas'],
            tags: ['automotive', 'afrika', 'mesir'],
            stats: { annualRevenue: '20M USD', monthlyVisitors: '3M', totalListings: '150K+', totalDealers: '500+', marketShare: '30%', employees: '40' },
            status: 'aktif'
        }
    },
    
    // ==========================================================
    // 🇲🇦 MAROKO (1) — BARU!
    // ==========================================================
    {
        text: 'Avito Auto - Platform otomotif terbesar Maroko. Didirikan 2006.',
        metadata: {
            category: 'marplace',
            type: 'automotive',
            name: 'Avito Auto',
            founded: 2006,
            country: 'Maroko',
            region: 'afrika',
            products: ['Mobil Baru', 'Mobil Bekas'],
            tags: ['automotive', 'afrika', 'maroko'],
            stats: { annualRevenue: '15M USD', monthlyVisitors: '2M', totalListings: '100K+', totalDealers: '500+', marketShare: '25%', employees: '30' },
            status: 'aktif'
        }
    }
];

export const DATA = data;
