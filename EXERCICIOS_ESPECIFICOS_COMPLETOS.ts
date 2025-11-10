// ============================================
// 🏃‍♂️ EXERCÍCIOS ESPECÍFICOS E DETALHADOS
// ============================================
// Substitui os exercícios genéricos por exercícios específicos e profissionais

export const EXERCICIOS_ESPECIFICOS = {
  // SEMANA 1 - Iniciante
  semana1: {
    caminhada10min: {
      nome: "Caminhada Estruturada 10min",
      descricao: "Caminhada com técnica correta e progressão controlada",
      duracao: "10 minutos",
      instrucoes: [
        "Minuto 1-2: Caminhada leve para aquecimento (velocidade 3-4 km/h)",
        "Minuto 3-7: Caminhada moderada (velocidade 4-5 km/h)",
        "Minuto 8-9: Caminhada mais intensa (velocidade 5-6 km/h)",
        "Minuto 10: Caminhada leve para desaquecimento (velocidade 3-4 km/h)"
      ],
      dicas: [
        "Mantenha postura ereta",
        "Balançar braços naturalmente",
        "Pisar com o calcanhar primeiro",
        "Respirar pelo nariz"
      ],
      intensidade: "60-70% da FCmáx",
      equipamento: "Tênis confortável"
    },
    
    alongamento5min: {
      nome: "Alongamento Dinâmico 5min",
      descricao: "Sequência de alongamentos específicos para iniciantes",
      duracao: "5 minutos",
      exercicios: [
        {
          nome: "Alongamento de Panturrilha",
          tempo: "30 segundos cada perna",
          tecnica: "Apoiar as mãos na parede, uma perna à frente, alongar a panturrilha traseira"
        },
        {
          nome: "Alongamento de Quadríceps",
          tempo: "30 segundos cada perna",
          tecnica: "Em pé, dobrar uma perna para trás, segurar o pé com a mão"
        },
        {
          nome: "Alongamento de Isquiotibiais",
          tempo: "30 segundos cada perna",
          tecnica: "Sentado, esticar uma perna, inclinar o tronco para frente"
        },
        {
          nome: "Rotação de Ombros",
          tempo: "30 segundos",
          tecnica: "Circular os ombros para frente e para trás"
        },
        {
          nome: "Alongamento de Coluna",
          tempo: "30 segundos",
          tecnica: "Em pé, inclinar o tronco para os lados"
        }
      ],
      equipamento: "Tapete ou superfície confortável"
    }
  },

  // SEMANA 2 - Progressão
  semana2: {
    caminhada15min: {
      nome: "Caminhada Progressiva 15min",
      descricao: "Caminhada com intervalos de intensidade moderada",
      duracao: "15 minutos",
      instrucoes: [
        "Minuto 1-3: Aquecimento leve (velocidade 4 km/h)",
        "Minuto 4-7: Caminhada moderada (velocidade 5 km/h)",
        "Minuto 8-11: Caminhada intensa (velocidade 6 km/h)",
        "Minuto 12-14: Caminhada moderada (velocidade 5 km/h)",
        "Minuto 15: Desaquecimento (velocidade 4 km/h)"
      ],
      dicas: [
        "Controle a respiração",
        "Mantenha ritmo constante",
        "Pode adicionar pequenas subidas",
        "Beba água se necessário"
      ],
      intensidade: "65-75% da FCmáx",
      equipamento: "Tênis confortável + garrafa de água"
    },

    exerciciosLeves5min: {
      nome: "Circuito Funcional Leve 5min",
      descricao: "Exercícios funcionais para fortalecimento gradual",
      duracao: "5 minutos",
      exercicios: [
        {
          nome: "Agachamento Livre",
          repeticoes: "10-12 repetições",
          tecnica: "Pés na largura dos ombros, descer como se fosse sentar, manter peso nos calcanhares",
          tempo: "45 segundos"
        },
        {
          nome: "Flexão de Braço na Parede",
          repeticoes: "8-10 repetições",
          tecnica: "Apoiar as mãos na parede, inclinar o corpo, flexionar os braços",
          tempo: "45 segundos"
        },
        {
          nome: "Elevação de Pernas Sentado",
          repeticoes: "10 repetições cada perna",
          tecnica: "Sentado na cadeira, elevar uma perna de cada vez",
          tempo: "45 segundos"
        },
        {
          nome: "Prancha Isométrica",
          repeticoes: "15-20 segundos",
          tecnica: "Apoio nos antebraços e pontas dos pés, manter corpo alinhado",
          tempo: "20 segundos"
        },
        {
          nome: "Caminhada no Lugar",
          repeticoes: "Contínuo",
          tecnica: "Elevar joelhos alternadamente, balançar braços",
          tempo: "1 minuto"
        }
      ],
      equipamento: "Cadeira + espaço livre"
    }
  },

  // SEMANA 3 - Intermediário
  semana3: {
    caminhada20min: {
      nome: "Caminhada com Intervalos 20min",
      descricao: "Caminhada com períodos de maior intensidade",
      duracao: "20 minutos",
      instrucoes: [
        "Minuto 1-3: Aquecimento (velocidade 4 km/h)",
        "Minuto 4-6: Caminhada moderada (velocidade 5 km/h)",
        "Minuto 7-9: Caminhada intensa (velocidade 6-7 km/h)",
        "Minuto 10-12: Caminhada moderada (velocidade 5 km/h)",
        "Minuto 13-15: Caminhada intensa (velocidade 6-7 km/h)",
        "Minuto 16-18: Caminhada moderada (velocidade 5 km/h)",
        "Minuto 19-20: Desaquecimento (velocidade 4 km/h)"
      ],
      dicas: [
        "Respire profundamente",
        "Mantenha postura ereta",
        "Pode adicionar subidas suaves",
        "Monitore sua frequência cardíaca"
      ],
      intensidade: "70-80% da FCmáx",
      equipamento: "Tênis + monitor cardíaco (opcional)"
    },

    exerciciosLeves10min: {
      nome: "Circuito Funcional Intermediário 10min",
      descricao: "Exercícios funcionais com maior complexidade",
      duracao: "10 minutos",
      exercicios: [
        {
          nome: "Agachamento com Elevação de Braços",
          repeticoes: "12-15 repetições",
          tecnica: "Agachamento normal + elevar braços acima da cabeça",
          tempo: "2 minutos"
        },
        {
          nome: "Flexão de Braço Inclinada",
          repeticoes: "10-12 repetições",
          tecnica: "Apoio nas mãos em superfície elevada (cadeira/sofá)",
          tempo: "2 minutos"
        },
        {
          nome: "Ponte Glúteo",
          repeticoes: "15-20 repetições",
          tecnica: "Deitado, elevar quadril, contrair glúteos",
          tempo: "2 minutos"
        },
        {
          nome: "Prancha Lateral",
          repeticoes: "15-20 segundos cada lado",
          tecnica: "Apoio lateral no antebraço, manter corpo alinhado",
          tempo: "2 minutos"
        },
        {
          nome: "Burpee Simplificado",
          repeticoes: "5-8 repetições",
          tecnica: "Agachamento + apoio das mãos no chão + pular",
          tempo: "2 minutos"
        }
      ],
      equipamento: "Tapete + espaço livre + superfície elevada"
    }
  },

  // SEMANA 4 - Avançado
  semana4: {
    caminhada25min: {
      nome: "Caminhada HIIT 25min",
      descricao: "Caminhada com intervalos de alta intensidade",
      duracao: "25 minutos",
      instrucoes: [
        "Minuto 1-3: Aquecimento (velocidade 4-5 km/h)",
        "Minuto 4-6: Caminhada moderada (velocidade 5-6 km/h)",
        "Minuto 7-9: Caminhada intensa (velocidade 7-8 km/h)",
        "Minuto 10-11: Caminhada moderada (velocidade 5-6 km/h)",
        "Minuto 12-14: Caminhada muito intensa (velocidade 8-9 km/h)",
        "Minuto 15-16: Caminhada moderada (velocidade 5-6 km/h)",
        "Minuto 17-19: Caminhada intensa (velocidade 7-8 km/h)",
        "Minuto 20-22: Caminhada moderada (velocidade 5-6 km/h)",
        "Minuto 23-25: Desaquecimento (velocidade 4 km/h)"
      ],
      dicas: [
        "Controle a respiração",
        "Mantenha hidratação",
        "Pode adicionar subidas",
        "Escute seu corpo"
      ],
      intensidade: "75-85% da FCmáx",
      equipamento: "Tênis + monitor cardíaco + garrafa de água"
    },

    exercicios15min: {
      nome: "Circuito Funcional Avançado 15min",
      descricao: "Exercícios funcionais completos para condicionamento",
      duracao: "15 minutos",
      exercicios: [
        {
          nome: "Agachamento com Salto",
          repeticoes: "10-12 repetições",
          tecnica: "Agachamento normal + salto ao subir",
          tempo: "3 minutos"
        },
        {
          nome: "Flexão de Braço Tradicional",
          repeticoes: "8-12 repetições",
          tecnica: "Apoio completo, corpo alinhado, descer até quase tocar o chão",
          tempo: "3 minutos"
        },
        {
          nome: "Ponte Glúteo com Elevação de Perna",
          repeticoes: "10 repetições cada perna",
          tecnica: "Ponte normal + elevar uma perna estendida",
          tempo: "3 minutos"
        },
        {
          nome: "Prancha Completa",
          repeticoes: "30-45 segundos",
          tecnica: "Apoio nas mãos, corpo completamente estendido",
          tempo: "3 minutos"
        },
        {
          nome: "Burpee Completo",
          repeticoes: "5-8 repetições",
          tecnica: "Agachamento + flexão + salto + aplauso acima da cabeça",
          tempo: "3 minutos"
        }
      ],
      equipamento: "Tapete + espaço livre + cronômetro"
    }
  }
};

// ============================================
// 📊 PLANOS DE EXERCÍCIOS DETALHADOS
// ============================================

export const PLANOS_EXERCICIOS_DETALHADOS = {
  iniciante: {
    nome: "Plano Iniciante Completo",
    descricao: "Programa estruturado para quem está começando",
    duracao: "4 semanas",
    frequencia: "3x por semana (Seg, Qua, Sex)",
    
    semanas: [
      {
        semana: 1,
        atividades: [
          {
            nome: "Caminhada Estruturada 10min",
            detalhes: EXERCICIOS_ESPECIFICOS.semana1.caminhada10min,
            dias: "Seg, Qua, Sex"
          },
          {
            nome: "Alongamento Dinâmico 5min",
            detalhes: EXERCICIOS_ESPECIFICOS.semana1.alongamento5min,
            dias: "Seg, Qua, Sex"
          }
        ]
      },
      {
        semana: 2,
        atividades: [
          {
            nome: "Caminhada Progressiva 15min",
            detalhes: EXERCICIOS_ESPECIFICOS.semana2.caminhada15min,
            dias: "Seg, Qua, Sex"
          },
          {
            nome: "Circuito Funcional Leve 5min",
            detalhes: EXERCICIOS_ESPECIFICOS.semana2.exerciciosLeves5min,
            dias: "Seg, Qua, Sex"
          }
        ]
      },
      {
        semana: 3,
        atividades: [
          {
            nome: "Caminhada com Intervalos 20min",
            detalhes: EXERCICIOS_ESPECIFICOS.semana3.caminhada20min,
            dias: "Seg, Qua, Sex, Sáb"
          },
          {
            nome: "Circuito Funcional Intermediário 10min",
            detalhes: EXERCICIOS_ESPECIFICOS.semana3.exerciciosLeves10min,
            dias: "Seg, Qua, Sex, Sáb"
          }
        ]
      },
      {
        semana: 4,
        atividades: [
          {
            nome: "Caminhada HIIT 25min",
            detalhes: EXERCICIOS_ESPECIFICOS.semana4.caminhada25min,
            dias: "Seg, Qua, Sex, Sáb"
          },
          {
            nome: "Circuito Funcional Avançado 15min",
            detalhes: EXERCICIOS_ESPECIFICOS.semana4.exercicios15min,
            dias: "Seg, Qua, Sex, Sáb"
          }
        ]
      }
    ]
  }
};

// ============================================
// 🎯 EXERCÍCIOS POR CATEGORIA
// ============================================

export const EXERCICIOS_POR_CATEGORIA = {
  cardio: {
    caminhada: {
      niveis: ["leve", "moderada", "intensa", "muito intensa"],
      velocidades: {
        leve: "3-4 km/h",
        moderada: "5-6 km/h", 
        intensa: "7-8 km/h",
        muito_intensa: "8-9 km/h"
      }
    }
  },
  
  forca: {
    agachamento: {
      variacoes: ["livre", "com salto", "com elevação de braços", "sumô"],
      progressao: ["parede", "cadeira", "livre", "com peso"]
    },
    
    flexao: {
      variacoes: ["parede", "inclinada", "tradicional", "declinada"],
      progressao: ["3x5", "3x8", "3x10", "3x12"]
    }
  },
  
  alongamento: {
    tipos: ["dinâmico", "estático", "PNF", "balístico"],
    grupos_musculares: ["panturrilha", "quadríceps", "isquiotibiais", "ombros", "coluna"]
  }
};

export default EXERCICIOS_ESPECIFICOS;

