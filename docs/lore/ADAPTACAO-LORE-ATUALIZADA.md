# ZIMONS — adaptação da lore atualizada

Análise concluída a partir da leitura integral do texto enviado pelo autor:
**Prólogo — O Chamado** e **Capítulo 1 — O Despertar de uma Essência**,
7.442 palavras. Este documento é a referência de revisão do roteiro. A sequência abaixo foi adaptada no código da v0.9 e percorrida em testes de navegador. Os detalhes de encenação são simplificados para o motor Canvas: diálogos, sprites, movimento e efeitos, sem cenas cinematográficas 3D.

O manuscrito integral fica fora da distribuição do jogo, preservado em
`/workspace/zimons-lore-reference/LIVRO-I-O-DESPERTAR-atualizado-2026-10-15.txt`.
SHA-256: `b9e63ad4220a17b6f7403b043d33549ee16f2d41b034298971a13614586b4eee`.

## Prioridade das referências

1. A lore atualizada orienta os acontecimentos, limites de conhecimento e ordem
   narrativa. Instruções explícitas posteriores do autor prevalecem.
2. Os designs aprovados e o feedback visual vigente orientam os personagens,
   sprites, combate e interfaces; ver `../DIRECAO-VISUAL-APROVADA.md`.
3. Elementos de exploração acrescentados ao jogo devem ser identificados como
   adaptações e não podem antecipar respostas ou contrariar o manuscrito.

## Decisões aplicadas na v0.8

| Assunto | Lore atualizada | Adaptação aplicada |
| --- | --- | --- |
| Memória | O protagonista sabe o próprio nome e reconhece o rosto; perdeu as lembranças da vida. | Usar o nome escolhido na criação como lembrança preservada. Remover a ideia de escolher um nome provisório na enfermaria. |
| Saída da floresta | Acompanhar o riacho leva à trilha, postes, cerca e estrada. | Tornar essa orientação visível no mapa. A pedra antiga pode continuar opcional, sem bloquear a saída nem ganhar função de artefato canônico. |
| Origem dos Zimons | Viveram fisicamente antes dos humanos; seus corpos desapareceram e as essências permaneceram. | Explicar isso na projeção inicial do laboratório, com diálogo e imagens legíveis. |
| Sincronia | O Z-Link estabelece Sincronia artificial entre duas consciências. Instintos podem interferir nas decisões. | Explicar a relação antes da entrega e do teste, sem tratar a essência como apenas uma aparência ou habilidade. |
| Possessão | É um risco conhecido da Sincronia, mencionado por Lira antes da avaliação. | Usar o termo em contexto; o diagnóstico do descontrole é explícito. A causa particular da crise e a ligação com a floresta continuam desconhecidas. |
| Olhos vermelhos | Sinal anormal de instabilidade crítica e perda de controle. Desaparece quando a Sincronia se desfaz. | Vincular o efeito ao estado de possessão, com máscara própria por sprite/quadro. Não recolorir os olhos de toda transformação. |
| Percepção da luta | A memória do protagonista termina antes do confronto; Lira relata os fatos depois. | Manter a luta jogável controlando o corpo do protagonista, com comandos instintivos, sem falas ou escolhas conscientes que ele depois lembraria. |
| Sonho após o nocaute | Névoa, pedra sob água rasa, ausência de reflexo, silhueta humana familiar, mão erguida e aproximação súbita. | Inserir uma cena própria antes do segundo despertar; não revelar rosto, nome ou identidade. |
| Recuperação | O protagonista acorda assustado, conta o sonho e só então descobre que atacou Lira e foi nocauteado. | Dividir a conversa para dar espaço à descoberta, à culpa, aos olhos vermelhos e ao risco de repetição. |
| Evolução | Mais controle e novas formas são possibilidades; experiência não elimina todos os riscos. | Evitar prometer cura pelo nível/evolução. A primeira forma é o foco da explicação. |
| Liberação | Lira autoriza conhecer a Academia e fazer atividades sem transformação. Mantém a exigência de supervisão. | Remover a liberação automática de transformação nas áreas públicas e dos duelos independentes ao terminar a recuperação. |
| Gancho final | A presença retorna enquanto o protagonista observa treino supervisionado, com Z-Link inativo. Lembra também da figura na névoa e decide contar a Lira. | Encerrar o capítulo nessa descoberta. A conversa de relato já existente pode abrir uma continuação claramente adaptada. |

## Sequência jogável revisada

### 1. O Chamado

Escuridão, respiração e voz fragmentada. Pequena luz, silhueta de criatura
mutável, dois pontos luminosos e o comando “Acorde”. Usar som e enquadramento
para construir presença, sem apresentar uma espécie ou identidade confirmada.

### 2. Clareira, riacho e caminho de saída

Despertar gradual: dor de cabeça, tentativa de levantar e reconhecimento das
próprias mãos. Introduzir o nome preservado e a ausência de passado. Exploração
livre acompanha o som da água. No riacho, uma breve cena mostra o reflexo e o
vulto na outra margem. A trilha revela sinais humanos progressivamente.

Exemplo de adaptação, preservando o nome personalizado:

- Protagonista: “Meu nome é {nome}. Disso eu lembro. Então por que não consigo
  lembrar de uma pessoa sequer da minha vida?”
- Protagonista: “Se alguém estiver me procurando… preciso encontrar um jeito
  de sair daqui.”

### 3. Encontro e caminhada com Lira

Lira se aproxima, faz perguntas sobre dor e tontura, oferece água e propõe a
avaliação médica. Ela caminha devagar com o protagonista. Dividir as conversas
em pontos da estrada: Z-Link, Zimoria e a presença. Acompanhamento precisa ser
visível, com movimentos de quatro direções e colisões coerentes.

Preservar a aparência visual aprovada de Lira, de cabelos azul-escuros. A
descrição de cabelos claros no manuscrito não substitui esse design sem pedido
do autor.

### 4. Chegada e avaliação médica

Mostrar estudantes e uma manifestação parcial antes de entrar na enfermaria.
A avaliação confirma o nome conhecido e os conhecimentos gerais preservados.
Lira não promete recuperar as lembranças. Os relatos antigos de percepção sem
equipamento entram como hipótese, nunca como prova da origem do protagonista.

### 5. Explicação, entrega e escolha

No laboratório, usar a projeção em blocos curtos de conversa: história das
essências, Sincronia artificial, duas consciências, interferência dos instintos
e risco de possessão. O protagonista faz perguntas e concorda com a leitura.
Mostrar a caixa, a entrega, o ajuste ao pulso e o reconhecimento do Z-Link.
Só depois habilitar funções correspondentes na interface.

Apresentar Pyron, Marivon e Verdrax separadamente. Escolher uma única essência
para a avaliação; as outras duas projeções desaparecem. A atividade de pulsos
pode representar concentração, sem atribuir a crise a um erro do jogador.

### 6. Crise, casulo e possessão

Começar com resposta discreta no pulso, calor no braço e presença no peito.
Aumentar gradualmente batimentos e separação dos sons da sala. Mostrar rigidez
das mãos e esforço para resistir antes de completar a transformação. Lira tenta
reduzir a intensidade e interromper o teste; a resposta precede a calibração.

O casulo segue as etapas aprovadas: ativação, envolvimento, fechamento,
rachaduras e emergência. A crise precisa de tempo de observação e pausas nas
falas. Os olhos ficam vermelhos quando a postura se torna agressiva e a voz de
Lira deixa de alcançar o protagonista. Não anunciar a identidade da presença.

### 7. Contenção jogável

O jogador continua comandando o próprio corpo, agora em estado instintivo.
Lira tenta contato e contenção antes de atacar. Ela utiliza **Verdrax fixo** e
transforma parcialmente os braços, como o autor determinou no feedback visual.
Esses detalhes visuais são instruções do autor, não revelações adicionais
descritas pelo novo manuscrito.

Produzir os braços a partir da anatomia da Forma Ascendida do Verdrax, com
sprites de transição, repouso, execução e recuperação. A vantagem elemental
deixa de ser garantida para todos os iniciais; a superioridade técnica e de
nível de Lira sustenta a contenção.

Sem fuga, troca de personagem, recompensa ou revanche. A derrota precisa ser
real e visualmente coerente: HP a zero, tentativa breve de se reerguer, olhos
voltando ao normal, perda da forma e socorro. Não introduzir um comando
“Defender”; a postura de guarda da Lira pertence à animação.

### 8. A figura na névoa

Depois da derrota e antes da enfermaria, mudar a apresentação para um espaço
mental delimitado. Água rasa sobre pedra, passos e ausência de reflexo. A
silhueta humana não exibe nome ou rosto. A familiaridade vem das falas e da
reação do protagonista. A mão erguida provoca tremor e água agitada; uma
aproximação súbita encerra a cena. Tratar como sonho relatado, sem confirmar
que se trata de um lugar físico ou identificar a figura como o Zimon escolhido.

### 9. Segundo despertar e acordo

Separar a conversa em cinco momentos, com transições e reações curtas:

1. Acordar em pânico, Lira tranquilizar e ouvir o relato da névoa.
2. Descobrir o apagão, o ataque e o nocaute; perguntar se feriu alguém.
3. Perguntar espontaneamente pelos olhos vermelhos, como acontece no livro.
4. Discutir repetição do risco, registros incomuns e hipóteses sem resposta.
5. Firmar confiança: avisar sintomas, não transformar sozinho e compartilhar
   descobertas, com ajuda externa se a situação exigir.

Exemplo de adaptação de conversa:

- Protagonista: “Lira… meus olhos ficaram vermelhos?”
- Lira: “Ficaram. Por que você está perguntando?”
- Protagonista: “Não sei. Essa cor veio à minha cabeça. Mas eu não lembro da
  luta.”
- Lira: “O brilho apareceu quando você deixou de responder. Não é um efeito
  normal da transformação. Vamos tratar isso como um sinal de alerta.”

### 10. Conhecer a Academia e o gancho

Lira mostra a primeira forma no terminal, explica possibilidades e limites da
evolução e acompanha a saída para o corredor. O painel apresenta atividades de
orientação sem transformação. Conversas com estudantes podem ser opcionais;
não exigir duas interações alheias ao livro para permitir a presença final.

Mostrar um aluno praticando sob supervisão. A presença retorna; o Z-Link fica
inativo. O protagonista lembra da figura na névoa e decide avisar Lira. Encerrar
o capítulo com essa direção e novas perguntas, sem solucionar a amnésia.

## Integração dos sistemas já pedidos

- **Treino, comando T e combate com alunos:** podem continuar como extensão
  jogável depois do capítulo, em atividades supervisionadas com Lira/instrutor
  presente. Uma permissão posterior precisa ser encenada antes de liberar uso
  independente. O treino não prova que a possessão foi curada.
- **Zimondex:** entrega orientada e explicação podem integrar a recepção de
  novos estudantes, como adaptação solicitada. O catálogo continua separado das
  missões, com desconhecido/avistado/alma vinculada. Relato e projeção de uma
  espécie não equivalem a avistar sua essência pessoalmente.
- **Aparelho de recuperação:** acrescentar como orientação da Academia ou do
  primeiro treino. Recuperar HP/energia não trata automaticamente a causa da
  instabilidade.
- **Nico, Aya, Mara e tarefas simples:** preservar relações de acolhimento,
  registros e reconhecimento do local. Não inventar uma mãe reconhecida ou
  passado familiar para resolver a amnésia.
- **HUD, menu, bolsa e personalização:** continuam vinculados ao feedback
  visual aprovado. A nova lore não substitui as artes por modelos genéricos.

## Critérios de validação da implementação

- Nome personalizado permanece uma lembrança conhecida, com concordância de
  gênero e pontuação revisadas em todos os diálogos.
- Z-Link aparece no corpo e habilita funções apenas depois da entrega.
- A primeira escolha concede só uma essência; Lira usa sempre Verdrax.
- Olhos vermelhos surgem apenas na possessão e acompanham cada pose sem sair
  das órbitas; cessam com a contenção, inclusive nos três iniciais.
- Jogador controla o protagonista na luta; Lira não é controlada pelo jogador.
- Nocaute sempre antecede a cena da névoa; ela antecede o segundo despertar.
- O personagem não narra lembranças conscientes da luta que o livro nega.
- Não existe revelação prematura sobre a silhueta, a origem ou o vínculo natural.
- Conhecer a Academia não libera transformações e desafios sem supervisão.
- Falas avançam manualmente; cenas em velocidade normal deixam observar os
  movimentos. A opção de acessibilidade encurta efeitos sem suprimir a história.
- Capturas e gravações devem mostrar a implementação executada, identificadas
  separadamente das pranchas de direção visual.

## Limites da encenação entregue

A lore foi adaptada, não reproduzida palavra por palavra. A floresta continua sendo um mapa ilustrado com regiões de colisão e pontos de interação. A entrega do dispositivo e a projeção usam a cena do laboratório, falas e efeitos, sem uma animação inédita quadro a quadro de caixa e encaixe no pulso. A silhueta do sonho é intencionalmente anônima. Os antebraços de Lira e as poses de ataque são novos assets derivados das referências. O treino posterior ao relato, cura e desafios únicos são extensão jogável, não continuação canônica inventada para o livro.

## Revisão solicitada pelo autor — v0.9

A crise passou a ter encenação no laboratório, com desvio de Lira e danos parciais em equipamentos. Ela tenta contato sem revidar no primeiro turno. O protagonista cai antes de retornar ao humano. A recuperação recebe atendimento, sonho, conversa, descanso e passagem explícita para o dia seguinte; termina dentro da enfermaria. A saída é voluntária, com acompanhamento de Lira. A projeção automática das evoluções foi removida da recuperação. O aparelho de recuperação foi retirado do cenário e da missão; a prática posterior encerra com uma pausa orientada. Elias é apresentado somente em interação escolhida pelo jogador. Essas alterações seguem o feedback posterior do autor e substituem as propostas de encenação mais antigas deste documento.
