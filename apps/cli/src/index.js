#!/usr/bin/env node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { verifyMission } from '../../../packages/verification/src/engine.js';
import { systemHealth } from '../../../packages/diagnostics/src/health.js';

const command = process.argv[2] ?? 'help';

if (command === 'verify') {
  const file = process.argv[3] ?? 'mission.json';
  const mission = JSON.parse(fs.readFileSync(file, 'utf8'));
  console.log(JSON.stringify(verifyMission(mission), null, 2));
} else if (command === 'health') {
  const repo = process.argv[3] ?? process.cwd();
  console.log(JSON.stringify(systemHealth(repo), null, 2));
} else if (command === 'demo') {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ef-reliability-demo-'));
  fs.writeFileSync(path.join(dir, 'feature.txt'), 'implemented\n');
  const mission = {
    id: 'demo-false-completion',
    title: 'False completion demo',
    objective: 'Implement and deploy feature',
    repository: dir,
    criteria: [
      { id: 'code', type: 'fileExists', path: 'feature.txt' },
      { id: 'implementation', type: 'textContains', path: 'feature.txt', text: 'implemented' },
      { id: 'deployment', type: 'fileExists', path: 'DEPLOYED_SHA' }
    ]
  };
  const result = verifyMission(mission);
  console.log('Agent claim: COMPLETE');
  console.log(JSON.stringify(result, null, 2));
  if (result.verifiedStatus === 'VERIFIED') process.exitCode = 2;
} else {
  console.log('EF Agent Reliability CLI');
  console.log('  demo');
  console.log('  verify <mission.json>');
  console.log('  health [repo-path]');
}
