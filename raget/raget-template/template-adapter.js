// Adapter 1/3 - Template. Bungkus alur yang SUDAH ADA dan SUDAH JALAN:
// raget-agents/agent.js#respond() sendiri sudah mengorkestrasi lebih dari
// selusin mesin khusus (math, bilingual, STEM, sosial, dst - lihat README.md)
// dan berujung ke llm-engine.js#craft() sebagai fallback generik. Adapter ini
// TIDAK menduplikasi logika itu, cuma membungkusnya dalam kontrak
// init()/ask()/status() (lihat engine-contract.js) supaya engine-router.js
// bisa memperlakukannya setara dengan otak Neural.
//
// Ini baseline yang tidak pernah gagal - status() selalu ready:true.
import { agent } from '../raget-agents/agent.js';

async function init() {
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
