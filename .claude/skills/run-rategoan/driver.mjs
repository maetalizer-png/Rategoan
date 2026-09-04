// REPL driver for Rategoan (static PWA, no build step, no framework).
// Drives a headless Chromium against the already-running static server.
// Designed for agents: wrap in tmux, send-keys commands, capture-pane output.
//
// Usage: node .claude/skills/run-rategoan/driver.mjs
// (server must already be running - see SKILL.md "Run (agent path)")

import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import * as readline from 'node:readline';
import * as fs from 'node:fs';
import * as path from 'node:path';

const BASE_URL = process.env.RATEGOAN_URL || 'http://localhost:8099';
const SHOT_DIR = process.env.SCREENSHOT_DIR || '/tmp/shots';
fs.mkdirSync(SHOT_DIR, { recursive: true });

let browser = null;
let page = null;
const consoleErrors = [];

const COMMANDS = {
  async launch() {
    if (browser) return console.log('already launched');
    browser = await chromium.launch({ args: ['--no-sandbox'] });
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    page = await context.newPage();
    page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
    page.on('pageerror', (e) => consoleErrors.push('PAGEERROR: ' + e.message));
    console.log('launched. viewport 390x844 (mobile-first layout).');
  },

  // Rategoan gates every route behind login (js/core/router.js checks
  // auth.state and force-redirects to #login otherwise). There is no
  // real backend auth - login() just writes {method,id,time} to
  // localStorage['rategoan_auth']. Seed it BEFORE the app boots, then
  // reload so router.js picks it up. This is the standard way to reach
  // any screen without clicking through the login UI.
  async auth() {
    if (!page) return console.log('ERROR: launch first');
    await page.goto(BASE_URL + '/index.html');
    await page.evaluate(() => {
      localStorage.setItem('rategoan_auth', JSON.stringify({ method: 'gmail', id: 'agent@test.local', time: Date.now() }));
    });
    await page.goto(BASE_URL + '/index.html');
    await page.waitForTimeout(500);
    console.log('authed + reloaded:', page.url());
  },

  async nav(pathOrUrl) {
    if (!page) return console.log('ERROR: launch first');
    const url = /^https?:\/\//.test(pathOrUrl || '') ? pathOrUrl : BASE_URL + '/' + (pathOrUrl || 'index.html');
    await page.goto(url);
    await page.waitForTimeout(300);
    console.log('nav ->', page.url());
  },

  async ss(name) {
    if (!page) return console.log('ERROR: launch first');
    const f = path.join(SHOT_DIR, (name || `ss-${Date.now()}`) + '.png');
    await page.screenshot({ path: f });
    console.log('screenshot:', f);
  },

  async click(sel) {
    if (!page) return console.log('ERROR: launch first');
    try { await page.click(sel, { timeout: 5000 }); console.log('click', sel, '-> OK'); }
    catch (e) { console.log('click', sel, '-> ERROR:', e.message.split('\n')[0]); }
  },

  async 'click-text'(text) {
    if (!page) return console.log('ERROR: launch first');
    const r = await page.evaluate((t) => {
      const els = [...document.querySelectorAll('button, a, [role="button"]')];
      const el = els.find((e) => e.textContent?.trim() === t) ?? els.find((e) => e.textContent?.includes(t));
      if (!el) return 'NOT_FOUND';
      el.click();
      return 'OK: ' + el.tagName;
    }, text);
    console.log('click-text', JSON.stringify(text), '->', r);
  },

  async fill(args) {
    if (!page) return console.log('ERROR: launch first');
    const sp = args.indexOf(' ');
    const sel = sp === -1 ? args : args.slice(0, sp);
    const val = sp === -1 ? '' : args.slice(sp + 1);
    try { await page.fill(sel, val); console.log('fill', sel, '<-', JSON.stringify(val)); }
    catch (e) { console.log('fill', sel, '-> ERROR:', e.message.split('\n')[0]); }
  },

  async type(text) { if (page) await page.keyboard.type(text, { delay: 20 }); },
  async press(key) { if (page) await page.keyboard.press(key); },

  async wait(sel) {
    if (!page) return console.log('ERROR: launch first');
    try { await page.waitForSelector(sel, { timeout: 10_000 }); console.log('found:', sel); }
    catch { console.log('TIMEOUT:', sel); }
  },

  async eval(expr) {
    if (!page) return console.log('ERROR: launch first');
    try { console.log(JSON.stringify(await page.evaluate(expr))); }
    catch (e) { console.log('ERROR:', e.message.split('\n')[0]); }
  },

  async text(sel) {
    if (!page) return console.log('ERROR: launch first');
    console.log(await page.evaluate((s) => (s ? document.querySelector(s) : document.body)?.innerText ?? '(null)', sel || null));
  },

  async setfile(args) {
    // setfile <selector> <absolute-path> - attach a file to an <input type=file>
    if (!page) return console.log('ERROR: launch first');
    const sp = args.indexOf(' ');
    const sel = args.slice(0, sp);
    const file = args.slice(sp + 1);
    try { await page.setInputFiles(sel, file); console.log('setfile', sel, '<-', file); }
    catch (e) { console.log('setfile -> ERROR:', e.message.split('\n')[0]); }
  },

  async offline(onOff) {
    if (!page) return console.log('ERROR: launch first');
    const on = onOff !== 'off';
    await page.context().setOffline(on);
    console.log('offline:', on);
  },

  console() {
    console.log('console errors so far (' + consoleErrors.length + '):');
    consoleErrors.slice(-20).forEach((e) => console.log(' -', e));
  },

  async quit() { if (browser) await browser.close().catch(() => {}); browser = null; page = null; },
  help() { console.log('commands:', Object.keys(COMMANDS).join(', ')); },
};

const rl = readline.createInterface({ input: process.stdin, output: process.stdout, prompt: 'driver> ' });

rl.on('line', async (line) => {
  const sp = line.indexOf(' ');
  const cmd = sp === -1 ? line.trim() : line.slice(0, sp);
  const rest = sp === -1 ? '' : line.slice(sp + 1);
  if (!cmd) return rl.prompt();
  const fn = COMMANDS[cmd];
  if (!fn) { console.log('unknown:', cmd, '- try: help'); return rl.prompt(); }
  try { await fn(rest); } catch (e) { console.log('ERROR:', e.message); }
  if (cmd === 'quit') { rl.close(); process.exit(0); }
  rl.prompt();
});
rl.on('close', async () => { await COMMANDS.quit(); process.exit(0); });

console.log('Rategoan driver - "help" for commands, "launch" then "auth" to start');
rl.prompt();
