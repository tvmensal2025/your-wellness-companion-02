# 🧪 TESTE DO CARD SEMANAL - Guia Completo

## 🎯 OBJETIVO

Validar que o novo card semanal está funcionando perfeitamente com todas as funcionalidades.

---

## 📋 PRÉ-REQUISITOS

1. ✅ Migration aplicada (`20260117150000_create_shopping_lists.sql`)
2. ✅ App rodando localmente (`npm run dev`)
3. ✅ Conta de usuário criada
4. ✅ Telefone cadastrado no perfil (para lista de compras)

---

## 🧪 TESTES A REALIZAR

### TESTE 1: Card Aparece no Dashboard ✅

**Objetivo:** Verificar se o card está visível

**Passos:**
1. Fazer login no app
2. Ir para Dashboard Nutricional (aba Sofia)
3. Rolar a página

**Resultado Esperado:**
```
✅ Card "Seu Cardápio da Semana" aparece
✅ Mostra 7 dias (D S T Q Q S S)
✅ Badge mostra "X/7 completos"
✅ Dias têm cores diferentes
```

**Se falhar:**
- Verificar console do navegador (F12)
- Verificar se `WeeklyPlanCard` foi importado
- Verificar se userId está sendo passado

---

### TESTE 2: Informações Visuais ✅

**Objetivo:** Verificar se mostra informações corretas

**Passos:**
1. Olhar para cada dia do card
2. Verificar informações mostradas

**Resultado Esperado:**
```
✅ Número do dia (12, 13, 14...)
✅ Quantidade de refeições (0/4, 1/4, 2/4, 3/4, 4/4)
✅ Total de calorias (ou "-" se vazio)
✅ Cores corretas:
   - 🔵 Azul = Hoje
   - 🟢 Verde = Completo (4/4)
   - 🟡 Amarelo = Parcial (1-3/4)
   - ⚪ Cinza = Vazio (0/4)
```

**Se falhar:**
- Verificar se há refeições no banco
- Executar script de teste SQL
- Verificar hook `useWeeklyPlan`

---

### TESTE 3: Clique no Dia ✅

**Objetivo:** Verificar se popup abre ao clicar

**Passos:**
1. Clicar em um dia que tem refeições (verde ou amarelo)
2. Aguardar popup abrir

**Resultado Esperado:**
```
✅ Popup abre suavemente
✅ Mostra data do dia (ex: "Terça-feira, 14 de janeiro")
✅ Mostra meta de calorias
✅ Mostra 4 seções de refeições:
   - ☕ Café da Manhã
   - 🍽️ Almoço
   - 🍎 Lanche
   - 🌙 Jantar
✅ Botão "Gerar Lista de Compras" aparece
✅ Botão "X" para fechar aparece
```

**Se falhar:**
- Verificar console para erros
- Verificar se `DayDetailModal` está importado
- Verificar hook `useDayMeals`

---

### TESTE 4: Detalhes das Refeições ✅

**Objetivo:** Verificar se mostra alimentos corretamente

**Passos:**
1. Com popup aberto, olhar cada seção de refeição
2. Verificar informações

**Resultado Esperado:**
```
Para cada refeição que existe:
✅ Mostra horário (ex: "7h00")
✅ Mostra total de calorias (ex: "400 kcal")
✅ Lista todos os alimentos:
   • Nome do alimento
   • Quantidade estimada
✅ Mostra macros:
   - Proteína (g)
   - Carboidratos (g)
   - Gorduras (g)

Para refeições vazias:
✅ Mostra "Nenhuma refeição registrada"
```

**Se falhar:**
- Verificar estrutura de `foods_detected` no banco
- Verificar se dados estão em `sofia_food_analysis`
- Verificar componente `MealSection`

---

### TESTE 5: Fechar Popup ✅

**Objetivo:** Verificar se fecha corretamente

**Passos:**
1. Com popup aberto, clicar no "X"
2. OU clicar fora do popup

**Resultado Esperado:**
```
✅ Popup fecha suavemente
✅ Volta para dashboard
✅ Card semanal continua visível
```

**Se falhar:**
- Verificar função `onClose`
- Verificar estado `selectedDay`

---

### TESTE 6: Gerar Lista de Compras ✅

**Objetivo:** Verificar se gera lista corretamente

**Passos:**
1. Abrir popup de um dia
2. Clicar em "Gerar Lista de Compras da Semana"
3. Aguardar processamento

**Resultado Esperado:**
```
✅ Botão mostra "Gerando lista..."
✅ Após alguns segundos, toast aparece:
   "✅ Lista enviada!"
   "Confira seu WhatsApp para ver a lista de compras"
✅ Botão volta ao normal
```

**Se falhar:**
- Verificar console para erros
- Verificar se telefone está cadastrado
- Verificar hook `useShoppingList`
- Verificar tabela `shopping_lists`

---

### TESTE 7: Receber no WhatsApp ✅

**Objetivo:** Verificar se mensagem chega no WhatsApp

**Passos:**
1. Após gerar lista, abrir WhatsApp
2. Verificar mensagens

**Resultado Esperado:**
```
✅ Mensagem recebida de Sofia
✅ Formato correto:
   🛒 LISTA DE COMPRAS
   📅 Semana de X a Y
   
   🍗 PROTEÍNAS
   ☐ Frango: 500g
   ☐ Salmão: 150g
   
   🌾 GRÃOS E CEREAIS
   ☐ Arroz: 300g
   
   ... (outras categorias)
   
   ✅ Marque os itens conforme compra!
   _MaxNutrition 🥗_
```

**Se falhar:**
- Verificar edge function WhatsApp
- Verificar telefone cadastrado
- Verificar logs do Supabase
- Verificar se `sent_to_whatsapp` foi marcado

---

### TESTE 8: Múltiplos Dias ✅

**Objetivo:** Verificar se funciona para diferentes dias

**Passos:**
1. Clicar em diferentes dias da semana
2. Verificar se cada um mostra dados corretos

**Resultado Esperado:**
```
✅ Cada dia mostra suas próprias refeições
✅ Não mistura dados de dias diferentes
✅ Dias vazios mostram "Nenhuma refeição"
✅ Dia atual (hoje) está destacado em azul
```

**Se falhar:**
- Verificar filtro de data no hook
- Verificar se `created_at` está correto no banco

---

### TESTE 9: Performance ✅

**Objetivo:** Verificar se carrega rápido

**Passos:**
1. Abrir DevTools (F12)
2. Ir para aba Network
3. Recarregar página
4. Medir tempo de carregamento

**Resultado Esperado:**
```
✅ Card aparece em < 2 segundos
✅ Clique no dia abre popup em < 1 segundo
✅ Lista de compras gera em < 5 segundos
✅ Sem erros no console
```

**Se falhar:**
- Otimizar queries do banco
- Adicionar índices
- Usar cache

---

### TESTE 10: Responsividade ✅

**Objetivo:** Verificar se funciona em mobile

**Passos:**
1. Abrir DevTools (F12)
2. Ativar modo mobile (Ctrl+Shift+M)
3. Testar em diferentes tamanhos

**Resultado Esperado:**
```
✅ Card se adapta ao tamanho da tela
✅ Dias ficam legíveis
✅ Popup ocupa tela inteira em mobile
✅ Botões são clicáveis
✅ Texto não corta
```

**Se falhar:**
- Ajustar classes Tailwind
- Adicionar breakpoints
- Testar em dispositivo real

---

## 📊 CHECKLIST FINAL

Marque cada teste conforme completa:

- [ ] TESTE 1: Card aparece
- [ ] TESTE 2: Informações visuais corretas
- [ ] TESTE 3: Clique abre popup
- [ ] TESTE 4: Detalhes das refeições
- [ ] TESTE 5: Fechar popup
- [ ] TESTE 6: Gerar lista de compras
- [ ] TESTE 7: Receber no WhatsApp
- [ ] TESTE 8: Múltiplos dias
- [ ] TESTE 9: Performance OK
- [ ] TESTE 10: Responsivo

---

## 🐛 PROBLEMAS COMUNS E SOLUÇÕES

### Problema: Card não aparece

**Solução:**
```bash
# Verificar se migration foi aplicada
supabase db push

# Verificar console do navegador
# F12 → Console → Ver erros

# Verificar se componente foi importado
# Abrir SofiaNutricionalRedesigned.tsx
# Verificar linha: import { WeeklyPlanCard } from '@/components/mealie/WeeklyPlanCard';
```

### Problema: Popup não abre

**Solução:**
```typescript
// Verificar se Dialog está importado
import { Dialog, DialogContent } from '@/components/ui/dialog';

// Verificar estado
const [selectedDay, setSelectedDay] = useState(null);

// Verificar onClick
onClick={() => setSelectedDay(day)}
```

### Problema: Lista não é enviada

**Solução:**
```sql
-- Verificar telefone cadastrado
SELECT phone FROM profiles WHERE id = 'SEU_USER_ID';

-- Cadastrar telefone se necessário
UPDATE profiles 
SET phone = '5511999999999' 
WHERE id = 'SEU_USER_ID';

-- Verificar edge function
-- Supabase Dashboard → Edge Functions → Logs
```

### Problema: Dados não aparecem

**Solução:**
```sql
-- Verificar se há refeições
SELECT * FROM sofia_food_analysis 
WHERE user_id = 'SEU_USER_ID'
ORDER BY created_at DESC
LIMIT 10;

-- Se vazio, executar script de teste
-- scripts/test-mealie-integration.sql
```

---

## 🎯 CRITÉRIOS DE SUCESSO

O teste é considerado **APROVADO** se:

1. ✅ Todos os 10 testes passam
2. ✅ Sem erros no console
3. ✅ Performance < 2s
4. ✅ Funciona em mobile
5. ✅ Lista chega no WhatsApp

---

## 📝 RELATÓRIO DE TESTE

Após completar todos os testes, preencha:

```
Data do Teste: ___/___/2026
Testador: _________________
Ambiente: [ ] Local [ ] Produção

Resultados:
- Testes Passados: ___/10
- Testes Falhados: ___/10
- Bugs Encontrados: ___

Status Final: [ ] APROVADO [ ] REPROVADO

Observações:
_________________________________
_________________________________
_________________________________
```

---

**Bons testes! 🧪**
