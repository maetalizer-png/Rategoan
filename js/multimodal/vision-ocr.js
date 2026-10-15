import { ocrReader } from '../../vault/ocr/reader.js';

export const visionOcr = {
  async recognize(file) {
    if (!file) return { ok: false, message: 'Tidak ada gambar.' };
    return ocrReader.recognize(file);
  },
};
