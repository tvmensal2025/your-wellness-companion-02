# 🏃‍♂️ SISTEMA DE MODALIDADES ESPORTIVAS - PLATAFORMA ÚNICA

## 🌟 VISÃO GERAL - DIFERENCIAIS ÚNICOS

### 💎 O QUE TORNA A PLATAFORMA ÚNICA:

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   🏆 INSTITUTO DOS SONHOS - MODALIDADES ESPORTIVAS             │
│                                                                 │
│   ✅ Não é só academia ou exercícios genéricos                 │
│   ✅ Programas progressivos por modalidade                     │
│   ✅ Integração com wearables (Google Fit, Strava, Garmin)    │
│   ✅ Comunidade por modalidade (corredores, ciclistas, etc)   │
│   ✅ Desafios virtuais (5K, 10K, 100km bike, etc)            │
│   ✅ IA analisa performance e sugere melhorias                 │
│   ✅ Programas famosos adaptados (Couch to 5K, etc)           │
│   ✅ Treinos indoor e outdoor                                  │
│   ✅ Planos de treinamento para competições                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎯 MODALIDADES DISPONÍVEIS

### 1️⃣ 🏃 CORRIDA (Running)

#### Níveis e Programas:

```
📊 INICIANTE: "Do Sofá aos 5K" (Couch to 5K)
├─ Semana 1-4: Caminhada + Corrida alternada
├─ Semana 5-6: Aumentar tempo de corrida
├─ Semana 7-8: Correr 5K contínuos
└─ Integração: Strava, Nike Run Club

📊 INTERMEDIÁRIO: "5K para 10K"
├─ Base aeróbica sólida
├─ Treinos intervalados
├─ Long runs (corridas longas)
└─ Velocidade e resistência

📊 AVANÇADO: "Meia Maratona e Maratona"
├─ Periodização de treino
├─ Treinos específicos (fartlek, tempo run)
├─ Recuperação ativa
└─ Nutrição para provas

📊 ULTRARUNNER: "Trail e Ultra"
├─ Treinos em terrenos variados
├─ Gestão de energia
├─ Equipamentos específicos
└─ Estratégia de prova
```

#### Tipos de Treino:

```javascript
const RUNNING_WORKOUTS = {
  EASY_RUN: {
    name: "Corrida Leve",
    description: "Ritmo confortável, conversando",
    intensity: "60-70% FC máx",
    duration: "30-60min",
    frequency: "3-4x/semana"
  },
  
  INTERVALS: {
    name: "Treino Intervalado (HIIT)",
    description: "Sprints curtos + recuperação",
    example: "8x 400m rápido + 200m lento",
    intensity: "85-95% FC máx",
    benefits: "Melhora velocidade e VO2max"
  },
  
  TEMPO_RUN: {
    name: "Corrida em Ritmo (Tempo)",
    description: "Ritmo de prova, sustentado",
    intensity: "75-85% FC máx",
    duration: "20-40min",
    benefits: "Melhora limiar anaeróbico"
  },
  
  LONG_RUN: {
    name: "Corrida Longa",
    description: "Distância, não velocidade",
    intensity: "65-75% FC máx",
    duration: "90-180min",
    frequency: "1x/semana",
    benefits: "Resistência aeróbica"
  },
  
  FARTLEK: {
    name: "Fartlek (Jogo de Velocidade)",
    description: "Variação espontânea de ritmo",
    example: "2min rápido + 3min lento (repetir)",
    benefits: "Versatilidade e diversão"
  },
  
  HILL_REPEATS: {
    name: "Subidas (Hill Training)",
    description: "Corrida em subida",
    example: "6x subida 60seg + descida lenta",
    benefits: "Força nas pernas e potência"
  }
};
```

#### Integração com Apps:

```typescript
// Importar treinos de apps externos
const RUNNING_INTEGRATIONS = [
  {
    app: "Strava",
    features: [
      "Importar corridas automaticamente",
      "Sincronizar com segmentos",
      "Kudos e comunidade",
      "Análise de ritmo e elevação"
    ]
  },
  {
    app: "Nike Run Club",
    features: [
      "Corridas guiadas por áudio",
      "Desafios mensais",
      "Troféus e conquistas"
    ]
  },
  {
    app: "Garmin Connect",
    features: [
      "Métricas avançadas (cadência, VO2max)",
      "Training Load",
      "Recovery Time"
    ]
  }
];
```

---

### 2️⃣ 🚴 CICLISMO (Cycling)

#### Programas Específicos:

```
📊 INICIANTE: "Primeiros Pedais"
├─ Ajuste correto da bike
├─ Técnica de pedalada
├─ 20-30km em terreno plano
├─ Segurança no trânsito
└─ Duração: 8 semanas

📊 INTERMEDIÁRIO: "50-100km"
├─ Treinos de resistência
├─ Subidas moderadas
├─ Grupos de pedal
├─ Nutrição durante o pedal
└─ Duração: 12 semanas

📊 AVANÇADO: "Century Ride (160km)"
├─ Treinos intervalados (FTP)
├─ Long rides (100km+)
├─ Técnica de descida
├─ Eventos e granfondos
└─ Duração: 16 semanas

📊 PERFORMANCE: "Competição"
├─ Treinos por zonas de potência
├─ Periodização avançada
├─ Testes de FTP mensais
├─ Estratégia de prova
└─ Integração com Zwift/TrainerRoad
```

#### Tipos de Treino:

```javascript
const CYCLING_WORKOUTS = {
  ENDURANCE: {
    name: "Fundo (Endurance)",
    description: "Ritmo constante e longo",
    intensity: "Zone 2 (60-70% FTP)",
    duration: "2-5 horas",
    cadence: "85-95 rpm"
  },
  
  SWEET_SPOT: {
    name: "Sweet Spot",
    description: "Limite entre aeróbico e anaeróbico",
    intensity: "Zone 3-4 (85-95% FTP)",
    example: "3x 20min @ 90% FTP + 5min recovery",
    benefits: "Máximo ganho com menor fadiga"
  },
  
  INTERVALS: {
    name: "Intervalados de Alta Intensidade",
    description: "Potência máxima",
    intensity: "Zone 5-6 (>105% FTP)",
    example: "5x 5min @ 110% FTP + 5min recovery",
    benefits: "Aumenta VO2max e potência"
  },
  
  CLIMBING: {
    name: "Treino de Subida",
    description: "Subidas longas",
    focus: "Cadência baixa (60-70 rpm)",
    benefits: "Força nas pernas"
  },
  
  RECOVERY: {
    name: "Recuperação Ativa",
    description: "Pedal bem leve",
    intensity: "Zone 1 (<55% FTP)",
    duration: "45-90min",
    benefits: "Acelera recuperação"
  }
};
```

#### Integração com Plataformas:

```typescript
const CYCLING_INTEGRATIONS = [
  {
    platform: "Zwift",
    features: [
      "Treinos indoor gamificados",
      "Corridas virtuais",
      "Worlds 3D (Watopia, Londres, etc)",
      "Treinos estruturados (workouts)"
    ]
  },
  {
    platform: "TrainerRoad",
    features: [
      "Planos de treinamento científicos",
      "Adaptive Training (ajuste automático)",
      "Análise de progressão"
    ]
  },
  {
    platform: "Strava",
    features: [
      "Segmentos (KOMs)",
      "Comparação com outros ciclistas",
      "Grupos e clubes"
    ]
  }
];
```

---

### 3️⃣ 🏊 NATAÇÃO (Swimming)

```
📊 INICIANTE: "Aprendendo a Nadar"
├─ Técnica de respiração
├─ Flutuação e propulsão
├─ Crawl básico
├─ 500m contínuos
└─ Duração: 8 semanas

📊 INTERMEDIÁRIO: "1-2km"
├─ Técnica dos 4 natos (crawl, costas, peito, borboleta)
├─ Viradas e saídas
├─ Treinos intervalados
└─ Duração: 12 semanas

📊 AVANÇADO: "Triatlo e Competição"
├─ Natação em águas abertas
├─ Drafting (pegar vácuo)
├─ Treinos de velocidade
└─ Duração: 16 semanas
```

---

### 4️⃣ 🏋️ FUNCIONAL E CROSSFIT

```
📊 INICIANTE: "Base Funcional"
├─ Movimentos básicos (agachamento, flexão)
├─ Mobilidade e flexibilidade
├─ Calistenia
└─ WODs adaptados

📊 INTERMEDIÁRIO: "CrossFit Scaled"
├─ Levantamentos olímpicos (clean, snatch)
├─ Ginástica (pull-ups, handstands)
├─ Metcons (conditioning)
└─ Hero WODs

📊 AVANÇADO: "RX e Competição"
├─ Muscle-ups, rope climbs
├─ WODs complexos
├─ Estratégia de competição
└─ Open, Regionals prep
```

---

### 5️⃣ 🧘 YOGA E MOBILIDADE

```
📊 INICIANTE: "Yoga para Iniciantes"
├─ Posturas básicas (asanas)
├─ Respiração (pranayama)
├─ Flexibilidade básica
└─ 3x/semana, 30min

📊 INTERMEDIÁRIO: "Vinyasa Flow"
├─ Sequências fluidas
├─ Equilíbrio e força
├─ Meditação guiada
└─ 4x/semana, 45min

📊 AVANÇADO: "Ashtanga e Power Yoga"
├─ Posturas avançadas
├─ Inversões
├─ Prática diária
└─ 5x/semana, 60-90min
```

---

### 6️⃣ 🥊 LUTAS E ARTES MARCIAIS

```
📊 BOXE/MUAY THAI
├─ Treino de sombra
├─ Saco pesado
├─ Combinações
└─ Conditioning

📊 JIU-JITSU
├─ Técnicas básicas
├─ Rolls (sparring)
├─ Mobilidade específica
└─ Conditioning para grappling

📊 MMA
├─ Treino híbrido (striking + grappling)
├─ Cardio intenso
├─ Força funcional
└─ Estratégia de luta
```

---

### 7️⃣ ⛰️ TRILHA E MONTANHISMO

```
📊 HIKING: "Trilhas Básicas"
├─ Técnica de caminhada
├─ Equipamentos essenciais
├─ Navegação básica
└─ Trilhas de 5-15km

📊 TREKKING: "Multi-Dias"
├─ Mochila pesada
├─ Acampamento
├─ Trilhas de altitude
└─ Expedições

📊 TRAIL RUNNING: "Corrida em Trilha"
├─ Técnica em terrenos irregulares
├─ Subidas e descidas
├─ Ultras de montanha
└─ Equipamentos específicos
```

---

## 🎯 MODAL DE SELEÇÃO DE MODALIDADE

### Design do Modal:

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│        🏆 Escolha Sua Modalidade Esportiva                   │
│                                                              │
│   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │
│   │     🏃      │  │     🚴      │  │     🏊      │       │
│   │   CORRIDA   │  │  CICLISMO   │  │   NATAÇÃO   │       │
│   │             │  │             │  │             │       │
│   │ • Couch to 5K│  │ • Iniciante │  │ • Técnica   │       │
│   │ • 5K to 10K │  │ • Century   │  │ • Triatlo   │       │
│   │ • Maratona  │  │ • Mountain  │  │ • Open Water│       │
│   └─────────────┘  └─────────────┘  └─────────────┘       │
│                                                              │
│   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │
│   │    🏋️‍♂️     │  │     🧘      │  │     🥊      │       │
│   │  FUNCIONAL  │  │    YOGA     │  │    LUTAS    │       │
│   │             │  │             │  │             │       │
│   │ • CrossFit  │  │ • Hatha     │  │ • Boxe      │       │
│   │ • Calistenia│  │ • Vinyasa   │  │ • Muay Thai │       │
│   │ • Força     │  │ • Ashtanga  │  │ • Jiu-Jitsu │       │
│   └─────────────┘  └─────────────┘  └─────────────┘       │
│                                                              │
│   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │
│   │     ⛰️      │  │     🏐      │  │     🎾      │       │
│   │   TRILHA    │  │   ESPORTES  │  │   RAQUETE   │       │
│   │             │  │   COLETIVOS │  │             │       │
│   │ • Hiking    │  │ • Futebol   │  │ • Tênis     │       │
│   │ • Trekking  │  │ • Vôlei     │  │ • Badminton │       │
│   │ • Trail Run │  │ • Basquete  │  │ • Squash    │       │
│   └─────────────┘  └─────────────┘  └─────────────┘       │
│                                                              │
│   [Múltiplas Modalidades Permitidas]                        │
│                                                              │
│              [Cancelar]  [Continuar →]                       │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 🔥 RECURSOS ÚNICOS DA PLATAFORMA

### 1️⃣ **Programas Progressivos Automáticos**

```javascript
// Exemplo: Couch to 5K Adaptativo
const COUCH_TO_5K = {
  name: "Do Sofá aos 5K",
  duration_weeks: 8,
  weeks: [
    {
      week: 1,
      workouts: [
        {
          day: "Segunda/Quarta/Sexta",
          structure: "5min aquecimento + 8x(60seg corrida + 90seg caminhada) + 5min alongamento",
          total_time: "30min",
          difficulty: 1
        }
      ]
    },
    {
      week: 2,
      workouts: [
        {
          day: "Segunda/Quarta/Sexta",
          structure: "5min aquecimento + 6x(90seg corrida + 120seg caminhada) + 5min alongamento",
          total_time: "32min",
          difficulty: 2
        }
      ]
    },
    // ... até semana 8
    {
      week: 8,
      workouts: [
        {
          day: "Segunda/Quarta/Sexta",
          structure: "5min aquecimento + 30min corrida contínua + 5min alongamento",
          total_time: "40min",
          difficulty: 8,
          achievement: "🏆 Parabéns! Você completou seu primeiro 5K!"
        }
      ]
    }
  ],
  
  // IA monitora progresso e ajusta automaticamente
  adaptive_logic: {
    if_user_completes_easily: "Avançar mais rápido",
    if_user_struggles: "Repetir semana ou desacelerar",
    if_user_misses_workout: "Recalcular cronograma"
  }
};
```

### 2️⃣ **Integração com Wearables e Apps**

```typescript
// Sincronização automática
const WEARABLE_INTEGRATION = {
  sources: [
    "Google Fit",
    "Apple Health",
    "Strava",
    "Garmin Connect",
    "Polar Flow",
    "Suunto App",
    "Zwift",
    "TrainerRoad"
  ],
  
  auto_import: {
    workouts: true,
    heart_rate: true,
    distance: true,
    elevation: true,
    calories: true,
    power_data: true, // Para ciclismo
    pace: true,
    cadence: true
  },
  
  ai_analysis: {
    suggest_recovery: "IA detecta overtraining e sugere descanso",
    adjust_plan: "Ajusta treinos baseado em performance real",
    predict_performance: "Estima tempos de prova baseado em treinos"
  }
};
```

### 3️⃣ **Desafios Virtuais e Gamificação**

```javascript
const VIRTUAL_CHALLENGES = {
  monthly: [
    {
      name: "Desafio 100km - Corrida",
      goal: "Correr 100km no mês",
      reward: "Badge + 500 pontos",
      leaderboard: true
    },
    {
      name: "Desafio 500km - Bike",
      goal: "Pedalar 500km no mês",
      reward: "Badge + 1000 pontos",
      leaderboard: true
    }
  ],
  
  events: [
    {
      name: "Corrida Virtual 5K",
      date: "Último domingo do mês",
      participants: "Todos correm no mesmo dia",
      prizes: "Top 3 ganham prêmios"
    },
    {
      name: "Gran Fondo Virtual",
      distance: "100km de bike",
      time_window: "24 horas para completar",
      certification: "Certificado digital"
    }
  ],
  
  achievements: [
    "🏃 Primeiro 5K",
    "🏃 Primeiro 10K",
    "🏃 Meia Maratona",
    "🏃 Maratona",
    "🚴 Century Ride (160km)",
    "🚴 10.000km na vida",
    "🏊 1km de natação",
    "🏋️ 100 treinos no ano",
    "🔥 Sequência de 30 dias"
  ]
};
```

### 4️⃣ **Comunidade Por Modalidade**

```javascript
const COMMUNITY_FEATURES = {
  groups: [
    {
      name: "Corredores Iniciantes",
      members: 1250,
      features: [
        "Feed de atividades",
        "Dicas e motivação",
        "Eventos presenciais",
        "Grupos de treino por região"
      ]
    },
    {
      name: "Ciclistas 100km+",
      members: 450,
      features: [
        "Rotas compartilhadas",
        "Grupos de pedal",
        "Oficinas mecânicas",
        "Descontos em lojas"
      ]
    }
  ],
  
  features: {
    activity_feed: "Ver treinos dos amigos",
    kudos: "Curtir e comentar",
    challenges: "Desafiar amigos",
    clubs: "Criar e gerenciar grupos",
    events: "Organizar eventos presenciais"
  }
};
```

### 5️⃣ **IA Sofia - Treinadora Virtual**

```javascript
const SOFIA_SPORTS_AI = {
  analysis: {
    performance: "Analisa cada treino e dá feedback personalizado",
    recovery: "Sugere quando descansar baseado em fadiga",
    nutrition: "Ajusta cardápio para o tipo de treino",
    technique: "Dicas de técnica baseado em dados"
  },
  
  examples: [
    {
      scenario: "Usuário corre 5K em 28min",
      sofia_says: "Parabéns! 🎉 Você melhorou 2min desde o mês passado. Com base no seu ritmo, você pode correr um 10K em cerca de 58min. Quer tentar?"
    },
    {
      scenario: "Usuário falta 3 treinos seguidos",
      sofia_says: "Notei que você não treinou nos últimos dias. Tudo bem? Quando voltar, vou ajustar o treino para ser mais leve. 💙"
    },
    {
      scenario: "Usuário pedala 100km",
      sofia_says: "Incrível! 🚴 Sua primeira Century Ride! Baseado na sua potência média, você está pronto para eventos de 120-140km."
    }
  ]
};
```

### 6️⃣ **Planos de Treinamento para Competições**

```javascript
const RACE_PLANS = {
  running: [
    {
      race: "5K",
      goal_time: "Sub 25min",
      duration: "8 semanas",
      workouts_per_week: 4,
      includes: [
        "Treinos intervalados",
        "Long runs",
        "Tempo runs",
        "Recuperação ativa"
      ]
    },
    {
      race: "Maratona",
      goal_time: "Sub 4 horas",
      duration: "16 semanas",
      workouts_per_week: 5,
      peak_mileage: "70km/semana",
      includes: [
        "3-4 long runs 30km+",
        "Treinos de ritmo",
        "Hill training",
        "Taper (redução pré-prova)"
      ]
    }
  ],
  
  cycling: [
    {
      event: "Gran Fondo 150km",
      duration: "12 semanas",
      workouts_per_week: 5,
      includes: [
        "Base endurance",
        "Sweet spot intervals",
        "Long rides progressivos",
        "Climbing repeats"
      ]
    }
  ]
};
```

---

## 📱 MODAL DETALHADO - EXEMPLO CORRIDA

### Fluxo Completo:

```
PASSO 1: Escolher Modalidade
┌─────────────────────────────────┐
│  🏃 VOCÊ ESCOLHEU: CORRIDA      │
├─────────────────────────────────┤
│                                 │
│  Qual seu nível atual?          │
│                                 │
│  ○ Nunca corri                  │
│  ● Corro ocasionalmente         │
│  ○ Corro regularmente (10K+)    │
│  ○ Já corri meia/maratona       │
│                                 │
│         [Próximo →]             │
└─────────────────────────────────┘

PASSO 2: Definir Objetivo
┌─────────────────────────────────┐
│  🎯 Qual seu objetivo?          │
├─────────────────────────────────┤
│                                 │
│  ☑ Correr meu primeiro 5K       │
│  ☐ Correr 10K                   │
│  ☐ Meia Maratona                │
│  ☐ Maratona                     │
│  ☐ Apenas melhorar condição     │
│                                 │
│  Prazo: [8 semanas ▼]          │
│                                 │
│  [← Voltar]  [Próximo →]       │
└─────────────────────────────────┘

PASSO 3: Disponibilidade
┌─────────────────────────────────┐
│  📅 Quando pode treinar?        │
├─────────────────────────────────┤
│                                 │
│  Dias por semana:               │
│  [3] [4] [5] [6] [7]           │
│     Selected: 4                 │
│                                 │
│  Tempo por treino:              │
│  [20min] [30min] [45min] [60min]│
│     Selected: 30min             │
│                                 │
│  Preferência:                   │
│  ○ Manhã  ● Tarde  ○ Noite     │
│                                 │
│  Local:                         │
│  ☑ Rua/Parque                  │
│  ☐ Esteira                     │
│  ☐ Pista de atletismo          │
│                                 │
│  [← Voltar]  [Próximo →]       │
└─────────────────────────────────┘

PASSO 4: Integrações
┌─────────────────────────────────┐
│  📲 Conectar Apps (Opcional)    │
├─────────────────────────────────┤
│                                 │
│  ☑ Google Fit                   │
│  ☑ Strava                       │
│  ☐ Nike Run Club                │
│  ☐ Garmin Connect               │
│                                 │
│  Benefícios:                    │
│  ✅ Sincronização automática    │
│  ✅ Análise de performance      │
│  ✅ Comparação com comunidade   │
│                                 │
│  [← Voltar]  [Gerar Plano 🎯]  │
└─────────────────────────────────┘

PASSO 5: Plano Gerado!
┌─────────────────────────────────┐
│  🎉 Seu Plano Está Pronto!      │
├─────────────────────────────────┤
│                                 │
│  📋 Couch to 5K - 8 Semanas     │
│                                 │
│  Semana 1 (Iniciando):          │
│  ├─ Seg: 30min (corrida/caminhada)│
│  ├─ Qua: 30min (corrida/caminhada)│
│  ├─ Sex: 30min (corrida/caminhada)│
│  └─ Dom: Descanso ou caminhada   │
│                                 │
│  Meta da Semana: 9km total      │
│                                 │
│  [Ver Plano Completo]           │
│  [Começar Agora! 🏃]           │
│                                 │
└─────────────────────────────────┘
```

---

## 💡 RECURSOS EXCLUSIVOS QUE NÃO EXISTEM EM OUTROS APPS

### 1. **IA Multi-Modalidade**
```
Sofia consegue criar programas combinando modalidades:
- 3x Corrida + 2x Bike + 1x Yoga (Triatlo)
- 4x Funcional + 2x Corrida (Condicionamento geral)
- 3x Natação + 2x Força (Nadadores)
```

### 2. **Planos para Eventos Reais**
```
"Tenho uma maratona em 16 semanas"
→ Sofia cria plano específico periodizado
→ Ajusta automaticamente baseado em treinos
→ Lembra de descansar antes da prova
```

### 3. **Análise de Vídeo (Futuro)**
```
Usuário grava vídeo correndo
→ IA analisa técnica de corrida
→ Sugere correções (passada, postura, cadência)
→ Previne lesões
```

### 4. **Grupos de Treino por Região**
```
"Mostrar corredores perto de mim"
→ Encontra grupos de treino local
→ Organiza encontros presenciais
→ Treinos em grupo aumentam adesão
```

### 5. **Marketplace de Equipamentos**
```
Baseado na modalidade, sugere equipamentos:
- Tênis adequados para corrida
- Bike ideal para iniciantes
- Descontos exclusivos da comunidade
```

---

## 📊 ESTRUTURA DO BANCO DE DADOS

```sql
-- Tabela de modalidades do usuário
CREATE TABLE user_sport_modalities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  modality TEXT, -- 'running', 'cycling', 'swimming', etc
  level TEXT, -- 'beginner', 'intermediate', 'advanced'
  goal TEXT,
  start_date DATE,
  target_date DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de programas de treino por modalidade
CREATE TABLE sport_training_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  modality TEXT,
  plan_name TEXT, -- 'Couch to 5K', 'Century Ride', etc
  duration_weeks INTEGER,
  workouts_data JSONB, -- Estrutura dos treinos
  current_week INTEGER DEFAULT 1,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de workouts completados
CREATE TABLE sport_workout_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  modality TEXT,
  workout_type TEXT, -- 'easy_run', 'intervals', 'long_ride', etc
  distance_km DECIMAL,
  duration_minutes INTEGER,
  avg_heart_rate INTEGER,
  avg_pace TEXT, -- '5:30/km'
  avg_power_watts INTEGER, -- Para ciclismo
  elevation_gain_m INTEGER,
  calories_burned INTEGER,
  notes TEXT,
  external_id TEXT, -- ID do Strava/Garmin
  completed_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de desafios
CREATE TABLE sport_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  modality TEXT,
  goal_type TEXT, -- 'distance', 'duration', 'count'
  goal_value DECIMAL,
  start_date DATE,
  end_date DATE,
  participants_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Participação em desafios
CREATE TABLE sport_challenge_participations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID REFERENCES sport_challenges(id),
  user_id UUID REFERENCES auth.users(id),
  current_progress DECIMAL DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  joined_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🚀 RESUMO - POR QUE SERÁ ÚNICA

| Recurso | Outros Apps | Instituto dos Sonhos |
|---------|-------------|---------------------|
| **Modalidades** | 1-2 (específico) | 10+ modalidades integradas |
| **Programas** | Genéricos | Progressivos e adaptativos |
| **IA** | Básica ou inexistente | Sofia analisa e ajusta tudo |
| **Integração** | 1-2 apps | 8+ apps e wearables |
| **Comunidade** | Passiva | Ativa (grupos, eventos, desafios) |
| **Nutrição** | Separado | Integrado com treinos |
| **Análise** | Básica | Avançada (VO2max, FTP, previsões) |
| **Planos de Prova** | Manual | Automático e periodizado |
| **Gamificação** | Simples | Completa (badges, ranking, desafios) |
| **Preço** | $10-20/mês | Incluso na assinatura |

---

## ✅ PRÓXIMOS PASSOS

Quando for implementar:

1. ✅ Criar modal de seleção de modalidade
2. ✅ Implementar Couch to 5K primeiro (mais popular)
3. ✅ Integração com Google Fit/Strava
4. ✅ Sistema de desafios virtuais
5. ✅ Comunidade por modalidade
6. ✅ Expandir para bike, natação, etc

**Quer que eu crie o código completo do modal agora?** 🏃‍♂️🚴‍♂️🏊‍♂️


