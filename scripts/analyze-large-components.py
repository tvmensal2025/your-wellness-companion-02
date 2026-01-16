#!/usr/bin/env python3
"""
🔍 ANÁLISE DETALHADA DOS 7 MAIORES COMPONENTES
==============================================
Explica por que cada arquivo tem tantas linhas
"""

import os
import re

def analyze_file(filepath):
    """Analisa um arquivo e retorna estatísticas detalhadas"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            lines = content.split('\n')
    except:
        return None
    
    stats = {
        'total_lines': len(lines),
        'imports': 0,
        'interfaces': 0,
        'types': 0,
        'functions': 0,
        'components': 0,
        'hooks': 0,
        'jsx_lines': 0,
        'comments': 0,
        'empty_lines': 0,
        'data_objects': 0,
        'state_vars': 0,
        'effects': 0,
    }
    
    # Contar diferentes elementos
    for line in lines:
        stripped = line.strip()
        
        if not stripped:
            stats['empty_lines'] += 1
        elif stripped.startswith('import ') or stripped.startswith('from '):
            stats['imports'] += 1
        elif stripped.startswith('//') or stripped.startswith('/*') or stripped.startswith('*'):
            stats['comments'] += 1
        elif 'interface ' in line:
            stats['interfaces'] += 1
        elif 'type ' in line and '=' in line:
            stats['types'] += 1
        elif 'const ' in line and '=>' in line:
            stats['functions'] += 1
        elif 'useState' in line:
            stats['state_vars'] += 1
        elif 'useEffect' in line:
            stats['effects'] += 1
        elif '<' in line and '>' in line and ('className' in line or 'onClick' in line):
            stats['jsx_lines'] += 1
    
    # Contar hooks customizados
    stats['hooks'] = len(re.findall(r'const \w+ = use\w+\(', content))
    
    # Contar componentes internos
    stats['components'] = len(re.findall(r'const \w+: React\.FC', content))
    stats['components'] += len(re.findall(r'function \w+\([^)]*\)\s*{', content))
    
    # Contar objetos de dados grandes
    stats['data_objects'] = len(re.findall(r'const \w+ = \{[\s\S]{500,}?\};', content))
    stats['data_objects'] += len(re.findall(r'const \w+ = \[[\s\S]{500,}?\];', content))
    
    return stats

def get_file_purpose(filepath, content):
    """Determina o propósito principal do arquivo"""
    purposes = []
    
    if 'AdminPage' in filepath:
        purposes.append("Página principal de administração com múltiplas seções")
    if 'ProfessionalEvaluation' in filepath:
        purposes.append("Avaliação profissional completa com formulários extensos")
    if 'SessionTemplates' in filepath:
        purposes.append("CRUD completo de templates de sessões")
    if 'CourseManagement' in filepath:
        purposes.append("Gestão de cursos, módulos e lições")
    if 'MedicalDocuments' in filepath:
        purposes.append("Upload, listagem e análise de documentos médicos")
    if 'SaboteurTest' in filepath:
        purposes.append("Teste psicológico com múltiplas perguntas e resultados")
    if 'CompactMealPlan' in filepath:
        purposes.append("Modal de plano alimentar com múltiplos layouts")
    
    return purposes

def main():
    files = [
        ('src/pages/ProfessionalEvaluationPage.tsx', 2539),
        ('src/components/admin/SessionTemplates.tsx', 1312),
        ('src/components/admin/CourseManagementNew.tsx', 1273),
        ('src/pages/AdminPage.tsx', 1228),
        ('src/components/dashboard/MedicalDocumentsSection.tsx', 1210),
        ('src/components/SaboteurTest.tsx', 1120),
        ('src/components/meal-plan/CompactMealPlanModal.tsx', 1037),
    ]
    
    print("""
╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║   🔍 ANÁLISE DETALHADA DOS 7 MAIORES COMPONENTES                             ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
""")

    for filepath, expected_lines in files:
        if not os.path.exists(filepath):
            print(f"❌ Arquivo não encontrado: {filepath}")
            continue
            
        stats = analyze_file(filepath)
        if not stats:
            continue
        
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        purposes = get_file_purpose(filepath, content)
        filename = os.path.basename(filepath)
        
        print(f"""
┌──────────────────────────────────────────────────────────────────────────────┐
│  📄 {filename:<68} │
│  📏 {stats['total_lines']} linhas                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
""")
        
        # Propósito
        print("   🎯 PROPÓSITO:")
        for p in purposes:
            print(f"      • {p}")
        
        # Estatísticas
        print(f"""
   📊 COMPOSIÇÃO DO ARQUIVO:
   ┌─────────────────────────────────────────────────────────────────────────┐
   │  Imports:           {stats['imports']:4} linhas  │  Interfaces/Types: {stats['interfaces'] + stats['types']:4}      │
   │  useState:          {stats['state_vars']:4} vars    │  useEffect:        {stats['effects']:4}      │
   │  Hooks customizados:{stats['hooks']:4}        │  Componentes:      {stats['components']:4}      │
   │  JSX (estimado):    {stats['jsx_lines']:4} linhas  │  Comentários:      {stats['comments']:4}      │
   │  Linhas vazias:     {stats['empty_lines']:4}        │  Objetos de dados: {stats['data_objects']:4}      │
   └─────────────────────────────────────────────────────────────────────────┘
""")
        
        # Análise específica por arquivo
        print("   🔍 POR QUE TEM TANTAS LINHAS:")
        
        if 'ProfessionalEvaluation' in filepath:
            print("""
      1. 📋 FORMULÁRIOS EXTENSOS
         - Avaliação física completa (peso, altura, medidas)
         - Avaliação nutricional (hábitos alimentares)
         - Avaliação psicológica (comportamento, motivação)
         - Histórico médico detalhado
         
      2. 📊 MÚLTIPLAS SEÇÕES
         - Dados pessoais
         - Composição corporal
         - Bioimpedância
         - Metas e objetivos
         - Plano de ação
         
      3. 🎨 UI COMPLEXA
         - Gráficos e visualizações
         - Tabs para navegação
         - Modais de edição
         - Validações de formulário
         
      💡 SOLUÇÃO: Dividir em sub-páginas ou steps (wizard)
""")
        
        elif 'SessionTemplates' in filepath:
            print("""
      1. 📝 CRUD COMPLETO
         - Criar template
         - Editar template
         - Deletar template
         - Listar templates
         
      2. 🔧 EDITOR DE CONTEÚDO
         - Editor de perguntas
         - Editor de seções
         - Preview do template
         - Configurações avançadas
         
      3. 📊 TIPOS DE SESSÃO
         - Sessões de coaching
         - Sessões de avaliação
         - Sessões de acompanhamento
         
      💡 SOLUÇÃO: Já tem pasta refatorada em sessions/templates/
         Migrar imports e deletar este arquivo
""")
        
        elif 'CourseManagement' in filepath:
            print("""
      1. 📚 GESTÃO HIERÁRQUICA
         - Cursos (CRUD)
         - Módulos (CRUD)
         - Lições (CRUD)
         - Recursos (CRUD)
         
      2. 🎬 UPLOAD DE MÍDIA
         - Upload de vídeos
         - Upload de thumbnails
         - Upload de materiais
         
      3. 📊 ESTATÍSTICAS
         - Alunos matriculados
         - Progresso dos alunos
         - Engajamento
         
      💡 SOLUÇÃO: Já tem pasta refatorada em admin/course-management/
         Migrar imports e deletar este arquivo
""")
        
        elif 'AdminPage' in filepath:
            print("""
      1. 🏠 HUB DE ADMINISTRAÇÃO
         - Renderiza 20+ seções diferentes
         - Menu lateral com navegação
         - Controle de permissões
         
      2. 📊 SEÇÕES INCLUÍDAS
         - Dashboard
         - Usuários
         - Cursos
         - Sessões
         - Desafios
         - Relatórios
         - Configurações
         - E muito mais...
         
      3. 🔄 LÓGICA DE ROTEAMENTO
         - Switch entre seções
         - Estado de navegação
         - Lazy loading de componentes
         
      💡 SOLUÇÃO: Extrair cada seção para componente separado
         Usar React Router para sub-rotas
""")
        
        elif 'MedicalDocuments' in filepath:
            print("""
      1. 📤 UPLOAD DE DOCUMENTOS
         - Upload de exames
         - Upload de laudos
         - Upload de prescrições
         
      2. 📋 LISTAGEM E FILTROS
         - Lista de documentos
         - Filtros por tipo
         - Filtros por data
         - Busca por texto
         
      3. 🤖 ANÁLISE COM IA
         - Integração com YOLO
         - Integração com Gemini
         - Processamento de imagens
         - Geração de relatórios
         
      💡 SOLUÇÃO: Já tem pasta refatorada em dashboard/medical-documents/
         Migrar imports e deletar este arquivo
""")
        
        elif 'SaboteurTest' in filepath:
            print("""
      1. 📝 QUESTIONÁRIO EXTENSO
         - 50+ perguntas
         - Múltiplas categorias
         - Escala Likert
         
      2. 📊 CÁLCULO DE RESULTADOS
         - Algoritmo de pontuação
         - Identificação de sabotadores
         - Ranking de sabotadores
         
      3. 📄 GERAÇÃO DE RELATÓRIO
         - Relatório em PDF
         - Gráficos de radar
         - Recomendações personalizadas
         - Compartilhamento
         
      💡 SOLUÇÃO: Já tem pasta refatorada em saboteur-test/
         Migrar imports e deletar este arquivo
""")
        
        elif 'CompactMealPlan' in filepath:
            print("""
      1. 🍽️ MÚLTIPLOS LAYOUTS
         - Layout compacto
         - Layout expandido
         - Layout para impressão
         - Layout mobile
         
      2. 📊 DADOS NUTRICIONAIS
         - Calorias por refeição
         - Macros (proteína, carbs, gordura)
         - Micronutrientes
         - Substituições
         
      3. 🎨 UI RICA
         - Cards de refeição
         - Gráficos nutricionais
         - Animações
         - Responsividade
         
      💡 SOLUÇÃO: Extrair cada layout para componente separado
         Usar lazy loading para layouts
""")

    # Resumo final
    print("""
┌──────────────────────────────────────────────────────────────────────────────┐
│  ✅ RESUMO: POR QUE ESSES ARQUIVOS SÃO TÃO GRANDES?                          │
└──────────────────────────────────────────────────────────────────────────────┘

   Os 7 arquivos são grandes porque:
   
   1. 📋 FUNCIONALIDADE COMPLEXA
      - São features completas, não componentes simples
      - Incluem CRUD, formulários, validações, etc.
   
   2. 🔄 CÓDIGO NÃO MODULARIZADO
      - Tudo em um só arquivo
      - Sem extração de hooks
      - Sem extração de sub-componentes
   
   3. 📊 DADOS INLINE
      - Arrays de opções dentro do componente
      - Objetos de configuração grandes
      - Tipos/interfaces no mesmo arquivo
   
   4. 🎨 UI VERBOSA
      - JSX extenso com muitas classes Tailwind
      - Muitos elementos repetitivos
      - Falta de componentes reutilizáveis

┌──────────────────────────────────────────────────────────────────────────────┐
│  💡 AÇÃO IMEDIATA: 4 ARQUIVOS JÁ TÊM VERSÃO REFATORADA!                      │
└──────────────────────────────────────────────────────────────────────────────┘

   Estes arquivos JÁ FORAM REFATORADOS e podem ser DELETADOS após migrar imports:
   
   ✅ SessionTemplates.tsx      → sessions/templates/
   ✅ CourseManagementNew.tsx   → admin/course-management/
   ✅ MedicalDocumentsSection   → dashboard/medical-documents/
   ✅ SaboteurTest.tsx          → saboteur-test/
   
   Estes arquivos AINDA PRECISAM ser refatorados:
   
   ❌ ProfessionalEvaluationPage.tsx (2.539 linhas) - MAIOR PRIORIDADE
   ❌ AdminPage.tsx (1.228 linhas)
   ❌ CompactMealPlanModal.tsx (1.037 linhas)
""")

if __name__ == "__main__":
    main()
