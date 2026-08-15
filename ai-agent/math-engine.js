const FUNCS = Object.freeze({
  sqrt: (x) => Math.sqrt(x),
  abs: (x) => Math.abs(x),
  round: (x) => Math.round(x),
});

const UNIT_GROUPS = {
  panjang: { m: 1, km: 1000, cm: 0.01, mm: 0.001, mi: 1609.344, ft: 0.3048 },
  berat: { g: 1, kg: 1000, mg: 0.001, ton: 1000000, lb: 453.592, oz: 28.3495 },
};

const UNIT_ALIAS = {
  m: 'm', meter: 'm', meters: 'm',
  km: 'km', kilometer: 'km', kilometers: 'km',
  cm: 'cm', centimeter: 'cm', centimeters: 'cm',
  mm: 'mm', milimeter: 'mm', millimeter: 'mm', millimeters: 'mm',
  mi: 'mi', mile: 'mi', miles: 'mi',
  ft: 'ft', feet: 'ft', foot: 'ft',
  g: 'g', gram: 'g', grams: 'g',
  kg: 'kg', kilogram: 'kg', kilograms: 'kg',
  mg: 'mg', miligram: 'mg', milligram: 'mg', milligrams: 'mg',
  ton: 'ton', tonne: 'ton', tons: 'ton',
  lb: 'lb', lbs: 'lb', pound: 'lb', pounds: 'lb',
  oz: 'oz', ounce: 'oz', ounces: 'oz',
};

const CURRENCY_RATES_TO_USD = Object.freeze({
  usd: 1,
  idr: 1 / 15800,
  eur: 1.09,
  jpy: 1 / 149,
  sgd: 0.74,
  myr: 0.22,
  gbp: 1.27,
  aud: 0.66,
});

function currencyLabel(code) {
  const map = { usd: 'USD', idr: 'IDR', eur: 'EUR', jpy: 'JPY', sgd: 'SGD', myr: 'MYR', gbp: 'GBP', aud: 'AUD' };
  return map[code] || code.toUpperCase();
}

function normalizeExpr(raw) {
  let s = String(raw || '')
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .trim();
  s = s.replace(/(\d),(?=\d{3}(\D|$))/g, '$1');
  return s;
}

function tokenize(expr) {
  const s = normalizeExpr(expr);
  const tokens = [];
  const re = /([0-9]*\.?[0-9]+|sqrt|abs|round|[+\-*/^%()])/gi;
  let match;
  let cursor = 0;
  while ((match = re.exec(s)) !== null) {
    const gap = s.slice(cursor, match.index);
    if (gap.trim() !== '') return null;
    const raw = match[1];
    const lower = raw.toLowerCase();
    if (FUNCS[lower]) tokens.push({ type: 'func', value: lower });
    else if (/^[0-9.]+$/.test(raw)) tokens.push({ type: 'num', value: parseFloat(raw) });
    else tokens.push({ type: 'op', value: raw });
    cursor = match.index + raw.length;
  }
  if (s.slice(cursor).trim() !== '') return null;
  return tokens.length ? tokens : null;
}

function makeParser(tokens) {
  let pos = 0;
  const peek = () => tokens[pos] || null;
  const next = () => tokens[pos++];

  function parsePrimary() {
    const tok = peek();
    if (!tok) return null;
    if (tok.type === 'num') {
      next();
      return { type: 'num', value: tok.value };
    }
    if (tok.type === 'func') {
      next();
      const open = peek();
      if (!open || open.value !== '(') return null;
      next();
      const arg = parseExpr();
      if (!arg) return null;
      const close = peek();
      if (!close || close.value !== ')') return null;
      next();
      return { type: 'call', fn: tok.value, arg };
    }
    if (tok.type === 'op' && tok.value === '(') {
      next();
      const inner = parseExpr();
      if (!inner) return null;
      const close = peek();
      if (!close || close.value !== ')') return null;
      next();
      return inner;
    }
    return null;
  }

  function parseUnary() {
    const tok = peek();
    if (tok && tok.type === 'op' && tok.value === '-') {
      next();
      const operand = parseUnary();
      if (!operand) return null;
      return { type: 'unary', op: '-', operand };
    }
    return parsePrimary();
  }

  function parsePower() {
    const base = parseUnary();
    if (!base) return null;
    const tok = peek();
    if (tok && tok.type === 'op' && tok.value === '^') {
      next();
      const exponent = parsePower();
      if (!exponent) return null;
      return { type: 'binop', op: '^', left: base, right: exponent };
    }
    return base;
  }

  function parseTerm() {
    let node = parsePower();
    if (!node) return null;
    for (;;) {
      const tok = peek();
      if (!tok || tok.type !== 'op' || !['*', '/', '%'].includes(tok.value)) break;
      next();
      const right = parsePower();
      if (!right) return null;
      node = { type: 'binop', op: tok.value, left: node, right };
    }
    return node;
  }

  function parseExpr() {
    let node = parseTerm();
    if (!node) return null;
    for (;;) {
      const tok = peek();
      if (!tok || tok.type !== 'op' || !['+', '-'].includes(tok.value)) break;
      next();
      const right = parseTerm();
      if (!right) return null;
      node = { type: 'binop', op: tok.value, left: node, right };
    }
    return node;
  }

  return { parseExpr, isDone: () => pos >= tokens.length };
}

function parse(expr) {
  const tokens = tokenize(expr);
  if (!tokens) return null;
  const parser = makeParser(tokens);
  const ast = parser.parseExpr();
  if (!ast || !parser.isDone()) return null;
  return ast;
}

function evalNode(node, steps) {
  if (node.type === 'num') return node.value;
  if (node.type === 'unary') {
    const v = evalNode(node.operand, steps);
    return v === null ? null : -v;
  }
  if (node.type === 'call') {
    const v = evalNode(node.arg, steps);
    if (v === null || !FUNCS[node.fn]) return null;
    const result = FUNCS[node.fn](v);
    if (steps) steps.push(node.fn + '(' + trimNum(v) + ') = ' + trimNum(result));
    return result;
  }
  const a = evalNode(node.left, steps);
  const b = evalNode(node.right, steps);
  if (a === null || b === null) return null;
  let result;
  if (node.op === '+') result = a + b;
  else if (node.op === '-') result = a - b;
  else if (node.op === '*') result = a * b;
  else if (node.op === '/') result = b === 0 ? NaN : a / b;
  else if (node.op === '%') result = b === 0 ? NaN : a % b;
  else if (node.op === '^') result = Math.pow(a, b);
  else return null;
  if (steps && typeof result === 'number' && isFinite(result)) {
    steps.push(trimNum(a) + ' ' + node.op + ' ' + trimNum(b) + ' = ' + trimNum(result));
  }
  return typeof result === 'number' ? result : null;
}

function trimNum(n) {
  return Math.round(n * 1e6) / 1e6;
}

function evaluate(expr, opts) {
  const withSteps = !!(opts && opts.steps);
  const ast = parse(expr);
  if (!ast) return { ok: false, error: 'parse' };
  const steps = withSteps ? [] : null;
  const value = evalNode(ast, steps);
  if (value === null || !isFinite(value)) return { ok: false, error: 'eval' };
  return { ok: true, value: trimNum(value), steps: steps || [] };
}

function parsePercentOf(text) {
  const m = String(text || '').match(/(-?[0-9.,]+)\s*%\s*(?:dari|of)\s*(-?[0-9.,]+)/i);
  if (!m) return null;
  const pct = parseFloat(normalizeExpr(m[1]));
  const base = parseFloat(normalizeExpr(m[2]));
  if (!isFinite(pct) || !isFinite(base)) return null;
  const value = trimNum((pct / 100) * base);
  return { ok: true, pct, base, value, steps: [pct + '% dari ' + base + ' = (' + pct + ' / 100) x ' + base + ' = ' + value] };
}

function convertLength(value, from, to) {
  const table = UNIT_GROUPS.panjang;
  if (!(from in table) || !(to in table)) return null;
  return trimNum((value * table[from]) / table[to]);
}

function convertWeight(value, from, to) {
  const table = UNIT_GROUPS.berat;
  if (!(from in table) || !(to in table)) return null;
  return trimNum((value * table[from]) / table[to]);
}

function celsiusToFahrenheit(c) {
  return trimNum((c * 9) / 5 + 32);
}
function fahrenheitToCelsius(f) {
  return trimNum(((f - 32) * 5) / 9);
}

const TEMP_ALIAS = { c: 'c', celsius: 'c', celcius: 'c', f: 'f', fahrenheit: 'f' };

function tryConvertUnit(text) {
  const t = String(text || '').trim().toLowerCase();
  const m = t.match(/(-?[0-9.,]+)\s*([a-z]+)\s*(?:ke|dalam|to|in)\s*([a-z]+)/i);
  if (!m) return null;
  const value = parseFloat(normalizeExpr(m[1]));
  if (!isFinite(value)) return null;
  const fromRaw = m[2];
  const toRaw = m[3];
  if (TEMP_ALIAS[fromRaw] && TEMP_ALIAS[toRaw]) {
    const from = TEMP_ALIAS[fromRaw];
    const to = TEMP_ALIAS[toRaw];
    if (from === to) return { ok: true, value, unit: to, kind: 'suhu' };
    const value2 = from === 'c' ? celsiusToFahrenheit(value) : fahrenheitToCelsius(value);
    return { ok: true, value: value2, unit: to === 'c' ? 'celsius' : 'fahrenheit', kind: 'suhu' };
  }
  const from = UNIT_ALIAS[fromRaw];
  const to = UNIT_ALIAS[toRaw];
  if (!from || !to) return null;
  if (from in UNIT_GROUPS.panjang && to in UNIT_GROUPS.panjang) {
    const value2 = convertLength(value, from, to);
    return value2 === null ? null : { ok: true, value: value2, unit: to, kind: 'panjang' };
  }
  if (from in UNIT_GROUPS.berat && to in UNIT_GROUPS.berat) {
    const value2 = convertWeight(value, from, to);
    return value2 === null ? null : { ok: true, value: value2, unit: to, kind: 'berat' };
  }
  return null;
}

const CURRENCY_ALIAS = {
  usd: 'usd', dollar: 'usd', dolar: 'usd',
  idr: 'idr', rupiah: 'idr', rp: 'idr',
  eur: 'eur', euro: 'eur',
  jpy: 'jpy', yen: 'jpy',
  sgd: 'sgd',
  myr: 'myr', ringgit: 'myr',
  gbp: 'gbp', pound: 'gbp', poundsterling: 'gbp',
  aud: 'aud',
};

function tryConvertCurrency(text) {
  const t = String(text || '').trim().toLowerCase();
  const m = t.match(/(-?[0-9.,]+)\s*([a-z]+)\s*(?:ke|dalam|to|in)\s*([a-z]+)/i);
  if (!m) return null;
  const value = parseFloat(normalizeExpr(m[1]));
  if (!isFinite(value)) return null;
  const from = CURRENCY_ALIAS[m[2]];
  const to = CURRENCY_ALIAS[m[3]];
  if (!from || !to || !(from in CURRENCY_RATES_TO_USD) || !(to in CURRENCY_RATES_TO_USD)) return null;
  const usd = value * CURRENCY_RATES_TO_USD[from];
  const result = trimNum(usd / CURRENCY_RATES_TO_USD[to]);
  return { ok: true, value: result, from: currencyLabel(from), to: currencyLabel(to) };
}

export const mathEngine = Object.freeze({
  tokenize,
  parse,
  evaluate,
  parsePercentOf,
  tryConvertUnit,
  tryConvertCurrency,
  normalizeExpr,
  FUNCS,
});
