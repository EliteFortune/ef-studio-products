import fs from 'node:fs';

export function restoreFileFromBackup(target, backup) {
  if (!fs.existsSync(backup)) return { ok:false, code:'EF-REC-404', message:'Backup not found' };
  fs.copyFileSync(backup, target);
  return { ok:true, code:'EF-REC-000', message:'Last-known-good file restored' };
}

export function safeRemoveCache(cachePath) {
  if (!fs.existsSync(cachePath)) return { ok:true, code:'EF-REC-000', message:'Cache already clear' };
  const stat=fs.statSync(cachePath);
  if (!stat.isDirectory()) return { ok:false, code:'EF-REC-400', message:'Cache path is not a directory' };
  fs.rmSync(cachePath,{recursive:true,force:true});
  return { ok:true, code:'EF-REC-000', message:'Cache cleared' };
}
