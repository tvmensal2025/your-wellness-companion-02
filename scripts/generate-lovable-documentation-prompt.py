#!/usr/bin/env python3
"""
🎯 Gerador de Prompt para Documentação Completa do Lovable
==========================================================

Este script gera um prompt otimizado para pedir documentação completa
ao Lovable/Cursor/Kiro sem erros de exportação.

O problema: IAs tendem a truncar ou esquecer partes quando pedimos
documentação muito grande de uma vez.

A solução: Dividir em seções menores e pedir de forma estruturada.
"""

import json
from datetime import datetime

# ============================================================
# CONFIGURAÇÃO DO PROJETO
# ============================================================

PROJECT_CONFIG = {
    "name": "MaxNutrition",
    "description": "Plataforma de saúde e nutrição com IA",
    "tech_stack": {
        "frontend": ["React", "TypeScript", "Vite", "TailwindCSS", "shadcn/ui"],
        "backend": ["Supabase", "Edge Functions", "PostgreSQL"],
        "ai": ["YOLO", "Gemini", "OpenAI"],
        "infra": ["Docker", "EasyPanel", "MinIO"]
    }
}

# ============================================================
# SEÇÕES DE DOCUMENTAÇÃO
# ============================================================

DOCUMENTATION_SECTIONS = [
    {
        "id": 1,
        "name": "Estrutura do Projeto",
        "files": ["src/", "supabase/", "docs/"],
        "prompt": """
Analise a estrutura completa do projeto e documente:

1. **Árvore de Diretórios Principal**
   - src/components/ (listar todas as subpastas)
   - src/hooks/ (listar todos os hooks)
   - src/pages/ (listar todas as páginas)
   - supabase/functions/ (listar todas as edge functions)

2. **Arquivos de Configuração**
   - package.json (dependências principais)
   - vite.config.ts
   - tailwind.config.ts
   - tsconfig.json

Formato: Markdown com árvore de diretórios
"""
    },
    {
        "id": 2,
        "name": "Schema do Banco de Dados",
        "files": ["supabase/migrations/", "src/integrations/supabase/types.ts"],
        "prompt": """
Documente o schema completo do banco de dados:

1. **Tabelas Principais** (para cada tabela):
   - Nome da tabela
   - Colunas com tipos
   - Chaves primárias e estrangeiras
   - Índices
   - RLS policies

2. **Relacionamentos**
   - Diagrama de relacionamentos (formato texto)
   - FKs entre tabelas

3. **Funções RPC**
   - Nome e parâmetros
   - O que cada uma faz

Formato: Tabelas Markdown + SQL de referência
"""
    },
    {
        "id": 3,
        "name": "Componentes React",
        "files": ["src/components/"],
        "prompt": """
Documente os componentes React principais:

1. **Componentes de UI Base** (src/components/ui/)
   - Lista de todos os componentes
   - Props de cada um

2. **Componentes de Feature** (por pasta):
   - sofia/ - Chat com IA
   - dr-vital/ - Análise de saúde
   - exercise/ - Sistema de exercícios
   - nutrition/ - Nutrição
   - admin/ - Painel admin
   - dashboard/ - Dashboard principal

Para cada componente importante:
- Nome e localização
- Props/Interface
- Dependências (hooks usados)
- Exemplo de uso

Formato: Markdown com blocos de código TypeScript
"""
    },
    {
        "id": 4,
        "name": "Hooks Customizados",
        "files": ["src/hooks/"],
        "prompt": """
Documente todos os hooks customizados:

1. **Hooks de Autenticação**
   - useAuth, useAdminMode, useAdminPermissions

2. **Hooks de Dados**
   - useUserProfile, useHealthData, useNutritionData
   - useGamification, useChallenges

3. **Hooks de Feature**
   - useSofiaAnalysis, useDrVital
   - useExerciseProgram, useMealPlan

Para cada hook:
- Nome e arquivo
- Parâmetros
- Retorno (interface)
- Exemplo de uso
- Queries/Mutations do React Query

Formato: Markdown com TypeScript
"""
    },
    {
        "id": 5,
        "name": "Edge Functions",
        "files": ["supabase/functions/"],
        "prompt": """
Documente todas as Edge Functions:

1. **Lista Completa de Functions**
   - Nome da function
   - Endpoint
   - Método HTTP
   - Autenticação necessária

2. **Para cada function importante**:
   - Propósito
   - Request body (interface)
   - Response (interface)
   - Erros possíveis
   - Exemplo de chamada

3. **Integrações Externas**
   - YOLO Service
   - Gemini API
   - WhatsApp API

Formato: Markdown com exemplos curl/fetch
"""
    },
    {
        "id": 6,
        "name": "Fluxos de Navegação",
        "files": ["src/App.tsx", "src/pages/"],
        "prompt": """
Documente os fluxos de navegação:

1. **Rotas Públicas**
   - /auth, /terms, /privacy, /install

2. **Rotas Protegidas**
   - /dashboard (e sub-rotas)
   - /sofia, /dr-vital
   - /exercises, /nutrition
   - /admin (e sub-rotas)

3. **Fluxo de Autenticação**
   - Login → Onboarding → Dashboard
   - Verificação de admin
   - Redirecionamentos

4. **Navegação Mobile**
   - Bottom navigation
   - Sidebar
   - Gestos

Formato: Diagrama de fluxo em texto + Markdown
"""
    },
    {
        "id": 7,
        "name": "Sistema de IA",
        "files": ["src/components/sofia/", "src/components/dr-vital/", "supabase/functions/"],
        "prompt": """
Documente o sistema de IA:

1. **Sofia (Nutricionista IA)**
   - Fluxo de chat
   - Análise de imagens de alimentos
   - Integração YOLO → Gemini
   - Cálculos nutricionais

2. **Dr. Vital (Médico IA)**
   - Análise de exames
   - Interpretação de resultados
   - Geração de relatórios

3. **Fluxo YOLO**
   - URL do serviço
   - Formato de request/response
   - Fallback para Gemini

4. **Prompts e Templates**
   - Prompts do sistema
   - Personalização por usuário

Formato: Markdown com diagramas de sequência em texto
"""
    },
    {
        "id": 8,
        "name": "Sistema de Gamificação",
        "files": ["src/hooks/gamification/", "src/components/gamification/"],
        "prompt": """
Documente o sistema de gamificação:

1. **Pontos e XP**
   - Como são calculados
   - Tabelas envolvidas
   - Hooks relacionados

2. **Desafios**
   - Tipos de desafios
   - Participação
   - Recompensas

3. **Ranking**
   - Cálculo de posição
   - Níveis/Tiers
   - Badges

4. **Missões Diárias**
   - Tipos de missões
   - Reset diário
   - Streaks

Formato: Markdown com tabelas de pontuação
"""
    },
    {
        "id": 9,
        "name": "Variáveis de Ambiente",
        "files": [".env.example", "env.example"],
        "prompt": """
Documente todas as variáveis de ambiente:

1. **Supabase**
   - VITE_SUPABASE_URL
   - VITE_SUPABASE_ANON_KEY

2. **APIs Externas**
   - YOLO_SERVICE_URL
   - GEMINI_API_KEY
   - OPENAI_API_KEY

3. **Storage**
   - MINIO_ENDPOINT
   - MINIO_ACCESS_KEY
   - MINIO_SECRET_KEY

4. **Outros**
   - VITE_APP_URL
   - Flags de feature

Para cada variável:
- Nome
- Descrição
- Exemplo de valor
- Obrigatória ou opcional

Formato: Tabela Markdown
"""
    },
    {
        "id": 10,
        "name": "Guia de Deploy",
        "files": ["Dockerfile", "docker-compose.yml", "README-DEPLOY.md"],
        "prompt": """
Documente o processo de deploy:

1. **Requisitos**
   - Node.js version
   - Dependências do sistema

2. **Build Local**
   - npm install
   - npm run build
   - npm run dev

3. **Deploy Docker**
   - Dockerfile explicado
   - docker-compose.yml
   - Variáveis necessárias

4. **Deploy EasyPanel**
   - Configuração de apps
   - Domínios
   - SSL

5. **Supabase**
   - Migrations
   - Edge Functions deploy
   - Storage buckets

Formato: Markdown com comandos shell
"""
    }
]

# ============================================================
# GERADOR DE PROMPTS
# ============================================================

def generate_single_section_prompt(section: dict) -> str:
    """Gera prompt para uma única seção"""
    return f"""
# 📚 Documentação: {section['name']}

## Arquivos Relevantes
{chr(10).join(f"- `{f}`" for f in section['files'])}

## Instruções
{section['prompt']}

## Regras de Formatação
1. Use Markdown válido
2. Inclua blocos de código com syntax highlighting
3. Seja completo mas conciso
4. Não truncar - se for muito grande, avise e continue
5. Use emojis para organização visual

## Output
Gere a documentação completa desta seção.
"""

def generate_master_prompt() -> str:
    """Gera o prompt mestre para documentação completa"""
    sections_list = "\n".join([
        f"{s['id']}. {s['name']}" for s in DOCUMENTATION_SECTIONS
    ])
    
    return f"""
# 🎯 COMANDO MESTRE: Documentação Completa MaxNutrition

## Contexto
Preciso de documentação COMPLETA do projeto MaxNutrition para exportar sem erros.

## Estratégia Anti-Truncamento
Para evitar erros de exportação, vamos documentar em **10 seções separadas**.

## Seções
{sections_list}

## Como Proceder
1. Vou pedir UMA seção por vez
2. Você documenta COMPLETAMENTE aquela seção
3. Eu confirmo e peço a próxima
4. No final, temos documentação completa

## Começar
Responda "PRONTO" e eu peço a primeira seção.

---

## Alternativa: Seção Específica
Se quiser uma seção específica, use:
"Documente a seção [NÚMERO]: [NOME]"

Exemplo: "Documente a seção 2: Schema do Banco de Dados"
"""

def generate_all_prompts_file() -> str:
    """Gera arquivo com todos os prompts"""
    output = f"""# 📚 Prompts para Documentação Completa - MaxNutrition
> Gerado em: {datetime.now().strftime('%Y-%m-%d %H:%M')}

## 🎯 Como Usar

### Opção 1: Seção por Seção (Recomendado)
Copie e cole cada seção separadamente no Lovable/Cursor/Kiro.
Isso evita truncamento e erros de exportação.

### Opção 2: Prompt Mestre
Use o prompt mestre para guiar a IA através das seções.

---

## 📋 Prompt Mestre

```
{generate_master_prompt()}
```

---

## 📑 Prompts por Seção

"""
    
    for section in DOCUMENTATION_SECTIONS:
        output += f"""
### Seção {section['id']}: {section['name']}

```
{generate_single_section_prompt(section)}
```

---
"""
    
    return output

def generate_quick_commands() -> str:
    """Gera comandos rápidos para copiar"""
    return """
# ⚡ Comandos Rápidos para Lovable/Cursor/Kiro

## Documentação Completa (Passo a Passo)

### Passo 1 - Iniciar
```
Vou precisar de documentação completa do projeto. 
Vamos fazer em 10 seções para evitar truncamento.
Comece com a Seção 1: Estrutura do Projeto.
Liste todos os diretórios em src/, supabase/ e docs/.
```

### Passo 2 - Banco de Dados
```
Agora Seção 2: Schema do Banco de Dados.
Liste todas as tabelas com suas colunas e tipos.
Inclua as RLS policies e funções RPC.
```

### Passo 3 - Componentes
```
Seção 3: Componentes React.
Documente os componentes principais de cada pasta em src/components/.
Inclua props e exemplos de uso.
```

### Passo 4 - Hooks
```
Seção 4: Hooks Customizados.
Liste todos os hooks em src/hooks/ com seus parâmetros e retornos.
```

### Passo 5 - Edge Functions
```
Seção 5: Edge Functions.
Documente todas as functions em supabase/functions/.
Inclua endpoints, métodos e exemplos de request/response.
```

### Passo 6 - Navegação
```
Seção 6: Fluxos de Navegação.
Mapeie todas as rotas e o fluxo de autenticação.
```

### Passo 7 - Sistema IA
```
Seção 7: Sistema de IA.
Documente Sofia, Dr. Vital e a integração YOLO.
```

### Passo 8 - Gamificação
```
Seção 8: Sistema de Gamificação.
Documente pontos, XP, desafios e ranking.
```

### Passo 9 - Variáveis
```
Seção 9: Variáveis de Ambiente.
Liste todas as env vars necessárias com descrições.
```

### Passo 10 - Deploy
```
Seção 10: Guia de Deploy.
Documente o processo completo de build e deploy.
```

---

## 🚀 Comando Único (Se a IA for boa)

```
Gere documentação COMPLETA do projeto MaxNutrition em formato Markdown.

IMPORTANTE - Para evitar truncamento:
1. Documente seção por seção
2. Não pule nenhuma parte
3. Se ficar muito grande, divida em partes e continue

Seções obrigatórias:
1. Estrutura de diretórios (src/, supabase/, docs/)
2. Schema do banco (tabelas, colunas, RLS)
3. Componentes React principais
4. Hooks customizados
5. Edge Functions
6. Rotas e navegação
7. Sistema de IA (Sofia, Dr. Vital, YOLO)
8. Gamificação
9. Variáveis de ambiente
10. Guia de deploy

Formato: Markdown com código TypeScript/SQL quando relevante.
```
"""

# ============================================================
# MAIN
# ============================================================

def main():
    print("🎯 Gerador de Prompts para Documentação Lovable")
    print("=" * 50)
    
    # Gerar arquivo completo
    full_prompts = generate_all_prompts_file()
    quick_commands = generate_quick_commands()
    
    # Salvar arquivo
    output_file = "docs/PROMPTS_DOCUMENTACAO_LOVABLE.md"
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(full_prompts)
        f.write("\n\n")
        f.write(quick_commands)
    
    print(f"✅ Arquivo gerado: {output_file}")
    print()
    print("📋 Resumo das Seções:")
    for section in DOCUMENTATION_SECTIONS:
        print(f"   {section['id']}. {section['name']}")
    
    print()
    print("💡 Dica: Use os comandos rápidos no final do arquivo!")
    print("💡 Copie seção por seção para evitar truncamento.")

if __name__ == "__main__":
    main()
