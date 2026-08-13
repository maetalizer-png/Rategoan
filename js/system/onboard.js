import { $ } from '../utils/dom.js';
import { auth } from '../state/auth.js';

export const onboard = {
  KEY: 'rategoan_onboarded',
  maybeShow() {
    if (localStorage.getItem(this.KEY)) return;
    if (!auth.state) return;
    const ov = $('onboard-overlay');
    if (ov) ov.hidden = false;
  },
  bind() {
    const ok = $('onboard-ok');
    if (ok) {
      ok.onclick = () => {
        localStorage.setItem(this.KEY, '1');
        const ov = $('onboard-overlay');
        if (ov) ov.hidden = true;
      };
    }
  },
};
