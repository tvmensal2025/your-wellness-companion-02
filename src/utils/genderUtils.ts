/**
 * Utilitários para termos de gênero
 * Centraliza a lógica de diferenciação de gênero em todo o sistema
 */

// Detecta se o gênero é feminino
export const isFeminineGender = (gender: string | null | undefined): boolean => {
  if (!gender) return false;
  const g = gender.toLowerCase().trim();
  return g === 'feminino' || g === 'female' || g === 'f' || g === 'mulher' || g === 'woman';
};

// Termos genéricos com variação de gênero
export const getGenderedTerm = (
  gender: string | null | undefined,
  masculine: string,
  feminine: string
): string => {
  return isFeminineGender(gender) ? feminine : masculine;
};

// Títulos de nível com gênero
export const LEVEL_TITLES = {
  masculine: [
    'Iniciante', 'Explorador', 'Dedicado', 'Comprometido', 'Focado',
    'Guerreiro', 'Mestre', 'Campeão', 'Lenda', 'Imortal', 'Divino', 'Transcendente'
  ],
  feminine: [
    'Iniciante', 'Exploradora', 'Dedicada', 'Comprometida', 'Focada',
    'Guerreira', 'Mestra', 'Campeã', 'Lenda', 'Imortal', 'Divina', 'Transcendente'
  ]
};

export const getLevelTitle = (level: number, gender: string | null | undefined): string => {
  const titles = isFeminineGender(gender) ? LEVEL_TITLES.feminine : LEVEL_TITLES.masculine;
  return titles[Math.min(level - 1, titles.length - 1)] || titles[0];
};

// Saudações com gênero
export const getGreetingName = (
  userName: string | null | undefined,
  gender: string | null | undefined
): string => {
  if (userName) return userName;
  return isFeminineGender(gender) ? 'Campeã' : 'Campeão';
};

// Termos comuns usados no app
export const GENDERED_TERMS = {
  champion: { masculine: 'Campeão', feminine: 'Campeã' },
  warrior: { masculine: 'Guerreiro', feminine: 'Guerreira' },
  master: { masculine: 'Mestre', feminine: 'Mestra' },
  winner: { masculine: 'Vencedor', feminine: 'Vencedora' },
  leader: { masculine: 'Líder', feminine: 'Líder' },
  veteran: { masculine: 'Veterano', feminine: 'Veterana' },
  active: { masculine: 'Ativo', feminine: 'Ativa' },
  focused: { masculine: 'Focado', feminine: 'Focada' },
  dedicated: { masculine: 'Dedicado', feminine: 'Dedicada' },
  committed: { masculine: 'Comprometido', feminine: 'Comprometida' },
  sleepy: { masculine: 'Dorminhoco', feminine: 'Dorminhoca' },
  burner: { masculine: 'Queimador', feminine: 'Queimadora' },
  consistent: { masculine: 'Consistente', feminine: 'Consistente' },
};

export const getTerm = (
  termKey: keyof typeof GENDERED_TERMS,
  gender: string | null | undefined
): string => {
  const term = GENDERED_TERMS[termKey];
  return isFeminineGender(gender) ? term.feminine : term.masculine;
};

// Mensagens motivacionais com gênero
export const getMotivationalMessages = (gender: string | null | undefined) => {
  const isFem = isFeminineGender(gender);
  return [
    { emoji: "💪", text: "Você está arrasando!" },
    { emoji: "🔥", text: "Cada série conta!" },
    { emoji: "⚡", text: "Força! Próxima série vem aí!" },
    { emoji: "🎯", text: "Foco no objetivo!" },
    { emoji: "💚", text: "Seu corpo agradece!" },
    { emoji: "🏆", text: isFem ? "Campeã em construção!" : "Campeão em construção!" },
    { emoji: "✨", text: "Mais forte a cada dia!" },
    { emoji: "🚀", text: "Não pare agora!" },
    { emoji: "🌟", text: "Você consegue!" },
    { emoji: "💥", text: "Energia total!" },
  ];
};
