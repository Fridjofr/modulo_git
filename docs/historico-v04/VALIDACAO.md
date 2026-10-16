# Validação · ZIMONS v0.4.0

Data: 14/10/2026. Ambiente: Node.js 24, npm 11, Chromium headless com SwiftShader para WebGL 2. As verificações não dependem de serviços externos durante o jogo.

## Resultado

- `npm run check`: os dez módulos de execução passaram na verificação de sintaxe.
- `npm test`: **20 testes de regras aprovados**. Registro em `teste-regras.txt`.
- Playwright: **18 casos aprovados**, considerando 17 casos da execução completa e a reexecução do caso de pastas/Troca após corrigir a oscilação de um botão sob o cursor. Esse problema era causado pelo deslocamento do botão no hover quando ele reaparecia sob o ponteiro. A correção mantém sua posição fixa. Registro do reteste em `teste-reteste-v04.txt`; diagnóstico anterior preservado em `historico-v04/`.
- Os **11 arquivos originais** conferem com os hashes de `ASSETS_ORIGINAIS.json`.

## Jornada e progressão

O percurso principal foi feito por entradas reais: tela de entrada, criação masculina, personalização, caminhada até Lira, laboratório, um erro recuperável e três acertos no minigame, recebimento do Z-Link, escolha inicial, transformação/reversão na praça e vitória. A vitória inicial levou a forma ativa do nível 5 ao 6, ensinando a técnica elemental. O save restaurou aparência, missão e progresso.

Marivon e Verdrax tiveram transformação, derrota, nova tentativa e vitória exercitadas com fixtures explícitas após a missão. Fixtures de nível 8 cobrem as técnicas Primal; o começo no nível 5 cobre o bloqueio dos golpes ainda não aprendidos. As regras verificam aprendizado em 6/8, EXP independente das formas e migração de saves antigos para as três formas disponíveis.

A Troca de Marivon nível 8 para Pyron nível 5 conservou a energia, aplicou a proporção de HP e permitiu a resposta inimiga. Técnicas de nível maior desapareceram da pasta Batalha. Testes de regras confirmam que alternar de volta não recupera HP nem remove status. Revanche dá EXP menor e não repete tônicos extras.

## Atores, cenário e menus

Um NPC foi observado caminhando e depois parando/virando para o jogador. Nico e Caio têm diálogos próprios. O desafio a Nico iniciou uma luta externa com o cenário da praça e retornou à posição original ao sair; o duelo de Lira usou o laboratório. A Lira continuou sendo uma entidade única na exploração.

As pastas de comandos são exclusivas. Batalha não deixa a navegação principal nem Bolsa/Troca visíveis. Tipagem e vantagem aparecem nos golpes. Os cabeçalhos mostram os nomes dos Zimons. Bolsa em HP cheio permanece bloqueada; o uso posterior consome um item e um turno. Sair pode ser cancelado; ao confirmar não dá recompensa e mantém o gasto dos itens.

Doze cliques rápidos executaram uma única ação e uma resposta da IA. O enfraquecimento reduziu exatamente dois ataques e expirou no turno correto. A IA de nível 6 não utilizou a técnica Primal ainda não aprendida.

## 3D e transformação

O renderizador ativo informou WebGL disponível, malhas e aproximadamente 22 mil triângulos em uma composição de dois Zimons. Os modelos têm patas, cabeça, olhos, cauda e apêndices independentes. São modelos 3D estilizados de protótipo construídos no código; não são artes PNG colocadas em planos. Não houve teste de desempenho em hardware físico específico.

A sequência sem redução de movimento mostrou provocação, gesto no Z-Link e energia antes de liberar o turno 1. HP e energia permaneceram máximos e não houve golpe inimigo durante a preparação. As capturas incluem o relógio, o ambiente interno, as pastas e efeitos. Um Canvas de ataque foi comparado antes/durante a animação. O modo deliberadamente sem WebGL também concluiu uma ação e uma resposta inimiga, preservando o cenário e a jogabilidade.

## Aparência, áudio e telas

O corte curto mudou a região do cabelo nos dois gêneros e preservou os pixels centrais da bolsa. O índice de cor do acessório e o tipo de bolsa não foram alterados pela escolha de penteado. As opções continuam no mapa e no save. Os testes verificam quadros distintos nas quatro direções e invariância do alfa ao mudar as paletas.

A música não iniciou antes de gesto; depois do clique o contexto ficou ativo e sintetizou notas. Silenciar foi persistido após recarregar. Fontes Sora/Rajdhani e Three.js estão incluídos localmente, com licenças.

Criação e toque foram exercitados em 800×450. A pasta Batalha com os quatro comandos conhecidos coube nessa tela sem botões abaixo da área visível. Também foram conferidas capturas de combate em 1440×900 e de Troca em 800×450. Para celular, recomenda-se horizontal. Evidências atuais: `screenshots/v04-*`.

## Distribuição e alcance

O ZIP contém fontes, código, biblioteca local, sprites preparados e suas fontes, todos os originais, testes, documentação e hashes de conteúdo. Capturas antigas, dependências instaladas, caches e relatórios temporários são excluídos do pacote. A cópia extraída em outra pasta passou pela conferência dos 108 hashes de conteúdo, pela verificação de sintaxe e pelos 20 testes de regras. Sem `node_modules`, `npm start` iniciou o servidor; uma sessão nova de Chromium carregou entrada, cabelo curto, fontes/imagens, movimento, Bolsa e save e completou a preparação 3D, a Troca entre as três formas, um ataque e a saída da arena. Nenhum erro de JavaScript ou HTTP foi observado. O ZIP é publicado como download HTTPS no repositório; isso não é uma hospedagem externa do jogo em execução.

A evolução para estágios 2/3 e a campanha além da Academia continuam fora desta revisão. Os modelos atuais são uma primeira versão 3D procedural; não substituem futuras malhas finais de produção. Firefox, Safari/WebKit e aparelhos físicos não foram executados. A exploração continua 2D e sem câmera isométrica.
