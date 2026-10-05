import { $ } from '../../shared/dom.js';
import { engineRouter } from '../../raget/raget-agents/engine-router.js';
import { enginePreference } from '../state/engine-preference.js';
import { toast } from '../core/toast.js';

const SPEEDS = [
  { id: 'template', label: 'Cepat', note: 'Respons instan, hemat daya.' },
  { id: 'neural', label: 'Mendalam', note: 'Berpikir keras untuk tugas rumit.' },
];

let picking = false;
let menuOpen = false;

function statusOf(id) {
  return engineRouter.statusAll().find((info) => info.id === id) || null;
}

function labelOf(id) {
  const found = SPEEDS.find((item) => item.id === id);
  return found ? found.label : 'Cepat';
}

async function pickSpeed(id) {
  if (picking) return;
  if (id === 'neural') {
    const info = statusOf('neural') || { ready: false };
    if (!info.ready) {
      picking = true;
      await new Promise((resolve) => setTimeout(resolve, 3000));
      const again = statusOf('neural');
      picking = false;
      if (!again || !again.ready) {
        enginePreference.set('template');
        toast.show('Mode mendalam belum siap. Tetap di Cepat.');
        window.dispatchEvent(new CustomEvent('rategoan:model-switched', { detail: { id: 'template' } }));
        document.dispatchEvent(new CustomEvent('rategoan:command', { detail: 'think-off' }));
        render();
        return;
      }
    }
  }
  enginePreference.set(id);
  document.dispatchEvent(new CustomEvent('rategoan:command', { detail: id === 'neural' ? 'think' : 'think-off' }));
  window.dispatchEvent(new CustomEvent('rategoan:model-switched', { detail: { id } }));
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
  card.appendChild(name);
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

export const modelSheet = { render, pickSpeed };
