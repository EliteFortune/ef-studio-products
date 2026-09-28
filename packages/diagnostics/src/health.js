import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import { inspectGit } from '../../integrations-git/src/git.js';

export function systemHealth(repo) {
  const nodeOk = Number(process.versions.node.split('.')[0]) >= 20;
  const gitVersion = spawnSync('git', ['--version'], { encoding: 'utf8' });
  const repoExists = fs.existsSync(repo);
  return {
    runtime: { status: nodeOk ? 'HEALTHY' : 'ATTENTION', detail: process.version },
    git: { status: gitVersion.status === 0 ? 'HEALTHY' : 'ATTENTION', detail: (gitVersion.stdout || gitVersion.stderr || '').trim() },
    repository: { status: repoExists ? 'HEALTHY' : 'ATTENTION', detail: repo },
    repositoryGit: repoExists ? inspectGit(repo) : { available: false, error: 'repository path missing' }
  };
}
