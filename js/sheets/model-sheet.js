import { $ } from '../../shared/dom.js';
import { engineRouter } from '../../raget/raget-agents/engine-router.js';
import { enginePreference } from '../state/engine-preference.js';
import { toast } from '../core/toast.js';

const CHOICES = [
  { id: 'auto', label: 'Auto', note: 'Memilih jalur kilat atau penalaran sesuai pertanyaan.' },
  { id: 'template', label: 'Raget 1.0 Kilat', note: 'Jawaban instan di perangkat.' },
  { id: 'neural', label: 'Raget 1.0 Cerdas', note: 'Penalaran, naskah, dan kode.' },
];

let picking = false;

function statusOf(id) {
  return engineRouter.statusAll().find((info) => info.id === id) || null;
}

function render() {
  const sheet = $('model-sheet');
  const list = sheet && sheet.querySelector('.model-list');
  if (!list) return;
  const pref = enginePreference.get();
  list.innerHTML = '';
  CHOICES.forEach((choice) => {
    const info = choice.id === 'auto' ? { ready: true } : (statusOf(choice.id) || { ready: false });
    const item = document.createElement('button');
    item.type = 'button';
    item.className = 'model-item' + (pref === choice.id ? ' active' : '');
    item.dataset.engine = choice.id;
    const name = document.createElement('strong');
    name.textContent = choice.label;
    const note = document.createElement('small');
    note.textContent = choice.note;
    item.appendChild(name);
    item.appendChild(note);
    item.onclick = async () => {
      if (picking) return;
      if (choice.id === 'neural' && !info.ready) {
        picking = true;
        await new Promise((resolve) => setTimeout(resolve, 3000));
        const again = statusOf('neural');
        picking = false;
        if (!again || !again.ready) {
          enginePreference.set('auto');
          toast.show('Raget 1.0 Cerdas belum siap. Tetap di Auto.');
          render();
          return;
        }
      }
      enginePreference.set(choice.id);
      window.dispatchEvent(new CustomEvent('rategoan:model-switched', { detail: { id: choice.id } }));
      render();
    };
    list.appendChild(item);
  });
  const think = document.createElement('button');
  think.type = 'button';
  think.className = 'model-item';
  think.textContent = 'Berpikir lebih keras';
  think.onclick = () => {
    document.dispatchEvent(new CustomEvent('rategoan:command', { detail: 'think' }));
    toast.show('Berpikir lebih keras nyala');
  };
  list.appendChild(think);
}

export const modelSheet = { render };
