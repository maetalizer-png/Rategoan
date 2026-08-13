import { $ } from '../core/utils.js';
import { auth } from '../core/auth.js';
import { router } from '../core/router.js';
import { history } from '../history/history.js';
import { account } from '../account/account.js';

export const settings = Object.freeze({
  init() {
    const btnSettings = $('btn-settings');
    const btnBack = $('btn-back');
    const rowLogout = $('row-logout');
    const rowClear = $('row-clear-chat');
    const rowBackup = $('row-backup');
    const rowRestore = $('row-restore');
    
    if (btnSettings) btnSettings.onclick = () => this.open();
    if (btnBack) btnBack.onclick = () => this.close();
    if (rowLogout) rowLogout.onclick = () => this.logout();
    if (rowClear) rowClear.onclick = () => this.clearAll();
    if (rowBackup) rowBackup.onclick = () => this.backup();
    if (rowRestore) rowRestore.onclick = () => $('pick-restore').click();
    
    const pickRestore = $('pick-restore');
    if (pickRestore) pickRestore.addEventListener('change', (e) => this.restore(e));
    
    // Theme buttons
    document.querySelectorAll('.theme-btn').forEach(btn => {
      btn.onclick = () => {
        if (window.RG.theme) window.RG.theme.set(btn.dataset.theme);
      };
    });
    
    // Font buttons
    document.querySelectorAll('.font-btn').forEach(btn => {
      btn.onclick = () => {
        if (window.RG.font) window.RG.font.set(btn.dataset.font);
      };
    });
  },
  open() {
    account.render();
    this.updateStorage();
    if (window.RG.router) window.RG.router.go('settings');
  },
  close() {
    if (window.RG.router) window.RG.router.go('chat');
  },
  logout() {
    if (confirm('Keluar dari akun?')) {
      auth.logout();
      if (window.RG.toast) window.RG.toast.show('Berhasil keluar');
      router.go('login');
    }
  },
  clearAll() {
    if (confirm('Hapus SEMUA chat? Tidak bisa dibatalkan!')) {
      localStorage.removeItem('rategoan_sessions');
      if (window.RG.store) window.RG.store.init();
      if (window.RG.chat) window.RG.chat.clear();
      if (window.RG.history) window.RG.history.render();
      if (window.RG.toast) window.RG.toast.show('Semua chat dihapus');
    }
  },
  backup() {
    const data = localStorage.getItem('rategoan_sessions');
    if (!data) {
      if (window.RG.toast) window.RG.toast.show('Tidak ada chat untuk dicadangkan');
      return;
    }
    const blob = new Blob([data], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'rategoan-backup.json';
    a.click();
    if (window.RG.toast) window.RG.toast.show('Cadangan dibuat');
  },
  restore(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        localStorage.setItem('rategoan_sessions', JSON.stringify(data));
        if (window.RG.store) window.RG.store.init();
        if (window.RG.history) window.RG.history.render();
        if (window.RG.toast) window.RG.toast.show('Pulihkan berhasil');
      } catch (err) {
        if (window.RG.toast) window.RG.toast.show('File tidak valid');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  },
  updateStorage() {
    const info = $('storage-info');
    if (!info) return;
    let total = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += localStorage[key].length + key.length;
      }
    }
    const kb = (total / 1024).toFixed(1);
    info.textContent = kb + ' KB';
  },
});

window.RG = window.RG || {};
window.RG.settings = settings;
