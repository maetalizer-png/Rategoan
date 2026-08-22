function ekstrakJudul(html) {
  const m = String(html || '').match(/<title[^>]*>([^<]+)<\/title>/i);
  return m ? m[1].replace(/\s+/g, ' ').trim() : null;
}

function ekstrakTeksHtml(html) {
  let cleaned = String(html || '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<svg[\s\S]*?<\/svg>/gi, ' ')
    .replace(/<nav[\s\S]*?<\/nav>/gi, ' ')
    .replace(/<footer[\s\S]*?<\/footer>/gi, ' ')
    .replace(/<header[\s\S]*?<\/header>/gi, ' ')
    .replace(/<aside[\s\S]*?<\/aside>/gi, ' ')
    .replace(/<form[\s\S]*?<\/form>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<div[^>]*(menu|nav|sidebar|breadcrumb|share|social|cookie|banner|ads?|widget|related|comment)[^>]*>[\s\S]*?<\/div>/gi, ' ');

  const articleMatch = cleaned.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
  const mainMatch = cleaned.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
  const bodyMatch = cleaned.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  let content = (articleMatch && articleMatch[1])
    || (mainMatch && mainMatch[1])
    || (bodyMatch && bodyMatch[1])
    || cleaned;

  content = content
    .replace(/<\/(p|div|h[1-6]|li|tr|br|blockquote)>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return bersihkanTeksMateri(content);
}

function barisSampah(line) {
  const s = line.trim();
  if (s.length < 25) return true;
  if (s.length < 40 && !/[.!?]$/.test(s)) return true;
  if (/^(menu|logo|search for|cari artikel|home|beranda|login|daftar|subscribe|ikuti|share|bagikan)/i.test(s)) return true;
  if (/\b(minutes?\s*read|min read|bagikan|komentar|leave a comment)\b/i.test(s) && s.length < 60) return true;
  if (/^(brainies|bertanya|materi belajar|pojok sekolah)(\s|$)/i.test(s) && s.length < 80) return true;
  const words = s.split(/\s+/);
  if (words.length <= 6 && words.every(function (w) { return w.length < 14; }) && !/[.!?]$/.test(s)) {
    if (/[A-Z][a-z]+ [A-Z][a-z]+/.test(s) && s.length < 50) return true;
  }
  return false;
}

export function bersihkanTeksMateri(teks) {
  let s = String(teks || '').replace(/\r/g, '\n');
  s = s.replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n');
  const lines = s.split('\n').map(function (l) { return l.replace(/\s+/g, ' ').trim(); });
  const kept = [];
  lines.forEach(function (line) {
    if (!line) return;
    if (barisSampah(line)) return;
    kept.push(line);
  });
  let out = kept.join('\n\n').replace(/\s+/g, ' ').trim();
  out = out.replace(/\b(menu|Logo|Search for:|Cari artikel di sini!)\b/gi, ' ');
  out = out.replace(/\b(brainies|Bertanya|Materi Belajar|Pojok Sekolah)\b/g, ' ');
  out = out.replace(/\b\d{1,2}\s+minutes?\s+read\b/gi, ' ');
  out = out.replace(/\b[A-Z][a-z]+\s+[A-Z][a-z]+\s+October\s+\d{1,2},\s+\d{4}\b/g, ' ');
  out = out.replace(/\d{1,3}[.,]\d{1,3}\s*(?:detik|dtk|menit|mnt)\b/gi, ' ');
  out = out.replace(/\b\d{1,3}[.,]\d{1,3}(?:detik|dtk)\b/gi, ' ');
  out = out.replace(/\[\s*(?:tertawa|ketawa|music|musik|applause|tepuk)\s*\]/gi, ' ');
  out = out.replace(/\(\s*(?:tertawa|ketawa|music|musik)\s*\)/gi, ' ');
  out = out.replace(/\[\s*\d{1,2}:\d{2}(?::\d{2})?\s*\]/g, ' ');
  out = out.replace(/\(\s*\d{1,2}:\d{2}(?::\d{2})?\s*\)/g, ' ');
  out = out.replace(/(^|[.!?]\s+)\d{1,2}:\d{2}(?::\d{2})?\s+(?=[A-Za-z])/g, '$1');
  out = out.replace(/\s{2,}/g, ' ').trim();
  return out;
}

function hostDitolak(hostname) {
  const h = String(hostname || '').toLowerCase();
  const daftar = [
    { re: /(^|\.)youtube\.com$|(^|\.)youtu\.be$|(^|\.)youtube-nocookie\.com$/, pesan: 'YouTube tidak bisa diambil di browser (CORS + bukan artikel teks). Salin deskripsi/transkrip video, mode Teks, lalu Simpan.' },
    { re: /(^|\.)instagram\.com$/, pesan: 'Instagram diblokir CORS. Tempel caption/teks manual.' },
    { re: /(^|\.)tiktok\.com$/, pesan: 'TikTok diblokir CORS. Tempel teks manual.' },
    { re: /(^|\.)facebook\.com$|(^|\.)fb\.com$|(^|\.)fb\.watch$/, pesan: 'Facebook diblokir CORS. Tempel teks manual.' },
    { re: /(^|\.)twitter\.com$|(^|\.)x\.com$/, pesan: 'X/Twitter sering diblokir CORS. Tempel teks manual.' },
    { re: /(^|\.)threads\.net$/, pesan: 'Threads diblokir CORS. Tempel teks manual.' }
  ];
  for (let i = 0; i < daftar.length; i++) {
    if (daftar[i].re.test(h)) return daftar[i].pesan;
  }
  return null;
}

export async function ambilUrl(url) {
  const u = String(url || '').trim();
  if (!u) return { ok: false, error: 'URL kosong' };
  let parsed;
  try {
    parsed = new URL(u);
  } catch (e) {
    return { ok: false, error: 'URL tidak valid' };
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { ok: false, error: 'Hanya http/https yang didukung' };
  }

  const tolak = hostDitolak(parsed.hostname);
  if (tolak) {
    return { ok: false, error: tolak, code: 'host_blocked' };
  }

  try {
    const res = await fetch(u, {
      method: 'GET',
      mode: 'cors',
      credentials: 'omit',
      headers: { Accept: 'text/html,application/xhtml+xml,text/plain,text/markdown' }
    });
    if (!res.ok) {
      return { ok: false, error: 'HTTP ' + res.status + ' — situs menolak. Ganti ke Teks, tempel isinya.' };
    }
    const ctype = (res.headers.get('content-type') || '').toLowerCase();
    const raw = await res.text();
    if (ctype.indexOf('json') !== -1) {
      return { ok: true, title: 'Data JSON', text: bersihkanTeksMateri(raw.slice(0, 200000)), url: u };
    }
    if (ctype.indexOf('text/plain') !== -1 || ctype.indexOf('markdown') !== -1) {
      const text = bersihkanTeksMateri(raw);
      if (!text) return { ok: false, error: 'Halaman kosong' };
      return { ok: true, title: parsed.hostname, text: text, url: u };
    }
    const title = ekstrakJudul(raw) || parsed.hostname;
    const text = ekstrakTeksHtml(raw);
    if (!text || text.length < 40) {
      return { ok: false, error: 'Halaman tidak berisi teks artikel yang bisa dibaca. Tempel teks manual.' };
    }
    return { ok: true, title: title, text: text, url: u };
  } catch (err) {
    return {
      ok: false,
      code: 'cors',
      error: 'Situs memblokir pengambilan dari browser (CORS). Buka artikel → salin teks → mode Teks → Simpan.'
    };
  }
}

export const pituturHttp = {
  ambilUrl: ambilUrl,
  ekstrakTeksHtml: ekstrakTeksHtml,
  bersihkanTeksMateri: bersihkanTeksMateri
};
