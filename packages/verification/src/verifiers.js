import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { CriterionStatus } from '../../core/src/contracts.js';
import { inspectGit, gitCommand } from '../../integrations-git/src/git.js';

const evidence = (type, source, details = {}) => ({ type, source, observedAt: new Date().toISOString(), details });

export function verifyFileExists(repo, criterion) {
  const target = path.resolve(repo, criterion.path);
  const exists = fs.existsSync(target);
  const expected = criterion.exists !== false;
  const pass = exists === expected;
  return {
    criterionId: criterion.id,
    status: pass ? CriterionStatus.PASS : CriterionStatus.FAIL,
    evidence: [evidence('file_assertion', target, { exists, expected })],
    explanation: pass ? `File assertion passed: ${criterion.path}` : `File assertion failed: ${criterion.path}`
  };
}

export function verifyTextContains(repo, criterion) {
  const target = path.resolve(repo, criterion.path);
  if (!fs.existsSync(target)) {
    return { criterionId: criterion.id, status: CriterionStatus.FAIL, evidence: [evidence('file_assertion', target, { exists: false })], explanation: `Required file missing: ${criterion.path}` };
  }
  const content = fs.readFileSync(target, 'utf8');
  const found = content.includes(criterion.text);
  return {
    criterionId: criterion.id,
    status: found ? CriterionStatus.PASS : CriterionStatus.FAIL,
    evidence: [evidence('text_assertion', target, { found })],
    explanation: found ? `Expected text found in ${criterion.path}` : `Expected text not found in ${criterion.path}`
  };
}

export function verifyCommand(repo, criterion, context = {}) {
  if (Array.isArray(criterion.command)) throw new Error('raw command arrays are not allowed; use commandId from trusted configuration');
  if (!criterion.commandId) throw new Error('command criterion requires commandId');
  const spec = context.commandRegistry?.[criterion.commandId];
  if (!spec || !Array.isArray(spec.command) || spec.command.length === 0) throw new Error(`trusted command not configured: ${criterion.commandId}`);

  const [cmd, ...args] = spec.command;
  const timeoutMs = Math.min(Number(spec.timeoutMs ?? 120000), 300000);
  const started = Date.now();
  const result = spawnSync(cmd, args, { cwd: repo, encoding: 'utf8', timeout: timeoutMs, maxBuffer: 1024 * 1024 });
  const timedOut = result.error?.code === 'ETIMEDOUT';
  if (timedOut) {
    return { criterionId: criterion.id, status: CriterionStatus.UNKNOWN, evidence: [evidence('command_result', criterion.commandId, { timedOut: true, durationMs: Date.now() - started })], explanation: `Trusted command timed out: ${criterion.commandId}` };
  }
  const ok = result.status === 0;
  return {
    criterionId: criterion.id,
    status: ok ? CriterionStatus.PASS : CriterionStatus.FAIL,
    evidence: [evidence('command_result', criterion.commandId, { exitCode: result.status, durationMs: Date.now() - started, stdout: (result.stdout ?? '').slice(-4000), stderr: (result.stderr ?? '').slice(-4000) })],
    explanation: ok ? `Trusted command passed: ${criterion.commandId}` : `Trusted command failed: ${criterion.commandId}`
  };
}

export function verifyGitBranch(repo, criterion) {
  const state = inspectGit(repo);
  if (!state.available) return { criterionId: criterion.id, status: CriterionStatus.UNKNOWN, evidence: [evidence('git_state', repo, state)], explanation: state.error || 'Git unavailable' };
  const pass = state.branch === criterion.branch;
  return { criterionId: criterion.id, status: pass ? CriterionStatus.PASS : CriterionStatus.FAIL, evidence: [evidence('git_branch', repo, { actual: state.branch, expected: criterion.branch })], explanation: pass ? 'Git branch matches' : `Expected branch ${criterion.branch}, found ${state.branch}` };
}

export function verifyGitClean(repo, criterion) {
  const state = inspectGit(repo);
  if (!state.available || state.dirty === null) return { criterionId: criterion.id, status: CriterionStatus.UNKNOWN, evidence: [evidence('git_state', repo, state)], explanation: state.error || 'Git state unavailable' };
  const expectedClean = criterion.clean !== false;
  const actualClean = !state.dirty;
  const pass = actualClean === expectedClean;
  return { criterionId: criterion.id, status: pass ? CriterionStatus.PASS : CriterionStatus.FAIL, evidence: [evidence('git_clean', repo, { actualClean, expectedClean })], explanation: pass ? 'Working tree state matches expectation' : 'Working tree state does not match expectation' };
}

export function verifyGitCommit(repo, criterion) {
  const r = gitCommand(repo, ['cat-file', '-e', `${criterion.commit}^{commit}`]);
  return { criterionId: criterion.id, status: r.ok ? CriterionStatus.PASS : CriterionStatus.FAIL, evidence: [evidence('git_commit', repo, { commit: criterion.commit, exists: r.ok })], explanation: r.ok ? `Commit exists: ${criterion.commit}` : `Commit missing: ${criterion.commit}` };
}

export function verifyGitChangedFile(repo, criterion) {
  const base = criterion.base ?? 'HEAD~1';
  const r = gitCommand(repo, ['diff', '--name-only', base, 'HEAD']);
  if (!r.ok) return { criterionId: criterion.id, status: CriterionStatus.UNKNOWN, evidence: [evidence('git_diff', repo, { base, error: r.stderr })], explanation: 'Unable to inspect changed files' };
  const files = r.stdout.split(/\r?\n/).filter(Boolean);
  const pass = files.includes(criterion.path);
  return { criterionId: criterion.id, status: pass ? CriterionStatus.PASS : CriterionStatus.FAIL, evidence: [evidence('git_diff', repo, { base, files })], explanation: pass ? `Changed file found: ${criterion.path}` : `Changed file not found: ${criterion.path}` };
}
