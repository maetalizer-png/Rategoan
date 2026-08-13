import { $ } from '../utils/dom.js';
import { drawer } from '../ui/drawer.js';

export const shortcuts = {
  bind() {
    if (!(window.matchMedia && window.matchMedia('(pointer: fine)').matches)) return;
    $('chat-input').addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        $('btn-send').click();
      }
    });
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        drawer.open();
        const s = $('history-search');
        if (s) s.focus();
      }
    });
  },
};
