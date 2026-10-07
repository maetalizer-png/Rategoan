import { allowOptions, originOf, queryOf, sendJson } from '../_http.js';
import { beginOrJson, callbackReturn, loadPkce, pkcePair, redirectWithToken } from '../_oauth.js';

export default async function handler(req, res) {
  if (allowOptions(req, res)) return;
  const clientId = process.env.GITHUB_CLIENT_ID || '';
  const clientSecret = process.env.GITHUB_CLIENT_SECRET || '';
  if (!clientId || !clientSecret) {
    sendJson(res, 501, { error: 'oauth_not_configured', provider: 'github' });
    return;
  }
  const query = queryOf(req);
  const redirectUri = originOf(req) + '/api/auth/github';
  if (query.code) {
    const saved = loadPkce(req);
    if (!saved || saved.state !== query.state || saved.provider !== 'github') {
      sendJson(res, 400, { error: 'pkce_mismatch' });
      return;
    }
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { accept: 'application/json', 'content-type': 'application/json' },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code: query.code,
        redirect_uri: redirectUri,
        code_verifier: saved.verifier,
      }),
    });
    const token = await tokenRes.json();
    if (!tokenRes.ok || !token.access_token) {
      sendJson(res, 502, { error: 'token_exchange_failed' });
      return;
    }
    let account = '';
    try {
      const userRes = await fetch('https://api.github.com/user', {
        headers: {
          authorization: 'Bearer ' + token.access_token,
          accept: 'application/vnd.github+json',
          'user-agent': 'rategoan',
        },
      });
      const user = await userRes.json();
      account = user.login || '';
    } catch (e) {
      account = '';
    }
    redirectWithToken(res, callbackReturn(req), {
      connector: 'github',
      access_token: token.access_token,
      expires_in: token.expires_in || 28800,
      account,
      state: saved.state,
    });
    return;
  }
  const pair = pkcePair();
  const authorize = new URL('https://github.com/login/oauth/authorize');
  authorize.searchParams.set('client_id', clientId);
  authorize.searchParams.set('redirect_uri', redirectUri);
  authorize.searchParams.set('scope', 'repo read:user');
  authorize.searchParams.set('state', pair.state);
  authorize.searchParams.set('code_challenge', pair.challenge);
  authorize.searchParams.set('code_challenge_method', 'S256');
  beginOrJson(req, res, query, authorize.toString(), {
    provider: 'github',
    verifier: pair.verifier,
    state: pair.state,
    service: 'github',
    returnTo: originOf(req) + '/',
  });
}
