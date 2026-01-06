import React from 'react';

interface SaboteurType {
  name: string;
  description: string;
  color: string;
  bgColor: string;
  emoji: string;
}

const saboteurTypesData: Record<string, SaboteurType> = {
  perfeccionismo: {
    name: "O Perfeccionista",
    description: "Exige perfeição absoluta em tudo",
    color: "#9333ea",
    bgColor: "#f3e8ff",
    emoji: "⭐"
  },
  procrastinacao: {
    name: "O Procrastinador",
    description: "Sempre encontra desculpas para adiar",
    color: "#ea580c",
    bgColor: "#ffedd5",
    emoji: "⏰"
  },
  comparacao: {
    name: "O Comparador",
    description: "Compara-se constantemente com outros",
    color: "#2563eb",
    bgColor: "#dbeafe",
    emoji: "👥"
  },
  autocritica: {
    name: "O Autocrítico",
    description: "Voz interna extremamente negativa",
    color: "#dc2626",
    bgColor: "#fee2e2",
    emoji: "❤️"
  },
  medo_falha: {
    name: "O Medroso",
    description: "Medo de falhar impede ação",
    color: "#ca8a04",
    bgColor: "#fef9c3",
    emoji: "🛡️"
  },
  pensamento_binario: {
    name: "O Binário",
    description: "Vê tudo como preto ou branco",
    color: "#4b5563",
    bgColor: "#f3f4f6",
    emoji: "👁️"
  },
  vitima: {
    name: "A Vítima",
    description: "Se vê como vítima das circunstâncias",
    color: "#db2777",
    bgColor: "#fce7f3",
    emoji: "😢"
  },
  controle: {
    name: "O Controlador",
    description: "Precisa controlar tudo ao redor",
    color: "#4f46e5",
    bgColor: "#e0e7ff",
    emoji: "⚙️"
  },
  aprovacao: {
    name: "O Aprovador",
    description: "Precisa da aprovação dos outros",
    color: "#16a34a",
    bgColor: "#dcfce7",
    emoji: "💬"
  }
};

// Estratégias por sabotador
const saboteurStrategies: Record<string, string[]> = {
  perfeccionismo: [
    "Estabeleça padrões realistas e flexíveis",
    "Celebre progresso, não apenas perfeição",
    "Pratique o conceito de 'bom o suficiente'",
    "Defina prazos para finalizar projetos"
  ],
  procrastinacao: [
    "Quebre tarefas grandes em partes menores",
    "Use a técnica Pomodoro (25min focados)",
    "Elimine distrações durante períodos de foco",
    "Crie rotinas consistentes"
  ],
  comparacao: [
    "Foque no seu próprio progresso",
    "Celebre conquistas pessoais",
    "Use comparação como inspiração",
    "Pratique gratidão pelo que você tem"
  ],
  autocritica: [
    "Pratique autocompaixão diariamente",
    "Reconheça e celebre pequenas conquistas",
    "Trate-se como trataria um amigo",
    "Foque nos seus pontos fortes"
  ],
  medo_falha: [
    "Reenquadre falhas como aprendizado",
    "Comece com desafios pequenos",
    "Pratique aceitação da imperfeição",
    "Desenvolva resiliência emocional"
  ],
  pensamento_binario: [
    "Pratique ver nuances nas situações",
    "Aceite que a vida tem tons de cinza",
    "Desenvolva flexibilidade de pensamento",
    "Foque em progresso gradual"
  ],
  vitima: [
    "Assuma responsabilidade pelas suas escolhas",
    "Foque no que você pode controlar",
    "Desenvolva mentalidade de crescimento",
    "Aceite que você tem poder de mudança"
  ],
  controle: [
    "Pratique aceitação do que não pode controlar",
    "Aprenda a delegar e confiar",
    "Desenvolva flexibilidade",
    "Pratique mindfulness e presença"
  ],
  aprovacao: [
    "Desenvolva autoconfiança",
    "Pratique tomar decisões independentes",
    "Aceite que não pode agradar todos",
    "Foque em seus próprios valores"
  ]
};

interface SaboteurReportImageProps {
  scores: Record<string, number>;
  totalAnswered: number;
  date: string;
  userName?: string;
}

const SaboteurReportImage: React.FC<SaboteurReportImageProps> = ({ scores, totalAnswered, date, userName }) => {
  const getTopSaboteurs = () => {
    return Object.entries(scores).sort(([, a], [, b]) => b - a).slice(0, 3);
  };

  const getAllSorted = () => {
    return Object.entries(scores).sort(([, a], [, b]) => b - a);
  };

  const getOverallScore = () => {
    const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
    return totalScore / Object.keys(scores).length;
  };

  const getScoreLevel = (score: number) => {
    if (score < 30) return { level: "Baixo", color: "#16a34a" };
    if (score < 60) return { level: "Médio", color: "#ca8a04" };
    return { level: "Alto", color: "#dc2626" };
  };

  const topSaboteurs = getTopSaboteurs();
  const allSorted = getAllSorted();
  const overallScore = getOverallScore();
  const overallLevel = getScoreLevel(overallScore);
  const areasFortes = Object.values(scores).filter(s => s < 30).length;
  const topSaboteurKey = topSaboteurs[0]?.[0] || 'perfeccionismo';
  const topSaboteurStrategies = saboteurStrategies[topSaboteurKey] || saboteurStrategies.perfeccionismo;

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <div
      style={{
        width: '1080px',
        minHeight: '1920px',
        background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        padding: '48px',
        boxSizing: 'border-box',
      }}
    >
      {/* Header */}
      <div
        style={{
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          borderRadius: '24px',
          padding: '40px',
          marginBottom: '32px',
          textAlign: 'center',
          color: 'white',
          boxShadow: '0 10px 40px rgba(16, 185, 129, 0.3)',
        }}
      >
        <div style={{ fontSize: '64px', marginBottom: '16px' }}>🧠</div>
        <h1 style={{ fontSize: '42px', fontWeight: 'bold', margin: '0 0 8px 0' }}>
          RELATÓRIO DE AUTOCONHECIMENTO
        </h1>
        {userName && (
          <p style={{ fontSize: '28px', fontWeight: 600, margin: '12px 0', opacity: 0.95 }}>
            ★ {userName} ★
          </p>
        )}
        <p style={{ fontSize: '20px', opacity: 0.9, margin: 0 }}>
          Avaliação de Sabotadores Mentais
        </p>
        <p style={{ fontSize: '16px', opacity: 0.7, marginTop: '8px' }}>
          {date}
        </p>
      </div>

      {/* Score Geral */}
      <div
        style={{
          background: 'white',
          borderRadius: '20px',
          padding: '32px',
          marginBottom: '32px',
          textAlign: 'center',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          border: '2px solid #e5e7eb',
        }}
      >
        <h2 style={{ fontSize: '24px', color: '#374151', margin: '0 0 24px 0', fontWeight: 600 }}>
          SCORE GERAL DE SABOTADORES
        </h2>
        <div style={{ fontSize: '96px', fontWeight: 'bold', color: overallLevel.color, lineHeight: 1 }}>
          {overallScore.toFixed(0)}%
        </div>
        <div
          style={{
            display: 'inline-block',
            marginTop: '16px',
            padding: '8px 24px',
            borderRadius: '9999px',
            backgroundColor: overallLevel.color + '20',
            color: overallLevel.color,
            fontSize: '20px',
            fontWeight: 'bold',
          }}
        >
          Nível {overallLevel.level}
        </div>
      </div>

      {/* Top 3 Sabotadores */}
      <div
        style={{
          background: 'white',
          borderRadius: '20px',
          padding: '32px',
          marginBottom: '32px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          border: '2px solid #e5e7eb',
        }}
      >
        <h2 style={{ fontSize: '24px', color: '#374151', margin: '0 0 24px 0', fontWeight: 600, textAlign: 'center' }}>
          🎯 SEUS 3 PRINCIPAIS SABOTADORES
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {topSaboteurs.map(([category, score], index) => {
            const saboteur = saboteurTypesData[category];
            if (!saboteur) return null;
            return (
              <div
                key={category}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '20px',
                  backgroundColor: saboteur.bgColor,
                  borderRadius: '16px',
                  border: `2px solid ${saboteur.color}30`,
                }}
              >
                <span style={{ fontSize: '40px' }}>{medals[index]}</span>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    backgroundColor: saboteur.color + '20',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '28px',
                  }}
                >
                  {saboteur.emoji}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937' }}>
                    {saboteur.name}
                  </div>
                  <div style={{ fontSize: '14px', color: '#6b7280' }}>
                    {saboteur.description}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '32px', fontWeight: 'bold', color: saboteur.color }}>
                    {score.toFixed(0)}%
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>intensidade</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Gráfico de Barras - Todas as Categorias */}
      <div
        style={{
          background: 'white',
          borderRadius: '20px',
          padding: '32px',
          marginBottom: '32px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          border: '2px solid #e5e7eb',
        }}
      >
        <h2 style={{ fontSize: '24px', color: '#374151', margin: '0 0 24px 0', fontWeight: 600, textAlign: 'center' }}>
          📊 ANÁLISE COMPLETA
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {allSorted.map(([category, score]) => {
            const saboteur = saboteurTypesData[category];
            if (!saboteur) return null;
            return (
              <div key={category} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '140px', fontSize: '14px', fontWeight: 500, color: '#374151', textAlign: 'right' }}>
                  {saboteur.name.replace('O ', '').replace('A ', '')}
                </div>
                <div
                  style={{
                    flex: 1,
                    height: '24px',
                    backgroundColor: '#f3f4f6',
                    borderRadius: '12px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${score}%`,
                      height: '100%',
                      backgroundColor: saboteur.color,
                      borderRadius: '12px',
                    }}
                  />
                </div>
                <div style={{ width: '50px', fontSize: '16px', fontWeight: 'bold', color: saboteur.color }}>
                  {score.toFixed(0)}%
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Estatísticas */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '16px',
          marginBottom: '32px',
        }}
      >
        <div
          style={{
            background: 'white',
            borderRadius: '16px',
            padding: '24px',
            textAlign: 'center',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            border: '2px solid #e5e7eb',
          }}
        >
          <div style={{ fontSize: '40px', marginBottom: '8px' }}>🏆</div>
          <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#10b981' }}>{totalAnswered}</div>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>Perguntas Respondidas</div>
        </div>
        <div
          style={{
            background: 'white',
            borderRadius: '16px',
            padding: '24px',
            textAlign: 'center',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            border: '2px solid #e5e7eb',
          }}
        >
          <div style={{ fontSize: '40px', marginBottom: '8px' }}>🧠</div>
          <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#8b5cf6' }}>{Object.keys(scores).length}</div>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>Áreas Analisadas</div>
        </div>
        <div
          style={{
            background: 'white',
            borderRadius: '16px',
            padding: '24px',
            textAlign: 'center',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            border: '2px solid #e5e7eb',
          }}
        >
          <div style={{ fontSize: '40px', marginBottom: '8px' }}>📈</div>
          <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#f59e0b' }}>{areasFortes}</div>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>Áreas de Força</div>
        </div>
      </div>

      {/* Seção: Como Combater o Sabotador #1 */}
      <div
        style={{
          background: 'white',
          borderRadius: '20px',
          padding: '32px',
          marginBottom: '32px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          border: `2px solid ${saboteurTypesData[topSaboteurKey]?.color || '#10b981'}30`,
        }}
      >
        <h2 style={{ fontSize: '24px', color: '#374151', margin: '0 0 24px 0', fontWeight: 600, textAlign: 'center' }}>
          🎯 COMO COMBATER O {saboteurTypesData[topSaboteurKey]?.name?.toUpperCase() || 'SABOTADOR'}
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {topSaboteurStrategies.map((strategy, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '16px',
                backgroundColor: saboteurTypesData[topSaboteurKey]?.bgColor || '#f0fdf4',
                borderRadius: '12px',
              }}
            >
              <span style={{ fontSize: '24px' }}>✓</span>
              <span style={{ fontSize: '16px', color: '#1f2937', fontWeight: 500 }}>{strategy}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Dica Rápida */}
      <div
        style={{
          background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
          borderRadius: '20px',
          padding: '32px',
          marginBottom: '32px',
          border: '2px solid #fbbf24',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
          <span style={{ fontSize: '32px' }}>💡</span>
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#92400e', margin: '0 0 8px 0' }}>
              DICA RÁPIDA
            </h3>
            <p style={{ fontSize: '16px', color: '#78350f', margin: 0, lineHeight: 1.6 }}>
              Seu sabotador #1 é o <strong>{saboteurTypesData[topSaboteurs[0]?.[0]]?.name || 'Perfeccionista'}</strong>. 
              Esta semana, pratique reconhecer quando ele aparece e escolha conscientemente uma resposta diferente. 
              Pequenas mudanças diárias geram grandes transformações!
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          textAlign: 'center',
          padding: '24px',
          borderTop: '2px solid #e5e7eb',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
          <span style={{ fontSize: '24px' }}>🌱</span>
          <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#10b981' }}>Sofia Nutricional</span>
        </div>
        <p style={{ fontSize: '14px', color: '#9ca3af', margin: 0 }}>
          Sua jornada de autoconhecimento começa aqui
        </p>
      </div>
    </div>
  );
};

export default SaboteurReportImage;
