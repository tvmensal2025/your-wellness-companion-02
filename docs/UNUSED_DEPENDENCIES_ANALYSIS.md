# Análise de Dependências Não Utilizadas - MaxNutrition

## Data da Análise
Janeiro 2026

## Dependências Confirmadas como NÃO UTILIZADAS

### 1. chart.js (4.5.0)
**Status:** ❌ NÃO UTILIZADA
**Tamanho:** ~200KB
**Motivo:** Nenhuma importação encontrada no código
**Ação:** REMOVER

### 2. react-chartjs-2 (5.3.0)
**Status:** ❌ NÃO UTILIZADA
**Tamanho:** ~50KB
**Motivo:** Nenhuma importação encontrada no código (wrapper para chart.js)
**Ação:** REMOVER

### 3. rgraph (0.1.12)
**Status:** ❌ NÃO UTILIZADA
**Tamanho:** ~100KB
**Motivo:** Nenhuma importação encontrada no código
**Ação:** REMOVER

### 4. qrcode (1.5.4)
**Status:** ❌ NÃO UTILIZADA
**Tamanho:** ~50KB
**Motivo:** Nenhuma importação encontrada no código
**Ação:** REMOVER

### 5. openai (5.10.1)
**Status:** ❌ NÃO UTILIZADA (no frontend)
**Tamanho:** ~500KB
**Motivo:** Nenhuma importação encontrada no código frontend. Se usado, deve estar em edge functions
**Ação:** REMOVER (não deve ser usado no frontend por segurança)

### 6. resend (2.0.0)
**Status:** ❌ NÃO UTILIZADA (no frontend)
**Tamanho:** ~100KB
**Motivo:** Nenhuma importação encontrada no código frontend. Se usado, deve estar em edge functions
**Ação:** REMOVER (não deve ser usado no frontend por segurança)

### 7. @react-three/fiber (8.15.0)
**Status:** ❌ NÃO UTILIZADA (em src/)
**Tamanho:** ~200KB
**Motivo:** Encontrada apenas em Documents/Cursor-Oficial/clone 4/ (diretório externo)
**Ação:** REMOVER

### 8. @react-three/drei (9.114.0)
**Status:** ❌ NÃO UTILIZADA (em src/)
**Tamanho:** ~300KB
**Motivo:** Encontrada apenas em Documents/Cursor-Oficial/clone 4/ (diretório externo)
**Ação:** REMOVER

### 9. @types/three (0.178.1)
**Status:** ❌ NÃO UTILIZADA (em src/)
**Tamanho:** ~50KB
**Motivo:** Tipos para three.js que não é usado em src/
**Ação:** REMOVER

### 10. three (0.178.0)
**Status:** ❌ NÃO UTILIZADA (em src/)
**Tamanho:** ~600KB
**Motivo:** Encontrada apenas em Documents/Cursor-Oficial/clone 4/ (diretório externo)
**Ação:** REMOVER

## Dependências UTILIZADAS (manter)

### 1. react-toastify (11.0.5)
**Status:** ✅ UTILIZADA
**Locais:** SofiaVoiceTest.tsx, FoodAnalysisSystem.tsx, HealthChatBot.tsx
**Ação:** MANTER

### 2. @xyflow/react (12.8.2)
**Status:** ✅ UTILIZADA
**Locais:** DraggableDashboard.tsx, AreaSummaryNode.tsx, ScoreNode.tsx
**Ação:** MANTER

### 3. apexcharts + react-apexcharts
**Status:** ✅ UTILIZADA
**Motivo:** Biblioteca principal de charts do projeto
**Ação:** MANTER

### 4. recharts
**Status:** ✅ UTILIZADA
**Motivo:** Biblioteca secundária de charts
**Ação:** MANTER (mas considerar consolidar em apenas uma biblioteca de charts)

## Bibliotecas de Charts - Análise

O projeto atualmente usa **3 bibliotecas de charts**:
1. ✅ **apexcharts** - USADO (principal)
2. ✅ **recharts** - USADO (secundário)
3. ❌ **chart.js + react-chartjs-2** - NÃO USADO

**Recomendação:** Remover chart.js e react-chartjs-2. Considerar consolidar em apenas apexcharts ou recharts no futuro.

## Impacto da Remoção

### Redução Estimada de Bundle Size
| Dependência | Tamanho Estimado | Impacto |
|-------------|------------------|---------|
| chart.js | ~200KB | Alto |
| react-chartjs-2 | ~50KB | Médio |
| three.js | ~600KB | Muito Alto |
| @react-three/fiber | ~200KB | Alto |
| @react-three/drei | ~300KB | Alto |
| openai | ~500KB | Muito Alto |
| rgraph | ~100KB | Médio |
| qrcode | ~50KB | Baixo |
| resend | ~100KB | Médio |
| @types/three | ~50KB | Baixo |

**Total Estimado:** ~2.15 MB de dependências não utilizadas

### Redução de node_modules
- Menos dependências = instalação mais rápida
- Menos vulnerabilidades potenciais
- Build mais rápido

## Comandos para Remoção

```bash
# Remover dependências não utilizadas
npm uninstall chart.js react-chartjs-2 rgraph qrcode openai resend three @react-three/fiber @react-three/drei @types/three

# Verificar se build ainda funciona
npm run build

# Verificar se testes passam
npm run test
```

## Validação Pós-Remoção

1. ✅ Build completa sem erros
2. ✅ Testes passam
3. ✅ Aplicação funciona corretamente
4. ✅ Bundle size reduzido
5. ✅ Nenhuma importação quebrada

## Notas Importantes

### Sobre openai e resend
Estas bibliotecas **NÃO devem ser usadas no frontend** por questões de segurança:
- Expõem API keys
- Devem ser usadas apenas em edge functions/backend
- Se necessário, já devem estar nas edge functions do Supabase

### Sobre three.js
Se houver necessidade de visualizações 3D no futuro:
- Considerar alternativas mais leves
- Implementar apenas quando necessário
- Usar lazy loading para não impactar bundle principal

## Próximos Passos

1. ✅ Documentar dependências não utilizadas
2. ⏳ Executar comando de remoção
3. ⏳ Validar build
4. ⏳ Validar testes
5. ⏳ Atualizar documentação
