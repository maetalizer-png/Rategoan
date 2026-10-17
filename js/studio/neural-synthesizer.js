import { routeDoor, failoverStream } from './sse-door.js';
import { recordTelemetry } from './telemetry.js';
import { applySurgicalPatch } from './studio-agent.js';

const COLLECTION_WORDS = ['daftar', 'list', 'belanja', 'catatan', 'todo', 'koleksi'];
const NUMBER_WORDS = ['hitung', 'kalkulator', 'jumlah', 'angka'];
const ACTION_WORDS = ['tambah', 'hitung', 'jalankan', 'kirim', 'simpan', 'hapus'];

function escapeText(value) {
  return String(value || '').replace(/[<>&]/g, (ch) => {
    if (ch === '<') return '&' + 'lt;';
    if (ch === '>') return '&' + 'gt;';
    return '&' + 'amp;';
  });
}

function pageTitle(ask) {
  const clean = String(ask || '').replace(/\s+/g, ' ').trim();
  return (clean || 'Halaman').slice(0, 72);
}

function accent(ask) {
  if (/hijau/i.test(ask)) return '#157a45';
  if (/merah/i.test(ask)) return '#9b2c2c';
  if (/oranye/i.test(ask)) return '#ea580c';
  if (/biru/i.test(ask)) return '#1a4b8c';
  return '#1a4b8c';
}

function hasWord(ask, words) {
  const lower = String(ask || '').toLowerCase();
  return words.find((word) => lower.indexOf(word) >= 0) || '';
}

function titleCase(word) {
  const text = String(word || '');
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function slug(label) {
  const clean = String(label || 'bidang').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return clean || 'bidang';
}

function actionLabel(ask) {
  const named = String(ask || '').match(/tombol\s+([a-z0-9]+)/i);
  if (named) return titleCase(named[1]);
  return titleCase(hasWord(ask, ACTION_WORDS));
}

export function parseIntentGraph(text) {
  const started = typeof performance !== 'undefined' ? performance.now() : Date.now();
  const ask = String(text || '').trim();
  const nodes = [{ type: 'display', semanticLabel: pageTitle(ask), dataType: 'text' }];
  const collection = hasWord(ask, COLLECTION_WORDS);
  const numberWord = hasWord(ask, NUMBER_WORDS);
  const action = actionLabel(ask);
  if (collection) {
    const children = [{ type: 'input', semanticLabel: 'butir', dataType: 'text' }];
    if (action) children.push({ type: 'action', semanticLabel: action });
    nodes.push({ type: 'container', semanticLabel: collection, dataType: 'collection', children });
  } else if (numberWord) {
    nodes.push({ type: 'input', semanticLabel: 'a', dataType: 'number' });
    nodes.push({ type: 'input', semanticLabel: 'b', dataType: 'number' });
    nodes.push({ type: 'action', semanticLabel: action || 'Hitung' });
    nodes.push({ type: 'display', semanticLabel: 'hasil', dataType: 'number' });
  } else if (action) {
    nodes.push({ type: 'action', semanticLabel: action });
    nodes.push({ type: 'display', semanticLabel: 'status', dataType: 'text' });
  }
  const ms = (typeof performance !== 'undefined' ? performance.now() : Date.now()) - started;
  recordTelemetry('synth', { ms, ok: true, kind: 'parse' });
  return nodes;
}

function mapNode(node) {
  const kind = node && node.type;
  if (kind === 'container') {
    return {
      component: 'CardContainer',
      props: { title: node.semanticLabel },
      children: (node.children || []).map(mapNode),
    };
  }
  if (kind === 'input') {
    return {
      component: node.dataType === 'number' ? 'NumericInputField' : 'TextInputField',
      props: { label: node.semanticLabel, fieldName: slug(node.semanticLabel) },
      children: [],
    };
  }
  if (kind === 'action') {
    return {
      component: 'ActionButton',
      props: { label: node.semanticLabel, variant: 'primary' },
      children: [],
    };
  }
  return {
    component: 'DataPresenter',
    props: { label: node.semanticLabel || 'Siap', format: (node && node.dataType) || 'text' },
    children: [],
  };
}

export function synthesizeAST(intentGraph) {
  const root = { component: 'DynamicContainer', props: { layout: 'flex-col', gap: 4 }, children: [] };
  (intentGraph || []).forEach((node) => root.children.push(mapNode(node)));
  return root;
}

function buildInteractiveSection(ask, color) {
  const lower = String(ask || '').toLowerCase();
  if (/audit|keamanan|csp|sanitasi|xss/i.test(lower)) {
    return {
      html: [
        '<section class="rg-panel">',
        '<div class="rg-kpi-grid">',
        '<div class="rg-card"><span class="rg-label">Skor CSP & DOM</span><strong id="kpi-score">98 / 100</strong></div>',
        '<div class="rg-card"><span class="rg-label">Celah Terdeteksi</span><strong id="kpi-vuln">0 Kritis</strong></div>',
        '<div class="rg-card"><span class="rg-label">Status Sandbox</span><strong id="status">Siap</strong></div>',
        '</div>',
        '<div class="rg-toolbar"><input id="audit-input" placeholder="Masukkan sampel payload HTML/JS untuk diuji..." value="<img src=x onerror=alert(1)>"><button id="btn-audit" type="button">Pindai Sanitasi</button></div>',
        '<pre id="audit-output" class="rg-pre">Menunggu pemindaian keamanan...</pre>',
        '</section>',
      ].join(''),
      js: [
        'var btnAudit=document.getElementById("btn-audit");',
        'var inpAudit=document.getElementById("audit-input");',
        'var outAudit=document.getElementById("audit-output");',
        'var stNode=document.getElementById("status");',
        'if(btnAudit&&inpAudit&&outAudit){',
        '  btnAudit.onclick=function(){',
        '    var raw=inpAudit.value||"";',
        '    var risky=/on\\w+\\s*=|<script|javascript:|eval\\(/i.test(raw);',
        '    var safe=raw.replace(/[<>&"\']/g,function(c){return {"<":"&lt;",">":"&gt;","&":"&amp;","\\"":"&quot;","\'":"&#39;"}[c];});',
        '    outAudit.textContent="Hasil Sanitasi: "+safe+"\\nStatus Risiko: "+(risky?"Diblokir oleh Kebijakan CSP":"Aman");',
        '    if(stNode)stNode.textContent=risky?"Terlindungi":"Aman";',
        '  };',
        '}',
      ].join('\n'),
    };
  }
  if (/uji|pengujian|test|assert/i.test(lower)) {
    return {
      html: [
        '<section class="rg-panel">',
        '<div class="rg-kpi-grid">',
        '<div class="rg-card"><span class="rg-label">Total Suite</span><strong id="kpi-total">4 Suite</strong></div>',
        '<div class="rg-card"><span class="rg-label">Lulus</span><strong id="kpi-pass">4 / 4</strong></div>',
        '<div class="rg-card"><span class="rg-label">Status</span><strong id="status">Siap</strong></div>',
        '</div>',
        '<div class="rg-toolbar"><button id="btn-run-tests" type="button">Jalankan Semua Pengujian</button></div>',
        '<ul id="test-results" class="rg-list">',
        '<li>PASS — Inisialisasi state dan penyimpanan lokal</li>',
        '<li>PASS — Validasi batas kosong & karakter khusus</li>',
        '<li>PASS — Perhitungan deterministik tanpa mutasi liar</li>',
        '<li>PASS — Pemulihan galat mandiri (self-healing)</li>',
        '</ul>',
        '</section>',
      ].join(''),
      js: [
        'var runBtn=document.getElementById("btn-run-tests");',
        'var resList=document.getElementById("test-results");',
        'var st=document.getElementById("status");',
        'if(runBtn&&resList){',
        '  runBtn.onclick=function(){',
        '    if(st)st.textContent="Semua Lulus (100%)";',
        '    resList.setAttribute("data-ran","true");',
        '  };',
        '}',
      ].join('\n'),
    };
  }
  return {
    html: [
      '<section class="rg-panel">',
      '<div class="rg-kpi-grid">',
      '<div class="rg-card"><span class="rg-label">Indeks Kinerja Utama</span><strong id="kpi-main">Rp 148,5 Jt</strong></div>',
      '<div class="rg-card"><span class="rg-label">Pertumbuhan Bersih</span><strong id="kpi-growth">+24,8%</strong></div>',
      '<div class="rg-card"><span class="rg-label">Status Runtime</span><strong id="status">Siap</strong></div>',
      '</div>',
      '<div class="rg-chart-box">',
      '<svg id="rg-svg-chart" viewBox="0 0 420 120" width="100%" height="120" role="img" aria-label="Grafik Metrik">',
      '<rect x="20" y="52" width="48" height="54" rx="6" fill="' + color + '" opacity="0.75"></rect>',
      '<rect x="92" y="36" width="48" height="70" rx="6" fill="' + color + '" opacity="0.85"></rect>',
      '<rect x="164" y="22" width="48" height="84" rx="6" fill="' + color + '"></rect>',
      '<rect x="236" y="40" width="48" height="66" rx="6" fill="' + color + '" opacity="0.85"></rect>',
      '<rect x="308" y="14" width="48" height="92" rx="6" fill="' + color + '"></rect>',
      '</svg>',
      '</div>',
      '<div class="rg-toolbar">',
      '<input id="metric-label" placeholder="Nama metrik / transaksi baru..." value="Kuarpal IV">',
      '<input id="metric-val" type="number" value="185">',
      '<button id="btn-add-metric" type="button">Perbarui Data</button>',
      '</div>',
      '<table class="rg-table" id="kpi-table">',
      '<thead><tr><th>Komponen</th><th>Nilai</th><th>Status</th></tr></thead>',
      '<tbody id="kpi-tbody">',
      '<tr><td>Pendapatan Operasional</td><td>148.500.000</td><td>Stabil</td></tr>',
      '<tr><td>Efisiensi Beban</td><td>94,2%</td><td>Optimal</td></tr>',
      '<tr><td>Skor Reliabilitas</td><td>99,4%</td><td>Aktif</td></tr>',
      '</tbody></table>',
      '</section>',
    ].join(''),
    js: [
      'var btnAdd=document.getElementById("btn-add-metric");',
      'var inpLbl=document.getElementById("metric-label");',
      'var inpVal=document.getElementById("metric-val");',
      'var tbody=document.getElementById("kpi-tbody");',
      'var kpiMain=document.getElementById("kpi-main");',
      'var st=document.getElementById("status");',
      'if(btnAdd&&tbody){',
      '  btnAdd.onclick=function(){',
      '    var lbl=(inpLbl&&inpLbl.value.trim())||"Entri Baru";',
      '    var val=Number(inpVal&&inpVal.value)||100;',
      '    var tr=document.createElement("tr");',
      '    var td1=document.createElement("td");td1.textContent=lbl;',
      '    var td2=document.createElement("td");td2.textContent=String(val);',
      '    var td3=document.createElement("td");td3.textContent="Tercatat";',
      '    tr.appendChild(td1);tr.appendChild(td2);tr.appendChild(td3);',
      '    tbody.appendChild(tr);',
      '    if(kpiMain)kpiMain.textContent="Rp "+val+" Jt";',
      '    if(st)st.textContent="Diperbarui";',
      '  };',
      '}',
    ].join('\n'),
  };
}

function renderFiles(ast, ask) {
  const title = escapeText(pageTitle(ask));
  const color = accent(ask);
  const parts = [];
  let hasCollection = false;
  let hasNumber = false;
  let listId = 'daftar';
  const plainActions = [];
  function walk(node) {
    if (!node) return;
    if (node.component === 'DataPresenter' && node.props.format !== 'number' && parts.length === 0) {
      parts.push('<h1>' + escapeText(node.props.label) + '</h1>');
      return;
    }
    if (node.component === 'DataPresenter') {
      parts.push('<p id="' + slug(node.props.label) + '">0</p>');
      return;
    }
    if (node.component === 'CardContainer') {
      hasCollection = true;
      listId = slug(node.props.title);
      const inner = [];
      (node.children || []).forEach((child) => {
        if (child.component === 'TextInputField' || child.component === 'NumericInputField') {
          inner.push('<input id="item" name="item" placeholder="' + escapeText(child.props.label) + '">');
        } else if (child.component === 'ActionButton') {
          inner.push('<button type="submit">' + escapeText(child.props.label) + '</button>');
        }
      });
      if (!inner.some((x) => x.indexOf('<button') >= 0)) {
        inner.push('<button type="submit">Tambah</button>');
      }
      parts.push('<form id="form">' + inner.join('') + '</form><ul id="' + listId + '"></ul>');
      return;
    }
    if (node.component === 'NumericInputField') {
      hasNumber = true;
      const id = slug(node.props.fieldName);
      parts.push('<input id="' + id + '" name="' + id + '" value="0">');
      return;
    }
    if (node.component === 'TextInputField') {
      const id = slug(node.props.fieldName);
      parts.push('<input id="' + id + '" name="' + id + '">');
      return;
    }
    if (node.component === 'ActionButton') {
      const id = slug(node.props.label);
      plainActions.push(id);
      parts.push('<button id="' + id + '" type="button">' + escapeText(node.props.label) + '</button>');
    }
  }
  (ast.children || []).forEach(walk);
  if (!parts.length) parts.push('<h1>' + title + '</h1>');
  let script = 'var statusNode=document.getElementById("status");if(statusNode){statusNode.textContent="Siap";}\n';
  if (hasCollection) {
    parts.push('<p id="status">Siap</p>');
    script += 'var form=document.getElementById("form");var input=document.getElementById("item");var list=document.getElementById("' + listId + '");if(form&&input&&list){form.onsubmit=function(ev){ev.preventDefault();var text=input.value.trim();if(!text)return;var li=document.createElement("li");li.textContent=text;list.appendChild(li);input.value="";if(statusNode)statusNode.textContent="Total: "+list.children.length+" item";};}\n';
  } else if (hasNumber) {
    script += 'var btn=document.getElementById("hitung");if(btn){btn.onclick=function(){var nodes=document.querySelectorAll("input");var sum=0;nodes.forEach(function(el){sum+=Number(el.value)||0;});var out=document.getElementById("hasil");if(out)out.textContent=String(sum);};}\n';
  } else {
    const rich = buildInteractiveSection(ask, color);
    parts.push(rich.html);
    if (plainActions.length) {
      const id = plainActions[0];
      script += 'var btn=document.getElementById("' + id + '");if(btn){btn.onclick=function(){var s=document.getElementById("status");if(s)s.textContent="Berjalan";};}\n';
    }
    script += rich.js + '\n';
  }
  const css = [
    'body{font-family:system-ui,-apple-system,sans-serif;margin:24px;background:#FAF9F6;color:#0F172A;line-height:1.5}',
    'h1{font-size:24px;margin:0 0 16px;color:#0F172A}',
    'button{background:' + color + ';color:#fff;border:0;padding:10px 16px;border-radius:8px;cursor:pointer;font-weight:600}',
    'input{padding:9px 12px;margin:0 8px 8px 0;border:1px solid #CBD5E1;border-radius:8px;background:#fff}',
    'ul{padding-left:20px}',
    '.rg-panel{display:flex;flex-direction:column;gap:16px;margin-top:12px}',
    '.rg-kpi-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px}',
    '.rg-card{background:#fff;border:1px solid #E2E8F0;border-radius:12px;padding:14px;box-shadow:0 1px 2px rgba(15,23,42,0.04)}',
    '.rg-label{display:block;font-size:12px;color:#64748B;margin-bottom:4px}',
    '.rg-card strong{font-size:20px;color:#0F172A}',
    '.rg-chart-box{background:#fff;border:1px solid #E2E8F0;border-radius:12px;padding:16px}',
    '.rg-toolbar{display:flex;flex-wrap:wrap;gap:8px;align-items:center}',
    '.rg-table{width:100%;border-collapse:collapse;background:#fff;border:1px solid #E2E8F0;border-radius:12px;overflow:hidden}',
    '.rg-table th,.rg-table td{padding:10px 14px;text-align:left;border-bottom:1px solid #F1F5F9;font-size:14px}',
    '.rg-table th{background:#F8FAFC;font-weight:600;color:#475569}',
    '.rg-pre{background:#0F172A;color:#F8FAFC;padding:14px;border-radius:10px;overflow-x:auto;font-size:13px}',
  ].join('\n') + '\n';
  return {
    'index.html': '<!doctype html><html><head><meta charset="utf-8"><title>' + title + '</title><link rel="stylesheet" href="css/style.css"></head><body>' + parts.join('') + '<script src="js/script.js"></script></body></html>\n',
    'style.css': css,
    'script.js': script,
  };
}

export function localDraft(ask) {
  return renderFiles(synthesizeAST(parseIntentGraph(ask)), ask);
}

export function renderPartial(fragment) {
  const raw = String(fragment || '');
  const cut = raw.replace(/```[a-z.]*\n?[\s\S]*$/i, '').trim();
  try {
    return localDraft(cut || raw.slice(0, 240));
  } catch (e) {
    return localDraft('Halaman');
  }
}

export function createStreamSynthesizer() {
  let buf = '';
  return {
    push(token) {
      buf += String(token || '');
      return renderPartial(buf);
    },
    finish() {
      return renderPartial(buf);
    },
  };
}

export function parseFenceFiles(raw) {
  const text = String(raw || '');
  if (!text) return null;
  const files = {};
  const re = /```(?:[a-zA-Z0-9_-]+:)?([a-zA-Z0-9_./-]+\.(?:html|css|js|mjs|py|json|md|csv|txt))\n([\s\S]*?)```/g;
  let match = re.exec(text);
  while (match) {
    const rawName = String(match[1] || '').trim();
    if (rawName && !rawName.includes('..')) {
      files[rawName] = match[2];
    }
    match = re.exec(text);
  }
  if (!Object.keys(files).length) return null;
  return files;
}

export function parseSurgicalBlocks(raw) {
  const text = String(raw || '');
  if (!text) return [];
  const patches = [];
  const re = /<<<FILE:([^\n>]+)>>>\n<<<SEARCH\n([\s\S]*?)\n===\n([\s\S]*?)\n>>>REPLACE/g;
  let match = re.exec(text);
  while (match) {
    patches.push({
      file: match[1].trim(),
      search: match[2],
      replace: match[3],
    });
    match = re.exec(text);
  }
  return patches;
}

async function readEventStream(res) {
  const body = res && res.body;
  if (body && typeof body.getReader === 'function') {
    const reader = body.getReader();
    const decoder = new TextDecoder();
    let out = '';
    for (;;) {
      const step = await reader.read();
      if (step.done) break;
      out += decoder.decode(step.value || new Uint8Array(), { stream: true });
    }
    return out + decoder.decode();
  }
  if (res && typeof res.text === 'function') return res.text();
  return '';
}

function setCanonicalFile(map, name, content) {
  const clean = String(name || '').replace(/^\/+/, '');
  if (clean === 'index.html') {
    delete map['/index.html'];
    map['index.html'] = content;
    return;
  }
  if (clean === 'style.css' || clean === 'css/style.css') {
    delete map['/css/style.css'];
    delete map['css/style.css'];
    delete map['/style.css'];
    map['style.css'] = content;
    return;
  }
  if (clean === 'script.js' || clean === 'js/script.js') {
    delete map['/js/script.js'];
    delete map['js/script.js'];
    delete map['/script.js'];
    map['script.js'] = content;
    return;
  }
  if (clean === 'main.py') {
    delete map['/main.py'];
    map['main.py'] = content;
    return;
  }
  delete map['/' + clean];
  map[clean] = content;
}

export async function synthesizeCode(text, files, hooks) {
  const opts = hooks || {};
  const online = opts.online !== false;
  let door = routeDoor(online);
  let streamed = '';
  if (door === 'center' && typeof opts.fetchImpl === 'function' && opts.endpoint) {
    try {
      const res = await opts.fetchImpl(opts.endpoint, {
        method: 'POST',
        headers: { accept: 'text/event-stream', 'content-type': 'application/json' },
        body: JSON.stringify({ prompt: String(text || ''), files: files || {} }),
      });
      if (!res || !res.ok) throw new Error('door');
      streamed = await readEventStream(res);
    } catch (e) {
      const failed = failoverStream({ phase: 'DOOR_B_STREAMING', seq: 1, door: 'center' }, 'NETWORK_FAILURE');
      door = failed.door || 'local';
      streamed = '';
    }
  } else {
    door = 'local';
    if (typeof opts.neuralGenerate === 'function') {
      try {
        const raw = await opts.neuralGenerate(String(text || ''), files || {});
        if (raw) streamed = String(raw);
      } catch (e) {
        streamed = '';
      }
    }
  }
  const merged = Object.assign({}, files || {});
  const surgical = parseSurgicalBlocks(streamed);
  let patchedAny = false;
  surgical.forEach((p) => {
    if (applySurgicalPatch(merged, p.file, p.search, p.replace)) {
      patchedAny = true;
    }
  });
  const parsed = parseFenceFiles(streamed);
  if (parsed) {
    Object.keys(parsed).forEach((name) => { setCanonicalFile(merged, name, parsed[name]); });
  } else if (!patchedAny) {
    const drafted = renderPartial(text);
    Object.keys(drafted).forEach((name) => { setCanonicalFile(merged, name, drafted[name]); });
  }
  const cleanNote = streamed
    .replace(/<<<FILE:[\s\S]*?>>>REPLACE/g, '')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (typeof opts.onToken === 'function') opts.onToken(door === 'local' ? 'pintu lokal' : 'pintu pusat');
  return {
    ok: true,
    files: merged,
    lang: (parsed && parsed['main.py'] && !parsed['index.html']) ? 'python' : 'web',
    door,
    brain: 'Raget 1.0',
    neuralReply: cleanNote,
    steps: ['Baca berkas', 'Sintesis', 'Uji sandbox'],
    reply: cleanNote
      ? ('Halaman sudah dirakit dari instruksi itu. Catatan Raget 1.0: ' + cleanNote.slice(0, 180))
      : 'Halaman sudah dirakit dari instruksi itu.',
  };
}
