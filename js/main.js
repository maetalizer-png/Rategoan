import { $, scrollBottom } from './utils/dom.js';
import { ai } from './ai/ai.js';
import { store } from './state/store.js';
import { theme } from './state/theme.js';
import { auth } from './state/auth.js';
import { font } from './state/font.js';
import { pin } from './state/pin.js';
import { router } from './core/router.js';
import { chat } from './chat/chat.js';
import { chatsearch } from './chat/chatsearch.js';
import { composer } from './chat/composer.js';
import { voice } from './chat/voice.js';
import { history as chatHistory } from './history/history.js';
import { histmenu } from './history/histmenu.js';
import { msgmenu } from './history/msgmenu.js';
import { drawer } from './ui/drawer.js';
import { scrolldown } from './ui/scrolldown.js';
import { sheets } from './sheets/sheets.js';
import { attach } from './sheets/attach.js';
import { models } from './sheets/models.js';
import { netmon } from './system/netmon.js';
import { install } from './system/install.js';
import { backup } from './system/backup.js';
import { shortcuts } from './system/shortcuts.js';
import { onboard } from './system/onboard.js';
import { settings } from './account/settings.js';
import { login } from './account/login.js';
import { reminderScheduler } from '../reminders/scheduler.js';
import { toast } from './core/toast.js';
import { dailyBriefing } from '../ai-agent/daily-briefing.js';

const BRIEFING_DATE_KEY = 'raget_briefing_date';

document.addEventListener('DOMContentLoaded', () => {
  store.init();
  theme.init();
  auth.init();
  font.load();
  router.init();
  chat.renderMessages();
  chatHistory.render();
  chatHistory.bind();
  drawer.bind();
  scrolldown.bind();
  chatsearch.bind();
  sheets.bind();
  attach.bind();
  models.bind();
  composer.bind();
  voice.bind();
  msgmenu.bind();
  histmenu.bind();
  netmon.bind();
  install.bind();
  backup.bind();
  shortcuts.bind();
  pin.bind();
  pin.bindAutoLock();
  onboard.bind();
  settings.bind();
  login.bind();
  onboard.maybeShow();
  reminderScheduler.start((reminder) => toast.show('Pengingat: ' + reminder.action));
  if (auth.state) {
    try {
      const todayKey = new Date().toDateString();
      if (localStorage.getItem(BRIEFING_DATE_KEY) !== todayKey) {
        localStorage.setItem(BRIEFING_DATE_KEY, todayKey);
        toast.show(dailyBriefing.message());
      }
    } catch (e) {}
  }
  try {
    const params = new URLSearchParams(location.search);
    const share = params.get('shareText');
    if (share) {
      window.history.replaceState(null, '', location.pathname + location.hash);
      if (auth.state) {
        const inp = $('chat-input');
        inp.value = share;
        composer.autoGrow();
        inp.focus();
      }
    }
  } catch (e) {}
  if (window.visualViewport) {
    visualViewport.addEventListener('resize', () => setTimeout(scrollBottom, 100));
  }
});

if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}

window.addEventListener('unhandledrejection', (e) => {
  toast.show('Terjadi kendala saat memproses. Coba lagi ya.');
  e.preventDefault();
});
