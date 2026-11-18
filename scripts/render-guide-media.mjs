import { chromium } from 'playwright';
import { createHash } from 'node:crypto';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root=process.cwd();
const sop=JSON.parse(await readFile(path.join(root,'operations/site-sop.json'),'utf8'));
const {id,url}=sop.publication;
if(!/^[a-z0-9-]+$/.test(id)||url!==`https://www.plowinstallations.com/guides/${id}/`)throw Error('Unexpected guide resource binding');
const local=await readFile(path.join(root,'public/guides',id,'index.html'),'utf8');
const schema=JSON.parse(local.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
const expectedImage=typeof schema.image==='string'?schema.image:schema.image?.url;
const documentary=sop.publication.photoMode==='exact-original-documentary-css-crop';
const expectedCaption=typeof schema.image==='object'?schema.image?.caption:null;
if(typeof expectedCaption!=='string'||!expectedCaption.trim())throw Error('Reviewed image credit is not bound in article metadata');
const expectedUrl=new URL(expectedImage);
if(expectedUrl.origin!=='https://www.plowinstallations.com'||!expectedUrl.pathname.startsWith('/brand/')||expectedUrl.search)throw Error('Unexpected featured asset binding');
const expectedBytes=await readFile(path.join(root,'public',expectedUrl.pathname));
const sha=b=>createHash('sha256').update(b).digest('hex');
const response=await fetch(expectedImage);
if(!response.ok||sha(Buffer.from(await response.arrayBuffer()))!==sha(expectedBytes))throw Error('Live featured bytes differ from reviewed source');
const output=path.join(process.env.RUNNER_TEMP??'/tmp','plow-guide-visual');
await mkdir(output,{recursive:true});
const report={guide:url,sourceCommit:process.env.GITHUB_SHA,runUrl:`https://github.com/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`,observedAt:new Date().toISOString(),assetSHA256:sha(expectedBytes),humanVisualAcceptance:'Separate human review required; technical checks do not approve subject quality',rows:[]};
const browser=await chromium.launch({headless:true});
try{
 for(const viewport of [{width:1440,height:1000},{width:390,height:844}]){
  const page=await browser.newPage({viewport,deviceScaleFactor:1});
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  const navigation=await page.goto(url,{waitUntil:'networkidle',timeout:60000});
  if(navigation.status()!==200)throw Error('Guide does not return200');
  await page.locator('.hero img').waitFor({state:'visible'});
  const checks=await page.evaluate(({expectedImage,expectedCaption,title,url,documentary})=>{
   const img=document.querySelector('.hero img'),box=img.getBoundingClientRect(),style=getComputedStyle(img),h1=document.querySelector('h1');
   const textOutside=[...document.querySelectorAll('h1,h2,p,li,figcaption')].filter(el=>{const b=el.getBoundingClientRect();return b.width>0&&(b.left<-.5||b.right>innerWidth+.5)}).map(el=>el.textContent.slice(0,100));
   return {viewport:{width:innerWidth,height:innerHeight},noHorizontalOverflow:document.documentElement.scrollWidth<=innerWidth,noOutsideText:textOutside.length===0,outsideText:textOutside,headline:h1?.textContent===title,h1Count:document.querySelectorAll('h1').length,canonical:document.querySelector('link[rel="canonical"]')?.href===url,og:document.querySelector('meta[property="og:image"]')?.content===expectedImage,twitter:document.querySelector('meta[name="twitter:image"]')?.content===expectedImage,native:[img.naturalWidth,img.naturalHeight],heroCurrentSrc:img.currentSrc,correctImage:img.currentSrc===expectedImage,decoded:img.complete&&img.naturalWidth>=1600&&img.naturalHeight>=900,presentation:style.objectFit===(documentary?'cover':'contain')&&Math.abs(box.width/box.height-16/9)<.01,originalDimensions:!documentary||(img.naturalWidth===1816&&img.naturalHeight===4032),fullSourceLinks:!documentary||[...document.querySelectorAll('.documentary-photo')].every(f=>[...f.querySelectorAll('a')].some(a=>a.href===f.querySelector('img').src)),credit:img.closest('figure').querySelector('.photo-credit')?.textContent??img.closest('figure').querySelector('figcaption')?.textContent,captionSize:parseFloat(getComputedStyle(img.closest('figure').querySelector('figcaption')).fontSize),contactPosition:getComputedStyle(document.querySelector('.ff-contact')).position};
  },{expectedImage,expectedCaption,title:schema.headline,url,documentary});
  const prefix=String(viewport.width);
  await page.screenshot({path:path.join(output,`${prefix}-opening.png`),fullPage:false});
  await page.locator('.hero figure').screenshot({path:path.join(output,`${prefix}-hero-and-credit.png`)});
  const inline=page.locator(documentary?'.fleet-photo':'.maintenance-photo');
  const hasInline=await inline.count()>0;
  if(hasInline){await inline.scrollIntoViewIfNeeded();await inline.screenshot({path:path.join(output,`${prefix}-inline-and-credit.png`)});}
  await page.screenshot({path:path.join(output,`${prefix}-article.png`),fullPage:true});
  const passed=checks.noHorizontalOverflow&&checks.noOutsideText&&checks.headline&&checks.h1Count===1&&checks.canonical&&checks.og&&checks.twitter&&checks.correctImage&&checks.decoded&&checks.presentation&&checks.originalDimensions&&checks.fullSourceLinks&&checks.captionSize>=12&&checks.credit===expectedCaption&&checks.contactPosition==='static'&&errors.length===0;
  report.rows.push({...checks,errors,status:passed?'pass':'fail',screenshots:[`${prefix}-opening.png`,`${prefix}-hero-and-credit.png`,...(hasInline?[`${prefix}-inline-and-credit.png`]:[]),`${prefix}-article.png`]});
  const home=await browser.newPage({viewport,deviceScaleFactor:1});
  await home.goto('https://www.plowinstallations.com/',{waitUntil:'networkidle',timeout:60000});
  const card=home.locator(`.pi-latest-guides a[href="/guides/${id}/"]`);
  await card.scrollIntoViewIfNeeded();
  await card.screenshot({path:path.join(output,`${prefix}-home-card.png`)});
  const cardProof=await card.evaluate(el=>{const i=el.querySelector('img'),s=getComputedStyle(i);return{src:i.currentSrc,native:[i.naturalWidth,i.naturalHeight],fit:s.objectFit,position:s.objectPosition,credit:el.textContent}});
  report.rows.at(-1).homeCard=cardProof;report.rows.at(-1).screenshots.push(`${prefix}-home-card.png`);
  if(cardProof.src!==expectedImage||cardProof.native[0]<1600)report.rows.at(-1).status='fail';
  await home.close();await page.close();
 }
}finally{await browser.close();await writeFile(path.join(output,'receipt.json'),JSON.stringify(report,null,2)+'\n');}
if(report.rows.length!==2||report.rows.some(x=>x.status!=='pass'))throw Error('Guide desktop/phone media inspection failed; retain captures and receipt');
console.log(JSON.stringify({guide:url,viewports:report.rows.map(x=>x.viewport),technicalChecks:'pass',humanReview:'pending',output}));
