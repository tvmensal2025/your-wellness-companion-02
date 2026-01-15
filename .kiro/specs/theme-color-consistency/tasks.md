# Implementation Plan: Theme Color Consistency

## Overview

Este plano detalha as tarefas para implementar a padronização de cores no projeto MaxNutrition, garantindo legibilidade e consistência visual em ambos os temas (claro e escuro).

## Tasks

- [x] 1. Criar ferramentas de análise e validação
  - Implementar script de análise de cores hardcoded
  - Implementar validador de contraste WCAG
  - Criar relatório de análise
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 7.1, 7.2_

- [x] 1.1 Escrever testes de propriedade para análise de cores
  - **Property 8: Ausência de Cores Hardcoded Problemáticas**
  - **Validates: Requirements 1.1, 1.2, 3.1**

- [x] 1.2 Escrever testes de propriedade para validação de contraste
  - **Property 2: Contraste Mínimo WCAG AA**
  - **Validates: Requirements 3.3, 3.4, 7.1, 7.2**

- [x] 2. Criar guia de mapeamento de cores
  - Definir mapeamento completo de cores hardcoded para semânticas
  - Documentar exceções legítimas (gradientes, cores de marca)
  - Criar exemplos de uso correto
  - _Requirements: 2.1, 8.1, 8.2, 8.3, 8.4_

- [x] 3. Executar análise inicial do projeto
  - Rodar script de análise em todos os arquivos
  - Gerar relatório completo de cores hardcoded
  - Priorizar arquivos por impacto (páginas principais primeiro)
  - Identificar componentes críticos para migração
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [-] 4. Migrar página UserDrVitalPage
  - [x] 4.1 Substituir `text-white` por `text-foreground`
    - Atualizar títulos e textos principais
    - Atualizar ícones
    - _Requirements: 3.1, 6.1_
  
  - [x] 4.2 Substituir `text-slate-400` por `text-muted-foreground`
    - Atualizar textos secundários
    - Atualizar labels
    - _Requirements: 3.1_
  
  - [x] 4.3 Substituir `text-slate-200` por `text-foreground`
    - Atualizar textos em cards
    - _Requirements: 3.1_
  
  - [x] 4.4 Atualizar fundos de cards
    - Substituir fundos hardcoded por `bg-card`
    - Garantir hierarquia visual
    - _Requirements: 4.1, 4.2_

- [ ] 4.5 Testar UserDrVitalPage em ambos os temas
  - Verificar legibilidade em modo claro
  - Verificar legibilidade em modo escuro
  - Validar contraste de todos os elementos
  - _Requirements: 9.2, 9.4_

- [ ] 5. Checkpoint - Validar migração inicial
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Migrar componentes de navegação
  - [ ] 6.1 Atualizar cores de texto em menus
    - Substituir cores hardcoded por semânticas
    - _Requirements: 3.1_
  
  - [ ] 6.2 Atualizar cores de ícones
    - Usar `currentColor` ou classes semânticas
    - _Requirements: 6.1, 6.2_
  
  - [ ] 6.3 Atualizar estados hover e active
    - Usar cores semânticas para interações
    - _Requirements: 3.1, 7.4_

- [ ] 6.4 Escrever teste de propriedade para ícones adaptativos
  - **Property 6: Ícones Adaptativos**
  - **Validates: Requirements 6.1, 6.2, 6.4**

- [ ] 7. Migrar cards de dashboard
  - [ ] 7.1 Atualizar ExplodingCard component
    - Substituir cores de texto hardcoded
    - Atualizar cores de fundo
    - _Requirements: 3.1, 4.1_
  
  - [ ] 7.2 Atualizar StatCard components
    - Substituir cores hardcoded
    - Manter cores de status (success, warning, error)
    - _Requirements: 3.1, 6.3_
  
  - [ ] 7.3 Atualizar bordas de cards
    - Usar `border-border` para todas as bordas
    - _Requirements: 5.1, 5.2_

- [ ]* 7.4 Escrever teste de propriedade para cores semânticas em texto
  - **Property 1: Cores Semânticas em Texto**
  - **Validates: Requirements 3.1, 3.2**

- [ ]* 7.5 Escrever teste de propriedade para fundos semânticos
  - **Property 4: Fundos Semânticos**
  - **Validates: Requirements 4.1, 4.2, 4.3**

- [ ] 8. Migrar componentes de formulários
  - [ ] 8.1 Atualizar inputs e textareas
    - Usar cores semânticas para texto
    - Usar `border-input` para bordas
    - _Requirements: 3.1, 5.1_
  
  - [ ] 8.2 Atualizar labels e placeholders
    - Usar `text-muted-foreground` para labels
    - _Requirements: 3.1_
  
  - [ ] 8.3 Atualizar estados de erro e sucesso
    - Usar `text-destructive` para erros
    - Usar `text-success` para sucesso
    - _Requirements: 6.3_

- [ ]* 8.4 Escrever teste de propriedade para preservação de cores de status
  - **Property 7: Preservação de Cores de Status**
  - **Validates: Requirements 6.3**

- [ ] 9. Checkpoint - Validar componentes críticos
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 10. Migrar componentes UI base (src/components/ui/)
  - [ ] 10.1 Auditar e atualizar Button component
    - Verificar variantes (primary, secondary, destructive)
    - Garantir contraste em todas as variantes
    - _Requirements: 3.1, 3.3, 3.4_
  
  - [ ] 10.2 Auditar e atualizar Card component
    - Verificar uso de cores semânticas
    - _Requirements: 4.1, 4.2_
  
  - [ ] 10.3 Auditar e atualizar Badge component
    - Atualizar variantes de cor
    - _Requirements: 3.1, 6.3_
  
  - [ ] 10.4 Auditar e atualizar Alert component
    - Verificar cores de status
    - _Requirements: 6.3_

- [ ] 10.5 Escrever teste de propriedade para adaptação automática ao tema
  - **Property 3: Adaptação Automática ao Tema**
  - **Validates: Requirements 3.2, 4.2**

- [ ] 11. Migrar páginas secundárias
  - [ ] 11.1 Identificar páginas com cores hardcoded
    - Usar relatório de análise
    - Priorizar por uso
    - _Requirements: 1.3, 1.4_
  
  - [ ] 11.2 Migrar páginas identificadas
    - Aplicar padrões de migração
    - Testar em ambos os temas
    - _Requirements: 3.1, 4.1, 9.2_

- [ ] 12. Criar componente de teste de tema
  - Implementar ThemeTestCard component
  - Mostrar todas as cores semânticas
  - Usar para validação visual
  - _Requirements: 8.3, 9.1_

- [ ] 12.1 Escrever testes unitários para ThemeTestCard
  - Verificar renderização de todas as cores
  - _Requirements: 9.1_

- [ ] 13. Implementar validação de contraste em CI/CD
  - [ ] 13.1 Criar script de validação para CI
    - Executar análise de cores
    - Validar contraste em componentes críticos
    - _Requirements: 7.1, 7.2, 9.3_
  
  - [ ] 13.2 Configurar GitHub Actions / CI pipeline
    - Adicionar step de validação
    - Falhar build se cores hardcoded forem adicionadas
    - _Requirements: 9.3_

- [ ] 14. Checkpoint - Validar migração completa
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 15. Criar documentação e guias
  - [ ] 15.1 Atualizar guia de estilo
    - Documentar todas as cores semânticas
    - Incluir exemplos de uso correto
    - Documentar exceções
    - _Requirements: 8.1, 8.2, 8.3, 8.4_
  
  - [ ] 15.2 Criar guia de migração
    - Documentar processo de migração
    - Incluir checklist
    - _Requirements: 10.1, 10.2_
  
  - [ ] 15.3 Adicionar exemplos ao Storybook (se disponível)
    - Criar stories para cores semânticas
    - Mostrar componentes em ambos os temas
    - _Requirements: 8.3_

- [ ] 16. Configurar prevenção de regressões
  - [ ] 16.1 Adicionar regra ESLint customizada
    - Detectar cores hardcoded em código novo
    - Permitir exceções documentadas
    - _Requirements: 9.3_
  
  - [ ] 16.2 Configurar pre-commit hook
    - Executar análise antes de commit
    - Avisar sobre cores hardcoded
    - _Requirements: 9.3_

- [ ] 16.3 Escrever testes de propriedade para bordas visíveis
  - **Property 5: Bordas Visíveis**
  - **Validates: Requirements 5.1, 5.2, 5.3**

- [ ] 17. Validação final e testes
  - [ ] 17.1 Executar suite completa de testes
    - Rodar todos os testes de propriedade
    - Rodar testes unitários
    - _Requirements: 9.1, 9.2_
  
  - [ ] 17.2 Teste manual em todas as páginas principais
    - Verificar modo claro
    - Verificar modo escuro
    - Testar em diferentes dispositivos
    - _Requirements: 9.4_
  
  - [ ] 17.3 Validar acessibilidade
    - Testar com leitor de tela
    - Verificar navegação por teclado
    - Validar contraste com ferramentas automáticas
    - _Requirements: 7.1, 7.2, 7.3_

- [ ] 18. Checkpoint final - Revisão completa
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Todos os testes são obrigatórios para garantir cobertura completa
- Cada tarefa referencia requisitos específicos para rastreabilidade
- Checkpoints garantem validação incremental
- Testes de propriedade validam correção universal (mínimo 100 iterações)
- Testes unitários validam exemplos específicos e casos extremos
- Migração incremental permite progresso sem quebrar funcionalidade existente
- Prioridade: Componentes críticos → Componentes UI base → Páginas secundárias → Documentação
