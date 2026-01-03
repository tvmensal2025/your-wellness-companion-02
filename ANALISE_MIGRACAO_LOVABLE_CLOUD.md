# 🔄 ANÁLISE DE MIGRAÇÃO PARA LOVABLE CLOUD

## ⚠️ PROBLEMA IDENTIFICADO

A plataforma inteira está usando referências **HARDCODED** ao projeto Supabase antigo em vez das variáveis de ambiente do Lovable Cloud.

### Projeto Antigo (INCORRETO):
```
URL: https://hlrkoyywjpckdotimtik.supabase.co
Project ID: hlrkoyywjpckdotimtik
Anon Key: eyJhbGc...kYEtg1hYG2pmcyIeXRs-vgNIVOD76Yu7KPlyFN0vdUI
```

### Projeto Lovable Cloud (CORRETO):
```
URL: https://vgmqcodfdslyculfaknx.supabase.co
Project ID: vgmqcodfdslyculfaknx
Anon Key: eyJhbGc...NMM2EGBLJ7Unht4ZY4RY-_Lg9YPvZ5kfKWoyglBOLiw
```

---

## 📊 ESTATÍSTICAS DA ANÁLISE

- **199 arquivos** com referências ao projeto antigo
- **1229 ocorrências** do ID antigo
- **925 ocorrências** da URL antiga

### Categorias de Arquivos Afetados:

#### 1. **Código da Aplicação (CRÍTICO)** - 45 arquivos
- `src/hooks/useConversation.ts` - TTS do Google
- `src/lib/character-images.ts` - URLs de imagens dos personagens
- Outros hooks e componentes

#### 2. **Edge Functions (CRÍTICO)** - 15+ arquivos
- `supabase/functions/analyze-medical-exam/index.ts`
- `supabase/functions/*/index.ts` - Chamadas internas entre functions

#### 3. **Scripts de Teste** - 80+ arquivos
- Scripts `.js`, `.mjs` de teste e debug
- Configurações de teste

#### 4. **Documentação** - 50+ arquivos
- Markdown com exemplos
- Tutoriais com URLs antigas

#### 5. **Arquivos de Configuração** - 10 arquivos
- `CONFIGURACAO_ATUAL_SISTEMA.md`
- Workflows N8N
- Callbacks HTML

---

## 🔧 CORREÇÕES NECESSÁRIAS

### ✅ 1. Variáveis de Ambiente (.env)

**JÁ EXISTE** o arquivo `.env` com as configurações corretas do Lovable Cloud:
```env
VITE_SUPABASE_URL=https://vgmqcodfdslyculfaknx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
VITE_SUPABASE_PROJECT_ID=vgmqcodfdslyculfaknx
```

### 🚨 2. Código de Produção (src/)

**PROBLEMA**: Código usando URLs hardcoded
```typescript
// ❌ INCORRETO
const response = await fetch(
  'https://hlrkoyywjpckdotimtik.supabase.co/functions/v1/google-tts',
  { ... }
);

// ✅ CORRETO
const response = await fetch(
  `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/google-tts`,
  { ... }
);
```

### 🚨 3. Edge Functions (supabase/functions/)

**PROBLEMA**: Functions chamando outras functions com URL hardcoded
```typescript
// ❌ INCORRETO
const visionResponse = await fetch(
  'https://hlrkoyywjpckdotimtik.supabase.co/functions/v1/vision-api',
  { ... }
);

// ✅ CORRETO
const visionResponse = await fetch(
  `${Deno.env.get('SUPABASE_URL')}/functions/v1/vision-api`,
  { ... }
);
```

### ⚠️ 4. Scripts de Teste

**AÇÃO**: Atualizar para usar variáveis de ambiente
```javascript
// ❌ INCORRETO
const supabaseUrl = 'https://hlrkoyywjpckdotimtik.supabase.co';

// ✅ CORRETO
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://vgmqcodfdslyculfaknx.supabase.co';
```

### 📝 5. Documentação

**AÇÃO**: Atualizar exemplos e tutoriais
- Substituir URLs antigas por variáveis de ambiente
- Atualizar screenshots se necessário

---

## 🎯 PLANO DE AÇÃO IMEDIATO

### Fase 1: CRÍTICO (Agora) ⚡
1. ✅ Corrigir `src/hooks/useConversation.ts`
2. ✅ Corrigir `src/lib/character-images.ts`
3. ✅ Corrigir todas Edge Functions com URLs hardcoded
4. ✅ Buscar e corrigir outros arquivos em `src/`

### Fase 2: IMPORTANTE (Depois) 📋
5. Atualizar scripts de teste principais
6. Corrigir callbacks HTML (Google Fit, etc)
7. Atualizar configurações N8N

### Fase 3: MANUTENÇÃO (Opcional) 🔧
8. Atualizar documentação
9. Limpar scripts de teste antigos
10. Atualizar tutoriais

---

## 📝 ARQUIVOS PRIORITÁRIOS PARA CORREÇÃO

### Código de Produção (src/):
```
✅ src/hooks/useConversation.ts (linha 189)
✅ src/lib/character-images.ts (linhas 6-7)
```

### Edge Functions:
```
✅ supabase/functions/analyze-medical-exam/index.ts (linha 2000)
✅ Buscar outros casos em functions/*
```

### Callbacks e Integrações:
```
⚠️ Public/google-fit-callback.html (linha 209)
⚠️ n8n-workflow-config.json (linha 26)
```

### Configuração do Sistema:
```
📝 CONFIGURACAO_ATUAL_SISTEMA.md (linhas 105-106)
```

---

## ✅ STATUS DE MIGRAÇÃO

- [x] Variáveis de ambiente configuradas (.env)
- [ ] Código frontend corrigido
- [ ] Edge functions corrigidas
- [ ] Scripts de teste atualizados
- [ ] Documentação atualizada
- [ ] Integrações externas atualizadas

---

## 🔐 SEGURANÇA

### ⚠️ CRITICAL: Service Role Keys Expostas

Encontradas **SERVICE ROLE KEYS** hardcoded em scripts:
```javascript
// ❌ NUNCA FAZER ISSO
const supabaseServiceKey = 'eyJhbGciOiJI...'; // EXPOSTO!
```

**AÇÃO IMEDIATA**:
1. Remover todas as service role keys dos scripts
2. Usar apenas em Edge Functions (variável de ambiente segura)
3. Regenerar keys se necessário

---

## 📊 RESUMO

| Categoria | Arquivos | Status | Prioridade |
|-----------|----------|--------|------------|
| Frontend (src/) | 45 | 🔴 Pendente | CRÍTICA |
| Edge Functions | 15+ | 🔴 Pendente | CRÍTICA |
| Scripts de Teste | 80+ | 🟡 Pendente | MÉDIA |
| Documentação | 50+ | 🟡 Pendente | BAIXA |
| Configurações | 10 | 🟡 Pendente | MÉDIA |

---

## 🎯 RESULTADO ESPERADO

Após as correções:
- ✅ Todos os erros de autenticação resolvidos
- ✅ Sistema funcionando 100% no Lovable Cloud
- ✅ Sem referências hardcoded
- ✅ Fácil manutenção futura
- ✅ Segurança aprimorada

---

**Data da Análise**: 2026-01-03  
**Status**: 🔴 CORREÇÕES URGENTES NECESSÁRIAS
