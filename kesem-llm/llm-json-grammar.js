// Character-level JSON structural grammar — a small pushdown automaton
// that tracks exactly what characters are legal next, given everything
// consumed so far, so token sampling can reject any continuation that
// would make the output invalid JSON.
//
// Scope, deliberately: this guarantees STRUCTURAL validity (the result
// always passes JSON.parse()) — it says nothing about which keys/values
// are semantically correct. That's a different, much harder problem
// (schema-level constraints), and out of scope for what "constrained
// JSON output" needs to solve here: today, agents can freely emit
// text that ISN'T even parseable JSON (safeParseResponse() in
// js/utils.js is a best-effort REPAIR of that after the fact); this
// module prevents the malformed case from being generated at all.
//
// Zero dependencies, pure functions, fully unit-testable in isolation
// (see test.js) without touching the model/sampler/tokenizer at all.

const WHITESPACE = new Set([' ', '\t', '\n', '\r']);
const DIGITS = new Set('0123456789'.split(''));
const ESCAPABLE = new Set(['"', '\\', '/', 'b', 'f', 'n', 'r', 't']);
const HEX = /[0-9a-fA-F]/;

function createState() {
    return { stack: [], expect: 'value', sub: null };
}

function cloneState(state) {
    return { stack: state.stack.slice(), expect: state.expect, sub: state.sub ? Object.assign({}, state.sub) : null };
}

// Called whenever a value (string/number/literal/object/array) has just
// closed — decides what's legal next based on whether that value was an
// object KEY (expect === 'key' at the moment it closed) or a normal
// value, and what container (if any) we're still inside.
function afterValueClosed(state) {
    const s = cloneState(state);
    s.sub = null;
    if (s.expect === 'key') {
        s.expect = 'colon';
        return s;
    }
    if (s.stack.length === 0) {
        s.expect = 'done';
        return s;
    }
    const top = s.stack[s.stack.length - 1];
    s.expect = top === 'object' ? 'comma-or-end-object' : 'comma-or-end-array';
    return s;
}

function closeContainer(state, type) {
    const s = cloneState(state);
    const top = s.stack.pop();
    if (top !== type) return null;
    return afterValueClosed(s);
}

function startLiteral(state, word) {
    const s = cloneState(state);
    s.sub = { kind: 'literal', word: word, pos: 1 };
    return s;
}

function stepStartValue(state, ch) {
    if (ch === '{') {
        const s = cloneState(state);
        s.stack.push('object');
        s.expect = 'key-or-end-object';
        return s;
    }
    if (ch === '[') {
        const s = cloneState(state);
        s.stack.push('array');
        s.expect = 'value-or-end-array';
        return s;
    }
    if (ch === '"') {
        const s = cloneState(state);
        s.sub = { kind: 'string', escaped: false };
        return s;
    }
    if (ch === '-') {
        const s = cloneState(state);
        s.sub = { kind: 'number', phase: 'after-minus' };
        return s;
    }
    if (ch === '0') {
        const s = cloneState(state);
        s.sub = { kind: 'number', phase: 'leading-zero' };
        return s;
    }
    if (DIGITS.has(ch)) {
        const s = cloneState(state);
        s.sub = { kind: 'number', phase: 'int' };
        return s;
    }
    if (ch === 't') return startLiteral(state, 'true');
    if (ch === 'f') return startLiteral(state, 'false');
    if (ch === 'n') return startLiteral(state, 'null');
    return null;
}

function afterValueClosedThenReconsume(state, ch) {
    const closed = afterValueClosed(state);
    if (!closed) return null;
    return stepChar(closed, ch);
}

// -?(0|[1-9][0-9]*)(\.[0-9]+)?([eE][+-]?[0-9]+)?
function stepNumber(state, ch) {
    const sub = state.sub;
    const isDigit = DIGITS.has(ch);
    switch (sub.phase) {
        case 'after-minus':
            if (ch === '0') { const s = cloneState(state); s.sub = { kind: 'number', phase: 'leading-zero' }; return s; }
            if (isDigit) { const s = cloneState(state); s.sub = { kind: 'number', phase: 'int' }; return s; }
            return null;
        case 'leading-zero':
            if (ch === '.') { const s = cloneState(state); s.sub = { kind: 'number', phase: 'frac-first' }; return s; }
            if (ch === 'e' || ch === 'E') { const s = cloneState(state); s.sub = { kind: 'number', phase: 'exp-sign' }; return s; }
            return afterValueClosedThenReconsume(state, ch);
        case 'int':
            if (isDigit) return state;
            if (ch === '.') { const s = cloneState(state); s.sub = { kind: 'number', phase: 'frac-first' }; return s; }
            if (ch === 'e' || ch === 'E') { const s = cloneState(state); s.sub = { kind: 'number', phase: 'exp-sign' }; return s; }
            return afterValueClosedThenReconsume(state, ch);
        case 'frac-first':
            if (isDigit) { const s = cloneState(state); s.sub = { kind: 'number', phase: 'frac-rest' }; return s; }
            return null;
        case 'frac-rest':
            if (isDigit) return state;
            if (ch === 'e' || ch === 'E') { const s = cloneState(state); s.sub = { kind: 'number', phase: 'exp-sign' }; return s; }
            return afterValueClosedThenReconsume(state, ch);
        case 'exp-sign':
            if (ch === '+' || ch === '-') { const s = cloneState(state); s.sub = { kind: 'number', phase: 'exp-first' }; return s; }
            if (isDigit) { const s = cloneState(state); s.sub = { kind: 'number', phase: 'exp-rest' }; return s; }
            return null;
        case 'exp-first':
            if (isDigit) { const s = cloneState(state); s.sub = { kind: 'number', phase: 'exp-rest' }; return s; }
            return null;
        case 'exp-rest':
            if (isDigit) return state;
            return afterValueClosedThenReconsume(state, ch);
        default:
            return null;
    }
}

function stepLiteral(state, ch) {
    const sub = state.sub;
    if (sub.word[sub.pos] !== ch) return null;
    if (sub.pos + 1 === sub.word.length) {
        const s = cloneState(state);
        s.sub = null;
        return afterValueClosed(s);
    }
    const s = cloneState(state);
    s.sub = { kind: 'literal', word: sub.word, pos: sub.pos + 1 };
    return s;
}

function stepString(state, ch) {
    const sub = state.sub;
    if (sub.unicodeRemaining) {
        if (!HEX.test(ch)) return null;
        const remaining = sub.unicodeRemaining - 1;
        const s = cloneState(state);
        s.sub = remaining > 0 ? { kind: 'string', escaped: false, unicodeRemaining: remaining } : { kind: 'string', escaped: false };
        return s;
    }
    if (sub.escaped) {
        if (ESCAPABLE.has(ch)) { const s = cloneState(state); s.sub = { kind: 'string', escaped: false }; return s; }
        if (ch === 'u') { const s = cloneState(state); s.sub = { kind: 'string', escaped: false, unicodeRemaining: 4 }; return s; }
        return null;
    }
    if (ch === '"') return afterValueClosed(state);
    if (ch === '\\') { const s = cloneState(state); s.sub = { kind: 'string', escaped: true }; return s; }
    // Bare control characters (0x00-0x1F) are illegal unescaped in a JSON string.
    if (ch.charCodeAt(0) < 0x20) return null;
    return state;
}

function stepChar(state, ch) {
    if (state.sub) {
        if (state.sub.kind === 'string') return stepString(state, ch);
        if (state.sub.kind === 'number') return stepNumber(state, ch);
        if (state.sub.kind === 'literal') return stepLiteral(state, ch);
        return null;
    }
    if (WHITESPACE.has(ch)) return state; // insignificant whitespace between tokens
    switch (state.expect) {
        case 'value':
            return stepStartValue(state, ch);
        case 'value-or-end-array':
            if (ch === ']') return closeContainer(state, 'array');
            { const s = cloneState(state); s.expect = 'value'; return stepStartValue(s, ch); }
        case 'key':
            if (ch === '"') { const s = cloneState(state); s.sub = { kind: 'string', escaped: false }; return s; }
            return null;
        case 'key-or-end-object':
            if (ch === '"') { const s = cloneState(state); s.sub = { kind: 'string', escaped: false }; s.expect = 'key'; return s; }
            if (ch === '}') return closeContainer(state, 'object');
            return null;
        case 'colon':
            if (ch === ':') { const s = cloneState(state); s.expect = 'value'; return s; }
            return null;
        case 'comma-or-end-object':
            if (ch === ',') { const s = cloneState(state); s.expect = 'key'; return s; }
            if (ch === '}') return closeContainer(state, 'object');
            return null;
        case 'comma-or-end-array':
            if (ch === ',') { const s = cloneState(state); s.expect = 'value'; return s; }
            if (ch === ']') return closeContainer(state, 'array');
            return null;
        case 'done':
            return null; // any non-whitespace after the top-level value is invalid
        default:
            return null;
    }
}

// A number has no explicit terminator character — it's "done" the
// instant a non-number character (or EOF) follows. This collapses a
// number sitting in a terminable phase into its post-value state, for
// completion checks (isComplete) and for deciding whether EOS is legal.
function normalize(state) {
    if (state.sub && state.sub.kind === 'number') {
        const terminable = ['leading-zero', 'int', 'frac-rest', 'exp-rest'];
        if (terminable.indexOf(state.sub.phase) !== -1) return afterValueClosed(state);
        return null;
    }
    return state;
}

function stepText(state, text) {
    let s = state;
    for (let i = 0; i < text.length; i++) {
        s = stepChar(s, text[i]);
        if (!s) return null;
    }
    return s;
}

function isComplete(state) {
    const norm = normalize(state);
    return !!norm && norm.expect === 'done' && norm.sub === null && norm.stack.length === 0;
}

export const LLMJSONGrammar = {
    createState: createState,
    stepChar: stepChar,
    stepText: stepText,
    isComplete: isComplete
};

window.LLMJSONGrammar = LLMJSONGrammar;
