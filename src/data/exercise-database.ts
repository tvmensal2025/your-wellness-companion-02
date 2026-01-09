// Base de Exercícios Completa - Sistema ABCDE
// Organizado por: MAIS USADO → MENOS USADO
// Níveis: N1 (Iniciante) → N4 (Avançado)

export interface Exercise {
  code: string;
  name: string;
  level: 1 | 2 | 3 | 4;
  category: 'A' | 'B' | 'C' | 'D' | 'E';
  muscleGroup: string[];
  equipment?: string[];
  instructions?: string[];
  videoUrl?: string;
}

// 🅰️ A – PEITO + TRÍCEPS
export const CATEGORY_A_EXERCISES: Exercise[] = [
  // N1 - Iniciante
  { code: 'A13', name: 'Flexão tradicional', level: 1, category: 'A', muscleGroup: ['peito', 'tríceps'] },
  { code: 'A20', name: 'Chest press máquina', level: 1, category: 'A', muscleGroup: ['peito'], equipment: ['máquina'] },
  { code: 'A06', name: 'Crucifixo reto', level: 1, category: 'A', muscleGroup: ['peito'], equipment: ['halteres', 'banco'] },
  { code: 'A14', name: 'Flexão aberta', level: 1, category: 'A', muscleGroup: ['peito', 'tríceps'] },
  { code: 'A15', name: 'Flexão fechada', level: 1, category: 'A', muscleGroup: ['tríceps', 'peito'] },
  { code: 'A02', name: 'Supino reto halter', level: 1, category: 'A', muscleGroup: ['peito'], equipment: ['halteres', 'banco'] },
  { code: 'A16', name: 'Flexão inclinada', level: 1, category: 'A', muscleGroup: ['peito', 'tríceps'] },
  { code: 'A09', name: 'Peck deck', level: 1, category: 'A', muscleGroup: ['peito'], equipment: ['máquina'] },
  { code: 'A24', name: 'Isometria de flexão', level: 1, category: 'A', muscleGroup: ['peito', 'tríceps'] },
  { code: 'A25', name: 'Tríceps pulley', level: 1, category: 'A', muscleGroup: ['tríceps'], equipment: ['polia'] },
  { code: 'A34', name: 'Tríceps banco', level: 1, category: 'A', muscleGroup: ['tríceps'], equipment: ['banco'] },
  { code: 'A36', name: 'Mergulho em banco', level: 1, category: 'A', muscleGroup: ['tríceps', 'peito'], equipment: ['banco'] },
  { code: 'A41', name: 'Tríceps com elástico', level: 1, category: 'A', muscleGroup: ['tríceps'], equipment: ['elástico'] },
  
  // N2 - Intermediário
  { code: 'A01', name: 'Supino reto barra', level: 2, category: 'A', muscleGroup: ['peito'], equipment: ['barra', 'banco'] },
  { code: 'A07', name: 'Crucifixo inclinado', level: 2, category: 'A', muscleGroup: ['peito superior'], equipment: ['halteres', 'banco inclinado'] },
  { code: 'A11', name: 'Crossover baixo', level: 2, category: 'A', muscleGroup: ['peito'], equipment: ['polia'] },
  { code: 'A26', name: 'Tríceps corda', level: 2, category: 'A', muscleGroup: ['tríceps'], equipment: ['polia', 'corda'] },
  { code: 'A29', name: 'Tríceps testa barra', level: 2, category: 'A', muscleGroup: ['tríceps'], equipment: ['barra', 'banco'] },
  { code: 'A33', name: 'Tríceps francês unilateral', level: 2, category: 'A', muscleGroup: ['tríceps'], equipment: ['halter'] },
  { code: 'A37', name: 'Mergulho em paralelas', level: 2, category: 'A', muscleGroup: ['tríceps', 'peito'], equipment: ['paralelas'] },
  { code: 'A42', name: 'Flexão diamante', level: 2, category: 'A', muscleGroup: ['tríceps', 'peito'] },
  { code: 'A45', name: 'Supino máquina neutro', level: 2, category: 'A', muscleGroup: ['peito'], equipment: ['máquina'] },
  { code: 'A53', name: 'Supino smith', level: 2, category: 'A', muscleGroup: ['peito'], equipment: ['smith'] },
  
  // N3 - Avançado
  { code: 'A03', name: 'Supino inclinado barra', level: 3, category: 'A', muscleGroup: ['peito superior'], equipment: ['barra', 'banco inclinado'] },
  { code: 'A04', name: 'Supino inclinado halter', level: 3, category: 'A', muscleGroup: ['peito superior'], equipment: ['halteres', 'banco inclinado'] },
  { code: 'A08', name: 'Crucifixo declinado', level: 3, category: 'A', muscleGroup: ['peito inferior'], equipment: ['halteres', 'banco declinado'] },
  { code: 'A10', name: 'Crossover alto', level: 3, category: 'A', muscleGroup: ['peito'], equipment: ['polia'] },
  { code: 'A22', name: 'Supino com pausa', level: 3, category: 'A', muscleGroup: ['peito'], equipment: ['barra', 'banco'] },
  { code: 'A31', name: 'Tríceps testa unilateral', level: 3, category: 'A', muscleGroup: ['tríceps'], equipment: ['halter'] },
  { code: 'A38', name: 'Kickback halter', level: 3, category: 'A', muscleGroup: ['tríceps'], equipment: ['halter'] },
  { code: 'A54', name: 'Flexão TRX', level: 3, category: 'A', muscleGroup: ['peito', 'tríceps'], equipment: ['TRX'] },
  { code: 'A62', name: 'Flexão hindu', level: 3, category: 'A', muscleGroup: ['peito', 'ombros', 'tríceps'] },
  { code: 'A67', name: 'Supino lento', level: 3, category: 'A', muscleGroup: ['peito'], equipment: ['barra', 'banco'] },
  
  // N4 - Expert
  { code: 'A18', name: 'Flexão explosiva', level: 4, category: 'A', muscleGroup: ['peito', 'tríceps'] },
  { code: 'A19', name: 'Flexão com palmas', level: 4, category: 'A', muscleGroup: ['peito', 'tríceps'] },
  { code: 'A61', name: 'Flexão arqueiro', level: 4, category: 'A', muscleGroup: ['peito', 'tríceps'] },
  { code: 'A63', name: 'Flexão pseudo planche', level: 4, category: 'A', muscleGroup: ['peito', 'ombros', 'tríceps'] },
  { code: 'A70', name: 'Flexão instável', level: 4, category: 'A', muscleGroup: ['peito', 'tríceps', 'core'] },
  { code: 'A76', name: 'Supino com corrente', level: 4, category: 'A', muscleGroup: ['peito'], equipment: ['barra', 'corrente'] },
  { code: 'A77', name: 'Flexão BOSU', level: 4, category: 'A', muscleGroup: ['peito', 'tríceps', 'core'], equipment: ['BOSU'] },
  { code: 'A79', name: 'Supino unilateral alternado', level: 4, category: 'A', muscleGroup: ['peito'], equipment: ['halteres', 'banco'] },
  { code: 'A80', name: 'Flexão fadiga total', level: 4, category: 'A', muscleGroup: ['peito', 'tríceps'] },
  { code: 'A66', name: 'Tríceps negativo', level: 4, category: 'A', muscleGroup: ['tríceps'] },
];

// 🅱️ B – COSTAS + BÍCEPS
export const CATEGORY_B_EXERCISES: Exercise[] = [
  // N1 - Iniciante
  { code: 'B11', name: 'Remada baixa', level: 1, category: 'B', muscleGroup: ['costas'], equipment: ['máquina', 'polia'] },
  { code: 'B18', name: 'Remada invertida', level: 1, category: 'B', muscleGroup: ['costas'] },
  { code: 'B26', name: 'Rosca direta barra', level: 1, category: 'B', muscleGroup: ['bíceps'], equipment: ['barra'] },
  { code: 'B28', name: 'Rosca alternada', level: 1, category: 'B', muscleGroup: ['bíceps'], equipment: ['halteres'] },
  { code: 'B20', name: 'Superman', level: 1, category: 'B', muscleGroup: ['lombar', 'costas'] },
  { code: 'B39', name: 'Rosca elástico', level: 1, category: 'B', muscleGroup: ['bíceps'], equipment: ['elástico'] },
  { code: 'B50', name: 'Barra australiana', level: 1, category: 'B', muscleGroup: ['costas'] },
  { code: 'B21', name: 'Extensão lombar', level: 1, category: 'B', muscleGroup: ['lombar'] },
  { code: 'B66', name: 'Remada elástico', level: 1, category: 'B', muscleGroup: ['costas'], equipment: ['elástico'] },
  { code: 'B68', name: 'Rosca elástico', level: 1, category: 'B', muscleGroup: ['bíceps'], equipment: ['elástico'] },
  
  // N2 - Intermediário
  { code: 'B01', name: 'Puxada frente aberta', level: 2, category: 'B', muscleGroup: ['costas', 'bíceps'], equipment: ['polia'] },
  { code: 'B07', name: 'Remada curvada barra', level: 2, category: 'B', muscleGroup: ['costas'], equipment: ['barra'] },
  { code: 'B29', name: 'Rosca martelo', level: 2, category: 'B', muscleGroup: ['bíceps', 'antebraço'], equipment: ['halteres'] },
  { code: 'B31', name: 'Rosca Scott', level: 2, category: 'B', muscleGroup: ['bíceps'], equipment: ['banco scott', 'barra'] },
  { code: 'B37', name: 'Rosca banco inclinado', level: 2, category: 'B', muscleGroup: ['bíceps'], equipment: ['halteres', 'banco inclinado'] },
  { code: 'B10', name: 'Remada cavalinho', level: 2, category: 'B', muscleGroup: ['costas'], equipment: ['máquina'] },
  { code: 'B33', name: 'Rosca 21', level: 2, category: 'B', muscleGroup: ['bíceps'], equipment: ['barra'] },
  { code: 'B47', name: 'Pulldown unilateral', level: 2, category: 'B', muscleGroup: ['costas'], equipment: ['polia'] },
  { code: 'B56', name: 'Remada baixa neutra', level: 2, category: 'B', muscleGroup: ['costas'], equipment: ['polia'] },
  { code: 'B72', name: 'Remada smith', level: 2, category: 'B', muscleGroup: ['costas'], equipment: ['smith'] },
  
  // N3 - Avançado
  { code: 'B03', name: 'Barra fixa pronada', level: 3, category: 'B', muscleGroup: ['costas', 'bíceps'], equipment: ['barra fixa'] },
  { code: 'B04', name: 'Barra fixa supinada', level: 3, category: 'B', muscleGroup: ['bíceps', 'costas'], equipment: ['barra fixa'] },
  { code: 'B24', name: 'Deadlift romeno', level: 3, category: 'B', muscleGroup: ['posterior', 'lombar'], equipment: ['barra'] },
  { code: 'B38', name: 'Rosca spider', level: 3, category: 'B', muscleGroup: ['bíceps'], equipment: ['banco', 'barra'] },
  { code: 'B53', name: 'Rosca martelo cruzada', level: 3, category: 'B', muscleGroup: ['bíceps', 'antebraço'], equipment: ['halteres'] },
  { code: 'B43', name: 'Remada excêntrica', level: 3, category: 'B', muscleGroup: ['costas'], equipment: ['barra'] },
  { code: 'B60', name: 'Deadlift com pausa', level: 3, category: 'B', muscleGroup: ['posterior', 'lombar', 'costas'], equipment: ['barra'] },
  { code: 'B62', name: 'Deadlift unilateral', level: 3, category: 'B', muscleGroup: ['posterior', 'lombar'], equipment: ['halter'] },
  { code: 'B70', name: 'Barra fixa excêntrica', level: 3, category: 'B', muscleGroup: ['costas', 'bíceps'], equipment: ['barra fixa'] },
  { code: 'B79', name: 'Barra fixa máxima', level: 3, category: 'B', muscleGroup: ['costas', 'bíceps'], equipment: ['barra fixa'] },
  
  // N4 - Expert
  { code: 'B51', name: 'Barra negativa', level: 4, category: 'B', muscleGroup: ['costas', 'bíceps'], equipment: ['barra fixa'] },
  { code: 'B61', name: 'Deadlift deficit', level: 4, category: 'B', muscleGroup: ['posterior', 'lombar', 'costas'], equipment: ['barra', 'step'] },
  { code: 'B77', name: 'Pullover isométrico', level: 4, category: 'B', muscleGroup: ['costas', 'peito'], equipment: ['halter', 'banco'] },
  { code: 'B80', name: 'Remada fadiga total', level: 4, category: 'B', muscleGroup: ['costas'] },
  { code: 'B41', name: 'Barra fixa isométrica', level: 4, category: 'B', muscleGroup: ['costas', 'bíceps'], equipment: ['barra fixa'] },
  { code: 'B44', name: 'Rosca excêntrica', level: 4, category: 'B', muscleGroup: ['bíceps'], equipment: ['barra'] },
  { code: 'B65', name: 'Rosca isométrica parede', level: 4, category: 'B', muscleGroup: ['bíceps'] },
  { code: 'B75', name: 'Rosca unilateral lenta', level: 4, category: 'B', muscleGroup: ['bíceps'], equipment: ['halter'] },
  { code: 'B76', name: 'Remada curvada lenta', level: 4, category: 'B', muscleGroup: ['costas'], equipment: ['barra'] },
  { code: 'B78', name: 'Rosca concentração cabo', level: 4, category: 'B', muscleGroup: ['bíceps'], equipment: ['polia'] },
];

// 🅲 C – PERNAS
export const CATEGORY_C_EXERCISES: Exercise[] = [
  // N1 - Iniciante
  { code: 'C09', name: 'Leg press', level: 1, category: 'C', muscleGroup: ['quadríceps', 'glúteos'], equipment: ['máquina'] },
  { code: 'C06', name: 'Agachamento goblet', level: 1, category: 'C', muscleGroup: ['quadríceps', 'glúteos'], equipment: ['halter', 'kettlebell'] },
  { code: 'C11', name: 'Afundo', level: 1, category: 'C', muscleGroup: ['quadríceps', 'glúteos'] },
  { code: 'C23', name: 'Panturrilha em pé', level: 1, category: 'C', muscleGroup: ['panturrilha'], equipment: ['máquina'] },
  { code: 'C32', name: 'Wall sit', level: 1, category: 'C', muscleGroup: ['quadríceps'] },
  { code: 'C16', name: 'Cadeira extensora', level: 1, category: 'C', muscleGroup: ['quadríceps'], equipment: ['máquina'] },
  { code: 'C18', name: 'Mesa flexora', level: 1, category: 'C', muscleGroup: ['posterior'], equipment: ['máquina'] },
  { code: 'C30', name: 'Step up', level: 1, category: 'C', muscleGroup: ['quadríceps', 'glúteos'], equipment: ['step', 'banco'] },
  { code: 'C48', name: 'Agachamento TRX', level: 1, category: 'C', muscleGroup: ['quadríceps', 'glúteos'], equipment: ['TRX'] },
  { code: 'C49', name: 'Afundo TRX', level: 1, category: 'C', muscleGroup: ['quadríceps', 'glúteos'], equipment: ['TRX'] },
  
  // N2 - Intermediário
  { code: 'C01', name: 'Agachamento livre', level: 2, category: 'C', muscleGroup: ['quadríceps', 'glúteos', 'posterior'], equipment: ['barra'] },
  { code: 'C20', name: 'Stiff', level: 2, category: 'C', muscleGroup: ['posterior', 'glúteos'], equipment: ['barra', 'halteres'] },
  { code: 'C07', name: 'Agachamento búlgaro', level: 2, category: 'C', muscleGroup: ['quadríceps', 'glúteos'], equipment: ['halteres'] },
  { code: 'C10', name: 'Leg press unilateral', level: 2, category: 'C', muscleGroup: ['quadríceps', 'glúteos'], equipment: ['máquina'] },
  { code: 'C37', name: 'Hack machine', level: 2, category: 'C', muscleGroup: ['quadríceps'], equipment: ['máquina'] },
  { code: 'C41', name: 'Afundo cruzado', level: 2, category: 'C', muscleGroup: ['quadríceps', 'glúteos'] },
  { code: 'C52', name: 'Stiff halter', level: 2, category: 'C', muscleGroup: ['posterior', 'glúteos'], equipment: ['halteres'] },
  { code: 'C69', name: 'Leg press pés altos', level: 2, category: 'C', muscleGroup: ['posterior', 'glúteos'], equipment: ['máquina'] },
  { code: 'C70', name: 'Leg press pés baixos', level: 2, category: 'C', muscleGroup: ['quadríceps'], equipment: ['máquina'] },
  { code: 'C73', name: 'Panturrilha degrau', level: 2, category: 'C', muscleGroup: ['panturrilha'], equipment: ['step'] },
  
  // N3 - Avançado
  { code: 'C04', name: 'Agachamento hack', level: 3, category: 'C', muscleGroup: ['quadríceps'], equipment: ['máquina'] },
  { code: 'C27', name: 'Salto agachado', level: 3, category: 'C', muscleGroup: ['quadríceps', 'glúteos'] },
  { code: 'C38', name: 'Sissy squat', level: 3, category: 'C', muscleGroup: ['quadríceps'] },
  { code: 'C39', name: 'Agachamento ciclista', level: 3, category: 'C', muscleGroup: ['quadríceps'] },
  { code: 'C50', name: 'Nordic curl', level: 3, category: 'C', muscleGroup: ['posterior'] },
  { code: 'C57', name: 'Pistol squat', level: 3, category: 'C', muscleGroup: ['quadríceps', 'glúteos'] },
  { code: 'C58', name: 'Pistol assistido', level: 3, category: 'C', muscleGroup: ['quadríceps', 'glúteos'] },
  { code: 'C68', name: 'Agachamento pausa longa', level: 3, category: 'C', muscleGroup: ['quadríceps', 'glúteos'], equipment: ['barra'] },
  { code: 'C77', name: 'Sprint', level: 3, category: 'C', muscleGroup: ['quadríceps', 'posterior'] },
  { code: 'C78', name: 'Bike intensa', level: 3, category: 'C', muscleGroup: ['quadríceps'], equipment: ['bicicleta'] },
  
  // N4 - Expert
  { code: 'C80', name: 'Agachamento máximo', level: 4, category: 'C', muscleGroup: ['quadríceps', 'glúteos', 'posterior'], equipment: ['barra'] },
  { code: 'C76', name: 'Corrida inclinada', level: 4, category: 'C', muscleGroup: ['quadríceps', 'glúteos'], equipment: ['esteira'] },
  { code: 'C79', name: 'Escada', level: 4, category: 'C', muscleGroup: ['quadríceps', 'glúteos'] },
  { code: 'C63', name: 'Agachamento isométrico unilateral', level: 4, category: 'C', muscleGroup: ['quadríceps'] },
  { code: 'C67', name: 'Agachamento tempo', level: 4, category: 'C', muscleGroup: ['quadríceps', 'glúteos'], equipment: ['barra'] },
  { code: 'C56', name: 'Agachamento salto lateral', level: 4, category: 'C', muscleGroup: ['quadríceps', 'glúteos'] },
  { code: 'C51', name: 'Flexão nórdica assistida', level: 4, category: 'C', muscleGroup: ['posterior'] },
  { code: 'C65', name: 'Agachamento profundo', level: 4, category: 'C', muscleGroup: ['quadríceps', 'glúteos'], equipment: ['barra'] },
  { code: 'C66', name: 'Agachamento parcial', level: 4, category: 'C', muscleGroup: ['quadríceps'], equipment: ['barra'] },
  { code: 'C72', name: 'Leg press pés fechados', level: 4, category: 'C', muscleGroup: ['quadríceps'], equipment: ['máquina'] },
];

// 🅳 D – OMBRO + ABDÔMEN
export const CATEGORY_D_EXERCISES: Exercise[] = [
  // N1 - Iniciante
  { code: 'D05', name: 'Elevação lateral', level: 1, category: 'D', muscleGroup: ['ombros'], equipment: ['halteres'] },
  { code: 'D26', name: 'Prancha', level: 1, category: 'D', muscleGroup: ['abdômen', 'core'] },
  { code: 'D29', name: 'Crunch', level: 1, category: 'D', muscleGroup: ['abdômen'] },
  { code: 'D32', name: 'Abdominal infra', level: 1, category: 'D', muscleGroup: ['abdômen inferior'] },
  { code: 'D27', name: 'Prancha lateral', level: 1, category: 'D', muscleGroup: ['oblíquos', 'core'] },
  { code: 'D14', name: 'Elevação posterior', level: 1, category: 'D', muscleGroup: ['ombros posterior'], equipment: ['halteres'] },
  { code: 'D17', name: 'Face pull', level: 1, category: 'D', muscleGroup: ['ombros posterior'], equipment: ['polia'] },
  { code: 'D61', name: 'Abdominal elástico', level: 1, category: 'D', muscleGroup: ['abdômen'], equipment: ['elástico'] },
  { code: 'D63', name: 'Abdominal banco', level: 1, category: 'D', muscleGroup: ['abdômen'], equipment: ['banco'] },
  { code: 'D42', name: 'Abdominal isométrico', level: 1, category: 'D', muscleGroup: ['abdômen', 'core'] },
  
  // N2 - Intermediário
  { code: 'D01', name: 'Desenvolvimento barra', level: 2, category: 'D', muscleGroup: ['ombros'], equipment: ['barra'] },
  { code: 'D04', name: 'Arnold press', level: 2, category: 'D', muscleGroup: ['ombros'], equipment: ['halteres'] },
  { code: 'D18', name: 'Remada alta', level: 2, category: 'D', muscleGroup: ['ombros', 'trapézio'], equipment: ['barra', 'halteres'] },
  { code: 'D33', name: 'Elevação pernas', level: 2, category: 'D', muscleGroup: ['abdômen inferior'] },
  { code: 'D40', name: 'Rotação russa', level: 2, category: 'D', muscleGroup: ['oblíquos'], equipment: ['peso'] },
  { code: 'D59', name: 'Elevação lateral TRX', level: 2, category: 'D', muscleGroup: ['ombros'], equipment: ['TRX'] },
  { code: 'D58', name: 'Shoulder press smith', level: 2, category: 'D', muscleGroup: ['ombros'], equipment: ['smith'] },
  { code: 'D24', name: 'Pike push up', level: 2, category: 'D', muscleGroup: ['ombros', 'tríceps'] },
  { code: 'D64', name: 'Abdominal declinado', level: 2, category: 'D', muscleGroup: ['abdômen'], equipment: ['banco declinado'] },
  { code: 'D46', name: 'Abdominal polia', level: 2, category: 'D', muscleGroup: ['abdômen'], equipment: ['polia'] },
  
  // N3 - Avançado
  { code: 'D25', name: 'Handstand push up', level: 3, category: 'D', muscleGroup: ['ombros', 'tríceps'] },
  { code: 'D34', name: 'Elevação pernas suspenso', level: 3, category: 'D', muscleGroup: ['abdômen inferior'], equipment: ['barra fixa'] },
  { code: 'D38', name: 'Abdominal V', level: 3, category: 'D', muscleGroup: ['abdômen'] },
  { code: 'D67', name: 'Prancha máxima', level: 3, category: 'D', muscleGroup: ['core'] },
  { code: 'D78', name: 'Prancha com peso', level: 3, category: 'D', muscleGroup: ['core'], equipment: ['anilha'] },
  { code: 'D69', name: 'Desenvolvimento máximo', level: 3, category: 'D', muscleGroup: ['ombros'], equipment: ['barra'] },
  { code: 'D71', name: 'Elevação frontal máxima', level: 3, category: 'D', muscleGroup: ['ombros anterior'], equipment: ['barra'] },
  { code: 'D72', name: 'Elevação posterior máxima', level: 3, category: 'D', muscleGroup: ['ombros posterior'], equipment: ['halteres'] },
  { code: 'D75', name: 'Shoulder press unilateral', level: 3, category: 'D', muscleGroup: ['ombros'], equipment: ['halter'] },
  { code: 'D79', name: 'Elevação lateral combinada', level: 3, category: 'D', muscleGroup: ['ombros'], equipment: ['halteres'] },
  
  // N4 - Expert
  { code: 'D80', name: 'Core completo', level: 4, category: 'D', muscleGroup: ['core', 'abdômen', 'oblíquos'] },
  { code: 'D66', name: 'Abdominal excêntrico', level: 4, category: 'D', muscleGroup: ['abdômen'] },
  { code: 'D55', name: 'Elevação posterior lenta', level: 4, category: 'D', muscleGroup: ['ombros posterior'], equipment: ['halteres'] },
  { code: 'D54', name: 'Elevação lateral explosiva', level: 4, category: 'D', muscleGroup: ['ombros'], equipment: ['halteres'] },
  { code: 'D73', name: 'Face pull lento', level: 4, category: 'D', muscleGroup: ['ombros posterior'], equipment: ['polia'] },
  { code: 'D74', name: 'Face pull isométrico', level: 4, category: 'D', muscleGroup: ['ombros posterior'], equipment: ['polia'] },
  { code: 'D51', name: 'Desenvolvimento isométrico', level: 4, category: 'D', muscleGroup: ['ombros'], equipment: ['barra'] },
  { code: 'D65', name: 'Abdominal isométrico longo', level: 4, category: 'D', muscleGroup: ['core'] },
  { code: 'D70', name: 'Abdominal máximo', level: 4, category: 'D', muscleGroup: ['abdômen'] },
  { code: 'D68', name: 'Elevação lateral máxima', level: 4, category: 'D', muscleGroup: ['ombros'], equipment: ['halteres'] },
];

// 🅴 E – GLÚTEOS + POSTERIOR
export const CATEGORY_E_EXERCISES: Exercise[] = [
  // N1 - Iniciante
  { code: 'E01', name: 'Elevação pélvica', level: 1, category: 'E', muscleGroup: ['glúteos'] },
  { code: 'E07', name: 'Glúteo quatro apoios', level: 1, category: 'E', muscleGroup: ['glúteos'] },
  { code: 'E09', name: 'Abdução quadril', level: 1, category: 'E', muscleGroup: ['glúteos'] },
  { code: 'E29', name: 'Glúteo ponte', level: 1, category: 'E', muscleGroup: ['glúteos'] },
  { code: 'E35', name: 'Monster walk', level: 1, category: 'E', muscleGroup: ['glúteos'], equipment: ['elástico'] },
  { code: 'E24', name: 'Flexora', level: 1, category: 'E', muscleGroup: ['posterior'], equipment: ['máquina'] },
  { code: 'E12', name: 'Passada longa', level: 1, category: 'E', muscleGroup: ['glúteos', 'quadríceps'] },
  { code: 'E39', name: 'Agachamento búlgaro', level: 1, category: 'E', muscleGroup: ['glúteos', 'quadríceps'] },
  { code: 'E50', name: 'Ponte com peso', level: 1, category: 'E', muscleGroup: ['glúteos'], equipment: ['anilha'] },
  { code: 'E34', name: 'Abdução elástico', level: 1, category: 'E', muscleGroup: ['glúteos'], equipment: ['elástico'] },
  
  // N2 - Intermediário
  { code: 'E03', name: 'Hip thrust barra', level: 2, category: 'E', muscleGroup: ['glúteos'], equipment: ['barra', 'banco'] },
  { code: 'E17', name: 'Stiff', level: 2, category: 'E', muscleGroup: ['posterior', 'glúteos'], equipment: ['barra'] },
  { code: 'E18', name: 'Stiff romeno', level: 2, category: 'E', muscleGroup: ['posterior', 'glúteos'], equipment: ['barra'] },
  { code: 'E31', name: 'Kickback cabo', level: 2, category: 'E', muscleGroup: ['glúteos'], equipment: ['polia'] },
  { code: 'E57', name: 'Leg press glúteo', level: 2, category: 'E', muscleGroup: ['glúteos'], equipment: ['máquina'] },
  { code: 'E52', name: 'Hip thrust lento', level: 2, category: 'E', muscleGroup: ['glúteos'], equipment: ['barra', 'banco'] },
  { code: 'E21', name: 'Deadlift sumô', level: 2, category: 'E', muscleGroup: ['glúteos', 'posterior'], equipment: ['barra'] },
  { code: 'E55', name: 'Glúteo smith', level: 2, category: 'E', muscleGroup: ['glúteos'], equipment: ['smith'] },
  { code: 'E59', name: 'Agachamento glúteo', level: 2, category: 'E', muscleGroup: ['glúteos', 'quadríceps'], equipment: ['barra'] },
  { code: 'E60', name: 'Agachamento sumô pausado', level: 2, category: 'E', muscleGroup: ['glúteos', 'adutores'], equipment: ['halter'] },
  
  // N3 - Avançado
  { code: 'E23', name: 'Nordic curl', level: 3, category: 'E', muscleGroup: ['posterior'] },
  { code: 'E72', name: 'Deadlift unilateral', level: 3, category: 'E', muscleGroup: ['glúteos', 'posterior'], equipment: ['halter'] },
  { code: 'E75', name: 'Hip thrust máximo', level: 3, category: 'E', muscleGroup: ['glúteos'], equipment: ['barra', 'banco'] },
  { code: 'E76', name: 'Glúteo máximo', level: 3, category: 'E', muscleGroup: ['glúteos'] },
  { code: 'E80', name: 'Glúteo fadiga total', level: 3, category: 'E', muscleGroup: ['glúteos'] },
  { code: 'E53', name: 'Hip thrust excêntrico', level: 3, category: 'E', muscleGroup: ['glúteos'], equipment: ['barra', 'banco'] },
  { code: 'E71', name: 'Stiff pausa longa', level: 3, category: 'E', muscleGroup: ['posterior', 'glúteos'], equipment: ['barra'] },
  { code: 'E47', name: 'Stiff pausado', level: 3, category: 'E', muscleGroup: ['posterior', 'glúteos'], equipment: ['barra'] },
  { code: 'E48', name: 'Flexora lenta', level: 3, category: 'E', muscleGroup: ['posterior'], equipment: ['máquina'] },
  { code: 'E49', name: 'Flexora excêntrica', level: 3, category: 'E', muscleGroup: ['posterior'], equipment: ['máquina'] },
  
  // N4 - Expert
  { code: 'E74', name: 'Ponte máxima', level: 4, category: 'E', muscleGroup: ['glúteos'] },
  { code: 'E64', name: 'Elevação pélvica longa', level: 4, category: 'E', muscleGroup: ['glúteos'] },
  { code: 'E66', name: 'Sprint inclinado', level: 4, category: 'E', muscleGroup: ['glúteos', 'posterior'], equipment: ['esteira'] },
  { code: 'E67', name: 'Step lateral glúteo', level: 4, category: 'E', muscleGroup: ['glúteos'], equipment: ['elástico'] },
  { code: 'E68', name: 'Glúteo bola', level: 4, category: 'E', muscleGroup: ['glúteos'], equipment: ['bola suíça'] },
  { code: 'E69', name: 'Glúteo toalha', level: 4, category: 'E', muscleGroup: ['glúteos'], equipment: ['toalha'] },
  { code: 'E73', name: 'Deadlift pausado', level: 4, category: 'E', muscleGroup: ['posterior', 'glúteos'], equipment: ['barra'] },
  { code: 'E61', name: 'Afundo isométrico', level: 4, category: 'E', muscleGroup: ['glúteos', 'quadríceps'] },
  { code: 'E62', name: 'Abdução isométrica', level: 4, category: 'E', muscleGroup: ['glúteos'] },
  { code: 'E63', name: 'Ponte isométrica', level: 4, category: 'E', muscleGroup: ['glúteos'] },
];

// ==========================================
// FUNÇÕES AUXILIARES
// ==========================================

// Todos os exercícios combinados
export const ALL_EXERCISES: Exercise[] = [
  ...CATEGORY_A_EXERCISES,
  ...CATEGORY_B_EXERCISES,
  ...CATEGORY_C_EXERCISES,
  ...CATEGORY_D_EXERCISES,
  ...CATEGORY_E_EXERCISES,
];

// Buscar exercícios por categoria
export const getExercisesByCategory = (category: 'A' | 'B' | 'C' | 'D' | 'E'): Exercise[] => {
  switch (category) {
    case 'A': return CATEGORY_A_EXERCISES;
    case 'B': return CATEGORY_B_EXERCISES;
    case 'C': return CATEGORY_C_EXERCISES;
    case 'D': return CATEGORY_D_EXERCISES;
    case 'E': return CATEGORY_E_EXERCISES;
    default: return [];
  }
};

// Buscar exercícios por nível
export const getExercisesByLevel = (level: 1 | 2 | 3 | 4): Exercise[] => {
  return ALL_EXERCISES.filter(ex => ex.level === level);
};

// Buscar exercícios por categoria e nível
export const getExercisesByCategoryAndLevel = (
  category: 'A' | 'B' | 'C' | 'D' | 'E',
  level: 1 | 2 | 3 | 4
): Exercise[] => {
  return getExercisesByCategory(category).filter(ex => ex.level === level);
};

// Buscar exercícios para local (casa vs academia)
export const getExercisesForLocation = (
  category: 'A' | 'B' | 'C' | 'D' | 'E',
  location: 'casa' | 'academia' | 'casa_equipamentos',
  level: 1 | 2 | 3 | 4
): Exercise[] => {
  const exercises = getExercisesByCategoryAndLevel(category, level);
  
  if (location === 'casa') {
    // Casa sem equipamentos - apenas exercícios sem equipment ou com items básicos
    return exercises.filter(ex => 
      !ex.equipment || 
      ex.equipment.every(eq => ['banco', 'cadeira', 'toalha', 'elástico'].includes(eq))
    );
  }
  
  if (location === 'casa_equipamentos') {
    // Casa com equipamentos - exclui máquinas de academia
    return exercises.filter(ex => 
      !ex.equipment || 
      ex.equipment.every(eq => !['máquina', 'polia', 'smith', 'leg press'].includes(eq))
    );
  }
  
  // Academia - todos os exercícios
  return exercises;
};

// Mapear nível do usuário para nível de exercício
export const mapUserLevelToExerciseLevel = (userLevel: string): 1 | 2 | 3 | 4 => {
  switch (userLevel.toLowerCase()) {
    case 'sedentario':
    case 'sedentário':
    case 'iniciante':
      return 1;
    case 'ativo':
    case 'intermediário':
    case 'intermediario':
      return 2;
    case 'atleta':
    case 'avançado':
    case 'avancado':
      return 3;
    case 'expert':
    case 'profissional':
      return 4;
    default:
      return 1;
  }
};

// Gerar treino baseado nas respostas do usuário
export const generateWorkoutFromAnswers = (
  answers: {
    level: string;
    location: string;
    goal: string;
    gender?: string;
    bodyFocus?: string;
  }
): { dayName: string; exercises: Exercise[] }[] => {
  const level = mapUserLevelToExerciseLevel(answers.level);
  const location = answers.location.includes('casa_sem') ? 'casa' : 
                   answers.location.includes('casa_com') ? 'casa_equipamentos' : 'academia';
  
  // Determinar categorias baseado no objetivo e foco corporal
  let categories: ('A' | 'B' | 'C' | 'D' | 'E')[];
  
  if (answers.bodyFocus === 'gluteos' || answers.gender === 'feminino') {
    // Foco em glúteos - mais exercícios E e C
    categories = ['E', 'C', 'D', 'A', 'B'];
  } else if (answers.goal === 'hipertrofia') {
    // Hipertrofia tradicional
    categories = ['A', 'B', 'C', 'D', 'E'];
  } else if (answers.goal === 'emagrecer') {
    // Emagrecimento - circuitos
    categories = ['C', 'A', 'B', 'D', 'E'];
  } else {
    // Condicionamento geral
    categories = ['A', 'B', 'C', 'D', 'E'];
  }
  
  // Gerar treino semanal
  const workoutDays = [
    { dayName: 'Segunda - Peito/Tríceps', category: 'A' as const },
    { dayName: 'Terça - Costas/Bíceps', category: 'B' as const },
    { dayName: 'Quarta - Pernas', category: 'C' as const },
    { dayName: 'Quinta - Ombro/Abdômen', category: 'D' as const },
    { dayName: 'Sexta - Glúteos/Posterior', category: 'E' as const },
  ];
  
  return workoutDays.map(day => ({
    dayName: day.dayName,
    exercises: getExercisesForLocation(day.category, location, level).slice(0, 6)
  }));
};

// Nomes das categorias
export const CATEGORY_NAMES: Record<string, string> = {
  'A': 'Peito + Tríceps',
  'B': 'Costas + Bíceps',
  'C': 'Pernas',
  'D': 'Ombro + Abdômen',
  'E': 'Glúteos + Posterior',
};

// Descrição dos níveis
export const LEVEL_DESCRIPTIONS: Record<number, string> = {
  1: 'Iniciante (N1)',
  2: 'Intermediário (N2)',
  3: 'Avançado (N3)',
  4: 'Expert (N4)',
};
