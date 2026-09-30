import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { getOrCreateInstallId } from '../packages/core/src/install-id.js';
import { activateLicense, DEFAULT_LICENSE_ENDPOINT } from '../packages/licensing/src/client.js';

test('install id persists without hardware fingerprinting', () => {
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'ef-install-id-'));
  const a=getOrCreateInstallId(dir);
  const b=getOrCreateInstallId(dir);
  assert.equal(a,b);
  assert.ok(a.length >= 32);
});

test('activation sends install id and product to configured service', async () => {
  let body;
  const result=await activateLicense({
    licenseKey:'TEST-KEY',
    deviceId:'install-123',
    endpoint:'https://example.test/activate',
    fetchImpl:async (_url,opts)=>{
      body=JSON.parse(opts.body);
      return {ok:true,async json(){return {entitlement:{status:'ACTIVE',perpetualUse:true,updatesThrough:'2027-09-30T23:59:59Z'}}}};
    }
  });
  assert.equal(result.ok,true);
  assert.equal(body.product,'agent-reliability');
  assert.equal(body.deviceId,'install-123');
  assert.equal(body.licenseKey,'TEST-KEY');
});

test('default activation endpoint is HTTPS', () => {
  assert.match(DEFAULT_LICENSE_ENDPOINT,/^https:\/\//);
});
