(function () {
  try {
    var v = localStorage.getItem('rategoan_theme') || 'auto';
    var dark = v === 'auto'
      ? !!(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)
      : v === 'dark';
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
  } catch (e) {}
})();
