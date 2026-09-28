import { routerIntent } from './router-intent.js';
import { flowHub } from './flow-hub.js';

const SLIDE_ACTION_RE = /\b(buat(kan)?|bikin|jadikan|susun|export|unduh)\b/i;
const SLIDE_NOUN_RE = /\b(slide|ppt|pptx)\b/i;
const FILE_RE = /\b(baca|ringkas|rangkum|ekstrak|jelaskan|uraikan|dokumen|lampiran|file)\b/i;

function lastAi(messages) {
  const list = messages || [];
  for (let i = list.length - 1; i >= 0; i -= 1) {
    if (list[i].role !== 'user' && list[i].text) return list[i];
  }
  return null;
}

function lastFile(messages, attach) {
  if (attach && (attach.fileText || attach.fileTextError)) return attach;
  const list = messages || [];
  for (let i = list.length - 1; i >= 0; i -= 1) {
    if (list[i].attach && list[i].attach.fileText) return list[i].attach;
  }
  return null;
}

function inspect(prompt, context) {
  const text = String(prompt || '').trim();
  const messages = (context && context.messages) || [];
  const attach = context && context.attach;
  const web = !!(context && context.websearch);
  const prev = lastAi(messages);
  const file = lastFile(messages, attach);
  const tool = routerIntent.detectTool(web ? 'googling ' + text : text);
  let route = 'engine';
  if (/^(lanjut|lanjutkan|dari ini)$/i.test(text) && prev) route = 'slide';
  else if (SLIDE_ACTION_RE.test(text) && SLIDE_NOUN_RE.test(text)) route = 'slide';
  else if (file && FILE_RE.test(text)) route = 'file';
  else if (flowHub.wantsResearch(text)) route = 'research';
  else if (flowHub.wantsThink(text)) route = 'think';
  else if (flowHub.wantsCollection(text) || tool === 'cari_koleksi') route = 'collection';
  else if (web || tool === 'websearch') route = 'web';
  else if (tool) route = 'tool';
  return {
    prompt: text,
    route,
    tool: tool || null,
    web,
    queries: route === 'web' ? flowHub.queries(text) : [],
    hasFile: !!file,
    hasLastAnswer: !!prev,
    answerType: routerIntent.detectAnswerType(text),
  };
}

export const turnPipeline = Object.freeze({
  stages: Object.freeze(['intent', 'context', 'route', 'compose', 'qc', 'act']),
  inspect,
});
