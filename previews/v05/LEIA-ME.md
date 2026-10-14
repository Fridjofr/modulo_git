# ZIMONS — Prévias visuais v0.5

Estas dez pranchas são propostas de direção visual para revisão. Não são uma nova versão jogável, animações executáveis, arquivos de modelos 3D ou sprites recortados prontos para integrar. O código e os assets atuais do jogo não foram alterados.

## Abrir

Extraia o ZIP e abra `index.html` no navegador. Não precisa de Node, instalação ou servidor. Clique numa imagem para ver o PNG completo. Todos os arquivos da galeria são locais. Alternativamente abra qualquer um dos dez PNGs.

## Direção preservada

- Exploração 2D em pixel art, vista de cima, quatro direções pelas setas. As perspectivas cinematográficas das pranchas não alteram essa regra. Sem exploração isométrica.
- Aparência modular real: cinco cortes por gênero, diferentes modelos de roupa, bolsas e cores independentes, animações coerentes de frente, costas e lados. As pranchas precisam virar sprites e camadas adequados na implementação.
- Lira é única, com cabelo azul-escuro e jaleco branco. NPCs importantes ficam parados, piscam e viram para falar; movimentos acontecem em cenas específicas. NPCs comuns podem caminhar ou permanecer parados, com ritmos naturais.
- Lira anda até o laboratório, entra, entrega fisicamente o Z-Link e libera as opções correspondentes do menu. Conversas pausadas, avanço manual, ensinamentos dentro da narrativa em vez de dicas fixas nos cantos.
- Apenas UMA alma inicial. Pyron é o exemplo visual das pranchas; Marivon avistado na Zimondex não significa uma segunda forma disponível. Os demais vínculos dependem de progressão. Nada de três formas automaticamente no começo.
- A primeira manifestação descontrolada ocorre no laboratório. Lira inicia a batalha de contenção obrigatória, sem fuga. No exemplo, seu Verdrax é fraco contra o Pyron do protagonista; controle e nível superiores justificam que ela consiga nos conter. A derrota narrativa do jogador conduz a recuperação, sem interromper o tutorial.
- A provocação e a ativação do relógio antecedem combates comuns. Cada humano transforma seu próprio corpo, sem treinador separado. Quem já estiver transformado pula essa sequência. Transformar na abertura não consome o primeiro turno.
- Casulo de energia cobre o corpo, racha gradualmente e revela o Zimon. Transformação de 7–9 s, retorno de 3–4 s como ponto de partida para testar o ritmo. A prancha 05 contém tempos preliminares mais curtos no retorno; estes não são a especificação final. Trocar de alma exige retorno ao humano seguido da nova transformação.
- Lira demonstra uma forma Ascendida como explicação da progressão. Primal animal → Sincronizada híbrida → Ascendida humanoide bestial, com mudanças de anatomia e postura, não apenas de tamanho.
- Combate diagonal com o ambiente de origem: laboratório no laboratório, cenário exterior nas lutas exteriores. As criaturas desenhadas indicam o objetivo de fidelidade dos futuros modelos leves; ainda não existe nesta entrega um modelo 3D com malha, rig ou animações.
- Nomes humanos no HUD, mesmo transformados. Espécies descobertas pela Zimondex. Símbolos dos oito elementos: Água, Fogo, Terra, Planta, Elétrico, Luz, Sombra, Cristal. Cristal mantém a proposta de dano ofensivo 1,25× contra os cinco básicos, normal contra Luz/Sombra, sem resistência universal.
- Duas técnicas iniciais: física e elemental. Sem Defender/Defesa. Novas técnicas por nível com aviso temporário. Batalha, Bolsa e Troca funcionam como pastas: somente o conteúdo da aba ativa. Troca mostra apenas almas realmente vinculadas e fica indisponível se não houver alternativa.
- Recuperador no laboratório com interação e explicação de Lira. Zimondex entregue na história, estados desconhecido/avistado/vinculado, selo próprio de alma vinculada. Sem Pokébolas ou captura convencional.
- Bolsa com slots, quantidades, categorias e seleção coerentes. Os exemplos de itens e números são ilustração; precisam ser associados aos itens existentes ao implementar. Perfil, missões, vínculos e configurações organizados com a mesma identidade.
- Casa do protagonista e conversa com a mãe, vizinhança, pequenos recados e missões sociais. Água, vegetação e NPCs devem dar movimento ao cenário, preservando caminhos livres e colisões reais.
- Controle precisa navegar por todos os menus e diálogos. Música de fundo e som ambiente terão volumes próprios. Essas imagens não contêm áudio.
- Direção de produto MMORPG: sem botão de save manual. Contas, servidor, persistência e sincronização online permanecem trabalho futuro; estas prévias não implementam backend.

## Processo de revisão

Escolher primeiro a direção das pranchas, indicando o número e o detalhe a manter ou mudar. Depois implementar por blocos e testar o jogo real: personalização/movimento; mapa/história; transformações; batalha; menus/Zimondex. Não substituir código jogável por estas imagens.

## Pranchas

01. **Bairro, casa e HUD** — Praça mais aberta, casa da família, vizinhos e caminhos conectados. Exploração no jogo permanece vista de cima e em quatro direções.
02. **Criação de personagem** — Corte, roupa, bolsa e cores independentes. A aparência escolhida acompanha o personagem. Nenhum Z-Link antes da entrega.
03. **Cortes e modelos de roupa** — Cinco cortes por gênero e cinco modelos de roupa. Silhuetas diferentes, sem usar faixas ou simples recolorações como substitutos.
04. **Lira, vínculo e possessão** — Lira caminha até o laboratório durante a história, entrega o relógio e contém o primeiro vínculo descontrolado. Depois ensina recuperação e Zimondex.
05. **Transformação e retorno** — Ativação no pulso, casulo completo, rachaduras e emergência. Proposta: 7–9 segundos para transformar e 3–4 para retornar; tempos impressos são rascunhos.
06. **Combate no laboratório** — Câmera diagonal, humanos como identidades do HUD, ícones elementais, vantagem e pastas. Somente Impacto e uma técnica elemental no início; sem Defender.
07. **Bolsa e menu** — Grade de 24 slots, categorias, quantidades, descrição e equipamentos-chave. A visão Todos reúne itens; as categorias individuais deverão filtrar corretamente.
08. **Zimondex e missões** — Desconhecido em silhueta, avistado com olho, alma vinculada com selo próprio. Pequenas missões de conversa, família e vizinhança.
09. **Ataques e movimento** — Poses de preparação, impulso, contato e retorno. Caminhada em quatro direções. Lira em repouso, piscando e virando para conversar.
10. **Tela de entrada** — Wallpaper com os personagens aprovados e espírito elemental. Entrada, configurações, créditos e volumes separados de música e ambiente.
