const data = [
    // ==========================================================
    // 🌍 GLOBAL
    // ==========================================================
    {
        text: 'Upwork - Platform freelance global terbesar. Didirikan 2015. 60+ juta pengguna.',
        metadata: { category: 'marplace', type: 'freelance', name: 'Upwork', founded: 2015, country: 'Global', region: 'global', products: ['Programming', 'Desain', 'Writing'], tags: ['freelance', 'global', 'terbesar'], status: 'aktif' }
    },
    {
        text: 'Fiverr - Platform freelance global. Didirikan 2010. Micro-jobs mulai $5.',
        metadata: { category: 'marplace', type: 'freelance', name: 'Fiverr', founded: 2010, country: 'Global', region: 'global', products: ['Desain', 'Video', 'Writing'], tags: ['freelance', 'global', 'gig'], status: 'aktif' }
    },
    {
        text: 'Freelancer.com - Platform freelance global. Didirikan 2009. 60+ juta pengguna.',
        metadata: { category: 'marplace', type: 'freelance', name: 'Freelancer.com', founded: 2009, country: 'Global', region: 'global', products: ['Programming', 'Desain', 'Engineering'], tags: ['freelance', 'global', 'kompetisi'], status: 'aktif' }
    },
    {
        text: 'Toptal - Platform freelance eksklusif. Didirikan 2010. Top 3% talent dunia.',
        metadata: { category: 'marplace', type: 'freelance', name: 'Toptal', founded: 2010, country: 'Global', region: 'global', products: ['Programming', 'Desain', 'Finance'], tags: ['freelance', 'global', 'premium'], status: 'aktif' }
    },
    {
        text: 'Guru.com - Platform freelance tertua. Didirikan 1998. Fokus profesional berpengalaman.',
        metadata: { category: 'marplace', type: 'freelance', name: 'Guru.com', founded: 1998, country: 'Global', region: 'global', products: ['Programming', 'Desain', 'Legal'], tags: ['freelance', 'global', 'tertua'], status: 'aktif' }
    },
    {
        text: 'PeoplePerHour - Platform freelance Eropa. Didirikan 2007. Fokus UK & Eropa.',
        metadata: { category: 'marplace', type: 'freelance', name: 'PeoplePerHour', founded: 2007, country: 'Global', region: 'global', products: ['Programming', 'Desain', 'Writing'], tags: ['freelance', 'global', 'eropa'], status: 'aktif' }
    },
    {
        text: '99designs - Platform khusus desain grafis. Didirikan 2008. Kompetisi desain.',
        metadata: { category: 'marplace', type: 'freelance', name: '99designs', founded: 2008, country: 'Global', region: 'global', products: ['Desain Grafis', 'Logo', 'Web'], tags: ['freelance', 'global', 'desain'], status: 'aktif' }
    },
    
    // ==========================================================
    // 🇮🇩 INDONESIA
    // ==========================================================
    {
        text: 'Sribulancer - Freelance terbesar Indonesia. Didirikan 2012. Fokus freelancer lokal.',
        metadata: { category: 'marplace', type: 'freelance', name: 'Sribulancer', founded: 2012, country: 'Indonesia', region: 'asia-tenggara', products: ['Desain', 'Programming', 'Writing'], tags: ['freelance', 'asia-tenggara', 'indonesia'], status: 'aktif' }
    },
    {
        text: 'Fastwork - Freelance Asia Tenggara. Didirikan 2015. Transaksi cepat & mudah.',
        metadata: { category: 'marplace', type: 'freelance', name: 'Fastwork', founded: 2015, country: 'Thailand', region: 'asia-tenggara', products: ['Desain', 'Programming', 'Marketing'], tags: ['freelance', 'asia-tenggara', 'cepat'], status: 'aktif' }
    },
    {
        text: 'Projects.co.id - Freelance IT Indonesia. Didirikan 2012. Fokus proyek teknologi.',
        metadata: { category: 'marplace', type: 'freelance', name: 'Projects.co.id', founded: 2012, country: 'Indonesia', region: 'asia-tenggara', products: ['IT', 'Programming', 'Desain'], tags: ['freelance', 'asia-tenggara', 'it'], status: 'aktif' }
    },
    
    // ==========================================================
    // 🇪🇺 EROPA
    // ==========================================================
    {
        text: 'Malt - Freelance terbesar Eropa. Didirikan 2013 di Prancis. Konsultan IT & marketing.',
        metadata: { category: 'marplace', type: 'freelance', name: 'Malt', founded: 2013, country: 'Prancis', region: 'eropa', products: ['IT', 'Marketing', 'Design'], tags: ['freelance', 'eropa', 'terbesar'], status: 'aktif' }
    },
    {
        text: 'Twago - Freelance terbesar Jerman. Didirikan 2009. Profesional IT & engineering.',
        metadata: { category: 'marplace', type: 'freelance', name: 'Twago', founded: 2009, country: 'Jerman', region: 'eropa', products: ['IT', 'Engineering', 'Design'], tags: ['freelance', 'eropa', 'jerman'], status: 'aktif' }
    },
    {
        text: 'Comatch - Freelance consulting Eropa. Didirikan 2016. Fokus konsultan bisnis.',
        metadata: { category: 'marplace', type: 'freelance', name: 'Comatch', founded: 2016, country: 'Jerman', region: 'eropa', products: ['Consulting', 'Business', 'Strategy'], tags: ['freelance', 'eropa', 'konsultan'], status: 'aktif' }
    },
    
    // ==========================================================
    // 🇺🇸 AMERIKA
    // ==========================================================
    {
        text: 'Contra - Freelance modern tanpa komisi. Didirikan 2017. Favorit milenial & Gen Z.',
        metadata: { category: 'marplace', type: 'freelance', name: 'Contra', founded: 2017, country: 'AS', region: 'global', products: ['Programming', 'Desain', 'Video'], tags: ['freelance', 'global', 'no-komisi'], status: 'aktif' }
    },
    {
        text: 'Working Not Working - Khusus kreatif & desainer. Didirikan 2012. Komunitas kreatif global.',
        metadata: { category: 'marplace', type: 'freelance', name: 'Working Not Working', founded: 2012, country: 'AS', region: 'global', products: ['Kreatif', 'Desain', 'Art'], tags: ['freelance', 'global', 'kreatif'], status: 'aktif' }
    },
    {
        text: 'Envato Studio - Marketplace jasa kreatif. Didirikan 2006. Desain, video, audio.',
        metadata: { category: 'marplace', type: 'freelance', name: 'Envato Studio', founded: 2006, country: 'AS', region: 'global', products: ['Desain', 'Video', 'Audio'], tags: ['freelance', 'global', 'kreatif'], status: 'aktif' }
    },
    
    // ==========================================================
    // 🇨🇳 CHINA
    // ==========================================================
    {
        text: 'Zhaopin - Platform kerja & freelance China. Didirikan 1994. Tulang punggung pasar kerja China.',
        metadata: { category: 'marplace', type: 'freelance', name: 'Zhaopin', founded: 1994, country: 'China', region: 'asia-timur', products: ['IT', 'Marketing', 'Finance'], tags: ['freelance', 'asia-timur', 'china'], status: 'aktif' }
    },
    {
        text: 'Zhuanzhuan - Platform freelance China. Didirikan 2015. Fokus freelancer muda China.',
        metadata: { category: 'marplace', type: 'freelance', name: 'Zhuanzhuan', founded: 2015, country: 'China', region: 'asia-timur', products: ['Programming', 'Desain', 'Writing'], tags: ['freelance', 'asia-timur', 'china'], status: 'aktif' }
    },
    
    // ==========================================================
    // 🇮🇳 INDIA
    // ==========================================================
    {
        text: 'WorknHire - Freelance India. Didirikan 2015. Fokus freelancer & startup India.',
        metadata: { category: 'marplace', type: 'freelance', name: 'WorknHire', founded: 2015, country: 'India', region: 'asia-selatan', products: ['Programming', 'Desain', 'Marketing'], tags: ['freelance', 'asia-selatan', 'india'], status: 'aktif' }
    },
    {
        text: 'Truelancer - Freelance India. Didirikan 2014. Platform freelancer India terkemuka.',
        metadata: { category: 'marplace', type: 'freelance', name: 'Truelancer', founded: 2014, country: 'India', region: 'asia-selatan', products: ['Programming', 'Desain', 'Writing'], tags: ['freelance', 'asia-selatan', 'india'], status: 'aktif' }
    }
];

export const DATA = data;

if (window.InternalLogger) {
    window.InternalLogger.info('MarplaceFreelance', '✅ Loaded ' + data.length + ' freelance platforms');
}
