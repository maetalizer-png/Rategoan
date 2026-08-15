import { ic } from './icons.js';
import { data, loadDataries } from './loader.js';
import { errorCard } from './utils.js';
import { pushRecent } from './storage.js';
import { renderJelajah, openSheet } from './views/jelajah.js';
import { openDetail } from './views/detail.js';
import { showKuisHome } from './views/kuis.js';
import { renderSapaan } from './views/sapaan.js';
import { openTrip } from './views/trip.js';
import { renderAsisten } from './views/asisten.js';
import { openProfil } from './views/profil.js';
import { install } from './features/install.js';

const $ = (s) => document.querySelector(s);

const TAB_ICON = { jelajah: 'globe', kuis: 'quiz', sapaan: 'lang', trip: 'cal', asisten: 'chat' };

function goTab(t) {
  document.querySelectorAll('.bot button').forEach((x) => x.classList.toggle('on', x.dataset.tab === t));
  $('.top').hidden = t !== 'jelajah';
  if (t === 'jelajah') renderJelajah(($('#q') || {}).value || '');
  if (t === 'kuis') showKuisHome();
  if (t === 'sapaan') renderSapaan();
  if (t === 'trip') openTrip();
  if (t === 'asisten') renderAsisten();
}

document.querySelectorAll('.bot button').forEach((b) => {
  b.innerHTML = ic(TAB_ICON[b.dataset.tab]) + '<span>' + b.textContent.trim() + '</span>';
  b.onclick = () => goTab(b.dataset.tab);
});

const wrap = document.createElement('div');
wrap.className = 'search';
wrap.innerHTML = ic('search');
const inp = $('#q');
inp.parentNode.insertBefore(wrap, inp);
wrap.appendChild(inp);
inp.addEventListener('input', (e) => renderJelajah(e.target.value));
inp.addEventListener('change', (e) => {
  const v = e.target.value.trim();
  if (v.length >= 3) pushRecent(v);
});

$('#profileBtn').innerHTML = ic('user');
$('#profileBtn').onclick = () => {
  document.querySelectorAll('.bot button').forEach((x) => x.classList.remove('on'));
  $('.top').hidden = true;
  openProfil();
};

$('#fab').innerHTML = ic('shuffle');
$('#fab').onclick = async () => {
  const d = await data();
  if (!d) return errorCard();
  openDetail(d.countries[Math.floor(Math.random() * d.countries.length)]);
};

if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});

install.bind();

if (!localStorage.getItem('travel_coach')) {
  localStorage.setItem('travel_coach', '1');
  setTimeout(() => openSheet(
    '<h3>Selamat datang di Jalanin</h3>' +
    '<p>1. Tap kartu negara untuk detail lengkap: wisata, budaya, sejarah, konversi mata uang.<br>' +
    '2. Tab Kuis punya tantangan harian berbonus streak dan 6 badge.<br>' +
    '3. Tab Trip menyusun itinerari, estimasi budget, dan saran bawaan otomatis sesuai tujuan.</p>'
  ), 400);
}

loadDataries();
renderJelajah('');
