"""WCAG contrast ratios for declared solid token pairs, not rendered-image contrast."""
from pathlib import Path
import re
css=(Path(__file__).resolve().parents[1]/'styles.css').read_text()
tokens=dict(re.findall(r'(--[\w-]+):(#[0-9a-f]{6})(?:;|\})',css))
def luminance(color):
    values=[int(color[i:i+2],16)/255 for i in (1,3,5)]
    values=[x/12.92 if x<=.04045 else ((x+.055)/1.055)**2.4 for x in values]
    return sum(x*w for x,w in zip(values,[.2126,.7152,.0722]))
for front,back in [('ink','paper'),('muted','paper'),('tomato','paper'),('paper-light','tomato'),('paper','ink'),('cream-muted','ink'),('danger','paper-light')]:
    lo,hi=sorted([luminance(tokens['--'+front]),luminance(tokens['--'+back])])
    ratio=(hi+.05)/(lo+.05)
    assert ratio>=4.5,(front,back,ratio)
    print(f'PASS {front}/{back}: {ratio:.2f}:1')
print('Only token contrast verified; image overlays and actual browser states require rendered QA.')
