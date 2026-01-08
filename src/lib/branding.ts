// Configurações de branding do MaxNutrition

export const MAXNUTRITION_BRANDING = {
  name: 'MaxNutrition',
  tagline: 'Nutrição Inteligente',
  logo: '/images/maxnutrition-logo.png',
  
  // Cores principais (seguindo o design system)
  colors: {
    primary: 'hsl(var(--primary))',
    secondary: 'hsl(var(--secondary))',
    accent: 'hsl(var(--accent))',
  },
  
  // URLs e contatos
  contact: {
    email: 'contato@oficialmaxnutrition.com.br',
    phone: '(11) 99999-9999',
    whatsapp: '5511999999999',
    address: 'São Paulo, SP - Brasil',
  },
  
  // Redes sociais
  social: {
    instagram: '@maxnutrition',
    facebook: 'MaxNutrition',
    youtube: 'MaxNutrition',
    linkedin: 'MaxNutrition',
  },
  
  // SEO e metadados
  seo: {
    title: 'MaxNutrition - Nutrição Inteligente',
    description: 'Nutrição inteligente e personalizada para transformar sua saúde. Aqui sua transformação se torna realidade.',
    keywords: [
      'nutrição',
      'emagrecimento',
      'transformação',
      'saúde',
      'bem-estar',
      'dieta',
      'fitness',
      'alimentação saudável'
    ],
    ogImage: '/images/maxnutrition-logo.png',
  },
  
  // Locais estratégicos para mostrar a logo
  locations: {
    header: true,
    footer: true,
    auth: true,
    dashboard: true,
    chat: true,
    emails: true,
    loading: true,
    error: true,
  }
};

// Alias para compatibilidade
export const INSTITUTO_BRANDING = MAXNUTRITION_BRANDING;

// Função para obter URL da logo com fallback
export const getMaxNutritionLogo = (fallback = '/favicon.png') => {
  return MAXNUTRITION_BRANDING.logo || fallback;
};

// Alias para compatibilidade
export const getInstitutoLogo = getMaxNutritionLogo;

// Função para obter informações de contato formatadas
export const getContactInfo = () => {
  return {
    emailFormatted: MAXNUTRITION_BRANDING.contact.email,
    phoneFormatted: MAXNUTRITION_BRANDING.contact.phone,
    whatsappUrl: `https://wa.me/${MAXNUTRITION_BRANDING.contact.whatsapp}`,
    addressFormatted: MAXNUTRITION_BRANDING.contact.address,
  };
};

// Função para obter metadados SEO
export const getSEOMetadata = (customTitle?: string, customDescription?: string) => {
  return {
    title: customTitle || MAXNUTRITION_BRANDING.seo.title,
    description: customDescription || MAXNUTRITION_BRANDING.seo.description,
    keywords: MAXNUTRITION_BRANDING.seo.keywords.join(', '),
    ogImage: MAXNUTRITION_BRANDING.seo.ogImage,
    ogTitle: customTitle || MAXNUTRITION_BRANDING.seo.title,
    ogDescription: customDescription || MAXNUTRITION_BRANDING.seo.description,
  };
};
