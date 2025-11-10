/**
 * 🏥 SISTEMA DE DETECÇÃO DE CONDIÇÕES MÉDICAS
 * 
 * Este arquivo contém toda a lógica de detecção automática de condições
 * médicas baseadas em dados do usuário (IMC, gordura corporal, pressão, etc.)
 */

export interface CondicaoMedica {
  id: string;
  nome: string;
  descricao: string;
  urgencia: number; // 1-10 (10 = crítico)
  multiplicador_score: number; // Multiplica o peso do score médico
  categorias_recomendadas: string[];
  produtos_especificos: string[];
  tags_relacionadas: string[];
  mensagem_alerta: string;
  cor_badge: 'red' | 'orange' | 'yellow' | 'blue';
  icone: string;
}

export const condicoesMedicas: Record<string, CondicaoMedica> = {
  obesidade_severa: {
    id: 'obesidade_severa',
    nome: 'Obesidade Severa',
    descricao: 'IMC ≥ 35 - Requer intervenção imediata para saúde metabólica',
    urgencia: 10,
    multiplicador_score: 3.0,
    categorias_recomendadas: ['emagrecimento', 'vitaminas', 'cardiovascular'],
    produtos_especificos: ['CART_CONTROL', 'AZ_COMPLEX', 'OMEGA_3'],
    tags_relacionadas: ['emagrecimento', 'metabolismo', 'termogenese', 'gordura_abdominal'],
    mensagem_alerta: 'Seu IMC indica obesidade severa. Controle de peso é prioridade CRÍTICA para sua saúde.',
    cor_badge: 'red',
    icone: '🚨'
  },
  
  obesidade: {
    id: 'obesidade',
    nome: 'Obesidade',
    descricao: 'IMC entre 30-34.9 - Risco elevado para doenças metabólicas',
    urgencia: 9,
    multiplicador_score: 2.5,
    categorias_recomendadas: ['emagrecimento', 'vitaminas', 'cardiovascular'],
    produtos_especificos: ['CART_CONTROL', 'OMEGA_3', 'AZ_COMPLEX'],
    tags_relacionadas: ['emagrecimento', 'metabolismo', 'termogenese'],
    mensagem_alerta: 'Seu IMC indica obesidade. Controle de peso é prioridade ALTA para prevenir complicações.',
    cor_badge: 'red',
    icone: '🔴'
  },
  
  sobrepeso_critico: {
    id: 'sobrepeso_critico',
    nome: 'Sobrepeso Crítico',
    descricao: 'IMC entre 27-29.9 - Próximo da obesidade, intervenção necessária',
    urgencia: 7,
    multiplicador_score: 2.0,
    categorias_recomendadas: ['emagrecimento', 'vitaminas'],
    produtos_especificos: ['CART_CONTROL', 'OMEGA_3'],
    tags_relacionadas: ['emagrecimento', 'metabolismo'],
    mensagem_alerta: 'Seu IMC indica sobrepeso crítico. Controle de peso evitará progressão para obesidade.',
    cor_badge: 'orange',
    icone: '🟠'
  },
  
  sobrepeso: {
    id: 'sobrepeso',
    nome: 'Sobrepeso',
    descricao: 'IMC entre 25-26.9 - Atenção para evitar progressão',
    urgencia: 5,
    multiplicador_score: 1.5,
    categorias_recomendadas: ['emagrecimento', 'vitaminas'],
    produtos_especificos: ['CART_CONTROL', 'MACA_PERUANA'],
    tags_relacionadas: ['emagrecimento', 'metabolismo'],
    mensagem_alerta: 'Seu IMC indica sobrepeso leve. Controle agora evitará progressão.',
    cor_badge: 'yellow',
    icone: '🟡'
  },
  
  gordura_visceral_alta: {
    id: 'gordura_visceral_alta',
    nome: 'Gordura Visceral Elevada',
    descricao: 'Gordura corporal acima do ideal - Risco metabólico',
    urgencia: 8,
    multiplicador_score: 2.5,
    categorias_recomendadas: ['emagrecimento', 'cardiovascular'],
    produtos_especificos: ['CART_CONTROL', 'OMEGA_3', 'MACA_PERUANA'],
    tags_relacionadas: ['gordura_abdominal', 'metabolismo', 'cardiovascular'],
    mensagem_alerta: 'Gordura corporal elevada aumenta risco de diabetes e doenças cardiovasculares.',
    cor_badge: 'orange',
    icone: '⚠️'
  },
  
  sindrome_metabolica: {
    id: 'sindrome_metabolica',
    nome: 'Síndrome Metabólica',
    descricao: 'Múltiplos fatores de risco metabólico presentes',
    urgencia: 9,
    multiplicador_score: 3.0,
    categorias_recomendadas: ['emagrecimento', 'cardiovascular', 'vitaminas', 'minerais'],
    produtos_especificos: ['CART_CONTROL', 'OMEGA_3', 'CLORETO_MAGNESIO', 'AZ_COMPLEX'],
    tags_relacionadas: ['metabolismo', 'cardiovascular', 'diabetes', 'pressao'],
    mensagem_alerta: 'Múltiplos fatores de risco detectados. Intervenção abrangente é CRÍTICA.',
    cor_badge: 'red',
    icone: '🚨'
  },
  
  diabetes_pre_diabetes: {
    id: 'diabetes_pre_diabetes',
    nome: 'Diabetes / Pré-Diabetes',
    descricao: 'Glicemia alterada ou diabetes diagnosticado',
    urgencia: 9,
    multiplicador_score: 3.0,
    categorias_recomendadas: ['vitaminas', 'minerais', 'cardiovascular', 'emagrecimento'],
    produtos_especificos: ['AZ_COMPLEX', 'CLORETO_MAGNESIO', 'OMEGA_3', 'CROMO'],
    tags_relacionadas: ['diabetes', 'insulina', 'glicemia', 'metabolismo'],
    mensagem_alerta: 'Controle glicêmico é essencial para prevenir complicações do diabetes.',
    cor_badge: 'red',
    icone: '💉'
  },
  
  hipertensao: {
    id: 'hipertensao',
    nome: 'Hipertensão Arterial',
    descricao: 'Pressão arterial elevada',
    urgencia: 8,
    multiplicador_score: 2.5,
    categorias_recomendadas: ['cardiovascular', 'minerais'],
    produtos_especificos: ['CLORETO_MAGNESIO', 'OMEGA_3', 'POTASSIO'],
    tags_relacionadas: ['hipertensao', 'pressao_arterial', 'cardiovascular'],
    mensagem_alerta: 'Pressão alta requer atenção para prevenir eventos cardiovasculares.',
    cor_badge: 'orange',
    icone: '❤️'
  },
  
  colesterol_alto: {
    id: 'colesterol_alto',
    nome: 'Colesterol Elevado',
    descricao: 'Colesterol total ou LDL acima do ideal',
    urgencia: 7,
    multiplicador_score: 2.0,
    categorias_recomendadas: ['cardiovascular', 'vitaminas'],
    produtos_especificos: ['OMEGA_3', 'BERBERINA', 'NIACINA'],
    tags_relacionadas: ['colesterol', 'cardiovascular', 'triglicerides'],
    mensagem_alerta: 'Colesterol elevado aumenta risco cardiovascular.',
    cor_badge: 'orange',
    icone: '💓'
  },
  
  triglicerides_alto: {
    id: 'triglicerides_alto',
    nome: 'Triglicerídeos Elevados',
    descricao: 'Triglicerídeos acima de 150 mg/dL',
    urgencia: 7,
    multiplicador_score: 2.0,
    categorias_recomendadas: ['cardiovascular', 'emagrecimento'],
    produtos_especificos: ['OMEGA_3', 'BERBERINA', 'CART_CONTROL'],
    tags_relacionadas: ['triglicerides', 'cardiovascular', 'metabolismo'],
    mensagem_alerta: 'Triglicerídeos altos requerem controle alimentar e suplementação.',
    cor_badge: 'orange',
    icone: '🔸'
  },
  
  idade_metabolica_elevada: {
    id: 'idade_metabolica_elevada',
    nome: 'Idade Metabólica Elevada',
    descricao: 'Idade metabólica superior à idade cronológica',
    urgencia: 6,
    multiplicador_score: 1.8,
    categorias_recomendadas: ['energia', 'vitaminas', 'antioxidantes'],
    produtos_especificos: ['MACA_PERUANA', 'AZ_COMPLEX', 'COENZIMA_Q10'],
    tags_relacionadas: ['energia', 'metabolismo', 'envelhecimento'],
    mensagem_alerta: 'Idade metabólica elevada indica necessidade de otimização metabólica.',
    cor_badge: 'yellow',
    icone: '⏰'
  },
  
  fadiga_cronica: {
    id: 'fadiga_cronica',
    nome: 'Fadiga Crônica',
    descricao: 'Cansaço persistente e baixa energia',
    urgencia: 6,
    multiplicador_score: 2.0,
    categorias_recomendadas: ['energia', 'vitaminas'],
    produtos_especificos: ['VITAMINA_B12', 'FERRO', 'MACA_PERUANA', 'AZ_COMPLEX', 'COENZIMA_Q10'],
    tags_relacionadas: ['fadiga', 'energia', 'cansaco'],
    mensagem_alerta: 'Fadiga crônica pode indicar deficiências nutricionais.',
    cor_badge: 'yellow',
    icone: '😴'
  },
  
  anemia: {
    id: 'anemia',
    nome: 'Anemia',
    descricao: 'Deficiência de ferro ou vitamina B12',
    urgencia: 8,
    multiplicador_score: 2.5,
    categorias_recomendadas: ['minerais', 'vitaminas'],
    produtos_especificos: ['FERRO', 'VITAMINA_B12', 'ACIDO_FOLICO', 'AZ_COMPLEX'],
    tags_relacionadas: ['anemia', 'ferro', 'fadiga', 'b12'],
    mensagem_alerta: 'Anemia requer suplementação específica de ferro e vitaminas do complexo B.',
    cor_badge: 'red',
    icone: '🩸'
  },
  
  imunidade_baixa: {
    id: 'imunidade_baixa',
    nome: 'Imunidade Comprometida',
    descricao: 'Infecções frequentes ou recuperação lenta',
    urgencia: 7,
    multiplicador_score: 2.0,
    categorias_recomendadas: ['vitaminas', 'minerais', 'digestao'],
    produtos_especificos: ['VITAMINA_D3', 'ZINCO', 'VITAMINA_C', 'PROBIOTICOS', 'AZ_COMPLEX'],
    tags_relacionadas: ['imunidade', 'vitamina_d', 'zinco', 'probioticos'],
    mensagem_alerta: 'Sistema imune enfraquecido requer suporte nutricional específico.',
    cor_badge: 'orange',
    icone: '🛡️'
  },
  
  estresse_cronico: {
    id: 'estresse_cronico',
    nome: 'Estresse Crônico',
    descricao: 'Níveis elevados de estresse e cortisol',
    urgencia: 7,
    multiplicador_score: 2.0,
    categorias_recomendadas: ['adaptogenos', 'vitaminas', 'minerais'],
    produtos_especificos: ['ASHWAGANDHA', 'RHODIOLA', 'CLORETO_MAGNESIO', 'VITAMINA_B6'],
    tags_relacionadas: ['estresse', 'cortisol', 'ansiedade', 'adaptogeno'],
    mensagem_alerta: 'Estresse crônico prejudica saúde física e mental. Suporte adaptogênico é essencial.',
    cor_badge: 'orange',
    icone: '😰'
  },
  
  insonia: {
    id: 'insonia',
    nome: 'Insônia / Distúrbios do Sono',
    descricao: 'Dificuldade para dormir ou sono não restaurador',
    urgencia: 6,
    multiplicador_score: 1.8,
    categorias_recomendadas: ['sono', 'minerais', 'adaptogenos'],
    produtos_especificos: ['MELATONINA', 'CLORETO_MAGNESIO', 'ASHWAGANDHA', 'L_TEANINA'],
    tags_relacionadas: ['sono', 'insonia', 'melatonina', 'magnesio'],
    mensagem_alerta: 'Sono de qualidade é essencial para saúde. Suporte natural pode ajudar.',
    cor_badge: 'yellow',
    icone: '😴'
  },
  
  problemas_digestivos: {
    id: 'problemas_digestivos',
    nome: 'Problemas Digestivos',
    descricao: 'Constipação, diarreia, gases ou desconforto abdominal',
    urgencia: 6,
    multiplicador_score: 1.8,
    categorias_recomendadas: ['digestao', 'aminoacidos'],
    produtos_especificos: ['PROBIOTICOS', 'GLUTAMINA', 'CURCUMA'],
    tags_relacionadas: ['intestino', 'digestao', 'probioticos', 'gases'],
    mensagem_alerta: 'Saúde digestiva afeta imunidade e bem-estar geral.',
    cor_badge: 'yellow',
    icone: '🦠'
  },
  
  sarcopenia_risco: {
    id: 'sarcopenia_risco',
    nome: 'Risco de Sarcopenia',
    descricao: 'Massa muscular baixa para idade (>50 anos)',
    urgencia: 7,
    multiplicador_score: 2.0,
    categorias_recomendadas: ['proteinas', 'aminoacidos', 'vitaminas'],
    produtos_especificos: ['WHEY_PROTEIN', 'CREATINA', 'BCAA', 'VITAMINA_D3', 'LEUCINA'],
    tags_relacionadas: ['massa_muscular', 'sarcopenia', 'proteina', 'envelhecimento'],
    mensagem_alerta: 'Preservação de massa muscular é crucial após 50 anos.',
    cor_badge: 'orange',
    icone: '💪'
  },
  
  osteoporose_risco: {
    id: 'osteoporose_risco',
    nome: 'Risco de Osteoporose',
    descricao: 'Densidade óssea baixa ou fatores de risco presentes',
    urgencia: 7,
    multiplicador_score: 2.0,
    categorias_recomendadas: ['ossos', 'vitaminas', 'minerais'],
    produtos_especificos: ['CALCIO_VITAMINA_K2', 'VITAMINA_D3', 'COLAGENO', 'MAGNESIO'],
    tags_relacionadas: ['ossos', 'osteoporose', 'calcio', 'vitamina_d'],
    mensagem_alerta: 'Fortalecimento ósseo é essencial para prevenir fraturas.',
    cor_badge: 'orange',
    icone: '🦴'
  },
  
  menopausa_sintomas: {
    id: 'menopausa_sintomas',
    nome: 'Sintomas de Menopausa',
    descricao: 'Mulher com sintomas da menopausa',
    urgencia: 6,
    multiplicador_score: 1.8,
    categorias_recomendadas: ['hormonal', 'ossos', 'vitaminas'],
    produtos_especificos: ['MACA_PERUANA', 'CALCIO_VITAMINA_K2', 'VITAMINA_D3', 'COLAGENO'],
    tags_relacionadas: ['menopausa', 'hormonal', 'ossos', 'calcio'],
    mensagem_alerta: 'Suporte nutricional adequado alivia sintomas da menopausa.',
    cor_badge: 'yellow',
    icone: '🌺'
  }
};

/**
 * Função para detectar condições médicas baseadas no perfil do usuário
 */
export function detectarCondicoesMedicas(perfil: any): CondicaoMedica[] {
  const condicoesDetectadas: CondicaoMedica[] = [];
  
  // Calcular IMC se peso e altura disponíveis
  let imc = 0;
  if (perfil.weight && perfil.height) {
    imc = perfil.weight / Math.pow(perfil.height / 100, 2);
  }
  
  // Obter última medição de gordura corporal
  const gorduraCorporal = perfil.body_fat || 0;
  
  // Obter idade
  const idade = perfil.age || 0;
  
  // Obter gênero
  const genero = perfil.gender || 'masculino';
  
  // 1. ANÁLISE DO IMC
  if (imc >= 35) {
    condicoesDetectadas.push(condicoesMedicas.obesidade_severa);
  } else if (imc >= 30) {
    condicoesDetectadas.push(condicoesMedicas.obesidade);
  } else if (imc >= 27) {
    condicoesDetectadas.push(condicoesMedicas.sobrepeso_critico);
  } else if (imc >= 25) {
    condicoesDetectadas.push(condicoesMedicas.sobrepeso);
  }
  
  // 2. ANÁLISE DE GORDURA CORPORAL
  const limiteGordura = genero === 'masculino' ? 25 : 35;
  if (gorduraCorporal > limiteGordura) {
    condicoesDetectadas.push(condicoesMedicas.gordura_visceral_alta);
  }
  
  // 3. SÍNDROME METABÓLICA (múltiplos fatores)
  const fatoresRisco = [
    imc >= 30,
    gorduraCorporal > limiteGordura,
    perfil.health_conditions?.includes('hipertensao'),
    perfil.health_conditions?.includes('diabetes'),
    perfil.health_conditions?.includes('colesterol_alto')
  ].filter(Boolean).length;
  
  if (fatoresRisco >= 3) {
    condicoesDetectadas.push(condicoesMedicas.sindrome_metabolica);
  }
  
  // 4. ANÁLISE DE PROBLEMAS DE SAÚDE DECLARADOS
  const problemasColesterol = perfil.health_conditions || [];
  
  if (problemasColesterol.includes('diabetes') || problemasColesterol.includes('pre_diabetes')) {
    condicoesDetectadas.push(condicoesMedicas.diabetes_pre_diabetes);
  }
  
  if (problemasColesterol.includes('hipertensao') || problemasColesterol.includes('pressao_alta')) {
    condicoesDetectadas.push(condicoesMedicas.hipertensao);
  }
  
  if (problemasColesterol.includes('colesterol_alto')) {
    condicoesDetectadas.push(condicoesMedicas.colesterol_alto);
  }
  
  if (problemasColesterol.includes('triglicerides_alto')) {
    condicoesDetectadas.push(condicoesMedicas.triglicerides_alto);
  }
  
  if (problemasColesterol.includes('fadiga') || problemasColesterol.includes('cansaco')) {
    condicoesDetectadas.push(condicoesMedicas.fadiga_cronica);
  }
  
  if (problemasColesterol.includes('anemia')) {
    condicoesDetectadas.push(condicoesMedicas.anemia);
  }
  
  if (problemasColesterol.includes('infeccoes_frequentes') || problemasColesterol.includes('imunidade_baixa')) {
    condicoesDetectadas.push(condicoesMedicas.imunidade_baixa);
  }
  
  if (problemasColesterol.includes('estresse') || problemasColesterol.includes('ansiedade')) {
    condicoesDetectadas.push(condicoesMedicas.estresse_cronico);
  }
  
  if (problemasColesterol.includes('insonia') || problemasColesterol.includes('sono_ruim')) {
    condicoesDetectadas.push(condicoesMedicas.insonia);
  }
  
  if (problemasColesterol.includes('problemas_digestivos') || problemasColesterol.includes('intestino_preso')) {
    condicoesDetectadas.push(condicoesMedicas.problemas_digestivos);
  }
  
  if (problemasColesterol.includes('dores_articulares') || problemasColesterol.includes('artrite')) {
    // Adicionar quando tivermos essa condição
  }
  
  // 5. IDADE E CONDIÇÕES RELACIONADAS
  if (idade >= 50 && genero === 'masculino') {
    condicoesDetectadas.push(condicoesMedicas.sarcopenia_risco);
  }
  
  if (idade >= 50 && genero === 'feminino') {
    condicoesDetectadas.push(condicoesMedicas.osteoporose_risco);
    condicoesDetectadas.push(condicoesMedicas.menopausa_sintomas);
  }
  
  if (idade > 45 && (perfil.metabolic_age && perfil.metabolic_age > idade + 5)) {
    condicoesDetectadas.push(condicoesMedicas.idade_metabolica_elevada);
  }
  
  // Remover duplicatas
  const condicoesUnicas = Array.from(
    new Map(condicoesDetectadas.map(item => [item.id, item])).values()
  );
  
  return condicoesUnicas;
}

/**
 * Calcula a prioridade de um produto baseado nas condições detectadas
 */
export function calcularPrioridadeProduto(
  condicoes: CondicaoMedica[],
  score: number
): 'CRÍTICA' | 'ALTA' | 'MÉDIA' | 'BAIXA' {
  if (condicoes.length === 0) return 'BAIXA';
  
  const maxUrgencia = Math.max(...condicoes.map(c => c.urgencia));
  
  if (maxUrgencia >= 9 && score > 1000) return 'CRÍTICA';
  if (maxUrgencia >= 7) return 'ALTA';
  if (maxUrgencia >= 5) return 'MÉDIA';
  return 'BAIXA';
}

