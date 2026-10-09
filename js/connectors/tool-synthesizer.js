export function synthesizeTool(spec) {
  const kind = spec && spec.op;
  if (kind !== 'sum' && kind !== 'count') throw new Error('alat');
  const field = String((spec && spec.field) || 'n');
  return {
    capabilities: ['fs:read'],
    run(rows) {
      const list = rows || [];
      if (kind === 'count') return list.length;
      return list.reduce((sum, row) => sum + Number(row[field] || 0), 0);
    },
  };
}
