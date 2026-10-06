import { hybridRank } from '../raget-vault/hybrid-search.js';

self.onmessage = (event) => {
  const data = event.data || {};
  if (data.type !== 'hybrid') return;
  const hits = hybridRank(data.docs || [], data.query || '', data.limit || 5);
  self.postMessage({ id: data.id, hits });
};
