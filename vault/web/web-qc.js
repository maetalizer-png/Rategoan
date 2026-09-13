function decodeEntities(s) {
  return String(s || '')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function sentences(text) {
  return decodeEntities(text)
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 8);
}

function topicFromQuery(q) {
  return String(q || '')
    .toLowerCase()
    .replace(/\bilmu\s+/g, ' ')
    .replace(/[^a-z0-9à-ÿ\s]/gi, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && w !== 'ilmu')
    .pop() || '';
}

function isDefinitionQuery(raw) {
  return /^(apa\s+itu|apa\s+itu\s+ilmu|jelaskan|pengertian)\b/i.test(String(raw || '').replace(/^googling\s+/i, '').trim());
}

function relatedPasses(item, topic) {
  const title = decodeEntities(item && item.title).toLowerCase();
  if (!title || !topic) return false;
  if (title === 'ilmu' || title === 'ilmu pengetahuan' || title === topic) return false;
  if (/^(fakultas|ilmu kebumian|ilmu alam)\b/.test(title)) return false;
  return title.includes(topic);
}

function clipExtract(extract, definition) {
  const parts = sentences(extract);
  if (!parts.length) return '';
  const keep = Math.min(6, parts.length);
  const paras = [];
  for (let i = 0; i < keep; i += 2) {
    paras.push(parts.slice(i, i + 2).join(' '));
  }
  return paras.join('\n\n');
}

function inspect(result, rawPrompt, query) {
  const topic = topicFromQuery(query);
  const definition = isDefinitionQuery(rawPrompt) || isDefinitionQuery(query);
  const extract = clipExtract(result && result.extract, definition);
  const related = Array.isArray(result && result.related)
    ? result.related.filter((r) => relatedPasses(r, topic)).slice(0, definition ? 2 : 3)
    : [];
  const people = Array.isArray(result && result.people)
    ? result.people.filter((p) => p && p.title && decodeEntities(p.title).length > 2).slice(0, 6)
    : [];
  return {
    ...result,
    extract,
    related: definition ? related : related,
    people,
    definition,
    topic,
  };
}

export const webQc = Object.freeze({ inspect, decodeEntities, topicFromQuery });
