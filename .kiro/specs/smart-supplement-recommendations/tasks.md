# Implementation Plan: Smart Supplement Recommendations

## Overview

Implementação do sistema de recomendação inteligente de suplementos com IA, argumentação personalizada e evidências científicas. O sistema analisa o perfil completo do usuário e gera recomendações persuasivas.

## Tasks

- [x] 1. Criar serviço de análise de perfil do usuário
  - [x] 1.1 Criar `src/services/userProfileAnalyzer.ts` com interface `UserHealthProfile`
    - Implementar função `analyzeProfile(userId)` que busca dados de: `user_anamnesis`, `nutritional_goals`, `sofia_food_analysis`, `user_physical_data`
    - Implementar `extractHealthIssues(anamnesis)` para extrair problemas de sono, estresse, energia, digestão, imunidade, foco
    - Implementar `detectNutritionalDeficiencies(foodHistory)` para identificar deficiências baseadas no consumo
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [ ]* 1.2 Write property test for profile analysis
    - **Property 1: Profile Analysis Completeness**
    - **Validates: Requirements 1.1, 1.2**

- [x] 2. Criar serviço de cálculo de Match Score
  - [x] 2.1 Criar `src/services/matchScoreCalculator.ts`
    - Implementar `calculateScore(product, userProfile)` com pesos: objetivo (40%), problemas (30%), deficiências (20%), histórico (10%)
    - Implementar `getBadgeForScore(score)` retornando: "Ideal para você" (>=80), "Recomendado" (>=60), "Pode ajudar" (<60)
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [ ]* 2.2 Write property test for match score calculation
    - **Property 1: Match Score Calculation Consistency**
    - **Validates: Requirements 2.1**

  - [ ]* 2.3 Write property test for badge assignment
    - **Property 2: Badge Assignment Correctness**
    - **Validates: Requirements 2.2, 2.3, 2.4**

- [x] 3. Criar mapeamento de ingredientes para condições
  - [x] 3.1 Criar `src/data/ingredientConditionMap.ts`
    - Mapear ingredientes principais: melatonina, ashwagandha, vitamina_d, omega_3, colageno, creatina, cafeina, probioticos, magnesio, zinco, vitamina_c, curcuma, spirulina, chlorella, moro_complex, cromo
    - Cada ingrediente mapeia para array de condições que resolve
    - _Requirements: 6.2_

- [x] 4. Criar serviço de geração de argumentos personalizados
  - [x] 4.1 Criar `src/services/personalizedArgumentGenerator.ts`
    - Implementar `generateArgument(product, userProfile, matchScore)` que gera texto personalizado
    - O texto DEVE mencionar pelo menos 2 dados específicos do perfil do usuário
    - Usar templates com placeholders para dados do usuário
    - Linguagem empática e consultiva, não promocional
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [ ]* 4.2 Write property test for argument generation
    - **Property 4: Personalized Argument Contains User Data**
    - **Validates: Requirements 3.2, 3.3**

- [x] 5. Criar serviço de seleção de evidências científicas
  - [x] 5.1 Criar `src/services/scientificEvidenceSelector.ts`
    - Implementar `selectBestArticle(product, userProfile)` que seleciona artigo mais relevante
    - Implementar `rankArticlesByRelevance(articles, userProblems)` para ordenar por relevância
    - Artigo selecionado deve ter `relatedIngredient` matching com `activeIngredients` do produto
    - _Requirements: 4.1, 4.3, 4.4, 4.5_

  - [ ]* 5.2 Write property test for article selection
    - **Property 5: Scientific Article Relevance**
    - **Validates: Requirements 4.1, 4.3**

- [x] 6. Checkpoint - Validar serviços core
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Criar componente SmartSupplementCard
  - [x] 7.1 Criar `src/components/sofia/SmartSupplementCard.tsx`
    - Card premium com design moderno (gradientes, sombras, animações)
    - Exibir: imagem, nome, categoria, Match Score badge, preço original/promocional
    - Seção "Por que é ideal para você" com texto da IA
    - Seção "Comprovado cientificamente" com link para artigo
    - Botão "Comprar" com destaque visual
    - Usar framer-motion para animações
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 8.1, 8.2, 8.3, 8.4_

  - [ ]* 7.2 Write property test for card completeness
    - **Property 6: Product Card Completeness**
    - **Validates: Requirements 5.1, 5.3, 5.4**

- [x] 8. Criar modal de artigo científico
  - [x] 8.1 Criar `src/components/sofia/ScientificArticleModal.tsx`
    - Modal elegante com título, fonte, resumo em português
    - Botão para abrir artigo original em nova aba
    - Ícone de verificação/certificado
    - _Requirements: 4.2, 4.4, 8.3_

- [x] 9. Criar componente principal SmartSupplementsSection
  - [x] 9.1 Criar `src/components/sofia/SmartSupplementsSection.tsx`
    - Integrar todos os serviços: UserProfileAnalyzer, MatchScoreCalculator, PersonalizedArgumentGenerator, ScientificEvidenceSelector
    - Ordenar produtos por Match Score decrescente
    - Skeleton loading elegante durante carregamento
    - Estado vazio quando sem anamnese (CTA para preencher)
    - Grid responsivo mobile-first
    - _Requirements: 2.5, 8.5, 8.6, 1.5_

  - [ ]* 9.2 Write property test for recommendation ordering
    - **Property 3: Recommendation Ordering**
    - **Validates: Requirements 2.5**

- [x] 10. Implementar tracking de comportamento
  - [x] 10.1 Criar `src/services/supplementTrackingService.ts`
    - Implementar `trackView(userId, productId)` para registrar visualização
    - Implementar `trackArticleClick(userId, productId, articleId)` para cliques em artigos
    - Implementar `trackPurchase(userId, productId)` para conversões
    - Salvar eventos na tabela `supplement_interactions`
    - _Requirements: 7.2, 7.4, 9.1_

  - [ ]* 10.2 Write property test for tracking
    - **Property 8: User Behavior Tracking**
    - **Validates: Requirements 9.1**

- [x] 11. Checkpoint - Validar componentes visuais
  - Ensure all tests pass, ask the user if questions arise.

- [x] 12. Integrar com SofiaNutricionalSection
  - [x] 12.1 Substituir `PersonalizedSupplementsCard` por `SmartSupplementsSection` na tab "Stats"
    - Manter compatibilidade com seletor de protocolos existente
    - Adicionar opção "Recomendação Inteligente da Sofia" como padrão
    - _Requirements: 8.5_

- [x] 13. Implementar invalidação de cache
  - [x] 13.1 Adicionar listener para mudanças na anamnese
    - Quando `user_anamnesis` é atualizado, invalidar cache de recomendações
    - Usar React Query `invalidateQueries` para forçar recálculo
    - _Requirements: 9.5_

  - [ ]* 13.2 Write property test for cache invalidation
    - **Property 9: Anamnesis Update Triggers Recalculation**
    - **Validates: Requirements 9.5**

- [x] 14. Criar migration para tabela de artigos científicos
  - [x] 14.1 Criar migration `add_scientific_articles_table.sql`
    - Tabela `scientific_articles` com: id, title, title_pt, url, source, summary_pt, related_ingredient, published_year
    - Tabela `supplement_articles` (junction) com: supplement_id, article_id
    - Inserir artigos iniciais para produtos existentes
    - _Requirements: 6.3, 6.4_

- [x] 15. Criar migration para tabela de tracking
  - [x] 15.1 Criar migration `add_supplement_interactions_table.sql`
    - Tabela `supplement_interactions` com: id, user_id, product_id, event_type, article_id, created_at
    - Índices para queries de analytics
    - _Requirements: 9.1_

- [x] 16. Final checkpoint - Validar sistema completo
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marcadas com `*` são opcionais (testes) e podem ser puladas para MVP mais rápido
- Cada task referencia requisitos específicos para rastreabilidade
- Checkpoints garantem validação incremental
- Property tests validam propriedades universais de correção
- Unit tests validam exemplos específicos e edge cases
