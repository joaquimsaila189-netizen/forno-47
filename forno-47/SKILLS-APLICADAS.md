# Skills aplicadas — FORNO 47

## Inventário real

Foram encontrados e analisados os cinco SKILL.md instalados no projeto AURUM em `/var/home/JOCAINA/aurum-barbearia/.agents/skills/`: Hallmark, Taste, Impeccable, UI UX Pro Max e Diagram Design. Suas cópias locais, referências, dados e scripts foram disponibilizados em `.agents/skills/` deste projeto. A instalação anterior é leve: não contém todas as galerias opcionais dos repositórios.

A busca com `rg --files --hidden` em `.codex/skills` confirmou as skills de sistema imagegen, skill-installer, skill-creator, openai-docs e review-agent. As skills globais dos plugins incluem Superpowers e Sites; foram consultadas as de processo pertinentes. Figma, Roblox, Pets, vídeo e documentação de APIs não atendem à entrega solicitada e não foram acionadas. `.agents/skills` da pasta pessoal não continha as cinco skills: elas estavam no projeto anterior. A pasta global `.codex` permanece somente para leitura; nada foi falsamente declarado instalado globalmente.

## Aplicação concreta

| Skill | Decisão ou ferramenta utilizada | Evidência |
|---|---|---|
| Hallmark | Tokens únicos, fotos da comida, container limitado, foco imediato, nenhuma palavra isolada em itálico, sem números comerciais inventados como prova social | styles.css, index.html, DESIGN.md |
| Taste / design-taste-frontend | Classificação place, fotos locais WebP, hero priorizado, lazy loading secundário, orçamento de imagens e CSS/JS pequenos | data-type em HTML, assets/, tests/check_static.py |
| Impeccable | Separação entre vitrine persuasiva e fluxo de compra operacional; revisão de formulário, estados vazios, erros claros, contexto durável e craft floor | PRODUCT.md, DESIGN.md, script.js e diálogos |
| UI UX Pro Max | Busca real `search.py ... --design-system` e busca UX de carrinho/teclado/modal/toque/reduced motion | Recomendações aplicadas: toque 44px+, espaçamento, preço explícito, reduced motion e foco |
| Diagram Design | Fluxo visual entre catálogo, personalização, carrinho, dados e revisão; diferencia preparação de envio; skin própria creme/tomate; SVG acessível com rolagem local | docs/fluxo-pedido.html; self_check.py e verify_geometry.py executados |
| Frontend Design (Anthropic) | Direção baseada na caixa de pizza, tipo condensado local e comida em destaque; evita repetir a identidade serifada da AURUM | DESIGN.md, fonte local Nimbus Sans Narrow, paleta e composição próprias |
| Webapp Testing (Anthropic) | Testes Playwright preparados para larguras 360–1280px, seleção, subtotal, persistência, retirada e prévia | tests/test_browser.py; execução marcada SKIP por falta de Playwright/Chromium |
| Ponytail | Plataforma nativa: dialog, radio, details, localStorage; funções pequenas sem frameworks ou dependências de runtime | módulos separados, reaproveitamento de API e testes de fronteira |
| Superpowers | Planejamento, tarefas paralelas independentes (regras e fotos), testes antes das regras, revisão da integração e verificação antes da entrega | docs/PLANO.md, tests/test_business.py e docs/TESTES.md |
| imagegen | Fotografias originais conceituais, geração nativa sem chave de API, conversão local WebP e inspeção das saídas | assets/ORIGEM.md |
| skill-installer | Descoberta de fontes e verificação das restrições de instalação | cópias locais; sem alegação de instalação global |

## Novos repositórios indicados

Foram consultados READMEs e árvores via conector GitHub dos links enviados:

- https://github.com/DietrichGebert/ponytail — SKILL.md lido e aplicado; solução simples sem cortar requisitos ou validação.
- https://github.com/JuliusBrussee/caveman — SKILL.md lido. Sua função é estilo de comunicação; não altera preços, componentes ou controles. Clareza e concisão aproveitadas, sem omitir documentação pedida.
- https://github.com/Graphify-Labs/graphify — README e árvore inspecionados; não há SKILL.md na árvore consultada. É uma ferramenta de grafo/contexto, não uma dependência necessária para este site. Não instalada ou executada; sem alegar geração de grafo pelo Graphify.
- https://github.com/obra/superpowers — README consultado e skills locais já disponíveis utilizadas. Não foi necessária segunda instalação.
- https://github.com/soumatheusgomes/vibe-coding-toolkit — README, árvore e guia de validação consultados; repositório de guias/templates, sem SKILL.md na árvore consultada. Aplicados rastreabilidade e distinção entre documentação e evidência executada. A preferência do toolkit por Next.js não supera o requisito explícito HTML/CSS/JS puro.
- https://github.com/anthropics/skills/tree/main — Frontend Design e Webapp Testing foram lidas e copiadas localmente. As demais skills de documentos, API e arte generativa não agregam ao escopo.

## Conflitos resolvidos pelo pedido

A paleta, os dados fictícios, os cards e as animações solicitados pelo usuário prevalecem sobre proibições genéricas. A tipografia do projeto foi escolhida para não repetir AURUM. A revelação progressiva usa transform/opacity só em quatro introduções curtas, sem ocultação inicial permanente e sem biblioteca. Acessibilidade e desempenho prevalecem sobre animação decorativa.

A busca UI UX Pro Max sugeriu vermelho e tipo editorial serifado; o vermelho foi compatibilizado com a paleta explícita, e a sugestão de fonte foi trocada por Nimbus Sans Narrow para dar identidade própria e evitar a referência AURUM. Os componentes operacionais mantêm rótulos sans legíveis.

## Limitações verificadas

- Impeccable: launcher invocado; falhou ao baixar engine 0.1.24 por restrição de rede. Referências e craft floor aplicados diretamente. Nenhuma aprovação automática de detector foi alegada.
- Hallmark/Taste: verificadores Node/Chrome não executados por ausência desses runtimes. Não há pontuação inventada.
- Playwright/Chromium indisponíveis: testes de navegador ficaram explicitamente pulados, não aprovados. Sem capturas da interface ou medição Lighthouse.
- Regras de negócio e sintaxe JS foram realmente executadas no JavaScriptCore do sistema via Python ctypes. Isso não é teste de DOM, WebKit visual ou dispositivo iPhone.
- FontTools/WOFF2 indisponíveis: uma fonte local OTF de aproximadamente 80KB, licença e exceção de fontes preservadas. Nenhum download de fonte na navegação.
