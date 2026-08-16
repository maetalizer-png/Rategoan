import { agentTools } from './agent-tools.js';
import { mathEngine } from './math-engine.js';

function replaceMathWords(text) {
  return text
    .replace(/(\d+)\s*ditambah\s*(\d+)/gi, '$1+$2')
    .replace(/(\d+)\s*dikurang\s*(\d+)/gi, '$1-$2')
    .replace(/(\d+)\s*kali\s*(\d+)/gi, '$1*$2')
    .replace(/(\d+)\s*dibagi\s*(\d+)/gi, '$1/$2')
    .replace(/(\d+)\s*plus\s*(\d+)/gi, '$1+$2')
    .replace(/(\d+)\s*minus\s*(\d+)/gi, '$1-$2')
    .replace(/(\d+)\s*times\s*(\d+)/gi, '$1*$2')
    .replace(/(\d+)\s*divided\s+by\s*(\d+)/gi, '$1/$2');
}

const EXPR_CHARS = '0-9+\\-*/×÷^%(),.\\s';
const FUNC_NAMES = 'sqrt|abs|round';

function extractMathExpr(text) {
  const replaced = replaceMathWords(text);
  const withFuncs = new RegExp('(?:' + FUNC_NAMES + ')\\s*\\([0-9.,\\s+\\-*/×÷^%()]*\\)', 'gi');
  const funcMatch = replaced.match(withFuncs);
  if (funcMatch && funcMatch.length) return funcMatch.sort((a, b) => b.length - a.length)[0].replace(/\s+/g, '');
  const matches = replaced.match(/[0-9]+(?:\s*[+\-*/×÷^%]\s*[0-9]+)+/g);
  if (!matches || !matches.length) return null;
  return matches.sort((a, b) => b.length - a.length)[0].replace(/\s+/g, '');
}

function isMathStatement(t) {
  return /hasilnya\s*-?[0-9]/i.test(t) && !/\bberapa\b/i.test(t);
}

function looksLikeMath(t) {
  const stripped = t
    .replace(/^(hitung|berapa|calculate|what\s+is|compute)\s*/i, '')
    .replace(/\s*(hasilnya|sama\s*dengan)?\s*\??$/i, '')
    .trim();
  const re = new RegExp('^[' + EXPR_CHARS + ']+$|^(?:' + FUNC_NAMES + ')\\s*\\([' + EXPR_CHARS + ']*\\)$', 'i');
  return stripped.length > 0 && /[0-9]/.test(stripped) && re.test(stripped);
}

function isMathQuestion(t) {
  if (isMathStatement(t)) return false;
  if (/%\s*(dari|of)\b/.test(t)) return true;
  if (looksLikeMath(t)) return true;
  return !!extractMathExpr(t);
}

function tryMath(text) {
  const t = text.trim();
  if (!/^(hitung|calculate|compute)\b/i.test(t) && !isMathQuestion(t.toLowerCase())) return null;
  if (/%\s*(dari|of)\b/i.test(t)) return agentTools.hitung(t);
  if (mathEngine.tryConvertUnit(t) || mathEngine.tryConvertCurrency(t)) return agentTools.hitung(t);
  const stripped = t
    .replace(/\b(langkah|cara\s*(hitung|kerja)nya|step\s*by\s*step|show\s*steps?)\b/gi, ' ')
    .replace(/^(hitung|berapa|calculate|what\s+is|compute)\s*/i, '')
    .replace(/\?+$/, '')
    .trim();
  if (mathEngine.parse(stripped)) return agentTools.hitung(t);
  const expr = extractMathExpr(t) || stripped;
  return agentTools.hitung(expr);
}

export const toolsMath = Object.freeze({
  isMathStatement,
  isMathQuestion,
  extractMathExpr,
  tryMath,
});
