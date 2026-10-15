# ZIMONS — O Despertar · v0.9.0

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
2. Explore a mata. O riacho e a pedra antiga têm conversas próprias. A pedra é opcional; o riacho conduz à estrada ao leste, atravessando a ponte. Tronco e lagoa são investigações opcionais. Água, árvores e limites não são atravessáveis.
3. Ao alcançar a trilha, Lira se aproxima. Depois da conversa, ela caminha até a Academia; a cena também mostra o protagonista acompanhando o percurso. Na praça há uma manifestação parcial observada durante a conversa.
4. A avaliação médica confirma a perda das lembranças pessoais; o protagonista ainda lembra seu nome escolhido na criação. Lira explica o procedimento e segue para preparar a sala. Quando quiser, use a passagem ao sul da enfermaria para o laboratório.
5. Lira entrega um Z-Link de treinamento. A plataforma permite escolher **uma única essência** entre Pyron, Marivon e Verdrax. Acompanhe três pulsos de respiração; perder um não causa a crise nem pune o jogador. Se fechar o monitor, pode reiniciar a avaliação pela plataforma.
6. A conexão progride além dos parâmetros. A transformação em casulo leva 10,8 segundos no ritmo normal. Os olhos ficam vermelhos e o corpo deixa de responder à vontade do protagonista.
7. Antes do combate, a crise acontece **no mapa**: o protagonista avança contra Lira; ela desvia, tenta conversar e o corpo transformado atinge uma bancada. Vidro, tela rachada e equipamento amassado permanecem visíveis no laboratório. A passagem continua transitável; os fragmentos não criam bloqueios.
8. Lira manifesta apenas os antebraços de Verdrax, com transição visível no mapa. A entrada no combate preserva o laboratório e os danos, com uma transição própria. **Você controla o protagonista**, não Lira. No primeiro turno, ela recua e tenta contato sem causar dano.
9. A derrota é real: HP chega a zero, o corpo cai, permanece deitado durante o retorno humano, e Lira chama ajuda. Ela desfaz a manifestação parcial. Só então aparece a opção de acompanhar o socorro; não há fuga, recompensa ou revanche nessa contenção.
10. Um sonho mostra névoa, pedra coberta de água rasa e uma figura humana desconhecida. Na enfermaria, o protagonista descobre o ataque, conta o sonho e pergunta pelos olhos vermelhos. As conversas não resolvem a amnésia nem o risco de possessão.
11. Após descanso e a passagem explícita para a manhã seguinte, Lira entrega a Zimondex e combina a orientação. **O jogador permanece na enfermaria**. A saída para a praça depende de caminhar até a porta e interagir; Lira acompanha e explica o caminho. Não há apresentação automática das evoluções.
12. Na praça, conversar com colegas é opcional. Os jardins têm um desenho assimétrico, lago, estufa e área de treino conectada por um acesso pavimentado. A presença retorna durante uma prática supervisionada; a decisão de contar a Lira encerra o capítulo do livro.
13. Relatar o ocorrido abre a extensão jogável de prática T/T no laboratório. O retorno consciente é seguido de uma pausa com Lira. **Não existe aparelho de recuperação nesta versão.** A pausa orientada encerra o exercício e recupera os recursos.
14. Colegas oferecem desafios únicos no laboratório, com supervisão. Ao terminar, o corpo volta à forma humana antes do retorno à praça. Elias só recebe nome, apresentação e tarefa depois de uma conversa voluntária com ele; a tarefa não aparece automaticamente no diário.


Os diálogos alternam falantes, têm revelação gradual e **nunca avançam sozinhos**. E, Enter, Espaço ou A revelam o texto e depois avançam. Reduzir movimentos mostra o texto completo e diminui movimento de câmera e partículas, **sem acelerar a transformação ou os golpes**. A opção independente **Animações breves**, desativada por padrão, encurta esses eventos quando o jogador a escolhe. **Pular etapa (R)** encerra somente a conversa, caminhada ou efeito atual; não pula o capítulo nem escolhe respostas de diálogo. As caminhadas de cena continuam visíveis. Estimativa editorial da abertura: 20–35 minutos, conforme ritmo de leitura e exploração; não é uma medição com jogadores.

## Controles

| Entrada | Ação |
|---|---|
| Setas | Andar em quatro direções; navegar nas janelas |
| E | Conversar, entrar, interagir e acompanhar pulsos |
| R / botão Pular etapa | Pular somente a etapa narrativa atual |
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
- Transformação: 10,8 s; retorno voluntário: 5,6 s. Queda na contenção: 3,4 s; retorno humano deitado: 6,6 s; desfazer dos braços de Lira: 3,3 s. O casulo cobre o corpo e se abre em rachaduras e fragmentos. Animações breves é uma escolha explícita, independente da configuração do sistema.
- Lira e Mara permanecem em seus postos e se voltam para conversar. Lira só caminha durante as cenas da história. Alguns alunos patrulham com pausas e outros ficam parados.
- A Zimondex distingue registro conhecido, silhueta sem leitura e alma vinculada. Referência/avistamento não concede uma nova forma. Há somente as três linhagens com artes existentes; não são preenchidos espaços extras com silhuetas de outras espécies. Catálogo e ficha usam o mesmo sprite da batalha. As evoluções usam seus próprios recortes das artes originais.
- Oito elementos: Água, Fogo, Terra, Planta, Elétrico, Luz, Sombra e Cristal. Cristal causa 1,25× ofensivo contra os cinco básicos e dano normal contra Luz/Sombra; não oferece resistência universal.

O combate agora usa **sprites**, sem modelos geométricos substitutos: quatro folhas de seis poses derivadas dos designs aprovados, incluindo Lira humana com antebraços do Verdrax Ascendido. Preparação, impulso, técnica, recuperação e reação ao dano são quadros distintos, combinados com deslocamento, recuo e efeitos. Ataques físicos levam 4,2 s e elementais 5,6 s; HP e mensagem de dano aguardam o contato. Os olhos vermelhos usam máscaras de íris por pose, somente durante a possessão.

A criação oferece cinco penteados e cinco modelos de roupa com silhuetas diferentes, três opções de calça, paletas independentes, acessórios e quatro vistas animadas. Duas novas folhas de vinte sprites pintados fornecem cinco looks nas quatro direções. O compositor troca cabeças e roupas, aplica paletas e anima a passada; os cabelos e casacos deixam de ser polígonos desenhados por cima. O movimento dos novos looks é interpolado a partir das poses direcionais, não uma animação inteira desenhada quadro a quadro. A Bolsa possui 12 slots, categorias e uso funcional de tônicos; a Zimondex tem catálogo próprio, fichas e silhuetas. A criação mostra os cartões de cabelo/roupa, cores, bolsa e prévias juntos. O menu Esc tem opções sem subtítulos e sem “Sua jornada”. O HUD coloca o minimapa circular à direita sob os botões, com moldura, orientação, posição, objetivo, NPCs e saídas; a missão fica abaixo dele. A entrada combina cenário próprio sem personagens embutidos com sprites reais desenhados em primeiro plano.

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
- `src/character-atlas.js`: normalização das novas folhas, máscaras de cabelo, paletas, composição e passada.
- `src/scene-staging.js`: movimento da crise e estado visual persistente dos danos.
- `src/appearance.js`, `src/ui-icons.js`: nomes das opções, compatibilidade visual e ícones locais.
- `src/input.js`: navegação e comandos de controle padrão, foco e teclado.
- `src/render.js`, `src/assets.js`: cenário, sprites, composição da aparência e atores.
- `src/world.js`: geometria da floresta, dimensões, alvos e descrição dinâmica das missões.
- `src/npcs.js`: personagens, conversas e patrulhas.
- `src/battle-atlas.js`, `src/battle-sprites.js`, `src/effects.js`: poses, máscaras de olhos, movimento e efeitos de combate. Os módulos 3D antigos foram preservados como histórico, mas não renderizam esta versão.
- `src/audio.js`: pequena trilha sintetizada localmente, depois da primeira interação permitida pelo navegador.
- `revision.css`, `release.css`, `story.css`, `expedition.css`: apresentação narrativa, minimapa e guia de missões; as folhas anteriores foram preservadas.
- `docs/lore/`: decisões da adaptação narrativa.
- `docs/screenshots/v09-*`: capturas reais desta implementação.
- `docs/previews/v09-*.mp4`: gravações reais sem áudio; a distribuição pode conter uma seleção para manter o ZIP leve. Os vídeos complementares são publicados junto à entrega.
- `docs/AMBIENTE_NUVEM.md`: instalação, inicialização e testes no ambiente.
- `original/`, `docs/ASSETS_ORIGINAIS.json`: arquivos recebidos e seus hashes. As folhas com nomes invertidos foram preservadas: `lira_sheet.png` contém o explorador; `male_sheet.png` contém Lira.

A floresta usa 1672×941 unidades, sem a ampliação anterior para 2560×1440. O renderer do mapa usa amostragem de pixels sem suavização, e humanos têm aproximadamente 82–84 unidades de altura. As versões de terreno `*-v09.png` possuem trilhas livres e equipamentos menores; o laboratório e a arena compartilham a mesma imagem e o mesmo estado dos danos. Os 11 arquivos recebidos e os recursos de versões anteriores foram preservados. As novas folhas são derivadas dos designs aprovados, não alterações destrutivas dos arquivos originais.
