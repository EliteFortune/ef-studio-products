import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { CriterionStatus } from '../../core/src/contracts.js';

const evidence = (type, source, details = {}) => ({ type, source, observedAt: new Date().toISOString(), details });

export function verifyFileExists(repo, criterion) {
  const target = path.resolve(repo, criterion.path);
  const exists = fs.existsSync(target);
  return {
    criterionId: criterion.id,
    status: exists ? CriterionStatus.PASS : CriterionStatus.FAIL,
    evidence: [evidence('file_assertion', target, { exists })],
    explanation: exists ? `File exists: ${criterion.path}` : `Required file missing: ${criterion.path}`
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

export function verifyCommand(repo, criterion) {
  if (!Array.isArray(criterion.command) || criterion.command.length === 0) throw new Error('command criterion requires command array');
  const [cmd, ...args] = criterion.command;
  const started = Date.now();
  const result = spawnSync(cmd, args, { cwd: repo, encoding: 'utf8', timeout: criterion.timeoutMs ?? 120000, maxBuffer: 1024 * 1024 });
  const ok = result.status === 0;
  return {
    criterionId: criterion.id,
    status: ok ? CriterionStatus.PASS : CriterionStatus.FAIL,
    evidence: [evidence('command_result', cmd, { args, exitCode: result.status, durationMs: Date.now() - started, stdout: (result.stdout ?? '').slice(-4000), stderr: (result.stderr ?? '').slice(-4000) })],
    explanation: ok ? `Command passed: ${cmd}` : `Command failed: ${cmd}`
  };
}
