const TASKS = [
  { id: 'tambah', run() { const tambah = (a, b) => a + b; return tambah(2, 3) === 5; } },
  { id: 'maks', run() { return Math.max(1, 4, 2) === 4; } },
  { id: 'tanda', run() { const tanda = (n) => (n < 0 ? -1 : (n > 0 ? 1 : 0)); return tanda(-2) === -1 && tanda(0) === 0; } },
];

export function humanevalPassAt1(tasks) {
  const list = tasks || TASKS;
  let pass = 0;
  list.forEach((task) => { if (task.run()) pass += 1; });
  return { pass, total: list.length, score: list.length ? pass / list.length : 0 };
}
