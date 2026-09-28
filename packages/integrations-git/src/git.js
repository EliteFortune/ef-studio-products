import { spawnSync } from 'node:child_process';

function git(repo, args) {
  const r = spawnSync('git', ['-C', repo, ...args], { encoding: 'utf8', timeout: 15000 });
  return { ok: r.status === 0, stdout: (r.stdout ?? '').trim(), stderr: (r.stderr ?? '').trim(), exitCode: r.status };
}

export function inspectGit(repo) {
  const branch = git(repo, ['branch', '--show-current']);
  const head = git(repo, ['rev-parse', 'HEAD']);
  const status = git(repo, ['status', '--porcelain']);
  return {
    available: branch.ok && head.ok,
    branch: branch.stdout || null,
    head: head.stdout || null,
    dirty: status.ok ? status.stdout.length > 0 : null,
    error: branch.ok && head.ok ? null : (branch.stderr || head.stderr)
  };
}
