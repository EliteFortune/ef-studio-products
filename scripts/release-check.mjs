import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

function run(cmd,args){
  const r=spawnSync(cmd,args,{stdio:'inherit',shell:false});
  if(r.status!==0) process.exit(r.status??1);
}

function testFiles(dir='tests') {
  return fs.readdirSync(dir,{withFileTypes:true})
    .filter(entry=>entry.isFile() && entry.name.endsWith('.test.js'))
    .map(entry=>path.join(dir,entry.name))
    .sort();
}

const tests=testFiles();
if(!tests.length){
  console.error('No test files found under tests/');
  process.exit(1);
}

run(process.execPath,['--test',...tests]);
run(process.execPath,['apps/cli/src/index.js','demo']);
run(process.execPath,['scripts/generate-sbom.mjs']);
console.log('EF Agent Reliability release qualification checks passed');
