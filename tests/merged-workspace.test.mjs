import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm,readFile} from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {features,ROOT} from '../scripts/workspace.mjs';
import {openStore,exportCSV} from '../hub/runtime/store.mjs';
import {seedWorkspace} from '../scripts/seed-workspace.mjs';
import {createHub} from '../hub/server.mjs';

test('feature map accounts for all inspected sources and collapses common app features',async()=>{
 const report=JSON.parse(await readFile(path.join(ROOT,'reports/feature-merge-coverage.json')));
 assert.deepEqual(report.unmappedSources,[]);assert.deepEqual(report.withoutSource,[]);
 assert.equal(new Set(features.map(f=>f.path)).size,features.length);
 for(const id of ['clients','matters','documents','billing','time','research']){
  const f=features.find(f=>f.id===id);assert.ok(new Set(f.sources.map(s=>s.module)).size>=2,id);
 }
 for(const f of features)assert.equal(new Set(f.fields.map(x=>x.name)).size,f.fields.length,f.id);
});
test('seeds every editable feature to 15 without duplicating or overwriting records',()=>{
 const store=openStore(':memory:',features);
 try{
  const mine=store.create('clients',{title:'Existing user client',data:{full_name:'Owner record'}});
  const report=seedWorkspace(store);assert.equal(report.allFeaturesPopulated,true);assert.equal(report.recordFeatures,features.filter(f=>!['audit','report'].includes(f.mode)).length);
  for(const count of Object.values(report.counts))assert.equal(count,15);
  assert.ok(report.auditRows>=15);assert.ok(report.reportRows>=15);assert.ok(report.attachmentsAdded>=15);
  assert.equal(store.get(mine.id).title,'Existing user client');
  const again=seedWorkspace(store);assert.equal(again.created,0);assert.equal(again.draftsAdded,0);assert.equal(again.total,report.total);
  for(const f of features.filter(f=>!['audit','report'].includes(f.mode)))for(const r of store.list(f.id)){
   if(r.matter_id)assert.equal(store.get(r.matter_id).feature,'matters');
   if(r.client_id)assert.equal(store.get(r.client_id).feature,'clients');
  }
 }finally{store.close();}
});
test('shared records persist after restart, guard revisions and preserve referenced clients',async()=>{
 const dir=await mkdtemp(path.join(os.tmpdir(),'legal-records-')),file=path.join(dir,'db.sqlite');let store=openStore(file,features);
 try{
  const client=store.create('clients',{title:'Shared client',data:{full_name:'Test Client'}});
  const matter=store.create('matters',{title:'Shared matter',client_id:client.id,data:{jurisdiction:'New York'}});
  const family=store.create('custody',{title:'Custody plan',client_id:client.id,matter_id:matter.id,data:{child_name:'Test child'}});
  const estate=store.create('wills',{title:'Estate document',client_id:client.id,matter_id:matter.id,data:{testator_name:'Test Client'}});
  assert.equal(family.client_id,estate.client_id);assert.equal(family.matter_id,estate.matter_id);
  assert.throws(()=>store.remove(client.id),e=>e.status===409);
  assert.throws(()=>store.update(family.id,{...family,title:'Stale',revision:0}),e=>e.status===409);
  store.update(family.id,{...family,title:'Updated custody plan'});store.close();store=openStore(file,features);
  assert.equal(store.get(family.id).title,'Updated custody plan');assert.equal(store.list('clients').length,1);
 }finally{store.close();await rm(dir,{recursive:true,force:true});}
});
test('merged API handles records, attachments, AI draft history, CSV and write-origin protection',async()=>{
 let calls=0;
 const server=createHub({databasePath:':memory:',complete:async input=>{calls++;assert.match(input.messages[1].content,/Sample text/);return {model:'test-model',choices:[{message:{content:'Mocked review draft'}}]};}});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const base=`http://127.0.0.1:${server.address().port}`;
 const request=(url,method='GET',body)=>fetch(base+url,{method,headers:{'Content-Type':'application/json','X-Legal-Workspace':'1'},body:body===undefined?undefined:JSON.stringify(body)});
 try{
  let response=await request('/api/workspace/features/summaries/records','POST',{title:'=SUM(1,2)',data:{document_text:'Sample text'}});assert.equal(response.status,201);const r=await response.json();
  const attack=await fetch(base+'/api/workspace/records/'+r.id,{method:'DELETE',headers:{Origin:'https://example.com','Content-Type':'application/json','X-Legal-Workspace':'1'},body:'{}'});assert.equal(attack.status,403);
  response=await request(`/api/workspace/records/${r.id}/ai`,'POST',{instructions:'Summarize'});assert.equal(response.status,201);assert.equal(calls,1);
  assert.equal((await (await request(`/api/workspace/records/${r.id}/drafts`)).json()).length,1);
  response=await request(`/api/workspace/records/${r.id}/attachments`,'POST',{name:'../../sample.txt',type:'text/plain',base64:Buffer.from('Sample file').toString('base64')});assert.equal(response.status,201);const attachment=await response.json();assert.equal(attachment.name,'sample.txt');
  assert.equal(await (await request('/api/attachments/'+attachment.id)).text(),'Sample file');
  const csv=await (await request('/api/workspace/features/summaries/records/export')).text();assert.match(csv,/'=SUM/);
  response=await request('/api/workspace/features/summaries/records?q=SUM');assert.equal((await response.json()).length,1);
  assert.equal((await request('/features/custody')).status,200);
  assert.equal((await request('/features/not-a-feature')).status,404);
  assert.equal((await request('/api/workspace/records/'+r.id,'DELETE',{})).status,200);
  assert.equal((await request('/api/attachments/'+attachment.id)).status,404);
 }finally{await new Promise(resolve=>server.close(resolve));}
});

test('contract and tenancy relationships validate type, survive edits and prevent orphaned work',()=>{
 const store=openStore(':memory:',features);
 try{
  const contract=store.create('contracts',{title:'Supply agreement',data:{contract_text:'Fees payable in 30 days.'}});
  const tenancy=store.create('tenancies',{title:'Apartment lease',data:{monthly_rent_amount:1500}});
  const renewal=store.create('renewals',{title:'Renewal review',data:{contract_id:contract.id,new_value:12000}});
  const notice=store.create('tenant-notices',{title:'Repair notice',data:{tenancy_id:tenancy.id}});
  assert.throws(()=>store.create('renewals',{title:'Wrong kind',data:{contract_id:tenancy.id}}),/Invalid Contract reference/);
  assert.throws(()=>store.create('tenant-notices',{title:'Missing tenancy',data:{tenancy_id:'missing'}}),/not found/);
  assert.deepEqual(store.related(contract.id).map(r=>r.id),[renewal.id]);
  assert.deepEqual(store.related(tenancy.id).map(r=>r.id),[notice.id]);
  assert.throws(()=>store.remove(contract.id),e=>e.status===409);
  assert.throws(()=>store.remove(tenancy.id),e=>e.status===409);
  store.update(renewal.id,{...renewal,data:{...renewal.data,new_value:14000}});
  assert.equal(store.get(renewal.id).data.contract_id,contract.id);
  store.remove(renewal.id);store.remove(contract.id);
  assert.equal(store.list('contracts').length,0);
 }finally{store.close();}
});

test('both contract sources share canonical screens and AI receives the linked contract facts',async()=>{
 for(const id of ['contracts','clauses','contract-approvals','negotiations','redlines','contract-advisor']){
  const sources=new Set(features.find(f=>f.id===id).sources.map(s=>s.module));
  for(const source of ['contract-negotiation','contract-lifecycle'])assert.ok(sources.has(source),`${id}: ${source}`);
 }
 let sent;
 const server=createHub({databasePath:':memory:',complete:async input=>{sent=JSON.parse(input.messages[1].content);return {model:'test',choices:[{message:{content:'Review the supplied payment terms.'}}]};}});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const base=`http://127.0.0.1:${server.address().port}`;
 const post=(url,input)=>fetch(base+url,{method:'POST',headers:{'Content-Type':'application/json','X-Legal-Workspace':'1'},body:JSON.stringify(input)});
 try{
  const contract=await (await post('/api/workspace/features/contracts/records',{title:'API contract',data:{contract_text:'Payment due within 45 days.'}})).json();
  const question=await (await post('/api/workspace/features/contract-advisor/records',{title:'Payment question',data:{contract_id:contract.id,question:'When is payment due?'}})).json();
  const response=await post(`/api/workspace/records/${question.id}/ai`,{instructions:'Explain supplied terms.'});assert.equal(response.status,201);
  assert.equal(sent.related_records[0].data.contract_text,'Payment due within 45 days.');
  const related=await (await fetch(base+`/api/workspace/records/${contract.id}/related`)).json();assert.equal(related[0].id,question.id);
 }finally{await new Promise(resolve=>server.close(resolve));}
});
