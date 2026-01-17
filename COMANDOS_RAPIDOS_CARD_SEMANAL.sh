#!/bin/bash

# ============================================
# COMANDOS RÁPIDOS - Card Semanal
# ============================================
# Descrição: Script com todos os comandos necessários
# Uso: Copiar e colar os comandos conforme necessário
# ============================================

echo "🚀 CARD SEMANAL - COMANDOS RÁPIDOS"
echo "=================================="
echo ""

# ============================================
# 1. APLICAR MIGRATION
# ============================================
echo "📦 PASSO 1: Aplicar Migration"
echo "----------------------------"
echo "Comando:"
echo "  supabase db push"
echo ""
echo "Resultado esperado:"
echo "  ✓ Applying migration 20260117150000_create_shopping_lists.sql"
echo "  ✓ Migration applied successfully"
echo ""
read -p "Pressione ENTER para continuar..."

# ============================================
# 2. DESCOBRIR USER ID
# ============================================
echo ""
echo "🔍 PASSO 2: Descobrir seu User ID"
echo "--------------------------------"
echo "1. Abrir Supabase Dashboard"
echo "2. Ir para SQL Editor"
echo "3. Executar:"
echo ""
echo "SELECT id, email FROM auth.users WHERE email = 'seu@email.com';"
echo ""
echo "4. Copiar o 'id' retornado"
echo ""
read -p "Pressione ENTER para continuar..."

# ============================================
# 3. CRIAR DADOS DE TESTE
# ============================================
echo ""
echo "🧪 PASSO 3: Criar Dados de Teste"
echo "-------------------------------"
echo "1. Abrir arquivo: scripts/test-mealie-integration.sql"
echo "2. Substituir TODAS as ocorrências de 'USER_ID_AQUI' pelo seu ID"
echo "3. Executar no SQL Editor do Supabase"
echo ""
echo "Dica: Use Ctrl+H (Find & Replace) para substituir rapidamente"
echo ""
read -p "Pressione ENTER para continuar..."

# ============================================
# 4. INICIAR APP
# ============================================
echo ""
echo "🖥️  PASSO 4: Iniciar App Localmente"
echo "----------------------------------"
echo "Comando:"
echo "  npm run dev"
echo ""
echo "Acesse: http://localhost:5173"
echo ""
read -p "Pressione ENTER para continuar..."

# ============================================
# 5. TESTAR FUNCIONALIDADES
# ============================================
echo ""
echo "✅ PASSO 5: Testar Funcionalidades"
echo "---------------------------------"
echo "1. Fazer login no app"
echo "2. Ir para Dashboard Nutricional (aba Sofia)"
echo "3. Verificar se card 'Seu Cardápio da Semana' aparece"
echo "4. Clicar em um dia (ex: Segunda)"
echo "5. Verificar popup com detalhes"
echo "6. Clicar em 'Gerar Lista de Compras'"
echo "7. Verificar WhatsApp"
echo ""
read -p "Pressione ENTER para continuar..."

# ============================================
# 6. VERIFICAR BANCO DE DADOS
# ============================================
echo ""
echo "🗄️  PASSO 6: Verificar Banco de Dados"
echo "------------------------------------"
echo "Comandos SQL úteis:"
echo ""
echo "# Ver refeições da semana atual"
echo "SELECT DATE(created_at) as dia, meal_type, total_calories"
echo "FROM sofia_food_analysis"
echo "WHERE user_id = 'SEU_USER_ID'"
echo "  AND created_at >= date_trunc('week', CURRENT_DATE)"
echo "ORDER BY created_at;"
echo ""
echo "# Ver listas de compras criadas"
echo "SELECT id, week_start, week_end, sent_to_whatsapp, created_at"
echo "FROM shopping_lists"
echo "WHERE user_id = 'SEU_USER_ID'"
echo "ORDER BY created_at DESC;"
echo ""
read -p "Pressione ENTER para continuar..."

# ============================================
# 7. DEPLOY PARA PRODUÇÃO
# ============================================
echo ""
echo "🚀 PASSO 7: Deploy para Produção"
echo "-------------------------------"
echo "Comandos:"
echo ""
echo "# 1. Commit das mudanças"
echo "git add ."
echo "git commit -m 'feat: Card semanal interativo com lista de compras'"
echo ""
echo "# 2. Push para repositório"
echo "git push origin main"
echo ""
echo "# 3. Aplicar migration em produção"
echo "# Via Supabase Dashboard → SQL Editor"
echo "# Copiar e executar: supabase/migrations/20260117150000_create_shopping_lists.sql"
echo ""
echo "# 4. Deploy do frontend"
echo "# (Depende da sua plataforma: Vercel, Netlify, etc)"
echo ""
read -p "Pressione ENTER para continuar..."

# ============================================
# 8. TROUBLESHOOTING
# ============================================
echo ""
echo "🐛 TROUBLESHOOTING"
echo "-----------------"
echo ""
echo "Problema: Card não aparece"
echo "Solução:"
echo "  1. Verificar console do navegador (F12)"
echo "  2. Verificar se migration foi aplicada: supabase db push"
echo "  3. Verificar se componente foi importado"
echo ""
echo "Problema: Popup não abre"
echo "Solução:"
echo "  1. Verificar se há refeições no banco"
echo "  2. Executar script de teste SQL"
echo "  3. Verificar console para erros"
echo ""
echo "Problema: Lista não é enviada"
echo "Solução:"
echo "  1. Verificar telefone cadastrado:"
echo "     SELECT phone FROM profiles WHERE id = 'SEU_USER_ID';"
echo "  2. Cadastrar telefone se necessário:"
echo "     UPDATE profiles SET phone = '5511999999999' WHERE id = 'SEU_USER_ID';"
echo ""
echo "Problema: Dados não aparecem"
echo "Solução:"
echo "  1. Verificar se há refeições:"
echo "     SELECT * FROM sofia_food_analysis WHERE user_id = 'SEU_USER_ID' LIMIT 10;"
echo "  2. Se vazio, executar script de teste"
echo ""
read -p "Pressione ENTER para continuar..."

# ============================================
# 9. DOCUMENTAÇÃO
# ============================================
echo ""
echo "📚 DOCUMENTAÇÃO COMPLETA"
echo "----------------------"
echo ""
echo "Arquivos criados:"
echo "  - PROXIMOS_PASSOS_CARD_SEMANAL.md (este guia)"
echo "  - ANTES_DEPOIS_CARD_SEMANAL.md (comparação visual)"
echo "  - RESUMO_FINAL_CARD_SEMANAL.md (resumo executivo)"
echo "  - TESTE_CARD_SEMANAL.md (guia de testes)"
echo "  - MEALIE_IMPLEMENTACAO_COMPLETA.md (detalhes técnicos)"
echo "  - MEALIE_DEPLOY_INSTRUCTIONS.md (instruções de deploy)"
echo "  - SUBSTITUICAO_CARD_SEMANAL.md (detalhes da substituição)"
echo "  - EXPLICACAO_MEALIE_DETALHADA.md (explicação completa)"
echo ""
echo "Código criado:"
echo "  - src/types/mealie.ts"
echo "  - src/hooks/mealie/useWeeklyPlan.ts"
echo "  - src/hooks/mealie/useDayMeals.ts"
echo "  - src/hooks/mealie/useShoppingList.ts"
echo "  - src/components/mealie/WeeklyPlanCard.tsx"
echo "  - src/components/mealie/DayDetailModal.tsx"
echo "  - supabase/migrations/20260117150000_create_shopping_lists.sql"
echo "  - scripts/test-mealie-integration.sql"
echo ""
echo "Código modificado:"
echo "  - src/components/sofia/SofiaNutricionalRedesigned.tsx"
echo ""
read -p "Pressione ENTER para continuar..."

# ============================================
# 10. CHECKLIST FINAL
# ============================================
echo ""
echo "✅ CHECKLIST FINAL"
echo "-----------------"
echo ""
echo "Antes de considerar completo, verifique:"
echo ""
echo "[ ] Migration aplicada (supabase db push)"
echo "[ ] Dados de teste criados (SQL executado)"
echo "[ ] App rodando localmente (npm run dev)"
echo "[ ] Card aparece no dashboard"
echo "[ ] Clique no dia abre popup"
echo "[ ] Popup mostra detalhes corretos"
echo "[ ] Lista de compras é gerada"
echo "[ ] Mensagem chega no WhatsApp"
echo "[ ] Sem erros no console"
echo "[ ] Funciona em mobile"
echo "[ ] Deploy para produção"
echo ""
read -p "Pressione ENTER para finalizar..."

# ============================================
# FIM
# ============================================
echo ""
echo "🎉 IMPLEMENTAÇÃO COMPLETA!"
echo "========================="
echo ""
echo "Próxima ação: Executar 'supabase db push'"
echo ""
echo "Boa sorte! 🚀"
echo ""

# ============================================
# COMANDOS ÚTEIS ADICIONAIS
# ============================================

# Ver logs do Supabase
# supabase logs

# Resetar banco de dados local (CUIDADO!)
# supabase db reset

# Ver status do Supabase
# supabase status

# Parar Supabase local
# supabase stop

# Iniciar Supabase local
# supabase start

# Ver migrations aplicadas
# supabase migration list

# Criar nova migration
# supabase migration new nome_da_migration

# Ver diferenças entre local e remoto
# supabase db diff

# Fazer backup do banco
# supabase db dump -f backup.sql

# Restaurar backup
# supabase db reset
# psql -h localhost -p 54322 -U postgres -d postgres -f backup.sql
