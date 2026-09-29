import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createSupportBundle } from '../packages/diagnostics/src/support-bundle.js';
import { restoreFileFromBackup, safeRemoveCache } from '../packages/diagnostics/src/recovery.js';

test('support bundle redacts secrets and customer content', () => {
  const bundle=createSupportBundle({
    appVersion:'1.0.0',
    os:'test',
    health:{ github:{ token:'secret-token' } },
    recentErrors:[{ code:'X', prompt:'customer prompt', stdout:'sensitive output' }]
  });
  assert.equal(bundle.health.github.token,'[REDACTED]');
  assert.equal(bundle.recentErrors[0].prompt,'[OMITTED]');
  assert.equal(bundle.recentErrors[0].stdout,'[OMITTED]');
});

test('restore from known backup is deterministic', () => {
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'ef-rec-'));
  const target=path.join(dir,'state.json'), backup=path.join(dir,'state.bak');
  fs.writeFileSync(target,'bad'); fs.writeFileSync(backup,'good');
  assert.equal(restoreFileFromBackup(target,backup).ok,true);
  assert.equal(fs.readFileSync(target,'utf8'),'good');
});

test('cache recovery only removes directories', () => {
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'ef-cache-'));
  const cache=path.join(dir,'cache'); fs.mkdirSync(cache); fs.writeFileSync(path.join(cache,'x'),'1');
  assert.equal(safeRemoveCache(cache).ok,true);
  assert.equal(fs.existsSync(cache),false);
});
