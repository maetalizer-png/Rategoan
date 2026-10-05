import { indexDocs } from '../../raget/raget-vault/local-rag.js';
import { extractEntities } from '../../raget/raget-vault/hybrid-search.js';

export function indexPinned(project, files) {
  const docs = (files || []).map((file, index) => {
    const body = file.textContent || '';
    const entities = extractEntities(body);
    return {
      id: String((project && project.id) || 'proyek') + ':' + (file.name || index),
      text: (entities.length ? 'Entitas: ' + entities.join(', ') + '\n' : '') + body,
      kind: 'proyek',
    };
  }).filter((doc) => doc.text);
  if (docs.length) indexDocs(docs).catch(() => {});
}