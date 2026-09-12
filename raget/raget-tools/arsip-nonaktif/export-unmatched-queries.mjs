// FR-5.2: developer-facing export tool for the unmatched-queries log written by
// raget-db.js#logUnmatched() (called from agent.js#respondCore only when a query
// reaches the very end of the fallback chain with truly nothing matched - see
// FR-5.1). Read-only: it only reads the IndexedDB store the running app already
// writes to (same origin/browser profile as normal usage) and writes a JSON file -
// it never touches app behavior.
//
// Follows the same "drive the running app with Playwright" pattern as
// measure-kv.mjs, because the data lives in the browser's IndexedDB - there is no
// backend to query directly in this local-first app. Reads it by dynamically
// importing the app's own raget-db.js module inside the page (rather than
// hand-rolling a second raw indexedDB.open() call) so this tool shares the exact
// same connection/schema-upgrade lifecycle as idb-gateway.js instead of racing it -
// a second independent indexedDB.open() with no onupgradeneeded handler can lose
// that race and observe (or even create) a store-less database.
//
// The data (IndexedDB) lives in whatever browser profile the app was actually used
// from, so which browser context this script opens matters:
//   - default: a fresh ephemeral Playwright session (like measure-kv.mjs) - use this
//     to sanity-check the export mechanism itself, or right after driving the app
//     with Playwright in that same kind of session.
//   - --profile-dir <path>: a PERSISTENT context backed by that user-data-dir - use
//     this to export a developer's real accumulated unmatched-queries log from the
//     actual Chromium/Chrome profile they use day-to-day with the app (an ephemeral
//     session starts with empty IndexedDB and would never see that data).
//
// Cara pakai:
//   node raget/raget-tools/export-unmatched-queries.mjs [base-url] [output-file]
//   node raget/raget-tools/export-unmatched-queries.mjs [base-url] [output-file] --profile-dir <path>
//   base-url    default: http://localhost:8099
//   output-file default: raget/raget-tools/unmatched-queries-export.json

import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2).filter((a) => a !== '--profile-dir');
const profileFlagIdx = process.argv.indexOf('--profile-dir');
const PROFILE_DIR = profileFlagIdx >= 0 ? process.argv[profileFlagIdx + 1] : null;
const BASE = args[0] || 'http://localhost:8099';
const OUT_FILE = args[1] ? resolve(args[1]) : join(__dirname, 'unmatched-queries-export.json');

async function openPage() {
  if (PROFILE_DIR) {
    const context = await chromium.launchPersistentContext(PROFILE_DIR, {
      executablePath: '/opt/pw-browsers/chromium',
      headless: true,
    });
    const page = context.pages()[0] || (await context.newPage());
    return { page, close: () => context.close() };
  }
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', headless: true });
  const page = await browser.newPage();
  return { page, close: () => browser.close() };
}

async function main() {
  const { page, close } = await openPage();
  await page.goto(BASE + '/index.html');
  await page.waitForTimeout(300);

  // Dynamically import the app's own raget-db.js module inside the page and call
  // its allUnmatched() - same code path the app itself uses to read this data.
  const entries = await page.evaluate(async () => {
    try {
      const { ragetDb } = await import('/raget/raget-database/raget-db.js');
      return await ragetDb.allUnmatched();
    } catch (e) {
      return [];
    }
  });

  await close();

  const report = {
    exportedAt: new Date().toISOString(),
    source: BASE,
    profileDir: PROFILE_DIR || null,
    count: entries.length,
    entries,
  };
  writeFileSync(OUT_FILE, JSON.stringify(report, null, 2) + '\n');

  console.log('=== export-unmatched-queries: hasil ekspor ===');
  console.log('Kueri gagal (unmatched) ditemukan:', entries.length);
  if (entries.length) {
    console.log('Contoh (maks 10):');
    entries.slice(-10).forEach((e) => console.log('  -', JSON.stringify(e.query), '(' + new Date(e.time).toISOString() + ')'));
  }
  console.log('\nDitulis ke:', OUT_FILE);
}

main().catch((e) => {
  console.error('GAGAL:', e.stack || e.message);
  process.exit(1);
});
