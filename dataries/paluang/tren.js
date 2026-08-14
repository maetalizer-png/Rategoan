const data = [
    {
        text: 'Adopsi AI dan otomatisasi semakin meluas di berbagai industri. Perusahaan berlomba mengintegrasikan AI untuk efisiensi, personalisasi, dan prediksi. AI generatif mengubah cara konten, desain, dan software dikembangkan. Investasi di AI mencapai rekor tertinggi.',
        metadata: {
            category: 'paluang',
            type: 'tren',
            name: 'AI & Otomatisasi',
            code: 'TREN-AI',
            region: 'global',
            impact: 'very-high',
            adoptionRate: 65,
            keyIndustries: ['Teknologi', 'Manufaktur', 'Kesehatan', 'Keuangan'],
            tags: ['AI', 'otomatisasi', 'teknologi', 'digital']
        }
    },
    {
        text: 'Ekonomi hijau dan keberlanjutan menjadi fokus utama. Konsumen dan investor semakin peduli ESG. Perusahaan beralih ke energi terbarukan, pengurangan emisi, dan rantai pasok berkelanjutan. Produk ramah lingkungan semakin diminati.',
        metadata: {
            category: 'paluang',
            type: 'tren',
            name: 'Ekonomi Hijau & ESG',
            code: 'TREN-GREEN',
            region: 'global',
            impact: 'high',
            adoptionRate: 55,
            keyIndustries: ['Energi', 'Manufaktur', 'Fashion', 'Makanan'],
            tags: ['hijau', 'esg', 'keberlanjutan', 'ramah-lingkungan']
        }
    },
    {
        text: 'Model kerja hybrid dan remote menjadi permanen. Perusahaan mengadopsi fleksibilitas kerja untuk menarik talenta terbaik. Digital nomad dan coworking space meningkat. Teknologi kolaborasi (Zoom, Slack, Teams) terus berkembang.',
        metadata: {
            category: 'paluang',
            type: 'tren',
            name: 'Remote & Hybrid Work',
            code: 'TREN-WORK',
            region: 'global',
            impact: 'high',
            adoptionRate: 70,
            keyIndustries: ['Teknologi', 'Pendidikan', 'Konsultasi', 'Kreatif'],
            tags: ['remote', 'hybrid', 'digital-nomad', 'fleksibilitas']
        }
    },
    {
        text: 'Personalization dan customer experience menjadi pembeda utama. Perusahaan menggunakan data dan AI untuk memberikan pengalaman yang disesuaikan. Chatbot dan rekomendasi produk meningkatkan konversi dan loyalitas pelanggan.',
        metadata: {
            category: 'paluang',
            type: 'tren',
            name: 'Personalization & CX',
            code: 'TREN-CX',
            region: 'global',
            impact: 'medium',
            adoptionRate: 60,
            keyIndustries: ['E-commerce', 'Fintech', 'Travel', 'Kesehatan'],
            tags: ['personalization', 'cx', 'data', 'ai']
        }
    },
    {
        text: 'Kesehatan dan wellness menjadi prioritas utama masyarakat pasca-pandemi. Investasi di telemedicine, wearable health, dan mental health meningkat. Produk organik dan gaya hidup sehat semakin populer.',
        metadata: {
            category: 'paluang',
            type: 'tren',
            name: 'Kesehatan & Wellness',
            code: 'TREN-HEALTH',
            region: 'global',
            impact: 'high',
            adoptionRate: 75,
            keyIndustries: ['Kesehatan', 'F&B', 'Fitness', 'Teknologi'],
            tags: ['kesehatan', 'wellness', 'telemedicine', 'organik']
        }
    }
];

export const DATA = data;

if (window.InternalLogger) {
    window.InternalLogger.info('PaluangTren', '✅ Loaded ' + data.length + ' tren bisnis!');
}
