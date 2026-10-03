import { allowOptions, originOf, queryOf, sendJson } from '../_http.js';
import { beginOrJson, callbackReturn, loadPkce, pkcePair, redirectWithToken } from '../_oauth.js';

const SCOPES = {
  google_drive: 'https://www.googleapis.com/auth/drive',
  gmail: 'https://www.googleapis.com/auth/gmail.modify',
  google_calendar: 'https://www.googleapis.com/auth/calendar',
};

export default async function handler(req, res) {
  if (allowOptions(req, res)) return;
  const clientId = process.env.GOOGLE_CLIENT_ID || '';
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET || '';
  if (!clientId || !clientSecret) {
    sendJson(res, 501, { error: 'oauth_not_configured', provider: 'google' });
    return;
  }
  const query = queryOf(req);
  const redirectUri = originOf(req) + '/api/auth/google';
  if (query.code) {
    const saved = loadPkce(req);
    if (!saved || saved.state !== query.state || saved.provider !== 'google') {
      sendJson(res, 400, { error: 'pkce_mismatch' });
      return;
    }
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code: query.code,
        code_verifier: saved.verifier,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      }),
    });
    const token = await tokenRes.json();
    if (!tokenRes.ok || !token.access_token) {
      sendJson(res, 502, { error: 'token_exchange_failed' });
      return;
    }
    let account = '';
    try {
      const profileRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { authorization: 'Bearer ' + token.access_token },
      });
      const profile = await profileRes.json();
      account = profile.email || '';
    } catch (e) {
      account = '';
    }
    redirectWithToken(res, callbackReturn(req), {
      connector: saved.service,
      access_token: token.access_token,
      expires_in: token.expires_in || 3600,
      account,
    });
    return;
  }
  const service = SCOPES[query.service] ? query.service : 'google_drive';
  const pair = pkcePair();
  const authorize = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  authorize.searchParams.set('client_id', clientId);
  authorize.searchParams.set('redirect_uri', redirectUri);
  authorize.searchParams.set('response_type', 'code');
  authorize.searchParams.set('scope', SCOPES[service]);
  authorize.searchParams.set('state', pair.state);
  authorize.searchParams.set('code_challenge', pair.challenge);
  authorize.searchParams.set('code_challenge_method', 'S256');
  authorize.searchParams.set('access_type', 'online');
  authorize.searchParams.set('prompt', 'consent');
  beginOrJson(req, res, query, authorize.toString(), {
    provider: 'google',
    verifier: pair.verifier,
    state: pair.state,
    service,
    returnTo: originOf(req) + '/',
  });
}
