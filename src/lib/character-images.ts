// Configuração centralizada das imagens dos personagens
// Sistema com múltiplos fallbacks para garantir exibição

// URLs locais (principal)
const LOCAL_URLS = {
  DR_VITAL: '/images/dr-vital.png',
  SOFIA: '/images/sofia.png',
  LOGO: '/images/maxnutrition-logo.png'
};

// URLs do Supabase (fallback)
const SUPABASE_BASE_URL = 'https://ciszqtlaacrhfwsqnvjr.supabase.co/storage/v1/object/public/course-thumbnails';
const SUPABASE_URLS = {
  DR_VITAL: `${SUPABASE_BASE_URL}/Dr.Vital.png`,
  SOFIA: `${SUPABASE_BASE_URL}/Sofia.png`
};

// Dados base64 inline para fallback garantido (avatar placeholder)
const PLACEHOLDER_AVATAR = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCI+PGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iNTAiIGZpbGw9IiM0Zjk5ZjAiLz48dGV4dCB4PSI1MCIgeT0iNTciIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IndoaXRlIiBmb250LXNpemU9IjM1IiBmb250LWZhbWlseT0iQXJpYWwiPkRWPC90ZXh0Pjwvc3ZnPg==';

export const CHARACTER_IMAGES = {
  DR_VITAL: {
    name: 'Dr. Vital',
    imageUrl: LOCAL_URLS.DR_VITAL,
    fallbackUrls: [SUPABASE_URLS.DR_VITAL, PLACEHOLDER_AVATAR],
    fallbackUrl: SUPABASE_URLS.DR_VITAL,
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
    fallbackUrls: [SUPABASE_URLS.SOFIA, PLACEHOLDER_AVATAR],
    fallbackUrl: SUPABASE_URLS.SOFIA,
    description: 'Assistente virtual e coach de saúde',
    role: 'assistant',
    colors: {
      primary: 'from-purple-500 to-purple-600',
      secondary: 'from-purple-400 to-purple-500'
    }
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
export const getCharacterImage = (characterType: 'dr-vital' | 'sofia') => {
  switch (characterType) {
    case 'dr-vital':
      return CHARACTER_IMAGES.DR_VITAL;
    case 'sofia':
      return CHARACTER_IMAGES.SOFIA;
    default:
      return CHARACTER_IMAGES.SOFIA;
  }
};

// Função para obter URL da imagem (com fallback)
export const getCharacterImageUrl = (characterType: 'dr-vital' | 'sofia') => {
  const image = getCharacterImage(characterType);
  return image.imageUrl;
};

// Função para obter todas as URLs possíveis para uma imagem
export const getCharacterImageUrls = (characterType: 'dr-vital' | 'sofia'): string[] => {
  const image = getCharacterImage(characterType);
  return [image.imageUrl, ...image.fallbackUrls];
};

// Função para obter dados completos do personagem
export const getCharacterData = (characterType: 'dr-vital' | 'sofia') => {
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
