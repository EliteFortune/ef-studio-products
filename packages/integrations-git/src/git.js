import { spawnSync } from 'node:child_process';

export function gitCommand(repo, args) {
  const r = spawnSync('git', ['-C', repo, ...args], { encoding: 'utf8', timeout: 15000 });
  return { ok: r.status === 0, stdout: (r.stdout ?? '').trim(), stderr: (r.stderr ?? '').trim(), exitCode: r.status };
}

export function inspectGit(repo) {
  const branch = gitCommand(repo, ['branch', '--show-current']);
  const head = gitCommand(repo, ['rev-parse', 'HEAD']);
  const status = gitCommand(repo, ['status', '--porcelain']);
  return {
    available: branch.ok && head.ok,
    branch: branch.stdout || null,
    head: head.stdout || null,
    dirty: status.ok ? status.stdout.length > 0 : null,
    error: branch.ok && head.ok ? null : (branch.stderr || head.stderr)
  };
}
