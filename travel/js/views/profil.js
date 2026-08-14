import { ic } from '../icons.js';
import { stat } from '../utils.js';
import { getStats, getTrips, getDays } from '../storage.js';
import { BADGES } from '../constants.js';
import { packStatus, downloadPack, clearPack } from '../features/offline-pack.js';

const $ = (s) => document.querySelector(s);
const view = $('#view');

function streakDots30() {
  const days = getDays();
  const out = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
    out.push('<span class="dot' + (days.includes(d) ? ' on' : '') + '"></span>');
  }
  return '<span class="dots dots-grid">' + out.join('') + '</span>';
}

function packSectionHtml(status) {
  if (!status.supported) {
    return '<div class="sec">' + ic('download') + ' Paket Offline</div>' +
      '<p class="desc">Tidak didukung di peramban ini.</p>';
  }
  return (
    '<div class="sec">' + ic('download') + ' Paket Offline</div>' +
    '<p class="desc">' + (status.downloaded ? 'Terunduh (' + status.count + ' berkas). Jalanin bisa dibuka tanpa internet.' : 'Belum diunduh. Jaringan tetap diutamakan saat online (network-first) — paket hanya dipakai bila koneksi terputus.') + '</p>' +
    '<div class="rowbtn">' +
    (status.downloaded
      ? '<button class="btn" id="packDel">' + ic('trash') + ' Hapus paket</button>'
      : '<button class="btn" id="packDl">' + ic('download') + ' Unduh paket offline</button>') +
    '</div>'
  );
}

export async function openProfil() {
  const st = getStats();
  const trips = getTrips();
  const acc = st.played ? Math.round((st.correct / (st.played * 10)) * 100) : 0;
  const streak = +localStorage.getItem('travel_streak') || 0;
  const status = await packStatus();

  view.innerHTML =
    '<div class="rowbtn"><button class="btn" id="back">' + ic('back') + ' Kembali</button></div>' +
    '<div class="card"><h3>' + ic('user') + ' Profil Saya</h3>' +
    '<div class="stats">' +
      stat('flame', streak + ' hari streak') +
      stat('award', acc + '% akurasi') +
      stat('cal', trips.length + ' trip') +
      stat('map', st.viewed + ' dilihat') +
    '</div>' +
    '<div class="sec">' + ic('flame') + ' Streak 30 hari</div>' + streakDots30() +
    '<div class="sec">' + ic('award') + ' Pencapaian</div><div class="tags">' +
      BADGES.map((b) => '<span class="bdg' + (b.test(st) ? ' on' : '') + '">' + b.label + '</span>').join('') +
    '</div>' +
    packSectionHtml(status) +
    '</div>';

  $('#back').onclick = () => { document.querySelector('.bot button[data-tab="jelajah"]').click(); };
  const dl = $('#packDl');
  if (dl) dl.onclick = async () => {
    dl.disabled = true;
    dl.textContent = 'Mengunduh…';
    await downloadPack();
    openProfil();
  };
  const del = $('#packDel');
  if (del) del.onclick = async () => {
    del.disabled = true;
    await clearPack();
    openProfil();
  };
}
