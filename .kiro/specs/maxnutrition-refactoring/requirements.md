# Documento de Requisitos

## Introdução

Este documento define os requisitos para o refatoramento completo da plataforma MaxNutrition. O refatoramento visa melhorar a qualidade do código, performance, manutenibilidade e segurança de tipos em toda a base de código.

Baseado na análise detalhada em `docs/ANALISE_REFATORAMENTO_COMPLETA.md`, esta spec foca nos problemas de alta prioridade pendentes que precisam ser resolvidos.

### Situação Atual
- **1.612+ problemas** identificados no total
- **12 críticos** (10 já corrigidos)
- **45 alta prioridade** (em progresso)
- **1.555+ média prioridade** (pendentes)

### Correções Já Implementadas (NÃO incluir nas tarefas)
- ✅ @ts-nocheck removidos de 7 arquivos
- ✅ Catch vazio corrigido em SofiaPage.tsx
- ✅ DOMPurify adicionado em 3 arquivos
- ✅ .limit() adicionado em 20+ queries
- ✅ React Hooks Rules corrigidos em 3 arquivos
- ✅ React Hook Dependencies corrigidos em 6 arquivos
- ✅ Tipos `any` substituídos em 3 arquivos

### Metas de Sucesso
- Bundle size <100KB (gzip)
- Lighthouse >90
- 0 warnings ESLint críticos
- Componentes <500 linhas
- Todas queries com .limit()

## Glossário

- **Sistema_Refatoramento**: Sistema geral responsável pelas melhorias de qualidade de código
- **Divisor_Componentes**: Módulo responsável por dividir componentes grandes em unidades menores e focadas
- **Corretor_Hooks**: Módulo responsável por corrigir problemas de dependências de React Hooks
- **Aplicador_Tipos**: Módulo responsável por substituir tipos `any` por tipos TypeScript específicos
- **Otimizador_Queries**: Módulo responsável por adicionar `.limit()` e otimizações às queries Supabase
- **Otimizador_Bundle**: Módulo responsável por reduzir o tamanho do bundle através de lazy loading e code splitting
- **Componente_Grande**: Qualquer componente React que exceda 500 linhas de código
- **Dependencia_Hook**: Variáveis ou funções referenciadas dentro de useEffect/useCallback/useMemo que devem estar no array de dependências
- **Stale_Closure**: Bug causado por dependências de hook faltando onde callbacks referenciam valores desatualizados
- **Chunk_Circular**: Dependência circular entre módulos que causa warnings no build

## Requisitos

### Requisito 1: Refatoração de Componentes Grandes

**História do Usuário:** Como desenvolvedor, quero que componentes grandes sejam divididos em unidades menores e focadas, para que a base de código seja mais manutenível e fácil de entender.

#### Critérios de Aceitação

1. QUANDO um componente exceder 500 linhas, O Divisor_Componentes DEVE dividi-lo em sub-componentes menores com responsabilidades únicas
2. QUANDO dividir CoursePlatformNetflix.tsx (1.560 linhas), O Divisor_Componentes DEVE extrair pelo menos 5 sub-componentes (CourseHeader, CourseGrid, CourseCard, CoursePlayer, CourseProgress)
3. QUANDO dividir ExerciseOnboardingModal.tsx (1.318 linhas), O Divisor_Componentes DEVE extrair cada step de onboarding em um componente separado
4. QUANDO dividir SessionTemplates.tsx (1.312 linhas), O Divisor_Componentes DEVE extrair a lógica de templates para custom hooks
5. QUANDO dividir UltraCreativeLayoutsV2.tsx (1.290 linhas), O Divisor_Componentes DEVE implementar lazy load para cada layout
6. QUANDO dividir ActiveWorkoutModal.tsx (1.275 linhas), O Divisor_Componentes DEVE extrair timer de treino, display de exercício e tracking de progresso em componentes separados
7. QUANDO dividir UserSessions.tsx (1.272 linhas), O Divisor_Componentes DEVE extrair lista de sessões, card de sessão e ações de sessão em componentes separados
8. QUANDO dividir XiaomiScaleFlow.tsx (1.221 linhas), O Divisor_Componentes DEVE dividir em steps separados
9. QUANDO dividir CourseManagementNew.tsx (1.218 linhas), O Divisor_Componentes DEVE dividir em componentes de gerenciamento
10. QUANDO dividir MedicalDocumentsSection.tsx (1.202 linhas), O Divisor_Componentes DEVE dividir em seções separadas
11. QUANDO dividir SofiaChat.tsx (1.144 linhas), O Divisor_Componentes DEVE extrair lista de mensagens, área de input e lógica de chat para custom hooks
12. QUANDO dividir SaboteurTest.tsx (1.119 linhas), O Divisor_Componentes DEVE extrair cada step do teste em um componente separado
13. QUANDO um componente for dividido, O Divisor_Componentes DEVE garantir que todos os imports usem o padrão @/ alias
14. QUANDO um componente for dividido, O Divisor_Componentes DEVE manter a funcionalidade existente sem breaking changes

### Requisito 2: Correção de Dependências de React Hooks

**História do Usuário:** Como desenvolvedor, quero que todos os React hooks tenham dependências corretas, para que a aplicação esteja livre de bugs de stale closure.

#### Critérios de Aceitação

1. QUANDO um useEffect referenciar uma função, O Corretor_Hooks DEVE adicionar a função às dependências ou envolvê-la com useCallback
2. QUANDO um useCallback estiver com dependências faltando, O Corretor_Hooks DEVE adicionar todas as variáveis referenciadas ao array de dependências
3. QUANDO corrigir AdminWebhooks.tsx, O Corretor_Hooks DEVE envolver todas as funções de fetch com useCallback
4. QUANDO corrigir RankingCommunity.tsx, O Corretor_Hooks DEVE adicionar dependências faltando aos hooks useEffect
5. QUANDO corrigir SofiaBiography.tsx, O Corretor_Hooks DEVE adicionar dependências faltando aos hooks
6. QUANDO corrigir UserSessions.tsx, O Corretor_Hooks DEVE usar useCallback para todas as funções relacionadas a sessões
7. QUANDO corrigir AICostDashboard.tsx, O Corretor_Hooks DEVE adicionar dependências faltando aos hooks de data fetching
8. QUANDO corrigir AdminDashboard.tsx, O Corretor_Hooks DEVE envolver funções de refresh do dashboard com useCallback
9. QUANDO corrigir ChallengeManagement.tsx, O Corretor_Hooks DEVE adicionar dependências faltando aos hooks relacionados a desafios
10. QUANDO corrigir SessionAnalytics.tsx, O Corretor_Hooks DEVE adicionar dependências faltando aos hooks de analytics
11. QUANDO corrigir SystemStatus.tsx, O Corretor_Hooks DEVE adicionar dependências faltando aos hooks de status
12. QUANDO corrigir UserDetailModal.tsx, O Corretor_Hooks DEVE adicionar dependências faltando aos hooks de detalhes
13. QUANDO uma correção for aplicada, O Corretor_Hooks DEVE verificar que nenhum warning ESLint react-hooks/exhaustive-deps permaneça
14. QUANDO uma correção for aplicada, O Corretor_Hooks DEVE garantir que o comportamento do componente permaneça inalterado

### Requisito 3: Segurança de Tipos TypeScript

**História do Usuário:** Como desenvolvedor, quero que todos os tipos `any` sejam substituídos por tipos TypeScript específicos, para que a base de código tenha segurança de tipos completa e melhor suporte de IDE.

#### Critérios de Aceitação

1. QUANDO um tipo `any` for encontrado, O Aplicador_Tipos DEVE substituí-lo por um tipo ou interface específica
2. QUANDO corrigir PlatformAudit.tsx (25+ any), O Aplicador_Tipos DEVE criar interfaces apropriadas para estruturas de dados de auditoria
3. QUANDO corrigir SessionAnalytics.tsx (15+ any), O Aplicador_Tipos DEVE criar tipos para dados de analytics
4. QUANDO corrigir CourseManagementNew.tsx (15+ any), O Aplicador_Tipos DEVE criar interfaces para dados de gerenciamento de cursos
5. QUANDO corrigir GoalManagement.tsx (14+ any), O Aplicador_Tipos DEVE criar tipos para dados relacionados a metas
6. QUANDO corrigir UserSessions.tsx (12+ any), O Aplicador_Tipos DEVE criar interfaces para dados de sessão
7. QUANDO corrigir CompanyConfiguration.tsx (10+ any), O Aplicador_Tipos DEVE criar tipos para dados de configuração
8. QUANDO um tipo não puder ser determinado, O Aplicador_Tipos DEVE usar `unknown` em vez de `any`
9. QUANDO criar novos tipos, O Aplicador_Tipos DEVE colocá-los em arquivos de tipo apropriados em src/types/
10. QUANDO um tipo for substituído, O Aplicador_Tipos DEVE garantir que a compilação TypeScript seja bem-sucedida sem erros

### Requisito 4: Otimização de Queries Supabase

**História do Usuário:** Como desenvolvedor, quero que todas as queries Supabase tenham limites apropriados, para que a aplicação não busque dados excessivos e incorra em custos desnecessários.

#### Critérios de Aceitação

1. QUANDO uma query Supabase usar `.select('*')` sem `.limit()`, O Otimizador_Queries DEVE adicionar um limite apropriado
2. QUANDO consultar dados de lista, O Otimizador_Queries DEVE adicionar `.limit(50)` como padrão, a menos que paginação esteja implementada
3. QUANDO consultar registros únicos, O Otimizador_Queries DEVE usar `.single()` ou `.limit(1)`
4. QUANDO corrigir queries em src/services/exercise/*.ts, O Otimizador_Queries DEVE adicionar limites a todas as queries select
5. QUANDO corrigir queries em src/services/dr-vital/*.ts, O Otimizador_Queries DEVE adicionar limites a todas as queries select
6. QUANDO corrigir queries em src/services/api/*.ts, O Otimizador_Queries DEVE adicionar limites a todas as queries select
7. QUANDO corrigir queries em src/hooks/*.ts, O Otimizador_Queries DEVE adicionar limites a todas as queries select restantes
8. QUANDO uma query já tiver paginação, O Otimizador_Queries DEVE preservar a lógica de paginação existente
9. SE uma query precisar de todos os registros para agregação, ENTÃO O Otimizador_Queries DEVE adicionar um comentário explicando por que nenhum limite é usado

### Requisito 5: Otimização de Bundle Size

**História do Usuário:** Como desenvolvedor, quero o tamanho do bundle otimizado, para que a aplicação carregue mais rápido e forneça melhor experiência ao usuário.

#### Critérios de Aceitação

1. QUANDO um chunk de componente exceder 50KB, O Otimizador_Bundle DEVE implementar lazy loading com React.lazy
2. QUANDO DashboardOverview.js (117KB) for identificado, O Otimizador_Bundle DEVE dividi-lo em chunks menores com lazy loading
3. QUANDO ExerciseOnboardingModal.js (68KB) for identificado, O Otimizador_Bundle DEVE implementar lazy loading
4. QUANDO ChallengesDashboard.js (62KB) for identificado, O Otimizador_Bundle DEVE implementar lazy loading
5. QUANDO dependências circulares de chunks forem detectadas, O Otimizador_Bundle DEVE resolvê-las ajustando imports
6. QUANDO chunks de vendor forem muito grandes, O Otimizador_Bundle DEVE configurar manual chunks no vite.config.ts
7. QUANDO implementar lazy loading, O Otimizador_Bundle DEVE adicionar fallbacks de loading apropriados
8. QUANDO o bundle total gzipado exceder 100KB, O Otimizador_Bundle DEVE identificar e remover dependências não utilizadas
9. QUANDO otimizar, O Otimizador_Bundle DEVE manter o score de performance do Lighthouse acima de 90

### Requisito 6: Correção de Funcionalidades Incompletas

**História do Usuário:** Como desenvolvedor, quero que funcionalidades incompletas sejam corrigidas, para que todos os recursos funcionem como esperado.

#### Critérios de Aceitação

1. QUANDO /professional-evaluation redirecionar para dashboard, O Sistema_Refatoramento DEVE corrigir o roteamento e permissões
2. QUANDO a seção comunidade da Sofia não carregar, O Sistema_Refatoramento DEVE corrigir a lógica de renderização
3. QUANDO a seção subscriptions da Sofia não carregar, O Sistema_Refatoramento DEVE corrigir o data fetching
4. QUANDO a seção exercícios da Sofia não carregar, O Sistema_Refatoramento DEVE corrigir a montagem do componente
5. QUANDO uma correção for aplicada, O Sistema_Refatoramento DEVE adicionar tratamento de erro apropriado
6. QUANDO uma correção for aplicada, O Sistema_Refatoramento DEVE adicionar estados de loading para operações assíncronas

### Requisito 7: Correção de Catch Blocks Vazios

**História do Usuário:** Como desenvolvedor, quero que todos os catch blocks vazios sejam corrigidos, para que erros não sejam silenciados e possam ser diagnosticados.

#### Critérios de Aceitação

1. QUANDO um catch block vazio for encontrado, O Sistema_Refatoramento DEVE adicionar tratamento de erro apropriado com console.error ou toast de erro
2. QUANDO corrigir UserSessions.tsx (3 catch vazios), O Sistema_Refatoramento DEVE adicionar logging e feedback ao usuário
3. QUANDO corrigir ChallengeCard.tsx (3 catch vazios), O Sistema_Refatoramento DEVE adicionar tratamento de erro
4. QUANDO corrigir ExerciseCard.tsx (1 catch vazio), O Sistema_Refatoramento DEVE adicionar tratamento de erro
5. QUANDO corrigir ExerciseSessionCard.tsx (2 catch vazios), O Sistema_Refatoramento DEVE adicionar tratamento de erro
6. QUANDO corrigir useHealthFeed.ts (1 catch vazio), O Sistema_Refatoramento DEVE adicionar tratamento de erro
7. QUANDO corrigir useGoogleFitSync.ts (1 catch vazio), O Sistema_Refatoramento DEVE adicionar tratamento de erro
8. QUANDO um erro for tratado, O Sistema_Refatoramento DEVE garantir que o usuário receba feedback apropriado quando relevante

### Requisito 8: Correção de Lexical Declarations em Case Blocks

**História do Usuário:** Como desenvolvedor, quero que declarações lexicais em case blocks sejam corrigidas, para que o código siga as melhores práticas de JavaScript.

#### Critérios de Aceitação

1. QUANDO uma declaração lexical (let, const) for encontrada em um case block sem escopo, O Sistema_Refatoramento DEVE envolver o case em um bloco {}
2. QUANDO corrigir AbundanceResults.tsx (3 ocorrências), O Sistema_Refatoramento DEVE adicionar blocos de escopo aos cases
3. QUANDO corrigir SystemStatus.tsx (7 ocorrências), O Sistema_Refatoramento DEVE adicionar blocos de escopo aos cases
4. QUANDO uma correção for aplicada, O Sistema_Refatoramento DEVE garantir que a lógica do switch permaneça inalterada

### Requisito 9: Padrões de Qualidade de Código

**História do Usuário:** Como desenvolvedor, quero que a base de código siga padrões de qualidade consistentes, para que o código seja manutenível e profissional.

#### Critérios de Aceitação

1. O Sistema_Refatoramento DEVE reduzir warnings ESLint de 1.555+ para menos de 100
2. O Sistema_Refatoramento DEVE garantir que nenhum componente exceda 500 linhas após refatoração
3. O Sistema_Refatoramento DEVE garantir que todas as queries tenham limites apropriados
4. O Sistema_Refatoramento DEVE garantir que todos os hooks tenham dependências corretas
5. O Sistema_Refatoramento DEVE garantir que nenhum tipo `any` permaneça em componentes críticos
6. QUANDO o refatoramento estiver completo, O Sistema_Refatoramento DEVE passar em todos os testes existentes
7. QUANDO o refatoramento estiver completo, O Sistema_Refatoramento DEVE manter conformidade com TypeScript strict mode
8. O Sistema_Refatoramento DEVE garantir que todos os imports usem o padrão @/ alias
9. O Sistema_Refatoramento DEVE garantir que cores semânticas sejam usadas (não hardcoded)
10. O Sistema_Refatoramento DEVE garantir que edge functions tenham CORS headers apropriados

### Requisito 10: Substituição de @ts-ignore por @ts-expect-error

**História do Usuário:** Como desenvolvedor, quero que @ts-ignore seja substituído por @ts-expect-error, para que erros de tipo sejam documentados e detectados quando não forem mais necessários.

#### Critérios de Aceitação

1. QUANDO um @ts-ignore for encontrado, O Sistema_Refatoramento DEVE substituí-lo por @ts-expect-error com comentário explicativo
2. QUANDO corrigir src/test/setup.ts (3 ocorrências), O Sistema_Refatoramento DEVE substituir @ts-ignore por @ts-expect-error
3. QUANDO corrigir src/utils/exportShoppingListPDF.ts (1 ocorrência), O Sistema_Refatoramento DEVE substituir @ts-ignore por @ts-expect-error
4. QUANDO corrigir src/utils/exportMealPlanPDF.ts (1 ocorrência), O Sistema_Refatoramento DEVE substituir @ts-ignore por @ts-expect-error
5. QUANDO corrigir src/components/ui/error-boundary.tsx (1 ocorrência), O Sistema_Refatoramento DEVE substituir @ts-ignore por @ts-expect-error
6. QUANDO corrigir src/hooks/useExerciseProgram.ts (1 ocorrência), O Sistema_Refatoramento DEVE substituir @ts-ignore por @ts-expect-error
7. QUANDO uma substituição for feita, O Sistema_Refatoramento DEVE adicionar um comentário explicando por que a supressão é necessária

### Requisito 11: Correção de Escape Characters Desnecessários

**História do Usuário:** Como desenvolvedor, quero que escape characters desnecessários sejam removidos, para que o código seja mais limpo e legível.

#### Critérios de Aceitação

1. QUANDO um escape character desnecessário for encontrado em regex, O Sistema_Refatoramento DEVE removê-lo
2. QUANDO corrigir ExerciseLibraryManagement.tsx, O Sistema_Refatoramento DEVE remover `\/` desnecessário
3. QUANDO corrigir TutorialDeviceConfig.tsx, O Sistema_Refatoramento DEVE remover `\/` desnecessário
4. QUANDO corrigir ChallengeCard.tsx (5 ocorrências), O Sistema_Refatoramento DEVE remover escapes desnecessários
5. QUANDO corrigir ExerciseCard.tsx (3 ocorrências), O Sistema_Refatoramento DEVE remover escapes desnecessários
6. QUANDO corrigir meal-plan-error-handler.ts (2 ocorrências), O Sistema_Refatoramento DEVE remover escapes desnecessários
7. QUANDO uma correção for aplicada, O Sistema_Refatoramento DEVE garantir que a regex continue funcionando corretamente

### Requisito 12: Conversão de let para const

**História do Usuário:** Como desenvolvedor, quero que variáveis let que nunca são reatribuídas sejam convertidas para const, para que o código siga as melhores práticas de JavaScript.

#### Critérios de Aceitação

1. QUANDO uma variável let nunca for reatribuída, O Sistema_Refatoramento DEVE convertê-la para const
2. QUANDO corrigir UserSessions.tsx (profileError), O Sistema_Refatoramento DEVE converter para const
3. QUANDO corrigir ChallengeCard.tsx (error), O Sistema_Refatoramento DEVE converter para const
4. QUANDO corrigir ExerciseCard.tsx (dayExercises, participationError), O Sistema_Refatoramento DEVE converter para const
5. QUANDO corrigir useHealthFeed.ts (age), O Sistema_Refatoramento DEVE converter para const
6. QUANDO uma conversão for feita, O Sistema_Refatoramento DEVE garantir que o código continue funcionando corretamente
