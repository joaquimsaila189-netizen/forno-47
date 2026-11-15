(() => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const menu = window.F47Menu;
  const checkout = window.F47Checkout;
  const config = window.F47_CONFIG;
  const cart = new window.F47Cart.Cart();
  const money = value => (value / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const icon = name => `<svg class="icon" aria-hidden="true"><use href="#i-${name}"></use></svg>`;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const productDialog = $('#product-dialog');
  const cartDialog = $('#cart-dialog');
  const checkoutDialog = $('#checkout-dialog');
  const reviewDialog = $('#review-dialog');
  const customForm = $('#custom-form');
  const customerForm = $('#checkout-form');
  let category = 'tradicionais';
  let currentProduct = null;
  let editingId = null;
  let returnToCart = false;
  let mode = 'delivery';
  let toastTimer;
  const dialogOpeners = new WeakMap();
  let orderText = '';

  function toast(text) {
    const target = $('#toast');
    clearTimeout(toastTimer);
    target.textContent = text;
    target.classList.add('visible');
    toastTimer = setTimeout(() => target.classList.remove('visible'), 3500);
  }
  function animate(element, className) {
    if (!element || reduceMotion.matches) return;
    element.classList.remove(className);
    requestAnimationFrame(() => element.classList.add(className));
  }
  function openDialog(dialog) {
    if (typeof dialog.showModal !== 'function') {
      toast('Atualize seu navegador para usar o pedido com segurança.');
      return false;
    }
    dialogOpeners.set(dialog, document.activeElement);
    dialog.showModal();
    dialog.scrollTop = 0;
    return true;
  }
  $$('dialog').forEach(dialog => {
    dialog.addEventListener('click', event => {
      if (event.target.closest('[data-close]')) dialog.close();
      if (event.target === dialog) {
        const rect = dialog.getBoundingClientRect();
        if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
      }
    });
    dialog.addEventListener('close', () => {
      if (!document.querySelector('dialog[open]')) {
        const opener = dialogOpeners.get(dialog);
        const target = opener?.isConnected && !opener.closest('dialog:not([open])') ? opener : $('.header-cart');
        target.focus({ preventScroll: true });
      }
    });
  });
  productDialog.addEventListener('close', () => {
    if (returnToCart) {
      returnToCart = false;
      editingId = null;
      openCart();
    }
  });

  function renderMenu() {
    const query = $('#menu-search').value.trim().toLocaleLowerCase('pt-BR');
    const products = menu.products.filter(product => {
      const matchesCategory = query || product.category === category;
      return matchesCategory && (!query || `${product.name} ${product.description}`.toLocaleLowerCase('pt-BR').includes(query));
    });
    const grid = $('#product-grid');
    grid.innerHTML = products.length ? products.map(product => {
      const base = product.kind === 'pizza' ? product.priceBySize.p : product.price;
      return `<article class="product-card"><img src="${escape(product.image)}" width="600" height="400" loading="lazy" decoding="async" alt="Fotografia conceitual ilustrativa de ${product.kind === 'pizza' ? 'pizza' : product.category === 'bebidas' ? 'bebidas' : 'pizza de composição fixa'}"><div class="product-card-body"><h3>${escape(product.name)}</h3><p>${escape(product.description)}</p><div class="product-meta"><span class="product-price"><small>${product.kind === 'pizza' ? 'A partir de (P)' : 'Composição fixa'}</small>${money(base)}</span><button class="add-product" type="button" data-product="${escape(product.id)}" aria-label="${product.kind === 'pizza' ? 'Personalizar' : 'Adicionar'} ${escape(product.name)}">${icon('plus')}</button></div></div></article>`;
    }).join('') : '<div class="empty-menu"><h3>Nenhum sabor por aqui.</h3><p>Tente outro nome ou ingrediente.</p><button type="button" class="secondary-button" id="reset-search">Limpar busca</button></div>';
    $('#menu-result').textContent = query ? `${products.length} resultado(s) para “${query}”.` : `${products.length} opções em ${menu.categories.find(item => item.id === category).label.toLowerCase()}.`;
    animate(grid, 'category-enter');
  }
  $('#category-nav').addEventListener('click', event => {
    const button = event.target.closest('[data-category]');
    if (!button) return;
    category = button.dataset.category;
    $('#menu-search').value = '';
    $$('#category-nav button').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    renderMenu();
  });
  $('#menu-search').addEventListener('input', () => {
    $$('#category-nav button').forEach(button => button.setAttribute('aria-pressed', String(!$('#menu-search').value.trim() && button.dataset.category === category)));
    renderMenu();
  });
  document.addEventListener('click', event => {
    const button = event.target.closest('[data-product]');
    if (button) openProduct(button.dataset.product);
    if (event.target.closest('#reset-search')) {
      $('#menu-search').value = '';
      $$('#category-nav button').forEach(item => item.setAttribute('aria-pressed', String(item.dataset.category === category)));
      renderMenu();
      $('#menu-search').focus();
    }
  });

  function openProduct(productId, existing = null) {
    currentProduct = menu.products.find(item => item.id === productId);
    if (!currentProduct) return toast('Este produto não está disponível.');
    editingId = existing?.id || null;
    returnToCart = Boolean(existing);
    if (cartDialog.open) cartDialog.close();
    customForm.reset();
    $('#custom-error').textContent = '';
    $('#product-title').textContent = currentProduct.name;
    $('#product-description').textContent = currentProduct.description;
    $('#custom-image').src = currentProduct.image;
    $('#custom-image').alt = 'Fotografia conceitual ilustrativa; os ingredientes podem variar conforme a escolha.';
    $('#pizza-options').hidden = currentProduct.kind !== 'pizza';
    const options = existing?.options || { size: 'm', secondFlavorId: '', crust: 'plain', extras: [], quantity: 1, note: '' };
    $('#size-options').innerHTML = menu.sizes.map(size => `<label class="choice"><input type="radio" name="size" value="${size.id}" ${size.id === options.size ? 'checked' : ''}><span>${escape(size.name)}<small style="display:block">${money(currentProduct.priceBySize?.[size.id] || currentProduct.price)}</small></span></label>`).join('');
    $('#crust-options').innerHTML = menu.crusts.map(crust => `<label class="choice"><input type="radio" name="crust" value="${crust.id}" ${crust.id === options.crust ? 'checked' : ''}><span>${escape(crust.name)}</span><small>${crust.price ? '+ ' + money(crust.price) : 'Incluída'}</small></label>`).join('');
    $('#extra-options').innerHTML = menu.extras.map(extra => `<label class="choice"><input type="checkbox" name="extras" value="${extra.id}" ${options.extras.includes(extra.id) ? 'checked' : ''}><span>${escape(extra.name)}</span><small>+ ${money(extra.price)}</small></label>`).join('');
    const compatible = menu.products.filter(item => item.kind === 'pizza' && item.id !== productId && (item.category === 'doces') === (currentProduct.category === 'doces'));
    $('#second-flavor').innerHTML = '<option value="">Um sabor só</option>' + compatible.map(item => `<option value="${item.id}">${escape(item.name)}</option>`).join('');
    $('#second-flavor').value = options.secondFlavorId;
    $('#custom-quantity').value = options.quantity;
    $('#product-note').value = options.note;
    $('#custom-action-label').textContent = editingId ? 'Salvar alterações' : 'Adicionar ao pedido';
    updateCustomPrice();
    openDialog(productDialog);
  }
  function customOptions() {
    const data = new FormData(customForm);
    const pizza = currentProduct.kind === 'pizza';
    return { productId: currentProduct.id, size: pizza ? data.get('size') || 'm' : 'm', secondFlavorId: pizza ? data.get('secondFlavorId') || '' : '', crust: pizza ? data.get('crust') || 'plain' : 'plain', extras: pizza ? data.getAll('extras') : [], quantity: Number(data.get('quantity')), note: data.get('note') || '' };
  }
  function updateCustomPrice() {
    if (!currentProduct) return;
    try {
      const quote = menu.quote(customOptions());
      $('#custom-price').textContent = money(quote.lineTotal);
      $('#custom-error').textContent = '';
      $('#custom-form [type="submit"]').disabled = false;
      const size = quote.options.size;
      $$('#second-flavor option[value]').forEach(option => {
        const product = menu.products.find(item => item.id === option.value);
        if (product) option.textContent = `${product.name} (${money(product.priceBySize[size])})`;
      });
    } catch (error) {
      $('#custom-error').textContent = error.message;
      $('#custom-form [type="submit"]').disabled = true;
    }
    const quantity = Number($('#custom-quantity').value);
    $('[data-custom-qty="-1"]').disabled = quantity <= 1;
    $('[data-custom-qty="1"]').disabled = quantity >= 20;
  }
  customForm.addEventListener('change', updateCustomPrice);
  $('#custom-quantity').addEventListener('input', updateCustomPrice);
  customForm.addEventListener('click', event => {
    const button = event.target.closest('[data-custom-qty]');
    if (!button) return;
    const input = $('#custom-quantity');
    const value = Number(input.value);
    input.value = Math.max(1, Math.min(20, (Number.isInteger(value) ? value : 1) + Number(button.dataset.customQty)));
    updateCustomPrice();
    animate(button.closest('.quantity-control'), 'changed');
  });
  customForm.addEventListener('submit', event => {
    event.preventDefault();
    if (!customForm.reportValidity()) return;
    try {
      const changed = Boolean(editingId);
      const item = changed ? cart.update(editingId, customOptions()) : cart.add(customOptions());
      renderCart();
      productDialog.close();
      toast(`${item.name}: ${changed ? 'alterações salvas' : 'adicionado ao pedido'}.`);
      $$('[data-open-cart]').forEach(element => animate(element, 'bump'));
    } catch (error) { $('#custom-error').textContent = error.message; }
  });

  function renderCart() {
    $$('[data-count]').forEach(target => { target.textContent = cart.count(); });
    $('#cart-bar').hidden = cart.items.length === 0;
    document.body.classList.toggle('has-cart', cart.items.length > 0);
    $('#cart-bar-total').textContent = money(cart.subtotal());
    $('#cart-warning').hidden = !cart.lastWarning;
    $('#cart-warning').textContent = cart.lastWarning;
    $('#cart-items').innerHTML = cart.items.length ? cart.items.map(item => `<article class="cart-item"><div class="cart-item-top"><img src="${escape(item.image)}" width="70" height="70" alt="Imagem ilustrativa do item"><div><h3>${escape(item.name)}</h3><p class="item-details">${item.details.map(escape).join('<br>')}</p></div><span class="item-price">${money(item.lineTotal)}</span></div><div class="cart-item-bottom"><div class="quantity-control"><button type="button" data-cart-action="decrease" data-item="${escape(item.id)}" aria-label="Diminuir ${escape(item.name)}" ${item.quantity <= 1 ? 'disabled' : ''}>${icon('minus')}</button><output aria-label="Quantidade">${item.quantity}</output><button type="button" data-cart-action="increase" data-item="${escape(item.id)}" aria-label="Aumentar ${escape(item.name)}" ${item.quantity >= 20 ? 'disabled' : ''}>${icon('plus')}</button></div><div class="item-links"><button type="button" data-cart-action="edit" data-item="${escape(item.id)}">Editar</button><button type="button" data-cart-action="remove" data-item="${escape(item.id)}" aria-label="Remover ${escape(item.name)}">Remover</button></div></div></article>`).join('') : `<div class="cart-empty">${icon('bag')}<h3>Tem espaço pra uma pizza.</h3><p>Escolha um sabor no cardápio para começar.</p><button type="button" class="button" data-close>Ver cardápio</button></div>`;
    $('#cart-nonempty').hidden = !cart.items.length;
    $('#cart-next').hidden = !cart.items.length;
    if (cart.items.length) {
      const totals = checkout.totals(cart.items, mode, config);
      $('#cart-subtotal').textContent = money(totals.subtotal);
      $('#cart-delivery').textContent = mode === 'pickup' ? 'Sem taxa' : money(totals.delivery);
      $('#cart-total').textContent = money(totals.total);
    }
  }
  function openCart() { renderCart(); openDialog(cartDialog); }
  $$('[data-open-cart]').forEach(button => button.addEventListener('click', openCart));
  $('#cart-items').addEventListener('click', event => {
    const button = event.target.closest('[data-cart-action]');
    if (!button) return;
    const item = cart.items.find(item => item.id === button.dataset.item);
    if (!item) return;
    const action = button.dataset.cartAction;
    if (action === 'edit') return openProduct(item.productId, item);
    try {
      if (action === 'remove') cart.remove(item.id);
      else cart.setQuantity(item.id, item.quantity + (action === 'increase' ? 1 : -1));
      renderCart();
      const next = $$('[data-cart-action]').find(target => target.dataset.item === item.id && target.dataset.cartAction === action && !target.disabled);
      if (next) { next.focus({ preventScroll: true }); animate(next.closest('.quantity-control'), 'changed'); }
      else $('[data-close]', cartDialog).focus({ preventScroll: true });
      toast(action === 'remove' ? 'Item removido do pedido.' : 'Quantidade atualizada.');
    } catch (error) { toast(error.message); }
  });
  cartDialog.addEventListener('change', event => {
    if (event.target.name === 'order-mode') { mode = event.target.value; renderCart(); }
  });
  $('#clear-cart').addEventListener('click', () => {
    if (window.confirm('Remover todos os itens deste carrinho?')) { cart.clear(); renderCart(); toast('Carrinho esvaziado.'); }
  });
  function prepareCheckout() {
    const address = $('#address-fields');
    address.hidden = mode === 'pickup';
    address.disabled = mode === 'pickup';
    $('#checkout-mode-label').textContent = mode === 'pickup' ? 'Retirada na loja fictícia, sem taxa.' : `Entrega com taxa demonstrativa de ${money(config.deliveryFeeCents)}.`;
    $('#checkout-error').textContent = '';
  }
  $('#go-checkout').addEventListener('click', () => {
    if (!cart.items.length) return;
    prepareCheckout(); cartDialog.close(); openDialog(checkoutDialog);
  });
  customerForm.addEventListener('submit', event => {
    event.preventDefault();
    if (!customerForm.reportValidity()) return;
    const customer = Object.fromEntries(new FormData(customerForm));
    const errors = checkout.validate(customer, mode);
    if (errors.length) { $('#checkout-error').textContent = errors.join(' '); return; }
    try {
      orderText = checkout.message(cart.items, customer, mode, config);
      $('#order-preview').textContent = orderText;
      const url = config.demo ? null : checkout.whatsappURL(config.whatsappNumber, orderText);
      $('#send-whatsapp').hidden = false;
      $('#demo-done').hidden = true;
      $('#send-whatsapp').href = url || '#whatsapp-demo-dialog';
      $('#review-note').textContent = url ? 'Confira itens, valores e endereço. Ao confirmar, o WhatsApp abre com a mensagem pronta; você ainda precisa enviá-la.' : 'Confira seu pedido. O botão verde abre uma simulação do WhatsApp com a mensagem pronta; nada será enviado.';
      $('#copy-feedback').textContent = '';
      checkoutDialog.close(); openDialog(reviewDialog);
    } catch (error) { $('#checkout-error').textContent = error.message; }
  });
  function showWhatsAppDemo(message) {
    $('#whatsapp-demo-message').textContent = message || 'Olá! Gostaria de fazer um pedido na FORNO 47.';
    openDialog($('#whatsapp-demo-dialog'));
  }
  $('#whatsapp-contact').addEventListener('click', () => {
    const greeting = 'Olá! Gostaria de fazer um pedido na FORNO 47.';
    const url = config.demo ? null : checkout.whatsappURL(config.whatsappNumber, greeting);
    if (url) window.location.assign(url);
    else showWhatsAppDemo(greeting);
  });
  $('#send-whatsapp').addEventListener('click', event => {
    const url = config.demo ? null : checkout.whatsappURL(config.whatsappNumber, orderText);
    if (!url) {
      event.preventDefault();
      reviewDialog.close();
      showWhatsAppDemo(orderText);
    }
  });
  $('#whatsapp-demo-back').addEventListener('click', () => {
    $('#whatsapp-demo-dialog').close();
    $('#cardapio').scrollIntoView({ behavior: reduceMotion.matches ? 'instant' : 'smooth' });
  });
  $('#back-to-cart').addEventListener('click', () => { checkoutDialog.close(); openCart(); });
  $('#edit-order-items').addEventListener('click', () => { reviewDialog.close(); openCart(); });
  $('#edit-order').addEventListener('click', () => { reviewDialog.close(); prepareCheckout(); openDialog(checkoutDialog); });
  $('#demo-done').addEventListener('click', () => {
    reviewDialog.close();
    $('#cardapio').scrollIntoView({ behavior: reduceMotion.matches ? 'instant' : 'smooth' });
  });
  $('#copy-order').addEventListener('click', async () => {
    try {
      if (!navigator.clipboard?.writeText) throw new Error();
      await navigator.clipboard.writeText(orderText);
      $('#copy-feedback').textContent = 'Pedido copiado. Nada foi enviado.';
    } catch {
      $('#copy-feedback').textContent = 'A cópia automática não está disponível. Selecione o texto da prévia para copiar.';
      const range = document.createRange(); range.selectNodeContents($('#order-preview'));
      const selection = window.getSelection(); selection.removeAllRanges(); selection.addRange(range);
      $('#order-preview').focus();
    }
  });
  $$('[data-gallery]').forEach(button => button.addEventListener('click', () => {
    $('#gallery-image').src = button.dataset.gallery;
    $('#gallery-image').alt = button.dataset.galleryAlt;
    openDialog($('#gallery-dialog'));
  }));
  if ('IntersectionObserver' in window && !reduceMotion.matches) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('seen'); observer.unobserve(entry.target); }
    }), { threshold: 0.15 });
    $$('.reveal').forEach(element => observer.observe(element));
  }
  $$('[data-hours]').forEach(target => { target.textContent = config.hours; });
  $$('[data-address]').forEach(target => { target.textContent = config.address; });
  $('[data-delivery-label]').textContent = money(config.deliveryFeeCents);
  $('[data-hero-price]').textContent = money(menu.products.find(product => product.id === 'margherita').priceBySize.m);
  $('[data-promo-price]').textContent = money(menu.products.find(product => product.id === 'promo-margherita').price);
  $('#year').textContent = new Date().getFullYear();
  renderMenu(); renderCart();
})();
