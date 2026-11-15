"""Validate embedded catalog assets using the same real JS engine as business tests."""
from html.parser import HTMLParser
from pathlib import Path
import unittest
import test_business as business
ROOT=Path(__file__).resolve().parents[1]
class Scripts(HTMLParser):
    def __init__(self):super().__init__();self.current=None;self.scripts={}
    def handle_starttag(self,tag,attrs):
        if tag=='script':
            self.current=dict(attrs).get('data-source')
            if self.current:self.scripts[self.current]=''
    def handle_endtag(self,tag):
        if tag=='script':self.current=None
    def handle_data(self,data):
        if self.current:self.scripts[self.current]+=data
class PreviewTest(unittest.TestCase):
    def test_embedded_images_resolve_for_every_catalog_product(self):
        if not (ROOT/'visualizar.html').exists():self.skipTest('Run build_preview.py first')
        parser=Scripts();parser.feed((ROOT/'visualizar.html').read_text())
        engine=business.BusinessTest
        engine.setUpClass()
        try:
            for name in ['embedded-assets','config.js','menu.js','cart.js','checkout.js']:
                self.assertIn(name,parser.scripts);engine.eval(parser.scripts[name])
            self.assertEqual(engine.eval('window.F47Menu.products.every(function(p){return p.image.indexOf("data:image/webp;base64,")===0})'),'true')
            self.assertEqual(engine.eval('window.F47Menu.quote({productId:"portuguesa"}).unitPrice'),'4600')
            self.assertEqual(engine.eval('window.F47Checkout.whatsappURL(window.F47_CONFIG.whatsappNumber,"Teste")'),'null')
        finally:engine.tearDownClass()
if __name__=='__main__':unittest.main(verbosity=2)
