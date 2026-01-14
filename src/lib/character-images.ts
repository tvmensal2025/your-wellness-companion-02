// Configuração centralizada das imagens dos personagens
// Sistema com múltiplos fallbacks para garantir exibição

// URLs locais dos personagens
const LOCAL_URLS = {
  DR_VITAL: '/images/dr-vital-full.webp',
  SOFIA: '/images/sofia-full.webp',
  ALEX: '/images/alex-full.webp',
  RAFAEL: '/images/rafael-full.webp',
  ALL_CHARACTERS: '/images/4-personagem.webp',
  CHARACTERS_ICON: '/images/personagens-icon.png',
  LOGO: '/images/maxnutrition-logo.png'
};

// Dados base64 inline para fallback garantido (avatar placeholder)
const PLACEHOLDER_AVATAR = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCI+PGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iNTAiIGZpbGw9IiM0Zjk5ZjAiLz48dGV4dCB4PSI1MCIgeT0iNTciIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IndoaXRlIiBmb250LXNpemU9IjM1IiBmb250LWZhbWlseT0iQXJpYWwiPkRWPC90ZXh0Pjwvc3ZnPg==';

export const CHARACTER_IMAGES = {
  DR_VITAL: {
    name: 'Dr. Vital',
    imageUrl: LOCAL_URLS.DR_VITAL,
    fallbackUrls: [PLACEHOLDER_AVATAR],
    fallbackUrl: PLACEHOLDER_AVATAR,
    description: 'Médico especialista em saúde e bem-estar',
    role: 'doctor',
    colors: {
      primary: 'from-blue-500 to-blue-600',
      secondary: 'from-blue-400 to-blue-500'
    }
  },
  SOFIA: {
    name: 'Sofia',
    imageUrl: LOCAL_URLS.SOFIA,
    fallbackUrls: [PLACEHOLDER_AVATAR],
    fallbackUrl: PLACEHOLDER_AVATAR,
    description: 'Nutricionista e coach de saúde',
    role: 'nutritionist',
    colors: {
      primary: 'from-purple-500 to-purple-600',
      secondary: 'from-purple-400 to-purple-500'
    }
  },
  ALEX: {
    name: 'Alex',
    imageUrl: LOCAL_URLS.ALEX,
    fallbackUrls: [PLACEHOLDER_AVATAR],
    fallbackUrl: PLACEHOLDER_AVATAR,
    description: 'Personal trainer e especialista em exercícios',
    role: 'trainer',
    colors: {
      primary: 'from-teal-500 to-teal-600',
      secondary: 'from-teal-400 to-teal-500'
    }
  },
  RAFAEL: {
    name: 'Rafael',
    imageUrl: LOCAL_URLS.RAFAEL,
    fallbackUrls: [PLACEHOLDER_AVATAR],
    fallbackUrl: PLACEHOLDER_AVATAR,
    description: 'Coach de desenvolvimento pessoal',
    role: 'coach',
    colors: {
      primary: 'from-amber-500 to-amber-600',
      secondary: 'from-amber-400 to-amber-500'
    }
  },
  ALL_CHARACTERS: {
    name: 'Experiência Completa',
    imageUrl: LOCAL_URLS.ALL_CHARACTERS,
    fallbackUrls: [LOCAL_URLS.CHARACTERS_ICON, PLACEHOLDER_AVATAR],
    fallbackUrl: LOCAL_URLS.CHARACTERS_ICON,
    description: 'Todas as funcionalidades desbloqueadas',
    role: 'complete'
  },
  LOGO: {
    name: 'MaxNutrition',
    imageUrl: LOCAL_URLS.LOGO,
    fallbackUrls: [PLACEHOLDER_AVATAR],
    fallbackUrl: PLACEHOLDER_AVATAR,
    description: 'Logo MaxNutrition',
    role: 'branding'
  }
};

// Função para obter imagem por tipo de personagem
export const getCharacterImage = (characterType: 'dr-vital' | 'sofia' | 'alex' | 'rafael' | 'complete') => {
  switch (characterType) {
    case 'dr-vital':
      return CHARACTER_IMAGES.DR_VITAL;
    case 'sofia':
      return CHARACTER_IMAGES.SOFIA;
    case 'alex':
      return CHARACTER_IMAGES.ALEX;
    case 'rafael':
      return CHARACTER_IMAGES.RAFAEL;
    case 'complete':
      return CHARACTER_IMAGES.ALL_CHARACTERS;
    default:
      return CHARACTER_IMAGES.SOFIA;
  }
};

// Função para obter URL da imagem (com fallback)
export const getCharacterImageUrl = (characterType: 'dr-vital' | 'sofia' | 'alex' | 'rafael' | 'complete') => {
  const image = getCharacterImage(characterType);
  return image.imageUrl;
};

// Função para obter todas as URLs possíveis para uma imagem
export const getCharacterImageUrls = (characterType: 'dr-vital' | 'sofia' | 'alex' | 'rafael' | 'complete'): string[] => {
  const image = getCharacterImage(characterType);
  return [image.imageUrl, ...image.fallbackUrls];
};

// Função para obter dados completos do personagem
export const getCharacterData = (characterType: 'dr-vital' | 'sofia' | 'alex' | 'rafael' | 'complete') => {
  return getCharacterImage(characterType);
};

// Hook helper para gerenciar fallback de imagens
export const handleImageError = (
  event: React.SyntheticEvent<HTMLImageElement, Event>,
  fallbackUrls: string[],
  currentIndex: number = 0
) => {
  const img = event.currentTarget;
  const nextIndex = currentIndex + 1;
  
  if (nextIndex < fallbackUrls.length) {
    img.src = fallbackUrls[nextIndex];
    img.dataset.fallbackIndex = String(nextIndex);
  }
};
