const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'@playwright/test');
const assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs/promises'),os=require('node:os');
(async()=>{
 const {createHub}=await import('../hub/server.mjs');const {openStore}=await import('../hub/runtime/store.mjs');const {seedWorkspace}=await import('./seed-workspace.mjs');const {features}=await import('./workspace.mjs');
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),'legal-browser-'));const databasePath=path.join(dir,'test.sqlite');const store=openStore(databasePath,features);seedWorkspace(store);store.close();
 const server=createHub({databasePath});await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const base=`http://127.0.0.1:${server.address().port}`;
 const browser=await chromium.launch({headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1050}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base);await page.getByRole('heading',{name:'Everything in one place.'}).waitFor();
  assert.equal(await page.locator('a.feature-link').count(),features.length);
  assert.equal(await page.locator('a.feature-link[href="/features/clients"]').count(),1);
  await page.screenshot({path:path.join(__dirname,'../reports/dashboard-desktop.png')});
  // Visit every merged feature page and verify populated tables/reports/audit.
  for(const f of features){
   await page.goto(base+f.path);await page.getByRole('heading',{name:f.title,exact:true}).waitFor();
   if(f.mode==='audit')assert.ok(await page.locator('.settings-row').count()>=15);
   else if(f.mode==='report')assert.ok(await page.locator('.chart-row').count()>=15);
   else {await page.locator('tbody tr').first().waitFor();assert.ok(await page.locator('tbody tr').count()>=15,f.id);}
   assert.equal(await page.locator('#error').isVisible(),false,f.id);
  }
  await page.goto(base+'/features/clients');await page.locator('tbody tr').first().waitFor();
  await page.locator('#nav-search').fill('custody');assert.ok(await page.locator('a.feature-link').count()>=1);await page.locator('#nav-search').fill('');
  await page.getByRole('button',{name:'+ New record',exact:true}).click();await page.locator('#record-dialog[open]').waitFor();
  await page.locator('[name="title"]').fill('Browser test client');await page.locator('[name="data.full_name"]').fill('Browser Client');await page.getByRole('button',{name:'Save record',exact:true}).click();await page.getByRole('heading',{name:'Browser test client',exact:true}).waitFor();
  await page.getByRole('button',{name:'Edit record',exact:true}).click();await page.locator('[name="title"]').fill('Updated browser client');await page.getByRole('button',{name:'Save record',exact:true}).click();await page.getByRole('heading',{name:'Updated browser client',exact:true}).waitFor();
  await page.reload();await page.getByRole('heading',{name:'Updated browser client',exact:true}).waitFor();
  await page.goto(base+'/features/custody');await page.locator('tbody tr').first().waitFor();await page.getByRole('button',{name:'+ New record',exact:true}).click();await page.locator('#record-dialog[open]').waitFor();
  assert.ok(await page.locator('select[name="client_id"] option').filter({hasText:'Updated browser client'}).count());await page.getByRole('button',{name:'Cancel',exact:true}).click();
  await page.locator('tbody tr').first().getByRole('link',{name:'Open →'}).click();await page.getByRole('heading',{name:'Record details'}).waitFor();assert.ok(await page.locator('.ai-result').count()>=1);
  await page.goto(base+'/features/documents');await page.locator('tbody tr').first().waitFor();await page.locator('tbody tr').first().getByRole('link',{name:'Open →'}).click();await page.getByRole('heading',{name:'Files',exact:true}).waitFor();assert.ok(await page.locator('a.attachment').count()>=1);
  // Exercise a shared contract -> renewal flow through the actual form and persisted links.
  await page.goto(base+'/features/contracts');await page.locator('tbody tr').first().waitFor();await page.getByRole('button',{name:'+ New record',exact:true}).click();await page.locator('#record-dialog[open]').waitFor();
  await page.locator('[name="title"]').fill('Browser shared contract');await page.locator('[name="data.contract_text"]').fill('Annual license fees are 12000 USD.');await page.getByRole('button',{name:'Save record',exact:true}).click();await page.getByRole('heading',{name:'Browser shared contract',exact:true}).waitFor();const contractURL=page.url();
  await page.goto(base+'/features/renewals');await page.locator('tbody tr').first().waitFor();await page.getByRole('button',{name:'+ New record',exact:true}).click();await page.locator('#record-dialog[open]').waitFor();await page.locator('[name="title"]').fill('Browser renewal');
  await page.locator('select[name="data.contract_id"]').selectOption({label:'Browser shared contract'});await page.locator('[name="data.new_value"]').fill('13000');await page.getByRole('button',{name:'Save record',exact:true}).click();await page.getByRole('heading',{name:'Browser renewal',exact:true}).waitFor();await page.reload();await page.getByRole('heading',{name:'Record details'}).waitFor();assert.ok(await page.locator('#content').getByRole('link',{name:'Browser shared contract',exact:true}).count());
  await page.goto(contractURL);await page.getByRole('heading',{name:'Linked work',exact:true}).waitFor();assert.ok(await page.locator('#content').getByRole('link',{name:'Browser renewal',exact:true}).count());
  await page.goto(base+'/features/tenant-notices');await page.locator('tbody tr').first().waitFor();await page.getByRole('button',{name:'+ New record',exact:true}).click();await page.locator('#record-dialog[open]').waitFor();assert.ok(await page.locator('select[name="data.tenancy_id"] option').count()>=16);await page.getByRole('button',{name:'Cancel',exact:true}).click();
  await page.goto(base+'/features/contracts');await page.locator('tbody tr').first().waitFor();await page.screenshot({path:path.join(__dirname,'../reports/contracts-desktop.png')});
  await page.goto(base+'/features/billing');await page.locator('tbody tr').first().waitFor();await page.screenshot({path:path.join(__dirname,'../reports/merged-billing-desktop.png')});
  await page.setViewportSize({width:390,height:844});await page.screenshot({path:path.join(__dirname,'../reports/dashboard-mobile.png')});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  await page.getByRole('button',{name:'Toggle feature navigation'}).click();await page.locator('#nav-search').fill('wills');await page.locator('a.feature-link[href="/features/wills"]').click();await page.getByRole('heading',{name:'Wills',exact:true}).waitFor();
  assert.equal(await page.evaluate(()=>document.body.classList.contains('menu-open')),false);
  assert.deepEqual(errors,[]);
  const report={featuresVisited:features.length,editableTables:features.filter(f=>!['report','audit'].includes(f.mode)).length,minimumRows:15,crud:true,persistence:true,sharedClientSelector:true,sharedContractRenewal:true,tenancySelector:true,draftHistory:true,attachments:true,mobileNavigation:true,pageErrors:errors,verifiedAt:new Date().toISOString()};
  await fs.writeFile(path.join(__dirname,'../reports/browser-verification.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
 }finally{await browser.close();await new Promise(resolve=>server.close(resolve));await fs.rm(dir,{recursive:true,force:true});}
})().catch(error=>{console.error(error);process.exitCode=1});
