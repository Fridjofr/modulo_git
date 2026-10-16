# Sprites de batalha — ativos na v0.10

As quatro folhas são assets carregados pelo jogo. Foram produzidas a partir dos designs originais de Pyron, Marivon, Verdrax e Lira; as folhas originais permanecem em `assets/` sem alterações.

Cada folha tem 1536 × 1024 px, com três colunas e duas linhas de células de 512 px. Ordem: prontidão, preparação, impulso, técnica elemental, recuperação e reação ao dano. Lira conserva o corpo humano e manifesta os antebraços da forma Ascendida do Verdrax.

`src/battle-atlas.js` remove margens de baixa opacidade e fragmentos alheios, prepara âncoras e máscaras de íris uma vez no carregamento. O renderizador combina as poses com deslocamento, antecipação, recuo e efeitos em Canvas. Não utiliza modelos 3D.

São seis poses por ator, não animação desenhada a cada frame. O retorno humano continua usando o sprite e a aparência escolhidos na criação. Não incluir pranchas conceituais de interface como se fossem o jogo.

O atlas effects-v10.png usa seis colunas e quatro linhas, com chamas, impacto de fogo, água e folhas. O fluxo ativo combina os frames de fogo com bolhas e folhas desenhadas no Canvas, em trajetórias da boca/pata até o alvo. A perda de HP visível e o recuo começam na fase 0,68.
