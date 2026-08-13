export const storage = {
  usage() {
    let total = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      const v = localStorage.getItem(k) || '';
      total += (k.length + v.length) * 2;
    }
    return total;
  },
  quota() {
    return 5 * 1024 * 1024;
  },
  percent() {
    return Math.min(100, Math.round((this.usage() / this.quota()) * 100));
  },
};
