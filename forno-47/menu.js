(function (w) {
  'use strict';

  var categories = [
    ['tradicionais', 'Tradicionais'], ['especiais', 'Especiais'], ['doces', 'Doces'],
    ['bebidas', 'Bebidas'], ['combos', 'Combos'], ['promocoes', 'Promoções']
  ].map(function (entry) { return { id: entry[0], label: entry[1] }; });
  var sizes = [
    { id: 'p', name: 'P (4 fatias)' },
    { id: 'm', name: 'M (6 fatias)' },
    { id: 'g', name: 'G (8 fatias)' }
  ];
  var crusts = [
    { id: 'plain', name: 'Tradicional', price: 0 },
    { id: 'cream', name: 'Cream cheese', price: 800 },
    { id: 'cheddar', name: 'Cheddar', price: 800 }
  ];
  var extras = [
    { id: 'cheese', name: 'Queijo extra', price: 600 },
    { id: 'basil', name: 'Manjericão', price: 200 },
    { id: 'olives', name: 'Azeitonas', price: 300 }
  ];
  var products = [];

  function pizza(id, name, category, description, prices, image) {
    products.push({
      id: id, name: name, category: category, description: description, kind: 'pizza',
      priceBySize: { p: prices[0], m: prices[1], g: prices[2] }, image: 'assets/' + image + '.webp'
    });
  }

  function fixed(id, name, category, description, price, image, badge) {
    products.push({
      id: id, name: name, category: category, description: description, kind: 'fixed',
      price: price, image: 'assets/' + image + '.webp', badge: badge || ''
    });
  }

  pizza('margherita', 'Margherita', 'tradicionais', 'Molho de tomate, muçarela, tomate e manjericão.', [3200, 4200, 5200], 'margherita');
  pizza('calabresa', 'Calabresa', 'tradicionais', 'Muçarela, calabresa e cebola.', [3400, 4400, 5400], 'calabresa');
  pizza('pepperoni', 'Pepperoni', 'tradicionais', 'Molho de tomate, muçarela e pepperoni.', [3600, 4600, 5600], 'pepperoni');
  pizza('portuguesa', 'Portuguesa', 'tradicionais', 'Muçarela, presunto, ovos, cebola e azeitonas.', [3600, 4600, 5600], 'portuguesa');
  pizza('quatro-queijos', 'Quatro queijos', 'especiais', 'Muçarela, provolone, parmesão e cream cheese.', [4300, 5500, 6500], 'quatro-queijos');
  pizza('frango-catupiry', 'Frango cremoso', 'especiais', 'Frango desfiado, muçarela e requeijão cremoso.', [4200, 5400, 6400], 'frango');
  pizza('chocolate', 'Chocolate', 'doces', 'Chocolate ao leite e finalização de chocolate.', [3500, 4500, 5500], 'sweet');
  pizza('banana-canela', 'Banana & canela', 'doces', 'Banana, açúcar e canela.', [3200, 4200, 5200], 'banana');
  fixed('coca-cola', 'Coca-Cola 2 L', 'bebidas', 'Refrigerante de cola, garrafa de 2 litros.', 1200, 'drinks');
  fixed('guarana', 'Guaraná 2 L', 'bebidas', 'Refrigerante de guaraná, garrafa de 2 litros.', 1000, 'drinks');
  fixed('combo-casal', 'Combo casal', 'combos', 'Uma Margherita M e um Guaraná 2 L. Composição fixa.', 4900, 'margherita');
  fixed('combo-familia', 'Combo família', 'combos', 'Duas pizzas G: Margherita e Calabresa, mais Guaraná 2 L. Composição fixa.', 10900, 'pepperoni');
  fixed('promo-margherita', 'Margherita da casa', 'promocoes', 'Uma Margherita G tradicional. Composição fixa.', 4690, 'margherita', 'Oferta');

  function find(list, id) {
    return list.find(function (entry) { return entry.id === id; });
  }

  function fail(message) {
    throw new Error(message);
  }

  function quote(input) {
    var options = input || {};
    if (typeof options !== 'object' || Array.isArray(options)) fail('Escolha um produto válido.');
    var product = find(products, options.productId);
    if (!product) fail('Produto indisponível.');

    var quantity = options.quantity === undefined ? 1 : options.quantity;
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 20) {
      fail('A quantidade deve ser inteira, entre 1 e 20.');
    }
    var note = options.note === undefined ? '' : options.note;
    if (typeof note !== 'string' || note.trim().length > 240) {
      fail('A observação deve ter até 240 caracteres.');
    }
    note = note.trim();
    var size = options.size === undefined ? 'm' : options.size;
    var second = options.secondFlavorId === undefined ? '' : options.secondFlavorId;
    var crust = options.crust === undefined ? 'plain' : options.crust;
    var chosen = options.extras === undefined ? [] : options.extras;
    if (typeof second !== 'string') fail('Escolha um segundo sabor válido.');
    if (!Array.isArray(chosen) || chosen.some(function (id, index) {
      return !find(extras, id) || chosen.indexOf(id) !== index;
    })) {
      fail('Escolha adicionais válidos, sem repetir.');
    }

    var normalized = {
      productId: product.id, size: size, secondFlavorId: second, crust: crust,
      extras: chosen.slice().sort(), quantity: quantity, note: note
    };
    var details = [];
    var price = product.price;
    var name = product.name;
    if (product.kind === 'pizza') {
      if (!find(sizes, size) || !find(crusts, crust)) fail('Escolha tamanho e borda válidos.');
      price = product.priceBySize[size];
      if (second) {
        var other = find(products, second);
        if (!other || other.kind !== 'pizza' || ((other.category === 'doces') !== (product.category === 'doces'))) {
          fail('Combine sabores salgados entre si ou doces entre si.');
        }
        if (other.id === product.id) {
          normalized.secondFlavorId = '';
        } else {
          // Half-and-half uses the higher whole-pizza price at the selected size.
          price = Math.max(price, other.priceBySize[size]);
          name = product.name + ' + ' + other.name;
          details.push('Meio a meio');
        }
      }
      details.push(find(sizes, size).name);
      details.push('Borda: ' + find(crusts, crust).name);
      price += find(crusts, crust).price;
      normalized.extras.forEach(function (id) {
        var extra = find(extras, id);
        price += extra.price;
        details.push(extra.name);
      });
    } else {
      if (size !== 'm' || second !== '' || crust !== 'plain' || chosen.length) {
        fail('Este produto tem composição fixa.');
      }
      details.push(product.description);
    }
    if (note) details.push('Observação: ' + note);
    if (!Number.isSafeInteger(price) || price < 0 || !Number.isSafeInteger(price * quantity)) {
      fail('Preço inválido.');
    }
    return {
      options: normalized, productId: product.id, name: name, unitPrice: price,
      lineTotal: price * quantity, quantity: quantity, details: details, image: product.image
    };
  }

  [products, categories, sizes, crusts, extras].forEach(function (list) {
    list.forEach(function (entry) {
      if (entry.priceBySize) Object.freeze(entry.priceBySize);
      Object.freeze(entry);
    });
    Object.freeze(list);
  });
  w.F47Menu = Object.freeze({
    products: products, categories: categories, sizes: sizes, crusts: crusts, extras: extras, quote: quote
  });
})(window);
