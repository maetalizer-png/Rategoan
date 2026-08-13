/**
 * UI Components Module - Haptics, Markdown rendering, Copy/Download utilities
 * @module ui/components
 */

import { RG } from '../../core/index.js';

/**
 * Haptic feedback using vibration API
 */
RG.haptics = {
  /**
   * Trigger haptic feedback
   * @param {number} ms - Duration in milliseconds
   */
  tap(ms) {
    try {
      if (navigator.vibrate) navigator.vibrate(ms || 10);
    } catch (e) {}
  },
};

/**
 * Check if reduced motion is preferred
 * @returns {boolean}
 */
RG.reduceMotion = () => !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

/**
 * Simple markdown renderer
 */
RG.markdown = {
  /**
   * Escape HTML special characters
   * @param {string} s - Input string
   * @returns {string} Escaped string
   */
  escape(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  },

  /**
   * Render markdown to HTML
   * @param {string} text - Markdown text
   * @returns {string} HTML output
   */
  render(text) {
    const fences = [];
    let src = String(text || '');
    src = src.replace(/```([\s\S]*?)```/g, (m, code) => {
      fences.push('<pre class="md-pre">' + this.escape(code.replace(/^\n+|\n+$/g, '')) + '</pre>');
      return ' F' + (fences.length - 1) + ' ';
    });
    let out = this.escape(src);
    out = out.replace(/`([^`\n]+)`/g, '<code class="md-code">$1</code>');
    out = out.replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>');
    out = out.replace(/^#{1,3}\s+(.+)$/gm, '<strong class="md-h">$1</strong>');
    out = out.replace(/(^|\n)\s*[-•]\s+/g, '$1<span class="md-li">•</span> ');
    out = out.replace(/(^|\n)(\d+)\.\s+/g, '$1<span class="md-li">$2.</span> ');
    out = out.replace(/ F(\d+) /g, (m, i) => fences[Number(i)]);
    return out;
  },
};

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<void>}
 */
RG.copy = (text) => {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text);
  }
  return new Promise((resolve, reject) => {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy') ? resolve() : reject(new Error('copy failed'));
    } catch (e) {
      reject(e);
    }
    ta.remove();
  });
};

/**
 * Download text as file
 * @param {string} name - Filename
 * @param {string} text - File content
 */
RG.download = (name, text) => {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 500);
};

export { RG };
