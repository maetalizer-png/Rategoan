const buckets = new Map();
const audits = [];

export function recordTelemetry(projectId, sample) {
  const id = String(projectId || 'local');
  const row = buckets.get(id) || { renders: 0, failures: 0, latencyMs: 0, alerts: 0 };
  row.renders += 1;
  const ms = Number(sample && sample.ms) || 0;
  row.latencyMs = ms;
  if (sample && sample.ok === false) row.failures += 1;
  if (ms > 20 && sample && sample.kind === 'parse') row.alerts += 1;
  buckets.set(id, row);
  return publicMetrics(id);
}

export function publicMetrics(projectId) {
  const row = buckets.get(String(projectId || 'local')) || { renders: 0, failures: 0, latencyMs: 0, alerts: 0 };
  return {
    renders: row.renders,
    failures: row.failures,
    latencyMs: row.latencyMs,
    alerts: row.alerts,
  };
}

export function auditEvent(kind) {
  const row = { t: Date.now(), kind: String(kind || 'event'), pii: false };
  audits.push(row);
  if (audits.length > 200) audits.shift();
  return row;
}

export function auditTail() {
  return audits.slice();
}
