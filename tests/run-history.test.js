import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { LocalStore } from '../packages/core/src/store.js';

function tempStore() {
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'ef-history-'));
  return { dir, store:new LocalStore(path.join(dir,'state.json')).init() };
}

test('run history joins mission and verdict', () => {
  const {store}=tempStore();
  store.putMission({id:'m1',title:'Mission one'});
  store.putRun({id:'r1',missionId:'m1',claimedStatus:'COMPLETE',createdAt:'2026-01-01T00:00:00Z'});
  store.putVerdict({runId:'r1',missionId:'m1',verifiedStatus:'VERIFIED',createdAt:'2026-01-01T00:00:01Z'});
  const rows=store.listRunHistory();
  assert.equal(rows.length,1);
  assert.equal(rows[0].mission.title,'Mission one');
  assert.equal(rows[0].verdict.verifiedStatus,'VERIFIED');
});

test('store keeps a last-known-good backup before mutation', () => {
  const {dir,store}=tempStore();
  store.putMission({id:'m1',title:'Before'});
  store.putMission({id:'m1',title:'After'});
  assert.equal(fs.existsSync(path.join(dir,'state.json.bak')),true);
  const result=store.restoreLastGood();
  assert.equal(result.ok,true);
  assert.equal(store.read().missions.m1.title,'Before');
});
