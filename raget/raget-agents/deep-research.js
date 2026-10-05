import { collectionStore } from '../raget-memory/collection-store.js';
import { collectionSearch } from '../raget-memory/collection-search.js';
import { webSearch } from '../../vault/web/web-search.js';

export function queryTree(topic) {
  const t = String(topic || '').replace(/^riset\s+(mendalam\s+)?/i, '').trim() || 'topik';
  const focus = t.split(/\s+/).filter(Boolean).slice(0, 8).join(' ');
  return [
    focus + ' — batas soal dan definisi',
    focus + ' — fakta atau angka yang bisa dicek',
    focus + ' — dua pendapat yang saling berhadapan',
    focus + ' — langkah yang bisa dikerjakan setelah kesimpulan',
  ];
}

function clip(text, max) {
  const clean = String(text || '').replace(/\s+/g, ' ').trim();
  return clean.length > max ? clean.slice(0, max - 1) + '…' : clean;
}

export async function buildResearch(topic, reply) {
  const t = String(topic || '').replace(/^riset\s+(mendalam\s+)?/i, '').trim() || 'topik';
  const angles = queryTree(t);
  const rows = [];
  try {
    const items = await collectionStore.allItems();
    collectionSearch.fuzzySearch(items || [], t, 3).forEach((hit) => {
      const text = clip(hit.item && (hit.item.text || hit.item.note), 280);
      if (text) rows.push({ angle: 'Koleksi lokal', finding: text, source: 'Vault' });
    });
  } catch (e) { console.warn('[Rategoan Fallback] Riset:', e); }
  try {
    const web = await webSearch.research(t);
    if (web && web.ok && web.extract) {
      rows.push({ angle: 'Sumber web', finding: clip(web.extract, 360), source: web.title || web.url || 'web' });
    }
  } catch (e) { console.warn('[Rategoan Fallback] Riset:', e); }
  if (reply) rows.push({ angle: 'Jawaban mesin', finding: clip(reply, 360), source: 'Raget' });
  angles.forEach((angle) => {
    if (!rows.some((row) => row.angle === angle)) {
      rows.push({ angle, finding: 'Belum ada fakta terpisah. Sudut ini mengikuti pertanyaan: ' + t + '.', source: 'Pertanyaan' });
    }
  });
  const table = ['| Sudut | Temuan | Sumber |', '| --- | --- | --- |'].concat(
    rows.map((row) => '| ' + row.angle.replace(/\|/g, '/') + ' | ' + row.finding.replace(/\|/g, '/') + ' | ' + row.source.replace(/\|/g, '/') + ' |')
  );
  return [
    '# Berkas riset: ' + t,
    '',
    '## Abstrak',
    'Kajian ini memeriksa "' + t + '" dari empat sudut: batas soal, fakta yang bisa dicek, pendapat yang berhadapan, dan langkah sesudahnya.',
    '',
    '## Analisis komparatif',
    angles.map((angle, index) => (index + 1) + '. ' + angle).join('\n'),
    '',
    '## Temuan',
    table.join('\n'),
    '',
    '## Kesimpulan aksi',
    'Pakai temuan yang punya sumber. Sudut yang masih bertuliskan "belum ada fakta" jangan dijadikan angka atau klaim pasti.',
  ].join('\n');
}

