const RSS_FEEDS = [
    // CNN GROUP (5)
    { name: 'CNN Top Stories', category: 'news', url: 'http://rss.cnn.com/rss/cnn_topstories.rss', icon: '🌐' },
    { name: 'CNN World', category: 'world', url: 'http://rss.cnn.com/rss/cnn_world.rss', icon: '🌍' },
    { name: 'CNN Business', category: 'business', url: 'http://rss.cnn.com/rss/money_news_international.rss', icon: '💼' },
    { name: 'CNN Politics', category: 'politics', url: 'http://rss.cnn.com/rss/cnn_allpolitics.rss', icon: '🏛️' },
    { name: 'CNN Tech', category: 'technology', url: 'http://rss.cnn.com/rss/cnn_tech.rss', icon: '💻' },
    
    // BBC GROUP (8)
    { name: 'BBC News', category: 'news', url: 'http://feeds.bbci.co.uk/news/rss.xml', icon: '📰' },
    { name: 'BBC World', category: 'world', url: 'http://feeds.bbci.co.uk/news/world/rss.xml', icon: '🌍' },
    { name: 'BBC Business', category: 'business', url: 'http://feeds.bbci.co.uk/news/business/rss.xml', icon: '💼' },
    { name: 'BBC Technology', category: 'technology', url: 'http://feeds.bbci.co.uk/news/technology/rss.xml', icon: '💻' },
    { name: 'BBC Health', category: 'health', url: 'http://feeds.bbci.co.uk/news/health/rss.xml', icon: '🏥' },
    { name: 'BBC Science', category: 'science', url: 'http://feeds.bbci.co.uk/news/science_and_environment/rss.xml', icon: '🔬' },
    { name: 'BBC Politics', category: 'politics', url: 'http://feeds.bbci.co.uk/news/politics/rss.xml', icon: '🏛️' },
    { name: 'BBC Sport', category: 'sports', url: 'http://feeds.bbci.co.uk/sport/rss.xml', icon: '⚽' },
    
    // REUTERS GROUP (7)
    { name: 'Reuters Top News', category: 'news', url: 'http://feeds.reuters.com/reuters/topNews', icon: '📰' },
    { name: 'Reuters World', category: 'world', url: 'http://feeds.reuters.com/Reuters/domesticNews', icon: '🌍' },
    { name: 'Reuters Business', category: 'business', url: 'http://feeds.reuters.com/reuters/businessNews', icon: '💼' },
    { name: 'Reuters Technology', category: 'technology', url: 'http://feeds.reuters.com/reuters/technologyNews', icon: '💻' },
    { name: 'Reuters Health', category: 'health', url: 'http://feeds.reuters.com/reuters/healthNews', icon: '🏥' },
    { name: 'Reuters Science', category: 'science', url: 'http://feeds.reuters.com/reuters/scienceNews', icon: '🔬' },
    { name: 'Reuters Money', category: 'finance', url: 'http://feeds.reuters.com/reuters/MoneyNews', icon: '💰' },
    
    // AL JAZEERA (6)
    { name: 'Al Jazeera News', category: 'news', url: 'http://www.aljazeera.com/xml/rss/all.xml', icon: '🕌' },
    { name: 'Al Jazeera Middle East', category: 'world', url: 'http://www.aljazeera.com/xml/rss/middle-east.xml', icon: '🕌' },
    { name: 'Al Jazeera Africa', category: 'world', url: 'http://www.aljazeera.com/xml/rss/africa.xml', icon: '🌍' },
    { name: 'Al Jazeera Americas', category: 'world', url: 'http://www.aljazeera.com/xml/rss/americas.xml', icon: '🌎' },
    { name: 'Al Jazeera Asia', category: 'world', url: 'http://www.aljazeera.com/xml/rss/asia.xml', icon: '🌏' },
    { name: 'Al Jazeera Europe', category: 'world', url: 'http://www.aljazeera.com/xml/rss/europe.xml', icon: '🌍' },
    
    // NYT GROUP (6)
    { name: 'NYT Home', category: 'news', url: 'https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml', icon: '🗽' },
    { name: 'NYT World', category: 'world', url: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml', icon: '🌍' },
    { name: 'NYT Business', category: 'business', url: 'https://rss.nytimes.com/services/xml/rss/nyt/Business.xml', icon: '💼' },
    { name: 'NYT Technology', category: 'technology', url: 'https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml', icon: '💻' },
    { name: 'NYT Science', category: 'science', url: 'https://rss.nytimes.com/services/xml/rss/nyt/Science.xml', icon: '🔬' },
    { name: 'NYT Health', category: 'health', url: 'https://rss.nytimes.com/services/xml/rss/nyt/Health.xml', icon: '🏥' },
    
    // LAINNYA (3)
    { name: 'The Guardian Global', category: 'news', url: 'https://www.theguardian.com/world/rss', icon: '🇬🇧' },
    { name: 'Deutsche Welle Global', category: 'news', url: 'https://rss.dw.com/atom', icon: '🇩🇪' },
    { name: 'France24 Global', category: 'news', url: 'https://www.france24.com/en/rss', icon: '🇫🇷' }
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

const loadGlobalNews = async function() {
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
                    subcategory: 'global',
                    source: feed.name,
                    region: 'global',
                    category_news: feed.category,
                    title: item.title,
                    link: item.link,
                    pubDate: item.pubDate,
                    author: item.author || feed.name,
                    tags: ['berita', 'global', feed.category],
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
        window.InternalLogger.info('SrcGlobal', '✅ Loaded ' + allItems.length + ' items from ' + successCount + '/' + RSS_FEEDS.length + ' sources');
    }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadGlobalNews);
} else {
    loadGlobalNews();
}
