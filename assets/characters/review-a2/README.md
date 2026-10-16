# Cadência e fontes — Marco A / segunda revisão

Os protagonistas NÃO usam estas duas folhas. Seus corpos vêm das bases aprovadas de `../layers/male-*.png` e `female-*.png`, com metadados em `assets/sprites.json`. As cinco opções de cabeça e roupa continuam vindo de `../v10/heads.png` e `bodies.png`; `CharacterAtlas` registra o queixo/gola sobre o corpo original e aplica tecido à anatomia animada existente. Não altera largura ou altura do corpo para ocultar o pescoço.

`mara-walk.png` e `aya-walk.png` são folhas novas, geradas a partir das identidades existentes em `../v10/npcs.png` e das proporções da folha de Lira. Cada uma contém quatro vistas e quatro poses completas; os recortes reais e a escala uniforme estão em `NpcAtlas.prepareAuthored`. São recursos de produção em revisão, não screenshots. Os outros NPCs não receberam novas folhas nesta revisão.

A pose sentada de Lira continua sendo `../review-a/lira-seated.png`, preservada. O novo encaixe usa pontos de quadril explícitos e não o centro do retângulo transparente.
