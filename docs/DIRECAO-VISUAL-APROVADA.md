# ZIMONS — direção visual e feedback vigente

Status: referências recuperadas e examinadas. Este documento preserva a direção solicitada; as imagens conceituais não são evidência de jogo. A implementação v0.8, seus testes e limites estão descritos no README e em `VALIDACAO.md`. A nova lore foi recebida e lida integralmente. A análise e o roteiro adaptado estão em
`lore/ADAPTACAO-LORE-ATUALIZADA.md`.

## Referências fornecidas pelo usuário

Base: https://raw.githubusercontent.com/Fridjofr/modulo_git/10594a57e27cf99d507f30a45953bd291416921a/previews/v05/

1. `01-mundo-hud.png`: proporções do cenário, detalhes e HUD de exploração.
2. `02-criacao-personagem.png`: seleção visual de cabelo/roupa, cores separadas e vistas.
3. `03-cortes-roupas.png`: cinco silhuetas de cabelo e cinco modelos de roupa para cada protagonista.
4. `04-historia-laboratorio.png`: encenação, entrega do Z-Link e crise marcante.
5. `05-transformacao-ovo.png`: ativação, fluxo, casulo, rachaduras, emergência e retorno.
6. `06-combate-diagonal.png`: composição da arena, molduras azuis/douradas, retratos, HP, nomes, níveis e elementos.
7. `07-bolsa-menu.png`: categorias, grade de slots, quantidades, seleção e descrição do item.
8. `08-zimondex-missoes.png`: catálogo, ficha e evolução; usar apenas a parte da Zimondex, sem missões e menus extras nessa tela.
9. `09-ataques-movimento.png`: storyboard de preparação, impulso, contato e recuperação; caminhada em quatro direções e Lira em repouso.
10. `10-tela-entrada.png`: wallpaper e apresentação do título ZIMONS.

As pranchas são referências visuais, com poses e composição conceituais. As
capturas do jogo atual não equivalem ao acabamento dessas referências.

## Lira e combate

- Fixar Verdrax, elemento Planta, como vínculo da Lira. A escolha deixa de variar
  automaticamente para oferecer vantagem a todos os iniciais. Manter a derrota
  real do protagonista e a transformação parcial no confronto de contenção.
- Criar sprites próprios da Lira com braços derivados da Forma Ascendida do
  Verdrax original: anatomia, casca, folhas, mãos/garras e articulações legíveis.
  Preservar rosto, cabelo, roupa e identidade humana. O efeito verde atual foi
  rejeitado como representação dessa anatomia.
- Planejar repouso, transição, guarda, ataque e recuperação desses braços;
  conferir encaixe e escala em cada pose, sem cobrir a personagem com brilho.
- Criaturas precisam de quadros próprios de ataque em resolução adequada à
  apresentação. O usuário rejeitou a aparência borrada/ampliada e o movimento
  limitado do desenho inteiro. Preservar designs e estágios aprovados.
- Seguir a composição e o HUD da referência 06, aceitando uma apresentação mais
  lateral se favorecer as poses. Conferir alturas, chão, sombras e contato.
- Seguir a referência 09: Impacto com agachamento/preparação, impulso, contato e
  retorno (referência: 2,4 s); Garras vulcânicas com concentração nas patas, giro,
  corte em arco, dissipação e recuperação (referência: 3,2 s).
- HP reage ao contato. Nome do humano, nível e elemento continuam visíveis;
  técnicas mostram seu tipo e vantagem/desvantagem com ícone e seta.
- Possessão/perda de controle: olhos vermelhos, mudança de postura e reação de
  Lira; sequência mais lenta, com tempo para observar. A lore atualizada confirma
  a possessão como perda de controle para os instintos da essência; a causa da
  resposta incomum e a identidade da presença continuam desconhecidas.
- Casulo: manter as etapas legíveis da referência 05 e o retorno ao humano.

## Menu e identidade

- Preservar o menu lateral atual, aprovado, com personagem, nível e local.
- Colocar Zimondex como primeira opção; conservar o bloqueio narrativo antes
  da entrega do dispositivo.
- Usar “Missões” no lugar de “Missões e anotações”. Manter Bolsa, Mapa e Configurações.
- Proposta de nome para “Elementos”: “Afinidades elementais”, descrevendo a
  consulta de propriedades, vantagens e resistências.
- O nome do jogo é **ZIMONS**. “Academia Zimons” identifica o local e pode
  aparecer no contexto do cenário, sem funcionar como marca global do jogo.
- Zimondex deve seguir catálogo/ficha/linha evolutiva da referência 08, com
  silhuetas e estados desconhecido/avistado/alma vinculada, em tela dedicada.
- Personalização segue as referências 02/03, com cortes e modelos visivelmente
  diferentes e consistentes nas quatro direções. As opções atuais ainda exigem
  revisão de desenho, encaixe e correspondência entre nome e aparência.
- Tela de entrada segue a direção da referência 10, usando o título ZIMONS.

## Critério de revisão

Validar artes e quadros no tamanho real de exibição, depois animações completas
em velocidade normal e só então o percurso jogável. Mostrar capturas/gravações
do jogo identificadas como tal. Rever diálogos e sequência narrativa conforme
`lore/ADAPTACAO-LORE-ATUALIZADA.md`, preservando as perguntas ainda sem resposta.
