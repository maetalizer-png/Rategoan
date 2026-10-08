const HUNK = /^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/;
const DIFF_CAP = 2 * 1024 * 1024;

export function parseUnifiedDiff(patch) {
  const text = String(patch || '');
  if (text.length > DIFF_CAP) throw new Error('Diff terlalu besar');
  const hunks = [];
  let current = null;
  text.split('\n').forEach((line) => {
    const match = line.match(HUNK);
    if (match) {
      current = {
        oldStart: Number(match[1]),
        oldLen: match[2] == null ? 1 : Number(match[2]),
        newStart: Number(match[3]),
        newLen: match[4] == null ? 1 : Number(match[4]),
        lines: [],
      };
      hunks.push(current);
      return;
    }
    if (!current || !line) return;
    if (line.startsWith('\\')) return;
    if (line.startsWith('+')) current.lines.push({ kind: 'add', text: line.slice(1) });
    else if (line.startsWith('-')) current.lines.push({ kind: 'del', text: line.slice(1) });
    else current.lines.push({ kind: 'same', text: line.startsWith(' ') ? line.slice(1) : line });
  });
  if (!hunks.length) throw new Error('Header hunk tidak sah');
  hunks.forEach((hunk) => validateHunkLineCount(hunk));
  return { hunks };
}

export function validateHunkLineCount(hunk) {
  let oldCount = 0;
  let newCount = 0;
  for (const line of hunk.lines) {
    const raw = typeof line === 'string'
      ? line
      : (line.kind === 'add' ? '+' : (line.kind === 'del' ? '-' : ' '));
    if (raw.startsWith('-')) oldCount += 1;
    else if (raw.startsWith('+')) newCount += 1;
    else {
      oldCount += 1;
      newCount += 1;
    }
  }
  if (oldCount !== hunk.oldLen || newCount !== hunk.newLen) {
    throw new Error('Malformed diff hunk: expected -' + hunk.oldLen + '/+' + hunk.newLen + ', got -' + oldCount + '/+' + newCount);
  }
  return true;
}

function lineText(line) {
  return typeof line === 'string' ? line.replace(/^[-+ ]/, '') : (line.text || '');
}

function needleOf(hunk, drop) {
  return hunk.lines.filter((line) => line.kind !== drop).map(lineText);
}

function fuzzyEq(a, b) {
  const x = String(a || '').trim();
  const y = String(b || '').trim();
  if (x === y) return true;
  if (Math.abs(x.length - y.length) > 2) return false;
  let dist = Math.abs(x.length - y.length);
  const n = Math.min(x.length, y.length);
  for (let i = 0; i < n; i += 1) if (x[i] !== y[i]) dist += 1;
  const span = Math.max(x.length, y.length) || 1;
  return dist <= 2 && dist / span <= 0.25;
}

function findWindows(sourceLines, needle, mode) {
  const hits = [];
  const n = needle.length;
  if (!n) return [];
  for (let i = 0; i <= sourceLines.length - n; i += 1) {
    let ok = true;
    for (let j = 0; j < n; j += 1) {
      const left = sourceLines[i + j];
      const right = needle[j];
      if (mode === 'exact' && left !== right) ok = false;
      else if (mode === 'ws' && String(left).trim() !== String(right).trim()) ok = false;
      else if (mode === 'fuzzy' && !fuzzyEq(left, right)) ok = false;
      if (!ok) break;
    }
    if (ok) hits.push(i);
  }
  return hits;
}

function pickOne(hits) {
  if (hits.length === 1) return hits[0];
  if (hits.length > 1) throw new Error('Multiple matches');
  return -1;
}

export function applyUnifiedDiff(source, patch) {
  const parsed = parseUnifiedDiff(patch);
  const lines = String(source == null ? '' : source).replace(/\n$/, '').split('\n');
  if (String(source || '') === '') lines.length = 0;
  parsed.hunks.forEach((hunk) => {
    const needle = needleOf(hunk, 'add');
    const fresh = needleOf(hunk, 'del');
    if (!needle.length) {
      const at = Math.max(0, Math.min(lines.length, hunk.oldStart));
      lines.splice(at, 0, ...fresh);
      return;
    }
    let at = pickOne(findWindows(lines, needle, 'exact'));
    if (at < 0) at = pickOne(findWindows(lines, needle, 'ws'));
    if (at < 0) at = pickOne(findWindows(lines, needle, 'fuzzy'));
    if (at < 0) throw new Error('Hunk tidak ketemu');
    lines.splice(at, needle.length, ...fresh);
  });
  return lines.join('\n');
}

export function linesToPatch(lines) {
  const rows = Array.isArray(lines) ? lines : [];
  const oldLen = rows.filter((line) => line.kind !== 'add').length;
  const newLen = rows.filter((line) => line.kind !== 'del').length;
  const header = '@@ -' + (oldLen ? 1 : 0) + ',' + oldLen + ' +' + (newLen ? 1 : 0) + ',' + newLen + ' @@';
  const body = rows.map((line) => {
    const mark = line.kind === 'add' ? '+' : (line.kind === 'del' ? '-' : ' ');
    return mark + (line.text || '');
  });
  return [header].concat(body).join('\n');
}

export function renderDiffElement(parent, lines) {
  const parsed = parseUnifiedDiff(linesToPatch(lines));
  parent.textContent = '';
  parsed.hunks.forEach((hunk) => {
    const head = document.createElement('div');
    head.className = 'diff-hunk';
    head.textContent = '@@ -' + hunk.oldStart + ',' + hunk.oldLen + ' +' + hunk.newStart + ',' + hunk.newLen + ' @@';
    parent.appendChild(head);
    let oldN = hunk.oldLen ? hunk.oldStart : 0;
    let newN = hunk.newLen ? hunk.newStart : 0;
    hunk.lines.forEach((line) => {
      const row = document.createElement('div');
      row.className = 'diff-line ' + line.kind;
      const oldSpan = document.createElement('span');
      oldSpan.className = 'ln ln-old';
      const newSpan = document.createElement('span');
      newSpan.className = 'ln ln-new';
      if (line.kind === 'add') {
        oldSpan.textContent = '';
        newSpan.textContent = String(newN);
        newN += 1;
      } else if (line.kind === 'del') {
        oldSpan.textContent = String(oldN);
        newSpan.textContent = '';
        oldN += 1;
      } else {
        oldSpan.textContent = String(oldN);
        newSpan.textContent = String(newN);
        oldN += 1;
        newN += 1;
      }
      const body = document.createElement('span');
      const mark = line.kind === 'add' ? '+ ' : (line.kind === 'del' ? '- ' : '  ');
      body.textContent = mark + line.text;
      row.appendChild(oldSpan);
      row.appendChild(newSpan);
      row.appendChild(body);
      parent.appendChild(row);
    });
  });
  return parsed;
}
