import fs from 'node:fs';
import path from 'node:path';

export class EntitlementStore {
  constructor(filePath){this.filePath=path.resolve(filePath);}
  load(){
    if(!fs.existsSync(this.filePath)) return null;
    return JSON.parse(fs.readFileSync(this.filePath,'utf8'));
  }
  save(entitlement){
    fs.mkdirSync(path.dirname(this.filePath),{recursive:true});
    const tmp=this.filePath+'.tmp';
    fs.writeFileSync(tmp,JSON.stringify(entitlement,null,2));
    fs.renameSync(tmp,this.filePath);
    return entitlement;
  }
}
