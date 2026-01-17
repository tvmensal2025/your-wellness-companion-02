#!/usr/bin/env python3
"""
Gerador de Resumo Visual da Documentação
Cria visualizações e estatísticas em formato texto
"""

import json
from pathlib import Path
from typing import Dict, List

def load_analysis():
    """Carrega análise completa"""
    with open('docs/CONTEXT_COMPLETE.json', 'r', encoding='utf-8') as f:
        return json.load(f)

def print_header(title: str, char: str = "="):
    """Imprime cabeçalho formatado"""
    print(f"\n{char * 80}")
    print(f"{title:^80}")
    print(f"{char * 80}\n")

def print_bar_chart(data: Dict[str, int], title: str, max_width: int = 50):
    """Imprime gráfico de barras em ASCII"""
    print(f"\n📊 {title}")
    print("-" * 70)
    
    if not data:
        print("  (Sem dados)")
        return
    
    max_value = max(data.values()) if data.values() else 1
    
    for label, value in sorted(data.items(), key=lambda x: x[1], reverse=True):
        bar_length = int((value / max_value) * max_width)
        bar = "█" * bar_length
        print(f"  {label:.<30} {bar} {value}")

def print_tree(data: Dict, indent: int = 0, max_depth: int = 3):
    """Imprime estrutura em árvore"""
    if indent >= max_depth:
        return
    
    for key, value in data.items():
        prefix = "  " * indent + "├─ "
        if isinstance(value, dict):
            print(f"{prefix}{key}/")
            print_tree(value, indent + 1, max_depth)
        elif isinstance(value, list):
            print(f"{prefix}{key}/ ({len(value)} itens)")
        else:
            print(f"{prefix}{key}: {value}")

def generate_summary():
    """Gera resumo visual completo"""
    
    print_header("📚 MAXNUTRITION - RESUMO VISUAL DA DOCUMENTAÇÃO", "=")
    
    context = load_analysis()
    
    # 1. Informações do Projeto
    print_header("🏗️  INFORMAÇÕES DO PROJETO", "-")
    project = context['project']
    print(f"  Nome: {project['name']}")
    print(f"  Nome Completo: {project['full_name']}")
    print(f"  Descrição: {project['description']}")
    print(f"\n  Stack Tecnológica:")
    for i, tech in enumerate(project['tech_stack'], 1):
        print(f"    {i}. {tech}")
    
    # 2. Estatísticas do Banco de Dados
    print_header("💾 BANCO DE DADOS", "-")
    tables = context['database']['tables']
    print(f"  Total de Tabelas: {len(tables)}")
    
    # Categorizar tabelas
    categories = {
        'Usuários': [],
        'Gamificação': [],
        'Nutrição': [],
        'Saúde': [],
        'Exercícios': [],
        'Social': [],
        'Admin': [],
        'Cache': []
    }
    
    for table_name in tables.keys():
        if any(x in table_name for x in ['user', 'profile', 'anamnesis', 'preference']):
            categories['Usuários'].append(table_name)
        elif any(x in table_name for x in ['point', 'challenge', 'achievement', 'mission', 'goal']):
            categories['Gamificação'].append(table_name)
        elif any(x in table_name for x in ['food', 'meal', 'nutrition', 'sofia']):
            categories['Nutrição'].append(table_name)
        elif any(x in table_name for x in ['medical', 'health', 'google_fit', 'vital', 'sleep', 'mood', 'heart']):
            categories['Saúde'].append(table_name)
        elif any(x in table_name for x in ['exercise', 'workout']):
            categories['Exercícios'].append(table_name)
        elif any(x in table_name for x in ['feed', 'post', 'story', 'follow', 'community', 'conversation']):
            categories['Social'].append(table_name)
        elif any(x in table_name for x in ['admin', 'config', 'log']):
            categories['Admin'].append(table_name)
        elif any(x in table_name for x in ['cache']):
            categories['Cache'].append(table_name)
    
    print("\n  Tabelas por Categoria:")
    for category, table_list in categories.items():
        if table_list:
            print(f"    • {category}: {len(table_list)}")
    
    # Gráfico de barras
    category_counts = {k: len(v) for k, v in categories.items() if v}
    print_bar_chart(category_counts, "Distribuição de Tabelas", 40)
    
    # 3. Edge Functions
    print_header("⚡ EDGE FUNCTIONS", "-")
    functions = context['edge_functions']
    print(f"  Total de Functions: {len(functions)}")
    
    # Categorizar functions
    func_categories = {
        'Nutrição': 0,
        'Saúde': 0,
        'Google Fit': 0,
        'WhatsApp': 0,
        'Utilitários': 0
    }
    
    for func in functions:
        name = func['name']
        if any(x in name for x in ['sofia', 'food', 'nutrition', 'meal']):
            func_categories['Nutrição'] += 1
        elif any(x in name for x in ['medical', 'vital', 'exam']):
            func_categories['Saúde'] += 1
        elif 'google-fit' in name:
            func_categories['Google Fit'] += 1
        elif 'whatsapp' in name:
            func_categories['WhatsApp'] += 1
        else:
            func_categories['Utilitários'] += 1
    
    print_bar_chart(func_categories, "Functions por Categoria", 40)
    
    print("\n  Top 10 Functions:")
    for i, func in enumerate(functions[:10], 1):
        print(f"    {i:2}. {func['name']}")
        print(f"        └─ {func['description'][:60]}...")
    
    # 4. Hooks
    print_header("🪝 HOOKS CUSTOMIZADOS", "-")
    hooks = context['hooks']
    total_hooks = sum(len(v) for v in hooks.values())
    print(f"  Total de Hooks: {total_hooks}")
    
    hook_counts = {k.capitalize(): len(v) for k, v in hooks.items() if v}
    print_bar_chart(hook_counts, "Hooks por Categoria", 40)
    
    print("\n  Hooks por Categoria:")
    for category, hook_list in hooks.items():
        if hook_list:
            print(f"\n    {category.upper()}:")
            for hook in sorted(hook_list)[:5]:
                print(f"      • {hook}")
            if len(hook_list) > 5:
                print(f"      ... e mais {len(hook_list) - 5}")
    
    # 5. Sistemas de IA
    print_header("🤖 SISTEMAS DE IA", "-")
    ai_systems = context['ai_systems']
    
    for ai_name, ai_info in ai_systems.items():
        if ai_info and 'name' in ai_info:
            print(f"\n  {ai_info['name']}")
            print(f"    Tipo: {ai_info.get('type', 'N/A')}")
            if 'url' in ai_info:
                print(f"    URL: {ai_info['url']}")
            if 'capabilities' in ai_info and ai_info['capabilities']:
                print(f"    Capacidades: {len(ai_info['capabilities'])} listadas")
    
    # 6. Variáveis de Ambiente
    print_header("🔐 VARIÁVEIS DE AMBIENTE", "-")
    env_vars = context['environment']
    print(f"  Total de Variáveis: {len(env_vars)}")
    
    required = [k for k, v in env_vars.items() if v.get('example') == '[REQUIRED]']
    optional = [k for k in env_vars.keys() if k not in required]
    
    print(f"\n  Obrigatórias: {len(required)}")
    for var in required[:5]:
        print(f"    • {var}")
    
    print(f"\n  Opcionais: {len(optional)}")
    for var in optional[:5]:
        print(f"    • {var}")
    
    # 7. Resumo Final
    print_header("📊 RESUMO ESTATÍSTICO", "-")
    
    stats = {
        "Tabelas no Banco": len(tables),
        "Edge Functions": len(functions),
        "Hooks Customizados": total_hooks,
        "Sistemas de IA": len([ai for ai in ai_systems.values() if ai]),
        "Variáveis de Ambiente": len(env_vars),
        "Tecnologias no Stack": len(project['tech_stack'])
    }
    
    print_bar_chart(stats, "Métricas Principais", 50)
    
    # 8. Complexidade do Projeto
    print_header("🎯 ANÁLISE DE COMPLEXIDADE", "-")
    
    complexity_score = (
        len(tables) * 2 +
        len(functions) * 3 +
        total_hooks * 1 +
        len(project['tech_stack']) * 5
    )
    
    print(f"  Score de Complexidade: {complexity_score}")
    print(f"\n  Classificação: ", end="")
    
    if complexity_score < 200:
        print("🟢 BAIXA (Projeto Simples)")
    elif complexity_score < 500:
        print("🟡 MÉDIA (Projeto Moderado)")
    elif complexity_score < 1000:
        print("🟠 ALTA (Projeto Complexo)")
    else:
        print("🔴 MUITO ALTA (Projeto Enterprise)")
    
    print(f"\n  Estimativa de Linhas de Código: {complexity_score * 100:,}")
    print(f"  Tempo de Desenvolvimento Estimado: {complexity_score // 100} meses")
    print(f"  Tamanho da Equipe Recomendado: {max(3, complexity_score // 200)} desenvolvedores")
    
    # 9. Recomendações
    print_header("💡 RECOMENDAÇÕES", "-")
    
    recommendations = [
        "✅ Documentação extensa e bem estruturada",
        "✅ Arquitetura moderna e escalável",
        "✅ Uso de IA para redução de custos (YOLO)",
        "⚠️  Considerar refatoração de componentes grandes",
        "⚠️  Implementar testes automatizados (E2E)",
        "⚠️  Monitorar performance do bundle size",
        "💡 Adicionar documentação de APIs",
        "💡 Criar guia de contribuição",
        "💡 Implementar CI/CD completo"
    ]
    
    for rec in recommendations:
        print(f"  {rec}")
    
    print_header("✨ ANÁLISE CONCLUÍDA", "=")
    print("\n📁 Arquivos gerados:")
    print("  • docs/ANALYSIS_COMPLETE.json")
    print("  • docs/CONTEXT_COMPLETE.json")
    print("  • docs/RELATORIO_COMPLETO_DOCUMENTACAO.md")
    print("\n")

if __name__ == "__main__":
    generate_summary()
