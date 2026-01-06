import jsPDF from 'jspdf';

export interface SaboteurData {
  name: string;
  score: number;
  description: string;
}

export interface MissionSummary {
  dias: number;
  completadas: number;
  pontosTotais: number;
  streakAtual: number;
}

export interface ReportData {
  title: string;
  date: string;
  introduction: string;
  saboteurs: SaboteurData[];
  missionSummary: MissionSummary | null;
  missionInsights: string;
  physicalInsights: string;
  emotionalInsights: string;
  actionPlan: string[];
  conclusion: string;
}

export function generateSaboteurPDF(data: ReportData): jsPDF {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // Helper: check page break
  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - margin) {
      pdf.addPage();
      y = margin;
      return true;
    }
    return false;
  };

  // Helper: add section title
  const addSectionTitle = (text: string) => {
    checkPageBreak(20);
    pdf.setFontSize(14);
    pdf.setTextColor(16, 185, 129); // Emerald
    pdf.setFont('helvetica', 'bold');
    pdf.text(text, margin, y);
    y += 8;
    // Underline
    pdf.setDrawColor(16, 185, 129);
    pdf.setLineWidth(0.5);
    pdf.line(margin, y - 2, margin + 60, y - 2);
    y += 4;
  };

  // Helper: add paragraph
  const addParagraph = (text: string, indent = 0) => {
    if (!text) return;
    pdf.setFontSize(10);
    pdf.setTextColor(60, 60, 60);
    pdf.setFont('helvetica', 'normal');
    const lines = pdf.splitTextToSize(text, contentWidth - indent);
    
    for (const line of lines) {
      checkPageBreak(6);
      pdf.text(line, margin + indent, y);
      y += 5;
    }
    y += 2;
  };

  // Helper: add bullet point
  const addBullet = (text: string) => {
    if (!text) return;
    pdf.setFontSize(10);
    pdf.setTextColor(60, 60, 60);
    pdf.setFont('helvetica', 'normal');
    
    const bulletChar = '•';
    const lines = pdf.splitTextToSize(text, contentWidth - 8);
    
    for (let i = 0; i < lines.length; i++) {
      checkPageBreak(6);
      if (i === 0) {
        pdf.text(bulletChar, margin + 2, y);
      }
      pdf.text(lines[i], margin + 8, y);
      y += 5;
    }
    y += 1;
  };

  // ========== HEADER ==========
  pdf.setFillColor(16, 185, 129); // Emerald-500
  pdf.rect(0, 0, pageWidth, 40, 'F');
  
  // Gradient effect (darker band)
  pdf.setFillColor(5, 150, 105); // Emerald-600
  pdf.rect(0, 35, pageWidth, 5, 'F');

  // Title
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(22);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Relatório de Autoconhecimento', margin, 20);
  
  // Subtitle
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Sabotadores • Hábitos • Emoções', margin, 28);
  
  // Date
  pdf.setFontSize(9);
  pdf.text(`Gerado em ${data.date}`, pageWidth - margin - 40, 28);

  y = 55;

  // ========== INTRODUCTION ==========
  if (data.introduction) {
    pdf.setFontSize(11);
    pdf.setTextColor(40, 40, 40);
    pdf.setFont('helvetica', 'italic');
    const introLines = pdf.splitTextToSize(data.introduction, contentWidth);
    for (const line of introLines) {
      checkPageBreak(6);
      pdf.text(line, margin, y);
      y += 5;
    }
    y += 8;
  }

  // ========== SABOTEURS SECTION ==========
  if (data.saboteurs && data.saboteurs.length > 0) {
    addSectionTitle('Seus Sabotadores Identificados');
    
    for (const sab of data.saboteurs) {
      checkPageBreak(25);
      
      // Saboteur name with score badge
      pdf.setFontSize(12);
      pdf.setTextColor(31, 41, 55);
      pdf.setFont('helvetica', 'bold');
      pdf.text(sab.name, margin, y);
      
      // Score badge
      const scoreText = `Score: ${sab.score}`;
      const scoreX = margin + pdf.getTextWidth(sab.name) + 5;
      const scoreWidth = pdf.getTextWidth(scoreText) + 6;
      
      // Badge background
      const scoreColor = sab.score >= 70 ? [239, 68, 68] : sab.score >= 40 ? [245, 158, 11] : [34, 197, 94];
      pdf.setFillColor(scoreColor[0], scoreColor[1], scoreColor[2]);
      pdf.roundedRect(scoreX, y - 4, scoreWidth, 6, 2, 2, 'F');
      
      pdf.setFontSize(8);
      pdf.setTextColor(255, 255, 255);
      pdf.setFont('helvetica', 'bold');
      pdf.text(scoreText, scoreX + 3, y);
      
      y += 6;
      
      // Description
      if (sab.description) {
        addParagraph(sab.description, 2);
      }
      y += 3;
    }
  }

  // ========== MISSION INSIGHTS ==========
  if (data.missionInsights || data.missionSummary) {
    addSectionTitle('Conexão com Seus Hábitos');
    
    if (data.missionSummary) {
      const { dias, completadas, pontosTotais, streakAtual } = data.missionSummary;
      
      // Stats row
      checkPageBreak(20);
      pdf.setFillColor(243, 244, 246);
      pdf.roundedRect(margin, y, contentWidth, 18, 3, 3, 'F');
      
      const statsY = y + 11;
      const colWidth = contentWidth / 4;
      
      pdf.setFontSize(14);
      pdf.setTextColor(16, 185, 129);
      pdf.setFont('helvetica', 'bold');
      
      pdf.text(String(dias), margin + colWidth * 0.5, statsY, { align: 'center' });
      pdf.text(String(completadas), margin + colWidth * 1.5, statsY, { align: 'center' });
      pdf.text(String(pontosTotais), margin + colWidth * 2.5, statsY, { align: 'center' });
      pdf.text(String(streakAtual), margin + colWidth * 3.5, statsY, { align: 'center' });
      
      pdf.setFontSize(7);
      pdf.setTextColor(107, 114, 128);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Dias', margin + colWidth * 0.5, statsY + 5, { align: 'center' });
      pdf.text('Completadas', margin + colWidth * 1.5, statsY + 5, { align: 'center' });
      pdf.text('Pontos', margin + colWidth * 2.5, statsY + 5, { align: 'center' });
      pdf.text('Streak', margin + colWidth * 3.5, statsY + 5, { align: 'center' });
      
      y += 25;
    }
    
    if (data.missionInsights) {
      addParagraph(data.missionInsights);
    }
  }

  // ========== PHYSICAL INSIGHTS ==========
  if (data.physicalInsights) {
    addSectionTitle('Saúde Física');
    addParagraph(data.physicalInsights);
  }

  // ========== EMOTIONAL INSIGHTS ==========
  if (data.emotionalInsights) {
    addSectionTitle('Bem-estar Emocional');
    addParagraph(data.emotionalInsights);
  }

  // ========== ACTION PLAN ==========
  if (data.actionPlan && data.actionPlan.length > 0) {
    addSectionTitle('Plano de Ação - Próximos 7 Dias');
    
    checkPageBreak(15);
    pdf.setFillColor(254, 252, 232); // Yellow-50
    pdf.setDrawColor(250, 204, 21); // Yellow-400
    pdf.setLineWidth(0.3);
    
    // Calculate height needed
    let planHeight = 10;
    for (const action of data.actionPlan) {
      const lines = pdf.splitTextToSize(action, contentWidth - 15);
      planHeight += lines.length * 5 + 3;
    }
    
    checkPageBreak(planHeight + 5);
    pdf.roundedRect(margin, y, contentWidth, planHeight, 3, 3, 'FD');
    y += 6;
    
    data.actionPlan.forEach((action, index) => {
      pdf.setFontSize(10);
      pdf.setTextColor(31, 41, 55);
      pdf.setFont('helvetica', 'bold');
      
      const numberText = `${index + 1}.`;
      pdf.text(numberText, margin + 4, y);
      
      pdf.setFont('helvetica', 'normal');
      const lines = pdf.splitTextToSize(action, contentWidth - 18);
      for (let i = 0; i < lines.length; i++) {
        if (i > 0) checkPageBreak(5);
        pdf.text(lines[i], margin + 12, y);
        y += 5;
      }
      y += 2;
    });
    
    y += 5;
  }

  // ========== CONCLUSION ==========
  if (data.conclusion) {
    checkPageBreak(20);
    pdf.setFillColor(236, 253, 245); // Emerald-50
    pdf.roundedRect(margin, y, contentWidth, 20, 3, 3, 'F');
    
    pdf.setFontSize(10);
    pdf.setTextColor(5, 150, 105);
    pdf.setFont('helvetica', 'italic');
    const conclusionLines = pdf.splitTextToSize(data.conclusion, contentWidth - 10);
    let cy = y + 8;
    for (const line of conclusionLines) {
      pdf.text(line, margin + 5, cy);
      cy += 5;
    }
    y += 25;
  }

  // ========== FOOTER ==========
  const totalPages = pdf.internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    
    // Footer line
    pdf.setDrawColor(229, 231, 235);
    pdf.setLineWidth(0.3);
    pdf.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);
    
    // Footer text
    pdf.setFontSize(8);
    pdf.setTextColor(156, 163, 175);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Sofia Nutricional - Relatório gerado automaticamente', margin, pageHeight - 10);
    pdf.text(`Página ${i} de ${totalPages}`, pageWidth - margin - 20, pageHeight - 10);
  }

  return pdf;
}
