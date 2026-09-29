import { spawnSync } from 'node:child_process';

function run(cmd,args){
  const r=spawnSync(cmd,args,{stdio:'inherit',shell:false});
  if(r.status!==0) process.exit(r.status??1);
}

run(process.execPath,['--test','tests/*.test.js']);
run(process.execPath,['apps/cli/src/index.js','demo']);
run(process.execPath,['scripts/generate-sbom.mjs']);
console.log('EF Agent Reliability release qualification checks passed');
