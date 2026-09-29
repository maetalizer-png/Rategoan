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
import { artifact } from './ui/artifact.js';
import { scrolldown } from './ui/scrolldown.js';
import { sheets } from './sheets/sheets.js';
import { attach } from './sheets/attach.js';
import { camera } from './sheets/camera.js';
import { netmon } from './system/netmon.js';
import { install } from './system/install.js';
import { backup } from './system/backup.js';
import { shortcuts } from './system/shortcuts.js';
import { settings } from './account/settings.js';
import { login } from './account/login.js';
import { collectionPage } from './collection/collection.js';
import { projectPage } from './project/project.js';
import { reminderScheduler } from '../vault/reminders/scheduler.js';
import { toast } from './core/toast.js';
import { dataries } from '../raget/raget-agents/dataries-registry.js';
import { mesin } from '../raget/raget-runtime/mesin.js';

const bootStart = performance.now();

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
  artifact.bind();
  scrolldown.bind();
  chatsearch.bind();
  sheets.bind();
  attach.bind();
  camera.bind();
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
  settings.bind();
  collectionPage.bind();
  projectPage.bind();
  login.bind();
  try { window.__rategoanMesin = mesin.list(); } catch (e) {}
  reminderScheduler.start((reminder) => toast.show('Pengingat: ' + reminder.action));
  try {
    const params = new URLSearchParams(location.search);
    const share = params.get('shareText');
    if (share) {
      window.history.replaceState(null, '', location.pathname + location.hash);
      const inp = $('chat-input');
      if (inp) {
        inp.value = share;
        composer.autoGrow();
        inp.focus();
      }
    }
  } catch (e) {}
  if (window.visualViewport) {
    const setVvh = () => {
      document.documentElement.style.setProperty('--vvh', window.visualViewport.height + 'px');
      document.documentElement.style.setProperty('--vv-top', window.visualViewport.offsetTop + 'px');
    };
    setVvh();
    let vvTimer = null;
    const onVvChange = () => {
      setVvh();
      clearTimeout(vvTimer);
      vvTimer = setTimeout(scrollBottom, 120);
    };
    visualViewport.addEventListener('resize', onVvChange);
    visualViewport.addEventListener('scroll', onVvChange);
  }
  try {
    localStorage.setItem('raget_boot_ms', String(Math.round(performance.now() - bootStart)));
  } catch (e) {}
  const warmup = () => {
    dataries.loadRegion('country', 'asian-tenggara').catch(() => {});
    dataries.loadRegion('country', 'eropan-barat').catch(() => {});
    // Prefetch checkpoint 200M (163MB) DIMATIKAN - NEURAL_ANSWERS_ENABLED
    // di ai.js masih false, jadi model ini tidak pernah dipakai menjawab.
    // Mengunduhnya diam-diam di setiap load cuma buang kuota/memori user
    // tanpa manfaat apa pun. Nyalakan lagi (neuralProvider.prefetchBest())
    // begitu NEURAL_ANSWERS_ENABLED diaktifkan.
  };
  if ('requestIdleCallback' in window) {
    requestIdleCallback(warmup, { timeout: 3000 });
  } else {
    setTimeout(warmup, 1500);
  }
});

if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}

window.addEventListener('unhandledrejection', (e) => {
  e.preventDefault();
});
