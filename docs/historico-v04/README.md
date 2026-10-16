# ZIMONS — Academia · v0.4.0

RPG de transformação que continua o projeto e as artes fornecidos. Exploração top-down em pixel art 2D; batalhas por turnos com modelos 3D leves e efeitos em sprites. O próprio humano se transforma: há um único corpo de cada lado da luta.

## Executar

Requer **Node.js 20 ou superior**. Extraia o ZIP, abra o terminal dentro de `zimons-academia` e execute:

```sh
npm start
```

Abra **http://localhost:4173**. Encerre com `Ctrl+C`. **Não precisa instalar pacotes para jogar.** Three.js, fontes, cenários, sprites e código já estão no pacote; não há CDN, API de jogo ou build obrigatório. Também funciona com `python3 -m http.server 4173` ou hospedagem estática. Abrir o HTML por `file://` não funciona com os módulos e metadados.

Para outra porta, Linux/macOS: `PORT=4180 npm start`; PowerShell: `$env:PORT=4180; npm start`. No celular, prefira a orientação horizontal; existem controles de toque.

## A missão

1. Escolha **Nova jornada**, personalize e inicie. O cabelo pode ser original, curto ou com faixa; cor da bolsa é uma opção independente.
2. Atravesse a ponte e converse com **Lira**, junto ao símbolo da praça. Nico, Caio e Rui passeiam; os alunos próximos param e viram para você.
3. Entre no laboratório pela porta ao norte, use **E** no núcleo e acerte três pulsos cianos. Erros não apagam os acertos.
4. Receba o Z-Link e escolha sua primeira forma. **As três formas ficam disponíveis**, cada uma inicialmente no nível 5 e com EXP própria.
5. Volte à praça e pressione **T** para transformar seu corpo; repita para retornar ao humano.
6. Procure Lira no laboratório e aceite o treino. Há uma provocação, um gesto no relógio e uma transformação de aproximadamente quatro segundos. **Pular animação** ou reduzir movimentos encurta a preparação. Ela não gasta turno, HP nem energia.
7. Vença o treino para concluir a missão. A partir daí, os cinco alunos oferecem duelos na praça, com falas e adversários próprios.

## Pastas do combate

A tela inicial oferece **Batalha, Bolsa, Troca e Sair**. Abrir uma pasta mostra apenas seu conteúdo; **Voltar** retorna aos comandos. As barras identificam os Zimons, o nível e o elemento com um símbolo. Técnicas mostram tipagem e seta de vantagem/resistência contra a forma adversária atual.

- **Batalha:** no nível 5 há apenas um golpe ofensivo, Impacto. Ele é físico, neutro e recupera 6 EN. A técnica elemental é aprendida no **nível 6** e custa 14 EN; a Primal, no **nível 8**, custa 30 EN. Defender é uma ação de suporte disponível desde o começo: recupera 22 EN e reduz o próximo impacto.
- **Bolsa:** tônico restaura até 40 HP e gasta um turno. O botão fica indisponível em HP cheio ou sem estoque.
- **Troca:** alterna o corpo entre Pyron, Marivon e Verdrax. Gasta um turno, preserva energia/status e conserva a proporção de HP, arredondada para baixo; alternar formas não oferece cura gratuita. O nível e os golpes passam a ser os da forma escolhida. Retornar ao humano também usa um turno após a abertura.
- **Sair:** pede confirmação e volta ao ponto de origem do duelo, sem recompensa. Itens utilizados permanecem consumidos.

A arena segue o local: **laboratório em lutas internas, praça em duelos externos**. Ataques têm preparação, movimento de patas/corpo, projéteis ou cortes, impacto e dano. A barra de vida acompanha o impacto. Sem WebGL 2, o jogo mantém uma apresentação 2D compatível; isso foi testado separadamente.

## Nível, EXP e técnicas

A forma ativa ao vencer recebe EXP. O primeiro sucesso contra Lira ou contra cada aluno concede **80 EXP e dois tônicos**; revanche concede **25 EXP**, sem repetir os tônicos extras. A primeira passagem do nível 5 para 6 exige 80 EXP; depois, a exigência cresce 30 por nível. As outras formas mantêm seus níveis e EXP.

Pyron queima, Marivon enfraquece e Verdrax enraíza na técnica Primal. Esses efeitos duram dois turnos do alvo. Na derrota não há perda permanente: a tentativa pode ser reiniciada e o estoque é recuperado para pelo menos três tônicos.

| Controle              | Ação                                                                         |
| --------------------- | ---------------------------------------------------------------------------- |
| WASD / setas          | Andar em quatro direções, sem diagonal                                       |
| E                     | Conversar, entrar/sair, avançar diálogo, acertar pulso                       |
| T                     | Transformar/retornar ao humano na exploração                                 |
| I                     | Bolsa na exploração                                                          |
| Esc                   | Menu/fechar na exploração; voltar de uma pasta ou abrir Sair no menu da luta |
| 1                     | Abrir Batalha no menu de comandos                                            |
| 1–4 dentro de Batalha | Golpes aprendidos e defesa                                                   |
| B / Z na luta         | Bolsa / Troca                                                                |
| Clique/toque          | Personalização, escolhas e comandos                                          |

## Música e preferências

Uma pequena composição original em oito compassos é sintetizada localmente com Web Audio. Começa depois do primeiro clique/tecla, conforme as regras de áudio do navegador. O botão **Música ligada/desligada** silencia; o menu da exploração tem volume e redução de movimentos. A preferência fica neste navegador. O áudio pausa quando a página fica oculta.

As fontes locais são **Sora** e **Rajdhani**. Suas licenças OFL estão em `assets/fonts/`; a licença MIT do Three.js está em `vendor/`.

## Salvamento

A chave continua sendo `zimons.academia.v2`, para restaurar partidas anteriores. O formato atual é a versão 3. Saves válidos antigos migram: mantêm nome, aparência, missão, itens e EXP acumulada, com as três formas no novo nível inicial mínimo 5. A cor antiga de cabelo/roupas continua igual; a opção de penteado 1 agora corresponde ao corte curto.

O progresso fica no `localStorage` deste navegador/origem, com salvamento periódico e nas transições. Não há conta nem sincronização entre aparelhos. Uma batalha intermediária não é serializada: recarregar volta à exploração; itens consumidos já foram salvos. Nova jornada pede confirmação antes de substituir o save. Posições incompatíveis com o mapa são recuperadas na ponte ou no laboratório.

## Código e arte

```text
src/model.js       Estado, migração, níveis, golpes, troca, colisões e combate
src/game.js        Cenas, missão, diálogos, pastas e turnos
src/npcs.js        Alunos, patrulhas, orientação e dados dos duelos
src/assets.js      Composição por materiais dos sprites da exploração
src/render.js      Cenários 2D e composição do combate
src/models3d.js    Malhas e articulações dos três Zimons e humanos da introdução
src/battle3d.js    Câmera, luzes, cache de modelos e animação WebGL
src/effects.js     Sprites de golpes, rastros, energia e transformação
src/audio.js       Tema sintetizado, sinais e preferências de som
src/types.js       Símbolos vetoriais das tipagens
styles.css        Estrutura original da interface
refinements.css   Refinamentos da Academia e entrada da v0.3
convergence.css   Fontes, HUD e pastas da v0.4
assets/           Todos os originais, sprites preparados, fontes e cenários
vendor/           Three.js 0.180.0 e licença, para uso local sem instalação
original/         HTML, instruções e metadados recebidos, preservados
```

Os **11 arquivos recebidos continuam íntegros**, com hashes em `docs/ASSETS_ORIGINAIS.json`. As folhas com nomes invertidos foram preservadas: `lira_sheet.png` contém o explorador e `male_sheet.png` contém Lira. Cenários das entregas anteriores também permanecem no pacote.

Os sprites de cabelo curto são derivações dos designs aprovados e têm animação nas quatro direções. Roupas, pele, cabelo e acessórios são tratados por materiais pré-calculados. A faixa e as bolsas são camadas próprias. O runtime não apaga partes do corpo para trocar acessórios.

Os modelos de batalha são **primeiras versões 3D estilizadas, construídas em geometria e materiais no código**, baseadas nas características dos três iniciais. Não são PNGs em planos nem modelos finais esculpidos/rigados em Blender. Possuem articulações independentes para patas, cabeça, cauda e apêndices. Os sprites originais continuam usados na exploração, nos retratos e na seleção. Os cenários e folhas adicionais foram criados com geração/edição de imagem seguindo os recursos aprovados.

## Testar e preparar assets

```sh
npm test
npm run check
```

Para Playwright, com Chromium:

```sh
npm ci
npx playwright install chromium
npm run test:e2e
```

Chromium em `/usr/bin/chromium` é usado automaticamente. Outro caminho pode ser indicado por `CHROMIUM_PATH`. A suíte usa SwiftShader para conferir modelos 3D no ambiente headless. Os testes iniciam ou reutilizam o servidor da porta 4173. `?debug=1` habilita apenas diagnóstico de leitura, sem teletransporte ou atalhos de missão.

Após editar as folhas mestras e seus retângulos, mantenha `npm start` em outro terminal e execute `npm run sprites`. Para atualizar o Three.js incluído, use uma versão explícita, copie seus dois módulos de `node_modules/three/build/` para `vendor/`, preserve a licença e repita os testes. Isso não é necessário para jogar.

```sh
npm run package
```

Requer Python 3. Gera `../zimons-academia.zip`, com fontes, código, arte, testes, documentação e `INTEGRIDADE.sha256`. Exclui dependências instaladas, caches, relatórios temporários e capturas de versões antigas; inclui as capturas atuais com prefixo `v04-`. Veja `docs/VALIDACAO.md`.

## Alcance

Esta entrega cobre a Academia e os duelos locais. Os oito elementos têm tabela completa e Cristal mantém apenas suas cinco vantagens ofensivas de 1,25×, sem resistência automática. Evoluções 2/3, campanha posterior, novas regiões e técnicas dos demais elementos ainda não estão implementadas; suas referências existentes foram preservadas. Não há 3D na exploração. Firefox, Safari/WebKit e aparelhos físicos não foram validados nesta entrega.
