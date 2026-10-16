# ZIMONS · Marco A · revisão 4

**Entrega para avaliação visual. Marco A permanece aberto; nenhum Marco B foi iniciado.** As evidências estão separadas em [EVIDENCIAS.md](EVIDENCIAS.md).

## Cenários finais integrados

Os dois arquivos enviados em `ZIMONS_Artes_Finais_Aprovadas.zip` foram extraídos byte a byte, sem edição, pintura, recorte definitivo ou geração de outra arte. Dimensões e hashes estão em [assets/world/approved-final/README.md](../../../../assets/world/approved-final/README.md). Os testes verificam os dois hashes.

O salão anterior era 1280×720, incompatível com a proporção do novo PNG 1446×1087. Mantive a proporção usando 1280×962 unidades e acompanhamento da câmera. O laboratório usa 1280×722 para o original 1670×942. O arredondamento é inferior a meio pixel; os personagens não foram esticados para compensar a geometria.

As bancadas central e direita, cilindros superiores esquerdos, cadeiras e scanner do laboratório mantêm exatamente suas posições na imagem. Os colididores foram alinhados a esses objetos; os módulos laterais inferiores do mapa antigo foram retirados da geometria. O scanner é uma plataforma no piso: permite caminhar sobre ele e inicia a calibração por interação. Não deve funcionar como uma parede.

Os danos da possessão continuam como sobreposições independentes. O PNG e o cache do laboratório normal permanecem intactos. Dois pontos de impacto da sequência foram recuados de y316 para y344 para respeitar a frente das novas bancadas/cadeiras, mantendo os tempos, poses, ataques e efeitos aprovados.

## Portas e circulação

A porta superior esquerda estava aberta dentro do PNG e não tinha folhas fechadas próprias. O renderizador agora usa as folhas de vidro da segunda porta do próprio salão, encaixadas apenas na abertura existente. A moldura, arquitetura, parede e piso permanecem os originais. A cavidade já desenhada da primeira porta fornece o fundo das outras aberturas; não é desenhado um buraco preto.

O progresso das folhas passou do renderizador para a simulação. Animação e colisão consultam o mesmo valor. A porta fechada ou parcialmente aberta bloqueia os pés; a travessia só é liberada a partir de 96% de abertura. O jogador/NPC autorizado precisa aproximar-se; a escolta não abre a porta remotamente ao começar a caminhar. Uma passagem em grupo mantém a porta aberta até o último ocupante atravessar, depois fecha antes da transição.

Os personagens caminham fisicamente pelo corredor da porta. A parede/moldura oculta o sprite conforme ele entra; somente depois da travessia ocorre a transição de ambiente. Na exploração livre, cruzar a soleira aciona a mesma passagem, evitando ficar preso atrás da parede sem conseguir interagir.

A validação encontrou uma rota antiga da saída de Lira após a prática que ainda terminava em y674, dentro da nova porta fechada do laboratório. A rota passou a usar a posição de aproximação do mapa e a sequência abrir → atravessar → fechar, compartilhada com as demais passagens.

## Enfermaria: preservar o que foi aprovado

O arquivo de Lira, a cadeira, sua posição e a transformação gráfica da pose final sentada foram preservados. A pose final é comparada pixel a pixel com a versão aprovada. A transição usa o apoio dos pés extraído das duas poses existentes, aproximação curta, alinhamento e mudança de pose com o mesmo apoio.

A animação do protagonista chegando pela lateral e deitando não foi reconstruída nem alterada. O lençol foi limitado ao retângulo/polígono real do colchão e encurtado antes da estrutura metálica frontal. O teste verifica a área alfa durante cinco momentos da animação, impedindo pixels fora do colchão.

## Arquivos alterados

- Cenários/geometria: `src/assets.js`, `src/maps.js`, `src/world.js`, `assets/world/approved-final/*`.
- Portas e caminhos: `src/doors.js`, `src/tilemap.js`, `src/render.js`, `src/story.js`, `src/game.js`, `src/scene-staging.js`.
- Encaixes: `src/clinic-layout.js`, `src/clinic-renderer.js`.
- Continuidade da revisão de combate: `src/battle-contacts.js`, `src/battle-atlas.js`, `review-a4.css`, `assets/ui/review-a4/panel-border.svg`, `index.html`, trechos de `src/game.js`. A navegação persistente possui Batalha/Bolsa/Zimons/Sair; quatro espaços de técnica, dois inicialmente ocupados; mensagens transitórias e histórico acessível. A revisão visual completa da arena continua pendente, conforme abaixo.
- Testes: `tests/approved-maps.test.mjs`, `tests/model.test.mjs`, `tests/actor-path.test.mjs`, `tests/browser-v11/{clinic-a4,chapter}.spec.js`, `tests/browser-v11/helpers.js`, `package.json`.
- Reprodução das evidências: `tools/capture-clinic-review-a4.mjs`, `tools/capture-academy-door.mjs`, `tools/capture-lab-collisions.mjs`, `tools/build-approved-maps-clips.mjs`, `tools/finalize-map-evidence.mjs`.
- Documentação, capturas, vídeos, logs e manifesto de integridade da entrega.

## Validação

Os resultados finais e os logs são listados abaixo. Os testes automatizados não substituem a aprovação visual do usuário.

- `npm run check`: sintaxe dos módulos.
- `npm test`: 46 testes unitários, incluindo hashes dos PNGs, proporção, porta fechada/parcial/aberta, autorização, travessia e fechamento, acesso aos objetos e varredura das trajetórias de cena/possessão.
- Navegador: 10 verificações de interface, personalização, criaturas, pose final de Lira e lençol. Nove passaram na primeira bateria; a verificação de recolher missão foi repetida com diretório de resultados próprio após uma colisão entre os arquivos de trace de duas execuções simultâneas.
- Percurso completo: consultar o log final antes de considerar concluído.
- Os 11 arquivos originais e outros 10 recursos/fontes aprovados permanecem inalterados: [logs/preservacao.json](logs/preservacao.json).

As primeiras tentativas de gravação identificaram problemas no próprio roteiro de captura: falta de URL base, prazo curto para carregar os assets e uma caminhada de teste direcionada para a posição ocupada por Lira. A colisão impediu corretamente essa última passagem. As evidências entregues correspondem a execuções posteriores; não foram alterados estados ou colididores para fazer a gravação passar.

## Pendências e limites

A aprovação visual do salão, laboratório, transição da cadeira e lençol continua com o usuário. Não declaro ausência universal de bugs. Os vídeos mostram os casos exercitados, em velocidade normal, sem interpolação; a gravação de página é de 25 quadros/s e não representa uma medição de FPS do jogo.

A composição completa da batalha aprovada anteriormente — piso liso e dois círculos diagonais específicos — **ainda não está reproduzida integralmente**. O fundo de batalha existente e a nova HUD não são apresentados nesta entrega como essa arena final concluída. Os PNGs agora fornecidos são apenas do salão e do laboratório normal; esta integração não redesenhou esses cenários para criar outra arena.

As animações de ataque aprovadas, a caminhada de Marivon, o wallpaper, a base dos protagonistas e o sprite de Lira foram preservados. A direção visual desses recursos não foi reaberta nesta etapa.
