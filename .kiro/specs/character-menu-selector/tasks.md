# Implementation Plan: Character Menu Selector

## Overview

Implementação do sistema de seleção de personagens que filtra as funcionalidades do app baseado na escolha do usuário. A implementação segue uma abordagem incremental, começando pelos tipos e utilitários, depois componentes, e finalmente integração.

## Tasks

- [x] 1. Criar tipos e constantes base
  - [x] 1.1 Criar arquivo de tipos `src/types/character-menu.ts`
    - Definir interface `Character` com id, name, description, imagePath, features
    - Definir type `CharacterId` como union type
    - Definir `featureRegistry` com categorias health, nutrition, exercise, shared
    - _Requirements: 1.3, 1.4, 2.2, 3.2, 4.2, 5.2_

  - [x] 1.2 Criar utilitários de storage `src/utils/characterPreference.ts`
    - Implementar `savePreference(characterId)` 
    - Implementar `loadPreference()` com validação
    - Implementar `clearPreference()`
    - Implementar `getVisibleFeatures(characterId)`
    - Implementar `isFeatureVisible(characterId, featureId)`
    - _Requirements: 6.1, 6.2, 6.3_

  - [x] 1.3 Write property test for preference round-trip
    - **Property 1: Preference Round-Trip Consistency**
    - **Validates: Requirements 6.1, 6.2, 6.3**

  - [x] 1.4 Write property test for feature visibility
    - **Property 2: Feature Visibility by Style**
    - **Validates: Requirements 2.1, 2.3, 3.1, 3.3, 4.1, 4.3**

  - [x] 1.5 Write property test for complete style
    - **Property 3: Complete Style Contains All Features**
    - **Validates: Requirements 5.1, 5.2**

- [x] 2. Checkpoint - Verificar tipos e utilitários
  - Ensure all tests pass, ask the user if questions arise.

- [x] 3. Criar hook useMenuStyle
  - [x] 3.1 Implementar hook `src/hooks/useMenuStyle.ts`
    - Gerenciar estado do personagem selecionado
    - Expor `selectedCharacter`, `isFeatureVisible`, `setCharacter`, `clearPreference`
    - Usar localStorage para persistência
    - _Requirements: 6.1, 6.2, 6.4, 7.3_

  - [x] 3.2 Write property test for character selection
    - **Property 4: Character Selection Updates Preference**
    - **Validates: Requirements 7.2, 7.3**

- [x] 4. Criar Context de MenuStyle
  - [x] 4.1 Implementar `src/contexts/MenuStyleContext.tsx`
    - Criar context com `characterId`, `visibleFeatures`, `isFeatureVisible`
    - Criar provider que wrapa o app
    - Criar hook `useMenuStyleContext` para consumir
    - _Requirements: 2.1, 3.1, 4.1, 5.1_

- [x] 5. Criar componente CharacterSelector
  - [x] 5.1 Implementar `src/components/character-selector/CharacterCard.tsx`
    - Card individual para cada personagem
    - Exibir imagem, nome, descrição
    - Efeito de hover e seleção
    - Usar cores semânticas do tema
    - _Requirements: 1.3, 1.4, 8.2, 8.3_

  - [x] 5.2 Implementar `src/components/character-selector/CharacterSelector.tsx`
    - Grid responsivo com 4 personagens
    - Tela cheia com animação de entrada
    - Callback onSelect para notificar seleção
    - Prop isChanging para modo de troca
    - _Requirements: 1.1, 8.1, 8.4_

  - [x] 5.3 Write property test for selector display logic
    - **Property 5: Selector Display Logic**
    - **Validates: Requirements 1.1, 1.2**

  - [x] 5.4 Write property test for character data completeness
    - **Property 6: Character Data Completeness**
    - **Validates: Requirements 1.4**

- [x] 6. Checkpoint - Verificar componentes
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Integrar com App principal
  - [x] 7.1 Modificar `src/App.tsx` para incluir lógica de seleção
    - Verificar preferência no início
    - Mostrar CharacterSelector se não houver preferência
    - Passar MenuStyleProvider para o resto do app
    - _Requirements: 1.1, 1.2_

  - [x] 7.2 Criar componente wrapper `src/components/character-selector/CharacterGate.tsx`
    - Componente que decide se mostra selector ou children
    - Gerencia transição entre estados
    - _Requirements: 1.1, 1.2, 8.4_

- [x] 8. Adicionar opção de troca nas configurações
  - [x] 8.1 Modificar página de configurações para incluir botão de troca
    - Adicionar seção "Estilo do App"
    - Mostrar personagem atual selecionado
    - Botão "Trocar Personagem"
    - _Requirements: 6.4, 7.1_

  - [x] 8.2 Implementar modal/navegação para troca
    - Ao clicar em trocar, mostrar CharacterSelector com isChanging=true
    - Após seleção, atualizar preferência e recarregar menu
    - _Requirements: 7.2, 7.3_

- [x] 9. Filtrar menu baseado no estilo
  - [x] 9.1 Modificar componentes de navegação para usar `isFeatureVisible`
    - Atualizar sidebar/bottom navigation
    - Ocultar itens de menu baseado no estilo
    - Manter items shared sempre visíveis
    - _Requirements: 2.1, 2.3, 3.1, 3.3, 4.1, 4.3, 5.1_

  - [x] 9.2 Atualizar rotas para respeitar visibilidade
    - Redirecionar para dashboard se tentar acessar feature oculta
    - Mostrar mensagem amigável se feature não disponível
    - _Requirements: 2.3, 3.3, 4.3_

- [x] 10. Final checkpoint - Verificar integração completa
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Todos os testes são obrigatórios para garantir qualidade
- Cada task referencia requisitos específicos para rastreabilidade
- Checkpoints garantem validação incremental
- Property tests validam propriedades universais de corretude
- Unit tests validam exemplos específicos e edge cases
