export const auth = {
  KEY: 'rategoan_auth',
  state: null,
  init() {
    try {
      this.state = JSON.parse(localStorage.getItem(this.KEY) || 'null');
    } catch (e) {
      this.state = null;
    }
  },
  save() {
    localStorage.setItem(this.KEY, JSON.stringify(this.state));
  },
  login(method, id) {
    this.state = { method: method, id: id, time: Date.now() };
    this.save();
  },
  logout() {
    this.state = null;
    localStorage.removeItem(this.KEY);
  },
  displayName() {
    if (!this.state) return null;
    if (this.state.method === 'gmail') {
      const local = String(this.state.id).split('@')[0] || 'pengguna';
      return local.charAt(0).toUpperCase() + local.slice(1);
    }
    return 'Pengguna';
  },
};
