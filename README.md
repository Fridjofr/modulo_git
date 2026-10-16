# ZIMONS

**Revisão Lote 01 · Marco A — aguardando avaliação visual.** Base v0.11.0. Esta revisão não encerra a etapa nem valida os marcos B, C e D. Consulte [diagnóstico, evidências e pendências](docs/review/lote01/marco-a/RELATORIO.md).

RPG 2D de transformação, com exploração superior, batalhas por turnos e adaptação do **roteiro narrativo 4.1, Capítulo 1 — O Despertar**. O humano é o próprio corpo transformado. O jogo usa sprites animados, não modelos 3D.

## Executar

Requer **Node.js 20 ou superior**. Extraia o ZIP inteiro, abra o terminal na pasta extraída que contém `package.json` e execute:

```sh
npm start
```

Abra **http://localhost:4173**. Encerre com `Ctrl+C`. No Windows também pode abrir `INICIAR.bat`. **Não precisa instalar dependências para jogar.** Os assets, as fontes e os módulos estão incluídos. Não abra `index.html` diretamente: os módulos precisam do servidor.

Outra porta: `PORT=4180 npm start` no Linux/macOS; no PowerShell, `$env:PORT=4180` e depois `npm start`. Alternativa sem Node: `python3 -m http.server 4173` nesta pasta. Celular: orientação horizontal e controles de toque.

## Percurso desta versão

1. Aparência antes do início: cinco cortes de cabelo e cinco modelos de roupa por protagonista, cores independentes, bolsas e quatro direções. O nome é confirmado na conversa com Lira.
2. Sonho com silhuetas de duas pessoas lado a lado, despertar com abertura gradual dos olhos e floresta já danificada. Lira encontra o protagonista e conduz até a Academia, pela única floresta e pelo pátio.
3. O corredor tem portas próprias para enfermaria, laboratório e ginásio. Não existe seletor de destinos num único portal.
4. Avaliação médica, explicação da Sincro artificial, entrega do Z-Link de treinamento, calibração e escolha de **uma** essência: Pyron, Marivon ou Verdrax.
5. Respiração guiada, aura de transformação, olhos vermelhos e possessão. O protagonista avança e danifica duas bancadas no laboratório. Lira desvia e manifesta apenas os antebraços de Verdrax Ascendido.
6. Na contenção, você controla o protagonista. Lira tenta contato sem atacar no primeiro turno. A derrota leva à queda, retorno humano ainda deitado, sonho na névoa e socorro.
7. Recuperação na enfermaria. Lira retém o Z-Link durante a noite: o protagonista permanece deitado, conversa e dorme na própria cena. No dia seguinte, receba o dispositivo recalibrado no laboratório e pratique transformar, caminhar e retornar com T.
8. Apresentação da Zimondex, visita ao ginásio, encontro com Nina, Caio e Nico, demonstração e primeira batalha contra Nico. Vitória e derrota permitem continuar.
9. O trecho termina após o duelo com Nico, no ginásio. As exibições ficam disponíveis; o bônus da primeira vitória não se repete. Depois de cada duelo, os dois participantes voltam à forma humana e HP/MP são recuperados.
10. Encerrada a história, há **uma única Lira, fixa no ginásio**. A transformação exige supervisão no mesmo local. Ao sair transformado, o retorno humano termina antes da mudança de mapa.

As falas são avançadas pelo jogador. **Pular etapa** encerra somente a conversa, caminhada ou efeito atual; não pula o capítulo. O ritmo normal usa transformação de 5,2 s, retorno de 3 s e golpes de 1,65–2,3 s. O botão de batalha alterna **1× → 2× → 3× → 1×**, incluindo movimentos, impactos e barras de vida. Animações breves é uma opção separada, desativada por padrão.

## Controles

| Entrada | Ação |
|---|---|
| Setas | Andar / navegar nos menus |
| E, Enter ou Espaço | Interagir / revelar e avançar conversa |
| T | Iniciar ou encerrar Sincro sob supervisão |
| Esc | Menu / voltar |
| R / Pular etapa | Encerrar somente a etapa narrativa atual |
| + e − no minimapa | Aproximar / afastar |
| V / 1× no combate | Alternar a velocidade, de 1× até 3× |
| Controle | Direcional/analógico, A confirmar, B voltar; botões conforme indicação de tela |

O menu reúne Zimondex, Missões, Bolsa, Mapa, afinidades e Configurações. A bolsa tem slots. A Zimondex mostra cada estágio em sua própria entrada 1, 2 ou 3; as silhuetas vêm das artes das respectivas formas. Apenas a essência escolhida está vinculada ao protagonista.

## Mapas, combate e arquivos

A rota principal tem seis locais: floresta, praça, átrio, enfermaria, laboratório e ginásio. Os cenários usam as artes aprovadas e os novos fundos em `assets/world/v11/`, com colisões próprias. Dois mapas históricos adicionais permanecem preservados fora desse percurso. Para inspecionar as peças e colisões reais, abra `/tools/tileset.html` com o servidor ligado. A floresta tem uma clareira e trilha orgânica; a Academia usa interiores com funções distintas. As marcas de destruição do laboratório persistem.

O fundo do combate usa o mapa onde ele começou. Impacto avança em salto, toca o alvo e retorna. Bolhas sai da boca e estoura no alvo; Lança-chamas é um jato contínuo; Lâminas de folhas lança folhas cortantes. Os sprites originais dos Zimons e os braços específicos da Lira estão em uso. As duas técnicas iniciais são física e elemental; habilidades posteriores são aprendidas por nível, com aviso. Não há comando Defender.

Código em `src/`, assets em `assets/`, ferramentas em `tools/`, testes em `tests/`. Os onze arquivos recebidos originalmente continuam preservados com hashes em `docs/ASSETS_ORIGINAIS.json`. Capturas desta versão em `docs/screenshots/v11/`. O pacote inclui `INTEGRIDADE.sha256`.

Esta entrega continua sendo um cliente local para testar o capítulo; servidor MMORPG, contas e persistência online ainda não estão implementados. Não há interface de save local. Recarregar a página reinicia a sessão.

## Verificar e desenvolver

Jogar requer só Node; os comandos de testes usam as dependências de desenvolvimento:

```sh
npm ci
npm run check
npm test
npx playwright install chromium
npm run test:e2e
```

Se Chromium já estiver instalado, defina `CHROMIUM_PATH` quando necessário. O runner usa uma instância local na porta 4173 e executa um navegador por vez. Os testes antigos em `tests/browser/` documentam versões anteriores; a suíte atual está em `tests/browser-v11/`.

`npm run package` gera o ZIP na pasta acima do projeto. Consulte `docs/VALIDACAO.md` para os resultados da entrega e `docs/ARQUITETURA.md` para a organização.
