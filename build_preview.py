"""Optional packaging helper; the published website has no build step."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
import base64
import json
import re

ROOT=Path(__file__).resolve().parent
SCRIPTS=['config.js','menu.js','cart.js','checkout.js','script.js']
MIME={'.webp':'image/webp','.svg':'image/svg+xml','.otf':'font/otf'}
assets={file.name:'data:'+MIME[file.suffix]+';base64,'+base64.b64encode(file.read_bytes()).decode()
        for file in (ROOT/'assets').iterdir() if file.suffix in MIME}
html=(ROOT/'index.html').read_text()
html=html.replace('<link rel="stylesheet" href="styles.css">','<style>\n'+(ROOT/'styles.css').read_text()+'\n</style>')
for name in SCRIPTS:html=html.replace(f'<script src="{name}" defer></script>','')
for name,uri in assets.items():html=html.replace('assets/'+name,uri)
# Catalog image paths are assembled at runtime; point the portable preview at embedded images.
parts=['<script data-source="embedded-assets">window.F47_ASSETS='+json.dumps({name:uri for name,uri in assets.items() if name.endswith('.webp')})+';</script>']
for name in SCRIPTS:
    source=(ROOT/name).read_text()
    if name=='menu.js':
        needle="image: 'assets/' + image + '.webp'"
        assert source.count(needle)==2, 'Catalog image constructor changed; update preview mapping.'
        source=source.replace(needle,"image: window.F47_ASSETS[image + '.webp']")
    parts.append(f'<script data-source="{name}">\n'+source.replace('</script','<\\/script')+'\n</script>')
html=html.replace('</body>','\n'.join(parts)+'\n</body>')
assert not re.search(r'(?:src|href)=["\'](?:assets/|styles.css|config.js|menu.js|cart.js|checkout.js|script.js)',html)
assert "'assets/' + image" not in html
(ROOT/'visualizar.html').write_text(html)
archive=ROOT.with_suffix('.zip')
with ZipFile(archive,'w',ZIP_DEFLATED) as z:
    for file in sorted(ROOT.rglob('*')):
        rel=file.relative_to(ROOT)
        if file.is_file() and not any(part in ('.agents','__pycache__','screenshots') for part in rel.parts):
            z.write(file,Path(ROOT.name)/rel)
with ZipFile(archive) as z:assert z.testzip() is None
print(f'Portable preview: {ROOT / "visualizar.html"} ({len(html.encode()):,} bytes)')
print(f'Verified ZIP: {archive} ({archive.stat().st_size:,} bytes)')
