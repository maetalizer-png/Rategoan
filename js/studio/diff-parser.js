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
  return { hunks };
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
