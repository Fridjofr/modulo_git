# Artes finais fornecidas pelo autor

Os PNGs foram extraídos sem conversão ou edição dos ZIPs finais enviados pelo autor.

| Arquivo | Dimensão original | SHA-256 |
|---|---|---|
| ZIMONS_Laboratorio_Base_Final_Aprovada.png | 1670 × 942 | c14bf12983d4c969462bec1a34674f37d0bff91fc175fc754423cbcbc38951c9 |
| ZIMONS_Salao_Academia_Base_Final_Aprovada.png | 1446 × 1087 | cacb83aec53ec32f711ffeac8039c3baa7a27ed57f9b344f2754aaf26fc785b1 |

| ZIMONS_Enfermaria_Final_Aprovada.png | 1444 × 1089 | 634046ffc162e6cf58bba8cabe2303d1f89b512826345bc7952ef6fb8d989855 |

A escala é uniforme, para 1280 unidades de largura: laboratório 1280 × 722 e salão 1280 × 962 (arredondamento menor que meio pixel). A enfermaria usa 768 × 579 unidades para manter cama e personagens em proporção; a câmera aplica o mesmo zoom a todos os elementos. A câmera acompanha o jogador no salão; a imagem não foi achatada para 16:9.

`src/maps.js` contém as áreas de circulação, colididores, interações e retângulos das portas nas mesmas coordenadas. A primeira porta do salão fecha com folhas copiadas em execução da segunda porta do próprio PNG, sem substituir a moldura. A cavidade existente na primeira porta fornece o fundo das aberturas. A colisão e a animação consultam o mesmo progresso em `src/doors.js`; uma abertura parcial ainda bloqueia a passagem.

O arquivo original do laboratório normal não contém destruição. Os danos narrativos continuam como sobreposições separadas e não modificam o PNG nem o cache da base.
