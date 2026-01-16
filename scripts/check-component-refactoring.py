#!/usr/bin/env python3
"""
Task 23: Checkpoint - Verificar refatoração de componentes (Parte 2)
Verifica os 11 componentes grandes que devem ter sido refatorados
"""

import os
import sys
from pathlib import Path

# Lista dos 11 componentes que devem ter sido refatorados
COMPONENTS = {
    "CoursePlatformNetflix": "src/components/dashboard/CoursePlatformNetflix.tsx",
    "ExerciseOnboardingModal": "src/components/exercise/ExerciseOnboardingModal.tsx",
    "SessionTemplates": "src/components/sessions/SessionTemplates.tsx",
    "UserSessions": "src/components/sessions/UserSessions.tsx",
    "ActiveWorkoutModal": "src/components/exercise/ActiveWorkoutModal.tsx",
    "SofiaChat": "src/components/sofia/SofiaChat.tsx",
    "UltraCreativeLayoutsV2": "src/components/meal-plan/UltraCreativeLayoutsV2.tsx",
    "XiaomiScaleFlow": "src/components/xiaomi-scale/XiaomiScaleFlow.tsx",
    "CourseManagementNew": "src/components/admin/CourseManagementNew.tsx",
    "MedicalDocumentsSection": "src/components/dashboard/MedicalDocumentsSection.tsx",
    "SaboteurTest": "src/components/saboteur-test/SaboteurTest.tsx",
}

# Estruturas refatoradas esperadas
REFACTORED_STRUCTURES = {
    "CoursePlatformNetflix": "src/components/dashboard/course-platform/",
    "ExerciseOnboardingModal": "src/components/exercise/onboarding/",
    "SessionTemplates": "src/components/sessions/templates/",
    "UserSessions": "src/components/sessions/user-sessions/",
    "ActiveWorkoutModal": "src/components/exercise/workout/",
    "SofiaChat": "src/components/sofia/chat/",
    "UltraCreativeLayoutsV2": "src/components/meal-plan/ultra-creative-layouts-v2/layouts/",
    "XiaomiScaleFlow": "src/components/xiaomi-scale/flow/",
    "CourseManagementNew": "src/components/admin/course-management/",
    "MedicalDocumentsSection": "src/components/dashboard/medical-documents/",
    "SaboteurTest": "src/components/saboteur-test/",
}

MAX_LINES = 500

def count_lines(filepath):
    """Count lines in a file"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            return len(f.readlines())
    except Exception as e:
        print(f"  ⚠️  Erro ao ler arquivo: {e}")
        return 0

def check_refactored_structure(structure_path):
    """Check if refactored structure exists"""
    if not os.path.exists(structure_path):
        return False, []
    
    # Count tsx files in the structure
    tsx_files = []
    for root, dirs, files in os.walk(structure_path):
        for file in files:
            if file.endswith('.tsx'):
                tsx_files.append(os.path.join(root, file))
    
    return len(tsx_files) > 0, tsx_files

def main():
    print("🔍 Verificando refatoração dos 11 componentes grandes...")
    print()
    
    total = len(COMPONENTS)
    refactored = 0
    violations = 0
    results = []
    
    for name, filepath in COMPONENTS.items():
        print("━" * 60)
        print(f"📦 Componente: {name}")
        print(f"📄 Arquivo original: {filepath}")
        
        result = {
            'name': name,
            'status': 'unknown',
            'lines': 0,
            'details': []
        }
        
        # Check if original file exists
        if os.path.exists(filepath):
            lines = count_lines(filepath)
            result['lines'] = lines
            print(f"📏 Linhas: {lines}")
            
            if lines <= MAX_LINES:
                print(f"✅ REFATORADO - Dentro do limite (≤{MAX_LINES} linhas)")
                result['status'] = 'refactored'
                refactored += 1
            else:
                print(f"❌ PRECISA REFATORAR - Excede {MAX_LINES} linhas")
                result['status'] = 'needs_refactoring'
                violations += 1
        else:
            print("⚠️  Arquivo original não encontrado")
            
            # Check for refactored structure
            if name in REFACTORED_STRUCTURES:
                structure_path = REFACTORED_STRUCTURES[name]
                exists, tsx_files = check_refactored_structure(structure_path)
                
                if exists:
                    print(f"✅ REFATORADO - Estrutura encontrada: {structure_path}")
                    print(f"📁 Arquivos encontrados: {len(tsx_files)}")
                    
                    # Check if any file exceeds limit
                    large_files = []
                    for tsx_file in tsx_files:
                        lines = count_lines(tsx_file)
                        rel_path = os.path.relpath(tsx_file)
                        result['details'].append({'file': rel_path, 'lines': lines})
                        
                        if lines > MAX_LINES:
                            large_files.append((rel_path, lines))
                    
                    if large_files:
                        print(f"⚠️  Arquivos que excedem {MAX_LINES} linhas:")
                        for file, lines in large_files:
                            print(f"   - {file}: {lines} linhas")
                        result['status'] = 'partial'
                        violations += 1
                    else:
                        result['status'] = 'refactored'
                        refactored += 1
                else:
                    print(f"❌ Estrutura refatorada não encontrada: {structure_path}")
                    result['status'] = 'missing'
                    violations += 1
            else:
                print("❌ Estrutura refatorada não definida")
                result['status'] = 'missing'
                violations += 1
        
        results.append(result)
        print()
    
    # Summary
    print("━" * 60)
    print("📊 RESUMO DA VERIFICAÇÃO")
    print("━" * 60)
    print(f"Total de componentes: {total}")
    print(f"✅ Refatorados: {refactored}")
    print(f"❌ Precisam refatorar: {violations}")
    print()
    
    # Detailed breakdown
    print("📋 Detalhamento por status:")
    status_counts = {}
    for result in results:
        status = result['status']
        status_counts[status] = status_counts.get(status, 0) + 1
    
    for status, count in status_counts.items():
        emoji = {
            'refactored': '✅',
            'needs_refactoring': '❌',
            'partial': '⚠️',
            'missing': '❌',
            'unknown': '❓'
        }.get(status, '❓')
        print(f"  {emoji} {status}: {count}")
    print()
    
    if violations == 0:
        print("✅ TODOS OS COMPONENTES FORAM REFATORADOS!")
        return 0
    else:
        print(f"❌ {violations} componente(s) ainda precisam ser refatorados")
        return 1

if __name__ == "__main__":
    sys.exit(main())
