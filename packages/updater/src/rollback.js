import fs from 'node:fs';
import path from 'node:path';

export function createRollbackCopy(sourcePath, rollbackDir) {
  fs.mkdirSync(rollbackDir,{recursive:true});
  const target=path.join(rollbackDir,path.basename(sourcePath));
  fs.copyFileSync(sourcePath,target);
  return target;
}

export function rollbackFile(rollbackPath, destinationPath) {
  if (!fs.existsSync(rollbackPath)) return {ok:false,code:'EF-UPD-404',message:'Rollback artifact not found'};
  fs.copyFileSync(rollbackPath,destinationPath);
  return {ok:true,code:'EF-UPD-000',message:'Rollback restored'};
}

export async function applyWithHealthCheck({ apply, healthCheck, rollback }) {
  await apply();
  const healthy=await healthCheck();
  if (healthy) return {ok:true,rolledBack:false};
  await rollback();
  return {ok:false,rolledBack:true};
}
