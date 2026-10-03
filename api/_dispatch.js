import { allowOptions, bearer, fillPath, forward, queryOf, readBody, restParams, sendJson } from './_http.js';

export async function dispatchTools(req, res, spec) {
  if (allowOptions(req, res)) return;
  const query = queryOf(req);
  if (req.method === 'GET' && query.catalog === '1') {
    sendJson(res, 200, {
      tools: spec.tools.map((tool) => ({ name: tool.name, level: tool.level, method: tool.method })),
    });
    return;
  }
  const token = bearer(req);
  if (spec.auth !== false && !token) {
    sendJson(res, 401, { error: 'missing_token' });
    return;
  }
  const body = req.method === 'GET'
    ? { name: query.name || spec.defaultName, parameters: query }
    : await readBody(req);
  const params = body.parameters || {};
  const tool = spec.tools.find((item) => item.name === body.name);
  if (!tool) {
    sendJson(res, 404, { error: 'unknown_tool', name: body.name || '' });
    return;
  }
  if (spec.special) {
    const handled = await spec.special(tool, params, token, res);
    if (handled) return;
  }
  const used = new Set();
  const path = fillPath(tool.path, params, used);
  const rest = restParams(params, used);
  let url = spec.base + path;
  let payload = null;
  if (tool.method === 'GET' || tool.method === 'DELETE') {
    const search = new URLSearchParams();
    Object.keys(rest).forEach((key) => {
      if (rest[key] != null && rest[key] !== '') search.set(key, String(rest[key]));
    });
    const extra = search.toString();
    if (extra) url += (url.indexOf('?') >= 0 ? '&' : '?') + extra;
  } else {
    payload = rest;
  }
  await forward(res, url, token || '', tool.method, payload, spec.headers || {});
}
