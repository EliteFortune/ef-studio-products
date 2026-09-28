import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { verifyMission } from '../packages/verification/src/engine.js';

function repo() { return fs.mkdtempSync(path.join(os.tmpdir(), 'ef-test-')); }

test('all mandatory criteria pass -> VERIFIED', () => {
  const r = repo();
  fs.writeFileSync(path.join(r, 'ok.txt'), 'done');
  const result = verifyMission({ id:'m1', repository:r, criteria:[{id:'f',type:'fileExists',path:'ok.txt'},{id:'t',type:'textContains',path:'ok.txt',text:'done'}] });
  assert.equal(result.verifiedStatus, 'VERIFIED');
});

test('agent false completion is detected -> FAILED', () => {
  const r = repo();
  fs.writeFileSync(path.join(r, 'code.txt'), 'implemented');
  const result = verifyMission({ id:'m2', repository:r, criteria:[{id:'code',type:'fileExists',path:'code.txt'},{id:'deploy',type:'fileExists',path:'DEPLOYED_SHA'}] });
  assert.equal(result.verifiedStatus, 'FAILED');
});

test('unsupported criterion cannot silently pass', () => {
  const r = repo();
  const result = verifyMission({ id:'m3', repository:r, criteria:[{id:'x',type:'futureVerifier'}] });
  assert.equal(result.verifiedStatus, 'INCOMPLETE');
});

test('trusted command success produces VERIFIED', () => {
  const r = repo();
  const result = verifyMission({ id:'m4', repository:r, criteria:[{id:'cmd',type:'command',command:[process.execPath,'-e','process.exit(0)']}] });
  assert.equal(result.verifiedStatus, 'VERIFIED');
});
