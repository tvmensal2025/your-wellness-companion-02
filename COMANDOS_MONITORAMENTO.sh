#!/bin/bash

# =====================================================
# 📊 COMANDOS RÁPIDOS - SISTEMA DE MONITORAMENTO
# =====================================================
# Criado: 2026-01-17
# Uso: bash COMANDOS_MONITORAMENTO.sh [comando]
# =====================================================

set -e

# Cores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# =====================================================
# FUNÇÕES
# =====================================================

print_header() {
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# =====================================================
# 1. APLICAR MIGRATION
# =====================================================

apply_migration() {
    print_header "Aplicando Migration do Sistema de Monitoramento"
    
    print_info "Verificando se Supabase CLI está instalado..."
    if ! command -v supabase &> /dev/null; then
        print_error "Supabase CLI não encontrado!"
        print_info "Instale com: npm install -g supabase"
        exit 1
    fi
    
    print_success "Supabase CLI encontrado"
    
    print_info "Aplicando migration..."
    npx supabase db push
    
    print_success "Migration aplicada com sucesso!"
    print_info "Tabelas criadas: performance_metrics, service_health_checks, critical_errors"
}

# =====================================================
# 2. VERIFICAR INSTALAÇÃO
# =====================================================

verify_installation() {
    print_header "Verificando Instalação"
    
    print_info "Verificando tabelas no banco..."
    
    # Nota: Requer psql ou acesso ao Supabase SQL Editor
    print_warning "Execute no Supabase SQL Editor:"
    echo ""
    echo "SELECT table_name FROM information_schema.tables"
    echo "WHERE table_schema = 'public'"
    echo "AND table_name IN ('performance_metrics', 'service_health_checks', 'critical_errors');"
    echo ""
    print_info "Deve retornar 3 linhas"
}

# =====================================================
# 3. INSERIR DADOS DE TESTE
# =====================================================

insert_test_data() {
    print_header "Inserindo Dados de Teste"
    
    print_warning "Execute no Supabase SQL Editor:"
    echo ""
    cat << 'EOF'
-- Inserir métricas de teste
INSERT INTO performance_metrics (feature, action, duration_ms, success, metadata) VALUES
  ('sofia', 'analyze_food', 1500, true, '{"foods_detected": 3, "calories": 450}'::jsonb),
  ('sofia', 'analyze_food', 1200, true, '{"foods_detected": 2, "calories": 320}'::jsonb),
  ('camera_workout', 'workout_session', 30000, true, '{"exercise": "squat", "reps": 15, "score": 85}'::jsonb),
  ('camera_workout', 'pose_detection', 80, true, '{"keypoints_detected": 17, "confidence": 0.92}'::jsonb),
  ('yolo', 'detect_objects', 120, true, '{"objects_detected": 5, "confidence": 0.85}'::jsonb);

-- Inserir health checks
INSERT INTO service_health_checks (service_name, status, response_time_ms) VALUES
  ('yolo', 'healthy', 120),
  ('supabase', 'healthy', 50),
  ('gemini', 'healthy', 800);

-- Inserir erro de teste
INSERT INTO critical_errors (feature, error_type, error_message, resolved) VALUES
  ('sofia', 'NetworkError', 'Failed to connect to YOLO service', false);

-- Verificar
SELECT 'Métricas inseridas:' as info, COUNT(*) as count FROM performance_metrics
UNION ALL
SELECT 'Health checks inseridos:', COUNT(*) FROM service_health_checks
UNION ALL
SELECT 'Erros inseridos:', COUNT(*) FROM critical_errors;
EOF
    echo ""
    print_success "Copie e cole o SQL acima no Supabase SQL Editor"
}

# =====================================================
# 4. VER MÉTRICAS
# =====================================================

view_metrics() {
    print_header "Visualizar Métricas"
    
    print_warning "Execute no Supabase SQL Editor:"
    echo ""
    cat << 'EOF'
-- Resumo geral
SELECT 
  feature,
  COUNT(*) as total_requests,
  COUNT(*) FILTER (WHERE success = true) as successful,
  ROUND(AVG(duration_ms)::numeric, 2) as avg_duration_ms,
  ROUND((COUNT(*) FILTER (WHERE success = true)::float / COUNT(*)::float * 100)::numeric, 2) as success_rate
FROM performance_metrics
GROUP BY feature
ORDER BY total_requests DESC;

-- Métricas horárias
SELECT * FROM metrics_hourly
ORDER BY hour DESC
LIMIT 10;

-- Status dos serviços
SELECT * FROM services_status;

-- Performance por feature (24h)
SELECT * FROM feature_performance_24h;

-- Top erros
SELECT * FROM top_errors_24h;
EOF
    echo ""
}

# =====================================================
# 5. LIMPAR DADOS ANTIGOS
# =====================================================

cleanup_old_data() {
    print_header "Limpando Dados Antigos"
    
    print_warning "Execute no Supabase SQL Editor:"
    echo ""
    echo "SELECT cleanup_old_metrics();"
    echo ""
    print_info "Remove métricas > 7 dias e erros resolvidos > 30 dias"
}

# =====================================================
# 6. TESTAR HEALTH CHECKS
# =====================================================

test_health_checks() {
    print_header "Testando Health Checks"
    
    print_info "Testando YOLO..."
    
    YOLO_URL="https://yolo-service-yolo-detection.0sw627.easypanel.host/health"
    
    if curl -s --max-time 5 "$YOLO_URL" > /dev/null 2>&1; then
        print_success "YOLO está online!"
    else
        print_error "YOLO está offline ou inacessível"
    fi
    
    print_info "Para testar outros serviços, use o dashboard admin"
}

# =====================================================
# 7. VER LOGS
# =====================================================

view_logs() {
    print_header "Visualizar Logs Recentes"
    
    print_warning "Execute no Supabase SQL Editor:"
    echo ""
    cat << 'EOF'
-- Últimas 20 métricas
SELECT 
  created_at,
  feature,
  action,
  duration_ms,
  success,
  metadata
FROM performance_metrics
ORDER BY created_at DESC
LIMIT 20;

-- Últimos erros
SELECT 
  created_at,
  feature,
  error_type,
  error_message,
  resolved
FROM critical_errors
ORDER BY created_at DESC
LIMIT 10;
EOF
    echo ""
}

# =====================================================
# 8. ESTATÍSTICAS
# =====================================================

show_stats() {
    print_header "Estatísticas do Sistema"
    
    print_warning "Execute no Supabase SQL Editor:"
    echo ""
    cat << 'EOF'
-- Estatísticas gerais
SELECT 
  'Total de métricas' as metric,
  COUNT(*)::text as value
FROM performance_metrics
UNION ALL
SELECT 
  'Métricas hoje',
  COUNT(*)::text
FROM performance_metrics
WHERE created_at >= CURRENT_DATE
UNION ALL
SELECT 
  'Taxa de sucesso geral',
  ROUND((COUNT(*) FILTER (WHERE success = true)::float / COUNT(*)::float * 100)::numeric, 2)::text || '%'
FROM performance_metrics
UNION ALL
SELECT 
  'Tempo médio (ms)',
  ROUND(AVG(duration_ms)::numeric, 2)::text
FROM performance_metrics
UNION ALL
SELECT 
  'Erros não resolvidos',
  COUNT(*)::text
FROM critical_errors
WHERE resolved = false;

-- Top 5 features mais usadas
SELECT 
  feature,
  COUNT(*) as requests,
  ROUND(AVG(duration_ms)::numeric, 2) as avg_ms
FROM performance_metrics
GROUP BY feature
ORDER BY requests DESC
LIMIT 5;
EOF
    echo ""
}

# =====================================================
# 9. RESOLVER ERRO
# =====================================================

resolve_error() {
    print_header "Resolver Erro Crítico"
    
    print_warning "Execute no Supabase SQL Editor:"
    echo ""
    cat << 'EOF'
-- Listar erros não resolvidos
SELECT id, feature, error_type, error_message, created_at
FROM critical_errors
WHERE resolved = false
ORDER BY created_at DESC;

-- Resolver erro (substitua 'ERROR_ID' pelo ID real)
SELECT resolve_critical_error('ERROR_ID');
EOF
    echo ""
}

# =====================================================
# 10. BACKUP
# =====================================================

backup_metrics() {
    print_header "Backup de Métricas"
    
    print_info "Exportando métricas para CSV..."
    
    print_warning "Execute no Supabase SQL Editor:"
    echo ""
    cat << 'EOF'
-- Exportar métricas (copie o resultado)
COPY (
  SELECT * FROM performance_metrics
  WHERE created_at >= NOW() - INTERVAL '7 days'
) TO STDOUT WITH CSV HEADER;
EOF
    echo ""
    print_info "Salve o resultado em um arquivo .csv"
}

# =====================================================
# MENU PRINCIPAL
# =====================================================

show_menu() {
    print_header "Sistema de Monitoramento - Menu de Comandos"
    echo ""
    echo "Escolha uma opção:"
    echo ""
    echo "  1) Aplicar Migration"
    echo "  2) Verificar Instalação"
    echo "  3) Inserir Dados de Teste"
    echo "  4) Ver Métricas"
    echo "  5) Limpar Dados Antigos"
    echo "  6) Testar Health Checks"
    echo "  7) Ver Logs Recentes"
    echo "  8) Estatísticas"
    echo "  9) Resolver Erro"
    echo " 10) Backup de Métricas"
    echo "  0) Sair"
    echo ""
}

# =====================================================
# EXECUÇÃO
# =====================================================

main() {
    if [ $# -eq 0 ]; then
        # Modo interativo
        while true; do
            show_menu
            read -p "Opção: " choice
            echo ""
            
            case $choice in
                1) apply_migration ;;
                2) verify_installation ;;
                3) insert_test_data ;;
                4) view_metrics ;;
                5) cleanup_old_data ;;
                6) test_health_checks ;;
                7) view_logs ;;
                8) show_stats ;;
                9) resolve_error ;;
                10) backup_metrics ;;
                0) 
                    print_success "Até logo!"
                    exit 0
                    ;;
                *)
                    print_error "Opção inválida!"
                    ;;
            esac
            
            echo ""
            read -p "Pressione ENTER para continuar..."
            clear
        done
    else
        # Modo comando direto
        case $1 in
            apply) apply_migration ;;
            verify) verify_installation ;;
            test) insert_test_data ;;
            metrics) view_metrics ;;
            cleanup) cleanup_old_data ;;
            health) test_health_checks ;;
            logs) view_logs ;;
            stats) show_stats ;;
            resolve) resolve_error ;;
            backup) backup_metrics ;;
            *)
                print_error "Comando inválido: $1"
                echo ""
                echo "Comandos disponíveis:"
                echo "  apply    - Aplicar migration"
                echo "  verify   - Verificar instalação"
                echo "  test     - Inserir dados de teste"
                echo "  metrics  - Ver métricas"
                echo "  cleanup  - Limpar dados antigos"
                echo "  health   - Testar health checks"
                echo "  logs     - Ver logs recentes"
                echo "  stats    - Estatísticas"
                echo "  resolve  - Resolver erro"
                echo "  backup   - Backup de métricas"
                exit 1
                ;;
        esac
    fi
}

# Executar
main "$@"
