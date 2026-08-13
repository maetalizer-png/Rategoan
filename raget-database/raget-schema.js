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

export const ragetSchema = Object.freeze({
  version: SCHEMA_VERSION,
  createNote,
  isValidNote,
});
