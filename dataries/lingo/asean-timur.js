const data = [
    // ==========================================================
    // 🇨🇳 CHINA — 7 BAHASA
    // ==========================================================
    {
        text: 'Bahasa Mandarin - Bahasa resmi China, Taiwan, dan Singapura. Digunakan oleh lebih dari 1.1 miliar penutur. Termasuk rumpun bahasa Sino-Tibet. Menggunakan aksara Hanzi (Sederhana di China, Tradisional di Taiwan). Sistem nada dengan 4 nada + nada netral.',
        metadata: {
            category: 'language',
            region: 'asean-timur',
            country: 'China, Taiwan, Singapura',
            name: 'Bahasa Mandarin',
            code: 'zh',
            speakers: 1100000000,
            family: 'Sino-Tibet',
            script: 'Hanzi',
            status: 'resmi',
            tags: ['bahasa', 'asean-timur', 'china', 'resmi', 'mandarin']
        }
    },
    {
        text: 'Bahasa Wu - Bahasa daerah di China timur (Shanghai, Zhejiang, Jiangsu). Digunakan oleh lebih dari 80 juta penutur. Termasuk rumpun bahasa Sino-Tibet. Bahasa dengan sistem nada yang kompleks.',
        metadata: {
            category: 'language',
            region: 'asean-timur',
            country: 'China',
            name: 'Bahasa Wu',
            code: 'wuu',
            speakers: 80000000,
            family: 'Sino-Tibet',
            script: 'Hanzi',
            status: 'daerah',
            tags: ['bahasa', 'asean-timur', 'china', 'wu', 'shanghai']
        }
    },
    {
        text: 'Bahasa Yue (Kantonis) - Bahasa daerah di China selatan (Guangdong, Hong Kong, Makau). Digunakan oleh lebih dari 80 juta penutur. Termasuk rumpun bahasa Sino-Tibet. Bahasa dengan sistem nada 6-9 nada.',
        metadata: {
            category: 'language',
            region: 'asean-timur',
            country: 'China, Hong Kong, Makau',
            name: 'Bahasa Yue (Kantonis)',
            code: 'yue',
            speakers: 80000000,
            family: 'Sino-Tibet',
            script: 'Hanzi',
            status: 'daerah',
            tags: ['bahasa', 'asean-timur', 'china', 'kantonis', 'hongkong']
        }
    },
    {
        text: 'Bahasa Min - Bahasa daerah di China tenggara (Fujian, Taiwan). Digunakan oleh lebih dari 70 juta penutur. Termasuk rumpun bahasa Sino-Tibet. Terbagi menjadi Min Utara, Min Selatan (Hokkien), Min Timur, Min Tengah.',
        metadata: {
            category: 'language',
            region: 'asean-timur',
            country: 'China, Taiwan',
            name: 'Bahasa Min',
            code: 'nan',
            speakers: 70000000,
            family: 'Sino-Tibet',
            script: 'Hanzi',
            status: 'daerah',
            tags: ['bahasa', 'asean-timur', 'china', 'min', 'hokkien']
        }
    },
    {
        text: 'Bahasa Xiang - Bahasa daerah di China tengah (Hunan). Digunakan oleh lebih dari 35 juta penutur. Termasuk rumpun bahasa Sino-Tibet. Bahasa dengan pengaruh dari bahasa Mandarin dan Wu.',
        metadata: {
            category: 'language',
            region: 'asean-timur',
            country: 'China',
            name: 'Bahasa Xiang',
            code: 'hsn',
            speakers: 35000000,
            family: 'Sino-Tibet',
            script: 'Hanzi',
            status: 'daerah',
            tags: ['bahasa', 'asean-timur', 'china', 'xiang']
        }
    },
    {
        text: 'Bahasa Hakka - Bahasa daerah di China selatan dan Taiwan. Digunakan oleh lebih dari 30 juta penutur. Termasuk rumpun bahasa Sino-Tibet. Bahasa dengan sistem nada 6 nada.',
        metadata: {
            category: 'language',
            region: 'asean-timur',
            country: 'China, Taiwan',
            name: 'Bahasa Hakka',
            code: 'hak',
            speakers: 30000000,
            family: 'Sino-Tibet',
            script: 'Hanzi',
            status: 'daerah',
            tags: ['bahasa', 'asean-timur', 'china', 'hakka']
        }
    },
    {
        text: 'Bahasa Gan - Bahasa daerah di China tenggara (Jiangxi). Digunakan oleh lebih dari 20 juta penutur. Termasuk rumpun bahasa Sino-Tibet. Bahasa dengan sistem nada yang kompleks.',
        metadata: {
            category: 'language',
            region: 'asean-timur',
            country: 'China',
            name: 'Bahasa Gan',
            code: 'gan',
            speakers: 20000000,
            family: 'Sino-Tibet',
            script: 'Hanzi',
            status: 'daerah',
            tags: ['bahasa', 'asean-timur', 'china', 'gan']
        }
    },
    // ==========================================================
    // 🇯🇵 JEPANG — 1 BAHASA
    // ==========================================================
    {
        text: 'Bahasa Jepang - Bahasa resmi Jepang. Digunakan oleh lebih dari 125 juta penutur. Termasuk rumpun bahasa Japonik. Menggunakan kombinasi aksara: Kanji, Hiragana, Katakana. Bahasa dengan sistem honorifik yang kompleks. Tidak memiliki nada (non-tonal).',
        metadata: {
            category: 'language',
            region: 'asean-timur',
            country: 'Jepang',
            name: 'Bahasa Jepang',
            code: 'ja',
            speakers: 125000000,
            family: 'Japonik',
            script: 'Kanji, Hiragana, Katakana',
            status: 'resmi',
            tags: ['bahasa', 'asean-timur', 'jepang', 'resmi', 'japonik']
        }
    },
    // ==========================================================
    // 🇰🇷 KOREA SELATAN — 1 BAHASA
    // ==========================================================
    {
        text: 'Bahasa Korea - Bahasa resmi Korea Selatan dan Korea Utara. Digunakan oleh lebih dari 80 juta penutur. Termasuk rumpun bahasa Koreanik. Menggunakan aksara Hangul yang unik dan ilmiah. Bahasa dengan sistem honorifik yang kompleks. Tidak memiliki nada (non-tonal).',
        metadata: {
            category: 'language',
            region: 'asean-timur',
            country: 'Korea Selatan, Korea Utara',
            name: 'Bahasa Korea',
            code: 'ko',
            speakers: 80000000,
            family: 'Koreanik',
            script: 'Hangul',
            status: 'resmi',
            tags: ['bahasa', 'asean-timur', 'korea-selatan', 'resmi', 'hangul']
        }
    },
    // ==========================================================
    // 🇰🇵 KOREA UTARA — 1 BAHASA
    // ==========================================================
    {
        text: 'Bahasa Korea - Bahasa resmi Korea Utara. Digunakan oleh lebih dari 25 juta penutur. Termasuk rumpun bahasa Koreanik. Menggunakan aksara Hangul. Dialek berbeda dengan Korea Selatan dalam kosakata dan logat.',
        metadata: {
            category: 'language',
            region: 'asean-timur',
            country: 'Korea Utara',
            name: 'Bahasa Korea (Utara)',
            code: 'ko-KP',
            speakers: 25000000,
            family: 'Koreanik',
            script: 'Hangul',
            status: 'resmi',
            tags: ['bahasa', 'asean-timur', 'korea-utara', 'resmi', 'hangul']
        }
    },
    // ==========================================================
    // 🇲🇳 MONGOLIA — 1 BAHASA
    // ==========================================================
    {
        text: 'Bahasa Mongolia - Bahasa resmi Mongolia. Digunakan oleh lebih dari 5 juta penutur. Termasuk rumpun bahasa Mongolik. Menggunakan aksara Kiril di Mongolia dan aksara Mongolia Tradisional di China. Bahasa dengan harmoni vokal yang kuat.',
        metadata: {
            category: 'language',
            region: 'asean-timur',
            country: 'Mongolia',
            name: 'Bahasa Mongolia',
            code: 'mn',
            speakers: 5000000,
            family: 'Mongolik',
            script: 'Kiril, Mongolia Tradisional',
            status: 'resmi',
            tags: ['bahasa', 'asean-timur', 'mongolia', 'resmi', 'mongolik']
        }
    },
    // ==========================================================
    // 🇹🇼 TAIWAN — 3 BAHASA
    // ==========================================================
    {
        text: 'Bahasa Mandarin - Bahasa resmi Taiwan. Digunakan oleh lebih dari 20 juta penutur. Termasuk rumpun bahasa Sino-Tibet. Menggunakan aksara Hanzi Tradisional. Sistem nada dengan 4 nada + nada netral.',
        metadata: {
            category: 'language',
            region: 'asean-timur',
            country: 'Taiwan',
            name: 'Bahasa Mandarin (Taiwan)',
            code: 'zh-TW',
            speakers: 20000000,
            family: 'Sino-Tibet',
            script: 'Hanzi Tradisional',
            status: 'resmi',
            tags: ['bahasa', 'asean-timur', 'taiwan', 'resmi', 'mandarin']
        }
    },
    {
        text: 'Bahasa Hokkien Taiwan - Bahasa daerah di Taiwan. Digunakan oleh lebih dari 15 juta penutur. Termasuk rumpun bahasa Sino-Tibet (Min Selatan). Menggunakan aksara Hanzi. Sangat dekat dengan bahasa Hokkien di Fujian, China.',
        metadata: {
            category: 'language',
            region: 'asean-timur',
            country: 'Taiwan',
            name: 'Bahasa Hokkien Taiwan',
            code: 'nan-TW',
            speakers: 15000000,
            family: 'Sino-Tibet',
            script: 'Hanzi',
            status: 'daerah',
            tags: ['bahasa', 'asean-timur', 'taiwan', 'hokkien']
        }
    },
    {
        text: 'Bahasa Hakka - Bahasa daerah di Taiwan. Digunakan oleh lebih dari 3 juta penutur. Termasuk rumpun bahasa Sino-Tibet. Menggunakan aksara Hanzi. Bahasa dengan sistem nada yang kompleks.',
        metadata: {
            category: 'language',
            region: 'asean-timur',
            country: 'Taiwan',
            name: 'Bahasa Hakka (Taiwan)',
            code: 'hak-TW',
            speakers: 3000000,
            family: 'Sino-Tibet',
            script: 'Hanzi',
            status: 'daerah',
            tags: ['bahasa', 'asean-timur', 'taiwan', 'hakka']
        }
    },
    // ==========================================================
    // 🇭🇰 HONG KONG — 3 BAHASA
    // ==========================================================
    {
        text: 'Bahasa Kantonis - Bahasa resmi Hong Kong dan Makau. Digunakan oleh lebih dari 7 juta penutur. Termasuk rumpun bahasa Sino-Tibet (Yue). Menggunakan aksara Hanzi Tradisional. Bahasa dengan sistem nada 6-9 nada.',
        metadata: {
            category: 'language',
            region: 'asean-timur',
            country: 'Hong Kong, Makau',
            name: 'Bahasa Kantonis',
            code: 'yue-HK',
            speakers: 7000000,
            family: 'Sino-Tibet',
            script: 'Hanzi Tradisional',
            status: 'resmi',
            tags: ['bahasa', 'asean-timur', 'hongkong', 'resmi', 'kantonis']
        }
    },
    {
        text: 'Bahasa Mandarin - Bahasa resmi Hong Kong dan Makau. Digunakan oleh lebih dari 5 juta penutur. Termasuk rumpun bahasa Sino-Tibet. Menggunakan aksara Hanzi Tradisional.',
        metadata: {
            category: 'language',
            region: 'asean-timur',
            country: 'Hong Kong, Makau',
            name: 'Bahasa Mandarin',
            code: 'zh-HK',
            speakers: 5000000,
            family: 'Sino-Tibet',
            script: 'Hanzi Tradisional',
            status: 'resmi',
            tags: ['bahasa', 'asean-timur', 'hongkong', 'resmi', 'mandarin']
        }
    },
    {
        text: 'Bahasa Inggris - Bahasa resmi Hong Kong. Digunakan oleh lebih dari 4 juta penutur. Termasuk rumpun bahasa Jermanik. Bahasa administrasi dan bisnis di Hong Kong.',
        metadata: {
            category: 'language',
            region: 'asean-timur',
            country: 'Hong Kong',
            name: 'Bahasa Inggris',
            code: 'en-HK',
            speakers: 4000000,
            family: 'Jermanik',
            script: 'Latin',
            status: 'resmi',
            tags: ['bahasa', 'asean-timur', 'hongkong', 'resmi', 'inggris']
        }
    }
];

export const DATA = data;

if (window.InternalLogger) {
    window.InternalLogger.info('LingoAseanTimur', '✅ Loaded ' + data.length + ' languages');
}
