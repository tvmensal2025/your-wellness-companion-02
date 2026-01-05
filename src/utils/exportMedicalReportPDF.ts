import jsPDF from 'jspdf';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export interface SystemData {
  name: string;
  score: number;
  color: string;
  icon: string;
  insights: string[];
}

export interface MedicalReportData {
  score: number;
  systems: SystemData[];
  userProfile?: {
    full_name?: string;
    email?: string;
    phone?: string;
    birth_date?: string;
    gender?: string;
  };
  sessionName?: string;
  sessionDate?: Date;
}

const COLORS = {
  primary: [59, 130, 246] as [number, number, number],    // Blue
  success: [16, 185, 129] as [number, number, number],    // Green
  warning: [245, 158, 11] as [number, number, number],    // Orange
  danger: [239, 68, 68] as [number, number, number],      // Red
  gray: [107, 114, 128] as [number, number, number],
  lightGray: [229, 231, 235] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
  black: [17, 24, 39] as [number, number, number],
};

function getScoreColor(score: number): [number, number, number] {
  if (score >= 8) return COLORS.success;
  if (score >= 6) return COLORS.primary;
  if (score >= 4) return COLORS.warning;
  return COLORS.danger;
}

function getScoreLevel(score: number): string {
  if (score >= 8) return 'EXCELENTE';
  if (score >= 7) return 'BOM';
  if (score >= 6) return 'REGULAR';
  if (score >= 4) return 'ATENÇÃO';
  return 'CRÍTICO';
}

export async function exportMedicalReportPDF(data: MedicalReportData): Promise<void> {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // ========== HEADER ==========
  // Faixa superior colorida
  pdf.setFillColor(...COLORS.primary);
  pdf.rect(0, 0, pageWidth, 35, 'F');

  // Título principal
  pdf.setTextColor(...COLORS.white);
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text('RELATÓRIO DE SAÚDE', pageWidth / 2, 15, { align: 'center' });

  // Subtítulo
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Avaliação Completa dos Sistemas Corporais', pageWidth / 2, 23, { align: 'center' });

  // Data de geração
  const dateStr = format(data.sessionDate || new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  pdf.setFontSize(9);
  pdf.text(`Gerado em: ${dateStr}`, pageWidth / 2, 30, { align: 'center' });

  y = 45;

  // ========== DADOS DO PACIENTE ==========
  pdf.setTextColor(...COLORS.black);
  pdf.setFillColor(245, 247, 250);
  pdf.roundedRect(margin, y, contentWidth, 28, 3, 3, 'F');

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.text('DADOS DO PACIENTE', margin + 5, y + 7);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.setTextColor(...COLORS.gray);

  const patientName = data.userProfile?.full_name || 'Não informado';
  const patientEmail = data.userProfile?.email || 'Não informado';
  const patientPhone = data.userProfile?.phone || 'Não informado';
  const patientGender = data.userProfile?.gender || 'Não informado';

  pdf.text(`Nome: ${patientName}`, margin + 5, y + 14);
  pdf.text(`E-mail: ${patientEmail}`, margin + 5, y + 20);
  pdf.text(`Telefone: ${patientPhone}`, pageWidth / 2, y + 14);
  pdf.text(`Gênero: ${patientGender}`, pageWidth / 2, y + 20);

  if (data.sessionName) {
    pdf.text(`Sessão: ${data.sessionName}`, margin + 5, y + 26);
  }

  y += 38;

  // ========== SCORE PRINCIPAL ==========
  const scoreColor = getScoreColor(data.score);
  const scoreLevel = getScoreLevel(data.score);

  // Box do score
  pdf.setFillColor(...COLORS.white);
  pdf.setDrawColor(...COLORS.lightGray);
  pdf.roundedRect(margin, y, contentWidth, 40, 3, 3, 'FD');

  // Círculo do score
  const circleX = margin + 30;
  const circleY = y + 20;
  const circleRadius = 15;

  pdf.setFillColor(...scoreColor);
  pdf.circle(circleX, circleY, circleRadius, 'F');

  // Score número
  pdf.setTextColor(...COLORS.white);
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text(data.score.toFixed(1), circleX, circleY + 3, { align: 'center' });

  pdf.setFontSize(8);
  pdf.text('/10', circleX, circleY + 9, { align: 'center' });

  // Texto do score
  pdf.setTextColor(...COLORS.black);
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Score Geral de Saúde', margin + 55, y + 15);

  pdf.setFontSize(12);
  pdf.setTextColor(...scoreColor);
  pdf.text(scoreLevel, margin + 55, y + 25);

  pdf.setTextColor(...COLORS.gray);
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Baseado na avaliação de múltiplos sistemas corporais', margin + 55, y + 33);

  y += 50;

  // ========== GRÁFICO DE BARRAS - SISTEMAS ==========
  pdf.setTextColor(...COLORS.black);
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('ANÁLISE POR SISTEMAS', margin, y);
  y += 8;

  const barHeight = 8;
  const barMaxWidth = contentWidth - 50;
  const barSpacing = 12;

  // Ordenar sistemas por score (menor para maior - destacar áreas de atenção)
  const sortedSystems = [...data.systems].sort((a, b) => a.score - b.score);

  sortedSystems.forEach((system, index) => {
    if (y > pageHeight - 40) {
      pdf.addPage();
      y = margin;
    }

    const barWidth = (system.score / 10) * barMaxWidth;
    const barColor = getScoreColor(system.score);

    // Nome do sistema
    pdf.setTextColor(...COLORS.black);
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    const displayName = system.name.replace('Sistema ', '');
    pdf.text(`${system.icon} ${displayName}`, margin, y + 5);

    // Barra de fundo
    pdf.setFillColor(...COLORS.lightGray);
    pdf.roundedRect(margin + 45, y, barMaxWidth, barHeight, 2, 2, 'F');

    // Barra de progresso
    pdf.setFillColor(...barColor);
    if (barWidth > 4) {
      pdf.roundedRect(margin + 45, y, barWidth, barHeight, 2, 2, 'F');
    }

    // Score
    pdf.setTextColor(...barColor);
    pdf.setFont('helvetica', 'bold');
    pdf.text(system.score.toFixed(1), pageWidth - margin, y + 5, { align: 'right' });

    y += barSpacing;
  });

  y += 10;

  // ========== PONTOS FORTES E ÁREAS DE MELHORIA ==========
  const strongPoints = data.systems.filter(s => s.score >= 8);
  const improvementAreas = data.systems.filter(s => s.score < 7);

  // Verificar se precisa de nova página
  if (y > pageHeight - 80) {
    pdf.addPage();
    y = margin;
  }

  // Grid de duas colunas
  const colWidth = (contentWidth - 10) / 2;

  // Pontos Fortes
  pdf.setFillColor(236, 253, 245); // green-50
  pdf.roundedRect(margin, y, colWidth, 60, 3, 3, 'F');

  pdf.setTextColor(...COLORS.success);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.text('✓ PONTOS FORTES', margin + 5, y + 8);

  pdf.setTextColor(...COLORS.black);
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');

  let strongY = y + 15;
  if (strongPoints.length > 0) {
    strongPoints.slice(0, 4).forEach(system => {
      const text = `${system.icon} ${system.name.replace('Sistema ', '')} (${system.score.toFixed(1)})`;
      pdf.text(text, margin + 5, strongY);
      strongY += 6;
    });
  } else {
    pdf.setTextColor(...COLORS.gray);
    pdf.text('Continue trabalhando para', margin + 5, strongY);
    pdf.text('desenvolver pontos fortes', margin + 5, strongY + 5);
  }

  // Áreas de Melhoria
  pdf.setFillColor(255, 247, 237); // orange-50
  pdf.roundedRect(margin + colWidth + 10, y, colWidth, 60, 3, 3, 'F');

  pdf.setTextColor(...COLORS.warning);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.text('⚠ ÁREAS DE ATENÇÃO', margin + colWidth + 15, y + 8);

  pdf.setTextColor(...COLORS.black);
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');

  let impY = y + 15;
  if (improvementAreas.length > 0) {
    improvementAreas.slice(0, 4).forEach(system => {
      const text = `${system.icon} ${system.name.replace('Sistema ', '')} (${system.score.toFixed(1)})`;
      pdf.text(text, margin + colWidth + 15, impY);
      impY += 6;
    });
  } else {
    pdf.setTextColor(...COLORS.gray);
    pdf.text('Excelente! Todos os sistemas', margin + colWidth + 15, impY);
    pdf.text('estão em bom estado', margin + colWidth + 15, impY + 5);
  }

  y += 70;

  // ========== DETALHES E INSIGHTS ==========
  if (y > pageHeight - 60) {
    pdf.addPage();
    y = margin;
  }

  pdf.setTextColor(...COLORS.black);
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('RECOMENDAÇÕES PERSONALIZADAS', margin, y);
  y += 8;

  // Mostrar insights dos sistemas com menor score
  const systemsToHighlight = improvementAreas.slice(0, 3);

  systemsToHighlight.forEach(system => {
    if (y > pageHeight - 30) {
      pdf.addPage();
      y = margin;
    }

    pdf.setFillColor(255, 251, 235); // yellow-50
    pdf.roundedRect(margin, y, contentWidth, 22, 2, 2, 'F');

    pdf.setTextColor(...COLORS.black);
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`${system.icon} ${system.name}`, margin + 5, y + 7);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(...COLORS.gray);

    if (system.insights && system.insights.length > 0) {
      const insightText = system.insights.slice(0, 2).join(' • ');
      const lines = pdf.splitTextToSize(insightText, contentWidth - 15);
      pdf.text(lines.slice(0, 2), margin + 5, y + 14);
    }

    y += 26;
  });

  // ========== FOOTER ==========
  const footerY = pageHeight - 20;

  pdf.setDrawColor(...COLORS.lightGray);
  pdf.line(margin, footerY - 5, pageWidth - margin, footerY - 5);

  pdf.setTextColor(...COLORS.gray);
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Este relatório é confidencial e destinado exclusivamente ao paciente.', pageWidth / 2, footerY, { align: 'center' });
  pdf.text('Para orientações médicas específicas, consulte sempre um profissional de saúde qualificado.', pageWidth / 2, footerY + 4, { align: 'center' });
  pdf.text(`Documento gerado em ${format(new Date(), "dd/MM/yyyy 'às' HH:mm")}`, pageWidth / 2, footerY + 8, { align: 'center' });

  // Salvar PDF
  const fileName = `relatorio-saude-${format(new Date(), 'dd-MM-yyyy-HHmm')}.pdf`;
  pdf.save(fileName);
}
