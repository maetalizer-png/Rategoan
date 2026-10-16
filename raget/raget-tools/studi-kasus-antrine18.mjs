import http from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { extname } from 'node:path';
import { chromium } from 'playwright';

const root = new URL('../../', import.meta.url);

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.jsonl': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.woff2': 'font/woff2',
  '.webmanifest': 'application/manifest+json',
};

function startServer() {
  const srv = http.createServer((req, res) => {
    const clean = (req.url || '/').split('?')[0];
    const rel = clean === '/' ? 'index.html' : clean.replace(/^\/+/, '');
    const file = new URL(rel, root);
    if (!existsSync(file) || statSync(file).isDirectory()) {
      res.writeHead(404);
      res.end('404');
      return;
    }
    res.writeHead(200, { 'Content-Type': TYPES[extname(rel)] || 'application/octet-stream' });
    res.end(readFileSync(file));
  });
  return new Promise((resolve) => srv.listen(0, '127.0.0.1', () => resolve(srv)));
}

const srv = await startServer();
const port = srv.address().port;
const baseUrl = 'http://127.0.0.1:' + port;
const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });

try {
  const consoleErrors = [];
  const phone = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  phone.on('pageerror', (err) => consoleErrors.push(String(err)));
  await phone.addInitScript(() => {
    try {
      localStorage.setItem('rategoan_auth', JSON.stringify({ method: 'gmail', id: 'maetalizer@gmail.com', time: Date.now() }));
      localStorage.setItem('rategoan_weights_1_5b_installed', 'true');
    } catch (e) {
      void e;
    }
  });

  await phone.goto(baseUrl + '/index.html#/chat', { waitUntil: 'networkidle' });
  await phone.waitForSelector('#composer-card', { timeout: 15000 });

  const mobileChatIdleAudit = await phone.evaluate(() => {
    const vc = document.getElementById('view-chat');
    const msg = document.getElementById('messages');
    const comp = document.getElementById('composer');
    const card = document.getElementById('composer-card');
    const insp = document.getElementById('chat-inspiration');
    const bar = document.getElementById('top-download-bar');
    bar.hidden = false;
    const vcRect = vc.getBoundingClientRect();
    const msgRect = msg.getBoundingClientRect();
    const compRect = comp.getBoundingClientRect();
    const cardRect = card.getBoundingClientRect();
    const csComp = getComputedStyle(comp);
    const csInsp = getComputedStyle(insp);
    return {
      composerBg: csComp.backgroundColor,
      composerBorder: csComp.borderTopStyle,
      composerBoxShadow: csComp.boxShadow,
      composerBottomGapPx: Math.round(vcRect.bottom - cardRect.bottom),
      messagesFitsInsideViewChat: msgRect.bottom <= vcRect.bottom + 1,
      inspirationVisibleOnMobile: csInsp.display === 'grid',
      inspirationCardsCount: insp.querySelectorAll('.chat-insp-card').length,
      compLeft: Math.round(compRect.left),
      compWidth: Math.round(compRect.width),
    };
  });

  const mobileKeyboardAudit = await phone.evaluate(() => {
    const vv = window.visualViewport;
    Object.defineProperty(vv, 'height', { configurable: true, get: () => 500 });
    vv.dispatchEvent(new Event('resize'));
    const vc = document.getElementById('view-chat');
    const comp = document.getElementById('composer');
    const card = document.getElementById('composer-card');
    const vcRect = vc.getBoundingClientRect();
    const cardRect = card.getBoundingClientRect();
    const csComp = getComputedStyle(comp);
    const out = {
      keyboardOpenClass: document.body.classList.contains('keyboard-open'),
      composerBg: csComp.backgroundColor,
      composerPaddingBottom: csComp.paddingBottom,
      gapAboveKeyboardPx: Math.round(vcRect.bottom - cardRect.bottom),
    };
    Object.defineProperty(vv, 'height', { configurable: true, get: () => 844 });
    vv.dispatchEvent(new Event('resize'));
    return out;
  });

  await phone.click('#btn-chat-more');
  await phone.waitForSelector('#chat-options-menu:not([hidden]) button[data-act="cowork"]', { timeout: 10000 });
  await phone.click('#chat-options-menu button[data-act="cowork"]');
  const coworkAudit = await phone.evaluate(() => {
    const panel = document.getElementById('cowork');
    const editor = document.getElementById('cowork-editor');
    editor.textContent = '<script>window.__xss_executed = true;</script>Naskah Uji Antrine 18';
    return {
      coworkOpenedFromMenu: panel && !panel.hidden,
      editorText: editor.textContent,
      xssExecuted: !!window.__xss_executed,
    };
  });
  await phone.click('#cowork-close');

  await phone.goto(baseUrl + '/index.html#/collection', { waitUntil: 'networkidle' });
  await phone.waitForSelector('.coll-filters', { timeout: 10000 });
  const collectionAudit = await phone.evaluate(() => {
    const chips = Array.from(document.querySelectorAll('.coll-filter-chip')).map((el) => el.getBoundingClientRect());
    const maxRight = Math.max(...chips.map((r) => Math.round(r.right)));
    return {
      chipCount: chips.length,
      maxRightPx: maxRight,
      fitsWithin390Px: maxRight <= 390,
    };
  });

  await phone.goto(baseUrl + '/index.html#/project', { waitUntil: 'networkidle' });
  await phone.waitForSelector('.project-templates', { timeout: 10000 });
  const projectAudit = await phone.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('.project-templates button')).map((el) => el.getBoundingClientRect());
    const maxRight = Math.max(...btns.map((r) => Math.round(r.right)));
    return {
      templateCount: btns.length,
      maxRightPx: maxRight,
      fitsWithin390Px: maxRight <= 390,
    };
  });

  await phone.goto(baseUrl + '/studio.html', { waitUntil: 'networkidle' });
  await phone.waitForSelector('#composer-card', { timeout: 15000 });
  const studioMobileAudit = await phone.evaluate(() => {
    const comp = document.getElementById('composer');
    const card = document.getElementById('composer-card');
    const csComp = getComputedStyle(comp);
    const cardRect = card.getBoundingClientRect();
    return {
      composerBg: csComp.backgroundColor,
      cardWidth: Math.round(cardRect.width),
      cardHeight: Math.round(cardRect.height),
      gapBottomPx: Math.round(window.innerHeight - cardRect.bottom),
    };
  });

  const report = {
    ok: consoleErrors.length === 0
      && mobileChatIdleAudit.composerBg === 'rgba(0, 0, 0, 0)'
      && mobileChatIdleAudit.composerBottomGapPx <= 8
      && mobileChatIdleAudit.messagesFitsInsideViewChat === true
      && mobileChatIdleAudit.inspirationVisibleOnMobile === true
      && mobileChatIdleAudit.inspirationCardsCount === 4
      && mobileKeyboardAudit.keyboardOpenClass === true
      && mobileKeyboardAudit.composerBg === 'rgba(0, 0, 0, 0)'
      && mobileKeyboardAudit.gapAboveKeyboardPx <= 8
      && coworkAudit.coworkOpenedFromMenu === true
      && coworkAudit.xssExecuted === false
      && collectionAudit.fitsWithin390Px === true
      && projectAudit.fitsWithin390Px === true
      && studioMobileAudit.composerBg === 'rgba(0, 0, 0, 0)'
      && studioMobileAudit.cardWidth >= 340,
    mobileChatIdleAudit,
    mobileKeyboardAudit,
    coworkAudit,
    collectionAudit,
    projectAudit,
    studioMobileAudit,
    consoleErrors,
  };
  console.log(JSON.stringify(report, null, 2));
  if (!report.ok) process.exitCode = 1;
} finally {
  await browser.close();
  srv.close();
}
