export class GitHubClient {
  constructor({ token, fetchImpl = fetch, apiBase = 'https://api.github.com' } = {}) {
    this.token = token ?? null;
    this.fetchImpl = fetchImpl;
    this.apiBase = apiBase.replace(/\/$/, '');
  }

  async request(path) {
    if (!this.token) throw new Error('GitHub is not connected');
    const response = await this.fetchImpl(`${this.apiBase}${path}`, {
      headers: {
        accept: 'application/vnd.github+json',
        authorization: `Bearer ${this.token}`,
        'x-github-api-version': '2022-11-28'
      }
    });
    if (!response.ok) throw new Error(`GitHub API ${response.status}`);
    return response.json();
  }

  getPullRequest(owner, repo, number) {
    return this.request(`/repos/${owner}/${repo}/pulls/${number}`);
  }

  getCombinedStatus(owner, repo, sha) {
    return this.request(`/repos/${owner}/${repo}/commits/${sha}/status`);
  }
}
