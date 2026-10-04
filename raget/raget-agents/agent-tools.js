import {
  ringkas, fileQa, ringkasPercakapan, cari, ingat, lupakan, laporanOtak,
  exportChat, shareToWhatsApp, cariSemua, cariKoleksi, ringkasHari,
} from './tools/tool-executor.js';
import {
  hitung, waktu, jelaskan, cara, ide, manfaat, fungsi, tujuan, penyebab,
  bandingkan, kelebihanKekurangan,
} from './tools/tool-registry.js';
import {
  eksporLog, ringkasMinggu, bersihkanDuplikat, eksporCatatan, bagikanKartu,
} from './tools/tool-security.js';

export const agentTools = Object.freeze({
  ringkas, fileQa, ringkasPercakapan, hitung, waktu, cari, ingat, lupakan,
  eksporLog, jelaskan, cara, ide, manfaat, fungsi, tujuan, penyebab, bandingkan,
  kelebihanKekurangan, laporanOtak, exportChat, shareToWhatsApp, cariSemua,
  cariKoleksi, ringkasHari, ringkasMinggu, bersihkanDuplikat, eksporCatatan, bagikanKartu,
});
