"""Render public installer pages/ownership blocks from the per-installer registry.

No network or AI calls. Run after an owner approves a registry change.
"""
from pathlib import Path
import html,json,re
ROOT=Path(__file__).resolve().parents[1]
ORIGIN='https://www.plowinstallations.com'
IAM='https://www.industryarmymarketing.com/'
LOWER_MAINLAND='/installers/lower-mainland/'
OTHER_CITIES='/installers/other-cities/'
RECRUIT='mailto:wow@plowwow.com?subject=PlowInstallations%20installer%20profile%20enquiry'
E=lambda v:html.escape(str(v),quote=True)
def load_profiles():return sorted((json.loads(p.read_text()) for p in (ROOT/'operations/contributor-profiles').glob('*.json')),key=lambda p:p['id'])
def actions(p):
 return f'<div class="owner-card-actions"><a href="tel:{E(p["telephone"])}"><span class="wide-contact">Call {E(p["displayTelephone"])}</span><span class="compact-contact">Call</span></a><a href="sms:{E(p["telephone"])}">Text</a><a href="mailto:{E(p["email"])}">Email</a></div>'
def owner_block(p):
 return f'<section class="contributor-profile" id="contributor-business" aria-label="Associated installer"><p class="owner-kicker">INSTALLER PROFILE</p><h2><a href="{E(p["profilePath"])}">{E(p["displayName"])}</a></h2><p>Based in {E(p["baseCity"])}, {E(p["region"])} · Serving {E(", ".join(p["serviceArea"]))}</p><a class="owner-profile-link" href="{E(p["profilePath"])}">View the business profile and contact details ↗</a></section>'
def floating(p):
 return f'<details class="owner-business-card" id="owner-business-card" open data-installer-id="{E(p["id"])}"><summary><a class="owner-card-name" href="{E(p["profilePath"])}">{E(p["displayName"])}</a><small>{E(p["baseCity"])}, {E(p["region"])} · Serving {E(", ".join(p["serviceArea"]))}</small><span class="owner-card-toggle" aria-hidden="true"></span></summary><div class="owner-card-body"><p class="owner-card-context">Discuss the truck, plow, work and availability directly with this business.</p>{actions(p)}<a class="owner-card-profile" href="{E(p["profilePath"])}">Business profile ↗</a></div></details>'
def preview(p):
 im=p['image'];return f'<article class="installer-preview"><a href="{E(p["profilePath"])}"><img src="{E(im["path"])}" width="1816" height="4032" style="object-position:{E(im["position"])}" alt="{E(im["alt"])}" loading="lazy"><div><small>{E(im["credit"])}</small><h2>{E(p["displayName"])}</h2><p>Based in {E(p["baseCity"])}, {E(p["region"])} · Serving {E(", ".join(p["serviceArea"]))}</p><p>{E(p["summary"])}</p><strong>View business profile ↗</strong></div></a></article>'
def shell(title,path,summary,body,schema,image):
 return f'''<!doctype html><html lang="en-CA"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{E(title)} | PlowInstallations</title><meta name="description" content="{E(summary)}"><link rel="canonical" href="{ORIGIN}{path}"><meta name="robots" content="index,follow,max-image-preview:large"><link rel="icon" href="/brand/plow-mark.svg"><link rel="stylesheet" href="/installer-flow.css"><meta property="og:type" content="website"><meta property="og:title" content="{E(title)}"><meta property="og:url" content="{ORIGIN}{path}"><meta property="og:description" content="{E(summary)}"><meta property="og:image" content="{ORIGIN}{image}"><meta name="twitter:title" content="{E(title)}"><meta name="twitter:description" content="{E(summary)}"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:image" content="{ORIGIN}{image}"><script type="application/ld+json">{json.dumps(schema,ensure_ascii=False)}</script></head><body class="installer-page"><header><a href="/"><img class="guide-logo" src="/brand/plow-logo-light.svg" alt="PlowInstallations" width="610" height="150"></a><nav aria-label="Main navigation"><a href="/installers/">Find an installer</a><a href="/guides/">Guides</a><a href="{IAM}">IAM network ↗</a></nav></header><main>{body}</main><footer><p><strong>PlowInstallations · Installer network</strong><br>Independent installers, equipment guides and shop profiles across cities.</p><p><a href="/installers/">Find an installer</a> · <a href="/guides/">Equipment guides</a> · <a href="{IAM}">Industry Army Marketing ↗</a></p></footer></body></html>'''

def with_installer_banner(page):
 banner=f'<!-- INSTALLER-RECRUITMENT-START --><aside class="installer-recruitment-banner" aria-label="Installer network invitation"><strong>Are you a plow installation company?</strong><a href="{OTHER_CITIES}#join-network">Get listed in your city ↗</a></aside><!-- INSTALLER-RECRUITMENT-END -->'
 if '<!-- INSTALLER-RECRUITMENT-START -->' in page:
  page=re.sub(r'<!-- INSTALLER-RECRUITMENT-START -->[\s\S]*?<!-- INSTALLER-RECRUITMENT-END -->',lambda _:banner,page,count=1)
 else:
  page,n=re.subn(r'(<main\b[^>]*>)',lambda m:m[1]+banner,page,count=1)
  if n!=1:raise ValueError('Guide is missing its main element')
 if 'href="/installer-flow.css"' not in page:
  page=page.replace('</head>','<link rel="stylesheet" href="/installer-flow.css"></head>',1)
 return page

def render_all():
 ps=load_profiles();out={}
 previews=[]
 for p in ps:
  posts=[]
  for association in p['associatedPosts']:
   slug=association['id'];path='public/guides/'+slug+'/index.html';t=(ROOT/path).read_text()
   block='<!-- INSTALLER-OWNER-START -->'+owner_block(p)+'<!-- INSTALLER-OWNER-END -->'
   card='<!-- INSTALLER-CARD-START -->'+floating(p)+'<!-- INSTALLER-CARD-END -->'
   if '<!-- INSTALLER-OWNER-START -->' in t:t=re.sub(r'<!-- INSTALLER-OWNER-START -->[\s\S]*?<!-- INSTALLER-OWNER-END -->',lambda m:block,t)
   else:t=t.replace('<!-- INSTALLER-OWNER-BLOCK -->',block)
   if '<!-- INSTALLER-CARD-START -->' in t:t=re.sub(r'<!-- INSTALLER-CARD-START -->[\s\S]*?<!-- INSTALLER-CARD-END -->',lambda m:card,t)
   else:t=t.replace('<!-- INSTALLER-FLOATING-CARD -->',card)
   if not ('<!-- INSTALLER-OWNER-START -->' in t and '<!-- INSTALLER-CARD-START -->' in t):raise ValueError('Missing owner slots: '+slug)
   if slug.startswith('aldergrove-ford-f550-'):
    sm=re.search(r'<script type="application/ld\+json">([\s\S]*?)</script>',t);metadata=json.loads(sm.group(1));metadata['author']['name']=p['ownerName'];metadata['author']['url']=ORIGIN+p['profilePath'];metadata['author']['affiliation']={'@type':'LocalBusiness','@id':ORIGIN+p['profilePath']+'#business','name':p['businessName']};t=t[:sm.start(1)]+json.dumps(metadata,ensure_ascii=False)+t[sm.end(1):]
   if association.get('installerPerspective'):
    sm=re.search(r'<script type="application/ld\+json">([\s\S]*?)</script>',t)
    metadata=json.loads(sm.group(1))
    metadata['contributor']={'@type':'Person','name':p['ownerName'],'url':ORIGIN+p['profilePath'],'affiliation':{'@type':'LocalBusiness','@id':ORIGIN+p['profilePath']+'#business','name':p['businessName']}}
    t=t[:sm.start(1)]+json.dumps(metadata,ensure_ascii=False)+t[sm.end(1):]
   out[path]=t
   article=json.loads((ROOT/'content/articles'/f'{slug}.json').read_text());im=article.get('image') or article.get('featuredImage')
   # Prefer the exact already-published schema image/caption, not a guessed product variant.
   schema=json.loads(re.search(r'<script type="application/ld\+json">([\s\S]*?)</script>',t).group(1));im=schema['image'];src=im if isinstance(im,str) else im['url'];credit=(im.get('caption','') if isinstance(im,dict) else 'Source credit in the article')
   posts.append(f'<article class="associated-post-preview"><a href="/guides/{E(slug)}/"><img src="{E(src)}" alt="{E(schema["headline"])}" loading="lazy" class="'+('documentary-preview' if 'f550' in slug or association.get('installerPerspective') else 'product-preview')+'"><div><small>'+E(association.get('imageCredit') or ('Owner-supplied photograph' if 'f550' in slug else 'BOSS Products / The Toro Company'))+'</small><h3>'+E(schema['headline'])+'</h3><p>'+('Owner-supplied commercial fleet build feature.' if 'f550' in slug else 'Manufacturer-researched equipment guide; contact Full Flow to discuss your own setup.')+'</p><strong>Read the post ↗</strong></div></a></article>')
  image=p['image'];business={'@type':'LocalBusiness','@id':ORIGIN+p['profilePath']+'#business','name':p['businessName'],'url':ORIGIN+p['profilePath'],'telephone':p['telephone'],'email':p['email'],'address':{'@type':'PostalAddress','addressLocality':p['baseCity'],'addressRegion':p['region'],'addressCountry':p['country']},'areaServed':p['serviceArea'],'image':ORIGIN+image['path']}
  body=f'<section class="installer-profile-hero"><p class="network-eyebrow">INDEPENDENT INSTALLER PROFILE</p><h1>{E(p["displayName"])}</h1><p class="installer-location">Based in {E(p["baseCity"])}, {E(p["region"])} · Serving {E(", ".join(p["serviceArea"]))}</p><p>{E(p["summary"])}</p>{actions(p)}<figure><img src="{E(image["path"])}" width="1816" height="4032" style="object-position:{E(image["position"])}" alt="{E(image["alt"])}" fetchpriority="high"><figcaption>{E(image["credit"])} · <a href="{E(image["path"])}">View the full original photograph ↗</a></figcaption></figure></section><section class="installer-profile-body"><h2>Talk through your snow-service build</h2><p>Contact Durand about commercial plow installation, hydraulics, repairs and snow-service equipment. Share the truck and plow details, the properties you service and the work you want to discuss. Confirm fitment, scope, timing and pricing directly with Full Flow Hydraulics.</p><p><strong>Business contact:</strong> <a href="tel:{E(p["telephone"])}">{E(p["displayTelephone"])}</a> · <a href="mailto:{E(p["email"])}">{E(p["email"])}</a></p><h2>Posts associated with this business</h2><div class="associated-post-grid">'+''.join(posts)+'</div><p class="installer-network-note">Full Flow Hydraulics is an independent business profiled on the PlowInstallations network. PlowInstallations is part of Industry Army Marketing; equipment guides retain their own editorial and source credits.</p><p><a href="/installers/">All installer profiles ↗</a></p></section>'
  schema={'@context':'https://schema.org','@type':'ProfilePage','name':p['displayName'],'url':ORIGIN+p['profilePath'],'mainEntity':business,'publisher':{'@type':'Organization','name':'PlowInstallations','url':ORIGIN+'/','parentOrganization':{'@type':'Organization','name':'Industry Army Marketing','url':IAM}}}
  out['public'+p['profilePath']+'index.html']=shell(p['displayName'],p['profilePath'],p['summary'],body,schema,p['image']['path']);previews.append(preview(p))
 directoryBody='<section class="installer-directory-intro"><p class="network-eyebrow">PLOWINSTALLATIONS · IAM NETWORK</p><h1>Find an installer.</h1><p>Explore independent installer profiles, the work they share and the areas they serve. Choose a business, then contact it directly about your truck, plow and installation.</p><p>This directory grows city by city. The published profiles below identify each business separately.</p><p class="directory-count">'+str(len(ps))+' published installer profile'+('s' if len(ps)!=1 else '')+'</p></section><section class="installer-directory-grid" aria-label="Published installer profiles">'+''.join(previews)+'</section><section class="installer-directory-intro"><h2>Bring your business to the network.</h2><p>PlowInstallations connects equipment reading with the installers behind the work. Ask Industry Army Marketing about an installer profile and marketing support for your city.</p><a class="installer-button" href="'+IAM+'">Explore Industry Army Marketing ↗</a></section>'
 regions=f'<nav class="installer-region-nav" aria-label="Installer regions"><a href="{LOWER_MAINLAND}">Lower Mainland cities ↗</a><a href="{OTHER_CITIES}">Other cities ↗</a></nav>'
 directoryBody=directoryBody.replace('</section>',regions+'</section>',1)
 directorySchema={'@context':'https://schema.org','@type':'CollectionPage','name':'PlowInstallations installer directory','url':ORIGIN+'/installers/','publisher':{'@type':'Organization','name':'Industry Army Marketing','url':IAM},'mainEntity':{'@type':'ItemList','itemListElement':[{'@type':'ListItem','position':i+1,'name':p['displayName'],'url':ORIGIN+p['profilePath']} for i,p in enumerate(ps)]}}
 out['public/installers/index.html']=shell('Find an installer','/installers/','Independent snowplow installer profiles, locations and service areas. A PlowInstallations and Industry Army Marketing network.',directoryBody,directorySchema,'/brand/plow-share.jpg')
 full_flow=next(p for p in ps if p['id']=='full-flow-hydraulics')
 lower_title='Find a Lower Mainland plow installer'
 lower_description='Contact Durand at Full Flow Hydraulics for Lower Mainland plow installation enquiries. Confirm availability for your city.'
 lower_body=f'<section class="installer-directory-intro"><p class="network-eyebrow">LOWER MAINLAND · INSTALLER NETWORK</p><h1>{lower_title}</h1><p>In Vancouver, Surrey, Langley, Burnaby, Richmond, Abbotsford or another Lower Mainland city? Send Durand your city, truck configuration and plow model so he can confirm coverage, fitment and timing.</p>{regions}</section><section class="installer-directory-grid" aria-label="Lower Mainland installer">{preview(full_flow)}</section><section class="installer-directory-intro">{actions(full_flow)}</section>'
 other_title='Plow installation outside the Lower Mainland'
 other_description='Tell PlowInstallations where your installation business works and ask to be listed in your city.'
 other_body=f'<section class="installer-directory-intro"><p class="network-eyebrow">INSTALLER NETWORK · OTHER CITIES</p><h1>{other_title}</h1>{regions}</section><section class="installer-directory-intro installer-recruitment-card" id="join-network"><h2>Are you a plow installation company?</h2><p>Send PlowInstallations your business name, base city, service area, and the plows or trucks you work on. Ask about a profile for your city.</p><a class="installer-button" href="{RECRUIT}">Ask about getting listed ↗</a></section>'
 for route,title,description,body in [(LOWER_MAINLAND,lower_title,lower_description,lower_body),(OTHER_CITIES,other_title,other_description,other_body)]:
  schema={'@context':'https://schema.org','@type':'CollectionPage','name':title,'description':description,'url':ORIGIN+route,'publisher':directorySchema['publisher']}
  out['public'+route+'index.html']=shell(title,route,description,body,schema,'/brand/plow-share.jpg')
 public=[dict({k:p[k] for k in ['id','displayName','businessName','ownerName','profilePath','baseCity','region','serviceArea','summary','image']},associatedPostIds=[a['id'] for a in p['associatedPosts']]) for p in ps]
 out['src/data/installerProfiles.ts']='// Generated from operations/contributor-profiles/*.json by scripts/render-installer-profiles.py.\nexport const installerProfiles = '+json.dumps(public,ensure_ascii=False,indent=2)+' as const;\n'
 guide_path='public/guides/index.html';guide=(ROOT/guide_path).read_text()
 section='<section class="network-installer-link"><h2>Installer profiles</h2><p>Find the people behind the equipment and contact each business directly.</p><div class="installer-card-grid">'+''.join(previews)+'</div><p><a href="/installers/">All installer profiles ↗</a></p></section>'
 if '<!-- INSTALLER-DIRECTORY-PREVIEW-START -->' in guide:guide=re.sub(r'<!-- INSTALLER-DIRECTORY-PREVIEW-START -->[\s\S]*?<!-- INSTALLER-DIRECTORY-PREVIEW-END -->',lambda m:'<!-- INSTALLER-DIRECTORY-PREVIEW-START -->'+section+'<!-- INSTALLER-DIRECTORY-PREVIEW-END -->',guide)
 else:guide=re.sub(r'<section class="network-installer-link">[\s\S]*?</section>',lambda m:'<!-- INSTALLER-DIRECTORY-PREVIEW-START -->'+section+'<!-- INSTALLER-DIRECTORY-PREVIEW-END -->',guide)
 out[guide_path]=guide
 for post_path in sorted((ROOT/'public/guides').glob('*/index.html')):
  rel=post_path.relative_to(ROOT).as_posix()
  out[rel]=with_installer_banner(out.get(rel,post_path.read_text()))
 return out
if __name__=='__main__':
 import argparse
 parser=argparse.ArgumentParser();parser.add_argument('--check',action='store_true');args=parser.parse_args();outputs=render_all();bad=[]
 for rel,text in outputs.items():
  p=ROOT/rel
  if args.check:
   if not p.exists() or p.read_text()!=text:bad.append(rel)
  else:p.parent.mkdir(parents=True,exist_ok=True);p.write_text(text)
 if bad:raise SystemExit('Installer registry render drift: '+', '.join(bad))
 print(('Checked' if args.check else 'Rendered')+' '+str(len(outputs))+' installer-owned outputs from registry.')
