"""Executa a lógica real de agendamento no JavaScriptCore do sistema, sem navegador."""
import ctypes
import ctypes.util
import json
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]
class BusinessTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        name = ctypes.util.find_library('javascriptcoregtk-4.1')
        if not name:
            raise unittest.SkipTest('JavaScriptCore indisponível; execute os testes JS em um navegador.')
        cls.js = ctypes.CDLL(name)
        ptr = ctypes.c_void_p
        signatures = {
            'JSGlobalContextCreate': ([ptr], ptr),
            'JSGlobalContextRelease': ([ptr], None),
            'JSStringCreateWithUTF8CString': ([ctypes.c_char_p], ptr),
            'JSStringRelease': ([ptr], None),
            'JSCheckScriptSyntax': ([ptr, ptr, ptr, ctypes.c_int, ctypes.POINTER(ptr)], ctypes.c_bool),
            'JSEvaluateScript': ([ptr, ptr, ptr, ptr, ctypes.c_int, ctypes.POINTER(ptr)], ptr),
            'JSValueToStringCopy': ([ptr, ptr, ctypes.POINTER(ptr)], ptr),
            'JSStringGetMaximumUTF8CStringSize': ([ptr], ctypes.c_size_t),
            'JSStringGetUTF8CString': ([ptr, ctypes.c_char_p, ctypes.c_size_t], ctypes.c_size_t),
        }
        for name, (args, result) in signatures.items():
            fn = getattr(cls.js, name); fn.argtypes = args; fn.restype = result
        cls.context = cls.js.JSGlobalContextCreate(None)
        cls.eval('var window = {};')
        
        for file in ('menu.js','cart.js','checkout.js'):
            if (ROOT / file).exists(): cls.eval((ROOT / file).read_text())

    @classmethod
    def tearDownClass(cls):
        cls.js.JSGlobalContextRelease(cls.context)

    @classmethod
    def eval(cls, code):
        string = cls.js.JSStringCreateWithUTF8CString(code.encode())
        error = ctypes.c_void_p()
        value = cls.js.JSEvaluateScript(cls.context, string, None, None, 1, ctypes.byref(error))
        cls.js.JSStringRelease(string)
        if error.value:
            
            value = error.value
            string = cls.js.JSValueToStringCopy(cls.context, value, None)
            length = cls.js.JSStringGetMaximumUTF8CStringSize(string)
            buf = ctypes.create_string_buffer(length)
            cls.js.JSStringGetUTF8CString(string, buf, length)
            cls.js.JSStringRelease(string)
            raise AssertionError(buf.value.decode())
        string = cls.js.JSValueToStringCopy(cls.context, value, None)
        length = cls.js.JSStringGetMaximumUTF8CStringSize(string)
        buf = ctypes.create_string_buffer(length)
        cls.js.JSStringGetUTF8CString(string, buf, length)
        cls.js.JSStringRelease(string)
        return buf.value.decode()

    def check(self, code):
        self.assertEqual(self.eval('(function(){'+code+';return "ok"})()'), 'ok')

    def test_prices_and_validation(self):
        self.check("""var M=window.F47Menu; if(!M) throw Error('missing menu');
        var q=M.quote({productId:'margherita',size:'m',secondFlavorId:'quatro-queijos',crust:'cream',extras:['cheese'],quantity:2});
        if(q.unitPrice!==6900 || q.lineTotal!==13800) throw Error('half price');
        var invalid=[{productId:'bad'},{productId:'margherita',quantity:1.5},{productId:'margherita',size:'x'},{productId:'margherita',secondFlavorId:'chocolate'},{productId:'margherita',extras:['cheese','cheese']},{productId:'margherita',extras:['bad']},{productId:'margherita',note:'a'.repeat(241)}];
        invalid.forEach(function(o){var threw=false;try{M.quote(o)}catch(e){threw=true}if(!threw)throw Error('invalid accepted')});
        if(M.quote({productId:'margherita',size:'p'}).unitPrice!==3200 || M.quote({productId:'margherita',size:'g'}).unitPrice!==5200) throw Error('sizes');""")

    def test_cart_revalidates_and_persists_only_options(self):
        self.check("""var raw='',s={getItem:function(){return raw},setItem:function(k,v){raw=v}};var c=window.F47Cart.create(s);
        c.add({productId:'margherita'});c.add({productId:'margherita'});if(c.count()!==2||c.items.length!==1)throw Error('merge');
        if(raw.indexOf('unitPrice')>=0||raw.indexOf('name')>=0)throw Error('persisted derived data');
        var obj=JSON.parse(raw);obj.items[0].unitPrice=1;raw=JSON.stringify(obj);c.load();if(c.subtotal()!==8400)throw Error('tampered price');
        c.setQuantity(c.items[0].id,3);if(c.count()!==3)throw Error('quantity');c.update(c.items[0].id,{productId:'coca-cola',quantity:2});if(c.subtotal()!==2400)throw Error('update');
        raw='broken';c.load();if(c.items.length||!c.lastWarning)throw Error('corrupt');
        raw=JSON.stringify({version:1,items:[{id:'a',options:{productId:'margherita'}},{id:'a',options:{productId:'bad'}}]});c.load();if(c.items.length!==1||!c.lastWarning)throw Error('filter');
        var threw=false;try{c.setQuantity(c.items[0].id,1.2)}catch(e){threw=true}if(!threw)throw Error('decimal');
        c.remove(c.items[0].id);if(c.count())throw Error('remove');c.add({productId:'coca-cola'});c.clear();if(c.count())throw Error('clear');""")

    def test_limits_and_failed_edits_are_atomic(self):
        self.check("""var M=window.F47Menu,c=window.F47Cart.create(null);c.add({productId:'margherita',quantity:20});
        var threw=false;try{c.add({productId:'margherita'})}catch(e){threw=true}if(!threw||c.count()!==20)throw Error('merge cap');
        [{productId:'margherita',quantity:0},{productId:'margherita',quantity:21},{productId:'margherita',quantity:'2'},{productId:'margherita',crust:'bad'},{productId:'margherita',note:4},{productId:'coca-cola',extras:['cheese']}].forEach(function(o){var bad=false;try{M.quote(o)}catch(e){bad=true}if(!bad)throw Error('invalid accepted')});
        var q=M.quote({productId:'chocolate',size:'g',secondFlavorId:'banana-canela',extras:['basil','cheese','olives'],crust:'cheddar',quantity:20});if(q.unitPrice!==7400||q.lineTotal!==148000)throw Error('full extras');
        var raw=JSON.stringify({version:1,items:[{id:'a',options:{productId:'margherita',quantity:20}},{id:'b',options:{productId:'margherita'}}]});var disk={getItem:function(){return raw},setItem:function(k,v){raw=v}};c=window.F47Cart.create(disk);if(c.count()!==20||!c.lastWarning)throw Error('persisted merge cap');
        c=window.F47Cart.create({getItem:function(){throw Error('denied')},setItem:function(){throw Error('quota')}});c.add({productId:'coca-cola'});if(c.count()!==1||!c.lastWarning)throw Error('memory fallback');""")

    def test_rejects_non_string_flavors_and_empty_restore_ids(self):
        self.check("""[null,0,false,{}].forEach(function(id){var bad=false;try{window.F47Menu.quote({productId:'margherita',secondFlavorId:id})}catch(e){bad=true}if(!bad)throw Error('flavor type')});
        var c=window.F47Cart.create({getItem:function(){return JSON.stringify({version:1,items:[{id:'',options:{productId:'margherita'}}]})},setItem:function(){}});if(c.count()||!c.lastWarning)throw Error('empty restore id');""")

    def test_all_javascript_syntax(self):
        for path in ROOT.glob('*.js'):
            source = self.js.JSStringCreateWithUTF8CString(path.read_bytes())
            error = ctypes.c_void_p()
            valid = self.js.JSCheckScriptSyntax(self.context, source, None, 1, ctypes.byref(error))
            self.js.JSStringRelease(source)
            self.assertTrue(valid, path.name)

    def test_fixed_combo_composition_survives_cart_and_message(self):
        self.check("""var c=window.F47Cart.create(null);c.add({productId:'combo-casal'});var item=c.items[0];if(!item.details.some(function(d){return d.indexOf('Margherita M')>=0&&d.indexOf('Guaraná 2 L')>=0}))throw Error('composition missing from cart');
        var text=window.F47Checkout.message(c.items,{name:'Ana',payment:'pix'},'pickup',{});if(text.indexOf('Margherita M')<0||text.indexOf('Guaraná 2 L')<0)throw Error('composition missing from message');""")

    def test_checkout_and_encoding(self):
        self.check("""var X=window.F47Checkout,q=window.F47Menu.quote({productId:'margherita'}),items=[q],c={name:'Ana & João',payment:'pix',street:'Rua A',number:'s/n',neighborhood:'Centro'};
        if(X.validate(c,'delivery').length||X.validate({name:'Ana',payment:'cash'},'pickup').length)throw Error('valid customer');
        if(!X.validate(c,'bad').length||!X.validate({name:'A',payment:'bad'},'delivery').length)throw Error('invalid customer');
        if(X.totals(items,'delivery',{deliveryFeeCents:700}).total!==4900||X.totals(items,'pickup',{}).delivery!==0)throw Error('totals');
        var msg=X.message(items,c,'delivery',{deliveryFeeCents:700});if(msg.indexOf('49,00')<0||msg.indexOf('Ana & João')<0||msg.indexOf('demonstração')<0)throw Error('message');
        var url=X.whatsappURL('5585999999999',msg);if(decodeURIComponent(url.split('text=')[1])!==msg)throw Error('encoding');
        ['', 'abc','00000000000'].forEach(function(n){if(X.whatsappURL(n,msg)!==null)throw Error('bad phone')});
        var threw=false;try{X.message([],c,'delivery',{})}catch(e){threw=true}if(!threw)throw Error('empty');""")

    def test_demo_flag_keeps_message_explicitly_demonstrative(self):
        self.check("""var q=window.F47Menu.quote({productId:'margherita'});
        var message=window.F47Checkout.message([q],{name:'Ana Teste',payment:'pix'},'pickup',{demo:true,whatsappNumber:'5585999999999',deliveryFeeCents:700});
        if(message.indexOf('Modo demonstração: nenhum pedido foi enviado.')<0)throw Error('Demo note missing');""")

if __name__ == '__main__': unittest.main(verbosity=2)
