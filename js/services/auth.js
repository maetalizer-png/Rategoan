/**
 * Auth Service - User authentication management
 * @module services/auth
 */

import { RG } from '../core/index.js';

/**
 * Authentication manager for user sessions
 */
RG.auth = {
  KEY: 'rategoan_auth',
  state: null,

  /**
   * Initialize auth from localStorage
   */
  init() {
    try {
      this.state = JSON.parse(localStorage.getItem(this.KEY) || 'null');
    } catch (e) {
      this.state = null;
    }
  },

  /**
   * Save auth state to localStorage
   */
  save() {
    localStorage.setItem(this.KEY, JSON.stringify(this.state));
  },

  /**
   * Login with specified method and ID
   * @param {string} method - Login method: 'gmail' or 'phone'
   * @param {string} id - User identifier
   */
  login(method, id) {
    this.state = { method: method, id: id, time: Date.now() };
    this.save();
  },

  /**
   * Logout current user
   */
  logout() {
    this.state = null;
    localStorage.removeItem(this.KEY);
  },
};

export { RG };
