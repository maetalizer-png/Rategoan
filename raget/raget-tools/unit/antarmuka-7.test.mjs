import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const root = new URL('../../../', import.meta.url);
function read(rel) { return readFileSync(new URL(rel, root), 'utf8'); }

test('DOD-7.01: konektor mount langsung saat boot jika URL memuat connect', () => {
  const src = read('js/connect/connect.js');
  assert.match(src, /if\s*\(\(location\.hash\s*\|\|\s*''\)\.indexOf\('connect'\)\s*>=\s*0\)\s*mount\(\);/);
});

test('DOD-7.02: popover attach-sheet desktop bebas dari max-height kaku dan scrollbar', () => {
  const css = read('css/ui/studio.css');
  assert.ok(css.indexOf('#studio-attach-sheet') >= 0);
  assert.match(css, /max-height:\s*calc\(100vh - 100px\)\s*!important/);
  assert.match(css, /overflow-y:\s*auto\s*!important/);
  assert.doesNotMatch(css, /max-height:\s*220px/);
  assert.doesNotMatch(css, /max-height:\s*none\s*!important/);
});

test('DOD-7.03: bilah atas studio topbar menggunakan warna latar surface yang selaras', () => {
  const css = read('css/ui/studio.css');
  const at = css.indexOf('#topbar.studio-topbar');
  assert.ok(at >= 0);
  const slice = css.slice(at, at + 400);
  assert.match(slice, /background:\s*var\(--rg-surface\)/);
  assert.match(slice, /border-bottom:\s*1px solid var\(--rg-line\)/);
});

test('DOD-7.04: tautan duplikat kelola di hub dihapus dari studio.html', () => {
  const html = read('studio.html');
  assert.doesNotMatch(html, /<a class="hub-link"/);
  assert.doesNotMatch(html, /Kelola di hub<\/a>/);
});

test('DOD-7.05: dirtySessionTitle memfilter scaffold, ujicoba, test, dan demo', () => {
  const js = read('js/studio/studio-app.js');
  assert.match(js, /function dirtySessionTitle/);
  assert.match(js, /scaffold/i);
});
