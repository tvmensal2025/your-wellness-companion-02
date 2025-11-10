// ============================================
// PROGRAMA: COUCH TO 5K (Do Sofá aos 5km)
// Programa progressivo de 8 semanas para iniciantes
// ============================================

import { WeekPlan } from '@/types/sport-modalities';

export const COUCH_TO_5K: {
  name: string;
  description: string;
  duration_weeks: number;
  workouts_per_week: number;
  target_goal: string;
  prerequisites: string[];
  benefits: string[];
  weeks: WeekPlan[];
} = {
  name: 'Do Sofá aos 5K',
  description: 'Programa progressivo de 8 semanas que leva você de sedentário a corredor de 5km',
  duration_weeks: 8,
  workouts_per_week: 3,
  target_goal: 'Correr 5km contínuos sem parar',
  prerequisites: [
    'Liberação médica para praticar exercícios',
    'Tênis adequado para corrida',
    'Disposição para treinar 3x por semana'
  ],
  benefits: [
    'Melhora do condicionamento cardiovascular',
    'Perda de peso gradual e saudável',
    'Aumento da resistência física',
    'Redução do estresse',
    'Melhora da qualidade do sono'
  ],
  
  weeks: [
    // SEMANA 1
    {
      week: 1,
      title: 'Semana 1 - Primeiros Passos',
      focus: 'Alternância entre caminhada e corrida leve',
      workouts: [
        {
          day: 'Segunda-feira',
          week_day: 1,
          workout_type: 'easy_run',
          name: 'Treino 1 - Introdução',
          description: 'Primeiro contato com a corrida, alterne caminhada e corrida',
          structure: '5min aquecimento (caminhada) + 8x(60seg corrida + 90seg caminhada) + 5min alongamento',
          duration_minutes: 30,
          distance_km: 2.5,
          intensity: '60-65% FCmáx',
          warm_up: 'Caminhada leve por 5 minutos',
          cool_down: 'Alongamento estático por 5 minutos',
          instructions: [
            'Comece com uma caminhada leve de 5 minutos',
            'Alterne 60 segundos de corrida LEVE com 90 segundos de caminhada',
            'Repita 8 vezes',
            'Termine com 5 minutos de alongamento',
            'Mantenha um ritmo confortável - você deve conseguir conversar'
          ],
          notes: 'Não se preocupe com velocidade! O importante é completar o treino.'
        },
        {
          day: 'Quarta-feira',
          week_day: 3,
          workout_type: 'easy_run',
          name: 'Treino 2 - Repetição',
          description: 'Mesma estrutura, ganhando confiança',
          structure: '5min aquecimento + 8x(60seg corrida + 90seg caminhada) + 5min alongamento',
          duration_minutes: 30,
          distance_km: 2.5,
          intensity: '60-65% FCmáx',
          warm_up: 'Caminhada leve por 5 minutos',
          cool_down: 'Alongamento estático por 5 minutos',
          instructions: [
            'Igual ao treino 1',
            'Preste atenção na sua respiração',
            'Mantenha os ombros relaxados',
            'Aterrisse com o pé todo, não só no calcanhar'
          ],
          notes: 'Está ficando mais fácil? Ótimo sinal!'
        },
        {
          day: 'Sexta-feira',
          week_day: 5,
          workout_type: 'easy_run',
          name: 'Treino 3 - Consolidação',
          description: 'Finalizando a primeira semana',
          structure: '5min aquecimento + 8x(60seg corrida + 90seg caminhada) + 5min alongamento',
          duration_minutes: 30,
          distance_km: 2.5,
          intensity: '60-65% FCmáx',
          warm_up: 'Caminhada leve por 5 minutos',
          cool_down: 'Alongamento estático por 5 minutos',
          instructions: [
            'Último treino da semana!',
            'Tente manter um ritmo constante nos intervalos de corrida',
            'Respire de forma natural',
            'Celebre - você completou sua primeira semana!'
          ],
          notes: 'Parabéns por completar a primeira semana! 🎉'
        }
      ],
      weekly_goal: 'Completar os 3 treinos e percorrer cerca de 7.5km total',
      tips: [
        'Descanse pelo menos 1 dia entre treinos',
        'Beba bastante água durante o dia',
        'Use roupas confortáveis e leves',
        'Escolha locais planos e seguros para correr',
        'Não tenha pressa - seu corpo está se adaptando'
      ]
    },

    // SEMANA 2
    {
      week: 2,
      title: 'Semana 2 - Aumentando o Tempo',
      focus: 'Intervalos de corrida mais longos',
      workouts: [
        {
          day: 'Segunda-feira',
          week_day: 1,
          workout_type: 'easy_run',
          name: 'Treino 1 - Progressão',
          description: 'Aumentando para 90 segundos de corrida',
          structure: '5min aquecimento + 6x(90seg corrida + 2min caminhada) + 5min alongamento',
          duration_minutes: 32,
          distance_km: 3,
          intensity: '60-65% FCmáx',
          warm_up: 'Caminhada leve + mobilidade articular',
          cool_down: 'Alongamento completo',
          instructions: [
            'Aqueça bem antes de começar',
            'Agora são 90 segundos de corrida',
            'Use os 2 minutos de caminhada para recuperar totalmente',
            'Mantenha o ritmo confortável'
          ],
          notes: 'Você está evoluindo! Mais 30 segundos de corrida.'
        },
        {
          day: 'Quarta-feira',
          week_day: 3,
          workout_type: 'easy_run',
          name: 'Treino 2 - Adaptação',
          description: 'Ganhando resistência',
          structure: '5min aquecimento + 6x(90seg corrida + 2min caminhada) + 5min alongamento',
          duration_minutes: 32,
          distance_km: 3,
          intensity: '60-65% FCmáx',
          warm_up: 'Caminhada leve + mobilidade articular',
          cool_down: 'Alongamento completo',
          instructions: [
            'Seu corpo já está se adaptando',
            'Tente manter um ritmo consistente',
            'Respire fundo e relaxe',
            'Aproveite o processo'
          ],
          notes: 'A cada treino você fica mais forte!'
        },
        {
          day: 'Sábado',
          week_day: 6,
          workout_type: 'easy_run',
          name: 'Treino 3 - Fim de Semana Ativo',
          description: 'Encerrando a semana',
          structure: '5min aquecimento + 6x(90seg corrida + 2min caminhada) + 5min alongamento',
          duration_minutes: 32,
          distance_km: 3,
          intensity: '60-65% FCmáx',
          warm_up: 'Caminhada leve + mobilidade articular',
          cool_down: 'Alongamento completo',
          instructions: [
            'Última sessão da semana',
            'Concentre-se na sua forma',
            'Comemore sua dedicação!',
            'Descanse bem no domingo'
          ],
          notes: 'Semana 2 completa! Você é incrível! 💪'
        }
      ],
      weekly_goal: 'Percorrer cerca de 9km e adaptar-se aos intervalos mais longos',
      tips: [
        'Se sentir dores, diminua o ritmo - não force',
        'Faça alongamento também nos dias de descanso',
        'Ouça seu corpo - descanso faz parte do treino',
        'Mantenha-se hidratado antes, durante e após os treinos'
      ]
    },

    // SEMANA 3
    {
      week: 3,
      title: 'Semana 3 - Ganhando Confiança',
      focus: 'Corridas de 3 minutos',
      workouts: [
        {
          day: 'Segunda-feira',
          week_day: 1,
          workout_type: 'easy_run',
          name: 'Treino 1 - Novo Desafio',
          description: 'Primeira corrida de 3 minutos!',
          structure: '5min aquecimento + 2x(90seg corrida + 90seg caminhada) + 1x(3min corrida + 3min caminhada) + 2x(90seg corrida + 90seg caminhada) + 5min alongamento',
          duration_minutes: 35,
          distance_km: 3.2,
          intensity: '65% FCmáx',
          warm_up: 'Caminhada progressiva + mobilidade',
          cool_down: 'Caminhada leve + alongamento',
          instructions: [
            'Duas séries de aquecimento de 90 segundos',
            'Uma série mais longa de 3 minutos - você consegue!',
            'Mais duas séries de 90 segundos',
            'Não acelere demais, mantenha o ritmo'
          ],
          notes: '3 minutos contínuos! Isso é um grande marco! 🎯'
        },
        {
          day: 'Quarta-feira',
          week_day: 3,
          workout_type: 'easy_run',
          name: 'Treino 2 - Consolidando',
          description: 'Repetindo o desafio',
          structure: '5min aquecimento + 2x(90seg corrida + 90seg caminhada) + 1x(3min corrida + 3min caminhada) + 2x(90seg corrida + 90seg caminhada) + 5min alongamento',
          duration_minutes: 35,
          distance_km: 3.2,
          intensity: '65% FCmáx',
          warm_up: 'Caminhada progressiva + mobilidade',
          cool_down: 'Caminhada leve + alongamento',
          instructions: [
            'Mesma estrutura do treino 1',
            'Deve estar ficando mais fácil',
            'Concentre-se na respiração nos 3 minutos',
            'Você está ficando mais forte!'
          ],
          notes: 'Cada treino te deixa mais preparado!'
        },
        {
          day: 'Sábado',
          week_day: 6,
          workout_type: 'easy_run',
          name: 'Treino 3 - Progresso Real',
          description: 'Finalizando a terceira semana',
          structure: '5min aquecimento + 2x(90seg corrida + 90seg caminhada) + 1x(3min corrida + 3min caminhada) + 2x(90seg corrida + 90seg caminhada) + 5min alongamento',
          duration_minutes: 35,
          distance_km: 3.2,
          intensity: '65% FCmáx',
          warm_up: 'Caminhada progressiva + mobilidade',
          cool_down: 'Caminhada leve + alongamento',
          instructions: [
            'Último treino antes da metade do programa!',
            'Sinta seu progresso - você já corre 3 minutos!',
            'Na próxima semana vem mais desafios',
            'Celebre suas conquistas!'
          ],
          notes: 'Você está na metade do caminho para os 5K! 🏃‍♂️'
        }
      ],
      weekly_goal: 'Dominar a corrida de 3 minutos e percorrer ~10km total',
      tips: [
        'Varie os locais de treino para não ficar monótono',
        'Crie uma playlist motivadora',
        'Compartilhe seu progresso com amigos',
        'Invista em um bom tênis se ainda não fez'
      ]
    },

    // SEMANA 4
    {
      week: 4,
      title: 'Semana 4 - Meio Caminho',
      focus: 'Corridas de 5 minutos',
      workouts: [
        {
          day: 'Segunda-feira',
          week_day: 1,
          workout_type: 'easy_run',
          name: 'Treino 1 - 5 Minutos!',
          description: 'Primeira corrida de 5 minutos',
          structure: '5min aquecimento + 3min corrida + 90seg caminhada + 5min corrida + 2min caminhada + 3min corrida + 90seg caminhada + 5min alongamento',
          duration_minutes: 38,
          distance_km: 3.5,
          intensity: '65-70% FCmáx',
          warm_up: 'Aquecimento progressivo completo',
          cool_down: 'Caminhada + alongamento completo',
          instructions: [
            'Aquecimento de 5 minutos',
            '3min corrida + 90seg caminhada',
            '5min corrida (novo recorde!) + 2min caminhada',
            '3min corrida + 90seg caminhada',
            'Alongamento caprichado'
          ],
          notes: '5 minutos correndo! Você é um corredor de verdade! 🔥'
        },
        {
          day: 'Quarta-feira',
          week_day: 3,
          workout_type: 'easy_run',
          name: 'Treino 2 - Mantendo o Ritmo',
          description: 'Consolidando os 5 minutos',
          structure: '5min aquecimento + 3min corrida + 90seg caminhada + 5min corrida + 2min caminhada + 3min corrida + 90seg caminhada + 5min alongamento',
          duration_minutes: 38,
          distance_km: 3.5,
          intensity: '65-70% FCmáx',
          warm_up: 'Aquecimento progressivo completo',
          cool_down: 'Caminhada + alongamento completo',
          instructions: [
            'Mesma estrutura, mas já deve estar mais confortável',
            'Encontre seu ritmo ideal',
            'Respire profundamente',
            'Aproveite a sensação de progresso'
          ],
          notes: 'Cada vez mais forte e resistente!'
        },
        {
          day: 'Sábado',
          week_day: 6,
          workout_type: 'easy_run',
          name: 'Treino 3 - Metade Cumprida',
          description: 'Encerrando a primeira metade do programa',
          structure: '5min aquecimento + 3min corrida + 90seg caminhada + 5min corrida + 2min caminhada + 3min corrida + 90seg caminhada + 5min alongamento',
          duration_minutes: 38,
          distance_km: 3.5,
          intensity: '65-70% FCmáx',
          warm_up: 'Aquecimento progressivo completo',
          cool_down: 'Caminhada + alongamento completo',
          instructions: [
            'Parabéns! Você completou 4 semanas!',
            'Você já percorreu dezenas de quilômetros',
            'Sinta-se orgulhoso do seu progresso',
            'Na próxima fase, vamos para corridas ainda mais longas!'
          ],
          notes: 'Metade do programa completa! Continue firme! 💪'
        }
      ],
      weekly_goal: 'Correr 5 minutos contínuos e percorrer ~10.5km total',
      tips: [
        'Esta é uma boa semana para tirar foto do antes/depois',
        'Já nota melhorias na disposição diária?',
        'Considere participar de uma corrida virtual ou presencial',
        'Continue se hidratando bem'
      ]
    },

    // SEMANA 5
    {
      week: 5,
      title: 'Semana 5 - Virando Corredor',
      focus: 'Corridas de 8 minutos',
      workouts: [
        {
          day: 'Segunda-feira',
          week_day: 1,
          workout_type: 'tempo_run',
          name: 'Treino 1 - Grande Salto',
          description: 'Primeira corrida de 8 minutos!',
          structure: '5min aquecimento + 5min corrida + 3min caminhada + 8min corrida + 2min caminhada + 5min corrida + 5min alongamento',
          duration_minutes: 40,
          distance_km: 4,
          intensity: '65-70% FCmáx',
          warm_up: 'Aquecimento dinâmico completo',
          cool_down: 'Desaceleração gradual + alongamento',
          instructions: [
            'Aquecimento caprichado',
            '5min corrida + 3min caminhada',
            '8min corrida (novo desafio!) + 2min caminhada',
            '5min corrida final',
            'Você consegue!'
          ],
          notes: '8 minutos! Você está se tornando um corredor de verdade! 🏃'
        },
        {
          day: 'Quarta-feira',
          week_day: 3,
          workout_type: 'tempo_run',
          name: 'Treino 2 - Mantendo o Foco',
          description: 'Repetindo o desafio de 8 minutos',
          structure: '5min aquecimento + 5min corrida + 3min caminhada + 8min corrida + 2min caminhada + 5min corrida + 5min alongamento',
          duration_minutes: 40,
          distance_km: 4,
          intensity: '65-70% FCmáx',
          warm_up: 'Aquecimento dinâmico completo',
          cool_down: 'Desaceleração gradual + alongamento',
          instructions: [
            'Mesma estrutura do primeiro treino',
            'Deve estar mais confiante agora',
            'Mantenha o ritmo constante',
            'Concentre-se na respiração'
          ],
          notes: '8 minutos está ficando normal para você!'
        },
        {
          day: 'Sábado',
          week_day: 6,
          workout_type: 'long_run',
          name: 'Treino 3 - Corrida Longa',
          description: 'Maior corrida até agora: 20 minutos!',
          structure: '5min aquecimento + 20min corrida contínua + 5min caminhada de recuperação + 10min alongamento',
          duration_minutes: 40,
          distance_km: 4.5,
          intensity: '65-70% FCmáx',
          warm_up: 'Aquecimento completo e progressivo',
          cool_down: 'Caminhada leve + alongamento extenso',
          instructions: [
            'Este é O treino da semana!',
            '20 minutos correndo sem parar!',
            'Comece DEVAGAR - não acelere no início',
            'Você está pronto para isso!',
            'Tire uma selfie depois - você merece!'
          ],
          notes: '20 MINUTOS CONTÍNUOS! Você é incrível! 🎉🏆'
        }
      ],
      weekly_goal: 'Correr 20 minutos contínuos no último treino',
      tips: [
        'Esta semana é um grande salto - respeite seu corpo',
        'Se precisar, repita a semana 4 antes de continuar',
        'Não há problema em ir devagar',
        'A corrida de 20 minutos é um marco enorme!',
        'Descanse bem entre os treinos'
      ]
    },

    // SEMANA 6
    {
      week: 6,
      title: 'Semana 6 - Consolidando',
      focus: 'Corridas longas de 20-25 minutos',
      workouts: [
        {
          day: 'Segunda-feira',
          week_day: 1,
          workout_type: 'tempo_run',
          name: 'Treino 1 - Ritmo Constante',
          description: 'Duas corridas de 10 minutos',
          structure: '5min aquecimento + 10min corrida + 3min caminhada + 10min corrida + 5min alongamento',
          duration_minutes: 33,
          distance_km: 4,
          intensity: '65-70% FCmáx',
          warm_up: 'Aquecimento dinâmico',
          cool_down: 'Alongamento completo',
          instructions: [
            'Aquecimento de 5 minutos',
            '10min corrida + 3min caminhada de recuperação',
            '10min corrida',
            'Mantenha um ritmo confortável e constante',
            'Você já sabe o que está fazendo!'
          ],
          notes: '10+10 = 20 minutos de corrida! Excelente!'
        },
        {
          day: 'Quarta-feira',
          week_day: 3,
          workout_type: 'long_run',
          name: 'Treino 2 - Evoluindo',
          description: 'Corrida contínua de 22 minutos',
          structure: '5min aquecimento + 22min corrida contínua + 5min caminhada + 8min alongamento',
          duration_minutes: 40,
          distance_km: 4.5,
          intensity: '65-70% FCmáx',
          warm_up: 'Aquecimento progressivo',
          cool_down: 'Desaceleração + alongamento',
          instructions: [
            'Aquecimento completo',
            '22 minutos de corrida contínua',
            'Encontre seu ritmo ideal',
            'Respire naturalmente',
            'Aproveite a sensação de liberdade'
          ],
          notes: 'Mais 2 minutos! Você está cada vez mais forte!'
        },
        {
          day: 'Sábado',
          week_day: 6,
          workout_type: 'long_run',
          name: 'Treino 3 - Quase Lá',
          description: 'Corrida contínua de 25 minutos',
          structure: '5min aquecimento + 25min corrida contínua + 5min caminhada + 10min alongamento',
          duration_minutes: 45,
          distance_km: 5,
          intensity: '65-70% FCmáx',
          warm_up: 'Aquecimento completo e progressivo',
          cool_down: 'Recuperação ativa + alongamento',
          instructions: [
            'Último grande treino antes da reta final!',
            '25 minutos correndo',
            'Você pode estar perto dos 5K já!',
            'Mantenha o ritmo confortável',
            'Celebre cada quilômetro'
          ],
          notes: '25 minutos! Você está QUASE lá! 🔥'
        }
      ],
      weekly_goal: 'Correr 25 minutos contínuos',
      tips: [
        'Você está muito perto do objetivo!',
        'Considere variar os percursos',
        'Teste diferentes horários de treino',
        'Comece a pensar na sua primeira corrida de 5K',
        'Continue fortalecendo o corpo nos dias de descanso'
      ]
    },

    // SEMANA 7
    {
      week: 7,
      title: 'Semana 7 - Reta Final',
      focus: 'Corridas de 28-30 minutos',
      workouts: [
        {
          day: 'Segunda-feira',
          week_day: 1,
          workout_type: 'long_run',
          name: 'Treino 1 - Preparação Final',
          description: 'Corrida de 28 minutos',
          structure: '5min aquecimento + 28min corrida contínua + 5min caminhada + 10min alongamento',
          duration_minutes: 48,
          distance_km: 5,
          intensity: '65-70% FCmáx',
          warm_up: 'Aquecimento completo',
          cool_down: 'Desaceleração + alongamento completo',
          instructions: [
            'Penúltima semana!',
            '28 minutos de corrida',
            'Você definitivamente pode completar 5K agora',
            'Mantenha o ritmo sustentável',
            'Desfrute da corrida!'
          ],
          notes: 'Faltam apenas 2 minutos para os 30! 💪'
        },
        {
          day: 'Quarta-feira',
          week_day: 3,
          workout_type: 'long_run',
          name: 'Treino 2 - Confiança Total',
          description: 'Corrida de 28 minutos',
          structure: '5min aquecimento + 28min corrida contínua + 5min caminhada + 10min alongamento',
          duration_minutes: 48,
          distance_km: 5,
          intensity: '65-70% FCmáx',
          warm_up: 'Aquecimento completo',
          cool_down: 'Desaceleração + alongamento completo',
          instructions: [
            'Mesma estrutura, mais confiança',
            'Você já é um corredor agora!',
            'Sinta a evolução desde o dia 1',
            'Continue forte!'
          ],
          notes: 'Você chegou longe! Continue assim!'
        },
        {
          day: 'Sábado',
          week_day: 6,
          workout_type: 'long_run',
          name: 'Treino 3 - Último Antes do Final',
          description: 'Corrida de 30 minutos!',
          structure: '5min aquecimento + 30min corrida contínua + 5min caminhada + 10min alongamento',
          duration_minutes: 50,
          distance_km: 5.5,
          intensity: '65-70% FCmáx',
          warm_up: 'Aquecimento completo e cuidadoso',
          cool_down: 'Recuperação ativa completa',
          instructions: [
            'TREINO ÉPICO!',
            '30 minutos de corrida contínua!',
            'Muito provavelmente você completará 5K neste treino',
            'Tire foto, grave vídeo, celebre!',
            'Na próxima semana é a cereja do bolo'
          ],
          notes: '30 MINUTOS! VOCÊ FEZ! 🏆🎉🎊'
        }
      ],
      weekly_goal: 'Correr 30 minutos / 5km contínuos',
      tips: [
        'Esta semana você provavelmente completará os 5K!',
        'Não acelere demais - mantenha o ritmo',
        'Você já é um corredor de 5K!',
        'Pense em se inscrever em uma corrida oficial',
        'Comemore MUITO quando completar!'
      ]
    },

    // SEMANA 8
    {
      week: 8,
      title: 'Semana 8 - Objetivo Alcançado! 🏆',
      focus: 'Consolidação e celebração',
      workouts: [
        {
          day: 'Segunda-feira',
          week_day: 1,
          workout_type: 'easy_run',
          name: 'Treino 1 - Corrida Leve',
          description: 'Corrida tranquila de 30 minutos',
          structure: '5min aquecimento + 30min corrida em ritmo confortável + 5min caminhada + 10min alongamento',
          duration_minutes: 50,
          distance_km: 5,
          intensity: '65% FCmáx',
          warm_up: 'Aquecimento suave',
          cool_down: 'Alongamento relaxante',
          instructions: [
            'Semana de celebração!',
            'Corrida tranquila e gostosa',
            'Aproveite cada minuto',
            'Reflita sobre sua jornada',
            'Você chegou longe!'
          ],
          notes: 'Relaxe e aproveite! Você é incrível!'
        },
        {
          day: 'Quarta-feira',
          week_day: 3,
          workout_type: 'tempo_run',
          name: 'Treino 2 - Ritmo Confortável',
          description: 'Corrida de 30-35 minutos',
          structure: '5min aquecimento + 35min corrida + 5min caminhada + 10min alongamento',
          duration_minutes: 55,
          distance_km: 5.5,
          intensity: '70% FCmáx',
          warm_up: 'Aquecimento progressivo',
          cool_down: 'Desaceleração + alongamento',
          instructions: [
            'Penúltimo treino do programa!',
            'Corra com confiança',
            'Você dominou a arte de correr',
            'Aproveite a liberdade'
          ],
          notes: 'Você evoluiu demais! Orgulhe-se!'
        },
        {
          day: 'Sábado',
          week_day: 6,
          workout_type: 'long_run',
          name: 'Treino 3 - GRADUAÇÃO! 🎓🏆',
          description: 'Sua primeira corrida oficial de 5K!',
          structure: '10min aquecimento progressivo + 5KM DE CORRIDA CONTÍNUA + 5min caminhada + 15min alongamento e celebração',
          duration_minutes: 60,
          distance_km: 5,
          intensity: '70-75% FCmáx',
          warm_up: 'Aquecimento completo e cuidadoso',
          cool_down: 'Recuperação ativa + comemoração!',
          instructions: [
            '🎉 ESTE É O DIA! 🎉',
            'Você vai completar oficialmente seu primeiro 5K!',
            'Aquecimento caprichado',
            'Comece em ritmo confortável',
            'Aproveite cada passo',
            'Quando cruzar a linha de chegada, CELEBRE!',
            'Tire muitas fotos!',
            'Você saiu do sofá e chegou aos 5K!',
            'PARABÉNS, CORREDOR! 🏆👏🎊'
          ],
          notes: '🏆 VOCÊ COMPLETOU O PROGRAMA! VOCÊ É OFICIALMENTE UM CORREDOR DE 5K! 🏆'
        }
      ],
      weekly_goal: 'Completar oficialmente seus primeiros 5K!',
      tips: [
        'Este é o momento da verdade!',
        'Descanse bem antes do grande dia',
        'Hidrate-se adequadamente',
        'Use o mesmo tênis dos treinos',
        'Chegue cedo ao local',
        'Comece devagar - você tem 5km pela frente',
        'Sorria para as câmeras!',
        'CELEBRE MUITO - você merece!'
      ]
    }
  ]
};

// Função helper para pegar treino específico
export const getWorkoutByWeekAndDay = (week: number, day: number): any | null => {
  const weekPlan = COUCH_TO_5K.weeks.find(w => w.week === week);
  if (!weekPlan) return null;
  
  return weekPlan.workouts[day - 1] || null;
};

// Função para calcular progresso
export const calculateProgress = (currentWeek: number, currentDay: number): number => {
  const totalWorkouts = COUCH_TO_5K.duration_weeks * COUCH_TO_5K.workouts_per_week;
  const completedWorkouts = ((currentWeek - 1) * COUCH_TO_5K.workouts_per_week) + currentDay;
  return Math.round((completedWorkouts / totalWorkouts) * 100);
};


