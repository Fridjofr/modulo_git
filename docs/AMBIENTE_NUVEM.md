# Ambiente de desenvolvimento

O jogo está em `/workspace/zimons`; o checkout selecionado, `/workspace/modulo_git`, foi preservado. Continue usando esses diretórios, sem criar worktrees para a configuração.

Node.js 20 ou superior executa o jogo sem instalação: `npm start` serve todos os módulos e assets locais na porta 4173. O ambiente desta entrega utiliza Node.js 24.19.0.

Para desenvolver e testar, na pasta do jogo:

```sh
npm ci
npm run check
npm test
npm run test:e2e
```

Os testes de navegador reutilizam `/usr/bin/chromium`, quando disponível, ou o executável informado por `CHROMIUM_PATH`. Na ausência de navegador, a instalação dele é necessária para os testes de interface; a execução do jogo e os testes de regras continuam independentes. Nenhuma credencial ou variável secreta é necessária.

A inicialização deve confirmar o HTML do jogo e o carregamento dos assets, além da porta aberta. Reutilize um servidor existente da aplicação; só encerre processos iniciados para esta tarefa. O roteiro de execução e teste também está no README.

A suíte atual está em tests/browser-v11. Ela percorre o capítulo e verifica as três essências iniciais e verifica personalização, HUD, toque, carregamento e animações normais. Os diagnósticos da URL ?debug=1 são somente leitura: não teleportam nem alteram missões. O visual ativo usa Canvas 2D e sprites; os módulos históricos de 3D permanecem preservados, sem serem necessários à execução.

O install_script e o start_skill ficam salvos como rascunho de configuração; salvar não publica o ambiente nem garante que processos ativos sobrevivam a uma nova máquina. A inicialização deve sempre conferir o servidor e reiniciá-lo quando necessário.
