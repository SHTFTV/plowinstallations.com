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
 if not stamp.tzinfo or stamp>datetime.now(timezone.utc)+timedelta(minutes=5):raise ValueError('Accurate nonfuture publication date required')
 return {'id':url.rstrip('/').split('/')[-1],'title':a['headline'],'url':url,'publishedAt':a['datePublished'],'image':a.get('image')}

def new_articles():
 before=os.environ.get('PUBLICATION_BEFORE_SHA','');head=os.environ.get('GITHUB_SHA','')
 if re.fullmatch('[a-f0-9]{40}',before) and re.fullmatch('[a-f0-9]{40}',head):
  output=subprocess.check_output(['git','diff','--name-only','--diff-filter=A',before,head,'--','public/guides/'],cwd=ROOT,text=True)
  paths=[ROOT/p for p in output.splitlines() if re.fullmatch('public/guides/[a-z0-9-]+/index.html',p)]
  return [article_metadata(p) for p in paths]
 sop=json.loads((ROOT/'operations/site-sop.json').read_text());return [article_metadata(ROOT/'public/guides'/sop['publication']['id']/'index.html')]

def fetch(url,binary=False):
 req=urllib.request.Request(url,headers={'User-Agent':'PlowInstallations-PublicationVerifier/1.0','Cache-Control':'no-cache'})
 with urllib.request.urlopen(req,timeout=20) as r:
  if r.status!=200:raise RuntimeError('HTTP '+str(r.status))
  data=r.read(1000000)
  return data if binary else data.decode()

def verify(a,timeout=720):
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
    if not str(a['image']).startswith(ORIGIN+'/brand/'):raise ValueError('Unexpected hero asset host')
    data=fetch(a['image'],True)
    if not data.startswith(b'\x89PNG') or len(data)<1000:raise ValueError('Live original share image unavailable')
   return {'status':'done','checkedAt':datetime.now(timezone.utc).isoformat(),'verifiedAt':datetime.now(timezone.utc).isoformat()}
  except Exception as e:error=str(e);time.sleep(15)
 return {'status':'failed','checkedAt':datetime.now(timezone.utc).isoformat(),'privateReason':error}

def record(a,result):
 public_path=ROOT/'public/publication-results.json';data=json.loads(public_path.read_text()) if public_path.exists() else {'events':[]}
 id=hashlib.sha256((a['url']+'|'+a['publishedAt']).encode()).hexdigest()[:24];event={k:a[k] for k in ['title','publishedAt','url']};event.update({'id':id,'site':'plowinstallations.com','status':result['status'],'checkedAt':result['checkedAt']})
 if result['status']=='done':event['verifiedAt']=result['verifiedAt']
 old=next((e for e in data['events'] if e['id']==id),None)
 if old and old['status']=='done' and result['status']=='done':return
 data['events']=[e for e in data['events'] if e['id']!=id]+[event];data['updatedAt']=datetime.now(timezone.utc).isoformat();public_path.write_text(json.dumps(data,indent=2)+'\n')
 private_path=ROOT/'operations/publication-checks.json';private=json.loads(private_path.read_text()) if private_path.exists() else {'checks':[]};private['checks'].append({'article':a,'result':result,'runUrl':'https://github.com/'+os.environ.get('GITHUB_REPOSITORY','SHTFTV/plowinstallations.com')+'/actions/runs/'+os.environ.get('GITHUB_RUN_ID','local'),'loadedCommit':os.environ.get('GITHUB_SHA'),'siteSopVersion':json.loads((ROOT/'operations/site-sop.json').read_text())['version']});private_path.write_text(json.dumps(private,indent=2)+'\n')

def main():
 articles=new_articles();failed=False
 for a in articles:
  result=verify(a);record(a,result);failed|=result['status']!='done';print(json.dumps({'url':a['url'],**result}))
 if failed:raise SystemExit('Publication verification failed; sanitized attention event recorded')
if __name__=='__main__':main()
