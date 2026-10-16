# Tileset v10

`terrain.png`: 24 células 256×256, seis colunas e quatro linhas. São materiais de chão, não um cenário pronto esticado. `objects.png`: 24 objetos isolados no mesmo grid. O runtime recorta o alfa, mantém a proporção e utiliza a escala definida por objeto em `maps.js`.

A unidade lógica é 32; o chão repete em 64. Humanos medem 82 e Lira 84. Portas têm 114 de altura, árvores externas 176 e camas 154–160. As colisões acompanham o pé e a base dos objetos; copas não viram paredes. Abra `/tools/tileset.html` para ver os nove mapas, uma referência de personagem e as caixas de colisão.

Props: árvore, árvore partida, pedras, banco, poste, floreira pequena, bancada, terminal, cama clínica, armário, porta, janela, disco de Sincro, emblema, mesa, cadeira/escrivaninha, cama, estante, bancada quebrada, vidro, marcas, banco do ginásio, fachada e bandeira. O emblema no chão é desenhado como gravação plana. Vidro quebrado não bloqueia circulação.
