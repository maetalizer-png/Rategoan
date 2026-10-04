import { ocrReader } from '../../vault/ocr/reader.js';

export const visionOcr = {
  async recognize(file) {
    if (!file) return { ok: false, message: 'Tidak ada gambar.' };
    if (!ocrReader.isReady()) {
      return {
        ok: false,
        message: ocrReader.recognize ? (await ocrReader.recognize(file)).message : 'Paket OCR belum siap.',
      };
    }
    return ocrReader.recognize(file);
  },
};
