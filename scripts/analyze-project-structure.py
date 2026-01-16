#!/usr/bin/env python3
"""
MaxNutrition Project Structure Analyzer
Analisa toda a estrutura do projeto após o refatoramento
"""

import os
import json
import re
from pathlib import Path
from collections import defaultdict
from datetime import datetime

# Configurações
PROJECT_ROOT = Path(__file__).parent.parent
SRC_DIR = PROJECT_ROOT / "src"
DIST_DIR = PROJECT_ROOT / "dist"
SPECS_DIR = PROJECT_ROOT / ".kiro" / "specs"

class ProjectAnalyzer:
    def __init__(self):
        self.stats = {
            "files": defaultdict(int),
            "lines": defaultdict(int),
            "components": [],
            "hooks": [],
            "services": [],
            "types": [],
            "tests": [],
            "pages": [],
            "utils": [],
        }
        self.refactored_components = []
        self.large_components = []
        
    def count_lines(self, filepath):
        """Conta linhas de um arquivo"""
        try:
            with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                return len(f.readlines())
        except:
            return 0
    
    def analyze_file(self, filepath):
        """Analisa um arquivo individual"""
        ext = filepath.suffix.lower()
        lines = self.count_lines(filepath)
        
        self.stats["files"][ext] += 1
        self.stats["lines"][ext] += lines
        
        rel_path = str(filepath.relative_to(PROJECT_ROOT))
        
        # Categorizar arquivo
        if "/components/" in rel_path:
            self.stats["components"].append({
                "path": rel_path,
                "lines": lines,
                "name": filepath.stem
            })
            if lines > 500:
                self.large_components.append({
                    "path": rel_path,
                    "lines": lines,
                    "excess": lines - 500
                })
        elif "/hooks/" in rel_path:
            self.stats["hooks"].append({
                "path": rel_path,
                "lines": lines,
                "name": filepath.stem
            })
        elif "/services/" in rel_path:
            self.stats["services"].append({
                "path": rel_path,
                "lines": lines,
                "name": filepath.stem
            })
        elif "/types/" in rel_path:
            self.stats["types"].append({
                "path": rel_path,
                "lines": lines,
                "name": filepath.stem
            })
        elif "/tests/" in rel_path or ".test." in rel_path:
            self.stats["tests"].append({
                "path": rel_path,
                "lines": lines,
                "name": filepath.stem
            })
        elif "/pages/" in rel_path:
            self.stats["pages"].append({
                "path": rel_path,
                "lines": lines,
                "name": filepath.stem
            })
        elif "/utils/" in rel_path:
            self.stats["utils"].append({
                "path": rel_path,
                "lines": lines,
                "name": filepath.stem
            })
        
        return lines
    
    def find_refactored_components(self):
        """Encontra componentes que foram refatorados (têm subpastas)"""
        refactored_dirs = [
            "src/components/dashboard/course-platform",
            "src/components/exercise/onboarding",
            "src/components/exercise/workout",
            "src/components/sessions/templates",
            "src/components/sessions/user-sessions",
            "src/components/sofia/chat",
            "src/components/admin/course-management",
            "src/components/dashboard/medical-documents",
            "src/components/saboteur-test",
            "src/components/meal-plan/ultra-creative-layouts-v2",
        ]
        
        for dir_path in refactored_dirs:
            full_path = PROJECT_ROOT / dir_path
            if full_path.exists():
                files = list(full_path.rglob("*.tsx")) + list(full_path.rglob("*.ts"))
                total_lines = sum(self.count_lines(f) for f in files)
                self.refactored_components.append({
                    "directory": dir_path,
                    "files": len(files),
                    "total_lines": total_lines,
                    "file_list": [str(f.relative_to(PROJECT_ROOT)) for f in files]
                })
    
    def analyze_imports(self):
        """Analisa padrões de import"""
        import_stats = {
            "alias_imports": 0,
            "relative_imports": 0,
            "external_imports": 0,
            "deep_relative": 0
        }
        
        for tsx_file in SRC_DIR.rglob("*.tsx"):
            try:
                with open(tsx_file, 'r', encoding='utf-8') as f:
                    content = f.read()
                    
                # Contar imports
                alias = len(re.findall(r"from ['\"]@/", content))
                relative = len(re.findall(r"from ['\"]\.\.?/", content))
                deep = len(re.findall(r"from ['\"]\.\.\/\.\.\/\.\.", content))
                external = len(re.findall(r"from ['\"][a-z@][^./]", content))
                
                import_stats["alias_imports"] += alias
                import_stats["relative_imports"] += relative
                import_stats["deep_relative"] += deep
                import_stats["external_imports"] += external
            except:
                pass
        
        return import_stats
    
    def analyze_bundle(self):
        """Analisa o bundle de produção"""
        bundle_stats = {
            "total_size": 0,
            "chunks": [],
            "largest_chunks": []
        }
        
        assets_dir = DIST_DIR / "assets"
        if assets_dir.exists():
            for js_file in assets_dir.glob("*.js"):
                size = js_file.stat().st_size
                bundle_stats["total_size"] += size
                bundle_stats["chunks"].append({
                    "name": js_file.name,
                    "size_kb": round(size / 1024, 2)
                })
            
            # Ordenar por tamanho
            bundle_stats["chunks"].sort(key=lambda x: x["size_kb"], reverse=True)
            bundle_stats["largest_chunks"] = bundle_stats["chunks"][:10]
        
        return bundle_stats
    
    def analyze_specs(self):
        """Analisa os specs do projeto"""
        specs_info = []
        
        if SPECS_DIR.exists():
            for spec_dir in SPECS_DIR.iterdir():
                if spec_dir.is_dir():
                    spec_files = list(spec_dir.glob("*.md"))
                    tasks_file = spec_dir / "tasks.md"
                    
                    completed_tasks = 0
                    total_tasks = 0
                    
                    if tasks_file.exists():
                        with open(tasks_file, 'r', encoding='utf-8') as f:
                            content = f.read()
                            completed_tasks = len(re.findall(r"- \[x\]", content))
                            total_tasks = len(re.findall(r"- \[[x \-~]\]", content))
                    
                    specs_info.append({
                        "name": spec_dir.name,
                        "files": len(spec_files),
                        "completed_tasks": completed_tasks,
                        "total_tasks": total_tasks,
                        "progress": f"{(completed_tasks/total_tasks*100):.1f}%" if total_tasks > 0 else "N/A"
                    })
        
        return specs_info
    
    def analyze_tests(self):
        """Analisa os testes do projeto"""
        test_stats = {
            "total_files": 0,
            "property_tests": 0,
            "unit_tests": 0,
            "integration_tests": 0,
            "test_directories": []
        }
        
        tests_dir = SRC_DIR / "tests"
        if tests_dir.exists():
            for test_file in tests_dir.rglob("*.test.ts"):
                test_stats["total_files"] += 1
                if "property" in test_file.name:
                    test_stats["property_tests"] += 1
                else:
                    test_stats["unit_tests"] += 1
        
        # Testes em outros lugares
        for test_file in SRC_DIR.rglob("*.test.tsx"):
            test_stats["total_files"] += 1
            test_stats["unit_tests"] += 1
        
        return test_stats
    
    def analyze_supabase_functions(self):
        """Analisa as edge functions do Supabase"""
        functions = []
        functions_dir = PROJECT_ROOT / "supabase" / "functions"
        
        if functions_dir.exists():
            for func_dir in functions_dir.iterdir():
                if func_dir.is_dir() and not func_dir.name.startswith("_"):
                    index_file = func_dir / "index.ts"
                    if index_file.exists():
                        lines = self.count_lines(index_file)
                        functions.append({
                            "name": func_dir.name,
                            "lines": lines
                        })
        
        return functions
    
    def run_analysis(self):
        """Executa análise completa"""
        print("🔍 Analisando estrutura do projeto MaxNutrition...")
        print("=" * 60)
        
        # Analisar arquivos src
        for filepath in SRC_DIR.rglob("*"):
            if filepath.is_file() and filepath.suffix in ['.ts', '.tsx', '.css', '.json']:
                self.analyze_file(filepath)
        
        # Encontrar componentes refatorados
        self.find_refactored_components()
        
        # Análises adicionais
        import_stats = self.analyze_imports()
        bundle_stats = self.analyze_bundle()
        specs_info = self.analyze_specs()
        test_stats = self.analyze_tests()
        supabase_functions = self.analyze_supabase_functions()
        
        return {
            "timestamp": datetime.now().isoformat(),
            "summary": {
                "total_files": sum(self.stats["files"].values()),
                "total_lines": sum(self.stats["lines"].values()),
                "components_count": len(self.stats["components"]),
                "hooks_count": len(self.stats["hooks"]),
                "services_count": len(self.stats["services"]),
                "pages_count": len(self.stats["pages"]),
                "tests_count": len(self.stats["tests"]),
            },
            "files_by_type": dict(self.stats["files"]),
            "lines_by_type": dict(self.stats["lines"]),
            "large_components": sorted(self.large_components, key=lambda x: x["lines"], reverse=True)[:20],
            "refactored_components": self.refactored_components,
            "import_stats": import_stats,
            "bundle_stats": bundle_stats,
            "specs": specs_info,
            "tests": test_stats,
            "supabase_functions": supabase_functions,
            "component_size_distribution": self._get_size_distribution(),
        }
    
    def _get_size_distribution(self):
        """Calcula distribuição de tamanho dos componentes"""
        distribution = {
            "0-100": 0,
            "101-200": 0,
            "201-300": 0,
            "301-400": 0,
            "401-500": 0,
            "501-750": 0,
            "751-1000": 0,
            "1000+": 0
        }
        
        for comp in self.stats["components"]:
            lines = comp["lines"]
            if lines <= 100:
                distribution["0-100"] += 1
            elif lines <= 200:
                distribution["101-200"] += 1
            elif lines <= 300:
                distribution["201-300"] += 1
            elif lines <= 400:
                distribution["301-400"] += 1
            elif lines <= 500:
                distribution["401-500"] += 1
            elif lines <= 750:
                distribution["501-750"] += 1
            elif lines <= 1000:
                distribution["751-1000"] += 1
            else:
                distribution["1000+"] += 1
        
        return distribution


def generate_report(analysis):
    """Gera relatório em formato legível"""
    report = []
    report.append("=" * 80)
    report.append("📊 ANÁLISE COMPLETA DO PROJETO MAXNUTRITION")
    report.append("=" * 80)
    report.append(f"Data: {analysis['timestamp']}")
    report.append("")
    
    # Resumo Geral
    report.append("📋 RESUMO GERAL")
    report.append("-" * 40)
    summary = analysis["summary"]
    report.append(f"  Total de arquivos: {summary['total_files']:,}")
    report.append(f"  Total de linhas: {summary['total_lines']:,}")
    report.append(f"  Componentes: {summary['components_count']}")
    report.append(f"  Hooks: {summary['hooks_count']}")
    report.append(f"  Services: {summary['services_count']}")
    report.append(f"  Pages: {summary['pages_count']}")
    report.append(f"  Testes: {summary['tests_count']}")
    report.append("")
    
    # Arquivos por tipo
    report.append("📁 ARQUIVOS POR TIPO")
    report.append("-" * 40)
    for ext, count in sorted(analysis["files_by_type"].items(), key=lambda x: x[1], reverse=True):
        lines = analysis["lines_by_type"].get(ext, 0)
        report.append(f"  {ext}: {count} arquivos ({lines:,} linhas)")
    report.append("")
    
    # Distribuição de tamanho
    report.append("📏 DISTRIBUIÇÃO DE TAMANHO DOS COMPONENTES")
    report.append("-" * 40)
    for range_name, count in analysis["component_size_distribution"].items():
        bar = "█" * (count // 5) if count > 0 else ""
        report.append(f"  {range_name:>10} linhas: {count:3} {bar}")
    report.append("")
    
    # Componentes grandes
    report.append("⚠️  COMPONENTES GRANDES (>500 linhas)")
    report.append("-" * 40)
    for comp in analysis["large_components"][:15]:
        report.append(f"  {comp['path']}")
        report.append(f"    → {comp['lines']} linhas (excede por {comp['excess']})")
    report.append(f"  ... e mais {len(analysis['large_components']) - 15} componentes" if len(analysis['large_components']) > 15 else "")
    report.append("")
    
    # Componentes refatorados
    report.append("✅ COMPONENTES REFATORADOS")
    report.append("-" * 40)
    for comp in analysis["refactored_components"]:
        report.append(f"  📂 {comp['directory']}")
        report.append(f"     Arquivos: {comp['files']} | Total: {comp['total_lines']} linhas")
        for f in comp["file_list"][:5]:
            report.append(f"       - {f.split('/')[-1]}")
        if len(comp["file_list"]) > 5:
            report.append(f"       ... e mais {len(comp['file_list']) - 5} arquivos")
    report.append("")
    
    # Imports
    report.append("📦 ANÁLISE DE IMPORTS")
    report.append("-" * 40)
    imports = analysis["import_stats"]
    total_imports = sum(imports.values())
    report.append(f"  @/ alias: {imports['alias_imports']} ({imports['alias_imports']/total_imports*100:.1f}%)")
    report.append(f"  Relativos: {imports['relative_imports']} ({imports['relative_imports']/total_imports*100:.1f}%)")
    report.append(f"  Externos: {imports['external_imports']} ({imports['external_imports']/total_imports*100:.1f}%)")
    report.append(f"  Deep relative (../../..): {imports['deep_relative']}")
    report.append("")
    
    # Bundle
    report.append("📦 ANÁLISE DO BUNDLE")
    report.append("-" * 40)
    bundle = analysis["bundle_stats"]
    if bundle["total_size"] > 0:
        report.append(f"  Tamanho total: {bundle['total_size']/1024/1024:.2f} MB")
        report.append(f"  Total de chunks: {len(bundle['chunks'])}")
        report.append("  Maiores chunks:")
        for chunk in bundle["largest_chunks"][:10]:
            report.append(f"    - {chunk['name']}: {chunk['size_kb']:.1f} KB")
    else:
        report.append("  Bundle não encontrado (execute npm run build)")
    report.append("")
    
    # Specs
    report.append("📋 SPECS DO PROJETO")
    report.append("-" * 40)
    for spec in analysis["specs"]:
        status = "✅" if spec["completed_tasks"] == spec["total_tasks"] else "🔄"
        report.append(f"  {status} {spec['name']}")
        report.append(f"     Tarefas: {spec['completed_tasks']}/{spec['total_tasks']} ({spec['progress']})")
    report.append("")
    
    # Testes
    report.append("🧪 ANÁLISE DE TESTES")
    report.append("-" * 40)
    tests = analysis["tests"]
    report.append(f"  Total de arquivos de teste: {tests['total_files']}")
    report.append(f"  Testes de propriedade: {tests['property_tests']}")
    report.append(f"  Testes unitários: {tests['unit_tests']}")
    report.append("")
    
    # Supabase Functions
    report.append("⚡ EDGE FUNCTIONS (SUPABASE)")
    report.append("-" * 40)
    for func in sorted(analysis["supabase_functions"], key=lambda x: x["lines"], reverse=True)[:10]:
        report.append(f"  - {func['name']}: {func['lines']} linhas")
    report.append(f"  Total: {len(analysis['supabase_functions'])} functions")
    report.append("")
    
    report.append("=" * 80)
    report.append("Relatório gerado com sucesso!")
    report.append("=" * 80)
    
    return "\n".join(report)


if __name__ == "__main__":
    analyzer = ProjectAnalyzer()
    analysis = analyzer.run_analysis()
    
    # Gerar relatório
    report = generate_report(analysis)
    print(report)
    
    # Salvar JSON
    json_path = PROJECT_ROOT / "docs" / "PROJECT_STRUCTURE_ANALYSIS.json"
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(analysis, f, indent=2, ensure_ascii=False)
    print(f"\n📄 JSON salvo em: {json_path}")
    
    # Salvar relatório
    report_path = PROJECT_ROOT / "docs" / "PROJECT_STRUCTURE_ANALYSIS.md"
    with open(report_path, 'w', encoding='utf-8') as f:
        f.write("```\n")
        f.write(report)
        f.write("\n```")
    print(f"📄 Relatório salvo em: {report_path}")
