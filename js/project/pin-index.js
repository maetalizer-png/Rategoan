import { indexDocs } from '../../raget/raget-vault/local-rag.js';

export function indexPinned(project, files) {
  const docs = (files || []).map((file, index) => ({
    id: String((project && project.id) || 'proyek') + ':' + (file.name || index),
    text: file.textContent || '',
    kind: 'proyek',
  })).filter((doc) => doc.text);
  if (docs.length) indexDocs(docs).catch(() => {});
}
