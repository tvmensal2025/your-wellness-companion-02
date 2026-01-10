// 🏋️ BASE DE EXERCÍCIOS COMPLETA - CASA + ACADEMIA
// 257 exercícios organizados em ABCDE
// Níveis: N1 (Iniciante) → N4 (Expert)

export interface Exercise {
  code: string;
  name: string;
  level: 1 | 2 | 3 | 4;
  category: 'A' | 'B' | 'C' | 'D' | 'E';
  muscleGroup: string[];
  equipment: string[];
  location: 'casa' | 'academia';
  reps: string;
  sets: number;
  restTime: number;
  calories: number;
  instructions: string[];
  tips: string[];
  description?: string;
}

// Nomes das categorias
export const CATEGORY_NAMES: Record<string, string> = {
  A: 'Peito + Tríceps',
  B: 'Costas + Bíceps',
  C: 'Pernas',
  D: 'Ombro + Abdômen',
  E: 'Glúteos + Posterior',
};

// Descrições dos níveis
export const LEVEL_NAMES: Record<number, string> = {
  1: 'Iniciante',
  2: 'Intermediário',
  3: 'Avançado',
  4: 'Expert',
};

// ============================================
// 🏠 EXERCÍCIOS EM CASA
// ============================================

// 🅰️ CASA - PEITO + TRÍCEPS
export const HOME_A: Exercise[] = [
  { code: 'HA01', name: 'Flexão tradicional', level: 1, category: 'A', muscleGroup: ['peito', 'tríceps', 'ombros'], equipment: [], location: 'casa', reps: '8-12', sets: 3, restTime: 60, calories: 8, instructions: ['Apoie as mãos no chão na largura dos ombros', 'Mantenha o corpo reto como uma prancha', 'Desça até o peito quase tocar o chão', 'Empurre de volta à posição inicial'], tips: ['Se for difícil, comece com joelhos no chão', 'Mantenha o abdômen contraído'] },
  { code: 'HA02', name: 'Flexão inclinada', level: 1, category: 'A', muscleGroup: ['peito inferior', 'tríceps'], equipment: ['cadeira'], location: 'casa', reps: '10-15', sets: 3, restTime: 60, calories: 6, instructions: ['Mãos apoiadas em superfície elevada', 'Corpo inclinado para cima', 'Desça controladamente', 'Empurre de volta'], tips: ['Quanto mais alto o apoio, mais fácil'] },
  { code: 'HA03', name: 'Flexão aberta', level: 1, category: 'A', muscleGroup: ['peito', 'tríceps'], equipment: [], location: 'casa', reps: '8-12', sets: 3, restTime: 60, calories: 8, instructions: ['Mãos mais abertas que a largura dos ombros', 'Dedos apontando levemente para fora', 'Desça controladamente', 'Foco no peito durante o movimento'], tips: ['Ótimo para trabalhar mais o peito'] },
  { code: 'HA04', name: 'Flexão fechada', level: 1, category: 'A', muscleGroup: ['tríceps', 'peito'], equipment: [], location: 'casa', reps: '8-12', sets: 3, restTime: 60, calories: 8, instructions: ['Mãos próximas, formando um triângulo', 'Cotovelos junto ao corpo', 'Desça até o peito tocar as mãos', 'Empurre de volta'], tips: ['Foco total no tríceps'] },
  { code: 'HA05', name: 'Tríceps banco', level: 1, category: 'A', muscleGroup: ['tríceps'], equipment: ['cadeira'], location: 'casa', reps: '10-15', sets: 3, restTime: 60, calories: 6, instructions: ['Sente na borda da cadeira', 'Mãos apoiadas ao lado do quadril', 'Deslize para frente e desça o corpo', 'Empurre de volta usando os tríceps'], tips: ['Pernas esticadas = mais difícil'] },
  { code: 'HA06', name: 'Isometria de flexão', level: 1, category: 'A', muscleGroup: ['peito', 'tríceps', 'core'], equipment: [], location: 'casa', reps: '20-30 seg', sets: 3, restTime: 45, calories: 5, instructions: ['Posição de flexão com braços estendidos', 'Desça até metade do movimento', 'Segure a posição', 'Mantenha respiração controlada'], tips: ['Excelente para ganhar força inicial'] },
  { code: 'HA07', name: 'Flexão diamante', level: 2, category: 'A', muscleGroup: ['tríceps', 'peito'], equipment: [], location: 'casa', reps: '8-12', sets: 3, restTime: 60, calories: 9, instructions: ['Mãos juntas formando um diamante', 'Polegares e indicadores se tocam', 'Desça até o peito tocar as mãos', 'Empurre de volta'], tips: ['Exercício avançado para tríceps'] },
  { code: 'HA08', name: 'Mergulho entre cadeiras', level: 2, category: 'A', muscleGroup: ['tríceps', 'peito'], equipment: ['cadeira'], location: 'casa', reps: '8-12', sets: 3, restTime: 90, calories: 10, instructions: ['Duas cadeiras paralelas', 'Mãos apoiadas em cada cadeira', 'Desça o corpo entre elas', 'Empurre de volta'], tips: ['Cuidado com a estabilidade das cadeiras'] },
  { code: 'HA09', name: 'Flexão hindu', level: 3, category: 'A', muscleGroup: ['peito', 'ombros', 'tríceps', 'core'], equipment: [], location: 'casa', reps: '8-10', sets: 3, restTime: 60, calories: 12, instructions: ['Comece em V invertido', 'Mergulhe para frente passando rente ao chão', 'Suba arqueando as costas', 'Volte à posição inicial'], tips: ['Movimento fluido e contínuo'] },
  { code: 'HA10', name: 'Flexão explosiva', level: 4, category: 'A', muscleGroup: ['peito', 'tríceps'], equipment: [], location: 'casa', reps: '6-10', sets: 3, restTime: 90, calories: 12, instructions: ['Flexão tradicional', 'Empurre com força para decolar do chão', 'Aterrisse suavemente', 'Repita imediatamente'], tips: ['Desenvolve potência muscular'] },
  { code: 'HA11', name: 'Flexão com palmas', level: 4, category: 'A', muscleGroup: ['peito', 'tríceps'], equipment: [], location: 'casa', reps: '5-8', sets: 3, restTime: 90, calories: 14, instructions: ['Flexão explosiva', 'Bata palmas no ar', 'Aterrisse e repita'], tips: ['Máxima potência'] },
  { code: 'HA12', name: 'Flexão arqueiro', level: 4, category: 'A', muscleGroup: ['peito', 'tríceps'], equipment: [], location: 'casa', reps: '5-8 cada', sets: 3, restTime: 90, calories: 12, instructions: ['Mãos bem abertas', 'Desça para um lado, esticando o outro braço', 'Alterne os lados'], tips: ['Preparação para flexão de um braço'] },
];

// 🅱️ CASA - COSTAS + BÍCEPS
export const HOME_B: Exercise[] = [
  { code: 'HB01', name: 'Remada invertida (mesa)', level: 1, category: 'B', muscleGroup: ['costas', 'bíceps'], equipment: ['mesa'], location: 'casa', reps: '10-15', sets: 3, restTime: 60, calories: 7, instructions: ['Deite embaixo de uma mesa resistente', 'Segure a borda da mesa', 'Puxe o peito em direção à mesa', 'Desça controladamente'], tips: ['Quanto mais horizontal, mais difícil'] },
  { code: 'HB02', name: 'Superman', level: 1, category: 'B', muscleGroup: ['lombar', 'costas', 'glúteos'], equipment: [], location: 'casa', reps: '12-15', sets: 3, restTime: 45, calories: 5, instructions: ['Deite de barriga para baixo', 'Braços estendidos à frente', 'Levante braços e pernas simultaneamente', 'Segure 2-3 segundos no topo'], tips: ['Não force o pescoço'] },
  { code: 'HB03', name: 'Extensão lombar', level: 1, category: 'B', muscleGroup: ['lombar'], equipment: [], location: 'casa', reps: '12-15', sets: 3, restTime: 45, calories: 4, instructions: ['Deite de barriga para baixo', 'Mãos atrás da cabeça', 'Levante o tronco do chão', 'Desça controladamente'], tips: ['Movimento suave, sem trancos'] },
  { code: 'HB04', name: 'Rosca com garrafa', level: 1, category: 'B', muscleGroup: ['bíceps'], equipment: ['garrafa'], location: 'casa', reps: '12-15', sets: 3, restTime: 60, calories: 4, instructions: ['Segure garrafas cheias de água/areia', 'Cotovelos junto ao corpo', 'Flexione os braços', 'Desça controladamente'], tips: ['Use garrafas de 1.5L ou 2L'] },
  { code: 'HB05', name: 'Remada com toalha', level: 1, category: 'B', muscleGroup: ['costas', 'bíceps'], equipment: ['toalha', 'porta'], location: 'casa', reps: '12-15', sets: 3, restTime: 60, calories: 6, instructions: ['Amarre toalha na maçaneta', 'Segure as pontas e incline para trás', 'Puxe o corpo em direção à porta', 'Volte controladamente'], tips: ['Certifique-se que a porta está travada'] },
  { code: 'HB06', name: 'Rosca martelo', level: 2, category: 'B', muscleGroup: ['bíceps', 'antebraço'], equipment: ['garrafa'], location: 'casa', reps: '10-12', sets: 3, restTime: 60, calories: 5, instructions: ['Segure peso com pegada neutra', 'Flexione alternando os braços', 'Mantenha cotovelos fixos'], tips: ['Trabalha também o antebraço'] },
  { code: 'HB07', name: 'Barra fixa pronada', level: 3, category: 'B', muscleGroup: ['costas', 'bíceps'], equipment: ['barra de porta'], location: 'casa', reps: '5-10', sets: 3, restTime: 90, calories: 12, instructions: ['Pegada pronada (palmas para frente)', 'Puxe até o queixo passar a barra', 'Desça controladamente'], tips: ['Se não conseguir, faça negativas'] },
  { code: 'HB08', name: 'Barra fixa supinada', level: 3, category: 'B', muscleGroup: ['bíceps', 'costas'], equipment: ['barra de porta'], location: 'casa', reps: '5-10', sets: 3, restTime: 90, calories: 12, instructions: ['Pegada supinada (palmas para você)', 'Puxe até o queixo passar a barra', 'Foco no bíceps'], tips: ['Mais fácil que pronada'] },
  { code: 'HB09', name: 'Barra negativa', level: 4, category: 'B', muscleGroup: ['costas', 'bíceps'], equipment: ['barra de porta'], location: 'casa', reps: '5-8', sets: 3, restTime: 90, calories: 10, instructions: ['Suba com ajuda (pule ou use cadeira)', 'Desça em 5-8 segundos', 'Foco na fase negativa'], tips: ['Excelente para ganhar força para barra'] },
  { code: 'HB10', name: 'Barra fixa isométrica', level: 4, category: 'B', muscleGroup: ['costas', 'bíceps'], equipment: ['barra de porta'], location: 'casa', reps: '20-30 seg', sets: 3, restTime: 90, calories: 8, instructions: ['Suba até o queixo passar a barra', 'Segure a posição', 'Mantenha o máximo possível'], tips: ['Desenvolve força estática'] },
];

// 🅲 CASA - PERNAS
export const HOME_C: Exercise[] = [
  { code: 'HC01', name: 'Agachamento livre', level: 1, category: 'C', muscleGroup: ['quadríceps', 'glúteos'], equipment: [], location: 'casa', reps: '15-20', sets: 3, restTime: 60, calories: 8, instructions: ['Pés na largura dos ombros', 'Desça como se fosse sentar', 'Coxas paralelas ao chão', 'Empurre pelos calcanhares'], tips: ['Joelhos acompanham a direção dos pés'] },
  { code: 'HC02', name: 'Afundo', level: 1, category: 'C', muscleGroup: ['quadríceps', 'glúteos'], equipment: [], location: 'casa', reps: '10-12 cada', sets: 3, restTime: 60, calories: 8, instructions: ['Dê um passo à frente', 'Desça até o joelho de trás quase tocar o chão', 'Joelho da frente não passa da ponta do pé', 'Empurre de volta'], tips: ['Mantenha o tronco ereto'] },
  { code: 'HC03', name: 'Wall sit', level: 1, category: 'C', muscleGroup: ['quadríceps'], equipment: ['parede'], location: 'casa', reps: '30-60 seg', sets: 3, restTime: 60, calories: 6, instructions: ['Costas na parede', 'Desça até coxas paralelas ao chão', 'Joelhos a 90 graus', 'Segure a posição'], tips: ['Excelente para resistência'] },
  { code: 'HC04', name: 'Step up', level: 1, category: 'C', muscleGroup: ['quadríceps', 'glúteos'], equipment: ['escada'], location: 'casa', reps: '12-15 cada', sets: 3, restTime: 60, calories: 7, instructions: ['Suba em um degrau/banco', 'Empurre com a perna de cima', 'Desça controladamente', 'Alterne as pernas'], tips: ['Quanto mais alto, mais difícil'] },
  { code: 'HC05', name: 'Panturrilha no degrau', level: 1, category: 'C', muscleGroup: ['panturrilha'], equipment: ['escada'], location: 'casa', reps: '15-20', sets: 3, restTime: 45, calories: 4, instructions: ['Apoie a ponta dos pés no degrau', 'Calcanhares para fora do degrau', 'Suba na ponta dos pés', 'Desça abaixo do nível do degrau'], tips: ['Amplitude completa é essencial'] },
  { code: 'HC06', name: 'Agachamento búlgaro', level: 2, category: 'C', muscleGroup: ['quadríceps', 'glúteos'], equipment: ['cadeira'], location: 'casa', reps: '10-12 cada', sets: 3, restTime: 90, calories: 10, instructions: ['Pé de trás apoiado em cadeira/banco', 'Desça até joelho de trás quase tocar o chão', 'Empurre pela perna da frente'], tips: ['Excelente para glúteos'] },
  { code: 'HC07', name: 'Stiff unilateral', level: 2, category: 'C', muscleGroup: ['posterior', 'glúteos'], equipment: [], location: 'casa', reps: '10-12 cada', sets: 3, restTime: 60, calories: 8, instructions: ['Apoie em uma perna só', 'Incline o tronco para frente', 'Perna de trás sobe', 'Sinta o alongamento na posterior'], tips: ['Equilíbrio é fundamental'] },
  { code: 'HC08', name: 'Salto agachado', level: 3, category: 'C', muscleGroup: ['quadríceps', 'glúteos'], equipment: [], location: 'casa', reps: '10-15', sets: 3, restTime: 90, calories: 12, instructions: ['Agachamento normal', 'Salte explosivamente', 'Aterrisse suavemente', 'Repita imediatamente'], tips: ['Desenvolve potência'] },
  { code: 'HC09', name: 'Pistol assistido', level: 3, category: 'C', muscleGroup: ['quadríceps', 'glúteos'], equipment: ['porta'], location: 'casa', reps: '5-8 cada', sets: 3, restTime: 90, calories: 12, instructions: ['Segure em uma porta ou cadeira', 'Uma perna estendida à frente', 'Desça em uma perna só', 'Use o apoio para ajudar'], tips: ['Preparação para pistol squat'] },
  { code: 'HC10', name: 'Pistol squat', level: 4, category: 'C', muscleGroup: ['quadríceps', 'glúteos'], equipment: [], location: 'casa', reps: '3-5 cada', sets: 3, restTime: 90, calories: 15, instructions: ['Uma perna estendida à frente', 'Desça em uma perna só', 'Toque o glúteo no calcanhar', 'Suba sem apoio'], tips: ['Exercício de calistenia avançado'] },
  { code: 'HC11', name: 'Nordic curl', level: 4, category: 'C', muscleGroup: ['posterior'], equipment: ['sofá'], location: 'casa', reps: '5-8', sets: 3, restTime: 90, calories: 10, instructions: ['Ajoelhe com pés presos', 'Desça o corpo para frente lentamente', 'Use as mãos para amortecer', 'Volte usando o posterior'], tips: ['Exercício muito avançado'] },
];

// 🅳 CASA - OMBRO + ABDÔMEN
export const HOME_D: Exercise[] = [
  { code: 'HD01', name: 'Prancha', level: 1, category: 'D', muscleGroup: ['abdômen', 'core'], equipment: [], location: 'casa', reps: '30-60 seg', sets: 3, restTime: 45, calories: 5, instructions: ['Apoie antebraços e pontas dos pés', 'Corpo reto como uma tábua', 'Abdômen contraído', 'Não deixe o quadril subir ou descer'], tips: ['Base de todo treino de core'] },
  { code: 'HD02', name: 'Crunch', level: 1, category: 'D', muscleGroup: ['abdômen'], equipment: [], location: 'casa', reps: '15-20', sets: 3, restTime: 45, calories: 4, instructions: ['Deite com joelhos dobrados', 'Mãos atrás da cabeça', 'Levante os ombros do chão', 'Contraia o abdômen no topo'], tips: ['Não puxe o pescoço'] },
  { code: 'HD03', name: 'Prancha lateral', level: 1, category: 'D', muscleGroup: ['oblíquos', 'core'], equipment: [], location: 'casa', reps: '20-30 seg cada', sets: 3, restTime: 45, calories: 5, instructions: ['Apoie um antebraço e lateral do pé', 'Corpo reto, quadril elevado', 'Mantenha a posição', 'Troque de lado'], tips: ['Trabalha os oblíquos'] },
  { code: 'HD04', name: 'Abdominal infra', level: 1, category: 'D', muscleGroup: ['abdômen inferior'], equipment: [], location: 'casa', reps: '12-15', sets: 3, restTime: 45, calories: 5, instructions: ['Deite com pernas estendidas', 'Levante as pernas até 90 graus', 'Desça controladamente', 'Não deixe as costas arquearem'], tips: ['Foco no abdômen inferior'] },
  { code: 'HD05', name: 'Elevação lateral (garrafa)', level: 1, category: 'D', muscleGroup: ['ombros'], equipment: ['garrafa'], location: 'casa', reps: '12-15', sets: 3, restTime: 60, calories: 4, instructions: ['Segure garrafas nas mãos', 'Braços ao lado do corpo', 'Levante até altura dos ombros', 'Desça controladamente'], tips: ['Não balance o corpo'] },
  { code: 'HD06', name: 'Elevação de pernas', level: 2, category: 'D', muscleGroup: ['abdômen inferior'], equipment: [], location: 'casa', reps: '12-15', sets: 3, restTime: 60, calories: 6, instructions: ['Deite com mãos embaixo do quadril', 'Pernas estendidas', 'Levante até 90 graus', 'Desça sem tocar o chão'], tips: ['Mantenha lombar no chão'] },
  { code: 'HD07', name: 'Rotação russa', level: 2, category: 'D', muscleGroup: ['oblíquos'], equipment: ['garrafa'], location: 'casa', reps: '20 total', sets: 3, restTime: 60, calories: 6, instructions: ['Sente com joelhos dobrados', 'Incline o tronco para trás', 'Gire o tronco de um lado para outro', 'Toque o chão com as mãos'], tips: ['Pés podem ficar no chão ou elevados'] },
  { code: 'HD08', name: 'Pike push up', level: 2, category: 'D', muscleGroup: ['ombros', 'tríceps'], equipment: [], location: 'casa', reps: '8-12', sets: 3, restTime: 60, calories: 8, instructions: ['Posição de V invertido', 'Quadril alto, pernas retas', 'Desça a cabeça em direção ao chão', 'Empurre de volta'], tips: ['Preparação para handstand'] },
  { code: 'HD09', name: 'Handstand push up (parede)', level: 3, category: 'D', muscleGroup: ['ombros', 'tríceps'], equipment: ['parede'], location: 'casa', reps: '5-8', sets: 3, restTime: 90, calories: 12, instructions: ['Fique de cabeça para baixo na parede', 'Mãos na largura dos ombros', 'Desça até a cabeça tocar o chão', 'Empurre de volta'], tips: ['Exercício avançado de ombros'] },
  { code: 'HD10', name: 'Abdominal V', level: 3, category: 'D', muscleGroup: ['abdômen'], equipment: [], location: 'casa', reps: '10-12', sets: 3, restTime: 60, calories: 8, instructions: ['Deite com braços estendidos atrás', 'Levante pernas e tronco simultaneamente', 'Toque os pés com as mãos', 'Volte à posição inicial'], tips: ['Movimento explosivo'] },
  { code: 'HD11', name: 'Elevação pernas suspenso', level: 3, category: 'D', muscleGroup: ['abdômen inferior'], equipment: ['barra de porta'], location: 'casa', reps: '8-12', sets: 3, restTime: 60, calories: 10, instructions: ['Pendure na barra', 'Levante as pernas até 90 graus', 'Desça controladamente'], tips: ['Não balance o corpo'] },
  { code: 'HD12', name: 'Core completo', level: 4, category: 'D', muscleGroup: ['core', 'abdômen', 'oblíquos'], equipment: [], location: 'casa', reps: '5 min', sets: 1, restTime: 120, calories: 25, instructions: ['Prancha 1 min', 'Prancha lateral direita 30s', 'Prancha lateral esquerda 30s', 'Mountain climbers 1 min', 'Prancha final 1 min'], tips: ['Circuito completo de core'] },
];

// 🅴 CASA - GLÚTEOS + POSTERIOR
export const HOME_E: Exercise[] = [
  { code: 'HE01', name: 'Elevação pélvica', level: 1, category: 'E', muscleGroup: ['glúteos'], equipment: [], location: 'casa', reps: '15-20', sets: 3, restTime: 60, calories: 6, instructions: ['Deite com joelhos dobrados', 'Pés no chão, braços ao lado', 'Levante o quadril contraindo glúteos', 'Segure 2 segundos no topo'], tips: ['Base de todo treino de glúteos'] },
  { code: 'HE02', name: 'Glúteo quatro apoios', level: 1, category: 'E', muscleGroup: ['glúteos'], equipment: [], location: 'casa', reps: '15-20 cada', sets: 3, restTime: 60, calories: 5, instructions: ['Posição de quatro apoios', 'Levante uma perna para trás', 'Mantenha joelho a 90 graus', 'Contraia o glúteo no topo'], tips: ['Não arqueie as costas'] },
  { code: 'HE03', name: 'Abdução de quadril deitado', level: 1, category: 'E', muscleGroup: ['glúteo médio'], equipment: [], location: 'casa', reps: '15-20 cada', sets: 3, restTime: 45, calories: 4, instructions: ['Deite de lado', 'Levante a perna de cima', 'Mantenha o corpo alinhado', 'Desça controladamente'], tips: ['Trabalha o glúteo médio'] },
  { code: 'HE04', name: 'Coice de glúteo', level: 1, category: 'E', muscleGroup: ['glúteos'], equipment: [], location: 'casa', reps: '15-20 cada', sets: 3, restTime: 60, calories: 5, instructions: ['Posição de quatro apoios', 'Chute uma perna para trás e para cima', 'Contraia o glúteo no topo', 'Retorne controladamente'], tips: ['Movimento controlado'] },
  { code: 'HE05', name: 'Ponte unilateral', level: 2, category: 'E', muscleGroup: ['glúteos'], equipment: [], location: 'casa', reps: '10-12 cada', sets: 3, restTime: 60, calories: 7, instructions: ['Elevação pélvica com uma perna só', 'Outra perna estendida', 'Levante o quadril', 'Desça controladamente'], tips: ['Dobra a intensidade'] },
  { code: 'HE06', name: 'Afundo reverso', level: 2, category: 'E', muscleGroup: ['glúteos', 'quadríceps'], equipment: [], location: 'casa', reps: '10-12 cada', sets: 3, restTime: 60, calories: 8, instructions: ['Dê um passo para trás', 'Desça até joelho quase tocar o chão', 'Empurre de volta', 'Alterne as pernas'], tips: ['Mais foco no glúteo que afundo frontal'] },
  { code: 'HE07', name: 'Agachamento sumô', level: 2, category: 'E', muscleGroup: ['glúteos', 'adutores'], equipment: [], location: 'casa', reps: '12-15', sets: 3, restTime: 60, calories: 8, instructions: ['Pés bem abertos, pontas para fora', 'Desça mantendo joelhos para fora', 'Empurre pelos calcanhares'], tips: ['Trabalha mais glúteos e adutores'] },
  { code: 'HE08', name: 'Hip thrust (sofá)', level: 3, category: 'E', muscleGroup: ['glúteos'], equipment: ['sofá'], location: 'casa', reps: '12-15', sets: 3, restTime: 90, calories: 10, instructions: ['Costas apoiadas no sofá', 'Pés no chão, joelhos dobrados', 'Empurre o quadril para cima', 'Aperte os glúteos no topo'], tips: ['Melhor exercício para glúteos'] },
  { code: 'HE09', name: 'Stiff unilateral', level: 3, category: 'E', muscleGroup: ['posterior', 'glúteos'], equipment: [], location: 'casa', reps: '10-12 cada', sets: 3, restTime: 90, calories: 8, instructions: ['Apoie em uma perna só', 'Incline o tronco para frente', 'Perna de trás sobe', 'Sinta o alongamento'], tips: ['Equilíbrio é fundamental'] },
  { code: 'HE10', name: 'Glúteo máximo', level: 4, category: 'E', muscleGroup: ['glúteos'], equipment: [], location: 'casa', reps: 'Até falha', sets: 3, restTime: 120, calories: 15, instructions: ['Elevação pélvica até a falha', 'Descanse 10 segundos', 'Continue até falha novamente'], tips: ['Técnica de intensidade máxima'] },
];

// ============================================
// 🏋️ EXERCÍCIOS DE ACADEMIA
// ============================================

// 🅰️ ACADEMIA - PEITO + TRÍCEPS
export const GYM_A: Exercise[] = [
  { code: 'GA01', name: 'Supino reto com barra', level: 2, category: 'A', muscleGroup: ['peito', 'tríceps', 'ombros'], equipment: ['barra', 'banco'], location: 'academia', reps: '8-12', sets: 4, restTime: 90, calories: 12, instructions: ['Deitado no banco, pés firmes no chão', 'Pegada na largura dos ombros + 10cm', 'Desça a barra até tocar o peito', 'Empurre explosivamente'], tips: ['Escápulas retraídas, peito elevado'] },
  { code: 'GA02', name: 'Supino reto com halteres', level: 1, category: 'A', muscleGroup: ['peito', 'tríceps'], equipment: ['halteres', 'banco'], location: 'academia', reps: '10-12', sets: 3, restTime: 90, calories: 10, instructions: ['Deitado no banco, halteres na altura do peito', 'Empurre para cima em arco leve', 'Aproxime os halteres no topo', 'Desça controladamente'], tips: ['Maior amplitude que barra'] },
  { code: 'GA03', name: 'Supino inclinado com barra', level: 3, category: 'A', muscleGroup: ['peito superior', 'tríceps'], equipment: ['barra', 'banco inclinado'], location: 'academia', reps: '8-10', sets: 4, restTime: 90, calories: 11, instructions: ['Banco inclinado a 30-45°', 'Pegada na largura dos ombros', 'Desça até tocar o peito superior', 'Empurre explosivamente'], tips: ['Foco no peito superior'] },
  { code: 'GA04', name: 'Supino inclinado com halteres', level: 2, category: 'A', muscleGroup: ['peito superior'], equipment: ['halteres', 'banco inclinado'], location: 'academia', reps: '8-12', sets: 3, restTime: 90, calories: 10, instructions: ['Banco inclinado a 30-45°', 'Halteres na altura do peito', 'Empurre para cima', 'Desça controladamente'], tips: ['Maior amplitude de movimento'] },
  { code: 'GA05', name: 'Crucifixo reto', level: 1, category: 'A', muscleGroup: ['peito'], equipment: ['halteres', 'banco'], location: 'academia', reps: '12-15', sets: 3, restTime: 60, calories: 6, instructions: ['Deitado no banco, halteres acima do peito', 'Cotovelos levemente flexionados', 'Abra os braços até sentir alongamento', 'Junte os halteres acima do peito'], tips: ['Foco no alongamento e contração'] },
  { code: 'GA06', name: 'Crucifixo inclinado', level: 2, category: 'A', muscleGroup: ['peito superior'], equipment: ['halteres', 'banco inclinado'], location: 'academia', reps: '10-12', sets: 3, restTime: 60, calories: 7, instructions: ['Banco inclinado a 30-45°', 'Halteres acima do peito', 'Abra os braços mantendo cotovelos flexionados', 'Junte os halteres no topo'], tips: ['Foco no peito superior'] },
  { code: 'GA07', name: 'Peck deck (voador)', level: 1, category: 'A', muscleGroup: ['peito'], equipment: ['máquina'], location: 'academia', reps: '12-15', sets: 3, restTime: 60, calories: 6, instructions: ['Sentado na máquina, costas apoiadas', 'Cotovelos na altura dos ombros', 'Junte os braços à frente', 'Retorne controladamente'], tips: ['Excelente para isolar o peito'] },
  { code: 'GA08', name: 'Cross over alto', level: 3, category: 'A', muscleGroup: ['peito'], equipment: ['polia', 'cross'], location: 'academia', reps: '12-15', sets: 3, restTime: 60, calories: 6, instructions: ['Polias na posição alta', 'Puxe os cabos para baixo e para frente', 'Junte as mãos na frente do corpo', 'Retorne controladamente'], tips: ['Trabalha a parte inferior do peito'] },
  { code: 'GA09', name: 'Cross over baixo', level: 2, category: 'A', muscleGroup: ['peito'], equipment: ['polia', 'cross'], location: 'academia', reps: '12-15', sets: 3, restTime: 60, calories: 6, instructions: ['Polias na posição baixa', 'Puxe os cabos para cima e para frente', 'Junte as mãos na altura do peito', 'Retorne controladamente'], tips: ['Trabalha a parte superior do peito'] },
  { code: 'GA10', name: 'Supino máquina', level: 1, category: 'A', muscleGroup: ['peito'], equipment: ['máquina'], location: 'academia', reps: '12-15', sets: 3, restTime: 60, calories: 7, instructions: ['Ajuste o banco para os pegadores ficarem na linha do peito', 'Costas apoiadas, peito elevado', 'Empurre sem travar os cotovelos', 'Retorne controladamente'], tips: ['Ideal para iniciantes'] },
  { code: 'GA11', name: 'Tríceps na polia', level: 1, category: 'A', muscleGroup: ['tríceps'], equipment: ['polia'], location: 'academia', reps: '12-15', sets: 3, restTime: 60, calories: 5, instructions: ['Polia alta, pegada pronada', 'Cotovelos fixos ao lado do corpo', 'Estenda os braços completamente', 'Retorne controladamente'], tips: ['Não mova os cotovelos'] },
  { code: 'GA12', name: 'Tríceps corda', level: 2, category: 'A', muscleGroup: ['tríceps'], equipment: ['polia', 'corda'], location: 'academia', reps: '12-15', sets: 3, restTime: 60, calories: 5, instructions: ['Polia alta com corda', 'Cotovelos fixos ao lado do corpo', 'Estenda e abra as mãos no final', 'Retorne controladamente'], tips: ['Abrir as mãos no final aumenta a contração'] },
  { code: 'GA13', name: 'Tríceps testa', level: 2, category: 'A', muscleGroup: ['tríceps'], equipment: ['barra', 'banco'], location: 'academia', reps: '10-12', sets: 3, restTime: 60, calories: 6, instructions: ['Deitado no banco, barra acima do peito', 'Desça a barra em direção à testa', 'Estenda os braços', 'Mantenha cotovelos fixos'], tips: ['Movimento apenas dos antebraços'] },
  { code: 'GA14', name: 'Tríceps francês', level: 2, category: 'A', muscleGroup: ['tríceps'], equipment: ['halteres'], location: 'academia', reps: '10-12 cada', sets: 3, restTime: 60, calories: 5, instructions: ['Halter atrás da cabeça com uma mão', 'Cotovelo apontando para cima', 'Estenda o braço', 'Desça controladamente'], tips: ['Use a outra mão para estabilizar'] },
  { code: 'GA15', name: 'Mergulho nas paralelas', level: 2, category: 'A', muscleGroup: ['tríceps', 'peito'], equipment: ['paralelas'], location: 'academia', reps: '8-12', sets: 3, restTime: 90, calories: 10, instructions: ['Apoie nas paralelas, braços esticados', 'Incline o tronco para frente (foco peito)', 'Desça até 90° de flexão', 'Empurre para cima'], tips: ['Mais inclinação = mais peito'] },
];

// 🅱️ ACADEMIA - COSTAS + BÍCEPS
export const GYM_B: Exercise[] = [
  { code: 'GB01', name: 'Puxada frontal aberta', level: 2, category: 'B', muscleGroup: ['costas', 'bíceps'], equipment: ['polia'], location: 'academia', reps: '10-12', sets: 4, restTime: 90, calories: 9, instructions: ['Sentado, coxas travadas no apoio', 'Pegada aberta (mais que largura dos ombros)', 'Puxe a barra até a altura do peito', 'Aperte as escápulas no final'], tips: ['Não balance o tronco'] },
  { code: 'GB02', name: 'Puxada frontal fechada', level: 1, category: 'B', muscleGroup: ['costas', 'bíceps'], equipment: ['polia'], location: 'academia', reps: '10-12', sets: 3, restTime: 60, calories: 8, instructions: ['Pegada fechada (triângulo)', 'Puxe até o peito', 'Aperte as escápulas', 'Retorne controladamente'], tips: ['Trabalha mais o centro das costas'] },
  { code: 'GB03', name: 'Remada baixa', level: 1, category: 'B', muscleGroup: ['costas', 'bíceps'], equipment: ['polia', 'máquina'], location: 'academia', reps: '12-15', sets: 3, restTime: 60, calories: 7, instructions: ['Sentado, pés apoiados na plataforma', 'Pegue a barra com braços esticados', 'Puxe em direção ao abdômen', 'Aperte as escápulas juntas'], tips: ['Mantenha a coluna neutra'] },
  { code: 'GB04', name: 'Remada curvada com barra', level: 2, category: 'B', muscleGroup: ['costas', 'bíceps'], equipment: ['barra'], location: 'academia', reps: '8-12', sets: 4, restTime: 90, calories: 10, instructions: ['Inclinado para frente, costas retas', 'Barra pendurada nos braços', 'Puxe em direção ao abdômen', 'Desça controladamente'], tips: ['Mantenha a coluna neutra'] },
  { code: 'GB05', name: 'Remada unilateral', level: 2, category: 'B', muscleGroup: ['costas'], equipment: ['halteres', 'banco'], location: 'academia', reps: '10-12 cada', sets: 3, restTime: 60, calories: 8, instructions: ['Apoie joelho e mão no banco', 'Halter na outra mão', 'Puxe em direção ao quadril', 'Desça controladamente'], tips: ['Corrige desequilíbrios'] },
  { code: 'GB06', name: 'Barra fixa pronada', level: 3, category: 'B', muscleGroup: ['costas', 'bíceps'], equipment: ['barra fixa'], location: 'academia', reps: '6-10', sets: 4, restTime: 90, calories: 12, instructions: ['Pegada pronada (palmas para frente)', 'Puxe até o queixo passar a barra', 'Desça controladamente'], tips: ['Exercício fundamental'] },
  { code: 'GB07', name: 'Barra fixa supinada', level: 3, category: 'B', muscleGroup: ['bíceps', 'costas'], equipment: ['barra fixa'], location: 'academia', reps: '6-10', sets: 4, restTime: 90, calories: 12, instructions: ['Pegada supinada (palmas para você)', 'Puxe até o queixo passar a barra', 'Foco no bíceps'], tips: ['Mais fácil que pronada'] },
  { code: 'GB08', name: 'Remada cavalinho', level: 2, category: 'B', muscleGroup: ['costas'], equipment: ['máquina'], location: 'academia', reps: '10-12', sets: 3, restTime: 60, calories: 8, instructions: ['Apoiado na máquina', 'Puxe os pegadores em direção ao peito', 'Aperte as escápulas', 'Retorne controladamente'], tips: ['Ótimo para espessura das costas'] },
  { code: 'GB09', name: 'Rosca direta com barra', level: 1, category: 'B', muscleGroup: ['bíceps'], equipment: ['barra'], location: 'academia', reps: '10-12', sets: 3, restTime: 60, calories: 5, instructions: ['Em pé, cotovelos fixos ao lado do corpo', 'Barra nas mãos, pegada supinada', 'Flexione até máxima contração', 'Desça controladamente'], tips: ['Não balance o corpo'] },
  { code: 'GB10', name: 'Rosca alternada', level: 1, category: 'B', muscleGroup: ['bíceps'], equipment: ['halteres'], location: 'academia', reps: '10-12 cada', sets: 3, restTime: 60, calories: 5, instructions: ['Halteres ao lado do corpo', 'Flexione um braço de cada vez', 'Gire o punho durante o movimento', 'Alterne os braços'], tips: ['Supinação aumenta a ativação'] },
  { code: 'GB11', name: 'Rosca martelo', level: 2, category: 'B', muscleGroup: ['bíceps', 'antebraço'], equipment: ['halteres'], location: 'academia', reps: '10-12', sets: 3, restTime: 60, calories: 5, instructions: ['Halteres ao lado do corpo, pegada neutra', 'Flexione mantendo pegada neutra', 'Suba até contração máxima', 'Desça controladamente'], tips: ['Trabalha também o braquial'] },
  { code: 'GB12', name: 'Rosca Scott', level: 2, category: 'B', muscleGroup: ['bíceps'], equipment: ['banco scott', 'barra'], location: 'academia', reps: '10-12', sets: 3, restTime: 60, calories: 5, instructions: ['Braços apoiados no banco Scott', 'Flexione a barra', 'Desça controladamente', 'Não estenda completamente'], tips: ['Isola o bíceps'] },
  { code: 'GB13', name: 'Rosca inclinada', level: 2, category: 'B', muscleGroup: ['bíceps'], equipment: ['halteres', 'banco inclinado'], location: 'academia', reps: '10-12', sets: 3, restTime: 60, calories: 5, instructions: ['Deitado no banco inclinado', 'Braços pendurados', 'Flexione os halteres', 'Desça controladamente'], tips: ['Maior alongamento do bíceps'] },
  { code: 'GB14', name: 'Rosca 21', level: 3, category: 'B', muscleGroup: ['bíceps'], equipment: ['barra'], location: 'academia', reps: '21 (7+7+7)', sets: 3, restTime: 90, calories: 7, instructions: ['7 reps da parte baixa até 90°', '7 reps de 90° até o topo', '7 reps completas'], tips: ['Técnica de intensidade'] },
  { code: 'GB15', name: 'Levantamento terra romeno', level: 3, category: 'B', muscleGroup: ['posterior', 'lombar', 'glúteos'], equipment: ['barra'], location: 'academia', reps: '8-10', sets: 4, restTime: 120, calories: 15, instructions: ['Barra na frente das coxas', 'Joelhos levemente flexionados', 'Desça empurrando o quadril para trás', 'Suba apertando os glúteos'], tips: ['Costas sempre retas'] },
];

// 🅲 ACADEMIA - PERNAS
export const GYM_C: Exercise[] = [
  { code: 'GC01', name: 'Agachamento livre', level: 2, category: 'C', muscleGroup: ['quadríceps', 'glúteos', 'posterior'], equipment: ['barra'], location: 'academia', reps: '8-12', sets: 4, restTime: 120, calories: 15, instructions: ['Barra nas costas (trapézio)', 'Pés largura dos ombros', 'Desça até coxas paralelas', 'Empurre pelos calcanhares'], tips: ['Rei dos exercícios para pernas'] },
  { code: 'GC02', name: 'Leg press', level: 1, category: 'C', muscleGroup: ['quadríceps', 'glúteos'], equipment: ['leg press'], location: 'academia', reps: '12-15', sets: 4, restTime: 90, calories: 12, instructions: ['Costas e quadril colados no encosto', 'Pés na plataforma, largura dos ombros', 'Desça até joelhos formarem 90°', 'Empurre pelos calcanhares'], tips: ['Não trave os joelhos'] },
  { code: 'GC03', name: 'Leg press unilateral', level: 2, category: 'C', muscleGroup: ['quadríceps', 'glúteos'], equipment: ['leg press'], location: 'academia', reps: '10-12 cada', sets: 3, restTime: 90, calories: 10, instructions: ['Uma perna de cada vez', 'Desça controladamente', 'Empurre pelo calcanhar'], tips: ['Corrige desequilíbrios'] },
  { code: 'GC04', name: 'Hack machine', level: 2, category: 'C', muscleGroup: ['quadríceps'], equipment: ['hack'], location: 'academia', reps: '10-12', sets: 4, restTime: 90, calories: 12, instructions: ['Costas apoiadas na máquina', 'Pés na plataforma', 'Desça até 90°', 'Empurre para cima'], tips: ['Foco no quadríceps'] },
  { code: 'GC05', name: 'Agachamento goblet', level: 1, category: 'C', muscleGroup: ['quadríceps', 'glúteos'], equipment: ['halteres', 'kettlebell'], location: 'academia', reps: '12-15', sets: 3, restTime: 60, calories: 8, instructions: ['Halter ou kettlebell junto ao peito', 'Pés na largura dos ombros', 'Desça como se fosse sentar', 'Empurre pelos calcanhares'], tips: ['Ótimo para aprender o movimento'] },
  { code: 'GC06', name: 'Agachamento búlgaro', level: 2, category: 'C', muscleGroup: ['quadríceps', 'glúteos'], equipment: ['banco', 'halteres'], location: 'academia', reps: '10-12 cada', sets: 3, restTime: 90, calories: 10, instructions: ['Pé de trás apoiado no banco', 'Desça até joelho de trás quase tocar o chão', 'Empurre pela perna da frente'], tips: ['Excelente para glúteos'] },
  { code: 'GC07', name: 'Cadeira extensora', level: 1, category: 'C', muscleGroup: ['quadríceps'], equipment: ['máquina'], location: 'academia', reps: '12-15', sets: 3, restTime: 60, calories: 6, instructions: ['Sentado na máquina', 'Estenda as pernas', 'Pause no topo', 'Desça controladamente'], tips: ['Isola o quadríceps'] },
  { code: 'GC08', name: 'Mesa flexora', level: 1, category: 'C', muscleGroup: ['posterior'], equipment: ['máquina'], location: 'academia', reps: '12-15', sets: 3, restTime: 60, calories: 6, instructions: ['Deitado de bruços na máquina', 'Flexione as pernas', 'Pause no topo', 'Desça controladamente'], tips: ['Isola o posterior da coxa'] },
  { code: 'GC09', name: 'Stiff', level: 2, category: 'C', muscleGroup: ['posterior', 'glúteos'], equipment: ['barra', 'halteres'], location: 'academia', reps: '10-12', sets: 3, restTime: 90, calories: 10, instructions: ['Barra na frente das coxas', 'Joelhos levemente flexionados', 'Desça empurrando o quadril para trás', 'Sinta o alongamento no posterior'], tips: ['Costas sempre retas'] },
  { code: 'GC10', name: 'Afundo com halteres', level: 1, category: 'C', muscleGroup: ['quadríceps', 'glúteos'], equipment: ['halteres'], location: 'academia', reps: '10-12 cada', sets: 3, restTime: 60, calories: 8, instructions: ['Halteres ao lado do corpo', 'Dê um passo à frente', 'Desça até joelho de trás quase tocar o chão', 'Empurre para voltar'], tips: ['Mantenha o tronco ereto'] },
  { code: 'GC11', name: 'Panturrilha em pé', level: 1, category: 'C', muscleGroup: ['panturrilha'], equipment: ['máquina'], location: 'academia', reps: '15-20', sets: 4, restTime: 45, calories: 5, instructions: ['Ombros sob os apoios', 'Suba na ponta dos pés', 'Pause no topo', 'Desça alongando bem'], tips: ['Amplitude completa é essencial'] },
  { code: 'GC12', name: 'Panturrilha sentado', level: 1, category: 'C', muscleGroup: ['panturrilha'], equipment: ['máquina'], location: 'academia', reps: '15-20', sets: 4, restTime: 45, calories: 4, instructions: ['Sentado na máquina', 'Joelhos sob os apoios', 'Suba na ponta dos pés', 'Desça alongando bem'], tips: ['Trabalha o sóleo'] },
  { code: 'GC13', name: 'Agachamento hack', level: 3, category: 'C', muscleGroup: ['quadríceps'], equipment: ['hack'], location: 'academia', reps: '8-10', sets: 4, restTime: 120, calories: 14, instructions: ['Costas na máquina', 'Pés baixos na plataforma', 'Desça profundo', 'Empurre explosivamente'], tips: ['Foco total no quadríceps'] },
  { code: 'GC14', name: 'Agachamento frontal', level: 3, category: 'C', muscleGroup: ['quadríceps', 'core'], equipment: ['barra'], location: 'academia', reps: '8-10', sets: 4, restTime: 120, calories: 14, instructions: ['Barra na frente dos ombros', 'Cotovelos altos', 'Desça mantendo tronco ereto', 'Empurre pelos calcanhares'], tips: ['Mais foco no quadríceps'] },
  { code: 'GC15', name: 'Passada com barra', level: 3, category: 'C', muscleGroup: ['quadríceps', 'glúteos'], equipment: ['barra'], location: 'academia', reps: '10-12 cada', sets: 3, restTime: 90, calories: 12, instructions: ['Barra nas costas', 'Dê passos alternados', 'Desça até joelho quase tocar o chão', 'Continue caminhando'], tips: ['Excelente para resistência'] },
];

// 🅳 ACADEMIA - OMBRO + ABDÔMEN
export const GYM_D: Exercise[] = [
  { code: 'GD01', name: 'Desenvolvimento máquina', level: 1, category: 'D', muscleGroup: ['ombros'], equipment: ['máquina'], location: 'academia', reps: '12-15', sets: 3, restTime: 60, calories: 7, instructions: ['Sentado na máquina, costas apoiadas', 'Pegadores na altura dos ombros', 'Empurre para cima', 'Desça controladamente'], tips: ['Não trave os cotovelos'] },
  { code: 'GD02', name: 'Desenvolvimento com halteres', level: 2, category: 'D', muscleGroup: ['ombros'], equipment: ['halteres', 'banco'], location: 'academia', reps: '10-12', sets: 4, restTime: 90, calories: 9, instructions: ['Sentado no banco, halteres na altura dos ombros', 'Empurre para cima', 'Aproxime os halteres no topo', 'Desça controladamente'], tips: ['Maior amplitude que barra'] },
  { code: 'GD03', name: 'Desenvolvimento com barra', level: 3, category: 'D', muscleGroup: ['ombros'], equipment: ['barra', 'banco'], location: 'academia', reps: '8-10', sets: 4, restTime: 90, calories: 10, instructions: ['Barra na frente do peito', 'Empurre para cima', 'Desça até altura do queixo'], tips: ['Exercício clássico de ombros'] },
  { code: 'GD04', name: 'Elevação lateral', level: 1, category: 'D', muscleGroup: ['ombros'], equipment: ['halteres'], location: 'academia', reps: '12-15', sets: 3, restTime: 60, calories: 5, instructions: ['Halteres ao lado do corpo', 'Levante até altura dos ombros', 'Cotovelos levemente flexionados', 'Desça controladamente'], tips: ['Não balance o corpo'] },
  { code: 'GD05', name: 'Elevação lateral na polia', level: 2, category: 'D', muscleGroup: ['ombros'], equipment: ['polia'], location: 'academia', reps: '12-15', sets: 3, restTime: 60, calories: 5, instructions: ['Polia baixa, pegada cruzada', 'Levante até altura do ombro', 'Desça controladamente'], tips: ['Tensão constante'] },
  { code: 'GD06', name: 'Elevação frontal', level: 1, category: 'D', muscleGroup: ['ombros'], equipment: ['halteres'], location: 'academia', reps: '12-15', sets: 3, restTime: 60, calories: 5, instructions: ['Halteres na frente das coxas', 'Levante à frente até altura dos ombros', 'Desça controladamente'], tips: ['Alterne os braços se preferir'] },
  { code: 'GD07', name: 'Elevação posterior', level: 1, category: 'D', muscleGroup: ['ombros posterior'], equipment: ['halteres'], location: 'academia', reps: '12-15', sets: 3, restTime: 60, calories: 5, instructions: ['Incline o tronco para frente', 'Braços pendurados', 'Levante para os lados', 'Foco no ombro posterior'], tips: ['Movimento controlado'] },
  { code: 'GD08', name: 'Crucifixo invertido máquina', level: 2, category: 'D', muscleGroup: ['ombros posterior'], equipment: ['máquina'], location: 'academia', reps: '12-15', sets: 3, restTime: 60, calories: 5, instructions: ['Sentado de frente para a máquina', 'Abra os braços para trás', 'Aperte as escápulas', 'Retorne controladamente'], tips: ['Isola o ombro posterior'] },
  { code: 'GD09', name: 'Arnold press', level: 3, category: 'D', muscleGroup: ['ombros'], equipment: ['halteres', 'banco'], location: 'academia', reps: '8-10', sets: 3, restTime: 90, calories: 9, instructions: ['Halteres na frente do rosto, palmas para você', 'Gire e empurre para cima', 'Palmas para frente no topo', 'Desça girando de volta'], tips: ['Criado por Arnold Schwarzenegger'] },
  { code: 'GD10', name: 'Remada alta', level: 2, category: 'D', muscleGroup: ['ombros', 'trapézio'], equipment: ['barra'], location: 'academia', reps: '10-12', sets: 3, restTime: 60, calories: 7, instructions: ['Barra na frente das coxas', 'Puxe até altura do queixo', 'Cotovelos acima dos ombros', 'Desça controladamente'], tips: ['Cuidado com os ombros'] },
  { code: 'GD11', name: 'Abdominal na máquina', level: 1, category: 'D', muscleGroup: ['abdômen'], equipment: ['máquina'], location: 'academia', reps: '15-20', sets: 3, restTime: 45, calories: 5, instructions: ['Sentado na máquina', 'Segure os pegadores', 'Flexione o tronco', 'Retorne controladamente'], tips: ['Foco na contração'] },
  { code: 'GD12', name: 'Abdominal no cabo', level: 2, category: 'D', muscleGroup: ['abdômen'], equipment: ['polia'], location: 'academia', reps: '12-15', sets: 3, restTime: 60, calories: 6, instructions: ['Ajoelhado de frente para polia alta', 'Segure a corda atrás da cabeça', 'Flexione o tronco', 'Retorne controladamente'], tips: ['Excelente para carga progressiva'] },
  { code: 'GD13', name: 'Prancha', level: 1, category: 'D', muscleGroup: ['abdômen', 'core'], equipment: [], location: 'academia', reps: '30-60 seg', sets: 3, restTime: 45, calories: 5, instructions: ['Apoie antebraços e pontas dos pés', 'Corpo reto como uma tábua', 'Abdômen contraído', 'Não deixe o quadril subir ou descer'], tips: ['Base de todo treino de core'] },
  { code: 'GD14', name: 'Elevação pernas suspenso', level: 3, category: 'D', muscleGroup: ['abdômen inferior'], equipment: ['barra fixa'], location: 'academia', reps: '8-12', sets: 3, restTime: 60, calories: 10, instructions: ['Pendure na barra', 'Levante as pernas até 90 graus', 'Desça controladamente'], tips: ['Não balance o corpo'] },
  { code: 'GD15', name: 'Rotação russa com anilha', level: 2, category: 'D', muscleGroup: ['oblíquos'], equipment: ['anilha'], location: 'academia', reps: '20 total', sets: 3, restTime: 60, calories: 6, instructions: ['Sente com joelhos dobrados', 'Segure anilha com as duas mãos', 'Gire o tronco de um lado para outro', 'Toque o chão com a anilha'], tips: ['Pés podem ficar elevados'] },
];

// 🅴 ACADEMIA - GLÚTEOS + POSTERIOR
export const GYM_E: Exercise[] = [
  { code: 'GE01', name: 'Hip thrust com barra', level: 2, category: 'E', muscleGroup: ['glúteos'], equipment: ['barra', 'banco'], location: 'academia', reps: '10-12', sets: 4, restTime: 90, calories: 10, instructions: ['Costas apoiadas no banco', 'Barra sobre o quadril', 'Empurre o quadril para cima', 'Aperte os glúteos no topo'], tips: ['Melhor exercício para glúteos'] },
  { code: 'GE02', name: 'Elevação pélvica', level: 1, category: 'E', muscleGroup: ['glúteos'], equipment: [], location: 'academia', reps: '15-20', sets: 3, restTime: 60, calories: 6, instructions: ['Deite com joelhos dobrados', 'Pés no chão, braços ao lado', 'Levante o quadril contraindo glúteos', 'Segure 2 segundos no topo'], tips: ['Base de todo treino de glúteos'] },
  { code: 'GE03', name: 'Stiff', level: 2, category: 'E', muscleGroup: ['posterior', 'glúteos'], equipment: ['barra'], location: 'academia', reps: '10-12', sets: 3, restTime: 90, calories: 10, instructions: ['Barra na frente das coxas', 'Joelhos levemente flexionados', 'Desça empurrando o quadril para trás', 'Sinta o alongamento no posterior'], tips: ['Costas sempre retas'] },
  { code: 'GE04', name: 'Levantamento terra romeno', level: 3, category: 'E', muscleGroup: ['posterior', 'glúteos', 'lombar'], equipment: ['barra'], location: 'academia', reps: '8-10', sets: 4, restTime: 120, calories: 15, instructions: ['Barra na frente das coxas', 'Joelhos levemente flexionados', 'Desça empurrando o quadril para trás', 'Suba apertando os glúteos'], tips: ['Costas sempre retas'] },
  { code: 'GE05', name: 'Bom dia', level: 3, category: 'E', muscleGroup: ['posterior', 'glúteos', 'lombar'], equipment: ['barra'], location: 'academia', reps: '10-12', sets: 3, restTime: 90, calories: 10, instructions: ['Barra nas costas', 'Incline o tronco para frente', 'Joelhos levemente flexionados', 'Suba apertando os glúteos'], tips: ['Movimento controlado'] },
  { code: 'GE06', name: 'Cadeira abdutora', level: 1, category: 'E', muscleGroup: ['glúteo médio'], equipment: ['máquina'], location: 'academia', reps: '15-20', sets: 3, restTime: 60, calories: 5, instructions: ['Sentado na máquina', 'Abra as pernas contra a resistência', 'Pause no final', 'Retorne controladamente'], tips: ['Trabalha o glúteo médio'] },
  { code: 'GE07', name: 'Cadeira adutora', level: 1, category: 'E', muscleGroup: ['adutores'], equipment: ['máquina'], location: 'academia', reps: '15-20', sets: 3, restTime: 60, calories: 5, instructions: ['Sentado na máquina', 'Feche as pernas contra a resistência', 'Pause no final', 'Retorne controladamente'], tips: ['Trabalha a parte interna da coxa'] },
  { code: 'GE08', name: 'Glúteo na polia', level: 1, category: 'E', muscleGroup: ['glúteos'], equipment: ['polia'], location: 'academia', reps: '12-15 cada', sets: 3, restTime: 60, calories: 6, instructions: ['Caneleira presa na polia baixa', 'Empurre a perna para trás', 'Contraia o glúteo no topo', 'Retorne controladamente'], tips: ['Tensão constante'] },
  { code: 'GE09', name: 'Glúteo máquina', level: 2, category: 'E', muscleGroup: ['glúteos'], equipment: ['máquina'], location: 'academia', reps: '12-15 cada', sets: 3, restTime: 60, calories: 7, instructions: ['Apoiado na máquina', 'Empurre a plataforma para trás', 'Contraia o glúteo no topo', 'Retorne controladamente'], tips: ['Isola o glúteo'] },
  { code: 'GE10', name: 'Coice na polia', level: 3, category: 'E', muscleGroup: ['glúteos'], equipment: ['polia'], location: 'academia', reps: '12-15 cada', sets: 3, restTime: 60, calories: 7, instructions: ['Caneleira na polia baixa', 'Empurre a perna para trás e para cima', 'Contraia o glúteo no topo', 'Retorne controladamente'], tips: ['Foco na contração'] },
  { code: 'GE11', name: 'Abdução na polia', level: 2, category: 'E', muscleGroup: ['glúteo médio'], equipment: ['polia'], location: 'academia', reps: '12-15 cada', sets: 3, restTime: 60, calories: 5, instructions: ['Caneleira na polia baixa', 'Abra a perna para o lado', 'Mantenha o corpo reto', 'Retorne controladamente'], tips: ['Tensão constante'] },
  { code: 'GE12', name: 'Mesa flexora', level: 1, category: 'E', muscleGroup: ['posterior'], equipment: ['máquina'], location: 'academia', reps: '12-15', sets: 3, restTime: 60, calories: 6, instructions: ['Deitado de bruços na máquina', 'Flexione as pernas', 'Pause no topo', 'Desça controladamente'], tips: ['Isola o posterior da coxa'] },
  { code: 'GE13', name: 'Flexora em pé', level: 2, category: 'E', muscleGroup: ['posterior'], equipment: ['máquina'], location: 'academia', reps: '12-15 cada', sets: 3, restTime: 60, calories: 5, instructions: ['Em pé na máquina', 'Flexione uma perna de cada vez', 'Pause no topo', 'Desça controladamente'], tips: ['Corrige desequilíbrios'] },
  { code: 'GE14', name: 'Levantamento terra sumo', level: 4, category: 'E', muscleGroup: ['glúteos', 'posterior', 'adutores'], equipment: ['barra'], location: 'academia', reps: '5-8', sets: 4, restTime: 180, calories: 18, instructions: ['Pés bem abertos, pontas para fora', 'Pegada entre as pernas', 'Levante mantendo costas retas', 'Aperte os glúteos no topo'], tips: ['Foco nos glúteos e adutores'] },
  { code: 'GE15', name: 'Afundo búlgaro', level: 2, category: 'E', muscleGroup: ['glúteos', 'quadríceps'], equipment: ['banco', 'halteres'], location: 'academia', reps: '10-12 cada', sets: 3, restTime: 90, calories: 10, instructions: ['Pé de trás apoiado no banco', 'Desça até joelho de trás quase tocar o chão', 'Empurre pela perna da frente'], tips: ['Excelente para glúteos'] },
];

// ============================================
// ARRAYS COMBINADOS E FUNÇÕES AUXILIARES
// ============================================

// Todos os exercícios de casa
export const ALL_HOME_EXERCISES: Exercise[] = [
  ...HOME_A, ...HOME_B, ...HOME_C, ...HOME_D, ...HOME_E
];

// Todos os exercícios de academia
export const ALL_GYM_EXERCISES: Exercise[] = [
  ...GYM_A, ...GYM_B, ...GYM_C, ...GYM_D, ...GYM_E
];

// TODOS os exercícios
export const ALL_EXERCISES: Exercise[] = [
  ...ALL_HOME_EXERCISES, ...ALL_GYM_EXERCISES
];

// Buscar por localização
export const getExercisesByLocation = (location: 'casa' | 'academia'): Exercise[] => {
  return location === 'academia' ? ALL_GYM_EXERCISES : ALL_HOME_EXERCISES;
};

// Buscar por categoria
export const getExercisesByCategory = (
  category: 'A' | 'B' | 'C' | 'D' | 'E',
  location?: 'casa' | 'academia'
): Exercise[] => {
  const exercises = location ? getExercisesByLocation(location) : ALL_EXERCISES;
  return exercises.filter(e => e.category === category);
};

// Buscar por nível
export const getExercisesByLevel = (
  level: 1 | 2 | 3 | 4,
  location?: 'casa' | 'academia'
): Exercise[] => {
  const exercises = location ? getExercisesByLocation(location) : ALL_EXERCISES;
  return exercises.filter(e => e.level <= level);
};

// Buscar por categoria e nível
export const getExercisesByCategoryAndLevel = (
  category: 'A' | 'B' | 'C' | 'D' | 'E',
  level: 1 | 2 | 3 | 4,
  location?: 'casa' | 'academia'
): Exercise[] => {
  const exercises = location ? getExercisesByLocation(location) : ALL_EXERCISES;
  return exercises.filter(e => e.category === category && e.level <= level);
};

// Buscar por código
export const getExerciseByCode = (code: string): Exercise | undefined => {
  return ALL_EXERCISES.find(e => e.code === code);
};

// Buscar por grupo muscular
export const getExercisesByMuscle = (
  muscle: string,
  location?: 'casa' | 'academia'
): Exercise[] => {
  const exercises = location ? getExercisesByLocation(location) : ALL_EXERCISES;
  return exercises.filter(e => 
    e.muscleGroup.some(m => m.toLowerCase().includes(muscle.toLowerCase()))
  );
};

// Mapear nível do usuário
export const mapUserLevel = (userLevel: string): 1 | 2 | 3 | 4 => {
  switch (userLevel) {
    case 'sedentario':
    case 'leve': return 1;
    case 'moderado': return 2;
    case 'avancado': return 3;
    default: return 1;
  }
};

// Gerar treino
export const generateWorkout = (
  category: 'A' | 'B' | 'C' | 'D' | 'E',
  level: 1 | 2 | 3 | 4,
  location: 'casa' | 'academia',
  count: number = 6
): Exercise[] => {
  const exercises = getExercisesByCategoryAndLevel(category, level, location);
  return exercises.slice(0, count);
};

// Estatísticas
export const getStats = () => ({
  total: ALL_EXERCISES.length,
  casa: ALL_HOME_EXERCISES.length,
  academia: ALL_GYM_EXERCISES.length,
  porCategoria: {
    A: ALL_EXERCISES.filter(e => e.category === 'A').length,
    B: ALL_EXERCISES.filter(e => e.category === 'B').length,
    C: ALL_EXERCISES.filter(e => e.category === 'C').length,
    D: ALL_EXERCISES.filter(e => e.category === 'D').length,
    E: ALL_EXERCISES.filter(e => e.category === 'E').length,
  }
});
