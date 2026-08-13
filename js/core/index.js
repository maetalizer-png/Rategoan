/**
 * Core Module - Utility functions and global namespace initialization
 * @module core
 */

// Global namespace RG (Rategoan)
const RG = {};

/**
 * Get element by ID
 * @param {string} id - Element ID
 * @returns {HTMLElement|null}
 */
RG.$ = (id) => document.getElementById(id);

/**
 * Clamp value between min and max
 * @param {number} v - Value
 * @param {number} min - Minimum
 * @param {number} max - Maximum
 * @returns {number}
 */
RG.clamp = (v, min, max) => Math.min(max, Math.max(min, v));

/**
 * Sleep for specified milliseconds
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise<void>}
 */
RG.sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Scroll messages container to bottom
 */
RG.scrollBottom = () => {
  const m = RG.$('messages');
  if (m) m.scrollTop = m.scrollHeight;
};

/**
 * Format time as HH:mm
 * @param {number} t - Timestamp
 * @returns {string}
 */
RG.fmtTime = (t) =>
  new Date(t).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

export { RG };
