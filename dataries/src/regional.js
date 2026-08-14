const RSS_FEEDS = [
    // DETIK (8)
    { name: 'Detik News', category: 'news', url: 'https://news.detik.com/rss', icon: '📰' },
    { name: 'Detik Finance', category: 'business', url: 'https://finance.detik.com/rss', icon: '💰' },
    { name: 'Detik Inet', category: 'technology', url: 'https://inet.detik.com/index.rss', icon: '💻' },
    { name: 'Detik Sport', category: 'sports', url: 'https://sport.detik.com/rss', icon: '⚽' },
    { name: 'Detik Health', category: 'health', url: 'https://health.detik.com/rss', icon: '🏥' },
    { name: 'Detik Travel', category: 'travel', url: 'https://travel.detik.com/rss', icon: '✈️' },
    { name: 'Detik Food', category: 'lifestyle', url: 'https://food.detik.com/rss', icon: '🍽️' },
    { name: 'Detik Otomotif', category: 'automotive', url: 'https://oto.detik.com/rss', icon: '🚗' },
    
    // KOMPAS (8)
    { name: 'Kompas News', category: 'news', url: 'https://news.kompas.com/rss', icon: '📰' },
    { name: 'Kompas Bisnis', category: 'business', url: 'https://bisnis.kompas.com/rss', icon: '💼' },
    { name: 'Kompas Tekno', category: 'technology', url: 'https://tekno.kompas.com/rss', icon: '🤖' },
    { name: 'Kompas Travel', category: 'travel', url: 'https://travel.kompas.com/rss', icon: '✈️' },
    { name: 'Kompas Lifestyle', category: 'lifestyle', url: 'https://lifestyle.kompas.com/rss', icon: '🌟' },
    { name: 'Kompas Health', category: 'health', url: 'https://health.kompas.com/rss', icon: '🏥' },
    { name: 'Kompas Property', category: 'property', url: 'https://properti.kompas.com/rss', icon: '🏠' },
    { name: 'Kompas Edukasi', category: 'education', url: 'https://edukasi.kompas.com/rss', icon: '🎓' },
    
    // CNBC (4)
    { name: 'CNBC Indonesia News', category: 'news', url: 'https://www.cnbcindonesia.com/news/rss', icon: '📈' },
    { name: 'CNBC Indonesia Market', category: 'business', url: 'https://www.cnbcindonesia.com/market/rss', icon: '📊' },
    { name: 'CNBC Indonesia Tech', category: 'technology', url: 'https://www.cnbcindonesia.com/technology/rss', icon: '💻' },
    { name: 'CNBC Indonesia Lifestyle', category: 'lifestyle', url: 'https://www.cnbcindonesia.com/lifestyle/rss', icon: '🌟' },
    
    // LIPUTAN6 (4)
    { name: 'Liputan6 News', category: 'news', url: 'https://www.liputan6.com/feeds/1', icon: '📺' },
    { name: 'Liputan6 Bisnis', category: 'business', url: 'https://www.liputan6.com/feeds/6', icon: '💼' },
    { name: 'Liputan6 Tekno', category: 'technology', url: 'https://www.liputan6.com/feeds/7', icon: '🤖' },
    { name: 'Liputan6 Sport', category: 'sports', url: 'https://www.liputan6.com/feeds/3', icon: '⚽' },
    
    // CNN (1)
    { name: 'CNN Indonesia', category: 'news', url: 'https://www.cnnindonesia.com/rss', icon: '🌐' },
    
    // TEMPO (4)
    { name: 'Tempo News', category: 'news', url: 'https://nasional.tempo.co/rss', icon: '📰' },
    { name: 'Tempo Bisnis', category: 'business', url: 'https://bisnis.tempo.co/rss', icon: '💼' },
    { name: 'Tempo Tekno', category: 'technology', url: 'https://tekno.tempo.co/rss', icon: '💻' },
    { name: 'Tempo Sport', category: 'sports', url: 'https://sport.tempo.co/rss', icon: '⚽' },
    
    // LAINNYA (30+)
    { name: 'Tribun News', category: 'news', url: 'https://www.tribunnews.com/rss', icon: '📰' },
    { name: 'Medcom News', category: 'news', url: 'https://www.medcom.id/feeds/berita', icon: '📰' },
    { name: 'Republika News', category: 'news', url: 'https://www.republika.co.id/rss', icon: '📰' },
    { name: 'JPNN News', category: 'news', url: 'https://www.jpnn.com/rss', icon: '📰' },
    { name: 'Suara News', category: 'news', url: 'https://www.suara.com/rss', icon: '📰' },
    { name: 'Merdeka News', category: 'news', url: 'https://www.merdeka.com/rss', icon: '📰' },
    { name: 'Fajar News', category: 'news', url: 'https://fajar.co.id/rss', icon: '📰' },
    { name: 'Rakyat Merdeka', category: 'news', url: 'https://rm.id/rss', icon: '📰' },
    { name: 'Berita Satu', category: 'news', url: 'https://www.beritasatu.com/rss', icon: '📰' },
    { name: 'Antara News', category: 'news', url: 'https://www.antaranews.com/rss', icon: '📰' },
    { name: 'Kumparan', category: 'news', url: 'https://kumparan.com/feed', icon: '📰' },
    { name: 'IDN Times', category: 'news', url: 'https://www.idntimes.com/feed', icon: '📰' },
    { name: 'Okezone News', category: 'news', url: 'https://news.okezone.com/rss', icon: '📰' },
    { name: 'Kontan', category: 'business', url: 'https://www.kontan.co.id/rss', icon: '📊' },
    { name: 'Bisnis.com', category: 'business', url: 'https://www.bisnis.com/rss', icon: '💼' },
    { name: 'Investor Daily', category: 'business', url: 'https://investor.id/rss', icon: '📈' },
    { name: 'Warta Ekonomi', category: 'business', url: 'https://www.wartaekonomi.co.id/feed', icon: '💰' },
    { name: 'KapanLagi', category: 'lifestyle', url: 'https://www.kapanlagi.com/rss', icon: '🌟' },
    { name: 'Cumicumi', category: 'lifestyle', url: 'https://www.cumicumi.com/rss', icon: '🎬' },
    { name: 'Bola.net', category: 'sports', url: 'https://www.bola.net/rss', icon: '⚽' },
    { name: 'Viva News', category: 'news', url: 'https://www.viva.co.id/rss', icon: '📰' },
    { name: 'Sindo News', category: 'news', url: 'https://www.sindonews.com/rss', icon: '📰' },
    { name: 'Harian Jogja', category: 'news', url: 'https://harianjogja.com/rss', icon: '📰' },
    { name: 'Bali Post', category: 'news', url: 'https://www.balipost.com/feed', icon: '🌺' },
    { name: 'Medan Bisnis', category: 'news', url: 'https://medanbisnis.com/feed', icon: '📰' },
    { name: 'Padang Ekspres', category: 'news', url: 'https://padangekspres.co.id/feed', icon: '📰' },
    { name: 'Papua News', category: 'news', url: 'https://papuaindonesia.com/feed', icon: '📰' },
    { name: 'Makassar Terkini', category: 'news', url: 'https://makassarterkini.com/feed', icon: '📰' },
    { name: 'Kaltim Post', category: 'news', url: 'https://kaltimpost.co.id/feed', icon: '📰' },
    { name: 'Lombok Post', category: 'news', url: 'https://lombokpost.com/feed', icon: '📰' },
    { name: 'Sumut Pos', category: 'news', url: 'https://sumutpos.co.id/feed', icon: '📰' },
    { name: 'Jabar News', category: 'news', url: 'https://jabarnews.com/feed', icon: '📰' },
    { name: 'Jateng News', category: 'news', url: 'https://jatengnews.com/feed', icon: '📰' },
    { name: 'Jatim News', category: 'news', url: 'https://jatimnews.com/feed', icon: '📰' },
    { name: 'Sulsel News', category: 'news', url: 'https://sulselnews.com/feed', icon: '📰' },
    { name: 'Papua Barat News', category: 'news', url: 'https://papuabaratnews.com/feed', icon: '📰' },
    { name: 'Aceh News', category: 'news', url: 'https://acehnews.com/feed', icon: '📰' },
    { name: 'Bengkulu News', category: 'news', url: 'https://bengkulu-news.com/feed', icon: '📰' },
    { name: 'Riau News', category: 'news', url: 'https://riau-news.com/feed', icon: '📰' },
    { name: 'Sumbar News', category: 'news', url: 'https://sumbar-news.com/feed', icon: '📰' },
    { name: 'Lampung News', category: 'news', url: 'https://lampung-news.com/feed', icon: '📰' },
    { name: 'Kaltara News', category: 'news', url: 'https://kaltara-news.com/feed', icon: '📰' }
];

const fetchRSS = async function(url) {
    try {
        const response = await fetch(
            'https://api.rss2json.com/v1/api.json?rss_url=' + encodeURIComponent(url)
        );
        const data = await response.json();
        return data.items || [];
    } catch (error) {
        return [];
    }
};

const loadRegionalNews = async function() {
    const allItems = [];
    let successCount = 0;

    for (const feed of RSS_FEEDS) {
        try {
            const items = await fetchRSS(feed.url);
            
            for (const item of items) {
                const text = feed.icon + ' ' + feed.name + ': ' + item.title + 
                            ' (' + feed.category + ') - ' + 
                            (item.description || '').substring(0, 300);
                
                const metadata = {
                    category: 'source',
                    type: 'news',
                    subcategory: 'regional',
                    source: feed.name,
                    region: 'indonesia',
                    category_news: feed.category,
                    title: item.title,
                    link: item.link,
                    pubDate: item.pubDate,
                    author: item.author || feed.name,
                    tags: ['berita', 'regional', 'indonesia', feed.category],
                    source_icon: feed.icon,
                    source_category: feed.category,
                    fetch_timestamp: new Date().toISOString()
                };
                
                allItems.push({ text: text, metadata: metadata });
            }
            
            successCount++;
            
        } catch (error) {
            // skip
        }
        
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    if (typeof window.__DATA_REGISTER === 'undefined') {
        window.__DATA_REGISTER = [];
    }
    for (const item of allItems) {
        window.__DATA_REGISTER.push(item);
    }

    if (typeof window.InternalLogger !== 'undefined') {
        window.InternalLogger.info('SrcRegional', '✅ Loaded ' + allItems.length + ' items from ' + successCount + '/' + RSS_FEEDS.length + ' sources');
    }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadRegionalNews);
} else {
    loadRegionalNews();
}
