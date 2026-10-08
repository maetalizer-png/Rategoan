export class McpClient {
  constructor(transport, policy) {
    this.transport = transport;
    this.policy = policy;
    this.seq = 0;
  }

  async listTools() {
    return this.request('tools/list', {});
  }

  async callTool(name, args = {}) {
    if (!this.policy || typeof this.policy.assert !== 'function') throw new Error('Policy engine kosong');
    this.policy.assert(name, args);
    return this.request('tools/call', { name, arguments: args });
  }

  async request(method, params) {
    if (!method || typeof method !== 'string') throw new Error('JSON-RPC tidak sah');
    const id = ++this.seq;
    const message = { jsonrpc: '2.0', id, method, params: params == null ? {} : params };
    const res = await this.transport.send(message);
    if (res && res.jsonrpc && res.jsonrpc !== '2.0') throw new Error('JSON-RPC tidak sah');
    if (res && res.id != null && res.id !== id) throw new Error('JSON-RPC id tidak cocok');
    if (res && res.error) throw new Error(res.error.message || 'MCP error');
    return res && Object.prototype.hasOwnProperty.call(res, 'result') ? res.result : res;
  }
}
