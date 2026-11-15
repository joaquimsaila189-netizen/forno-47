(function (w) {
  'use strict';

  function clean(customer, key) {
    return typeof customer[key] === 'string' ? customer[key].trim() : '';
  }

  function validate(customer, mode) {
    var data = customer || {};
    var errors = [];
    if (mode !== 'pickup' && mode !== 'delivery') errors.push('Escolha entrega ou retirada.');
    var name = clean(data, 'name');
    if (name.length < 2 || name.length > 80) errors.push('Informe seu nome, entre 2 e 80 caracteres.');
    if (['pix', 'card', 'cash'].indexOf(data.payment) < 0) errors.push('Escolha a forma de pagamento.');
    if (mode === 'delivery') {
      if (clean(data, 'street').length < 3 || clean(data, 'street').length > 150) {
        errors.push('Informe a rua do endereço.');
      }
      if (!clean(data, 'number') || clean(data, 'number').length > 20) {
        errors.push('Informe o número ou s/n.');
      }
      if (clean(data, 'neighborhood').length < 2 || clean(data, 'neighborhood').length > 100) {
        errors.push('Informe o bairro.');
      }
    }
    if (clean(data, 'complement').length > 150) errors.push('O complemento deve ter até 150 caracteres.');
    if (clean(data, 'notes').length > 500) errors.push('A observação deve ter até 500 caracteres.');
    return errors;
  }

  function totals(items, mode, config) {
    if (mode !== 'pickup' && mode !== 'delivery') throw new Error('Escolha entrega ou retirada.');
    if (!Array.isArray(items) || items.length > 100) throw new Error('Carrinho inválido.');
    var subtotal = items.reduce(function (sum, item) {
      return sum + w.F47Menu.quote(item.options || item).lineTotal;
    }, 0);
    var fee = config && config.deliveryFeeCents !== undefined ? config.deliveryFeeCents : 700;
    if (!Number.isSafeInteger(fee) || fee < 0) throw new Error('Taxa de entrega inválida.');
    var delivery = mode === 'pickup' ? 0 : fee;
    var total = subtotal + delivery;
    if (!Number.isSafeInteger(total)) throw new Error('Total inválido.');
    return { subtotal: subtotal, delivery: delivery, total: total };
  }

  function whatsappURL(number, message) {
    if (typeof number !== 'string' || !/^\d{10,15}$/.test(number) || /^0/.test(number) || /^(\d)\1+$/.test(number)) {
      return null;
    }
    return 'https://wa.me/' + number + '?text=' + encodeURIComponent(message);
  }

  function money(cents) {
    return 'R$ ' + (cents / 100).toFixed(2).replace('.', ',');
  }

  function message(items, customer, mode, config) {
    var errors = validate(customer, mode);
    if (errors.length) throw new Error(errors.join(' '));
    if (!Array.isArray(items) || !items.length) throw new Error('Adicione um item ao carrinho.');
    var total = totals(items, mode, config);
    var lines = ['Olá! Quero fazer um pedido na Forno 47.', '', 'PEDIDO'];
    items.forEach(function (item) {
      // Requote from options: supplied names and amounts are never authoritative.
      var quote = w.F47Menu.quote(item.options || item);
      lines.push(quote.quantity + ' × ' + quote.name + ' — ' + money(quote.lineTotal));
      quote.details.forEach(function (detail) { lines.push('  ' + detail); });
    });
    lines.push(
      '', 'Subtotal: ' + money(total.subtotal), 'Entrega: ' + money(total.delivery),
      'Total: ' + money(total.total), '', 'Cliente: ' + clean(customer, 'name'),
      'Modalidade: ' + (mode === 'delivery' ? 'Entrega' : 'Retirada')
    );
    if (mode === 'delivery') {
      lines.push('Endereço: ' + clean(customer, 'street') + ', ' + clean(customer, 'number') + ' — ' + clean(customer, 'neighborhood'));
    }
    if (clean(customer, 'complement')) lines.push('Complemento: ' + clean(customer, 'complement'));
    lines.push('Pagamento: ' + ({ pix: 'Pix', card: 'Cartão', cash: 'Dinheiro' }[customer.payment]));
    if (clean(customer, 'notes')) lines.push('Observações: ' + clean(customer, 'notes'));
    lines.push('', 'Pedido sujeito à confirmação da loja.');
    if ((config && config.demo) || !whatsappURL(config && (config.whatsappNumber || config.whatsapp), '')) {
      lines.push('Modo demonstração: nenhum pedido foi enviado.');
    }
    return lines.join('\n');
  }

  w.F47Checkout = { totals: totals, validate: validate, message: message, whatsappURL: whatsappURL };
})(window);
