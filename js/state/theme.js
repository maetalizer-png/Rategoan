export const theme = {
  KEY: 'rategoan_theme',
  value: 'auto',
  isDark() {
    if (this.value === 'auto') {
      return !!(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return this.value === 'dark';
  },
  apply() {
    const dark = this.isDark();
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    const m = document.querySelector('meta[name="theme-color"]');
    if (m) m.content = dark ? '#05080c' : '#ffffff';
  },
  applyWithVeil() {
    const veil = document.getElementById('theme-veil');
    if (!veil) {
      this.apply();
      return;
    }
    veil.classList.add('show');
    setTimeout(() => {
      this.apply();
      setTimeout(() => veil.classList.remove('show'), 20);
    }, 160);
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
    const run = () => this.apply();
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduce && document.startViewTransition) document.startViewTransition(run);
    else run();
  },
};
