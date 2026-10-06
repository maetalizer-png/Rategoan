import { $, scrollBottom } from '../shared/dom.js';
import { store } from './state/store.js';
import { theme } from './state/theme.js';
import { auth } from './state/auth.js';
import { font } from './state/font.js';
import { pin } from './state/pin.js';
import { probeGpu } from '../raget/raget-neural/runtime/webgpu-runner.js';
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
import { cowork } from './ui/cowork.js';
import { studioPage } from './studio/studio.js';
import { artifactsPage } from './artifacts/artifacts.js';
import { connectPage } from './connect/connect.js';
import { mountCommandPalette } from './ui/command-palette.js';
import { mountChatOptions } from './ui/chat-options-menu.js';
import { mountMemoryCapsule } from './ui/memory-capsule.js';
import { account } from './account/account.js';
import { bindConnectorReturn } from './connectors/connector-hub.js';
import { hydrateConnectorSecrets } from './connectors/connector-state.js';
import { reminderScheduler } from '../vault/reminders/scheduler.js';
import { toast } from './core/toast.js';
import { dataries } from '../raget/raget-agents/dataries-registry.js';
import { mesin } from '../raget/raget-runtime/mesin.js';

const bootStart = performance.now();

document.addEventListener('DOMContentLoaded', () => {
  const step = (fn) => {
    try { fn(); } catch (e) { console.error(e); }
  };
  document.addEventListener('rategoan:sessions-restored', () => {
    chatHistory.render();
    chat.renderMessages();
  });
  step(() => store.init());
  step(() => theme.init());
  step(() => auth.init());
  step(() => account.refresh());
  step(() => font.load());
  step(() => router.init());
  step(() => chat.renderMessages());
  step(() => chatHistory.render());
  step(() => chatHistory.bind());
  step(() => drawer.bind());
  step(() => artifact.bind());
  step(() => scrolldown.bind());
  step(() => chatsearch.bind());
  step(() => sheets.bind());
  step(() => attach.bind());
  step(() => camera.bind());
  step(() => composer.bind());
  step(() => voice.bind());
  step(() => msgmenu.bind());
  step(() => histmenu.bind());
  step(() => netmon.bind());
  step(() => install.bind());
  step(() => backup.bind());
  step(() => shortcuts.bind());
  step(() => pin.bind());
  step(() => pin.bindAutoLock());
  step(() => settings.bind());
  step(() => collectionPage.bind());
  step(() => projectPage.bind());
  step(() => cowork.bind());
  step(() => studioPage.bind());
  step(() => artifactsPage.bind());
  step(() => connectPage.bind());
  step(() => bindConnectorReturn());
  step(() => mountCommandPalette());
  step(() => mountChatOptions());
  step(() => mountMemoryCapsule());
  hydrateConnectorSecrets().catch(() => {});
  window.addEventListener('rategoan:attach-context', (event) => {
    const text = event.detail && event.detail.text;
    const inp = $('chat-input');
    if (!inp || !text) return;
    inp.value = (inp.value ? inp.value + '\n' : '') + String(text).slice(0, 2000);
    router.go('chat');
    composer.autoGrow();
  });
  login.bind();
  const paintNet = () => {
    const pill = $('offline-pill');
    if (pill) pill.hidden = navigator.onLine;
  };
  paintNet();
  window.addEventListener('online', paintNet);
  window.addEventListener('offline', paintNet);
  try { window.__rategoanMesin = mesin.list(); } catch (e) { console.warn('[Rategoan Fallback]', e); }
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
  } catch (e) { console.warn('[Rategoan Fallback]', e); }
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
  } catch (e) { console.warn('[Rategoan Fallback]', e); }
  const warmup = () => {
    dataries.loadRegion('country', 'asian-tenggara').catch(() => {});
    dataries.loadRegion('country', 'eropan-barat').catch(() => {});
  };
  if ('requestIdleCallback' in window) {
    requestIdleCallback(warmup, { timeout: 3000 });
    requestIdleCallback(() => { probeGpu().catch(() => {}); watchStorage(); }, { timeout: 4000 });
  } else {
    setTimeout(warmup, 1500);
    setTimeout(() => { probeGpu().catch(() => {}); watchStorage(); }, 2000);
  }
});

async function watchStorage() {
  if (!navigator.storage || typeof navigator.storage.estimate !== 'function') return;
  try {
    const est = await navigator.storage.estimate();
    if (est.quota && est.usage / est.quota > 0.8) store.save();
  } catch (e) { console.warn('[Rategoan Fallback]', e); }
}

document.addEventListener('rategoan:vault-open', () => store.init());

if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
  window.addEventListener('load', () => {
    const hadController = !!navigator.serviceWorker.controller;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!hadController) return;
      toast.show('Versi baru tersedia. Muat ulang', { onClick: () => location.reload() });
    });
    navigator.serviceWorker.register('sw.js').then((reg) => {
      reg.addEventListener('updatefound', () => {
        const worker = reg.installing;
        if (!worker) return;
        worker.addEventListener('statechange', () => {
          if (worker.state === 'activated' && navigator.serviceWorker.controller) {
            toast.show('Versi baru tersedia. Ketuk untuk memuat ulang.', { onClick: () => location.reload() });
          }
        });
      });
    }).catch(() => {});
  });
}

window.addEventListener('unhandledrejection', (e) => {
  e.preventDefault();
});
