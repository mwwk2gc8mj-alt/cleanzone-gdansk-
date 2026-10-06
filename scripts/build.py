"""Validate the existing static site and stage a publishable copy (no dependencies)."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
import json,re,shutil,xml.etree.ElementTree as ET
root=Path(__file__).resolve().parent.parent
base='https://www.cleanzone-uslugi.pl'
class Page(HTMLParser):
 def __init__(self,text):
  super().__init__();self.ids=set();self.links=[];self.h1=0;self.feed(text)
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if a.get('id'):self.ids.add(a['id'])
  if tag=='h1':self.h1+=1
  if tag in ['a','link','script','img']:
   url=a.get('href') or a.get('src')
   if url:self.links.append(url)
pages={p:Page(p.read_text()) for p in root.glob('**/index.html') if 'dist' not in p.parts}
errors=[];titles=set();canonical=set();public=[]
for p,page in pages.items():
 text=p.read_text();relative=p.relative_to(root)
 if page.h1!=1:errors.append(f'{relative}: expected one H1')
 title=re.search(r'<title>(.*?)</title>',text)
 if not title or title[1] in titles:errors.append(f'{relative}: missing/duplicate title')
 else:titles.add(title[1])
 if 'noindex' not in text:
  for token in ['name="description"','rel="canonical"','property="og:title"','property="og:description"','property="og:url"','property="og:image"']:
   if token not in text:errors.append(f'{relative}: missing {token}')
  can=re.search(r'<link rel="canonical" href="([^"]+)"',text)
  expected=base+'/'+('' if p==root/'index.html' else p.parent.name+'/')
  if not can or can[1]!=expected:errors.append(f'{relative}: wrong canonical')
 if 'noindex' not in text:
  public.append(expected)
  graphs=[json.loads(x) for x in re.findall(r'<script type="application/ld\+json">(.*?)</script>',text)]
  nodes=[n for g in graphs for n in g.get('@graph',[g])]
  businesses=[n for n in nodes if n.get('@type')=='LocalBusiness']
  if len(businesses)!=1 or businesses[0].get('name')!='CleanZone':errors.append(f'{relative}: business identity')
  if businesses and businesses[0].get('telephone')!='+48730135133':errors.append(f'{relative}: business phone')
  for n in nodes:
   if n.get('@type')=='FAQPage':
    for q in n['mainEntity']:
     if not q.get('name') or not q.get('acceptedAnswer',{}).get('text'):errors.append(f'{relative}: empty FAQ')
  if p!=root/'index.html' and not any(n.get('@type')=='BreadcrumbList' for n in nodes):errors.append(f'{relative}: no breadcrumbs')
 for link in page.links:
  u=urlsplit(link)
  if u.scheme or u.netloc:continue
  path=unquote(u.path)
  target=root/path.lstrip('/') if path.startswith('/') else p.parent/path
  if not path:target=p
  if target.is_dir():target=target/'index.html'
  if not target.exists():errors.append(f'{relative}: missing link {link}')
  elif u.fragment and target in pages and u.fragment not in pages[target].ids:errors.append(f'{relative}: missing anchor {link}')
mapurls=[e.text for e in ET.parse(root/'sitemap.xml').iter('{http://www.sitemaps.org/schemas/sitemap/0.9}loc')]
if set(mapurls)!=set(public):errors.append('sitemap must match indexable HTML pages')
if errors:raise SystemExit('\n'.join(errors))
dist=root/'dist'
if dist.exists():shutil.rmtree(dist)
dist.mkdir()
for p in root.iterdir():
 if p.name.startswith('.') and p.name!='.nojekyll':continue
 if p.name in ['dist','scripts','tests'] or p.suffix=='.md' or p.name.startswith('package'):continue
 if p.is_dir():shutil.copytree(p,dist/p.name)
 else:shutil.copy2(p,dist/p.name)
print(f'Build OK: {len(pages)} HTML pages, {len(public)} indexable URLs; metadata, JSON-LD and internal links validated.')
