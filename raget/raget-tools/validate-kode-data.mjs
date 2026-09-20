#!/usr/bin/env node
/** Gerbang lisensi + panjang cuplikan. SPDX allowlist. */

const ALLOW = new Set([
  'mit',
  'apache-2.0',
  'apache-2',
  'bsd-2-clause',
  'bsd-3-clause',
  'isc',
  'unlicense',
  'cc0-1.0',
  '0bsd',
  'own',
  'cc0-rategoan-original',
]);

export function licenseOk(lic) {
  const s = String(lic || '')
    .toLowerCase()
    .replace(/\s+/g, '');
  if (!s || s === 'unknown' || s === 'other') return false;
  if (ALLOW.has(s)) return true;
  if (s.includes('mit') && !s.includes('gpl')) return true;
  if (s.includes('apache-2')) return true;
  if (s.includes('bsd-2') || s.includes('bsd-3')) return true;
  return false;
}

export function lengthOk(code, text) {
  const lines = String(code || '')
    .split('\n')
    .filter((l) => l.trim()).length;
  const words = String(text || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  return lines >= 8 || words >= 30;
}

export function notMinified(code) {
  const s = String(code || '');
  if (!s.includes('\n') && s.length > 400) return false;
  const lines = s.split('\n');
  const long = lines.filter((l) => l.length > 400).length;
  return long / Math.max(1, lines.length) < 0.4;
}

export function accept(row) {
  if (!licenseOk(row.license)) return { ok: false, reason: 'lisensi' };
  if (!lengthOk(row.code, row.text)) return { ok: false, reason: 'pendek' };
  if (!notMinified(row.code)) return { ok: false, reason: 'minified' };
  if (/node_modules|package-lock|yarn.lock|\.min\.js/i.test(row.source || '')) {
    return { ok: false, reason: 'bundel' };
  }
  return { ok: true };
}
