import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { verifyMission } from '../packages/verification/src/engine.js';

function initRepo() {
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'ef-git-'));
  spawnSync('git',['init','-b','main',dir],{encoding:'utf8'});
  spawnSync('git',['-C',dir,'config','user.email','test@example.com']);
  spawnSync('git',['-C',dir,'config','user.name','EF Test']);
  fs.writeFileSync(path.join(dir,'a.txt'),'one');
  spawnSync('git',['-C',dir,'add','.']);
  spawnSync('git',['-C',dir,'commit','-m','first'],{encoding:'utf8'});
  return dir;
}

test('optional failed criterion does not fail mission', () => {
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'ef-opt-'));
  fs.writeFileSync(path.join(dir,'required.txt'),'ok');
  const result=verifyMission({id:'opt',repository:dir,criteria:[
    {id:'required',type:'fileExists',path:'required.txt'},
    {id:'optional',type:'fileExists',path:'missing.txt',mandatory:false}
  ]});
  assert.equal(result.verifiedStatus,'VERIFIED');
});

test('git branch criterion passes on expected branch', () => {
  const dir=initRepo();
  const result=verifyMission({id:'g1',repository:dir,criteria:[{id:'branch',type:'gitBranch',branch:'main'}]});
  assert.equal(result.verifiedStatus,'VERIFIED');
});

test('git clean criterion fails with uncommitted changes', () => {
  const dir=initRepo();
  fs.writeFileSync(path.join(dir,'a.txt'),'changed');
  const result=verifyMission({id:'g2',repository:dir,criteria:[{id:'clean',type:'gitClean',clean:true}]});
  assert.equal(result.verifiedStatus,'FAILED');
});

test('changed file criterion detects committed change', () => {
  const dir=initRepo();
  fs.writeFileSync(path.join(dir,'b.txt'),'two');
  spawnSync('git',['-C',dir,'add','.']);
  spawnSync('git',['-C',dir,'commit','-m','second'],{encoding:'utf8'});
  const result=verifyMission({id:'g3',repository:dir,criteria:[{id:'changed',type:'gitChangedFile',path:'b.txt'}]});
  assert.equal(result.verifiedStatus,'VERIFIED');
});
