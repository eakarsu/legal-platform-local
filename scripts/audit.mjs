import { readdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { ROOT, modules, features } from './workspace.mjs';
const json = async name => JSON.parse(await readFile(path.join(ROOT, name), 'utf8'));
const manifest = await json('reports/source-manifest.json');
const excluded = await json('reports/excluded-files.json');
const changes = await json('reports/ai-consolidation.json');
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const provenance = [], duplicates = new Map(), routes = [];
for (const module of manifest) {
  let unchanged=0,modified=0,missing=0;
  for (const file of module.files) {
    const relative = `apps/${module.id}/${file.path}`;
    if (excluded.some(e=>e.project===module.id && e.file===file.path)) continue;
    try {
      const bytes=await readFile(path.join(ROOT,relative));
      hash(bytes)===file.sha256 ? unchanged++ : modified++;
      if (/\.(js|jsx|ts|tsx|ejs|sql)$/.test(relative) && bytes.length>300) {
        const key=hash(bytes); if (!duplicates.has(key)) duplicates.set(key,[]); duplicates.get(key).push(relative);
      }
    } catch(error) { if(error.code!=='ENOENT') throw error; missing++; }
  }
  provenance.push({id:module.id,sourceProject:module.sourceProject,sourceCommit:module.sourceCommit,unchanged,modified,missing});
}
async function walk(dir) {
  const result=[];
  for (const entry of await readdir(dir,{withFileTypes:true})) {
    if (['node_modules','.next','build','dist','.git'].includes(entry.name)) continue;
    const file=path.join(dir,entry.name);
    if(entry.isDirectory()) result.push(...await walk(file)); else if(entry.isFile()) result.push(file);
  }
  return result;
}
for (const module of modules) {
  for(const file of await walk(path.join(ROOT,'apps',module.id))) {
    const relative=path.relative(ROOT,file);
    if (/\/src\/app\/.*\/page\.tsx$/.test(file) || file.endsWith('/src/app/page.tsx')) {
      const route='/'+file.split('/src/app/')[1].split('/').filter(p=>p!=='page.tsx' && !p.startsWith('(')).join('/');
      routes.push({module:module.id,path:route,source:relative,type:'Next page'});
    }
    if (/\/App\.(js|jsx|ts|tsx)$/.test(file)) {
      const text=await readFile(file,'utf8');
      for(const match of text.matchAll(/(?:path=["']([^"']+)["']|path:\s*['"]([^'"]+)['"])/g)) {
        let route=match[1]||match[2]; if(!route.startsWith('/')) route='/'+route;
        if(!route.includes('*')) routes.push({module:module.id,path:route,source:relative,type:'React route declaration'});
      }
    }
    if(module.id==='legal-documents' && (relative.includes('/routes/') || relative.endsWith('/server.js')) && file.endsWith('.js')) {
      const text=await readFile(file,'utf8');
      for(const match of text.matchAll(/(?:router|app)\.get\(['"]([^'"]+)['"]/g)) if(!match[1].startsWith('/api')) routes.push({module:module.id,path:match[1],source:relative,type:'Express GET declaration (mounting not evaluated)'});
    }
  }
}
const routeIndex=new Set(routes.map(r=>r.module+':'+r.path));
const unresolved=[];
for(const feature of features) {
  if(feature.path !== '/features/'+feature.id) unresolved.push({feature:feature.id,path:feature.path});
  for(const source of feature.sources) {
    if(source.kind==='route' && !routeIndex.has(source.module+':'+source.path)) unresolved.push({feature:feature.id,...source});
    try { await readFile(path.join(ROOT,source.source)); } catch { unresolved.push({feature:feature.id,missingSource:source.source}); }
  }
}
const summary={generatedAt:new Date().toISOString(),modules:provenance,featureCount:features.length,mergedSourceEntries:features.reduce((n,f)=>n+f.sources.length,0),featuresCombiningSources:features.filter(f=>f.sources.length>1).length,sharedAICalls:changes.reduce((n,f)=>n+f.fetchCalls+f.axiosCalls+(f.sdkCalls||0),0),sharedAIFiles:changes.length,routeDeclarations:routes.length,unresolvedCatalogDestinations:unresolved,exactDuplicateGroups:[...duplicates.values()].filter(g=>g.length>1)};
await writeFile(path.join(ROOT,'reports/optimization-audit.json'),JSON.stringify(summary,null,2)+'\n');
await writeFile(path.join(ROOT,'reports/route-inventory.json'),JSON.stringify(routes,null,2)+'\n');
console.log(JSON.stringify({...summary,exactDuplicateGroups:summary.exactDuplicateGroups.length},null,2));
if(provenance.some(p=>p.missing) || unresolved.length) process.exitCode=1;
