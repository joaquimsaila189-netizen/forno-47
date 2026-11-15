"""Checks actual assets, DOM contracts and publication structure; no browser claims."""
from pathlib import Path
from html.parser import HTMLParser
import re
import xml.etree.ElementTree as ET
ROOT = Path(__file__).resolve().parents[1]
class Page(HTMLParser):
    def __init__(self):
        super().__init__(); self.ids=set(); self.refs=[]; self.scripts=[]; self.images=0; self.labels=set(); self.fields=[]; self.dialogs=[]
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if 'id' in a:
            assert a['id'] not in self.ids, f'Duplicate ID {a["id"]}'
            self.ids.add(a['id'])
        for key in ('src','href','data-gallery'):
            if key in a:self.refs.append(a[key])
        if tag=='script' and 'src' in a:self.scripts.append(a['src'])
        if tag=='img':
            assert 'alt' in a and 'width' in a and 'height' in a, a
            self.images+=1
        if tag=='label' and 'for' in a:self.labels.add(a['for'])
        if tag in ('input','select','textarea') and a.get('id'):self.fields.append(a)
        if tag=='dialog':self.dialogs.append(a)
page=Page(); page.feed((ROOT/'index.html').read_text())
for ref in page.refs:
    if ref.startswith('#'):assert ref[1:] in page.ids, f'Missing anchor {ref}'
    elif not ref.startswith(('http:','https:','data:')):assert (ROOT/ref).is_file(), f'Missing file {ref}'
for field in page.fields:assert field['id'] in page.labels or 'aria-label' in field, f'Unlabelled input {field}'
for dialog in page.dialogs:assert dialog.get('aria-labelledby') in page.ids, f'Unlabelled dialog {dialog}'
assert page.scripts==['config.js','menu.js','cart.js','checkout.js','script.js']
js=(ROOT/'script.js').read_text()
for element_id in re.findall(r"\$\('#([\w-]+)'",js):assert element_id in page.ids, f'Missing UI target #{element_id}'
for asset in (ROOT/'assets').glob('*.svg'):ET.parse(asset)
for ref in re.findall(r"url\(['\"]?([^)'\"]+)", (ROOT/'styles.css').read_text()):assert (ROOT/ref).is_file(),ref
for ref in re.findall(r'assets/[\w-]+\.webp',(ROOT/'menu.js').read_text()):assert (ROOT/ref).is_file(),ref
assert (ROOT/'.nojekyll').exists()
css=(ROOT/'styles.css').read_text()
assert 'prefers-reduced-motion' in css and 'focus-visible' in css
assert 'transition:all' not in css.replace(' ','')
assert re.search(r"whatsappNumber:\s*''",(ROOT/'config.js').read_text())
files=[ROOT/name for name in ['index.html','styles.css','script.js','config.js','menu.js','cart.js','checkout.js']]
media=list((ROOT/'assets').glob('*.webp'))
font=ROOT/'assets/forno-display.otf'
size=sum(p.stat().st_size for p in files+media+[font])
assert size<1_500_000,f'Site above 1.5 MB budget: {size}'
assert max(p.stat().st_size for p in media)<300_000
print(f'PASS: {len(page.ids)} unique IDs, {len(page.refs)} local references, {page.images} sized images, {len(page.dialogs)} named dialogs.')
print(f'PASS: script order, UI targets, labels, SVGs, CSS assets, motion/focus rules, default demo, .nojekyll.')
print(f'Page + scripts + CSS + photos + display font: {size:,} bytes (uncompressed).')
print('Does not verify visual layout, browser DOM behavior or Lighthouse scores.')

assert 'whatsapp-contact' in page.ids, 'Falta o botão de WhatsApp visível'
assert 'whatsapp-demo-dialog' in page.ids, 'Falta a simulação de mensagem pronta'
assert 'whatsapp-demo-message' in page.ids
assert 'i-whatsapp' in page.ids, 'Falta o ícone reconhecível de WhatsApp'
print('PASS: contato WhatsApp e simulação demonstrativa presentes.')
