# Validação · v0.3.0

Data: 14/10/2026. Ambiente: Node.js 24, npm 11 e Chromium headless local. O runtime utiliza JavaScript e Canvas 2D, sem dependências de produção.

## Verificações concluídas

- `npm run check`: sintaxe dos cinco módulos de execução aprovada.
- `npm test`: 15 testes de regras aprovados.
- Playwright: os nove casos de `journey.spec.js` e os três de `refinements.spec.js` foram aprovados. O caso de NPCs foi corrigido para percorrer o mapa por teclado, evitando que o salvamento automático sobrescrevesse uma fixture alterada durante a partida, e os três casos de refinamento foram reexecutados com sucesso.
- `npm run sprites`: preparação dos atlases concluída, com todos os materiais presentes.
- Os 11 arquivos recebidos foram comparados com `ASSETS_ORIGINAIS.json`; todos os SHA-256 permanecem iguais.

## Cobertura funcional

A jornada principal usa controles reais: entrada, personalização masculina, percurso livre até Lira, laboratório, erro recuperável e três acertos no minigame, entrega do dispositivo, escolha de Pyron, transformação/reversão na praça e vitória contra Lira. Aparência e progressão permanecem depois de recarregar.

Marivon e Verdrax usam fixtures explícitas de save após a missão para cobrir transformação no mapa, derrota, nova tentativa e vitória. Saves inválidos, indisponibilidade deliberada de uma imagem e recuperação do carregamento também foram exercitados.

A abertura de combate foi conferida com o protagonista humano: ao liberar os comandos, ambos já estavam transformados, o turno continuava em 1 e o jogador tinha HP máximo e 60 EN. Alternar formas depois da abertura consumiu turno e permitiu a resposta da mentora. Uma sequência de 12 cliques executou uma única técnica, sem duplicar o histórico.

As abas Batalha, Bolsa e Sair foram exercitadas. Tônico em HP cheio permaneceu desabilitado; seu uso posterior consumiu exatamente um item. A confirmação de saída pôde ser cancelada; ao confirmar, o jogador voltou ao laboratório sem EXP nem avanço de missão e manteve o consumo do item. Os comandos e abas ficaram bloqueados durante a execução de golpes.

O teste com animação completa comparou o Canvas antes/durante um ataque e registrou o efeito visual. Há movimento corporal, projéteis elementais, impacto, defesa e cura. As capturas reais atuais têm prefixo `screenshots/v03-`, incluindo entrada, personalização, praça, combate, ataque e Bolsa. Outras capturas registram etapas anteriores do projeto.

## Sprites e mapa

As duas identidades, todas as cores e as opções frontais de penteado/bolsa mudam a prévia. As quatro direções possuem quatro quadros distintos. O dispositivo aparece somente depois de obtido. Em todas as direções e quadros dos dois protagonistas, trocar qualquer uma das quatro cores de cada material preservou o mesmo canal alfa, sem abrir buracos. Os quadros mantiveram pivô, baseline e altura de referência fixos, sem cortes nas bordas.

O percurso até Lira foi feito diretamente pelo piso central. Dois alunos, um humano e outro transformado em Pyron, foram alcançados por teclado e apresentaram seus próprios diálogos. A praça contém cinco alunos e uma única Lira. Água, bordas e bancadas do laboratório continuam bloqueadas pelas colisões.

## Apresentação e alcance

A criação e os controles de toque foram testados em 800×450. A interface de batalha foi conferida visualmente em 1440×900, 800×450 e 844×390. A tela de entrada recebeu wallpaper próprio. A tipografia utiliza fontes locais do sistema. Para celular, recomenda-se jogar na horizontal.

Firefox, Safari/WebKit e aparelhos físicos não foram executados nesta entrega. A campanha posterior à Academia, evolução para estágios 2/3 e áudio continuam fora desta revisão; suas artes originais estão preservadas. O nível 2 registra a primeira progressão. As opções de penteado são mecha/faixa sobre o cabelo existente, e as de roupa são paletas, não diferentes cortes completos de roupa.

## Distribuição

`npm run package` inclui fonte, cenários, sprites preparados e suas fontes, todos os recursos originais, testes, documentação e `INTEGRIDADE.sha256`. Exclui dependências instaladas, caches e relatórios temporários. A cópia extraída em uma pasta independente passou pela conferência de todos os hashes, iniciou com `npm start` sem instalar dependências de produção e passou pelos 15 testes de regras e pela verificação de sintaxe. Uma sessão nova de Chromium carregou entrada, imagens, criação, movimento, Bolsa, save e combate; confirmou a sincronização inicial gratuita e o bloqueio de troca de abas por teclado durante golpes. Não houve erro de JavaScript nem resposta HTTP de falha. A distribuição é um ZIP de código e assets, servido por link HTTPS direto no repositório; não é uma publicação do jogo em um site jogável.
