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
  return /^(apa\s+itu|jelaskan|pengertian)\b/i.test(String(raw || '').replace(/^googling\s+/i, '').trim());
}

function isExplainQuery(raw) {
  return /^jelaskan\b/i.test(String(raw || '').replace(/^googling\s+/i, '').trim());
}

function snippetJunk(s) {
  const t = decodeEntities(s);
  if (!t) return true;
  if (/deprecated|\bcode:\s*[a-z]{2,3}\b|\{\{|\}\}|wiktionary/i.test(t)) return true;
  const letters = t.replace(/[^\p{L}]/gu, '');
  const latin = t.replace(/[^A-Za-z]/g, '');
  if (letters.length > 12 && latin.length / letters.length < 0.45) return true;
  return false;
}

function relatedPasses(item, topic) {
  const title = decodeEntities(item && item.title).toLowerCase();
  if (!title || !topic) return false;
  if (title === 'ilmu' || title === 'ilmu pengetahuan' || title === topic) return false;
  if (/^(fakultas|ilmu kebumian|ilmu alam|yang lanjut usianya)\b/.test(title)) return false;
  if (snippetJunk(item && item.snippet)) return false;
  return title.includes(topic);
}

function sentenceFits(sent, topic, query) {
  const s = String(sent || '').toLowerCase();
  const q = String(query || '').toLowerCase();
  if (/salah satunya adalah/.test(s) && !/suku|etnis/.test(q)) return false;
  if (/misalnya|contohnya/.test(s) && topic && !s.includes(topic)) return false;
  if (/dibagi menjadi|terdiri dari|periode|era /.test(s)) return true;
  if (!topic) return true;
  return s.includes(topic);
}

function finishItem(item) {
  let t = decodeEntities(item).replace(/\s+/g, ' ').trim();
  if (!t) return '';
  if (!/[.!?]$/.test(t)) {
    const cut = t.search(/\s+(saat|yang|ketika|dengan)\s+[a-z].*$/);
    if (cut > 24) t = t.slice(0, cut).trim();
    if (!/[.!?]$/.test(t)) t += '.';
  }
  return t;
}

function clipExtract(extract, query) {
  const topic = topicFromQuery(query);
  const parts = sentences(extract).filter((s) => sentenceFits(s, topic, query));
  if (!parts.length) return decodeEntities(extract);
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
  const explain = isExplainQuery(rawPrompt);
  const extract = clipExtract(result && result.extract, query);
  const related = Array.isArray(result && result.related)
    ? result.related.filter((r) => relatedPasses(r, topic)).slice(0, definition ? 2 : 3)
    : [];
  const people = Array.isArray(result && result.people)
    ? result.people.filter((p) => p && p.title && decodeEntities(p.title).length > 2).slice(0, 6)
    : [];
  const outline = Array.isArray(result && result.outline) ? result.outline.filter(Boolean).slice(0, 5) : [];
  return {
    ...result,
    extract,
    related: definition ? [] : related,
    people,
    outline,
    definition,
    explain,
    topic,
    heading: explain ? (result.title || query) : '',
  };
}

export const webQc = Object.freeze({ inspect, decodeEntities, topicFromQuery, finishItem });
