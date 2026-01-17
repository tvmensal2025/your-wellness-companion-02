#!/usr/bin/env python3
"""
Análise Completa da Documentação do Projeto MaxNutrition
Lê e analisa todos os arquivos de documentação principais
"""

import os
import json
from pathlib import Path
from typing import Dict, List, Any
import re

class DocumentationAnalyzer:
    def __init__(self, docs_dir: str = "docs"):
        self.docs_dir = Path(docs_dir)
        self.analysis = {
            "project_name": "MaxNutrition - Instituto dos Sonhos",
            "total_files": 0,
            "total_lines": 0,
            "documents": {},
            "summary": {},
            "structure": {},
            "database": {},
            "components": {},
            "hooks": {},
            "edge_functions": {},
            "navigation": {},
            "ai_systems": {},
            "gamification": {},
            "environment": {},
            "deployment": {}
        }
    
    def read_file(self, filepath: Path) -> Dict[str, Any]:
        """Lê um arquivo e retorna informações sobre ele"""
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
                lines = content.split('\n')
                
                return {
                    "path": str(filepath),
                    "exists": True,
                    "lines": len(lines),
                    "size_kb": len(content) / 1024,
                    "content": content,
                    "sections": self.extract_sections(content),
                    "code_blocks": self.extract_code_blocks(content),
                    "links": self.extract_links(content)
                }
        except FileNotFoundError:
            return {
                "path": str(filepath),
                "exists": False,
                "error": "File not found"
            }
        except Exception as e:
            return {
                "path": str(filepath),
                "exists": False,
                "error": str(e)
            }
    
    def extract_sections(self, content: str) -> List[str]:
        """Extrai títulos de seções (headers markdown)"""
        sections = []
        for line in content.split('\n'):
            if line.startswith('#'):
                sections.append(line.strip())
        return sections
    
    def extract_code_blocks(self, content: str) -> int:
        """Conta blocos de código"""
        return content.count('```')
    
    def extract_links(self, content: str) -> List[str]:
        """Extrai links markdown"""
        pattern = r'\[([^\]]+)\]\(([^\)]+)\)'
        matches = re.findall(pattern, content)
        return [match[1] for match in matches]
    
    def analyze_structure_doc(self, content: str) -> Dict:
        """Analisa documento de estrutura do projeto"""
        structure = {
            "folders": [],
            "key_directories": [],
            "file_patterns": []
        }
        
        # Procura por estruturas de diretórios
        lines = content.split('\n')
        for line in lines:
            if '/' in line and ('src/' in line or 'components/' in line or 'hooks/' in line):
                structure["folders"].append(line.strip())
        
        return structure
    
    def analyze_database_doc(self, content: str) -> Dict:
        """Analisa documento de banco de dados"""
        database = {
            "tables": [],
            "rpcs": [],
            "policies": []
        }
        
        # Procura por nomes de tabelas
        table_pattern = r'`([a-z_]+)`'
        tables = re.findall(table_pattern, content)
        database["tables"] = list(set(tables))
        
        # Procura por RPCs
        if 'rpc(' in content or '.rpc(' in content:
            rpc_pattern = r"rpc\('([^']+)'"
            rpcs = re.findall(rpc_pattern, content)
            database["rpcs"] = list(set(rpcs))
        
        return database
    
    def analyze_components_doc(self, content: str) -> Dict:
        """Analisa catálogo de componentes"""
        components = {
            "ui_components": [],
            "feature_components": [],
            "total_count": 0
        }
        
        # Procura por componentes
        comp_pattern = r'<([A-Z][a-zA-Z]+)'
        comps = re.findall(comp_pattern, content)
        components["ui_components"] = list(set(comps))
        components["total_count"] = len(set(comps))
        
        return components
    
    def analyze_hooks_doc(self, content: str) -> Dict:
        """Analisa referência de hooks"""
        hooks = {
            "custom_hooks": [],
            "categories": []
        }
        
        # Procura por hooks customizados
        hook_pattern = r'use[A-Z][a-zA-Z]+'
        found_hooks = re.findall(hook_pattern, content)
        hooks["custom_hooks"] = list(set(found_hooks))
        
        return hooks
    
    def analyze_edge_functions_doc(self, content: str) -> Dict:
        """Analisa edge functions"""
        functions = {
            "functions": [],
            "endpoints": []
        }
        
        # Procura por nomes de funções
        lines = content.split('\n')
        for line in lines:
            if 'supabase/functions/' in line:
                functions["functions"].append(line.strip())
        
        return functions
    
    def analyze_all_docs(self):
        """Analisa todos os documentos principais"""
        
        # Lista de documentos para analisar
        docs_to_analyze = [
            ("01_ESTRUTURA_PROJETO.md", "structure"),
            ("02_DATABASE_SCHEMA.md", "database"),
            ("03_COMPONENTS_CATALOG.md", "components"),
            ("04_HOOKS_REFERENCE.md", "hooks"),
            ("05_EDGE_FUNCTIONS.md", "edge_functions"),
            ("06_NAVIGATION_FLOWS.md", "navigation"),
            ("07_AI_SYSTEMS.md", "ai_systems"),
            ("08_GAMIFICATION.md", "gamification"),
            ("09_ENVIRONMENT_VARS.md", "environment"),
            ("10_DEPLOY_GUIDE.md", "deployment"),
            # Documentos adicionais
            ("DATABASE_SCHEMA.md", "database_extra"),
            ("ARCHITECTURE.md", "architecture"),
            ("AI_SYSTEMS.md", "ai_systems_extra"),
            ("QUICK_REFERENCE.md", "quick_ref"),
            ("COMMON_ERRORS.md", "common_errors"),
            ("YOLO_INTEGRACAO_COMPLETA.md", "yolo_integration")
        ]
        
        for doc_name, category in docs_to_analyze:
            filepath = self.docs_dir / doc_name
            print(f"📖 Analisando: {doc_name}")
            
            doc_info = self.read_file(filepath)
            self.analysis["documents"][doc_name] = doc_info
            
            if doc_info["exists"]:
                self.analysis["total_files"] += 1
                self.analysis["total_lines"] += doc_info["lines"]
                
                # Análise específica por tipo
                content = doc_info["content"]
                
                if "structure" in category.lower():
                    self.analysis["structure"] = self.analyze_structure_doc(content)
                elif "database" in category.lower():
                    db_analysis = self.analyze_database_doc(content)
                    self.analysis["database"].update(db_analysis)
                elif "component" in category.lower():
                    self.analysis["components"] = self.analyze_components_doc(content)
                elif "hook" in category.lower():
                    self.analysis["hooks"] = self.analyze_hooks_doc(content)
                elif "edge" in category.lower() or "function" in category.lower():
                    self.analysis["edge_functions"] = self.analyze_edge_functions_doc(content)
        
        return self.analysis
    
    def generate_summary(self) -> Dict:
        """Gera resumo da análise"""
        summary = {
            "total_documents_analyzed": self.analysis["total_files"],
            "total_lines_of_documentation": self.analysis["total_lines"],
            "total_size_kb": sum(
                doc.get("size_kb", 0) 
                for doc in self.analysis["documents"].values() 
                if doc.get("exists", False)
            ),
            "documents_by_priority": {
                "high": [],
                "medium": [],
                "low": []
            },
            "key_findings": {
                "total_tables": len(self.analysis["database"].get("tables", [])),
                "total_rpcs": len(self.analysis["database"].get("rpcs", [])),
                "total_components": self.analysis["components"].get("total_count", 0),
                "total_hooks": len(self.analysis["hooks"].get("custom_hooks", [])),
                "total_edge_functions": len(self.analysis["edge_functions"].get("functions", []))
            }
        }
        
        # Classifica documentos por prioridade
        for doc_name, doc_info in self.analysis["documents"].items():
            if not doc_info.get("exists"):
                continue
                
            if any(x in doc_name.lower() for x in ["estrutura", "database", "component", "edge", "ai"]):
                summary["documents_by_priority"]["high"].append(doc_name)
            elif any(x in doc_name.lower() for x in ["hook", "navigation", "gamification"]):
                summary["documents_by_priority"]["medium"].append(doc_name)
            else:
                summary["documents_by_priority"]["low"].append(doc_name)
        
        self.analysis["summary"] = summary
        return summary
    
    def save_analysis(self, output_file: str = "docs/ANALYSIS_COMPLETE.json"):
        """Salva análise completa em JSON"""
        output_path = Path(output_file)
        output_path.parent.mkdir(parents=True, exist_ok=True)
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(self.analysis, f, indent=2, ensure_ascii=False)
        
        print(f"\n✅ Análise salva em: {output_file}")
    
    def print_summary(self):
        """Imprime resumo da análise"""
        summary = self.analysis["summary"]
        
        print("\n" + "="*80)
        print("📊 RESUMO DA ANÁLISE DE DOCUMENTAÇÃO")
        print("="*80)
        print(f"\n📁 Projeto: {self.analysis['project_name']}")
        print(f"📄 Documentos analisados: {summary['total_documents_analyzed']}")
        print(f"📝 Total de linhas: {summary['total_lines_of_documentation']:,}")
        print(f"💾 Tamanho total: {summary['total_size_kb']:.2f} KB")
        
        print("\n🔍 PRINCIPAIS DESCOBERTAS:")
        findings = summary["key_findings"]
        print(f"  • Tabelas no banco: {findings['total_tables']}")
        print(f"  • RPCs (funções): {findings['total_rpcs']}")
        print(f"  • Componentes: {findings['total_components']}")
        print(f"  • Hooks customizados: {findings['total_hooks']}")
        print(f"  • Edge Functions: {findings['total_edge_functions']}")
        
        print("\n📋 DOCUMENTOS POR PRIORIDADE:")
        for priority, docs in summary["documents_by_priority"].items():
            if docs:
                print(f"\n  {priority.upper()}:")
                for doc in docs:
                    doc_info = self.analysis["documents"][doc]
                    print(f"    ✓ {doc} ({doc_info['lines']} linhas)")
        
        print("\n" + "="*80)

def main():
    print("🚀 Iniciando análise completa da documentação...")
    print("="*80)
    
    analyzer = DocumentationAnalyzer()
    analyzer.analyze_all_docs()
    analyzer.generate_summary()
    analyzer.print_summary()
    analyzer.save_analysis()
    
    print("\n✨ Análise concluída com sucesso!")

if __name__ == "__main__":
    main()
