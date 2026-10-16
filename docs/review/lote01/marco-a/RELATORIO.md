# ZIMONS — Lote 01 / Marco A

**Status: EM REVISÃO. Marco A aberto, aguardando avaliação visual.**

Esta entrega incorpora os dois retornos adicionais sobre enfermaria e abertura. Não representa aprovação final nem execução dos marcos B, C e D. Capturas e vídeos estão em arquivos próprios, separados deste relatório. Não há imagens conceituais apresentadas como screenshots.

## 1. Versão examinada

- Repositório: `Fridjofr/modulo_git`; jogo real em `/workspace/zimons`.
- Base: v0.11.0, commit `d54f53bd0094593852d05307d41a1ae6c90542e4`.
- Branch local: `revisao/lote01-marco-a`; branch remota de revisão: `revisao-lote01-marco-a`.
- Commit de implementação: `f1192665fdd4f5a654c49409c4e06ebd70c371f2`. Um commit posterior acrescenta somente este relatório, evidências e manifesto.
- A pasta do jogo inicialmente não tinha Git; foi ligada ao histórico da versão publicada sem substituir seus arquivos. O checkout de exercícios em `/workspace/modulo_git`, branch `work`, permaneceu intacto.
- Os 11 recursos originais do manifesto `docs/ASSETS_ORIGINAIS.json` foram verificados por SHA-256 e preservados integralmente.

## 2. Diagnóstico

| Problema | Causa confirmada | Como foi verificado |
|---|---|---|
| Área da janela e distorção ao redimensionar | Contêiner limitado a 16:9; câmera e posicionamento de nomes fixados em 1280×720 | CSS, coordenadas do renderer e medidas reais dos elementos em Chromium |
| Montagem humana e pernas | Cabeças dimensionadas pela altura do penteado; troncos novos recortados em uma altura fixa e colados a pernas de outra fonte | `CharacterAtlas`, sprites de origem e renderização dos diferentes modelos |
| Orientação de um penteado | A célula direita dos coques femininos era uma vista voltada para trás | Inspeção da folha `heads.png` |
| Nome solicitado duas vezes | Campo de nome no criador, além da pergunta narrativa | DOM e fluxo `startJourney` / `storyName` |
| Portas como retângulos | Um preenchimento escuro substituía visualmente a abertura, sem animar folhas | `TileWorld.draw` e gravação do corredor |
| Cama e roupa de cama | Sprite em pé com uma cópia retangular do fundo desenhada por cima; âncoras separadas e aproximação diagonal | Código de `sleeping`, renderer e cena inicial |
| Lira junto da cama | Não havia pose sentada própria nem âncora correspondente à cadeira | Folhas, coordenadas do cenário e captura integrada |
| Travamento após mudar a cadeira | O seguidor tentava alcançar a posição antiga de Lira enquanto ela avançava no sentido oposto | Reproduzido no percurso real após reposicionar a cadeira; resolvido antes da gravação entregue |
| Ponteira da barra atrás da cama | O detalhe esquerdo já faltava na arte, antes de recorte ou composição | Inspeção da imagem integral e da mesma posição no canvas |
| Abertura amarelada e Pyron distante da referência | Iluminação de pôr do sol e interpretação visual do primeiro wallpaper | Comparação com `assets/battle/pyron.png` e retorno do autor |

## 3. O que foi alterado

| IDs | Arquivos | Alteração e motivo |
|---|---|---|
| P0-01 | `index.html`, `review-a.css`, `src/render.js` | Contêiner ocupa a viewport. Mundo usa altura lógica adaptável e escala uniforme; câmera e nomes acompanham essas dimensões. Composições de sonho mantêm escala uniforme. Batalha preserva proporção por cobertura do canvas. |
| P0-02, P0-03 | `src/character-atlas.js`, `src/human-rig.js`, `src/npc-atlas.js`, `src/assets.js` | Cabeças ancoradas pela face/pescoço, escala consistente entre direções, correção da vista dos coques. Cada roupa conserva seus próprios quadris, pernas e botas. Marcha articulada em runtime, sem colar pernas de outro personagem nem rotacionar tiras inferiores. Referência de escala humana aproximada à de Lira. |
| P0-03 | `index.html`, `review-a.css`, `src/game.js` | Mantida a divisão do criador; painéis escuros, miniaturas com cabeça completa e parte superior do manequim, cinco cortes/roupas, cores, calças e bolsas. Removido o campo de nome do criador; permanece a pergunta na história. |
| P0-04 | `src/actor-path.js`, `src/doors.js`, `src/tilemap.js`, `src/story.js` | Verificação do segmento inteiro, incluindo conexões fora da grade. Folhas de porta deslizam a partir do próprio desenho fechado. Lira estabelece distância de liderança antes da entrada do seguidor, evitando a colisão frontal observada. |
| P0-05, P1-13 | `assets/world/review-a/infirmary.png`, `src/maps.js` | Enfermaria sem vegetação, sem os armários/pods excedentes, com estação médica compacta e cadeira à esquerda. Colisões atualizadas para cama, cadeira, monitor e estação real. |
| P0-05 | `assets/characters/review-a/lira-seated.png`, `src/assets.js`, `src/scene-staging.js`, `src/game.js`, `src/story.js`, `src/render.js` | Pose de Lira sentada e levantando, baseada no desenho existente; voltada para a cama. Aproximação pela extremidade inferior da cama, âncora única, corpo sob o cobertor existente, sem copiar um segundo lençol. Fechamento/abertura dos olhos acompanha descanso. Instrução para deitar antecede a ação. |
| Retorno adicional: ponteira | `src/tilemap.js` | Completada apenas a pequena ponteira metálica esquerda na camada do cenário. Não foi refeita a composição aprovada do quarto. |
| P1-10 | `assets/world/review-a/title.png`, `index.html`, `review-a.css`, `src/assets.js` | Wallpaper integrado com Academia, Lira e três iniciais. Segunda revisão com luz diurna neutra, menos amarelo, Pyron compacto baseado na referência vulcânica. Removidos slogan, descrição inferior e canvases independentes do elenco. |
| P1-11, parcialmente | `review-a.css`, `src/game.js`, `src/model.js`, `src/render.js` | Materiais do criador e diálogo, objetivo com contraste discreto, caixa de diálogo dentro da viewport; nome padronizado para Lira. Revisão global de todas as telas continua pendente. |
| Validação e reprodução | `package.json`, `tests/review-a.test.mjs`, `tests/browser-v11/interface.spec.js`, `tests/browser-v11/helpers.js`, `tests/model.test.mjs`, `tools/capture-review-a.mjs`, `tools/server.mjs`, `README.md` | Novos módulos entram no check, regressões de percurso/cadeira/portas, atualização das expectativas explicitamente alteradas pelo relatório, captura reproduzível, MIME de vídeo e documentação de revisão. |

O arquivo de referência de Pyron e os sprites originais não foram substituídos. As novas artes de cenário/apresentação são recursos efetivamente carregados pelo jogo; não comprovam, por si, a qualidade das animações.

## 4. Validação

| Comando/procedimento | Resultado | Limite da evidência |
|---|---|---|
| `npm run check` | PASSOU | Sintaxe dos módulos, incluindo rig e portas |
| `npm test` | **42 passaram; 0 falharam; 0 ignorados** | 38 existentes e 4 de regressão do Marco A |
| `npx playwright test --config=playwright-v11.config.mjs tests/browser-v11/interface.spec.js --reporter=line` | **5 passaram** | Criador, modelos/cores, HUD/menu/radar, recuperação de asset ausente, toque 800×450 e viewport após resize |
| `ZIMONS_FAST_SCENES=1 npx playwright test --config=playwright-v11.config.mjs tests/browser-v11/chapter.spec.js --reporter=line` | **1 passou** | Regressão até o ginásio, incluindo derrota e segunda enfermaria. Usa o skip existente em partes das cenas; não equivale à validação narrativa integral do Marco D |
| Captura normal em Chromium | PASSOU até a primeira escolha no laboratório; **sem erro JS ou resposta HTTP de falha** | Protagonista feminino, cabelo curto/uniforme; setas e botão de avançar fala. **Sem R, teleporte, alteração de estado ou salto de caminhada** |
| 1366×768 e 1920×1080 | PASSOU para as superfícies capturadas | Abertura e enfermaria capturadas nas duas; criador/exploração em 1366×768 |
| Resize adicional 1440×900 | PASSOU no teste de interface | Mundo com proporção uniforme e contêiner preenchido |
| Cinco cortes × cinco roupas × quatro direções × quatro frames × dois modelos | PASSOU nas verificações estruturais de pixels | **800 combinações**. Isso não substitui aprovação estética individual de todas elas |
| Manifesto dos originais | **11/11 SHA-256 intactos** | Fontes aprovadas preservadas |

Logs reais: [sintaxe](logs/syntax.txt), [42 testes](logs/unit.txt), [5 testes de interface](logs/interface.txt), [regressão do capítulo](logs/chapter-regression.txt), [percurso normal](logs/normal-route.txt), [tempos das capturas](logs/capture-timeline.json).

Gravações são do navegador rodando o jogo, sem áudio. Foram apenas recortadas no tempo e codificadas em MP4, sem aceleração, composição ou substituição de quadros. FFmpeg do sistema foi usado para a gravação; o download opcional do binário Playwright estava bloqueado por domínio. Nenhum artefato de download malsucedido foi utilizado.

Para repetir o jogo: `npm start` na raiz e abrir a porta 4173. Para captura, instalar as dependências de desenvolvimento e preparar Chromium/FFmpeg compatíveis, então executar `node tools/capture-review-a.mjs`. `ZIMONS_REVIEW_URL` permite outra porta. O script exige os binários de vídeo disponíveis ao Playwright e usa somente diagnósticos de leitura e os controles normais do jogo.

### Matriz de revisão

PASSOU em um teste funcional não significa aprovação visual do autor.

| ID | Estado | Evidência | Teste executado / condição restante |
|---|---|---|---|
| P0-01 | PARCIAL | [entrada 1366](images/01-entrada-1366.png), [1920](images/02-entrada-1920.png), [enfermaria 1920](images/10-enfermaria-1920.png) | Resize de abertura/exploração validado; combate ainda precisa de revisão específica nas duas resoluções |
| P0-02 | PARCIAL | [feminino](images/03-personalizacao-feminina.png), [masculino](images/04-personalizacao-masculina.png), [marcha](videos/01-caminhada.mp4) | 800 frames/combinações estruturais; naturalidade de perfil e todos os NPCs ainda exigem revisão visual |
| P0-03 | PARCIAL | [criador](images/03-personalizacao-feminina.png) | Cinco cortes/roupas, cores independentes e nome no despertar verificados; acabamento aguarda avaliação |
| P0-04 | PARCIAL | [porta](videos/02-porta.mp4), [saída](videos/04-levantar-sair.mp4) | Rotas sem sobreposição no percurso normal até laboratório; não foi concluída revisão normal de todas as rotas do capítulo |
| P0-05 | PARCIAL | [quarto integrado](images/10-enfermaria-1920.png), [cama/cadeira](videos/03-cama-cadeira.mp4) | Cadeira à esquerda, menos móveis e ponteira presentes. Descanso inicial normal e segunda enfermaria em regressão acelerada. Transição completa de deitar e acordar ainda depende de aprovação visual |
| P1-10 | PARCIAL | [nova abertura](images/02-entrada-1920.png) | Luz e Pyron revisados; fidelidade e composição aguardam o autor |
| P1-11 | PARCIAL | [HUD](images/05-floresta.png), [diálogo](images/10-enfermaria-sentada.png) | Alteradas apenas as superfícies deste marco; demais painéis ficam para as revisões seguintes |
| P1-13 | PARCIAL | [enfermaria](images/10-enfermaria-1920.png) | Enfermaria revista; corredor, laboratório e ginásio ainda não receberam a remoção de vegetação/repaginação solicitada |
| P0-06 a P0-09 / marcos B e C | NÃO TESTADO para aceite do lote | Sem entrega visual nova de B/C | O smoke de regressão não valida fidelidade narrativa ou acabamento desses marcos |
| Marco D | NÃO TESTADO | — | Não foi executada a matriz integral sem skips para ambos os protagonistas e três essências |

## 5. Prévia visual REAL

Imagens e vídeos em arquivos separados:

- [Enfermaria integrada, 1920×1080, cadeira à esquerda e ponteira completada](images/10-enfermaria-1920.png).
- [Enfermaria integrada, 1366×768](images/10-enfermaria-sentada.png).
- [Tela inicial revisada, 1920×1080](images/02-entrada-1920.png) e [1366×768](images/01-entrada-1366.png).
- [Criador feminino](images/03-personalizacao-feminina.png) e [masculino](images/04-personalizacao-masculina.png).
- [Floresta e HUD](images/05-floresta.png), [praça](images/07-academia.png).
- Caminhada: [frente](images/06-caminhada-frente.png), [costas](images/06-caminhada-costas.png), [esquerda](images/06-caminhada-esquerda.png), [direita](images/06-caminhada-direita.png).
- Vídeos: [marcha](videos/01-caminhada.mp4), [porta e início da escolta](videos/02-porta.mp4), [deitar e Lira sentar](videos/03-cama-cadeira.mp4), [levantar e sair](videos/04-levantar-sair.mp4).
- Comparação com a base executada isoladamente: [criador anterior](before/creator.png), [abertura anterior](before/title.png).

O wallpaper é uma ilustração de apresentação carregada pela tela inicial. A captura mostra sua integração real com o menu, não uma promessa de gráficos equivalentes na exploração/batalha.

## 6. Pendências e riscos

- **Marco A continua aberto.** O autor aprovou a direção enxuta da enfermaria e os sprites apresentados; a última ponteira e a abertura revisada ainda precisam ser avaliadas na integração.
- A marcha de roupas e NPCs usa articulação das peças próprias em runtime; não foi criada uma folha inteira de caminhada desenhada quadro a quadro para cada combinação. Particularmente a marcha lateral precisa de inspeção estética adicional.
- O repouso mostra cabeça e parte superior personalizadas sobre o colchão, com o corpo coberto pela roupa de cama existente. A passagem para essa pose usa encenação interpolada; não deve ser considerada uma animação final aprovada de corpo inteiro.
- Os interiores restantes ainda têm vegetação/arte da base e não estão visualmente aprovados. A representação do interior de uma porta aberta também merece revisão de profundidade/acabamento.
- Sonhos repetidos, apresentação única dos hologramas, anatomia da derrota, reversão somente no laboratório, posse/efeitos e encenação do ginásio continuam sendo trabalho dos marcos seguintes. **Nenhum deles foi declarado corrigido nesta entrega.**
- Não há validação nova de gamepad real, Safari/Firefox ou da matriz completa de toque. O teste de toque é de layout do criador em Chromium.
- As capturas iniciais usam um conjunto de personalização no percurso normal. As demais combinações têm verificações estruturais, não um percurso inteiro individual filmado.
- A correção da ponteira está na camada renderizada do cenário; o PNG isolado conserva a fonte anterior. Isso evita regenerar o restante do quarto já aprovado.

## 7. Próximas decisões

Revisar visualmente a enfermaria integrada, especialmente a ponteira, e a abertura com luz neutra/Pyron. Nenhuma nova decisão de lore foi inferida. Não avançar para os marcos B/C nem considerar esta etapa encerrada antes do retorno do autor.
