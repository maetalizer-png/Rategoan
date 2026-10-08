import { routeDoor, failoverStream } from './sse-door.js';
import { recordTelemetry } from './telemetry.js';

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
  if (!parts.length) parts.push('<h1>' + title + '</h1><p id="status">Siap</p>');
  let script = 'var statusNode=document.getElementById("status");if(statusNode){statusNode.textContent="Siap";}\n';
  if (hasCollection) {
    script = 'var form=document.getElementById("form");var input=document.getElementById("item");var list=document.getElementById("' + listId + '");if(form&&input&&list){form.onsubmit=function(ev){ev.preventDefault();var text=input.value.trim();if(!text)return;var li=document.createElement("li");li.textContent=text;list.appendChild(li);input.value="";};}\n';
  } else if (hasNumber) {
    script = 'var btn=document.getElementById("hitung");if(btn){btn.onclick=function(){var nodes=document.querySelectorAll("input");var sum=0;nodes.forEach(function(el){sum+=Number(el.value)||0;});var out=document.getElementById("hasil");if(out)out.textContent=String(sum);};}\n';
  } else if (plainActions.length) {
    const id = plainActions[0];
    script = 'var btn=document.getElementById("' + id + '");if(btn){btn.onclick=function(){var s=document.getElementById("status");if(s)s.textContent="Berjalan";};}\n';
  }
  const css = 'body{font-family:sans-serif;margin:24px;background:#fafaf8;color:#141619}h1{font-size:28px;margin:0 0 12px}button{background:' + color + ';color:#fff;border:0;padding:10px 14px;border-radius:8px}input{padding:8px;margin:0 8px 8px 0;border:1px solid #e8e8e3;border-radius:8px}ul{padding-left:18px}\n';
  return {
    'index.html': '<!doctype html><html><head><meta charset="utf-8"><title>' + title + '</title></head><body>' + parts.join('') + '</body></html>\n',
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
  const re = /```(index\.html|style\.css|script\.js)\n([\s\S]*?)```/g;
  let match = re.exec(text);
  while (match) {
    files[match[1]] = match[2];
    match = re.exec(text);
  }
  if (!files['index.html'] && !files['script.js']) return null;
  return files;
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
      streamed = typeof res.text === 'function' ? await res.text() : '';
    } catch (e) {
      const failed = failoverStream({ phase: 'DOOR_B_STREAMING', seq: 1, door: 'center' }, 'NETWORK_FAILURE');
      door = failed.door || 'local';
      streamed = '';
    }
  } else {
    door = 'local';
  }
  const parsed = parseFenceFiles(streamed);
  const drafted = parsed || renderPartial(text);
  const merged = Object.assign({}, files || {});
  Object.keys(drafted).forEach((name) => { merged[name] = drafted[name]; });
  if (typeof opts.onToken === 'function') opts.onToken(door === 'local' ? 'pintu lokal' : 'pintu pusat');
  return {
    ok: true,
    files: merged,
    lang: 'web',
    door,
    steps: ['Baca berkas', 'Sintesis', 'Uji sandbox'],
    reply: 'Halaman sudah dirakit dari instruksi itu.',
  };
}
