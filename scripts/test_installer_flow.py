"""Ownership and discovery gates for platform and installer publication."""
import importlib.util,json,re,unittest,copy
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('installer_renderer',ROOT/'scripts/render-installer-profiles.py');renderer=importlib.util.module_from_spec(spec);spec.loader.exec_module(renderer)
def text(path):return (ROOT/path).read_text()
def assert_platform_shell(html):
 for tag in ['header','footer']:
  region=re.search(r'<'+tag+r'\b[^>]*>([\s\S]*?)</'+tag+'>',html)
  if not region:raise ValueError('Missing platform '+tag)
  if re.search(r'Full.?Flow|Durand|Aldergrove|604.?817|info@fullflow',region.group(1),re.I):raise ValueError('Business identity leaked into platform '+tag)
  if '/installers/' not in region.group(1):raise ValueError('Missing platform installer directory')
def assert_owner_binding(html,profile):
 if html.count('id="owner-business-card"')!=1:raise ValueError('Exactly one owner card required')
 card=re.search(r'<details\b[^>]*id="owner-business-card"[^>]*>[\s\S]*?</details>',html).group(0)
 if not re.search(r'<details\b[^>]*\bopen(?:\s|>)',card):raise ValueError('Owner card must be initially visible')
 if f'data-installer-id="{profile["id"]}"' not in card:raise ValueError('Wrong associated installer')
 for href in [profile['profilePath'],'tel:'+profile['telephone'],'sms:'+profile['telephone'],'mailto:'+profile['email']]:
  if f'href="{href}"' not in card:raise ValueError('Missing owner action '+href)
 for label in [profile['displayName'],profile['baseCity'],*profile['serviceArea']]:
  if label not in card:raise ValueError('Missing owner identity/service area')
 block=re.search(r'<section class="contributor-profile"[\s\S]*?</section>',html)
 if not block or f'href="{profile["profilePath"]}"' not in block.group(0):raise ValueError('Missing profile-linked attribution')
 assert_platform_shell(html)
class InstallerFlowTests(unittest.TestCase):
 def setUp(self):self.profiles=renderer.load_profiles();self.p=self.profiles[0]
 def test_generated_profiles_blocks_and_previews_match_registry(self):
  for path,expected in renderer.render_all().items():self.assertEqual(text(path),expected,path)
 def test_each_associated_post_has_correct_visible_owner_and_platform_shell(self):
  self.assertIn('snowex-8100pp-power-plow-truck-fit-mount-parts',{post['id'] for post in self.p['associatedPosts']})
  for post in self.p['associatedPosts']:assert_owner_binding(text('public/guides/'+post['id']+'/index.html'),self.p)
 def test_all_guide_posts_have_one_recruitment_banner(self):
  for post in (ROOT/'public/guides').glob('*/index.html'):
   page=post.read_text()
   self.assertEqual(page.count('class="installer-recruitment-banner"'),1,post)
   self.assertIn(renderer.OTHER_CITIES+'#join-network',page,post)
 def test_installer_directory_routes_regions_separately(self):
  lower=text('public'+renderer.LOWER_MAINLAND+'index.html')
  other=text('public'+renderer.OTHER_CITIES+'index.html')
  self.assertIn(self.p['profilePath'],lower)
  self.assertIn('tel:'+self.p['telephone'],lower)
  self.assertNotIn(self.p['profilePath'],other)
  self.assertIn('Are you a plow installation company?',other)
  self.assertIn(renderer.RECRUIT,other)
 def test_contact_mutation_is_rejected(self):
  t=text('public/guides/'+self.p['associatedPosts'][0]['id']+'/index.html');t=t.replace('tel:'+self.p['telephone'],'tel:+10000000000')
  with self.assertRaises(ValueError):assert_owner_binding(t,self.p)
 def test_missing_profile_service_area_and_closed_card_are_rejected(self):
  t=text('public/guides/'+self.p['associatedPosts'][1]['id']+'/index.html')
  for bad in [t.replace('Serving Greater Vancouver','Serving somewhere else'),t.replace('id="owner-business-card" open','id="owner-business-card"'),t.replace('href="'+self.p['profilePath']+'"','href="/wrong-profile/"')]:
   with self.assertRaises(ValueError):assert_owner_binding(bad,self.p)
 def test_global_platform_identity_on_all_static_shells(self):
  for p in (ROOT/'public/guides').rglob('index.html'):assert_platform_shell(p.read_text())
  for p in (ROOT/'public/installers').rglob('index.html'):assert_platform_shell(p.read_text())
  for p in ['src/App.tsx','src/components/Navbar.tsx','src/components/PlowInstallationPage.tsx','src/components/FitmentDatabase.tsx','index.html','metadata.json']:
   self.assertIsNone(re.search(r'Full.?Flow|Durand|Aldergrove|604.?817|info@fullflow',re.sub(r'/(?:guides/[a-z0-9-]+/|brand/[a-z0-9.-]+)', '/guides/article/',text(p)),re.I),p)
 def test_platform_business_leak_is_rejected(self):
  t=text('public/installers/index.html').replace('<footer>','<footer><p>Full Flow Hydraulics 604-817-3783</p>')
  with self.assertRaises(ValueError):assert_platform_shell(t)
 def test_profile_directory_sitemap_and_home_preview_are_discoverable(self):
  p=self.p;profile=text('public'+p['profilePath']+'index.html');directory=text('public/installers/index.html');guides=text('public/guides/index.html')
  self.assertIn('<h1>'+p['displayName']+'</h1>',profile)
  for source in [directory,guides,text('src/data/installerProfiles.ts'),text('public/sitemap.xml')]:self.assertIn(p['profilePath'],source)
  for action in ['tel:'+p['telephone'],'sms:'+p['telephone'],'mailto:'+p['email']]:self.assertIn(action,profile)
  self.assertIn('InstallerPreviewCards',text('src/App.tsx'));self.assertIn('installerProfiles.map',text('src/components/InstallerPreviewCards.tsx'))
  self.assertIn('associatedPostIds',text('src/components/ShopGuideCards.tsx'))
 def test_boss_editorial_author_and_both_publication_dates_stay_bound(self):
  for post in self.p['associatedPosts']:
   t=text('public/guides/'+post['id']+'/index.html');schema=json.loads(re.search(r'<script type="application/ld\+json">([\s\S]*?)</script>',t).group(1));record=json.loads(text('content/articles/'+post['id']+'.json'))
   self.assertEqual(schema['datePublished'],record['publishedAt'])
   self.assertEqual(schema['publisher']['name'],'PlowInstallations')
   if post['id'].startswith('boss-'):self.assertEqual(schema['author']['name'],'PlowInstallations Editorial')
 def test_platform_and_profile_share_metadata_keep_separate_identity(self):
  p=self.p
  for route,title,description,image in [('public/installers/index.html','Find an installer','Independent snowplow installer profiles, locations and service areas. A PlowInstallations and Industry Army Marketing network.','/brand/plow-share.jpg'),('public'+p['profilePath']+'index.html',p['displayName'],p['summary'],p['image']['path'])]:
   html=text(route)
   for attribute,key,value in [('property','og:title',title),('name','twitter:title',title),('property','og:description',description),('name','twitter:description',description),('property','og:image','https://www.plowinstallations.com'+image),('name','twitter:image','https://www.plowinstallations.com'+image)]:
    import html as escape
    self.assertIn('<meta '+attribute+'="'+key+'" content="'+escape.escape(value,quote=True)+'">',html)
  schema=json.loads(re.search(r'<script type="application/ld\+json">([\s\S]*?)</script>',text('index.html')).group(1))
  self.assertEqual(schema['@type'],'WebSite');self.assertEqual(schema['publisher']['name'],'Industry Army Marketing');self.assertNotIn('telephone',schema)
 def test_original_photograph_source_bytes_and_profile_schema(self):
  import hashlib
  p=self.p;photo=ROOT/'public'/p['image']['path'].lstrip('/');self.assertEqual(hashlib.sha256(photo.read_bytes()).hexdigest(),p['image']['sourceSHA256'])
  s=json.loads(re.search(r'<script type="application/ld\+json">([\s\S]*?)</script>',text('public'+p['profilePath']+'index.html')).group(1))
  self.assertEqual(s['@type'],'ProfilePage');self.assertEqual(s['mainEntity']['name'],p['businessName']);self.assertEqual(s['mainEntity']['areaServed'],p['serviceArea']);self.assertNotIn('streetAddress',s['mainEntity']['address'])
if __name__=='__main__':unittest.main()
