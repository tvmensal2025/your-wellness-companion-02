/**
 * Message extraction and validation utilities
 */

/**
 * Extract text content from WhatsApp message
 */
export function extractText(message: any): string {
  return (
    message.conversation ||
    message.extendedTextMessage?.text ||
    message.imageMessage?.caption ||
    ""
  ).trim();
}

/**
 * Check if message contains an image
 */
export function hasImage(message: any): boolean {
  return !!message.imageMessage;
}

/**
 * Check if text is a positive confirmation
 */
export function isConfirmationPositive(text: string): boolean {
  const positive = ["sim", "s", "yes", "y", "ok", "1", "✅", "confirmo", "confirma", "certo", "isso"];
  return positive.includes(text.toLowerCase().trim());
}

/**
 * Check if text is a negative confirmation
 */
export function isConfirmationNegative(text: string): boolean {
  const negative = ["não", "nao", "n", "no", "2", "❌", "errado", "incorreto", "0", "cancelar"];
  return negative.includes(text.toLowerCase().trim());
}

/**
 * Check if text is an edit request
 */
export function isConfirmationEdit(text: string): boolean {
  const edit = ["editar", "edit", "3", "✏️", "corrigir", "mudar", "alterar", "edita"];
  return edit.includes(text.toLowerCase().trim());
}

/**
 * Check if text indicates edit is done
 */
export function isEditDone(text: string): boolean {
  const done = ["pronto", "done", "finalizar", "ok", "confirmar", "confirma", "terminar", "terminei"];
  return done.includes(text.toLowerCase().trim());
}

/**
 * Check if text is a clear/finalize pending request
 */
export function isClearPending(text: string): boolean {
  const clearPatterns = ["4", "finalizar", "limpar", "clear", "descartar", "limpa", "descarta"];
  return clearPatterns.includes(text.toLowerCase().trim());
}

/**
 * Detect current meal type based on time of day
 */
export function detectMealType(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 10) return "cafe_da_manha";
  if (hour >= 10 && hour < 12) return "lanche_manha";
  if (hour >= 12 && hour < 15) return "almoco";
  if (hour >= 15 && hour < 18) return "lanche_tarde";
  if (hour >= 18 && hour < 21) return "jantar";
  return "ceia";
}

/**
 * Format meal type for display
 */
export function formatMealType(mealType: string): string {
  const types: Record<string, string> = {
    cafe_da_manha: "☕ Café da Manhã",
    lanche_manha: "🍎 Lanche da Manhã",
    almoco: "🍽️ Almoço",
    lanche_tarde: "🥤 Lanche da Tarde",
    jantar: "🌙 Jantar",
    ceia: "🌃 Ceia",
  };
  return types[mealType] || mealType;
}

/**
 * Parse edit command from user text
 */
export function parseEditCommand(
  text: string,
  foods: any[]
): { action: string; index?: number; newFood?: { name: string; grams: number } } | null {
  const lower = text.toLowerCase().trim();

  // Replace pattern: "trocar 1 por banana 100g"
  const replaceMatch = lower.match(/(?:trocar|substituir|mudar)\s+(\d+)\s+(?:por|para)\s+(.+)/i);
  if (replaceMatch) {
    const index = parseInt(replaceMatch[1]) - 1;
    const foodPart = replaceMatch[2].trim();
    const gramsMatch = foodPart.match(/(\d+)\s*g?$/);
    const grams = gramsMatch ? parseInt(gramsMatch[1]) : 100;
    const name = foodPart.replace(/\d+\s*g?$/, "").trim() || foodPart;
    if (index >= 0 && index < foods.length) {
      return { action: "replace", index, newFood: { name, grams } };
    }
  }

  // Remove pattern: "remover 1"
  const removeMatch = lower.match(/(?:remover|tirar|excluir|deletar)\s+(\d+)/i);
  if (removeMatch) {
    const index = parseInt(removeMatch[1]) - 1;
    if (index >= 0 && index < foods.length) {
      return { action: "remove", index };
    }
  }

  // Add pattern: "adicionar banana 100g"
  const addMatch = lower.match(/(?:adicionar|incluir|acrescentar|add)\s+(.+)/i);
  if (addMatch) {
    const foodPart = addMatch[1].trim();
    const gramsMatch = foodPart.match(/(\d+)\s*g?$/);
    const grams = gramsMatch ? parseInt(gramsMatch[1]) : 100;
    const name = foodPart.replace(/\d+\s*g?$/, "").trim() || foodPart;
    return { action: "add", newFood: { name, grams } };
  }

  return null;
}

/**
 * Check if text is a direct confirmation response
 */
export function isDirectConfirmResponse(text: string): boolean {
  const lower = text.toLowerCase().trim();
  return ["1", "sim", "s", "ok", "confirmo", "confirma", "certo", "isso"].includes(lower);
}

/**
 * Check if text is a direct cancel response
 */
export function isDirectCancelResponse(text: string): boolean {
  const lower = text.toLowerCase().trim();
  return ["2", "não", "nao", "n", "cancela", "cancelar", "nope"].includes(lower);
}

/**
 * Check if text is a direct edit response
 */
export function isDirectEditResponse(text: string): boolean {
  const lower = text.toLowerCase().trim();
  return ["3", "editar", "edita", "corrigir", "mudar", "alterar"].includes(lower);
}

/**
 * Check if text is a direct clear response
 */
export function isDirectClearResponse(text: string): boolean {
  const lower = text.toLowerCase().trim();
  return ["4", "finalizar", "limpar", "clear", "descartar"].includes(lower);
}

/**
 * Check if text looks like a confirmation attempt but is ambiguous
 */
export function isAlmostConfirmation(text: string): boolean {
  const lower = text.toLowerCase().trim();
  return ["s", "si", "smi", "n", "na", "e", "ed", "edi", "edt"].includes(lower);
}

/**
 * Check if user wants to finalize/process medical exams - FLEXIBLE patterns
 */
export function isMedicalReady(text: string): boolean {
  const lower = text.toLowerCase().trim();
  
  // Exact keywords
  const exactMatch = ["pronto", "terminei", "finalizar", "fim", "acabou", "done", "ok", "vai", "1", "sim", "s", "yes"];
  if (exactMatch.includes(lower)) return true;
  
  // Flexible patterns for natural language variations
  const patterns = [
    /^finaliz/i,                    // finalizado, finalizei, finaliza
    /^termin/i,                     // terminei, terminado, termina
    /pode\s*(analisar|processar|ver|olhar)/i,
    /^analisa/i,                    // analisa, analise
    /^process/i,                    // processa, processar
    /j[aá]\s*(foi|est[aá]|pode|acabou|terminou|finalizou)/i,  // já foi, já está, já pode
    /pronto\s*(pra|para)/i,
    /manda\s*(ver|bala)/i,
    /^bora$/i,
    /vai\s*l[aá]/i,
    /pode\s*ir/i,
    /t[aá]\s*pronto/i,
    /^acabei$/i,
    /enviei\s*tudo/i,
    /s[oó]\s*isso/i,                // só isso
    /era\s*isso/i,
    /tudo\s*a[ií]/i,                // tudo aí
    /pode\s*come[cç]ar/i,
    /^segue$/i,
    /^manda$/i,
    /^ta\s*bom$/i,
    /^beleza$/i,
  ];
  
  return patterns.some(p => p.test(lower));
}

/**
 * Check if user wants to cancel medical analysis - FLEXIBLE patterns
 */
export function isMedicalCancel(text: string): boolean {
  const lower = text.toLowerCase().trim();
  
  // Exact keywords
  const exactMatch = ["3", "cancelar", "cancela", "nao", "não", "n", "para", "parar"];
  if (exactMatch.includes(lower)) return true;
  
  // Flexible patterns
  const patterns = [
    /^cancel/i,
    /n[aã]o\s*quero/i,
    /deixa\s*(pra|para)\s*l[aá]/i,
    /esquece/i,
    /desist/i,                      // desistir, desisto
    /^para$/i,
    /^parar$/i,
  ];
  
  return patterns.some(p => p.test(lower));
}

/**
 * Check if user wants to add more medical images
 */
export function isMedicalAddMore(text: string): boolean {
  const lower = text.toLowerCase().trim();
  
  const exactMatch = ["2", "mais", "add", "adicionar", "enviar mais", "more"];
  if (exactMatch.includes(lower)) return true;
  
  const patterns = [
    /vou\s*(enviar|mandar)\s*mais/i,
    /tem\s*mais/i,
    /falta/i,
    /espera/i,
    /aguarda/i,
    /mais\s*fotos?/i,
    /outras?\s*fotos?/i,
  ];
  
  return patterns.some(p => p.test(lower));
}

/**
 * Check if user wants to manage/check exam status
 */
export function isMedicalManage(text: string): boolean {
  const lower = text.toLowerCase().trim();
  const patterns = [
    /gerenciar|manage|ver\s*exames?|meus\s*exames?/i,
    /status|situa[cç][aã]o|como\s*(est[aá]|vai)/i,
    /o\s*que\s*tenho|pendente/i,
    /exames?\s*pendentes?/i,
  ];
  return patterns.some(p => p.test(lower));
}

/**
 * Check if user wants to reset/start fresh
 */
export function isMedicalReset(text: string): boolean {
  const lower = text.toLowerCase().trim();
  const patterns = [
    /^(limpar|reset|zerar|limpa\s*tudo|apagar)$/i,
    /come[cç]ar\s*(de\s*novo|novo)|novo\s*exame/i,
  ];
  return patterns.some(p => p.test(lower));
}

/**
 * Check if user wants to resume previous analysis
 */
export function isMedicalResume(text: string): boolean {
  const lower = text.toLowerCase().trim();
  const patterns = [
    /^(retomar|continuar|voltar)$/i,
    /pegar\s*de\s*onde|anterior/i,
    /continuar\s*(análise|analise|exame)/i,
  ];
  return patterns.some(p => p.test(lower));
}

/**
 * Check if user wants to retry stuck analysis
 */
export function isMedicalRetry(text: string): boolean {
  const lower = text.toLowerCase().trim();
  const patterns = [
    /^(retentar|retry|tentar\s*de\s*novo|novamente)$/i,
    /tentar\s*novamente/i,
    /analisar\s*de\s*novo/i,
  ];
  return patterns.some(p => p.test(lower));
}
