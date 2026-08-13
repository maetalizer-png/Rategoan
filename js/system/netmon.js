import { toast } from '../core/toast.js';

export const netmon = {
  bind() {
    window.addEventListener('online', () => toast.show('Koneksi kembali — online'));
    window.addEventListener('offline', () => toast.show('Offline — mode lokal aktif'));
  },
};
