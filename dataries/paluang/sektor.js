const data = [
    // ==========================================================
    // 1. 🛒 E-COMMERCE & RETAIL DIGITAL
    // ==========================================================
    {
        text: 'E-commerce dan ritel digital terus tumbuh pesat di Asia Tenggara. Didorong oleh penetrasi internet tinggi, dompet digital, dan perubahan perilaku konsumen. Peluang: marketplace niche, dropshipping, logistik last-mile, dan social commerce. Tantangan: persaingan harga, regulasi data, dan retensi pelanggan.',
        metadata: {
            category: 'paluang',
            type: 'sektor',
            name: 'E-commerce & Retail Digital',
            code: 'ECOM',
            region: 'global',
            trend: 'growing',
            growthRate: 15.5,
            marketSize: 150000000000,
            keyCountries: ['Indonesia', 'Vietnam', 'Thailand', 'Malaysia', 'Singapura'],
            tags: ['bisnis', 'digital', 'ritel', 'e-commerce']
        }
    },
    // ==========================================================
    // 2. 🤖 KECERDASAN BUATAN (AI) & OTOMATISASI
    // ==========================================================
    {
        text: 'Kecerdasan buatan dan otomatisasi menjadi tulang punggung transformasi digital. Peluang: AI untuk UMKM, chatbot customer service, analisis prediktif, dan otomatisasi proses bisnis (RPA). AI generatif membuka peluang di konten, desain, dan software development. Tantangan: etika AI, regulasi, dan kesenjangan skill.',
        metadata: {
            category: 'paluang',
            type: 'sektor',
            name: 'AI & Otomatisasi',
            code: 'AUTO',
            region: 'global',
            trend: 'hypergrowth',
            growthRate: 38.0,
            marketSize: 500000000000,
            keyCountries: ['USA', 'China', 'Singapura', 'India'],
            tags: ['teknologi', 'AI', 'otomatisasi', 'digital']
        }
    },
    // ==========================================================
    // 3. ☀️ ENERGI TERBARUKAN & EKONOMI HIJAU
    // ==========================================================
    {
        text: 'Energi terbarukan dan ekonomi hijau menjadi prioritas global. Peluang: instalasi panel surya, kendaraan listrik (EV), baterai daur ulang, karbon kredit, dan konsultasi ESG. Insentif pemerintah dan komitmen net-zero emission mendorong pertumbuhan masif. Tantangan: biaya investasi awal dan infrastruktur.',
        metadata: {
            category: 'paluang',
            type: 'sektor',
            name: 'Energi Terbarukan & ESG',
            code: 'RENEW',
            region: 'global',
            trend: 'highgrowth',
            growthRate: 22.0,
            marketSize: 1200000000000,
            keyCountries: ['China', 'USA', 'India', 'Indonesia', 'Australia'],
            tags: ['energi', 'hijau', 'esg', 'solar', 'ev']
        }
    },
    // ==========================================================
    // 4. 🏥 KESEHATAN & BIOTEKNOLOGI
    // ==========================================================
    {
        text: 'Kesehatan dan bioteknologi berkembang pesat pasca-pandemi. Peluang: telemedicine, wearable health, genomik, dan pengembangan vaksin. Populasi menua dan kesadaran kesehatan meningkat. Tantangan: regulasi ketat, biaya R&D tinggi, dan distribusi layanan.',
        metadata: {
            category: 'paluang',
            type: 'sektor',
            name: 'Kesehatan & Bioteknologi',
            code: 'HEALTH',
            region: 'global',
            trend: 'stable',
            growthRate: 12.5,
            marketSize: 800000000000,
            keyCountries: ['USA', 'Swiss', 'China', 'India', 'Jerman'],
            tags: ['kesehatan', 'biotech', 'telemedicine', 'wellness']
        }
    },
    // ==========================================================
    // 5. 🎓 PENDIDIKAN & EDUTECH
    // ==========================================================
    {
        text: 'Edutech mengubah cara belajar dengan platform online, AI tutor, dan micro-credential. Peluang: kursus keterampilan digital (coding, AI, data), platform pembelajaran bahasa, dan solusi untuk sekolah negeri. Tantangan: digital divide, kredensial, dan retensi pelajar.',
        metadata: {
            category: 'paluang',
            type: 'sektor',
            name: 'Pendidikan & Edutech',
            code: 'EDU',
            region: 'asia-tenggara',
            trend: 'growing',
            growthRate: 18.0,
            marketSize: 250000000000,
            keyCountries: ['Indonesia', 'India', 'Vietnam', 'Filipina'],
            tags: ['pendidikan', 'edutech', 'kursus', 'digital']
        }
    },
    // ==========================================================
    // 6. 💳 FINANSIAL & FINTECH
    // ==========================================================
    {
        text: 'Fintech terus mendisrupsi perbankan tradisional dengan layanan pinjaman peer-to-peer, dompet digital, investasi mikro, dan insurtech. Inklusi keuangan menjadi pendorong utama. Peluang besar di unbanked population (sekitar 1.4 miliar orang). Tantangan: fraud, regulasi, dan keamanan data.',
        metadata: {
            category: 'paluang',
            type: 'sektor',
            name: 'Finansial & Fintech',
            code: 'FINTECH',
            region: 'global',
            trend: 'highgrowth',
            growthRate: 25.0,
            marketSize: 340000000000,
            keyCountries: ['Singapura', 'Indonesia', 'India', 'USA'],
            tags: ['finansial', 'fintech', 'dompetdigital', 'pinjaman']
        }
    },
    // ==========================================================
    // 7. 📦 LOGISTIK & SUPPLY CHAIN
    // ==========================================================
    {
        text: 'Logistik dan supply chain menjadi tulang punggung ekonomi digital. Peluang: optimasi rute dengan AI, sistem tracking real-time, pergudangan otomatis, dan cold chain untuk produk segar. E-commerce dan cross-border trade mendorong permintaan tinggi. Tantangan: infrastruktur dan biaya operasional.',
        metadata: {
            category: 'paluang',
            type: 'sektor',
            name: 'Logistik & Supply Chain',
            code: 'LOG',
            region: 'asia-tenggara',
            trend: 'growing',
            growthRate: 14.0,
            marketSize: 200000000000,
            keyCountries: ['Indonesia', 'Vietnam', 'Malaysia', 'Thailand'],
            tags: ['logistik', 'supplychain', 'coldchain', 'ecommerce']
        }
    },
    // ==========================================================
    // 8. 🎮 GAMING & E-SPORTS
    // ==========================================================
    {
        text: 'Industri gaming dan e-sports meledak dengan penetrasi mobile tinggi di Asia. Peluang: pengembangan game lokal, turnamen e-sports, streaming, dan merchandise. Game berbasis blockchain dan metaverse mulai menjadi tren. Tantangan: regulasi, monetisasi, dan persaingan global.',
        metadata: {
            category: 'paluang',
            type: 'sektor',
            name: 'Gaming & E-Sports',
            code: 'GAME',
            region: 'asia-tenggara',
            trend: 'hypergrowth',
            growthRate: 30.0,
            marketSize: 180000000000,
            keyCountries: ['Indonesia', 'Filipina', 'Vietnam', 'Thailand'],
            tags: ['gaming', 'esports', 'mobile', 'startup']
        }
    },
    // ==========================================================
    // 9. 🏝️ PARIWISATA & EKONOMI KREATIF
    // ==========================================================
    {
        text: 'Pariwisata pulih pasca-pandemi dengan tren wisata alam, staycation, dan pengalaman lokal. Ekonomi kreatif (kerajinan, fashion, kuliner, konten digital) menjadi pendorong utama. Peluang: platform booking lokal, homestay digital, dan craft marketplace. Tantangan: musiman dan ketergantungan pada stabilitas.',
        metadata: {
            category: 'paluang',
            type: 'sektor',
            name: 'Pariwisata & Ekonomi Kreatif',
            code: 'TOUR',
            region: 'asia-tenggara',
            trend: 'recovering',
            growthRate: 20.0,
            marketSize: 120000000000,
            keyCountries: ['Indonesia', 'Thailand', 'Vietnam', 'Malaysia'],
            tags: ['pariwisata', 'kreatif', 'budaya', 'kuliner']
        }
    },
    // ==========================================================
    // 10. 🚀 PERTANIAN & AGRI-TECH
    // ==========================================================
    {
        text: 'Agri-tech mengatasi tantangan ketahanan pangan dengan hidroponik, drone pertanian, sensor tanah, dan marketplace hasil tani. Indonesia sebagai negara agraris memiliki peluang besar. Tantangan: akses modal, literasi petani, dan infrastruktur pedesaan.',
        metadata: {
            category: 'paluang',
            type: 'sektor',
            name: 'Pertanian & Agri-tech',
            code: 'AGRI',
            region: 'asia-tenggara',
            trend: 'growing',
            growthRate: 16.5,
            marketSize: 150000000000,
            keyCountries: ['Indonesia', 'Vietnam', 'Thailand', 'Filipina'],
            tags: ['pertanian', 'agritech', 'pangan', 'hidroponik']
        }
    }
];

export const DATA = data;

if (window.InternalLogger) {
    window.InternalLogger.info('PaluangSektor', '✅ Loaded ' + data.length + ' sektor ekonomi & peluang!');
}
