const BATCH_SIZE = 5;
const BATCH_DELAY = 3000;

const RSS_FEEDS = [
    // ========== ASIA (15) ==========
    { name: 'Channel News Asia', category: 'news', region: 'asia', url: 'https://www.channelnewsasia.com/rss', icon: '🌏' },
    { name: 'South China Morning Post', category: 'news', region: 'asia', url: 'https://www.scmp.com/rss/feed', icon: '🇭🇰' },
    { name: 'Nikkei Asia', category: 'business', region: 'asia', url: 'https://asia.nikkei.com/rss', icon: '🇯🇵' },
    { name: 'The Straits Times', category: 'news', region: 'asia', url: 'https://www.straitstimes.com/rss', icon: '🇸🇬' },
    { name: 'The Japan Times', category: 'news', region: 'asia', url: 'https://www.japantimes.co.jp/feed', icon: '🇯🇵' },
    { name: 'Korea Times', category: 'news', region: 'asia', url: 'https://www.koreatimes.co.kr/rss', icon: '🇰🇷' },
    { name: 'The Hindu', category: 'news', region: 'asia', url: 'https://www.thehindu.com/rss/', icon: '🇮🇳' },
    { name: 'Times of India', category: 'news', region: 'asia', url: 'https://timesofindia.indiatimes.com/rss', icon: '🇮🇳' },
    { name: 'Dawn Pakistan', category: 'news', region: 'asia', url: 'https://www.dawn.com/feed', icon: '🇵🇰' },
    { name: 'The Star Malaysia', category: 'news', region: 'asia', url: 'https://www.thestar.com.my/rss', icon: '🇲🇾' },
    { name: 'Vietnam News', category: 'news', region: 'asia', url: 'https://vietnamnews.vn/rss', icon: '🇻🇳' },
    { name: 'The Nation Thailand', category: 'news', region: 'asia', url: 'https://www.nationthailand.com/rss', icon: '🇹🇭' },
    { name: 'Asia Times', category: 'news', region: 'asia', url: 'https://asiatimes.com/feed', icon: '🌏' },
    { name: 'The Diplomat', category: 'politics', region: 'asia', url: 'https://thediplomat.com/feed', icon: '🎯' },
    { name: 'Malay Mail', category: 'news', region: 'asia', url: 'https://www.malaymail.com/rss', icon: '🇲🇾' },
    
    // ========== TIMUR TENGAH (10) ==========
    { name: 'Arab News', category: 'news', region: 'timur-tengah', url: 'https://www.arabnews.com/rss/all', icon: '🇸🇦' },
    { name: 'The National UAE', category: 'news', region: 'timur-tengah', url: 'https://www.thenationalnews.com/rss', icon: '🇦🇪' },
    { name: 'Gulf News', category: 'news', region: 'timur-tengah', url: 'https://gulfnews.com/rss', icon: '🇦🇪' },
    { name: 'Jerusalem Post', category: 'news', region: 'timur-tengah', url: 'https://www.jpost.com/rss', icon: '🇮🇱' },
    { name: 'Mehr News Iran', category: 'news', region: 'timur-tengah', url: 'https://en.mehrnews.com/rss', icon: '🇮🇷' },
    { name: 'Daily Sabah Turkey', category: 'news', region: 'timur-tengah', url: 'https://www.dailysabah.com/rss', icon: '🇹🇷' },
    { name: 'The Times of Israel', category: 'news', region: 'timur-tengah', url: 'https://www.timesofisrael.com/feed', icon: '🇮🇱' },
    { name: 'Egypt Independent', category: 'news', region: 'timur-tengah', url: 'https://www.egyptindependent.com/feed', icon: '🇪🇬' },
    { name: 'Al Monitor', category: 'politics', region: 'timur-tengah', url: 'https://www.al-monitor.com/feed', icon: '📰' },
    { name: 'Middle East Eye', category: 'news', region: 'timur-tengah', url: 'https://www.middleeasteye.net/feed', icon: '🕌' },
    
    // ========== EROPA (10) ==========
    { name: 'The Guardian UK', category: 'news', region: 'eropa', url: 'https://www.theguardian.com/world/rss', icon: '🇬🇧' },
    { name: 'Le Monde', category: 'news', region: 'eropa', url: 'https://www.lemonde.fr/en/rss', icon: '🇫🇷' },
    { name: 'Der Spiegel', category: 'news', region: 'eropa', url: 'https://www.spiegel.de/schlagzeilen/index.rss', icon: '🇩🇪' },
    { name: 'El Pais', category: 'news', region: 'eropa', url: 'https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/portada', icon: '🇪🇸' },
    { name: 'La Repubblica', category: 'news', region: 'eropa', url: 'https://www.repubblica.it/rss/homepage/rss2.0.xml', icon: '🇮🇹' },
    { name: 'Deutsche Welle', category: 'news', region: 'eropa', url: 'https://rss.dw.com/atom', icon: '🇩🇪' },
    { name: 'France24', category: 'news', region: 'eropa', url: 'https://www.france24.com/en/rss', icon: '🇫🇷' },
    { name: 'The Moscow Times', category: 'news', region: 'eropa', url: 'https://www.themoscowtimes.com/rss', icon: '🇷🇺' },
    { name: 'EuroNews', category: 'news', region: 'eropa', url: 'https://www.euronews.com/rss', icon: '🇪🇺' },
    { name: 'Politico EU', category: 'politics', region: 'eropa', url: 'https://www.politico.eu/feed', icon: '🏛️' },
    
    // ========== AMERIKA (10) ==========
    { name: 'The Globe and Mail', category: 'news', region: 'amerika', url: 'https://www.theglobeandmail.com/feed/', icon: '🇨🇦' },
    { name: 'The Wall Street Journal', category: 'business', region: 'amerika', url: 'https://feeds.wsjonline.com/wsj/global', icon: '📊' },
    { name: 'The Washington Post', category: 'news', region: 'amerika', url: 'https://feeds.washingtonpost.com/rss/world', icon: '🇺🇸' },
    { name: 'Los Angeles Times', category: 'news', region: 'amerika', url: 'https://www.latimes.com/rss', icon: '🇺🇸' },
    { name: 'USA Today', category: 'news', region: 'amerika', url: 'https://www.usatoday.com/rss', icon: '🇺🇸' },
    { name: 'The New York Post', category: 'news', region: 'amerika', url: 'https://nypost.com/rss', icon: '🇺🇸' },
    { name: 'Fox News', category: 'news', region: 'amerika', url: 'https://feeds.foxnews.com/foxnews/world', icon: '🇺🇸' },
    { name: 'El Universal Mexico', category: 'news', region: 'amerika', url: 'https://www.eluniversal.com.mx/rss', icon: '🇲🇽' },
    { name: 'Clarin Argentina', category: 'news', region: 'amerika', url: 'https://www.clarin.com/rss', icon: '🇦🇷' },
    { name: 'Folha de S.Paulo', category: 'news', region: 'amerika', url: 'https://www.folha.uol.com.br/rss', icon: '🇧🇷' },
    
    // ========== AFRIKA (5) ==========
    { name: 'AllAfrica', category: 'news', region: 'afrika', url: 'https://allafrica.com/tools/headlines/rss/latest/headlines.rss', icon: '🌍' },
    { name: 'The East African', category: 'news', region: 'afrika', url: 'https://www.theeastafrican.co.ke/rss', icon: '🇰🇪' },
    { name: 'Mail & Guardian', category: 'news', region: 'afrika', url: 'https://mg.co.za/feed', icon: '🇿🇦' },
    { name: 'Vanguard Nigeria', category: 'news', region: 'afrika', url: 'https://www.vanguardngr.com/feed', icon: '🇳🇬' },
    { name: 'GhanaWeb', category: 'news', region: 'afrika', url: 'https://www.ghanaweb.com/feed', icon: '🇬🇭' },
    
    // ========== PASIFIK (3) ==========
    { name: 'Sydney Morning Herald', category: 'news', region: 'pasifik', url: 'https://www.smh.com.au/rss/feed', icon: '🇦🇺' },
    { name: 'New Zealand Herald', category: 'news', region: 'pasifik', url: 'https://www.nzherald.co.nz/rss', icon: '🇳🇿' },
    { name: 'The Fiji Times', category: 'news', region: 'pasifik', url: 'https://www.fijitimes.com/feed', icon: '🇫🇯' }
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

const loadInternationalNews = async function() {
    const allItems = [];
    let successCount = 0;
    const processedUrls = new Set();

    for (let i = 0; i < RSS_FEEDS.length; i += BATCH_SIZE) {
        const batch = RSS_FEEDS.slice(i, i + BATCH_SIZE);
        
        for (const feed of batch) {
            if (processedUrls.has(feed.url)) continue;
            processedUrls.add(feed.url);
            
            try {
                const items = await fetchRSS(feed.url);
                
                for (const item of items) {
                    const text = feed.icon + ' ' + feed.name + ': ' + item.title + 
                                ' (' + feed.category + ') - ' + 
                                (item.description || '').substring(0, 300);
                    
                    const metadata = {
                        category: 'source',
                        type: 'news',
                        subcategory: 'international',
                        source: feed.name,
                        region: feed.region,
                        category_news: feed.category,
                        title: item.title,
                        link: item.link,
                        pubDate: item.pubDate,
                        author: item.author || feed.name,
                        tags: ['berita', 'internasional', feed.region, feed.category],
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
        }
        
        if (i + BATCH_SIZE < RSS_FEEDS.length) {
            await new Promise(resolve => setTimeout(resolve, BATCH_DELAY));
        }
    }

    if (typeof window.__DATA_REGISTER === 'undefined') {
        window.__DATA_REGISTER = [];
    }
    for (const item of allItems) {
        window.__DATA_REGISTER.push(item);
    }

    if (typeof window.InternalLogger !== 'undefined') {
        window.InternalLogger.info('SrcInternational', '✅ Loaded ' + allItems.length + ' items from ' + successCount + '/' + RSS_FEEDS.length + ' sources');
    }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadInternationalNews);
} else {
    loadInternationalNews();
}
