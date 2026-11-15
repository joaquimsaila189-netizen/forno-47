# Verificação executada — FORNO 47

Data: 14/11/2026. Os comandos e saídas reais estão em [resultado-testes.txt](resultado-testes.txt).

## Resultados reais

- **9 testes passaram; 2 foram pulados.** Os pulados são testes de navegador, por falta de Playwright/Chromium. Não foram tratados como aprovados.
- Sintaxe de todos os scripts avaliada pela biblioteca JavaScriptCore do sistema. Não há declaração de ausência de erros de DOM sem executar um navegador.
- Regras de preço: tamanhos, meio a meio pelo maior preço, grupos de sabores, bordas, adicionais, quantidades, tipos e limites inválidos.
- Carrinho: agrupamento, limites, edição atômica, remoção, limpeza, restauração, dados corrompidos, preços adulterados, opções inválidas e armazenamento bloqueado.
- Checkout: subtotal, taxa de entrega, retirada sem taxa, dados pessoais e pagamento, rejeição de carrinho vazio, mensagem completa e codificação do WhatsApp.
- Composição fixa dos combos presente no carrinho e na mensagem.
- Prévia autocontida: scripts embarcados avaliados no JavaScriptCore; todas as fotos do catálogo resolvem para data URLs locais, sem depender de arquivos vizinhos.
- Verificação estática: 83 IDs únicos, 52 referências locais, 9 imagens estáticas com dimensões e alt, 6 diálogos com título acessível, labels, ordem dos scripts e seletores básicos da UI. Imagens dinâmicas também têm dimensões e alt no template.
- Sete pares de cores sólidas passaram em contraste 4,5:1. Não é uma medição da interface renderizada, overlays de fotografia ou todos os estados em navegador.
- Diagrama: self_check offline aprovado e verify_geometry sem achados.
- ZIP verificado com ZipFile.testzip; caminhos relativos e `.nojekyll` presentes. Não houve publicação automática.

Fotos WebP: 1,102,918 bytes no total. Página principal + CSS/JS + fotos + fonte: aproximadamente **1,26 MB sem compressão**. A prévia autocontida é maior, pois incorpora fotos em base64 e repete algumas referências; não é a opção preferencial de produção.

## Não executado neste ambiente

- Renderização visual em navegador, sobreposição e ausência real de rolagem horizontal em360/375/390/430px. O CSS foi inspecionado, mas inspeção não equivale a medição.
- Fluxo completo com cliques, teclado, foco nativo, leitores de tela, toque e abertura do aplicativo de WhatsApp.
- Safari/iPhone ou Chrome/Android físicos.
- Lighthouse, throttling de rede/CPU, FCP, LCP, CLS e desempenho de campo. Metas 95+ permanecem **metas**, sem pontuação reportada.

## Como completar a QA visual

Instale Playwright/Chromium em um ambiente de desenvolvimento, conforme README. `tests/test_browser.py` verifica as larguras360/375/390/430/768/1280, imagens, troca de categoria e um fluxo com pizzaG, meio a meio, borda, adicional, duas unidades, recarga do carrinho, retirada e revisão demonstrativa. Esses scripts estão preparados, mas sua execução real ainda está pendente.

Depois teste manualmente: todos os sabores e produtos fixos, edição que mescla dois itens, exclusão/limpeza, entregas e retiradas, falhas de preenchimento, Escape e retorno de foco, cópia com clipboard indisponível, janela pequena em paisagem, zoom200%, preferência de movimento reduzido e telefone real autorizado em `config.js`.

Uma revisão independente e somente leitura inspecionou regras, armazenamento, checkout, transições e a prévia. Não encontrou defeitos acionáveis no escopo estático. A revisão não substitui as verificações de navegador pendentes.

Revisão WhatsApp demonstrativo: novo teste confirma a identificação de demonstração com `demo: true`, mesmo quando há número preenchido. Verificação estática confirma botão, ícone e simulação presentes. Teste Playwright preparado para clicar na ação final e conferir a mensagem na simulação; continua pulado por falta de navegador.
