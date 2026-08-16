import { $ } from '../utils/dom.js';
import { auth } from '../state/auth.js';
import { toast } from '../core/toast.js';
import { streakStore } from '../../raget/raget-memory/streak-store.js';
import { ic } from '../utils/icons.js';

const STEPS = [
  { icon: 'calculator', title: 'Hitung', desc: 'Ketik "hitung 12*8" — Raget langsung jawab 96, tanpa kalkulator lain.' },
  { icon: 'alarm', title: 'Pengingat', desc: 'Ketik "ingatkan saya jam 5 sore beli kopi" — Raget yang ingat, bukan kamu.' },
  { icon: 'search', title: 'Cari', desc: 'Ketik "cari ide konten di semua sumber" — Raget telusuri semua catatanmu.' },
];

let stepIndex = 0;

function dots() {
  return STEPS.map((_, i) => (i === stepIndex ? '●' : '○')).join(' ');
}

function renderStep() {
  const list = document.querySelector('#onboard-overlay .onboard-list');
  const ok = $('onboard-ok');
  if (!list || !ok) return;
  const s = STEPS[stepIndex];
  list.innerHTML = '';
  const item = document.createElement('div');
  item.className = 'onboard-item';
  item.innerHTML = ic(s.icon);
  item.appendChild(document.createTextNode(' ' + s.title + ' — ' + s.desc));
  const progress = document.createElement('div');
  progress.className = 'onboard-item';
  progress.style.textAlign = 'center';
  progress.style.letterSpacing = '4px';
  progress.textContent = dots();
  list.appendChild(item);
  list.appendChild(progress);
  ok.textContent = stepIndex < STEPS.length - 1 ? 'Lanjut' : 'Mulai chat';
}

function finish() {
  localStorage.setItem(onboard.KEY, '1');
  const ov = $('onboard-overlay');
  if (ov) ov.hidden = true;
  const streak = streakStore.bump();
  toast.show('Siap! Streak hari ini: ' + streak);
}

export const onboard = {
  KEY: 'rategoan_onboarded',
  maybeShow() {
    if (localStorage.getItem(this.KEY)) return;
    if (!auth.state) return;
    stepIndex = 0;
    renderStep();
    const ov = $('onboard-overlay');
    if (ov) ov.hidden = false;
  },
  bind() {
    const ok = $('onboard-ok');
    if (ok) {
      ok.onclick = () => {
        if (stepIndex < STEPS.length - 1) {
          stepIndex++;
          renderStep();
        } else {
          finish();
        }
      };
    }
  },
};
