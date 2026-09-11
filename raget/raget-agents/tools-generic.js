import { agentTools } from './agent-tools.js';
import { readWeb } from '../../vault/web/read-web.js';
import { webSearch } from '../../vault/web/web-search.js';
import { weather } from '../../vault/web/weather.js';
import { news } from '../../vault/web/news.js';
import { quizSession } from './quiz-session.js';
import { fewshotLocal } from '../raget-memory/fewshot-local.js';
import { ragetDb } from '../raget-database/raget-db.js';
import { routerIntent } from './router-intent.js';

const SOURCE_NAMES = { wiktionary: 'Wiktionary', wikidata: 'Wikidata', wikipedia: 'Wikipedia' };

// Ekstrak Wikipedia datang sebagai satu paragraf besar tanpa jeda - enak
// dibaca mesin, tapi jadi tembok teks yang capek dibaca manusia. Pecah tiap
// ~2 kalimat jadi paragraf sendiri supaya lebih mengalir dan gak monoton,
// tanpa mengubah kata satu pun dari kontennya.
function breakIntoParagraphs(text, sentencesPerPara) {
  const sentences = text.split(/(?<=[.!?])\s+(?=[A-Z0-9])/);
  if (sentences.length <= sentencesPerPara) return text;
  const paras = [];
  for (let i = 0; i < sentences.length; i += sentencesPerPara) {
    paras.push(sentences.slice(i, i + sentencesPerPara).join(' '));
  }
  return paras.join('\n\n');
}

async function run(kind, prompt, messages, onFewshotCacheClear) {
  if (kind === 'kuis') return await quizSession.ask();
  if (kind === 'ringkas') return agentTools.ringkas(prompt.replace(/^(ringkas(kan)?|rangkum(kan)?)\s*:?\s*/i, ''));
  if (kind === 'ringkas_percakapan') return agentTools.ringkasPercakapan(messages);
  if (kind === 'ringkas_hari') return await agentTools.ringkasHari();
  if (kind === 'ringkas_minggu') return await agentTools.ringkasMinggu();
  if (kind === 'bersihkan_duplikat') return await agentTools.bersihkanDuplikat();
  if (kind === 'waktu') return agentTools.waktu(prompt);
  if (kind === 'apply_fewshot') {
    const notes = await ragetDb.allNotes();
    const candidates = notes.filter((n) => n.feedback === true).slice(-5).map((n) => ({ q: n.question, a: n.answer }));
    if (!candidates.length) return 'Belum ada balasan berating positif untuk dijadikan contoh fewshot.';
    const added = fewshotLocal.apply(candidates);
    if (onFewshotCacheClear) onFewshotCacheClear();
    return added.length
      ? 'Diterapkan ' + added.length + ' contoh fewshot baru dari balasan berating positif. Ketik "batalkan auto-fewshot" untuk membatalkan.'
      : 'Semua kandidat sudah pernah diterapkan sebelumnya.';
  }
  if (kind === 'revert_fewshot') {
    const count = fewshotLocal.revert();
    return count ? 'Dibatalkan ' + count + ' contoh auto-fewshot.' : 'Tidak ada auto-fewshot yang aktif.';
  }
  if (kind === 'bedah_url') {
    const url = (prompt.match(/https?:\/\/\S+/i) || [])[0];
    if (!url) return 'URL tidak ditemukan. Format: bedah https://...';
    const result = await readWeb.read(url);
    if (!result.ok) return result.message;
    const via = result.viaJina ? ' (lewat Jina Reader karena situs asal blokir akses langsung)' : '';
    return 'Ringkasan halaman' + via + ':\n\n' + agentTools.ringkas(result.text);
  }
  if (kind === 'websearch') {
    const q = prompt
      .replace(/^(cari|carikan|search)\s+/i, '')
      .replace(/^googling\s+/i, '')
      .replace(/\bdi\s+internet\b/gi, '')
      .replace(/^internet\s+/i, '')
      .replace(/^(tentang|soal)\s+/i, '')
      .replace(/^(siapa|apa\s+itu|apa|kapan|dimana|di\s*mana|berapa|kenapa|mengapa|bagaimana)\s+/i, '')
      .replace(/\?+$/, '')
      .trim();
    const result = await webSearch.search(q);
    if (!result.ok) return result.message;
    const projectName = SOURCE_NAMES[result.source] || 'Wikipedia';
    const sourceLabel = result.source === 'wikidata' ? projectName : projectName + ' ' + (result.lang === 'id' ? 'Bahasa Indonesia' : '(Inggris)');
    const body = result.source === 'wikipedia' ? breakIntoParagraphs(result.extract, 2) : result.extract;
    return (
      body +
      (result.url ? '\n\n(Sumber: ' + sourceLabel + ' — ' + result.url + ')' : '')
    );
  }
  if (kind === 'cuaca_live') {
    const place = routerIntent.detectCuacaLive(prompt.toLowerCase());
    const result = await weather.search(place || prompt);
    if (!result.ok) return result.message;
    return (
      'Cuaca di ' + result.place + ' saat ini: ' + result.desc + ', suhu ' + Math.round(result.temp) + '°C' +
      (result.humidity != null ? ', kelembapan ' + Math.round(result.humidity) + '%' : '') +
      (result.wind != null ? ', angin ' + Math.round(result.wind) + ' km/jam' : '') + '.' +
      '\n\n(Sumber: Open-Meteo)'
    );
  }
  if (kind === 'berita_live') {
    const topic = routerIntent.detectBeritaTopic(prompt.toLowerCase()) || '';
    const result = await news.latest(topic);
    if (!result.ok) return result.message;
    const list = result.items
      .map((it, i) => (i + 1) + '. ' + it.title + (it.summary ? '\n' + it.summary : '') + (it.link ? '\n' + it.link : ''))
      .join('\n\n');
    return (
      'Berita terkini' + (topic ? ' tentang "' + topic + '"' : '') + ':\n\n' + list +
      '\n\n(Sumber: RSS ' + result.sources.join(' & ') + ')'
    );
  }
  const stripTrailingFiller = (s) => s.replace(/\s*\b(apa\s*(saja|sih)?|gimana|bagaimana|dong|ya|sih)\s*\??\s*$/i, '').trim();
  if (kind === 'jelaskan') {
    const topic = prompt
      .replace(/^jelaskan\s*/i, '')
      .replace(/^apa\s+itu\s*/i, '')
      .replace(/^tentang\s*/i, '')
      .trim();
    return agentTools.jelaskan(topic);
  }
  if (kind === 'cara') {
    const topic = stripTrailingFiller(prompt.replace(/^(cara|langkah)\s*(untuk|buat|biar)?\s*/i, '').trim());
    return agentTools.cara(topic);
  }
  if (kind === 'ide') {
    const topic = prompt
      .replace(/^(kasih|beri|berikan|boleh|minta)\s+/i, '')
      .replace(/ide\s+(konten\s+)?(tentang|soal|untuk)?\s*/i, '')
      .trim();
    return agentTools.ide(topic);
  }
  const stripTrailingApa = stripTrailingFiller;
  if (kind === 'manfaat') {
    const topic = stripTrailingApa(prompt.replace(/^(apa\s+(saja\s+)?|sebutkan\s+)?manfaat\s+(dari\s+|dan\s+)?/i, '').trim());
    return agentTools.manfaat(topic);
  }
  if (kind === 'fungsi') {
    const topic = stripTrailingApa(prompt.replace(/^(apa\s+(saja\s+)?|sebutkan\s+)?fungsi\s+(dari\s+|utama\s+)?/i, '').trim());
    return agentTools.fungsi(topic);
  }
  if (kind === 'tujuan') {
    const topic = stripTrailingApa(prompt.replace(/^(apa\s+(saja\s+)?|sebutkan\s+)?tujuan\s+(dari\s+|utama\s+)?/i, '').trim());
    return agentTools.tujuan(topic);
  }
  if (kind === 'penyebab') {
    const topic = stripTrailingApa(prompt.replace(/^(apa\s+(saja\s+)?|sebutkan\s+)?penyebab\s+(dari\s+|utama\s+)?/i, '').trim());
    return agentTools.penyebab(topic);
  }
  if (kind === 'bandingkan') {
    const m = prompt.match(/^bandingkan\s+(.+?)\s+(dan|dengan|vs\.?|atau)\s+(.+)$/i);
    return m ? agentTools.bandingkan(m[1].trim(), m[3].trim()) : null;
  }
  if (kind === 'bandingkan_vs') {
    const m = prompt.match(/^(.+?)\s+vs\.?\s+(.+)$/i);
    return m ? agentTools.bandingkan(m[1].trim(), m[2].trim()) : null;
  }
  if (kind === 'kelebihan_kekurangan') {
    const topic = prompt
      .replace(/^(kelebihan|kekurangan)\s*(dan|\/|serta)?\s*(kelebihan|kekurangan)?\s*/i, '')
      .trim();
    return agentTools.kelebihanKekurangan(topic);
  }
  return null;
}

export const toolsGeneric = Object.freeze({
  run,
});
