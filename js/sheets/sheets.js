import { $ } from '../utils/dom.js';
import { modelSheet } from './model-sheet.js';
import { dataHealthSheet } from './data-health-sheet.js';

export const sheets = {
  close() {
    $('attach-sheet').hidden = true;
    $('model-sheet').hidden = true;
    $('data-health-sheet').hidden = true;
    const ps = $('project-sheet');
    if (ps) ps.hidden = true;
    $('sheet-backdrop').classList.remove('show');
  },
  openModel() {
    modelSheet.render();
    $('model-sheet').hidden = false;
    $('sheet-backdrop').classList.add('show');
  },
  openProject() {
    const ps = $('project-sheet');
    if (!ps) return;
    ps.hidden = false;
    $('sheet-backdrop').classList.add('show');
  },
  openDataHealth() {
    $('data-health-sheet').hidden = false;
    $('sheet-backdrop').classList.add('show');
    dataHealthSheet.render();
  },
  bind() {
    $('sheet-backdrop').onclick = () => this.close();
    $('attach-close').onclick = () => this.close();
    $('model-close').onclick = () => this.close();
    $('data-health-close').onclick = () => this.close();
    const pc = $('project-close');
    if (pc) pc.onclick = () => this.close();
  },
};
