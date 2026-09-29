export async function githubHealth(client) {
  if (!client) return { status: 'NOT_CONFIGURED', detail: 'GitHub not connected' };
  try {
    await client.request('/rate_limit');
    return { status: 'HEALTHY', detail: 'GitHub API reachable' };
  } catch (error) {
    return { status: 'ATTENTION', detail: error.message };
  }
}
