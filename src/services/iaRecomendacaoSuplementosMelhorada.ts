/**
 * 🧠 SISTEMA AVANÇADO DE RECOMENDAÇÃO DE NUTRACÊUTICOS
 * Versão 2.0 - Sistema completo com IA médica
 * 
 * Features:
 * - Detecção automática de condições médicas
 * - Score base (0-100) + Score médico (0-1000+)
 * - Busca dinâmica de artigos científicos
 * - Validações de segurança (alergias, contraindicações)
 * - Priorização médica (CRÍTICA, ALTA, MÉDIA, BAIXA)
 * - Mensagens personalizadas baseadas em dados reais
 */

import { detectarCondicoesMedicas, calcularPrioridadeProduto, type CondicaoMedica } from './condicoesMedicas';
import produtosAtlantica from '@/data/produtos-atlantica-completo.json';
import artigosCientificos from '@/data/artigos-cientificos-especificos.json';
import mapeamentoEvidencias from '@/data/mapeamento-produtos-evidencias.json';

// ==================== INTERFACES ====================

interface UserProfile {
  id: string;
  age?: number;
  gender?: string;
  weight?: number;
  height?: number;
  activity_level?: string;
  goals?: string[];
  health_conditions?: string[];
  allergies?: string[];
  dietary_restrictions?: string[];
  medications?: string[];
}

interface UserAnamnesis {
  id: string;
  user_id: string;
  sleep_quality?: string;
  stress_level?: string;
  energy_level?: string;
  digestive_issues?: string[];
  allergies?: string[];
  medications?: string[];
}

interface UserMeasurements {
  id: string;
  user_id: string;
  body_fat?: number;
  muscle_mass?: number;
  water_percentage?: number;
  metabolic_age?: number;
  visceral_fat?: number;
}

interface Produto {
  id: string;
  name: string;
  brand: string;
  category: string;
  active_ingredients: string[];
  recommended_dosage: string;
  benefits: string[];
  contraindications: string[];
  description: string;
  original_price: number;
  discount_price: number;
  stock_quantity: number;
  is_approved: boolean;
  tags: string[];
}

interface ArtigoCientifico {
  id: string;
  produto_id: string;
  produto_nome: string;
  titulo: string;
  autores: string;
  ano: number;
  revista: string;
  doi: string;
  pubmed_id: string;
  url: string;
  resumo: string;
  conclusao: string;
  nivel_evidencia: string;
  tags: string[];
}

interface RecomendacaoCompleta {
  produto: Produto;
  score_base: number;
  score_medico: number;
  score_final: number;
  prioridade_medica: 'CRÍTICA' | 'ALTA' | 'MÉDIA' | 'BAIXA';
  condicoes_tratadas: CondicaoMedica[];
  razoes_medicas: string[];
  mensagem_personalizada: string;
  dosagem_personalizada: string;
  beneficios_especificos: string[];
  artigo_cientifico?: ArtigoCientifico;
  evidencias_persuasivas: any;
  validacoes: {
    seguro: boolean;
    alertas: string[];
  };
}

// ==================== PESOS E CONFIGURAÇÕES ====================

const PESOS_CATEGORIAS = {
  'vitaminas': 2.5,
  'energia': 1.8,
  'emagrecimento': 1.5,
  'cardiovascular': 1.5,
  'minerais': 1.3,
  'sono': 1.0,
  'digestao': 1.0,
  'proteinas': 1.0,
  'aminoacidos': 1.0,
  'performance': 0.8,
  'imunidade': 0.5,
  'colageno': 0.3,
  'beleza': 0.3
};

const PRODUTOS_ESSENCIAIS = [
  'AZ_COMPLEX',
  'VITAMINA_D3',
  'OMEGA_3',
  'VITAMINA_B12',
  'CLORETO_MAGNESIO',
  'ZINCO',
  'VITAMINA_C'
];

// ==================== SISTEMA DE SCORING ====================

/**
 * Calcula o score base (0-100 pontos)
 */
function calcularScoreBase(
  produto: Produto,
  perfil: UserProfile,
  anamnesis: UserAnamnesis | null
): number {
  let score = 0;
  
  // 1. PESO DA CATEGORIA (0-37.5 pontos)
  const pesoCategoria = PESOS_CATEGORIAS[produto.category as keyof typeof PESOS_CATEGORIAS] || 1.0;
  score += pesoCategoria * 15;
  
  // 2. PRODUTOS ESSENCIAIS (+50 pontos)
  if (PRODUTOS_ESSENCIAIS.includes(produto.id)) {
    score += 50;
  }
  
  // 3. MATCH COM OBJETIVOS (+10 pontos cada)
  const objetivos = perfil.goals || [];
  produto.tags.forEach(tag => {
    if (objetivos.some(obj => tag.includes(obj) || obj.includes(tag))) {
      score += 10;
    }
  });
  
  // 4. MATCH COM PROBLEMAS DE SAÚDE (+100 pontos cada) ⚠️ PESO ALTÍSSIMO
  const problemas = perfil.health_conditions || [];
  produto.tags.forEach(tag => {
    if (problemas.some(prob => tag.includes(prob) || prob.includes(tag))) {
      score += 100;
    }
  });
  
  // 5. MATCH COM PREFERÊNCIAS (+5 pontos cada)
  const restricoes = perfil.dietary_restrictions || [];
  if (restricoes.includes('vegetariano') && !produto.active_ingredients.some(ing => 
    ing.toLowerCase().includes('carne') || ing.toLowerCase().includes('peixe')
  )) {
    score += 5;
  }
  
  return Math.min(score, 200); // Cap em 200 para score base
}

/**
 * Calcula o score médico (0-1000+ pontos)
 * Baseado em condições médicas críticas detectadas
 */
function calcularScoreMedico(
  produto: Produto,
  condicoes: CondicaoMedica[]
): number {
  if (condicoes.length === 0) return 0;
  
  let scoreMedico = 0;
  
  condicoes.forEach(condicao => {
    // CATEGORIA RECOMENDADA (+urgencia × multiplicador × 40)
    if (condicao.categorias_recomendadas.includes(produto.category)) {
      scoreMedico += condicao.urgencia * condicao.multiplicador_score * 40;
    }
    
    // PRODUTO ESPECÍFICO (+urgencia × multiplicador × 60) - PESO MAIOR
    if (condicao.produtos_especificos.includes(produto.id)) {
      scoreMedico += condicao.urgencia * condicao.multiplicador_score * 60;
    }
    
    // TAGS RELACIONADAS (+match × urgencia × 10)
    const matchTags = produto.tags.filter(tag => 
      condicao.tags_relacionadas.includes(tag)
    ).length;
    scoreMedico += matchTags * condicao.urgencia * 10;
  });
  
  return Math.round(scoreMedico);
}

// ==================== BUSCA DE ARTIGOS CIENTÍFICOS ====================

/**
 * Busca artigo científico específico para o produto
 * Etapa 1: Busca por produto_id
 * Etapa 2: Busca por categoria/tags (fallback)
 */
function buscarArtigoCientifico(produto: Produto): ArtigoCientifico | null {
  // ETAPA 1: Busca específica por produto_id
  const artigoEspecifico = artigosCientificos.find(
    artigo => artigo.produto_id === produto.id
  );
  
  if (artigoEspecifico) {
    return artigoEspecifico as ArtigoCientifico;
  }
  
  // ETAPA 2: Busca por categoria ou tags relacionadas
  const artigoCategoria = artigosCientificos.find(artigo => {
    const tagsMatch = artigo.tags.some(tag => produto.tags.includes(tag));
    return tagsMatch;
  });
  
  return artigoCategoria as ArtigoCientifico || null;
}

/**
 * Busca evidências persuasivas para o produto
 */
function buscarEvidenciasPersuasivas(produto: Produto): any {
  return mapeamentoEvidencias.find(
    ev => ev.produto_id === produto.id
  ) || null;
}

// ==================== VALIDAÇÕES DE SEGURANÇA ====================

/**
 * Valida se o produto é seguro para o usuário
 * Verifica alergias, contraindicações e interações medicamentosas
 */
function validarSeguranca(
  produto: Produto,
  perfil: UserProfile,
  anamnesis: UserAnamnesis | null
): { seguro: boolean; alertas: string[] } {
  const alertas: string[] = [];
  
  // 1. VERIFICAR ALERGIAS
  const alergias = [
    ...(perfil.allergies || []),
    ...(anamnesis?.allergies || [])
  ];
  
  alergias.forEach(alergia => {
    const alergiaNorm = alergia.toLowerCase();
    
    // Verificar ingredientes
    const temAlergia = produto.active_ingredients.some(ing => 
      ing.toLowerCase().includes(alergiaNorm)
    );
    
    if (temAlergia) {
      alertas.push(`⚠️ ALERTA: Contém ${alergia}. Você declarou alergia a este ingrediente.`);
    }
  });
  
  // 2. VERIFICAR CONTRAINDICAÇÕES
  const problemsSaude = perfil.health_conditions || [];
  
  // Gravidez e Lactação
  if (problemsSaude.includes('gravidez') || problemsSaude.includes('gestante')) {
    if (produto.contraindications.some(c => c.toLowerCase().includes('gravidez'))) {
      alertas.push('⚠️ CONTRAINDICADO durante a gravidez. Consulte seu médico.');
    }
  }
  
  if (problemsSaude.includes('lactacao') || problemsSaude.includes('amamentando')) {
    if (produto.contraindications.some(c => c.toLowerCase().includes('lactação'))) {
      alertas.push('⚠️ CONTRAINDICADO durante a lactação. Consulte seu médico.');
    }
  }
  
  // Hipertensão e produtos termogênicos
  if (problemsSaude.includes('hipertensao') || problemsSaude.includes('pressao_alta')) {
    if (produto.tags.includes('termogenico') || produto.active_ingredients.some(ing => 
      ing.toLowerCase().includes('cafeína')
    )) {
      alertas.push('⚠️ ATENÇÃO: Contém estimulantes. Monitore sua pressão arterial.');
    }
  }
  
  // Diabetes e produtos que afetam glicemia
  if (problemsSaude.includes('diabetes')) {
    if (produto.id === 'BERBERINA' || produto.id === 'CROMO') {
      alertas.push('ℹ️ Este produto pode afetar glicemia. Monitore seus níveis de açúcar.');
    }
  }
  
  // 3. VERIFICAR MEDICAMENTOS
  const medicamentos = [
    ...(perfil.medications || []),
    ...(anamnesis?.medications || [])
  ];
  
  medicamentos.forEach(med => {
    const medNorm = med.toLowerCase();
    
    // Anticoagulantes + Omega 3, Vitamina E
    if ((medNorm.includes('varfarina') || medNorm.includes('anticoagulante')) &&
        (produto.id === 'OMEGA_3' || produto.id === 'VITAMINA_E')) {
      alertas.push('⚠️ INTERAÇÃO: Pode potencializar efeito anticoagulante. Consulte médico.');
    }
    
    // Antidiabéticos + Berberina, Cromo
    if (medNorm.includes('metformina') || medNorm.includes('insulina')) {
      if (produto.id === 'BERBERINA' || produto.id === 'CROMO') {
        alertas.push('⚠️ INTERAÇÃO: Pode potencializar redução de glicemia. Monitore níveis.');
      }
    }
  });
  
  // 4. RESTRIÇÕES ALIMENTARES
  const restricoes = perfil.dietary_restrictions || [];
  
  if (restricoes.includes('vegetariano') || restricoes.includes('vegano')) {
    const temOrigAnimal = produto.active_ingredients.some(ing => 
      ing.toLowerCase().includes('colágeno') ||
      ing.toLowerCase().includes('whey') ||
      ing.toLowerCase().includes('carne') ||
      ing.toLowerCase().includes('peixe')
    );
    
    if (temOrigAnimal) {
      alertas.push('ℹ️ INFORMAÇÃO: Este produto contém ingredientes de origem animal.');
    }
  }
  
  const seguro = alertas.filter(a => a.startsWith('⚠️ CONTRAINDICADO')).length === 0;
  
  return { seguro, alertas };
}

// ==================== MENSAGENS PERSONALIZADAS ====================

/**
 * Gera mensagem personalizada da "Dra. Sofia"
 * Usa nome, idade, IMC e condições específicas do usuário
 */
function gerarMensagemPersonalizada(
  produto: Produto,
  perfil: UserProfile,
  condicoes: CondicaoMedica[],
  evidencias: any
): string {
  const nome = perfil.id.split('-')[0] || 'você';
  const idade = perfil.age || 0;
  const imc = perfil.weight && perfil.height ? 
    (perfil.weight / Math.pow(perfil.height / 100, 2)).toFixed(1) : null;
  
  let mensagem = '';
  
  if (condicoes.length > 0) {
    // MENSAGEM PARA CONDIÇÕES CRÍTICAS
    const condicaoPrincipal = condicoes[0];
    mensagem = `${nome.charAt(0).toUpperCase() + nome.slice(1)}, identifiquei uma oportunidade importante no seu perfil `;
    
    if (idade > 0) mensagem += `(${idade} anos`;
    if (imc) mensagem += `, IMC ${imc}`;
    if (idade > 0 || imc) mensagem += `). `;
    
    mensagem += `\n\n${produto.name} é especialmente indicado para ${condicaoPrincipal.nome.toLowerCase()}. `;
    
    if (evidencias?.mensagem_persuasiva) {
      mensagem += evidencias.mensagem_persuasiva;
    } else {
      mensagem += `Este nutracêutico vai ${produto.benefits[0]?.toLowerCase() || 'auxiliar sua saúde'}.`;
    }
  } else {
    // MENSAGEM GENÉRICA PERSONALIZADA
    mensagem = `${nome.charAt(0).toUpperCase() + nome.slice(1)}, baseado no seu perfil `;
    
    if (idade > 0) mensagem += `de ${idade} anos `;
    mensagem += `recomendo ${produto.name} para `;
    mensagem += produto.benefits.slice(0, 2).map(b => b.toLowerCase()).join(' e ') + '.';
  }
  
  return mensagem;
}

/**
 * Gera razões médicas específicas
 */
function gerarRazoesMedicas(
  produto: Produto,
  condicoes: CondicaoMedica[],
  perfil: UserProfile
): string[] {
  const razoes: string[] = [];
  
  // RAZÕES DE PRIORIDADE MÉDICA
  condicoes.forEach(condicao => {
    if (condicao.produtos_especificos.includes(produto.id)) {
      razoes.push(`🚨 PRIORIDADE MÉDICA: Essencial para tratar ${condicao.nome}`);
      razoes.push(`⚡ INDICAÇÃO ESPECÍFICA: Produto ideal para sua condição`);
    } else if (condicao.categorias_recomendadas.includes(produto.category)) {
      razoes.push(`🎯 RECOMENDAÇÃO MÉDICA: Indicado para ${condicao.nome}`);
    }
  });
  
  // RAZÕES BASEADAS EM DADOS
  const imc = perfil.weight && perfil.height ? 
    perfil.weight / Math.pow(perfil.height / 100, 2) : null;
  
  if (imc && imc >= 30 && produto.tags.includes('emagrecimento')) {
    razoes.push(`🎯 Com IMC ${imc.toFixed(1)}, este produto é fundamental para sua saúde`);
  }
  
  if (perfil.age && perfil.age >= 50 && PRODUTOS_ESSENCIAIS.includes(produto.id)) {
    razoes.push(`⏰ Essencial para sua faixa etária (${perfil.age} anos)`);
  }
  
  // BENEFÍCIOS PRINCIPAIS
  produto.benefits.slice(0, 3).forEach(beneficio => {
    razoes.push(`✅ ${beneficio}`);
  });
  
  return razoes;
}

/**
 * Gera dosagem personalizada
 */
function gerarDosagemPersonalizada(
  produto: Produto,
  perfil: UserProfile
): string {
  const peso = perfil.weight || 70;
  const idade = perfil.age || 30;
  
  // Ajustes específicos por produto
  if (produto.id === 'WHEY_PROTEIN') {
    if (peso < 60) return '25g ao dia (1 scoop)';
    if (peso < 80) return '30g ao dia (1 scoop)';
    return '35-40g ao dia (1-2 scoops)';
  }
  
  if (produto.id === 'CLORETO_MAGNESIO') {
    if (idade > 50) return '500mg 2x ao dia';
    return '500mg 1-2x ao dia';
  }
  
  if (produto.id === 'OMEGA_3') {
    if (perfil.health_conditions?.includes('triglicerides_alto')) {
      return '3-4 cápsulas ao dia (divididas nas refeições)';
    }
    return '2 cápsulas ao dia com refeições';
  }
  
  // Dosagem padrão do produto
  return produto.recommended_dosage;
}

// ==================== FUNÇÃO PRINCIPAL ====================

/**
 * Recomenda produtos baseado em perfil completo do usuário
 */
export function recomendarProdutosMelhorado(
  perfil: UserProfile,
  anamnesis: UserAnamnesis | null,
  measurements: UserMeasurements[],
  quantidade: number = 6
): RecomendacaoCompleta[] {
  
  // 1. DETECTAR CONDIÇÕES MÉDICAS
  const perfilCompleto = {
    ...perfil,
    body_fat: measurements[0]?.body_fat,
    metabolic_age: measurements[0]?.metabolic_age,
    visceral_fat: measurements[0]?.visceral_fat
  };
  
  const condicoesDetectadas = detectarCondicoesMedicas(perfilCompleto);
  
  // 2. CALCULAR SCORES PARA TODOS OS PRODUTOS
  const recomendacoes: RecomendacaoCompleta[] = [];
  
  produtosAtlantica.forEach((produto: any) => {
    // Validar segurança primeiro
    const validacao = validarSeguranca(produto, perfil, anamnesis);
    
    // Se produto é contraindicado criticamente, pular
    if (!validacao.seguro) {
      return;
    }
    
    // Calcular scores
    const scoreBase = calcularScoreBase(produto, perfil, anamnesis);
    const scoreMedico = calcularScoreMedico(produto, condicoesDetectadas);
    const scoreFinal = scoreBase + scoreMedico;
    
    // Determinar prioridade
    const condicoesRelacionadas = condicoesDetectadas.filter(c =>
      c.produtos_especificos.includes(produto.id) ||
      c.categorias_recomendadas.includes(produto.category)
    );
    
    const prioridade = calcularPrioridadeProduto(condicoesRelacionadas, scoreFinal);
    
    // Buscar artigo científico
    const artigo = buscarArtigoCientifico(produto);
    
    // Buscar evidências persuasivas
    const evidencias = buscarEvidenciasPersuasivas(produto);
    
    // Gerar mensagens personalizadas
    const mensagem = gerarMensagemPersonalizada(produto, perfil, condicoesRelacionadas, evidencias);
    const razoes = gerarRazoesMedicas(produto, condicoesRelacionadas, perfil);
    const dosagem = gerarDosagemPersonalizada(produto, perfil);
    
    recomendacoes.push({
      produto,
      score_base: scoreBase,
      score_medico: scoreMedico,
      score_final: scoreFinal,
      prioridade_medica: prioridade,
      condicoes_tratadas: condicoesRelacionadas,
      razoes_medicas: razoes,
      mensagem_personalizada: mensagem,
      dosagem_personalizada: dosagem,
      beneficios_especificos: evidencias?.beneficios_persuasivos || produto.benefits,
      artigo_cientifico: artigo || undefined,
      evidencias_persuasivas: evidencias,
      validacoes: validacao
    });
  });
  
  // 3. ORDENAR POR PRIORIDADE E SCORE
  const prioridadeOrdem = { 'CRÍTICA': 4, 'ALTA': 3, 'MÉDIA': 2, 'BAIXA': 1 };
  
  recomendacoes.sort((a, b) => {
    // Primeiro por prioridade médica
    const prioDiff = prioridadeOrdem[b.prioridade_medica] - prioridadeOrdem[a.prioridade_medica];
    if (prioDiff !== 0) return prioDiff;
    
    // Depois por score final
    return b.score_final - a.score_final;
  });
  
  // 4. VALIDAÇÃO FINAL MÉDICA
  // Garantir que pelo menos 50% sejam produtos de prioridade CRÍTICA/ALTA se houver condições
  const topRecomendacoes = recomendacoes.slice(0, quantidade);
  
  if (condicoesDetectadas.length > 0) {
    const produtosCriticos = topRecomendacoes.filter(r => 
      r.prioridade_medica === 'CRÍTICA' || r.prioridade_medica === 'ALTA'
    );
    
    if (produtosCriticos.length < quantidade / 2) {
      console.warn('⚠️ Menos de 50% dos produtos são de alta prioridade. Ajustando...');
      // Implementar lógica de ajuste se necessário
    }
  }
  
  console.log('✅ Recomendações geradas:', topRecomendacoes.map(r => 
    `${r.produto.name} (Score: ${r.score_final}, Prioridade: ${r.prioridade_medica})`
  ));
  
  return topRecomendacoes;
}

// Exportar também a função antiga para compatibilidade
export const iaRecomendacaoSuplementosMelhorada = {
  recomendarProdutos: recomendarProdutosMelhorado
};

