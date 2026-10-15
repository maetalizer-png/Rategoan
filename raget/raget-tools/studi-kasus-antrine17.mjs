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
  return new Promise((resolve) => srv.listen(0, '0.0.0.0', () => resolve(srv)));
}

const srv = await startServer();
const port = srv.address().port;
const baseUrl = 'http://127.0.0.2:' + port;
const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });

try {
  const consoleErrors = [];

  // 1. Desktop 1366x768 Login Card Centering Audit (Note #5)
  const desktopLogin = await browser.newPage({ viewport: { width: 1366, height: 768 } });
  desktopLogin.on('pageerror', (err) => consoleErrors.push(String(err)));
  await desktopLogin.goto(baseUrl + '/index.html#/login', { waitUntil: 'networkidle' });
  await desktopLogin.waitForSelector('#login-content', { timeout: 15000 });
  const desktopLoginAudit = await desktopLogin.evaluate(() => {
    const card = document.getElementById('login-content');
    const app = document.getElementById('app');
    const cs = getComputedStyle(document.body);
    const rect = card.getBoundingClientRect();
    const appRect = app.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    return {
      gridTemplateAreas: cs.gridTemplateAreas,
      appWidth: Math.round(appRect.width),
      cardLeft: Math.round(rect.left),
      cardWidth: Math.round(rect.width),
      cardCenterX: Math.round(centerX),
      viewportCenterX: 1366 / 2,
      centerDeltaPx: Math.abs(Math.round(centerX - 1366 / 2)),
    };
  });

  // 2. Mobile 390x844 Grok-Style Borderless Thinking & Blue Dot Audit (Notes #3 & #4)
  const phone = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  phone.on('pageerror', (err) => consoleErrors.push(String(err)));
  await phone.addInitScript(() => {
    try {
      localStorage.setItem('rategoan_auth', JSON.stringify({ method: 'gmail', id: 'maetalizer@gmail.com', time: Date.now() }));
    } catch (e) { /* ignore */ }
  });
  await phone.goto(baseUrl + '/index.html#/chat', { waitUntil: 'networkidle' });
  await phone.waitForSelector('#chat-input', { timeout: 15000 });

  const grokThoughtAudit = await phone.evaluate(async () => {
    const { mountThought, buildDynamicThoughts } = await import('/js/ui/thought-card.js');
    const msgBox = document.getElementById('messages');
    msgBox.style.display = 'flex';
    const host = document.createElement('div');
    host.className = 'msg ai';
    msgBox.appendChild(host);
    const steps = buildDynamicThoughts('cari dokumentasi konektor github', { websearch: true });
    const box = mountThought(host, steps, 'berjalan');
    const csBox = getComputedStyle(box);
    const summary = box.querySelector('summary');
    const csSummary = getComputedStyle(summary);
    const dot = box.querySelector('.thought-dot.zen-dot');
    const csDot = getComputedStyle(dot);
    const defaultCollapsed = box.open === false;
    const dotBorderRadius = csDot.borderRadius;
    const boxBorderStyle = csBox.borderTopStyle;
    const boxBackground = csBox.backgroundColor;
    const summaryBackground = csSummary.backgroundColor;
    summary.click();
    const expandedAfterClick = box.open === true;
    const csBoxOpen = getComputedStyle(box);
    const boxOpenBackground = csBoxOpen.backgroundColor;
    const boxOpenBoxShadow = csBoxOpen.boxShadow;
    const initialLiveIdx = Array.from(box.querySelectorAll('.stepper-node')).findIndex((el) => el.classList.contains('is-live'));
    window.dispatchEvent(new CustomEvent('rategoan:neural-step', { detail: { doneLayers: 12, totalLayers: 28, phase: 'prefill' } }));
    const midLiveIdx = Array.from(box.querySelectorAll('.stepper-node')).findIndex((el) => el.classList.contains('is-live'));
    window.dispatchEvent(new CustomEvent('rategoan:neural-step', { detail: { doneLayers: 26, totalLayers: 28, phase: 'prefill' } }));
    const finalLiveIdx = Array.from(box.querySelectorAll('.stepper-node')).findIndex((el) => el.classList.contains('is-live'));
    const nodeTexts = Array.from(box.querySelectorAll('.stepper-copy')).map((el) => el.textContent.trim());
    const hasJargon = nodeTexts.some((t) => /BPE|INT4|vektor 384-dim/i.test(t));
    const doneBox = mountThought(host, steps, 'selesai');
    const doneLabel = doneBox.querySelector('.thought-summary-label').textContent.trim();
    host.remove();
    return {
      defaultCollapsed,
      expandedAfterClick,
      hasBlueDot: !!dot,
      dotBorderRadius,
      boxBorderStyle,
      boxBackground,
      boxOpenBackground,
      boxOpenBoxShadow,
      summaryBackground,
      initialLiveIdx,
      midLiveIdx,
      finalLiveIdx,
      nodeTexts,
      hasJargon,
      doneLabel,
    };
  });

  // 2B. Live Reproduction & Verification of Bug #1 (Stop button / in-flight generation leaking into New Chat) & Bug #2 (Keyboard draft text leaking into New Chat)
  const newChatIsolationAudit = await phone.evaluate(async () => {
    const inp = document.getElementById("chat-input");
    const msgBox = document.getElementById("messages");
    // Simulate active generation (Stop button active) + in-flight typing indicator + user typing draft text in #chat-input
    document.body.classList.add("is-generating");
    const fakeTyping = document.createElement("div");
    fakeTyping.className = "msg ai typing";
    fakeTyping.textContent = "Sedang mengetik balasan lama...";
    msgBox.appendChild(fakeTyping);

    inp.value = "Tulisan ketikan lama di keyboard yang belum dikirim";
    inp.dispatchEvent(new Event("input"));
    const beforeNewChat = {
      isGenerating: document.body.classList.contains("is-generating"),
      hasDraft: document.body.classList.contains("has-draft"),
      inputVal: inp.value,
    };

    // Click New Chat button (#btn-new-chat-top)
    document.getElementById("btn-new-chat-top").click();

    const afterTopNewChat = {
      isGenerating: document.body.classList.contains("is-generating"),
      hasDraft: document.body.classList.contains("has-draft"),
      inputVal: inp.value,
      remainingMessages: msgBox.querySelectorAll(".msg").length,
    };

    // Also test sidebar #btn-new-chat
    document.body.classList.add("is-generating");
    inp.value = "Ketikan kedua di sidebar";
    inp.dispatchEvent(new Event("input"));
    document.getElementById("btn-new-chat").click();

    const afterSidebarNewChat = {
      isGenerating: document.body.classList.contains("is-generating"),
      hasDraft: document.body.classList.contains("has-draft"),
      inputVal: inp.value,
      remainingMessages: msgBox.querySelectorAll(".msg").length,
    };

    return { beforeNewChat, afterTopNewChat, afterSidebarNewChat };
  });

  // 2C. Live Verification of Bug #3: Cross-Page Model Download Auto-Resume (index.html -> studio.html -> index.html) without needing to click Batal
  const crossPageDownloadAudit = await phone.evaluate(async () => {
    const { neuralProvider } = await import("/raget/raget-neural/neural-provider.js");
    const { WEIGHT_SPEC } = await import("/raget/raget-neural/runtime/weight-cache.js");
    localStorage.removeItem("rategoan_weights_1_5b_installed");
    localStorage.setItem("rategoan_weights_downloading", "1");
    localStorage.setItem("rategoan_chunks_mask:" + WEIGHT_SPEC.revision, "1,1,1,0,0");
    let progressEvents = 0;
    const onProg = () => { progressEvents += 1; };
    window.addEventListener("rategoan:neural-progress", onProg);
    const resumedBytes = await neuralProvider.resumeProgress();
    window.removeEventListener("rategoan:neural-progress", onProg);
    neuralProvider.cancelWeights();
    return {
      resumedBytes,
      progressEvents,
      autoTriggered: resumedBytes > 0 && progressEvents >= 1,
    };
  });


  // 2D. Desktop (1366x768) & Mobile (390x844) Download Bar Layout & Live Streaming Progress Audit (DOD-41.17)
  const deskChat = await browser.newPage({ viewport: { width: 1366, height: 768 } });
  deskChat.on("pageerror", (err) => consoleErrors.push(String(err)));
  await deskChat.addInitScript(() => {
    try {
      localStorage.setItem("rategoan_auth", JSON.stringify({ method: "gmail", id: "maetalizer@gmail.com", time: Date.now() }));
      localStorage.removeItem("rategoan_weights_1_5b_installed");
    } catch (e) { /* ignore */ }
  });
  await deskChat.route("**/*", (route) => {
    if (route.request().url().includes("huggingface.co")) return route.abort();
    return route.continue();
  });
  await deskChat.goto(baseUrl + "/index.html#/chat", { waitUntil: "networkidle" });
  await deskChat.waitForSelector("#weight-card", { timeout: 15000 });

  const desktopDownloadLayoutAudit = await deskChat.evaluate(() => {
    const bar = document.getElementById("top-download-bar");
    const card = document.getElementById("weight-card");
    const hero = document.querySelector("#empty-state .empty-brand");
    const comp = document.getElementById("composer");
    bar.hidden = false;
    card.hidden = false;
    const barRect = bar.getBoundingClientRect();
    const cardRect = card.getBoundingClientRect();
    const heroRect = hero.getBoundingClientRect();
    const compRect = comp.getBoundingClientRect();
    const idleCardWidthMatchesBar = Math.abs(cardRect.width - barRect.width) <= 2;
    const barAlignedWithComposer = Math.abs((barRect.left + barRect.width / 2) - (compRect.left + compRect.width / 2)) <= 2;
    const gapToHeroPx = Math.round(heroRect.top - barRect.bottom);

    // Simulate active streaming at 3.5 MB/s where committedVerifiedBytes is still 0 but visibleLoaded is 3.5 MB
    window.dispatchEvent(new CustomEvent("rategoan:neural-progress", {
      detail: {
        loaded: Math.round(3.5 * 1024 * 1024),
        visibleLoaded: Math.round(3.5 * 1024 * 1024),
        committedVerifiedBytes: 0,
        total: 1045697920,
        speed: 3.5 * 1024 * 1024,
        eta: 295,
      },
    }));

    const busyCardRect = card.getBoundingClientRect();
    const trackRect = document.getElementById("weight-bar").getBoundingClientRect();
    const fillStyleWidth = document.getElementById("weight-fill").style.width;
    const busyStatusText = document.getElementById("weight-status").textContent.trim();

    return {
      barWidth: Math.round(barRect.width),
      idleCardWidth: Math.round(cardRect.width),
      busyCardWidth: Math.round(busyCardRect.width),
      idleCardWidthMatchesBar,
      busyCardWidthMatchesBar: Math.abs(busyCardRect.width - barRect.width) <= 2,
      barAlignedWithComposer,
      gapToHeroPx,
      trackWidthPx: Math.round(trackRect.width),
      fillStyleWidth,
      busyStatusText,
      showsNonZeroPercentOnStream: !busyStatusText.startsWith("0% ") && parseFloat(fillStyleWidth) >= 1.5,
    };
  });
  await deskChat.screenshot({ path: "/tmp/desktop-download-busy.png" });
  await deskChat.click("#btn-weight-cancel");
  await deskChat.screenshot({ path: "/tmp/desktop-download-cancelled.png" });

  // 3. Desktop 1366x768 Studio Kode Full Live Audit:
  //    - #btn-model next to #btn-plus & #model-sheet switching (Cepat / Mendalam)
  //    - "kerja" & "lanjutkan" execution with Raget 1.0 & Auto-Follow Split Canvas
  //    - Multi-file creation ("buat modul components/kartu.js")
  //    - Hunk Accept / Reject (#hunk-stage)
  //    - Interactive VFS CLI Terminal (#terminal-form: ls, python /main.py)
  //    - Live Dokumen (#living-doc SVG) & Live Spreadsheet (#living-sheet Table & Bars)
  const studioPage = await browser.newPage({ viewport: { width: 1366, height: 768 } });
  studioPage.on('pageerror', (err) => consoleErrors.push(String(err)));
  await studioPage.addInitScript(() => {
    try {
      localStorage.setItem('rategoan_auth', JSON.stringify({ method: 'gmail', id: 'maetalizer@gmail.com', time: Date.now() }));
    } catch (e) { /* ignore */ }
  });
  await studioPage.goto(baseUrl + '/studio.html', { waitUntil: 'networkidle' });
  await studioPage.waitForSelector('#btn-model', { timeout: 15000 });

  const studioLayoutAudit = await studioPage.evaluate(() => {
    const plus = document.getElementById('btn-plus');
    const model = document.getElementById('btn-model');
    const input = document.getElementById('chat-input');
    const plusRect = plus.getBoundingClientRect();
    const modelRect = model.getBoundingClientRect();
    const inputRect = input.getBoundingClientRect();
    return {
      hasBtnModel: !!model,
      modelNextToPlus: modelRect.left >= plusRect.right - 2 && modelRect.left < inputRect.left,
      plusRect: { left: Math.round(plusRect.left), right: Math.round(plusRect.right), top: Math.round(plusRect.top) },
      modelRect: { left: Math.round(modelRect.left), right: Math.round(modelRect.right), top: Math.round(modelRect.top) },
      initialStatModel: document.getElementById('stat-model').textContent.trim(),
    };
  });

  // Click #btn-model to open #model-sheet and switch from Cepat to Mendalam
  await studioPage.click('#btn-model');
  await studioPage.waitForSelector('#model-sheet:not([hidden]) .model-speed', { timeout: 10000 });
  await studioPage.click('#model-sheet .model-speed');
  await studioPage.waitForSelector('#model-sheet .model-speed-menu .model-item', { timeout: 10000 });
  const studioModelSheetAudit = await studioPage.evaluate(() => {
    const sheet = document.getElementById('model-sheet');
    const title = sheet.querySelector('.model-solo strong')?.textContent.trim() || '';
    const options = Array.from(sheet.querySelectorAll('.model-speed-menu .model-item strong')).map((el) => el.textContent.trim());
    const items = sheet.querySelectorAll('.model-speed-menu .model-item');
    if (items[1]) items[1].click(); // Select Mendalam
    return {
      sheetOpen: !sheet.hidden,
      modelTitle: title,
      options,
      statModelAfterSwitch: document.getElementById('stat-model').textContent.trim(),
    };
  });
  await studioPage.click('#model-close');

  // Execute "kerja", "lanjutkan", and "buat modul components/kartu.js"
  await studioPage.fill('#chat-input', 'kerja');
  await studioPage.click('#btn-studio-send');
  await studioPage.waitForFunction(() => {
    const msgs = Array.from(document.querySelectorAll('#messages .msg.ai')).map((el) => el.textContent.trim());
    return msgs.length >= 1 && msgs[0].length > 0;
  }, { timeout: 15000 });

  await studioPage.fill('#chat-input', 'lanjutkan');
  await studioPage.click('#btn-studio-send');
  await studioPage.waitForFunction(() => {
    const msgs = Array.from(document.querySelectorAll('#messages .msg.ai')).map((el) => el.textContent.trim());
    return msgs.length >= 2 && msgs[1].length > 0;
  }, { timeout: 15000 });

  await studioPage.fill('#chat-input', 'buat modul components/kartu.js');
  await studioPage.click('#btn-studio-send');
  await studioPage.waitForFunction(() => {
    const msgs = Array.from(document.querySelectorAll('#messages .msg.ai')).map((el) => el.textContent.trim());
    return msgs.length >= 3 && msgs[2].length > 0;
  }, { timeout: 15000 });

  // Test Hunk Accept, Dokumen tab, Spreadsheet tab, and Interactive CLI Terminal + capture screenshots
  await studioPage.click('.tab-btn[data-tab="preview"]');
  await studioPage.screenshot({ path: '/tmp/studio-tab-preview.png' });
  await studioPage.click('.tab-btn[data-tab="files"]');
  await studioPage.click('#hunk-stage .hunk-accept');
  await studioPage.screenshot({ path: '/tmp/studio-tab-files.png' });
  await studioPage.click('.tab-btn[data-tab="dokumen"]');
  await studioPage.screenshot({ path: '/tmp/studio-tab-dokumen.png' });
  await studioPage.click('.tab-btn[data-tab="sheet"]');
  await studioPage.screenshot({ path: '/tmp/studio-tab-sheet.png' });
  await studioPage.click('.tab-btn[data-tab="logs"]');
  await studioPage.fill('#terminal-input', 'ls');
  await studioPage.click('#btn-terminal-run');
  await studioPage.fill('#terminal-input', 'python /main.py');
  await studioPage.click('#btn-terminal-run');
  await studioPage.screenshot({ path: '/tmp/studio-tab-logs.png' });

  const studioExecutionAudit = await studioPage.evaluate(() => {
    const aiMsgs = Array.from(document.querySelectorAll('#messages .msg.ai')).map((el) => el.textContent.trim());
    const rejected = aiMsgs.some((m) => /tidak memuat perintah rekayasa/i.test(m));
    const consoleText = document.getElementById('console-output')?.textContent || '';
    const vfsButtons = Array.from(document.querySelectorAll('#vfs-tree button')).map((b) => b.textContent.trim());
    const hasDocSvg = !!document.querySelector('#living-doc svg');
    const sheetRows = document.querySelectorAll('#living-sheet .living-sheet-table tbody tr').length;
    const sheetBars = document.querySelectorAll('#living-sheet .living-bar-fill').length;
    const hunkDecision = document.querySelector('#hunk-stage .hunk-accept')?.dataset.decision || '';
    return {
      aiMsgs,
      rejected,
      hasRagetModelLog: /Model → Raget 1\.0/i.test(consoleText),
      hasCommitLog: /Commit /i.test(consoleText),
      hasHunkAcceptedLog: /Hunk diterima pada/i.test(consoleText),
      hasCliLsOutput: /\/components\/kartu\.js/.test(consoleText),
      hasCliPythonOutput: /halo/.test(consoleText),
      vfsButtons,
      hasDocSvg,
      sheetRows,
      sheetBars,
      hunkDecision,
    };
  });

  const report = {
    ok: consoleErrors.length === 0
      && desktopLoginAudit.centerDeltaPx <= 2
      && desktopLoginAudit.appWidth === 1366
      && grokThoughtAudit.defaultCollapsed === true
      && grokThoughtAudit.expandedAfterClick === true
      && grokThoughtAudit.hasBlueDot === true
      && grokThoughtAudit.boxBorderStyle === 'none'
      && grokThoughtAudit.boxBackground === 'rgba(0, 0, 0, 0)'
      && grokThoughtAudit.boxOpenBackground === 'rgba(0, 0, 0, 0)'
      && grokThoughtAudit.boxOpenBoxShadow === 'none'
      && grokThoughtAudit.initialLiveIdx === 0
      && grokThoughtAudit.midLiveIdx === 1
      && grokThoughtAudit.finalLiveIdx === 2
      && grokThoughtAudit.hasJargon === false
      && grokThoughtAudit.doneLabel.startsWith('Berpikir selama ')
      && studioLayoutAudit.hasBtnModel === true
      && studioLayoutAudit.modelNextToPlus === true
      && studioModelSheetAudit.sheetOpen === true
      && studioModelSheetAudit.modelTitle === 'Raget 1.0'
      && studioModelSheetAudit.options.join(',') === 'Rendah,Tinggi'
      && studioModelSheetAudit.statModelAfterSwitch === 'Raget 1.0 · Tinggi'
      && studioExecutionAudit.rejected === false
      && studioExecutionAudit.aiMsgs.length === 3
      && studioExecutionAudit.hasRagetModelLog === true
      && studioExecutionAudit.hasCommitLog === true
      && studioExecutionAudit.hasHunkAcceptedLog === true
      && studioExecutionAudit.hasCliLsOutput === true
      && studioExecutionAudit.hasCliPythonOutput === true
      && studioExecutionAudit.vfsButtons.includes('/components/kartu.js')
      && studioExecutionAudit.hasDocSvg === true
      && studioExecutionAudit.sheetRows >= 5
      && studioExecutionAudit.sheetBars >= 5
      && newChatIsolationAudit.beforeNewChat.isGenerating === true
      && newChatIsolationAudit.beforeNewChat.hasDraft === true
      && newChatIsolationAudit.afterTopNewChat.isGenerating === false
      && newChatIsolationAudit.afterTopNewChat.hasDraft === false
      && newChatIsolationAudit.afterTopNewChat.inputVal === ""
      && newChatIsolationAudit.afterTopNewChat.remainingMessages === 0
      && newChatIsolationAudit.afterSidebarNewChat.isGenerating === false
      && newChatIsolationAudit.afterSidebarNewChat.hasDraft === false
      && newChatIsolationAudit.afterSidebarNewChat.inputVal === ""
      && crossPageDownloadAudit.autoTriggered === true
      && desktopDownloadLayoutAudit.idleCardWidthMatchesBar === true
      && desktopDownloadLayoutAudit.busyCardWidthMatchesBar === true
      && desktopDownloadLayoutAudit.barAlignedWithComposer === true
      && desktopDownloadLayoutAudit.gapToHeroPx >= 24
      && desktopDownloadLayoutAudit.trackWidthPx >= 200
      && desktopDownloadLayoutAudit.showsNonZeroPercentOnStream === true,
    desktopLoginAudit,
    grokThoughtAudit,
    newChatIsolationAudit,
    crossPageDownloadAudit,
    desktopDownloadLayoutAudit,
    studioLayoutAudit,
    studioModelSheetAudit,
    studioExecutionAudit,
    consoleErrors,
  };
  console.log(JSON.stringify(report, null, 2));
  if (!report.ok) process.exitCode = 1;
} finally {
  await browser.close();
  srv.close();
}
