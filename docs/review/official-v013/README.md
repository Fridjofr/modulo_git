# Evidências reais — personagens oficiais 0.13

Imagens de Chromium executando o jogo em 1280×720. Nenhuma imagem conceitual ou sprite simulado foi usado como captura.

- `images/creator-female.png`, `creator-male.png`: telas reais do criador com as bases oficiais.
- `images/forest-*.png`: exploração real com a interface do jogo.
- `images/clinic-approach.png`: quadro extraído da gravação da chegada à enfermaria.
- `images/clinic-rest.png`, `clinic-sitting.png`: capturas durante a cena real de repouso e cadeira.
- `images/laboratory.png`: chegada real ao laboratório depois da cena.
- `videos/walk-*.mp4`: movimentação real nas quatro direções, em velocidade normal.
- `videos/clinic-sequence.mp4`: chegada, deitar, Lira sentar, repouso, despertar e levantar. A passagem preta no meio é a transição noturna da própria história.

A gravação foi feita com `canvas.captureStream(60)` e MediaRecorder, sem modificar o estado de progressão. Os MP4s preservam a duração da captura e são codificados em 60 fps. Por capturarem o canvas do jogo, os vídeos não incluem os elementos de interface em HTML. Os GIFs são recortes desses vídeos, sem ampliar os personagens e sem alterar a velocidade (20 fps na caminhada, 15 fps na enfermaria). Os MP4s conservam o enquadramento completo.

As poses especiais aprovadas de Lira foram preservadas. Variações de cabelo, roupa, tom de pele e acessórios sem arte compatível permanecem sinalizadas no criador. As correções adicionais de portas foram adiadas conforme a orientação posterior do usuário.
