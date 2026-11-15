# FORNO 47 — Pizzaria artesanal fictícia

Projeto de portfólio em HTML, CSS e JavaScript puro, com catálogo, personalização, carrinho persistente e preparação de mensagem de WhatsApp. Não usa React, framework, API paga, pagamento online, servidor de aplicação ou build obrigatório.

**Tudo é demonstrativo:** marca, história, preços, promoções, endereço e horários são fictícios. As fotografias são conceituais de IA. Algumas fotos são ilustrativas de uma categoria e não representam todos os recheios. Não há estabelecimento, estoque, disponibilidade, pagamento ou envio automático de pedidos.

## Ver o site agora

Abra **`visualizar.html`** no navegador. Ele contém CSS, JavaScript, fotos e fonte incorporados, inclusive as imagens construídas dinamicamente pelo catálogo. Funciona sem servidor e evita o acesso isolado a arquivos pelo portal `/run/user/.../doc/` no Linux.

Para testar a versão normal com cache de arquivos e lazy loading, abra a pasta inteira em um navegador ou use Python 3:

```bash
cd forno-47
python3 -m http.server 8000 --bind 127.0.0.1
```

Abra `http://localhost:8000` apenas para teste local. Esse não é o endereço público. O ambiente de criação bloqueou portas locais; o comando deve ser executado em um terminal com permissão de rede local. Encerre com Ctrl+C.

No celular na mesma rede, use temporariamente `python3 -m http.server 8000 --bind 0.0.0.0` e abra `http://IP-LOCAL-DO-COMPUTADOR:8000`. Feche o servidor após o teste.

## Como pedir

1. Navegue pelas seis categorias ou busque por nome/ingrediente.
2. Escolha uma pizza e personalize tamanho, segundo sabor compatível, borda, adicionais, quantidade e observações. Combos, promoções e bebidas têm composição fixa; permitem quantidade e observação.
3. Confira o preço e adicione. Itens idênticos são agrupados até o limite de 20 unidades.
4. Abra o carrinho para editar, remover ou alterar quantidades; escolha entrega ou retirada.
5. Informe nome, endereço na entrega e pagamento informativo. Não há coleta de número de cartão.
6. Revise todos os dados. Sem WhatsApp configurado, verá a prévia demonstrativa e poderá copiar. Com número válido configurado e `demo: false`, só o botão final abre o WhatsApp com texto pronto. Ainda é necessário enviar a mensagem e receber confirmação da loja.

O carrinho não é apagado ao abrir o WhatsApp: abrir o aplicativo não prova que o pedido foi enviado. Use “Esvaziar carrinho” para limpar quando quiser.

## Regras de preço

- Valores em **centavos inteiros** nos módulos, apresentados em reais na interface.
- Meio a meio cobra o **maior preço integral** dos dois sabores no tamanho escolhido. Depois soma borda e adicionais; multiplica pela quantidade.
- Sabores salgados combinam entre si; doces somente com doces. Selecionar o próprio sabor equivale a um sabor só.
- Quantidade inteira de 1 a 20 por configuração. Até 100 configurações no carrinho.
- Exemplo: Margherita M + Quatro queijos M = R$55; borda cream cheese R$8 e queijo extra R$6 = R$69 por pizza. Duas unidades = R$138; entrega de R$7 = total R$145. Retirada = R$138.
- Taxa demonstrativa fixa de R$7, sem consulta de CEP/distância. Retirada sem taxa.
- Promoções são produtos fixos com preço próprio; não há cupom, empilhamento de desconto ou cobrança real.

## Configurar

Edite `config.js`:

```js
window.F47_CONFIG = Object.freeze({
  brandName: 'FORNO 47',
  whatsappNumber: '', // Use somente seu número real autorizado: país + DDD + número.
  deliveryFeeCents: 700,
  address: 'Rua da Lenha, 47 — Vila Forno, Cidade Exemplo',
  hours: 'Terça a domingo, das 18h às 23h',
  demo: true
});
```

O telefone é público. Não informe um número inventado: pode pertencer a terceiros. A validação verifica formato, não existência de conta. Não coloque chaves, senhas ou tokens no arquivo.

Para rebatizar, edite também textos e logotipos: `brandName` não substitui automaticamente o conteúdo e o SVG. O projeto permanece explicitamente fictício. `demo: true` impede abertura de contatos reais, mesmo que um número seja preenchido. Para usar o link real no futuro, é necessário configurar seu número autorizado e `demo: false`; isso não remove avisos nem cria um serviço real.

Personalize o catálogo em `menu.js`: IDs únicos, categorias, descrições, `priceBySize`, composição dos produtos fixos e imagens. Borda/adicionais ficam nas listas do mesmo arquivo. Os preços do carrinho salvo são sempre recalculados pelo catálogo atual.

Os preços de Margherita no hero e da oferta são sincronizados com o catálogo ao carregar. Atualize também seus valores de fallback no HTML se alterar os preços, para manter o conteúdo sem JavaScript coerente. Mantenha coerência entre a imagem e o recheio ou sinalize que a imagem é ilustrativa.

Depois de editar a configuração ou os arquivos, regenere a prévia opcional e o ZIP:

```bash
python3 build_preview.py
```

**Esse comando não é necessário para publicar `index.html`.** Só atualiza a conveniência offline `visualizar.html` e o pacote de entrega.

## Arquivos

```text
forno-47/
├── index.html           # Página, diálogos e formulários
├── styles.css           # Tokens, mobile-first, estados e animações
├── script.js            # Integração de interface, foco, eventos e feedback
├── config.js            # Contato, taxa, endereço e horário públicos
├── menu.js              # Catálogo e cálculo validado da personalização
├── cart.js              # Carrinho, agrupamento e persistência versionada
├── checkout.js          # Validação, totais, mensagem e URL de WhatsApp
├── assets/              # Fotos WebP locais, fonte e licenças, logotipos
├── tests/               # Regras reais JS, verificações estáticas e QA opcional
├── docs/                # Plano, resultados e diagrama de fluxo
├── visualizar.html      # Prévia autocontida, maior que a versão normal
├── build_preview.py     # Empacotamento opcional, sem dependências Python extras
├── .nojekyll
├── DESIGN.md
├── PRODUCT.md
└── SKILLS-APLICADAS.md
```

`.agents/skills/` é material de desenvolvimento local, ignorado no Git e excluído do ZIP. Não é dependência do site.

## Persistência e privacidade

Somente configurações do carrinho são salvas na chave `forno47-cart-v1` do localStorage. Preços, nomes derivados e dados pessoais não são persistidos no carrinho. Dados recuperados são validados, preços recalculados e itens inválidos descartados com aviso. Se o armazenamento estiver indisponível, o pedido funciona em memória com aviso; não há garantia de recuperação depois de fechar a página.

Nome e endereço ficam nos campos desta página e na prévia; vão para o WhatsApp apenas se você clicar na confirmação final. Não há telemetria, cookies, backend, geolocalização ou envio automático. O navegador pode oferecer preenchimento automático de dados conforme suas próprias configurações.

## Testes e resultados

```bash
python3 -m unittest discover -s tests -v
python3 tests/check_static.py
```

Os testes de regras usam a biblioteca JavaScriptCore já presente neste Linux, através de Python ctypes, sem Node e sem transformar JavaScript em uma implementação Python paralela. Se a biblioteca estiver ausente, a suíte informa o motivo do skip. Não a confunda com teste visual em Safari ou iPhone.

Para executar os testes opcionais de navegador em outro ambiente:

```bash
python3 -m pip install playwright
python3 -m playwright install chromium
python3 -m unittest discover -s tests -p 'test_browser.py' -v
```

Essas são dependências de desenvolvimento opcionais, nunca do site publicado. Playwright/Chromium não estavam disponíveis durante a criação. Veja **[docs/TESTES.md](docs/TESTES.md)** para resultados executados e limites, incluindo ausência de medição Lighthouse. Metas: Performance, Acessibilidade, Boas práticas e SEO de 95+, **não pontuações aferidas**.

Antes de apresentar a um cliente, confira em Chrome/Android e Safari/iPhone: 360, 375, 390 e 430px, orientação horizontal, zoom, teclado, leitor de tela, foco em diálogos, Escape, reabertura do carrinho, formulários, galeria, envio com número seu e redução de movimento. O teste automático de largura não substitui toque ou aparelho físico.

## Publicar gratuitamente no GitHub Pages

1. Crie um repositório público, por exemplo `forno-47`.
2. Envie **o conteúdo desta pasta para a raiz** do repositório. `index.html`, CSS, os cinco scripts e `assets/` devem estar juntos na raiz. Não coloque tudo em uma segunda pasta interna por engano. Inclua `.nojekyll`.
3. Faça commit na branch `main`.
4. Em **Settings → Pages → Build and deployment**, selecione **Deploy from a branch**, `main` e `/(root)`. Salve.
5. Aguarde o processamento e use a URL exibida pelo GitHub, normalmente `https://SEU-USUARIO.github.io/forno-47/`.
6. Verifique imagens, escolha de categorias, carrinho, prévia e WhatsApp na URL publicada. Novos commits atualizam o site.

Não há build, Node, servidor pago ou chave de API. Os caminhos são relativos para funcionar no subdiretório do repositório. Não foi publicada nenhuma página automaticamente.

Documentação oficial: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

## Assets e identidade

Fotografias criadas por IA para este projeto; detalhes em `assets/ORIGEM.md`. Fonte local Nimbus Sans Narrow Bold de URW Base35, com licença e exceção de fontes em `assets/FONT-LICENSE.txt` e `assets/FONT-COPYING.txt`. A imagem não é foto de loja ou produto real. Logotipo, favicon e ícones geométricos foram criados para FORNO 47.

Identidade, arquitetura e escolhas de acessibilidade estão em `DESIGN.md`. O fluxo visual de preparação/revisão está em [docs/fluxo-pedido.html](docs/fluxo-pedido.html). O relatório das skills, repositórios consultados e verificadores executados está em `SKILLS-APLICADAS.md`.

## Botão de WhatsApp demonstrativo

Há um botão verde de WhatsApp sempre disponível fora dos diálogos. No celular ele sobe quando o carrinho inferior aparece. Ele abre uma simulação claramente identificada, sem número real. Depois de montar e revisar o pedido, o botão verde “Abrir pedido no WhatsApp” mostra a mensagem completa nessa simulação. Nada é enviado. Na integração real futura, com número autorizado e `demo: false`, esse mesmo botão abre `wa.me` com o texto pronto para o cliente tocar em Enviar.
