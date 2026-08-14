const data = [
    {
        text: 'Indonesia memiliki peluang besar di sektor UMKM digital, ekonomi kreatif, dan agri-tech. Dengan populasi 280 juta dan penetrasi internet tinggi, pasar digital sangat potensial. Pemerintah mendorong digitalisasi UMKM dan startup berbasis AI.',
        metadata: {
            category: 'paluang',
            type: 'daerah',
            name: 'Indonesia',
            region: 'asia-tenggara',
            focus: ['UMKM Digital', 'Ekonomi Kreatif', 'Agri-tech'],
            potential: 'high',
            keySectors: ['E-commerce', 'Fintech', 'Edutech', 'Logistik'],
            tags: ['indonesia', 'umkm', 'digital', 'startup']
        }
    },
    {
        text: 'Singapura menjadi hub teknologi dan finansial Asia Tenggara. Peluang: fintech, AI, bioteknologi, dan logistik premium. Dukungan pemerintah kuat untuk riset dan inovasi. Startup Singapura sering menjadi pintu masuk ke pasar ASEAN.',
        metadata: {
            category: 'paluang',
            type: 'daerah',
            name: 'Singapura',
            region: 'asia-tenggara',
            focus: ['Fintech', 'AI', 'Bioteknologi', 'Logistik Premium'],
            potential: 'high',
            keySectors: ['Fintech', 'AI', 'Healthtech', 'Logistik'],
            tags: ['singapura', 'fintech', 'hub', 'startup']
        }
    }
];

export const DATA = data;

if (window.InternalLogger) {
    window.InternalLogger.info('PaluangDaerah', '✅ Loaded ' + data.length + ' peluang daerah!');
}
