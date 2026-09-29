import { $ } from '../utils/dom.js';
import { router } from '../core/router.js';
import { artifact } from '../ui/artifact.js';
import { jsSandbox } from '../../vault/code/js-sandbox.js';
import { toast } from '../core/toast.js';

const SAMPLE = 'function jumlah(a, b) {\n  return a + b;\n}\n\nconsole.log(jumlah(2, 3));\njumlah(2, 3);';

function editor() {
  return $('studio-editor');
}

export const studioPage = {
  paint() {
    const el = editor();
    if (el && !el.value.trim()) el.value = SAMPLE;
  },
  bind() {
    const back = $('studio-back');
    if (back) back.onclick = () => router.go('chat');
    const run = $('studio-run');
    if (run) run.onclick = async () => {
      const code = editor() ? editor().value : '';
      const out = $('studio-console');
      const res = await jsSandbox.run(code);
      if (out) {
        out.hidden = false;
        out.textContent = res.ok
          ? ((res.logs || []).join('\n') + (res.value ? '\n→ ' + res.value : '')).trim() || 'Selesai.'
          : ('Gagal: ' + (res.error || 'error'));
      }
    };
    const open = $('studio-open-panel');
    if (open) open.onclick = () => {
      const code = editor() ? editor().value : '';
      artifact.open({ type: 'code', code: code, lang: 'js', title: 'Studio', fileName: 'studio.js' }, 'Studio');
    };
    const side = $('btn-studio');
    if (side) side.onclick = () => {
      this.paint();
      router.go('studio');
    };
  },
  open() {
    this.paint();
    router.go('studio');
  },
};
