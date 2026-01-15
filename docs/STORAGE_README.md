# 📚 Documentação de Armazenamento - MaxNutrition

## 🎯 Visão Geral

Esta documentação mapeia **TODOS** os locais onde dados são armazenados no projeto MaxNutrition, incluindo banco de dados, storage, cache e configurações.

## 📁 Arquivos Disponíveis

### 1. `STORAGE_ANALYSIS_REPORT.md` 📊
**Relatório completo e detalhado**

Contém:
- Lista completa das 209 tabelas do banco
- Descrição de cada categoria de dados
- Mapeamento de storage buckets
- Análise de localStorage e PWA cache
- Documentação de Edge Functions
- Políticas de segurança e backup

**Quando usar:** Para entender a arquitetura completa ou buscar informações específicas sobre tabelas.

### 2. `STORAGE_DIAGRAM.md` 🗺️
**Diagramas visuais da arquitetura**

Contém:
- Diagrama de arquitetura geral
- Fluxos de dados por feature
- Diagramas de sequência
- Gráficos de distribuição
- Ciclo de vida dos dados

**Quando usar:** Para visualizar como os dados fluem no sistema ou apresentar a arquitetura para outros.

### 3. `STORAGE_SUMMARY.md` 📝
**Resumo executivo**

Contém:
- Resumo rápido de onde tudo está salvo
- Estatísticas principais
- Tabelas mais importantes
- Checklist de manutenção
- Troubleshooting rápido

**Quando usar:** Para consulta rápida ou onboarding de novos desenvolvedores.

### 4. `scripts/analyze-storage.py` 🐍
**Script de análise automatizada**

Funcionalidades:
- Analisa estrutura de pastas
- Identifica tabelas no banco
- Mapeia storage buckets
- Encontra uso de localStorage
- Detecta Edge Functions

**Como usar:**
```bash
python3 scripts/analyze-storage.py
```

### 5. `scripts/storage-commands.sh` 🔧
**Comandos úteis para análise**

Funcionalidades:
- Menu interativo
- Verificação de tamanho do banco
- Listagem de Edge Functions
- Busca de uso de tabelas
- Instruções de backup

**Como usar:**
```bash
# Menu interativo
./scripts/storage-commands.sh

# Ou comandos diretos
./scripts/storage-commands.sh analyze
./scripts/storage-commands.sh functions
./scripts/storage-commands.sh report
```

## 🚀 Quick Start

### Para Novos Desenvolvedores

1. **Leia primeiro:** `STORAGE_SUMMARY.md`
   - Entenda onde os dados estão salvos
   - Veja as tabelas principais
   - Aprenda o fluxo básico

2. **Visualize:** `STORAGE_DIAGRAM.md`
   - Veja os diagramas de arquitetura
   - Entenda os fluxos de dados
   - Visualize as integrações

3. **Aprofunde:** `STORAGE_ANALYSIS_REPORT.md`
   - Consulte detalhes de tabelas específicas
   - Entenda políticas de segurança
   - Veja documentação completa

4. **Execute:** `scripts/analyze-storage.py`
   - Gere relatório atualizado
   - Verifique mudanças recentes

### Para Análise Rápida

```bash
# 1. Execute a análise
python3 scripts/analyze-storage.py

# 2. Use comandos úteis
./scripts/storage-commands.sh

# 3. Consulte o resumo
cat docs/STORAGE_SUMMARY.md
```

## 📊 Estrutura de Dados

### Principais Categorias

```
MaxNutrition Storage
├── Supabase Cloud (99%)
│   ├── PostgreSQL (209 tabelas)
│   │   ├── Perfil e Usuário
│   │   ├── Nutrição (Sofia)
│   │   ├── Saúde (Dr. Vital)
│   │   ├── Tracking Diário
│   │   ├── Exercícios
│   │   ├── Gamificação
│   │   └── Integrações
│   ├── Storage (Buckets)
│   │   ├── avatars
│   │   ├── medical-documents
│   │   └── food-images
│   └── Edge Functions (73)
│       ├── Nutrição (13)
│       ├── Saúde (24)
│       ├── WhatsApp (15)
│       └── Outros (21)
├── Browser (1%)
│   ├── localStorage (8 keys)
│   ├── sessionStorage (1 key)
│   └── PWA Cache (3 caches)
└── Docker (Dev apenas)
    └── Volumes locais
```

## 🔍 Como Encontrar Informações

### "Onde está salvo X?"

| O que você procura | Onde encontrar |
|-------------------|----------------|
| **Lista de todas as tabelas** | `STORAGE_ANALYSIS_REPORT.md` seção 1 |
| **Diagrama de arquitetura** | `STORAGE_DIAGRAM.md` |
| **Tabelas de nutrição** | `STORAGE_ANALYSIS_REPORT.md` > Nutrição |
| **Tabelas de saúde** | `STORAGE_ANALYSIS_REPORT.md` > Saúde |
| **Edge Functions** | `STORAGE_ANALYSIS_REPORT.md` seção 5 |
| **localStorage keys** | `STORAGE_ANALYSIS_REPORT.md` seção 3 |
| **PWA Cache** | `STORAGE_ANALYSIS_REPORT.md` seção 4 |
| **Fluxo de dados** | `STORAGE_DIAGRAM.md` |
| **Resumo rápido** | `STORAGE_SUMMARY.md` |

### "Como fazer X?"

| O que você quer fazer | Como fazer |
|-----------------------|------------|
| **Analisar armazenamento** | `python3 scripts/analyze-storage.py` |
| **Ver tamanho do banco** | `./scripts/storage-commands.sh database` |
| **Listar Edge Functions** | `./scripts/storage-commands.sh functions` |
| **Procurar uso de tabela** | `./scripts/storage-commands.sh table <nome>` |
| **Gerar relatório** | `./scripts/storage-commands.sh report` |
| **Verificar migrations** | `./scripts/storage-commands.sh migrations` |
| **Instruções de backup** | `./scripts/storage-commands.sh backup` |

## 🛠️ Comandos Úteis

### Análise

```bash
# Análise completa
python3 scripts/analyze-storage.py

# Menu interativo
./scripts/storage-commands.sh

# Relatório de uso
./scripts/storage-commands.sh report
```

### Busca

```bash
# Procurar uso de uma tabela
grep -r "from('profiles')" src/

# Procurar uso de storage
grep -r "storage.from" src/

# Procurar localStorage
grep -r "localStorage.setItem" src/
```

### Supabase

```bash
# Gerar tipos TypeScript
npx supabase gen types typescript --local > src/integrations/supabase/types.ts

# Ver logs de Edge Function
npx supabase functions logs [nome-funcao]

# Testar Edge Function localmente
npx supabase functions serve [nome-funcao]
```

## 📚 Documentação Relacionada

### Dentro deste projeto
- `AI_CODING_GUIDELINES.md` - Guia de desenvolvimento
- `COMMON_ERRORS.md` - Erros comuns e soluções
- `DATABASE_QUICK_REF.md` - Referência rápida do banco
- `YOLO_INTEGRACAO_COMPLETA.md` - Integração YOLO

### Externa
- [Supabase Docs](https://supabase.com/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Vite PWA Plugin](https://vite-pwa-org.netlify.app/)

## 🔄 Manutenção

### Quando atualizar esta documentação?

- ✅ Ao adicionar novas tabelas
- ✅ Ao criar novos storage buckets
- ✅ Ao adicionar Edge Functions
- ✅ Ao mudar arquitetura de dados
- ✅ Ao adicionar integrações

### Como atualizar?

1. Execute o script de análise:
   ```bash
   python3 scripts/analyze-storage.py
   ```

2. Revise os arquivos gerados

3. Atualize manualmente se necessário:
   - `STORAGE_ANALYSIS_REPORT.md`
   - `STORAGE_DIAGRAM.md`
   - `STORAGE_SUMMARY.md`

4. Commit as mudanças:
   ```bash
   git add docs/STORAGE_*.md
   git commit -m "docs: atualizar documentação de armazenamento"
   ```

## 🆘 Troubleshooting

### Script Python não funciona

```bash
# Verificar Python instalado
python3 --version

# Instalar dependências (se necessário)
pip3 install pathlib
```

### Script Bash não executa

```bash
# Dar permissão de execução
chmod +x scripts/storage-commands.sh

# Executar
./scripts/storage-commands.sh
```

### Não encontra tabelas

1. Verifique se está no diretório raiz do projeto
2. Verifique se `supabase/migrations/` existe
3. Execute `npx supabase db pull` para sincronizar

## 📞 Suporte

### Dúvidas sobre armazenamento?

1. Consulte `STORAGE_SUMMARY.md` primeiro
2. Veja os diagramas em `STORAGE_DIAGRAM.md`
3. Leia o relatório completo em `STORAGE_ANALYSIS_REPORT.md`
4. Execute `python3 scripts/analyze-storage.py`

### Ainda com dúvidas?

- Abra uma issue no GitHub
- Consulte a documentação do Supabase
- Pergunte no chat da equipe

## 📝 Changelog

### Janeiro 2026
- ✅ Criação inicial da documentação
- ✅ Script Python de análise
- ✅ Script Bash de comandos úteis
- ✅ Diagramas visuais
- ✅ Resumo executivo

---

**Última atualização:** Janeiro 2026  
**Mantido por:** Equipe MaxNutrition  
**Versão:** 1.0.0
