# FORNO 47 — identidade e arquitetura

Pizzaria artesanal fictícia; vitrine de portfólio e pedido demonstrativo. Público em celular, especialmente 360–430px. Objetivo: montar pizza, revisar carrinho e preparar uma mensagem de WhatsApp. Sem pedido automático, cobrança ou confirmação de atendimento.

## Direção

A ideia é uma caixa de pizza aberta sobre a mesa: creme de papel, letras condensadas grandes em vermelho tomate, fotografias quentes de pizza e pequenas formas de forno. Escolhida em vez de bistrô serifado escuro (parecido demais com AURUM) e de app de delivery genérico (pouca personalidade). Abertura com pizza em evidência, grande 47 tipográfico somente no logotipo, conteúdo alinhado à esquerda, uma única família de cantos e contraste alto.

Paleta: carvão #211e1a; tomate #b82f24; forno #e47a35; creme #fff5e4; oliva #5d653c; branco #fffaf1. Título Nimbus Sans Narrow Bold local, corpo sistema sans. Uma única fonte OTF de aproximadamente 80 KB; fontTools/WOFF2 não estão disponíveis. Licença URW e exceção de fontes incluídas. Sem fontes remotas.

Celular: hero compacto com foto quadrada, acesso direto ao cardápio, categorias em grade que cabe na tela e produtos de uma coluna. Carrinho em painel nativo dialog e barra inferior só quando há itens. Tablet duas colunas, desktop três. Sem componentes visuais copiados da AURUM.

## Fluxo e regras

Cardápio → personalizar → carrinho → dados de entrega/retirada → revisão explícita → WhatsApp (ou prévia demonstrativa se não configurado). Personalização e carrinho são diálogos nativos com nomes, fechamento, foco restaurado e Escape. Dados pessoais não são persistidos; só opções do carrinho, recalculadas a partir do catálogo.

Dinheiro em centavos inteiros. Meio a meio usa o preço integral do sabor mais caro no tamanho escolhido, acrescido de borda e extras. Doces só combinam com doces. Quantidade 1–20. Entrega demonstrativa fixa R$7; retirada grátis. Produtos fixos não recebem personalizações de pizza. Entradas inválidas, armazenamento corrompido ou bloqueado não devem quebrar a aplicação.

## Movimento e desempenho

Hero entra uma vez; feedback de clique/adicionar e alteração de quantidades; categorias e painel animam transform/opacity. Revelação discreta só em pequenos títulos/introduções e sempre visíveis sem JS. Sem WebGL, parallax de página, contadores ou loops infinitos. Reduced motion desliga animações. Todas as fotos abaixo do hero lazy e com dimensões reservadas. Metas Lighthouse 95+ em cada categoria, a medir; não são resultados.

Ajuste solicitado: contato WhatsApp verde aparente, deslocado acima do carrinho mobile quando necessário. Na revisão final, ação WhatsApp sempre visível. Com modo demonstração, uma simulação nativa acessível apresenta o texto pronto, sem número ou navegação externa. `demo: true` prevalece mesmo se algum número for preenchido.
