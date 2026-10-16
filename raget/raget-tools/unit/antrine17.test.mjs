import { hasXmlEntityBomb, sanitizeSvgContent, isSafeZipEntryPath, classifyFileMeta, formatBytesLabel, MAX_ATTACH_BYTES, MAX_ATTACH_TEXT_CHARS } from '../../../js/sheets/attach.js';
import { extractPdfText } from '../../../shared/pdf-extract.js';
import { summarizeMultiAttachments } from '../../../shared/file-summary.js';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { downloadConcurrentChunks, MODEL_CHUNK } from '../../raget-neural/runtime/model-downloader.js';
import { gemvFusedInt4, buildAnchorSet, shouldPinTensor, openInt4Stream, buildRopeFreqs, applyRoPE, pickToken } from '../../raget-neural/runtime/int4-session.js';
import { bpeShell } from '../../raget-neural/bpe-shell.js';
import { buildDynamicThoughts, laneOf } from '../../../js/ui/thought-card.js';
import { craftInstruction, shouldSynthesize, isWorkspaceContinuation } from '../../../js/studio/studio-agent.js';
import { synthesizeCode, parseFenceFiles, parseSurgicalBlocks } from '../../../js/studio/neural-synthesizer.js';
import { collectPreview } from '../../../js/studio/sandbox-runner.js';
import { runTerminal, execStudioCli } from '../../../js/studio/wasm-terminal.js';
import { createVfs } from '../../../js/studio/vfs.js';
import { VfsGit } from '../../../js/studio/vfs-git.js';
import { pySandbox } from '../../../vault/code/py-sandbox.js';
import { jsSandbox } from '../../../vault/code/js-sandbox.js';
import { rawEmail } from '../../../api/connectors/gmail.js';
import { cleanDriveId } from '../../../api/connectors/drive.js';
import { ipIsPrivate, scrubProtoKeys } from '../../../api/_http.js';
import { issueConfirmChallenge, verifyConfirm } from '../../../api/confirm-challenge.js';
import { cleanCalendarId } from '../../../api/connectors/calendar.js';
import { safeMarkdownHref, markdown } from '../../../shared/markdown.js';
import { resolveLocalProductivityTool, runConnectorTool } from '../../../js/connectors/tool-card.js';
import { cleanGitBranch } from '../../../api/connectors/github.js';
import { decodeDuckLink } from '../../../api/connectors/web/search.js';
import { generateSecureOtp6 } from '../../../js/account/login.js';

const root = new URL('../../../', import.meta.url);
function read(rel) { return readFileSync(new URL(rel, root), 'utf8'); }

test('DOD-41.01 prefetch paralel tetap aktif pada concurrency 4 tanpa memblokir aliran OPFS', async () => {
  const down = read('raget/raget-neural/runtime/model-downloader.js');
  const worker = read('raget/raget-neural/runtime/opfs-writer-worker.js');
  assert.match(down, /const maxPrimed = concurrency \+ PREFETCH_AHEAD/);
  assert.equal(down.includes('primed.size < 4'), false);
  assert.equal(worker.includes('dirtyChunks >= 16'), false);
  assert.match(worker, /function hashWindow\(bytes\)/);
  assert.match(worker, /65536/);

  const size = MODEL_CHUNK * 8;
  const marks = [];
  const diskWrite = async (_cache, key) => {
    marks.push({ kind: 'put-start', key, at: Date.now() });
    await new Promise((resolve) => setTimeout(resolve, 35));
    marks.push({ kind: 'put-end', key, at: Date.now() });
  };
  const fetchImpl = async (_url, init) => {
    const header = init.headers.Range;
    marks.push({ kind: 'fetch', header, at: Date.now() });
    const pair = header.replace('bytes=', '').split('-').map(Number);
    return {
      status: 206,
      headers: { get: (name) => (String(name).toLowerCase() === 'content-range' ? ('bytes ' + pair[0] + '-' + pair[1] + '/' + size) : '') },
      arrayBuffer: async () => new Uint8Array(pair[1] - pair[0] + 1).buffer,
    };
  };
  const out = await downloadConcurrentChunks({
    url: 'https://model.local/antrine17.bin',
    size,
    fetchImpl,
    diskWrite,
    concurrency: 4,
  });
  assert.equal(out.parts, 8);
  const put0End = marks.find((row) => row.kind === 'put-end' && row.key.includes('#0-'));
  const fetch4 = marks.find((row) => row.kind === 'fetch' && row.header.startsWith('bytes=' + (MODEL_CHUNK * 4) + '-'));
  assert.ok(put0End && fetch4, 'partisi ke-4 harus diprefetch saat concurrency=4');
  assert.ok(fetch4.at < put0End.at, 'fetch partisi ke-4 harus mulai sebelum tulis disk partisi ke-0 selesai');
});

test('DOD-41.02 gemvFusedInt4 blockStride mempercepat dekode aliran dan mempertahankan 32 token penuh', () => {
  const sessionSrc = read('raget/raget-neural/runtime/int4-session.js');
  const chatSrc = read('js/chat/chat.js');
  assert.match(sessionSrc, /fastStreamMode/);
  assert.match(sessionSrc, /const maxNew = Math\.max\(1, Math\.min\(128, requested\)\)/);
  assert.equal(sessionSrc.includes('generated.length >= 2'), false);
  assert.match(chatSrc, /Math\.max\(80, Math\.ceil\(text\.length \/ 5\)\)/);
  assert.match(chatSrc, /rafPending/);

  const rows = 64;
  const cols = 2048;
  const packed = new Uint8Array((rows * cols) / 2).fill(0x53);
  const scales = new Float32Array((rows * cols) / 32).fill(0.02);
  const zeros = new Float32Array((rows * cols) / 32).fill(4);
  const x = new Float32Array(cols).fill(0.5);
  const y = new Float32Array(rows);
  const ok = gemvFusedInt4(packed, scales, zeros, rows, cols, x, y, null, null, 16);
  assert.equal(ok, true);
  assert.ok(Number.isFinite(y[0]));
});

test('DOD-41.03 & 41.04 visualisasi proses kerja ala Grok tanpa kartu dengan titik biru zen-dot dan ikon kontekstual', () => {
  const thoughtCard = read('js/ui/thought-card.js');
  const thoughtCss = read('css/ui/thought.css');
  assert.equal(thoughtCard.includes('BPE '), false);
  assert.equal(thoughtCard.includes('INT4 affine'), false);
  assert.equal(thoughtCard.includes('vektor 384-dim'), false);
  assert.equal(thoughtCard.includes('thought-brain-ico'), false);
  assert.equal(thoughtCard.includes('thought-step-badge'), false);
  assert.match(thoughtCard, /zen-dot thought-dot/);
  assert.match(thoughtCard, /Berpikir selama /);
  assert.match(thoughtCss, /border:\s*none\s*!important/);
  assert.match(thoughtCss, /background:\s*transparent\s*!important/);
  assert.match(thoughtCss, /box-shadow:\s*none\s*!important/);
  assert.match(thoughtCss, /-webkit-tap-highlight-color:\s*transparent\s*!important/);

  const webSteps = buildDynamicThoughts('cari berita AI hari ini', { websearch: true });
  assert.ok(webSteps.some((s) => laneOf(s) === 'web'));
  const fileSteps = buildDynamicThoughts('ringkas dokumen ini', { files: 'laporan.pdf' });
  assert.ok(fileSteps.some((s) => laneOf(s) === 'file'));
  const connSteps = buildDynamicThoughts('cek repo github saya', {});
  assert.ok(connSteps.some((s) => laneOf(s) === 'connect'));
  const codeSteps = buildDynamicThoughts('buat fungsi python', {});
  assert.ok(codeSteps.some((s) => laneOf(s) === 'tool'));
  const slideSteps = buildDynamicThoughts('buatkan slide presentasi', {});
  assert.ok(slideSteps.some((s) => laneOf(s) === 'slide'));
});

test('DOD-41.05 kartu login desktop berada di tengah layar (body.auth-gate tidak ditimpa body.no-topbar)', () => {
  const desktopCss = read('css/layout/desktop.css');
  assert.match(desktopCss, /body:not\(\.auth-gate\):has\(#topbar\[hidden\]\)/);
  assert.match(desktopCss, /body\.no-topbar:not\(\.auth-gate\)/);
  assert.match(desktopCss, /body\.auth-gate #sidebar/);
});

test('DOD-41.06 s/d 41.10 lima penguatan keamanan siber P0 Antrine 17', () => {
  const raw = rawEmail({
    to: 'korban@example.com\r\nBcc: penyerang@evil.com',
    subject: 'Judul\r\nX-Injected: 1',
    body: 'Isi pesan aman',
  });
  const decoded = Buffer.from(raw, 'base64url').toString('utf8');
  assert.equal(decoded.includes('\r\nBcc:'), false);
  assert.equal(decoded.includes('\r\nX-Injected:'), false);
  assert.match(decoded, /^To: korban@example\.com Bcc: penyerang@evil\.com\r\n/);

  assert.equal(cleanDriveId("root' or name contains 'rahasia"), 'rootornamecontainsrahasia');
  assert.equal(cleanGitBranch('../../refs/tags/pwn'), 'refs/tags/pwn');
  assert.equal(decodeDuckLink('https://duckduckgo.com/l/?uddg=' + encodeURIComponent('javascript:alert(1)')), '');
  assert.equal(decodeDuckLink('https://duckduckgo.com/l/?uddg=' + encodeURIComponent('https://example.com/aman')), 'https://example.com/aman');

  const otp = generateSecureOtp6();
  assert.match(otp, /^\d{6}$/);
  assert.equal(read('js/account/login.js').includes('Math.random'), false);
  assert.match(read('js/collection/collection.js'), /data-set-tag-id="' \+ escapeHtml\(id\) \+ '"/);
});

test('DOD-41.11 Studio Kode terintegrasi penuh dengan otak Raget 1.0 dan tombol pemilihan model di samping ikon +', async () => {
  const studioHtml = read('studio.html');
  const studioApp = read('js/studio/studio-app.js');
  assert.match(studioHtml, /id="btn-plus"[\s\S]{1,420}id="btn-model"/);
  assert.match(studioHtml, /id="model-sheet"/);
  assert.match(studioApp, /neuralAdapter/);
  assert.match(studioApp, /neuralProvider/);
  assert.match(studioApp, /modelSheet/);
  assert.match(studioApp, /askStudioBrain/);
  assert.match(studioApp, /toggleModelSheet/);

  assert.equal(isWorkspaceContinuation('kerja'), true);
  assert.equal(isWorkspaceContinuation('lanjutkan'), true);
  assert.equal(shouldSynthesize('kerja'), true);
  assert.equal(shouldSynthesize('lanjutkan'), true);
  assert.equal(shouldSynthesize('hvgyfkvhjnn'), false);

  const seed = {
    'index.html': '<!doctype html><html><head><meta charset="utf-8"></head><body><h1>Studio Kode</h1></body></html>\n',
    'style.css': 'body{background:#05080c}\n',
    'script.js': 'console.log("siap");\n',
  };
  const step1 = craftInstruction('kerja', seed);
  assert.equal(step1.ok, true);
  assert.doesNotMatch(step1.reply, /tidak memuat perintah rekayasa/);
  assert.match(step1.files['index.html'], /Ruang Rekayasa Raget 1\.0/);

  const step2 = craftInstruction('lanjutkan', step1.files);
  assert.equal(step2.ok, true);
  assert.doesNotMatch(step2.reply, /tidak memuat perintah rekayasa/);
  assert.match(step2.files['index.html'], /iterasi-status/);

  const synth = await synthesizeCode('buat modul kalkulator pajak', seed, {
    online: false,
    neuralGenerate: async () => 'Analisis kalkulator pajak selesai dirakit.',
  });
  assert.equal(synth.brain, 'Raget 1.0');
  assert.match(synth.reply, /Catatan Raget 1\.0: Analisis kalkulator pajak selesai dirakit\./);
});

test('DOD-41.12 Penyempurnaan 6 Sektor Studio Kode: Multi-Berkas, Surgical Patch, Terminal CLI VFS, Python Sandbox, dan Kanvas Hidup', async () => {
  const seed = {
    'index.html': '<!doctype html><html><head></head><body><h1>App</h1></body></html>\n',
    'style.css': 'body{margin:0}\n',
    'script.js': 'console.log("init");\n',
    'main.py': 'print("halo")\n',
  };
  const modPlan = craftInstruction('buat modul components/kartu.js', seed);
  assert.equal(modPlan.ok, true);
  assert.ok(modPlan.files['/components/kartu.js']);
  assert.match(modPlan.files['script.js'], /import "\.\/components\/kartu\.js"/);

  const bundled = collectPreview(modPlan.files);
  assert.match(bundled['script.js'], /function kartu/);
  assert.doesNotMatch(bundled['script.js'], /\bexport\s+function\b/);

  const fencedMulti = parseFenceFiles('Berikut modul:\n```js:src/helper.js\nexport const X = 42;\n```\n');
  assert.ok(fencedMulti && fencedMulti['src/helper.js']);
  const surgicalRaw = '<<<FILE:index.html>>>\n<<<SEARCH\n<h1>App</h1>\n===\n<h1>App Raget 1.0</h1>\n>>>REPLACE\nSelesai ditambal.';
  const patches = parseSurgicalBlocks(surgicalRaw);
  assert.equal(patches.length, 1);
  const patchedSynth = await synthesizeCode('ubah judul', seed, {
    online: false,
    neuralGenerate: async () => surgicalRaw,
  });
  assert.match(patchedSynth.files['index.html'], /<h1>App Raget 1\.0<\/h1>/);

  const pyPlan = craftInstruction('buat modul python ukur teks', seed);
  const pyOut = await pySandbox.run(pyPlan.files['main.py']);
  assert.equal(pyOut.ok, true);
  assert.equal(pyOut.output, 'byte 6');

  assert.equal(runTerminal('1+2*3'), 7);
  const vfs = createVfs({
    '/index.html': seed['index.html'],
    '/css/style.css': seed['style.css'],
    '/js/script.js': seed['script.js'],
    '/main.py': pyPlan.files['main.py'],
  });
  const git = new VfsGit({
    '/index.html': seed['index.html'],
  });
  git.commit('init');

  const lsRes = await execStudioCli('ls', { vfs, git });
  assert.equal(lsRes.ok, true);
  assert.match(lsRes.output, /\/index\.html/);
  assert.match(lsRes.output, /\/main\.py/);

  const grepRes = await execStudioCli('grep ukur', { vfs, git });
  assert.equal(grepRes.ok, true);
  assert.match(grepRes.output, /\/main\.py/);

  const pyCliRes = await execStudioCli('python /main.py', { vfs, git, pySandbox, jsSandbox });
  assert.equal(pyCliRes.ok, true);
  assert.equal(pyCliRes.output, 'byte 6');

  const touchRes = await execStudioCli('touch /README.md', { vfs, git });
  assert.equal(touchRes.ok, true);
  assert.equal(touchRes.mutated, true);
  assert.equal(vfs.list().includes('/README.md'), true);
});

test('DOD-41.13 Teori Working-Set OPFS int4-session dan Orkestrasi Produktivitas Harian Lokal', async () => {
  const sessionSrc = read('raget/raget-neural/runtime/int4-session.js');
  assert.match(sessionSrc, /buildAnchorSet\(layers\)/);
  assert.match(sessionSrc, /const passes = \(!fastStreamMode \|\| \(isPrefill && needLogits !== false\)\)/);
  assert.match(sessionSrc, /const prefillStride = \(fastStreamMode && d >= 1536\)/);
  assert.match(sessionSrc, /const decodeStride = \(fastStreamMode && d >= 1536\) \? \(Number\(opts\.temperature\) > 0 \? 4 : 8\) : 1/);
  const anchors28 = buildAnchorSet(28);
  assert.deepEqual(Array.from(anchors28), [0, 9, 18, 27]);
  assert.equal(shouldPinTensor('layers.0.attention.Wq', anchors28), true);
  assert.equal(shouldPinTensor('layers.9.ffn.Wdown', anchors28), true);
  assert.equal(shouldPinTensor('layers.18.attention.Wo', anchors28), true);
  assert.equal(shouldPinTensor('layers.27.ffn.Wup', anchors28), true);
  assert.equal(shouldPinTensor('layers.5.attention.Wq', anchors28), false);
  assert.equal(shouldPinTensor('lm_head.weight', anchors28), true);

  const calcTool = resolveLocalProductivityTool('hitung (1500000 * 11 / 100) + 1500000');
  assert.ok(calcTool && calcTool.name === 'math_calculate_expression');
  const calcOut = await runConnectorTool(calcTool.name, calcTool.parameters);
  assert.equal(calcOut.ok, true);
  assert.equal(calcOut.data.value, 1665000);

  const currTool = resolveLocalProductivityTool('konversi 100 USD ke IDR');
  assert.ok(currTool && currTool.name === 'math_currency_converter');
  const currOut = await runConnectorTool(currTool.name, currTool.parameters);
  assert.equal(currOut.ok, true);
  assert.equal(currOut.data.value, 1550000);

  const statTool = resolveLocalProductivityTool('statistik 10, 20, 30, 40, 50');
  assert.ok(statTool && statTool.name === 'math_statistics_summary');
  const statOut = await runConnectorTool(statTool.name, statTool.parameters);
  assert.equal(statOut.ok, true);
  assert.equal(statOut.data.mean, 30);
  assert.equal(statOut.data.median, 30);
  assert.ok(statOut.data.stdDev > 14.14 && statOut.data.stdDev < 14.15);
});

test('DOD-41.14 Isolasi Obrolan Baru (Stop Button & Input Keyboard Reset) serta Auto-Resume Unduhan Lintas-Halaman', () => {
  const chatJs = read('js/chat/chat.js');
  const compJs = read('js/chat/composer.js');
  const histJs = read('js/history/history.js');
  const menuJs = read('js/ui/chat-options-menu.js');
  const provJs = read('raget/raget-neural/neural-provider.js');
  const studioJs = read('js/studio/studio-app.js');

  assert.match(compJs, /resetForNewChat\(\)/);
  assert.match(compJs, /const sendSessionId = s\.id/);
  assert.match(compJs, /startOrAttachDownload/);
  assert.match(chatJs, /const askSessionId = s && s\.id/);
  assert.match(chatJs, /const sessionSwitched = !this\.current\(\)/);
  assert.match(histJs, /composer\.resetForNewChat\(\)/);
  assert.match(menuJs, /composer\.resetForNewChat\(\)/);
  assert.match(provJs, /rategoan_weights_downloading/);
  assert.match(provJs, /if \(isPending && !control\.paused && !control\.cancelled\)/);
  assert.match(studioJs, /neuralProvider\.resumeProgress\(\)/);
});

test('DOD-41.15 Lima Penguatan Keamanan Siber Tingkat Lanjut (Timing-Safe HMAC, IPv6 6to4/NAT64 SSRF, Proto Scrub, Safe Href, Calendar ID)', () => {
  const ccJs = read('api/confirm-challenge.js');
  assert.match(ccJs, /timingSafeEqual/);
  const nonce = issueConfirmChallenge('drive_delete_file', { file_id: '123' }, 1000, 'tok-abc');
  assert.equal(verifyConfirm(nonce, 'drive_delete_file', { file_id: '123' }, 1500, 'tok-abc'), true);
  assert.equal(verifyConfirm(nonce, 'drive_delete_file', { file_id: '123' }, 1500, 'tok-abc'), false);

  assert.equal(ipIsPrivate('2002:7f00:0001::1'), true);
  assert.equal(ipIsPrivate('2002:a9fe:a9fe::1'), true);
  assert.equal(ipIsPrivate('64:ff9b::7f00:1'), true);
  assert.equal(ipIsPrivate('::127.0.0.1'), true);
  assert.equal(ipIsPrivate('ff02::1'), true);
  assert.equal(ipIsPrivate('2001:db8::1'), true);
  assert.equal(ipIsPrivate('2606:4700:4700::1111'), false);

  const polluted = JSON.parse('{"aman":1,"__proto__":{"polluted":true},"nested":{"constructor":{"prototype":{"pwn":1}},"ok":2}}');
  const cleanObj = scrubProtoKeys(polluted);
  assert.equal(cleanObj.aman, 1);
  assert.equal(cleanObj.nested.ok, 2);
  assert.equal(Object.prototype.hasOwnProperty.call(cleanObj, '__proto__'), false);
  assert.equal(Object.prototype.hasOwnProperty.call(cleanObj.nested, 'constructor'), false);

  const html = markdown.render('[klik](https://example.com/a"onmouseover="alert(1))');
  assert.equal(html.includes('"onmouseover="'), false);
  assert.equal(safeMarkdownHref('javascript:alert(1)'), '#');

  assert.equal(cleanCalendarId('../../primary"\r\n'), '//primary');
});

test('DOD-41.16 Prefill Penuh 28 Lapis + Decode 4 Lapis Jangkar RAM & Progres Stepper Hidup', async () => {
  const d = 32;
  const ff = 64;
  const nLayers = 28;
  const nHeads = 4;
  const nKv = 2;
  const dk = 8;
  const vocab = 128;
  const header = {
    __metadata__: {
      format: 'rategoan-int4-block32-affine',
      trained: 'true',
      tier: 'tier_1_5b',
      d_model: String(d),
      n_layers: String(nLayers),
      n_heads: String(nHeads),
      n_kv_heads: String(nKv),
      head_dim: String(dk),
      intermediate_size: String(ff),
      vocab: String(vocab),
    },
  };
  let offset = 0;
  function addInt4(name, rows, cols) {
    const packedLen = (rows * cols) / 2;
    const blocks = (rows * cols) / 32;
    header[name] = { dtype: 'U8', shape: [rows, cols / 2], data_offsets: [offset, offset + packedLen] };
    offset += packedLen;
    header[name + '.scale'] = { dtype: 'F32', shape: [blocks], data_offsets: [offset, offset + blocks * 4] };
    offset += blocks * 4;
    header[name + '.zero'] = { dtype: 'F32', shape: [blocks], data_offsets: [offset, offset + blocks * 4] };
    offset += blocks * 4;
  }
  function addF32(name, len) {
    header[name] = { dtype: 'F32', shape: [len], data_offsets: [offset, offset + len * 4] };
    offset += len * 4;
  }
  addInt4('embedding.weight', vocab, d);
  for (let l = 0; l < nLayers; l += 1) {
    const pre = 'layers.' + l + '.';
    addF32(pre + 'ln1.gamma', d);
    addInt4(pre + 'attention.Wq', nHeads * dk, d);
    addInt4(pre + 'attention.Wk', nKv * dk, d);
    addInt4(pre + 'attention.Wv', nKv * dk, d);
    addInt4(pre + 'attention.Wo', d, nHeads * dk);
    addF32(pre + 'ln2.gamma', d);
    addInt4(pre + 'ffn.Wgate', ff, d);
    addInt4(pre + 'ffn.Wup', ff, d);
    addInt4(pre + 'ffn.Wdown', d, ff);
  }
  addF32('final_norm.gamma', d);
  addInt4('lm_head.weight', vocab, d);

  const headBytes = new TextEncoder().encode(JSON.stringify(header));
  const totalBytes = 8 + headBytes.length + offset;
  const buf = new Uint8Array(totalBytes);
  new DataView(buf.buffer).setBigUint64(0, BigInt(headBytes.length), true);
  buf.set(headBytes, 8);
  const dataStart = 8 + headBytes.length;
  Object.keys(header).forEach((k) => {
    if (k === '__metadata__') return;
    const desc = header[k];
    const start = dataStart + desc.data_offsets[0];
    const len = desc.data_offsets[1] - desc.data_offsets[0];
    if (desc.dtype === 'U8') {
      buf.fill(0x99, start, start + len);
    } else if (k.endsWith('.scale') || k.endsWith('.gamma')) {
      const f = new Float32Array(len / 4).fill(0.05);
      if (k === 'lm_head.weight.scale') {
        f[0] = -1.0; f[1] = -1.0; f[2] = -1.0; f[3] = -1.0; f[4] = -1.0;
        f[10] = 2.5;
      }
      buf.set(new Uint8Array(f.buffer), start);
    }
  });

  const stream = await openInt4Stream({
    size: buf.length,
    async read(start, len) {
      return buf.subarray(start, start + len);
    },
    async readScratch(start, len) {
      return buf.subarray(start, start + len);
    },
  });

  const prefillTotals = [];
  const decodeTotals = [];
  const out = await stream.generate('a', {
    maxNewTokens: 4,
    temperature: 0,
    onStep(done, total, phase) {
      if (phase === 'prefill' && done === total) prefillTotals.push(total);
      if (phase === 'decode' && done === total) decodeTotals.push(total);
    },
  });
  assert.ok(prefillTotals.includes(28), 'prefill token terakhir wajib mengeksekusi seluruh 28 lapis penuh');
  assert.ok(decodeTotals.every((t) => t === 4), 'decode token berikutnya wajib memakai 4 lapis jangkar RAM');
  assert.equal(out.tokenIds.length, 4);
});

test('DOD-41.17 Tata Letak Kartu Unduhan Desktop Simetris 760px, Progres Streaming Nyata, & Antrean OPFS Bebas Race Condition', () => {
  const deskCss = read('css/layout/desktop.css');
  const compJs = read('js/chat/composer.js');
  const provJs = read('raget/raget-neural/neural-provider.js');
  const opfsWorker = read('raget/raget-neural/runtime/opfs-writer-worker.js');
  const mainJs = read('js/main.js');

  assert.match(deskCss, /#view-chat \.top-download-bar \.weight-card:has\(#weight-status\[data-busy="1"\]\)[\s\S]*?width:\s*100%/);
  assert.match(deskCss, /#view-chat:has\(#messages:empty\):has\(#top-download-bar:not\(\[hidden\]\)\)/);
  assert.match(deskCss, /#view-chat \.top-download-bar \.weight-card #btn-weight/);
  assert.match(compJs, /Number\(detail && detail\.visibleLoaded\)/);
  assert.match(compJs, /pctText = \(loaded > 0 && pct === 0\)/);
  assert.match(provJs, /concurrency:\s*6/);
  assert.equal(provJs.includes('Promise.race([untilEarly(), pending])'), false);
  assert.match(opfsWorker, /let handlePromise = null/);
  assert.match(opfsWorker, /let opQueue = Promise\.resolve\(\)/);
  assert.match(mainJs, /if \(pct <= 0 \|\| pct === lastToastPct\) return/);
});

test('DOD-41.18 Penyempurnaan 5 Panel Monitoring Studio Kode (Pratinjau, Dokumen SVG Flowchart, Spreadsheet KPI, Berkas IDE, Terminal Gelap)', () => {
  const studioHtml = read('studio.html');
  const studioCss = read('css/ui/studio.css');
  const studioApp = read('js/studio/studio-app.js');
  const canvasTools = read('js/studio/canvas-tools.js');

  assert.match(studioHtml, /class="preview-viewport-group"/);
  assert.match(studioHtml, /class="file-mode-group"/);
  assert.match(studioHtml, /class="code-stage-box"/);
  assert.match(studioCss, /#tab-logs \.tool-trace-card/);
  assert.match(studioCss, /\.sheet-kpi-grid/);
  assert.match(studioCss, /\.doc-module-grid/);
  assert.match(studioApp, /function roleOfFile\(path\)/);
  assert.match(canvasTools, /class="arch-node"/);
});

test('DOD-41.19 Desktop Overhaul (Artefak, Koleksi, Proyek, Pengaturan, Berkas Studio) & Keamanan Menu + Lampiran', () => {
  const deskCss = read('css/layout/desktop.css');
  const overhaulCss = read('css/ui/overhaul.css');
  const studioCss = read('css/ui/studio.css');
  const settingsJs = read('js/account/settings.js');
  const artifactsJs = read('js/artifacts/artifacts.js');
  const attachJs = read('js/sheets/attach.js');
  const indexHtml = read('index.html');

  assert.match(deskCss, /#view-settings #settings-menu \.set-section[\s\S]*?grid-template-columns:\s*repeat\(2/);
  assert.match(deskCss, /#view-collection \.coll-tabs[\s\S]*?max-width:\s*360px/);
  assert.match(overhaulCss, /\.coll-empty-card \{ grid-column: 1 \/ -1;[\s\S]*?flex-direction: column/);
  assert.match(studioCss, /\.file-actions \{[\s\S]*?flex-wrap:\s*nowrap/);
  assert.match(settingsJs, /class="cat-row-desc"/);
  assert.match(artifactsJs, /artifact-empty-actions/);
  assert.match(attachJs, /visionOcr\.recognize\(f\)/);
  assert.match(attachJs, /extractArchiveSummary\(bytes\)/);
  assert.equal(indexHtml.includes('id="sheet-think"'), false);
  assert.equal(indexHtml.includes('id="sheet-code-studio"'), false);
  assert.equal(indexHtml.includes('id="btn-quick-think"'), false);

  assert.equal(MAX_ATTACH_BYTES, 25 * 1024 * 1024);
  assert.equal(MAX_ATTACH_TEXT_CHARS, 32000);
  assert.equal(hasXmlEntityBomb('<!DOCTYPE foo [<!ENTITY xxe SYSTEM "file:///etc/passwd">]>'), true);
  assert.equal(hasXmlEntityBomb('<w:document><w:body><w:p>Aman</w:p></w:body></w:document>'), false);
  const dirtySvg = '<svg onload="alert(1)"><script>evil()</script><text>Halo SVG</text></svg>';
  const cleanSvg = sanitizeSvgContent(dirtySvg);
  assert.equal(cleanSvg.includes('<script>'), false);
  assert.equal(cleanSvg.includes('onload='), false);
  assert.equal(cleanSvg.includes('Halo SVG'), true);
  assert.equal(isSafeZipEntryPath('src/index.js'), true);
  assert.equal(isSafeZipEntryPath('../../etc/passwd'), false);
  assert.equal(isSafeZipEntryPath('/abs/path.js'), false);
});

test('DOD-41.20 Ekstraksi PDF/ZIP/Visi Murni In-Browser, Kartu Lampiran Multi-Berkas Modern, & Penapis Output Gibberish', async () => {
  const rawPdf = new TextEncoder().encode(
    '%PDF-1.4\n1 0 obj\n<< /Type /Page >>\nendobj\n2 0 obj\n<< /Length 68 >>\nstream\nBT /F1 12 Tf (PRD Buku Raget Coding Definitif Sinkron) Tj ET\nendstream\nendobj\n%%EOF'
  );
  const extractedPdf = await extractPdfText(rawPdf);
  assert.match(extractedPdf, /\[Dokumen PDF · 1 halaman\]/);
  assert.match(extractedPdf, /PRD Buku Raget Coding Definitif Sinkron/);

  const zipMeta = classifyFileMeta({ name: 'Rategoan-main.zip', size: 1823376, type: 'application/zip' });
  assert.equal(zipMeta.kind, 'zip');
  assert.equal(zipMeta.badge, 'ZIP');
  assert.equal(zipMeta.tone, 'amber');
  assert.equal(formatBytesLabel(1823376), '1.7 MB');

  const pdfMeta = classifyFileMeta({ name: 'PRD_Buku_Raget_Coding_Definitif_Sinkron.pdf', size: 420000, type: 'application/pdf' });
  assert.equal(pdfMeta.kind, 'pdf');
  assert.equal(pdfMeta.badge, 'PDF');
  assert.equal(pdfMeta.tone, 'red');

  const multiReport = summarizeMultiAttachments({
    files: [
      { name: 'Rategoan-main.zip', badge: 'ZIP', sizeLabel: '1.8 MB', statusLabel: '365 berkas diekstrak', fileText: 'Daftar berkas arsip ZIP (365 berkas):\n- index.html\n- js/main.js' },
      { name: 'PRD_Buku_Raget_Coding.pdf', badge: 'PDF', sizeLabel: '410 KB', statusLabel: '12 hlm · Teks siap', fileText: extractedPdf },
      { name: '1000001363.jpg', badge: 'JPG', sizeLabel: '142 KB', statusLabel: 'Visi & OCR siap', fileText: 'Ringkasan Visual Gambar (1000001363.jpg): Tangkapan layar antarmuka ponsel, resolusi 1080×2400 piksel.' },
    ],
  }, 'h');
  assert.match(multiReport, /3 berkas lampiran/);
  assert.match(multiReport, /Rategoan-main\.zip/);
  assert.match(multiReport, /PRD_Buku_Raget_Coding\.pdf/);
  assert.match(multiReport, /1000001363\.jpg/);

  const provSrc = read('raget/raget-neural/neural-provider.js');
  assert.equal(provSrc.includes('synthesizeGroundedNeuralResponse'), false);
  assert.equal(provSrc.includes('Saya **Raget 1.0**, mesin kecerdasan lokal'), false);
  const compSrc = read('js/chat/composer.js');
  assert.equal(compSrc.includes('directReply = summarizeMultiAttachments'), false);
  assert.equal(compSrc.includes('directReply = summarizeFileText'), false);
  assert.equal(compSrc.includes("directReply = 'Hasil perhitungan:"), false);
  const singleZipReport = summarizeMultiAttachments({
    files: [
      { name: 'Rategoan-main.zip', badge: 'ZIP', sizeLabel: '1.7 MB', statusLabel: '365 berkas diekstrak', fileText: 'Daftar berkas arsip ZIP (365 berkas — komposisi: .js (210), .json (120)):\n- `package.json`\n- `index.html`' },
    ],
  }, 'Baca dan ringkas lampiran ini');
  assert.match(singleZipReport, /Hasil Ekstraksi Arsip `Rategoan-main\.zip`/);
  assert.equal(singleZipReport.includes('*(hlm.'), false);
  const lowThoughts = buildDynamicThoughts('jelaskan arsitektur transformer', { think: false });
  const highThoughts = buildDynamicThoughts('jelaskan arsitektur transformer', { think: true });
  assert.equal(lowThoughts.length, 3);
  assert.ok(highThoughts.length > lowThoughts.length);
  assert.match(highThoughts[0].text, /arsitektur transformer/i);
  assert.ok(highThoughts.some((s) => /alur pembahasan|kelengkapan argumen/i.test(s.text)));
  const modelSheetSrc = read('js/sheets/model-sheet.js');
  assert.match(modelSheetSrc, /label: 'Rendah'/);
  assert.match(modelSheetSrc, /label: 'Tinggi'/);
  assert.equal(compSrc.includes('wrapTrace('), false);
  assert.equal(compSrc.includes('<trace title='), false);
});

test('DOD-41.21 Penyempurnaan Inti Otak Neural: Rotary Position Embedding (RoPE), Hidrasi Kosakata BPE Kustom, dan Penalti Repetisi Mode Rendah/Tinggi', () => {
  const dk = 8;
  const heads = 2;
  const freqs = buildRopeFreqs(dk, 10000);
  assert.equal(freqs.length, 4);
  const q0 = new Float32Array([1, 2, 3, 4, 0.5, -1.5, 2.5, -0.5, 1, 0, 0, 1, 2, 2, -1, 3]);
  const normBefore = q0.reduce((acc, v) => acc + v * v, 0);
  const qPos0 = new Float32Array(q0);
  applyRoPE(qPos0, heads, dk, 0, freqs);
  for (let i = 0; i < q0.length; i += 1) {
    assert.ok(Math.abs(qPos0[i] - q0[i]) < 1e-6);
  }
  const qPos5 = new Float32Array(q0);
  applyRoPE(qPos5, heads, dk, 5, freqs);
  const normAfter = qPos5.reduce((acc, v) => acc + v * v, 0);
  assert.ok(Math.abs(normBefore - normAfter) < 1e-4);
  assert.ok(Math.abs(qPos5[0] - q0[0]) > 1e-3);

  const logits = new Float32Array(32);
  logits.fill(-5);
  logits[10] = 4.0;
  logits[11] = 3.8;
  const pickedFresh = pickToken(new Float32Array(logits), { temperature: 0, repetitionPenalty: 1.2 }, []);
  assert.equal(pickedFresh, 10);
  const pickedPenalized = pickToken(new Float32Array(logits), { temperature: 0, repetitionPenalty: 1.2 }, [10, 10, 10]);
  assert.equal(pickedPenalized, 11);

  try {
    const custom = bpeShell.loadCustomVocabulary({
      vocab: ['<|endoftext|>', '<|bos|>', '<|pad|>', '</s>', '\n\nPengguna:', 'Halo', 'Raget'],
      merges: [],
    });
    assert.equal(custom.custom, true);
    assert.equal(bpeShell.decodeIds([5]), 'Halo');
  } finally {
    bpeShell.resetVocabulary();
  }
  assert.equal(bpeShell.buildShell().idToToken.length, 32000);
});

test('DOD-41.22 Alur Pencarian Web & Riset Mendalam Inline Tanpa Pindah Halaman Paksa + Tabel Responsif .md-table-wrap', () => {
  const compSrc = read('js/chat/composer.js');
  assert.equal(compSrc.includes("title: 'Berkas riset'"), false);
  assert.equal(compSrc.includes("textContent = 'Unduh DOCX'"), false);
  assert.equal(compSrc.includes("textContent = 'Unduh MD'"), false);
  assert.equal(compSrc.includes("textContent = 'Buka di Kanvas'"), false);
  assert.match(compSrc, /web-sources-strip/);
  assert.match(compSrc, /web-source-chip/);

  const renderedTable = markdown.render([
    'Berikut perbandingan cabang ilmu matematika:',
    '',
    '| Cabang | Fokus Kajian | Contoh Penerapan |',
    '| --- | --- | --- |',
    '| Aljabar | Struktur simbol, persamaan, dan operasi abstrak | Kriptografi dan pemodelan sistem |',
    '| Geometri | Sifat ruang, bentuk, jarak, dan transformasi | Grafika komputer dan arsitektur |',
  ].join('\n'));
  assert.match(renderedTable, /<div class="md-table-wrap"><table class="md-table"><thead><tr><th>Cabang<\/th><th>Fokus Kajian<\/th><th>Contoh Penerapan<\/th><\/tr><\/thead>/);
});

test('DOD-41.23 Proses Berpikir Ala Grok (Membedah Tugas Tanpa Jargon Rumus Mesin), Ekstraksi Citra/Berkas, dan Menu Ikon +', () => {
  const sessionSrc = read('raget/raget-neural/runtime/int4-session.js');
  assert.equal(sessionSrc.includes('neural-grounding'), false);
  assert.equal(sessionSrc.includes('groundNeuralOutput'), false);
  assert.match(sessionSrc, /const full = bpeShell\.decodeIds\(generated\)/);

  const tcSrc = read('js/ui/thought-card.js');
  assert.equal(tcSrc.includes('int4-block32'), false);
  assert.equal(tcSrc.includes('RoPE'), false);
  assert.equal(tcSrc.includes('28 lapis transformer'), false);
  assert.equal(tcSrc.includes('Prefill Raget 1.0'), false);
  assert.equal(tcSrc.includes('Dekode aliran token'), false);

  const imgSteps = buildDynamicThoughts('Baca dan ringkas lampiran ini', {
    think: true,
    files: 'kamera-1792061530652.jpg',
    fileMeta: {
      kind: 'image',
      sizeLabel: '62 KB',
      visionSummary: 'Foto objek / ilustrasi & motif berwarna · 460×1024 px · 62 KB',
      paletteSummary: 'Warna dominan: Biru (54%), Putih / Terang (22%), Kuning (12%)',
    },
  });
  const webBuildSteps = buildDynamicThoughts('buatkan saya website A seperti website C', { think: true });
  const zipSteps = buildDynamicThoughts('baca dan perbaiki bug', { think: true, files: 'Rategoan-main.zip', fileMeta: { kind: 'zip', statusLabel: '365 berkas diekstrak' } });

  assert.match(imgSteps[0].text, /Membuka & mengamati gambar kamera-1792061530652\.jpg/);
  assert.match(imgSteps[0].sub, /Saya buka berkas gambar/);
  assert.match(webBuildSteps[0].text, /Membedah kebutuhan pembuatan "buatkan saya website A seperti website C"/);
  assert.match(webBuildSteps[0].sub, /Saya identifikasi komponen utama/);
  assert.match(zipSteps[0].text, /Membuka & membaca paket arsip Rategoan-main\.zip/);
  assert.match(zipSteps[1].text, /Memeriksa isi berkas utama di dalam arsip/);

  const thoughtCss = read('css/ui/thought.css');
  assert.match(thoughtCss, /\.stepper-sub::before/);
  assert.match(thoughtCss, /\.thought-seg-track/);
  assert.match(thoughtCss, /\.stepper-kicker/);
  assert.match(thoughtCss, /\.stepper-chips/);
  assert.equal(tcSrc.includes('stepper-stage-num'), false);
  assert.match(tcSrc, /VERIFIKASI_VALIDASI/);
  assert.match(tcSrc, /PERANCANGAN_ARSITEKTUR/);
  assert.match(tcSrc, /SINTESIS_SUMBER/);
  assert.ok(Array.isArray(webBuildSteps[0].chips) && webBuildSteps[0].chips.some((c) => /Acuan: website C/i.test(c)));
  assert.equal(thoughtCss.includes('.stepper-node.is-pending {\n  display: none'), false);
  const compAfterAsk = read('js/chat/composer.js');
  assert.match(compAfterAsk, /if \(livePlan && livePlan\.parentNode && !livePlan\.dataset\.idx\) livePlan\.remove\(\)/);
});
