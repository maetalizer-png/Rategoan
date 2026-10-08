import { $ } from '../../shared/dom.js';
import { modelSheet } from './model-sheet.js';
import { dataHealthSheet } from './data-health-sheet.js';

export const sheets = {
  close() {
    $('attach-sheet').hidden = true;
    const anchored = $('attach-sheet');
    if (anchored) anchored.classList.remove('is-anchored');
    document.body.classList.remove('attach-open');
    $('model-sheet').hidden = true;
    const skill = $('skill-sheet');
    if (skill) skill.hidden = true;
    $('data-health-sheet').hidden = true;
    const ps = $('project-sheet');
    if (ps) ps.hidden = true;
    const as = $('artifact-sheet');
    if (as) as.hidden = true;
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
  openArtifact() {
    const as = $('artifact-sheet');
    if (!as) return;
    as.hidden = false;
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
    const skillClose = $('skill-close');
    if (skillClose) skillClose.onclick = () => this.close();
    $('data-health-close').onclick = () => this.close();
    const pc = $('project-close');
    if (pc) pc.onclick = () => this.close();
    const ac = $('artifact-sheet-close');
    if (ac) ac.onclick = () => this.close();
    document.addEventListener('keydown', (event) => {
      const sheet = $('attach-sheet');
      if (!sheet || sheet.hidden) {
        if (event.key === 'Escape') this.close();
        return;
      }
      if (event.key === 'Escape') {
        this.close();
        return;
      }
      if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
      const buttons = Array.from(sheet.querySelectorAll('button'));
      if (!buttons.length) return;
      const index = buttons.indexOf(document.activeElement);
      const step = event.key === 'ArrowDown' ? 1 : -1;
      const next = buttons[(index + step + buttons.length) % buttons.length];
      if (next) {
        event.preventDefault();
        next.focus();
      }
    });
  },
};
