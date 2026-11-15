"""Optional real-browser checks. Install Playwright + Chromium to execute."""
from pathlib import Path
import unittest
try:
    from playwright.sync_api import sync_playwright, expect
except ImportError:
    sync_playwright = None
ROOT = Path(__file__).resolve().parents[1]

@unittest.skipUnless(sync_playwright, 'Playwright/Chromium unavailable; browser QA not executed')
class BrowserTest(unittest.TestCase):
    def setUp(self):
        self.runtime = sync_playwright().start()
        self.browser = self.runtime.chromium.launch(headless=True)
        self.page = self.browser.new_page(viewport={'width':390,'height':844}, device_scale_factor=1)
        self.errors=[]
        self.page.on('pageerror', lambda error:self.errors.append(str(error)))
        self.page.goto((ROOT/'index.html').as_uri())
        self.page.wait_for_selector('.product-card')
    def tearDown(self):
        self.browser.close();self.runtime.stop()
    def test_responsive_and_images(self):
        for width in [360,375,390,430,768,1280]:
            self.page.set_viewport_size({'width':width,'height':900})
            self.assertLessEqual(self.page.evaluate('document.documentElement.scrollWidth'),width)
            self.page.locator('[data-category="doces"]').click()
            expect(self.page.locator('.product-card')).to_have_count(2)
            self.page.locator('[data-category="tradicionais"]').click()
            self.assertTrue(self.page.locator('.hero-photo img').evaluate('(i)=>i.complete && i.naturalWidth>0'))
        self.assertEqual(self.errors,[])
    def test_custom_cart_reload_pickup_and_demo_review(self):
        self.page.get_by_role('button',name='Personalizar Margherita',exact=True).click()
        self.page.locator('input[name="size"][value="g"]').check()
        self.page.select_option('#second-flavor','pepperoni')
        self.page.locator('input[name="crust"][value="cream"]').check()
        self.page.locator('input[name="extras"][value="cheese"]').check()
        self.page.fill('#custom-quantity','2')
        self.page.fill('#product-note','Sem cebola & bem assada')
        expect(self.page.locator('#custom-price')).to_contain_text('140,00')
        self.page.locator('#custom-form button[type="submit"]').click()
        self.page.reload();self.page.wait_for_selector('.product-card')
        expect(self.page.locator('#cart-bar [data-count]')).to_have_text('2')
        self.page.locator('#cart-bar').click()
        expect(self.page.locator('#cart-total')).to_contain_text('147,00')
        self.page.locator('input[name="order-mode"][value="pickup"]').check()
        expect(self.page.locator('#cart-total')).to_contain_text('140,00')
        self.page.locator('#go-checkout').click()
        expect(self.page.locator('#address-fields')).to_be_hidden()
        self.page.fill('#customer-name','Ana Teste')
        self.page.select_option('#customer-payment','pix')
        self.page.locator('#checkout-form button[type="submit"]').click()
        expect(self.page.locator('#review-dialog')).to_be_visible()
        expect(self.page.locator('#order-preview')).to_contain_text('140,00')
        expect(self.page.locator('#order-preview')).to_contain_text('Sem cebola & bem assada')
        expect(self.page.locator('#send-whatsapp')).to_be_visible()
        self.page.locator('#send-whatsapp').click()
        expect(self.page.locator('#whatsapp-demo-dialog')).to_be_visible()
        expect(self.page.locator('#whatsapp-demo-message')).to_contain_text('140,00')
        expect(self.page.locator('#whatsapp-demo-message')).to_contain_text('Sem cebola & bem assada')
        self.assertEqual(self.errors,[])

if __name__=='__main__':unittest.main(verbosity=2)
