import { memoryLong } from '../../raget-memory/memory-long.js';
import { memoryShort } from '../../raget-memory/memory-short.js';

function recallFacts() {
  return memoryLong.allFacts();
}

function recentContext(messages, limit) {
  return memoryShort.recent(messages, limit);
}

function forget() {
  memoryLong.clear();
}

export const memory = Object.freeze({
  recallFacts,
  recentContext,
  forget,
});
