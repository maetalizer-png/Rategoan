const NETWORK_FAIL_MESSAGE =
  'Gagal mengambil berita terkini — bisa karena tidak ada koneksi, atau layanan RSS sedang tidak bisa diakses dari sini. Raget 100% berjalan lokal tanpa server perantara, jadi berita terkini langsung bergantung pada koneksi perangkat ini.';

const FEEDS = [
  { name: 'Detik', url: 'https://rss.detik.com/index.php/detikcom' },
  { name: 'Antara News', url: 'https://www.antaranews.com/rss/terkini.xml' },
];

async function fetchJson(url) {
  const res = await fetch(url, { mode: 'cors' });
  if (!res.ok) throw new Error('HTTP ' + res.status);
  return res.json();
}

function stripHtml(s) {
  return String(s || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function truncateClean(s, max) {
  const text = String(s || '').replace(/[,;:\s]+$/, '');
  if (text.length <= max) return text;
  const dot = text.slice(0, max).lastIndexOf('. ');
  if (dot > max * 0.4) return text.slice(0, dot + 1);
  const space = text.slice(0, max).lastIndexOf(' ');
  return (space > 0 ? text.slice(0, space) : text.slice(0, max)).replace(/[,;:\s]+$/, '') + '…';
}

async function fetchFeed(feed) {
  const url = 'https://api.rss2json.com/v1/api.json?rss_url=' + encodeURIComponent(feed.url);
  const data = await fetchJson(url);
  if (!data || data.status !== 'ok' || !Array.isArray(data.items)) return null;
  return data.items.map((it) => ({
    title: stripHtml(it.title),
    summary: truncateClean(stripHtml(it.description), 280),
    link: it.link,
    pubDate: it.pubDate,
    source: feed.name,
  }));
}

async function latest(topic) {
  if (typeof fetch !== 'function') return { ok: false, message: NETWORK_FAIL_MESSAGE };
  const q = String(topic || '').trim().toLowerCase();
  let items = [];
  const sourcesTried = [];
  for (const feed of FEEDS) {
    try {
      const feedItems = await fetchFeed(feed);
      if (feedItems && feedItems.length) {
        items = items.concat(feedItems);
        sourcesTried.push(feed.name);
      }
    } catch (e) { console.warn('[Rategoan Fallback] news:', e); }
  }
  if (!items.length) return { ok: false, message: NETWORK_FAIL_MESSAGE };
  let filtered = items;
  if (q) {
    filtered = items.filter((it) => (it.title + ' ' + it.summary).toLowerCase().includes(q));
    if (!filtered.length) {
      return {
        ok: false,
        message: 'Sudah dicari di RSS berita (' + sourcesTried.join(', ') + ') tapi tidak ketemu berita tentang "' + q + '".',
      };
    }
  }
  return { ok: true, items: filtered.slice(0, 5), sources: sourcesTried };
}

export const news = Object.freeze({ latest });
