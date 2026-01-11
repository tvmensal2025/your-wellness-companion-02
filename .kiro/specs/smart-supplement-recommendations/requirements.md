# Requirements Document

## Introduction

Sistema de recomendação inteligente de suplementos que analisa o perfil completo do usuário (anamnese, objetivos, deficiências nutricionais, comportamento alimentar) e apresenta produtos personalizados com argumentos científicos convincentes. A IA "Sofia" atua como consultora de saúde, explicando por que cada produto é ideal para aquele usuário específico, com links para artigos científicos que comprovam a eficácia dos ativos.

## Glossary

- **Sofia_AI**: Assistente de IA nutricional que analisa dados do usuário e gera recomendações personalizadas
- **Anamnese_Data**: Dados coletados sobre saúde, objetivos, condições e preferências do usuário
- **Match_Score**: Percentual de compatibilidade entre o produto e o perfil do usuário (0-100%)
- **Scientific_Article**: Artigo científico que comprova a eficácia de um ativo do produto
- **Product_Recommendation**: Recomendação personalizada de produto com argumentação baseada no perfil
- **User_Profile**: Conjunto completo de dados do usuário (físicos, objetivos, anamnese, alimentação)
- **Active_Ingredient**: Princípio ativo do suplemento com benefícios comprovados
- **Persuasion_Engine**: Motor que gera argumentos personalizados baseados no perfil do usuário

## Requirements

### Requirement 1: Análise Inteligente do Perfil do Usuário

**User Story:** Como sistema, quero analisar todos os dados disponíveis do usuário, para que eu possa identificar suas necessidades específicas de suplementação.

#### Acceptance Criteria

1. WHEN o usuário acessa a seção de suplementos THEN o Sistema SHALL coletar dados de: anamnese, objetivos nutricionais, deficiências detectadas, padrão alimentar, condições de saúde reportadas
2. WHEN dados de anamnese existem THEN o Sistema SHALL extrair: problemas de sono, níveis de estresse, energia, digestão, imunidade, foco mental
3. WHEN dados de alimentação existem THEN o Sistema SHALL identificar deficiências nutricionais baseadas no consumo registrado
4. WHEN o usuário tem objetivo definido (emagrecer/ganhar massa/manter) THEN o Sistema SHALL priorizar produtos alinhados com esse objetivo
5. IF dados insuficientes para análise THEN o Sistema SHALL solicitar preenchimento da anamnese antes de mostrar recomendações

### Requirement 2: Cálculo de Match Score Personalizado

**User Story:** Como usuário, quero ver o percentual de compatibilidade de cada produto com meu perfil, para que eu entenda quão relevante ele é para mim.

#### Acceptance Criteria

1. THE Sistema SHALL calcular Match_Score baseado em: alinhamento com objetivo (40%), resolução de problemas reportados (30%), complementação de deficiências (20%), histórico de compras similares (10%)
2. WHEN Match_Score >= 80% THEN o Sistema SHALL exibir badge "Ideal para você" com destaque visual
3. WHEN Match_Score >= 60% THEN o Sistema SHALL exibir badge "Recomendado" 
4. WHEN Match_Score < 60% THEN o Sistema SHALL exibir badge "Pode ajudar"
5. THE Sistema SHALL ordenar produtos por Match_Score decrescente na listagem

### Requirement 3: Geração de Argumentos Personalizados pela IA

**User Story:** Como usuário, quero entender por que cada produto é recomendado especificamente para mim, para que eu me sinta confiante na compra.

#### Acceptance Criteria

1. WHEN um produto é exibido THEN Sofia_AI SHALL gerar texto personalizado explicando por que é ideal para o usuário
2. THE texto gerado SHALL mencionar pelo menos 2 dados específicos do perfil do usuário (ex: "Baseado na sua dificuldade com sono e objetivo de emagrecimento...")
3. THE texto gerado SHALL explicar como o produto resolve os problemas específicos do usuário
4. THE texto gerado SHALL usar linguagem empática e consultiva, não promocional
5. WHEN o usuário tem múltiplos problemas THEN o Sistema SHALL priorizar os mais relevantes para aquele produto

### Requirement 4: Comprovação Científica com Artigos

**User Story:** Como usuário, quero ver evidências científicas sobre os ativos do produto, para que eu confie na eficácia antes de comprar.

#### Acceptance Criteria

1. THE Sistema SHALL exibir pelo menos 1 artigo científico relevante para cada produto recomendado
2. WHEN o usuário toca no link do artigo THEN o Sistema SHALL abrir o artigo em nova aba/modal
3. THE artigo exibido SHALL ser relacionado ao ativo principal do produto
4. THE Sistema SHALL mostrar título do estudo, fonte (PubMed, etc), e resumo em português
5. WHEN múltiplos artigos disponíveis THEN o Sistema SHALL selecionar o mais relevante para o problema do usuário

### Requirement 5: Card de Produto Inteligente

**User Story:** Como usuário, quero ver todas as informações relevantes do produto de forma clara e atraente, para que eu possa tomar decisão de compra rapidamente.

#### Acceptance Criteria

1. THE Card_Produto SHALL exibir: imagem, nome, categoria, Match_Score, preço original, preço promocional
2. THE Card_Produto SHALL exibir tags dos principais benefícios (ex: "Detox natural", "Energia", "Foco")
3. THE Card_Produto SHALL exibir seção "Por que é ideal para você" com texto gerado pela IA
4. THE Card_Produto SHALL exibir seção "Comprovado cientificamente" com link para artigo
5. THE Card_Produto SHALL exibir botão "Comprar" com destaque visual
6. WHEN produto tem desconto THEN o Sistema SHALL exibir preço original riscado e economia

### Requirement 6: Integração com Catálogo de Produtos

**User Story:** Como sistema, quero acessar o catálogo completo de produtos com seus ativos e artigos científicos, para que eu possa fazer recomendações precisas.

#### Acceptance Criteria

1. THE Sistema SHALL manter base de dados de produtos com: id, nome, categoria, ativos, benefícios, preço, imagem, artigos_cientificos
2. THE Sistema SHALL manter mapeamento de ativos para condições de saúde (ex: Melatonina → sono, Ashwagandha → estresse)
3. THE Sistema SHALL manter base de artigos científicos com: título, url, resumo_pt, ativo_relacionado, fonte
4. WHEN novo produto é adicionado THEN o Sistema SHALL requerer pelo menos 1 artigo científico vinculado
5. THE Sistema SHALL permitir múltiplas categorias por produto (ex: "emagrecimento", "energia", "detox")

### Requirement 7: Experiência de Compra Fluida

**User Story:** Como usuário, quero comprar o produto de forma rápida e sem fricção, para que eu não desista no meio do processo.

#### Acceptance Criteria

1. WHEN usuário clica em "Comprar" THEN o Sistema SHALL redirecionar para checkout ou adicionar ao carrinho
2. THE Sistema SHALL salvar produtos visualizados para remarketing futuro
3. WHEN usuário não compra THEN o Sistema SHALL poder enviar notificação posterior com o produto
4. THE Sistema SHALL rastrear conversões para otimizar algoritmo de recomendação
5. IF produto esgotado THEN o Sistema SHALL oferecer alternativa similar com Match_Score próximo

### Requirement 8: Apresentação Visual Premium

**User Story:** Como usuário, quero uma experiência visual sofisticada que transmita confiança e profissionalismo, para que eu me sinta seguro comprando.

#### Acceptance Criteria

1. THE Interface SHALL usar design moderno com gradientes, sombras suaves e animações
2. THE Match_Score SHALL ser exibido com badge colorido e ícone de estrela/sparkle
3. THE seção de artigo científico SHALL ter ícone de verificação/certificado
4. THE Cards SHALL ter hover/tap effects que indicam interatividade
5. THE Layout SHALL ser responsivo e otimizado para mobile-first
6. WHEN carregando recomendações THEN o Sistema SHALL exibir skeleton loading elegante

### Requirement 9: Personalização Contínua

**User Story:** Como sistema, quero aprender com o comportamento do usuário, para que as recomendações melhorem ao longo do tempo.

#### Acceptance Criteria

1. THE Sistema SHALL registrar: produtos visualizados, tempo de visualização, cliques em artigos, compras realizadas
2. WHEN usuário compra produto THEN o Sistema SHALL ajustar Match_Score de produtos similares
3. WHEN usuário ignora produto repetidamente THEN o Sistema SHALL reduzir prioridade desse produto
4. THE Sistema SHALL considerar sazonalidade (ex: vitamina D no inverno, termogênicos no verão)
5. WHEN anamnese é atualizada THEN o Sistema SHALL recalcular todas as recomendações
