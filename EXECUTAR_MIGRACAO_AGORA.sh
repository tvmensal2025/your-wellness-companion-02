#!/bin/bash

# =====================================================
# SCRIPT DE EXECUÇÃO - Migração de Metas Gamificadas
# =====================================================

echo "🎯 Sistema de Metas Gamificado - Execução da Migração"
echo "======================================================"
echo ""

# Verificar se Supabase CLI está instalado
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI não encontrado"
    echo ""
    echo "📋 OPÇÃO 1: Instalar Supabase CLI"
    echo "   macOS: brew install supabase/tap/supabase"
    echo "   Linux: https://supabase.com/docs/guides/cli"
    echo ""
    echo "📋 OPÇÃO 2: Executar via Dashboard (RECOMENDADO)"
    echo ""
    echo "   1. Acesse: https://supabase.com/dashboard"
    echo "   2. Selecione seu projeto"
    echo "   3. SQL Editor → New Query"
    echo "   4. Copie o conteúdo de:"
    echo "      supabase/migrations/20260112400000_add_goals_gamification_safe.sql"
    echo "   5. Cole no editor e clique em 'Run'"
    echo ""
    echo "📖 Guia completo: GUIA_VISUAL_SUPABASE.md"
    echo ""
    exit 1
fi

echo "✅ Supabase CLI encontrado"
echo ""

# Verificar se está em um projeto Supabase
if [ ! -f "supabase/config.toml" ]; then
    echo "❌ Não está em um projeto Supabase"
    echo "   Execute 'supabase init' primeiro"
    exit 1
fi

echo "✅ Projeto Supabase detectado"
echo ""

# Verificar se está logado
if ! supabase projects list &> /dev/null; then
    echo "❌ Não está logado no Supabase"
    echo "   Execute 'supabase login' primeiro"
    exit 1
fi

echo "✅ Autenticado no Supabase"
echo ""

# Mostrar migração que será executada
echo "📄 Migração a ser executada:"
echo "   supabase/migrations/20260112400000_add_goals_gamification_safe.sql"
echo ""

# Confirmar execução
read -p "🚀 Deseja executar a migração? (s/N): " confirm
if [[ ! $confirm =~ ^[Ss]$ ]]; then
    echo "❌ Execução cancelada"
    exit 0
fi

echo ""
echo "🚀 Executando migração..."
echo ""

# Executar migração
if supabase db push; then
    echo ""
    echo "✅ Migração executada com sucesso!"
    echo ""
    echo "📊 Validando..."
    echo ""
    
    # Query de validação
    supabase db query "
    SELECT 
      (SELECT COUNT(*) FROM information_schema.tables 
       WHERE table_name IN ('goal_achievements', 'goal_streaks', 'user_goal_levels')) as tabelas,
      (SELECT COUNT(*) FROM information_schema.columns 
       WHERE table_name = 'user_goals' 
       AND column_name IN ('streak_days', 'xp_earned', 'level')) as campos,
      (SELECT COUNT(*) FROM information_schema.routines 
       WHERE routine_name IN ('update_goal_streak', 'process_level_up')) as funcoes;
    "
    
    echo ""
    echo "✅ Validação concluída!"
    echo ""
    echo "📋 Próximos passos:"
    echo "   1. Verificar logs do Supabase"
    echo "   2. Integrar componentes React"
    echo "   3. Testar em staging"
    echo ""
    echo "📖 Documentação completa: RESUMO_IMPLEMENTACAO_METAS.md"
    echo ""
else
    echo ""
    echo "❌ Erro ao executar migração"
    echo ""
    echo "🆘 Troubleshooting:"
    echo "   1. Verifique os logs acima"
    echo "   2. Consulte: GUIA_VISUAL_SUPABASE.md"
    echo "   3. Execute via Dashboard (mais seguro)"
    echo ""
    exit 1
fi
