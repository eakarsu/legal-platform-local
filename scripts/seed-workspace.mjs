import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {writeFile,mkdir} from 'node:fs/promises';
import {ROOT,features} from './workspace.mjs';
import {openStore} from '../hub/runtime/store.mjs';
const names=['Alex Morgan','Jordan Ellis','Taylor Brooks','Casey Rivera','Morgan Lee','Jamie Parker','Riley Bennett','Cameron Reed','Avery Hayes','Quinn Foster','Drew Sullivan','Harper Collins','Skyler Evans','Reese Carter','Rowan Mitchell'];
const areas=['General practice','Family law','Estate planning','Immigration','Small claims','Tenant rights','Contracts'];
const cases=['Contract review','Parenting agreement','Estate planning','Visa application','Property repair claim','Business formation','Custody planning','Trust review','Employment authorization','Deposit recovery','Trademark review','Support review','Executor planning','Interview preparation','Invoice dispute'];
function date(i,offset=0){const d=new Date();d.setUTCHours(12,0,0,0);d.setUTCDate(d.getUTCDate()+i+offset);return d.toISOString().slice(0,10);}
function value(field,i,f){
 const n=field.name,j=i%names.length;
 if(field.type==='select'&&field.options?.length)return field.options[j%field.options.length];
 if(field.type==='date'||n.endsWith('_date'))return date(j);
 if(field.type==='email'||n.includes('email'))return `sample${j+1}@example.com`;
 if(field.type==='number'){
  if(/percentage/.test(n))return n.includes('inflation')?3:Math.round(100/3*100)/100;
  if(/hours/.test(n))return 1.5+(j%5)*.5;
  if(/rate/.test(n))return 150+j*10;
  if(/years|age|duration/.test(n))return 5+j%8;
  if(/children/.test(n))return 1+j%3;
  if(/balance/.test(n))return 5000+j*250;
  return 250+j*125;
 }
 if(n==='full_name'||n.endsWith('_name')||['grantor','trustee','beneficiaries','beneficiary','designated_contact','assignee','recipient','attendees','signers'].includes(n))return names[j];
 if(n==='phone')return `202-555-${String(100+j).padStart(4,'0')}`;
 if(n==='case_number')return `DEMO-2026-${String(j+1).padStart(4,'0')}`;
 if(n==='invoice_number')return `SAMPLE-INV-${String(j+1).padStart(4,'0')}`;
 if(n==='jurisdiction'||n==='state')return ['New York','California','Texas','Florida','Illinois'][j%5];
 if(n==='address')return `${100+j} Example Lane, Sample City`;
 if(n==='currency')return 'USD';
 if(n==='receipt_number')return `SAMPLE-USCIS-${String(j+1).padStart(4,'0')}`;
 if(n==='endpoint_url')return `https://example.com/sample-webhook/${j+1}`;
 if(n==='source_language')return 'English';if(n==='target_language')return ['Spanish','French','Arabic'][j%3];
 if(n==='payment_status')return ['unpaid','pending review','partially paid'][j%3];
 if(n==='priority')return ['normal','high','low'][j%3];
 if(n==='role')return ['Attorney','Paralegal','Office manager'][j%3];
 if(n==='document_type')return ['Agreement','Letter','Case notes'][j%3];
 if(n==='relationship')return ['Spouse','Child','Advisor'][j%3];
 if(/content|text|details|facts|instructions|questions|scenario|context|preferences|agenda|terms|checklist|goals/.test(n))return `Fictional sample ${j+1} for ${f.title}. ${names[j]} is reviewing the ${cases[j].toLowerCase()} matter. Gather the supporting documents, confirm the facts and record follow-up questions. No legal conclusion or external action is implied.`;
 return `${field.label} sample ${j+1}`;
}
export function seedWorkspace(store,registry=features,minimum=15){
 if(!Number.isInteger(minimum)||minimum<15||minimum>100)throw new Error('Seed minimum must be between 15 and 100.');
 const writable=registry.filter(f=>!['report','audit'].includes(f.mode));
 const order=[...writable.filter(f=>f.id==='clients'),...writable.filter(f=>f.id==='matters'),...writable.filter(f=>['contracts','tenancies'].includes(f.id)),...writable.filter(f=>!['clients','matters','contracts','tenancies'].includes(f.id))];
 let created=0,draftsAdded=0,attachmentsAdded=0;
 for(const f of order){
  const existing=store.list(f.id),clients=store.list('clients'),matters=store.list('matters');
  for(let i=existing.length;i<minimum;i++){
   const j=i%15,practice=['Family law','Estate planning','Immigration','Small claims','Tenant rights','Contracts'].includes(f.group)?f.group:areas[j%areas.length];
   const client=clients[j%Math.max(1,clients.length)],matter=matters.find(m=>m.practice_area===practice&&m.client_id===client?.id)||matters[j%Math.max(1,matters.length)];
   const data=Object.fromEntries(f.fields.map(field=>{if(field.type==='reference'){const parents=store.list(field.reference),parent=parents.find(p=>p.matter_id===matter?.id)||parents[j%Math.max(1,parents.length)];return [field.name,parent?.id||''];}return [field.name,value(field,i,f)];}));
   const title=f.id==='clients'?`[Sample] ${names[j]}`:f.id==='matters'?`[Sample] ${cases[j]} · ${names[j]}`:`[Sample] ${f.title} · ${names[j]}`;
   const r=store.create(f.id,{title,status:f.mode==='integration'?['draft','ready'][j%2]:['draft','active','review'][j%3],practice_area:practice,client_id:f.id==='clients'?null:(matter&&f.id!=='matters'?matter.client_id:client?.id)||null,matter_id:['clients','matters'].includes(f.id)?null:matter?.id||null,data,notes:`Fictional demonstration record ${i+1} of ${minimum}. Created for testing ${f.title.toLowerCase()}. This is not a real client, transaction, provider confirmation or legal opinion.`});created++;
   if(f.ai){store.addDraft(r.id,{content:`SAMPLE REVIEW NOTE — NOT AI-GENERATED\n\n${f.title}: ${names[j]}\n\n1. Confirm the supplied facts and missing documents.\n2. Review the ${cases[j].toLowerCase()} matter with the responsible person.\n3. Verify any relevant sources before drawing conclusions.\n4. Record the next action and review date.\n\nThis seeded note demonstrates the draft history. It was created locally without contacting an AI provider.`,model:'sample-data'});draftsAdded++;}
   if(f.id==='documents'){store.addAttachment(r.id,{name:`sample-document-${j+1}.txt`,type:'text/plain',base64:Buffer.from(`FICTIONAL SAMPLE DOCUMENT\n${title}\n\nThis local sample attachment belongs to ${names[j]}. It contains no real client information.`).toString('base64')});attachmentsAdded++;}
  }
 }
 const counts=Object.fromEntries(writable.map(f=>[f.id,store.list(f.id).length]));
 return {minimum,created,draftsAdded,attachmentsAdded,counts,recordFeatures:writable.length,total:store.summary().total,auditRows:store.audit().length,reportRows:Object.keys(store.summary().counts).length,allFeaturesPopulated:Object.values(counts).every(n=>n>=minimum)};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{process.loadEnvFile(path.join(ROOT,'.env'));}catch(error){if(error.code!=='ENOENT')throw error;}
 const store=openStore(process.env.WORKSPACE_DB||path.join(ROOT,'data/workspace.sqlite'),features);
 try{const report=seedWorkspace(store);await mkdir(path.join(ROOT,'reports'),{recursive:true});await writeFile(path.join(ROOT,'reports/seed-verification.json'),JSON.stringify({...report,verifiedAt:new Date().toISOString()},null,2)+'\n');console.log(JSON.stringify({...report,counts:undefined},null,2));}finally{store.close();}
}
