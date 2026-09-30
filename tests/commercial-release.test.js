import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { evaluateEntitlement } from '../packages/licensing/src/entitlement.js';
import { verifyArtifact, verifyManifestSignature } from '../packages/updater/src/security.js';
import { applyWithHealthCheck } from '../packages/updater/src/rollback.js';

test('expired updates do not disable perpetual installed product', () => {
  const result=evaluateEntitlement({perpetualUse:true,updatesThrough:'2026-01-01T00:00:00Z'},new Date('2026-09-29T00:00:00Z'));
  assert.equal(result.canUse,true);
  assert.equal(result.canUpdate,false);
  assert.equal(result.reason,'UPDATE_PERIOD_EXPIRED');
});

test('active update entitlement permits use and update', () => {
  const result=evaluateEntitlement({perpetualUse:true,updatesThrough:'2027-09-29T00:00:00Z'},new Date('2026-09-29T00:00:00Z'));
  assert.equal(result.canUse,true);
  assert.equal(result.canUpdate,true);
});

test('signed manifest verifies and tampering fails', () => {
  const {publicKey,privateKey}=crypto.generateKeyPairSync('ed25519');
  const manifest='{"version":"1.0.0","sha256":"abc"}';
  const sig=crypto.sign(null,Buffer.from(manifest),privateKey).toString('base64');
  assert.equal(verifyManifestSignature(manifest,sig,publicKey.export({type:'spki',format:'pem'})),true);
  assert.equal(verifyManifestSignature(manifest+'x',sig,publicKey.export({type:'spki',format:'pem'})),false);
});

test('artifact checksum detects mutation', () => {
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'ef-artifact-'));
  const file=path.join(dir,'artifact.bin');
  fs.writeFileSync(file,'v1');
  const expected=crypto.createHash('sha256').update('v1').digest('hex');
  assert.equal(verifyArtifact(file,expected).ok,true);
  fs.writeFileSync(file,'v2');
  assert.equal(verifyArtifact(file,expected).ok,false);
});

test('failed update health check triggers rollback', async () => {
  const calls=[];
  const result=await applyWithHealthCheck({
    apply:async()=>calls.push('apply'),
    healthCheck:async()=>false,
    rollback:async()=>calls.push('rollback')
  });
  assert.deepEqual(calls,['apply','rollback']);
  assert.equal(result.rolledBack,true);
});
