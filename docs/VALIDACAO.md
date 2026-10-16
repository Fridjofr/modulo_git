# Validação — ZIMONS v0.11.0

> Registro histórico da validação inicial v0.11. Para os testes, capturas e pendências da revisão atual, consulte [Marco A · revisão 4](review/lote01/marco-a-r4/RELATORIO.md).

Ambiente: Node.js 24.19.0, Chromium do sistema, Playwright 1.64.0; telas 1440×900 e toque 800×450. Node.js 20 ou superior executa o servidor incluído, sem dependências de runtime a instalar.

## Verificações

- `npm run check`: sintaxe dos 25 módulos aprovada.
- `npm test`: 38 testes aprovados, sem testes ignorados. Incluem os 64 confrontos elementais, progressão, MP por nível, contenção, supervisão, recompensas, navegação e união do piso com as soleiras.
- A crise é amostrada em 1.001 fases para verificar distância entre personagens e passagem fora dos sólidos. Rotas de cena são verificadas passo a passo.
- O capítulo com Pyron foi percorrido no navegador em ritmo normal: floresta única, praça, escolta automática, avaliação e descanso, laboratório, escolha de uma essência, possessão, derrota controlando o protagonista, recuperação durante a noite, recalibração, prática, demonstração, duelo com Nico e encerramento no ginásio.
- O percurso também foi repetido usando o comando real de pular somente caminhadas de cena. As transformações e ataques das capturas mantêm a velocidade normal. O diagnóstico `?debug=1` é somente leitura; os testes não usam atalhos internos de teleporte nem edição de progresso.
- O teste final de capítulo verifica o ciclo de velocidade pelo atalho V e a saída do ginásio transformado: o retorno humano termina antes da troca de mapa e o Z-Link não ativa fora da supervisão.
- Marivon e Verdrax foram exercitados pela interface até o vínculo único, a técnica elemental e a derrota do protagonista. As imagens de Bolhas e Lâminas de folhas foram capturadas durante os ataques reais.
- Personalização exercitada com ambos os protagonistas, cinco cabelos, cinco roupas, três modelos inferiores, bolsas, quatro direções, quatro quadros e paletas independentes. As verificações incluem diferenças visuais, continuidade das peças e altura dos frames.
- HUD, menu Esc, bolsa com 12 slots, zoom do minimapa, toque, erro real de carregamento e enquadramento do elenco da entrada foram verificados.
- Oito cenários de navegador aprovados na revisão final, sem erros de JavaScript nem assets ausentes no percurso principal.

## Capturas e limites

`docs/screenshots/v11/` contém screenshots do cliente executando em Chromium. Não são mockups. As artes de ambiente são backgrounds integrais com colisões e animações sobrepostas; não constituem um novo atlas de tiles independentes. O inspetor `/tools/tileset.html` apresenta os mesmos cenários e suas colisões e é identificado como ferramenta de inspeção.

O combate ativo usa Canvas 2D, sprites e seis poses por ator. Os módulos históricos de 3D e as artes anteriores permanecem preservados. Não há modelos 3D ativos, backend MMORPG, contas ou persistência online. Os testes validam os comportamentos descritos; o acabamento visual continua sujeito ao feedback do autor.

Os onze arquivos originais são conferidos por SHA-256 em `docs/ASSETS_ORIGINAIS.json`. A distribuição inclui manifesto de integridade e instruções para executar. A versão entregue por download é conferida novamente após a publicação.
