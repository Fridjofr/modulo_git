# Limites da versão 0.12.0

- O trecho jogável termina após o duelo com Nico. As formas evoluídas têm registros na Zimondex, mas a evolução para essas formas ainda não é jogável.
- As poses de repouso e de colapso usam articulação dos sprites aprovados. O encaixe foi revisto, mas essas animações ainda podem receber refinamento artístico; não são modelos 3D nem novos conjuntos completos de sprites deitados.
- A sessão não é salva ao fechar/recarregar a página. Isso segue o escopo atual de teste local; não há contas nem servidor online nesta entrega.
- A inicialização do pacote extraído é verificada com Node.js e Chromium no ambiente de desenvolvimento. Não houve execução nativa de Windows nesta sessão; o iniciador usa comandos padrão de Windows e requer Node.js 20+.
- A interface de toque é validada em orientação horizontal. Telas muito estreitas em retrato não são a configuração de jogo suportada.
