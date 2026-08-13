export const font = {
  KEY: 'rategoan_font',
  value: 'normal',
  load() {
    this.value = localStorage.getItem(this.KEY) || 'normal';
    this.apply();
  },
  apply() {
    document.documentElement.dataset.font = this.value;
  },
  set(v) {
    this.value = v;
    localStorage.setItem(this.KEY, v);
    this.apply();
  },
};
