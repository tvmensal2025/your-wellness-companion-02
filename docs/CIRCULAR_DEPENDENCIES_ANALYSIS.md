# Análise de Dependências Circulares - MaxNutrition

## Data da Análise
Janeiro 2026

## Dependências Circulares Identificadas

### 1. vendor-react ↔ vendor-apex
**Ciclo:** vendor-react -> vendor-apex -> vendor-react

**Causa:** ApexCharts provavelmente importa React/ReactDOM internamente, criando uma dependência circular quando separamos em chunks diferentes.

**Impacto:** Médio - pode causar problemas de carregamento e duplicação de código.

### 2. vendor-react ↔ vendor-apex ↔ vendor-misc
**Ciclo:** vendor-react -> vendor-apex -> vendor-misc -> vendor-react

**Causa:** Cadeia de dependências onde vendor-misc contém bibliotecas que dependem de React, e ApexCharts também depende de algumas dessas bibliotecas.

**Impacto:** Alto - ciclo de 3 chunks pode causar problemas significativos.

### 3. vendor-misc ↔ vendor-export
**Ciclo:** vendor-misc -> vendor-export -> vendor-misc

**Causa:** jsPDF e html2canvas (vendor-export) provavelmente dependem de algumas bibliotecas em vendor-misc.

**Impacto:** Médio - pode causar problemas de carregamento.

### 4. vendor-apex ↔ vendor-misc
**Ciclo:** vendor-apex -> vendor-misc -> vendor-apex

**Causa:** ApexCharts e bibliotecas em vendor-misc têm dependências mútuas.

**Impacto:** Médio - duplicação de código.

## Tamanhos de Chunks Problemáticos

| Chunk | Tamanho | Gzip | Status |
|-------|---------|------|--------|
| vendor-misc | 457.19 KB | 155.71 KB | ⚠️ MUITO GRANDE |
| vendor-export | 544.31 KB | 157.48 KB | ⚠️ MUITO GRANDE |
| vendor-apex | 580.49 KB | 157.35 KB | ⚠️ MUITO GRANDE |
| AdminPage | 497.01 KB | 110.42 KB | ⚠️ MUITO GRANDE |
| DashboardOverview | 117.39 KB | 31.02 KB | ⚠️ GRANDE |

## Soluções Propostas

### Solução 1: Consolidar Chunks Relacionados
- Mesclar vendor-apex e vendor-charts em um único chunk 'vendor-charts'
- Isso elimina a circular entre vendor-apex e vendor-misc

### Solução 2: Criar Chunk Vendor-Core
- Criar um chunk 'vendor-core' para bibliotecas compartilhadas
- Mover dependências comuns para vendor-core
- Isso quebra os ciclos de dependência

### Solução 3: Usar Estratégia de Chunks Mais Granular
- Separar React/ReactDOM em chunk próprio (já feito)
- Criar chunk específico para UI components (Radix)
- Consolidar todas as bibliotecas de charts em um único chunk
- Mover bibliotecas de export para vendor-misc ou criar chunk específico menor

### Solução 4: Otimizar manualChunks com Função Mais Inteligente
- Usar lógica de prioridade para evitar circulares
- Garantir que dependências base (React) sejam sempre separadas primeiro
- Agrupar bibliotecas relacionadas que compartilham dependências

## Recomendação Final

**Implementar Solução 3 + 4:**
1. Consolidar vendor-apex e vendor-charts em 'vendor-charts'
2. Mesclar vendor-export em vendor-misc (são bibliotecas relacionadas)
3. Manter vendor-react separado e prioritário
4. Criar vendor-ui para componentes Radix
5. Otimizar a função manualChunks para evitar circulares

## Dependências Não Utilizadas a Verificar

Após análise do package.json, verificar se estas dependências estão realmente sendo usadas:
- Bibliotecas de charts duplicadas (recharts vs apexcharts)
- Bibliotecas de data/hora duplicadas
- Bibliotecas de formulários não utilizadas

## Próximos Passos

1. ✅ Documentar dependências circulares
2. ⏳ Atualizar vite.config.ts com nova estratégia de chunks
3. ⏳ Verificar e remover dependências não utilizadas
4. ⏳ Criar teste de propriedade para bundle size
5. ⏳ Validar build sem circulares
