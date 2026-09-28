import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { LocalStore } from '../packages/core/src/store.js';
import { validateConfig } from '../packages/core/src/config.js';
import { createEvent } from '../packages/core/src/events.js';
import { createMission } from '../packages/core/src/contracts.js';

function temp() { return fs.mkdtempSync(path.join(os.tmpdir(), 'ef-runtime-')); }

test('local store persists repository and mission across re-open', () => {
  const dir=temp(), file=path.join(dir,'state.json'), repo=path.join(dir,'repo');
  fs.mkdirSync(repo);
  const store=new LocalStore(file).init();
  store.registerRepository('r1', repo);
  store.putMission(createMission({ id:'m1', title:'t', objective:'o', repository:repo, criteria:[{id:'c1',type:'fileExists',path:'x'}] }));
  const reopened=new LocalStore(file).init().read();
  assert.equal(reopened.repositories.r1.path, path.resolve(repo));
  assert.equal(reopened.missions.m1.id, 'm1');
});

test('config rejects content telemetry', () => {
  assert.throws(() => validateConfig({ repository:'/tmp/x', telemetry:{ includeContent:true } }), /not permitted/);
});

test('event IDs are unique and versioned', () => {
  const a=createEvent('mission.created'), b=createEvent('mission.created');
  assert.notEqual(a.eventId,b.eventId);
  assert.equal(a.schemaVersion,1);
});

test('store rejects unknown data version', () => {
  const dir=temp(), file=path.join(dir,'state.json');
  fs.writeFileSync(file, JSON.stringify({version:99}));
  assert.throws(() => new LocalStore(file).read(), /unsupported store version/);
});
