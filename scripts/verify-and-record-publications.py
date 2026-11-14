"""Observe actual new live guides and append sanitized public completion events."""
import json,os,re,subprocess,time,hashlib,urllib.request
from pathlib import Path
from datetime import datetime,timezone,timedelta
from html.parser import HTMLParser
ROOT=Path(__file__).resolve().parents[1]
ORIGIN='https://www.plowinstallations.com'
class Schemas(HTMLParser):
 def __init__(self):super().__init__();self.on=False;self.raw=[];self.current=''
 def handle_starttag(self,t,a):
  if t=='script' and dict(a).get('type')=='application/ld+json':self.on=True;self.current=''
 def handle_data(self,d):
  if self.on:self.current+=d
 def handle_endtag(self,t):
  if t=='script' and self.on:self.raw.append(self.current);self.on=False

def article_metadata(path):
 parser=Schemas();parser.feed(path.read_text());found=[]
 for raw in parser.raw:
  value=json.loads(raw);nodes=value.get('@graph',[value]) if isinstance(value,dict) else value
  found.extend(n for n in nodes if n.get('@type') in ['Article','BlogPosting','NewsArticle'])
 if len(found)!=1:raise ValueError('Expected one exact article schema in '+str(path))
 a=found[0];url=a['mainEntityOfPage'];url=url.get('@id') if isinstance(url,dict) else url
 if not url.startswith(ORIGIN+'/guides/') or not re.fullmatch(r'https://www\.plowinstallations\.com/guides/[a-z0-9-]+/',url):raise ValueError('Article URL outside canonical guide scope')
 stamp=datetime.fromisoformat(a['datePublished'].replace('Z','+00:00'))
 # Article schema permits a calendar date as well as a timezone-aware timestamp.
 # Preserve legacy dates; do not invent a publication time to satisfy a verifier.
 if re.fullmatch(r'\d{4}-\d{2}-\d{2}',a['datePublished']):stamp=stamp.replace(tzinfo=timezone.utc)
 if not stamp.tzinfo or stamp>datetime.now(timezone.utc)+timedelta(minutes=5):raise ValueError('Accurate nonfuture publication date required')
 return {'id':url.rstrip('/').split('/')[-1],'title':a['headline'],'url':url,'publishedAt':a['datePublished'],'image':a.get('image')}

def new_articles():
 before=os.environ.get('PUBLICATION_BEFORE_SHA','');head=os.environ.get('GITHUB_SHA','')
 if os.environ.get('GITHUB_EVENT_NAME')=='schedule':
  return [article_metadata(p) for p in sorted((ROOT/'public/guides').glob('*/index.html'))]
 if re.fullmatch('[a-f0-9]{40}',before) and re.fullmatch('[a-f0-9]{40}',head):
  output=subprocess.check_output(['git','diff','--name-only','--diff-filter=A',before,head,'--','public/guides/'],cwd=ROOT,text=True)
  paths=[ROOT/p for p in output.splitlines() if re.fullmatch('public/guides/[a-z0-9-]+/index.html',p)]
  if paths:return [article_metadata(p) for p in paths]
  # A verifier/workflow repair must establish a baseline for retained guides.
  return [article_metadata(p) for p in sorted((ROOT/'public/guides').glob('*/index.html'))]
 sop=json.loads((ROOT/'operations/site-sop.json').read_text());return [article_metadata(ROOT/'public/guides'/sop['publication']['id']/'index.html')]

def fetch(url,binary=False):
 req=urllib.request.Request(url,headers={'User-Agent':'PlowInstallations-PublicationVerifier/1.0','Cache-Control':'no-cache'})
 with urllib.request.urlopen(req,timeout=20) as r:
  if r.status!=200:raise RuntimeError('HTTP '+str(r.status))
  limit=20000000 if binary else 1000000
  data=r.read(limit+1)
  if len(data)>limit:raise ValueError('Public response exceeds verification size bound')
  return data if binary else data.decode()

def validate_image_url(url):
 if not isinstance(url,str) or not re.fullmatch(r'https://www\.plowinstallations\.com/brand/[a-zA-Z0-9._-]+\.(?:png|jpe?g|webp)',url,re.I):raise ValueError('Unexpected hero asset host/path')

def validate_image(url,data):
 validate_image_url(url)
 if len(data)<1000 or not (data.startswith(b'\x89PNG\r\n\x1a\n') or data.startswith(b'\xff\xd8\xff') or (data.startswith(b'RIFF') and data[8:12]==b'WEBP')):raise ValueError('Live featured image unavailable or unsupported')
 local=ROOT/'public/brand'/url.rsplit('/',1)[-1]
 if not local.is_file() or hashlib.sha256(data).digest()!=hashlib.sha256(local.read_bytes()).digest():raise ValueError('Live featured image differs from canonical source')

def verify(a,timeout=180):
 deadline=time.time()+timeout;error='Awaiting build'
 while time.time()<deadline:
  try:
   body=fetch(a['url']);canonical='href="'+a['url']+'"'
   if canonical not in body or a['publishedAt'] not in body:raise ValueError('Public HTML is not this exact new article')
   if a['id']=='metal-pless-plbh-0836-16-hydraulic-wing-plow':
    for fact in ['2,435','36 in','12,001','18,000','PLBH 0836-16','wheel loader','skid steer','backhoe','https://www.metal-pless.com/products/plowmaxx','does not establish truck compatibility']:
     if fact.lower() not in body.lower():raise ValueError('Required16-foot-model fact/source/scope missing: '+fact)
   for path in ['/guides/','/feed.xml','/sitemap.xml']:
    content=fetch(ORIGIN+path)
    if a['id'] not in content:raise ValueError('New article missing from '+path)
   if a.get('image'):
    validate_image_url(a['image']);data=fetch(a['image'],True);validate_image(a['image'],data)
   return {'status':'done','checkedAt':datetime.now(timezone.utc).isoformat(),'verifiedAt':datetime.now(timezone.utc).isoformat()}
  except Exception as e:error=str(e);time.sleep(15)
 return {'status':'failed','checkedAt':datetime.now(timezone.utc).isoformat(),'privateReason':error}

def record(a,result):
 public_path=ROOT/'public/publication-results.json';data=json.loads(public_path.read_text()) if public_path.exists() else {'events':[]}
 id=hashlib.sha256((a['url']+'|'+a['publishedAt']).encode()).hexdigest()[:24];event={k:a[k] for k in ['title','publishedAt','url']};event.update({'id':id,'site':'plowinstallations.com','status':result['status'],'checkedAt':result['checkedAt']})
 if result['status']=='done':event['verifiedAt']=result['verifiedAt']
 old=next((e for e in data['events'] if e['id']==id),None)
 if old and old['status']=='done' and result['status']=='done':return
 private_path=ROOT/'operations/publication-checks.json';private=json.loads(private_path.read_text()) if private_path.exists() else {'checks':[]}
 last=next((x for x in reversed(private['checks']) if x['article']['url']==a['url']),None)
 if old and old['status']=='failed' and result['status']=='failed' and last and last['result'].get('privateReason')==result.get('privateReason'):return
 data['events']=[e for e in data['events'] if e['id']!=id]+[event];data['updatedAt']=datetime.now(timezone.utc).isoformat();public_path.write_text(json.dumps(data,indent=2)+'\n')
 private_path=ROOT/'operations/publication-checks.json';private=json.loads(private_path.read_text()) if private_path.exists() else {'checks':[]};private['checks'].append({'article':a,'result':result,'runUrl':'https://github.com/'+os.environ.get('GITHUB_REPOSITORY','SHTFTV/plowinstallations.com')+'/actions/runs/'+os.environ.get('GITHUB_RUN_ID','local'),'loadedCommit':os.environ.get('GITHUB_SHA'),'siteSopVersion':json.loads((ROOT/'operations/site-sop.json').read_text())['version']});private['checks']=private['checks'][-100:];private_path.write_text(json.dumps(private,indent=2)+'\n')

def main():
 # Scan known source pages on the native schedule; a metadata error or one held
 # guide is isolated rather than preventing checks for every other guide.
 schedule=os.environ.get('GITHUB_EVENT_NAME')=='schedule'
 articles=[];failures=[]
 if schedule:
  for path in sorted((ROOT/'public/guides').glob('*/index.html')):
   try:articles.append(article_metadata(path))
   except Exception as exc:failures.append({'id':path.parent.name,'status':'metadata-invalid','privateReason':str(exc)})
 else:
  try:articles=new_articles()
  except Exception as exc:failures.append({'id':'discovery','status':'metadata-invalid','privateReason':str(exc)})
 results=[]
 for a in articles:
  result=verify(a,timeout=35 if schedule else 180);record(a,result);results.append({'id':a['id'],'url':a['url'],'status':result['status']})
  if result['status']!='done':failures.append({'id':a['id'],'status':'live-verification-failed','privateReason':result.get('privateReason')})
  print(json.dumps({'url':a['url'],**result}))
 status={'site':'plowinstallations.com','checkedAt':datetime.now(timezone.utc).isoformat(),'trigger':os.environ.get('GITHUB_EVENT_NAME','local'),'sourceCommit':os.environ.get('GITHUB_SHA'),'scope':'Existing guide publication observer; not an article author or publisher','status':'attention-required' if failures else ('existing-guides-verified' if articles else 'no-new-guide-output'),'checkedGuides':len(articles),'passedGuides':sum(r['status']=='done' for r in results),'failures':[{k:x[k] for k in ['id','status']} for x in failures],'automaticArticleWriterConfigured':False,'automaticPublicationVerified':False,'noEligibleContentReason':'No approved publication queue or automatic author is connected; existing guides are observed without creating new posts.'}
 report={'status':status,'results':results,'failures':failures,'runUrl':'https://github.com/'+os.environ.get('GITHUB_REPOSITORY','SHTFTV/plowinstallations.com')+'/actions/runs/'+os.environ.get('GITHUB_RUN_ID','local')}
 report_path=Path(os.environ.get('PUBLICATION_REPORT_PATH','/tmp/plow-observer-report.json'));report_path.parent.mkdir(parents=True,exist_ok=True);report_path.write_text(json.dumps(report,indent=2)+'\n')
 # The native Actions artifact is the fresh run receipt. Commit public state
 # only when its meaning changes, avoiding a Vercel rebuild for every heartbeat.
 status_path=ROOT/'public/publication-status.json'
 previous=json.loads(status_path.read_text()) if status_path.exists() else {}
 semantic=lambda x:{k:v for k,v in x.items() if k not in ['checkedAt','trigger','sourceCommit','timestampMeaning']}
 if semantic(previous)!=semantic(status):
  status['timestampMeaning']='Last material observer state change; use native Actions run for freshness'
  status_path.write_text(json.dumps(status,indent=2)+'\n')
  (ROOT/'operations/latest-observer-run.json').write_text(json.dumps(report,indent=2)+'\n')
 if failures:raise SystemExit('Guide verification has isolated failures; attention status and private evidence retained')
if __name__=='__main__':main()
