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

export const DATA = data;
