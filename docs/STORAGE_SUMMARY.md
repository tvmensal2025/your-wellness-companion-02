# 📊 Resumo Executivo - Armazenamento MaxNutrition

## 🎯 Onde TUDO está sendo salvo

### 1. 🌐 SUPABASE CLOUD (99% dos dados)

**Banco de Dados PostgreSQL**
- **209 tabelas** organizadas por feature
- Dados estruturados (perfis, tracking, análises)
- Backup automático diário

**Storage (Arquivos)**
- Imagens de alimentos
- Documentos médicos (PDFs, exames)
- Avatares de usuários
- Fotos de perfil

**Edge Functions (73 funções)**
- Processamento serverless
- Não armazena dados (apenas processa)
- Integração com YOLO, Gemini, WhatsApp

### 2. 💻 BROWSER (Cliente - 1% dos dados)

**localStorage (8 keys)**
- Preferências do usuário
- Personagem selecionado
- Configurações de voz
- Cache de metas

**PWA Cache (3 caches)**
- Assets estáticos (JS, CSS, HTML)
- Imagens (30 dias)
- Fontes (365 dias)
- Cache Supabase (24 horas)

### 3. 🐳 DOCKER (Apenas desenvolvimento)

**Volumes locais**
- Banco de dados local
- Modelos YOLO
- Logs de desenvolvimento
- **NÃO usado em produção**

---

## 📈 Estatísticas

| Métrica | Valor |
|---------|-------|
| **Total de Tabelas** | 209 |
| **Edge Functions** | 73 |
| **Storage Buckets** | ~5 |
| **localStorage Keys** | 8 |
| **PWA Caches** | 3 |

---

## 🔑 Tabelas Mais Importantes

### Perfil e Usuário
- `profiles` - Dados básicos do perfil
- `user_physical_data` - Altura, peso, IMC
- `user_roles` - Permissões (admin, user)

### Nutrição (Sofia)
- `food_analysis` - Análises de alimentos
- `sofia_food_analysis` - Análises da IA
- `nutrition_tracking` - Tracking nutricional
- `nutrition_foods` - Base de alimentos

### Saúde (Dr. Vital)
- `medical_documents` - Documentos médicos
- `medical_exam_analyses` - Análises de exames
- `health_diary` - Diário de saúde
- `weight_measurements` - Medições de peso

### Tracking Diário
- `advanced_daily_tracking` - Tracking completo
- `sleep_tracking` - Sono
- `water_tracking` - Água
- `mood_tracking` - Humor

### Exercícios
- `exercise_sessions` - Sessões de exercício
- `workout_history` - Histórico de treinos
- `exercises_library` - Biblioteca de exercícios

### Gamificação
- `challenges` - Desafios
- `challenge_participations` - Participações
- `user_achievements` - Conquistas
- `user_points` - Pontos

---

## 🔄 Fluxo de Dados Simplificado

```
1. Usuário interage com o app
   ↓
2. App envia dados para Supabase
   ↓
3. Supabase salva no banco/storage
   ↓
4. Edge Functions processam (se necessário)
   ↓
5. Resultado volta para o app
   ↓
6. App cacheia localmente (PWA)
```

---

## 🔐 Segurança

- **RLS (Row Level Security)**: Usuários só veem seus dados
- **JWT**: Autenticação via token
- **HTTPS**: Todas as comunicações criptografadas
- **Backup**: Diário automático (7 dias de retenção)

---

## 💰 Custos de Armazenamento

### Plano Atual (Supabase Free)
- ✅ 500MB Database
- ✅ 1GB Storage
- ✅ 2GB Bandwidth/mês
- ✅ 500K Edge Function invocations/mês

### Quando Escalar (Supabase Pro - $25/mês)
- 🚀 8GB Database
- 🚀 100GB Storage
- 🚀 50GB Bandwidth/mês
- 🚀 2M Edge Function invocations/mês

---

## 📊 Uso Atual Estimado

| Recurso | Uso Estimado | Limite Free | Status |
|---------|--------------|-------------|--------|
| **Database** | ~200MB | 500MB | ✅ OK |
| **Storage** | ~500MB | 1GB | ⚠️ Monitorar |
| **Bandwidth** | ~1GB/mês | 2GB/mês | ✅ OK |
| **Edge Functions** | ~100K/mês | 500K/mês | ✅ OK |

---

## 🎯 Principais Integrações

### YOLO Service
- **URL**: `yolo-service-yolo-detection.0sw627.easypanel.host`
- **Uso**: Detecção de objetos em imagens
- **Economia**: 90% de custos vs Gemini Vision
- **Velocidade**: 10x mais rápido

### WhatsApp (Evolution API)
- **Uso**: Envio de mensagens, lembretes, relatórios
- **Tabelas**: 15+ tabelas relacionadas
- **Edge Functions**: 15+ funções

### Google Fit
- **Uso**: Sincronização de dados de saúde
- **Tabelas**: `google_fit_data`, `google_fit_tokens`
- **Edge Functions**: 4 funções

### n8n
- **Uso**: Automações e workflows
- **Webhooks**: Integração bidirecional

---

## 🚀 Otimizações Recomendadas

### Curto Prazo (1-3 meses)
1. ✅ Implementar limpeza automática de cache antigo
2. ✅ Comprimir imagens antes do upload
3. ✅ Adicionar índices em queries lentas

### Médio Prazo (3-6 meses)
1. 🔄 Implementar CDN para assets estáticos
2. 🔄 Adicionar Redis para cache de queries
3. 🔄 Particionar tabelas grandes

### Longo Prazo (6-12 meses)
1. 📅 Migrar para Supabase Pro
2. 📅 Implementar data warehouse para analytics
3. 📅 Adicionar replicação geográfica

---

## 📝 Checklist de Manutenção

### Diário
- [ ] Verificar logs de erro
- [ ] Monitorar uso de Edge Functions

### Semanal
- [ ] Revisar uso de storage
- [ ] Verificar performance de queries
- [ ] Limpar cache antigo

### Mensal
- [ ] Revisar políticas de RLS
- [ ] Testar backup e restauração
- [ ] Analisar custos

### Trimestral
- [ ] Revisar arquitetura
- [ ] Planejar escalabilidade
- [ ] Atualizar documentação

---

## 🆘 Troubleshooting Rápido

### "Banco de dados lento"
1. Verificar índices
2. Analisar queries com EXPLAIN
3. Considerar cache Redis

### "Storage cheio"
1. Limpar imagens antigas
2. Comprimir arquivos
3. Migrar para plano Pro

### "Edge Functions falhando"
1. Verificar logs no Supabase
2. Testar localmente com Deno
3. Verificar rate limits

### "Cache não funcionando"
1. Limpar Service Worker
2. Verificar vite.config.ts
3. Testar em modo incógnito

---

## 📚 Documentação Relacionada

- `STORAGE_ANALYSIS_REPORT.md` - Relatório completo detalhado
- `STORAGE_DIAGRAM.md` - Diagramas visuais
- `AI_CODING_GUIDELINES.md` - Guia de desenvolvimento
- `COMMON_ERRORS.md` - Erros comuns e soluções

---

## 🎓 Para Novos Desenvolvedores

### Onde começar?
1. Leia `STORAGE_ANALYSIS_REPORT.md` para entender a arquitetura
2. Veja `STORAGE_DIAGRAM.md` para visualizar o fluxo
3. Consulte `AI_CODING_GUIDELINES.md` para padrões de código

### Principais regras
- ✅ SEMPRE usar `@/integrations/supabase/client` para Supabase
- ✅ NUNCA editar `types.ts` (auto-gerado)
- ✅ SEMPRE verificar se tabela existe antes de usar
- ✅ SEMPRE usar RLS policies

### Comandos úteis
```bash
# Analisar armazenamento
python3 scripts/analyze-storage.py

# Verificar tipos do Supabase
npx supabase gen types typescript --local

# Testar Edge Function
npx supabase functions serve [nome-funcao]

# Ver logs
npx supabase functions logs [nome-funcao]
```

---

**Última atualização:** Janeiro 2026  
**Próxima revisão:** Abril 2026
