# Personagens oficiais — substituição 0.13

`source.png` é o PNG recebido em `ZIMONS_Sprites_Oficiais_Lira_Protagonistas.zip`, preservado integralmente. SHA-256: `647544389a5c42e90c53212e0b55229206748b88129464e36c4717eb234c8c4a`.

`lira.png`, `female.png` e `male.png` são atlas RGBA de 768×768, com 16 quadros de 192×192 cada. Linhas: frente, costas, esquerda, direita. Coluna zero é a pose de repouso escolhida entre os quadros autorais. As outras colunas preservam os passos da mesma folha. Não há inversão de direções nem membros de outro personagem.

Todos os quadros usam escala uniforme 0,78; âncora horizontal 96; contato dos pés 180; referência comum de altura 174. Assim, a diferença de altura entre Lira e os protagonistas provém da própria arte. Não se normaliza cada pose individualmente para uma altura diferente.

A fonte é RGB, com fundo preto. O preparo remove o preto externo e preserva detalhes escuros fechados. Como alguns cabelos vizinhos se tocam na composição original, os recortes seguem separações escuras curvas; não há reconstrução das partes ocultas. Os limites e medidas estão em `manifest.json`.

Reprodução opcional: `python tools/prepare-official-characters.py` (Pillow, NumPy e SciPy). Esses pacotes não são necessários para jogar.

O jogo carrega apenas estas bases para os protagonistas e Lira em pé. As peças antigas de cabelo, roupa e corpo dos protagonistas não são carregadas. O conjunto especial aprovado de Lira sentando, assim como sua manifestação parcial em batalha, foi mantido conforme solicitado.

A personalização conserva as categorias, mas só permite selecionar a aparência oficial disponível. Outras roupas, cortes, cores e acessórios aguardam arte compatível. Os arquivos históricos continuam arquivados para preservação do projeto, sem compor os novos protagonistas.
