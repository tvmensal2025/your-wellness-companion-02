#!/usr/bin/env python3
"""
Script para deletar arquivos grandes que foram refatorados.
Verifica se os arquivos ainda são importados antes de deletar.
"""

import os
import re
import subprocess
from pathlib import Path

# Arquivos grandes que foram refatorados
LARGE_FILES_TO_CHECK = [
    # Arquivos que NÃO devem ser deletados (ainda são usados como orquestradores)
    # "src/components/dashboard/CoursePlatformNetflix.tsx",  # Orquestrador - MANTER
    # "src/components/exercise/ExerciseOnboardingModal.tsx",  # Re-export - MANTER
    # "src/components/exercise/ActiveWorkoutModal.tsx",  # Orquestrador - MANTER
    # "src/components/sofia/SofiaChat.tsx",  # Orquestrador - MANTER
    
    # Arquivos que podem ser deletados (têm estruturas refatoradas completas)
    "src/components/UserSessions.tsx",
    "src/components/admin/SessionTemplates.tsx", 
    "src/components/meal-plan/UltraCreativeLayoutsV2.tsx",
    "src/components/admin/CourseManagementNew.tsx",
    "src/components/dashboard/MedicalDocumentsSection.tsx",
    "src/components/SaboteurTest.tsx",
    
    # Backup files
    "src/components/dashboard/CoursePlatformNetflix.tsx.backup",
]

def count_lines(filepath):
    """Conta linhas de um arquivo"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            return len(f.readlines())
    except:
        return 0

def find_imports(filepath):
    """Encontra todos os arquivos que importam este arquivo"""
    # Extrai o caminho de import do arquivo
    # src/components/UserSessions.tsx -> @/components/UserSessions
    import_path = filepath.replace('src/', '@/').replace('.tsx', '').replace('.ts', '')
    
    # Também verifica variações
    variations = [
        import_path,
        import_path.replace('@/', ''),
    ]
    
    importers = []
    
    for root, dirs, files in os.walk('src'):
        # Ignora node_modules e .git
        dirs[:] = [d for d in dirs if d not in ['node_modules', '.git', 'dist']]
        
        for file in files:
            if file.endswith(('.tsx', '.ts')):
                full_path = os.path.join(root, file)
                
                # Não verifica o próprio arquivo
                if full_path == filepath:
                    continue
                    
                try:
                    with open(full_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                        
                    for var in variations:
                        # Procura por imports
                        patterns = [
                            f"from ['\"].*{re.escape(var)}['\"]",
                            f"import.*from ['\"].*{re.escape(var)}['\"]",
                        ]
                        
                        for pattern in patterns:
                            if re.search(pattern, content):
                                importers.append(full_path)
                                break
                except:
                    pass
    
    return list(set(importers))

def main():
    print("=" * 60)
    print("🗑️  ANÁLISE DE ARQUIVOS GRANDES PARA DELEÇÃO")
    print("=" * 60)
    print()
    
    files_to_delete = []
    files_to_keep = []
    
    for filepath in LARGE_FILES_TO_CHECK:
        if not os.path.exists(filepath):
            print(f"⚪ {filepath}")
            print(f"   → Arquivo não existe (já deletado?)")
            print()
            continue
            
        lines = count_lines(filepath)
        importers = find_imports(filepath)
        
        print(f"📄 {filepath}")
        print(f"   → {lines} linhas")
        
        if importers:
            print(f"   ⚠️  AINDA É IMPORTADO POR:")
            for imp in importers[:5]:  # Mostra até 5
                print(f"      - {imp}")
            if len(importers) > 5:
                print(f"      ... e mais {len(importers) - 5} arquivos")
            files_to_keep.append((filepath, importers))
        else:
            print(f"   ✅ Não é importado por nenhum arquivo")
            files_to_delete.append(filepath)
        print()
    
    print("=" * 60)
    print("📊 RESUMO")
    print("=" * 60)
    print()
    
    if files_to_delete:
        print(f"✅ ARQUIVOS SEGUROS PARA DELETAR ({len(files_to_delete)}):")
        total_lines = 0
        for f in files_to_delete:
            lines = count_lines(f)
            total_lines += lines
            print(f"   - {f} ({lines} linhas)")
        print(f"\n   Total: {total_lines} linhas serão removidas")
        print()
        
        # Deletar arquivos
        print("🗑️  DELETANDO ARQUIVOS...")
        for f in files_to_delete:
            try:
                os.remove(f)
                print(f"   ✅ Deletado: {f}")
            except Exception as e:
                print(f"   ❌ Erro ao deletar {f}: {e}")
    else:
        print("❌ Nenhum arquivo seguro para deletar")
    
    if files_to_keep:
        print()
        print(f"⚠️  ARQUIVOS QUE AINDA SÃO IMPORTADOS ({len(files_to_keep)}):")
        for f, importers in files_to_keep:
            print(f"   - {f}")
            print(f"     Importado por: {', '.join(importers[:3])}")
    
    print()
    print("=" * 60)
    print("✅ ANÁLISE CONCLUÍDA")
    print("=" * 60)

if __name__ == "__main__":
    main()
