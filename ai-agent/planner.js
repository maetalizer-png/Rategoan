/* ============================================================
   ai-agent/planner.js
   Turns a natural-language goal into a dynamic step list by
   asking the LLM (via provider-router.js) what capabilities are
   available right now — nothing here hardcodes a fixed workflow
   (spec section 13/15: capability-driven, not a hardcoded path).
   ============================================================ */

import { ProviderRouter } from './provider-router.js';
import { ToolRegistry } from './tool-registry.js';
import { AgentRegistry } from './agent-registry.js';

// Roster inti (13 agen pertama di agents/agents-config.js, sebelum
// digabung dengan file kategori general/politics/global/science) dipakai
// sebagai contoh nyata di prompt planner, bukan nama karangan — LLM boleh
// juga memakai agen lain dari ~200 total lewat AgentRegistry.findAgent()
// (dipanggil oleh execution-engine.js saat nama tidak cocok persis).
function describeCapabilities() {
    const tools = ToolRegistry.list().filter(function(t) { return t.available; }).map(function(t) { return t.name; });
    const workerCategories = AgentRegistry.listWorkerCategories();
    const coreAgents = AgentRegistry.listAnalysisAgents().slice(0, 13).map(function(a) {
        return a.id + ' (' + a.role + ')';
    });
    return {
        tools: tools,
        workerCategories: workerCategories,
        coreAgents: coreAgents,
        note: 'Untuk kind="agent", pilih dari daftar agen analisis di atas kalau cocok (mis. "Researcher" untuk riset, "Analyst" untuk analisis data, "Copywriter" untuk menulis, "Verifier" untuk verifikasi akhir). Kalau perlu spesialisasi lain di luar daftar itu (mis. bidang tertentu), tetap boleh sebut nama agen yang masuk akal secara role — sistem akan mencarinya di roster lengkap (~200 agen) lewat pencocokan role/kata kunci. Untuk kind="worker", gunakan id KESWORKER yang persis dan kategori di atas sebagai panduan (mis. "bitcoin_trader" untuk kategori crypto).'
    };
}

function buildPlanningPrompt(goal, context, capabilities) {
    return [
        'Anda adalah Planner untuk sebuah AI Agent orchestration layer.',
        'Tugas pengguna: "' + goal + '"',
        context && context.topic ? 'Topik: ' + context.topic : '',
        '',
        'Kapabilitas yang TERSEDIA SEKARANG (jangan buat kapabilitas di luar daftar ini):',
        'Agen analisis (contoh peran umum): ' + capabilities.coreAgents.join(', '),
        'Tools: ' + capabilities.tools.join(', '),
        'Kategori KESWORKER: ' + capabilities.workerCategories.join(', '),
        capabilities.note,
        '',
        'Buat rencana langkah demi langkah dalam format JSON array (HANYA JSON, tanpa teks lain). Setiap langkah:',
        '{ "id": string, "kind": "tool"|"agent"|"worker", "name": string, "args": object, "description": string }',
        'Maksimal 6 langkah. Pilih hanya langkah yang benar-benar diperlukan untuk tujuan di atas.'
    ].filter(Boolean).join('\n');
}

function parsePlanJSON(text) {
    let cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    const first = cleaned.indexOf('[');
    const last = cleaned.lastIndexOf(']');
    if (first !== -1 && last !== -1) cleaned = cleaned.slice(first, last + 1);
    const parsed = JSON.parse(cleaned);
    if (!Array.isArray(parsed)) throw new Error('Planner: hasil bukan array');
    return parsed.filter(function(step) {
        return step && typeof step.kind === 'string' && typeof step.name === 'string';
    }).map(function(step, index) {
        return {
            id: step.id || ('s' + index),
            kind: step.kind,
            name: step.name,
            args: step.args || {},
            description: step.description || ''
        };
    });
}

async function createPlan(goal, context) {
    const capabilities = describeCapabilities();
    const prompt = buildPlanningPrompt(goal, context, capabilities);
    const { text } = await ProviderRouter.generate(prompt, { agent: 'AIAgentPlanner', topic: (context && context.topic) || goal });
    try {
        return parsePlanJSON(text);
    } catch (e) {
        // Degraded but honest fallback: a single-step plan running the goal
        // itself through the default analysis-agent path, rather than
        // silently failing the whole task on a malformed plan response.
        return [{ id: 's0', kind: 'agent', name: 'Analyst', args: { instruction: goal }, description: 'Fallback: plan LLM tidak valid, jalankan analisis langsung.' }];
    }
}

export const Planner = Object.freeze({
    createPlan: createPlan,
    describeCapabilities: describeCapabilities
});
