#!/usr/bin/env python3
"""
Extração Detalhada de Contexto da Documentação
Cria um contexto completo e estruturado para uso em MCP
"""

import os
import json
from pathlib import Path
from typing import Dict, List, Any
import re

class DetailedContextExtractor:
    def __init__(self, docs_dir: str = "docs"):
        self.docs_dir = Path(docs_dir)
        self.context = {
            "project": {
                "name": "MaxNutrition",
                "full_name": "Instituto dos Sonhos - MaxNutrition",
                "description": "Plataforma de nutrição inteligente e personalizada",
                "tech_stack": []
            },
            "architecture": {
                "frontend": {},
                "backend": {},
                "database": {},
                "integrations": []
            },
            "database": {
                "tables": {},
                "rpcs": {},
                "policies": [],
                "relationships": []
            },
            "components": {
                "ui": [],
                "features": [],
                "pages": []
            },
            "hooks": {
                "auth": [],
                "data": [],
                "ui": [],
                "gamification": []
            },
            "edge_functions": [],
            "ai_systems": {
                "sofia": {},
                "dr_vital": {},
                "yolo": {}
            },
            "features": {
                "gamification": {},
                "nutrition": {},
                "exercise": {},
                "community": {}
            },
            "environment": {},
            "deployment": {}
        }
    
    def extract_tech_stack(self, content: str) -> List[str]:
        """Extrai stack tecnológica"""
        tech = []
        tech_keywords = [
            "React", "TypeScript", "Vite", "Supabase", "PostgreSQL",
            "Tailwind", "Radix UI", "React Query", "Framer Motion",
            "Zod", "React Hook Form", "Lucide", "YOLO", "Gemini"
        ]
        
        for keyword in tech_keywords:
            if keyword.lower() in content.lower():
                tech.append(keyword)
        
        return list(set(tech))
    
    def extract_database_tables(self, content: str) -> Dict:
        """Extrai informações detalhadas das tabelas"""
        tables = {}
        
        # Padrão para encontrar definições de tabelas
        table_pattern = r'###?\s+`?([a-z_]+)`?\s*\n(.*?)(?=###|$)'
        matches = re.findall(table_pattern, content, re.DOTALL | re.MULTILINE)
        
        for table_name, description in matches:
            if '_' in table_name and len(table_name) > 3:
                tables[table_name] = {
                    "name": table_name,
                    "description": description.strip()[:200],
                    "columns": self.extract_columns(description)
                }
        
        return tables
    
    def extract_columns(self, text: str) -> List[str]:
        """Extrai colunas de uma descrição de tabela"""
        columns = []
        # Procura por padrões como: - column_name ou `column_name`
        col_pattern = r'[-•]\s*`?([a-z_]+)`?'
        matches = re.findall(col_pattern, text)
        return matches[:20]  # Limita a 20 colunas
    
    def extract_rpcs(self, content: str) -> Dict:
        """Extrai RPCs (Remote Procedure Calls)"""
        rpcs = {}
        
        # Padrão para RPCs
        rpc_pattern = r"rpc\('([^']+)'[,\)]"
        matches = re.findall(rpc_pattern, content)
        
        for rpc_name in set(matches):
            rpcs[rpc_name] = {
                "name": rpc_name,
                "type": "database_function"
            }
        
        return rpcs
    
    def extract_components_detailed(self, content: str) -> Dict:
        """Extrai componentes com detalhes"""
        components = {
            "ui": [],
            "features": [],
            "pages": []
        }
        
        # Procura por seções de componentes
        lines = content.split('\n')
        current_category = None
        
        for line in lines:
            if '## UI Components' in line or '### UI' in line:
                current_category = 'ui'
            elif '## Feature Components' in line or '### Features' in line:
                current_category = 'features'
            elif '## Pages' in line or '### Páginas' in line:
                current_category = 'pages'
            
            # Extrai nomes de componentes
            if current_category and ('`<' in line or '- ' in line):
                comp_match = re.search(r'`?<([A-Z][a-zA-Z]+)', line)
                if comp_match:
                    comp_name = comp_match.group(1)
                    if comp_name not in components[current_category]:
                        components[current_category].append(comp_name)
        
        return components
    
    def extract_hooks_detailed(self, content: str) -> Dict:
        """Extrai hooks com categorização"""
        hooks = {
            "auth": [],
            "data": [],
            "ui": [],
            "gamification": [],
            "other": []
        }
        
        # Procura por hooks
        hook_pattern = r'use[A-Z][a-zA-Z]+'
        found_hooks = set(re.findall(hook_pattern, content))
        
        for hook in found_hooks:
            hook_lower = hook.lower()
            if 'auth' in hook_lower or 'login' in hook_lower:
                hooks["auth"].append(hook)
            elif 'gamif' in hook_lower or 'point' in hook_lower or 'xp' in hook_lower:
                hooks["gamification"].append(hook)
            elif 'toast' in hook_lower or 'modal' in hook_lower or 'theme' in hook_lower:
                hooks["ui"].append(hook)
            elif any(x in hook_lower for x in ['query', 'mutation', 'data', 'fetch']):
                hooks["data"].append(hook)
            else:
                hooks["other"].append(hook)
        
        return hooks
    
    def extract_edge_functions(self, content: str) -> List[Dict]:
        """Extrai edge functions com detalhes"""
        functions = []
        
        # Padrão para funções
        func_pattern = r'###?\s+`?([a-z-]+)`?\s*\n(.*?)(?=###|$)'
        matches = re.findall(func_pattern, content, re.DOTALL | re.MULTILINE)
        
        for func_name, description in matches:
            if '-' in func_name and len(func_name) > 5:
                functions.append({
                    "name": func_name,
                    "description": description.strip()[:200],
                    "path": f"supabase/functions/{func_name}"
                })
        
        return functions
    
    def extract_ai_systems(self, content: str) -> Dict:
        """Extrai informações sobre sistemas de IA"""
        ai_systems = {
            "sofia": {
                "name": "Sofia",
                "type": "Nutricionista Virtual",
                "capabilities": []
            },
            "dr_vital": {
                "name": "Dr. Vital",
                "type": "Análise de Exames",
                "capabilities": []
            },
            "yolo": {
                "name": "YOLO",
                "type": "Detecção de Objetos",
                "url": "yolo-service-yolo-detection.0sw627.easypanel.host"
            }
        }
        
        # Procura por capacidades
        if 'sofia' in content.lower():
            sofia_caps = re.findall(r'[-•]\s*([^-•\n]+)', content)
            ai_systems["sofia"]["capabilities"] = [cap.strip() for cap in sofia_caps[:10]]
        
        return ai_systems
    
    def extract_environment_vars(self, content: str) -> Dict:
        """Extrai variáveis de ambiente"""
        env_vars = {}
        
        # Padrão para variáveis de ambiente
        env_pattern = r'([A-Z_]+)=([^\n]+)'
        matches = re.findall(env_pattern, content)
        
        for var_name, var_value in matches:
            if var_name.startswith('VITE_') or var_name.startswith('SUPABASE_'):
                env_vars[var_name] = {
                    "name": var_name,
                    "example": var_value[:50] if not any(x in var_value for x in ['sua-', 'your-']) else "[REQUIRED]"
                }
        
        return env_vars
    
    def analyze_document(self, doc_name: str, category: str):
        """Analisa um documento específico"""
        filepath = self.docs_dir / doc_name
        
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
                
                print(f"  📄 {doc_name} ({len(content.split())} palavras)")
                
                # Análise específica por categoria
                if "estrutura" in category or "structure" in category:
                    self.context["project"]["tech_stack"] = self.extract_tech_stack(content)
                
                elif "database" in category:
                    tables = self.extract_database_tables(content)
                    self.context["database"]["tables"].update(tables)
                    rpcs = self.extract_rpcs(content)
                    self.context["database"]["rpcs"].update(rpcs)
                
                elif "component" in category:
                    comps = self.extract_components_detailed(content)
                    self.context["components"]["ui"].extend(comps["ui"])
                    self.context["components"]["features"].extend(comps["features"])
                    self.context["components"]["pages"].extend(comps["pages"])
                
                elif "hook" in category:
                    hooks = self.extract_hooks_detailed(content)
                    for hook_type, hook_list in hooks.items():
                        if hook_type in self.context["hooks"]:
                            self.context["hooks"][hook_type].extend(hook_list)
                
                elif "edge" in category or "function" in category:
                    funcs = self.extract_edge_functions(content)
                    self.context["edge_functions"].extend(funcs)
                
                elif "ai" in category:
                    ai = self.extract_ai_systems(content)
                    self.context["ai_systems"].update(ai)
                
                elif "environment" in category or "env" in category:
                    env = self.extract_environment_vars(content)
                    self.context["environment"].update(env)
                
        except FileNotFoundError:
            print(f"  ⚠️  {doc_name} não encontrado")
        except Exception as e:
            print(f"  ❌ Erro ao analisar {doc_name}: {str(e)}")
    
    def extract_all_context(self):
        """Extrai contexto de todos os documentos"""
        
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
            ("DATABASE_SCHEMA.md", "database"),
            ("AI_SYSTEMS.md", "ai_systems"),
            ("YOLO_INTEGRACAO_COMPLETA.md", "ai_systems"),
            ("COMMON_ERRORS.md", "errors")
        ]
        
        print("\n🔍 Extraindo contexto detalhado...")
        print("="*80)
        
        for doc_name, category in docs_to_analyze:
            self.analyze_document(doc_name, category)
        
        # Remove duplicatas
        for key in self.context["components"]:
            self.context["components"][key] = list(set(self.context["components"][key]))
        
        for key in self.context["hooks"]:
            self.context["hooks"][key] = list(set(self.context["hooks"][key]))
    
    def save_context(self, output_file: str = "docs/CONTEXT_COMPLETE.json"):
        """Salva contexto completo"""
        output_path = Path(output_file)
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(self.context, f, indent=2, ensure_ascii=False)
        
        print(f"\n✅ Contexto salvo em: {output_file}")
    
    def print_summary(self):
        """Imprime resumo do contexto extraído"""
        print("\n" + "="*80)
        print("📊 RESUMO DO CONTEXTO EXTRAÍDO")
        print("="*80)
        
        print(f"\n🏗️  PROJETO: {self.context['project']['name']}")
        print(f"   Stack: {', '.join(self.context['project']['tech_stack'][:10])}")
        
        print(f"\n💾 DATABASE:")
        print(f"   • Tabelas: {len(self.context['database']['tables'])}")
        print(f"   • RPCs: {len(self.context['database']['rpcs'])}")
        
        print(f"\n🧩 COMPONENTES:")
        print(f"   • UI: {len(self.context['components']['ui'])}")
        print(f"   • Features: {len(self.context['components']['features'])}")
        print(f"   • Pages: {len(self.context['components']['pages'])}")
        
        print(f"\n🪝 HOOKS:")
        total_hooks = sum(len(v) for v in self.context['hooks'].values())
        print(f"   • Total: {total_hooks}")
        for hook_type, hooks in self.context['hooks'].items():
            if hooks:
                print(f"   • {hook_type.capitalize()}: {len(hooks)}")
        
        print(f"\n⚡ EDGE FUNCTIONS: {len(self.context['edge_functions'])}")
        
        print(f"\n🤖 SISTEMAS DE IA:")
        for ai_name, ai_info in self.context['ai_systems'].items():
            if ai_info:
                print(f"   • {ai_info.get('name', ai_name)}: {ai_info.get('type', 'N/A')}")
        
        print(f"\n🔐 VARIÁVEIS DE AMBIENTE: {len(self.context['environment'])}")
        
        print("\n" + "="*80)

def main():
    print("🚀 Iniciando extração detalhada de contexto...")
    
    extractor = DetailedContextExtractor()
    extractor.extract_all_context()
    extractor.print_summary()
    extractor.save_context()
    
    print("\n✨ Extração concluída com sucesso!")

if __name__ == "__main__":
    main()
