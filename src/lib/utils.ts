import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Remove um elemento do DOM de forma segura, verificando se ele ainda é filho do pai
 * antes de tentar removê-lo. Isso previne erros de "removeChild" quando o elemento
 * já foi removido ou não é mais filho do elemento pai.
 */
export function safeRemoveChild(parent: Node, child: Node | null): void {
  if (!child || !parent) return;
  
  try {
    // Verificar se o elemento ainda é filho do pai antes de remover
    if (parent.contains(child)) {
      parent.removeChild(child);
    }
  } catch (error) {
    // Silenciosamente ignorar erros de remoção (elemento já foi removido)
    console.warn('Erro ao remover elemento do DOM (já foi removido):', error);
  }
}
