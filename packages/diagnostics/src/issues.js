export const KnownIssues = Object.freeze({
  GITHUB_NOT_CONNECTED: { code:'EF-GH-001', message:'GitHub is not connected', action:'RECONNECT_GITHUB' },
  GIT_NOT_AVAILABLE: { code:'EF-GIT-001', message:'Git is not available', action:'INSTALL_OR_REPAIR_GIT' },
  REPOSITORY_MISSING: { code:'EF-REPO-001', message:'Repository path is missing', action:'SELECT_REPOSITORY' },
  STORE_CORRUPT: { code:'EF-STORE-001', message:'Local state could not be read', action:'RESTORE_LAST_GOOD_STATE' }
});

export function classifyHealth(health) {
  const issues=[];
  if (health.git?.status === 'ATTENTION') issues.push(KnownIssues.GIT_NOT_AVAILABLE);
  if (health.repository?.status === 'ATTENTION') issues.push(KnownIssues.REPOSITORY_MISSING);
  if (health.github?.status === 'NOT_CONFIGURED') issues.push(KnownIssues.GITHUB_NOT_CONNECTED);
  return issues;
}
