#!/bin/bash

# ═══════════════════════════════════════════════════════════════════════════════
# Expansion Ready Refactoring - Validation Script
# ═══════════════════════════════════════════════════════════════════════════════
# 
# Este script valida as 8 propriedades de corretude definidas no design.md:
#   Property 1: Orchestrators não excedem 200 linhas
#   Property 2: Sub-componentes não excedem 300 linhas
#   Property 3: Hooks seguem padrão de nomenclatura
#   Property 4: Pastas refatoradas têm README
#   Property 5: Imports usam @/ alias
#   Property 6: Cores semânticas são usadas
#   Property 7: TypeScript compila sem erros
#   Property 8: ESLint sem warnings críticos
#
# Requirements: 10.7, 10.8
# ═══════════════════════════════════════════════════════════════════════════════

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color
BOLD='\033[1m'

echo ""
echo -e "${BOLD}${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BOLD}${BLUE}  🔍 Validando Refatoração de Expansão - MaxNutrition${NC}"
echo -e "${BOLD}${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""

# Folders to validate
FOLDERS=(
  "src/components/meal-plan/compact-meal-plan"
  "src/components/meal-plan/weekly-meal-plan"
  "src/components/meal-plan/chef-kitchen"
  "src/components/meal-plan/daily-meal-plan"
  "src/components/exercise/unified-timer"
  "src/components/exercise/exercise-challenge"
  "src/components/exercise/exercise-detail"
  "src/components/exercise/saved-program"
  "src/components/exercise/buddy-workout"
)

ERRORS=0
WARNINGS=0
FOLDERS_FOUND=0

# Count existing folders
for folder in "${FOLDERS[@]}"; do
  if [ -d "$folder" ]; then
    FOLDERS_FOUND=$((FOLDERS_FOUND + 1))
  fi
done

echo -e "${CYAN}📁 Pastas encontradas: $FOLDERS_FOUND de ${#FOLDERS[@]}${NC}"
echo ""

# ═══════════════════════════════════════════════════════════════════════════════
# Property 1: Orchestrators não excedem 200 linhas
# Validates: Requirements 1.7, 2.5, 3.5, 4.4, 5.8, 6.6, 7.7, 8.5, 9.5
# ═══════════════════════════════════════════════════════════════════════════════
echo -e "${BOLD}📏 Property 1: Orchestrators não excedem 200 linhas${NC}"
echo -e "   ${CYAN}Validates: Requirements 1.7, 2.5, 3.5, 4.4, 5.8, 6.6, 7.7, 8.5, 9.5${NC}"
echo ""

for folder in "${FOLDERS[@]}"; do
  if [ -f "$folder/index.tsx" ]; then
    lines=$(wc -l < "$folder/index.tsx" | tr -d ' ')
    folder_name=$(basename "$folder")
    if [ "$lines" -gt 200 ]; then
      echo -e "   ${RED}❌ $folder_name/index.tsx: $lines linhas (máximo 200)${NC}"
      ERRORS=$((ERRORS + 1))
    else
      echo -e "   ${GREEN}✅ $folder_name/index.tsx: $lines linhas${NC}"
    fi
  fi
done
echo ""

# ═══════════════════════════════════════════════════════════════════════════════
# Property 2: Sub-componentes não excedem 300 linhas
# Validates: Requirements 10.1
# ═══════════════════════════════════════════════════════════════════════════════
echo -e "${BOLD}📏 Property 2: Sub-componentes não excedem 300 linhas${NC}"
echo -e "   ${CYAN}Validates: Requirements 10.1${NC}"
echo ""

for folder in "${FOLDERS[@]}"; do
  if [ -d "$folder" ]; then
    folder_name=$(basename "$folder")
    for file in "$folder"/*.tsx; do
      if [ -f "$file" ] && [ "$(basename "$file")" != "index.tsx" ]; then
        lines=$(wc -l < "$file" | tr -d ' ')
        filename=$(basename "$file")
        if [ "$lines" -gt 300 ]; then
          echo -e "   ${RED}❌ $folder_name/$filename: $lines linhas (máximo 300)${NC}"
          ERRORS=$((ERRORS + 1))
        else
          echo -e "   ${GREEN}✅ $folder_name/$filename: $lines linhas${NC}"
        fi
      fi
    done
  fi
done
echo ""

# ═══════════════════════════════════════════════════════════════════════════════
# Property 3: Hooks seguem padrão de nomenclatura
# Validates: Requirements 10.2
# ═══════════════════════════════════════════════════════════════════════════════
echo -e "${BOLD}📝 Property 3: Hooks seguem padrão de nomenclatura${NC}"
echo -e "   ${CYAN}Validates: Requirements 10.2${NC}"
echo -e "   ${CYAN}Padrão esperado: use[Feature]Logic.ts ou use[Feature][Aspect].ts${NC}"
echo ""

for folder in "${FOLDERS[@]}"; do
  if [ -d "$folder/hooks" ]; then
    folder_name=$(basename "$folder")
    for file in "$folder/hooks"/*.ts; do
      if [ -f "$file" ]; then
        filename=$(basename "$file")
        # Check if filename starts with 'use' followed by uppercase letter
        if [[ ! "$filename" =~ ^use[A-Z][a-zA-Z]*\.ts$ ]]; then
          echo -e "   ${RED}❌ $folder_name/hooks/$filename: não segue padrão use[Feature].ts${NC}"
          ERRORS=$((ERRORS + 1))
        else
          echo -e "   ${GREEN}✅ $folder_name/hooks/$filename${NC}"
        fi
      fi
    done
  fi
done
echo ""

# ═══════════════════════════════════════════════════════════════════════════════
# Property 4: Pastas refatoradas têm README
# Validates: Requirements 10.3, 11.1
# ═══════════════════════════════════════════════════════════════════════════════
echo -e "${BOLD}📄 Property 4: Pastas refatoradas têm README${NC}"
echo -e "   ${CYAN}Validates: Requirements 10.3, 11.1${NC}"
echo ""

for folder in "${FOLDERS[@]}"; do
  if [ -d "$folder" ]; then
    folder_name=$(basename "$folder")
    if [ ! -f "$folder/README.md" ]; then
      echo -e "   ${RED}❌ $folder_name: README.md não encontrado${NC}"
      ERRORS=$((ERRORS + 1))
    else
      echo -e "   ${GREEN}✅ $folder_name/README.md existe${NC}"
    fi
  fi
done
echo ""

# ═══════════════════════════════════════════════════════════════════════════════
# Property 5: Imports usam @/ alias
# Validates: Requirements 10.4
# ═══════════════════════════════════════════════════════════════════════════════
echo -e "${BOLD}🔗 Property 5: Imports usam @/ alias (sem ../../..)${NC}"
echo -e "   ${CYAN}Validates: Requirements 10.4${NC}"
echo ""

for folder in "${FOLDERS[@]}"; do
  if [ -d "$folder" ]; then
    folder_name=$(basename "$folder")
    # Search for deep relative imports (3+ levels)
    deep_imports=$(grep -r "from ['\"]\.\.\/\.\.\/\.\.\/" "$folder" --include="*.ts" --include="*.tsx" 2>/dev/null | wc -l | tr -d ' ')
    if [ "$deep_imports" -gt 0 ]; then
      echo -e "   ${RED}❌ $folder_name: $deep_imports imports com ../../..${NC}"
      grep -r "from ['\"]\.\.\/\.\.\/\.\.\/" "$folder" --include="*.ts" --include="*.tsx" 2>/dev/null | head -3 | while read line; do
        echo -e "      ${YELLOW}→ $(echo "$line" | cut -d: -f2-)${NC}"
      done
      ERRORS=$((ERRORS + 1))
    else
      echo -e "   ${GREEN}✅ $folder_name: imports OK${NC}"
    fi
  fi
done
echo ""

# ═══════════════════════════════════════════════════════════════════════════════
# Property 6: Cores semânticas são usadas
# Validates: Requirements 10.5
# ═══════════════════════════════════════════════════════════════════════════════
echo -e "${BOLD}🎨 Property 6: Cores semânticas são usadas${NC}"
echo -e "   ${CYAN}Validates: Requirements 10.5${NC}"
echo -e "   ${CYAN}Cores proibidas: bg-white, text-black, bg-[#...], text-[#...]${NC}"
echo ""

for folder in "${FOLDERS[@]}"; do
  if [ -d "$folder" ]; then
    folder_name=$(basename "$folder")
    # Search for hardcoded colors
    hardcoded=$(grep -rE "(bg-white|text-black|bg-\[#[0-9a-fA-F]+\]|text-\[#[0-9a-fA-F]+\])" "$folder" --include="*.tsx" 2>/dev/null | wc -l | tr -d ' ')
    if [ "$hardcoded" -gt 0 ]; then
      echo -e "   ${YELLOW}⚠️  $folder_name: $hardcoded cores hardcoded encontradas${NC}"
      grep -rE "(bg-white|text-black|bg-\[#[0-9a-fA-F]+\]|text-\[#[0-9a-fA-F]+\])" "$folder" --include="*.tsx" 2>/dev/null | head -3 | while read line; do
        echo -e "      ${YELLOW}→ $(basename "$(echo "$line" | cut -d: -f1)"): $(echo "$line" | cut -d: -f2- | head -c 80)...${NC}"
      done
      WARNINGS=$((WARNINGS + 1))
    else
      echo -e "   ${GREEN}✅ $folder_name: cores semânticas OK${NC}"
    fi
  fi
done
echo ""

# ═══════════════════════════════════════════════════════════════════════════════
# Property 7: TypeScript compila sem erros
# Validates: Requirements 10.7
# ═══════════════════════════════════════════════════════════════════════════════
echo -e "${BOLD}🔧 Property 7: TypeScript compila sem erros${NC}"
echo -e "   ${CYAN}Validates: Requirements 10.7${NC}"
echo ""

# Run TypeScript compiler in noEmit mode
TSC_OUTPUT=$(npx tsc --noEmit 2>&1)
TSC_EXIT_CODE=$?

if [ $TSC_EXIT_CODE -ne 0 ]; then
  echo -e "   ${RED}❌ TypeScript encontrou erros de compilação${NC}"
  echo ""
  # Show first 10 errors
  echo "$TSC_OUTPUT" | head -20 | while read line; do
    echo -e "      ${YELLOW}$line${NC}"
  done
  ERRORS=$((ERRORS + 1))
else
  echo -e "   ${GREEN}✅ TypeScript compila sem erros${NC}"
fi
echo ""

# ═══════════════════════════════════════════════════════════════════════════════
# Property 8: ESLint sem warnings críticos
# Validates: Requirements 10.8
# ═══════════════════════════════════════════════════════════════════════════════
echo -e "${BOLD}📋 Property 8: ESLint sem warnings críticos${NC}"
echo -e "   ${CYAN}Validates: Requirements 10.8${NC}"
echo -e "   ${CYAN}Regras críticas: react-hooks/exhaustive-deps, no-empty, prefer-const${NC}"
echo ""

ESLINT_ERRORS=0
for folder in "${FOLDERS[@]}"; do
  if [ -d "$folder" ]; then
    folder_name=$(basename "$folder")
    # Run ESLint with quiet mode (only errors, not warnings)
    ESLINT_OUTPUT=$(npx eslint "$folder" --ext .ts,.tsx --quiet 2>&1)
    ESLINT_EXIT_CODE=$?
    
    if [ $ESLINT_EXIT_CODE -ne 0 ]; then
      echo -e "   ${RED}❌ $folder_name: ESLint encontrou erros${NC}"
      echo "$ESLINT_OUTPUT" | head -5 | while read line; do
        echo -e "      ${YELLOW}$line${NC}"
      done
      ESLINT_ERRORS=$((ESLINT_ERRORS + 1))
    else
      echo -e "   ${GREEN}✅ $folder_name: ESLint OK${NC}"
    fi
  fi
done

if [ $ESLINT_ERRORS -gt 0 ]; then
  ERRORS=$((ERRORS + 1))
fi
echo ""

# ═══════════════════════════════════════════════════════════════════════════════
# Summary
# ═══════════════════════════════════════════════════════════════════════════════
echo -e "${BOLD}${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BOLD}${BLUE}  📊 RESUMO DA VALIDAÇÃO${NC}"
echo -e "${BOLD}${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""

echo -e "   📁 Pastas validadas: $FOLDERS_FOUND de ${#FOLDERS[@]}"
echo -e "   ❌ Erros encontrados: $ERRORS"
echo -e "   ⚠️  Warnings: $WARNINGS"
echo ""

if [ $ERRORS -eq 0 ]; then
  echo -e "${BOLD}${GREEN}   ✅ TODAS AS VALIDAÇÕES PASSARAM!${NC}"
  echo ""
  echo -e "   ${GREEN}Propriedades validadas:${NC}"
  echo -e "   ${GREEN}  ✓ Property 1: Orchestrators ≤ 200 linhas${NC}"
  echo -e "   ${GREEN}  ✓ Property 2: Sub-componentes ≤ 300 linhas${NC}"
  echo -e "   ${GREEN}  ✓ Property 3: Hooks seguem nomenclatura${NC}"
  echo -e "   ${GREEN}  ✓ Property 4: READMEs existem${NC}"
  echo -e "   ${GREEN}  ✓ Property 5: Imports usam @/ alias${NC}"
  echo -e "   ${GREEN}  ✓ Property 6: Cores semânticas${NC}"
  echo -e "   ${GREEN}  ✓ Property 7: TypeScript compila${NC}"
  echo -e "   ${GREEN}  ✓ Property 8: ESLint sem erros críticos${NC}"
  echo ""
  exit 0
else
  echo -e "${BOLD}${RED}   ❌ VALIDAÇÃO FALHOU COM $ERRORS ERRO(S)${NC}"
  echo ""
  echo -e "   ${YELLOW}Por favor, corrija os erros acima antes de continuar.${NC}"
  echo ""
  exit 1
fi
