import { runTerminal } from '../studio/wasm-terminal.js';

export function liveCalculator(expr) {
  return runTerminal(expr);
}

export function filterTable(rows, query) {
  const q = String(query || '').toLowerCase();
  return (rows || []).filter((row) => JSON.stringify(row).toLowerCase().indexOf(q) >= 0);
}
