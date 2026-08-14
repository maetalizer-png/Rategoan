const cache = {};

function lazy(key, path, exportName) {
  return async function get() {
    if (!cache[key]) {
      cache[key] = import(path).then((m) => m[exportName]);
    }
    return cache[key];
  };
}

const getOcrReader = lazy('ocrReader', '../ocr/reader.js', 'ocrReader');
const getPdfReader = lazy('pdfReader', '../pdf/reader.js', 'pdfReader');
const getPdfStore = lazy('pdfStore', '../pdf/pdf-store.js', 'pdfStore');
const getNotionImporter = lazy('notionImporter', '../notion/importer.js', 'notionImporter');
const getNotionStore = lazy('notionStore', '../notion/notion-store.js', 'notionStore');
const getEvernoteImporter = lazy('evernoteImporter', '../evernote/importer.js', 'evernoteImporter');
const getEvernoteStore = lazy('evernoteStore', '../evernote/evernote-store.js', 'evernoteStore');
const getWhatsappImporter = lazy('whatsappImporter', '../whatsapp/importer.js', 'whatsappImporter');
const getWhatsappStore = lazy('whatsappStore', '../whatsapp/whatsapp-store.js', 'whatsappStore');
const getChunker = lazy('chunker', '../vault/chunk.js', 'chunker');
const getTranslator = lazy('translator', '../translate/translator.js', 'translator');

export const lazyModules = Object.freeze({
  getOcrReader,
  getPdfReader,
  getPdfStore,
  getNotionImporter,
  getNotionStore,
  getEvernoteImporter,
  getEvernoteStore,
  getWhatsappImporter,
  getWhatsappStore,
  getChunker,
  getTranslator,
});
