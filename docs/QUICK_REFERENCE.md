# ⚡ Referência Rápida - MaxNutrition Storage

## 🎯 Onde os Dados Estão Salvos (1 minuto)

```
┌─────────────────────────────────────────────────────────────┐
│                    MAXNUTRITION STORAGE                     │
└─────────────────────────────────────────────────────────────┘

🌐 SUPABASE CLOUD (99% dos dados)
   ├── 📊 PostgreSQL: 209 tabelas
   ├── ☁️  Storage: Imagens, PDFs, documentos
   └── ⚡ Edge Functions: 73 funções serverless

💻 BROWSER (1% dos dados)
   ├── 💾 localStorage: 8 keys (preferências)
   ├── 🔄 sessionStorage: 1 key (temporário)
   └── 📦 PWA Cache: 3 caches (assets)

🐳 DOCKER (Dev apenas)
   └── Volumes locais (não usado em produção)
```

## 📊 Top 20 Tabelas Mais Usadas

| # | Tabela | Uso |
|---|--------|-----|
| 1 | `profiles` | Perfil do usuário |
| 2 | `user_physical_data` | Dados físicos (altura, peso, IMC) |
| 3 | `food_analysis` | Análises de alimentos |
| 4 | `sofia_food_analysis` | Análises da IA Sofia |
| 5 | `medical_documents` | Documentos médicos |
| 6 | `medical_exam_analyses` | Análises de exames |
| 7 | `weight_measurements` | Medições de peso |
| 8 | `advanced_daily_tracking` | Tracking diário completo |
| 9 | `exercise_sessions` | Sessões de exercício |
| 10 | `workout_history` | Histórico de treinos |
| 11 | `challenges` | Desafios |
| 12 | `challenge_participations` | Participações em desafios |
| 13 | `user_goals` | Metas do usuário |
| 14 | `user_sessions` | Sessões do usuário |
| 15 | `daily_responses` | Respostas diárias |
| 16 | `nutrition_tracking` | Tracking nutricional |
| 17 | `sleep_tracking` | Tracking de sono |
| 18 | `water_tracking` | Tracking de água |
| 19 | `mood_tracking` | Tracking de humor |
| 20 | `user_achievements` | Conquistas |

## 🔑 localStorage Keys

| Key | Tipo | Uso |
|-----|------|-----|
| `maxnutrition_selected_character` | string | Personagem selecionado (Sofia/Dr. Vital) |
| `user_goals` | JSON | Cache de metas do usuário |
| `sofia_insights_last_generated` | timestamp | Última geração de insights |
| `hasSeenWelcomeModal` | boolean | Flag de modal de boas-vindas |
| `daily_chest_claimed` | timestamp | Controle de baú diário |
| `voice_config` | JSON | Configuração de voz |
| `emailConfig` | JSON | Configuração de email |
| `n8nConfig` | JSON | Configuração n8n |

## ☁️ Storage Buckets

| Bucket | Conteúdo | Tamanho Típico |
|--------|----------|----------------|
| `avatars` | Avatares de usuário | 100KB - 500KB |
| `medical-documents` | Exames, PDFs médicos | 500KB - 5MB |
| `food-images` | Fotos de alimentos | 200KB - 2MB |
| `profile-photos` | Fotos de perfil | 100KB - 1MB |

## ⚡ Top 10 Edge Functions

| # | Function | Uso |
|---|----------|-----|
| 1 | `sofia-image-analysis` | Análise de imagens de alimentos |
| 2 | `analyze-medical-exam` | Análise de exames médicos |
| 3 | `dr-vital-chat` | Chat com Dr. Vital |
| 4 | `whatsapp-webhook-unified` | Webhook WhatsApp unificado |
| 5 | `food-analysis` | Análise de alimentos |
| 6 | `dr-vital-weekly-report` | Relatório semanal |
| 7 | `whatsapp-ai-assistant` | Assistente WhatsApp |
| 8 | `nutrition-calc` | Cálculo nutricional |
| 9 | `google-fit-sync` | Sincronização Google Fit |
| 10 | `generate-medical-report` | Geração de relatórios |

## 🔍 Comandos Mais Usados

```bash
# Análise completa
python3 scripts/analyze-storage.py

# Menu interativo
./scripts/storage-commands.sh

# Listar Edge Functions
./scripts/storage-commands.sh functions

# Gerar relatório de uso
./scripts/storage-commands.sh report

# Procurar uso de tabela
grep -r "from('profiles')" src/

# Ver migrations
ls -lh supabase/migrations/

# Gerar tipos TypeScript
npx supabase gen types typescript --local
```

## 📁 Estrutura de Pastas Importante

```
projeto/
├── src/
│   ├── integrations/supabase/
│   │   ├── client.ts          ← Cliente Supabase (ÚNICO)
│   │   └── types.ts           ← Tipos (AUTO-GERADO)
│   ├── hooks/                 ← Hooks customizados
│   ├── components/            ← Componentes React
│   └── pages/                 ← Páginas
├── supabase/
│   ├── functions/             ← Edge Functions (73)
│   └── migrations/            ← Migrations SQL
├── docs/
│   ├── STORAGE_*.md           ← Documentação de storage
│   └── *.md                   ← Outras docs
└── scripts/
    ├── analyze-storage.py     ← Script de análise
    └── storage-commands.sh    ← Comandos úteis
```

## 🚨 Erros Comuns

| Erro | Causa | Solução |
|------|-------|---------|
| `column "role" does not exist` | Tentando acessar `profiles.role` | Use `supabase.rpc('is_admin_user')` |
| `data is not iterable` | Esqueceu que Supabase retorna array | Use `data?.[0]` ou `.single()` |
| `storage bucket not found` | Bucket não existe | Criar bucket no Dashboard |
| `RLS policy violation` | Sem permissão | Verificar policies RLS |

## 🔐 Segurança Rápida

```typescript
// ✅ CORRETO - Verificar admin
const { data: isAdmin } = await supabase.rpc('is_admin_user');

// ✅ CORRETO - Query com RLS
const { data } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', userId);

// ✅ CORRETO - Upload com policy
const { data } = await supabase.storage
  .from('avatars')
  .upload(`${userId}/avatar.png`, file);

// ❌ ERRADO - Sem verificação
const { data } = await supabase
  .from('profiles')
  .select('*'); // Retorna TODOS os perfis!
```

## 📊 Fluxos Principais

### 1. Análise de Alimento (Sofia)

```
Usuário → Foto → Upload Storage → Edge Function
  ↓
YOLO detecta → Gemini refina → Salva no banco
  ↓
App mostra resultado
```

### 2. Análise de Exame (Dr. Vital)

```
Usuário → PDF/Imagem → Upload Storage → Edge Function
  ↓
YOLO + Gemini analisam → Salva no banco
  ↓
App mostra relatório
```

### 3. Tracking Diário

```
Usuário → Registra dados → App valida
  ↓
Salva no banco → Cache local
  ↓
Sincroniza em tempo real
```

## 🎯 Checklist Diário

- [ ] Verificar logs de erro
- [ ] Monitorar uso de Edge Functions
- [ ] Verificar performance de queries

## 📚 Links Rápidos

| Preciso de... | Vá para... |
|---------------|------------|
| **Visão geral** | [STORAGE_SUMMARY.md](STORAGE_SUMMARY.md) |
| **Detalhes** | [STORAGE_ANALYSIS_REPORT.md](STORAGE_ANALYSIS_REPORT.md) |
| **Diagramas** | [STORAGE_DIAGRAM.md](STORAGE_DIAGRAM.md) |
| **Como usar** | [STORAGE_README.md](STORAGE_README.md) |
| **Índice** | [INDEX.md](INDEX.md) |

## 💡 Dicas Rápidas

1. **Sempre use `@/` para imports**
   ```typescript
   import { supabase } from '@/integrations/supabase/client';
   ```

2. **Supabase retorna arrays**
   ```typescript
   const { data } = await supabase.from('profiles').select('*');
   const profile = data?.[0]; // Acesse como array
   ```

3. **Use .single() quando espera 1 resultado**
   ```typescript
   const { data } = await supabase
     .from('profiles')
     .select('*')
     .eq('id', userId)
     .single(); // Retorna objeto, não array
   ```

4. **YOLO é essencial**
   - Sempre tente YOLO primeiro
   - Fallback para Gemini se falhar
   - 90% mais barato, 10x mais rápido

5. **Cache é seu amigo**
   - localStorage para preferências
   - PWA cache para assets
   - Redis para queries (futuro)

## 🔄 Workflow Típico

```
1. Ler documentação (você está aqui)
   ↓
2. Verificar tabela existe (STORAGE_ANALYSIS_REPORT.md)
   ↓
3. Implementar código (AI_CODING_GUIDELINES.md)
   ↓
4. Testar localmente
   ↓
5. Deploy
   ↓
6. Monitorar logs
```

## 📞 Suporte Rápido

| Problema | Solução |
|----------|---------|
| **Não sei onde está X** | Execute `python3 scripts/analyze-storage.py` |
| **Erro de coluna** | Consulte [COMMON_ERRORS.md](COMMON_ERRORS.md) |
| **Query lenta** | Adicione índice, use cache |
| **Storage cheio** | Limpe arquivos antigos, comprima imagens |

---

**💡 Dica:** Salve esta página nos favoritos para consulta rápida!

**📚 Documentação Completa:** [INDEX.md](INDEX.md)

**🔄 Última atualização:** Janeiro 2026
