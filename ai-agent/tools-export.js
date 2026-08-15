import { agentTools } from './agent-tools.js';
import { collectionStore } from '../raget-memory/collection-store.js';
import { emailComposer } from '../vault/email/composer.js';

const EXPORT_KINDS = new Set(['ekspor', 'laporan_otak', 'share_wa', 'export_chat', 'bagikan_kartu', 'export_catatan', 'email']);

function handles(kind) {
  return EXPORT_KINDS.has(kind);
}

async function run(kind, prompt, messages) {
  if (kind === 'ekspor') return agentTools.eksporLog();
  if (kind === 'laporan_otak') return agentTools.laporanOtak();
  if (kind === 'share_wa') return agentTools.shareToWhatsApp({ title: 'Chat', messages: messages || [] });
  if (kind === 'export_chat') {
    const p = prompt.toLowerCase();
    const format = /markdown|\bmd\b/.test(p) ? 'markdown' : /json/.test(p) ? 'json' : /pdf/.test(p) ? 'pdf' : 'txt';
    return agentTools.exportChat({ title: 'Chat', messages: messages || [] }, format);
  }
  if (kind === 'bagikan_kartu') {
    const negara = prompt.replace(/^bagikan\s+kartu\s+/i, '').trim();
    const result = await agentTools.bagikanKartu(negara);
    collectionStore.addItem({ kind: 'artifact', artifactType: 'country_card', text: result, tag: 'artefak', chatTitle: 'Kartu ' + negara }).catch(() => {});
    return result;
  }
  if (kind === 'export_catatan') {
    const format = /markdown|\bmd\b/i.test(prompt) ? 'markdown' : 'txt';
    const result = agentTools.eksporCatatan(format);
    collectionStore.addItem({ kind: 'artifact', artifactType: 'export', text: result, tag: 'artefak', chatTitle: 'Ekspor Catatan' }).catch(() => {});
    return result;
  }
  if (kind === 'email') {
    const result = await emailComposer.generateEmail(prompt);
    collectionStore.addItem({ kind: 'artifact', artifactType: 'email_draft', text: result, tag: 'artefak', chatTitle: 'Draft Email' }).catch(() => {});
    return result;
  }
  return null;
}

export const toolsExport = Object.freeze({
  handles,
  run,
});
