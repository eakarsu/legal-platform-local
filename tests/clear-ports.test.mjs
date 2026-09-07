import test from 'node:test';
import assert from 'node:assert/strict';
import {fork} from 'node:child_process';
import {once} from 'node:events';
import {mkdtemp,writeFile,rm} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {clearPorts,selectedPorts} from '../scripts/clear-ports.mjs';
import {portListening} from '../scripts/workspace.mjs';

test('cleanup selects only the requested startup ports',()=>{
 assert.deepEqual(selectedPorts([],{}),[43100]);
 assert.deepEqual(selectedPorts([],{HUB_PORT:'43105'}),[43105]);
 assert.deepEqual(selectedPorts(['start','family-law']),[43131,43130]);
 assert.equal(selectedPorts(['start','all']).length,17);
 assert.deepEqual(selectedPorts(['doctor']),[]);
 assert.throws(()=>selectedPorts(['start','unknown']),/Unknown/);
});
test('cleanup stops selected listeners, escalates if needed, and preserves other ports',async()=>{
 const dir=await mkdtemp(path.join(os.tmpdir(),'legal-platform-ports-'));
 const file=path.join(dir,'listener.cjs');
 await writeFile(file,"const s=require('net').createServer(); if(process.argv[2]==='ignore') process.on('SIGTERM',()=>{}); s.listen(0,'127.0.0.1',()=>process.send(s.address().port));");
 const children=[];
 const start=async mode=>{const child=fork(file,[mode],{stdio:['ignore','ignore','ignore','ipc']}); children.push(child); const [port]=await once(child,'message');return {child,port};};
 try {
  const normal=await start('normal'),stubborn=await start('ignore'),other=await start('normal');
  await assert.rejects(clearPorts([normal.port,NaN]),/integers/);
  assert.equal(await portListening(normal.port),true);
  await clearPorts([normal.port,stubborn.port],{graceMs:150});
  assert.equal(await portListening(normal.port),false);
  assert.equal(await portListening(stubborn.port),false);
  assert.equal(await portListening(other.port),true);
  await clearPorts([normal.port]);
 } finally {
  for(const child of children) if(child.exitCode===null && child.signalCode===null) {const exited=once(child,'exit');child.kill('SIGKILL');await exited;}
  await rm(dir,{recursive:true,force:true});
 }
});
