// Guia de Execução dos Exercícios
// Atualizado com base ABCDE completa

import { ALL_EXERCISES, CATEGORY_NAMES, LEVEL_NAMES } from './exercises-database';

export interface ExerciseInstruction {
  descricao: string;
  video_url?: string;
  passos: string[];
  dicas: string;
}

export const exerciseInstructions: Record<string, Record<string, ExerciseInstruction>> = {
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

  // EXERCÍCIOS DE ACADEMIA - CATEGORIA A (PEITO + TRÍCEPS)
  academia: {
    // A - PEITO/TRÍCEPS
    'Flexão tradicional': {
      descricao: 'Exercício clássico para peito e tríceps (A13)',
      passos: [
        '1. Mãos na largura dos ombros, corpo reto',
        '2. Core ativado, glúteos contraídos',
        '3. Desça até peito quase tocar o chão',
        '4. Cotovelos a 45° do corpo',
        '5. Empurre para cima explosivamente'
      ],
      dicas: 'Base de todos os push exercises. Domine antes de avançar'
    },
    'Supino reto barra': {
      descricao: 'Exercício principal para peito (A01)',
      video_url: 'https://www.youtube.com/watch?v=rT7DgCr-3pg',
      passos: [
        '1. Deite no banco, pés firmes no chão',
        '2. Pegada na largura dos ombros + 10cm',
        '3. Tire a barra do suporte com braços esticados',
        '4. Desça controladamente até tocar peito',
        '5. Empurre explosivamente'
      ],
      dicas: 'Escápulas retraídas e peito para cima durante todo movimento'
    },
    'Supino reto halter': {
      descricao: 'Variação com halteres para maior amplitude (A02)',
      passos: [
        '1. Halteres na altura do peito, cotovelos abertos',
        '2. Empurre para cima em arco leve',
        '3. Aproxime os halteres no topo',
        '4. Desça controladamente até sentir alongamento no peito',
        '5. Mantenha escápulas retraídas'
      ],
      dicas: 'Maior amplitude que barra, ótimo para ativação'
    },
    'Chest press máquina': {
      descricao: 'Supino guiado na máquina (A20)',
      passos: [
        '1. Ajuste altura do banco para pegadores na linha do peito',
        '2. Costas apoiadas, peito elevado',
        '3. Empurre sem travar cotovelos',
        '4. Retorne controladamente',
        '5. Expire na fase concêntrica'
      ],
      dicas: 'Ideal para iniciantes aprenderem o movimento'
    },
    'Crucifixo reto': {
      descricao: 'Isolamento de peitoral (A06)',
      passos: [
        '1. Deitado no banco, halteres acima do peito',
        '2. Cotovelos levemente flexionados (15-20°)',
        '3. Abra os braços até sentir alongamento no peito',
        '4. Junte os halteres acima do peito',
        '5. Mantenha mesma flexão de cotovelo'
      ],
      dicas: 'Foco no alongamento e contração, não no peso'
    },
    'Tríceps pulley': {
      descricao: 'Extensão de tríceps na polia (A25)',
      passos: [
        '1. Polia alta, pegada pronada',
        '2. Cotovelos fixos ao lado do corpo',
        '3. Estenda os braços completamente',
        '4. Aperte tríceps no final',
        '5. Retorne controladamente'
      ],
      dicas: 'Não mova os cotovelos, apenas os antebraços'
    },
    'Mergulho em paralelas': {
      descricao: 'Dips para peito e tríceps (A37)',
      passos: [
        '1. Apoie nas paralelas, braços esticados',
        '2. Incline o tronco para frente (foco peito)',
        '3. Desça até 90° de flexão do cotovelo',
        '4. Empurre para cima até extensão',
        '5. Mantenha core ativado'
      ],
      dicas: 'Mais inclinação = mais peito. Mais reto = mais tríceps'
    },

    // B - COSTAS/BÍCEPS
    'Puxada frente aberta': {
      descricao: 'Desenvolvimento de costas e largura (B01)',
      passos: [
        '1. Sentado, coxas travadas no apoio',
        '2. Pegada aberta (mais que largura ombros)',
        '3. Puxe barra até altura do peito',
        '4. Cotovelos para baixo e trás',
        '5. Aperte escápulas no final'
      ],
      dicas: 'Não balançar tronco. Movimento controlado'
    },
    'Remada baixa': {
      descricao: 'Exercício para espessura das costas (B11)',
      passos: [
        '1. Sentado, pés apoiados na plataforma',
        '2. Pegue a barra/triângulo com braços esticados',
        '3. Puxe em direção ao abdômen',
        '4. Aperte as escápulas juntas',
        '5. Retorne controladamente'
      ],
      dicas: 'Mantenha a coluna neutra durante todo o movimento'
    },
    'Barra fixa pronada': {
      descricao: 'Exercício fundamental para costas (B03)',
      passos: [
        '1. Pegada pronada (palmas para frente)',
        '2. Pendurado, braços esticados',
        '3. Puxe até queixo passar a barra',
        '4. Peito para frente, cotovelos para baixo e trás',
        '5. Desça controladamente'
      ],
      dicas: 'Não balançar corpo. Se não conseguir, use máquina assistida'
    },
    'Rosca direta barra': {
      descricao: 'Exercício clássico para bíceps (B26)',
      passos: [
        '1. Em pé, cotovelos fixos ao lado do corpo',
        '2. Barra nas mãos, pegada supinada',
        '3. Curl até máxima contração',
        '4. Pause 1 segundo no topo',
        '5. Desça controladamente'
      ],
      dicas: 'Não balançar corpo. Cotovelos sempre fixos'
    },
    'Rosca martelo': {
      descricao: 'Trabalha bíceps e braquial (B29)',
      passos: [
        '1. Halteres ao lado do corpo, palmas neutras',
        '2. Curl mantendo pegada neutra',
        '3. Suba até contração máxima',
        '4. Desça controladamente',
        '5. Alterne ou faça simultâneo'
      ],
      dicas: 'Excelente para largura do braço'
    },

    // C - PERNAS
    'Agachamento livre': {
      descricao: 'Rei dos exercícios para pernas (C01)',
      video_url: 'https://www.youtube.com/watch?v=1xMaFs0L3ao',
      passos: [
        '1. Barra nas costas (trapézio superior)',
        '2. Pés largura dos ombros, pontas levemente para fora',
        '3. Inspire e desça controladamente',
        '4. Desça até coxas paralelas ao chão (mínimo)',
        '5. Empurre pelos calcanhares para subir'
      ],
      dicas: 'Joelhos na direção dos pés. Core sempre ativado'
    },
    'Leg press': {
      descricao: 'Exercício seguro e efetivo para pernas (C09)',
      passos: [
        '1. Costas e quadril colados no encosto',
        '2. Pés na plataforma, largura dos ombros',
        '3. Destrave e desça controladamente',
        '4. Desça até joelhos formarem 90°',
        '5. Empurre pelos calcanhares'
      ],
      dicas: 'Não desgrudar lombar do encosto. Não travar joelhos'
    },
    'Afundo': {
      descricao: 'Exercício unilateral para pernas (C11)',
      passos: [
        '1. Dê um passo à frente',
        '2. Desça até joelho traseiro quase tocar o chão',
        '3. Joelho da frente não ultrapassa o pé',
        '4. Empurre para voltar à posição inicial',
        '5. Alterne as pernas'
      ],
      dicas: 'Mantenha tronco ereto e core ativado'
    },
    'Stiff': {
      descricao: 'Posterior e glúteos (C20)',
      passos: [
        '1. Barra/halteres na frente das coxas',
        '2. Joelhos levemente flexionados (fixos)',
        '3. Empurre o quadril para trás',
        '4. Desça até sentir alongamento no posterior',
        '5. Retorne apertando glúteos'
      ],
      dicas: 'Costas retas durante todo movimento'
    },

    // D - OMBRO/ABDÔMEN
    'Desenvolvimento barra': {
      descricao: 'Principal exercício para ombros (D01)',
      passos: [
        '1. Sentado ou em pé, barra na frente dos ombros',
        '2. Empurre para cima passando pelo rosto',
        '3. Estenda os braços sem travar',
        '4. Desça controladamente até ombros',
        '5. Core ativado para estabilidade'
      ],
      dicas: 'Não arquear demais as costas'
    },
    'Elevação lateral': {
      descricao: 'Isolamento do deltóide lateral (D05)',
      passos: [
        '1. Halteres ao lado do corpo',
        '2. Eleve os braços lateralmente até altura dos ombros',
        '3. Cotovelos levemente flexionados',
        '4. Desça controladamente',
        '5. Não balance o corpo'
      ],
      dicas: 'Mindinho ligeiramente mais alto que polegar no topo'
    },
    'Prancha': {
      descricao: 'Exercício fundamental para core (D26)',
      passos: [
        '1. Apoie antebraços e pontas dos pés',
        '2. Corpo forma uma linha reta',
        '3. Ative abdômen, glúteos e coxas',
        '4. Mantenha a posição pelo tempo determinado',
        '5. Não deixe o quadril subir ou descer'
      ],
      dicas: 'Qualidade > tempo. Comece com 20s e evolua'
    },
    'Crunch': {
      descricao: 'Abdominal clássico (D29)',
      passos: [
        '1. Deitado, joelhos flexionados, pés no chão',
        '2. Mãos atrás da cabeça ou cruzadas no peito',
        '3. Eleve ombros do chão contraindo abdômen',
        '4. Não puxe a cabeça com as mãos',
        '5. Desça controladamente'
      ],
      dicas: 'Foco na contração abdominal, não no movimento'
    },

    // E - GLÚTEOS/POSTERIOR
    'Elevação pélvica': {
      descricao: 'Ativação de glúteos (E01)',
      passos: [
        '1. Deitado, joelhos flexionados, pés no chão',
        '2. Eleve o quadril apertando os glúteos',
        '3. Forme uma linha reta do joelho ao ombro',
        '4. Pause no topo por 2 segundos',
        '5. Desça controladamente'
      ],
      dicas: 'Concentre a força nos glúteos, não nas costas'
    },
    'Hip thrust barra': {
      descricao: 'Melhor exercício para glúteos (E03)',
      passos: [
        '1. Apoie a parte superior das costas no banco',
        '2. Barra na linha do quadril',
        '3. Pés na largura dos ombros',
        '4. Eleve o quadril até extensão completa',
        '5. Aperte os glúteos no topo'
      ],
      dicas: 'Queixo no peito para evitar hiperextensão da coluna'
    },
    'Glúteo quatro apoios': {
      descricao: 'Kickback para glúteos (E07)',
      passos: [
        '1. Posição de quatro apoios',
        '2. Uma perna flexionada a 90°',
        '3. Eleve o calcanhar em direção ao teto',
        '4. Aperte o glúteo no topo',
        '5. Desça controladamente'
      ],
      dicas: 'Não balance o corpo. Movimento isolado do glúteo'
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

// Função para buscar instrução de exercício
export const getExerciseInstruction = (exerciseName: string, location: 'casa' | 'academia' = 'academia'): ExerciseInstruction | null => {
  // Primeiro tenta no local específico
  if (exerciseInstructions[location]?.[exerciseName]) {
    return exerciseInstructions[location][exerciseName];
  }
  
  // Depois tenta no outro local
  const otherLocation = location === 'casa' ? 'academia' : 'casa';
  if (exerciseInstructions[otherLocation]?.[exerciseName]) {
    return exerciseInstructions[otherLocation][exerciseName];
  }
  
  return null;
};

// Exportar categorias e níveis
export { ALL_EXERCISES, CATEGORY_NAMES, LEVEL_NAMES };
