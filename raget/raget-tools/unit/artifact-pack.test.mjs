import test from 'node:test';
import assert from 'node:assert/strict';
import { buildZip, listZipEntries } from '../../../shared/zip-local.js';
import { buildDocxBytes } from '../../../shared/docx-local.js';
import { DRIVE_TOOLS } from '../../../api/connectors/drive.js';
import { GITHUB_TOOLS } from '../../../api/connectors/github.js';
import { GMAIL_TOOLS } from '../../../api/connectors/gmail.js';
import { CALENDAR_TOOLS } from '../../../api/connectors/calendar.js';
import { WEB_TOOLS } from '../../../api/connectors/web/search.js';

test('zip store diawali header PK dan menyimpan nama berkas', () => {
  const bytes = buildZip([{ name: 'a.txt', data: 'halo' }]);
  assert.equal(bytes[0], 0x50);
  assert.equal(bytes[1], 0x4b);
  assert.equal(bytes[2], 0x03);
  assert.equal(bytes[3], 0x04);
  const names = listZipEntries(bytes).map((entry) => entry.name);
  assert.deepEqual(names, ['a.txt']);
  assert.match(new TextDecoder().decode(bytes), /halo/);
});

test('docx memuat word/document.xml beserta teks', () => {
  const bytes = buildDocxBytes('Halo dokumen');
  const names = listZipEntries(bytes).map((entry) => entry.name);
  assert.ok(names.indexOf('word/document.xml') >= 0);
  assert.match(new TextDecoder().decode(bytes), /Halo dokumen/);
  assert.match(new TextDecoder().decode(bytes), /word\/document\.xml/);
});

test('katalog alat konektor sesuai kontrak jumlah', () => {
  assert.equal(DRIVE_TOOLS.length, 11);
  assert.equal(GITHUB_TOOLS.length, 45);
  assert.equal(GMAIL_TOOLS.length, 30);
  assert.equal(CALENDAR_TOOLS.length, 6);
  assert.equal(WEB_TOOLS.length, 4);
  const names = GITHUB_TOOLS.map((tool) => tool.name);
  assert.equal(new Set(names).size, names.length);
});
