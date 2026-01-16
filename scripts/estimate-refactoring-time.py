#!/usr/bin/env python3
"""
⏱️ ESTIMATIVA DE TEMPO PARA REFATORAR OS 77 COMPONENTES RESTANTES
==================================================================
"""

import os
from pathlib import Path

def count_lines(filepath):
    """Conta linhas de um arquivo"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            return len(f.readlines())
    except:
        return 0

def find_large_components():
    """Encontra todos os componentes com mais de 500 linhas"""
    large_components = []
    
    for root, dirs, files in os.walk('src'):
        dirs[:] = [d for d in dirs if d not in ['node_modules', '.git', 'dist', 'tests', '__tests__']]
        
        for file in files:
            if file.endswith('.tsx') and not file.endswith('.test.tsx'):
                filepath = os.path.join(root, file)
                lines = count_lines(filepath)
                
                if lines > 500:
                    large_components.append({
                        'path': filepath,
                        'name': file,
                        'lines': lines,
                        'excess': lines - 500
                    })
    
    return sorted(large_components, key=lambda x: -x['lines'])

def categorize_complexity(lines):
    """Categoriza a complexidade baseado no número de linhas"""
    if lines > 1000:
        return ('🔴 Alta', 45, 60)  # 45-60 minutos
    elif lines > 750:
        return ('🟠 Média-Alta', 30, 45)  # 30-45 minutos
    elif lines > 600:
        return ('🟡 Média', 20, 30)  # 20-30 minutos
    else:
        return ('🟢 Baixa', 15, 20)  # 15-20 minutos

def main():
    components = find_large_components()
    
    # Filtrar componentes que já foram refatorados (têm pasta modular)
    refactored_dirs = [
        'course-platform', 'onboarding', 'workout', 'templates', 
        'user-sessions', 'chat', 'course-management', 'medical-documents',
        'saboteur-test', 'ultra-creative-layouts-v2'
    ]
    
    # Componentes que são orquestradores (já refatorados)
    orchestrators = [
        'CoursePlatformNetflix.tsx',
        'ExerciseOnboardingModal.tsx', 
        'ActiveWorkoutModal.tsx',
        'SofiaChat.tsx',
    ]
    
    remaining = []
    for comp in components:
        is_refactored = any(d in comp['path'] for d in refactored_dirs)
        is_orchestrator = comp['name'] in orchestrators
        
        if not is_refactored and not is_orchestrator:
            remaining.append(comp)
    
    print("""
╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║   ⏱️  ESTIMATIVA DE TEMPO PARA REFATORAR COMPONENTES RESTANTES               ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
""")

    # Estatísticas gerais
    total_lines = sum(c['lines'] for c in remaining)
    total_excess = sum(c['excess'] for c in remaining)
    
    print(f"""
┌──────────────────────────────────────────────────────────────────────────────┐
│  📊 ESTATÍSTICAS GERAIS                                                      │
└──────────────────────────────────────────────────────────────────────────────┘

   Total de componentes > 500 linhas: {len(remaining)}
   Total de linhas nesses componentes: {total_lines:,}
   Linhas em excesso (acima de 500): {total_excess:,}
""")

    # Categorizar por complexidade
    alta = [c for c in remaining if c['lines'] > 1000]
    media_alta = [c for c in remaining if 750 < c['lines'] <= 1000]
    media = [c for c in remaining if 600 < c['lines'] <= 750]
    baixa = [c for c in remaining if 500 < c['lines'] <= 600]

    print(f"""
┌──────────────────────────────────────────────────────────────────────────────┐
│  📈 DISTRIBUIÇÃO POR COMPLEXIDADE                                            │
└──────────────────────────────────────────────────────────────────────────────┘

   🔴 Alta (>1000 linhas):      {len(alta):3} componentes  │ 45-60 min cada
   🟠 Média-Alta (751-1000):    {len(media_alta):3} componentes  │ 30-45 min cada
   🟡 Média (601-750):          {len(media):3} componentes  │ 20-30 min cada
   🟢 Baixa (501-600):          {len(baixa):3} componentes  │ 15-20 min cada
""")

    # Calcular tempo estimado
    time_min = (
        len(alta) * 45 +
        len(media_alta) * 30 +
        len(media) * 20 +
        len(baixa) * 15
    )
    time_max = (
        len(alta) * 60 +
        len(media_alta) * 45 +
        len(media) * 30 +
        len(baixa) * 20
    )

    hours_min = time_min / 60
    hours_max = time_max / 60
    days_min = hours_min / 8  # 8 horas por dia
    days_max = hours_max / 8

    print(f"""
┌──────────────────────────────────────────────────────────────────────────────┐
│  ⏱️  ESTIMATIVA DE TEMPO TOTAL                                               │
└──────────────────────────────────────────────────────────────────────────────┘

   ┌─────────────────────────────────────────────────────────────────────────┐
   │                                                                         │
   │   TEMPO MÍNIMO:  {time_min:,} minutos = {hours_min:.1f} horas = {days_min:.1f} dias úteis     │
   │   TEMPO MÁXIMO:  {time_max:,} minutos = {hours_max:.1f} horas = {days_max:.1f} dias úteis     │
   │                                                                         │
   │   📅 ESTIMATIVA REALISTA: {(days_min + days_max) / 2:.0f}-{days_max:.0f} dias úteis                      │
   │                                                                         │
   └─────────────────────────────────────────────────────────────────────────┘
""")

    # Sugestão de sprints
    sprint_size = 10  # componentes por sprint
    num_sprints = (len(remaining) + sprint_size - 1) // sprint_size

    print(f"""
┌──────────────────────────────────────────────────────────────────────────────┐
│  📋 SUGESTÃO DE SPRINTS (10 componentes por sprint)                          │
└──────────────────────────────────────────────────────────────────────────────┘

   Total de sprints necessários: {num_sprints}
   
   Sprint 1-2: Componentes críticos (>1000 linhas) - PRIORIDADE ALTA
   Sprint 3-4: Componentes médios (750-1000 linhas)
   Sprint 5-6: Componentes menores (500-750 linhas)
   Sprint 7-8: Finalização e testes
""")

    # Lista dos 20 maiores componentes
    print("""
┌──────────────────────────────────────────────────────────────────────────────┐
│  🔝 TOP 20 COMPONENTES PARA REFATORAR (por prioridade)                       │
└──────────────────────────────────────────────────────────────────────────────┘
""")

    print("   #  │ Linhas │ Complexidade │ Componente")
    print("   ───┼────────┼──────────────┼" + "─" * 50)
    
    for i, comp in enumerate(remaining[:20], 1):
        complexity, _, _ = categorize_complexity(comp['lines'])
        name = comp['path'].replace('src/components/', '')
        if len(name) > 48:
            name = name[:45] + '...'
        print(f"   {i:2} │ {comp['lines']:6} │ {complexity:12} │ {name}")

    # Resumo final
    print(f"""

┌──────────────────────────────────────────────────────────────────────────────┐
│  ✅ RESUMO EXECUTIVO                                                         │
└──────────────────────────────────────────────────────────────────────────────┘

   📊 {len(remaining)} componentes precisam ser refatorados
   📏 {total_lines:,} linhas de código total
   ⏱️  {hours_min:.0f}-{hours_max:.0f} horas de trabalho estimadas
   📅 {days_min:.0f}-{days_max:.0f} dias úteis (8h/dia)
   
   💡 RECOMENDAÇÃO:
   
   1. Priorizar os {len(alta)} componentes com >1000 linhas primeiro
   2. Fazer em sprints de 10 componentes
   3. Testar após cada sprint
   4. Não refatorar tudo de uma vez - risco de quebrar o app
   
   ⚠️  IMPORTANTE: Alguns componentes podem NÃO precisar de refatoração
   se forem complexos por natureza (ex: páginas de admin, dashboards)
""")

    # Salvar lista completa em arquivo
    with open('docs/COMPONENTS_TO_REFACTOR.md', 'w') as f:
        f.write("# Componentes para Refatorar\n\n")
        f.write(f"Total: {len(remaining)} componentes\n\n")
        f.write("| # | Linhas | Complexidade | Arquivo |\n")
        f.write("|---|--------|--------------|--------|\n")
        for i, comp in enumerate(remaining, 1):
            complexity, _, _ = categorize_complexity(comp['lines'])
            f.write(f"| {i} | {comp['lines']} | {complexity} | `{comp['path']}` |\n")
    
    print("   📄 Lista completa salva em: docs/COMPONENTS_TO_REFACTOR.md")

if __name__ == "__main__":
    main()
