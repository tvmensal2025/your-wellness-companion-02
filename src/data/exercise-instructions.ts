// Guia de Execução dos Exercícios

export const exerciseInstructions = {
  // EXERCÍCIOS EM CASA COM MÓVEIS
  casa: {
    'Agachamento na cadeira': {
      descricao: 'Sente e levante usando uma cadeira como referência',
      video_url: 'https://www.youtube.com/watch?v=aclHkVaku9U',
      passos: [
        '1. Fique de frente para cadeira, pés na largura dos ombros',
        '2. Desça controladamente até quase sentar',
        '3. Pause 1 segundo antes de tocar',
        '4. Empurre pelos calcanhares para subir',
        '5. Mantenha peito elevado e core ativado'
      ],
      dicas: 'Não deixe os joelhos ultrapassarem a ponta dos pés'
    },
    'Flexão na mesa': {
      descricao: 'Flexão inclinada usando a mesa como apoio',
      video_url: 'https://www.youtube.com/watch?v=IODxDxX7oi4',
      passos: [
        '1. Mãos na borda da mesa, largura dos ombros',
        '2. Corpo reto da cabeça aos pés',
        '3. Desça até peito quase tocar a mesa',
        '4. Empurre com força',
        '5. Mantenha core contraído'
      ],
      dicas: 'Quanto mais alto o apoio, mais fácil. Use banco para nível intermediário'
    },
    'Subida no banco': {
      descricao: 'Step up usando banco ou degrau da escada',
      video_url: 'https://www.youtube.com/watch?v=Z2F0b0c5xV8',
      passos: [
        '1. Coloque um pé completamente sobre o banco',
        '2. Empurre pelo calcanhar para subir',
        '3. Joelho do outro pé deve ultrapassar a linha do banco',
        '4. Desça controladamente',
        '5. Alterne as pernas'
      ],
      dicas: 'Para mais intensidade, segure halteres ou garrafas de água'
    },
    'Mergulho na cadeira': {
      descricao: 'Tríceps dip usando cadeira',
      video_url: 'https://www.youtube.com/watch?v=0326dy_-CzM',
      passos: [
        '1. Mãos na borda da cadeira, dedos para frente',
        '2. Pés no chão, joelhos dobrados (iniciante) ou esticados (avançado)',
        '3. Desça dobrando os cotovelos até 90°',
        '4. Empurre para cima usando tríceps',
        '5. Mantenha cotovelos próximos ao corpo'
      ],
      dicas: 'Para aumentar dificuldade, coloque pés em outro banco'
    },
    'Remada na mesa': {
      descricao: 'Remada invertida usando mesa resistente',
      video_url: 'https://www.youtube.com/watch?v=GZpWaKW9nDU',
      passos: [
        '1. Deite sob a mesa, segure a borda',
        '2. Corpo reto, apenas calcanhares no chão',
        '3. Puxe peito em direção à mesa',
        '4. Aperte escapulas no topo',
        '5. Desça controladamente'
      ],
      dicas: 'Quanto mais horizontal, mais difícil. Dobre joelhos para facilitar'
    },
    'Panturrilha na escada': {
      descricao: 'Elevação de panturrilha usando degrau',
      video_url: 'https://www.youtube.com/watch?v=YMmgqO8Jo-k',
      passos: [
        '1. Pontas dos pés no degrau, calcanhares fora',
        '2. Segure no corrimão para equilíbrio',
        '3. Suba na ponta dos pés o máximo possível',
        '4. Pause 1 segundo no topo',
        '5. Desça abaixo do nível do degrau'
      ],
      dicas: 'Amplitude completa é essencial. Faça unilateral para mais intensidade'
    },
    'Agachamento búlgaro': {
      descricao: 'Split squat com pé traseiro elevado',
      video_url: 'https://www.youtube.com/watch?v=2C-uNgKwPLE',
      passos: [
        '1. Pé traseiro apoiado em cadeira/banco',
        '2. Pé da frente afastado (1 passo)',
        '3. Desça dobrando joelho da frente até 90°',
        '4. Joelho não ultrapassa ponta do pé',
        '5. Empurre pelo calcanhar para subir'
      ],
      dicas: 'Um dos melhores exercícios para pernas em casa'
    },
    'Flexão declinada': {
      descricao: 'Flexão com pés elevados no banco',
      video_url: 'https://www.youtube.com/watch?v=IODxDxX7oi4',
      passos: [
        '1. Pés no banco, mãos no chão',
        '2. Corpo reto, core contraído',
        '3. Desça até peito quase tocar chão',
        '4. Cotovelos 45° do corpo',
        '5. Empurre explosivamente'
      ],
      dicas: 'Trabalha mais a parte superior do peito'
    }
  },

  // EXERCÍCIOS DE ACADEMIA
  academia: {
    'Supino reto': {
      descricao: 'Exercício principal para peito',
      video_url: 'https://www.youtube.com/watch?v=rT7DgCr-3pg',
      passos: [
        '1. Deite no banco, pés firmes no chão',
        '2. Pegada na largura dos ombros + 10cm',
        '3. Tire a barra do suporte com braços esticados',
        '4. Desça controladamente até tocar peito',
        '5. Empurre explosivamente'
      ],
      dicas: 'Escápulas retraídas e peito para cima durante todo movimento. Arquear levemente a lombar'
    },
    'Agachamento livre': {
      descricao: 'Rei dos exercícios para pernas',
      video_url: 'https://www.youtube.com/watch?v=1xMaFs0L3ao',
      passos: [
        '1. Barra nas costas (trapézio superior)',
        '2. Pés largura dos ombros, pontas levemente para fora',
        '3. Inspire e desça controladamente',
        '4. Desça até coxas paralelas ao chão (mínimo)',
        '5. Empurre pelos calcanhares para subir'
      ],
      dicas: 'Joelhos na direção dos pés. Core sempre ativado. Olhar ligeiramente para cima'
    },
    'Levantamento terra': {
      descricao: 'Exercício completo de força',
      video_url: 'https://www.youtube.com/watch?v=apzFT8P9A5c',
      passos: [
        '1. Barra no chão, sobre a linha dos pés',
        '2. Pés largura do quadril',
        '3. Segure a barra, braços esticados fora das pernas',
        '4. Peito para cima, core ativado',
        '5. Empurre pernas e estique quadril simultaneamente'
      ],
      dicas: 'Barra sempre próxima ao corpo. Costas neutra SEMPRE. Não arredondar lombar'
    },
    'Desenvolvimento': {
      descricao: 'Principal exercício para ombros',
      video_url: 'https://www.youtube.com/watch?v=qEwKCR5JCog',
      passos: [
        '1. Sentado com costas apoiadas',
        '2. Halteres na altura dos ombros',
        '3. Empurre para cima até braços quase esticados',
        '4. Não travar cotovelos',
        '5. Desça controladamente'
      ],
      dicas: 'Não arquear demais as costas. Core ativado'
    },
    'Barra fixa': {
      descricao: 'Exercício fundamental para costas',
      passos: [
        '1. Pegada pronada (palmas para frente)',
        '2. Pendurado, braços esticados',
        '3. Puxe até queixo passar a barra',
        '4. Peito para frente, cotovelos para baixo e trás',
        '5. Desça controladamente'
      ],
      dicas: 'Não balançar corpo. Se não conseguir, use máquina assistida ou elástico'
    },
    'Leg press 45°': {
      descricao: 'Exercício seguro e efetivo para pernas',
      passos: [
        '1. Costas e quadril colados no encosto',
        '2. Pés na plataforma, largura dos ombros',
        '3. Destrave e desça controladamente',
        '4. Desça até joelhos formarem 90°',
        '5. Empurre pelos calcanhares'
      ],
      dicas: 'Não desgrudar lombar do encosto. Não travar joelhos totalmente'
    },
    'Puxada frontal': {
      descricao: 'Desenvolvimento de costas e largura',
      passos: [
        '1. Sentado, coxas travadas no apoio',
        '2. Pegada aberta (mais que largura ombros)',
        '3. Puxe barra até altura do peito',
        '4. Cotovelos para baixo e trás',
        '5. Aperte escápulas no final'
      ],
      dicas: 'Não balançar tronco. Movimento controlado'
    },
    'Rosca direta': {
      descricao: 'Exercício clássico para bíceps',
      passos: [
        '1. Em pé, cotovelos fixos ao lado do corpo',
        '2. Barra ou halteres nas mãos',
        '3. Curl até máxima contração',
        '4. Pause 1 segundo no topo',
        '5. Desça controladamente'
      ],
      dicas: 'Não balançar corpo. Cotovelos sempre fixos. Supinação completa no topo'
    }
  }
};

// Dicas gerais por programa
export const programTips = {
  sedentario: [
    '💧 Hidrate-se bem antes, durante e depois',
    '👟 Use tênis confortável',
    '⏰ Escolha um horário fixo para criar hábito',
    '📝 Registre cada treino completo',
    '🎵 Música motivacional ajuda muito',
    '😴 Descanse bem entre os dias de treino',
    '🍎 Alimentação balanceada é essencial'
  ],
  
  casa_sem: [
    '🏠 Limpe um espaço de 2x2m para treinar',
    '🪑 Teste a resistência dos móveis antes',
    '👟 Pode treinar descalço ou com tênis',
    '📱 Grave-se para corrigir postura',
    '💪 Foco na forma correta, não na velocidade',
    '⏱️ Use cronômetro para pranchas e isometrias',
    '🧘 Alongue bem antes e depois'
  ],
  
  casa_com: [
    '⚖️ Tenha halteres de 2-3 pesos diferentes',
    '🎽 Elásticos de resistências variadas',
    '🪑 Banco ajustável é um ótimo investimento',
    '📐 Espelho para checar forma',
    '📊 Anote cargas usadas em cada exercício',
    '⬆️ Aumente carga quando completar todas reps facilmente',
    '🔄 Varie pegadas e ângulos para progressão'
  ],
  
  academia: [
    '📝 Leve caderno para anotar cargas',
    '⚡ Aquecimento articular é obrigatório',
    '🎯 Técnica perfeita > Carga alta',
    '😴 7-8h de sono para recuperação',
    '🍗 Proteína suficiente (1.8-2g/kg peso)',
    '💧 Beba 3-4L de água por dia',
    '📈 Aumente carga 2.5-5% a cada 2 semanas',
    '🧘 Mobilidade e flexibilidade previnem lesões',
    '👥 Considere ter um parceiro de treino',
    '🎧 Playlist energética aumenta performance'
  ]
};

