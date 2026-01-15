# 📚 Índice Geral da Documentação - MaxNutrition

## 🎯 Navegação Rápida

### Por Tipo de Informação

| Preciso de... | Vá para... |
|---------------|------------|
| **Visão geral rápida** | [STORAGE_SUMMARY.md](STORAGE_SUMMARY.md) |
| **Detalhes completos** | [STORAGE_ANALYSIS_REPORT.md](STORAGE_ANALYSIS_REPORT.md) |
| **Diagramas visuais** | [STORAGE_DIAGRAM.md](STORAGE_DIAGRAM.md) |
| **Como usar a documentação** | [STORAGE_README.md](STORAGE_README.md) |
| **Regras de código** | [AI_CODING_GUIDELINES.md](AI_CODING_GUIDELINES.md) |
| **Erros comuns** | [COMMON_ERRORS.md](COMMON_ERRORS.md) |
| **Integração YOLO** | [YOLO_INTEGRACAO_COMPLETA.md](YOLO_INTEGRACAO_COMPLETA.md) |

### Por Persona

#### 👨‍💻 Novo Desenvolvedor
1. Comece com [STORAGE_SUMMARY.md](STORAGE_SUMMARY.md)
2. Veja os diagramas em [STORAGE_DIAGRAM.md](STORAGE_DIAGRAM.md)
3. Leia [AI_CODING_GUIDELINES.md](AI_CODING_GUIDELINES.md)
4. Consulte [COMMON_ERRORS.md](COMMON_ERRORS.md)

#### 🏗️ Arquiteto de Software
1. Leia [STORAGE_ANALYSIS_REPORT.md](STORAGE_ANALYSIS_REPORT.md)
2. Analise [STORAGE_DIAGRAM.md](STORAGE_DIAGRAM.md)
3. Revise políticas de segurança no relatório

#### 🔧 DevOps
1. Veja [STORAGE_ANALYSIS_REPORT.md](STORAGE_ANALYSIS_REPORT.md) seção Docker
2. Consulte instruções de backup
3. Use `scripts/storage-commands.sh`

#### 📊 Product Manager
1. Leia [STORAGE_SUMMARY.md](STORAGE_SUMMARY.md)
2. Veja estatísticas e custos
3. Consulte roadmap de otimizações

## 📁 Estrutura da Documentação

```
docs/
├── INDEX.md (você está aqui)
├── STORAGE_README.md (como usar a documentação)
├── STORAGE_SUMMARY.md (resumo executivo)
├── STORAGE_ANALYSIS_REPORT.md (relatório completo)
├── STORAGE_DIAGRAM.md (diagramas visuais)
├── AI_CODING_GUIDELINES.md (guia de código)
├── COMMON_ERRORS.md (erros comuns)
├── DATABASE_QUICK_REF.md (referência rápida)
└── YOLO_INTEGRACAO_COMPLETA.md (integração YOLO)

scripts/
├── analyze-storage.py (análise automatizada)
└── storage-commands.sh (comandos úteis)
```

## 🔍 Busca Rápida

### Tabelas do Banco

| Categoria | Onde encontrar |
|-----------|----------------|
| **Todas as tabelas (209)** | [STORAGE_ANALYSIS_REPORT.md](STORAGE_ANALYSIS_REPORT.md#1-supabase-cloud-database-principal) |
| **Perfil e Usuário** | [STORAGE_ANALYSIS_REPORT.md](STORAGE_ANALYSIS_REPORT.md#perfil-e-autenticação) |
| **Nutrição (Sofia)** | [STORAGE_ANALYSIS_REPORT.md](STORAGE_ANALYSIS_REPORT.md#nutrição-sofia) |
| **Saúde (Dr. Vital)** | [STORAGE_ANALYSIS_REPORT.md](STORAGE_ANALYSIS_REPORT.md#saúde-dr-vital) |
| **Exercícios** | [STORAGE_ANALYSIS_REPORT.md](STORAGE_ANALYSIS_REPORT.md#exercícios) |
| **Gamificação** | [STORAGE_ANALYSIS_REPORT.md](STORAGE_ANALYSIS_REPORT.md#desafios-e-gamificação) |

### Storage e Cache

| O que | Onde encontrar |
|-------|----------------|
| **Storage Buckets** | [STORAGE_ANALYSIS_REPORT.md](STORAGE_ANALYSIS_REPORT.md#2-supabase-storage-arquivos) |
| **localStorage** | [STORAGE_ANALYSIS_REPORT.md](STORAGE_ANALYSIS_REPORT.md#3-browser-storage-cliente) |
| **PWA Cache** | [STORAGE_ANALYSIS_REPORT.md](STORAGE_ANALYSIS_REPORT.md#4-pwa-cache-service-worker) |

### Edge Functions

| Categoria | Onde encontrar |
|-----------|----------------|
| **Todas (73)** | [STORAGE_ANALYSIS_REPORT.md](STORAGE_ANALYSIS_REPORT.md#5-edge-functions-serverless) |
| **Nutrição** | [STORAGE_ANALYSIS_REPORT.md](STORAGE_ANALYSIS_REPORT.md#nutrição-sofia-1) |
| **Saúde** | [STORAGE_ANALYSIS_REPORT.md](STORAGE_ANALYSIS_REPORT.md#saúde-dr-vital-1) |
| **WhatsApp** | [STORAGE_ANALYSIS_REPORT.md](STORAGE_ANALYSIS_REPORT.md#whatsapp) |

### Diagramas

| Tipo | Onde encontrar |
|------|----------------|
| **Arquitetura Geral** | [STORAGE_DIAGRAM.md](STORAGE_DIAGRAM.md#visão-geral-da-arquitetura) |
| **Fluxo Sofia** | [STORAGE_DIAGRAM.md](STORAGE_DIAGRAM.md#1-análise-de-alimentos-sofia) |
| **Fluxo Dr. Vital** | [STORAGE_DIAGRAM.md](STORAGE_DIAGRAM.md#2-análise-de-exames-dr-vital) |
| **PWA Cache** | [STORAGE_DIAGRAM.md](STORAGE_DIAGRAM.md#4-pwa-e-cache-offline) |

## 🛠️ Ferramentas

### Scripts Disponíveis

| Script | Descrição | Como usar |
|--------|-----------|-----------|
| `analyze-storage.py` | Análise completa de armazenamento | `python3 scripts/analyze-storage.py` |
| `storage-commands.sh` | Menu interativo de comandos | `./scripts/storage-commands.sh` |

### Comandos Rápidos

```bash
# Análise completa
python3 scripts/analyze-storage.py

# Menu interativo
./scripts/storage-commands.sh

# Comandos específicos
./scripts/storage-commands.sh analyze      # Análise
./scripts/storage-commands.sh functions    # Listar functions
./scripts/storage-commands.sh report       # Relatório de uso
./scripts/storage-commands.sh migrations   # Ver migrations
```

## 📊 Estatísticas do Projeto

| Métrica | Valor | Onde ver detalhes |
|---------|-------|-------------------|
| **Tabelas no Banco** | 209 | [STORAGE_ANALYSIS_REPORT.md](STORAGE_ANALYSIS_REPORT.md) |
| **Edge Functions** | 73 | [STORAGE_ANALYSIS_REPORT.md](STORAGE_ANALYSIS_REPORT.md#5-edge-functions-serverless) |
| **Storage Buckets** | ~5 | [STORAGE_ANALYSIS_REPORT.md](STORAGE_ANALYSIS_REPORT.md#2-supabase-storage-arquivos) |
| **localStorage Keys** | 8 | [STORAGE_ANALYSIS_REPORT.md](STORAGE_ANALYSIS_REPORT.md#3-browser-storage-cliente) |
| **PWA Caches** | 3 | [STORAGE_ANALYSIS_REPORT.md](STORAGE_ANALYSIS_REPORT.md#4-pwa-cache-service-worker) |

## 🎓 Guias de Aprendizado

### Nível Iniciante

1. **Dia 1: Visão Geral**
   - [ ] Ler [STORAGE_SUMMARY.md](STORAGE_SUMMARY.md)
   - [ ] Ver diagramas básicos em [STORAGE_DIAGRAM.md](STORAGE_DIAGRAM.md)
   - [ ] Executar `python3 scripts/analyze-storage.py`

2. **Dia 2: Código**
   - [ ] Ler [AI_CODING_GUIDELINES.md](AI_CODING_GUIDELINES.md)
   - [ ] Estudar [COMMON_ERRORS.md](COMMON_ERRORS.md)
   - [ ] Praticar com exemplos

3. **Dia 3: Banco de Dados**
   - [ ] Estudar tabelas principais em [STORAGE_ANALYSIS_REPORT.md](STORAGE_ANALYSIS_REPORT.md)
   - [ ] Entender RLS policies
   - [ ] Praticar queries

### Nível Intermediário

1. **Semana 1: Arquitetura**
   - [ ] Ler [STORAGE_ANALYSIS_REPORT.md](STORAGE_ANALYSIS_REPORT.md) completo
   - [ ] Estudar todos os diagramas
   - [ ] Entender fluxos de dados

2. **Semana 2: Edge Functions**
   - [ ] Estudar Edge Functions no relatório
   - [ ] Criar uma Edge Function de teste
   - [ ] Integrar com banco de dados

3. **Semana 3: Integrações**
   - [ ] Ler [YOLO_INTEGRACAO_COMPLETA.md](YOLO_INTEGRACAO_COMPLETA.md)
   - [ ] Entender integração WhatsApp
   - [ ] Estudar Google Fit sync

### Nível Avançado

1. **Otimização**
   - [ ] Analisar queries lentas
   - [ ] Implementar cache Redis
   - [ ] Otimizar storage

2. **Segurança**
   - [ ] Revisar RLS policies
   - [ ] Implementar rate limiting
   - [ ] Configurar backup avançado

3. **Escalabilidade**
   - [ ] Planejar sharding
   - [ ] Implementar CDN
   - [ ] Configurar replicação

## 🔄 Fluxos Comuns

### Adicionar Nova Feature

1. **Planejamento**
   - Consultar [STORAGE_ANALYSIS_REPORT.md](STORAGE_ANALYSIS_REPORT.md) para ver tabelas existentes
   - Verificar se precisa de novas tabelas
   - Planejar storage se necessário

2. **Implementação**
   - Seguir [AI_CODING_GUIDELINES.md](AI_CODING_GUIDELINES.md)
   - Criar migration se necessário
   - Implementar RLS policies

3. **Testes**
   - Testar queries
   - Verificar performance
   - Validar segurança

4. **Documentação**
   - Atualizar [STORAGE_ANALYSIS_REPORT.md](STORAGE_ANALYSIS_REPORT.md)
   - Executar `python3 scripts/analyze-storage.py`
   - Commit mudanças

### Debugar Problema

1. **Identificar**
   - Consultar [COMMON_ERRORS.md](COMMON_ERRORS.md)
   - Ver logs no Supabase
   - Usar DevTools

2. **Analisar**
   - Verificar tabela em [STORAGE_ANALYSIS_REPORT.md](STORAGE_ANALYSIS_REPORT.md)
   - Testar query isoladamente
   - Verificar RLS policies

3. **Resolver**
   - Aplicar solução
   - Testar
   - Documentar se necessário

### Fazer Backup

1. **Preparação**
   - Ler instruções em [STORAGE_SUMMARY.md](STORAGE_SUMMARY.md)
   - Executar `./scripts/storage-commands.sh backup`

2. **Execução**
   - Backup do banco: `npx supabase db dump`
   - Backup de storage: via Dashboard
   - Backup de configs: copiar `.env`

3. **Validação**
   - Testar restauração
   - Verificar integridade
   - Documentar processo

## 📞 Suporte

### Dúvidas Frequentes

| Pergunta | Resposta |
|----------|----------|
| **Onde está salvo X?** | Consulte [STORAGE_SUMMARY.md](STORAGE_SUMMARY.md) |
| **Como fazer Y?** | Veja [STORAGE_README.md](STORAGE_README.md) |
| **Erro Z apareceu** | Consulte [COMMON_ERRORS.md](COMMON_ERRORS.md) |
| **Como funciona YOLO?** | Leia [YOLO_INTEGRACAO_COMPLETA.md](YOLO_INTEGRACAO_COMPLETA.md) |

### Canais de Suporte

1. **Documentação** (você está aqui)
2. **Issues no GitHub**
3. **Chat da equipe**
4. **Supabase Docs**

## 🔄 Manutenção da Documentação

### Quando Atualizar?

- ✅ Novas tabelas adicionadas
- ✅ Novos storage buckets criados
- ✅ Novas Edge Functions implementadas
- ✅ Mudanças na arquitetura
- ✅ Novas integrações

### Como Atualizar?

1. Execute análise: `python3 scripts/analyze-storage.py`
2. Revise arquivos gerados
3. Atualize manualmente se necessário
4. Commit: `git commit -m "docs: atualizar documentação"`

### Responsáveis

- **Documentação de Storage**: Equipe Backend
- **Diagramas**: Arquiteto de Software
- **Scripts**: DevOps
- **Guias de Código**: Tech Lead

## 📝 Changelog

### Janeiro 2026
- ✅ Criação da documentação completa de storage
- ✅ Scripts de análise automatizada
- ✅ Diagramas visuais
- ✅ Guias de uso

### Próximas Atualizações
- 🔄 Adicionar métricas de performance
- 🔄 Documentar estratégias de cache
- 🔄 Criar guia de otimização

---

**Última atualização:** Janeiro 2026  
**Versão:** 1.0.0  
**Mantido por:** Equipe MaxNutrition

---

## 🚀 Links Rápidos

- [📊 Relatório Completo](STORAGE_ANALYSIS_REPORT.md)
- [📝 Resumo Executivo](STORAGE_SUMMARY.md)
- [🗺️ Diagramas](STORAGE_DIAGRAM.md)
- [📚 Como Usar](STORAGE_README.md)
- [💻 Guia de Código](AI_CODING_GUIDELINES.md)
- [🐛 Erros Comuns](COMMON_ERRORS.md)
- [🦾 Integração YOLO](YOLO_INTEGRACAO_COMPLETA.md)
