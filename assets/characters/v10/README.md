# Personagens em camadas — v10

`heads.png`: dez colunas (cinco cortes por protagonista), quatro vistas. `bodies.png`: cinco modelos por protagonista, quatro vistas, sem cabeça; assim a troca de cabelo não recorta um retrato completo. `bags.png`: bolsas e mochilas separadas. `npcs.png`: seis personagens com roupas e silhuetas próprias, quatro vistas.

Os limites reais das linhas variam: `character-atlas.js` e `npc-atlas.js` guardam esses recortes, retiram pixels isolados e normalizam as âncoras. O runtime aplica paletas por material, não uma troca global de cor. A marcha articula os segmentos das pernas em torno do quadril em vez de esticá-los. Os desenhos-fonte permanecem incluídos sem alteração.
