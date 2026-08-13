export const onboard = Object.freeze({
  KEY: 'rategoan_onboarded',
  maybeShow() {
    if (localStorage.getItem(this.KEY)) return;
    if (!window.RG.auth || !window.RG.auth.state) return;
    const ov = document.getElementById('onboard-overlay');
    if (ov) ov.hidden = false;
  },
  bind() {
    const ok = document.getElementById('onboard-ok');
    if (ok) {
      ok.onclick = () => {
        localStorage.setItem(this.KEY, '1');
        const ov = document.getElementById('onboard-overlay');
        if (ov) ov.hidden = true;
      };
    }
  },
});

window.RG = window.RG || {};
window.RG.onboard = onboard;
