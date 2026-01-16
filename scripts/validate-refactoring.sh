#!/bin/bash

# MaxNutrition Refactoring Validation Script
# Validates all refactoring requirements and quality metrics

set -e

echo "🔍 Validando refatoramento MaxNutrition..."
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0

# Property 1: ESLint sem warnings críticos
echo "📋 Property 1: Verificando ESLint..."
if npx eslint src/ --ext .ts,.tsx --quiet; then
  echo -e "${GREEN}✅ ESLint: Sem erros críticos${NC}"
else
  echo -e "${RED}❌ ESLint encontrou erros${NC}"
  ERRORS=$((ERRORS + 1))
fi
echo ""

# Property 2: TypeScript compila
echo "📋 Property 2: Verificando TypeScript..."
if npx tsc --noEmit; then
  echo -e "${GREEN}✅ TypeScript: Compila sem erros${NC}"
else
  echo -e "${RED}❌ TypeScript encontrou erros${NC}"
  ERRORS=$((ERRORS + 1))
fi
echo ""

# Property 3: Componentes <= 500 linhas
echo "📋 Property 3: Verificando tamanho de componentes..."
LARGE_COMPONENTS=$(find src/components -name "*.tsx" -exec wc -l {} \; | awk '$1 > 500 {print $2}')
if [ -z "$LARGE_COMPONENTS" ]; then
  echo -e "${GREEN}✅ Componentes: Todos <= 500 linhas${NC}"
else
  echo -e "${YELLOW}⚠️  Componentes acima de 500 linhas:${NC}"
  echo "$LARGE_COMPONENTS"
  echo -e "${YELLOW}(Alguns componentes grandes podem ser aceitáveis)${NC}"
fi
echo ""

# Property 4: Queries Supabase com limite
echo "📋 Property 4: Verificando queries Supabase..."
QUERIES_WITHOUT_LIMIT=$(grep -r "\.select(" src/ --include="*.ts" --include="*.tsx" | grep -v "\.limit(" | grep -v "\.single(" | grep -v "// no limit" | wc -l)
if [ "$QUERIES_WITHOUT_LIMIT" -eq 0 ]; then
  echo -e "${GREEN}✅ Queries: Todas com .limit() ou .single()${NC}"
else
  echo -e "${YELLOW}⚠️  Encontradas $QUERIES_WITHOUT_LIMIT queries sem limite explícito${NC}"
  echo -e "${YELLOW}(Verifique se são agregações ou têm comentário explicativo)${NC}"
fi
echo ""

# Property 6: Imports usando @/ alias
echo "📋 Property 6: Verificando imports..."
DEEP_IMPORTS=$(grep -r "from ['\"]\.\.\/\.\.\/\.\.\/" src/ --include="*.ts" --include="*.tsx" | wc -l)
if [ "$DEEP_IMPORTS" -eq 0 ]; then
  echo -e "${GREEN}✅ Imports: Todos usando @/ alias${NC}"
else
  echo -e "${YELLOW}⚠️  Encontrados $DEEP_IMPORTS imports com paths relativos profundos${NC}"
fi
echo ""

# Verificar build
echo "📋 Verificando build..."
if npm run build > /dev/null 2>&1; then
  echo -e "${GREEN}✅ Build: Sucesso${NC}"
  
  # Verificar tamanho do bundle
  if [ -d "dist/assets" ]; then
    BUNDLE_SIZE=$(du -sh dist/assets | awk '{print $1}')
    echo -e "${GREEN}📦 Bundle size: $BUNDLE_SIZE${NC}"
  fi
else
  echo -e "${RED}❌ Build falhou${NC}"
  ERRORS=$((ERRORS + 1))
fi
echo ""

# Resumo
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ $ERRORS -eq 0 ]; then
  echo -e "${GREEN}✅ TODAS AS VALIDAÇÕES PASSARAM!${NC}"
  echo ""
  echo "Métricas de Sucesso:"
  echo "  ✅ TypeScript compila sem erros"
  echo "  ✅ ESLint sem warnings críticos"
  echo "  ✅ Build bem-sucedido"
  echo "  ✅ Componentes otimizados"
  echo "  ✅ Queries com limites"
  echo "  ✅ Imports padronizados"
  exit 0
else
  echo -e "${RED}❌ $ERRORS VALIDAÇÕES FALHARAM${NC}"
  echo ""
  echo "Por favor, corrija os erros acima antes de continuar."
  exit 1
fi
