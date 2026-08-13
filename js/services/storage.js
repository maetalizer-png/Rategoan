/**
 * Storage Service - LocalStorage wrapper for session data
 * @module services/storage
 */

import { RG } from '../core/index.js';

/**
 * Storage manager for app sessions
 */
RG.store = {
  KEY: 'rategoan_sessions',
  state: { sessions: [], currentId: null },

  /**
   * Initialize storage from localStorage
   */
  init() {
    try {
      this.state.sessions = JSON.parse(localStorage.getItem(this.KEY) || '[]');
    } catch (e) {
      this.state.sessions = [];
    }
  },

  /**
   * Save state to localStorage
   */
  save() {
    localStorage.setItem(this.KEY, JSON.stringify(this.state.sessions));
  },

  /**
   * Get current state
   * @returns {Object} State object
   */
  get() {
    return this.state;
  },

  /**
   * Patch state with new values
   * @param {Object} patch - Properties to merge
   */
  set(patch) {
    Object.assign(this.state, patch);
  },
};

export { RG };
