# ZIMONS — O Despertar · v0.6.0

Adaptação jogável do prólogo e do capítulo 1 de **ZIMONS — Conexão além da evolução**, preservando o projeto e as artes recebidos. Exploração 2D vista de cima, personagens animados, cenas encenadas, diálogos manuais e batalhas por turnos. O humano assume a forma do Zimon: não existe treinador separado do corpo transformado.

## Executar

Requer **Node.js 20 ou superior**. Extraia o ZIP, abra o terminal na pasta `zimons-academia` e execute:

```sh
npm start
```

Abra **http://localhost:4173**. Encerre com `Ctrl+C`. **Não precisa instalar dependências para jogar.** Fontes, sprites, mapas e Three.js estão incluídos; não há CDN ou build obrigatório. Alternativa com Python: `python3 -m http.server 4173`. Não abra `index.html` diretamente por `file://`: o jogo carrega módulos e metadados pelo servidor.

Outra porta: `PORT=4180 npm start` no Linux/macOS; no PowerShell, `$env:PORT=4180` e depois `npm start`. No celular, use orientação horizontal e os botões de toque.

## O novo arco inicial

1. Personalize o protagonista e inicie. Uma voz e uma silhueta antecedem o despertar na floresta. Não há Z-Link antes da entrega.
2. Explore a mata. O riacho e a pedra antiga têm conversas próprias e anotações; o riacho e a pedra conduzem à estrada ao leste, atravessando a ponte. Tronco e lagoa são investigações opcionais. Água, árvores e limites não são atravessáveis.
3. Ao alcançar a trilha, Lira se aproxima. Depois da conversa, ela caminha até a Academia; a cena também mostra o protagonista acompanhando o percurso. Na praça há uma manifestação parcial observada durante a conversa.
4. A avaliação médica estabelece a perda das lembranças pessoais e o nome usado pelo personagem. Lira explica o procedimento e segue para preparar a sala. Quando quiser, use a passagem ao sul da enfermaria para o laboratório.
5. Lira entrega um Z-Link de treinamento. A plataforma permite escolher **uma única essência** entre Pyron, Marivon e Verdrax. Acompanhe três pulsos de respiração; perder um não causa a crise nem pune o jogador. Se fechar o monitor, pode reiniciar a avaliação pela plataforma.
6. A conexão progride além dos parâmetros. O casulo se fecha e Lira tenta contato. Na luta de contenção, **você controla seu próprio protagonista**. Lira manifesta apenas os braços, como no manuscrito, e sua experiência de nível 18 permite conter o corpo descontrolado. O confronto termina na derrota do protagonista, com HP zerado e retorno involuntário ao humano. Não há fuga, revanche ou recompensa de vitória nessa cena.
7. Na enfermaria, acompanhe o segundo despertar e o acordo de confiança. É possível expressar medo ou vontade de aprender a retornar; as respostas mudam. Uma projeção mostra Primordial, Sincronizada e Ascendida usando as artes existentes. As formas avançadas não são desbloqueadas.
8. No dia seguinte, a prática supervisionada ensina **T** para transformar e novamente para retornar. O exercício só avança com as duas ações. A aparência humana original é preservada.
9. Interaja com o aparelho junto à bancada direita do laboratório, pela frente. Ele restaura vida e energia. Lira entrega a Zimondex e libera a prática nas áreas públicas.
10. Saia ao sul para a praça e conheça pelo menos duas pessoas entre **Nico, Aya e Mara**. Visite os jardins pela passagem leste. A presença retorna ali, sem leitura no aparelho. Volte ao laboratório e conte a Lira para concluir o capítulo.
11. A Academia continua explorável. Os colegas oferecem desafios únicos; cada resultado encerra o respectivo desafio, incluindo desistência. Nos jardins, Elias oferece a missão opcional de consultar o monitor de água. Lira não oferece revanche. A trilha externa ainda exige uma futura saída acompanhada.

Os diálogos alternam falantes, têm revelação gradual e **nunca avançam sozinhos**. E, Enter, Espaço ou A revelam o texto e depois avançam. Ativar a redução de movimentos mostra o texto completo e encurta efeitos; não remove conversas. As caminhadas de cena continuam visíveis. Estimativa editorial da abertura: 20–35 minutos, conforme ritmo de leitura e exploração; não é uma medição com jogadores.

## Controles

| Entrada | Ação |
|---|---|
| Setas | Andar em quatro direções; navegar nas janelas |
| E | Conversar, entrar, interagir e acompanhar pulsos |
| Enter / Espaço | Revelar/avançar conversa ou confirmar opção focada |
| T | Transformar/retornar após a liberação supervisionada |
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
- A preparação transforma quem ainda está humano e não gasta o primeiro turno. Os cenários de batalha acompanham laboratório ou praça.
- Transformações normais levam aproximadamente 7,8 s; retorno, 3,6 s. O casulo cobre o corpo, ganha rachaduras e se desfaz em fragmentos. Os efeitos são encurtados quando a redução de movimentos está ativa.
- Lira e Mara permanecem em seus postos e se voltam para conversar. Lira só caminha durante as cenas da história. Alguns alunos patrulham com pausas e outros ficam parados.
- A Zimondex distingue registro conhecido, silhueta sem leitura e alma vinculada. Referência/avistamento não concede uma nova forma. Os cinco registros adicionais são espaços reservados para conteúdo futuro, sem espécies inventadas.
- Oito elementos: Água, Fogo, Terra, Planta, Elétrico, Luz, Sombra e Cristal. Cristal causa 1,25× ofensivo contra os cinco básicos e dano normal contra Luz/Sombra; não oferece resistência universal.

A apresentação usa novos modelos 3D articulados de Pyron, Marivon e Verdrax: volumes contínuos, patas articuladas, respiração, olhos, caudas, garras e efeitos de ataque. Cores e traços foram guiados pelas folhas aprovadas; **são aproximações geométricas em desenvolvimento, não uma reprodução final das ilustrações**. Os humanos preservam os sprites aprovados; Lira mantém o corpo humano e manifesta energia/garras nos braços. A criação mantém os sprites modulares existentes (original/curto); a prancha com cinco novos cortes e roupas diferentes ainda é direção para outra etapa, não um recurso anunciado como pronto.

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
- `src/input.js`: navegação e comandos de controle padrão, foco e teclado.
- `src/render.js`, `src/assets.js`: cenário, sprites, composição da aparência e atores.
- `src/world.js`: geometria da floresta, dimensões, alvos e descrição dinâmica das missões.
- `src/npcs.js`: personagens, conversas e patrulhas.
- `src/effects.js`, `src/battle3d.js`, `src/models3d.js`, `src/creature-rig.js`: efeitos e apresentação de combate.
- `src/audio.js`: pequena trilha sintetizada localmente, depois da primeira interação permitida pelo navegador.
- `story.css`, `expedition.css`: apresentação narrativa, minimapa e guia de missões; as folhas anteriores foram preservadas.
- `docs/lore/`: decisões da adaptação narrativa.
- `docs/screenshots/v06-*`: capturas reais desta implementação.
- `docs/previews/v06-*.mp4`: transformação e ataque gravados no jogo, sem áudio.
- `docs/AMBIENTE_NUVEM.md`: instalação, inicialização e testes no ambiente.
- `original/`, `docs/ASSETS_ORIGINAIS.json`: arquivos recebidos e seus hashes. As folhas com nomes invertidos foram preservadas: `lira_sheet.png` contém o explorador; `male_sheet.png` contém Lira.

Artes de cenário: `assets/world/forest.png` (agora 2560×1440 unidades, com câmera acompanhando o jogador), `assets/world/gardens.png` e `assets/world/infirmary.png`. A versão anterior da floresta foi preservada. Os mapas anteriores, folhas originais e licenças de fontes/Three.js continuam no projeto. A câmera de exploração permanece superior; as perspectivas de combate e imagens conceituais não mudam essa regra.
