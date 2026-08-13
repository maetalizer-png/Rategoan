export const config = Object.freeze({
  APP_NAME: 'Rategoan',
  VERSION: '1.0',
  STORAGE_KEYS: {
    SESSIONS: 'rategoan_sessions',
    THEME: 'rategoan_theme',
    AUTH: 'rategoan_auth',
    MODEL: 'rategoan_model',
    FONT: 'rategoan_font',
    PIN: 'rategoan_pin',
    ONBOARDED: 'rategoan_onboarded',
  },
});

window.RG = window.RG || {};
window.RG.config = config;
