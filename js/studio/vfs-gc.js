export const WORKTREE_BUDGET = 30 * 1024 * 1024;

export function gcWorktree(files, budget) {
  const cap = budget == null ? WORKTREE_BUDGET : budget;
  const rows = Object.keys(files || {}).map((path) => ({ path, text: String(files[path] == null ? '' : files[path]) }));
  let total = rows.reduce((sum, row) => sum + row.text.length, 0);
  const dropped = [];
  const order = rows.slice().sort((a, b) => b.text.length - a.text.length);
  const drop = new Set();
  for (let i = 0; i < order.length; i += 1) {
    if (total <= cap) break;
    drop.add(order[i].path);
    total -= order[i].text.length;
    dropped.push(order[i].path);
  }
  const kept = {};
  rows.forEach((row) => {
    if (!drop.has(row.path)) kept[row.path] = row.text;
  });
  return { kept, dropped, bytes: total };
}
