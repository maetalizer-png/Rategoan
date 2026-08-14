const data = [
    // ==========================================================
    // 🇮🇳 INDIA — 11 BAHASA
    // ==========================================================
    {
        text: 'Bahasa Hindi - Bahasa resmi India. Digunakan oleh lebih dari 600 juta penutur. Termasuk rumpun bahasa Indo-Eropa (Indo-Arya). Menggunakan aksara Devanagari. Bahasa dengan penutur terbanyak ke-3 di dunia.',
        metadata: {
            category: 'language',
            region: 'asean-selatan',
            country: 'India',
            name: 'Bahasa Hindi',
            code: 'hi',
            speakers: 600000000,
            family: 'Indo-Eropa',
            script: 'Devanagari',
            status: 'resmi',
            tags: ['bahasa', 'asean-selatan', 'india', 'resmi', 'hindi']
        }
    },
    {
        text: 'Bahasa Bengali - Bahasa resmi India (Bengal Barat). Digunakan oleh lebih dari 230 juta penutur. Termasuk rumpun bahasa Indo-Eropa (Indo-Arya). Menggunakan aksara Bengali.',
        metadata: {
            category: 'language',
            region: 'asean-selatan',
            country: 'India',
            name: 'Bahasa Bengali',
            code: 'bn',
            speakers: 230000000,
            family: 'Indo-Eropa',
            script: 'Bengali',
            status: 'resmi',
            tags: ['bahasa', 'asean-selatan', 'india', 'bengali']
        }
    },
    {
        text: 'Bahasa Telugu - Bahasa resmi India (Andhra Pradesh, Telangana). Digunakan oleh lebih dari 80 juta penutur. Termasuk rumpun bahasa Dravida. Menggunakan aksara Telugu.',
        metadata: {
            category: 'language',
            region: 'asean-selatan',
            country: 'India',
            name: 'Bahasa Telugu',
            code: 'te',
            speakers: 80000000,
            family: 'Dravida',
            script: 'Telugu',
            status: 'resmi',
            tags: ['bahasa', 'asean-selatan', 'india', 'telugu']
        }
    },
    {
        text: 'Bahasa Marathi - Bahasa resmi India (Maharashtra). Digunakan oleh lebih dari 70 juta penutur. Termasuk rumpun bahasa Indo-Eropa (Indo-Arya). Menggunakan aksara Devanagari.',
        metadata: {
            category: 'language',
            region: 'asean-selatan',
            country: 'India',
            name: 'Bahasa Marathi',
            code: 'mr',
            speakers: 70000000,
            family: 'Indo-Eropa',
            script: 'Devanagari',
            status: 'resmi',
            tags: ['bahasa', 'asean-selatan', 'india', 'marathi']
        }
    },
    {
        text: 'Bahasa Tamil - Bahasa resmi India (Tamil Nadu), Sri Lanka, dan Singapura. Digunakan oleh lebih dari 80 juta penutur. Termasuk rumpun bahasa Dravida. Menggunakan aksara Tamil. Salah satu bahasa tertua di dunia.',
        metadata: {
            category: 'language',
            region: 'asean-selatan',
            country: 'India, Sri Lanka, Singapura',
            name: 'Bahasa Tamil',
            code: 'ta',
            speakers: 80000000,
            family: 'Dravida',
            script: 'Tamil',
            status: 'resmi',
            tags: ['bahasa', 'asean-selatan', 'india', 'tamil']
        }
    },
    {
        text: 'Bahasa Urdu - Bahasa resmi India (Jammu dan Kashmir). Digunakan oleh lebih dari 50 juta penutur. Termasuk rumpun bahasa Indo-Eropa (Indo-Arya). Menggunakan aksara Nastaliq (Arab-Persia).',
        metadata: {
            category: 'language',
            region: 'asean-selatan',
            country: 'India',
            name: 'Bahasa Urdu',
            code: 'ur',
            speakers: 50000000,
            family: 'Indo-Eropa',
            script: 'Nastaliq',
            status: 'resmi',
            tags: ['bahasa', 'asean-selatan', 'india', 'urdu']
        }
    },
    {
        text: 'Bahasa Gujarati - Bahasa resmi India (Gujarat). Digunakan oleh lebih dari 55 juta penutur. Termasuk rumpun bahasa Indo-Eropa (Indo-Arya). Menggunakan aksara Gujarati.',
        metadata: {
            category: 'language',
            region: 'asean-selatan',
            country: 'India',
            name: 'Bahasa Gujarati',
            code: 'gu',
            speakers: 55000000,
            family: 'Indo-Eropa',
            script: 'Gujarati',
            status: 'resmi',
            tags: ['bahasa', 'asean-selatan', 'india', 'gujarati']
        }
    },
    {
        text: 'Bahasa Kannada - Bahasa resmi India (Karnataka). Digunakan oleh lebih dari 45 juta penutur. Termasuk rumpun bahasa Dravida. Menggunakan aksara Kannada.',
        metadata: {
            category: 'language',
            region: 'asean-selatan',
            country: 'India',
            name: 'Bahasa Kannada',
            code: 'kn',
            speakers: 45000000,
            family: 'Dravida',
            script: 'Kannada',
            status: 'resmi',
            tags: ['bahasa', 'asean-selatan', 'india', 'kannada']
        }
    },
    {
        text: 'Bahasa Malayalam - Bahasa resmi India (Kerala). Digunakan oleh lebih dari 35 juta penutur. Termasuk rumpun bahasa Dravida. Menggunakan aksara Malayalam.',
        metadata: {
            category: 'language',
            region: 'asean-selatan',
            country: 'India',
            name: 'Bahasa Malayalam',
            code: 'ml',
            speakers: 35000000,
            family: 'Dravida',
            script: 'Malayalam',
            status: 'resmi',
            tags: ['bahasa', 'asean-selatan', 'india', 'malayalam']
        }
    },
    {
        text: 'Bahasa Odia - Bahasa resmi India (Odisha). Digunakan oleh lebih dari 35 juta penutur. Termasuk rumpun bahasa Indo-Eropa (Indo-Arya). Menggunakan aksara Odia.',
        metadata: {
            category: 'language',
            region: 'asean-selatan',
            country: 'India',
            name: 'Bahasa Odia',
            code: 'or',
            speakers: 35000000,
            family: 'Indo-Eropa',
            script: 'Odia',
            status: 'resmi',
            tags: ['bahasa', 'asean-selatan', 'india', 'odia']
        }
    },
    {
        text: 'Bahasa Punjabi - Bahasa resmi India (Punjab). Digunakan oleh lebih dari 30 juta penutur. Termasuk rumpun bahasa Indo-Eropa (Indo-Arya). Menggunakan aksara Gurmukhi.',
        metadata: {
            category: 'language',
            region: 'asean-selatan',
            country: 'India',
            name: 'Bahasa Punjabi',
            code: 'pa',
            speakers: 30000000,
            family: 'Indo-Eropa',
            script: 'Gurmukhi',
            status: 'resmi',
            tags: ['bahasa', 'asean-selatan', 'india', 'punjabi']
        }
    },
    // ==========================================================
    // 🇵🇰 PAKISTAN — 5 BAHASA
    // ==========================================================
    {
        text: 'Bahasa Urdu - Bahasa resmi Pakistan. Digunakan oleh lebih dari 230 juta penutur. Termasuk rumpun bahasa Indo-Eropa (Indo-Arya). Menggunakan aksara Nastaliq (Arab-Persia). Bahasa nasional dan lingua franca Pakistan.',
        metadata: {
            category: 'language',
            region: 'asean-selatan',
            country: 'Pakistan',
            name: 'Bahasa Urdu',
            code: 'ur',
            speakers: 230000000,
            family: 'Indo-Eropa',
            script: 'Nastaliq',
            status: 'resmi',
            tags: ['bahasa', 'asean-selatan', 'pakistan', 'resmi', 'urdu']
        }
    },
    {
        text: 'Bahasa Punjabi - Bahasa daerah di Pakistan (Punjab). Digunakan oleh lebih dari 100 juta penutur. Termasuk rumpun bahasa Indo-Eropa (Indo-Arya). Menggunakan aksara Shahmukhi (Arab).',
        metadata: {
            category: 'language',
            region: 'asean-selatan',
            country: 'Pakistan',
            name: 'Bahasa Punjabi',
            code: 'pa',
            speakers: 100000000,
            family: 'Indo-Eropa',
            script: 'Shahmukhi',
            status: 'daerah',
            tags: ['bahasa', 'asean-selatan', 'pakistan', 'punjabi']
        }
    },
    {
        text: 'Bahasa Sindhi - Bahasa daerah di Pakistan (Sindh). Digunakan oleh lebih dari 30 juta penutur. Termasuk rumpun bahasa Indo-Eropa (Indo-Arya). Menggunakan aksara Sindhi (Arab).',
        metadata: {
            category: 'language',
            region: 'asean-selatan',
            country: 'Pakistan',
            name: 'Bahasa Sindhi',
            code: 'sd',
            speakers: 30000000,
            family: 'Indo-Eropa',
            script: 'Sindhi',
            status: 'daerah',
            tags: ['bahasa', 'asean-selatan', 'pakistan', 'sindhi']
        }
    },
    {
        text: 'Bahasa Pashto - Bahasa daerah di Pakistan (Khyber Pakhtunkhwa). Digunakan oleh lebih dari 25 juta penutur. Termasuk rumpun bahasa Indo-Eropa (Iranik). Menggunakan aksara Pashto (Arab).',
        metadata: {
            category: 'language',
            region: 'asean-selatan',
            country: 'Pakistan',
            name: 'Bahasa Pashto',
            code: 'ps',
            speakers: 25000000,
            family: 'Indo-Eropa',
            script: 'Pashto',
            status: 'daerah',
            tags: ['bahasa', 'asean-selatan', 'pakistan', 'pashto']
        }
    },
    {
        text: 'Bahasa Balochi - Bahasa daerah di Pakistan (Balochistan). Digunakan oleh lebih dari 7 juta penutur. Termasuk rumpun bahasa Indo-Eropa (Iranik). Menggunakan aksara Balochi (Arab).',
        metadata: {
            category: 'language',
            region: 'asean-selatan',
            country: 'Pakistan',
            name: 'Bahasa Balochi',
            code: 'bal',
            speakers: 7000000,
            family: 'Indo-Eropa',
            script: 'Balochi',
            status: 'daerah',
            tags: ['bahasa', 'asean-selatan', 'pakistan', 'balochi']
        }
    },
    // ==========================================================
    // 🇧🇩 BANGLADESH — 1 BAHASA
    // ==========================================================
    {
        text: 'Bahasa Bengali - Bahasa resmi Bangladesh. Digunakan oleh lebih dari 230 juta penutur. Termasuk rumpun bahasa Indo-Eropa (Indo-Arya). Menggunakan aksara Bengali. Bahasa dengan gerakan bahasa yang terkenal.',
        metadata: {
            category: 'language',
            region: 'asean-selatan',
            country: 'Bangladesh',
            name: 'Bahasa Bengali',
            code: 'bn',
            speakers: 230000000,
            family: 'Indo-Eropa',
            script: 'Bengali',
            status: 'resmi',
            tags: ['bahasa', 'asean-selatan', 'bangladesh', 'resmi', 'bengali']
        }
    },
    // ==========================================================
    // 🇱🇰 SRI LANKA — 2 BAHASA
    // ==========================================================
    {
        text: 'Bahasa Sinhala - Bahasa resmi Sri Lanka. Digunakan oleh lebih dari 17 juta penutur. Termasuk rumpun bahasa Indo-Eropa (Indo-Arya). Menggunakan aksara Sinhala. Bahasa dengan pengaruh dari bahasa Pali.',
        metadata: {
            category: 'language',
            region: 'asean-selatan',
            country: 'Sri Lanka',
            name: 'Bahasa Sinhala',
            code: 'si',
            speakers: 17000000,
            family: 'Indo-Eropa',
            script: 'Sinhala',
            status: 'resmi',
            tags: ['bahasa', 'asean-selatan', 'sri-lanka', 'resmi', 'sinhala']
        }
    },
    {
        text: 'Bahasa Tamil - Bahasa resmi Sri Lanka. Digunakan oleh lebih dari 4 juta penutur. Termasuk rumpun bahasa Dravida. Menggunakan aksara Tamil. Digunakan oleh komunitas Tamil di Sri Lanka.',
        metadata: {
            category: 'language',
            region: 'asean-selatan',
            country: 'Sri Lanka',
            name: 'Bahasa Tamil',
            code: 'ta',
            speakers: 4000000,
            family: 'Dravida',
            script: 'Tamil',
            status: 'resmi',
            tags: ['bahasa', 'asean-selatan', 'sri-lanka', 'resmi', 'tamil']
        }
    },
    // ==========================================================
    // 🇳🇵 NEPAL — 1 BAHASA
    // ==========================================================
    {
        text: 'Bahasa Nepal - Bahasa resmi Nepal. Digunakan oleh lebih dari 25 juta penutur. Termasuk rumpun bahasa Indo-Eropa (Indo-Arya). Menggunakan aksara Devanagari. Bahasa dengan pengaruh dari bahasa Tibet dan India.',
        metadata: {
            category: 'language',
            region: 'asean-selatan',
            country: 'Nepal',
            name: 'Bahasa Nepal',
            code: 'ne',
            speakers: 25000000,
            family: 'Indo-Eropa',
            script: 'Devanagari',
            status: 'resmi',
            tags: ['bahasa', 'asean-selatan', 'nepal', 'resmi', 'nepali']
        }
    },
    // ==========================================================
    // 🇧🇹 BHUTAN — 1 BAHASA
    // ==========================================================
    {
        text: 'Bahasa Dzongkha - Bahasa resmi Bhutan. Digunakan oleh lebih dari 600 ribu penutur. Termasuk rumpun bahasa Sino-Tibet (Tibet-Burma). Menggunakan aksara Tibet. Bahasa dengan pengaruh dari bahasa Tibet.',
        metadata: {
            category: 'language',
            region: 'asean-selatan',
            country: 'Bhutan',
            name: 'Bahasa Dzongkha',
            code: 'dz',
            speakers: 600000,
            family: 'Sino-Tibet',
            script: 'Tibet',
            status: 'resmi',
            tags: ['bahasa', 'asean-selatan', 'bhutan', 'resmi', 'dzongkha']
        }
    },
    // ==========================================================
    // 🇲🇻 MALADEWA — 1 BAHASA
    // ==========================================================
    {
        text: 'Bahasa Dhivehi - Bahasa resmi Maladewa. Digunakan oleh lebih dari 500 ribu penutur. Termasuk rumpun bahasa Indo-Eropa (Indo-Arya). Menggunakan aksara Thaana. Bahasa dengan pengaruh dari bahasa Arab dan Sinhala.',
        metadata: {
            category: 'language',
            region: 'asean-selatan',
            country: 'Maladewa',
            name: 'Bahasa Dhivehi',
            code: 'dv',
            speakers: 500000,
            family: 'Indo-Eropa',
            script: 'Thaana',
            status: 'resmi',
            tags: ['bahasa', 'asean-selatan', 'maladewa', 'resmi', 'dhivehi']
        }
    }
];

export const DATA = data;

if (window.InternalLogger) {
    window.InternalLogger.info('LingoAseanSelatan', '✅ Loaded ' + data.length + ' languages');
}
