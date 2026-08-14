export const hemat = {
  KEY: 'raget_hemat',
  enabled() {
    return localStorage.getItem(this.KEY) === 'on';
  },
  set(on) {
    localStorage.setItem(this.KEY, on ? 'on' : 'off');
  },
  toggle() {
    const next = !this.enabled();
    this.set(next);
    return next;
  },
};
