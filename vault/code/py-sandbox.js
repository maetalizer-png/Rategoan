export const PY_SANDBOX_WATCH_MS = 2000;

function evalPyExpr(rawExpr, env, fns) {
  const expr = String(rawExpr || '').trim();
  if (!expr) return '';
  if ((expr.startsWith('"') && expr.endsWith('"')) || (expr.startsWith("'") && expr.endsWith("'"))) {
    return expr.slice(1, -1);
  }
  if (/^-?\d+(\.\d+)?$/.test(expr)) {
    return Number(expr);
  }
  // Handle top-level + concatenation or addition outside parentheses
  let depth = 0;
  let inQuote = '';
  for (let i = 0; i < expr.length; i += 1) {
    const ch = expr[i];
    if (inQuote) {
      if (ch === inQuote && expr[i - 1] !== '\\') inQuote = '';
      continue;
    }
    if (ch === '"' || ch === "'") {
      inQuote = ch;
      continue;
    }
    if (ch === '(' || ch === '[') depth += 1;
    else if (ch === ')' || ch === ']') depth = Math.max(0, depth - 1);
    else if (depth === 0 && (ch === '+' || ch === '-' || ch === '*' || ch === '/') && i > 0) {
      const left = evalPyExpr(expr.slice(0, i), env, fns);
      const right = evalPyExpr(expr.slice(i + 1), env, fns);
      if (ch === '+') {
        if (typeof left === 'string' || typeof right === 'string') return String(left) + String(right);
        return (Number(left) || 0) + (Number(right) || 0);
      }
      if (ch === '-') return (Number(left) || 0) - (Number(right) || 0);
      if (ch === '*') return (Number(left) || 0) * (Number(right) || 0);
      if (ch === '/') return (Number(right) || 0) === 0 ? 0 : (Number(left) || 0) / (Number(right) || 0);
    }
  }
  // Function call: name(args...)
  const callMatch = expr.match(/^([A-Za-z_]\w*)\(([\s\S]*)\)$/);
  if (callMatch) {
    const fnName = callMatch[1];
    const argsRaw = callMatch[2].trim();
    const args = [];
    if (argsRaw) {
      let d = 0;
      let q = '';
      let start = 0;
      for (let i = 0; i < argsRaw.length; i += 1) {
        const c = argsRaw[i];
        if (q) {
          if (c === q && argsRaw[i - 1] !== '\\') q = '';
          continue;
        }
        if (c === '"' || c === "'") q = c;
        else if (c === '(' || c === '[') d += 1;
        else if (c === ')' || c === ']') d = Math.max(0, d - 1);
        else if (c === ',' && d === 0) {
          args.push(evalPyExpr(argsRaw.slice(start, i), env, fns));
          start = i + 1;
        }
      }
      args.push(evalPyExpr(argsRaw.slice(start), env, fns));
    }
    if (fnName === 'len') {
      const v = args[0];
      return v == null ? 0 : (Array.isArray(v) || typeof v === 'string' ? v.length : Object.keys(v).length);
    }
    if (fnName === 'str') return String(args[0] == null ? '' : args[0]);
    if (fnName === 'int') return parseInt(args[0], 10) || 0;
    if (fnName === 'float') return parseFloat(args[0]) || 0;
    if (fnName === 'abs') return Math.abs(Number(args[0]) || 0);
    if (fnName === 'max') return Math.max(...args.map((a) => Number(a) || 0));
    if (fnName === 'min') return Math.min(...args.map((a) => Number(a) || 0));
    if (fnName === 'sum') {
      const arr = Array.isArray(args[0]) ? args[0] : args;
      return arr.reduce((acc, v) => acc + (Number(v) || 0), 0);
    }
    if (fns[fnName]) {
      const def = fns[fnName];
      const localEnv = Object.assign({}, env);
      def.params.forEach((param, idx) => {
        localEnv[param] = args[idx];
      });
      for (let b = 0; b < def.body.length; b += 1) {
        const stmt = def.body[b].trim();
        if (stmt.startsWith('return ')) {
          return evalPyExpr(stmt.slice(7), localEnv, fns);
        }
        const assign = stmt.match(/^([A-Za-z_]\w*)\s*=\s*([\s\S]+)$/);
        if (assign) {
          localEnv[assign[1]] = evalPyExpr(assign[2], localEnv, fns);
        }
      }
      return null;
    }
    throw new Error('NameError: name "' + fnName + '" is not defined');
  }
  if (expr.startsWith('[') && expr.endsWith(']')) {
    const inner = expr.slice(1, -1).trim();
    if (!inner) return [];
    return inner.split(',').map((item) => evalPyExpr(item, env, fns));
  }
  if (Object.prototype.hasOwnProperty.call(env, expr)) {
    return env[expr];
  }
  throw new Error('NameError: name "' + expr + '" is not defined');
}

export async function runPythonSource(code) {
  const src = String(code || '');
  if (!src.trim()) return { ok: false, logs: [], output: '', error: 'Skrip Python kosong.' };
  const lines = src.replace(/\r\n/g, '\n').split('\n');
  const env = {};
  const fns = {};
  const logs = [];
  try {
    let i = 0;
    while (i < lines.length) {
      const rawLine = lines[i];
      const trimmed = rawLine.replace(/#.*$/, '').trim();
      if (!trimmed) {
        i += 1;
        continue;
      }
      const defMatch = trimmed.match(/^def\s+([A-Za-z_]\w*)\(([^)]*)\)\s*:\s*$/);
      if (defMatch) {
        const name = defMatch[1];
        const params = defMatch[2].split(',').map((p) => p.trim()).filter(Boolean);
        const body = [];
        i += 1;
        while (i < lines.length) {
          const nextRaw = lines[i];
          const nextClean = nextRaw.replace(/#.*$/, '');
          if (!nextClean.trim()) {
            i += 1;
            continue;
          }
          if (/^\s+/.test(nextRaw)) {
            body.push(nextClean.trim());
            i += 1;
          } else {
            break;
          }
        }
        fns[name] = { params, body };
        continue;
      }
      const printMatch = trimmed.match(/^print\(([\s\S]*)\)$/);
      if (printMatch) {
        const val = evalPyExpr(printMatch[1], env, fns);
        logs.push(String(val == null ? '' : val));
        i += 1;
        continue;
      }
      const assignMatch = trimmed.match(/^([A-Za-z_]\w*)\s*=\s*([\s\S]+)$/);
      if (assignMatch) {
        env[assignMatch[1]] = evalPyExpr(assignMatch[2], env, fns);
        i += 1;
        continue;
      }
      evalPyExpr(trimmed, env, fns);
      i += 1;
    }
    return {
      ok: true,
      logs,
      output: logs.join('\n'),
      error: '',
    };
  } catch (err) {
    return {
      ok: false,
      logs,
      output: logs.join('\n'),
      error: err && err.message ? err.message : String(err),
    };
  }
}

export const pySandbox = Object.freeze({
  run: runPythonSource,
});
