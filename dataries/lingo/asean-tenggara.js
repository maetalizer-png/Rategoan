const data = [
    // ==========================================================
    // 🇮🇩 INDONESIA — 16 BAHASA
    // ==========================================================
    {
        text: 'Bahasa Indonesia - Bahasa resmi dan nasional Indonesia. Digunakan oleh lebih dari 270 juta penutur. Termasuk rumpun bahasa Austronesia. Menggunakan aksara Latin.',
        metadata: {
            category: 'language',
            region: 'asean-tenggara',
            country: 'Indonesia',
            name: 'Bahasa Indonesia',
            code: 'id',
            speakers: 270000000,
            family: 'Austronesia',
            script: 'Latin',
            status: 'resmi',
            tags: ['bahasa', 'asean-tenggara', 'indonesia', 'resmi']
        }
    },
    {
        text: 'Bahasa Jawa - Bahasa daerah terbesar di Indonesia. Digunakan oleh lebih dari 80 juta penutur di Jawa Tengah, Yogyakarta, dan Jawa Timur. Termasuk rumpun bahasa Austronesia.',
        metadata: {
            category: 'language',
            region: 'asean-tenggara',
            country: 'Indonesia',
            name: 'Bahasa Jawa',
            code: 'jv',
            speakers: 80000000,
            family: 'Austronesia',
            script: 'Latin, Jawa',
            status: 'daerah',
            tags: ['bahasa', 'asean-tenggara', 'indonesia', 'jawa']
        }
    },
    {
        text: 'Bahasa Sunda - Bahasa daerah di Jawa Barat dan Banten. Digunakan oleh lebih dari 40 juta penutur. Termasuk rumpun bahasa Austronesia.',
        metadata: {
            category: 'language',
            region: 'asean-tenggara',
            country: 'Indonesia',
            name: 'Bahasa Sunda',
            code: 'su',
            speakers: 40000000,
            family: 'Austronesia',
            script: 'Latin, Sunda',
            status: 'daerah',
            tags: ['bahasa', 'asean-tenggara', 'indonesia', 'sunda']
        }
    },
    {
        text: 'Bahasa Melayu - Bahasa daerah di Sumatera dan Kalimantan. Digunakan oleh lebih dari 20 juta penutur. Termasuk rumpun bahasa Austronesia. Merupakan dasar dari Bahasa Indonesia.',
        metadata: {
            category: 'language',
            region: 'asean-tenggara',
            country: 'Indonesia',
            name: 'Bahasa Melayu',
            code: 'ms',
            speakers: 20000000,
            family: 'Austronesia',
            script: 'Latin, Jawi',
            status: 'daerah',
            tags: ['bahasa', 'asean-tenggara', 'indonesia', 'melayu']
        }
    },
    {
        text: 'Bahasa Madura - Bahasa daerah di Pulau Madura dan sebagian Jawa Timur. Digunakan oleh lebih dari 15 juta penutur. Termasuk rumpun bahasa Austronesia.',
        metadata: {
            category: 'language',
            region: 'asean-tenggara',
            country: 'Indonesia',
            name: 'Bahasa Madura',
            code: 'mad',
            speakers: 15000000,
            family: 'Austronesia',
            script: 'Latin',
            status: 'daerah',
            tags: ['bahasa', 'asean-tenggara', 'indonesia', 'madura']
        }
    },
    {
        text: 'Bahasa Minangkabau - Bahasa daerah di Sumatera Barat. Digunakan oleh lebih dari 6 juta penutur. Termasuk rumpun bahasa Austronesia.',
        metadata: {
            category: 'language',
            region: 'asean-tenggara',
            country: 'Indonesia',
            name: 'Bahasa Minangkabau',
            code: 'min',
            speakers: 6000000,
            family: 'Austronesia',
            script: 'Latin',
            status: 'daerah',
            tags: ['bahasa', 'asean-tenggara', 'indonesia', 'minangkabau']
        }
    },
    {
        text: 'Bahasa Bugis - Bahasa daerah di Sulawesi Selatan. Digunakan oleh lebih dari 5 juta penutur. Termasuk rumpun bahasa Austronesia. Memiliki aksara Lontara.',
        metadata: {
            category: 'language',
            region: 'asean-tenggara',
            country: 'Indonesia',
            name: 'Bahasa Bugis',
            code: 'bug',
            speakers: 5000000,
            family: 'Austronesia',
            script: 'Latin, Lontara',
            status: 'daerah',
            tags: ['bahasa', 'asean-tenggara', 'indonesia', 'bugis']
        }
    },
    {
        text: 'Bahasa Bali - Bahasa daerah di Bali. Digunakan oleh lebih dari 4 juta penutur. Termasuk rumpun bahasa Austronesia. Memiliki sistem tingkatan bahasa.',
        metadata: {
            category: 'language',
            region: 'asean-tenggara',
            country: 'Indonesia',
            name: 'Bahasa Bali',
            code: 'ban',
            speakers: 4000000,
            family: 'Austronesia',
            script: 'Latin, Bali',
            status: 'daerah',
            tags: ['bahasa', 'asean-tenggara', 'indonesia', 'bali']
        }
    },
    {
        text: 'Bahasa Batak Toba - Bahasa daerah di Sumatera Utara. Digunakan oleh lebih dari 3 juta penutur. Termasuk rumpun bahasa Austronesia.',
        metadata: {
            category: 'language',
            region: 'asean-tenggara',
            country: 'Indonesia',
            name: 'Bahasa Batak Toba',
            code: 'bbc',
            speakers: 3000000,
            family: 'Austronesia',
            script: 'Latin, Batak',
            status: 'daerah',
            tags: ['bahasa', 'asean-tenggara', 'indonesia', 'batak']
        }
    },
    {
        text: 'Bahasa Aceh - Bahasa daerah di Aceh. Digunakan oleh lebih dari 2.5 juta penutur. Termasuk rumpun bahasa Austronesia.',
        metadata: {
            category: 'language',
            region: 'asean-tenggara',
            country: 'Indonesia',
            name: 'Bahasa Aceh',
            code: 'ace',
            speakers: 2500000,
            family: 'Austronesia',
            script: 'Latin',
            status: 'daerah',
            tags: ['bahasa', 'asean-tenggara', 'indonesia', 'aceh']
        }
    },
    {
        text: 'Bahasa Banjar - Bahasa daerah di Kalimantan Selatan. Digunakan oleh lebih dari 4 juta penutur. Termasuk rumpun bahasa Austronesia.',
        metadata: {
            category: 'language',
            region: 'asean-tenggara',
            country: 'Indonesia',
            name: 'Bahasa Banjar',
            code: 'bjn',
            speakers: 4000000,
            family: 'Austronesia',
            script: 'Latin',
            status: 'daerah',
            tags: ['bahasa', 'asean-tenggara', 'indonesia', 'banjar']
        }
    },
    {
        text: 'Bahasa Dayak Ngaju - Bahasa daerah di Kalimantan Tengah. Digunakan oleh lebih dari 1 juta penutur. Termasuk rumpun bahasa Austronesia.',
        metadata: {
            category: 'language',
            region: 'asean-tenggara',
            country: 'Indonesia',
            name: 'Bahasa Dayak Ngaju',
            code: 'nij',
            speakers: 1000000,
            family: 'Austronesia',
            script: 'Latin',
            status: 'daerah',
            tags: ['bahasa', 'asean-tenggara', 'indonesia', 'dayak']
        }
    },
    {
        text: 'Bahasa Makassar - Bahasa daerah di Sulawesi Selatan. Digunakan oleh lebih dari 2 juta penutur. Termasuk rumpun bahasa Austronesia.',
        metadata: {
            category: 'language',
            region: 'asean-tenggara',
            country: 'Indonesia',
            name: 'Bahasa Makassar',
            code: 'mak',
            speakers: 2000000,
            family: 'Austronesia',
            script: 'Latin',
            status: 'daerah',
            tags: ['bahasa', 'asean-tenggara', 'indonesia', 'makassar']
        }
    },
    {
        text: 'Bahasa Sasak - Bahasa daerah di Lombok, Nusa Tenggara Barat. Digunakan oleh lebih dari 2.5 juta penutur. Termasuk rumpun bahasa Austronesia.',
        metadata: {
            category: 'language',
            region: 'asean-tenggara',
            country: 'Indonesia',
            name: 'Bahasa Sasak',
            code: 'sas',
            speakers: 2500000,
            family: 'Austronesia',
            script: 'Latin',
            status: 'daerah',
            tags: ['bahasa', 'asean-tenggara', 'indonesia', 'sasak']
        }
    },
    {
        text: 'Bahasa Bima - Bahasa daerah di Bima, Nusa Tenggara Barat. Digunakan oleh lebih dari 500 ribu penutur. Termasuk rumpun bahasa Austronesia.',
        metadata: {
            category: 'language',
            region: 'asean-tenggara',
            country: 'Indonesia',
            name: 'Bahasa Bima',
            code: 'bhp',
            speakers: 500000,
            family: 'Austronesia',
            script: 'Latin',
            status: 'daerah',
            tags: ['bahasa', 'asean-tenggara', 'indonesia', 'bima']
        }
    },
    {
        text: 'Bahasa Bajau - Bahasa daerah di Sulawesi dan Kalimantan Timur. Digunakan oleh lebih dari 500 ribu penutur. Termasuk rumpun bahasa Austronesia.',
        metadata: {
            category: 'language',
            region: 'asean-tenggara',
            country: 'Indonesia',
            name: 'Bahasa Bajau',
            code: 'bdl',
            speakers: 500000,
            family: 'Austronesia',
            script: 'Latin',
            status: 'daerah',
            tags: ['bahasa', 'asean-tenggara', 'indonesia', 'bajau']
        }
    },
    // ==========================================================
    // 🇲🇾 MALAYSIA — 8 BAHASA
    // ==========================================================
    {
        text: 'Bahasa Melayu - Bahasa resmi Malaysia. Digunakan oleh lebih dari 20 juta penutur. Termasuk rumpun bahasa Austronesia. Menggunakan aksara Latin dan Jawi.',
        metadata: {
            category: 'language',
            region: 'asean-tenggara',
            country: 'Malaysia',
            name: 'Bahasa Melayu',
            code: 'ms',
            speakers: 20000000,
            family: 'Austronesia',
            script: 'Latin, Jawi',
            status: 'resmi',
            tags: ['bahasa', 'asean-tenggara', 'malaysia', 'resmi']
        }
    },
    {
        text: 'Bahasa Inggris - Bahasa resmi Malaysia. Digunakan oleh lebih dari 15 juta penutur. Termasuk rumpun bahasa Jermanik.',
        metadata: {
            category: 'language',
            region: 'asean-tenggara',
            country: 'Malaysia',
            name: 'Bahasa Inggris',
            code: 'en',
            speakers: 15000000,
            family: 'Jermanik',
            script: 'Latin',
            status: 'resmi',
            tags: ['bahasa', 'asean-tenggara', 'malaysia', 'resmi']
        }
    },
    {
        text: 'Bahasa Mandarin - Bahasa yang digunakan oleh komunitas Tionghoa Malaysia. Digunakan oleh lebih dari 7 juta penutur. Termasuk rumpun bahasa Sino-Tibet.',
        metadata: {
            category: 'language',
            region: 'asean-tenggara',
            country: 'Malaysia',
            name: 'Bahasa Mandarin',
            code: 'zh',
            speakers: 7000000,
            family: 'Sino-Tibet',
            script: 'Hanzi',
            status: 'daerah',
            tags: ['bahasa', 'asean-tenggara', 'malaysia', 'mandarin']
        }
    },
    {
        text: 'Bahasa Tamil - Bahasa yang digunakan oleh komunitas India Malaysia. Digunakan oleh lebih dari 2 juta penutur. Termasuk rumpun bahasa Dravida.',
        metadata: {
            category: 'language',
            region: 'asean-tenggara',
            country: 'Malaysia',
            name: 'Bahasa Tamil',
            code: 'ta',
            speakers: 2000000,
            family: 'Dravida',
            script: 'Tamil',
            status: 'daerah',
            tags: ['bahasa', 'asean-tenggara', 'malaysia', 'tamil']
        }
    },
    {
        text: 'Bahasa Kantonis - Bahasa yang digunakan oleh komunitas Tionghoa di Kuala Lumpur dan Ipoh. Digunakan oleh lebih dari 2 juta penutur. Termasuk rumpun bahasa Sino-Tibet.',
        metadata: {
            category: 'language',
            region: 'asean-tenggara',
            country: 'Malaysia',
            name: 'Bahasa Kantonis',
            code: 'yue',
            speakers: 2000000,
            family: 'Sino-Tibet',
            script: 'Hanzi',
            status: 'daerah',
            tags: ['bahasa', 'asean-tenggara', 'malaysia', 'kantonis']
        }
    },
    {
        text: 'Bahasa Hokkien - Bahasa yang digunakan oleh komunitas Tionghoa di Penang dan Johor. Digunakan oleh lebih dari 1.5 juta penutur. Termasuk rumpun bahasa Sino-Tibet.',
        metadata: {
            category: 'language',
            region: 'asean-tenggara',
            country: 'Malaysia',
            name: 'Bahasa Hokkien',
            code: 'nan',
            speakers: 1500000,
            family: 'Sino-Tibet',
            script: 'Hanzi',
            status: 'daerah',
            tags: ['bahasa', 'asean-tenggara', 'malaysia', 'hokkien']
        }
    },
    {
        text: 'Bahasa Hakka - Bahasa yang digunakan oleh komunitas Tionghoa di Sabah dan Sarawak. Digunakan oleh lebih dari 1 juta penutur. Termasuk rumpun bahasa Sino-Tibet.',
        metadata: {
            category: 'language',
            region: 'asean-tenggara',
            country: 'Malaysia',
            name: 'Bahasa Hakka',
            code: 'hak',
            speakers: 1000000,
            family: 'Sino-Tibet',
            script: 'Hanzi',
            status: 'daerah',
            tags: ['bahasa', 'asean-tenggara', 'malaysia', 'hakka']
        }
    },
    {
        text: 'Bahasa Melayu Sabah - Bahasa daerah di Sabah. Digunakan oleh lebih dari 500 ribu penutur. Termasuk rumpun bahasa Austronesia.',
        metadata: {
            category: 'language',
            region: 'asean-tenggara',
            country: 'Malaysia',
            name: 'Bahasa Melayu Sabah',
            code: 'msb',
            speakers: 500000,
            family: 'Austronesia',
            script: 'Latin',
            status: 'daerah',
            tags: ['bahasa', 'asean-tenggara', 'malaysia', 'sabah']
        }
    },
    // ==========================================================
    // 🇸🇬 SINGAPURA — 4 BAHASA
    // ==========================================================
    {
        text: 'Bahasa Inggris - Bahasa resmi Singapura. Digunakan oleh lebih dari 4 juta penutur. Termasuk rumpun bahasa Jermanik.',
        metadata: {
            category: 'language',
            region: 'asean-tenggara',
            country: 'Singapura',
            name: 'Bahasa Inggris',
            code: 'en',
            speakers: 4000000,
            family: 'Jermanik',
            script: 'Latin',
            status: 'resmi',
            tags: ['bahasa', 'asean-tenggara', 'singapura', 'resmi']
        }
    },
    {
        text: 'Bahasa Melayu - Bahasa resmi Singapura. Digunakan oleh lebih dari 1 juta penutur. Termasuk rumpun bahasa Austronesia.',
        metadata: {
            category: 'language',
            region: 'asean-tenggara',
            country: 'Singapura',
            name: 'Bahasa Melayu',
            code: 'ms',
            speakers: 1000000,
            family: 'Austronesia',
            script: 'Latin, Jawi',
            status: 'resmi',
            tags: ['bahasa', 'asean-tenggara', 'singapura', 'resmi']
        }
    },
    {
        text: 'Bahasa Mandarin - Bahasa resmi Singapura. Digunakan oleh lebih dari 3 juta penutur. Termasuk rumpun bahasa Sino-Tibet.',
        metadata: {
            category: 'language',
            region: 'asean-tenggara',
            country: 'Singapura',
            name: 'Bahasa Mandarin',
            code: 'zh',
            speakers: 3000000,
            family: 'Sino-Tibet',
            script: 'Hanzi',
            status: 'resmi',
            tags: ['bahasa', 'asean-tenggara', 'singapura', 'resmi']
        }
    },
    {
        text: 'Bahasa Tamil - Bahasa resmi Singapura. Digunakan oleh lebih dari 500 ribu penutur. Termasuk rumpun bahasa Dravida.',
        metadata: {
            category: 'language',
            region: 'asean-tenggara',
            country: 'Singapura',
            name: 'Bahasa Tamil',
            code: 'ta',
            speakers: 500000,
            family: 'Dravida',
            script: 'Tamil',
            status: 'resmi',
            tags: ['bahasa', 'asean-tenggara', 'singapura', 'resmi']
        }
    },
    // ==========================================================
    // 🇹🇭 THAILAND — 6 BAHASA
    // ==========================================================
    {
        text: 'Bahasa Thai - Bahasa resmi Thailand. Digunakan oleh lebih dari 50 juta penutur. Termasuk rumpun bahasa Tai-Kadai. Menggunakan aksara Thai.',
        metadata: {
            category: 'language',
            region: 'asean-tenggara',
            country: 'Thailand',
            name: 'Bahasa Thai',
            code: 'th',
            speakers: 50000000,
            family: 'Tai-Kadai',
            script: 'Thai',
            status: 'resmi',
            tags: ['bahasa', 'asean-tenggara', 'thailand', 'resmi']
        }
    },
    {
        text: 'Bahasa Isan - Bahasa daerah di Thailand timur laut. Digunakan oleh lebih dari 20 juta penutur. Termasuk rumpun bahasa Tai-Kadai. Sangat dekat dengan bahasa Lao.',
        metadata: {
            category: 'language',
            region: 'asean-tenggara',
            country: 'Thailand',
            name: 'Bahasa Isan',
            code: 'tts',
            speakers: 20000000,
            family: 'Tai-Kadai',
            script: 'Thai',
            status: 'daerah',
            tags: ['bahasa', 'asean-tenggara', 'thailand', 'isan']
        }
    },
    {
        text: 'Bahasa Kam Mueang - Bahasa daerah di Thailand utara. Digunakan oleh lebih dari 6 juta penutur. Termasuk rumpun bahasa Tai-Kadai.',
        metadata: {
            category: 'language',
            region: 'asean-tenggara',
            country: 'Thailand',
            name: 'Bahasa Kam Mueang',
            code: 'nod',
            speakers: 6000000,
            family: 'Tai-Kadai',
            script: 'Thai',
            status: 'daerah',
            tags: ['bahasa', 'asean-tenggara', 'thailand', 'kam-mueang']
        }
    },
    {
        text: 'Bahasa Pak Tai - Bahasa daerah di Thailand selatan. Digunakan oleh lebih dari 5 juta penutur. Termasuk rumpun bahasa Tai-Kadai.',
        metadata: {
            category: 'language',
            region: 'asean-tenggara',
            country: 'Thailand',
            name: 'Bahasa Pak Tai',
            code: 'sou',
            speakers: 5000000,
            family: 'Tai-Kadai',
            script: 'Thai',
            status: 'daerah',
            tags: ['bahasa', 'asean-tenggara', 'thailand', 'pak-tai']
        }
    },
    {
        text: 'Bahasa Melayu Pattani - Bahasa daerah di Thailand selatan (Pattani). Digunakan oleh lebih dari 1.5 juta penutur. Termasuk rumpun bahasa Austronesia.',
        metadata: {
            category: 'language',
            region: 'asean-tenggara',
            country: 'Thailand',
            name: 'Bahasa Melayu Pattani',
            code: 'mfa',
            speakers: 1500000,
            family: 'Austronesia',
            script: 'Latin, Jawi',
            status: 'daerah',
            tags: ['bahasa', 'asean-tenggara', 'thailand', 'pattani']
        }
    },
    {
        text: 'Bahasa Khmer - Bahasa daerah di Thailand timur. Digunakan oleh lebih dari 1 juta penutur. Termasuk rumpun bahasa Austroasiatik.',
        metadata: {
            category: 'language',
            region: 'asean-tenggara',
            country: 'Thailand',
            name: 'Bahasa Khmer',
            code: 'km',
            speakers: 1000000,
            family: 'Austroasiatik',
            script: 'Khmer',
            status: 'daerah',
            tags: ['bahasa', 'asean-tenggara', 'thailand', 'khmer']
        }
    },
    // ==========================================================
    // 🇻🇳 VIETNAM — 11 BAHASA
    // ==========================================================
    {
        text: 'Bahasa Vietnam - Bahasa resmi Vietnam. Digunakan oleh lebih dari 85 juta penutur. Termasuk rumpun bahasa Austroasiatik. Menggunakan aksara Latin dengan diakritik.',
        metadata: {
            category: 'language',
            region: 'asean-tenggara',
            country: 'Vietnam',
            name: 'Bahasa Vietnam',
            code: 'vi',
            speakers: 85000000,
            family: 'Austroasiatik',
            script: 'Latin',
            status: 'resmi',
            tags: ['bahasa', 'asean-tenggara', 'vietnam', 'resmi']
        }
    },
    {
        text: 'Bahasa Tay - Bahasa daerah di Vietnam utara. Digunakan oleh lebih dari 1.5 juta penutur. Termasuk rumpun bahasa Tai-Kadai.',
        metadata: {
            category: 'language',
            region: 'asean-tenggara',
            country: 'Vietnam',
            name: 'Bahasa Tay',
            code: 'tyz',
            speakers: 1500000,
            family: 'Tai-Kadai',
            script: 'Latin',
            status: 'daerah',
            tags: ['bahasa', 'asean-tenggara', 'vietnam', 'tay']
        }
    },
    {
        text: 'Bahasa Thai - Bahasa daerah di Vietnam barat laut. Digunakan oleh lebih dari 1.5 juta penutur. Termasuk rumpun bahasa Tai-Kadai.',
        metadata: {
            category: 'language',
            region: 'asean-tenggara',
            country: 'Vietnam',
            name: 'Bahasa Thai',
            code: 'th',
            speakers: 1500000,
            family: 'Tai-Kadai',
            script: 'Thai',
            status: 'daerah',
            tags: ['bahasa', 'asean-tenggara', 'vietnam', 'thai']
        }
    },
    {
        text: 'Bahasa Muong - Bahasa daerah di Vietnam utara. Digunakan oleh lebih dari 1.2 juta penutur. Termasuk rumpun bahasa Austroasiatik.',
        metadata: {
            category: 'language',
            region: 'asean-tenggara',
            country: 'Vietnam',
            name: 'Bahasa Muong',
            code: 'mtq',
            speakers: 1200000,
            family: 'Austroasiatik',
            script: 'Latin',
            status: 'daerah',
            tags: ['bahasa', 'asean-tenggara', 'vietnam', 'muong']
        }
    },
    {
        text: 'Bahasa Khmer - Bahasa daerah di Vietnam selatan. Digunakan oleh lebih dari 1 juta penutur. Termasuk rumpun bahasa Austroasiatik.',
        metadata: {
            category: 'language',
            region: 'asean-tenggara',
            country: 'Vietnam',
            name: 'Bahasa Khmer',
            code: 'km',
            speakers: 1000000,
            family: 'Austroasiatik',
            script: 'Khmer',
            status: 'daerah',
            tags: ['bahasa', 'asean-tenggara', 'vietnam', 'khmer']
        }
    },
    {
        text: 'Bahasa Hmong - Bahasa daerah di Vietnam utara. Digunakan oleh lebih dari 1 juta penutur. Termasuk rumpun bahasa Hmong-Mien.',
        metadata: {
            category: 'language',
            region: 'asean-tenggara',
            country: 'Vietnam',
            name: 'Bahasa Hmong',
            code: 'hmn',
            speakers: 1000000,
            family: 'Hmong-Mien',
            script: 'Latin',
            status: 'daerah',
            tags: ['bahasa', 'asean-tenggara', 'vietnam', 'hmong']
        }
    },
    {
        text: 'Bahasa Nung - Bahasa daerah di Vietnam utara. Digunakan oleh lebih dari 1 juta penutur. Termasuk rumpun bahasa Tai-Kadai.',
        metadata: {
            category: 'language',
            region: 'asean-tenggara',
            country: 'Vietnam',
            name: 'Bahasa Nung',
            code: 'nut',
            speakers: 1000000,
            family: 'Tai-Kadai',
            script: 'Latin',
            status: 'daerah',
            tags: ['bahasa', 'asean-tenggara', 'vietnam', 'nung']
        }
    },
    {
        text: 'Bahasa Dao - Bahasa daerah di Vietnam utara. Digunakan oleh lebih dari 800 ribu penutur. Termasuk rumpun bahasa Hmong-Mien.',
        metadata: {
            category: 'language',
            region: 'asean-tenggara',
            country: 'Vietnam',
            name: 'Bahasa Dao',
            code: 'ium',
            speakers: 800000,
            family: 'Hmong-Mien',
            script: 'Latin',
            status: 'daerah',
            tags: ['bahasa', 'asean-tenggara', 'vietnam', 'dao']
        }
    },
    {
        text: 'Bahasa Hoa - Bahasa daerah di Vietnam. Digunakan oleh lebih dari 800 ribu penutur. Termasuk rumpun bahasa Sino-Tibet.',
        metadata: {
            category: 'language',
            region: 'asean-tenggara',
            country: 'Vietnam',
            name: 'Bahasa Hoa',
            code: 'hos',
            speakers: 800000,
            family: 'Sino-Tibet',
            script: 'Hanzi',
            status: 'daerah',
            tags: ['bahasa', 'asean-tenggara', 'vietnam', 'hoa']
        }
    },
    {
        text: 'Bahasa San Chay - Bahasa daerah di Vietnam utara. Digunakan oleh lebih dari 500 ribu penutur. Termasuk rumpun bahasa Tai-Kadai.',
        metadata: {
            category: 'language',
            region: 'asean-tenggara',
            country: 'Vietnam',
            name: 'Bahasa San Chay',
            code: 'scy',
            speakers: 500000,
            family: 'Tai-Kadai',
            script: 'Latin',
            status: 'daerah',
            tags: ['bahasa', 'asean-tenggara', 'vietnam', 'san-chay']
        }
    },
    {
        text: 'Bahasa Raglai - Bahasa daerah di Vietnam selatan. Digunakan oleh lebih dari 500 ribu penutur. Termasuk rumpun bahasa Austronesia.',
        metadata: {
            category: 'language',
            region: 'asean-tenggara',
            country: 'Vietnam',
            name: 'Bahasa Raglai',
            code: 'rai',
            speakers: 500000,
            family: 'Austronesia',
            script: 'Latin',
            status: 'daerah',
            tags: ['bahasa', 'asean-tenggara', 'vietnam', 'raglai']
        }
    },
    // ==========================================================
    // 🇵🇭 FILIPINA — 12 BAHASA
    // ==========================================================
    {
        text: 'Bahasa Filipino - Bahasa resmi Filipina. Digunakan oleh lebih dari 50 juta penutur. Berbasis dari bahasa Tagalog. Termasuk rumpun bahasa Austronesia.',
        metadata: {
            category: 'language',
            region: 'asean-tenggara',
            country: 'Filipina',
            name: 'Bahasa Filipino',
            code: 'fil',
            speakers: 50000000,
            family: 'Austronesia',
            script: 'Latin',
            status: 'resmi',
            tags: ['bahasa', 'asean-tenggara', 'filipina', 'resmi']
        }
    },
    {
        text: 'Bahasa Inggris - Bahasa resmi Filipina. Digunakan oleh lebih dari 60 juta penutur. Termasuk rumpun bahasa Jermanik.',
        metadata: {
            category: 'language',
            region: 'asean-tenggara',
            country: 'Filipina',
            name: 'Bahasa Inggris',
            code: 'en',
            speakers: 60000000,
            family: 'Jermanik',
            script: 'Latin',
            status: 'resmi',
            tags: ['bahasa', 'asean-tenggara', 'filipina', 'resmi']
        }
    },
    {
        text: 'Bahasa Cebuano - Bahasa daerah di Filipina tengah. Digunakan oleh lebih dari 20 juta penutur. Termasuk rumpun bahasa Austronesia.',
        metadata: {
            category: 'language',
            region: 'asean-tenggara',
            country: 'Filipina',
            name: 'Bahasa Cebuano',
            code: 'ceb',
            speakers: 20000000,
            family: 'Austronesia',
            script: 'Latin',
            status: 'daerah',
            tags: ['bahasa', 'asean-tenggara', 'filipina', 'cebuano']
        }
    },
    {
        text: 'Bahasa Ilocano - Bahasa daerah di Filipina utara. Digunakan oleh lebih dari 10 juta penutur. Termasuk rumpun bahasa Austronesia.',
        metadata: {
            category: 'language',
            region: 'asean-tenggara',
            country: 'Filipina',
            name: 'Bahasa Ilocano',
            code: 'ilo',
            speakers: 10000000,
            family: 'Austronesia',
            script: 'Latin',
            status: 'daerah',
            tags: ['bahasa', 'asean-tenggara', 'filipina', 'ilocano']
        }
    },
    {
        text: 'Bahasa Hiligaynon - Bahasa daerah di Filipina tengah. Digunakan oleh lebih dari 8 juta penutur. Termasuk rumpun bahasa Austronesia.',
        metadata: {
            category: 'language',
            region: 'asean-tenggara',
            country: 'Filipina',
            name: 'Bahasa Hiligaynon',
            code: 'hil',
            speakers: 8000000,
            family: 'Austronesia',
            script: 'Latin',
            status: 'daerah',
            tags: ['bahasa', 'asean-tenggara', 'filipina', 'hiligaynon']
        }
    },
    {
        text: 'Bahasa Bicolano - Bahasa daerah di Filipina timur. Digunakan oleh lebih dari 5 juta penutur. Termasuk rumpun bahasa Austronesia.',
        metadata: {
            category: 'language',
            region: 'asean-tenggara',
            country: 'Filipina',
            name: 'Bahasa Bicolano',
            code: 'bcl',
            speakers: 5000000,
            family: 'Austronesia',
            script: 'Latin',
            status: 'daerah',
            tags: ['bahasa', 'asean-tenggara', 'filipina', 'bicolano']
        }
    },
    {
        text: 'Bahasa Waray - Bahasa daerah di Filipina timur. Digunakan oleh lebih dari 3 juta penutur. Termasuk rumpun bahasa Austronesia.',
        metadata: {
            category: 'language',
            region: 'asean-tenggara',
            country: 'Filipina',
            name: 'Bahasa Waray',
            code: 'war',
            speakers: 3000000,
            family: 'Austronesia',
            script: 'Latin',
            status: 'daerah',
            tags: ['bahasa', 'asean-tenggara', 'filipina', 'waray']
        }
    },
    {
        text: 'Bahasa Kapampangan - Bahasa daerah di Filipina tengah. Digunakan oleh lebih dari 2.5 juta penutur. Termasuk rumpun bahasa Austronesia.',
        metadata: {
            category: 'language',
            region: 'asean-tenggara',
            country: 'Filipina',
            name: 'Bahasa Kapampangan',
            code: 'pam',
            speakers: 2500000,
            family: 'Austronesia',
            script: 'Latin',
            status: 'daerah',
            tags: ['bahasa', 'asean-tenggara', 'filipina', 'kapampangan']
        }
    },
    {
        text: 'Bahasa Pangasinan - Bahasa daerah di Filipina utara. Digunakan oleh lebih dari 1.5 juta penutur. Termasuk rumpun bahasa Austronesia.',
        metadata: {
            category: 'language',
            region: 'asean-tenggara',
            country: 'Filipina',
            name: 'Bahasa Pangasinan',
            code: 'pag',
            speakers: 1500000,
            family: 'Austronesia',
            script: 'Latin',
            status: 'daerah',
            tags: ['bahasa', 'asean-tenggara', 'filipina', 'pangasinan']
        }
    },
    {
        text: 'Bahasa Chavacano - Bahasa daerah di Filipina selatan. Digunakan oleh lebih dari 700 ribu penutur. Termasuk rumpun bahasa Kreol Spanyol.',
        metadata: {
            category: 'language',
            region: 'asean-tenggara',
            country: 'Filipina',
            name: 'Bahasa Chavacano',
            code: 'cbk',
            speakers: 700000,
            family: 'Kreol Spanyol',
            script: 'Latin',
            status: 'daerah',
            tags: ['bahasa', 'asean-tenggara', 'filipina', 'chavacano']
        }
    },
    {
        text: 'Bahasa Maranao - Bahasa daerah di Filipina selatan. Digunakan oleh lebih dari 1 juta penutur. Termasuk rumpun bahasa Austronesia.',
        metadata: {
            category: 'language',
            region: 'asean-tenggara',
            country: 'Filipina',
            name: 'Bahasa Maranao',
            code: 'mrw',
            speakers: 1000000,
            family: 'Austronesia',
            script: 'Latin',
            status: 'daerah',
            tags: ['bahasa', 'asean-tenggara', 'filipina', 'maranao']
        }
    },
    {
        text: 'Bahasa Tausug - Bahasa daerah di Filipina selatan. Digunakan oleh lebih dari 1 juta penutur. Termasuk rumpun bahasa Austronesia.',
        metadata: {
            category: 'language',
            region: 'asean-tenggara',
            country: 'Filipina',
            name: 'Bahasa Tausug',
            code: 'tsg',
            speakers: 1000000,
            family: 'Austronesia',
            script: 'Latin',
            status: 'daerah',
            tags: ['bahasa', 'asean-tenggara', 'filipina', 'tausug']
        }
    },
    // ==========================================================
    // 🇲🇲 MYANMAR — 10 BAHASA
    // ==========================================================
    {
        text: 'Bahasa Myanmar - Bahasa resmi Myanmar. Digunakan oleh lebih dari 35 juta penutur. Termasuk rumpun bahasa Sino-Tibet. Menggunakan aksara Myanmar.',
        metadata: {
            category: 'language',
            region: 'asean-tenggara',
            country: 'Myanmar',
            name: 'Bahasa Myanmar',
            code: 'my',
            speakers: 35000000,
            family: 'Sino-Tibet',
            script: 'Myanmar',
            status: 'resmi',
            tags: ['bahasa', 'asean-tenggara', 'myanmar', 'resmi']
        }
    },
    {
        text: 'Bahasa Shan - Bahasa daerah di Myanmar timur. Digunakan oleh lebih dari 3 juta penutur. Termasuk rumpun bahasa Tai-Kadai.',
        metadata: {
            category: 'language',
            region: 'asean-tenggara',
            country: 'Myanmar',
            name: 'Bahasa Shan',
            code: 'shn',
            speakers: 3000000,
            family: 'Tai-Kadai',
            script: 'Shan',
            status: 'daerah',
            tags: ['bahasa', 'asean-tenggara', 'myanmar', 'shan']
        }
    },
    {
        text: 'Bahasa Kayin - Bahasa daerah di Myanmar timur. Digunakan oleh lebih dari 1.5 juta penutur. Termasuk rumpun bahasa Sino-Tibet.',
        metadata: {
            category: 'language',
            region: 'asean-tenggara',
            country: 'Myanmar',
            name: 'Bahasa Kayin',
            code: 'kaw',
            speakers: 1500000,
            family: 'Sino-Tibet',
            script: 'Kayin',
            status: 'daerah',
            tags: ['bahasa', 'asean-tenggara', 'myanmar', 'kayin']
        }
    },
    {
        text: 'Bahasa Rakhine - Bahasa daerah di Myanmar barat. Digunakan oleh lebih dari 1.5 juta penutur. Termasuk rumpun bahasa Sino-Tibet.',
        metadata: {
            category: 'language',
            region: 'asean-tenggara',
            country: 'Myanmar',
            name: 'Bahasa Rakhine',
            code: 'rki',
            speakers: 1500000,
            family: 'Sino-Tibet',
            script: 'Myanmar',
            status: 'daerah',
            tags: ['bahasa', 'asean-tenggara', 'myanmar', 'rakhine']
        }
    },
    {
        text: 'Bahasa Mon - Bahasa daerah di Myanmar selatan. Digunakan oleh lebih dari 1 juta penutur. Termasuk rumpun bahasa Austroasiatik.',
        metadata: {
            category: 'language',
            region: 'asean-tenggara',
            country: 'Myanmar',
            name: 'Bahasa Mon',
            code: 'mnw',
            speakers: 1000000,
            family: 'Austroasiatik',
            script: 'Mon',
            status: 'daerah',
            tags: ['bahasa', 'asean-tenggara', 'myanmar', 'mon']
        }
    },
    {
        text: 'Bahasa Chin - Bahasa daerah di Myanmar barat. Digunakan oleh lebih dari 1 juta penutur. Termasuk rumpun bahasa Sino-Tibet.',
        metadata: {
            category: 'language',
            region: 'asean-tenggara',
            country: 'Myanmar',
            name: 'Bahasa Chin',
            code: 'cnh',
            speakers: 1000000,
            family: 'Sino-Tibet',
            script: 'Latin',
            status: 'daerah',
            tags: ['bahasa', 'asean-tenggara', 'myanmar', 'chin']
        }
    },
    {
        text: 'Bahasa Kachin - Bahasa daerah di Myanmar utara. Digunakan oleh lebih dari 900 ribu penutur. Termasuk rumpun bahasa Sino-Tibet.',
        metadata: {
            category: 'language',
            region: 'asean-tenggara',
            country: 'Myanmar',
            name: 'Bahasa Kachin',
            code: 'kac',
            speakers: 900000,
            family: 'Sino-Tibet',
            script: 'Latin',
            status: 'daerah',
            tags: ['bahasa', 'asean-tenggara', 'myanmar', 'kachin']
        }
    },
    {
        text: 'Bahasa Karen - Bahasa daerah di Myanmar timur. Digunakan oleh lebih dari 2 juta penutur. Termasuk rumpun bahasa Sino-Tibet.',
        metadata: {
            category: 'language',
            region: 'asean-tenggara',
            country: 'Myanmar',
            name: 'Bahasa Karen',
            code: 'kar',
            speakers: 2000000,
            family: 'Sino-Tibet',
            script: 'Karen',
            status: 'daerah',
            tags: ['bahasa', 'asean-tenggara', 'myanmar', 'karen']
        }
    },
    {
        text: 'Bahasa Wa - Bahasa daerah di Myanmar timur. Digunakan oleh lebih dari 800 ribu penutur. Termasuk rumpun bahasa Austroasiatik.',
        metadata: {
            category: 'language',
            region: 'asean-tenggara',
            country: 'Myanmar',
            name: 'Bahasa Wa',
            code: 'prk',
            speakers: 800000,
            family: 'Austroasiatik',
            script: 'Latin',
            status: 'daerah',
            tags: ['bahasa', 'asean-tenggara', 'myanmar', 'wa']
        }
    },
    {
        text: 'Bahasa Palaung - Bahasa daerah di Myanmar utara. Digunakan oleh lebih dari 500 ribu penutur. Termasuk rumpun bahasa Austroasiatik.',
        metadata: {
            category: 'language',
            region: 'asean-tenggara',
            country: 'Myanmar',
            name: 'Bahasa Palaung',
            code: 'pce',
            speakers: 500000,
            family: 'Austroasiatik',
            script: 'Palaung',
            status: 'daerah',
            tags: ['bahasa', 'asean-tenggara', 'myanmar', 'palaung']
        }
    },
    // ==========================================================
    // 🇰🇭 KAMBOJA — 7 BAHASA
    // ==========================================================
    {
        text: 'Bahasa Khmer - Bahasa resmi Kamboja. Digunakan oleh lebih dari 16 juta penutur. Termasuk rumpun bahasa Austroasiatik. Menggunakan aksara Khmer.',
        metadata: {
            category: 'language',
            region: 'asean-tenggara',
            country: 'Kamboja',
            name: 'Bahasa Khmer',
            code: 'km',
            speakers: 16000000,
            family: 'Austroasiatik',
            script: 'Khmer',
            status: 'resmi',
            tags: ['bahasa', 'asean-tenggara', 'kamboja', 'resmi']
        }
    },
    {
        text: 'Bahasa Vietnam - Bahasa daerah di Kamboja timur. Digunakan oleh lebih dari 600 ribu penutur. Termasuk rumpun bahasa Austroasiatik.',
        metadata: {
            category: 'language',
            region: 'asean-tenggara',
            country: 'Kamboja',
            name: 'Bahasa Vietnam',
            code: 'vi',
            speakers: 600000,
            family: 'Austroasiatik',
            script: 'Latin',
            status: 'daerah',
            tags: ['bahasa', 'asean-tenggara', 'kamboja', 'vietnam']
        }
    },
    {
        text: 'Bahasa Cham - Bahasa daerah di Kamboja timur. Digunakan oleh lebih dari 500 ribu penutur. Termasuk rumpun bahasa Austronesia.',
        metadata: {
            category: 'language',
            region: 'asean-tenggara',
            country: 'Kamboja',
            name: 'Bahasa Cham',
            code: 'cja',
            speakers: 500000,
            family: 'Austronesia',
            script: 'Cham',
            status: 'daerah',
            tags: ['bahasa', 'asean-tenggara', 'kamboja', 'cham']
        }
    },
    {
        text: 'Bahasa Lao - Bahasa daerah di Kamboja utara. Digunakan oleh lebih dari 100 ribu penutur. Termasuk rumpun bahasa Tai-Kadai.',
        metadata: {
            category: 'language',
            region: 'asean-tenggara',
            country: 'Kamboja',
            name: 'Bahasa Lao',
            code: 'lo',
            speakers: 100000,
            family: 'Tai-Kadai',
            script: 'Lao',
            status: 'daerah',
            tags: ['bahasa', 'asean-tenggara', 'kamboja', 'lao']
        }
    },
    {
        text: 'Bahasa Thai - Bahasa daerah di Kamboja barat. Digunakan oleh lebih dari 100 ribu penutur. Termasuk rumpun bahasa Tai-Kadai.',
        metadata: {
            category: 'language',
            region: 'asean-tenggara',
            country: 'Kamboja',
            name: 'Bahasa Thai',
            code: 'th',
            speakers: 100000,
            family: 'Tai-Kadai',
            script: 'Thai',
            status: 'daerah',
            tags: ['bahasa', 'asean-tenggara', 'kamboja', 'thai']
        }
    },
    {
        text: 'Bahasa Jarai - Bahasa daerah di Kamboja timur. Digunakan oleh lebih dari 300 ribu penutur. Termasuk rumpun bahasa Austronesia.',
        metadata: {
            category: 'language',
            region: 'asean-tenggara',
            country: 'Kamboja',
            name: 'Bahasa Jarai',
            code: 'jra',
            speakers: 300000,
            family: 'Austronesia',
            script: 'Latin',
            status: 'daerah',
            tags: ['bahasa', 'asean-tenggara', 'kamboja', 'jarai']
        }
    },
    {
        text: 'Bahasa Kuy - Bahasa daerah di Kamboja utara. Digunakan oleh lebih dari 100 ribu penutur. Termasuk rumpun bahasa Austroasiatik.',
        metadata: {
            category: 'language',
            region: 'asean-tenggara',
            country: 'Kamboja',
            name: 'Bahasa Kuy',
            code: 'kdt',
            speakers: 100000,
            family: 'Austroasiatik',
            script: 'Latin',
            status: 'daerah',
            tags: ['bahasa', 'asean-tenggara', 'kamboja', 'kuy']
        }
    },
    // ==========================================================
    // 🇱🇦 LAOS — 7 BAHASA
    // ==========================================================
    {
        text: 'Bahasa Lao - Bahasa resmi Laos. Digunakan oleh lebih dari 5 juta penutur. Termasuk rumpun bahasa Tai-Kadai. Menggunakan aksara Lao.',
        metadata: {
            category: 'language',
            region: 'asean-tenggara',
            country: 'Laos',
            name: 'Bahasa Lao',
            code: 'lo',
            speakers: 5000000,
            family: 'Tai-Kadai',
            script: 'Lao',
            status: 'resmi',
            tags: ['bahasa', 'asean-tenggara', 'laos', 'resmi']
        }
    },
    {
        text: 'Bahasa Hmong - Bahasa daerah di Laos utara. Digunakan oleh lebih dari 500 ribu penutur. Termasuk rumpun bahasa Hmong-Mien.',
        metadata: {
            category: 'language',
            region: 'asean-tenggara',
            country: 'Laos',
            name: 'Bahasa Hmong',
            code: 'hmn',
            speakers: 500000,
            family: 'Hmong-Mien',
            script: 'Latin',
            status: 'daerah',
            tags: ['bahasa', 'asean-tenggara', 'laos', 'hmong']
        }
    },
    {
        text: 'Bahasa Khmu - Bahasa daerah di Laos utara. Digunakan oleh lebih dari 500 ribu penutur. Termasuk rumpun bahasa Austroasiatik.',
        metadata: {
            category: 'language',
            region: 'asean-tenggara',
            country: 'Laos',
            name: 'Bahasa Khmu',
            code: 'kjg',
            speakers: 500000,
            family: 'Austroasiatik',
            script: 'Latin',
            status: 'daerah',
            tags: ['bahasa', 'asean-tenggara', 'laos', 'khmu']
        }
    },
    {
        text: 'Bahasa Phutai - Bahasa daerah di Laos tengah. Digunakan oleh lebih dari 300 ribu penutur. Termasuk rumpun bahasa Tai-Kadai.',
        metadata: {
            category: 'language',
            region: 'asean-tenggara',
            country: 'Laos',
            name: 'Bahasa Phutai',
            code: 'pht',
            speakers: 300000,
            family: 'Tai-Kadai',
            script: 'Lao',
            status: 'daerah',
            tags: ['bahasa', 'asean-tenggara', 'laos', 'phutai']
        }
    },
    {
        text: 'Bahasa Thai - Bahasa daerah di Laos selatan. Digunakan oleh lebih dari 100 ribu penutur. Termasuk rumpun bahasa Tai-Kadai.',
        metadata: {
            category: 'language',
            region: 'asean-tenggara',
            country: 'Laos',
            name: 'Bahasa Thai',
            code: 'th',
            speakers: 100000,
            family: 'Tai-Kadai',
            script: 'Thai',
            status: 'daerah',
            tags: ['bahasa', 'asean-tenggara', 'laos', 'thai']
        }
    },
    {
        text: 'Bahasa Vietnam - Bahasa daerah di Laos timur. Digunakan oleh lebih dari 100 ribu penutur. Termasuk rumpun bahasa Austroasiatik.',
        metadata: {
            category: 'language',
            region: 'asean-tenggara',
            country: 'Laos',
            name: 'Bahasa Vietnam',
            code: 'vi',
            speakers: 100000,
            family: 'Austroasiatik',
            script: 'Latin',
            status: 'daerah',
            tags: ['bahasa', 'asean-tenggara', 'laos', 'vietnam']
        }
    },
    {
        text: 'Bahasa Chinese - Bahasa daerah di Laos. Digunakan oleh lebih dari 100 ribu penutur. Termasuk rumpun bahasa Sino-Tibet.',
        metadata: {
            category: 'language',
            region: 'asean-tenggara',
            country: 'Laos',
            name: 'Bahasa Chinese',
            code: 'zh',
            speakers: 100000,
            family: 'Sino-Tibet',
            script: 'Hanzi',
            status: 'daerah',
            tags: ['bahasa', 'asean-tenggara', 'laos', 'chinese']
        }
    },
    // ==========================================================
    // 🇧🇳 BRUNEI — 6 BAHASA
    // ==========================================================
    {
        text: 'Bahasa Melayu - Bahasa resmi Brunei. Digunakan oleh lebih dari 300 ribu penutur. Termasuk rumpun bahasa Austronesia. Menggunakan aksara Latin dan Jawi.',
        metadata: {
            category: 'language',
            region: 'asean-tenggara',
            country: 'Brunei',
            name: 'Bahasa Melayu',
            code: 'ms',
            speakers: 300000,
            family: 'Austronesia',
            script: 'Latin, Jawi',
            status: 'resmi',
            tags: ['bahasa', 'asean-tenggara', 'brunei', 'resmi']
        }
    },
    {
        text: 'Bahasa Inggris - Bahasa resmi Brunei. Digunakan oleh lebih dari 200 ribu penutur. Termasuk rumpun bahasa Jermanik.',
        metadata: {
            category: 'language',
            region: 'asean-tenggara',
            country: 'Brunei',
            name: 'Bahasa Inggris',
            code: 'en',
            speakers: 200000,
            family: 'Jermanik',
            script: 'Latin',
            status: 'resmi',
            tags: ['bahasa', 'asean-tenggara', 'brunei', 'resmi']
        }
    },
    {
        text: 'Bahasa Mandarin - Bahasa yang digunakan oleh komunitas Tionghoa Brunei. Digunakan oleh lebih dari 50 ribu penutur. Termasuk rumpun bahasa Sino-Tibet.',
        metadata: {
            category: 'language',
            region: 'asean-tenggara',
            country: 'Brunei',
            name: 'Bahasa Mandarin',
            code: 'zh',
            speakers: 50000,
            family: 'Sino-Tibet',
            script: 'Hanzi',
            status: 'daerah',
            tags: ['bahasa', 'asean-tenggara', 'brunei', 'mandarin']
        }
    },
    {
        text: 'Bahasa Tamil - Bahasa yang digunakan oleh komunitas India Brunei. Digunakan oleh lebih dari 10 ribu penutur. Termasuk rumpun bahasa Dravida.',
        metadata: {
            category: 'language',
            region: 'asean-tenggara',
            country: 'Brunei',
            name: 'Bahasa Tamil',
            code: 'ta',
            speakers: 10000,
            family: 'Dravida',
            script: 'Tamil',
            status: 'daerah',
            tags: ['bahasa', 'asean-tenggara', 'brunei', 'tamil']
        }
    },
    {
        text: 'Bahasa Kedayan - Bahasa daerah di Brunei. Digunakan oleh lebih dari 30 ribu penutur. Termasuk rumpun bahasa Austronesia.',
        metadata: {
            category: 'language',
            region: 'asean-tenggara',
            country: 'Brunei',
            name: 'Bahasa Kedayan',
            code: 'kdy',
            speakers: 30000,
            family: 'Austronesia',
            script: 'Latin',
            status: 'daerah',
            tags: ['bahasa', 'asean-tenggara', 'brunei', 'kedayan']
        }
    },
    {
        text: 'Bahasa Tutong - Bahasa daerah di Brunei. Digunakan oleh lebih dari 20 ribu penutur. Termasuk rumpun bahasa Austronesia.',
        metadata: {
            category: 'language',
            region: 'asean-tenggara',
            country: 'Brunei',
            name: 'Bahasa Tutong',
            code: 'ttg',
            speakers: 20000,
            family: 'Austronesia',
            script: 'Latin',
            status: 'daerah',
            tags: ['bahasa', 'asean-tenggara', 'brunei', 'tutong']
        }
    },
    // ==========================================================
    // 🇹🇱 TIMOR LESTE — 7 BAHASA
    // ==========================================================
    {
        text: 'Bahasa Tetum - Bahasa resmi Timor Leste. Digunakan oleh lebih dari 800 ribu penutur. Termasuk rumpun bahasa Austronesia. Menggunakan aksara Latin.',
        metadata: {
            category: 'language',
            region: 'asean-tenggara',
            country: 'Timor Leste',
            name: 'Bahasa Tetum',
            code: 'tet',
            speakers: 800000,
            family: 'Austronesia',
            script: 'Latin',
            status: 'resmi',
            tags: ['bahasa', 'asean-tenggara', 'timor-leste', 'resmi']
        }
    },
    {
        text: 'Bahasa Portugis - Bahasa resmi Timor Leste. Digunakan oleh lebih dari 500 ribu penutur. Termasuk rumpun bahasa Roman. Menggunakan aksara Latin.',
        metadata: {
            category: 'language',
            region: 'asean-tenggara',
            country: 'Timor Leste',
            name: 'Bahasa Portugis',
            code: 'pt',
            speakers: 500000,
            family: 'Roman',
            script: 'Latin',
            status: 'resmi',
            tags: ['bahasa', 'asean-tenggara', 'timor-leste', 'resmi']
        }
    },
    {
        text: 'Bahasa Indonesia - Bahasa yang digunakan di Timor Leste. Digunakan oleh lebih dari 400 ribu penutur. Termasuk rumpun bahasa Austronesia. Menggunakan aksara Latin.',
        metadata: {
            category: 'language',
            region: 'asean-tenggara',
            country: 'Timor Leste',
            name: 'Bahasa Indonesia',
            code: 'id',
            speakers: 400000,
            family: 'Austronesia',
            script: 'Latin',
            status: 'daerah',
            tags: ['bahasa', 'asean-tenggara', 'timor-leste', 'indonesia']
        }
    },
    {
        text: 'Bahasa Kemak - Bahasa daerah di Timor Leste. Digunakan oleh lebih dari 100 ribu penutur. Termasuk rumpun bahasa Austronesia.',
        metadata: {
            category: 'language',
            region: 'asean-tenggara',
            country: 'Timor Leste',
            name: 'Bahasa Kemak',
            code: 'kem',
            speakers: 100000,
            family: 'Austronesia',
            script: 'Latin',
            status: 'daerah',
            tags: ['bahasa', 'asean-tenggara', 'timor-leste', 'kemak']
        }
    },
    {
        text: 'Bahasa Mambai - Bahasa daerah di Timor Leste. Digunakan oleh lebih dari 100 ribu penutur. Termasuk rumpun bahasa Austronesia.',
        metadata: {
            category: 'language',
            region: 'asean-tenggara',
            country: 'Timor Leste',
            name: 'Bahasa Mambai',
            code: 'mgm',
            speakers: 100000,
            family: 'Austronesia',
            script: 'Latin',
            status: 'daerah',
            tags: ['bahasa', 'asean-tenggara', 'timor-leste', 'mambai']
        }
    },
    {
        text: 'Bahasa Tokodede - Bahasa daerah di Timor Leste. Digunakan oleh lebih dari 80 ribu penutur. Termasuk rumpun bahasa Austronesia.',
        metadata: {
            category: 'language',
            region: 'asean-tenggara',
            country: 'Timor Leste',
            name: 'Bahasa Tokodede',
            code: 'tkd',
            speakers: 80000,
            family: 'Austronesia',
            script: 'Latin',
            status: 'daerah',
            tags: ['bahasa', 'asean-tenggara', 'timor-leste', 'tokodede']
        }
    },
    {
        text: 'Bahasa Galoli - Bahasa daerah di Timor Leste. Digunakan oleh lebih dari 50 ribu penutur. Termasuk rumpun bahasa Austronesia.',
        metadata: {
            category: 'language',
            region: 'asean-tenggara',
            country: 'Timor Leste',
            name: 'Bahasa Galoli',
            code: 'gal',
            speakers: 50000,
            family: 'Austronesia',
            script: 'Latin',
            status: 'daerah',
            tags: ['bahasa', 'asean-tenggara', 'timor-leste', 'galoli']
        }
    }
];

export const DATA = data;

if (window.InternalLogger) {
    window.InternalLogger.info('LingoAseanTenggara', '✅ Loaded ' + data.length + ' languages');
}
