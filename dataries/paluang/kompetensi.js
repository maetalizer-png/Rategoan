const data = [
    {
        text: 'Data Science & Analytics — Kemampuan mengolah dan menganalisis data menjadi sangat penting. Perusahaan membutuhkan data scientist, data analyst, dan data engineer untuk mengambil keputusan berbasis data. Skill: Python, SQL, Machine Learning, Tableau.',
        metadata: {
            category: 'paluang',
            type: 'kompetensi',
            name: 'Data Science & Analytics',
            code: 'SKILL-DATA',
            demand: 'very-high',
            avgSalary: 120000,
            skillLevel: 'advanced',
            tools: ['Python', 'SQL', 'TensorFlow', 'Tableau'],
            industries: ['Teknologi', 'Keuangan', 'E-commerce', 'Kesehatan'],
            tags: ['data', 'analytics', 'python', 'machine-learning']
        }
    },
    {
        text: 'AI & Machine Learning — Spesialis AI sangat dicari untuk mengembangkan solusi cerdas. Peluang: AI Engineer, ML Engineer, NLP Specialist. Skill: Python, PyTorch, Deep Learning, Cloud AI (AWS, GCP).',
        metadata: {
            category: 'paluang',
            type: 'kompetensi',
            name: 'AI & Machine Learning',
            code: 'SKILL-AI',
            demand: 'very-high',
            avgSalary: 140000,
            skillLevel: 'advanced',
            tools: ['Python', 'PyTorch', 'TensorFlow', 'AWS SageMaker'],
            industries: ['Teknologi', 'Otomotif', 'Kesehatan', 'Keuangan'],
            tags: ['AI', 'machine-learning', 'deep-learning', 'python']
        }
    },
    {
        text: 'Digital Marketing & Social Media — Kemampuan memasarkan produk secara digital sangat penting. Skill: SEO/SEM, Content Marketing, Social Media Management, Data Analytics, Copywriting. Sertifikasi Google Ads & Meta Blueprint sangat berharga.',
        metadata: {
            category: 'paluang',
            type: 'kompetensi',
            name: 'Digital Marketing',
            code: 'SKILL-MARKET',
            demand: 'high',
            avgSalary: 70000,
            skillLevel: 'intermediate',
            tools: ['Google Analytics', 'Meta Ads', 'SEO', 'Content Writing'],
            industries: ['Semua Industri'],
            tags: ['digital-marketing', 'seo', 'social-media', 'ads']
        }
    },
    {
        text: 'Cloud Computing & DevOps — Infrastruktur cloud dan otomatisasi menjadi kunci. Skill: AWS/Azure/GCP, Kubernetes, Docker, CI/CD, Infrastructure as Code (Terraform). Sertifikasi Cloud sangat dihargai.',
        metadata: {
            category: 'paluang',
            type: 'kompetensi',
            name: 'Cloud & DevOps',
            code: 'SKILL-CLOUD',
            demand: 'very-high',
            avgSalary: 130000,
            skillLevel: 'advanced',
            tools: ['AWS', 'Docker', 'Kubernetes', 'Terraform', 'CI/CD'],
            industries: ['Teknologi', 'Keuangan', 'E-commerce', 'Startup'],
            tags: ['cloud', 'devops', 'aws', 'kubernetes']
        }
    },
    {
        text: 'Cybersecurity — Keamanan siber menjadi prioritas utama perusahaan. Skill: Network Security, Ethical Hacking, Security Auditing, Cloud Security, Compliance (GDPR, ISO 27001). Sertifikasi CISSP, CEH sangat berharga.',
        metadata: {
            category: 'paluang',
            type: 'kompetensi',
            name: 'Cybersecurity',
            code: 'SKILL-SEC',
            demand: 'high',
            avgSalary: 125000,
            skillLevel: 'advanced',
            tools: ['Wireshark', 'Metasploit', 'Nmap', 'SIEM'],
            industries: ['Semua Industri'],
            tags: ['cybersecurity', 'hacking', 'security', 'compliance']
        }
    }
];

export const DATA = data;

if (window.InternalLogger) {
    window.InternalLogger.info('PaluangKompetensi', '✅ Loaded ' + data.length + ' kompetensi!');
}
