#!/usr/bin/env node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { verifyMission } from '../../../packages/verification/src/engine.js';
import { systemHealth } from '../../../packages/diagnostics/src/health.js';
import { LocalStore } from '../../../packages/core/src/store.js';

const command = process.argv[2] ?? 'help';
function loadJson(file) { return JSON.parse(fs.readFileSync(file, 'utf8')); }
function localStore(config = {}) {
  const target = config.stateFile || process.env.EF_STATE_FILE || path.join(process.cwd(), '.ef-data', 'state.json');
  return new LocalStore(target).init();
}

if (command === 'verify') {
  const file = process.argv[3] ?? 'mission.json';
  const configFile = process.argv[4] ?? null;
  const mission = loadJson(file);
  const config = configFile ? loadJson(configFile) : {};
  const result = await verifyMission(mission, { commandRegistry: config.commands ?? {} });
  const runId = randomUUID();
  const createdAt = new Date().toISOString();
  const store = localStore(config);
  store.putMission(mission);
  store.putRun({ id:runId, missionId:mission.id, claimedStatus:mission.claimedStatus ?? null, verifiedStatus:result.verifiedStatus, createdAt });
  store.putVerdict({ ...result, runId });
  console.log(JSON.stringify({ runId, ...result }, null, 2));
} else if (command === 'runs') {
  console.log(JSON.stringify(localStore().listRunHistory(), null, 2));
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
    claimedStatus: 'COMPLETE',
    criteria: [
      { id: 'code', type: 'fileExists', path: 'feature.txt' },
      { id: 'implementation', type: 'textContains', path: 'feature.txt', text: 'implemented' },
      { id: 'deployment', type: 'fileExists', path: 'DEPLOYED_SHA' }
    ]
  };
  const result = await verifyMission(mission);
  console.log('Agent claim: COMPLETE');
  console.log(JSON.stringify(result, null, 2));
  if (result.verifiedStatus === 'VERIFIED') process.exitCode = 2;
} else {
  console.log('EF Agent Reliability CLI');
  console.log('  demo');
  console.log('  verify <mission.json> [trusted-config.json]');
  console.log('  runs');
  console.log('  health [repo-path]');
}
