import json,re,unittest,importlib.util,tempfile
from pathlib import Path
from xml.etree import ElementTree as ET
P=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('verify',Path(__file__).with_name('verify-and-record-publications.py'));v=importlib.util.module_from_spec(spec);spec.loader.exec_module(v)
class Tests(unittest.TestCase):
 def test_prepared_model_specs_and_compatibility_remain_distinct(self):
  a=json.loads((P/'content/articles/metal-pless-plbh-0836-16-hydraulic-wing-plow.json').read_text());self.assertEqual(a['boxWidthFt']+2*a['wingWidthFt'],a['expandedWidthFt']);self.assertEqual(a['expandedWidthFt'],16);self.assertEqual(a['approxWeightLb'],2435);self.assertNotIn('truck',a['compatibleCarrierFamilies']);self.assertEqual(a['sources'][0]['url'],'https://www.metal-pless.com/products/plowmaxx')
 def test_actual_article_metadata_and_initial_content_are_present(self):
  p=P/'public/guides/metal-pless-plbh-0836-16-hydraulic-wing-plow/index.html';a=v.article_metadata(p);s=p.read_text();self.assertEqual(a['url'],'https://www.plowinstallations.com/guides/metal-pless-plbh-0836-16-hydraulic-wing-plow/');self.assertIn('does not establish truck compatibility',s);self.assertIn('No hands-on test or technical approval by Durand is claimed',s);self.assertIn('metal-pless-plbh-0836-16-diagram-phone.svg',s);self.assertIn('Full Flow Hydraulics',s);self.assertIn('tel:+16048173783',s)
 def test_feed_and_sitemap_retain_existing_posts_and_add_exact_new_route(self):
  feed=ET.fromstring((P/'public/feed.xml').read_text());links=[i.findtext('link') for i in feed.findall('./channel/item')];self.assertEqual(sum('metal-pless-plbh-0836-16' in x for x in links),1);self.assertTrue(any('sno-way-29hd-76' in x for x in links));old=next(i for i in feed.findall('./channel/item') if 'sno-way-29hd-76' in i.findtext('link'));self.assertIn('2026',old.findtext('pubDate'));ET.fromstring((P/'public/sitemap.xml').read_text());self.assertIn('metal-pless-plbh-0836-16-hydraulic-wing-plow',(P/'public/sitemap.xml').read_text());self.assertIn('metal-pless-plbh-0836-16-hydraulic-wing-plow',(P/'src/App.tsx').read_text())
 def test_original_visuals_have_desktop_and_phone_dimensions(self):
  for f,size in [('metal-pless-plbh-0836-16-diagram.svg',(1200,630)),('metal-pless-plbh-0836-16-diagram-phone.svg',(480,460))]:
   r=ET.fromstring((P/'public/brand'/f).read_text());self.assertEqual((int(r.attrib['width']),int(r.attrib['height'])),size)
  self.assertTrue((P/'public/brand/metal-pless-plbh-0836-16-share.png').read_bytes().startswith(b'\x89PNG'))
 def test_public_event_is_sanitized_and_idempotent(self):
  original=v.ROOT
  try:
   with tempfile.TemporaryDirectory() as tmp:
    v.ROOT=Path(tmp);(v.ROOT/'public').mkdir();(v.ROOT/'operations').mkdir();(v.ROOT/'operations/site-sop.json').write_text('{"version":1}');a={'title':'Feature','url':'https://www.plowinstallations.com/guides/example/','publishedAt':'2026-11-09T22:00:00+00:00'};r={'status':'done','checkedAt':'2026-11-09T22:01:00+00:00','verifiedAt':'2026-11-09T22:01:00+00:00','privateReason':'PRIVATE_TOKEN'};v.record(a,r);v.record(a,r);public=(v.ROOT/'public/publication-results.json').read_text();self.assertNotIn('PRIVATE_TOKEN',public);self.assertNotIn('runUrl',public);self.assertEqual(len(json.loads(public)['events']),1)
  finally:v.ROOT=original
if __name__=='__main__':unittest.main()
