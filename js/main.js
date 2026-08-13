// Rategoan - ES6 Module Entry Point
import { config } from './core/config.js';
import { utils, $ } from './core/utils.js';
import { store } from './core/store.js';
import { theme } from './core/theme.js';
import { toast } from './core/toast.js';
import { auth } from './core/auth.js';
import { router } from './core/router.js';

import { drawer } from './ui/drawer.js';
import { onboard } from './ui/onboard.js';

import { chat } from './chat/chat.js';
import { composer } from './chat/composer.js';
import { voice } from './chat/voice.js';
import { quote } from './chat/quote.js';
import { chatsearch } from './chat/chatsearch.js';
import { scrolldown } from './chat/scrolldown.js';
import { msgmenu } from './chat/msgmenu.js';
import { markdown } from './chat/markdown.js';

import { history } from './history/history.js';
import { histmenu } from './history/histmenu.js';

import { sheets } from './sheets/sheets.js';
import { attach } from './sheets/attach.js';
import { models } from './sheets/models.js';

import { account } from './account/account.js';
import { login } from './account/login.js';
import { pin } from './account/pin.js';

import { settings } from './settings/settings.js';
import { font } from './settings/font.js';
import { storage } from './settings/storage.js';

import { netmon } from './device/netmon.js';
import { install } from './device/install.js';
import { shortcuts } from './device/shortcuts.js';

// Bootstrap
(function bootstrap() {
  // Init core
  store.init();
  auth.init();
  theme.init();
  font.init();
  
  // Register service worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
  
  // Check auth and render route
  router.init();
  
  // Bind UI
  drawer.bind();
  onboard.maybeShow();
  onboard.bind();
  
  // Init modules
  chat.init();
  composer.init();
  voice.init();
  quote.init();
  chatsearch.init();
  scrolldown.init();
  msgmenu.init();
  
  history.init();
  histmenu.init();
  
  sheets.init();
  attach.init();
  models.init();
  
  account.init();
  login.init();
  pin.init();
  
  settings.init();
  font.init();
  storage.init();
  
  netmon.init();
  install.init();
  shortcuts.init();
  
  // Empty state chips
  document.querySelectorAll('.empty-chip').forEach(chip => {
    chip.onclick = () => {
      if (composer.el) composer.el.value = chip.textContent;
      if (composer.send) composer.send();
    };
  });
  
  // New chat button
  const btnNew = $('btn-new-chat');
  if (btnNew) {
    btnNew.onclick = () => {
      if (history.save) history.save();
      chat.state.messages = [];
      chat.render();
      if (drawer.close) drawer.close();
    };
  }
  
  // Stop button
  const btnStop = $('btn-stop');
  if (btnStop) {
    btnStop.onclick = () => {
      // Placeholder for stop generation
      if (toast.show) toast.show('Generasi dihentikan');
    };
  }
  
  // Voice button
  const btnVoice = $('btn-voice-input');
  if (btnVoice) {
    btnVoice.onclick = () => {
      if (window.RG.toast) window.RG.toast.show('Fitur suara belum tersedia');
    };
  }
  
  console.log(config.APP_NAME + ' version ' + config.VERSION + ' loaded');
})();
