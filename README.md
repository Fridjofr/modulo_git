# ZIMONS — versão jogável 0.12.0

Trecho do Capítulo 1: criação do personagem, despertar na floresta, Academia, enfermaria, primeira essência, possessão, recuperação, treino de Sincro e duelo com Nico. Depois do duelo, ficam disponíveis as exibições no ginásio. Escolha **um** inicial: Pyron, Marivon ou Verdrax.

## Jogar no Windows

1. Extraia **todo** o ZIP para uma pasta.
2. Instale o **Node.js LTS, versão 20 ou superior**, em https://nodejs.org se ainda não tiver.
3. Abra `INICIAR.bat`. O navegador padrão abrirá o jogo. Mantenha a janela do iniciador aberta.
4. Se o navegador não abrir automaticamente, entre em **http://localhost:4173** no Chrome ou Edge.

Não precisa executar `npm install`, compilar ou baixar assets para jogar. Fontes, música sintetizada, sprites e cenários estão incluídos. Não abra `index.html` diretamente.

No Linux/macOS, ou pelo terminal do Windows, use `npm start` na pasta do projeto. Encerre com Ctrl+C. Se a porta 4173 estiver ocupada, feche a outra janela do jogo; também é possível definir `PORT` antes de iniciar.

## Controles

| Entrada | Ação |
|---|---|
| Setas | Caminhar e navegar |
| E / Enter / Espaço | Interagir e avançar conversa |
| T | Iniciar/encerrar Sincro nos locais supervisionados |
| Esc | Menu e voltar |
| R / Pular etapa | Avançar a conversa ou efeito atual; numa caminhada, acelerar a rota sem teletransporte |
| V / botão 1× | Batalha: 1× → 2× → 3× → 1× |
| + / − no minimapa | Ajustar o zoom |
| Aba ao lado do objetivo | Recolher/expandir a missão |

Há controles de toque em orientação horizontal e suporte a controle. Música, volume, movimentos reduzidos e animações breves ficam nas configurações. O ritmo normal é o padrão.

## Nesta entrega

- Enfermaria usa o PNG final aprovado, sem redesenho, cama extra ou lençol sobreposto. Cama, cadeira, monitor e porta têm coordenadas próprias; poses de repouso preservam a aparência selecionada.
- Salão, laboratório e wallpaper aprovados foram preservados. Portas têm destinos próprios, abertura sincronizada com colisões e aproximação alinhada. Escoltas percorrem rotas físicas.
- Cinco cabelos e cinco roupas por protagonista, cores, tons de pele e bolsas. O nome é escolhido dentro da história; o Z-Link aparece somente depois da entrega.
- Cada holograma é apresentado uma vez. A primeira crise mantém o protagonista sob controle do jogador; a derrota ocorre ainda em forma Zimon. A reversão acontece no laboratório, antes do segundo sonho com as mesmas duas silhuetas.
- Combate com piso azul liso, dois círculos diagonais, apoio das patas centralizado, HUD azul-marinho/dourada e pastas Batalha, Bolsa, Zimons e Sair. Mensagens são transitórias; o histórico fica acessível sem painel narrativo permanente à direita.
- Golpes físicos e elementais preservados; sem Defender. As duas técnicas iniciais estão disponíveis no nível 5; outra técnica é aprendida no nível 8, com aviso. HP/MP e parâmetros crescem por nível e são recuperados depois dos duelos.
- Nina/Caio entram e deixam a arena; o receio do protagonista é conversado em particular com Lira. Protagonista e adversário caminham para os duelos e saem depois. Vitória ou derrota contra Nico encerram o trecho.
- Menu Esc, bolsa com slots, Zimondex com silhuetas próprias e estágios 1/2/3, oito elementos, missões e minimapa circular com marcadores e zoom.

Consulte `PROBLEMAS_CONHECIDOS.md` para os limites desta versão. A sessão reinicia ao recarregar a página; persistência online está fora deste trecho.

## Código e testes

`src/`: código; `assets/`: recursos e originais preservados; `tests/`: testes; `tools/`: servidor e empacotamento. Os três PNGs finais estão em `assets/world/approved-final/`. O ZIP inclui `INTEGRIDADE.sha256` para conferir os arquivos.

Para desenvolvimento, instale as dependências com `npm ci`. Execute `npm run check`, `npm test` e `npm run test:e2e`. O Playwright precisa de Chromium (`npx playwright install chromium`, ou `CHROMIUM_PATH` para uma instalação existente).

A suíte atual está em `tests/browser-v11/`. `final-playthrough.spec.js` percorre as seis combinações de protagonista/inicial e cobre vitória e derrota no ginásio. Os testes mais antigos permanecem como histórico. `npm run package` gera o ZIP jogável na pasta acima do projeto e verifica sua integridade.
