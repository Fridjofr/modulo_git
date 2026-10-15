# ZIMONS — O Despertar · v0.8.0

Adaptação jogável do prólogo e do capítulo 1 de **ZIMONS — Conexão além da evolução**, preservando o projeto e as artes recebidos. Exploração 2D vista de cima, personagens animados, cenas encenadas, diálogos manuais e batalhas por turnos. O humano assume a forma do Zimon: não existe treinador separado do corpo transformado.

## Executar

Requer **Node.js 20 ou superior**. Extraia o ZIP, abra o terminal na pasta `zimons-academia` e execute:

```sh
npm start
```

Abra **http://localhost:4173**. Encerre com `Ctrl+C`. **Não precisa instalar dependências para jogar.** Fontes, sprites e mapas estão incluídos; não há CDN ou build obrigatório. Alternativa com Python: `python3 -m http.server 4173`. Não abra `index.html` diretamente por `file://`: o jogo carrega módulos e metadados pelo servidor.

Outra porta: `PORT=4180 npm start` no Linux/macOS; no PowerShell, `$env:PORT=4180` e depois `npm start`. No celular, use orientação horizontal e os botões de toque.

## O novo arco inicial

1. Personalize o protagonista e inicie. Uma voz e uma silhueta antecedem o despertar na floresta. Não há Z-Link antes da entrega.
2. Explore a mata. O riacho e a pedra antiga têm conversas próprias; a pedra é opcional; o riacho conduz à estrada ao leste, atravessando a ponte. Tronco e lagoa são investigações opcionais. Água, árvores e limites não são atravessáveis.
3. Ao alcançar a trilha, Lira se aproxima. Depois da conversa, ela caminha até a Academia; a cena também mostra o protagonista acompanhando o percurso. Na praça há uma manifestação parcial observada durante a conversa.
4. A avaliação médica confirma a perda das lembranças pessoais; o protagonista ainda lembra seu nome escolhido na criação. Lira explica o procedimento e segue para preparar a sala. Quando quiser, use a passagem ao sul da enfermaria para o laboratório.
5. Lira entrega um Z-Link de treinamento. A plataforma permite escolher **uma única essência** entre Pyron, Marivon e Verdrax. Acompanhe três pulsos de respiração; perder um não causa a crise nem pune o jogador. Se fechar o monitor, pode reiniciar a avaliação pela plataforma.
6. A conexão progride além dos parâmetros. O casulo se fecha e Lira tenta contato. Na luta de contenção, **você controla seu próprio protagonista**. Lira manifesta apenas os braços, como no manuscrito, e sua experiência de nível 18 permite conter o corpo descontrolado. O confronto termina na derrota do protagonista, com HP zerado e retorno involuntário ao humano. Não há fuga, revanche ou recompensa de vitória nessa cena.
7. Após a contenção, uma cena de sonho mostra névoa, água rasa sobre pedra, ausência de reflexo e uma silhueta humana desconhecida. Na enfermaria, o protagonista conta o sonho, descobre o ataque e pergunta pelos olhos vermelhos. O acordo com Lira exige supervisão; não cura a instabilidade.
8. Uma projeção apresenta a primeira forma; as evoluções ficam em silhueta. Lira entrega a Zimondex e autoriza conhecer a Academia **sem transformação**. Nico, Aya e Mara têm conversas opcionais; não são um bloqueio artificial para a história.
9. Visite os jardins pela passagem leste. A presença retorna durante uma prática supervisionada, mesmo com o Z-Link inativo. A decisão de contar a Lira encerra o capítulo do livro.
10. A continuação jogável adaptada começa ao relatar o ocorrido no laboratório. A prática ensina **T** para transformar e novamente para retornar. Depois, o aparelho da bancada direita restaura vida e energia. A aparência humana escolhida é preservada.
11. Colegas oferecem desafios únicos **no laboratório, com supervisão de Lira**; não há revanche ou recompensa repetida. Ao terminar, o corpo retorna à forma humana antes de voltar à praça. Nos jardins, Elias oferece uma tarefa opcional de consultar o monitor de água. O exterior da Academia ainda aguarda uma saída acompanhada.

Os diálogos alternam falantes, têm revelação gradual e **nunca avançam sozinhos**. E, Enter, Espaço ou A revelam o texto e depois avançam. Ativar a redução de movimentos mostra o texto completo e encurta efeitos; não remove conversas. As caminhadas de cena continuam visíveis. Estimativa editorial da abertura: 20–35 minutos, conforme ritmo de leitura e exploração; não é uma medição com jogadores.

## Controles

| Entrada | Ação |
|---|---|
| Setas | Andar em quatro direções; navegar nas janelas |
| E | Conversar, entrar, interagir e acompanhar pulsos |
| Enter / Espaço | Revelar/avançar conversa ou confirmar opção focada |
| T | Transformar/retornar no laboratório, com Lira, após a orientação |
| I | Abrir Bolsa durante a exploração |
| Q / M | Missões / mapa ampliado |
| Esc | Abrir menu, fechar janela ou voltar de uma pasta de combate |
| 1 / 2 / 3 | Técnicas disponíveis na pasta Batalha |
| B / Z no combate | Abrir Bolsa / Troca |
| Clique / toque | Selecionar aparência, diálogos, pastas e comandos |
| Controle: direcional / analógico | Movimento ou navegação por foco |
| Controle: A / B | Confirmar/interagir/avançar ou voltar |
| Controle: Y / Menu | Z-Link ou abrir menu |

O controle segue o mapeamento padrão do navegador. A entrada de um nome personalizado utiliza o campo de texto do navegador; também é possível manter o nome padrão. O teste automatizado simula um controle padrão; não substitui testes físicos em todos os modelos de joystick.

## Combate e exploração

- A contenção é obrigatória e controlada pelo protagonista. Sua derrota faz parte da história. A IA de Lira encerra a conexão; não há inversão de personagens. Os duelos seguintes são desafios únicos com resultados registrados na sessão.
- HP e nomes identificam **as pessoas**, inclusive quando transformadas. Ícones mostram elementos; técnicas exibem vantagem, resistência e custo.
- No nível 5 há **Impacto físico** e **uma técnica elemental**. Defender foi removido. Impacto recupera energia; a técnica especial aparece no nível 8 com aviso ao aprender, sem dica permanente sobre o próximo golpe.
- Batalha, Bolsa, Troca e Sair abrem somente seu conteúdo. Não há Sair na contenção. Troca só apresenta almas efetivamente vinculadas; nesta abertura há uma única forma. Não existe captura de novas almas implementada nesta etapa.
- A preparação transforma quem ainda está humano e não gasta o primeiro turno. O renderizador acompanha o ambiente; os desafios desta abertura são realizados no laboratório por exigência de supervisão.
- Transformações normais levam aproximadamente 7,8 s; retorno, 3,6 s. O casulo cobre o corpo, ganha rachaduras e se desfaz em fragmentos. Os efeitos são encurtados quando a redução de movimentos está ativa.
- Lira e Mara permanecem em seus postos e se voltam para conversar. Lira só caminha durante as cenas da história. Alguns alunos patrulham com pausas e outros ficam parados.
- A Zimondex distingue registro conhecido, silhueta sem leitura e alma vinculada. Referência/avistamento não concede uma nova forma. Os cinco registros adicionais são espaços reservados para conteúdo futuro, sem espécies inventadas.
- Oito elementos: Água, Fogo, Terra, Planta, Elétrico, Luz, Sombra e Cristal. Cristal causa 1,25× ofensivo contra os cinco básicos e dano normal contra Luz/Sombra; não oferece resistência universal.

O combate agora usa **sprites**, sem modelos geométricos substitutos: quatro folhas de seis poses derivadas dos designs aprovados, incluindo Lira humana com antebraços do Verdrax Ascendido. Preparação, impulso, técnica, recuperação e reação ao dano são quadros distintos, combinados com deslocamento, recuo e efeitos. Ataques normais levam 2,4 s e elementais 3,2 s; HP e mensagem de dano aguardam o contato. Os olhos vermelhos usam máscaras de íris por pose, somente durante a possessão.

A criação oferece cinco penteados e cinco modelos de roupa com silhuetas diferentes, três opções de calça, paletas independentes, acessórios e quatro vistas animadas. As variações são camadas compostas sobre os corpos aprovados, não cinco folhas inteiramente redesenhadas à mão. A Bolsa possui 12 slots, categorias e uso funcional de tônicos; a Zimondex tem catálogo próprio, fichas e silhuetas. Menu Esc, tela inicial, tipografia, ícones e HUD foram revisados dentro do jogo.

## Sessão e direção online

Não há botão de salvar, restauração de partidas antigas nem gravação de progresso no `localStorage`. **Retomar sessão** só funciona ao voltar à entrada na mesma aba; atualizar ou fechar a página reinicia a jornada. Apenas preferências de áudio podem ficar no navegador. A intenção é MMORPG, mas esta versão continua sendo uma execução local: contas, servidor, persistência e sincronização multiplayer ainda não foram implementados.

## Testar e desenvolver

Para testes, instale as dependências fixadas:

```sh
npm ci
npm run check
npm test
npx playwright install chromium
npm run test:e2e
```

Se houver Chromium do sistema, a configuração o reutiliza. Também aceita `CHROMIUM_PATH`. O servidor de teste é iniciado automaticamente na porta 4173, ou reutiliza um já ativo. `npm run package` cria `../zimons-academia.zip` com fonte, assets, documentação e manifesto SHA-256; exclui caches, dependências de desenvolvimento e relatórios temporários.

## Organização

- `src/story.js`: roteiro com falantes, estados narrativos, cenas, percursos e progressão do capítulo.
- `src/game.js`: integração das cenas, diálogos, janelas, Zimondex e comandos de jogo.
- `src/model.js`: estado, colisões, elementos, níveis e regras de combate; `createContainment` é separado dos duelos comuns.
- `src/appearance.js`, `src/ui-icons.js`: composição visual e ícones locais.
- `src/input.js`: navegação e comandos de controle padrão, foco e teclado.
- `src/render.js`, `src/assets.js`: cenário, sprites, composição da aparência e atores.
- `src/world.js`: geometria da floresta, dimensões, alvos e descrição dinâmica das missões.
- `src/npcs.js`: personagens, conversas e patrulhas.
- `src/battle-atlas.js`, `src/battle-sprites.js`, `src/effects.js`: poses, máscaras de olhos, movimento e efeitos de combate. Os módulos 3D antigos foram preservados como histórico, mas não renderizam esta versão.
- `src/audio.js`: pequena trilha sintetizada localmente, depois da primeira interação permitida pelo navegador.
- `release.css`, `story.css`, `expedition.css`: apresentação narrativa, minimapa e guia de missões; as folhas anteriores foram preservadas.
- `docs/lore/`: decisões da adaptação narrativa.
- `docs/screenshots/v08-*`: capturas reais desta implementação.
- `docs/previews/v08-*.mp4`: transformação e ataque gravados no jogo, sem áudio.
- `docs/AMBIENTE_NUVEM.md`: instalação, inicialização e testes no ambiente.
- `original/`, `docs/ASSETS_ORIGINAIS.json`: arquivos recebidos e seus hashes. As folhas com nomes invertidos foram preservadas: `lira_sheet.png` contém o explorador; `male_sheet.png` contém Lira.

Artes de cenário: `assets/world/forest.png` (agora 2560×1440 unidades, com câmera acompanhando o jogador), `assets/world/gardens.png` e `assets/world/infirmary.png`. A versão anterior da floresta foi preservada. Os mapas anteriores, folhas originais e licenças de fontes/Three.js continuam no projeto. A câmera de exploração permanece superior; as perspectivas de combate e imagens conceituais não mudam essa regra.
