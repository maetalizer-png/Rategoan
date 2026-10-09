function parseExpr(src) {
  let i = 0;
  function peek() { return src[i]; }
  function factor() {
    if (peek() === '(') {
      i += 1;
      const value = expr();
      if (src[i] !== ')') throw new Error('kurung');
      i += 1;
      return value;
    }
    if (peek() === '-') { i += 1; return -factor(); }
    let n = '';
    while (i < src.length && /[0-9.]/.test(src[i])) { n += src[i]; i += 1; }
    if (!n) throw new Error('sintaks');
    return Number(n);
  }
  function term() {
    let value = factor();
    while (peek() === '*' || peek() === '/') {
      const op = src[i];
      i += 1;
      const right = factor();
      value = op === '*' ? value * right : value / right;
    }
    return value;
  }
  function expr() {
    let value = term();
    while (peek() === '+' || peek() === '-') {
      const op = src[i];
      i += 1;
      const right = term();
      value = op === '+' ? value + right : value - right;
    }
    return value;
  }
  const value = expr();
  if (i !== src.length) throw new Error('sisa');
  return value;
}

export function runTerminal(line) {
  const src = String(line || '').replace(/\s+/g, '');
  if (!src) return '';
  if (!/^[0-9+\-*/().]+$/.test(src)) throw new Error('sintaks');
  return parseExpr(src);
}
