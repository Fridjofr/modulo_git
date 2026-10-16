# Validação da entrega 0.12.0

- `npm run check`: sintaxe aprovada.
- `npm test`: **60 testes aprovados**, sem falhas ou testes ignorados.
- Navegador: **18 testes aprovados** — 11 de interface/assets, seis percursos completos (masculino/feminino × Pyron/Marivon/Verdrax) e um percurso adicional de exibição livre, saída e portas bloqueadas.
- O percurso feminino/Pyron foi exercitado com animações normais. Os outros percursos também verificaram a opção de animações breves; não usaram teletransporte nem alteração direta da progressão. A opção de pular caminhada foi exercitada separadamente, preservando rotas e colisões.
- Os três percursos femininos verificaram vitória contra Nico; os três masculinos, derrota. Todos concluíram o trecho, recuperaram HP/MP e verificaram que sair do ginásio encerra a transformação.
- Resoluções de interface: 1366×768, 1920×1080 e 800×450 horizontal. Verificadas pastas de combate, personalização, missão recolhida, minimapa, menus e tratamento de asset ausente.
- Verificados apresentação única dos hologramas, transformação parcial de Lira, derrotado ainda transformado, reversão no laboratório e repetição das mesmas silhuetas dos pais.
- Verificados entrada e saída físicas dos alunos da arena, conversa privada com Lira, ausência de sobreposição e encerramento de exibição sem recompensa indevida.
- Hashes dos três PNGs finais aprovados preservados; o sprite sentado de Lira continua com os mesmos pixels e escala, recalibrado para o assento novo.
- ZIP extraído em uma pasta com espaços, CRC e SHA-256 dos arquivos conferidos. Inicialização, criador, primeiras cenas e exploração funcionaram sem `node_modules`, arquivos ausentes ou erros de JavaScript.
- Amostra de exploração do pacote extraído em Chromium: aproximadamente **60 FPS**, p95 de 16,8 ms, sem intervalos maiores que 50 ms na amostra. Isso descreve o ambiente e a amostra medidos; não é uma garantia para todo hardware.

Os logs estão em `docs/validation-v012/`. Testes técnicos não são aprovação artística universal; os limites conhecidos estão em `PROBLEMAS_CONHECIDOS.md`.

O pacote foi validado em Node.js/Chromium no ambiente de desenvolvimento. A execução nativa do iniciador em Windows não foi realizada nesta sessão.
