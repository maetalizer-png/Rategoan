import { $ } from '../utils/dom.js';
import { drawer } from '../ui/drawer.js';
import { router } from '../core/router.js';

function isTypingTarget(el) {
  return el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable);
}

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
        return;
      }
      if (isTypingTarget(e.target)) return;
      if (e.key === 'k') {
        e.preventDefault();
        drawer.close();
        router.go('collection');
        import('../collection/collection.js').then((m) => m.collectionPage.open());
      }
    });
  },
};
