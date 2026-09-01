export const theme = {
  KEY: 'rategoan_theme',
  value: 'auto',
  apply() {
    let dark;
    if (this.value === 'auto') {
      dark = !!(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
    } else {
      dark = this.value === 'dark';
    }
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    const m = document.querySelector('meta[name="theme-color"]');
    if (m) m.content = dark ? '#05080c' : '#ffffff';
  },
  init() {
    this.value = localStorage.getItem(this.KEY) || 'auto';
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').addEventListener) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if (this.value === 'auto') this.apply();
      });
    }
    this.apply();
  },
  set(v) {
    this.value = v;
    localStorage.setItem(this.KEY, v);
    this.apply();
  },
};
