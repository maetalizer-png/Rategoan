const MAX_STACK = 3;

let stack = [];
let relationLast = null;

function pushEntity(entity) {
  const e = String(entity || '').trim().toLowerCase();
  if (!e) return;
  stack = [e, ...stack.filter((x) => x !== e)].slice(0, MAX_STACK);
}

function getStack() {
  return stack.slice();
}

function topEntity() {
  return stack.length ? stack[0] : null;
}

function setRelation(relation) {
  relationLast = relation || null;
}

function getRelation() {
  return relationLast;
}

function clear() {
  stack = [];
  relationLast = null;
}

export const memoryContext = Object.freeze({
  pushEntity,
  getStack,
  topEntity,
  setRelation,
  getRelation,
  clear,
});
