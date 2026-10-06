import { hybridRank } from '../raget-vault/hybrid-search.js';
import { sheetFromText } from '../../shared/xlsx-local.js';

self.onmessage = (event) => {
  const data = event.data || {};
  if (data.type === 'hybrid') {
    self.postMessage({ id: data.id, hits: hybridRank(data.docs || [], data.query || '', data.limit || 5) });
    return;
  }
  if (data.type === 'sheet') {
    self.postMessage({ id: data.id, rows: sheetFromText(data.text || '') });
  }
};
