import { agentTools } from './agent-tools.js';

function replaceMathWords(text) {
  return text
    .replace(/(\d+)\s*ditambah\s*(\d+)/gi, '$1+$2')
    .replace(/(\d+)\s*dikurang\s*(\d+)/gi, '$1-$2')
    .replace(/(\d+)\s*kali\s*(\d+)/gi, '$1*$2')
    .replace(/(\d+)\s*dibagi\s*(\d+)/gi, '$1/$2');
}

function extractMathExpr(text) {
  const replaced = replaceMathWords(text);
  const matches = replaced.match(/[0-9]+(?:\s*[+\-*/]\s*[0-9]+)+/g);
  if (!matches || !matches.length) return null;
  return matches.sort((a, b) => b.length - a.length)[0].replace(/\s+/g, '');
}

function isMathStatement(t) {
  return /hasilnya\s*-?[0-9]/i.test(t) && !/\bberapa\b/i.test(t);
}

function looksLikeMath(t) {
  const stripped = t
    .replace(/^(hitung|berapa)\s*/i, '')
    .replace(/\s*(hasilnya|sama\s*dengan)?\s*\??$/i, '')
    .trim();
  return stripped.length > 0 && /[0-9]/.test(stripped) && /^[0-9()\s+\-*/.]+$/.test(stripped);
}

function isMathQuestion(t) {
  if (isMathStatement(t)) return false;
  if (/%\s*dari\b/.test(t)) return true;
  if (looksLikeMath(t)) return true;
  return !!extractMathExpr(t);
}

function tryMath(text) {
  const t = text.trim();
  if (!/^hitung\b/i.test(t) && !isMathQuestion(t.toLowerCase())) return null;
  if (/%\s*dari\b/i.test(t)) return agentTools.hitung(t);
  const expr = extractMathExpr(t) || t.replace(/^(hitung|berapa)\s*/i, '');
  return agentTools.hitung(expr);
}

export const toolsMath = Object.freeze({
  isMathStatement,
  isMathQuestion,
  extractMathExpr,
  tryMath,
});
