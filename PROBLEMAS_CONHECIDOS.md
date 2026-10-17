# Limites da versão 0.13.0

- As correções adicionais de travessia de portas foram adiadas por orientação do usuário. Ainda pode ocorrer sobreposição parcial do personagem com a moldura durante algumas entradas e saídas, especialmente na enfermaria.
- A nova folha oficial fornece uma aparência por protagonista. As categorias de personalização foram preservadas, mas outras roupas, cortes, cores e acessórios estão indisponíveis até existir arte compatível; nenhuma peça antiga é utilizada para preencher essas opções.
- A folha original possui fundo preto e alguns contornos de cabelo adjacentes encostados. Os recortes transparentes seguem os contornos disponíveis, sem reconstruir partes ocultas. O original está preservado em `assets/characters/official/source.png`.
- O trecho jogável termina após o duelo com Nico. As formas evoluídas têm registros na Zimondex, mas a evolução para essas formas ainda não é jogável.
- As poses de repouso e de colapso usam articulação dos sprites aprovados. O encaixe foi revisto, mas essas animações ainda podem receber refinamento artístico; não são modelos 3D nem novos conjuntos completos de sprites deitados.
- A sessão não é salva ao fechar/recarregar a página. Isso segue o escopo atual de teste local; não há contas nem servidor online nesta entrega.
- A inicialização do pacote extraído é verificada com Node.js e Chromium no ambiente de desenvolvimento. Não houve execução nativa de Windows nesta sessão; o iniciador usa comandos padrão de Windows e requer Node.js 20+.
- A interface de toque é validada em orientação horizontal. Telas muito estreitas em retrato não são a configuração de jogo suportada.
