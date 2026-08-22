let deferredPrompt = null;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  const btn = document.querySelector('#installBtn');
  if (btn) btn.hidden = false;
});

export const install = {
  bind() {
    const btn = document.querySelector('#installBtn');
    if (!btn) return;
    btn.onclick = async () => {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      deferredPrompt = null;
      btn.hidden = true;
    };
  },
};
