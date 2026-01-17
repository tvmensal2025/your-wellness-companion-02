# 🚀 APLICAR CARD SEMANAL AGORA

## ✅ STATUS: CÓDIGO PRONTO

Todo o código está implementado e funcionando. Falta apenas aplicar no banco de dados.

---

## 📋 PASSO A PASSO (5 MINUTOS)

### PASSO 1: Aplicar Migration no Supabase

**Opção A: Via Supabase Dashboard (RECOMENDADO)**

1. Abrir: https://supabase.com/dashboard/project/ciszqtlaacrhfwsqnvjr
2. Ir para: **SQL Editor**
3. Clicar em: **New Query**
4. Copiar e colar o conteúdo do arquivo: `supabase/migrations/20260117150000_create_shopping_lists.sql`
5. Clicar em: **Run**

**Resultado esperado:**
```
✓ Success. No rows returned
```

---

**Opção B: Via Supabase CLI (se tiver instalado)**

```bash
supabase db push
```

---

### PASSO 2: Iniciar o App

```bash
npm run dev
```

**Aguarde até ver:**
```
➜  Local:   http://localhost:5173/
```

---

### PASSO 3: Testar

1. Abrir: http://localhost:5173
2. Fazer login
3. Ir para: **Dashboard Sofia** (aba Nutrição)
4. Rolar a página
5. Procurar: **"📅 Seu Cardápio da Semana"**

---

## 🎯 O QUE VOCÊ VAI VER

### Se NÃO tiver refeições ainda:

```
┌─────────────────────────────────────────────┐
│  📅 Seu Cardápio da Semana      [0/7 completos]│
├─────────────────────────────────────────────┤
│                                              │
│  DOM   SEG   TER   QUA   QUI   SEX   SAB    │
│  ⚪    ⚪   ⚪   ⚪   ⚪   ⚪   ⚪         │
│  17    18   19   20   21   22   23          │
│  0/4   0/4  0/4  0/4  0/4  0/4  0/4         │
│  -     -    -    -    -    -    -           │
│                                              │
│  👆 Toque em um dia para ver detalhes       │
└─────────────────────────────────────────────┘
```

**Normal!** Você ainda não registrou refeições esta semana.

---

### Se JÁ tiver refeições:

```
┌─────────────────────────────────────────────┐
│  📅 Seu Cardápio da Semana      [3/7 completos]│
├─────────────────────────────────────────────┤
│                                              │
│  DOM   SEG   TER   QUA   QUI   SEX   SAB    │
│  ⚪    🟢   🟢   🔵   🟡   ⚪   ⚪         │
│  17    18   19   20   21   22   23          │
│  0/4   4/4  4/4  3/4  1/4  0/4  0/4         │
│  -    1650  1700  930  1800   -    -        │
│                                              │
│  👆 Toque em um dia para ver detalhes       │
└─────────────────────────────────────────────┘
```

**Perfeito!** O card está mostrando seu histórico.

---

## 🧪 CRIAR DADOS DE TESTE (OPCIONAL)

Se quiser testar com dados fictícios:

### 1. Descobrir seu User ID

No Supabase Dashboard → SQL Editor:

```sql
SELECT id, email FROM auth.users WHERE email = 'seu@email.com';
```

Copie o `id` retornado.

---

### 2. Criar Refeições de Teste

1. Abrir arquivo: `scripts/test-mealie-integration.sql`
2. Substituir **TODAS** as ocorrências de `USER_ID_AQUI` pelo seu ID
3. Executar no SQL Editor

**Resultado:**
- Segunda e Terça: 4 refeições (completo) 🟢
- Quarta: 2 refeições (parcial) 🟡
- Quinta: 1 refeição (parcial) 🟡
- Outros dias: vazios ⚪

---

## ✅ VALIDAÇÃO

### Checklist Básico

- [ ] Migration aplicada sem erros
- [ ] App rodando (`npm run dev`)
- [ ] Card "Seu Cardápio da Semana" aparece
- [ ] Mostra 7 dias da semana
- [ ] Badge "X/7 completos" aparece
- [ ] Clique em um dia abre popup
- [ ] Popup mostra detalhes das refeições
- [ ] Botão "X" fecha popup

---

## 🐛 PROBLEMAS COMUNS

### Card não aparece

**Solução:**
1. Abrir console do navegador (F12)
2. Procurar por erros
3. Verificar se migration foi aplicada
4. Recarregar página (Ctrl+R)

---

### Popup não abre

**Solução:**
1. Verificar se há refeições no banco
2. Executar script de teste SQL
3. Verificar console para erros

---

### Erro "table shopping_lists does not exist"

**Solução:**
- Migration não foi aplicada
- Voltar ao PASSO 1 e aplicar novamente

---

## 📊 PRÓXIMOS PASSOS

Após validar que está funcionando:

1. **Usar no dia a dia:**
   - Registre suas refeições via WhatsApp
   - Veja o histórico no card semanal
   - Acompanhe seu progresso

2. **Futuro - Cardápio Chef:**
   - Gerar cardápio personalizado
   - Lista de compras automática
   - Planejamento semanal

---

## 🎯 RESUMO

**O que fazer AGORA:**

1. Aplicar migration (SQL Editor)
2. Iniciar app (`npm run dev`)
3. Testar card semanal
4. ✅ PRONTO!

**Tempo:** 5 minutos

---

## 📚 DOCUMENTAÇÃO COMPLETA

- `QUICK_START_CARD_SEMANAL.md` - Guia rápido
- `TESTE_CARD_SEMANAL.md` - Testes detalhados
- `MUDANCA_LISTA_COMPRAS.md` - Mudança aplicada

---

**Vamos lá! 🚀**

Execute os comandos e me avise se aparecer algum erro!
