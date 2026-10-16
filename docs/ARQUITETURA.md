# Organização — v0.11

- `maps.js`: dimensões, tiles, props, colisões e portas de cada local. Desenho e navegação compartilham os mesmos dados.
- `tilemap.js`: cache dos cenários aprovados, objetos históricos, água animada, portas e danos persistentes.
- `narrative-v41.js`: falas adaptadas do roteiro 4.1. O manuscrito privado e suas instruções ao autor não são publicados.
- `story.js`: progressão do capítulo, uma única instância de Lira, rotas, pausas e transições. `actor-path.js` planeja percursos de cena respeitando objetos e personagens.
- `model.js`: regras de vínculo, progressão, supervisão, dano, experiência e recompensas. `types.js` contém a tabela dos oito elementos.
- `character-atlas.js`: cabeça, corpo e bolsa em camadas; normalização por pescoço/pés, tintas por material e marcha em quatro direções. `npc-atlas.js` usa seis aparências independentes.
- `battle-atlas.js` / `battle-sprites.js`: recorte dos sprites aprovados, poses, deslocamento até contato, queda e braços parciais de Verdrax Ascendido da Lira.
- `effects.js`: aura que cobre o corpo, reversão, bolhas, folhas e fogo. Contato e dano usam a fase 0,68 da animação.
- `scene-staging.js`: deslocamentos da crise e demonstração do ginásio, separados das regras de combate.
- `render.js`: mundo e combate Canvas 2D; o fundo de luta é o mapa atual. `game.js`: estado da sessão, relógio de animação, interface, diálogos e input.
- `v11.css`: acabamento da HUD e da personalização. O menu Esc é preservado e refinado.

As velocidades de batalha multiplicam o relógio de movimentos, esperas e HP em conjunto. O relógio fora de batalha permanece 1×. Colisões usam os pés, sem esticar o sprite. Reduzir movimentos preserva o avanço essencial até o contato; Animações breves é uma opção independente.

O cliente não contém backend MMORPG, conta, sincronização de rede ou save. Módulos antigos de 3D e artes de versões anteriores são preservados para referência, mas a batalha ativa usa os sprites originais. Não há dependência de WebGL para jogar.
