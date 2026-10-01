import { $ } from '../../shared/dom.js';
import { router } from '../core/router.js';
import { mesin } from '../../raget/raget-runtime/mesin.js';
import { drawer } from '../ui/drawer.js';

function paint() {
  const box = $('connect-outbox');
  const base = $('connect-server');
  if (base) base.textContent = mesin.serverBase() || 'Server sendiri belum dipasang.';
  if (!box) return;
  const jobs = mesin.jobs();
  box.textContent = jobs.length
    ? jobs.map((j) => j.kind + ' · ' + (j.sent ? 'terkirim' : 'antrian')).join('\n')
    : 'Antrian kosong.';
}

export const connectPage = {
  paint,
  bind() {
    const back = $('connect-back');
    if (back) back.onclick = () => router.go('chat');
    const save = $('connect-save-url');
    if (save) save.onclick = () => {
      const url = (($('connect-url') || {}).value || '').trim();
      mesin.setServerBase(url);
      paint();
    };
    const drive = $('connect-drive');
    if (drive) drive.onclick = () => {
      mesin.queueJob('drive-export', { what: 'koleksi' });
      paint();
    };
    const wa = $('connect-wa');
    if (wa) wa.onclick = () => {
      mesin.queueJob('whatsapp-share', { what: 'chat' });
      paint();
    };
    const flush = $('connect-flush');
    if (flush) flush.onclick = async () => {
      await mesin.flushJobs();
      paint();
    };
    const side = $('btn-connect');
    if (side) side.onclick = () => {
      drawer.close();
      this.open();
    };
    window.addEventListener('hashchange', () => {
      if ((location.hash || '').indexOf('connect') >= 0) paint();
    });
  },
  open() {
    paint();
    router.go('connect');
  },
};
