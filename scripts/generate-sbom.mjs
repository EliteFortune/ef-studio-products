import fs from 'node:fs';
import path from 'node:path';

const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));
const out={
  bomFormat:'CycloneDX',
  specVersion:'1.5',
  serialNumber:`urn:uuid:${crypto.randomUUID()}`,
  version:1,
  metadata:{timestamp:new Date().toISOString(),component:{type:'application',name:pkg.name,version:pkg.version}},
  components:[]
};
fs.mkdirSync('dist',{recursive:true});
fs.writeFileSync(path.join('dist','sbom.cdx.json'),JSON.stringify(out,null,2));
console.log('dist/sbom.cdx.json');
