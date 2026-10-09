export function createGrid(rows) {
  const data = (rows || []).map((row) => Object.assign({}, row));
  return {
    rows: data,
    set(index, key, value) { data[index][key] = value; },
    series(key) { return data.map((row) => Number(row[key] || 0)); },
  };
}
