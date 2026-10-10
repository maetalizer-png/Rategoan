import { allowOptions, bearer, fillPath, forward, queryOf, readBody, rpcBodyOk, sendJson, sendRpcError } from './_http.js';
import { filterParams } from '../js/connectors/policy-engine.js';
import { verifyConfirm } from './confirm-challenge.js';

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
    sendRpcError(res, 401, -32600, 'missing_token');
    return;
  }
  let body;
  try {
    body = req.method === 'GET'
      ? { name: query.name || spec.defaultName, parameters: query }
      : await readBody(req);
  } catch (e) {
    sendJson(res, (e && e.statusCode) || 400, (e && e.payload) || { error: 'invalid_json' });
    return;
  }
  const params = body.parameters || {};
  if (req.method !== 'GET' && !rpcBodyOk(body)) {
    sendRpcError(res, 400, -32600, 'invalid_request');
    return;
  }
  const tool = spec.tools.find((item) => item.name === body.name);
  if (!tool) {
    sendRpcError(res, 404, -32601, 'unknown_tool');
    return;
  }
  if (tool.level === 3) {
    const header = req.headers['x-rategoan-confirm-nonce'];
    if (!header) {
      sendRpcError(res, 403, -32602, 'konfirmasi_diperlukan');
      return;
    }
    if (!verifyConfirm(header, tool.name || body.name, params, undefined, token)) {
      sendRpcError(res, 403, -32602, 'konfirmasi_ditolak');
      return;
    }
  }
  const screened = filterParams(params);
  if (screened.banned.length) {
    sendRpcError(res, 400, -32602, 'parameter_ditolak');
    return;
  }
  if (spec.special) {
    const handled = await spec.special(tool, screened.kept, token, res);
    if (handled) return;
  }
  const used = new Set();
  const path = fillPath(tool.path, params, used);
  const rest = filterParams(params, tool.allow, used).kept;
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
