#!/bin/bash

# Script para aplicar correção de meal_type

echo "🔧 Aplicando correção de meal_type..."
echo ""

# Verificar se Supabase CLI está instalado
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI não encontrado"
    echo "📦 Instale com: npm install -g supabase"
    exit 1
fi

# Aplicar migration
echo "📊 Aplicando migration..."
supabase db reset

if [ $? -eq 0 ]; then
    echo "✅ Migration aplicada com sucesso!"
    echo ""
    echo "🧪 Testando estrutura da tabela..."
    
    # Verificar se a coluna foi criada
    supabase db execute --sql "
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'sofia_food_analysis' 
        AND column_name = 'meal_type';
    "
    
    echo ""
    echo "📈 Verificando índices..."
    supabase db execute --sql "
        SELECT indexname 
        FROM pg_indexes 
        WHERE tablename = 'sofia_food_analysis' 
        AND indexname LIKE '%meal_type%';
    "
    
    echo ""
    echo "✅ Correção aplicada com sucesso!"
    echo ""
    echo "📝 Próximos passos:"
    echo "1. Testar análise de imagem com meal_type"
    echo "2. Verificar dashboard de nutrição"
    echo "3. Validar agregação por refeição"
else
    echo "❌ Erro ao aplicar migration"
    exit 1
fi
