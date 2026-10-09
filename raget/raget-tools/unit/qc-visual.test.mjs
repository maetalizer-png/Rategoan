import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const root = new URL('../../../', import.meta.url);
function read(rel) { return readFileSync(new URL(rel, root), 'utf8'); }

test('tab kanvas tidak meluber: overflow dan min-width nol', () => {
  const css = read('css/ui/studio.css');
  assert.match(css, /\.canvas-head \.canvas-tabs[\s\S]*overflow-x:\s*auto/);
  assert.match(css, /\.canvas-head \.canvas-tabs[\s\S]*min-width:\s*0/);
  assert.match(css, /flex-shrink:\s*0/);
  assert.match(css, /@container kanvas \(max-width:\s*699px\)/);
});

test('backdrop desktop transparan dan di atas sidebar', () => {
  const css = read('css/layout/desktop.css');
  assert.match(css, /\.sheet-backdrop\.show[\s\S]*background:\s*transparent !important/);
  assert.match(css, /z-index:\s*70 !important/);
  assert.match(css, /body\.model-open #model-sheet/);
});

test('nilai penyimpanan tidak mengulang label dan menempel kanan', () => {
  const js = read('js/account/settings.js');
  const css = read('css/account/settings.css');
  assert.equal(js.includes("'Penyimpanan: '"), false);
  assert.match(js, /mb \+ ' MB \/ 50 MB'/);
  assert.match(css, /\.set-row > \.set-value[\s\S]*margin-left:\s*auto/);
  assert.match(css, /text-align:\s*right/);
});

test('token desain resmi tetap ada', () => {
  const tokens = read('css/tokens.css');
  ['--rg-bg', '--rg-surface', '--rg-line', '--rg-text', '--rg-muted', '--rg-bg-glass'].forEach((name) => {
    assert.match(tokens, new RegExp(name.replace(/-/g, '\\-') + '\\s*:'));
  });
});
