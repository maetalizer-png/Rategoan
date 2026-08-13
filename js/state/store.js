export const store = {
  KEY: 'rategoan_sessions',
  state: { sessions: [], currentId: null },
  init() {
    try {
      this.state.sessions = JSON.parse(localStorage.getItem(this.KEY) || '[]');
    } catch (e) {
      this.state.sessions = [];
    }
  },
  save() {
    localStorage.setItem(this.KEY, JSON.stringify(this.state.sessions));
  },
  get() {
    return this.state;
  },
  set(patch) {
    Object.assign(this.state, patch);
  },
};
