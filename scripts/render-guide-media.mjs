import {chromium} from 'playwright';
import {readFile,readdir,mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
const root=process.cwd(),origin='https://www.plowinstallations.com';
const registry=path.join(root,'operations/contributor-profiles');
const profiles=await Promise.all((await readdir(registry)).filter(n=>n.endsWith('.json')).map(async n=>JSON.parse(await readFile(path.join(registry,n),'utf8'))));
const routes=[{path:'/',kind:'platform'},{path:'/installers/',kind:'directory'},...profiles.flatMap(profile=>[{path:profile.profilePath,kind:'profile',profile},...profile.associatedPosts.map(post=>({path:`/guides/${post.id}/`,kind:'article',profile}))])];
const output=path.join(process.env.RUNNER_TEMP??'/tmp','plow-guide-visual');await mkdir(output,{recursive:true});
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
for(const p of profiles){const source=await readFile(path.join(root,'public',p.image.path));if(sha(source)!==p.image.sourceSHA256)throw Error('Original source changed');const live=await fetch(origin+p.image.path);if(!live.ok||sha(Buffer.from(await live.arrayBuffer()))!==p.image.sourceSHA256)throw Error('Public original photograph differs');}
const report={observedAt:new Date().toISOString(),sourceCommit:process.env.GITHUB_SHA,runURL:`https://github.com/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`,scope:'Platform, installer directory/profile, and both associated articles at desktop and phone widths',humanVisualAcceptance:'Separate actual screenshot review required; technical checks alone do not approve visual quality',rows:[]};
const browser=await chromium.launch({headless:true});
try{for(const viewport of [{width:1440,height:1000},{width:390,height:844}]){for(const route of routes){
 const page=await browser.newPage({viewport,deviceScaleFactor:1});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const response=await page.goto(origin+route.path,{waitUntil:'networkidle',timeout:60000});if(response?.status()!==200)throw Error('Public route not200: '+route.path);
 await page.locator('h1').waitFor();await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode().catch(()=>{})));});
 const proof=await page.evaluate(({route,origin})=>{
  const all=(q)=>[...document.querySelectorAll(q)];const globalText=all('header,footer').map(el=>el.textContent+' '+all.call(null,'header a,footer a').map(a=>a.href).join(' ')).join(' ');
  const card=document.querySelector('#owner-business-card'),profile=route.profile;let owner=null;
  if(card){const b=card.getBoundingClientRect(),main=document.querySelector('main').getBoundingClientRect();owner={defaultVisible:card.open,fixed:getComputedStyle(card).position==='fixed',displayName:card.textContent.includes(profile.displayName),serviceArea:profile.serviceArea.every(x=>card.textContent.includes(x)),profile:!!card.querySelector(`a[href="${profile.profilePath}"]`),call:!!card.querySelector(`a[href="tel:${profile.telephone}"]`),text:!!card.querySelector(`a[href="sms:${profile.telephone}"]`),email:!!card.querySelector(`a[href="mailto:${profile.email}"]`),count:document.querySelectorAll('#owner-business-card').length,geometry:{left:b.left,right:b.right,top:b.top,bottom:b.bottom,width:b.width,height:b.height},reserved:innerWidth>=1100?main.right<=b.left:parseFloat(getComputedStyle(document.body).paddingBottom)>=b.height+20};}
  return {url:location.href,canonical:document.querySelector('link[rel="canonical"]')?.href===origin+route.path,h1Count:document.querySelectorAll('h1').length,noHorizontalOverflow:document.documentElement.scrollWidth<=innerWidth,platformShell:!/Full.?Flow|Durand|Aldergrove|604.?817|info@fullflow/i.test(globalText),directoryLink:!!document.querySelector('header a[href="/installers/"]'),brokenImages:all('img').filter(i=>!i.complete||i.naturalWidth===0).map(i=>i.src),profileBinding:route.kind!=='profile'||document.querySelector('h1').textContent===profile.displayName,owner};
 },{route,origin});
 const name=`${viewport.width}-${route.kind}-${route.path.replaceAll('/','-')||'home'}`;
 await page.screenshot({path:path.join(output,name+'-opening.png')});await page.screenshot({path:path.join(output,name+'-full.png'),fullPage:true});
 if(route.kind==='article'){
  await page.locator('#owner-business-card').screenshot({path:path.join(output,name+'-business-card.png')});
  await page.locator('#owner-business-card summary').click({position:{x:8,y:8}});proof.owner.collapses=await page.locator('#owner-business-card').evaluate(el=>!el.open);await page.locator('#owner-business-card summary').click({position:{x:8,y:8}});
  await page.locator('.hero figure').screenshot({path:path.join(output,name+'-hero.png')});
 }
 const ownerPass=route.kind!=='article'||(proof.owner&&proof.owner.defaultVisible&&proof.owner.fixed&&proof.owner.displayName&&proof.owner.serviceArea&&proof.owner.profile&&proof.owner.call&&proof.owner.text&&proof.owner.email&&proof.owner.count===1&&proof.owner.reserved&&proof.owner.collapses);
 const pass=proof.canonical&&proof.h1Count===1&&proof.noHorizontalOverflow&&proof.platformShell&&proof.directoryLink&&proof.brokenImages.length===0&&proof.profileBinding&&ownerPass&&errors.length===0;
 report.rows.push({route:route.path,kind:route.kind,viewport,checks:proof,errors,status:pass?'pass':'fail',screenshots:[name+'-opening.png',name+'-full.png']});await page.close();
}}}finally{await browser.close();await writeFile(path.join(output,'receipt.json'),JSON.stringify(report,null,2)+'\n');}
if(report.rows.some(row=>row.status!=='pass'))throw Error('Installer-flow browser checks failed; retain actual captures');
console.log(JSON.stringify({status:'technical-pass',routes:routes.length,viewports:report.rows.length,output,humanReview:'pending'}));
