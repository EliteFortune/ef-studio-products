import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const tests=fs.readdirSync('tests',{withFileTypes:true})
  .filter(e=>e.isFile()&&e.name.endsWith('.test.js'))
  .map(e=>path.join('tests',e.name))
  .sort();

if(!tests.length){
  console.error('No test files found');
  process.exit(1);
}
const r=spawnSync(process.execPath,['--test',...tests],{stdio:'inherit',shell:false});
process.exit(r.status??1);
