const SCHEMA_VERSION = 2;

function createNote(question, answer, feedback, intent) {
  return {
    id: 'n' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    question: String(question || ''),
    answer: String(answer || ''),
    feedback: feedback == null ? null : !!feedback,
    intent: intent || 'generic',
    time: Date.now(),
    version: SCHEMA_VERSION,
  };
}

function isValidNote(note) {
  return !!note && typeof note.question === 'string' && typeof note.answer === 'string';
}

// FR-5.1: entry logged when a user query reaches the very end of agent.js's
// fallback chain with truly nothing matched (see agent.js#respondCore). Kept
// deliberately small - just enough for a developer to later triage and write new
// rules (FR-5.2), not a full analytics record.
function createUnmatchedEntry(query, enginesTried) {
  return {
    id: 'u' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    query: String(query || ''),
    time: Date.now(),
    enginesTried: Array.isArray(enginesTried) ? enginesTried : [],
    version: SCHEMA_VERSION,
  };
}

function isValidUnmatched(entry) {
  return !!entry && typeof entry.query === 'string';
}

export const ragetSchema = Object.freeze({
  version: SCHEMA_VERSION,
  createNote,
  isValidNote,
  createUnmatchedEntry,
  isValidUnmatched,
});
