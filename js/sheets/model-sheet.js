import { $ } from '../../shared/dom.js';
import { enginePreference } from '../state/engine-preference.js';
import { toast } from '../core/toast.js';

const SPEEDS = [
  { id: 'cloud', label: 'Rendah', note: 'Respons instan, efisien daya.' },
  { id: 'neural', label: 'Tinggi', note: 'Penalaran kompleks untuk analisis mendalam.' },
];

let picking = false;
let menuOpen = false;

function labelOf(id) {
  const found = SPEEDS.find((item) => item.id === id);
  return found ? found.label : 'Rendah';
}

async function pickSpeed(id) {
  if (picking) return;
  picking = true;
  const mode = id === 'neural' ? 'neural' : 'cloud';
  enginePreference.set(mode);
  document.dispatchEvent(new CustomEvent('rategoan:command', { detail: mode === 'neural' ? 'think' : 'think-off' }));
  window.dispatchEvent(new CustomEvent('rategoan:model-switched', { detail: { id: mode } }));
  toast.show(mode === 'neural' ? 'Mode: Tinggi aktif' : 'Mode: Rendah aktif');
  picking = false;
  menuOpen = false;
  render();
}

function render() {
  const sheet = $('model-sheet');
  const list = sheet && sheet.querySelector('.model-list');
  if (!list) return;
  const pref = enginePreference.get();
  list.innerHTML = '';
  const card = document.createElement('div');
  card.className = 'model-solo';
  const name = document.createElement('strong');
  name.textContent = 'Raget 1.0';
  const badge = document.createElement('span');
  badge.className = 'model-experimental';
  badge.textContent = 'Eksperimental';
  card.appendChild(name);
  card.appendChild(badge);
  const status = $('model-status');
  if (status) {
    status.hidden = false;
    status.textContent = pref === 'neural' ? 'Tinggi' : 'Rendah';
    status.classList.add('active');
  }
  const speed = document.createElement('button');
  speed.type = 'button';
  speed.className = 'model-speed';
  speed.setAttribute('aria-expanded', menuOpen ? 'true' : 'false');
  speed.textContent = 'Mode: ' + labelOf(pref) + ' \u25BE';
  speed.onclick = () => {
    menuOpen = !menuOpen;
    render();
  };
  list.appendChild(card);
  list.appendChild(speed);
  if (!menuOpen) return;
  const menu = document.createElement('div');
  menu.className = 'model-speed-menu';
  SPEEDS.forEach((choice) => {
    const item = document.createElement('button');
    item.type = 'button';
    item.className = 'model-item' + (pref === choice.id ? ' active' : '');
    const title = document.createElement('strong');
    title.textContent = choice.label;
    const detail = document.createElement('small');
    detail.textContent = choice.note;
    item.appendChild(title);
    item.appendChild(detail);
    item.onclick = () => pickSpeed(choice.id);
    menu.appendChild(item);
  });
  list.appendChild(menu);
}

if (typeof window !== 'undefined') {
  window.addEventListener('rategoan:model-switched', () => render());
}

export const modelSheet = { render, pickSpeed };
