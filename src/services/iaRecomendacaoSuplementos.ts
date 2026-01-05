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

    // MAPA DE PONTUAÇÃO INTELIGENTE (PRODUTOS MAXNUTRITION)
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

  // Função auxiliar para gerar hash simples baseado no nome do produto
  gerarHash: (str: string): number => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  },

  gerarMotivoPersonalizado: (sup: Supplement, perfil: UserProfile, anamnesis: UserAnamnesis | null): string => {
    const nome = sup.name;
    const extId = sup.external_id || '';
    const categoria = (sup.category || '').toLowerCase();
    const objetivos = perfil.goals || [];
    const condicoes = perfil.health_conditions || [];
    const peso = perfil.weight || 70;
    const genero = perfil.gender || 'masculino';
    const idade = perfil.age || 30;
    const altura = perfil.height || 170;
    const atividade = perfil.activity_level || 'moderado';
    
    // Validar se é um produto de saúde/suplemento válido
    const categoriasInvalidas = ['perfumaria', 'perfume', 'fragrancia', 'cosmetico', 'cosmético'];
    const produtosInvalidos = ['CAR_BLACK', 'GOLD_MONEY', 'MADAME_X'];
    
    if (categoriasInvalidas.some(inv => categoria.includes(inv) || nome.toLowerCase().includes(inv)) ||
        produtosInvalidos.includes(extId)) {
      // Não deveria chegar aqui se o filtro estiver funcionando, mas por segurança:
      return `Este produto não é adequado para recomendação de suplementação.`;
    }
    
    // Gerar índice aleatório baseado no hash do produto (sempre o mesmo para o mesmo produto)
    const hashProduto = iaRecomendacaoSuplementos.gerarHash(nome + extId);
    const hashPerfil = iaRecomendacaoSuplementos.gerarHash(`${peso}-${idade}-${genero}`);
    const indiceVariacao = (hashProduto + hashPerfil) % 100;

    // Função para escolher variação baseada no índice
    const escolherVariacao = (variacoes: string[]): string => {
      return variacoes[indiceVariacao % variacoes.length];
    };

    // Motivos específicos por produto com múltiplas variações
    if (extId === 'LIPOWAY' || extId === 'BVB_SB') {
      const variacoes = [
        `Com ${peso}kg, o ${nome} acelera seu metabolismo basal em até 15%, essencial para iniciar a queima de gordura de forma eficiente.`,
        `Selecionado para você porque seu perfil metabólico de ${peso}kg se beneficia especialmente de aceleradores naturais como o ${nome}.`,
        `O ${nome} foi escolhido após análise do seu peso atual (${peso}kg) e taxa metabólica, sendo ideal para potencializar a perda de gordura.`,
        `Baseado na sua composição corporal, o ${nome} vai otimizar seu metabolismo e aumentar sua capacidade de queima de gordura.`,
        `Para seu peso de ${peso}kg, o ${nome} é fundamental para acelerar o metabolismo e iniciar o processo de emagrecimento saudável.`
      ];
      return escolherVariacao(variacoes);
    }

    if (extId === 'SEREMIX') {
      if (condicoes.includes('estresse')) {
        const variacoes = [
          `Detectamos estresse elevado na sua anamnese. O ${nome} regula seu cortisol e melhora sua resposta ao estresse diário.`,
          `Seu nível de estresse identificado na avaliação indica que o ${nome} é essencial para equilibrar seus hormônios do estresse.`,
          `O ${nome} foi selecionado especificamente para regular seu cortisol, que está elevado devido ao estresse identificado.`,
          `Para combater o estresse detectado, o ${nome} vai normalizar seus níveis de cortisol e promover relaxamento natural.`,
          `Seu perfil de estresse elevado faz do ${nome} uma escolha estratégica para restaurar seu equilíbrio hormonal.`
        ];
        return escolherVariacao(variacoes);
      }
      const variacoes = [
        `O ${nome} melhora profundamente a qualidade do seu sono REM, essencial para recuperação física e mental completa.`,
        `Selecionado para otimizar seus ciclos de sono e acelerar sua recuperação após atividades físicas.`,
        `O ${nome} foi escolhido para melhorar sua qualidade de sono e aumentar sua capacidade de recuperação.`,
        `Para sua rotina de ${atividade}, o ${nome} é fundamental para garantir sono reparador e recuperação adequada.`,
        `O ${nome} vai regular seus ciclos circadianos e melhorar significativamente sua recuperação noturna.`
      ];
      return escolherVariacao(variacoes);
    }

    if (extId === 'SD_FIBRO3') {
      const variacoes = [
        `O ${nome} combate dores crônicas e inflamação silenciosa, especialmente eficaz para quem sofre com fibromialgia.`,
        `Selecionado para reduzir processos inflamatórios crônicos e aliviar dores persistentes no seu corpo.`,
        `O ${nome} foi escolhido para modular sua resposta inflamatória e reduzir dores crônicas identificadas.`,
        `Para combater inflamação silenciosa, o ${nome} é essencial para restaurar seu equilíbrio anti-inflamatório.`,
        `O ${nome} vai reduzir marcadores inflamatórios e aliviar dores crônicas através de ação direta no sistema nervoso.`
      ];
      return escolherVariacao(variacoes);
    }

    if (extId === 'FOCUS_TDAH') {
      const variacoes = [
        `O ${nome} aumenta sua produtividade e concentração, melhorando a função cognitiva e o foco mental no trabalho.`,
        `Selecionado para otimizar sua capacidade de concentração e melhorar seu desempenho cognitivo diário.`,
        `O ${nome} foi escolhido para aumentar sua atenção sustentada e melhorar sua função executiva cerebral.`,
        `Para sua rotina profissional, o ${nome} é essencial para manter foco e aumentar produtividade mental.`,
        `O ${nome} vai melhorar sua neurotransmissão dopaminérgica, essencial para atenção e concentração.`
      ];
      return escolherVariacao(variacoes);
    }

    if (extId === 'BVB_INSU') {
      const variacoes = [
        `O ${nome} é crucial para controle glicêmico e redução da compulsão por doces, estabilizando seus níveis de açúcar.`,
        `Selecionado para melhorar sua sensibilidade à insulina e reduzir picos glicêmicos após refeições.`,
        `O ${nome} foi escolhido para otimizar seu metabolismo de glicose e reduzir desejos por açúcar.`,
        `Para estabilizar seus níveis de glicose, o ${nome} é fundamental para controle metabólico adequado.`,
        `O ${nome} vai melhorar sua resposta insulínica e reduzir oscilações de açúcar no sangue.`
      ];
      return escolherVariacao(variacoes);
    }
    
    if (extId === 'CREATINA_Q10') {
      const variacoes = [
        `O ${nome} fornece energia celular essencial para seus treinos e vitalidade cardiovascular com Coenzima Q10.`,
        `Selecionado para aumentar sua capacidade de produção de energia celular durante exercícios físicos.`,
        `O ${nome} foi escolhido para otimizar sua performance física e saúde cardiovascular simultaneamente.`,
        `Para sua atividade ${atividade}, o ${nome} é essencial para energia muscular e proteção cardíaca.`,
        `O ${nome} vai melhorar sua produção de ATP celular e proteger seu sistema cardiovascular durante treinos.`
      ];
      return escolherVariacao(variacoes);
    }

    // Produtos específicos para mulheres
    if (nome.toLowerCase().includes('pró-mulher') || nome.toLowerCase().includes('pro-mulher')) {
      if (genero === 'feminino' && idade > 40) {
        const variacoes = [
          `O ${nome} oferece suporte hormonal natural durante a menopausa, aliviando ondas de calor e protegendo saúde óssea.`,
          `Para mulheres na sua faixa etária (${idade} anos), o ${nome} é essencial para equilíbrio hormonal e saúde óssea.`,
          `Selecionado especificamente para você: o ${nome} modula hormônios femininos e previne perda óssea pós-menopausa.`,
          `O ${nome} foi escolhido para sua fase hormonal, oferecendo isoflavonas que aliviam sintomas da menopausa.`,
          `Para sua idade (${idade} anos), o ${nome} é fundamental para manter densidade óssea e equilíbrio hormonal.`
        ];
        return escolherVariacao(variacoes);
      }
      const variacoes = [
        `O ${nome} é ideal para equilíbrio hormonal feminino, saúde óssea e proteção cardiovascular durante mudanças hormonais.`,
        `Selecionado para mulheres que buscam suporte hormonal natural e proteção da saúde reprodutiva.`,
        `O ${nome} foi escolhido para otimizar seu perfil hormonal e fortalecer sua saúde óssea e cardiovascular.`,
        `Para seu perfil feminino, o ${nome} oferece nutrientes essenciais para equilíbrio hormonal e bem-estar.`,
        `O ${nome} vai modular seus hormônios femininos e proteger sua saúde óssea e cardiovascular.`
      ];
      return escolherVariacao(variacoes);
    }

    // Produtos para saúde intestinal
    if (nome.toLowerCase().includes('probiótico') || nome.toLowerCase().includes('prebiótico')) {
      if (condicoes.includes('digestao_lenta') || condicoes.includes('intestino_preguicoso')) {
        const variacoes = [
          `O ${nome} foi escolhido para melhorar sua digestão lenta, restaurando flora bacteriana e aliviando desconfortos.`,
          `Para sua condição digestiva, o ${nome} é essencial para repovoar bactérias benéficas e melhorar trânsito intestinal.`,
          `Selecionado para restaurar seu microbioma intestinal e acelerar seu processo digestivo identificado como lento.`,
          `O ${nome} vai reequilibrar sua flora intestinal e melhorar significativamente sua digestão e absorção.`,
          `Para combater intestino preguiçoso, o ${nome} é fundamental para restaurar motilidade e saúde digestiva.`
        ];
        return escolherVariacao(variacoes);
      }
      const variacoes = [
        `O ${nome} mantém intestino saudável, melhorando absorção de nutrientes e fortalecendo sistema imunológico.`,
        `Selecionado para preservar sua saúde intestinal e otimizar absorção de vitaminas e minerais essenciais.`,
        `O ${nome} foi escolhido para manter equilíbrio do seu microbioma e fortalecer sua barreira intestinal.`,
        `Para sua saúde digestiva, o ${nome} é essencial para manter diversidade bacteriana e função imunológica.`,
        `O ${nome} vai fortalecer sua imunidade através da manutenção de uma flora intestinal equilibrada e saudável.`
      ];
      return escolherVariacao(variacoes);
    }

    // Produtos para imunidade
    if (nome.toLowerCase().includes('vitamina c') || nome.toLowerCase().includes('vitamina d')) {
      const variacoes = [
        `O ${nome} fortalece seu sistema imunológico e melhora resistência a infecções, essencial para manter saúde.`,
        `Selecionado para otimizar sua resposta imune e reduzir risco de infecções respiratórias e virais.`,
        `O ${nome} foi escolhido para fortalecer suas defesas naturais e melhorar capacidade de combate a patógenos.`,
        `Para sua imunidade, o ${nome} é fundamental para ativar células de defesa e produção de anticorpos.`,
        `O ${nome} vai modular sua resposta imune e aumentar produção de células de defesa do organismo.`
      ];
      return escolherVariacao(variacoes);
    }

    // Produtos para energia
    if (nome.toLowerCase().includes('energia') || nome.toLowerCase().includes('energetico')) {
      const variacoes = [
        `O ${nome} aumenta seus níveis de energia e combate fadiga, melhorando desempenho diário e disposição.`,
        `Selecionado para otimizar sua produção de energia celular e reduzir sensação de cansaço constante.`,
        `O ${nome} foi escolhido para melhorar sua vitalidade e aumentar sua capacidade de realizar atividades diárias.`,
        `Para sua rotina ${atividade}, o ${nome} é essencial para manter energia sustentada ao longo do dia.`,
        `O ${nome} vai melhorar sua produção de ATP e reduzir fadiga através de otimização metabólica celular.`
      ];
      return escolherVariacao(variacoes);
    }

    // Produtos íntimos/higiene
    if (nome.toLowerCase().includes('sabonete') || nome.toLowerCase().includes('intimo') || nome.toLowerCase().includes('íntimo')) {
      const variacoes = [
        `O ${nome} foi selecionado para manter pH vaginal equilibrado e prevenir infecções, essencial para sua saúde íntima.`,
        `Para sua higiene íntima, o ${nome} preserva flora bacteriana natural e protege contra desequilíbrios.`,
        `Selecionado para sua rotina de cuidados íntimos, o ${nome} mantém equilíbrio do seu microbioma vaginal.`,
        `O ${nome} foi escolhido para proteger sua saúde íntima através de pH balanceado e ingredientes naturais.`,
        `Para sua saúde íntima, o ${nome} é fundamental para prevenir irritações e manter equilíbrio natural.`
      ];
      return escolherVariacao(variacoes);
    }

    // Produtos com óleo (óleo de prímula, etc)
    if (nome.toLowerCase().includes('óleo') || nome.toLowerCase().includes('oleo')) {
      const variacoes = [
        `O ${nome} foi selecionado para sua meta de ${objetivos[0]?.replace('_', ' ') || 'bem-estar'}, oferecendo ácidos graxos essenciais para seu metabolismo.`,
        `Selecionado baseado no seu perfil de ${idade} anos e atividade ${atividade}, o ${nome} otimiza funções metabólicas essenciais.`,
        `O ${nome} foi escolhido para sua condição de ${condicoes[0]?.replace('_', ' ') || 'saúde geral'}, fornecendo nutrientes específicos para suas necessidades.`,
        `Para seu IMC de ${(peso / ((altura/100) ** 2)).toFixed(1)}, o ${nome} oferece suporte nutricional direcionado ao seu perfil metabólico.`,
        `O ${nome} foi selecionado considerando seu peso de ${peso}kg e objetivo de ${objetivos[0]?.replace('_', ' ') || 'saúde'}, alinhado com suas necessidades individuais.`
      ];
      return escolherVariacao(variacoes);
    }

    // Fallback inteligente com múltiplas variações baseadas em diferentes aspectos
    const objetivoTexto = objetivos[0]?.replace('_', ' ') || 'bem-estar';
    const condicaoTexto = condicoes.length > 0 ? condicoes[0]?.replace('_', ' ') : 'saúde geral';
    const imc = (peso / ((altura/100) ** 2)).toFixed(1);
    
    const variacoesFallback = [
      `O ${nome} foi selecionado especificamente para sua meta de ${objetivoTexto}, considerando seu perfil de ${idade} anos e atividade ${atividade}.`,
      `Baseado na sua condição de ${condicaoTexto} e objetivo de ${objetivoTexto}, o ${nome} é ideal para seu perfil metabólico.`,
      `O ${nome} foi escolhido para seu IMC de ${imc} e meta de ${objetivoTexto}, oferecendo nutrientes direcionados às suas necessidades.`,
      `Selecionado considerando seu peso de ${peso}kg, idade de ${idade} anos e objetivo de ${objetivoTexto}, o ${nome} otimiza seu metabolismo.`,
      `O ${nome} foi selecionado para sua condição de ${condicaoTexto} e perfil de ${genero} de ${idade} anos, alinhado com suas necessidades nutricionais.`,
      `Baseado na sua atividade ${atividade} e meta de ${objetivoTexto}, o ${nome} oferece suporte específico para seu perfil individual.`,
      `O ${nome} foi escolhido considerando seu IMC de ${imc}, condição de ${condicaoTexto} e objetivo de ${objetivoTexto}.`,
      `Para seu perfil de ${peso}kg e ${idade} anos, o ${nome} é essencial para alcançar sua meta de ${objetivoTexto} de forma saudável.`
    ];
    
    return escolherVariacao(variacoesFallback);
  },

  gerarDosagemPersonalizada: (sup: Supplement, perfil: UserProfile): string => {
    const peso = perfil.weight || 70;
    const extId = sup.external_id || '';
    
    // Lógica de dosagem baseada em PESO (O Diferencial MaxNutrition)
    
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
