# Adaptação jogável — Livro I, O Despertar

> Histórico da implementação anterior. O autor enviou uma lore atualizada;
> a revisão vigente está em [ADAPTACAO-LORE-ATUALIZADA.md](ADAPTACAO-LORE-ATUALIZADA.md).
> As decisões abaixo sobre nome provisório, possessão ambígua e liberação de
> prática nas áreas públicas não devem ser reutilizadas como cânone atual.

Fonte: manuscrito do Livro I fornecido pelo autor. O original está preservado como referência no ambiente de trabalho; a distribuição do jogo contém a adaptação. O roteiro jogável está em `src/story.js`: 24 conjuntos de diálogo, 150 falas (cerca de 2.130 palavras), além de três conversas sociais. Os números são um retrato da primeira implementação, não uma meta de extensão.

## Decisões narrativas

- A abertura passa da criação à floresta, não diretamente à Academia. Riacho e pedra são os passos da exploração inicial, ligados pela ponte. Tronco e lagoa são observações opcionais; a estrada fica ao leste.
- O prólogo histórico extenso fica para futuras aulas, arquivos e exploração. Não há uma revelação sobre a origem do protagonista ou o desaparecimento dos corpos dos Zimons nesta versão.
- A presença é ambígua. “Possessão” não é apresentada como diagnóstico confirmado. O fenômeno sem leitura de Z-Link permanece uma pergunta, inclusive para Lira.
- Nome e gênero acompanham a criação. O nome é registrado como modo de chamar o protagonista, sem transformar a amnésia em conhecimento de uma biografia que ainda não existe.
- A aparência aprovada de Lira prevalece sobre a descrição de cabelos claros do manuscrito. Ela é uma única personagem: cabelos azul-escuros e jaleco branco, sem cópias em outros mapas.
- O Z-Link entregue é um modelo de treinamento. A primeira essência é uma escolha entre compatíveis, e só uma forma é vinculada. Referências projetadas não concedem formas nem leituras de campo na Zimondex.
- Os três pulsos anteriores foram reaproveitados como leitura respiratória. Erros apenas permitem tentar novamente. A instabilidade é um acontecimento narrativo e não culpa do jogador por uma escolha ou erro no minigame.
- A crise acontece no laboratório. Lira conserva seu corpo humano e manifesta apenas os braços, conforme o manuscrito e a confirmação do autor. Não há transformação completa dela nessa cena.
- O jogador controla o próprio protagonista na contenção. Seus comandos são ações instintivas; não ocorre uma troca de identidade para Lira. Ela possui desvantagem elemental, mas nível e precisão superiores. O HP do protagonista chega a zero, o vínculo se desfaz e ele desperta na enfermaria. Não há fuga, XP de vitória ou revanche.
- O segundo despertar mantém as perguntas sobre ferir alguém, os limites do conhecimento de Lira e o acordo de confiança. Medo e determinação recebem respostas diferentes, sem transformar uma escolha de fala em punição.
- A amnésia não é resolvida com o fim da batalha. A prática posterior é uma nova etapa com conexão limitada e acompanhamento, não uma declaração de cura definitiva.
- A transformação livre só é liberada depois de uma transformação consciente, retorno voluntário, recuperação e explicação de Lira. Desse modo, a proibição anterior não contradiz o comando T disponível no mapa.
- A forma inicial passa a se chamar Primordial, seguindo o manuscrito. Sincronizada e Ascendida aparecem em projeções, sem desbloqueio de evolução. Usam as folhas existentes; revisão de anatomia/modelagem é outra etapa.
- A casa da família e a mãe biológica foram adiadas: reconhecer imediatamente a família enfraqueceria o mistério. Mara é uma nova responsável pelo alojamento, não a mãe disfarçada nem uma solução para a identidade.
- Nico, Aya e Mara criam relações iniciais. Duas conversas diferentes convidam à exploração dos jardins, onde a presença retorna. Relatar a ocorrência a Lira conclui o capítulo; depois, ficam liberados os treinos e diálogos de exploração.

## Estados e critérios

`awakening → forest → arrival → medical → choose → crisis → recovery → practice → return → healing → orientation → report → complete`

- Um estado de história só avança com sua ação/conversa correspondente. Fechar uma janela não completa a missão.
- Durante falas, transições, transformações e movimentos encenados, o controle de exploração não empurra atores ou dispara interações duplicadas.
- A única alma inicial, aparência humana, recebimento do dispositivo, licença de prática e Zimondex são estados separados.
- Vida/energia de exploração são recuperadas no aparelho e carregadas para os duelos seguintes; não se ganha cura alternando formas.
- Falas e nomes do jogador usam `textContent`; texto personalizado não é interpretado como HTML.
- Textos nunca têm avanço automático. Há revelação gradual, conclusão manual e opção de redução de efeitos/texto completo.
- O mundo permanece top-down e o movimento usa apenas as setas. NPCs comuns têm percursos ortogonais com pausas; importantes não recebem patrulha.

## Primeira entrega deste arco

Floresta maior com câmera móvel, ponte e caminhos opcionais, jardins exploráveis e enfermaria, passagem encenada pela Academia, entrega, compatibilidade, crise, contenção, recuperação, projeção evolutiva, prática, aparelho, Zimondex, conversas sociais e gancho de encerramento. As capturas em `docs/screenshots/v06-*` são do jogo executado, não das pranchas conceituais.

Ainda não fazem parte desta implementação: origem da presença, recuperação das memórias, mãe/família confirmada, alojamento interior acessível, captura de novas almas, evolução jogável, modelagem final com a fidelidade das pranchas, cinco cortes novos por gênero e servidor MMORPG. Não há promessa de que essas partes estejam prontas.

Os desafios de alunos são únicos por sessão. Os jardins e a missão de leitura da água são acréscimos de exploração; não explicam a presença nem criam uma revelação sobre a origem do protagonista.
