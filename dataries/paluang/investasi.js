const data = [
    {
        text: 'Properti & Real Estate — Investasi properti tetap menjadi pilihan utama di Indonesia. Pertumbuhan harga di kota-kota besar seperti Jakarta, Surabaya, dan Bandung rata-rata 8-12% per tahun. Properti komersial dan hunian vertikal mulai diminati. Properti di kawasan IKN juga menarik.',
        metadata: {
            category: 'paluang',
            type: 'investasi',
            name: 'Properti & Real Estate',
            code: 'INV-PROP',
            region: 'asia-tenggara',
            risk: 'medium',
            returnRate: 10.0,
            minCapital: 500000000,
            keyCountries: ['Indonesia', 'Singapura', 'Malaysia'],
            tags: ['investasi', 'properti', 'real-estate']
        }
    },
    {
        text: 'Saham & Reksadana — Investasi di saham sektor teknologi dan consumer goods menunjukkan kinerja stabil. Indeks IDX30 dan LQ45 menjadi acuan utama. Rekomendasi: saham dengan dividen tinggi dan pertumbuhan laba konsisten. Reksadana saham dan campuran cocok untuk pemula.',
        metadata: {
            category: 'paluang',
            type: 'investasi',
            name: 'Saham & Reksadana',
            code: 'INV-STOCK',
            region: 'asia-tenggara',
            risk: 'medium',
            returnRate: 12.0,
            minCapital: 10000000,
            keyCountries: ['Indonesia', 'Singapura', 'Malaysia'],
            tags: ['investasi', 'saham', 'reksadana', 'IDX']
        }
    },
    {
        text: 'Emas & Logam Mulia — Emas menjadi instrumen lindung nilai yang stabil. Harga emas cenderung naik 5-8% per tahun. Cocok untuk investor konservatif yang mencari keamanan aset jangka panjang. Emas batangan dan perhiasan bisa menjadi pilihan.',
        metadata: {
            category: 'paluang',
            type: 'investasi',
            name: 'Emas & Logam Mulia',
            code: 'INV-GOLD',
            region: 'global',
            risk: 'low',
            returnRate: 6.5,
            minCapital: 1000000,
            keyCountries: ['Global'],
            tags: ['investasi', 'emas', 'logam-mulia']
        }
    },
    {
        text: 'Obligasi & Surat Utang — Obligasi pemerintah dan korporasi menawarkan pendapatan tetap dengan risiko lebih rendah. SUKUK (obligasi syariah) juga populer di Indonesia. Cocok untuk investor yang mengutamakan keamanan dan arus kas stabil.',
        metadata: {
            category: 'paluang',
            type: 'investasi',
            name: 'Obligasi & SUKUK',
            code: 'INV-BOND',
            region: 'asia-tenggara',
            risk: 'low',
            returnRate: 6.0,
            minCapital: 10000000,
            keyCountries: ['Indonesia', 'Malaysia'],
            tags: ['investasi', 'obligasi', 'sukuk', 'surat-utang']
        }
    },
    {
        text: 'Deposito & Tabungan — Pilihan teraman untuk dana darurat. Bunga deposito sekitar 4-5% per tahun. Fleksibilitas rendah tapi aman. Cocok untuk investor pemula atau yang tidak ingin mengambil risiko.',
        metadata: {
            category: 'paluang',
            type: 'investasi',
            name: 'Deposito & Tabungan',
            code: 'INV-DEP',
            region: 'asia-tenggara',
            risk: 'very-low',
            returnRate: 4.5,
            minCapital: 1000000,
            keyCountries: ['Indonesia', 'Singapura', 'Malaysia'],
            tags: ['investasi', 'deposito', 'tabungan', 'aman']
        }
    }
];

export const DATA = data;

if (window.InternalLogger) {
    window.InternalLogger.info('PaluangInvestasi', '✅ Loaded ' + data.length + ' peluang investasi!');
}
