import { $ } from '../utils/dom.js';
import { engineRouter } from '../../raget/raget-agents/engine-router.js';
import { enginePreference } from '../state/engine-preference.js';

const VISIBLE_ENGINE_IDS = ['template', 'neural'];

function renderItem(info, selected) {
  const item = document.createElement('div');
  item.className = 'model-item' + (selected ? ' active' : '') + (info.ready ? '' : ' disabled');
  item.dataset.engine = info.id;
  if (!info.ready) item.setAttribute('aria-disabled', 'true');
  const name = document.createElement('span');
  name.className = 'model-name';
  name.textContent = info.label;
  item.appendChild(name);
  return item;
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
    item.onclick = () => {
      if (!info.ready) return;
      enginePreference.set(id);
      render();
    };
    list.appendChild(item);
  });
}

export const modelSheet = { render };
