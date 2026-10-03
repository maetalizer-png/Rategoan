import { $ } from '../../shared/dom.js';
import { engineRouter } from '../../raget/raget-agents/engine-router.js';
import { enginePreference } from '../state/engine-preference.js';
import { toast } from '../core/toast.js';

const VISIBLE_ENGINE_IDS = ['template', 'neural'];
let picking = false;

function renderItem(info, selected) {
  const item = document.createElement('div');
  const blocked = !info.ready && info.id !== 'neural';
  item.className = 'model-item' + (selected ? ' active' : '') + (blocked ? ' disabled' : '');
  item.dataset.engine = info.id;
  if (blocked) item.setAttribute('aria-disabled', 'true');
  const name = document.createElement('span');
  name.className = 'model-name';
  name.textContent = info.label;
  item.appendChild(name);
  return item;
}

function statusOf(id) {
  return engineRouter.statusAll().find((info) => info.id === id) || null;
}

function render() {
  const sheet = $('model-sheet');
  const list = sheet && sheet.querySelector('.model-list');
  if (!list) return;
  const statusById = {};
  engineRouter.statusAll().forEach((info) => { statusById[info.id] = info; });
  const pref = enginePreference.get();
  list.innerHTML = '';
  VISIBLE_ENGINE_IDS.forEach((id) => {
    const info = statusById[id] || { id, label: id, ready: false };
    const item = renderItem(info, pref === id);
    item.onclick = async () => {
      if (picking) return;
      if (!info.ready && id !== 'neural') return;
      picking = true;
      let chosen = id;
      if (id === 'neural' && !info.ready) {
        await new Promise((resolve) => setTimeout(resolve, 3000));
        const again = statusOf('neural');
        if (!again || !again.ready) {
          chosen = 'template';
          toast.show('Mengalihkan sementara ke Raget Template...');
        }
      }
      enginePreference.set(chosen);
      window.dispatchEvent(new CustomEvent('rategoan:model-switched', { detail: { id: chosen, fallback: chosen !== id } }));
      picking = false;
      render();
    };
    list.appendChild(item);
  });
}

export const modelSheet = { render };
