import { $ } from '../core/utils.js';

export const shortcuts = Object.freeze({
  init() {
    document.addEventListener('keydown', (e) => {
      // Ctrl/Cmd + K: Focus chat input
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const input = $('chat-input');
        if (input) input.focus();
      }
      // Escape: Close sheets/sidebar
      if (e.key === 'Escape') {
        if (window.RG.sheets) window.RG.sheets.closeAll();
        if (window.RG.drawer) window.RG.drawer.close();
        if (window.RG.chatsearch) window.RG.chatsearch.hide();
      }
    });
    
    // Chat search shortcut
    const btnSearch = $('btn-chat-search');
    if (btnSearch) {
      btnSearch.onclick = () => {
        if (window.RG.chatsearch) window.RG.chatsearch.show();
      };
    }
  },
});

window.RG = window.RG || {};
window.RG.shortcuts = shortcuts;
