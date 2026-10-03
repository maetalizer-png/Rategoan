import { $ } from '../../shared/dom.js';
import { store } from '../state/store.js';
import { chat } from '../chat/chat.js';
import { chatsearch } from '../chat/chatsearch.js';
import { history } from '../history/history.js';
import { router } from '../core/router.js';
import { drawer } from './drawer.js';
import { printReport } from '../../shared/report-export.js';
import { toast } from '../core/toast.js';

function session() {
  const st = store.get();
  return (st.sessions || []).find((item) => item.id === st.currentId) || null;
}

function markdownOf(s) {
  const lines = ['# Obrolan Rategoan', ''];
  ((s && s.messages) || []).forEach((msg) => {
    lines.push((msg.role === 'user' ? '## Kamu' : '## Rategoan'), '', String(msg.text || ''), '');
  });
  return lines.join('\n');
}

export function mountChatOptions() {
  const btn = $('btn-chat-more');
  const fresh = $('btn-new-chat-top');
  if (fresh) fresh.onclick = () => {
    const side = $('btn-new-chat');
    if (side) side.click();
  };
  if (!btn) return;
  const menu = document.createElement('div');
  menu.id = 'chat-options-menu';
  menu.hidden = true;
  menu.innerHTML = '<button type="button" data-act="search">Cari di obrolan</button><button type="button" data-act="share">Bagi tautan</button><button type="button" data-act="md">Ekspor Markdown</button><button type="button" data-act="pdf">Ekspor siap cetak</button><button type="button" data-act="clear">Bersihkan percakapan</button>';
  btn.parentElement.appendChild(menu);
  const close = () => { menu.hidden = true; };
  btn.onclick = (event) => {
    event.stopPropagation();
    menu.hidden = !menu.hidden;
  };
  document.addEventListener('click', close);
  menu.onclick = (event) => {
    const act = event.target && event.target.dataset && event.target.dataset.act;
    if (!act) return;
    event.stopPropagation();
    close();
    const s = session();
    if (act === 'search') chatsearch.toggle();
    else if (act === 'share') {
      const url = location.origin + location.pathname + '#/chat';
      if (navigator.share) navigator.share({ title: 'Rategoan', url }).catch(() => {});
      else if (navigator.clipboard) navigator.clipboard.writeText(url).then(() => toast.show('Tautan disalin'));
    } else if (act === 'md') {
      const blob = new Blob([markdownOf(s)], { type: 'text/markdown' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'obrolan.md';
      a.click();
    } else if (act === 'pdf') {
      printReport({ title: 'Obrolan', body: '<pre>' + markdownOf(s).replace(/</g, '') + '</pre>' });
    } else if (act === 'clear' && s) {
      s.messages = [];
      store.save();
      chat.renderMessages();
      history.render();
      toast.show('Percakapan dibersihkan');
    }
    drawer.close();
    router.go('chat');
  };
}
