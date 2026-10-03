import { dispatchTools } from '../_dispatch.js';
import { sendJson } from '../_http.js';

export const GITHUB_TOOLS = [
  { name: 'github_get_user', method: 'GET', path: '/user', level: 1 },
  { name: 'github_list_repos', method: 'GET', path: '/user/repos', level: 1 },
  { name: 'github_get_repo', method: 'GET', path: '/repos/{owner}/{repo}', level: 1 },
  { name: 'github_list_branches', method: 'GET', path: '/repos/{owner}/{repo}/branches', level: 1 },
  { name: 'github_get_branch', method: 'GET', path: '/repos/{owner}/{repo}/branches/{branch}', level: 1 },
  { name: 'github_read_file', method: 'GET', path: '/repos/{owner}/{repo}/contents/{path}', level: 1 },
  { name: 'github_get_tree', method: 'GET', path: '/repos/{owner}/{repo}/git/trees/{tree_sha}', level: 1 },
  { name: 'github_list_commits', method: 'GET', path: '/repos/{owner}/{repo}/commits', level: 1 },
  { name: 'github_get_commit', method: 'GET', path: '/repos/{owner}/{repo}/commits/{sha}', level: 1 },
  { name: 'github_list_issues', method: 'GET', path: '/repos/{owner}/{repo}/issues', level: 1 },
  { name: 'github_get_issue', method: 'GET', path: '/repos/{owner}/{repo}/issues/{issue_number}', level: 1 },
  { name: 'github_create_issue', method: 'POST', path: '/repos/{owner}/{repo}/issues', level: 2 },
  { name: 'github_update_issue', method: 'PATCH', path: '/repos/{owner}/{repo}/issues/{issue_number}', level: 2 },
  { name: 'github_list_issue_comments', method: 'GET', path: '/repos/{owner}/{repo}/issues/{issue_number}/comments', level: 1 },
  { name: 'github_create_issue_comment', method: 'POST', path: '/repos/{owner}/{repo}/issues/{issue_number}/comments', level: 2 },
  { name: 'github_list_pulls', method: 'GET', path: '/repos/{owner}/{repo}/pulls', level: 1 },
  { name: 'github_get_pull', method: 'GET', path: '/repos/{owner}/{repo}/pulls/{pull_number}', level: 1 },
  { name: 'github_create_pull_request', method: 'POST', path: '/repos/{owner}/{repo}/pulls', level: 3 },
  { name: 'github_update_pull', method: 'PATCH', path: '/repos/{owner}/{repo}/pulls/{pull_number}', level: 2 },
  { name: 'github_merge_pull', method: 'PUT', path: '/repos/{owner}/{repo}/pulls/{pull_number}/merge', level: 3 },
  { name: 'github_list_pr_files', method: 'GET', path: '/repos/{owner}/{repo}/pulls/{pull_number}/files', level: 1 },
  { name: 'github_create_branch', method: 'POST', path: '/repos/{owner}/{repo}/git/refs', level: 2 },
  { name: 'github_commit_changes', method: 'PUT', path: '/repos/{owner}/{repo}/contents/{path}', level: 3 },
  { name: 'github_delete_file', method: 'DELETE', path: '/repos/{owner}/{repo}/contents/{path}', level: 3 },
  { name: 'github_list_releases', method: 'GET', path: '/repos/{owner}/{repo}/releases', level: 1 },
  { name: 'github_get_release', method: 'GET', path: '/repos/{owner}/{repo}/releases/{release_id}', level: 1 },
  { name: 'github_create_release', method: 'POST', path: '/repos/{owner}/{repo}/releases', level: 2 },
  { name: 'github_list_labels', method: 'GET', path: '/repos/{owner}/{repo}/labels', level: 1 },
  { name: 'github_create_label', method: 'POST', path: '/repos/{owner}/{repo}/labels', level: 2 },
  { name: 'github_list_collaborators', method: 'GET', path: '/repos/{owner}/{repo}/collaborators', level: 1 },
  { name: 'github_search_code', method: 'GET', path: '/search/code', level: 1 },
  { name: 'github_search_issues', method: 'GET', path: '/search/issues', level: 1 },
  { name: 'github_search_repos', method: 'GET', path: '/search/repositories', level: 1 },
  { name: 'github_list_workflows', method: 'GET', path: '/repos/{owner}/{repo}/actions/workflows', level: 1 },
  { name: 'github_list_workflow_runs', method: 'GET', path: '/repos/{owner}/{repo}/actions/runs', level: 1 },
  { name: 'github_get_readme', method: 'GET', path: '/repos/{owner}/{repo}/readme', level: 1 },
  { name: 'github_compare', method: 'GET', path: '/repos/{owner}/{repo}/compare/{basehead}', level: 1 },
  { name: 'github_list_tags', method: 'GET', path: '/repos/{owner}/{repo}/tags', level: 1 },
  { name: 'github_list_contents', method: 'GET', path: '/repos/{owner}/{repo}/contents/{path}', level: 1 },
  { name: 'github_list_notifications', method: 'GET', path: '/notifications', level: 1 },
  { name: 'github_mark_notification_read', method: 'PATCH', path: '/notifications/threads/{thread_id}', level: 2 },
  { name: 'github_list_gists', method: 'GET', path: '/gists', level: 1 },
  { name: 'github_get_gist', method: 'GET', path: '/gists/{gist_id}', level: 1 },
  { name: 'github_create_gist', method: 'POST', path: '/gists', level: 2 },
  { name: 'github_list_stargazers', method: 'GET', path: '/repos/{owner}/{repo}/stargazers', level: 1 },
];

const GH_HEADERS = {
  accept: 'application/vnd.github+json',
  'user-agent': 'rategoan',
  'x-github-api-version': '2022-11-28',
};

async function special(tool, params, token, res) {
  const headers = Object.assign({ authorization: 'Bearer ' + token, 'content-type': 'application/json' }, GH_HEADERS);
  if (tool.name === 'github_create_branch') {
    const url = 'https://api.github.com/repos/' + encodeURIComponent(params.owner || '') + '/' + encodeURIComponent(params.repo || '') + '/git/refs';
    const upstream = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({ ref: 'refs/heads/' + (params.branch || params.ref || 'rategoan'), sha: params.sha }),
    });
    res.statusCode = upstream.status;
    res.setHeader('content-type', 'application/json');
    res.end(await upstream.text());
    return true;
  }
  if (tool.name === 'github_commit_changes') {
    let content = String(params.content || '');
    if (!/^[A-Za-z0-9+/=\r\n]+$/.test(content)) content = Buffer.from(content).toString('base64');
    const url = 'https://api.github.com/repos/' + encodeURIComponent(params.owner || '') + '/' + encodeURIComponent(params.repo || '') + '/contents/' + String(params.path || '').split('/').map(encodeURIComponent).join('/');
    const upstream = await fetch(url, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        message: params.message || 'Perubahan dari Rategoan',
        content: content.replace(/\s/g, ''),
        branch: params.branch,
        sha: params.sha,
      }),
    });
    res.statusCode = upstream.status;
    res.setHeader('content-type', 'application/json');
    res.end(await upstream.text());
    return true;
  }
  if (tool.name === 'github_get_tree' && !params.tree_sha) {
    sendJson(res, 400, { error: 'tree_sha_wajib' });
    return true;
  }
  return false;
}

export default function handler(req, res) {
  return dispatchTools(req, res, {
    tools: GITHUB_TOOLS,
    base: 'https://api.github.com',
    headers: GH_HEADERS,
    special,
  });
}
