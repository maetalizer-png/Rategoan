import { $ } from '../../shared/dom.js';
import { router } from '../core/router.js';
import { drawer } from '../ui/drawer.js';
import { connectorHub } from '../connectors/connector-hub.js';

function mount() {
  connectorHub.mount($('connect-hub'));
}

export const connectPage = {
  paint: mount,
  bind() {
    const back = $('connect-back');
    if (back) back.onclick = () => router.go('chat');
    const side = $('btn-connect');
    if (side) side.onclick = () => {
      drawer.close();
      this.open();
    };
    window.addEventListener('hashchange', () => {
      if ((location.hash || '').indexOf('connect') >= 0) mount();
    });
    window.addEventListener('rategoan:route', (ev) => {
      if (ev && ev.detail && ev.detail.view === 'connect') mount();
    });
    mount();
  },
  open() {
    mount();
    router.go('connect');
  },
};
