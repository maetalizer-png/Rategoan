/**
 * Sheets - Bottom sheet modals for attachments and models
 * @module ui/components/sheets
 */

import { RG } from '../../core/index.js';

/**
 * Bottom sheets manager
 */
RG.sheets = {
  /**
   * Close all sheets
   */
  close() {
    RG.$('attach-sheet').hidden = true;
    RG.$('model-sheet').hidden = true;
    RG.$('sheet-backdrop').classList.remove('show');
  },

  /**
   * Bind sheets event listeners
   */
  bind() {
    RG.$('sheet-backdrop').onclick = () => this.close();
    RG.$('attach-close').onclick = () => this.close();
    RG.$('model-close').onclick = () => this.close();
  },
};

export { RG };
