// Adapted spoken dialogue from the author’s game script 4.1. Implementation notes are never displayed.
export const SCENES={
  "1": [
    {
      "speaker": "voice",
      "text": "...Você..."
    },
    {
      "speaker": "voice",
      "text": "...Consegue me ouvir?"
    },
    {
      "speaker": "voice",
      "text": "Ei..."
    },
    {
      "speaker": "voice",
      "text": "ACORDE!"
    },
    {
      "speaker": "lira",
      "text": "Ah! Finalmente! Já estava começando a achar que você não ia acordar!"
    },
    {
      "speaker": "player",
      "text": "O quê...? Onde...?"
    },
    {
      "speaker": "lira",
      "text": "Calma, calma! Não levante tão rápido."
    },
    {
      "speaker": "player",
      "text": "Ah... Minha cabeça..."
    },
    {
      "speaker": "lira",
      "text": "Eu avisei! Devagar."
    },
    {
      "speaker": "lira",
      "text": "Você está numa floresta perto da Academia Zimons. Eu ouvi um barulho enorme vindo daqui e resolvi investigar."
    },
    {
      "speaker": "player",
      "text": "O que aconteceu aqui?"
    },
    {
      "speaker": "lira",
      "text": "Boa pergunta! Quando cheguei, já estava tudo assim."
    },
    {
      "speaker": "lira",
      "text": "Quem fez isso não estava exatamente preocupado em preservar a natureza..."
    },
    {
      "speaker": "lira",
      "text": "Mas vamos resolver uma coisa de cada vez. Você está machucado?"
    },
    {
      "speaker": "player",
      "text": "Só estou meio tonto... E com dor de cabeça."
    },
    {
      "speaker": "lira",
      "text": "Consegue lembrar como chegou aqui?"
    },
    {
      "speaker": "player",
      "text": "Eu... não sei."
    },
    {
      "speaker": "lira",
      "text": "Nada?"
    },
    {
      "speaker": "player",
      "text": "Não lembro de nada antes de acordar."
    },
    {
      "speaker": "lira",
      "text": "Hmm... Certo. Vamos começar com algo mais simples."
    },
    {
      "speaker": "lira",
      "text": "Você consegue lembrar seu nome?"
    },
    {
      "speaker": "player",
      "text": "Meu... nome?"
    },
    {
      "speaker": "player",
      "text": "Eu acho que é... [NOME]."
    },
    {
      "speaker": "lira",
      "text": "[NOME]... Gostei! Prazer, sou Lira."
    },
    {
      "speaker": "lira",
      "text": "Sou pesquisadora da Academia Zimons."
    },
    {
      "speaker": "player",
      "text": "Academia... Zimons?"
    },
    {
      "speaker": "lira",
      "text": "Isso! E, considerando que você acordou no meio de uma floresta destruída sem lembrar de nada, acho que uma visita à nossa enfermaria seria uma boa ideia."
    },
    {
      "speaker": "player",
      "text": "É... acho que sim."
    },
    {
      "speaker": "lira",
      "text": "Ótimo! Vamos levantar?"
    },
    {
      "speaker": "player",
      "text": "Obrigado."
    },
    {
      "speaker": "lira",
      "text": "De nada. Agora tente não desmaiar de novo, combinado? Já tive emoção suficiente por hoje!"
    },
    {
      "speaker": "lira, caso o jogador se afaste",
      "text": "Ei, [NOME]! A Academia é por aqui!"
    }
  ],
  "2": [
    {
      "speaker": "player",
      "text": "Você disse que é pesquisadora?"
    },
    {
      "speaker": "lira",
      "text": "Isso mesmo! Trabalho com tecnologia de Sincro e estudo o comportamento das essências dos Zimons."
    },
    {
      "speaker": "player",
      "text": "Zimons... O que são exatamente?"
    },
    {
      "speaker": "lira",
      "text": "Criaturas que existiram em Zimoria muito antes dos humanos."
    },
    {
      "speaker": "player",
      "text": "Existiram?"
    },
    {
      "speaker": "lira",
      "text": "Sim. Seus corpos desapareceram há muito tempo, mas suas essências permaneceram."
    },
    {
      "speaker": "player",
      "text": "Essências?"
    },
    {
      "speaker": "lira",
      "text": "É mais fácil explicar quando chegarmos. Tenho algumas projeções no laboratório que vão ajudar."
    },
    {
      "speaker": "player",
      "text": "E esse relógio?"
    },
    {
      "speaker": "lira",
      "text": "Ah! Este aqui é um Z-Link."
    },
    {
      "speaker": "player",
      "text": "Z-Link?"
    },
    {
      "speaker": "lira",
      "text": "Uma das tecnologias mais importantes da Academia. Com ele, conseguimos realizar a Sincro."
    },
    {
      "speaker": "player",
      "text": "E o que é Sincro?"
    },
    {
      "speaker": "lira",
      "text": "Digamos que é uma maneira de fazer algo que normalmente seria impossível."
    },
    {
      "speaker": "player",
      "text": "Você gosta de fazer mistério, né?"
    },
    {
      "speaker": "lira",
      "text": "Um pouquinho! Faz parte da diversão."
    },
    {
      "speaker": "lira",
      "text": "Tudo bem aí?"
    },
    {
      "speaker": "player",
      "text": "Acho que sim... Só senti uma coisa estranha."
    },
    {
      "speaker": "lira",
      "text": "Estranha como?"
    },
    {
      "speaker": "player",
      "text": "Como se tivesse alguém perto de mim... Mas não tem ninguém."
    },
    {
      "speaker": "lira",
      "text": "Hmm... Não estou vendo ninguém também."
    },
    {
      "speaker": "player",
      "text": "Você acha que pode ter alguma relação com os Zimons?"
    },
    {
      "speaker": "lira",
      "text": "Não. Uma ligação com um Zimon precisa ser estabelecida pelo Z-Link."
    },
    {
      "speaker": "lira",
      "text": "E você nem estava usando um quando eu te encontrei."
    },
    {
      "speaker": "player",
      "text": "Então o que pode ser?"
    },
    {
      "speaker": "lira",
      "text": "Difícil dizer. Você acabou de acordar numa floresta, depois de ficar desacordado. Primeiro vamos cuidar dessa dor de cabeça, depois investigamos o restante."
    }
  ],
  "3": [
    {
      "speaker": "lira",
      "text": "E aqui estamos! Bem-vindo à Academia Zimons!"
    },
    {
      "speaker": "player",
      "text": "Nossa... É enorme!"
    },
    {
      "speaker": "lira",
      "text": "E você ainda não viu o ginásio! É uma das minhas partes favoritas."
    },
    {
      "speaker": "player",
      "text": "Ginásio?"
    },
    {
      "speaker": "lira",
      "text": "Sim! Temos aulas práticas, treinamentos e batalhas de exibição."
    },
    {
      "speaker": "player",
      "text": "Batalhas?"
    },
    {
      "speaker": "lira",
      "text": "Você vai entender em breve."
    },
    {
      "speaker": "lira",
      "text": "Mas antes, enfermaria! Não quero ser a pesquisadora que deixou alguém com perda de memória sair por aí sem uma avaliação."
    }
  ],
  "4": [
    {
      "speaker": "lira",
      "text": "Pronto. Pode se acomodar na cama. Vou conferir seus sinais."
    },
    {
      "speaker": "lira",
      "text": "Seus sinais parecem estáveis."
    },
    {
      "speaker": "player",
      "text": "Então por que não consigo lembrar de nada?"
    },
    {
      "speaker": "lira",
      "text": "Essa é a parte que ainda precisamos investigar."
    },
    {
      "speaker": "lira",
      "text": "Consegue lembrar alguma coisa além do seu nome?"
    },
    {
      "speaker": "player",
      "text": "Lembro de uma voz me chamando..."
    },
    {
      "speaker": "lira",
      "text": "Provavelmente era eu! Precisei chamar várias vezes até você acordar."
    },
    {
      "speaker": "player",
      "text": "Então aquelas duas pessoas... eram só um sonho?"
    },
    {
      "speaker": "lira",
      "text": "[NOME]?"
    },
    {
      "speaker": "player",
      "text": "Ah! Desculpa. Estava pensando."
    },
    {
      "speaker": "lira",
      "text": "Não encontrei sinais evidentes de ferimentos graves. Mas precisamos acompanhar essa perda de memória."
    },
    {
      "speaker": "player",
      "text": "E o que faço agora?"
    },
    {
      "speaker": "lira",
      "text": "Bom... Já que você está aqui e seus sinais estão estáveis, gostaria de fazer uma avaliação no laboratório."
    },
    {
      "speaker": "player",
      "text": "Uma avaliação de quê?"
    },
    {
      "speaker": "lira",
      "text": "Compatibilidade com essências de Zimons!"
    },
    {
      "speaker": "player",
      "text": "Mas você não disse que preciso de um Z-Link?"
    },
    {
      "speaker": "lira",
      "text": "Exatamente! E eu tenho alguns modelos de treinamento."
    },
    {
      "speaker": "lira",
      "text": "Podemos começar com uma leitura simples. Sem transformação, só calibração."
    },
    {
      "speaker": "player",
      "text": "E isso vai ajudar com minhas memórias?"
    },
    {
      "speaker": "lira",
      "text": "Provavelmente não diretamente. Mas podemos descobrir alguma coisa interessante sobre você."
    },
    {
      "speaker": "player",
      "text": "Você gosta mesmo dessas pesquisas..."
    },
    {
      "speaker": "lira",
      "text": "Muito mais do que deveria, segundo alguns colegas!"
    },
    {
      "speaker": "lira",
      "text": "Vamos?"
    }
  ],
  "5": [
    {
      "speaker": "lira",
      "text": "Bem-vindo ao meu pequeno paraíso!"
    },
    {
      "speaker": "player",
      "text": "Pequeno?"
    },
    {
      "speaker": "lira",
      "text": "Está bem... Talvez eu tenha exagerado um pouco nos equipamentos."
    },
    {
      "speaker": "lira",
      "text": "Antes de começar, vou explicar o básico."
    },
    {
      "speaker": "lira",
      "text": "Muito antes da humanidade, os Zimons habitavam este mundo."
    },
    {
      "speaker": "lira",
      "text": "Com o passar das eras, seus corpos desapareceram. Mas suas essências continuaram presentes em Zimoria."
    },
    {
      "speaker": "player",
      "text": "Tipo espíritos?"
    },
    {
      "speaker": "lira",
      "text": "É uma comparação razoável. Ainda existem muitas coisas que não entendemos sobre elas."
    },
    {
      "speaker": "lira",
      "text": "Durante muito tempo, essas essências eram inacessíveis. Até que conseguimos desenvolver o Z-Link."
    },
    {
      "speaker": "player",
      "text": "E ele permite fazer a Sincro?"
    },
    {
      "speaker": "lira",
      "text": "Isso! O aparelho identifica a compatibilidade entre a consciência humana e uma essência e estabelece um pacto de Sincro."
    },
    {
      "speaker": "player",
      "text": "E quem escolhe o Zimon?"
    },
    {
      "speaker": "lira",
      "text": "Normalmente, é a própria essência que responde ao usuário durante a calibração."
    },
    {
      "speaker": "lira",
      "text": "Costumamos dizer que o Zimon escolhe seu parceiro."
    },
    {
      "speaker": "player",
      "text": "Então não posso escolher qualquer um?"
    },
    {
      "speaker": "lira",
      "text": "Geralmente não. A máquina identifica a essência com maior compatibilidade e ajuda a estabelecer o pacto."
    },
    {
      "speaker": "lira",
      "text": "O Z-Link consegue induzir essa ligação artificialmente. Sem ele, não conseguiríamos realizar a Sincro."
    },
    {
      "speaker": "player",
      "text": "E o que acontece depois?"
    },
    {
      "speaker": "lira",
      "text": "A melhor parte! Você pode assumir a forma de um Zimon."
    },
    {
      "speaker": "player",
      "text": "Me transformar numa daquelas criaturas?!"
    },
    {
      "speaker": "lira",
      "text": "Exatamente!"
    },
    {
      "speaker": "lira",
      "text": "Mas é necessário treinamento. Durante a Sincro, os instintos do Zimon podem interferir nos movimentos do usuário."
    },
    {
      "speaker": "player",
      "text": "Entendi..."
    },
    {
      "speaker": "lira",
      "text": "Nada que um pouco de prática e uma boa calibração não ajudem a administrar!"
    },
    {
      "speaker": "lira",
      "text": "Agora, vamos descobrir com qual essência você possui compatibilidade."
    }
  ],
  "6": [
    {
      "speaker": "lira",
      "text": "Coloque no pulso e fique sobre a plataforma."
    },
    {
      "speaker": "system",
      "text": "Z-Link ativado."
    },
    {
      "speaker": "player",
      "text": "É só isso?"
    },
    {
      "speaker": "lira",
      "text": "Por enquanto! A máquina fará uma leitura dos seus padrões."
    },
    {
      "speaker": "system",
      "text": "Analisando compatibilidade..."
    },
    {
      "speaker": "system",
      "text": "Essência compatível identificada: PYRON."
    },
    {
      "speaker": "lira",
      "text": "Ótimo! Encontramos uma."
    },
    {
      "speaker": "system",
      "text": "Essência compatível identificada: MARIVON."
    },
    {
      "speaker": "lira",
      "text": "Espera... Duas?"
    },
    {
      "speaker": "system",
      "text": "Essência compatível identificada: VERDRAX."
    },
    {
      "speaker": "player",
      "text": "Lira...?"
    },
    {
      "speaker": "lira",
      "text": "Três..."
    },
    {
      "speaker": "player",
      "text": "Isso é ruim?"
    },
    {
      "speaker": "lira",
      "text": "Ruim?! Isso é fascinante!"
    },
    {
      "speaker": "lira",
      "text": "Nunca vi uma calibração inicial identificar três compatibilidades ao mesmo tempo!"
    },
    {
      "speaker": "player",
      "text": "Talvez tenha algum problema com a máquina?"
    },
    {
      "speaker": "lira",
      "text": "Ei! Não fale assim dos meus equipamentos!"
    },
    {
      "speaker": "system",
      "text": "Recalibrando..."
    },
    {
      "speaker": "system",
      "text": "Resultado confirmado: três essências compatíveis."
    },
    {
      "speaker": "lira",
      "text": "Incrível! Os resultados se repetiram!"
    },
    {
      "speaker": "player",
      "text": "Então... o que acontece agora?"
    },
    {
      "speaker": "lira",
      "text": "Pelo visto, você pode escolher qual dessas três essências deseja utilizar."
    },
    {
      "speaker": "player",
      "text": "Mas você não disse que o Zimon normalmente escolhe o parceiro?"
    },
    {
      "speaker": "lira",
      "text": "Disse! E é exatamente por isso que estou tão curiosa. As três responderam à sua calibração."
    },
    {
      "speaker": "lira",
      "text": "Você acabou de transformar um teste de rotina em uma pesquisa muito interessante!"
    },
    {
      "speaker": "lira",
      "text": "Escolha com calma, [NOME]. Seu primeiro pacto é uma decisão importante."
    },
    {
      "speaker": "player",
      "text": "Vou escolher [ZIMON]."
    },
    {
      "speaker": "lira",
      "text": "Excelente! Vamos tentar uma Sincro inicial."
    },
    {
      "speaker": "lira",
      "text": "Ainda bem que preparei essa plataforma para testes mais avançados!"
    },
    {
      "speaker": "player",
      "text": "Você tinha planejado fazer um teste avançado comigo?"
    },
    {
      "speaker": "lira",
      "text": "Planejado? Não exatamente..."
    },
    {
      "speaker": "lira",
      "text": "Mas seria um desperdício não investigar essa compatibilidade!"
    }
  ],
  "7": [
    {
      "speaker": "system",
      "text": "Iniciando Sincro..."
    },
    {
      "speaker": "player",
      "text": "Uau... Estou sentindo alguma coisa!"
    },
    {
      "speaker": "lira",
      "text": "Ótimo! Tente manter a concentração."
    },
    {
      "speaker": "player",
      "text": "Lira... Meu corpo está estranho."
    },
    {
      "speaker": "lira",
      "text": "A Sincro está avançando... Espere..."
    },
    {
      "speaker": "system",
      "text": "Instabilidade detectada."
    },
    {
      "speaker": "lira",
      "text": "Esses números estão altos demais..."
    },
    {
      "speaker": "player",
      "text": "Eu... não consigo controlar meus movimentos!"
    },
    {
      "speaker": "lira",
      "text": "[NOME], escute minha voz!"
    },
    {
      "speaker": "player",
      "text": "Estou tentando!"
    },
    {
      "speaker": "player",
      "text": "Tem alguma coisa... tomando conta..."
    },
    {
      "speaker": "system",
      "text": "ALERTA! INSTABILIDADE CRÍTICA!"
    },
    {
      "speaker": "player",
      "text": "Lira...!"
    },
    {
      "speaker": "system",
      "text": "ESTADO DE POSSESSÃO DESCONTROLADA."
    },
    {
      "speaker": "lira",
      "text": "Ah, não... Isso não estava nos meus planos!"
    },
    {
      "speaker": "lira",
      "text": "Ei! Calma! São equipamentos caros!"
    },
    {
      "speaker": "lira",
      "text": "Tá bom, tá bom! Esquece os equipamentos!"
    },
    {
      "speaker": "system",
      "text": "Falha na interrupção."
    },
    {
      "speaker": "lira",
      "text": "Sério?! Agora?!"
    },
    {
      "speaker": "lira",
      "text": "Certo... Acho que vamos precisar resolver isso da maneira difícil."
    },
    {
      "speaker": "lira",
      "text": "Sincro parcial!"
    },
    {
      "speaker": "lira",
      "text": "Desculpa, [NOME]! Mas vou ter que apagar você por alguns minutos!"
    },
    {
      "speaker": "system",
      "text": "Sincro interrompida."
    },
    {
      "speaker": "lira",
      "text": "Está respirando... Ufa!"
    },
    {
      "speaker": "lira",
      "text": "Bom... Acho que vou precisar de alguns equipamentos novos."
    },
    {
      "speaker": "lira",
      "text": "Mas o que foi aquilo...?"
    }
  ],
  "8": [
    {"speaker":"player","text":"Aquelas duas pessoas... de novo."},
    {"speaker":"player","text":"Continuam de mãos dadas. Eu queria conseguir ver seus rostos."},
    {"speaker":"player","text":"Por que sinto tanta falta de alguém de quem não consigo lembrar?"},
    {"speaker":"player","text":"Esperem... só mais um pouco."}
  ],
  "9": [
    {
      "speaker": "player",
      "text": "AH!"
    },
    {
      "speaker": "lira",
      "text": "Ei! Calma! Está tudo bem!"
    },
    {
      "speaker": "player",
      "text": "Lira...? Onde estou?"
    },
    {
      "speaker": "lira",
      "text": "Na enfermaria. Você estava desacordado."
    },
    {
      "speaker": "player",
      "text": "De novo...?"
    },
    {
      "speaker": "lira",
      "text": "Infelizmente. Você está começando a criar um hábito."
    },
    {
      "speaker": "lira",
      "text": "Teve um pesadelo?"
    },
    {
      "speaker": "player",
      "text": "Vi uma pessoa... Não consegui enxergar o rosto."
    },
    {
      "speaker": "lira",
      "text": "Hmm... Podemos conversar sobre isso depois."
    },
    {
      "speaker": "lira",
      "text": "Agora, preciso saber. Você lembra do que aconteceu no laboratório?"
    },
    {
      "speaker": "player",
      "text": "Lembro da transformação começando... Depois ficou tudo escuro."
    },
    {
      "speaker": "lira",
      "text": "Então você realmente não lembra."
    },
    {
      "speaker": "player",
      "text": "Lembrar do quê?"
    },
    {
      "speaker": "lira",
      "text": "Você conseguiu se transformar, mas perdeu completamente o controle."
    },
    {
      "speaker": "player",
      "text": "Como assim?"
    },
    {
      "speaker": "lira",
      "text": "Seus olhos ficaram vermelhos. Os instintos do Zimon assumiram o controle e você começou a atacar tudo ao redor."
    },
    {
      "speaker": "player",
      "text": "Eu fiz isso?!"
    },
    {
      "speaker": "lira",
      "text": "Sim. Inclusive alguns equipamentos meus."
    },
    {
      "speaker": "player",
      "text": "E você? Está bem?"
    },
    {
      "speaker": "lira",
      "text": "Estou. Precisei fazer uma Sincro parcial para conter você."
    },
    {
      "speaker": "player",
      "text": "Eu não lembro de nada..."
    },
    {
      "speaker": "lira",
      "text": "Eu percebi. E isso torna tudo ainda mais interessante... e preocupante."
    },
    {
      "speaker": "lira",
      "text": "Quero estudar os registros e aperfeiçoar sua calibração antes que tente outra Sincro."
    },
    {
      "speaker": "player",
      "text": "Você acha que vai descobrir o que aconteceu?"
    },
    {
      "speaker": "lira",
      "text": "Vou fazer o possível. Os dados que registramos são bastante diferentes dos que estou acostumada a ver."
    },
    {
      "speaker": "player",
      "text": "E agora?"
    },
    {
      "speaker": "lira",
      "text": "Agora você descansa. Eu fico com a parte complicada!"
    },
    {
      "speaker": "player",
      "text": "Você vai estudar isso hoje?"
    },
    {
      "speaker": "lira",
      "text": "Hoje, esta noite... Talvez com a ajuda de bastante café."
    },
    {
      "speaker": "lira",
      "text": "Amanhã, se estiver se sentindo melhor, venha ao laboratório. Quero mostrar os resultados."
    },
    {
      "speaker": "player",
      "text": "Combinado."
    },
    {
      "speaker": "lira",
      "text": "E, [NOME]... Por enquanto, vamos manter os detalhes desse incidente entre nós."
    },
    {
      "speaker": "player",
      "text": "Obrigado."
    },
    {
      "speaker": "lira",
      "text": "Não me agradeça ainda. Primeiro preciso descobrir como você conseguiu bagunçar meus indicadores daquele jeito!"
    }
  ],
  "10": [
    {
      "speaker": "player",
      "text": "Ah... Finalmente uma noite tranquila."
    },
    {
      "speaker": "player",
      "text": "Acho que estou bem melhor."
    },
    {
      "speaker": "player",
      "text": "Ah, verdade! Lira pediu para eu ir ao laboratório."
    }
  ],
  "11": [
    {
      "speaker": "player",
      "text": "Bom dia, Lira!"
    },
    {
      "speaker": "lira",
      "text": "Ah! [NOME]! Bom dia!"
    },
    {
      "speaker": "player",
      "text": "Você dormiu?"
    },
    {
      "speaker": "lira",
      "text": "Claro!"
    },
    {
      "speaker": "lira",
      "text": "Uns vinte minutos... Acho."
    },
    {
      "speaker": "player",
      "text": "Lira..."
    },
    {
      "speaker": "lira",
      "text": "O quê? Eu estava trabalhando! E encontrei coisas muito interessantes."
    },
    {
      "speaker": "lira",
      "text": "Passei boa parte da noite analisando os registros e aperfeiçoando sua calibração."
    },
    {
      "speaker": "player",
      "text": "Descobriu alguma coisa?"
    },
    {
      "speaker": "lira",
      "text": "Sim. Normalmente, alunos iniciantes apresentam dificuldades de coordenação durante a Sincro."
    },
    {
      "speaker": "lira",
      "text": "Alguns mal conseguem andar. Outros não conseguem atacar direito ou controlar os movimentos."
    },
    {
      "speaker": "player",
      "text": "E comigo foi diferente?"
    },
    {
      "speaker": "lira",
      "text": "Completamente."
    },
    {
      "speaker": "lira",
      "text": "Você não ficou desorientado. Seu corpo começou a agir de maneira agressiva e instintiva, como uma fera selvagem."
    },
    {
      "speaker": "player",
      "text": "E isso não é comum?"
    },
    {
      "speaker": "lira",
      "text": "Não dessa maneira. Foi uma possessão descontrolada muito mais intensa do que uma falha normal de coordenação."
    },
    {
      "speaker": "player",
      "text": "Então o que aconteceu?"
    },
    {
      "speaker": "lira",
      "text": "Ainda estou investigando."
    },
    {
      "speaker": "lira",
      "text": "Mas consegui modificar os parâmetros de Sincro. Ajustei os limites de resposta e os sistemas de interrupção."
    },
    {
      "speaker": "player",
      "text": "Isso deve ajudar?"
    },
    {
      "speaker": "lira",
      "text": "É o que vamos descobrir!"
    },
    {
      "speaker": "player",
      "text": "Você parece animada demais..."
    },
    {
      "speaker": "lira",
      "text": "Você não faz ideia!"
    },
    {
      "speaker": "lira",
      "text": "Mas vamos começar devagar. Quero fazer um teste curto."
    },
    {
      "speaker": "system",
      "text": "Z-Link recalibrado. Iniciando Sincro controlada."
    },
    {
      "speaker": "player",
      "text": "Estou sentindo de novo..."
    },
    {
      "speaker": "lira",
      "text": "Mantenha a concentração."
    },
    {
      "speaker": "system",
      "text": "Sincro estabelecida."
    },
    {
      "speaker": "lira",
      "text": "Funcionou!"
    },
    {
      "speaker": "player",
      "text": "Eu ainda estou consciente..."
    },
    {
      "speaker": "player",
      "text": "Consigo me mover!"
    },
    {
      "speaker": "lira",
      "text": "Ótimo! Agora tente alguns movimentos simples."
    },
    {
      "speaker": "player",
      "text": "Ainda sinto alguns impulsos estranhos..."
    },
    {
      "speaker": "lira",
      "text": "Isso é comum. O controle não aparece de uma hora para outra."
    },
    {
      "speaker": "player",
      "text": "Mas parece que ainda falta alguma coisa."
    },
    {
      "speaker": "lira",
      "text": "Você ainda não está totalmente adaptado. Mas os indicadores estão muito melhores!"
    },
    {
      "speaker": "lira",
      "text": "Excelente! O aperfeiçoamento parece ter funcionado."
    },
    {
      "speaker": "player",
      "text": "Então está tudo resolvido?"
    },
    {
      "speaker": "lira",
      "text": "Ainda não. A recalibração melhorou a estabilidade, mas precisamos continuar estudando aquela primeira reação."
    },
    {
      "speaker": "lira",
      "text": "Pelo menos você não destruiu mais nada!"
    },
    {
      "speaker": "player",
      "text": "Ainda bem..."
    },
    {
      "speaker": "lira",
      "text": "Agora que conseguimos uma Sincro estável, quero mostrar o resto da Academia."
    }
  ],
  "12": [
    {
      "speaker": "lira",
      "text": "A Academia possui vários setores. Você já conhece a enfermaria e meu laboratório."
    },
    {
      "speaker": "player",
      "text": "Mais do que eu gostaria, no caso da enfermaria."
    },
    {
      "speaker": "lira",
      "text": "Hahaha! Verdade!"
    },
    {
      "speaker": "lira",
      "text": "Também temos alojamentos, salas de pesquisa, áreas de treinamento e o ginásio."
    },
    {
      "speaker": "player",
      "text": "É lá que acontecem as batalhas?"
    },
    {
      "speaker": "lira",
      "text": "Isso! E hoje temos algumas exibições."
    }
  ],
  "13": [
    {
      "speaker": "lira",
      "text": "Quero apresentar algumas pessoas."
    },
    {
      "speaker": "lira",
      "text": "Esta é Nina."
    },
    {
      "speaker": "nina",
      "text": "Oi! Você é novo por aqui?"
    },
    {
      "speaker": "player",
      "text": "Sou. Meu nome é [NOME]."
    },
    {
      "speaker": "nina",
      "text": "Prazer! Espero que goste da Academia."
    },
    {
      "speaker": "lira",
      "text": "E este é Caio."
    },
    {
      "speaker": "caio",
      "text": "E aí! Já está treinando Sincro?"
    },
    {
      "speaker": "player",
      "text": "Comecei há pouco tempo."
    },
    {
      "speaker": "caio",
      "text": "Legal! No começo é meio estranho, mas você acostuma."
    },
    {
      "speaker": "nina",
      "text": "É verdade. Na minha primeira Sincro, eu não conseguia nem andar direito!"
    },
    {
      "speaker": "lira",
      "text": "E caiu umas três vezes!"
    },
    {
      "speaker": "nina",
      "text": "Professora!"
    },
    {
      "speaker": "lira",
      "text": "Brincadeiras à parte, vocês não estavam preparando uma exibição?"
    },
    {
      "speaker": "caio",
      "text": "Estávamos!"
    },
    {
      "speaker": "nina",
      "text": "Quer assistir, [NOME]?"
    },
    {
      "speaker": "player",
      "text": "Claro!"
    },
    {
      "speaker": "lira",
      "text": "Observe como eles se movimentam. Conseguem utilizar as habilidades sem depender apenas dos instintos."
    },
    {
      "speaker": "player",
      "text": "Eles parecem tão acostumados com isso..."
    },
    {
      "speaker": "lira",
      "text": "Muito bem, vocês dois!"
    }
  ],
  "14": [
    {
      "speaker": "nico",
      "text": "Professora Lira! Vai acompanhar os treinos hoje?"
    },
    {
      "speaker": "lira",
      "text": "Por mais um tempinho. Ah, Nico, este é [NOME]. Está começando na Academia."
    },
    {
      "speaker": "nico",
      "text": "Prazer! Sou Nico."
    },
    {
      "speaker": "player",
      "text": "Prazer."
    },
    {
      "speaker": "nico",
      "text": "Já fez sua primeira Sincro?"
    },
    {
      "speaker": "player",
      "text": "Sim. Ainda estou aprendendo."
    },
    {
      "speaker": "nico",
      "text": "Então vai gostar do ginásio. Sempre tem alguém querendo fazer uma batalha de exibição."
    },
    {
      "speaker": "lira",
      "text": "Falando nisso... [NOME], que tal tentar uma?"
    },
    {
      "speaker": "player",
      "text": "Agora?"
    },
    {
      "speaker": "lira",
      "text": "Por que não? Sua última Sincro foi estável, e uma batalha simples pode nos dar informações interessantes."
    },
    {
      "speaker": "player",
      "text": "Lira... e se eu perder o controle de novo?"
    },
    {
      "speaker": "lira",
      "text": "Calma. Recalibrei seu Z-Link, e a arena possui sistemas de interrupção. Vou ficar de olho nos indicadores."
    },
    {
      "speaker": "player",
      "text": "Tem certeza?"
    },
    {
      "speaker": "lira",
      "text": "Certeza absoluta? Não. Mas os últimos resultados foram bons, e podemos encerrar o teste ao primeiro sinal de problema."
    },
    {
      "speaker": "lira",
      "text": "Além disso, se tudo funcionasse perfeitamente na primeira tentativa, eu ficaria sem pesquisas interessantes!"
    },
    {
      "speaker": "player",
      "text": "Tá bom... Vamos tentar."
    },
    {
      "speaker": "lira",
      "text": "Nico, pode fazer uma exibição simples com [NOME]?"
    },
    {
      "speaker": "nico",
      "text": "Claro! Vamos nessa!"
    },
    {
      "speaker": "nico",
      "text": "Preparado?"
    },
    {
      "speaker": "player",
      "text": "Acho que sim!"
    },
    {
      "speaker": "lira",
      "text": "Lembre-se do treinamento. Concentre-se e controle seus movimentos!"
    },
    {
      "speaker": "system",
      "text": "Sincro iniciada."
    },
    {
      "speaker": "player",
      "text": "Certo... Ainda estou no controle."
    },
    {
      "speaker": "nico",
      "text": "Vamos começar!"
    },
    {
      "speaker": "pensamentos do protagonista",
      "text": "Preciso manter a concentração..."
    },
    {
      "speaker": "nico",
      "text": "Boa luta! Para quem está começando, você foi muito bem!"
    },
    {
      "speaker": "player",
      "text": "Valeu!"
    },
    {
      "speaker": "lira",
      "text": "Excelente! Os indicadores permaneceram estáveis durante toda a batalha."
    },
    {
      "speaker": "player",
      "text": "Consegui... Mas ainda tenho muito que aprender."
    },
    {
      "speaker": "lira",
      "text": "Vamos voltar ao laboratório. Quero verificar os resultados."
    }
  ],
  "15": [
    {
      "speaker": "lira",
      "text": "Muito bem! A Sincro se manteve estável durante todo o combate."
    },
    {
      "speaker": "player",
      "text": "Então a recalibração funcionou?"
    },
    {
      "speaker": "lira",
      "text": "Os resultados estão bastante melhores. Ainda não resolvemos o mistério da primeira possessão, mas já temos um avanço."
    },
    {
      "speaker": "player",
      "text": "O que você acha que causou aquilo?"
    },
    {
      "speaker": "lira",
      "text": "Ainda não sei. Sua reação foi muito diferente das dificuldades comuns de Sincro."
    },
    {
      "speaker": "lira",
      "text": "Vou continuar estudando os registros. Enquanto isso, você pode ganhar experiência nas batalhas de exibição."
    },
    {
      "speaker": "player",
      "text": "Já posso participar de outras?"
    },
    {
      "speaker": "lira",
      "text": "Pode. Não preciso acompanhar cada uma pessoalmente."
    },
    {
      "speaker": "player",
      "text": "Sério?"
    },
    {
      "speaker": "lira",
      "text": "Sim! O ginásio possui sistemas próprios de monitoramento, e seu Z-Link está configurado para acompanhar a estabilidade."
    },
    {
      "speaker": "lira",
      "text": "Mas, se perceber qualquer alteração estranha, interrompa a Sincro."
    },
    {
      "speaker": "player",
      "text": "Combinado."
    },
    {
      "speaker": "lira",
      "text": "Ótimo. Quero analisar também os resultados dos seus próximos combates. Quanto mais dados tivermos, melhor."
    },
    {
      "speaker": "player",
      "text": "Você realmente gosta de pesquisar, né?"
    },
    {
      "speaker": "lira",
      "text": "Você não faz ideia!"
    },
    {
      "speaker": "lira",
      "text": "Ah! Antes que eu esqueça, precisamos resolver onde você vai ficar."
    },
    {
      "speaker": "player",
      "text": "Onde vou ficar?"
    },
    {
      "speaker": "lira",
      "text": "Isso. Você ainda não sabe de onde veio, e não vou deixar você dormindo na floresta."
    },
    {
      "speaker": "player",
      "text": "Ainda bem..."
    },
    {
      "speaker": "lira",
      "text": "Vamos. Tenho uma surpresa."
    }
  ],
  "16": [
    {
      "speaker": "lira",
      "text": "Consegui um quarto temporário para você."
    },
    {
      "speaker": "player",
      "text": "Sério?"
    },
    {
      "speaker": "lira",
      "text": "Sim. Conversei com a administração e expliquei sua situação."
    },
    {
      "speaker": "lira",
      "text": "Pronto! Seu novo cantinho."
    },
    {
      "speaker": "player",
      "text": "Nossa... Muito obrigado!"
    },
    {
      "speaker": "lira",
      "text": "De nada. Você pode descansar, guardar seus pertences e se preparar para os treinamentos aqui."
    },
    {
      "speaker": "player",
      "text": "É estranho... Não lembro nem onde morava antes."
    },
    {
      "speaker": "lira",
      "text": "Eu sei. Mas não precisa descobrir tudo de uma vez."
    },
    {
      "speaker": "lira",
      "text": "Por enquanto, aproveite a Academia. Treine, conheça os outros alunos e tente se adaptar."
    },
    {
      "speaker": "player",
      "text": "E você vai continuar investigando?"
    },
    {
      "speaker": "lira",
      "text": "Com certeza! Principalmente agora que tenho um caso tão interessante nas mãos."
    },
    {
      "speaker": "lira",
      "text": "Só tente não destruir outro laboratório, tá?"
    },
    {
      "speaker": "player",
      "text": "Vou fazer o possível!"
    },
    {
      "speaker": "lira",
      "text": "Ótimo! Descanse bem, [NOME]."
    },
    {
      "speaker": "player",
      "text": "Boa noite, Lira."
    },
    {
      "speaker": "player",
      "text": "Que dia estranho..."
    },
    {
      "speaker": "player",
      "text": "Não lembro de onde vim... Descobri que posso me transformar em um Zimon. E ainda não sei por que perdi o controle."
    },
    {
      "speaker": "player",
      "text": "Mas consegui fazer uma Sincro sem perder a consciência."
    },
    {
      "speaker": "player",
      "text": "Quem eram aquelas duas pessoas de mãos dadas? E quem era a figura no segundo sonho?"
    },
    {
      "speaker": "player",
      "text": "Tenho muitas perguntas... Mas acho que finalmente encontrei um lugar para começar."
    }
  ]
};
