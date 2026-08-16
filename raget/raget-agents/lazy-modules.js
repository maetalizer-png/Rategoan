const cache = {};

function lazy(key, path, exportName) {
  return async function get() {
    if (!cache[key]) {
      cache[key] = import(path).then((m) => m[exportName]);
    }
    return cache[key];
  };
}

const getOcrReader = lazy('ocrReader', '../../vault/ocr/reader.js', 'ocrReader');
const getPdfReader = lazy('pdfReader', '../../vault/pdf/reader.js', 'pdfReader');
const getPdfStore = lazy('pdfStore', '../../vault/pdf/pdf-store.js', 'pdfStore');
const getNotionImporter = lazy('notionImporter', '../../vault/notion/importer.js', 'notionImporter');
const getNotionStore = lazy('notionStore', '../../vault/notion/notion-store.js', 'notionStore');
const getEvernoteImporter = lazy('evernoteImporter', '../../vault/evernote/importer.js', 'evernoteImporter');
const getEvernoteStore = lazy('evernoteStore', '../../vault/evernote/evernote-store.js', 'evernoteStore');
const getWhatsappImporter = lazy('whatsappImporter', '../../vault/whatsapp/importer.js', 'whatsappImporter');
const getWhatsappStore = lazy('whatsappStore', '../../vault/whatsapp/whatsapp-store.js', 'whatsappStore');
const getChunker = lazy('chunker', '../../vault/chunk.js', 'chunker');
const getTranslator = lazy('translator', '../../vault/translate/translator.js', 'translator');

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
