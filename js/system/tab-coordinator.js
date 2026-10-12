export const MODEL_LOCK = 'rategoan-model-leader';
export const MODEL_BUS = 'rategoan-model-bus';

export function createModelBus() {
  const Bus = globalThis.BroadcastChannel;
  const channel = typeof Bus === 'function' ? new Bus(MODEL_BUS) : null;
  const inbox = [];
  function post(data) {
    if (channel) channel.postMessage(data);
    else inbox.push(data);
    return data;
  }
  function ask(prompt, timeoutMs) {
    const id = 'q' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    return new Promise((resolve) => {
      const timer = setTimeout(() => {
        if (channel) channel.removeEventListener('message', onMsg);
        resolve('');
      }, timeoutMs || 20000);
      function onMsg(event) {
        const data = event && event.data ? event.data : event;
        if (!data || data.id !== id || data.type !== 'token-done') return;
        clearTimeout(timer);
        if (channel) channel.removeEventListener('message', onMsg);
        resolve(String(data.text || ''));
      }
      if (channel) channel.addEventListener('message', onMsg);
      else {
        clearTimeout(timer);
        resolve('');
        return;
      }
      post({ type: 'prompt', id, prompt: String(prompt || '') });
    });
  }
  return { channel, inbox, post, ask, name: MODEL_BUS };
}

export function claimModelLeader() {
  const locks = globalThis.navigator && navigator.locks;
  const state = { leader: false, ready: false, name: MODEL_LOCK };
  if (!locks || typeof locks.request !== 'function') {
    state.leader = true;
    state.ready = true;
    return state;
  }
  locks.request(MODEL_LOCK, { mode: 'exclusive', ifAvailable: true }, (lock) => {
    state.leader = !!lock;
    state.ready = true;
    if (!lock) return undefined;
    return new Promise(() => {});
  }).catch(() => {
    state.leader = true;
    state.ready = true;
  });
  return state;
}

export function bootModelCoordinator() {
  const state = claimModelLeader();
  const bus = createModelBus();
  globalThis.__RG_MODEL_BUS__ = bus;
  function mark() {
    if (!state.ready) {
      setTimeout(mark, 20);
      return;
    }
    globalThis.__RG_MODEL_FOLLOWER__ = !state.leader;
    if (!state.leader || !bus.channel) return;
    bus.channel.addEventListener('message', (event) => {
      const data = event && event.data;
      if (!data || data.type !== 'prompt') return;
      import('../../raget/raget-neural/neural-provider.js').then((mod) => {
        const provider = mod.neuralProvider;
        if (!provider || typeof provider.generate !== 'function') {
          bus.post({ type: 'token-done', id: data.id, text: '' });
          return;
        }
        provider.generate(String(data.prompt || ''), {}).then((text) => {
          bus.post({ type: 'token-done', id: data.id, text: text || '' });
        }).catch(() => {
          bus.post({ type: 'token-done', id: data.id, text: '' });
        });
      }).catch(() => {
        bus.post({ type: 'token-done', id: data.id, text: '' });
      });
    });
  }
  mark();
  return { state, bus };
}
