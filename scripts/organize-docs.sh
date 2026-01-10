#!/bin/bash
# Script para organizar arquivos de documentação
# Move arquivos .md da raiz para /docs mantendo estrutura

echo "🗂️ Organizando documentação..."

# Criar pasta docs se não existir
mkdir -p docs/analises
mkdir -p docs/correcoes
mkdir -p docs/guias
mkdir -p docs/sql
mkdir -p docs/implementacoes
mkdir -p docs/resumos

# Mover arquivos por categoria (baseado no prefixo)
echo "📁 Movendo análises..."
mv ANALISE_*.md docs/analises/ 2>/dev/null || true
mv ANALISES_*.md docs/analises/ 2>/dev/null || true

echo "📁 Movendo correções..."
mv CORRECAO_*.md docs/correcoes/ 2>/dev/null || true
mv CORRECOES_*.md docs/correcoes/ 2>/dev/null || true
mv CORRIGIR_*.md docs/correcoes/ 2>/dev/null || true

echo "📁 Movendo guias..."
mv GUIA_*.md docs/guias/ 2>/dev/null || true
mv COMO_*.md docs/guias/ 2>/dev/null || true
mv INSTRUCOES_*.md docs/guias/ 2>/dev/null || true
mv CONFIGURACAO_*.md docs/guias/ 2>/dev/null || true
mv CONFIGURAR_*.md docs/guias/ 2>/dev/null || true

echo "📁 Movendo implementações..."
mv IMPLEMENTACAO_*.md docs/implementacoes/ 2>/dev/null || true
mv SISTEMA_*.md docs/implementacoes/ 2>/dev/null || true
mv INTEGRACAO_*.md docs/implementacoes/ 2>/dev/null || true

echo "📁 Movendo resumos..."
mv RESUMO_*.md docs/resumos/ 2>/dev/null || true
mv RELATORIO_*.md docs/resumos/ 2>/dev/null || true
mv STATUS_*.md docs/resumos/ 2>/dev/null || true

echo "📁 Movendo SQLs de documentação..."
mv SOLUCAO_*.md docs/sql/ 2>/dev/null || true

# Contar arquivos restantes
REMAINING=$(find . -maxdepth 1 -name "*.md" -type f | wc -l)
echo ""
echo "✅ Organização concluída!"
echo "📊 Arquivos .md restantes na raiz: $REMAINING"
echo ""
echo "💡 Arquivos importantes mantidos na raiz:"
echo "   - README.md"
echo "   - CHANGELOG*.md"
echo ""
echo "🗑️ Para limpar arquivos SQL de correção na raiz, execute:"
echo "   mkdir -p docs/sql-scripts && mv *.sql docs/sql-scripts/"
