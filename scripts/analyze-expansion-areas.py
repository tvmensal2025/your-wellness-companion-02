#!/usr/bin/env python3
"""
🔍 ANÁLISE DAS ÁREAS DE EXPANSÃO
================================
Analisa a arquitetura atual para:
- MealPlan (Cardápios)
- Sessions (Templates de Sessão)
- Courses (Cursos)
- Exercise (Exercícios)
"""

import os
import glob

def count_lines(filepath):
    """Conta linhas de um arquivo"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            return len(f.readlines())
    except:
        return 0

def analyze_folder(folder_path, description):
    """Analisa uma pasta e retorna estatísticas"""
    if not os.path.exists(folder_path):
        return None
    
    files = []
    total_lines = 0
    
    for root, dirs, filenames in os.walk(folder_path):
        # Ignorar node_modules e .git
        dirs[:] = [d for d in dirs if d not in ['node_modules', '.git', '__pycache__']]
        
        for filename in filenames:
            if filename.endswith(('.tsx', '.ts')) and not filename.endswith('.test.ts'):
                filepath = os.path.join(root, filename)
                lines = count_lines(filepath)
                rel_path = os.path.relpath(filepath, folder_path)
                files.append({
                    'name': filename,
                    'path': rel_path,
                    'lines': lines
                })
                total_lines += lines
    
    return {
        'folder': folder_path,
        'description': description,
        'total_files': len(files),
        'total_lines': total_lines,
        'files': sorted(files, key=lambda x: -x['lines'])
    }

def print_area_analysis(area_name, emoji, folders_data, db_tables, expansion_tips):
    """Imprime análise de uma área"""
    print(f"""
╔══════════════════════════════════════════════════════════════════════════════╗
║  {emoji} {area_name:<70} ║
╚══════════════════════════════════════════════════════════════════════════════╝
""")
    
    total_files = 0
    total_lines = 0
    
    for data in folders_data:
        if data:
            total_files += data['total_files']
            total_lines += data['total_lines']
            
            print(f"   📁 {data['folder']}")
            print(f"      {data['description']}")
            print(f"      Arquivos: {data['total_files']} | Linhas: {data['total_lines']:,}")
            
            # Top 5 maiores arquivos
            if data['files']:
                print("      Top arquivos:")
                for f in data['files'][:5]:
                    status = "⚠️" if f['lines'] > 300 else "✅"
                    print(f"        {status} {f['name']}: {f['lines']} linhas")
            print()
    
    print(f"   📊 TOTAL: {total_files} arquivos | {total_lines:,} linhas")
    
    print(f"""
   🗃️ TABELAS NO BANCO:
""")
    for table in db_tables:
        print(f"      • {table}")
    
    print(f"""
   💡 DICAS PARA EXPANSÃO:
""")
    for tip in expansion_tips:
        print(f"      {tip}")

def main():
    print("""
╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║   🚀 ANÁLISE DE ÁREAS PARA EXPANSÃO - MaxNutrition                           ║
║                                                                              ║
║   Você planeja expandir:                                                     ║
║   • 🍽️  Cardápios (MealPlan)                                                 ║
║   • 📋 Templates de Sessão                                                   ║
║   • 📚 Cursos                                                                ║
║   • 🏋️  Exercícios                                                           ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
""")

    # ========== 1. MEAL PLAN ==========
    meal_plan_folders = [
        analyze_folder('src/components/meal-plan', 'Componentes de cardápio'),
        analyze_folder('src/components/nutrition', 'Componentes de nutrição'),
        analyze_folder('src/hooks', 'Hooks (filtrar por meal/nutrition)'),
    ]
    
    # Filtrar hooks relacionados
    hooks_folder = 'src/hooks'
    meal_hooks = []
    if os.path.exists(hooks_folder):
        for f in os.listdir(hooks_folder):
            if any(x in f.lower() for x in ['meal', 'nutrition', 'food']):
                lines = count_lines(os.path.join(hooks_folder, f))
                meal_hooks.append({'name': f, 'path': f, 'lines': lines})
    
    meal_plan_folders[2] = {
        'folder': 'src/hooks (meal/nutrition)',
        'description': 'Hooks relacionados a alimentação',
        'total_files': len(meal_hooks),
        'total_lines': sum(h['lines'] for h in meal_hooks),
        'files': sorted(meal_hooks, key=lambda x: -x['lines'])
    }
    
    print_area_analysis(
        "MEAL PLAN (Cardápios)",
        "🍽️",
        meal_plan_folders,
        [
            "food_analysis - Análises de alimentos",
            "meal_plans - Planos alimentares salvos",
            "nutrition_goals - Metas nutricionais",
            "food_preferences - Preferências alimentares",
        ],
        [
            "✅ Já tem pasta modular: meal-plan/ultra-creative-layouts-v2/layouts/",
            "✅ Cada novo cardápio = 1 arquivo em layouts/",
            "⚠️ CompactMealPlanModal.tsx (1.038 linhas) precisa refatorar",
            "💡 Criar pasta meal-plan/templates/ para templates de cardápio",
            "💡 Usar lazy loading para carregar layouts sob demanda",
        ]
    )

    # ========== 2. SESSIONS ==========
    sessions_folders = [
        analyze_folder('src/components/sessions', 'Componentes de sessões'),
        analyze_folder('src/components/admin', 'Admin (SessionTemplates)'),
    ]
    
    print_area_analysis(
        "SESSIONS (Templates de Sessão)",
        "📋",
        sessions_folders,
        [
            "sessions - Templates de sessão",
            "user_sessions - Sessões atribuídas aos usuários",
            "daily_responses - Respostas das sessões",
            "session_tools - Ferramentas das sessões",
        ],
        [
            "✅ Já tem pasta modular: sessions/templates/",
            "✅ Já tem pasta modular: sessions/user-sessions/",
            "✅ Hooks extraídos: useTemplateLogic, useSessionData",
            "💡 Criar novos templates via admin/course-management",
            "💡 Templates são armazenados em JSON no banco",
            "💡 Usar o campo 'content' (jsonb) para estrutura flexível",
        ]
    )

    # ========== 3. COURSES ==========
    courses_folders = [
        analyze_folder('src/components/dashboard/course-platform', 'Plataforma de cursos (usuário)'),
        analyze_folder('src/components/admin/course-management', 'Gestão de cursos (admin)'),
    ]
    
    print_area_analysis(
        "COURSES (Cursos)",
        "📚",
        courses_folders,
        [
            "courses - Cursos",
            "course_modules - Módulos dos cursos",
            "course_lessons - Lições dos módulos",
            "course_progress - Progresso dos usuários",
            "course_enrollments - Matrículas",
        ],
        [
            "✅ Já tem pasta modular: dashboard/course-platform/",
            "✅ Já tem pasta modular: admin/course-management/",
            "✅ Estrutura hierárquica: Curso → Módulo → Lição",
            "💡 Criar cursos pelo painel admin",
            "💡 Upload de vídeos vai para Supabase Storage",
            "💡 Suporta vídeos do YouTube/Vimeo via embed",
        ]
    )

    # ========== 4. EXERCISE ==========
    exercise_folders = [
        analyze_folder('src/components/exercise', 'Componentes de exercício'),
        analyze_folder('src/components/camera-workout', 'Workout com câmera (YOLO)'),
        analyze_folder('src/data/workout-programs', 'Programas de treino'),
    ]
    
    # Hooks de exercício
    exercise_hooks = []
    if os.path.exists(hooks_folder):
        for f in os.listdir(hooks_folder):
            if any(x in f.lower() for x in ['exercise', 'workout', 'training']):
                lines = count_lines(os.path.join(hooks_folder, f))
                exercise_hooks.append({'name': f, 'path': f, 'lines': lines})
    
    exercise_folders.append({
        'folder': 'src/hooks (exercise/workout)',
        'description': 'Hooks relacionados a exercícios',
        'total_files': len(exercise_hooks),
        'total_lines': sum(h['lines'] for h in exercise_hooks),
        'files': sorted(exercise_hooks, key=lambda x: -x['lines'])
    })
    
    print_area_analysis(
        "EXERCISE (Exercícios)",
        "🏋️",
        exercise_folders,
        [
            "exercises - Biblioteca de exercícios",
            "workout_programs - Programas de treino",
            "exercise_progress - Progresso nos exercícios",
            "exercise_preferences - Preferências de treino",
        ],
        [
            "✅ Já tem pasta modular: exercise/workout/",
            "✅ Já tem pasta modular: exercise/onboarding/",
            "✅ Integração com YOLO para pose estimation",
            "💡 Criar pasta exercise/programs/ para programas",
            "💡 Criar pasta exercise/library/ para biblioteca",
            "💡 Usar src/data/exercises-database.ts como base",
        ]
    )

    # ========== RESUMO FINAL ==========
    print("""
╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║   📊 RESUMO: PRONTIDÃO PARA EXPANSÃO                                         ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝

   ┌─────────────────────────────────────────────────────────────────────────┐
   │  ÁREA           │ ARQUITETURA │ PRONTO P/ EXPANDIR │ AÇÃO NECESSÁRIA    │
   ├─────────────────────────────────────────────────────────────────────────┤
   │  🍽️ MealPlan    │  Modular    │  ⚠️ Parcial        │  Refatorar modal   │
   │  📋 Sessions    │  Modular    │  ✅ Sim            │  Nenhuma           │
   │  📚 Courses     │  Modular    │  ✅ Sim            │  Nenhuma           │
   │  🏋️ Exercise    │  Modular    │  ⚠️ Parcial        │  Organizar pastas  │
   └─────────────────────────────────────────────────────────────────────────┘

   🎯 PRÓXIMOS PASSOS RECOMENDADOS:

   1. 🍽️ MEAL PLAN
      - Refatorar CompactMealPlanModal.tsx (1.038 linhas)
      - Criar estrutura de templates de cardápio
      - Cada cardápio novo = 1 arquivo pequeno

   2. 📋 SESSIONS
      - ✅ Pronto! Criar templates pelo admin
      - Usar estrutura JSON flexível

   3. 📚 COURSES
      - ✅ Pronto! Criar cursos pelo admin
      - Estrutura: Curso → Módulo → Lição

   4. 🏋️ EXERCISE
      - Criar pasta exercise/programs/ para programas
      - Criar pasta exercise/library/ para exercícios
      - Integrar com YOLO para feedback em tempo real
""")

if __name__ == "__main__":
    main()
