(function (w) {
  'use strict';

  var KEY = 'forno47-cart-v1';
  var serial = 0;

  function signature(options) {
    var copy = Object.assign({}, options);
    delete copy.quantity;
    return JSON.stringify(copy);
  }

  // Omit storage to use localStorage; pass null for a memory-only cart.
  // Construction restores valid saved items immediately. load() can restore again.
  function Cart(storage) {
    this.items = [];
    this.lastWarning = '';
    if (storage !== undefined) {
      this.storage = storage;
    } else {
      try {
        this.storage = w.localStorage;
      } catch (error) {
        this.storage = null;
        this.lastWarning = 'Não foi possível acessar o armazenamento.';
      }
    }
    this.load();
  }

  Cart.prototype.save = function () {
    if (!this.storage) return;
    try {
      var data = {
        version: 1,
        items: this.items.map(function (item) {
          return { id: item.id, options: item.options };
        })
      };
      this.storage.setItem(KEY, JSON.stringify(data));
    } catch (error) {
      this.lastWarning = 'Seu carrinho está disponível apenas nesta sessão.';
    }
  };

  Cart.prototype.load = function () {
    this.items = [];
    if (!this.storage) return this;
    try {
      var raw = this.storage.getItem(KEY);
      if (!raw) return this;
      var data = JSON.parse(raw);
      if (!data || data.version !== 1 || !Array.isArray(data.items) || data.items.length > 100) {
        throw new Error('Carrinho salvo inválido.');
      }
      var self = this;
      data.items.forEach(function (row) {
        try {
          if (!row || typeof row.id !== 'string' || !row.id.trim() || row.id.length > 100) {
            throw new Error('Identificador inválido.');
          }
          var quote = w.F47Menu.quote(row.options);
          var same = self.items.find(function (item) {
            return signature(item.options) === signature(quote.options);
          });
          if (same) {
            var quantity = same.quantity + quote.quantity;
            if (quantity > 20) throw new Error('Quantidade inválida.');
            Object.assign(same, w.F47Menu.quote(Object.assign({}, same.options, { quantity: quantity })));
          } else {
            if (self.items.some(function (item) { return item.id === row.id; })) {
              throw new Error('Identificador repetido.');
            }
            self.items.push(Object.assign({ id: row.id }, quote));
          }
        } catch (error) {
          self.lastWarning = 'Alguns itens inválidos foram removidos do carrinho.';
        }
      });
    } catch (error) {
      this.lastWarning = 'Não foi possível recuperar o carrinho salvo.';
    }
    return this;
  };

  Cart.prototype.add = function (options) {
    var quote = w.F47Menu.quote(options);
    var same = this.items.find(function (item) {
      return signature(item.options) === signature(quote.options);
    });
    if (same) {
      quote = w.F47Menu.quote(Object.assign({}, quote.options, { quantity: quote.quantity + same.quantity }));
      Object.assign(same, quote);
    } else {
      if (this.items.length >= 100) throw new Error('O carrinho atingiu o limite de itens.');
      same = Object.assign({ id: 'item-' + Date.now().toString(36) + '-' + (++serial) }, quote);
      this.items.push(same);
    }
    this.save();
    return same;
  };

  Cart.prototype.update = function (id, options) {
    var old = this.items.find(function (item) { return item.id === id; });
    if (!old) throw new Error('Item não encontrado.');
    var quote = w.F47Menu.quote(options);
    var same = this.items.find(function (item) {
      return item.id !== id && signature(item.options) === signature(quote.options);
    });
    if (same) {
      quote = w.F47Menu.quote(Object.assign({}, quote.options, { quantity: quote.quantity + same.quantity }));
      this.items = this.items.filter(function (item) { return item !== same; });
    }
    Object.assign(old, quote);
    this.save();
    return old;
  };

  Cart.prototype.setQuantity = function (id, quantity) {
    var item = this.items.find(function (item) { return item.id === id; });
    if (!item) throw new Error('Item não encontrado.');
    return this.update(id, Object.assign({}, item.options, { quantity: quantity }));
  };

  Cart.prototype.remove = function (id) {
    this.items = this.items.filter(function (item) { return item.id !== id; });
    this.save();
  };

  Cart.prototype.clear = function () {
    this.items = [];
    this.save();
  };

  Cart.prototype.subtotal = function () {
    return this.items.reduce(function (sum, item) {
      return sum + w.F47Menu.quote(item.options).lineTotal;
    }, 0);
  };

  Cart.prototype.count = function () {
    return this.items.reduce(function (sum, item) {
      return sum + w.F47Menu.quote(item.options).quantity;
    }, 0);
  };

  w.F47Cart = { Cart: Cart, create: function (storage) { return new Cart(storage); }, STORAGE_KEY: KEY };
})(window);
