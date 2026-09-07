import path from 'node:path';
import {writeFile} from 'node:fs/promises';
import {features,ROOT} from './workspace.mjs';
import {openStore} from '../hub/runtime/store.mjs';
try{process.loadEnvFile(path.join(ROOT,'.env'));}catch(e){if(e.code!=='ENOENT')throw e;}
const store=openStore(process.env.WORKSPACE_DB||path.join(ROOT,'data/workspace.sqlite'),features);
let updated=0,links=0;
try{
 for(const f of features)for(const record of store.list(f.id)){
  if(record.revision!==1||!record.title.startsWith('[Sample] ')||!record.notes.startsWith('Fictional demonstration record '))continue;
  const data={...record.data};let changed=false;
  for(const field of f.fields.filter(x=>x.type==='reference')){
   if(!/^(Contract|Tenancy) sample \d+$/.test(data[field.name]||''))continue;
   const parents=store.list(field.reference),parent=parents.find(p=>p.title.endsWith(record.title.split(' · ').at(-1)))||parents.find(p=>p.matter_id===record.matter_id&&p.client_id===record.client_id);
   if(!parent)throw new Error('No matching sample parent for '+record.id);
   data[field.name]=parent.id;changed=true;links++;
  }
  if(changed){store.update(record.id,{...record,data});updated++;}
 }
 const report={updatedSampleRecords:updated,repairedLinks:links,scope:'Only untouched, explicitly generated sample rows with Contract/Tenancy sample N placeholders.',verifiedAt:new Date().toISOString()};
 await writeFile(path.join(ROOT,'reports/sample-reference-repair.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
}finally{store.close();}
