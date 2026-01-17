#!/usr/bin/env python3
"""
📊 SCRIPT DE INSTRUMENTAÇÃO AUTOMÁTICA DE EDGE FUNCTIONS

Adiciona monitoramento automaticamente em todas as edge functions
sem modificar a lógica existente.

Uso:
    python scripts/instrumentar-edge-functions.py
    python scripts/instrumentar-edge-functions.py --dry-run  # Ver o que seria feito
    python scripts/instrumentar-edge-functions.py --function sofia-image-analysis  # Instrumentar apenas uma
"""

import os
import re
import sys
from pathlib import Path
from typing import List, Dict, Tuple

# Mapeamento de functions para features
FUNCTION_TO_FEATURE = {
    # WhatsApp
    'whatsapp-nutrition-webhook': 'whatsapp',
    'whatsapp-ai-assistant': 'whatsapp',
    'whatsapp-medical-handler': 'whatsapp',
    'whatsapp-send-interactive': 'whatsapp',
    'whatsapp-weekly-report': 'whatsapp',
    'whatsapp-daily-motivation': 'whatsapp',
    'whatsapp-goal-reminders': 'whatsapp',
    'whatsapp-smart-reminders': 'whatsapp',
    'whatsapp-celebration': 'whatsapp',
    'whatsapp-mission-complete': 'whatsapp',
    'whatsapp-habits-analysis': 'whatsapp',
    'whatsapp-nutrition-check': 'whatsapp',
    'whatsapp-saboteur-result': 'whatsapp',
    'whatsapp-test-interactive': 'whatsapp',
    'whatsapp-welcome': 'whatsapp',
    'whatsapp-webhook-unified': 'whatsapp',
    'whatsapp-generate-template': 'whatsapp',
    'whatsapp-health-check': 'whatsapp',
    
    # Dr. Vital
    'analyze-medical-exam': 'dr_vital',
    'generate-medical-report': 'dr_vital',
    'generate-medical-pdf': 'dr_vital',
    'dr-vital-weekly-report': 'dr_vital',
    'dr-vital-chat': 'dr_vital',
    'dr-vital-enhanced': 'dr_vital',
    'dr-vital-notifications': 'dr_vital',
    'premium-medical-report': 'dr_vital',
    'finalize-medical-document': 'dr_vital',
    'medical-batch-timeout': 'dr_vital',
    'cleanup-medical-images': 'dr_vital',
    'fix-stuck-documents': 'dr_vital',
    
    # Sofia
    'sofia-image-analysis': 'sofia',
    'sofia-text-analysis': 'sofia',
    'sofia-deterministic': 'sofia',
    'sofia-enhanced-memory': 'sofia',
    'enrich-sofia-analysis': 'sofia',
    'confirm-food-analysis': 'sofia',
    'food-analysis': 'sofia',
    'enrich-food-data': 'sofia',
    'nutrition-calc': 'sofia',
    'nutrition-calc-deterministic': 'sofia',
    'nutrition-ai-insights': 'sofia',
    'nutrition-daily-summary': 'sofia',
    'nutrition-planner': 'sofia',
    'nutrition-alias-admin': 'sofia',
    
    # YOLO / Vision
    'detect-image-type': 'yolo',
    'vision-api': 'yolo',
    
    # Google Fit
    'google-fit-sync': 'google_fit',
    'google-fit-hourly-sync': 'google_fit',
    'google-fit-ai-analysis': 'google_fit',
    'google-fit-callback': 'google_fit',
    'google-fit-token': 'google_fit',
    
    # Pagamentos
    'create-asaas-payment': 'payment',
    'create-checkout': 'payment',
    'check-subscription': 'payment',
    'customer-portal': 'payment',
    
    # Notificações
    'goal-notifications': 'notification',
    'send-email': 'notification',
    
    # Relatórios
    'generate-coaching-report': 'report',
    'generate-user-biography': 'report',
    'saboteur-html-report': 'report',
    'get-public-report': 'report',
    'n8n-weekly-whatsapp-report': 'report',
    
    # Outros
    'enqueue-analysis': 'other',
    'process-analysis-worker': 'other',
    'generate-meal-plan-taco': 'other',
    'generate-ai-workout': 'other',
    'improve-exercises': 'other',
    'interpret-user-intent': 'other',
    'unified-ai-assistant': 'other',
    'enhanced-gpt-chat': 'other',
    'generate-human-message': 'other',
    'media-upload': 'other',
    'send-meal-plan-whatsapp': 'other',
    'send-lead-webhooks': 'other',
    'bulk-queue-leads': 'other',
    'mealie-real': 'other',
    'seed-standard-recipes': 'other',
    'check-user-data-completeness': 'other',
    'activate-ai': 'other',
    'evolution-send-message': 'other',
    'vps-proxy': 'other',
    'rate-limiter': 'other',
    'cache-manager': 'other',
    'cleanup-scheduler': 'other',
    'test-webhook': 'other',
}

def find_edge_functions(base_path: str = 'supabase/functions') -> List[Tuple[str, Path]]:
    """Encontra todas as edge functions"""
    functions = []
    base = Path(base_path)
    
    if not base.exists():
        print(f"❌ Diretório não encontrado: {base_path}")
        return []
    
    for func_dir in base.iterdir():
        if func_dir.is_dir() and not func_dir.name.startswith('_'):
            index_file = func_dir / 'index.ts'
            if index_file.exists():
                functions.append((func_dir.name, index_file))
    
    return sorted(functions)

def is_already_instrumented(content: str) -> bool:
    """Verifica se a function já está instrumentada"""
    return 'monitoredHandler' in content or 'monitoring-wrapper' in content

def get_feature_for_function(function_name: str) -> str:
    """Retorna a feature para uma function"""
    return FUNCTION_TO_FEATURE.get(function_name, 'other')

def instrument_function(function_name: str, file_path: Path, dry_run: bool = False) -> bool:
    """Instrumenta uma edge function"""
    
    # Ler conteúdo
    content = file_path.read_text()
    
    # Verificar se já está instrumentada
    if is_already_instrumented(content):
        print(f"⏭️  {function_name}: Já instrumentada")
        return False
    
    # Obter feature
    feature = get_feature_for_function(function_name)
    
    # Encontrar o serve()
    serve_pattern = r'serve\s*\(\s*async\s*\(\s*req\s*\)\s*=>\s*\{'
    match = re.search(serve_pattern, content)
    
    if not match:
        print(f"⚠️  {function_name}: Não encontrou padrão serve()")
        return False
    
    # Adicionar import
    import_line = "import { monitoredHandler } from '../_shared/monitoring-wrapper.ts';\n"
    
    # Encontrar onde adicionar o import (após outros imports)
    import_pattern = r'(import .+ from .+;\n)'
    imports = list(re.finditer(import_pattern, content))
    
    if imports:
        last_import = imports[-1]
        insert_pos = last_import.end()
    else:
        # Se não encontrou imports, adicionar no início
        insert_pos = 0
    
    # Adicionar import
    new_content = content[:insert_pos] + import_line + content[insert_pos:]
    
    # Substituir serve() por monitoredHandler()
    new_content = re.sub(
        serve_pattern,
        f"serve(monitoredHandler(\n  '{function_name}',\n  '{feature}',\n  async (req) => {{",
        new_content,
        count=1
    )
    
    # Adicionar fechamento do monitoredHandler
    # Encontrar o último }); do serve
    last_serve_close = new_content.rfind('});')
    if last_serve_close != -1:
        new_content = new_content[:last_serve_close] + '  }\n' + new_content[last_serve_close:]
    
    if dry_run:
        print(f"✅ {function_name}: Seria instrumentada (feature: {feature})")
        return True
    
    # Salvar
    file_path.write_text(new_content)
    print(f"✅ {function_name}: Instrumentada (feature: {feature})")
    return True

def main():
    import argparse
    
    parser = argparse.ArgumentParser(description='Instrumentar edge functions')
    parser.add_argument('--dry-run', action='store_true', help='Ver o que seria feito sem modificar')
    parser.add_argument('--function', type=str, help='Instrumentar apenas uma function específica')
    args = parser.parse_args()
    
    print("📊 INSTRUMENTAÇÃO DE EDGE FUNCTIONS")
    print("=" * 60)
    
    # Encontrar functions
    functions = find_edge_functions()
    
    if not functions:
        print("❌ Nenhuma edge function encontrada")
        return 1
    
    print(f"📁 Encontradas {len(functions)} edge functions")
    print()
    
    # Filtrar se especificou uma function
    if args.function:
        functions = [(name, path) for name, path in functions if name == args.function]
        if not functions:
            print(f"❌ Function não encontrada: {args.function}")
            return 1
    
    # Instrumentar
    instrumented = 0
    skipped = 0
    failed = 0
    
    for function_name, file_path in functions:
        try:
            if instrument_function(function_name, file_path, args.dry_run):
                instrumented += 1
            else:
                skipped += 1
        except Exception as e:
            print(f"❌ {function_name}: Erro - {e}")
            failed += 1
    
    # Resumo
    print()
    print("=" * 60)
    print("📊 RESUMO")
    print(f"✅ Instrumentadas: {instrumented}")
    print(f"⏭️  Já instrumentadas: {skipped}")
    print(f"❌ Falhas: {failed}")
    print(f"📁 Total: {len(functions)}")
    
    if args.dry_run:
        print()
        print("ℹ️  Modo dry-run: Nenhum arquivo foi modificado")
        print("   Execute sem --dry-run para aplicar as mudanças")
    
    return 0

if __name__ == '__main__':
    sys.exit(main())
