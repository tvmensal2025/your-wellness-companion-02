#!/usr/bin/env python3
"""
Analisa todos os botões/links de navegação para Comunidade no projeto.
Identifica padrões incorretos e sugere correções.
"""

import os
import re
from pathlib import Path
from collections import defaultdict

# Padrões a procurar
PATTERNS = [
    # Navegação para comunidade
    (r"navigate\s*\(\s*['\"]([^'\"]*comunidade[^'\"]*)['\"]", "navigate()"),
    (r"navigate\s*\(\s*['\"]([^'\"]*health-feed[^'\"]*)['\"]", "navigate()"),
    (r"navigate\s*\(\s*['\"]([^'\"]*social[^'\"]*)['\"]", "navigate()"),
    # setActiveSection
    (r"setActiveSection\s*\(\s*['\"]([^'\"]*comunidade[^'\"]*)['\"]", "setActiveSection()"),
    # Links href
    (r"href\s*=\s*['\"]([^'\"]*comunidade[^'\"]*)['\"]", "href"),
    (r"href\s*=\s*['\"]([^'\"]*health-feed[^'\"]*)['\"]", "href"),
    # onClick com comunidade
    (r"onClick.*comunidade", "onClick"),
    # Ir para Comunidade (texto do botão)
    (r"['\"]Ir para Comunidade['\"]", "Button text"),
    (r">Ir para Comunidade<", "Button text"),
    # handleNavigateToCommunity
    (r"handleNavigateToCommunity", "handler"),
    (r"onNavigateToCommunity", "prop"),
]

def find_files(root_dir, extensions):
    """Encontra arquivos com extensões específicas."""
    files = []
    for ext in extensions:
        files.extend(Path(root_dir).rglob(f"*{ext}"))
    return files

def analyze_file(filepath):
    """Analisa um arquivo em busca de padrões de navegação."""
    results = []
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            lines = content.split('\n')
            
            for line_num, line in enumerate(lines, 1):
                for pattern, pattern_type in PATTERNS:
                    matches = re.finditer(pattern, line, re.IGNORECASE)
                    for match in matches:
                        results.append({
                            'file': str(filepath),
                            'line': line_num,
                            'type': pattern_type,
                            'match': match.group(0)[:100],
                            'full_line': line.strip()[:150]
                        })
    except Exception as e:
        pass
    return results

def main():
    src_dir = "src"
    
    print("=" * 80)
    print("🔍 ANÁLISE DE NAVEGAÇÃO PARA COMUNIDADE")
    print("=" * 80)
    
    # Encontrar arquivos
    files = find_files(src_dir, ['.tsx', '.ts'])
    print(f"\n📁 Analisando {len(files)} arquivos...\n")
    
    all_results = []
    for filepath in files:
        results = analyze_file(filepath)
        all_results.extend(results)
    
    # Agrupar por arquivo
    by_file = defaultdict(list)
    for r in all_results:
        by_file[r['file']].append(r)
    
    # Mostrar resultados
    print(f"📊 Encontrados {len(all_results)} ocorrências em {len(by_file)} arquivos:\n")
    
    problematic = []
    correct = []
    
    for filepath, results in sorted(by_file.items()):
        rel_path = filepath.replace(os.getcwd() + '/', '')
        print(f"\n📄 {rel_path}")
        print("-" * 60)
        
        for r in results:
            status = "❓"
            
            # Classificar como correto ou problemático
            if "setActiveSection" in r['match'] and "comunidade" in r['match']:
                status = "✅"
                correct.append(r)
            elif "navigate('/sofia?section=comunidade')" in r['full_line']:
                status = "⚠️"  # Funciona mas não é ideal dentro do SofiaPage
                problematic.append(r)
            elif "navigate('/health-feed')" in r['full_line']:
                status = "⚠️"  # Rota separada, pode não existir
                problematic.append(r)
            elif "handleNavigateToCommunity" in r['match'] or "onNavigateToCommunity" in r['match']:
                status = "🔧"  # Handler - precisa verificar implementação
            elif "Ir para Comunidade" in r['match']:
                status = "📍"  # Texto do botão
            
            print(f"  {status} Linha {r['line']}: {r['type']}")
            print(f"     {r['full_line'][:100]}...")
    
    # Resumo
    print("\n" + "=" * 80)
    print("📋 RESUMO E RECOMENDAÇÕES")
    print("=" * 80)
    
    print("""
🎯 PADRÃO CORRETO PARA NAVEGAÇÃO PARA COMUNIDADE:

1. DENTRO do SofiaPage (seções internas):
   ✅ Use o contexto ActiveSectionContext:
   
   import { useActiveSection } from '@/contexts/ActiveSectionContext';
   const { setActiveSection } = useActiveSection();
   setActiveSection('comunidade');

2. DE FORA do SofiaPage (outras páginas):
   ✅ Use navigate com query param:
   
   navigate('/sofia?section=comunidade');

3. NUNCA use:
   ❌ navigate('/comunidade') - rota não existe
   ❌ navigate('/health-feed') - pode não estar configurada
   ❌ navigate('/social') - rota não existe

📝 ARQUIVOS QUE PRECISAM DE CORREÇÃO:
""")
    
    # Listar arquivos problemáticos
    problem_files = set()
    for r in all_results:
        if "navigate('/sofia?section=comunidade')" in r['full_line']:
            # Verificar se está dentro de um componente que já está no SofiaPage
            if 'exercise' in r['file'].lower():
                problem_files.add(r['file'])
    
    for f in sorted(problem_files):
        print(f"   - {f}")
    
    print("""
🔧 SOLUÇÃO RECOMENDADA:

Para componentes DENTRO do ExerciseDashboard (que está dentro do SofiaPage):
- Passar setActiveSection como prop do SofiaPage
- Ou usar o contexto ActiveSectionContext

Para o useChallengeLogic.ts especificamente:
- Receber setActiveSection como parâmetro
- Ou importar useActiveSection do contexto
""")

if __name__ == "__main__":
    main()
