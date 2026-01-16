# 📚 Prompts para Documentação Completa - MaxNutrition
> Gerado em: 2026-01-16 16:47

## 🎯 Como Usar

### Opção 1: Seção por Seção (Recomendado)
Copie e cole cada seção separadamente no Lovable/Cursor/Kiro.
Isso evita truncamento e erros de exportação.

### Opção 2: Prompt Mestre
Use o prompt mestre para guiar a IA através das seções.

---

## 📋 Prompt Mestre

```

# 🎯 COMANDO MESTRE: Documentação Completa MaxNutrition

## Contexto
Preciso de documentação COMPLETA do projeto MaxNutrition para exportar sem erros.

## Estratégia Anti-Truncamento
Para evitar erros de exportação, vamos documentar em **10 seções separadas**.

## Seções
1. Estrutura do Projeto
2. Schema do Banco de Dados
3. Componentes React
4. Hooks Customizados
5. Edge Functions
6. Fluxos de Navegação
7. Sistema de IA
8. Sistema de Gamificação
9. Variáveis de Ambiente
10. Guia de Deploy

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

```

---

## 📑 Prompts por Seção


### Seção 1: Estrutura do Projeto

```

# 📚 Documentação: Estrutura do Projeto

## Arquivos Relevantes
- `src/`
- `supabase/`
- `docs/`

## Instruções

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


## Regras de Formatação
1. Use Markdown válido
2. Inclua blocos de código com syntax highlighting
3. Seja completo mas conciso
4. Não truncar - se for muito grande, avise e continue
5. Use emojis para organização visual

## Output
Gere a documentação completa desta seção.

```

---

### Seção 2: Schema do Banco de Dados

```

# 📚 Documentação: Schema do Banco de Dados

## Arquivos Relevantes
- `supabase/migrations/`
- `src/integrations/supabase/types.ts`

## Instruções

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


## Regras de Formatação
1. Use Markdown válido
2. Inclua blocos de código com syntax highlighting
3. Seja completo mas conciso
4. Não truncar - se for muito grande, avise e continue
5. Use emojis para organização visual

## Output
Gere a documentação completa desta seção.

```

---

### Seção 3: Componentes React

```

# 📚 Documentação: Componentes React

## Arquivos Relevantes
- `src/components/`

## Instruções

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


## Regras de Formatação
1. Use Markdown válido
2. Inclua blocos de código com syntax highlighting
3. Seja completo mas conciso
4. Não truncar - se for muito grande, avise e continue
5. Use emojis para organização visual

## Output
Gere a documentação completa desta seção.

```

---

### Seção 4: Hooks Customizados

```

# 📚 Documentação: Hooks Customizados

## Arquivos Relevantes
- `src/hooks/`

## Instruções

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


## Regras de Formatação
1. Use Markdown válido
2. Inclua blocos de código com syntax highlighting
3. Seja completo mas conciso
4. Não truncar - se for muito grande, avise e continue
5. Use emojis para organização visual

## Output
Gere a documentação completa desta seção.

```

---

### Seção 5: Edge Functions

```

# 📚 Documentação: Edge Functions

## Arquivos Relevantes
- `supabase/functions/`

## Instruções

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


## Regras de Formatação
1. Use Markdown válido
2. Inclua blocos de código com syntax highlighting
3. Seja completo mas conciso
4. Não truncar - se for muito grande, avise e continue
5. Use emojis para organização visual

## Output
Gere a documentação completa desta seção.

```

---

### Seção 6: Fluxos de Navegação

```

# 📚 Documentação: Fluxos de Navegação

## Arquivos Relevantes
- `src/App.tsx`
- `src/pages/`

## Instruções

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


## Regras de Formatação
1. Use Markdown válido
2. Inclua blocos de código com syntax highlighting
3. Seja completo mas conciso
4. Não truncar - se for muito grande, avise e continue
5. Use emojis para organização visual

## Output
Gere a documentação completa desta seção.

```

---

### Seção 7: Sistema de IA

```

# 📚 Documentação: Sistema de IA

## Arquivos Relevantes
- `src/components/sofia/`
- `src/components/dr-vital/`
- `supabase/functions/`

## Instruções

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


## Regras de Formatação
1. Use Markdown válido
2. Inclua blocos de código com syntax highlighting
3. Seja completo mas conciso
4. Não truncar - se for muito grande, avise e continue
5. Use emojis para organização visual

## Output
Gere a documentação completa desta seção.

```

---

### Seção 8: Sistema de Gamificação

```

# 📚 Documentação: Sistema de Gamificação

## Arquivos Relevantes
- `src/hooks/gamification/`
- `src/components/gamification/`

## Instruções

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


## Regras de Formatação
1. Use Markdown válido
2. Inclua blocos de código com syntax highlighting
3. Seja completo mas conciso
4. Não truncar - se for muito grande, avise e continue
5. Use emojis para organização visual

## Output
Gere a documentação completa desta seção.

```

---

### Seção 9: Variáveis de Ambiente

```

# 📚 Documentação: Variáveis de Ambiente

## Arquivos Relevantes
- `.env.example`
- `env.example`

## Instruções

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


## Regras de Formatação
1. Use Markdown válido
2. Inclua blocos de código com syntax highlighting
3. Seja completo mas conciso
4. Não truncar - se for muito grande, avise e continue
5. Use emojis para organização visual

## Output
Gere a documentação completa desta seção.

```

---

### Seção 10: Guia de Deploy

```

# 📚 Documentação: Guia de Deploy

## Arquivos Relevantes
- `Dockerfile`
- `docker-compose.yml`
- `README-DEPLOY.md`

## Instruções

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


## Regras de Formatação
1. Use Markdown válido
2. Inclua blocos de código com syntax highlighting
3. Seja completo mas conciso
4. Não truncar - se for muito grande, avise e continue
5. Use emojis para organização visual

## Output
Gere a documentação completa desta seção.

```

---



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
