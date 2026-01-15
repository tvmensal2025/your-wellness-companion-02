#!/bin/bash

# 🔧 Comandos Úteis para Análise de Armazenamento - MaxNutrition

echo "🔍 MaxNutrition - Storage Analysis Commands"
echo "==========================================="
echo ""

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para executar análise completa
analyze_storage() {
    echo -e "${GREEN}📊 Executando análise completa de armazenamento...${NC}"
    python3 scripts/analyze-storage.py
}

# Função para verificar tamanho do banco
check_database_size() {
    echo -e "${BLUE}🗄️  Verificando tamanho do banco de dados...${NC}"
    echo "Conecte-se ao Supabase e execute:"
    echo ""
    echo "SELECT"
    echo "  schemaname,"
    echo "  tablename,"
    echo "  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size"
    echo "FROM pg_tables"
    echo "WHERE schemaname = 'public'"
    echo "ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC"
    echo "LIMIT 20;"
}

# Função para verificar storage buckets
check_storage_buckets() {
    echo -e "${BLUE}☁️  Verificando buckets de storage...${NC}"
    echo "Conecte-se ao Supabase e execute:"
    echo ""
    echo "SELECT"
    echo "  id,"
    echo "  name,"
    echo "  public,"
    echo "  created_at"
    echo "FROM storage.buckets;"
}

# Função para contar arquivos em buckets
count_storage_files() {
    echo -e "${BLUE}📦 Contando arquivos em buckets...${NC}"
    echo "Conecte-se ao Supabase e execute:"
    echo ""
    echo "SELECT"
    echo "  bucket_id,"
    echo "  COUNT(*) as file_count,"
    echo "  pg_size_pretty(SUM(metadata->>'size')::bigint) as total_size"
    echo "FROM storage.objects"
    echo "GROUP BY bucket_id;"
}

# Função para verificar localStorage
check_localstorage() {
    echo -e "${YELLOW}💾 Para verificar localStorage, abra o DevTools do navegador:${NC}"
    echo ""
    echo "1. Abra o app no navegador"
    echo "2. Pressione F12 (DevTools)"
    echo "3. Vá para Application > Local Storage"
    echo "4. Selecione o domínio do app"
    echo ""
    echo "Keys esperadas:"
    echo "  - daily_chest_claimed"
    echo "  - emailConfig"
    echo "  - hasSeenWelcomeModal"
    echo "  - maxnutrition_selected_character"
    echo "  - n8nConfig"
    echo "  - sofia_insights_last_generated"
    echo "  - user_goals"
    echo "  - voice_config"
}

# Função para verificar PWA cache
check_pwa_cache() {
    echo -e "${YELLOW}📦 Para verificar PWA Cache, abra o DevTools do navegador:${NC}"
    echo ""
    echo "1. Abra o app no navegador"
    echo "2. Pressione F12 (DevTools)"
    echo "3. Vá para Application > Cache Storage"
    echo ""
    echo "Caches esperados:"
    echo "  - supabase-cache (24h)"
    echo "  - images-cache (30d)"
    echo "  - fonts-cache (365d)"
}

# Função para listar Edge Functions
list_edge_functions() {
    echo -e "${GREEN}⚡ Listando Edge Functions...${NC}"
    if [ -d "supabase/functions" ]; then
        echo ""
        echo "Edge Functions encontradas:"
        ls -1 supabase/functions/ | grep -v "^_" | nl
        echo ""
        echo "Total: $(ls -1 supabase/functions/ | grep -v "^_" | wc -l) functions"
    else
        echo "❌ Diretório supabase/functions não encontrado"
    fi
}

# Função para verificar tabelas no código
find_table_usage() {
    if [ -z "$1" ]; then
        echo -e "${YELLOW}⚠️  Uso: find_table_usage <nome_da_tabela>${NC}"
        return 1
    fi
    
    echo -e "${GREEN}🔍 Procurando uso da tabela '$1' no código...${NC}"
    echo ""
    grep -r "from('$1')" src/ --include="*.ts" --include="*.tsx" | head -20
    echo ""
    echo "Para ver todos os resultados, execute:"
    echo "grep -r \"from('$1')\" src/ --include=\"*.ts\" --include=\"*.tsx\""
}

# Função para verificar uso de storage no código
find_storage_usage() {
    echo -e "${GREEN}🔍 Procurando uso de Storage no código...${NC}"
    echo ""
    echo "Uploads encontrados:"
    grep -r "storage.from" src/ --include="*.ts" --include="*.tsx" | wc -l
    echo ""
    echo "Arquivos que fazem upload:"
    grep -r "storage.from" src/ --include="*.ts" --include="*.tsx" -l
}

# Função para gerar relatório de uso
generate_usage_report() {
    echo -e "${GREEN}📊 Gerando relatório de uso...${NC}"
    echo ""
    
    echo "=== RESUMO DE USO ==="
    echo ""
    
    echo "📁 Estrutura de Pastas:"
    echo "  src/: $(find src -type f | wc -l) arquivos"
    echo "  supabase/functions/: $(find supabase/functions -type f -name "*.ts" | wc -l) arquivos"
    echo "  supabase/migrations/: $(find supabase/migrations -type f -name "*.sql" | wc -l) arquivos"
    echo ""
    
    echo "🔍 Uso de Supabase no código:"
    echo "  Queries (.from): $(grep -r "\.from(" src/ --include="*.ts" --include="*.tsx" | wc -l)"
    echo "  Storage uploads: $(grep -r "storage\.from" src/ --include="*.ts" --include="*.tsx" | wc -l)"
    echo "  RPC calls: $(grep -r "\.rpc(" src/ --include="*.ts" --include="*.tsx" | wc -l)"
    echo ""
    
    echo "💾 localStorage:"
    echo "  setItem: $(grep -r "localStorage\.setItem" src/ --include="*.ts" --include="*.tsx" | wc -l)"
    echo "  getItem: $(grep -r "localStorage\.getItem" src/ --include="*.ts" --include="*.tsx" | wc -l)"
    echo ""
}

# Função para limpar cache local
clean_local_cache() {
    echo -e "${YELLOW}🧹 Limpando cache local...${NC}"
    echo ""
    echo "Para limpar o cache, execute no navegador:"
    echo ""
    echo "localStorage.clear();"
    echo "sessionStorage.clear();"
    echo ""
    echo "Ou use DevTools:"
    echo "1. F12 > Application > Clear Storage"
    echo "2. Marque todas as opções"
    echo "3. Clique em 'Clear site data'"
}

# Função para verificar migrations
check_migrations() {
    echo -e "${GREEN}📜 Verificando migrations...${NC}"
    echo ""
    if [ -d "supabase/migrations" ]; then
        echo "Migrations encontradas:"
        ls -lh supabase/migrations/*.sql | awk '{print $9, "(" $5 ")"}'
        echo ""
        echo "Total: $(ls -1 supabase/migrations/*.sql | wc -l) migrations"
    else
        echo "❌ Diretório supabase/migrations não encontrado"
    fi
}

# Função para verificar Docker volumes
check_docker_volumes() {
    echo -e "${BLUE}🐳 Verificando Docker volumes...${NC}"
    echo ""
    if command -v docker &> /dev/null; then
        echo "Volumes Docker:"
        docker volume ls | grep -E "institutodossonhos|maxnutrition|supabase|yolo"
        echo ""
        echo "Para ver detalhes de um volume:"
        echo "docker volume inspect <volume_name>"
    else
        echo "❌ Docker não está instalado ou não está rodando"
    fi
}

# Função para backup manual
manual_backup() {
    echo -e "${GREEN}💾 Instruções para backup manual...${NC}"
    echo ""
    echo "1. Backup do banco de dados:"
    echo "   npx supabase db dump -f backup.sql"
    echo ""
    echo "2. Backup de storage buckets:"
    echo "   Use o Supabase Dashboard > Storage > Download"
    echo ""
    echo "3. Backup de configurações:"
    echo "   cp .env .env.backup"
    echo "   cp supabase/config.toml supabase/config.toml.backup"
}

# Menu principal
show_menu() {
    echo ""
    echo "Escolha uma opção:"
    echo ""
    echo "  1) Análise completa de armazenamento"
    echo "  2) Verificar tamanho do banco"
    echo "  3) Verificar storage buckets"
    echo "  4) Contar arquivos em buckets"
    echo "  5) Verificar localStorage"
    echo "  6) Verificar PWA cache"
    echo "  7) Listar Edge Functions"
    echo "  8) Procurar uso de tabela"
    echo "  9) Procurar uso de storage"
    echo " 10) Gerar relatório de uso"
    echo " 11) Limpar cache local"
    echo " 12) Verificar migrations"
    echo " 13) Verificar Docker volumes"
    echo " 14) Instruções de backup"
    echo "  0) Sair"
    echo ""
    read -p "Opção: " option
    
    case $option in
        1) analyze_storage ;;
        2) check_database_size ;;
        3) check_storage_buckets ;;
        4) count_storage_files ;;
        5) check_localstorage ;;
        6) check_pwa_cache ;;
        7) list_edge_functions ;;
        8) read -p "Nome da tabela: " table; find_table_usage "$table" ;;
        9) find_storage_usage ;;
        10) generate_usage_report ;;
        11) clean_local_cache ;;
        12) check_migrations ;;
        13) check_docker_volumes ;;
        14) manual_backup ;;
        0) echo "👋 Até logo!"; exit 0 ;;
        *) echo "❌ Opção inválida" ;;
    esac
    
    echo ""
    read -p "Pressione ENTER para continuar..."
    show_menu
}

# Se executado sem argumentos, mostra o menu
if [ $# -eq 0 ]; then
    show_menu
else
    # Se executado com argumentos, executa a função correspondente
    case $1 in
        analyze) analyze_storage ;;
        database) check_database_size ;;
        buckets) check_storage_buckets ;;
        count) count_storage_files ;;
        local) check_localstorage ;;
        pwa) check_pwa_cache ;;
        functions) list_edge_functions ;;
        table) find_table_usage "$2" ;;
        storage) find_storage_usage ;;
        report) generate_usage_report ;;
        clean) clean_local_cache ;;
        migrations) check_migrations ;;
        docker) check_docker_volumes ;;
        backup) manual_backup ;;
        *) echo "❌ Comando inválido. Execute sem argumentos para ver o menu." ;;
    esac
fi
