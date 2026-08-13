'use strict';
document.addEventListener('DOMContentLoaded', () => {
  RG.store.init();
  RG.theme.init();
  RG.auth.init();
  RG.font.load();
  RG.router.init();
  RG.chat.renderMessages();
  RG.history.render();
  RG.history.bind();
  RG.drawer.bind();
  RG.scrolldown.bind();
  RG.chatsearch.bind();
  RG.sheets.bind();
  RG.attach.bind();
  RG.models.bind();
  RG.composer.bind();
  RG.voice.bind();
  RG.msgmenu.bind();
  RG.histmenu.bind();
  RG.netmon.bind();
  RG.install.bind();
  RG.backup.bind();
  RG.shortcuts.bind();
  RG.pin.bind();
  RG.pin.bindAutoLock();
  RG.onboard.bind();
  RG.settings.bind();
  RG.login.bind();
  RG.onboard.maybeShow();
  try {
    const params = new URLSearchParams(location.search);
    const share = params.get('shareText');
    if (share) {
      history.replaceState(null, '', location.pathname + location.hash);
      if (RG.auth.state) {
        const inp = RG.$('chat-input');
        inp.value = share;
        RG.composer.autoGrow();
        inp.focus();
      }
    }
  } catch (e) {}
  if (window.visualViewport) {
    visualViewport.addEventListener('resize', () => setTimeout(RG.scrollBottom, 100));
  }
});

if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}