# 🛠️ Comandos Úteis - Análise MaxNutrition

## 📊 Visualizar Análises

### Resumo Executivo (Para Gestores)
```bash
cat docs/RESUMO_EXECUTIVO.md
```

### Relatório Técnico Completo
```bash
cat docs/RELATORIO_COMPLETO_DOCUMENTACAO.md
```

### Índice da Análise
```bash
cat docs/INDICE_ANALISE_COMPLETA.md
```

### README Principal
```bash
cat ANALISE_COMPLETA_README.md
```

---

## 📄 Visualizar Dados JSON

### Análise Completa (formatado)
```bash
cat docs/ANALYSIS_COMPLETE.json | jq .
```

### Contexto para MCP (formatado)
```bash
cat docs/CONTEXT_COMPLETE.json | jq .
```

### Ver apenas tabelas do banco
```bash
cat docs/CONTEXT_COMPLETE.json | jq '.database.tables | keys'
```

### Ver apenas edge functions
```bash
cat docs/CONTEXT_COMPLETE.json | jq '.edge_functions[].name'
```

### Ver apenas hooks
```bash
cat docs/CONTEXT_COMPLETE.json | jq '.hooks'
```

---

## 🐍 Executar Scripts Python

### Análise Completa dos Documentos
```bash
python3 scripts/analyze-complete-docs.py
```

### Extração de Contexto Detalhado
```bash
python3 scripts/extract-detailed-context.py
```

### Resumo Visual com Gráficos ASCII
```bash
python3 scripts/generate-visual-summary.py
```

### Executar Todos os Scripts
```bash
python3 scripts/analyze-complete-docs.py && \
python3 scripts/extract-detailed-context.py && \
python3 scripts/generate-visual-summary.py
```

---

## 📁 Listar Arquivos Gerados

### Listar todos os arquivos de análise
```bash
ls -lh docs/*COMPLETO*.md docs/*EXECUTIVO*.md docs/*INDICE*.md docs/*.json
```

### Listar apenas JSONs
```bash
ls -lh docs/*.json
```

### Listar apenas Markdowns
```bash
ls -lh docs/*.md
```

### Listar scripts Python
```bash
ls -lh scripts/*.py
```

---

## 🔍 Buscar Informações Específicas

### Buscar por palavra-chave nos JSONs
```bash
# Buscar "sofia" em todos os JSONs
grep -i "sofia" docs/*.json

# Buscar "yolo" com contexto
grep -i -C 3 "yolo" docs/*.json
```

### Buscar em documentos Markdown
```bash
# Buscar "gamificação"
grep -i "gamificação" docs/*.md

# Buscar "edge function"
grep -i "edge function" docs/*.md
```

### Contar ocorrências
```bash
# Contar quantas vezes "Sofia" aparece
grep -o -i "sofia" docs/*.md | wc -l

# Contar quantas vezes "YOLO" aparece
grep -o -i "yolo" docs/*.md | wc -l
```

---

## 📊 Estatísticas

### Contar linhas de todos os documentos
```bash
wc -l docs/*.md
```

### Contar palavras
```bash
wc -w docs/*.md
```

### Tamanho dos arquivos
```bash
du -h docs/*.md docs/*.json
```

### Estatísticas completas
```bash
echo "=== ESTATÍSTICAS DA ANÁLISE ==="
echo ""
echo "Documentos Markdown:"
ls docs/*.md | wc -l
echo ""
echo "Arquivos JSON:"
ls docs/*.json | wc -l
echo ""
echo "Scripts Python:"
ls scripts/*.py | wc -l
echo ""
echo "Total de linhas (MD):"
cat docs/*.md | wc -l
echo ""
echo "Total de palavras (MD):"
cat docs/*.md | wc -w
echo ""
echo "Tamanho total:"
du -sh docs/
```

---

## 🔄 Regenerar Análises

### Regenerar tudo do zero
```bash
# Limpar arquivos antigos
rm -f docs/ANALYSIS_COMPLETE.json
rm -f docs/CONTEXT_COMPLETE.json

# Regenerar
python3 scripts/analyze-complete-docs.py
python3 scripts/extract-detailed-context.py
python3 scripts/generate-visual-summary.py
```

### Regenerar apenas contexto
```bash
rm -f docs/CONTEXT_COMPLETE.json
python3 scripts/extract-detailed-context.py
```

---

## 📤 Exportar Dados

### Exportar tabelas do banco para CSV
```bash
cat docs/CONTEXT_COMPLETE.json | \
  jq -r '.database.tables | keys[]' > tabelas.csv
```

### Exportar edge functions para CSV
```bash
cat docs/CONTEXT_COMPLETE.json | \
  jq -r '.edge_functions[] | [.name, .description] | @csv' > functions.csv
```

### Exportar hooks para CSV
```bash
cat docs/CONTEXT_COMPLETE.json | \
  jq -r '.hooks | to_entries[] | [.key, (.value | join(", "))] | @csv' > hooks.csv
```

---

## 🎨 Visualizações

### Gerar gráfico de distribuição de tabelas
```bash
cat docs/CONTEXT_COMPLETE.json | \
  jq -r '.database.tables | keys[]' | \
  awk '{print $1}' | \
  sort | uniq -c | sort -rn
```

### Gerar lista de tecnologias
```bash
cat docs/CONTEXT_COMPLETE.json | \
  jq -r '.project.tech_stack[]'
```

### Listar todas as edge functions por categoria
```bash
cat docs/CONTEXT_COMPLETE.json | \
  jq -r '.edge_functions[] | "\(.name) - \(.description)"'
```

---

## 🚀 App em Desenvolvimento

### Verificar se o app está rodando
```bash
curl -s http://localhost:8080 > /dev/null && echo "✅ App rodando" || echo "❌ App não está rodando"
```

### Ver processos em background
```bash
ps aux | grep "npm run dev"
```

### Matar processo na porta 8080
```bash
lsof -ti:8080 | xargs kill -9
```

### Iniciar app
```bash
npm run dev
```

---

## 📝 Criar Documentação Adicional

### Gerar lista de componentes
```bash
find src/components -name "*.tsx" | \
  sed 's/.*\///' | \
  sed 's/.tsx//' | \
  sort > componentes.txt
```

### Gerar lista de hooks
```bash
find src/hooks -name "*.ts" | \
  sed 's/.*\///' | \
  sed 's/.ts//' | \
  sort > hooks.txt
```

### Gerar lista de páginas
```bash
find src/pages -name "*.tsx" | \
  sed 's/.*\///' | \
  sed 's/.tsx//' | \
  sort > paginas.txt
```

---

## 🔧 Manutenção

### Verificar dependências do Python
```bash
python3 --version
python3 -c "import json; print('✅ json')"
python3 -c "import pathlib; print('✅ pathlib')"
```

### Verificar Node.js e npm
```bash
node --version
npm --version
```

### Verificar estrutura de diretórios
```bash
tree -L 2 -d
```

---

## 📚 Ajuda Rápida

### Ver este arquivo
```bash
cat COMANDOS_UTEIS.md
```

### Ver README principal
```bash
cat ANALISE_COMPLETA_README.md
```

### Ver resumo executivo
```bash
cat docs/RESUMO_EXECUTIVO.md | head -100
```

---

## 🎯 Comandos Mais Usados

```bash
# 1. Ver resumo visual
python3 scripts/generate-visual-summary.py

# 2. Ver contexto JSON formatado
cat docs/CONTEXT_COMPLETE.json | jq .

# 3. Ver resumo executivo
cat docs/RESUMO_EXECUTIVO.md

# 4. Listar arquivos gerados
ls -lh docs/*.json docs/*COMPLETO*.md

# 5. Buscar informação específica
grep -i "palavra-chave" docs/*.md
```

---

*Comandos úteis para análise do MaxNutrition*  
*Atualizado em: 16/01/2026*
