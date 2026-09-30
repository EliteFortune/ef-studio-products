import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { EntitlementStore } from '../packages/licensing/src/store.js';
import { activateLicense } from '../packages/licensing/src/client.js';

test('entitlement store persists only entitlement payload', () => {
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'ef-license-'));
  const store=new EntitlementStore(path.join(dir,'entitlement.json'));
  store.save({perpetualUse:true,updatesThrough:'2027-01-01T00:00:00Z'});
  const raw=fs.readFileSync(store.filePath,'utf8');
  assert.equal(raw.includes('LICENSE-KEY'),false);
  assert.equal(store.load().perpetualUse,true);
});

test('activation client sends product and key without app-side provider secret', async () => {
  const calls=[];
  const result=await activateLicense({
    licenseKey:'TEST-KEY',
    endpoint:'https://license.example/activate',
    fetchImpl:async (url,opts)=>{
      calls.push({url,opts});
      return {ok:true,async json(){return {entitlement:{perpetualUse:true,updatesThrough:'2027-01-01T00:00:00Z'}}}};
    }
  });
  assert.equal(result.ok,true);
  const sent=JSON.parse(calls[0].opts.body);
  assert.equal(sent.licenseKey,'TEST-KEY');
  assert.equal(sent.product,'agent-reliability');
});
