import { SupabaseClient } from '@supabase/supabase-js';

// Interfaces definidos localmente para garantir tipagem sem depender de importações circulares
interface Supplement {
  id: string;
  name: string;
  external_id?: string;
  active_ingredients: string[];
  recommended_dosage: string;
  benefits: string[];
  contraindications: string[];
  category: string;
  brand: string;
  is_approved: boolean;
  image_url?: string;
  original_price?: number;
  discount_price?: number;
  description?: string;
  stock_quantity?: number;
  score?: number;
}

interface UserProfile {
  id: string;
  age?: number;
  gender?: string;
  weight?: number;
  height?: number;
  activity_level?: string;
  goals?: string[];
  health_conditions?: string[];
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
  main_treatment_goals?: string; // Campo específico da anamnese
}

interface UserMeasurements {
  id: string;
  user_id: string;
  body_fat?: number;
  muscle_mass?: number;
  water_percentage?: number;
  metabolic_age?: number;
}

interface SupplementRecommendation {
  supplement: Supplement;
  score: number;
  personalizedReason: string;
  specificBenefits: string[];
  dosage: string;
  priority: 'high' | 'medium' | 'low';
  pubmedLinks: string[];
  originalPrice: number;
  discountPrice: number;
}

export const iaRecomendacaoSuplementos = {
  recomendarProdutos: (perfilUsuario: UserProfile, anamnesis: UserAnamnesis | null, measurements: UserMeasurements[], quantidade: number, suplementosDisponiveis: Supplement[]): SupplementRecommendation[] => {
    const suplementosRecomendados: SupplementRecommendation[] = [];
    
    const idade = perfilUsuario.age || 30;
    const genero = perfilUsuario.gender || 'masculino';
    const peso = perfilUsuario.weight || 70;
    // Normalizar objetivos para array
    const objetivos = perfilUsuario.goals || (anamnesis?.main_treatment_goals ? [anamnesis.main_treatment_goals] : []);
    const condicoes = perfilUsuario.health_conditions || [];
    
    // Calcular IMC se possível
    const altura = perfilUsuario.height || 170;
    const imc = peso / ((altura / 100) ** 2);
    let categoriaPeso = 'normal';
    if (imc < 18.5) categoriaPeso = 'abaixo';
    else if (imc >= 25) categoriaPeso = 'acima';

    // MAPA DE PONTUAÇÃO INTELIGENTE (PRODUTOS NEMA'S WAY)
    const suplementosComScore = suplementosDisponiveis.map(sup => {
      let score = 50; // Score base
      const nome = sup.name.toLowerCase();
      const extId = sup.external_id || ''; // ID legível (ex: SEREMIX, LIPOWAY)

      // 1. Lógica por Objetivo Principal
      if (objetivos.some(g => g.includes('perder_peso') || g.includes('emagrecimento'))) {
        if (['LIPOWAY', 'BVB_SB', 'BVB_MORO', 'GEL_CRIOTERAPICO'].includes(extId)) score += 40;
        if (extId === 'AMARGO') score += 25;
      }

      if (objetivos.some(g => g.includes('ganhar_massa') || g.includes('hipertrofia'))) {
        if (['CREATINA_Q10', 'WHEY', 'BVB_B12'].includes(extId)) score += 40;
      }

      if (objetivos.some(g => g.includes('sono') || g.includes('dormir'))) {
        if (['SEREMIX', 'MELATONINA', 'BVB_D3K2'].includes(extId)) score += 45;
      }

      if (objetivos.some(g => g.includes('estresse') || g.includes('ansiedade'))) {
        if (['SEREMIX', 'FOCUS_TDAH', 'PROPOWAY_VERMELHA'].includes(extId)) score += 40;
      }

      if (objetivos.some(g => g.includes('pele') || g.includes('estetica'))) {
        if (['COLAGENO_ACIDO_HIALURONICO', 'SOS_UNHAS', 'FRESH_GLOW_CREME', 'VITAMIX_SKIN'].includes(extId)) score += 40;
      }

      // 2. Lógica por Condição de Saúde
      if (condicoes.includes('diabetes') || condicoes.includes('resistencia_insulinica')) {
        if (['BVB_INSU', 'OMEGA_3_1400MG'].includes(extId)) score += 50; // Altíssima prioridade
      }

      if (condicoes.includes('fibromialgia') || condicoes.includes('dores_cronicas')) {
        if (['SD_FIBRO3', 'SD_ARTRO', 'OLEO_MASSAGEM_OZONIZADO'].includes(extId)) score += 50;
      }

      if (condicoes.includes('tdah') || condicoes.includes('falta_foco')) {
        if (['FOCUS_TDAH', 'BVB_B12', 'OMEGA_3_1400MG'].includes(extId)) score += 45;
      }

      // 3. Lógica por Perfil Demográfico
      if (genero === 'feminino') {
        if (['PROWOMAN', 'OLEO_PRIMULA', 'SABONETE_INTIMO_SEDUCAO', 'LIBWAY'].includes(extId)) score += 20;
        if (idade > 45 && ['MENOPAUSA', 'PROWOMAN'].includes(extId)) score += 30;
      } else {
        if (['PROMEN', 'CAR_BLACK'].includes(extId)) score += 20;
      }

      if (idade > 50) {
        if (['BVB_Q10', 'BVB_D3K2', 'OMEGA_3_1400MG', 'SD_ARTRO'].includes(extId)) score += 25;
      }

      return { ...sup, score: Math.min(score, 100) };
    });
    
    // Ordenar e pegar os melhores
    const topSuplementos = suplementosComScore
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .slice(0, quantidade);
    
    // Gerar recomendações finais
    topSuplementos.forEach((sup) => {
      const priority = (sup.score || 0) >= 85 ? 'high' : (sup.score || 0) >= 60 ? 'medium' : 'low';
      
      suplementosRecomendados.push({
        supplement: sup,
        score: sup.score || 50,
        personalizedReason: iaRecomendacaoSuplementos.gerarMotivoPersonalizado(sup, perfilUsuario, anamnesis),
        specificBenefits: sup.benefits || ['Benefícios para saúde'],
        dosage: iaRecomendacaoSuplementos.gerarDosagemPersonalizada(sup, perfilUsuario),
        priority,
        pubmedLinks: [], // Simplificado para evitar links quebrados
        originalPrice: sup.original_price || 0,
        discountPrice: sup.discount_price || 0
      });
    });
    
    return suplementosRecomendados;
  },

  gerarMotivoPersonalizado: (sup: Supplement, perfil: UserProfile, anamnesis: UserAnamnesis | null): string => {
    const nome = sup.name;
    const extId = sup.external_id || '';
    const objetivos = perfil.goals || [];
    const condicoes = perfil.health_conditions || [];
    const peso = perfil.weight || 70;

    if (extId === 'LIPOWAY' || extId === 'BVB_SB') {
      if (peso > 90) return `Como seu peso atual é ${peso}kg, este acelerador metabólico é essencial para iniciar a queima de gordura.`;
      return `Selecionado para potencializar seu objetivo de emagrecimento e definição.`;
    }

    if (extId === 'SEREMIX') {
      if (condicoes.includes('estresse')) return `Detectamos nível de estresse elevado na anamnese. O Seremix vai regular seu cortisol.`;
      return `Para melhorar profundamente a qualidade do seu sono e recuperação.`;
    }

    if (extId === 'SD_FIBRO3') {
      return `Fórmula específica para combater dores crônicas e inflamação silenciosa.`;
    }

    if (extId === 'FOCUS_TDAH') {
      return `Para aumentar sua produtividade e concentração no trabalho.`;
    }

    if (extId === 'BVB_INSU') {
      return `Crucial para controle glicêmico e redução da compulsão por doces.`;
    }
    
    if (extId === 'CREATINA_Q10') {
        return `Energia celular para seus treinos e vitalidade para o coração com a Coenzima Q10.`;
    }

    // Fallback genérico inteligente
    return `Selecionado baseada na sua meta de ${objetivos[0]?.replace('_', ' ') || 'saúde'} e perfil metabólico.`;
  },

  gerarDosagemPersonalizada: (sup: Supplement, perfil: UserProfile): string => {
    const peso = perfil.weight || 70;
    const extId = sup.external_id || '';
    
    // Lógica de dosagem baseada em PESO (O Diferencial Nema's Way)
    
    if (['LIPOWAY', 'BVB_SB', 'BVB_MORO'].includes(extId)) {
       if (peso > 95) return '2 cápsulas antes do almoço e 1 antes do jantar';
       return '2 cápsulas 30min antes do almoço';
    }

    if (extId === 'CREATINA_Q10') {
        if (peso > 80) return '2 scoops (6g) pré-treino';
        return '1 scoop (3g) pré-treino';
    }

    if (extId === 'OMEGA_3_1400MG') {
        if (perfil.health_conditions?.includes('colesterol_alto') || peso > 90) {
            return '3 cápsulas ao dia (junto com refeições)';
        }
        return '2 cápsulas ao dia';
    }

    if (['SEREMIX', 'MELATONINA'].includes(extId)) {
        return '2 cápsulas 30min antes de dormir';
    }

    if (extId === 'AMARGO') {
        if (perfil.health_conditions?.includes('digestao_lenta')) return '1 colher de sopa após almoço e jantar';
        return '1 colher de sopa após almoço';
    }

    return sup.recommended_dosage || 'Conforme rótulo';
  },

  // Mantido para compatibilidade, mas usando dados reais agora
  gerarPrecoOriginal: (nome: string) => 0, 
  gerarPrecoDesconto: (nome: string) => 0,
  gerarLinksPubMed: (nome: string) => []
};
