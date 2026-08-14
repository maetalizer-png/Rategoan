const data = [
    // ==========================================================
    // 🇸🇦 ARAB SAUDI — 1 BAHASA
    // ==========================================================
    {
        text: 'Bahasa Arab - Bahasa resmi Arab Saudi. Digunakan oleh lebih dari 30 juta penutur. Termasuk rumpun bahasa Afroasiatik (Semitik). Menggunakan aksara Arab. Bahasa Al-Quran dan pusat Islam di Makkah dan Madinah. Sistem penulisan dari kanan ke kiri.',
        metadata: {
            category: 'language',
            region: 'asean-barat',
            country: 'Arab Saudi',
            name: 'Bahasa Arab',
            code: 'ar-SA',
            speakers: 30000000,
            family: 'Afroasiatik',
            script: 'Arab',
            status: 'resmi',
            tags: ['bahasa', 'asean-barat', 'arab-saudi', 'resmi', 'arab']
        }
    },
    // ==========================================================
    // 🇮🇷 IRAN — 1 BAHASA
    // ==========================================================
    {
        text: 'Bahasa Persia (Farsi) - Bahasa resmi Iran. Digunakan oleh lebih dari 80 juta penutur. Termasuk rumpun bahasa Indo-Eropa (Iranik). Menggunakan aksara Arab-Persia. Bahasa dengan sastra klasik yang kaya (Rumi, Hafez, Saadi).',
        metadata: {
            category: 'language',
            region: 'asean-barat',
            country: 'Iran',
            name: 'Bahasa Persia (Farsi)',
            code: 'fa',
            speakers: 80000000,
            family: 'Indo-Eropa',
            script: 'Arab-Persia',
            status: 'resmi',
            tags: ['bahasa', 'asean-barat', 'iran', 'resmi', 'persia']
        }
    },
    // ==========================================================
    // 🇹🇷 TURKI — 1 BAHASA
    // ==========================================================
    {
        text: 'Bahasa Turki - Bahasa resmi Turki dan Siprus Utara. Digunakan oleh lebih dari 80 juta penutur. Termasuk rumpun bahasa Turkik (Oghuz). Menggunakan aksara Latin (sejak 1928). Bahasa dengan harmoni vokal yang kuat dan struktur aglutinatif.',
        metadata: {
            category: 'language',
            region: 'asean-barat',
            country: 'Turki',
            name: 'Bahasa Turki',
            code: 'tr',
            speakers: 80000000,
            family: 'Turkik',
            script: 'Latin',
            status: 'resmi',
            tags: ['bahasa', 'asean-barat', 'turki', 'resmi', 'turkik']
        }
    },
    // ==========================================================
    // 🇮🇱 ISRAEL — 2 BAHASA
    // ==========================================================
    {
        text: 'Bahasa Ibrani - Bahasa resmi Israel. Digunakan oleh lebih dari 9 juta penutur. Termasuk rumpun bahasa Afroasiatik (Semitik). Menggunakan aksara Ibrani. Bahasa yang dihidupkan kembali (revival) setelah 2000 tahun. Bahasa Tanakh dan bahasa utama di Israel.',
        metadata: {
            category: 'language',
            region: 'asean-barat',
            country: 'Israel',
            name: 'Bahasa Ibrani',
            code: 'he',
            speakers: 9000000,
            family: 'Afroasiatik',
            script: 'Ibrani',
            status: 'resmi',
            tags: ['bahasa', 'asean-barat', 'israel', 'resmi', 'ibrani']
        }
    },
    {
        text: 'Bahasa Arab - Bahasa resmi Israel. Digunakan oleh lebih dari 2 juta penutur. Termasuk rumpun bahasa Afroasiatik (Semitik). Menggunakan aksara Arab. Digunakan oleh komunitas Arab di Israel.',
        metadata: {
            category: 'language',
            region: 'asean-barat',
            country: 'Israel',
            name: 'Bahasa Arab',
            code: 'ar-IL',
            speakers: 2000000,
            family: 'Afroasiatik',
            script: 'Arab',
            status: 'resmi',
            tags: ['bahasa', 'asean-barat', 'israel', 'resmi', 'arab']
        }
    },
    // ==========================================================
    // 🇮🇶 IRAK — 2 BAHASA
    // ==========================================================
    {
        text: 'Bahasa Arab - Bahasa resmi Irak. Digunakan oleh lebih dari 30 juta penutur. Termasuk rumpun bahasa Afroasiatik (Semitik). Menggunakan aksara Arab. Bahasa dengan dialek Irak yang khas.',
        metadata: {
            category: 'language',
            region: 'asean-barat',
            country: 'Irak',
            name: 'Bahasa Arab',
            code: 'ar-IQ',
            speakers: 30000000,
            family: 'Afroasiatik',
            script: 'Arab',
            status: 'resmi',
            tags: ['bahasa', 'asean-barat', 'irak', 'resmi', 'arab']
        }
    },
    {
        text: 'Bahasa Kurdi - Bahasa resmi Irak (Kurdistan). Digunakan oleh lebih dari 6 juta penutur. Termasuk rumpun bahasa Indo-Eropa (Iranik). Menggunakan aksara Latin dan Arab. Bahasa dengan pengaruh dari bahasa Iran dan Turki.',
        metadata: {
            category: 'language',
            region: 'asean-barat',
            country: 'Irak',
            name: 'Bahasa Kurdi',
            code: 'ku',
            speakers: 6000000,
            family: 'Indo-Eropa',
            script: 'Latin, Arab',
            status: 'resmi',
            tags: ['bahasa', 'asean-barat', 'irak', 'resmi', 'kurdi']
        }
    },
    // ==========================================================
    // 🇸🇾 SURIAH — 1 BAHASA
    // ==========================================================
    {
        text: 'Bahasa Arab - Bahasa resmi Suriah. Digunakan oleh lebih dari 25 juta penutur. Termasuk rumpun bahasa Afroasiatik (Semitik). Menggunakan aksara Arab. Bahasa dengan dialek Suriah yang khas dan pengaruh dari bahasa Prancis.',
        metadata: {
            category: 'language',
            region: 'asean-barat',
            country: 'Suriah',
            name: 'Bahasa Arab',
            code: 'ar-SY',
            speakers: 25000000,
            family: 'Afroasiatik',
            script: 'Arab',
            status: 'resmi',
            tags: ['bahasa', 'asean-barat', 'suriah', 'resmi', 'arab']
        }
    },
    // ==========================================================
    // 🇯🇴 YORDANIA — 1 BAHASA
    // ==========================================================
    {
        text: 'Bahasa Arab - Bahasa resmi Yordania. Digunakan oleh lebih dari 11 juta penutur. Termasuk rumpun bahasa Afroasiatik (Semitik). Menggunakan aksara Arab. Bahasa dengan dialek Yordania yang khas.',
        metadata: {
            category: 'language',
            region: 'asean-barat',
            country: 'Yordania',
            name: 'Bahasa Arab',
            code: 'ar-JO',
            speakers: 11000000,
            family: 'Afroasiatik',
            script: 'Arab',
            status: 'resmi',
            tags: ['bahasa', 'asean-barat', 'yordania', 'resmi', 'arab']
        }
    },
    // ==========================================================
    // 🇱🇧 LEBANON — 2 BAHASA
    // ==========================================================
    {
        text: 'Bahasa Arab - Bahasa resmi Lebanon. Digunakan oleh lebih dari 6 juta penutur. Termasuk rumpun bahasa Afroasiatik (Semitik). Menggunakan aksara Arab. Bahasa dengan dialek Lebanon yang khas dan pengaruh dari bahasa Prancis.',
        metadata: {
            category: 'language',
            region: 'asean-barat',
            country: 'Lebanon',
            name: 'Bahasa Arab',
            code: 'ar-LB',
            speakers: 6000000,
            family: 'Afroasiatik',
            script: 'Arab',
            status: 'resmi',
            tags: ['bahasa', 'asean-barat', 'lebanon', 'resmi', 'arab']
        }
    },
    {
        text: 'Bahasa Prancis - Bahasa resmi Lebanon. Digunakan oleh lebih dari 4 juta penutur. Termasuk rumpun bahasa Roman. Menggunakan aksara Latin. Bahasa administrasi, pendidikan, dan budaya di Lebanon.',
        metadata: {
            category: 'language',
            region: 'asean-barat',
            country: 'Lebanon',
            name: 'Bahasa Prancis',
            code: 'fr',
            speakers: 4000000,
            family: 'Roman',
            script: 'Latin',
            status: 'resmi',
            tags: ['bahasa', 'asean-barat', 'lebanon', 'resmi', 'prancis']
        }
    },
    // ==========================================================
    // 🇾🇪 YAMAN — 1 BAHASA
    // ==========================================================
    {
        text: 'Bahasa Arab - Bahasa resmi Yaman. Digunakan oleh lebih dari 30 juta penutur. Termasuk rumpun bahasa Afroasiatik (Semitik). Menggunakan aksara Arab. Bahasa dengan dialek Yaman yang khas dan pengaruh dari bahasa Himyarit kuno.',
        metadata: {
            category: 'language',
            region: 'asean-barat',
            country: 'Yaman',
            name: 'Bahasa Arab',
            code: 'ar-YE',
            speakers: 30000000,
            family: 'Afroasiatik',
            script: 'Arab',
            status: 'resmi',
            tags: ['bahasa', 'asean-barat', 'yaman', 'resmi', 'arab']
        }
    },
    // ==========================================================
    // 🇴🇲 OMAN — 1 BAHASA
    // ==========================================================
    {
        text: 'Bahasa Arab - Bahasa resmi Oman. Digunakan oleh lebih dari 4 juta penutur. Termasuk rumpun bahasa Afroasiatik (Semitik). Menggunakan aksara Arab. Bahasa dengan dialek Oman yang khas.',
        metadata: {
            category: 'language',
            region: 'asean-barat',
            country: 'Oman',
            name: 'Bahasa Arab',
            code: 'ar-OM',
            speakers: 4000000,
            family: 'Afroasiatik',
            script: 'Arab',
            status: 'resmi',
            tags: ['bahasa', 'asean-barat', 'oman', 'resmi', 'arab']
        }
    },
    // ==========================================================
    // 🇦🇪 UEA — 1 BAHASA
    // ==========================================================
    {
        text: 'Bahasa Arab - Bahasa resmi Uni Emirat Arab. Digunakan oleh lebih dari 9 juta penutur. Termasuk rumpun bahasa Afroasiatik (Semitik). Menggunakan aksara Arab. Bahasa dengan dialek Emirat yang khas dan pengaruh dari bahasa Inggris dan Persia.',
        metadata: {
            category: 'language',
            region: 'asean-barat',
            country: 'Uni Emirat Arab',
            name: 'Bahasa Arab',
            code: 'ar-AE',
            speakers: 9000000,
            family: 'Afroasiatik',
            script: 'Arab',
            status: 'resmi',
            tags: ['bahasa', 'asean-barat', 'uea', 'resmi', 'arab']
        }
    },
    // ==========================================================
    // 🇶🇦 QATAR — 1 BAHASA
    // ==========================================================
    {
        text: 'Bahasa Arab - Bahasa resmi Qatar. Digunakan oleh lebih dari 2.5 juta penutur. Termasuk rumpun bahasa Afroasiatik (Semitik). Menggunakan aksara Arab. Bahasa dengan dialek Qatar yang khas dan pengaruh dari bahasa Inggris dan Persia.',
        metadata: {
            category: 'language',
            region: 'asean-barat',
            country: 'Qatar',
            name: 'Bahasa Arab',
            code: 'ar-QA',
            speakers: 2500000,
            family: 'Afroasiatik',
            script: 'Arab',
            status: 'resmi',
            tags: ['bahasa', 'asean-barat', 'qatar', 'resmi', 'arab']
        }
    }
];

export const DATA = data;

if (window.InternalLogger) {
    window.InternalLogger.info('LingoAseanBarat', '✅ Loaded ' + data.length + ' languages');
}
