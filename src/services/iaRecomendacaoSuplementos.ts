interface Supplement {
  id: string;
  name: string;
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
    // Usar produtos reais do banco de dados
    const suplementosRecomendados: SupplementRecommendation[] = [];
    
    // Lógica básica de recomendação baseada no perfil
    const idade = perfilUsuario.age || 30;
    const genero = perfilUsuario.gender || 'masculino';
    const peso = perfilUsuario.weight || 70;
    const altura = perfilUsuario.height || 170;
    const objetivos = perfilUsuario.goals || [];
    const condicoes = perfilUsuario.health_conditions || [];
    
    // Calcular IMC
    const imc = peso / ((altura / 100) ** 2);
    
    // Determinar categoria de peso
    let categoriaPeso = 'normal';
    if (imc < 18.5) categoriaPeso = 'abaixo';
    else if (imc >= 25) categoriaPeso = 'acima';
    
    // Processar produtos do banco de dados
    const suplementosComScore = suplementosDisponiveis.map(sup => {
      let score = sup.score || 50; // Usar score do banco como base
      
      // Ajustar pontuação baseada no perfil do usuário
      
      // Idade
      if (idade > 50 && sup.category?.toLowerCase().includes('vitamina')) score += 20;
      if (idade > 40 && sup.name?.toLowerCase().includes('colágeno')) score += 15;
      
      // Gênero
      if (genero === 'feminino' && sup.name?.toLowerCase().includes('magnésio')) score += 10;
      if (genero === 'masculino' && sup.name?.toLowerCase().includes('creatina')) score += 15;
      
      // IMC
      if (categoriaPeso === 'abaixo' && sup.name?.toLowerCase().includes('whey')) score += 25;
      if (categoriaPeso === 'acima' && sup.name?.toLowerCase().includes('ômega')) score += 15;
      
      // Objetivos
      if (objetivos.includes('ganhar_massa_muscular') && sup.category?.toLowerCase().includes('proteína')) score += 30;
      if (objetivos.includes('perder_peso') && sup.name?.toLowerCase().includes('ômega')) score += 20;
      if (objetivos.includes('melhorar_sono') && (sup.name?.toLowerCase().includes('melatonina') || sup.name?.toLowerCase().includes('magnésio'))) score += 25;
      
      // Condições de saúde
      if (condicoes.includes('estresse') && sup.name?.toLowerCase().includes('ashwagandha')) score += 30;
      if (condicoes.includes('problemas_digestivos') && sup.name?.toLowerCase().includes('probiótico')) score += 25;
      if (condicoes.includes('dores_articulares') && sup.name?.toLowerCase().includes('colágeno')) score += 20;
      
      return {
        ...sup,
        score: Math.min(score, 100)
      };
    });
    
    // Ordenar por pontuação e pegar os melhores
    const topSuplementos = suplementosComScore
      .sort((a, b) => b.score - a.score)
      .slice(0, quantidade);
    
    // Converter para formato de recomendação
    topSuplementos.forEach((sup, index) => {
      const priority = sup.score >= 80 ? 'high' : sup.score >= 60 ? 'medium' : 'low';
      
      suplementosRecomendados.push({
        supplement: sup,
        score: sup.score,
        personalizedReason: iaRecomendacaoSuplementos.gerarMotivoPersonalizado(sup.name, perfilUsuario, anamnesis, measurements),
        specificBenefits: sup.benefits || ['Benefícios para saúde'],
        dosage: iaRecomendacaoSuplementos.gerarDosagemPersonalizada(sup.name, perfilUsuario),
        priority,
        pubmedLinks: iaRecomendacaoSuplementos.gerarLinksPubMed(sup.name, sup.category),
        originalPrice: iaRecomendacaoSuplementos.gerarPrecoOriginal(sup.name),
        discountPrice: iaRecomendacaoSuplementos.gerarPrecoDesconto(sup.name)
      });
    });
    
    return suplementosRecomendados;
  },

  gerarMotivoPersonalizado: (nomeSuplemento: string, perfil: UserProfile, anamnesis: UserAnamnesis | null, measurements: UserMeasurements[]): string => {
    const idade = perfil.age || 30;
    const genero = perfil.gender || 'masculino';
    const objetivos = perfil.goals || [];
    const condicoes = perfil.health_conditions || [];
    
    const motivos = {
      'Whey Protein 80%': `Recomendado para você com base no seu perfil de ${idade} anos. Ajuda na recuperação muscular e ganho de massa magra.`,
      'Creatina Monohidratada': `Ideal para aumentar sua força e performance. Com ${idade} anos, você pode se beneficiar significativamente deste suplemento.`,
      'Multivitamínico': `Essencial para suprir eventuais deficiências nutricionais e manter sua energia ao longo do dia.`,
      'Ômega 3': `Importante para sua saúde cardiovascular e redução de inflamações. Beneficia especialmente pessoas da sua faixa etária.`,
      'Magnésio': `Ajuda no relaxamento muscular e melhora da qualidade do sono. Especialmente benéfico para seu perfil.`,
      'Vitamina D3': `Fundamental para absorção de cálcio e fortalecimento do sistema imunológico.`,
      'Colágeno': `Importante para manter a saúde articular e da pele, especialmente relevante para sua idade.`,
      'Probióticos': `Melhora a saúde intestinal e fortalece o sistema imunológico.`,
      'Ashwagandha': `Ajuda a reduzir o estresse e melhorar a qualidade do sono.`,
      'Melatonina': `Regula o ciclo do sono e melhora a qualidade do descanso.`
    };
    
    return motivos[nomeSuplemento as keyof typeof motivos] || 'Recomendado baseado no seu perfil de saúde e objetivos.';
  },

  gerarDosagemPersonalizada: (nomeSuplemento: string, perfil: UserProfile): string => {
    const peso = perfil.weight || 70;
    const idade = perfil.age || 30;
    
    const dosagens = {
      'Whey Protein 80%': peso < 60 ? '25g ao dia' : peso < 80 ? '30g ao dia' : '35g ao dia',
      'Creatina Monohidratada': '3g ao dia',
      'Multivitamínico': '1 cápsula ao dia',
      'Ômega 3': '2 cápsulas ao dia',
      'Magnésio': idade > 50 ? '400mg ao dia' : '300mg ao dia',
      'Vitamina D3': '2000 UI ao dia',
      'Colágeno': '10g ao dia',
      'Probióticos': '1 cápsula ao dia',
      'Ashwagandha': '600mg ao dia',
      'Melatonina': '3mg antes de dormir'
    };
    
    return dosagens[nomeSuplemento as keyof typeof dosagens] || 'Conforme orientação médica';
  },

  gerarBeneficiosEspecificos: (nomeSuplemento: string, problemas: string[]): string[] => {
    const beneficios = {
      'Whey Protein 80%': ['Aumento de massa muscular', 'Recuperação pós-treino', 'Saciedade'],
      'Creatina Monohidratada': ['Aumento de força', 'Ganho de massa muscular', 'Melhora do desempenho'],
      'Multivitamínico': ['Suporte nutricional', 'Energia', 'Sistema imunológico'],
      'Ômega 3': ['Saúde cardiovascular', 'Anti-inflamatório', 'Função cerebral'],
      'Magnésio': ['Relaxamento muscular', 'Qualidade do sono', 'Função nervosa'],
      'Vitamina D3': ['Saúde óssea', 'Sistema imunológico', 'Absorção de cálcio'],
      'Colágeno': ['Saúde articular', 'Pele firme', 'Unhas e cabelos'],
      'Probióticos': ['Saúde intestinal', 'Sistema imunológico', 'Digestão'],
      'Ashwagandha': ['Redução do estresse', 'Melhora do sono', 'Função adrenal'],
      'Melatonina': ['Qualidade do sono', 'Ritmo circadiano', 'Relaxamento']
    };
    
    return beneficios[nomeSuplemento as keyof typeof beneficios] || ['Benefícios gerais para saúde'];
  },

  calculateSupplementScore: (supplement: Supplement, userProfile: UserProfile): number => {
    let score = 50; // Base score
    
    // Lógica de pontuação baseada no perfil
    const idade = userProfile.age || 30;
    const genero = userProfile.gender || 'masculino';
    const objetivos = userProfile.goals || [];
    
    // Ajustar pontuação baseada na categoria
    switch (supplement.category) {
      case 'Proteínas':
        if (objetivos.includes('ganhar_massa_muscular')) score += 30;
        if (genero === 'masculino') score += 10;
        break;
      case 'Vitaminas':
        if (idade > 40) score += 20;
        break;
      case 'Minerais':
        if (idade > 50) score += 15;
        break;
      case 'Adaptógenos':
        if (userProfile.health_conditions?.includes('estresse')) score += 25;
        break;
    }
    
    return Math.min(score, 100);
  },

  gerarLinksPubMed: (nomeSuplemento: string, categoria?: string): string[] => {
    const nome = nomeSuplemento.toLowerCase();
    const cat = categoria?.toLowerCase() || '';
    
    // Links PubMed baseados no nome e categoria
    if (nome.includes('whey') || nome.includes('proteína')) {
      return [
        'https://pubmed.ncbi.nlm.nih.gov/?term=whey+protein+muscle+building',
        'https://pubmed.ncbi.nlm.nih.gov/?term=whey+protein+recovery'
      ];
    }
    if (nome.includes('creatina')) {
      return [
        'https://pubmed.ncbi.nlm.nih.gov/?term=creatine+monohydrate+strength',
        'https://pubmed.ncbi.nlm.nih.gov/?term=creatine+muscle+mass'
      ];
    }
    if (nome.includes('vitamina') || cat.includes('vitamina')) {
      return [
        'https://pubmed.ncbi.nlm.nih.gov/?term=vitamin+supplementation+health',
        'https://pubmed.ncbi.nlm.nih.gov/?term=vitamin+deficiency+prevention'
      ];
    }
    if (nome.includes('ômega') || nome.includes('omega')) {
      return [
        'https://pubmed.ncbi.nlm.nih.gov/?term=omega+3+cardiovascular+health',
        'https://pubmed.ncbi.nlm.nih.gov/?term=omega+3+anti+inflammatory'
      ];
    }
    if (nome.includes('magnésio') || nome.includes('magnesio')) {
      return [
        'https://pubmed.ncbi.nlm.nih.gov/?term=magnesium+muscle+relaxation',
        'https://pubmed.ncbi.nlm.nih.gov/?term=magnesium+sleep+quality'
      ];
    }
    if (nome.includes('colágeno') || nome.includes('colageno')) {
      return [
        'https://pubmed.ncbi.nlm.nih.gov/?term=collagen+joint+health',
        'https://pubmed.ncbi.nlm.nih.gov/?term=collagen+skin+health'
      ];
    }
    if (nome.includes('probiótico') || nome.includes('probiotico')) {
      return [
        'https://pubmed.ncbi.nlm.nih.gov/?term=probiotics+gut+health',
        'https://pubmed.ncbi.nlm.nih.gov/?term=probiotics+digestion'
      ];
    }
    if (nome.includes('ashwagandha')) {
      return [
        'https://pubmed.ncbi.nlm.nih.gov/?term=ashwagandha+stress+reduction',
        'https://pubmed.ncbi.nlm.nih.gov/?term=ashwagandha+sleep'
      ];
    }
    if (nome.includes('melatonina')) {
      return [
        'https://pubmed.ncbi.nlm.nih.gov/?term=melatonin+sleep+quality',
        'https://pubmed.ncbi.nlm.nih.gov/?term=melatonin+circadian+rhythm'
      ];
    }
    
    // Links genéricos para outros suplementos
    return [
      'https://pubmed.ncbi.nlm.nih.gov/?term=supplement+health+benefits',
      'https://pubmed.ncbi.nlm.nih.gov/?term=nutritional+supplementation'
    ];
  },

  gerarPrecoOriginal: (nomeSuplemento: string): number => {
    const nome = nomeSuplemento.toLowerCase();
    
    // Preços baseados no tipo de suplemento
    if (nome.includes('whey') || nome.includes('proteína')) return 179.90;
    if (nome.includes('creatina')) return 129.90;
    if (nome.includes('vitamina') || nome.includes('multivitamínico')) return 99.90;
    if (nome.includes('ômega') || nome.includes('omega')) return 149.90;
    if (nome.includes('magnésio') || nome.includes('magnesio')) return 89.90;
    if (nome.includes('colágeno') || nome.includes('colageno')) return 119.90;
    if (nome.includes('probiótico') || nome.includes('probiotico')) return 109.90;
    if (nome.includes('ashwagandha')) return 139.90;
    if (nome.includes('melatonina')) return 69.90;
    
    // Preço padrão para outros suplementos
    return 99.90;
  },

  gerarPrecoDesconto: (nomeSuplemento: string): number => {
    const precoOriginal = iaRecomendacaoSuplementos.gerarPrecoOriginal(nomeSuplemento);
    return Math.round(precoOriginal * 0.5); // 50% de desconto
  }
};