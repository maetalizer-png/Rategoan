// Adapter 1/3 - Template. Bungkus alur yang SUDAH ADA dan SUDAH JALAN:
// raget-agents/agent.js#respond() sendiri sudah mengorkestrasi lebih dari
// selusin mesin khusus (math, bilingual, STEM, sosial, dst - lihat README.md)
// dan berujung ke llm-engine.js#craft() sebagai fallback generik. Adapter ini
// TIDAK menduplikasi logika itu, cuma membungkusnya dalam kontrak
// init()/ask()/status() (lihat engine-contract.js) supaya engine-router.js
// bisa memperlakukannya setara dengan otak Neural dan LLM Lokal.
//
// Ini baseline yang tidak pernah gagal - status() selalu ready:true.
import { agent } from '../raget-agents/agent.js';

async function init() {
  // Tidak ada resource async yang perlu disiapkan di sini - agent.js dan
  // llm-engine.js lazy-load data mereka sendiri per-panggilan (fetch JSON
  // per domain, dst). init() ada supaya bentuknya konsisten dengan adapter
  // lain yang memang butuh langkah persiapan (mis. load checkpoint neural).
  return true;
}

async function ask(prompt, context) {
  const messages = (context && context.messages) || [];
  return agent.respond(messages, prompt);
}

function status() {
  return {
    ready: true,
    reason: 'Mesin rule-based/template - selalu siap, jadi baseline yang tidak pernah gagal.',
  };
}

export const templateAdapter = Object.freeze({
  id: 'template',
  label: 'Raget Template',
  init,
  ask,
  status,
});
