/**
 * Session payload builder for different template types
 * Extracted from SessionTemplates.tsx as part of refactoring
 * **Validates: Requirements 1.4**
 */

export const buildSessionPayload = (templateId: string) => {
  const emojiOptions = [
    { value: 1, emoji: '😟', label: 'Muito baixa' },
    { value: 2, emoji: '😕', label: 'Baixa' },
    { value: 3, emoji: '😐', label: 'Média' },
    { value: 4, emoji: '🙂', label: 'Boa' },
    { value: 5, emoji: '😄', label: 'Excelente' }
  ];

  switch (templateId) {
        case '12-areas': {
          const areas = [
            { id: 'saude', name: 'Saúde', icon: '🏥', color: '#0ea5e9' },
            { id: 'familia', name: 'Família', icon: '👨‍👩‍👧‍👦', color: '#22c55e' },
            { id: 'carreira', name: 'Carreira', icon: '💼', color: '#6366f1' },
            { id: 'financas', name: 'Finanças', icon: '💰', color: '#f59e0b' },
            { id: 'relacionamentos', name: 'Relacionamentos', icon: '🤝', color: '#ec4899' },
            { id: 'diversao', name: 'Diversão', icon: '🎉', color: '#a78bfa' },
            { id: 'crescimento', name: 'Crescimento', icon: '📈', color: '#10b981' },
            { id: 'espiritual', name: 'Espiritual', icon: '🧘‍♀️', color: '#14b8a6' },
            { id: 'ambiente', name: 'Ambiente', icon: '🏡', color: '#84cc16' },
            { id: 'proposito', name: 'Propósito', icon: '🎯', color: '#ef4444' },
            { id: 'contribuicao', name: 'Contribuição', icon: '🙌', color: '#06b6d4' },
            { id: 'autoconhecimento', name: 'Autoconhecimento', icon: '🧠', color: '#8b5cf6' }
          ].map(area => ({
            ...area,
            question: { id: `${area.id}_q1`, text: `Como você avalia sua área de ${area.name} hoje?`, type: 'emoji_scale' },
            emoji_options: emojiOptions
          }));
          return {
            title: 'Avaliação das 12 Áreas da Vida',
            description: 'Avaliação do equilíbrio nas 12 áreas fundamentais com perguntas e visual final em roda.',
            type: 'life_wheel_assessment',
            content: { areas },
            target_saboteurs: [],
            difficulty: 'beginner',
            estimated_time: 15
          };
        }
        case '147-perguntas':
          return {
            title: 'Mapeamento de Sintomas (147 Perguntas)',
            description: 'Questionário completo de sintomas com frequência e intensidade em 12 sistemas corporais.',
            type: 'symptoms_assessment',
            content: {
              systems: [
                { 
                  system: 'Sistema Digestivo', 
                  icon: '🍽️', 
                  color: '#f59e0b', 
                  questions: [
                    'Você sente azia ou queimação no estômago?',
                    'Tem sensação de inchaço abdominal após as refeições?',
                    'Sofre com refluxo gastroesofágico?',
                    'Sente náuseas com frequência?',
                    'Tem dificuldade para engolir alimentos?',
                    'Apresenta gases intestinais em excesso?',
                    'Sofre com constipação (intestino preso)?',
                    'Tem episódios de diarreia frequentes?',
                    'Sente dor ou desconforto abdominal?',
                    'Percebe alterações no apetite?',
                    'Tem má digestão ou sensação de estômago pesado?',
                    'Apresenta arrotos frequentes?'
                  ] 
                },
                { 
                  system: 'Sistema Respiratório', 
                  icon: '🫁', 
                  color: '#60a5fa', 
                  questions: [
                    'Sente falta de ar durante atividades leves?',
                    'Tem tosse frequente ou persistente?',
                    'Apresenta chiado no peito ao respirar?',
                    'Sofre com congestão nasal crônica?',
                    'Tem crises de espirros frequentes?',
                    'Sente dificuldade para respirar fundo?',
                    'Apresenta secreção nasal excessiva?',
                    'Tem dor no peito ao respirar?',
                    'Acorda com sensação de sufocamento?',
                    'Sente o nariz frequentemente entupido?',
                    'Tem ronco durante o sono?',
                    'Apresenta apneia do sono (paradas respiratórias)?'
                  ] 
                },
                { 
                  system: 'Sistema Cardiovascular', 
                  icon: '❤️', 
                  color: '#ef4444', 
                  questions: [
                    'Sente palpitações ou coração acelerado?',
                    'Tem pressão arterial alta diagnosticada?',
                    'Sente cansaço fácil ao fazer esforço físico?',
                    'Tem inchaço nas pernas ou tornozelos?',
                    'Sente dor ou aperto no peito?',
                    'Apresenta extremidades frias (mãos/pés)?',
                    'Tem varizes visíveis nas pernas?',
                    'Sente tontura ao levantar rapidamente?',
                    'Percebe batimentos cardíacos irregulares?',
                    'Tem histórico familiar de doenças cardíacas?',
                    'Sente falta de ar quando deitado?',
                    'Apresenta cansaço excessivo sem motivo aparente?'
                  ] 
                },
                { 
                  system: 'Sistema Neurológico', 
                  icon: '🧠', 
                  color: '#a78bfa', 
                  questions: [
                    'Sofre com dores de cabeça frequentes?',
                    'Tem episódios de tontura ou vertigem?',
                    'Apresenta dificuldade para dormir (insônia)?',
                    'Sente formigamento nas mãos ou pés?',
                    'Tem dificuldade de concentração?',
                    'Apresenta lapsos de memória frequentes?',
                    'Sofre com enxaquecas recorrentes?',
                    'Sente tremores nas mãos?',
                    'Tem sensibilidade excessiva à luz?',
                    'Apresenta zumbido nos ouvidos?',
                    'Sente fraqueza em algum membro do corpo?',
                    'Tem dificuldade para manter o equilíbrio?',
                    'Apresenta alterações na visão (pontos, flashes)?'
                  ] 
                },
                { 
                  system: 'Sistema Musculoesquelético', 
                  icon: '💪', 
                  color: '#22c55e', 
                  questions: [
                    'Sente dores musculares frequentes?',
                    'Tem rigidez nas articulações pela manhã?',
                    'Sofre com cãibras musculares?',
                    'Apresenta dor na coluna cervical (pescoço)?',
                    'Tem dor na região lombar (parte baixa das costas)?',
                    'Sente dor nos joelhos ao caminhar?',
                    'Apresenta dor nos ombros ou braços?',
                    'Tem fraqueza muscular generalizada?',
                    'Sofre com dores articulares que mudam de lugar?',
                    'Sente estalos frequentes nas articulações?',
                    'Tem dificuldade para realizar movimentos rotineiros?',
                    'Apresenta inchaço nas articulações?'
                  ] 
                },
                { 
                  system: 'Sistema Imunológico', 
                  icon: '🛡️', 
                  color: '#10b981', 
                  questions: [
                    'Tem infecções respiratórias recorrentes (gripes/resfriados)?',
                    'Apresenta alergias conhecidas (alimentares, ambientais)?',
                    'Sente cansaço prolongado sem causa aparente?',
                    'Tem feridas que demoram a cicatrizar?',
                    'Apresenta infecções de pele frequentes?',
                    'Sofre com herpes recorrente?',
                    'Tem aftas ou feridas na boca frequentes?',
                    'Apresenta gânglios (ínguas) frequentemente inchados?',
                    'Sente febre baixa sem motivo aparente?',
                    'Tem histórico de doenças autoimunes na família?',
                    'Apresenta reações alérgicas a medicamentos?',
                    'Sofre com infecções urinárias recorrentes?'
                  ] 
                },
                { 
                  system: 'Sistema Endócrino', 
                  icon: '⚡', 
                  color: '#fbbf24', 
                  questions: [
                    'Sente cansaço excessivo mesmo dormindo bem?',
                    'Tem dificuldade para perder ou ganhar peso?',
                    'Apresenta alterações de humor frequentes?',
                    'Sente frio ou calor excessivo sem motivo?',
                    'Tem queda de cabelo acentuada?',
                    'Apresenta pele muito seca ou oleosa?',
                    'Sente sede excessiva frequentemente?',
                    'Tem necessidade de urinar muitas vezes ao dia?',
                    'Apresenta sudorese excessiva?',
                    'Tem ciclo menstrual irregular (mulheres)?',
                    'Sente diminuição da libido?',
                    'Apresenta ondas de calor (fogachos)?'
                  ] 
                },
                { 
                  system: 'Sistema Dermatológico', 
                  icon: '🧴', 
                  color: '#ec4899', 
                  questions: [
                    'Tem pele muito seca ou descamando?',
                    'Apresenta acne ou espinhas frequentes?',
                    'Sofre com coceira na pele sem causa aparente?',
                    'Tem manchas na pele que aparecem ou mudam?',
                    'Apresenta vermelhidão facial frequente?',
                    'Sente sensibilidade excessiva ao sol?',
                    'Tem eczema ou dermatite diagnosticada?',
                    'Apresenta urticária (placas vermelhas com coceira)?',
                    'Sofre com psoríase?',
                    'Tem unhas fracas ou quebradiças?',
                    'Apresenta excesso de oleosidade na pele?',
                    'Sente a pele repuxando ou desconfortável?'
                  ] 
                },
                { 
                  system: 'Sistema Urinário', 
                  icon: '💧', 
                  color: '#06b6d4', 
                  questions: [
                    'Sente dor ou ardência ao urinar?',
                    'Tem necessidade de urinar mais de 8 vezes ao dia?',
                    'Acorda para urinar durante a noite (mais de 2 vezes)?',
                    'Apresenta dificuldade para iniciar a micção?',
                    'Sente que a bexiga não esvazia completamente?',
                    'Tem urgência para urinar (vontade súbita)?',
                    'Apresenta incontinência urinária (escapes)?',
                    'Nota alteração na cor da urina?',
                    'Sente dor na região dos rins?',
                    'Tem histórico de pedras nos rins?',
                    'Apresenta urina com cheiro forte?',
                    'Sente desconforto na região pélvica?'
                  ] 
                },
                { 
                  system: 'Sistema Reprodutivo', 
                  icon: '🌸', 
                  color: '#f472b6', 
                  questions: [
                    'Sente dor durante a relação sexual?',
                    'Apresenta alterações no ciclo menstrual?',
                    'Tem fluxo menstrual muito intenso ou prolongado?',
                    'Sofre com cólicas menstruais intensas?',
                    'Apresenta corrimento vaginal anormal?',
                    'Sente coceira ou irritação na região íntima?',
                    'Tem sintomas de TPM intensos?',
                    'Apresenta sintomas de menopausa/andropausa?',
                    'Sente diminuição do desejo sexual?',
                    'Tem dificuldade para engravidar?',
                    'Apresenta dor ou desconforto nos seios?',
                    'Sente alterações de humor relacionadas ao ciclo?'
                  ] 
                },
                { 
                  system: 'Sistema Sensorial', 
                  icon: '👁️', 
                  color: '#8b5cf6', 
                  questions: [
                    'Tem dificuldade para enxergar de perto ou de longe?',
                    'Apresenta olhos secos ou irritados?',
                    'Sente sensibilidade à luz (fotofobia)?',
                    'Tem zumbido persistente nos ouvidos?',
                    'Apresenta diminuição da audição?',
                    'Sente vertigem ou labirintite?',
                    'Tem dificuldade para sentir cheiros?',
                    'Apresenta alteração no paladar?',
                    'Sente dor nos olhos frequentemente?',
                    'Tem visão turva ou embaçada?',
                    'Apresenta pontos ou manchas na visão?',
                    'Sente pressão nos olhos?'
                  ] 
                },
                { 
                  system: 'Sistema Psicológico/Emocional', 
                  icon: '🧘', 
                  color: '#14b8a6', 
                  questions: [
                    'Sente-se frequentemente ansioso ou preocupado?',
                    'Apresenta sintomas de depressão ou tristeza persistente?',
                    'Tem dificuldade para controlar a raiva ou irritabilidade?',
                    'Sente-se frequentemente estressado?',
                    'Apresenta ataques de pânico ou medo intenso?',
                    'Tem pensamentos negativos recorrentes?',
                    'Sente-se emocionalmente esgotado?',
                    'Apresenta dificuldade para relaxar?',
                    'Tem alterações no sono por preocupações?',
                    'Sente-se desmotivado ou sem energia?',
                    'Apresenta dificuldade de concentração por estresse?',
                    'Tem compulsões alimentares ou outros comportamentos compulsivos?'
                  ] 
                }
              ],
              frequencyOptions: [
                { value: 0, label: 'Nunca', color: '#22c55e' },
                { value: 1, label: 'Raramente', color: '#84cc16' },
                { value: 2, label: 'Às vezes', color: '#eab308' },
                { value: 3, label: 'Frequentemente', color: '#f97316' },
                { value: 4, label: 'Sempre', color: '#ef4444' }
              ],
              intensityOptions: [
                { value: 1, label: 'Leve', color: '#22c55e' },
                { value: 2, label: 'Moderada', color: '#eab308' },
                { value: 3, label: 'Intensa', color: '#ef4444' }
              ]
            },
            target_saboteurs: [],
            difficulty: 'intermediate',
            estimated_time: 20
          };
        case '8-pilares':
          return {
            title: '8 Pilares Financeiros',
            description: 'Avaliação dos 8 pilares da prosperidade com pergunta por pilar e visual em roda.',
            type: 'life_wheel_assessment',
            content: {
              areas: [
                { id: 'mindset', name: 'Mindset', icon: '🧭', color: '#8b5cf6' },
                { id: 'planejamento', name: 'Planejamento', icon: '🗂️', color: '#0ea5e9' },
                { id: 'investimentos', name: 'Investimentos', icon: '📈', color: '#22c55e' },
                { id: 'renda', name: 'Renda', icon: '💼', color: '#f59e0b' },
                { id: 'gastos', name: 'Gastos', icon: '🧾', color: '#ef4444' },
                { id: 'protecao', name: 'Proteção', icon: '🛡️', color: '#10b981' },
                { id: 'impostos', name: 'Impostos', icon: '🏛️', color: '#06b6d4' },
                { id: 'reserva', name: 'Reserva', icon: '🏦', color: '#84cc16' }
              ].map(area => ({
                ...area,
                question: { id: `${area.id}_q1`, text: `Como está seu pilar de ${area.name}?`, type: 'emoji_scale' },
                emoji_options: emojiOptions
              }))
            },
            target_saboteurs: [],
            difficulty: 'beginner',
            estimated_time: 15
          };
        case '8-competencias':
          return {
            title: 'Roda das 8 Competências',
            description: 'Avaliação de competências profissionais com pergunta por competência e visual final em roda.',
            type: 'life_wheel_assessment',
            content: {
              areas: [
                { id: 'lideranca', name: 'Liderança', icon: '👑', color: '#f59e0b' },
                { id: 'comunicacao', name: 'Comunicação', icon: '💬', color: '#22c55e' },
                { id: 'inovacao', name: 'Inovação', icon: '💡', color: '#a78bfa' },
                { id: 'estrategia', name: 'Estratégia', icon: '🎯', color: '#ef4444' },
                { id: 'execucao', name: 'Execução', icon: '🏃‍♂️', color: '#0ea5e9' },
                { id: 'relacionamento', name: 'Relacionamento', icon: '🤝', color: '#ec4899' },
                { id: 'adaptabilidade', name: 'Adaptabilidade', icon: '🔄', color: '#06b6d4' },
                { id: 'aprendizado', name: 'Aprendizado', icon: '📚', color: '#84cc16' }
              ].map(area => ({
                ...area,
                question: { id: `${area.id}_q1`, text: `Como você avalia sua competência de ${area.name}?`, type: 'emoji_scale' },
                emoji_options: emojiOptions
              }))
            },
            target_saboteurs: [],
            difficulty: 'beginner',
            estimated_time: 12
          };
        case 'sabotadores':
          return {
            title: '24 Sabotadores do Emagrecimento',
            description: 'Identifique os sabotadores mentais que impedem o emagrecimento baseado em psicologia comportamental.',
            type: 'saboteurs_assessment',
            content: {
              categories: [
                {
                  id: 'comportamentais',
                  name: 'Comportamentais',
                  icon: '📦',
                  color: '#f59e0b',
                  saboteurs: [
                    { id: 'roupas', name: 'Sabotador das Roupas', question: 'Você mantém roupas antigas esperando emagrecer?' },
                    { id: 'dinheiro', name: 'Sabotador do Dinheiro', question: 'Você associa gastar dinheiro com comida como recompensa?' },
                    { id: 'escape', name: 'Válvula de Escape', question: 'Você usa comida para fugir de emoções negativas?' },
                    { id: 'prazer', name: 'Prazer da Comida', question: 'A comida é sua principal fonte de prazer?' }
                  ]
                },
                {
                  id: 'psicologicos',
                  name: 'Psicológicos',
                  icon: '🧠',
                  color: '#a78bfa',
                  saboteurs: [
                    { id: 'critico', name: 'Crítico Interno', question: 'Você costuma se criticar severamente?' },
                    { id: 'boazinha', name: 'Boazinha Demais', question: 'Você tem dificuldade em dizer não para os outros?' },
                    { id: 'crencas', name: 'Falta de Crenças', question: 'Você duvida da sua capacidade de emagrecer?' },
                    { id: 'autoimagem', name: 'Apego à Autoimagem', question: 'Você tem medo de como será sua vida após emagrecer?' }
                  ]
                },
                {
                  id: 'relacionais',
                  name: 'Relacionais',
                  icon: '👥',
                  color: '#ec4899',
                  saboteurs: [
                    { id: 'conjuge', name: 'Problemas com Cônjuge', question: 'Seu parceiro(a) demonstra ciúmes quando você emagrece?' },
                    { id: 'filhos', name: 'Proteção dos Filhos', question: 'Você negligencia sua saúde para cuidar da família?' },
                    { id: 'afetiva', name: 'Fuga Afetiva', question: 'Você usa o peso como barreira emocional?' },
                    { id: 'afeto', name: 'Comida como Afeto', question: 'Você associa comida com demonstração de amor?' }
                  ]
                },
                {
                  id: 'fisicos',
                  name: 'Físicos',
                  icon: '🏃',
                  color: '#22c55e',
                  saboteurs: [
                    { id: 'atividade', name: 'Aversão ao Exercício', question: 'Você tem aversão a atividades físicas?' },
                    { id: 'dieta', name: 'Crença Contrária', question: 'Você acredita que dieta é tortura?' },
                    { id: 'fortaleza', name: 'Tamanho como Fortaleza', question: 'Você sente que seu tamanho lhe dá proteção?' }
                  ]
                },
                {
                  id: 'temporais',
                  name: 'Temporais',
                  icon: '🕰️',
                  color: '#06b6d4',
                  saboteurs: [
                    { id: 'mudanca', name: 'Estranheza da Mudança', question: 'Você se sente desconfortável com mudanças?' },
                    { id: 'infancia_magra', name: 'Magreza da Infância', question: 'Você tem traumas relacionados à magreza na infância?' },
                    { id: 'perdas_presente', name: 'Perdas no Presente', question: 'Você está passando por luto ou tristeza?' },
                    { id: 'perdas_infancia', name: 'Perdas na Infância', question: 'Você teve perdas significativas na infância?' }
                  ]
                },
                {
                  id: 'socioeconomicos',
                  name: 'Socioeconômicos',
                  icon: '💰',
                  color: '#8b5cf6',
                  saboteurs: [
                    { id: 'riqueza', name: 'Obesidade como Riqueza', question: 'Na sua família, peso é associado a prosperidade?' },
                    { id: 'identidade', name: 'Biotipo e Identidade', question: 'Seu peso faz parte da sua identidade?' },
                    { id: 'beleza', name: 'Fuga da Beleza', question: 'Você tem medo de ser considerado(a) bonito(a)?' }
                  ]
                }
              ]
            },
            target_saboteurs: [],
            difficulty: 'intermediate',
            estimated_time: 20
          };
        case 'sono':
          return {
            title: 'Avaliação de Qualidade do Sono',
            description: 'Questionário para avaliar qualidade, duração e padrões de sono.',
            type: 'life_wheel_assessment',
            content: {
              areas: [
                { id: 'duracao', name: 'Duração do Sono', icon: '⏰', color: '#6366f1' },
                { id: 'qualidade', name: 'Qualidade do Sono', icon: '😴', color: '#8b5cf6' },
                { id: 'latencia', name: 'Facilidade para Dormir', icon: '🛏️', color: '#a78bfa' },
                { id: 'despertar', name: 'Despertar', icon: '🌅', color: '#f59e0b' },
                { id: 'energia', name: 'Energia ao Acordar', icon: '⚡', color: '#22c55e' },
                { id: 'regularidade', name: 'Regularidade', icon: '📅', color: '#0ea5e9' }
              ].map(area => ({
                ...area,
                question: { id: `${area.id}_q1`, text: `Como está sua ${area.name}?`, type: 'emoji_scale' },
                emoji_options: emojiOptions
              }))
            },
            target_saboteurs: [],
            difficulty: 'beginner',
            estimated_time: 10
          };
        case 'estresse':
          return {
            title: 'Avaliação de Estresse e Ansiedade',
            description: 'Avalie seus níveis de estresse e ansiedade e identifique gatilhos.',
            type: 'life_wheel_assessment',
            content: {
              areas: [
                { id: 'estresse_geral', name: 'Nível de Estresse', icon: '😰', color: '#ef4444' },
                { id: 'ansiedade', name: 'Ansiedade', icon: '😟', color: '#f97316' },
                { id: 'tensao', name: 'Tensão Muscular', icon: '💪', color: '#eab308' },
                { id: 'preocupacao', name: 'Preocupações', icon: '🤔', color: '#a78bfa' },
                { id: 'irritabilidade', name: 'Irritabilidade', icon: '😤', color: '#ec4899' },
                { id: 'concentracao', name: 'Concentração', icon: '🎯', color: '#0ea5e9' },
                { id: 'sono_estresse', name: 'Sono e Descanso', icon: '😴', color: '#6366f1' },
                { id: 'respiracao', name: 'Padrão Respiratório', icon: '🌬️', color: '#10b981' }
              ].map(area => ({
                ...area,
                question: { id: `${area.id}_q1`, text: `Como está seu(sua) ${area.name}?`, type: 'emoji_scale' },
                emoji_options: emojiOptions
              }))
            },
            target_saboteurs: [],
            difficulty: 'beginner',
            estimated_time: 12
          };
        case 'bem-estar':
          return {
            title: 'Avaliação de Bem-estar e Mindfulness',
            description: 'Avalie seu nível de bem-estar geral e práticas de autocuidado.',
            type: 'life_wheel_assessment',
            content: {
              areas: [
                { id: 'presenca', name: 'Presença Plena', icon: '🧘', color: '#14b8a6' },
                { id: 'gratidao', name: 'Gratidão', icon: '🙏', color: '#22c55e' },
                { id: 'autocuidado', name: 'Autocuidado', icon: '💆', color: '#ec4899' },
                { id: 'conexao', name: 'Conexão Social', icon: '🤝', color: '#0ea5e9' },
                { id: 'proposito', name: 'Propósito', icon: '🎯', color: '#f59e0b' },
                { id: 'paz', name: 'Paz Interior', icon: '☮️', color: '#8b5cf6' }
              ].map(area => ({
                ...area,
                question: { id: `${area.id}_q1`, text: `Como está seu(sua) ${area.name}?`, type: 'emoji_scale' },
                emoji_options: emojiOptions
              }))
            },
            target_saboteurs: [],
            difficulty: 'beginner',
            estimated_time: 12
          };
        case 'habitos-alimentares':
          return {
            title: 'Avaliação de Hábitos Alimentares',
            description: 'Analise seus padrões alimentares, preferências e comportamentos em relação à comida.',
            type: 'life_wheel_assessment',
            content: {
              areas: [
                { id: 'refeicoes', name: 'Regularidade das Refeições', icon: '🍽️', color: '#f59e0b' },
                { id: 'vegetais', name: 'Consumo de Vegetais', icon: '🥗', color: '#22c55e' },
                { id: 'proteinas', name: 'Consumo de Proteínas', icon: '🥩', color: '#ef4444' },
                { id: 'acucar', name: 'Controle de Açúcar', icon: '🍬', color: '#ec4899' },
                { id: 'processados', name: 'Evitar Processados', icon: '🍔', color: '#f97316' },
                { id: 'mastigacao', name: 'Mastigação Adequada', icon: '👄', color: '#8b5cf6' },
                { id: 'porcoes', name: 'Controle de Porções', icon: '📏', color: '#0ea5e9' },
                { id: 'emocional', name: 'Alimentação Consciente', icon: '🧠', color: '#14b8a6' }
              ].map(area => ({
                ...area,
                question: { id: `${area.id}_q1`, text: `Como está seu(sua) ${area.name}?`, type: 'emoji_scale' },
                emoji_options: emojiOptions
              }))
            },
            target_saboteurs: [],
            difficulty: 'beginner',
            estimated_time: 15
          };
        case 'hidratacao':
          return {
            title: 'Avaliação de Hidratação',
            description: 'Avalie seus hábitos de hidratação e consumo de líquidos.',
            type: 'life_wheel_assessment',
            content: {
              areas: [
                { id: 'quantidade', name: 'Quantidade de Água', icon: '💧', color: '#0ea5e9' },
                { id: 'frequencia', name: 'Frequência', icon: '⏰', color: '#6366f1' },
                { id: 'sinais', name: 'Atenção aos Sinais', icon: '👁️', color: '#22c55e' },
                { id: 'habito', name: 'Hábito Estabelecido', icon: '✅', color: '#14b8a6' }
              ].map(area => ({
                ...area,
                question: { id: `${area.id}_q1`, text: `Como está seu(sua) ${area.name}?`, type: 'emoji_scale' },
                emoji_options: emojiOptions
              }))
            },
            target_saboteurs: [],
            difficulty: 'beginner',
            estimated_time: 8
          };
        case 'rotina-diaria':
          return {
            title: 'Mapeamento de Rotina Diária',
            description: 'Mapeie sua rotina diária completa incluindo horários e hábitos.',
            type: 'life_wheel_assessment',
            content: {
              areas: [
                { id: 'acordar', name: 'Horário de Acordar', icon: '🌅', color: '#f59e0b' },
                { id: 'cafe', name: 'Café da Manhã', icon: '☕', color: '#8b5cf6' },
                { id: 'trabalho', name: 'Produtividade no Trabalho', icon: '💼', color: '#0ea5e9' },
                { id: 'almoco', name: 'Pausa para Almoço', icon: '🍽️', color: '#22c55e' },
                { id: 'exercicio', name: 'Tempo para Exercício', icon: '🏃', color: '#ef4444' },
                { id: 'jantar', name: 'Jantar em Família', icon: '👨‍👩‍👧', color: '#ec4899' },
                { id: 'lazer', name: 'Tempo de Lazer', icon: '🎮', color: '#a78bfa' },
                { id: 'dormir', name: 'Hora de Dormir', icon: '🌙', color: '#6366f1' }
              ].map(area => ({
                ...area,
                question: { id: `${area.id}_q1`, text: `Como está seu(sua) ${area.name}?`, type: 'emoji_scale' },
                emoji_options: emojiOptions
              }))
            },
            target_saboteurs: [],
            difficulty: 'beginner',
            estimated_time: 12
          };
        case 'objetivos-saude':
          return {
            title: 'Definição de Objetivos de Saúde',
            description: 'Defina e acompanhe seus objetivos de saúde de curto, médio e longo prazo.',
            type: 'life_wheel_assessment',
            content: {
              areas: [
                { id: 'peso', name: 'Meta de Peso', icon: '⚖️', color: '#22c55e' },
                { id: 'exercicio', name: 'Meta de Exercício', icon: '🏋️', color: '#ef4444' },
                { id: 'alimentacao', name: 'Meta Alimentar', icon: '🥗', color: '#f59e0b' },
                { id: 'sono', name: 'Meta de Sono', icon: '😴', color: '#6366f1' },
                { id: 'stress', name: 'Redução de Estresse', icon: '🧘', color: '#ec4899' },
                { id: 'exames', name: 'Exames em Dia', icon: '🩺', color: '#0ea5e9' }
              ].map(area => ({
                ...area,
                question: { id: `${area.id}_q1`, text: `Como está sua ${area.name}?`, type: 'emoji_scale' },
                emoji_options: emojiOptions
              }))
            },
            target_saboteurs: [],
            difficulty: 'beginner',
            estimated_time: 15
          };
        case 'motivacao':
          return {
            title: 'Avaliação de Motivação e Energia',
            description: 'Avalie seu nível de motivação, energia mental e disposição para mudanças.',
            type: 'life_wheel_assessment',
            content: {
              areas: [
                { id: 'energia', name: 'Nível de Energia', icon: '⚡', color: '#f59e0b' },
                { id: 'motivacao', name: 'Motivação Geral', icon: '🔥', color: '#ef4444' },
                { id: 'foco', name: 'Capacidade de Foco', icon: '🎯', color: '#0ea5e9' },
                { id: 'resiliencia', name: 'Resiliência', icon: '💪', color: '#22c55e' },
                { id: 'otimismo', name: 'Otimismo', icon: '😊', color: '#ec4899' },
                { id: 'autodisciplina', name: 'Autodisciplina', icon: '📋', color: '#8b5cf6' }
              ].map(area => ({
                ...area,
                question: { id: `${area.id}_q1`, text: `Como está seu(sua) ${area.name}?`, type: 'emoji_scale' },
                emoji_options: emojiOptions
              }))
            },
            target_saboteurs: [],
            difficulty: 'beginner',
            estimated_time: 10
          };
        case 'anamnese':
          return {
            title: 'Anamnese Completa de Saúde',
            description: 'Questionário completo de histórico de saúde incluindo doenças, medicamentos e histórico familiar.',
            type: 'anamnesis_assessment',
            content: {
              sections: [
                { id: 'historico_pessoal', name: 'Histórico Pessoal', icon: '📋', color: '#0ea5e9', questions: ['Possui alguma doença crônica?', 'Faz uso de medicamentos contínuos?', 'Possui alergias conhecidas?'] },
                { id: 'historico_familiar', name: 'Histórico Familiar', icon: '👨‍👩‍👧‍👦', color: '#22c55e', questions: ['Histórico de diabetes na família?', 'Histórico de hipertensão?', 'Histórico de câncer?'] },
                { id: 'cirurgias', name: 'Cirurgias', icon: '🏥', color: '#ef4444', questions: ['Já realizou alguma cirurgia?', 'Teve complicações em cirurgias?'] },
                { id: 'habitos', name: 'Hábitos de Vida', icon: '🍺', color: '#f59e0b', questions: ['Consome bebidas alcoólicas?', 'É fumante ou ex-fumante?', 'Pratica atividade física regular?'] }
              ]
            },
            target_saboteurs: [],
            difficulty: 'intermediate',
            estimated_time: 25
          };
        case 'atividade-fisica':
          return {
            title: 'Avaliação de Atividade Física',
            description: 'Avalie seu nível atual de atividade física, preferências de exercício e barreiras.',
            type: 'life_wheel_assessment',
            content: {
              areas: [
                { id: 'frequencia', name: 'Frequência de Treino', icon: '📅', color: '#22c55e' },
                { id: 'intensidade', name: 'Intensidade', icon: '💪', color: '#ef4444' },
                { id: 'variedade', name: 'Variedade de Exercícios', icon: '🎯', color: '#8b5cf6' },
                { id: 'alongamento', name: 'Alongamento', icon: '🧘', color: '#14b8a6' },
                { id: 'cardio', name: 'Exercício Cardiovascular', icon: '❤️', color: '#ec4899' },
                { id: 'forca', name: 'Treino de Força', icon: '🏋️', color: '#f59e0b' },
                { id: 'descanso', name: 'Descanso e Recuperação', icon: '😴', color: '#6366f1' },
                { id: 'motivacao_treino', name: 'Motivação para Treinar', icon: '🔥', color: '#0ea5e9' }
              ].map(area => ({
                ...area,
                question: { id: `${area.id}_q1`, text: `Como está seu(sua) ${area.name}?`, type: 'emoji_scale' },
                emoji_options: emojiOptions
              }))
            },
            target_saboteurs: [],
            difficulty: 'beginner',
            estimated_time: 12
          };
        default:
          return null;
      }
};
