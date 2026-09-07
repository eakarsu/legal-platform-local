import http from 'node:http';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {modules,features,readiness,ROOT} from '../scripts/workspace.mjs';
import {openStore} from './runtime/store.mjs';
import {workspaceAPI} from './runtime/api.mjs';
const app={id:'legal-platform-local',productName:'Legal Platform'};
const publicDir=fileURLToPath(new URL('./public/',import.meta.url));
const files=new Map([['/',['index.html','text/html']],['/app.js',['app.js','text/javascript']],...['floating-assistant.js','assistant.js','ai-limits.js'].map(file=>['/'+file,[file,'text/javascript']]),['/style.css',['style.css','text/css']]]);
export function createHub({databasePath=process.env.WORKSPACE_DB||path.join(ROOT,'data/workspace.sqlite'),complete}={}){
 const store=openStore(databasePath,features),api=workspaceAPI(store,{complete,features,app});
 const server=http.createServer(async(req,res)=>{
  res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Cache-Control','no-store');
  res.setHeader('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; base-uri 'none'; frame-ancestors 'none'");
  let url;try{url=new URL(req.url,`http://${req.headers.host}`);if(!['localhost','127.0.0.1','[::1]'].includes(url.hostname))throw new Error();}catch{res.writeHead(403);res.end('Local workspace only.');return;}
  try{
   if(await api(req,res,url))return;
   if(!['GET','HEAD'].includes(req.method)){res.writeHead(405,{Allow:'GET, HEAD'});res.end();return;}
   const pathname=url.pathname;
   if(['/api/catalog','/api/status','/api/health'].includes(pathname)){
    const data=pathname==='/api/catalog'?{modules,features,app,assistants:[]}:pathname==='/api/status'?await Promise.all(modules.map(readiness)):{status:'ok',service:'legal-platform-hub',mode:'merged-workspace'};
    res.writeHead(200,{'Content-Type':'application/json'});res.end(req.method==='HEAD'?undefined:JSON.stringify(data));return;
   }
   if(pathname==='/favicon.ico'){res.writeHead(204);res.end();return;}
   const featurePath=pathname.match(/^\/features\/([a-z0-9-]+)$/);
   const isAppRoute=['/overview','/settings','/feature-map'].includes(pathname)||(featurePath&&features.some(f=>f.id===featurePath[1]));
   const file=files.get(isAppRoute?'/':pathname);if(!file){res.writeHead(404);res.end('Not found');return;}
   const content=await readFile(path.join(publicDir,file[0]));res.writeHead(200,{'Content-Type':`${file[1]}; charset=utf-8`});res.end(req.method==='HEAD'?undefined:content);
  }catch{if(!res.headersSent)res.writeHead(500);res.end('Unable to load workspace data.');}
 });
 server.once('close',()=>store.close());return server;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{process.loadEnvFile(path.join(ROOT,'.env'));}catch(error){if(error.code!=='ENOENT')throw error;}
 const port=Number(process.env.HUB_PORT||43100);if(!Number.isInteger(port)||port<1024||port>65535)throw new Error('HUB_PORT must be between 1024 and 65535.');
 const server=createHub();server.once('error',error=>{console.error(error.message);process.exitCode=1;});
 server.listen(port,'127.0.0.1',()=>console.log(`Legal Platform: http://localhost:${port} — unified feature workspace`));
 for(const signal of ['SIGINT','SIGTERM'])process.once(signal,()=>server.close());
}
