export const PI = Math.PI;

export function r2(n) {
  return Math.round(n * 100) / 100;
}
export function r3(n) {
  return Math.round(n * 1000) / 1000;
}
export function tnum(n) {
  return Number.isInteger(n) ? String(n) : String(r3(n));
}

export function tryAlgebra(text) {
  const t = text;
  if (!/(selesaikan|solve|cari\s+(nilai\s+)?x|berapa\s+nilai\s+x|nilai\s+x\s+dari)/i.test(t)) return null;
  const re = /(-?\d*)\s*x\s*([+\-]\s*\d+(?:\.\d+)?)?\s*=\s*(-?\d+(?:\.\d+)?)/i;
  const m = t.match(re);
  if (!m) return null;
  const aRaw = (m[1] || '').trim();
  const a = aRaw === '' ? 1 : aRaw === '-' ? -1 : parseFloat(aRaw);
  const bStr = (m[2] || '').replace(/\s+/g, '');
  const b = bStr ? parseFloat(bStr) : 0;
  const c = parseFloat(m[3]);
  if (!a || !isFinite(a) || !isFinite(b) || !isFinite(c)) return null;
  const diff = r3(c - b);
  const x = r3(diff / a);
  const eqDisplay = m[0].trim();
  return (
    `Persamaan: ${eqDisplay}\n` +
    `Langkah: ${tnum(a)}x = ${tnum(c)} - (${tnum(b)}) = ${tnum(diff)}\n` +
    `x = ${tnum(diff)} / ${tnum(a)} = ${tnum(x)}`
  );
}

export function extractParam(text, labels) {
  for (const label of labels) {
    const re = new RegExp(label + '\\s*(?:nya)?\\s*(?:adalah|sebesar|=|:)?\\s*(\\d+(?:[.,]\\d+)?)', 'i');
    const m = text.match(re);
    if (m) return parseFloat(m[1].replace(',', '.'));
  }
  return null;
}

export function fmtGeo(label, rumus, sub, hasil, satuan) {
  return `${label}\nRumus: ${rumus}\nSubstitusi: ${sub} = ${tnum(r2(hasil))} ${satuan}`;
}

export function tryGeometry(text) {
  const t = text.toLowerCase();
  const wantsLuasPermukaan = /luas\s+permukaan/.test(t);
  const wantsVolume = /\bvolume\b/.test(t);
  const wantsKeliling = /\bkeliling\b/.test(t);
  const wantsLuas = !wantsLuasPermukaan && /\bluas\b/.test(t);
  if (!wantsVolume && !wantsKeliling && !wantsLuasPermukaan && !wantsLuas) return null;

  if (/persegi\s*panjang/.test(t)) {
    const p = extractParam(t, ['panjang']);
    const l = extractParam(t, ['lebar']);
    if (p == null || l == null) return null;
    if (wantsLuas) return fmtGeo('Luas Persegi Panjang', 'p × l', `${tnum(p)} × ${tnum(l)}`, p * l, 'satuan²');
    if (wantsKeliling) return fmtGeo('Keliling Persegi Panjang', '2 × (p + l)', `2 × (${tnum(p)} + ${tnum(l)})`, 2 * (p + l), 'satuan');
    return null;
  }
  if (/\bpersegi\b/.test(t)) {
    const s = extractParam(t, ['sisi']);
    if (s == null) return null;
    if (wantsLuas) return fmtGeo('Luas Persegi', 's²', `${tnum(s)}²`, s * s, 'satuan²');
    if (wantsKeliling) return fmtGeo('Keliling Persegi', '4 × s', `4 × ${tnum(s)}`, 4 * s, 'satuan');
    return null;
  }
  if (/lingkaran/.test(t)) {
    const r = extractParam(t, ['jari-jari', 'jari', 'radius']);
    if (r == null) return null;
    if (wantsLuas) return fmtGeo('Luas Lingkaran', 'π × r²', `π × ${tnum(r)}²`, PI * r * r, 'satuan²');
    if (wantsKeliling) return fmtGeo('Keliling Lingkaran', '2 × π × r', `2 × π × ${tnum(r)}`, 2 * PI * r, 'satuan');
    return null;
  }
  if (/segitiga/.test(t)) {
    const a = extractParam(t, ['alas']);
    const h = extractParam(t, ['tinggi']);
    if (a == null || h == null || !wantsLuas) return null;
    return fmtGeo('Luas Segitiga', '0.5 × alas × tinggi', `0.5 × ${tnum(a)} × ${tnum(h)}`, 0.5 * a * h, 'satuan²');
  }
  if (/kubus/.test(t)) {
    const s = extractParam(t, ['sisi']);
    if (s == null) return null;
    if (wantsVolume) return fmtGeo('Volume Kubus', 's³', `${tnum(s)}³`, s ** 3, 'satuan³');
    if (wantsLuasPermukaan) return fmtGeo('Luas Permukaan Kubus', '6 × s²', `6 × ${tnum(s)}²`, 6 * s * s, 'satuan²');
    return null;
  }
  if (/balok/.test(t)) {
    const p = extractParam(t, ['panjang']);
    const l = extractParam(t, ['lebar']);
    const h = extractParam(t, ['tinggi']);
    if (p == null || l == null || h == null || !wantsVolume) return null;
    return fmtGeo('Volume Balok', 'p × l × t', `${tnum(p)} × ${tnum(l)} × ${tnum(h)}`, p * l * h, 'satuan³');
  }
  if (/bola/.test(t)) {
    const r = extractParam(t, ['jari-jari', 'jari', 'radius']);
    if (r == null) return null;
    if (wantsVolume) return fmtGeo('Volume Bola', '(4/3) × π × r³', `(4/3) × π × ${tnum(r)}³`, (4 / 3) * PI * r ** 3, 'satuan³');
    if (wantsLuasPermukaan) return fmtGeo('Luas Permukaan Bola', '4 × π × r²', `4 × π × ${tnum(r)}²`, 4 * PI * r * r, 'satuan²');
    return null;
  }
  if (/tabung/.test(t)) {
    const r = extractParam(t, ['jari-jari', 'jari', 'radius']);
    const h = extractParam(t, ['tinggi']);
    if (r == null || h == null) return null;
    if (wantsVolume) return fmtGeo('Volume Tabung', 'π × r² × t', `π × ${tnum(r)}² × ${tnum(h)}`, PI * r * r * h, 'satuan³');
    if (wantsLuasPermukaan) return fmtGeo('Luas Permukaan Tabung', '2 × π × r × (r + t)', `2 × π × ${tnum(r)} × (${tnum(r)} + ${tnum(h)})`, 2 * PI * r * (r + h), 'satuan²');
    return null;
  }
  return null;
}

export function tryStatistics(text) {
  const t = text.toLowerCase();
  const m = t.match(/(rata-rata|mean|median|modus|mode|simpangan\s*baku|standar\s*deviasi|stdev)\s+(?:dari|of)\s+([\d.,\s]+)/i);
  if (!m) return null;
  const kind = m[1];
  const nums = m[2]
    .split(/[,\s]+/)
    .map((s) => parseFloat(s))
    .filter((n) => isFinite(n));
  if (nums.length < 2) return null;
  const n = nums.length;
  const sum = nums.reduce((a, b) => a + b, 0);
  const mean = sum / n;
  const listStr = nums.map(tnum).join(', ');

  if (/rata-rata|mean/.test(kind)) {
    return `Rata-rata dari ${listStr}\n= (${nums.map(tnum).join(' + ')}) / ${n}\n= ${tnum(r3(sum))} / ${n}\n= ${tnum(r3(mean))}`;
  }
  if (/median/.test(kind)) {
    const sorted = [...nums].sort((a, b) => a - b);
    const mid = Math.floor(n / 2);
    const med = n % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
    return `Median dari ${listStr}\nData terurut: ${sorted.map(tnum).join(', ')}\nMedian = ${tnum(r3(med))}`;
  }
  if (/modus|mode/.test(kind)) {
    const freq = new Map();
    nums.forEach((x) => freq.set(x, (freq.get(x) || 0) + 1));
    let max = 0;
    let modes = [];
    freq.forEach((c, v) => {
      if (c > max) {
        max = c;
        modes = [v];
      } else if (c === max) {
        modes.push(v);
      }
    });
    if (max <= 1) return `Modus dari ${listStr}\nSemua nilai muncul sama banyak, tidak ada modus tunggal.`;
    return `Modus dari ${listStr}\nModus = ${modes.map(tnum).join(', ')} (muncul ${max}x)`;
  }
  const variance = nums.reduce((a, x) => a + (x - mean) ** 2, 0) / n;
  const sd = Math.sqrt(variance);
  return `Simpangan baku dari ${listStr}\nRata-rata = ${tnum(r3(mean))}\nVarians = ${tnum(r3(variance))}\nSimpangan baku = √${tnum(r3(variance))} = ${tnum(r3(sd))}`;
}
