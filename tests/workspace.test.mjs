import test from 'node:test';
import assert from 'node:assert/strict';
import net from 'node:net';
import {readFile,access} from 'node:fs/promises';
import path from 'node:path';
import {modules,features,ROOT,selectModules,validateConfig,serviceEnv,assertPortFree,commandFor} from '../scripts/workspace.mjs';
import {createHub} from '../hub/server.mjs';
test('ten included modules have unique non-conflicting ports and valid entry points',async()=>{
 assert.equal(modules.length,10); const ports=modules.flatMap(m=>m.services.map(s=>s.port)); assert.equal(new Set(ports).size,ports.length);
 for(const m of modules) for(const s of m.services) await access(path.join(ROOT,'apps',m.id,s.dir,'package.json'));
 assert.throws(()=>selectModules('../../'),/Unknown module/);
});
test('one canonical entry per workflow, with validated module references',()=>{
 assert.equal(new Set(features.map(f=>f.id)).size,features.length);
 assert.equal(new Set(features.map(f=>f.title)).size,features.length);
 for(const f of features) for(const d of [{module:f.owner,path:f.path},...f.alternatives]) {assert.ok(modules.some(m=>m.id===d.module));assert.match(d.path,/^\/(?!\/)/);}
});
test('database and secret configuration are mandatory',()=>{
 const m=modules[0]; assert.equal(validateConfig(m,{}).length,2);
 assert.equal(validateConfig(m,{DATABASE_URL:'postgresql://localhost/new_database',[m.secret]:'x'.repeat(48)}).length,0);
 assert.ok(validateConfig(m,{DATABASE_URL:'https://example.com/db',[m.secret]:'x'.repeat(48)}).length);
});
test('frontend ports and backend origins agree across frameworks',()=>{
 for(const m of modules) for(const s of m.services) {
  const env=serviceEnv(m,s,{DATABASE_URL:'postgres://localhost/private'});
  assert.equal(env.PORT,String(s.port)); assert.equal(env.CLIENT_URL,`http://localhost:${m.port}`);
  assert.equal(env.DATABASE_URL,'postgres://localhost/private');
  const [binary,args]=commandFor(s); assert.equal(binary,process.execPath); assert.ok(args.length);
 }
});
test('occupied ports fail without terminating their owners',async()=>{
 const server=net.createServer(); await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 try { await assert.rejects(assertPortFree(server.address().port),/occupied/);assert.equal(server.listening,true); }
 finally { await new Promise(resolve=>server.close(resolve)); }
});
test('all rewritten modules resolve the shared transport',async()=>{
 const changes=JSON.parse(await readFile(path.join(ROOT,'reports/ai-consolidation.json')));
 for(const entry of changes) await access(path.resolve(ROOT,path.dirname(entry.path),entry.sharedModule));
 assert.equal(new Set(changes.map(c=>c.path.split('/')[1])).size,7);
});
test('hub serves catalog and assets, blocks writes and never serves source or env files',async()=>{
 const server=createHub({databasePath:':memory:'}); await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const base=`http://127.0.0.1:${server.address().port}`;
 try {
  const catalog=await (await fetch(base+'/api/catalog')).json(); assert.equal(catalog.modules.length,10);
  assert.equal((await (await fetch(base+'/api/health')).json()).status,'ok');
  for(const file of ['/','/app.js','/style.css']) assert.equal((await fetch(base+file)).status,200);
  for(const file of ['/.env','/apps/family-law/.env','/../package.json']) assert.equal((await fetch(base+file)).status,404);
  assert.equal((await fetch(base+'/api/status',{method:'POST'})).status,405);
  const status=await (await fetch(base+'/api/status')).json(); assert.equal(status.length,10);assert.ok(status.every(s=>!('DATABASE_URL' in s)));
 } finally { await new Promise(resolve=>server.close(resolve)); }
});
