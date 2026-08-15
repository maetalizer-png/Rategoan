import { memoryLong } from '../raget-memory/memory-long.js';
import { lazyModules } from './lazy-modules.js';
import { agentTools } from './agent-tools.js';
import { bilingual } from './bilingual.js';

const OCR_TRIGGER_RE = /baca\s+foto\s+ini|apa\s+isi\s+gambar|extract\s+text|ringkas\s+catatan\s+ini|berapa\s+total|apa\s+yang\s+dibicarakan/i;

const LANG_NAME_MAP = {
  inggris: 'en', english: 'en', indonesia: 'id', jepang: 'ja', japanese: 'ja',
  korea: 'ko', mandarin: 'zh', china: 'zh', spanyol: 'es', prancis: 'fr',
  jerman: 'de', arab: 'ar', rusia: 'ru',
};

async function tryPdfImport(messages) {
  const list = Array.isArray(messages) ? messages : [];
  const last = list[list.length - 1];
  const att = last && last.attach;
  if (!att || !att.fileBinary || !/\.pdf$/i.test(att.name || '')) return null;
  const pdfReader = await lazyModules.getPdfReader();
  const result = await pdfReader.parsePDF(att.fileBinary);
  if (!result.ok) return result.message;
  const chunker = await lazyModules.getChunker();
  const parts = chunker.chunkText(result.text, 1500);
  const pdfStore = await lazyModules.getPdfStore();
  const count = await pdfStore.addAll(parts.map((t) => ({ title: att.name, text: t })), { source: 'pdf', fileName: att.name });
  return 'Berhasil impor PDF "' + att.name + '" (' + result.pages + ' halaman, ' + count + ' bagian tersimpan).';
}

async function tryNotionImport(messages) {
  const list = Array.isArray(messages) ? messages : [];
  const last = list[list.length - 1];
  const att = last && last.attach;
  if (!att || !att.fileBinary || !/\.zip$/i.test(att.name || '')) return null;
  const notionImporter = await lazyModules.getNotionImporter();
  const result = await notionImporter.importZip(att.fileBinary);
  if (!result.ok) return result.message;
  if (!result.chunks.length) return 'File ZIP dibaca tapi tidak ditemukan halaman Notion (.html/.md) di dalamnya.';
  const notionStore = await lazyModules.getNotionStore();
  const count = await notionStore.addAll(result.chunks, { source: 'notion' });
  return 'Berhasil impor ' + count + ' halaman Notion dari "' + att.name + '".';
}

async function tryEvernoteImport(messages) {
  const list = Array.isArray(messages) ? messages : [];
  const last = list[list.length - 1];
  const att = last && last.attach;
  if (!att || !att.fileText || !/\.enex$/i.test(att.name || '')) return null;
  const evernoteImporter = await lazyModules.getEvernoteImporter();
  const result = evernoteImporter.importENEX(att.fileText);
  if (!result.ok) return result.message;
  const evernoteStore = await lazyModules.getEvernoteStore();
  const count = await evernoteStore.addAll(result.chunks, { source: 'evernote' });
  return 'Berhasil impor ' + count + ' catatan Evernote dari "' + att.name + '".';
}

async function tryWhatsappImport(messages) {
  const list = Array.isArray(messages) ? messages : [];
  const last = list[list.length - 1];
  const att = last && last.attach;
  if (!att || !att.fileText || !/\.txt$/i.test(att.name || '')) return null;
  const whatsappImporter = await lazyModules.getWhatsappImporter();
  const result = whatsappImporter.importWhatsApp(att.fileText);
  if (!result.ok) return result.message;
  const whatsappStore = await lazyModules.getWhatsappStore();
  const count = await whatsappStore.addAll(result.chunks, { source: 'whatsapp' });
  return 'Berhasil impor riwayat WhatsApp "' + att.name + '" (' + result.messageCount + ' pesan, ' + count + ' bagian tersimpan).';
}

async function tryOCR(text, messages) {
  const list = Array.isArray(messages) ? messages : [];
  const last = list[list.length - 1];
  const att = last && last.attach;
  if (!att || !att.full) return null;
  if (!OCR_TRIGGER_RE.test(text)) return null;

  const ocrReader = await lazyModules.getOcrReader();
  const result = await ocrReader.recognize(att.full);
  if (!result.ok) return result.message;

  memoryLong.rememberNote(result.text);

  if (/berapa\s+total/i.test(text)) {
    const totalMatch = result.text.match(/total[^\d]*(\d[\d.,]*)/i);
    if (totalMatch) return 'Total belanja: ' + totalMatch[1] + ' (dari hasil baca foto).';
    return 'Teks berhasil dibaca dari foto, tapi tidak ditemukan nilai "total" yang jelas:\n' + result.text.slice(0, 300);
  }
  if (/ringkas/i.test(text)) return agentTools.ringkas(result.text);
  return 'Isi gambar:\n' + result.text.slice(0, 500);
}

async function tryTranslate(text) {
  const basic = await bilingual.tryBasicPhrase(text);
  if (basic) return basic;
  const m = text.match(/^terjemahkan\s+(.+?)\s+ke\s+(?:bahasa\s+)?(\w+)$/i) || text.match(/^translate\s+(.+?)\s+(?:to|ke)\s+(\w+)$/i);
  if (m) {
    const content = m[1];
    const lang = LANG_NAME_MAP[m[2].toLowerCase()] || m[2].toLowerCase();
    const translator = await lazyModules.getTranslator();
    const result = await translator.translate(content, lang);
    return result.ok ? 'Terjemahan: ' + result.text : result.message;
  }
  const m2 = text.match(/apa\s+bahasa\s+inggrisnya\s+(.+)$/i);
  if (m2) {
    const translator = await lazyModules.getTranslator();
    const result = await translator.translate(m2[1], 'en');
    return result.ok ? '"' + m2[1] + '" dalam bahasa Inggris: ' + result.text : result.message;
  }
  return null;
}

export const toolsImport = Object.freeze({
  tryPdfImport,
  tryNotionImport,
  tryEvernoteImport,
  tryWhatsappImport,
  tryOCR,
  tryTranslate,
});
