#!/usr/bin/env python3
"""
Análise Completa de Qualidade do Código - MaxNutrition
Verifica estrutura, padrões, problemas e oportunidades de melhoria
"""

import os
import json
import re
from pathlib import Path
from typing import Dict, List, Set, Tuple
from collections import defaultdict

class CodeQualityAnalyzer:
    def __init__(self, root_dir: str = "."):
        self.root_dir = Path(root_dir)
        self.issues = {
            "critical": [],
            "high": [],
            "medium": [],
            "low": [],
            "info": []
        }
        self.stats = {
            "total_files": 0,
            "total_lines": 0,
            "typescript_files": 0,
            "javascript_files": 0,
            "tsx_files": 0,
            "jsx_files": 0,
            "css_files": 0,
            "json_files": 0,
            "components": 0,
            "hooks": 0,
            "pages": 0,
            "utils": 0,
            "services": 0
        }
        self.patterns = {
            "unused_imports": [],
            "console_logs": [],
            "todos": [],
            "fixmes": [],
            "deprecated": [],
            "any_types": [],
            "long_files": [],
            "duplicate_code": []
        }
        
    def analyze_file(self, filepath: Path) -> Dict:
        """Analisa um arquivo específico"""
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
                lines = content.split('\n')
                
                return {
                    "path": str(filepath),
                    "lines": len(lines),
                    "size": len(content),
                    "content": content,
                    "extension": filepath.suffix
                }
        except Exception as e:
            return {
                "path": str(filepath),
                "error": str(e)
            }
    
    def check_typescript_issues(self, filepath: Path, content: str):
        """Verifica problemas específicos de TypeScript"""
        lines = content.split('\n')
        
        for i, line in enumerate(lines, 1):
            # Console.log em produção
            if 'console.log' in line and 'TODO' not in line:
                self.patterns["console_logs"].append({
                    "file": str(filepath),
                    "line": i,
                    "content": line.strip()
                })
            
            # Uso de 'any'
            if ': any' in line or 'as any' in line:
                self.patterns["any_types"].append({
                    "file": str(filepath),
                    "line": i,
                    "content": line.strip()
                })
            
            # TODOs e FIXMEs
            if 'TODO' in line or 'todo' in line:
                self.patterns["todos"].append({
                    "file": str(filepath),
                    "line": i,
                    "content": line.strip()
                })
            
            if 'FIXME' in line or 'fixme' in line:
                self.patterns["fixmes"].append({
                    "file": str(filepath),
                    "line": i,
                    "content": line.strip()
                })
            
            # @deprecated
            if '@deprecated' in line:
                self.patterns["deprecated"].append({
                    "file": str(filepath),
                    "line": i,
                    "content": line.strip()
                })
        
        # Arquivo muito longo
        if len(lines) > 500:
            self.patterns["long_files"].append({
                "file": str(filepath),
                "lines": len(lines)
            })
            self.issues["medium"].append(
                f"Arquivo muito longo ({len(lines)} linhas): {filepath}"
            )
    
    def check_import_issues(self, filepath: Path, content: str):
        """Verifica problemas com imports"""
        # Imports relativos longos
        long_relative = re.findall(r'from ["\'](\.\./\.\./\.\./.*)["\']', content)
        if long_relative:
            self.issues["low"].append(
                f"Imports relativos longos em {filepath}: {len(long_relative)} ocorrências"
            )
        
        # Imports não utilizados (simplificado)
        imports = re.findall(r'import\s+{([^}]+)}\s+from', content)
        for imp in imports:
            items = [i.strip() for i in imp.split(',')]
            for item in items:
                # Remove 'type' prefix
                clean_item = item.replace('type ', '')
                # Verifica se é usado no código
                if content.count(clean_item) == 1:  # Só aparece no import
                    self.patterns["unused_imports"].append({
                        "file": str(filepath),
                        "import": clean_item
                    })
    
    def check_component_issues(self, filepath: Path, content: str):
        """Verifica problemas em componentes React"""
        # Componente sem PropTypes ou TypeScript types
        if 'export default function' in content or 'export const' in content:
            if 'interface' not in content and 'type' not in content:
                self.issues["low"].append(
                    f"Componente sem tipos definidos: {filepath}"
                )
        
        # useState sem tipo
        usestate_matches = re.findall(r'useState\((.*?)\)', content)
        for match in usestate_matches:
            if '<' not in match:  # Sem tipo genérico
                self.issues["info"].append(
                    f"useState sem tipo genérico em {filepath}"
                )
    
    def check_security_issues(self, filepath: Path, content: str):
        """Verifica problemas de segurança"""
        # Chaves hardcoded
        if re.search(r'(api[_-]?key|secret|password)\s*=\s*["\'][^"\']+["\']', content, re.IGNORECASE):
            self.issues["critical"].append(
                f"⚠️ CRÍTICO: Possível chave/senha hardcoded em {filepath}"
            )
        
        # eval() ou Function()
        if 'eval(' in content or 'Function(' in content:
            self.issues["high"].append(
                f"⚠️ ALTO: Uso de eval() ou Function() em {filepath}"
            )
        
        # innerHTML
        if 'innerHTML' in content or 'dangerouslySetInnerHTML' in content:
            self.issues["medium"].append(
                f"Uso de innerHTML/dangerouslySetInnerHTML em {filepath}"
            )
    
    def check_performance_issues(self, filepath: Path, content: str):
        """Verifica problemas de performance"""
        # useEffect sem dependências
        if 'useEffect(' in content:
            # Simplificado - verifica se tem array vazio
            if content.count('useEffect') > content.count('[]'):
                self.issues["info"].append(
                    f"useEffect possivelmente sem dependências em {filepath}"
                )
        
        # Loops dentro de componentes
        if re.search(r'(for|while)\s*\(', content) and 'function' in content:
            self.issues["low"].append(
                f"Loop dentro de componente em {filepath}"
            )
    
    def analyze_directory(self, directory: Path, exclude_dirs: Set[str]):
        """Analisa um diretório recursivamente"""
        if not directory.exists():
            return
        
        for item in directory.iterdir():
            # Pular diretórios excluídos
            if item.is_dir():
                if item.name in exclude_dirs:
                    continue
                self.analyze_directory(item, exclude_dirs)
            
            # Analisar arquivos
            elif item.is_file():
                self.stats["total_files"] += 1
                
                # Contar por tipo
                if item.suffix == '.ts':
                    self.stats["typescript_files"] += 1
                elif item.suffix == '.tsx':
                    self.stats["tsx_files"] += 1
                    self.stats["components"] += 1
                elif item.suffix == '.js':
                    self.stats["javascript_files"] += 1
                elif item.suffix == '.jsx':
                    self.stats["jsx_files"] += 1
                elif item.suffix == '.css':
                    self.stats["css_files"] += 1
                elif item.suffix == '.json':
                    self.stats["json_files"] += 1
                
                # Categorizar por pasta
                if 'hooks' in str(item):
                    self.stats["hooks"] += 1
                elif 'pages' in str(item):
                    self.stats["pages"] += 1
                elif 'utils' in str(item):
                    self.stats["utils"] += 1
                elif 'services' in str(item):
                    self.stats["services"] += 1
                
                # Analisar conteúdo de arquivos TypeScript/JavaScript
                if item.suffix in ['.ts', '.tsx', '.js', '.jsx']:
                    file_data = self.analyze_file(item)
                    
                    if 'content' in file_data:
                        content = file_data['content']
                        self.stats["total_lines"] += file_data['lines']
                        
                        # Verificações
                        self.check_typescript_issues(item, content)
                        self.check_import_issues(item, content)
                        self.check_security_issues(item, content)
                        self.check_performance_issues(item, content)
                        
                        if item.suffix in ['.tsx', '.jsx']:
                            self.check_component_issues(item, content)
    
    def generate_report(self):
        """Gera relatório completo"""
        print("\n" + "="*80)
        print("🔍 ANÁLISE DE QUALIDADE DO CÓDIGO - MAXNUTRITION")
        print("="*80)
        
        # Estatísticas
        print("\n📊 ESTATÍSTICAS GERAIS")
        print("-"*80)
        print(f"  Total de Arquivos: {self.stats['total_files']}")
        print(f"  Total de Linhas: {self.stats['total_lines']:,}")
        print(f"\n  Por Tipo:")
        print(f"    • TypeScript (.ts): {self.stats['typescript_files']}")
        print(f"    • React TypeScript (.tsx): {self.stats['tsx_files']}")
        print(f"    • JavaScript (.js): {self.stats['javascript_files']}")
        print(f"    • React JavaScript (.jsx): {self.stats['jsx_files']}")
        print(f"    • CSS: {self.stats['css_files']}")
        print(f"    • JSON: {self.stats['json_files']}")
        print(f"\n  Por Categoria:")
        print(f"    • Componentes: {self.stats['components']}")
        print(f"    • Hooks: {self.stats['hooks']}")
        print(f"    • Páginas: {self.stats['pages']}")
        print(f"    • Utilitários: {self.stats['utils']}")
        print(f"    • Serviços: {self.stats['services']}")
        
        # Issues por severidade
        print("\n⚠️  PROBLEMAS ENCONTRADOS")
        print("-"*80)
        
        total_issues = sum(len(v) for v in self.issues.values())
        print(f"  Total: {total_issues}")
        print(f"\n  Por Severidade:")
        print(f"    🔴 Críticos: {len(self.issues['critical'])}")
        print(f"    🟠 Altos: {len(self.issues['high'])}")
        print(f"    🟡 Médios: {len(self.issues['medium'])}")
        print(f"    🟢 Baixos: {len(self.issues['low'])}")
        print(f"    ℹ️  Informativos: {len(self.issues['info'])}")
        
        # Mostrar issues críticos
        if self.issues['critical']:
            print("\n  🔴 PROBLEMAS CRÍTICOS:")
            for issue in self.issues['critical'][:10]:
                print(f"    • {issue}")
        
        # Mostrar issues altos
        if self.issues['high']:
            print("\n  🟠 PROBLEMAS ALTOS:")
            for issue in self.issues['high'][:10]:
                print(f"    • {issue}")
        
        # Padrões encontrados
        print("\n🔍 PADRÕES ENCONTRADOS")
        print("-"*80)
        print(f"  Console.log: {len(self.patterns['console_logs'])}")
        print(f"  Uso de 'any': {len(self.patterns['any_types'])}")
        print(f"  TODOs: {len(self.patterns['todos'])}")
        print(f"  FIXMEs: {len(self.patterns['fixmes'])}")
        print(f"  Deprecated: {len(self.patterns['deprecated'])}")
        print(f"  Arquivos longos (>500 linhas): {len(self.patterns['long_files'])}")
        print(f"  Imports não utilizados: {len(self.patterns['unused_imports'])}")
        
        # Top 10 arquivos mais longos
        if self.patterns['long_files']:
            print("\n  📄 Top 10 Arquivos Mais Longos:")
            sorted_files = sorted(self.patterns['long_files'], 
                                key=lambda x: x['lines'], reverse=True)[:10]
            for f in sorted_files:
                print(f"    • {f['file']} ({f['lines']} linhas)")
        
        # Score de qualidade
        print("\n📈 SCORE DE QUALIDADE")
        print("-"*80)
        
        # Calcular score (0-100)
        score = 100
        score -= len(self.issues['critical']) * 10
        score -= len(self.issues['high']) * 5
        score -= len(self.issues['medium']) * 2
        score -= len(self.issues['low']) * 0.5
        score -= len(self.patterns['console_logs']) * 0.1
        score -= len(self.patterns['any_types']) * 0.2
        score = max(0, min(100, score))
        
        print(f"  Score: {score:.1f}/100")
        
        if score >= 90:
            print("  Classificação: 🟢 EXCELENTE")
        elif score >= 75:
            print("  Classificação: 🟡 BOM")
        elif score >= 60:
            print("  Classificação: 🟠 REGULAR")
        else:
            print("  Classificação: 🔴 PRECISA MELHORIAS")
        
        # Recomendações
        print("\n💡 RECOMENDAÇÕES")
        print("-"*80)
        
        recommendations = []
        
        if len(self.issues['critical']) > 0:
            recommendations.append("🔴 URGENTE: Corrigir problemas críticos de segurança")
        
        if len(self.patterns['console_logs']) > 50:
            recommendations.append("🟡 Remover console.log em produção")
        
        if len(self.patterns['any_types']) > 100:
            recommendations.append("🟡 Reduzir uso de 'any', adicionar tipos específicos")
        
        if len(self.patterns['long_files']) > 20:
            recommendations.append("🟡 Refatorar arquivos muito longos (>500 linhas)")
        
        if len(self.patterns['todos']) > 50:
            recommendations.append("🟢 Resolver TODOs pendentes")
        
        if len(self.patterns['fixmes']) > 0:
            recommendations.append("🟠 Resolver FIXMEs urgentes")
        
        if not recommendations:
            recommendations.append("✅ Código em boa qualidade!")
        
        for rec in recommendations:
            print(f"  • {rec}")
        
        print("\n" + "="*80)
        
        # Salvar relatório
        self.save_report()
    
    def save_report(self):
        """Salva relatório em JSON"""
        report = {
            "stats": self.stats,
            "issues": {
                "critical": len(self.issues['critical']),
                "high": len(self.issues['high']),
                "medium": len(self.issues['medium']),
                "low": len(self.issues['low']),
                "info": len(self.issues['info'])
            },
            "patterns": {
                "console_logs": len(self.patterns['console_logs']),
                "any_types": len(self.patterns['any_types']),
                "todos": len(self.patterns['todos']),
                "fixmes": len(self.patterns['fixmes']),
                "long_files": len(self.patterns['long_files'])
            },
            "details": {
                "critical_issues": self.issues['critical'][:20],
                "high_issues": self.issues['high'][:20],
                "long_files": self.patterns['long_files'][:20]
            }
        }
        
        with open('docs/CODE_QUALITY_REPORT.json', 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2, ensure_ascii=False)
        
        print("\n✅ Relatório salvo em: docs/CODE_QUALITY_REPORT.json")

def main():
    print("🚀 Iniciando análise de qualidade do código...")
    
    analyzer = CodeQualityAnalyzer()
    
    # Diretórios a excluir
    exclude = {
        'node_modules', '.git', 'dist', 'build', 'coverage',
        '.next', '.cache', 'public', 'dev-dist', '__pycache__',
        'Documents', 'vps-backend', 'yolo-service-v2', 'ollama_proxy'
    }
    
    # Analisar src/
    print("📁 Analisando src/...")
    analyzer.analyze_directory(Path('src'), exclude)
    
    # Analisar supabase/functions/
    print("📁 Analisando supabase/functions/...")
    analyzer.analyze_directory(Path('supabase/functions'), exclude)
    
    # Gerar relatório
    analyzer.generate_report()
    
    print("\n✨ Análise concluída!")

if __name__ == "__main__":
    main()
