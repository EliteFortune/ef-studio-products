import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

export function getOrCreateInstallId(dataDir) {
  const target=path.join(path.resolve(dataDir),'install-id');
  if(fs.existsSync(target)){
    const existing=fs.readFileSync(target,'utf8').trim();
    if(existing) return existing;
  }
  fs.mkdirSync(path.dirname(target),{recursive:true});
  const id=crypto.randomUUID();
  const tmp=target+'.tmp';
  fs.writeFileSync(tmp,id,{mode:0o600});
  fs.renameSync(tmp,target);
  return id;
}
